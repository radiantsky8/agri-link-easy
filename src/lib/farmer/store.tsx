/**
 * Client-side farmer session + data store.
 * Persists to localStorage so the whole flow (onboarding -> booking -> payment)
 * works end to end without a backend. Swap the mutators for API calls later.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CENTRES, CROPS, QUINTAL_TO_KG } from "./data";
import { translate, type LanguageCode } from "./i18n";

export type BookingStatus = "upcoming" | "in_progress" | "completed" | "cancelled";
export type ProcurementStatus = "pending" | "arrived" | "weighing" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed";

export type Booking = {
  id: string;
  token: string;
  centreId: string;
  cropId: string;
  quantity: number; // quintals
  date: string; // yyyy-mm-dd
  slot: string;
  status: BookingStatus;
  procurement: ProcurementStatus;
  payment: PaymentStatus;
  amount: number;
  paidOn?: string;
  createdAt: string;
};

export type BankDetails = {
  holder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
};

export type Profile = {
  name: string;
  mobile: string;
  village: string;
};

export type AppNotification = {
  id: string;
  kind: "booking" | "reminder" | "payment" | "announcement";
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export type Complaint = {
  id: string;
  subject: string;
  description: string;
  bookingRef?: string;
  at: string;
  status: "open" | "resolved";
};

type State = {
  language: LanguageCode;
  authenticated: boolean;
  profile: Profile | null;
  bank: BankDetails | null;
  bookings: Booking[];
  notifications: AppNotification[];
  complaints: Complaint[];
};

const STORAGE_KEY = "smartfarmer.v1";

const initialState: State = {
  language: "en",
  authenticated: false,
  profile: null,
  bank: null,
  bookings: [],
  notifications: [],
  complaints: [],
};

function iso(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function amountFor(cropId: string, quantity: number) {
  const crop = CROPS.find((c) => c.id === cropId);
  return Math.round((crop?.ratePerQuintal ?? 2000) * quantity);
}

/** Demo history so status pages are meaningful on a fresh account. */
function seedData(): Pick<State, "bookings" | "notifications"> {
  const bookings: Booking[] = [
    {
      id: uid("bk"),
      token: "A-124",
      centreId: "c1",
      cropId: "rice",
      quantity: 5,
      date: iso(0),
      slot: "10:45 AM",
      status: "in_progress",
      procurement: "arrived",
      payment: "pending",
      amount: amountFor("rice", 5),
      createdAt: new Date().toISOString(),
    },
    {
      id: uid("bk"),
      token: "A-092",
      centreId: "c2",
      cropId: "maize",
      quantity: 8,
      date: iso(-9),
      slot: "09:00 AM",
      status: "completed",
      procurement: "completed",
      payment: "processing",
      amount: amountFor("maize", 8),
      createdAt: new Date().toISOString(),
    },
    {
      id: uid("bk"),
      token: "B-311",
      centreId: "c3",
      cropId: "cotton",
      quantity: 3,
      date: iso(-24),
      slot: "01:00 PM",
      status: "completed",
      procurement: "completed",
      payment: "paid",
      amount: amountFor("cotton", 3),
      paidOn: iso(-21),
      createdAt: new Date().toISOString(),
    },
    {
      id: uid("bk"),
      token: "B-208",
      centreId: "c1",
      cropId: "wheat",
      quantity: 6,
      date: iso(-48),
      slot: "08:00 AM",
      status: "completed",
      procurement: "completed",
      payment: "paid",
      amount: amountFor("wheat", 6),
      paidOn: iso(-45),
      createdAt: new Date().toISOString(),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: uid("nt"),
      kind: "reminder",
      title: "Leave by 10:05 AM",
      body: "Traffic is light on Canal Bund Road. Your slot at Sri Sai Procurement Centre is at 10:45 AM.",
      at: new Date().toISOString(),
      read: false,
    },
    {
      id: uid("nt"),
      kind: "payment",
      title: "Payment processing",
      body: "₹16,720 for token A-092 is being processed. Usually within 2 working days.",
      at: new Date(Date.now() - 864e5).toISOString(),
      read: false,
    },
    {
      id: uid("nt"),
      kind: "announcement",
      title: "Extra slots added at Centre B",
      body: "Market Yard centre now accepts arrivals until 6:00 PM through the season.",
      at: new Date(Date.now() - 3 * 864e5).toISOString(),
      read: true,
    },
  ];

  return { bookings, notifications };
}

