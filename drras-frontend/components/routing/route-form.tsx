"use client";

import { Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KNOWN_CITIES, cityLabel } from "@/lib/city-coordinates";
import type { RoutingAlgorithm } from "@/hooks/use-routing";

export function RouteForm({
  source,
  destination,
  algorithm,
  onSourceChange,
  onDestinationChange,
  onAlgorithmChange,
  onSubmit,
  loading,
}: {
  source: string;
  destination: string;
  algorithm: RoutingAlgorithm;
  onSourceChange: (city: string) => void;
  onDestinationChange: (city: string) => void;
  onAlgorithmChange: (algorithm: RoutingAlgorithm) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <Tabs value={algorithm} onValueChange={(v) => onAlgorithmChange(v as RoutingAlgorithm)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shortest">Shortest</TabsTrigger>
          <TabsTrigger value="safest">Safest</TabsTrigger>
          <TabsTrigger value="astar">A*</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="source">Source city</Label>
          <Select value={source} onValueChange={onSourceChange}>
            <SelectTrigger id="source">
              <SelectValue placeholder="Select source..." />
            </SelectTrigger>
            <SelectContent>
              {KNOWN_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {cityLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination">Destination city</Label>
          <Select value={destination} onValueChange={onDestinationChange}>
            <SelectTrigger id="destination">
              <SelectValue placeholder="Select destination..." />
            </SelectTrigger>
            <SelectContent>
              {KNOWN_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {cityLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading || !source || !destination || source === destination}
        className="w-full gap-1.5"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        Compute route
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {algorithm === "shortest" && "Dijkstra's algorithm — minimizes raw distance, ignoring traffic."}
        {algorithm === "safest" &&
          "Dijkstra variant — also penalizes high-traffic roads, trading distance for safety."}
        {algorithm === "astar" &&
          "A* search — guided by a haversine heuristic toward the destination, typically exploring fewer nodes than Dijkstra."}
      </p>
    </div>
  );
}
