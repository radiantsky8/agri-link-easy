import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, ShieldCheck, Sprout } from "lucide-react";

import { BrandMark } from "@/components/farmer/AppShell";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Farmer — Procurement slots, tokens & payments" },
      {
        name: "description",
        content:
          "Book a procurement centre slot, carry one token, watch the live queue and track your payment — all from your phone.",
      },
      { property: "og:title", content: "Smart Farmer — Procurement slots, tokens & payments" },
      {
        property: "og:description",
        content: "Book a slot, track your token in the live queue and follow your payment to the bank.",
      },
    ],
  }),
  component: Welcome,
});

/** Welcome / landing screen — entry point of the onboarding flow. */
function Welcome() {
  const { t, state } = useFarmer();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-6">
        <BrandMark />

        <div className="mt-14 flex-1">
          <p className="eyebrow">{t("welcome.eyebrow")}</p>
          <h1 className="mt-3 font-display text-[2.9rem] font-bold leading-[0.98] tracking-tight">
            {t("welcome.title1")}
            <span className="block text-highlight">{t("welcome.title2")}</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">{t("welcome.body")}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sprout, title: "One booking", body: "Centre, crop, quantity, slot." },
              { icon: Clock3, title: "Live queue", body: "See how many are ahead." },
              { icon: ShieldCheck, title: "Paid to bank", body: "Track every rupee." },
            ].map((f) => (
              <div key={f.title} className="surface-card p-4">
                <f.icon className="size-5 text-highlight" />
                <p className="mt-3 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-lime p-6 text-lime-foreground">
            <p className="eyebrow text-lime-foreground/70">Sample token</p>
            <p className="mt-1 font-display text-5xl font-bold">A-124</p>
            <p className="mt-1 text-sm opacity-80">Sri Sai Procurement Centre · 10:45 AM</p>
            <div className="mt-5 flex gap-8 text-sm">
              <span>
                <span className="block font-display text-2xl font-bold">12</span>
                <span className="opacity-70">farmers ahead</span>
              </span>
              <span>
                <span className="block font-display text-2xl font-bold">~37 min</span>
                <span className="opacity-70">estimated wait</span>
              </span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-10 bg-background/90 py-4 backdrop-blur">
          <Link
            to="/language"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("welcome.cta")} <ArrowRight className="size-4" />
          </Link>
          <Link
            to={state.authenticated ? "/app" : "/login"}
            className="mt-3 block text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {state.authenticated ? "Go to my farm day" : t("welcome.signin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
