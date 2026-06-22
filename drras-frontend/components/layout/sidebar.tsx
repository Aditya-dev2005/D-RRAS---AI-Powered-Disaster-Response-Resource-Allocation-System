import { Radar } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal/15 ring-1 ring-inset ring-signal/30">
          <Radar className="h-4 w-4 text-signal" />
        </div>
        <div className="leading-none">
          <p className="font-display text-[13px] font-semibold tracking-[0.18em]">D-RRAS</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ops Platform</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <NavLinks />
      </div>

      <div className="border-t border-border p-3">
        <div className="rounded-md border border-border bg-surface p-2.5 text-[11px] text-muted-foreground">
          <p className="data-mono mb-1 text-foreground">v1.0.0 · production</p>
          <p>4 algorithmic engines online</p>
        </div>
      </div>
    </aside>
  );
}
