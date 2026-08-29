import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarCheck, CreditCard, Megaphone } from "lucide-react";
import { useEffect } from "react";

import { PageHeader } from "@/components/farmer/AppShell";
import { BackButton, EmptyState, Surface } from "@/components/farmer/bits";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

const ICONS = {
  booking: CalendarCheck,
  reminder: Bell,
  payment: CreditCard,
  announcement: Megaphone,
} as const;

/** System notifications for the farmer. */
function NotificationsPage() {
  const { state, markNotificationsRead } = useFarmer();

  useEffect(() => {
    if (state.notifications.some((n) => !n.read)) markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <BackButton />
      <PageHeader eyebrow="Notifications" title="What changed" accent="today." />

      {state.notifications.length === 0 ? (
        <EmptyState title="Nothing new" body="Booking confirmations, reminders and payment updates land here." />
      ) : (
        <div className="space-y-3">
          {state.notifications.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <Surface key={n.id} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4.5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(n.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
