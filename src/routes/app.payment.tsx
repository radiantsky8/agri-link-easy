import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/farmer/AppShell";
import { EmptyState, Pill, Surface, bookingTone, labelize } from "@/components/farmer/bits";
import { centreName, cropName, formatDate, formatMoney, formatQty, useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/payment")({
  component: PaymentStatus,
});

/** Payment status for completed procurements. */
function PaymentStatus() {
  const { state } = useFarmer();
  const rows = state.bookings.filter((b) => b.status === "completed" || b.payment !== "pending");
  const totalPaid = rows.filter((r) => r.payment === "paid").reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Payment"
        title="Money on"
        accent="the way."
        description="Every completed sale and where its payment has reached."
      />

      <Surface className="mb-4 bg-lime text-lime-foreground">
        <p className="eyebrow text-lime-foreground/70">Paid this season</p>
        <p className="mt-1 font-display text-4xl font-bold">{formatMoney(totalPaid)}</p>
        <Link to="/app/payments-completed" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
          View receipts <ArrowRight className="size-3.5" />
        </Link>
      </Surface>

      {rows.length === 0 ? (
        <EmptyState title="No payments yet" body="Payments appear after weighing and quality checks are complete." />
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <Surface key={b.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{formatMoney(b.amount)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Token {b.token} · {cropName(b.cropId)} · {formatQty(b.quantity)}
                  </p>
                </div>
                <Pill tone={bookingTone[b.payment]}>{labelize(b.payment)}</Pill>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {centreName(b.centreId)} · {formatDate(b.date)}
                {b.paidOn
                  ? ` · paid on ${formatDate(b.paidOn)}`
                  : b.payment === "processing"
                    ? " · expected within 2 working days"
                    : ""}
              </p>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
