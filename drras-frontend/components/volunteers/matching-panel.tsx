"use client";

import { toast } from "sonner";
import { Loader2, Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRunMatching } from "@/hooks/use-matching";
import { getApiErrorMessage } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";

export function MatchingPanel() {
  const runMatching = useRunMatching();

  function handleRun() {
    runMatching.mutate(undefined, { onError: (error) => toast.error(getApiErrorMessage(error)) });
  }

  const result = runMatching.data;

  // Group assignments by request so each card shows the full response team.
  const grouped = result
    ? Object.values(
        result.assignments.reduce<Record<number, typeof result.assignments>>((acc, a) => {
          (acc[a.request_id] ??= []).push(a);
          return acc;
        }, {})
      )
    : [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-signal" /> Greedy Volunteer Matching
          </CardTitle>
          <CardDescription>
            Highest-priority open requests get first pick of available, same-city, skill-matched
            volunteers.
          </CardDescription>
        </div>
        <Button onClick={handleRun} disabled={runMatching.isPending} className="gap-1.5 shrink-0">
          {runMatching.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users2 className="h-4 w-4" />}
          Run matching
        </Button>
      </CardHeader>

      {result && (
        <CardContent className="space-y-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              <span className="data-mono font-semibold text-success">{result.total_assignments}</span>{" "}
              assignment(s) made
            </span>
            {result.unmatched_request_ids.length > 0 && (
              <span className="text-muted-foreground">
                <span className="data-mono font-semibold text-warning">
                  {result.unmatched_request_ids.length}
                </span>{" "}
                request(s) unmatched
              </span>
            )}
          </div>

          {grouped.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No available volunteers matched any open request&apos;s city/skill requirements.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {grouped.map((assignments) => (
                <div key={assignments[0].request_id} className="rounded-md border border-border p-3">
                  <p className="mb-2 text-xs font-medium text-foreground">
                    Request #{assignments[0].request_id} · {assignments[0].city}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignments.map((a) => (
                      <Badge key={a.volunteer_id} variant="outline">
                        {titleCase(a.skill_type)}: {a.volunteer_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.unmatched_request_ids.length > 0 && (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
              No matching volunteer found for request
              {result.unmatched_request_ids.length > 1 ? "s" : ""}{" "}
              {result.unmatched_request_ids.map((id) => `#${id}`).join(", ")} — register more
              volunteers in the affected cities.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
