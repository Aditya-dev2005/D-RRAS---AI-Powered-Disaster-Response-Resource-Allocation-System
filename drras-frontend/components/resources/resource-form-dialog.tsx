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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateResource } from "@/hooks/use-resources";
import { getApiErrorMessage } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";
import type { ResourceType } from "@/lib/types";

const TYPES: ResourceType[] = ["food", "water", "medicine", "ambulance"];
const DEFAULT_UNITS: Record<ResourceType, string> = {
  food: "meal packets",
  water: "liters",
  medicine: "kits",
  ambulance: "vehicles",
};

export function ResourceFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    type: "food" as ResourceType,
    city: "",
    quantity_available: 0,
    unit: DEFAULT_UNITS.food,
  });
  const createResource = useCreateResource();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createResource.mutate(form, {
      onSuccess: () => {
        toast.success(`${titleCase(form.type)} stock added for ${form.city}`);
        onOpenChange(false);
        setForm({ type: "food", city: "", quantity_available: 0, unit: DEFAULT_UNITS.food });
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add resource stock</DialogTitle>
          <DialogDescription>Register a new stock entry for a city.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="type">Resource type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm({ ...form, type: v as ResourceType, unit: DEFAULT_UNITS[v as ResourceType] })
              }
            >
              <SelectTrigger id="type">
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
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={form.quantity_available}
                onChange={(e) => setForm({ ...form, quantity_available: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createResource.isPending}>
              {createResource.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
