"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Navigation, RouteOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteForm } from "@/components/routing/route-form";
import { useComputeRoute, type RoutingAlgorithm } from "@/hooks/use-routing";
import { useRoadBlocks, useToggleRoadBlock } from "@/hooks/use-roadblocks";
import { getApiErrorMessage } from "@/lib/api-client";
import { cityLabel } from "@/lib/city-coordinates";
import { Switch } from "@/components/ui/switch";

const RouteMap = dynamic(() => import("@/components/routing/route-map"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-md bg-muted" /> });

export default function RoutingPage() {
  const [source, setSource] = useState("noida");
  const [destination, setDestination] = useState("chennai");
  const [algorithm, setAlgorithm] = useState<RoutingAlgorithm>("shortest");

  const { data: roadBlocks } = useRoadBlocks();
  const computeRoute = useComputeRoute();
  const toggleBlock = useToggleRoadBlock();

  function handleCompute() {
    computeRoute.mutate({ algorithm, source, destination }, {
      onError: (e) => toast.error(getApiErrorMessage(e)),
    });
  }

  function handleToggleBlock(id: number, isBlocked: boolean) {
    toggleBlock.mutate({ id, block: !isBlocked }, {
      onSuccess: () => toast.success(isBlocked ? "Road unblocked — rerouting available" : "Road blocked — algorithm will reroute"),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    });
  }

  const route = computeRoute.data ?? null;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      {/* Sidebar controls */}
      <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-signal" /> Route Planner
            </CardTitle>
            <CardDescription>Compute the optimal path between two cities in the disaster-response network.</CardDescription>
          </CardHeader>
          <CardContent>
            <RouteForm source={source} destination={destination} algorithm={algorithm}
              onSourceChange={setSource} onDestinationChange={setDestination}
              onAlgorithmChange={setAlgorithm} onSubmit={handleCompute}
              loading={computeRoute.isPending} />
          </CardContent>
        </Card>

        {route && (
          <Card className="border-signal/30 bg-signal/5">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" /> Route computed
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                {route.path.map((city, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">{cityLabel(city)}</span>
                    {i < route.path.length - 1 && <span className="text-muted-foreground">→</span>}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="data-mono font-semibold text-foreground">{route.total_distance_km} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nodes explored</p>
                  <p className="data-mono font-semibold text-foreground">{route.nodes_explored}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Algorithm</p>
                  <Badge variant="signal" className="mt-0.5 text-[10px]">{route.algorithm}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="flex-1 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <RouteOff className="h-4 w-4 text-critical" /> Road Network
            </CardTitle>
            <CardDescription>Toggle blocks live — map and routing update instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {(roadBlocks ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-md p-1.5 hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">
                    {cityLabel(r.city_from)} ↔ {cityLabel(r.city_to)}
                  </p>
                  <p className="data-mono text-[10px] text-muted-foreground">
                    {r.distance_km} km · traffic {r.traffic_level}/10
                    {r.is_blocked && <span className="ml-1 text-critical">· BLOCKED</span>}
                  </p>
                </div>
                <Switch checked={r.is_blocked} onCheckedChange={() => handleToggleBlock(r.id, r.is_blocked)}
                  className="data-[state=checked]:bg-critical data-[state=unchecked]:bg-muted shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Map fills remaining space */}
      <Card className="min-h-[400px] flex-1 overflow-hidden p-0">
        <div className="h-full w-full">
          <RouteMap roadBlocks={roadBlocks ?? []} route={route} source={source} destination={destination} />
        </div>
      </Card>
    </div>
  );
}
