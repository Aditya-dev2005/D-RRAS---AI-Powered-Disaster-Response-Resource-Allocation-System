"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDisaster, useUpdateDisaster } from "@/hooks/use-disasters";
import { getApiErrorMessage } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";
import type { Disaster, DisasterStatus, DisasterType } from "@/lib/types";

const DISASTER_TYPES: DisasterType[] = [
  "flood",
  "earthquake",
  "fire",
  "hurricane",
  "tornado",
  "tsunami",
  "other",
];
const DISASTER_STATUSES: DisasterStatus[] = ["active", "contained", "resolved"];

const EMPTY_FORM = {
  name: "",
  type: "flood" as DisasterType,
  severity: 5,
  city: "",
  description: "",
  status: "active" as DisasterStatus,
};

export function DisasterFormDialog({
  open,
  onOpenChange,
  disaster,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disaster?: Disaster | null;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(disaster);
  const createDisaster = useCreateDisaster();
  const updateDisaster = useUpdateDisaster();
  const pending = createDisaster.isPending || updateDisaster.isPending;

  useEffect(() => {
    if (disaster) {
      setForm({
        name: disaster.name,
        type: disaster.type,
        severity: disaster.severity,
        city: disaster.city,
        description: disaster.description ?? "",
        status: disaster.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [disaster, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit && disaster) {
      updateDisaster.mutate(
        { id: disaster.id, input: form },
        {
          onSuccess: () => {
            toast.success(`"${form.name}" updated`);
            onOpenChange(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    } else {
      createDisaster.mutate(
        {
          name: form.name,
          type: form.type,
          severity: form.severity,
          city: form.city,
          description: form.description || undefined,
        },
        {
          onSuccess: () => {
            toast.success(`"${form.name}" logged as a new disaster`);
            onOpenChange(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit disaster" : "Log a new disaster"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update severity, status, or details as the situation develops."
              : "Create a new disaster event. Emergency requests can be raised against it once saved."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Yamuna Floodplain Inundation"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as DisasterType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISASTER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {titleCase(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="severity">Severity (1–10)</Label>
              <Input
                id="severity"
                type="number"
                min={1}
                max={10}
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Noida"
                required
              />
            </div>
            {isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as DisasterStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISASTER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {titleCase(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief operational context for responders..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create disaster"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
