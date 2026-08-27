import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  MapPin,
  Mic,
  Navigation,
  Sun,
} from "lucide-react";

import { labelize, Pill, Surface, bookingTone } from "@/components/farmer/bits";
import { CENTRES } from "@/lib/farmer/data";
import { centreName, cropName, formatMoney, formatQty, useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/")({
  component: FarmerHome,
});

/** Farmer Home — active token, day plan, quick actions. */
function FarmerHome() {
  const { state } = useFarmer();
  const active =
    state.bookings.find((b) => b.status === "in_progress") ?? state.bookings.find((b) => b.status === "upcoming");
  const lastPayment = state.bookings.find((b) => b.payment !== "pending");
  const centre = active ? CENTRES.find((c) => c.id === active.centreId) : undefined;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">{today}</p>
        <h1 className="mt-2 font-display text-[2.4rem] font-bold leading-[0.98]">
          Know before
          <span className="block text-highlight">you go.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Your procurement day, made clear. Here is what needs your attention this morning.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
          <Sun className="size-3.5 text-warning" /> Weather is good for travel · 28°C
        </p>
      </div>

      {active ? (
        <div className="rounded-3xl bg-lime p-6 text-lime-foreground">
          <div className="flex items-start justify-between">
            <p className="eyebrow text-lime-foreground/70">Active token</p>
            <span className="rounded-full bg-background/50 px-2.5 py-1 text-[11px] font-semibold">
              {labelize(active.status)}
            </span>
          </div>
          <p className="mt-1 font-display text-5xl font-bold">{active.token}</p>
          <p className="mt-1.5 max-w-[16rem] text-sm opacity-80">{centreName(active.centreId)}</p>
          <div className="mt-6 flex flex-wrap gap-8">
            <Stat value={String(centre?.queue ?? 0)} label="farmers ahead" />
            <Stat value={`~${(centre?.queue ?? 0) * 3} min`} label="estimated wait" />
            <Stat value={active.slot} label="your slot" />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/app/queue"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              View live queue <ArrowRight className="size-4" />
            </Link>
            <Link to="/app/token" className="text-sm font-semibold underline-offset-4 hover:underline">
              Open token
            </Link>
          </div>
        </div>
      ) : (
        <Surface>
          <p className="font-display text-lg font-semibold">No active token</p>
          <p className="mt-1 text-sm text-muted-foreground">Book a slot to get a token for your next visit.</p>
          <Link
            to="/app/book"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Book a token <ArrowRight className="size-4" />
          </Link>
        </Surface>
      )}

      {active && (
        <Surface>
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Leave by</p>
              <p className="mt-1 font-display text-3xl font-bold">10:05 AM</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <Navigation className="size-4" />
            </span>
          </div>
          <div className="mt-4 rounded-2xl bg-secondary/70 p-4">
            <p className="text-sm font-semibold">Plan for 25 minutes travel</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {centre?.address}. Traffic is light — you have a little breathing room.
            </p>
          </div>
          <Link to="/app/centres" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-highlight">
            Check directions <ArrowRight className="size-3.5" />
          </Link>
        </Surface>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Surface>
          <div className="flex items-start justify-between">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <CheckCircle2 className="size-4" />
            </span>
            <p className="eyebrow">Procurement</p>
          </div>
          <p className="mt-4 font-display text-2xl font-bold">
            {active ? labelize(active.procurement) : "Nothing pending"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {active ? `${cropName(active.cropId)} · ${formatQty(active.quantity)}` : "Your last visit is complete."}
          </p>
          <Link to="/app/procurement" className="mt-3 inline-block text-sm font-semibold text-highlight">
            View status
          </Link>
        </Surface>

        <Surface>
          <div className="flex items-start justify-between">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <CreditCard className="size-4" />
            </span>
            <p className="eyebrow">Payment</p>
          </div>
          <p className="mt-4 font-display text-2xl font-bold">
            {lastPayment ? labelize(lastPayment.payment) : "No payments yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lastPayment ? `${formatMoney(lastPayment.amount)} · token ${lastPayment.token}` : "Complete a sale first."}
          </p>
          <Link to="/app/payment" className="mt-3 inline-block text-sm font-semibold text-highlight">
            View payments
          </Link>
        </Surface>
      </div>

      <div>
        <p className="eyebrow">Quick actions</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Make the next step easy</h2>
        <div className="mt-4 space-y-3">
          <Action to="/app/centres" icon={MapPin} title="Compare centres" body="Find the shortest practical queue" />
          <Action to="/app/book" icon={CalendarPlus} title="Book a token" body="Choose a slot that fits your day" />
          <Action to="/app/notifications" icon={Bell} title="Turn on alerts" body="We will tell you when to leave" />
          <Action to="/app/more" icon={Mic} title="Ask for help" body='Say "Where is my token?"' />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/app/history" className="surface-card flex items-center justify-between p-4 text-sm font-semibold">
          Booking history <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
        <Link to="/app/more" className="surface-card flex items-center justify-between p-4 text-sm font-semibold">
          More & help <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
      </div>

      {lastPayment && (
        <Surface className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Last payment</p>
            <p className="mt-1 text-sm font-semibold">
              {formatMoney(lastPayment.amount)} · {cropName(lastPayment.cropId)}
            </p>
          </div>
          <Pill tone={bookingTone[lastPayment.payment]}>{labelize(lastPayment.payment)}</Pill>
        </Surface>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span>
      <span className="block font-display text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </span>
  );
}

function Action({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: string;
  icon: typeof MapPin;
  title: string;
  body: string;
}) {
  return (
    <Link to={to} className="surface-card flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
        <Icon className="size-4.5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{body}</span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
