"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VolunteerGrid } from "@/components/volunteers/volunteer-grid";
import { VolunteerFormDialog } from "@/components/volunteers/volunteer-form-dialog";
import { MatchingPanel } from "@/components/volunteers/matching-panel";
import { useVolunteers } from "@/hooks/use-volunteers";

export default function VolunteersPage() {
  const { data: volunteers, isLoading } = useVolunteers();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Volunteer Management</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${volunteers?.length ?? 0} volunteer(s) registered`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Register volunteer
        </Button>
      </div>

      <VolunteerGrid volunteers={volunteers ?? []} />

      <MatchingPanel />

      <VolunteerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
