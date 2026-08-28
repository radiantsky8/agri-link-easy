import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/farmer/AppShell";
import { EmptyState, Pill, Surface, bookingTone, labelize } from "@/components/farmer/bits";
import { centreName, cropName, formatDate, formatMoney, formatQty, useFarmer } from "@/lib/farmer/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

const FILTERS = ["all", "upcoming", "in_progress", "completed", "cancelled"] as const;

/** Booking history with a simple status filter. */
function HistoryPage() {
  const { state } = useFarmer();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const rows = useMemo(
    () =>
      [...state.bookings]
        .filter((b) => filter === "all" || b.status === filter)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [state.bookings, filter],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Booking history"
        title="Every visit"
        accent="you made."
        description="All bookings with centre, crop, quantity and outcome."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
            )}
          >
            {labelize(f)}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No bookings here" body="Try a different filter or make a new booking." />
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <Surface key={b.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">
                    {cropName(b.cropId)} · {formatQty(b.quantity)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {centreName(b.centreId)} · {formatDate(b.date)} · {b.slot}
                  </p>
                </div>
                <Pill tone={bookingTone[b.status]}>{labelize(b.status)}</Pill>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Token {b.token}</span>
                <span>
                  {formatMoney(b.amount)} · {labelize(b.payment)}
                </span>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
