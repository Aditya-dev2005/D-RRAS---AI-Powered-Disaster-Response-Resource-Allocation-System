"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calculator, Loader2, PackageCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOptimizeAllocation } from "@/hooks/use-allocation";
import { getApiErrorMessage } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";
import type { ResourceType } from "@/lib/types";

const TYPES: ResourceType[] = ["food", "water", "medicine", "ambulance"];

export function AllocationPanel() {
  const [resourceType, setResourceType] = useState<ResourceType>("medicine");
  const [capacity, setCapacity] = useState(100);
  const optimize = useOptimizeAllocation();

  function handleRun() {
    optimize.mutate(
      { resource_type: resourceType, capacity },
      { onError: (error) => toast.error(getApiErrorMessage(error)) }
    );
  }

  const result = optimize.data;
  const utilization = result ? Math.round((result.capacity_used / result.total_capacity) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-signal" /> Resource Allocation Optimizer
        </CardTitle>
        <CardDescription>
          0/1 knapsack DP — picks which pending requests to fully serve with a limited supply, maximizing
          total priority value covered.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="resource-type">Resource type</Label>
            <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
              <SelectTrigger id="resource-type" className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {titleCase(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Available capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="sm:w-32"
            />
          </div>
          <Button onClick={handleRun} disabled={optimize.isPending} className="gap-1.5">
            {optimize.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackageCheck className="h-4 w-4" />
            )}
            Run optimization
          </Button>
        </div>

        {result && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Capacity used</p>
                <p className="data-mono text-lg font-semibold text-foreground">
                  {result.capacity_used} / {result.total_capacity}
                </p>
                <Progress value={utilization} className="mt-1.5 h-1.5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Requests served</p>
                <p className="data-mono text-lg font-semibold text-success">{result.allocations.length}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Priority value served</p>
                <p className="data-mono text-lg font-semibold text-signal">
                  {result.total_priority_value_served}
                </p>
              </div>
            </div>

            {result.allocations.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Quantity allocated</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.allocations.map((a) => (
                      <TableRow key={a.request_id}>
                        <TableCell className="data-mono text-xs">#{a.request_id}</TableCell>
                        <TableCell>{a.city}</TableCell>
                        <TableCell className="data-mono">{a.quantity_allocated}</TableCell>
                        <TableCell>
                          <Badge variant={a.priority_score >= 80 ? "critical" : "warning"}>
                            {a.priority_score}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {result.unserved_request_ids.length > 0 && (
              <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                Capacity exhausted — request{result.unserved_request_ids.length > 1 ? "s" : ""}{" "}
                {result.unserved_request_ids.map((id) => `#${id}`).join(", ")} could not be served with
                the available {capacity} units.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
