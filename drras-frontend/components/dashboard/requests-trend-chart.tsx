"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/dashboard/chart-card";
import { CHART_COLORS, chartTooltipStyle } from "@/lib/chart-theme";
import type { EmergencyRequest } from "@/lib/types";

function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function RequestsTrendChart({
  requests,
  loading,
}: {
  requests: EmergencyRequest[] | undefined;
  loading: boolean;
}) {
  const byDay = new Map<string, { date: string; pending: number; in_progress: number; resolved: number }>();

  for (const r of requests ?? []) {
    const key = dayKey(r.created_at);
    if (!byDay.has(key)) {
      byDay.set(key, { date: key, pending: 0, in_progress: 0, resolved: 0 });
    }
    byDay.get(key)![r.status] += 1;
  }

  const data = Array.from(byDay.values());

  return (
    <ChartCard
      title="Emergency Requests Trend"
      description="Requests raised per day, broken down by current status"
      icon={TrendingUp}
      loading={loading}
      isEmpty={data.length === 0}
      emptyLabel="No emergency requests recorded yet"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.critical} stopOpacity={0.5} />
              <stop offset="95%" stopColor={CHART_COLORS.critical} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.5} />
              <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.5} />
              <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="date"
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
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="pending"
            name="Pending"
            stackId="1"
            stroke={CHART_COLORS.critical}
            fill="url(#fillPending)"
          />
          <Area
            type="monotone"
            dataKey="in_progress"
            name="In Progress"
            stackId="1"
            stroke={CHART_COLORS.warning}
            fill="url(#fillProgress)"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            name="Resolved"
            stackId="1"
            stroke={CHART_COLORS.success}
            fill="url(#fillResolved)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
