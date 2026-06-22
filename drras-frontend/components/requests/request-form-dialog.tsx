"use client";

import { useState } from "react";
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
import { useCreateRequest } from "@/hooks/use-requests";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Disaster } from "@/lib/types";

const EMPTY_FORM = {
  disaster_id: "",
  requester_name: "",
  phone: "",
  city: "",
  location: "",
  population_affected: 0,
  food_needed: 0,
  water_needed: 0,
  medicine_needed: 0,
  ambulances_needed: 0,
  comments: "",
};

export function RequestFormDialog({
  open,
  onOpenChange,
  disasters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disasters: Disaster[];
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const createRequest = useCreateRequest();

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.disaster_id) {
      toast.error("Select which disaster this request belongs to.");
      return;
    }

    createRequest.mutate(
      { ...form, disaster_id: Number(form.disaster_id), comments: form.comments || undefined },
      {
        onSuccess: () => {
          toast.success("Emergency request raised");
          setForm(EMPTY_FORM);
          onOpenChange(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise an emergency request</DialogTitle>
          <DialogDescription>
            Priority is computed automatically from the linked disaster&apos;s severity and the
            population affected.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="disaster">Disaster</Label>
            <Select value={form.disaster_id} onValueChange={(v) => update("disaster_id", v)}>
              <SelectTrigger id="disaster">
                <SelectValue placeholder="Select a disaster..." />
              </SelectTrigger>
              <SelectContent>
                {disasters.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name} ({d.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="requester_name">Requester name</Label>
              <Input
                id="requester_name"
                value={form.requester_name}
                onChange={(e) => update("requester_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                minLength={10}
                maxLength={15}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Exact location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Sector 62, Block C"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="population">Population affected</Label>
            <Input
              id="population"
              type="number"
              min={0}
              value={form.population_affected}
              onChange={(e) => update("population_affected", Number(e.target.value))}
            />
          </div>

          <div>
            <Label className="mb-2 block">Resources needed</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["food_needed", "Food (units)"],
                  ["water_needed", "Water (L)"],
                  ["medicine_needed", "Medicine"],
                  ["ambulances_needed", "Ambulances"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key} className="text-[11px] text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(e) => update(key, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={form.comments}
              onChange={(e) => update("comments", e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
