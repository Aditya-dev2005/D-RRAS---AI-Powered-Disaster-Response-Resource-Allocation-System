import { Badge } from "@/components/ui/badge";

export function PriorityBadge({ score }: { score: number }) {
  const variant = score >= 80 ? "critical" : score >= 50 ? "warning" : "muted";
  const label = score >= 80 ? "P1" : score >= 50 ? "P2" : "P3";
  return (
    <Badge variant={variant} className="data-mono">
      {label} · {score}
    </Badge>
  );
}
