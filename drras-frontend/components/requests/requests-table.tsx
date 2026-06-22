"use client";

import { toast } from "sonner";
import { ClipboardList, MoreHorizontal, Trash2 } from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { ResourceNeedsRow } from "@/components/requests/resource-needs-row";
import { EmptyState } from "@/components/shared/empty-state";
import { useDeleteRequest, useUpdateRequestStatus } from "@/hooks/use-requests";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import type { EmergencyRequest, RequestStatus } from "@/lib/types";

const STATUSES: RequestStatus[] = ["pending", "in_progress", "resolved"];

export function RequestsTable({
  requests,
  isAdmin,
}: {
  requests: EmergencyRequest[];
  isAdmin: boolean;
}) {
  const updateStatus = useUpdateRequestStatus();
  const deleteRequest = useDeleteRequest();

  function handleStatusChange(request: EmergencyRequest, status: RequestStatus) {
    if (status === request.status) return;
    updateStatus.mutate(
      { id: request.id, status },
      {
        onSuccess: () => toast.success(`Request #${request.id} marked ${status.replace("_", " ")}`),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  function handleDelete(request: EmergencyRequest) {
    if (!confirm(`Delete the request from ${request.requester_name}?`)) return;
    deleteRequest.mutate(request.id, {
      onSuccess: () => toast.success("Request deleted"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No matching requests"
        description="Try a different filter, or raise a new emergency request."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Priority</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Resources requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Raised</TableHead>
            {isAdmin && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <PriorityBadge score={r.priority_score} />
              </TableCell>
              <TableCell>
                <p className="font-medium text-foreground">{r.requester_name}</p>
                <p className="data-mono text-[11px] text-muted-foreground">{r.phone}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <p className="text-foreground">{r.location}</p>
                <p className="text-xs">{r.city}</p>
              </TableCell>
              <TableCell>
                <ResourceNeedsRow request={r} />
              </TableCell>
              <TableCell>
                {isAdmin ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button>
                        <RequestStatusBadge status={r.status} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Update status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {STATUSES.map((s) => (
                        <DropdownMenuItem key={s} onClick={() => handleStatusChange(r, s)}>
                          <RequestStatusBadge status={s} />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <RequestStatusBadge status={r.status} />
                )}
              </TableCell>
              <TableCell className="data-mono text-xs text-muted-foreground">
                {formatRelativeTime(r.created_at)}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDelete(r)}
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
  );
}
