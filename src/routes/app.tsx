import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppShell } from "@/components/farmer/AppShell";
import { useFarmer } from "@/lib/farmer/store";

/**
 * Authenticated farmer area. Session lives client-side, so this layout is
 * client-rendered and redirects unauthenticated visitors to /login.
 */
export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { hydrated, state } = useFarmer();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !state.authenticated) navigate({ to: "/login", replace: true });
  }, [hydrated, state.authenticated, navigate]);

  if (!hydrated || !state.authenticated) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
