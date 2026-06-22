import { Ambulance, Droplet, Pill, Utensils, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ResourceRow } from "@/components/resources/resource-row";
import type { Resource, ResourceType } from "@/lib/types";

const TYPE_META: Record<ResourceType, { label: string; icon: LucideIcon; accent: string }> = {
  food: { label: "Food", icon: Utensils, accent: "text-warning" },
  water: { label: "Water", icon: Droplet, accent: "text-signal" },
  medicine: { label: "Medicine", icon: Pill, accent: "text-critical" },
  ambulance: { label: "Ambulances", icon: Ambulance, accent: "text-violet-400" },
};

const TYPES: ResourceType[] = ["food", "water", "medicine", "ambulance"];

export function ResourceGrid({ resources, isAdmin }: { resources: Resource[]; isAdmin: boolean }) {
  if (resources.length === 0) {
    return (
      <EmptyState
        icon={Utensils}
        title="No resource stock recorded"
        description="Add stock entries for food, water, medicine, and ambulances per city to begin tracking availability."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {TYPES.map((type) => {
        const meta = TYPE_META[type];
        const Icon = meta.icon;
        const items = resources.filter((r) => r.type === type);
        const total = items.reduce((sum, r) => sum + r.quantity_available, 0);

        return (
          <Card key={type}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{meta.label}</CardTitle>
                <CardDescription>
                  {total.toLocaleString("en-IN")} total {items[0]?.unit ?? "units"}
                </CardDescription>
              </div>
              <Icon className={`h-5 w-5 ${meta.accent}`} />
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">No stock recorded for this resource.</p>
              ) : (
                <div className="divide-y divide-border">
                  {items.map((r) => (
                    <ResourceRow key={r.id} resource={r} isAdmin={isAdmin} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
