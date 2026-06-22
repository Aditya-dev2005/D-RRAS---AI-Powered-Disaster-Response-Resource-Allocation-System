"use client";

import { toast } from "sonner";
import { Car, LifeBuoy, Stethoscope, Wrench, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import { useUpdateVolunteerAvailability } from "@/hooks/use-volunteers";
import { getApiErrorMessage } from "@/lib/api-client";
import type { SkillType, Volunteer } from "@/lib/types";

const SKILL_META: Record<SkillType, { label: string; icon: LucideIcon; accent: string }> = {
  doctor: { label: "Doctors", icon: Stethoscope, accent: "text-critical" },
  driver: { label: "Drivers", icon: Car, accent: "text-signal" },
  engineer: { label: "Engineers", icon: Wrench, accent: "text-violet-400" },
  rescue_worker: { label: "Rescue Workers", icon: LifeBuoy, accent: "text-warning" },
};

const SKILLS: SkillType[] = ["doctor", "driver", "engineer", "rescue_worker"];

function VolunteerListItem({ volunteer }: { volunteer: Volunteer }) {
  const updateAvailability = useUpdateVolunteerAvailability();

  function handleToggle(checked: boolean) {
    updateAvailability.mutate(
      { id: volunteer.id, is_available: checked },
      {
        onSuccess: () =>
          toast.success(`${volunteer.name} marked ${checked ? "available" : "unavailable"}`),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{volunteer.name}</p>
        <p className="truncate text-xs text-muted-foreground">{volunteer.city}</p>
      </div>
      <Switch checked={volunteer.is_available} onCheckedChange={handleToggle} />
    </div>
  );
}

export function VolunteerGrid({ volunteers }: { volunteers: Volunteer[] }) {
  if (volunteers.length === 0) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No volunteers registered"
        description="Register doctors, drivers, engineers, and rescue workers to enable greedy matching against open requests."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {SKILLS.map((skill) => {
        const meta = SKILL_META[skill];
        const Icon = meta.icon;
        const items = volunteers.filter((v) => v.skill_type === skill);
        const available = items.filter((v) => v.is_available).length;

        return (
          <Card key={skill}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{meta.label}</CardTitle>
                <CardDescription>
                  {available} of {items.length} available
                </CardDescription>
              </div>
              <Icon className={`h-5 w-5 ${meta.accent}`} />
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">No {meta.label.toLowerCase()} registered.</p>
              ) : (
                <div className="divide-y divide-border">
                  {items.map((v) => (
                    <VolunteerListItem key={v.id} volunteer={v} />
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
