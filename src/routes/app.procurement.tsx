import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/farmer/AppShell";
import { BackButton, EmptyState, Pill, Surface, bookingTone, labelize } from "@/components/farmer/bits";
import { centreName, cropName, formatDate, formatQty, useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/procurement")({
  component: ProcurementStatus,
});

const STAGES = ["pending", "arrived", "weighing", "completed"] as const;

/** Procurement status per booking. */
function ProcurementStatus() {
  const { state } = useFarmer();
  const bookings = state.bookings;

  return (
    <div>
      <BackButton />
      <PageHeader
        eyebrow="Procurement"
        title="Where each load"
        accent="stands."
        description="Follow every booking from arrival through weighing to completion."
      />

      {bookings.length === 0 ? (
        <EmptyState title="No procurement yet" body="Your bookings will show their progress here." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const stageIndex = STAGES.indexOf(b.procurement as (typeof STAGES)[number]);
            return (
              <Surface key={b.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">Token {b.token}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {centreName(b.centreId)} · {formatDate(b.date)} · {b.slot}
                    </p>
                  </div>
                  <Pill tone={bookingTone[b.procurement]}>{labelize(b.procurement)}</Pill>
                </div>

                <div className="mt-4 flex gap-1.5">
                  {STAGES.map((s, i) => (
                    <span
                      key={s}
                      className={`h-1.5 flex-1 rounded-full ${
                        b.procurement === "cancelled"
                          ? "bg-destructive/30"
                          : i <= stageIndex
                            ? "bg-highlight"
                            : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {cropName(b.cropId)} · {formatQty(b.quantity)}
                </p>

                <Link to="/app/history" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-highlight">
                  Booking details <ArrowRight className="size-3.5" />
                </Link>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
