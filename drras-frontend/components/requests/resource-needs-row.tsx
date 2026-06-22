import { Ambulance, Droplet, Pill, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmergencyRequest } from "@/lib/types";

function Stat({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  if (value <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-muted-foreground"
      title={`${value} ${label} requested`}
    >
      <Icon className="h-3 w-3" />
      <span className="data-mono">{value}</span>
    </span>
  );
}

export function ResourceNeedsRow({ request, className }: { request: EmergencyRequest; className?: string }) {
  const allZero =
    request.food_needed === 0 &&
    request.water_needed === 0 &&
    request.medicine_needed === 0 &&
    request.ambulances_needed === 0;

  if (allZero) {
    return <span className="text-xs text-muted-foreground">None specified</span>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Stat icon={Utensils} value={request.food_needed} label="food units" />
      <Stat icon={Droplet} value={request.water_needed} label="liters water" />
      <Stat icon={Pill} value={request.medicine_needed} label="medicine kits" />
      <Stat icon={Ambulance} value={request.ambulances_needed} label="ambulances" />
    </div>
  );
}
