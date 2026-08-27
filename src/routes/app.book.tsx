import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/farmer/AppShell";
import { Pill, Surface } from "@/components/farmer/bits";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CENTRES, CROPS, TIME_SLOTS } from "@/lib/farmer/data";
import { amountFor, centreName, cropName, formatMoney, formatQty, useFarmer } from "@/lib/farmer/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    centre: typeof search["centre"] === "string" ? search["centre"] : undefined,
    reschedule: typeof search["reschedule"] === "string" ? search["reschedule"] : undefined,
  }),
  component: BookingFlow,
});

const STEPS = ["Centre", "Crop", "Quantity", "Date", "Time", "Confirm"] as const;

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Stepwise booking flow: centre -> crop -> quantity -> date -> time -> confirm. */
function BookingFlow() {
  const { centre: presetCentre, reschedule } = Route.useSearch();
  const { state, createBooking, rescheduleBooking } = useFarmer();
  const navigate = useNavigate();
  const existing = reschedule ? state.bookings.find((b) => b.id === reschedule) : undefined;

  const [step, setStep] = useState(0);
  const [centreId, setCentreId] = useState(existing?.centreId ?? presetCentre ?? "");
  const [cropId, setCropId] = useState(existing?.cropId ?? "");
  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : "");
  const [date, setDate] = useState<Date | undefined>(existing ? new Date(`${existing.date}T00:00:00`) : undefined);
  const [slot, setSlot] = useState(existing?.slot ?? "");
  const [error, setError] = useState<string | null>(null);

  const qty = Number(quantity);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + 14);

  // Slots already taken by this farmer on the same centre + date.
  const taken = state.bookings
    .filter(
      (b) =>
        b.id !== existing?.id &&
        b.status !== "cancelled" &&
        b.centreId === centreId &&
        date &&
        b.date === toISO(date),
    )
    .map((b) => b.slot);

  function validate(current: number): string | null {
    if (current === 0 && !centreId) return "Select a procurement centre";
    if (current === 1 && !cropId) return "Select the crop you are bringing";
    if (current === 2) {
      if (!quantity || Number.isNaN(qty) || qty <= 0) return "Enter a quantity greater than zero";
      if (qty > 500) return "Maximum 500 quintals per booking";
    }
    if (current === 3 && !date) return "Choose a date within the booking window";
    if (current === 4 && !slot) return "Pick an available time slot";
    return null;
  }

  function next() {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function confirm() {
    if (!date) return;
    const payload = { centreId, cropId, quantity: qty, date: toISO(date), slot };
    if (existing) {
      rescheduleBooking(existing.id, payload);
      toast.success("Booking rescheduled");
    } else {
      const booking = createBooking(payload);
      toast.success(`Token ${booking.token} confirmed`);
    }
    navigate({ to: "/app/token" });
  }

  return (
    <div>
      <PageHeader
        eyebrow={existing ? "Reschedule" : "New booking"}
        title={existing ? "Change your" : "Book your"}
        accent={existing ? "slot." : "token."}
        description="Six quick steps. You can go back and change anything before confirming."
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold",
              i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-lime text-lime-foreground" : "bg-secondary text-muted-foreground",
            )}
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>

      <Surface>
        {step === 0 && (
          <Step title="Select a centre">
            <div className="space-y-2.5">
              {CENTRES.map((c) => (
                <Choice key={c.id} active={centreId === c.id} onClick={() => setCentreId(c.id)}>
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs opacity-70">
                    {c.district} · {c.distanceKm} km · {c.queue} in queue
                  </span>
                </Choice>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="Select your crop">
            <div className="space-y-2.5">
              {CROPS.map((c) => (
                <Choice key={c.id} active={cropId === c.id} onClick={() => setCropId(c.id)}>
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs opacity-70">
                    {c.variety} · {formatMoney(c.ratePerQuintal)} / quintal
                  </span>
                </Choice>
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="How much are you bringing?">
            <Label className="mb-2 block text-sm font-medium">Quantity in quintals</Label>
            <div className="flex items-center gap-2">
              <Input
                value={quantity}
                inputMode="decimal"
                placeholder="5"
                onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
                className="h-12 rounded-xl bg-background"
              />
              <span className="grid h-12 shrink-0 place-items-center rounded-xl bg-secondary px-4 text-sm font-semibold">
                quintal
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {qty > 0 && !Number.isNaN(qty)
                ? `${formatQty(qty)} · estimated ${formatMoney(amountFor(cropId, qty))}`
                : "1 quintal = 100 kg. Maximum 500 quintals per booking."}
            </p>
          </Step>
        )}

        {step === 3 && (
          <Step title="Choose a date">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: today, after: windowEnd }}
              className="rounded-2xl border border-border bg-background p-3"
            />
            <p className="mt-2 text-xs text-muted-foreground">Bookings open for the next 14 days.</p>
          </Step>
        )}

        {step === 4 && (
          <Step title="Pick a time slot">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {TIME_SLOTS.map((s) => {
                const disabled = taken.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                      disabled
                        ? "cursor-not-allowed border-dashed border-border text-muted-foreground/50"
                        : slot === s
                          ? "border-transparent bg-lime text-lime-foreground"
                          : "border-border bg-background hover:bg-secondary",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Greyed slots are already booked by you at this centre for the selected date.
            </p>
          </Step>
        )}

        {step === 5 && (
          <Step title="Confirm your booking">
            <dl className="divide-y divide-border rounded-2xl bg-secondary/50 px-4">
              <Row label="Centre" value={centreName(centreId)} />
              <Row label="Crop" value={cropName(cropId)} />
              <Row label="Quantity" value={formatQty(qty)} />
              <Row label="Date" value={date ? date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "—"} />
              <Row label="Time" value={slot} />
              <Row label="Estimated value" value={formatMoney(amountFor(cropId, qty))} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              A token number is generated as soon as you confirm. Bring your Aadhaar and pattadar passbook.
            </p>
          </Step>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Next <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Check className="size-4" /> {existing ? "Save new slot" : "Confirm booking"}
            </button>
          )}
        </div>
      </Surface>

      {step === 0 && presetCentre && (
        <p className="mt-4 text-xs text-muted-foreground">
          Pre-selected from the centres list. <Pill tone="lime">{centreName(presetCentre)}</Pill>
        </p>
      )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors",
        active ? "border-transparent bg-lime text-lime-foreground" : "border-border bg-background hover:bg-secondary",
      )}
    >
      <span>{children}</span>
      {active && <Check className="size-4 shrink-0" />}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
