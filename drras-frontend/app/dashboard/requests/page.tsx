"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequestsTable } from "@/components/requests/requests-table";
import { RequestFormDialog } from "@/components/requests/request-form-dialog";
import { RequestFilters, type RequestFilter } from "@/components/requests/request-filters";
import { useRequests } from "@/hooks/use-requests";
import { useDisasters } from "@/hooks/use-disasters";
import { useAuthStore } from "@/store/auth-store";

export default function RequestsPage() {
  const { data: requests, isLoading } = useRequests();
  const { data: disasters } = useDisasters();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const counts = useMemo<Record<RequestFilter, number>>(() => {
    const all = requests ?? [];
    return {
      all: all.length,
      high_priority: all.filter((r) => r.priority_score >= 80).length,
      pending: all.filter((r) => r.status === "pending").length,
      resolved: all.filter((r) => r.status === "resolved").length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    return (requests ?? [])
      .filter((r) => {
        if (filter === "high_priority") return r.priority_score >= 80;
        if (filter === "pending") return r.status === "pending";
        if (filter === "resolved") return r.status === "resolved";
        return true;
      })
      .filter(
        (r) =>
          r.requester_name.toLowerCase().includes(search.toLowerCase()) ||
          r.city.toLowerCase().includes(search.toLowerCase()) ||
          r.location.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.priority_score - a.priority_score);
  }, [requests, filter, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Emergency Requests</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${requests?.length ?? 0} request(s) on record, ranked by priority`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New request
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <RequestFilters value={filter} onChange={setFilter} counts={counts} />
        <div className="relative sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requester, city, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <RequestsTable requests={filtered} isAdmin={isAdmin} />

      <RequestFormDialog open={dialogOpen} onOpenChange={setDialogOpen} disasters={disasters ?? []} />
    </div>
  );
}
