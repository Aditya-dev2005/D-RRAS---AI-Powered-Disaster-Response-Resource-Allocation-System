"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Flame, MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { DisasterStatusBadge } from "@/components/shared/disaster-status-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { EmptyState } from "@/components/shared/empty-state";
import { DisasterTimeline } from "@/components/disasters/disaster-timeline";
import { useDeleteDisaster } from "@/hooks/use-disasters";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatRelativeTime, titleCase } from "@/lib/utils";
import type { Disaster } from "@/lib/types";

export function DisasterTable({
  disasters,
  isAdmin,
  onEdit,
}: {
  disasters: Disaster[];
  isAdmin: boolean;
  onEdit: (disaster: Disaster) => void;
}) {
  const [viewing, setViewing] = useState<Disaster | null>(null);
  const deleteDisaster = useDeleteDisaster();

  function handleDelete(disaster: Disaster) {
    if (!confirm(`Delete "${disaster.name}"? This also removes its linked emergency requests.`)) return;
    deleteDisaster.mutate(disaster.id, {
      onSuccess: () => toast.success(`"${disaster.name}" deleted`),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  if (disasters.length === 0) {
    return (
      <EmptyState
        icon={Flame}
        title="No disasters logged"
        description="Once a disaster is created, it will appear here with live severity and status tracking."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              {isAdmin && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {disasters.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer"
                onClick={() => setViewing(d)}
              >
                <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                <TableCell className="text-muted-foreground">{titleCase(d.type)}</TableCell>
                <TableCell>
                  <SeverityIndicator severity={d.severity} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {d.city}
                  </span>
                </TableCell>
                <TableCell>
                  <DisasterStatusBadge status={d.status} />
                </TableCell>
                <TableCell className="data-mono text-xs text-muted-foreground">
                  {formatRelativeTime(d.created_at)}
                </TableCell>
                {isAdmin && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(d)} className="gap-2">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(d)}
                          className="gap-2 text-critical focus:text-critical"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.name}</SheetTitle>
                <SheetDescription>
                  {titleCase(viewing.type)} · {viewing.city}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 flex items-center gap-3">
                <DisasterStatusBadge status={viewing.status} />
                <SeverityIndicator severity={viewing.severity} />
              </div>

              {viewing.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {viewing.description}
                </p>
              )}

              <Separator className="my-5" />

              <h4 className="mb-4 font-display text-sm font-medium text-foreground">Timeline</h4>
              <DisasterTimeline disaster={viewing} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
