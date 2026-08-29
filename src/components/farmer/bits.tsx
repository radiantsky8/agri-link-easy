/** Small presentational primitives shared across farmer screens. */
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** History-aware back button for inner pages; falls back to a safe route. */
export function BackButton({ to = "/app" }: { to?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (router.history.length > 1) router.history.back();
        else void router.navigate({ to });
      }}
      className="-ml-4 mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
    >
      <ArrowLeft className="size-4" /> Back
    </button>
  );
}


const TONES = {
  neutral: "bg-secondary text-secondary-foreground",
  lime: "bg-lime text-lime-foreground",
  green: "bg-primary text-primary-foreground",
  warn: "bg-warning/15 text-foreground",
  danger: "bg-destructive/12 text-destructive",
} as const;

export type Tone = keyof typeof TONES;

export function Pill({ tone = "neutral", children }: { tone?: Tone | undefined; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("surface-card p-5", className)}>{children}</div>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Surface className="text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </Surface>
  );
}

export const bookingTone: Record<string, Tone> = {
  upcoming: "lime",
  in_progress: "green",
  completed: "neutral",
  cancelled: "danger",
  pending: "neutral",
  arrived: "lime",
  weighing: "lime",
  processing: "warn",
  paid: "green",
  failed: "danger",
};

export function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
