"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisasterTable } from "@/components/disasters/disaster-table";
import { DisasterFormDialog } from "@/components/disasters/disaster-form-dialog";
import { useDisasters } from "@/hooks/use-disasters";
import { useAuthStore } from "@/store/auth-store";
import type { Disaster, DisasterStatus } from "@/lib/types";

export default function DisastersPage() {
  const { data: disasters, isLoading } = useDisasters();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisasterStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Disaster | null>(null);

  const filtered = useMemo(() => {
    return (disasters ?? [])
      .filter((d) => statusFilter === "all" || d.status === statusFilter)
      .filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.city.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.severity - a.severity);
  }, [disasters, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(disaster: Disaster) {
    setEditing(disaster);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Disaster Management</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${disasters?.length ?? 0} disaster event(s) on record`}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> New disaster
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DisasterStatus | "all")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="contained">Contained</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DisasterTable disasters={filtered} isAdmin={isAdmin} onEdit={openEdit} />

      <DisasterFormDialog open={dialogOpen} onOpenChange={setDialogOpen} disaster={editing} />
    </div>
  );
}
