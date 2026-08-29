import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/farmer/AppShell";
import { Surface } from "@/components/farmer/bits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/bank")({
  component: BankPage,
});

const schema = z.object({
  holder: z.string().trim().min(2, "Enter the account holder name").max(80),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, "Account number must be 9 to 18 digits"),
  ifsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g. SBIN0001234)"),
  bankName: z.string().trim().min(2, "Enter the bank name").max(60),
  branch: z.string().trim().min(2, "Enter the branch").max(60),
});

/** Bank account used for procurement payouts. */
function BankPage() {
  const { state, saveBank } = useFarmer();
  const [form, setForm] = useState({
    holder: state.bank?.holder ?? state.profile?.name ?? "",
    accountNumber: state.bank?.accountNumber ?? "",
    ifsc: state.bank?.ifsc ?? "",
    bankName: state.bank?.bankName ?? "",
    branch: state.bank?.branch ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    saveBank(parsed.data);
    toast.success("Bank details saved");
  }

  const masked = state.bank ? `••••••${state.bank.accountNumber.slice(-4)}` : null;

  return (
    <div>
      <PageHeader
        eyebrow="Bank details"
        title="Where your money"
        accent="lands."
        description="Payments for completed procurement go straight to this account."
      />

      {masked && (
        <Surface className="mb-4 flex items-center gap-3 bg-lime text-lime-foreground">
          <ShieldCheck className="size-5" />
          <p className="text-sm font-semibold">
            Account on file: {masked} · {state.bank?.bankName}
          </p>
        </Surface>
      )}

      <Surface>
        <form onSubmit={save} className="space-y-5">
          <Field label="Account holder name" error={errors["holder"]}>
            <Input
              value={form.holder}
              maxLength={80}
              onChange={(e) => setForm({ ...form, holder: e.target.value })}
              className="h-12 rounded-xl bg-background"
            />
          </Field>
          <Field label="Account number" error={errors["accountNumber"]}>
            <Input
              value={form.accountNumber}
              inputMode="numeric"
              maxLength={18}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "") })}
              className="h-12 rounded-xl bg-background"
            />
          </Field>
          <Field label="IFSC code" error={errors["ifsc"]}>
            <Input
              value={form.ifsc}
              maxLength={11}
              placeholder="SBIN0001234"
              onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
              className="h-12 rounded-xl bg-background"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Bank name" error={errors["bankName"]}>
              <Input
                value={form.bankName}
                maxLength={60}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="h-12 rounded-xl bg-background"
              />
            </Field>
            <Field label="Branch" error={errors["branch"]}>
              <Input
                value={form.branch}
                maxLength={60}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="h-12 rounded-xl bg-background"
              />
            </Field>
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Save bank details
          </button>
        </form>
      </Surface>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
