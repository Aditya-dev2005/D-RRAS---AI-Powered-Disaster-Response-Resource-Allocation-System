"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useDisasters } from "@/hooks/use-disasters";
import { useRequests } from "@/hooks/use-requests";
import { useResources } from "@/hooks/use-resources";
import { useVolunteers } from "@/hooks/use-volunteers";
import { useRoadBlocks } from "@/hooks/use-roadblocks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DisasterStatusBadge } from "@/components/shared/disaster-status-badge";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SkillBadge } from "@/components/shared/skill-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame, Package, RouteOff, ShieldAlert, Users } from "lucide-react";
import { titleCase } from "@/lib/utils";

function Section({ title, icon: Icon, count, children }: {
  title: string; icon: React.ElementType; count: number; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </CardTitle>
        <Badge variant="muted" className="data-mono">{count}</Badge>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const { data: disasters } = useDisasters();
  const { data: requests } = useRequests();
  const { data: resources } = useResources();
  const { data: volunteers } = useVolunteers();
  const { data: roadBlocks } = useRoadBlocks();

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-critical/15 ring-1 ring-inset ring-critical/30">
          <ShieldAlert className="h-5 w-5 text-critical" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Admin Control Center</h2>
          <p className="text-sm text-muted-foreground">Consolidated read-only view of the full system state. Use module pages for write actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Disasters" icon={Flame} count={disasters?.length ?? 0}>
          {disasters?.length === 0 && <p className="text-xs text-muted-foreground">None on record.</p>}
          <div className="divide-y divide-border">
            {disasters?.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{titleCase(d.type)} · {d.city}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SeverityIndicator severity={d.severity} showLabel={false} />
                  <DisasterStatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Emergency Requests" icon={AlertTriangle} count={requests?.length ?? 0}>
          {requests?.length === 0 && <p className="text-xs text-muted-foreground">None on record.</p>}
          <div className="divide-y divide-border">
            {requests?.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{r.requester_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.location}, {r.city}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge score={r.priority_score} />
                  <RequestStatusBadge status={r.status} />
                </div>
              </div>
            ))}
            {(requests?.length ?? 0) > 10 && (
              <p className="pt-2 text-xs text-muted-foreground">+{(requests?.length ?? 0) - 10} more</p>
            )}
          </div>
        </Section>

        <Section title="Resource Stock" icon={Package} count={resources?.length ?? 0}>
          {resources?.length === 0 && <p className="text-xs text-muted-foreground">No stock recorded.</p>}
          <div className="divide-y divide-border">
            {resources?.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-foreground">{titleCase(r.type)} · {r.city}</p>
                </div>
                <span className="data-mono text-xs text-foreground">
                  {r.quantity_available.toLocaleString("en-IN")} {r.unit}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Volunteers" icon={Users} count={volunteers?.length ?? 0}>
          {volunteers?.length === 0 && <p className="text-xs text-muted-foreground">None registered.</p>}
          <div className="divide-y divide-border">
            {volunteers?.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.city}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SkillBadge skill={v.skill_type} />
                  <Badge variant={v.is_available ? "success" : "muted"}>
                    {v.is_available ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Road Network" icon={RouteOff} count={roadBlocks?.length ?? 0}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {roadBlocks?.map((r) => (
            <div key={r.id} className={`flex items-center justify-between rounded-md border px-3 py-2 ${r.is_blocked ? "border-critical/30 bg-critical/5" : "border-border bg-surface"}`}>
              <div>
                <p className="text-xs font-medium text-foreground">{titleCase(r.city_from)} ↔ {titleCase(r.city_to)}</p>
                <p className="data-mono text-[10px] text-muted-foreground">{r.distance_km} km · traffic {r.traffic_level}/10</p>
              </div>
              <Badge variant={r.is_blocked ? "critical" : "success"}>{r.is_blocked ? "Blocked" : "Open"}</Badge>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
