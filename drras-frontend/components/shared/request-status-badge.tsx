import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const STYLES: Record<RequestStatus, "critical" | "warning" | "success"> = {
  pending: "critical",
  in_progress: "warning",
  resolved: "success",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={STYLES[status]}>{titleCase(status)}</Badge>;
}
