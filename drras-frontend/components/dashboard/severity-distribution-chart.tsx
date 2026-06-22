"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { ChartCard } from "@/components/dashboard/chart-card";
import { CHART_COLORS, SEVERITY_TIER_COLOR, chartTooltipStyle } from "@/lib/chart-theme";
import type { Disaster } from "@/lib/types";

export function SeverityDistributionChart({
  disasters,
  loading,
}: {
  disasters: Disaster[] | undefined;
  loading: boolean;
}) {
  const data = Array.from({ length: 10 }, (_, i) => i + 1).map((severity) => ({
    severity: `S${severity}`,
    count: disasters?.filter((d) => d.severity === severity).length ?? 0,
    raw: severity,
  }));

  return (
    <ChartCard
      title="Disaster Severity Distribution"
      description="Active & historical events by severity level (1–10)"
      icon={AlertTriangle}
      loading={loading}
      isEmpty={!disasters || disasters.length === 0}
      emptyLabel="No disasters recorded yet"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="severity"
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            axisLine={{ stroke: CHART_COLORS.grid }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(222 20% 18% / 0.4)" }}
            contentStyle={chartTooltipStyle}
            labelFormatter={(label) => `Severity ${label}`}
            formatter={(value: number) => [`${value} event(s)`, "Count"]}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell key={entry.severity} fill={SEVERITY_TIER_COLOR(entry.raw)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
