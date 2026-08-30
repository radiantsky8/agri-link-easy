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
  userId: string | null;
  profile: Profile | null;
  bank: BankDetails | null;
  bookings: Booking[];
  notifications: AppNotification[];
  complaints: Complaint[];
};

/** Everything that belongs to one farmer account. */
type UserData = {
  id: string;
  profile: Profile | null;
  bank: BankDetails | null;
  bookings: Booking[];
  notifications: AppNotification[];
  complaints: Complaint[];
};

type Root = {
  language: LanguageCode;
  currentUserId: string | null;
  authenticated: boolean;
  users: Record<string, UserData>;
};

const STORAGE_KEY = "smartfarmer.v2";
const LEGACY_KEY = "smartfarmer.v1";

const initialState: State = {
  language: "en",
  authenticated: false,
  userId: null,
  profile: null,
  bank: null,
  bookings: [],
  notifications: [],
  complaints: [],
};

function emptyUser(id: string, profile: Profile | null): UserData {
  return { id, profile, bank: null, bookings: [], notifications: [], complaints: [] };
}

function userIdForMobile(mobile: string) {
  return `u_${mobile}`;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function amountFor(cropId: string, quantity: number) {
  const crop = CROPS.find((c) => c.id === cropId);
  return Math.round((crop?.ratePerQuintal ?? 2000) * quantity);
}

function loadRoot(): Root {
  const empty: Root = { language: "en", currentUserId: null, authenticated: false, users: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...empty, ...(JSON.parse(raw) as Root) };

    // One-time migration: keep any pre-existing single-user data intact.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy) as Partial<State> & { profile?: Profile | null };
      if (old.profile?.mobile) {
        const id = userIdForMobile(old.profile.mobile);
        empty.users[id] = {
          id,
          profile: old.profile,
          bank: old.bank ?? null,
          bookings: old.bookings ?? [],
          notifications: old.notifications ?? [],
          complaints: old.complaints ?? [],
        };
        empty.currentUserId = id;
        empty.authenticated = old.authenticated ?? false;
      }
      empty.language = old.language ?? "en";
    }
  } catch {
    /* ignore corrupt storage */
  }
  return empty;
}

function stateFromRoot(root: Root): State {
  const user = root.currentUserId ? root.users[root.currentUserId] : undefined;
  return {
    language: root.language,
    authenticated: root.authenticated && !!user,
    userId: user?.id ?? null,
    profile: user?.profile ?? null,
    bank: user?.bank ?? null,
    bookings: user?.bookings ?? [],
    notifications: user?.notifications ?? [],
    complaints: user?.complaints ?? [],
  };
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
  const [root, setRoot] = useState<Root>({ language: "en", currentUserId: null, authenticated: false, users: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRoot(loadRoot());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  }, [root, hydrated]);

  /** Applies a patch to the currently signed-in user's slice only. */
  const patchUser = useCallback((fn: (u: UserData) => UserData) => {
    setRoot((r) => {
      const id = r.currentUserId;
      if (!id) return r;
      const current = r.users[id] ?? emptyUser(id, null);
      return { ...r, users: { ...r.users, [id]: fn(current) } };
    });
  }, []);

  const notify = useCallback(
    (n: Omit<AppNotification, "id" | "at" | "read">) => {
      patchUser((u) => ({
        ...u,
        notifications: [{ ...n, id: uid("nt"), at: new Date().toISOString(), read: false }, ...u.notifications],
      }));
    },
    [patchUser],
  );

  const state = useMemo(() => (hydrated ? stateFromRoot(root) : initialState), [root, hydrated]);

  const value = useMemo<Ctx>(() => {
    const t = (key: string) => translate(state.language, key);

    return {
      hydrated,
      state,
      t,
      setLanguage: (language) => setRoot((r) => ({ ...r, language })),
      register: (profile) =>
        setRoot((r) => {
          const id = userIdForMobile(profile.mobile);
          const existing = r.users[id];
          // Existing accounts keep their data; brand-new ones start empty.
          const user = existing ? { ...existing, profile } : emptyUser(id, profile);
          return { ...r, currentUserId: id, authenticated: false, users: { ...r.users, [id]: user } };
        }),
      login: (mobile) =>
        setRoot((r) => {
          const id = userIdForMobile(mobile);
          const user = r.users[id] ?? emptyUser(id, { name: "Farmer", mobile, village: "" });
          return { ...r, currentUserId: id, authenticated: true, users: { ...r.users, [id]: user } };
        }),
      logout: () => setRoot((r) => ({ ...r, authenticated: false, currentUserId: null })),
      updateProfile: (patch) =>
        patchUser((u) => ({ ...u, profile: { ...(u.profile ?? { name: "", mobile: "", village: "" }), ...patch } })),
      saveBank: (bank) => patchUser((u) => ({ ...u, bank })),
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
        patchUser((u) => ({ ...u, bookings: [booking, ...u.bookings] }));
        notify({
          kind: "booking",
          title: `Token ${booking.token} confirmed`,
          body: `${CENTRES.find((c) => c.id === booking.centreId)?.name} · ${booking.date} at ${booking.slot}.`,
        });
        return booking;
      },
      cancelBooking: (id) => {
        patchUser((u) => ({
          ...u,
          bookings: u.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled", procurement: "cancelled" } : b,
          ),
        }));
        notify({ kind: "booking", title: "Booking cancelled", body: "Your slot has been released for other farmers." });
      },
      rescheduleBooking: (id, patch) => {
        patchUser((u) => ({
          ...u,
          bookings: u.bookings.map((b) =>
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
        patchUser((u) => ({
          ...u,
          complaints: [{ ...c, id: uid("cm"), at: new Date().toISOString(), status: "open" }, ...u.complaints],
        }));
        notify({ kind: "announcement", title: "Complaint received", body: "Our support team will reply within 24 hours." });
      },
      markNotificationsRead: () =>
        patchUser((u) => ({ ...u, notifications: u.notifications.map((n) => ({ ...n, read: true })) })),
    };
  }, [state, hydrated, notify, patchUser]);

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
