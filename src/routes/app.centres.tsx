import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/farmer/AppShell";
import { Pill, Surface } from "@/components/farmer/bits";
import { Input } from "@/components/ui/input";
import { CENTRES } from "@/lib/farmer/data";

export const Route = createFileRoute("/app/centres")({
  component: CentresPage,
});

/** Browse and search procurement centres. */
function CentresPage() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CENTRES;
    return CENTRES.filter((c) =>
      [c.name, c.district, c.address].some((v) => v.toLowerCase().includes(needle)),
    );
  }, [q]);

  return (
    <div>
      <PageHeader
        eyebrow="Centres"
        title="Find a centre"
        accent="near you."
        description="Compare distance and today's queue before you choose where to sell."
      />

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by village, district or centre"
          className="h-12 rounded-2xl bg-card pl-11"
        />
      </div>

      <div className="space-y-3">
        {list.map((c) => (
          <Surface key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold leading-snug">{c.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {c.address} · {c.district}
                </p>
              </div>
              <Pill tone={c.queue > 15 ? "warn" : "lime"}>{c.queue > 15 ? "Busy" : "Moving"}</Pill>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-6 text-sm">
                <span>
                  <span className="block font-display text-xl font-bold">{c.distanceKm} km</span>
                  <span className="text-xs text-muted-foreground">away</span>
                </span>
                <span>
                  <span className="flex items-center gap-1 font-display text-xl font-bold">
                    <Users className="size-4" /> {c.queue}
                  </span>
                  <span className="text-xs text-muted-foreground">in queue</span>
                </span>
              </div>
              <Link
                to="/app/book"
                search={{ centre: c.id }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Book <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Surface>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No centres match "{q}".</p>}
      </div>
    </div>
  );
}
