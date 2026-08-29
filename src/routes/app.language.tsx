import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/farmer/AppShell";
import { LANGUAGES } from "@/lib/farmer/i18n";
import { useFarmer } from "@/lib/farmer/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/language")({
  component: ChangeLanguage,
});

/** Change the app language at any time; applies immediately and persists. */
function ChangeLanguage() {
  const { state, setLanguage, t } = useFarmer();

  return (
    <div>
      <PageHeader eyebrow="Language" title={t("language.title")} description={t("language.body")} />
      <div className="grid gap-3 sm:grid-cols-2">
        {LANGUAGES.map((l) => {
          const active = state.language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLanguage(l.code);
                toast.success(`Language changed to ${l.label}`);
              }}
              className={cn(
                "flex items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                active ? "border-transparent bg-lime text-lime-foreground" : "border-border bg-card hover:bg-secondary",
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
  );
}
