import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCcw, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/farmer/AppShell";
import { BackButton, EmptyState, Surface } from "@/components/farmer/bits";
import { Progress } from "@/components/ui/progress";
import { CENTRES } from "@/lib/farmer/data";
import { centreName, formatDate, useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/queue")({
  component: QueuePage,
});

/** Live queue position for the active booking, auto-refreshing every 20s. */
function QueuePage() {
  const { state } = useFarmer();
  const active =
    state.bookings.find((b) => b.status === "in_progress") ?? state.bookings.find((b) => b.status === "upcoming");
  const centre = active ? CENTRES.find((c) => c.id === active.centreId) : undefined;
  const [ahead, setAhead] = useState(centre?.queue ?? 0);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  const refresh = () => {
    setAhead((n) => Math.max(0, n - Math.floor(Math.random() * 2)));
    setUpdatedAt(new Date());
  };

  useEffect(() => {
    const id = setInterval(refresh, 20000);
    return () => clearInterval(id);
  }, []);

  if (!active || !centre) {
    return (
      <div>
        <BackButton />
        <PageHeader eyebrow="Live queue" title="Nothing in" accent="the queue." />
        <EmptyState title="No active booking" body="Book a slot to follow the queue in real time." />
      </div>
    );
  }

  const total = Math.max(ahead + 1, centre.queue || 1);
  const served = total - ahead;

  return (
    <div>
      <PageHeader
        eyebrow="Live queue"
        title="You are"
        accent={`#${ahead + 1} in queue.`}
        description={`${centreName(active.centreId)} · ${formatDate(active.date)} · slot ${active.slot}`}
      />

      <Surface>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4" /> {ahead} farmers ahead
          </span>
          <span className="text-xs text-muted-foreground">~{ahead * 3} min wait</span>
        </div>
        <Progress value={(served / total) * 100} className="mt-4 h-2.5" />
        <p className="mt-3 text-xs text-muted-foreground">
          Token being served now: {centre.name.split(" ")[0]} · A-{112 + served}
        </p>
      </Surface>

      <Surface className="mt-4">
        <p className="eyebrow">Queue ahead of you</p>
        <ul className="mt-3 divide-y divide-border text-sm">
          {Array.from({ length: Math.min(ahead, 6) }).map((_, i) => (
            <li key={i} className="flex items-center justify-between py-2.5">
              <span className="font-medium">Token A-{113 + served + i}</span>
              <span className="text-xs text-muted-foreground">{i === 0 ? "At the weighbridge" : "Waiting"}</span>
            </li>
          ))}
          <li className="flex items-center justify-between py-2.5">
            <span className="font-semibold text-highlight">Your token {active.token}</span>
            <span className="text-xs text-muted-foreground">Position #{ahead + 1}</span>
          </li>
        </ul>
      </Surface>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          <RefreshCcw className="size-4" /> Refresh
        </button>
        <span className="text-xs text-muted-foreground">
          Updated {updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <Link to="/app/token" className="ml-auto text-sm font-semibold text-highlight">
          My token
        </Link>
      </div>
    </div>
  );
}
