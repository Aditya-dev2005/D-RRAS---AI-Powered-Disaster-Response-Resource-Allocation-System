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
import { Package } from "lucide-react";
import { ChartCard } from "@/components/dashboard/chart-card";
import { RESOURCE_COLORS, CHART_COLORS, chartTooltipStyle } from "@/lib/chart-theme";
import { titleCase } from "@/lib/utils";
import type { Resource } from "@/lib/types";

const TYPES: Resource["type"][] = ["food", "water", "medicine", "ambulance"];

export function ResourceUtilizationChart({
  resources,
  loading,
}: {
  resources: Resource[] | undefined;
  loading: boolean;
}) {
  const data = TYPES.map((type) => ({
    type: titleCase(type),
    quantity: resources?.filter((r) => r.type === type).reduce((sum, r) => sum + r.quantity_available, 0) ?? 0,
    raw: type,
  }));

  return (
    <ChartCard
      title="Resource Stock Levels"
      description="Total units available across all cities, by resource type"
      icon={Package}
      loading={loading}
      isEmpty={!resources || resources.length === 0}
      emptyLabel="No resource stock recorded yet"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="type"
            width={70}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(222 20% 18% / 0.4)" }}
            contentStyle={chartTooltipStyle}
            formatter={(value: number) => [`${value} units`, "Available"]}
          />
          <Bar dataKey="quantity" radius={[0, 3, 3, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.type} fill={RESOURCE_COLORS[entry.raw]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
