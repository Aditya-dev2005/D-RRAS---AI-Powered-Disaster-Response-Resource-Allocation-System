import { Badge } from "@/components/ui/badge";
import { Stethoscope, Car, Wrench, LifeBuoy } from "lucide-react";
import type { SkillType } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const ICONS: Record<SkillType, React.ElementType> = {
  doctor: Stethoscope,
  driver: Car,
  engineer: Wrench,
  rescue_worker: LifeBuoy,
};

export function SkillBadge({ skill }: { skill: SkillType }) {
  const Icon = ICONS[skill];
  return (
    <Badge variant="outline" className="gap-1.5">
      <Icon className="h-3 w-3" />
      {titleCase(skill)}
    </Badge>
  );
}
