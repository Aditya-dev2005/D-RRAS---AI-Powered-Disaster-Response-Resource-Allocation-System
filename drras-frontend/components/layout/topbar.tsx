"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-config";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LiveClock } from "@/components/layout/live-clock";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) =>
    item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <MobileNav />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-sm font-semibold text-foreground">
          {current?.label ?? "Dashboard"}
        </h1>
        <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
          {current?.description}
        </p>
      </div>
      <LiveClock />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
