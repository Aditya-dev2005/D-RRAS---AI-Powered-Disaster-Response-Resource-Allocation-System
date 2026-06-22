import Link from "next/link";
import { Radar } from "lucide-react";

export function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand / mission panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-[radial-gradient(ellipse_at_top_left,_hsl(220_100%_65%/0.12),_transparent_60%)] p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-signal/15 ring-1 ring-inset ring-signal/30">
            <Radar className="h-5 w-5 text-signal" />
          </div>
          <span className="font-display text-sm font-semibold tracking-[0.2em] text-foreground">
            D-RRAS
          </span>
        </div>

        <div className="relative max-w-md space-y-5">
          <p className="data-mono text-xs uppercase tracking-[0.25em] text-signal">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-foreground text-balance">
            Coordinate disaster response from one command center.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Route optimization, resource allocation, and volunteer dispatch —
            backed by graph search, constrained DP, and live AI situational
            intelligence.
          </p>
          <div className="flex items-center gap-6 pt-2">
            {[
              ["Dijkstra · A*", "Routing"],
              ["0/1 Knapsack", "Allocation"],
              ["Greedy Match", "Dispatch"],
            ].map(([label, sub]) => (
              <div key={label} className="space-y-0.5">
                <p className="data-mono text-xs text-foreground">{label}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-muted-foreground">
          D-RRAS Operations Platform — built by Aditya Chaturvedi
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-col items-center justify-center bg-background p-6 sm:p-10">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal/15 ring-1 ring-inset ring-signal/30">
            <Radar className="h-4 w-4 text-signal" />
          </div>
          <span className="font-display text-sm font-semibold tracking-[0.2em]">D-RRAS</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          <Link href="https://github.com/Aditya-dev2005" className="hover:text-foreground" target="_blank">
            github.com/Aditya-dev2005
          </Link>
        </p>
      </div>
    </div>
  );
}
