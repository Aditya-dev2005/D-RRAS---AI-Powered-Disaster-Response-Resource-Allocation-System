"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SKILL_COLORS, chartTooltipStyle } from "@/lib/chart-theme";
import { titleCase } from "@/lib/utils";
import type { SkillType, Volunteer } from "@/lib/types";

const SKILLS: SkillType[] = ["doctor", "driver", "engineer", "rescue_worker"];

export function VolunteerAllocationChart({
  volunteers,
  loading,
}: {
  volunteers: Volunteer[] | undefined;
  loading: boolean;
}) {
  const data = SKILLS.map((skill) => ({
    name: titleCase(skill),
    value: volunteers?.filter((v) => v.skill_type === skill).length ?? 0,
    raw: skill,
  })).filter((d) => d.value > 0);

  const available = volunteers?.filter((v) => v.is_available).length ?? 0;
  const total = volunteers?.length ?? 0;

  return (
    <ChartCard
      title="Volunteer Allocation"
      description={`${available} of ${total} registered volunteers currently available`}
      icon={Users}
      loading={loading}
      isEmpty={!volunteers || volunteers.length === 0}
      emptyLabel="No volunteers registered yet"
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={76}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.raw} fill={SKILL_COLORS[entry.raw]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value: number, name: string) => [`${value} volunteer(s)`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
