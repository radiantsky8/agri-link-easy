import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/farmer/AppShell";
import { BackButton, Surface } from "@/components/farmer/bits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/lib/farmer/i18n";
import { useFarmer } from "@/lib/farmer/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  village: z.string().trim().max(80, "Location is too long"),
});

/** View / edit basic farmer profile, including language preference. */
function ProfilePage() {
  const { state, updateProfile, setLanguage } = useFarmer();
  const [form, setForm] = useState({
    name: state.profile?.name ?? "",
    mobile: state.profile?.mobile ?? "",
    village: state.profile?.village ?? "",
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
    updateProfile(parsed.data);
    toast.success("Profile updated");
  }

  return (
    <div>
      <PageHeader eyebrow="Profile" title="Your details," accent="kept simple." />

      <Surface>
        <form onSubmit={save} className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm font-medium">Full name</Label>
            <Input
              value={form.name}
              maxLength={80}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-xl bg-background"
            />
            {errors["name"] && <p className="mt-1.5 text-xs text-destructive">{errors["name"]}</p>}
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Mobile number</Label>
            <Input
              value={form.mobile}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
              className="h-12 rounded-xl bg-background"
            />
            {errors["mobile"] && <p className="mt-1.5 text-xs text-destructive">{errors["mobile"]}</p>}
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Village / location</Label>
            <Input
              value={form.village}
              maxLength={80}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="h-12 rounded-xl bg-background"
            />
            {errors["village"] && <p className="mt-1.5 text-xs text-destructive">{errors["village"]}</p>}
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Save changes
          </button>
        </form>
      </Surface>

      <Surface className="mt-4">
        <p className="eyebrow">Language preference</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLanguage(l.code);
                toast.success(`Language set to ${l.label}`);
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                state.language === l.code ? "bg-lime text-lime-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {l.native}
            </button>
          ))}
        </div>
      </Surface>
    </div>
  );
}
