import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { BrandMark } from "@/components/farmer/AppShell";
import { LANGUAGES } from "@/lib/farmer/i18n";
import { useFarmer } from "@/lib/farmer/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose your language — Smart Farmer" },
      { name: "description", content: "Pick English or your local language for the whole farmer portal." },
      { property: "og:title", content: "Choose your language — Smart Farmer" },
      { property: "og:description", content: "Pick English or your local language for the whole farmer portal." },
    ],
  }),
  component: LanguagePage,
});

/** Step 2 of onboarding — language preference, persisted in the session profile. */
function LanguagePage() {
  const { t, state, setLanguage } = useFarmer();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
      <BrandMark />
      <div className="mt-12 flex-1">
        <p className="eyebrow">Step 1 of 3</p>
        <h1 className="mt-2 font-display text-3xl font-bold">{t("language.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("language.body")}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {LANGUAGES.map((l) => {
            const active = state.language === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                  active
                    ? "border-transparent bg-lime text-lime-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                <span>
                  <span className="block font-display text-lg font-semibold">{l.native}</span>
                  <span className="block text-xs opacity-70">{l.label}</span>
                </span>
                {active && <Check className="size-5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/90 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate({ to: "/register" })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("language.continue")} <ArrowRight className="size-4" />
        </button>
        <Link to="/" className="mt-3 block text-center text-sm text-muted-foreground hover:underline">
          {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
