import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/farmer/AppShell";
import { EmptyState, Pill, Surface, bookingTone, labelize } from "@/components/farmer/bits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CENTRES } from "@/lib/farmer/data";
import { centreName, cropName, formatDate, formatQty, useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/token")({
  component: TokenPage,
});

/** My Token — current active token with reschedule / cancel actions. */
function TokenPage() {
  const { state, cancelBooking } = useFarmer();
  const navigate = useNavigate();
  const active =
    state.bookings.find((b) => b.status === "in_progress") ?? state.bookings.find((b) => b.status === "upcoming");
  const centre = active ? CENTRES.find((c) => c.id === active.centreId) : undefined;

  if (!active) {
    return (
      <div>
        <PageHeader eyebrow="My token" title="No active" accent="token." />
        <EmptyState title="Nothing booked right now" body="Book a slot and your token will appear here." />
        <Link
          to="/app/book"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Book a token <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="My token" title="Carry this" accent="to the centre." />

      <div className="rounded-3xl bg-lime p-6 text-lime-foreground">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-lime-foreground/70">Token number</p>
          <span className="rounded-full bg-background/50 px-2.5 py-1 text-[11px] font-semibold">
            {labelize(active.status)}
          </span>
        </div>
        <p className="mt-1 font-display text-6xl font-bold tracking-tight">{active.token}</p>
        <p className="mt-2 text-sm opacity-80">{centreName(active.centreId)}</p>
        <div className="mt-6 flex flex-wrap gap-8 text-sm">
          <span>
            <span className="block font-display text-xl font-bold">{formatDate(active.date)}</span>
            <span className="opacity-70">date</span>
          </span>
          <span>
            <span className="block font-display text-xl font-bold">{active.slot}</span>
            <span className="opacity-70">time</span>
          </span>
          <span>
            <span className="block font-display text-xl font-bold">{centre?.queue ?? 0}</span>
            <span className="opacity-70">ahead of you</span>
          </span>
        </div>
      </div>

      <Surface className="mt-4">
        <dl className="divide-y divide-border">
          <Row label="Crop" value={cropName(active.cropId)} />
          <Row label="Quantity" value={formatQty(active.quantity)} />
          <Row label="Centre address" value={centre?.address ?? "—"} />
          <Row label="Procurement" value={labelize(active.procurement)} />
        </dl>
      </Surface>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/app/book", search: { reschedule: active.id } })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          <CalendarClock className="size-4" /> Reschedule
        </button>

        <AlertDialog>
          <AlertDialogTrigger className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-destructive">
            <XCircle className="size-4" /> Cancel booking
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel token {active.token}?</AlertDialogTitle>
              <AlertDialogDescription>
                Your slot at {centreName(active.centreId)} on {formatDate(active.date)} will be released to other
                farmers. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  cancelBooking(active.id);
                  toast.success("Booking cancelled");
                }}
              >
                Cancel booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Link
          to="/app/queue"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold"
        >
          Live queue <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-6">
        <Pill tone={bookingTone[active.payment]}>Payment: {labelize(active.payment)}</Pill>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
