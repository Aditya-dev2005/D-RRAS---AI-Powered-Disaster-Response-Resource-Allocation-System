import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/shared/status-dot";
import type { DisasterStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const STYLES: Record<DisasterStatus, { variant: "critical" | "warning" | "success"; dot: string }> = {
  active: { variant: "critical", dot: "bg-critical" },
  contained: { variant: "warning", dot: "bg-warning" },
  resolved: { variant: "success", dot: "bg-success" },
};

export function DisasterStatusBadge({ status }: { status: DisasterStatus }) {
  const style = STYLES[status];
  return (
    <Badge variant={style.variant}>
      <StatusDot className={style.dot} pulse={status === "active"} />
      {titleCase(status)}
    </Badge>
  );
}
