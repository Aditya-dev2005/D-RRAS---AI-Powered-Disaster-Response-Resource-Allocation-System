import { cn } from "@/lib/utils";

function severityTier(severity: number): { label: string; color: string } {
  if (severity >= 8) return { label: "Critical", color: "bg-critical" };
  if (severity >= 5) return { label: "High", color: "bg-warning" };
  return { label: "Moderate", color: "bg-signal" };
}

export function SeverityIndicator({
  severity,
  showLabel = true,
}: {
  severity: number;
  showLabel?: boolean;
}) {
  const tier = severityTier(severity);
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-3 items-end gap-px" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-1 rounded-sm bg-muted",
              i < severity && tier.color
            )}
            style={{ height: `${30 + i * 7}%` }}
          />
        ))}
      </div>
      <span className="data-mono text-xs font-medium text-foreground">{severity}/10</span>
      {showLabel && <span className="text-xs text-muted-foreground">{tier.label}</span>}
    </div>
  );
}
