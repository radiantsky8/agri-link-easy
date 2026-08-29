import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/farmer/AppShell";
import { BackButton, Pill, Surface } from "@/components/farmer/bits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/complaint")({
  component: ComplaintPage,
});

const schema = z.object({
  subject: z.string().trim().min(4, "Add a short subject").max(120, "Subject is too long"),
  description: z.string().trim().min(10, "Tell us a little more").max(1000, "Keep it under 1000 characters"),
  bookingRef: z.string().trim().max(40).default(""),
});

/** Raise a support complaint, optionally linked to a booking token. */
function ComplaintPage() {
  const { state, addComplaint } = useFarmer();
  const [form, setForm] = useState({ subject: "", description: "", bookingRef: "" });
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
    addComplaint(parsed.data);
    setForm({ subject: "", description: "", bookingRef: "" });
    toast.success("Complaint submitted", { description: "Our support team will reply within 24 hours." });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title="Tell us what"
        accent="went wrong."
        description="Weighing dispute, payment delay, wrong token — we will look into it."
      />

      <Surface>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm font-medium">Subject</Label>
            <Input
              value={form.subject}
              maxLength={120}
              placeholder="Payment not received for token A-092"
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="h-12 rounded-xl bg-background"
            />
            {errors["subject"] && <p className="mt-1.5 text-xs text-destructive">{errors["subject"]}</p>}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Description</Label>
            <Textarea
              value={form.description}
              maxLength={1000}
              rows={5}
              placeholder="Describe what happened, including dates and the centre name."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-xl bg-background"
            />
            {errors["description"] && <p className="mt-1.5 text-xs text-destructive">{errors["description"]}</p>}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Booking reference (optional)</Label>
            <Select
              value={form.bookingRef}
              onValueChange={(v) => setForm({ ...form, bookingRef: v })}
            >
              <SelectTrigger className="h-12 rounded-xl bg-background">
                <SelectValue placeholder="Link a booking token" />
              </SelectTrigger>
              <SelectContent>
                {state.bookings.map((b) => (
                  <SelectItem key={b.id} value={b.token}>
                    {b.token} · {b.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Submit complaint
          </button>
        </form>
      </Surface>

      {state.complaints.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow">Your complaints</p>
          <div className="mt-3 space-y-3">
            {state.complaints.map((c) => (
              <Surface key={c.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{c.subject}</p>
                  <Pill tone={c.status === "open" ? "warn" : "lime"}>{c.status}</Pill>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>
                {c.bookingRef && <p className="mt-2 text-xs text-muted-foreground">Token {c.bookingRef}</p>}
              </Surface>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