type Ctx = {
  hydrated: boolean;
  state: State;
  t: (key: string) => string;
  setLanguage: (l: LanguageCode) => void;
  register: (p: Profile) => void;
  login: (mobile: string) => void;
  logout: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  saveBank: (b: BankDetails) => void;
  createBooking: (input: Omit<Booking, "id" | "token" | "status" | "procurement" | "payment" | "amount" | "createdAt">) => Booking;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, patch: Pick<Booking, "centreId" | "cropId" | "quantity" | "date" | "slot">) => void;
  addComplaint: (c: Omit<Complaint, "id" | "at" | "status">) => void;
  markNotificationsRead: () => void;
};

const FarmerContext = createContext<Ctx | null>(null);

export function FarmerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const notify = useCallback((n: Omit<AppNotification, "id" | "at" | "read">) => {
    setState((s) => ({
      ...s,
      notifications: [{ ...n, id: uid("nt"), at: new Date().toISOString(), read: false }, ...s.notifications],
    }));
  }, []);

  const value = useMemo<Ctx>(() => {
    const t = (key: string) => translate(state.language, key);

    return {
      hydrated,
      state,
      t,
      setLanguage: (language) => setState((s) => ({ ...s, language })),
      register: (profile) =>
        setState((s) => ({
          ...s,
          profile,
          ...(s.bookings.length === 0 ? seedData() : {}),
        })),
      login: (mobile) =>
        setState((s) => ({
          ...s,
          authenticated: true,
          profile: s.profile ?? { name: "Farmer", mobile, village: "" },
          ...(s.bookings.length === 0 ? seedData() : {}),
        })),
      logout: () => setState((s) => ({ ...s, authenticated: false })),
      updateProfile: (patch) =>
        setState((s) => ({ ...s, profile: { ...(s.profile ?? { name: "", mobile: "", village: "" }), ...patch } })),
      saveBank: (bank) => setState((s) => ({ ...s, bank })),
      createBooking: (input) => {
        const booking: Booking = {
          ...input,
          id: uid("bk"),
          token: `${String.fromCharCode(65 + Math.floor(Math.random() * 3))}-${100 + Math.floor(Math.random() * 800)}`,
          status: "upcoming",
          procurement: "pending",
          payment: "pending",
          amount: amountFor(input.cropId, input.quantity),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
        notify({
          kind: "booking",
          title: `Token ${booking.token} confirmed`,
          body: `${CENTRES.find((c) => c.id === booking.centreId)?.name} · ${booking.date} at ${booking.slot}.`,
        });
        return booking;
      },
      cancelBooking: (id) => {
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled", procurement: "cancelled" } : b,
          ),
        }));
        notify({ kind: "booking", title: "Booking cancelled", body: "Your slot has been released for other farmers." });
      },
      rescheduleBooking: (id, patch) => {
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...patch,
                  amount: amountFor(patch.cropId, patch.quantity),
                  status: "upcoming",
                  procurement: "pending",
                  token: `${b.token.charAt(0)}-${100 + Math.floor(Math.random() * 800)}`,
                }
              : b,
          ),
        }));
        notify({ kind: "booking", title: "Booking rescheduled", body: `New slot: ${patch.date} at ${patch.slot}.` });
      },
      addComplaint: (c) => {
        setState((s) => ({
          ...s,
          complaints: [{ ...c, id: uid("cm"), at: new Date().toISOString(), status: "open" }, ...s.complaints],
        }));
        notify({ kind: "announcement", title: "Complaint received", body: "Our support team will reply within 24 hours." });
      },
      markNotificationsRead: () =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    };
  }, [state, hydrated, notify]);

  return <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>;
}

export function useFarmer() {
  const ctx = useContext(FarmerContext);
  if (!ctx) throw new Error("useFarmer must be used inside FarmerProvider");
  return ctx;
}

export function centreName(id: string) {
  return CENTRES.find((c) => c.id === id)?.name ?? "Centre";
}

export function cropName(id: string) {
  return CROPS.find((c) => c.id === id)?.name ?? "Crop";
}

export function formatQty(quintals: number) {
  return `${quintals} qtl · ${quintals * QUINTAL_TO_KG} kg`;
}

export function formatMoney(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
