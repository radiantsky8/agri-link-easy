import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { BrandMark } from "@/components/farmer/AppShell";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register as a farmer — Smart Farmer" },
      { name: "description", content: "Create your farmer profile with name, mobile number and village." },
      { property: "og:title", content: "Register as a farmer — Smart Farmer" },
      { property: "og:description", content: "Create your farmer profile with name, mobile number and village." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  village: z.string().trim().max(80, "Location is too long").optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to continue" }) }),
});

/** Step 3 of onboarding — minimal registration, then handoff to OTP login. */
function RegisterPage() {
  const { t, register } = useFarmer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", mobile: "", village: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    register({ name: parsed.data.name, mobile: parsed.data.mobile, village: parsed.data.village ?? "" });
    toast.success("Profile created. Verify your mobile to continue.");
    navigate({ to: "/login", search: { mobile: parsed.data.mobile } });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
      <BrandMark />
      <form onSubmit={submit} className="mt-12 flex-1">
        <p className="eyebrow">Step 2 of 3</p>
        <h1 className="mt-2 font-display text-3xl font-bold">{t("register.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("register.body")}</p>

        <div className="mt-7 space-y-5">
          <Field label={t("register.name")} error={errors["name"]}>
            <Input
              value={form.name}
              maxLength={80}
              placeholder="Ravi Kumar"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-xl bg-card"
            />
          </Field>

          <Field label={t("register.mobile")} error={errors["mobile"]}>
            <div className="flex items-center gap-2">
              <span className="grid h-12 shrink-0 place-items-center rounded-xl bg-secondary px-3 text-sm font-semibold">
                +91
              </span>
              <Input
                value={form.mobile}
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                className="h-12 rounded-xl bg-card"
              />
            </div>
          </Field>

          <Field label={`${t("register.village")} (${t("register.optional")})`} error={errors["village"]}>
            <Input
              value={form.village}
              maxLength={80}
              placeholder="Miryalaguda, Nalgonda"
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="h-12 rounded-xl bg-card"
            />
          </Field>

          <label className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm">
            <Checkbox
              checked={form.consent}
              onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
              className="mt-0.5"
            />
            <span>
              {t("register.consent")}
              {errors["consent"] && <span className="mt-1 block text-xs text-destructive">{errors["consent"]}</span>}
            </span>
          </label>
        </div>

        <div className="sticky bottom-0 mt-10 bg-background/90 py-4 backdrop-blur">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("register.submit")} <ArrowRight className="size-4" />
          </button>
          <Link to="/language" className="mt-3 block text-center text-sm text-muted-foreground hover:underline">
            {t("common.back")}
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
