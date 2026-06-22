"use client";

import Link from "next/link";
import { ArrowRight, Flame, AlertTriangle, ClipboardList, Package, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { SeverityDistributionChart } from "@/components/dashboard/severity-distribution-chart";
import { ResourceUtilizationChart } from "@/components/dashboard/resource-utilization-chart";
import { VolunteerAllocationChart } from "@/components/dashboard/volunteer-allocation-chart";
import { RequestsTrendChart } from "@/components/dashboard/requests-trend-chart";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useDisasters } from "@/hooks/use-disasters";
import { useRequests } from "@/hooks/use-requests";
import { useResources } from "@/hooks/use-resources";
import { useVolunteers } from "@/hooks/use-volunteers";

function isWithinHours(iso: string, hours: number): boolean {
  return Date.now() - new Date(iso).getTime() <= hours * 60 * 60 * 1000;
}

export default function OverviewPage() {
  const { data: disasters, isLoading: loadingDisasters } = useDisasters();
  const { data: requests, isLoading: loadingRequests } = useRequests();
  const { data: resources, isLoading: loadingResources } = useResources();
  const { data: volunteers, isLoading: loadingVolunteers } = useVolunteers();

  const activeDisasters = disasters?.filter((d) => d.status === "active") ?? [];
  const criticalDisasters = disasters?.filter((d) => d.status === "active" && d.severity >= 8) ?? [];
  const openRequests = requests?.filter((r) => r.status !== "resolved") ?? [];
  const totalResourceUnits = resources?.reduce((sum, r) => sum + r.quantity_available, 0) ?? 0;
  const availableVolunteers = volunteers?.filter((v) => v.is_available) ?? [];

  const newDisasters24h = disasters?.filter((d) => isWithinHours(d.created_at, 24)).length ?? 0;
  const newRequests24h = requests?.filter((r) => isWithinHours(r.created_at, 24)).length ?? 0;

  const topCritical = [...activeDisasters].sort((a, b) => b.severity - a.severity).slice(0, 5);
  const topPriorityRequests = [...openRequests]
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Operational Overview</h2>
        <p className="text-sm text-muted-foreground">
          Live situational summary across all active disasters, requests, resources, and personnel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Active Disasters"
          value={activeDisasters.length}
          icon={Flame}
          accent="warning"
          loading={loadingDisasters}
          trend={newDisasters24h > 0 ? { direction: "up", label: `+${newDisasters24h} in 24h` } : undefined}
        />
        <StatCard
          label="Critical Disasters"
          value={criticalDisasters.length}
          icon={AlertTriangle}
          accent="critical"
          loading={loadingDisasters}
        />
        <StatCard
          label="Open Requests"
          value={openRequests.length}
          icon={ClipboardList}
          accent="signal"
          loading={loadingRequests}
          trend={newRequests24h > 0 ? { direction: "up", label: `+${newRequests24h} in 24h` } : undefined}
        />
        <StatCard
          label="Resources Available"
          value={totalResourceUnits.toLocaleString("en-IN")}
          suffix="units"
          icon={Package}
          accent="success"
          loading={loadingResources}
        />
        <StatCard
          label="Volunteers Available"
          value={availableVolunteers.length}
          suffix={`/ ${volunteers?.length ?? 0}`}
          icon={Users}
          accent="signal"
          loading={loadingVolunteers}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SeverityDistributionChart disasters={disasters} loading={loadingDisasters} />
        <RequestsTrendChart requests={requests} loading={loadingRequests} />
        <ResourceUtilizationChart resources={resources} loading={loadingResources} />
        <VolunteerAllocationChart volunteers={volunteers} loading={loadingVolunteers} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Critical Disasters</CardTitle>
              <CardDescription>Active events at severity 8 and above</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/disasters">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {topCritical.length === 0 ? (
              <EmptyState
                icon={Flame}
                title="No critical disasters"
                description="Nothing at severity 8+ is currently active. The situation is stable."
              />
            ) : (
              <div className="divide-y divide-border">
                {topCritical.map((d) => (
                  <Link
                    key={d.id}
                    href="/dashboard/disasters"
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.city}</p>
                    </div>
                    <SeverityIndicator severity={d.severity} showLabel={false} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Highest Priority Requests</CardTitle>
              <CardDescription>Open requests ranked by computed priority score</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/requests">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {topPriorityRequests.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No open requests"
                description="Every emergency request has been resolved."
              />
            ) : (
              <div className="divide-y divide-border">
                {topPriorityRequests.map((r) => (
                  <Link
                    key={r.id}
                    href="/dashboard/requests"
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{r.requester_name}</p>
                      <p className="text-xs text-muted-foreground">{r.location}, {r.city}</p>
                    </div>
                    <PriorityBadge score={r.priority_score} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
