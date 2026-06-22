import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
  suffix,
  loading,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: "critical" | "warning" | "success" | "signal";
  trend?: { direction: "up" | "down"; label: string };
  suffix?: string;
  loading?: boolean;
}) {
  const accentClasses: Record<typeof accent, string> = {
    critical: "border-l-critical text-critical",
    warning: "border-l-warning text-warning",
    success: "border-l-success text-success",
    signal: "border-l-signal text-signal",
  };

  return (
    <Card className={cn("border-l-2 p-0", accentClasses[accent].split(" ")[0])}>
      <div className="flex items-start justify-between p-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <div className="h-7 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="data-mono font-display text-2xl font-semibold text-foreground">
              {value}
              {suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "flex items-center gap-1 text-[11px]",
                trend.direction === "up" ? "text-success" : "text-muted-foreground"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md bg-current/10",
            accentClasses[accent].split(" ")[1]
          )}
        >
          <Icon className={cn("h-4.5 w-4.5", accentClasses[accent].split(" ")[1])} />
        </div>
      </div>
    </Card>
  );
}
