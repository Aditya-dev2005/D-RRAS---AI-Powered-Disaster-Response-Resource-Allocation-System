"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
import { AllocationPanel } from "@/components/resources/allocation-panel";
import { useResources } from "@/hooks/use-resources";
import { useAuthStore } from "@/store/auth-store";

export default function ResourcesPage() {
  const { data: resources, isLoading } = useResources();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Resource Allocation</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${resources?.length ?? 0} stock record(s) across all cities`}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add stock
          </Button>
        )}
      </div>

      <ResourceGrid resources={resources ?? []} isAdmin={isAdmin} />

      <AllocationPanel />

      <ResourceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
