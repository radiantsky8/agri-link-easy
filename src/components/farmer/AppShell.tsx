/** Shared chrome for every authenticated farmer screen: header, drawer nav, page frame. */
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CreditCard,
  HelpCircle,
  Home,
  ListChecks,
  MapPin,
  Menu,
  ReceiptText,
  Sprout,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useFarmer } from "@/lib/farmer/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "nav.home", icon: Home, exact: true },
  { to: "/app/centres", label: "nav.centres", icon: MapPin },
  { to: "/app/book", label: "nav.book", icon: CalendarDays },
  { to: "/app/token", label: "nav.token", icon: Ticket },
  { to: "/app/queue", label: "nav.queue", icon: Users },
  { to: "/app/procurement", label: "nav.procurement", icon: ListChecks },
  { to: "/app/payment", label: "nav.payment", icon: CreditCard },
  { to: "/app/history", label: "nav.history", icon: ReceiptText },
  { to: "/app/more", label: "nav.more", icon: HelpCircle },
  { to: "/app/profile", label: "nav.profile", icon: User },
] as const;

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-full bg-lime text-lime-foreground">
        <Sprout className="size-4.5" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-bold">Smart Farmer</span>
          <span className="block eyebrow text-[10px]">Procurement</span>
        </span>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t, state } = useFarmer();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = state.notifications.filter((n) => !n.read).length;
  const initials =
    state.profile?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RK";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[19rem] bg-sidebar p-0">
              <div className="border-b border-sidebar-border px-5 py-4">
                <BrandMark />
              </div>
              {state.profile && (
                <div className="px-5 py-4">
                  <p className="eyebrow">Today</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-lime text-sm font-bold text-lime-foreground">
                      {initials}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold">{state.profile.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {state.profile.village || state.profile.mobile}
                      </span>
                    </span>
                  </div>
                </div>
              )}
              <nav className="flex flex-col gap-0.5 px-3 pb-6">
                {NAV.map((item) => {
                  const active = "exact" in item ? pathname === item.to : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-secondary",
                      )}
                    >
                      <item.icon className="size-4.5 opacity-80" />
                      {t(item.label)}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/app" className="md:hidden">
            <BrandMark compact />
          </Link>
          <Link to="/app" className="hidden md:block">
            <BrandMark />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/app/notifications"
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-full transition-colors hover:bg-secondary"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-highlight ring-2 ring-background" />
              )}
            </Link>
            <Link
              to="/app/profile"
              className="grid size-9 place-items-center rounded-full bg-lime text-xs font-bold text-lime-foreground"
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-[2rem] font-bold leading-[1.05] tracking-tight">
        {title}
        {accent && <span className="block text-highlight">{accent}</span>}
      </h1>
      {description && <p className="mt-3 max-w-prose text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
