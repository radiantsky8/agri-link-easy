import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";

import { PageHeader } from "@/components/farmer/AppShell";
import { EmptyState, Surface } from "@/components/farmer/bits";
import { centreName, cropName, formatDate, formatMoney, formatQty, useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/payments-completed")({
  component: PaymentsCompleted,
});

/** Receipt-style list of successfully paid transactions. */
function PaymentsCompleted() {
  const { state } = useFarmer();
  const paid = state.bookings.filter((b) => b.payment === "paid");
  const total = paid.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Payments completed"
        title="Your receipts,"
        accent="in one place."
        description={`${paid.length} settled transactions worth ${formatMoney(total)}.`}
      />

      {paid.length === 0 ? (
        <EmptyState title="No completed payments" body="Settled payments appear here with a receipt summary." />
      ) : (
        <div className="space-y-3">
          {paid.map((b) => (
            <Surface key={b.id}>
              <div className="flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
                  <ReceiptText className="size-4" />
                </span>
                <p className="eyebrow">Paid {b.paidOn ? formatDate(b.paidOn) : ""}</p>
              </div>
              <p className="mt-4 font-display text-3xl font-bold">{formatMoney(b.amount)}</p>
              <dl className="mt-4 divide-y divide-border text-sm">
                <Row label="Token" value={b.token} />
                <Row label="Centre" value={centreName(b.centreId)} />
                <Row label="Crop" value={cropName(b.cropId)} />
                <Row label="Quantity" value={formatQty(b.quantity)} />
                <Row label="Procurement date" value={formatDate(b.date)} />
              </dl>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
