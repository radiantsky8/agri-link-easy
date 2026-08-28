import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, ChevronRight, HelpCircle, Languages, LogOut, MessageSquareWarning, User } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/farmer/AppShell";
import { Surface } from "@/components/farmer/bits";
import { LANGUAGES } from "@/lib/farmer/i18n";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/more")({
  component: MorePage,
});

const LINKS = [
  { to: "/app/profile", icon: User, title: "Profile", body: "Name, mobile, village" },
  { to: "/app/bank", icon: Banknote, title: "Bank details", body: "Where your payments land" },
  { to: "/app/language", icon: Languages, title: "Language", body: "Change the app language" },
  { to: "/app/faq", icon: HelpCircle, title: "FAQ", body: "Common questions from farmers" },
  { to: "/app/complaint", icon: MessageSquareWarning, title: "Raise a complaint", body: "Tell us what went wrong" },
] as const;

/** More / Help menu. */
function MorePage() {
  const { state, logout } = useFarmer();
  const navigate = useNavigate();
  const lang = LANGUAGES.find((l) => l.code === state.language);

  return (
    <div>
      <PageHeader eyebrow="More" title="Settings" accent="& help." />

      <div className="space-y-3">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="surface-card flex items-center gap-4 p-4 hover:bg-secondary/50">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <l.icon className="size-4.5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{l.title}</span>
              <span className="block text-xs text-muted-foreground">
                {l.title === "Language" ? `${l.body} · ${lang?.native}` : l.body}
              </span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <Surface className="mt-5">
        <p className="text-sm font-semibold">Signed in as {state.profile?.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">+91 {state.profile?.mobile}</p>
        <button
          type="button"
          onClick={() => {
            logout();
            toast.success("Signed out");
            navigate({ to: "/login", replace: true });
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-destructive"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </Surface>
    </div>
  );
}
