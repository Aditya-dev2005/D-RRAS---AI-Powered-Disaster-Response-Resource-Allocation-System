"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateResourceQuantity } from "@/hooks/use-resources";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Resource } from "@/lib/types";

export function ResourceRow({ resource, isAdmin }: { resource: Resource; isAdmin: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(resource.quantity_available);
  const updateQuantity = useUpdateResourceQuantity();

  function handleSave() {
    updateQuantity.mutate(
      { id: resource.id, quantity_available: value },
      {
        onSuccess: () => {
          toast.success(`${resource.city} stock updated to ${value} ${resource.unit}`);
          setEditing(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="text-sm text-foreground">{resource.city}</span>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-7 w-24 text-xs"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={updateQuantity.isPending}>
            <Check className="h-3.5 w-3.5 text-success" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="data-mono text-sm text-foreground">
            {resource.quantity_available.toLocaleString("en-IN")}{" "}
            <span className="text-xs text-muted-foreground">{resource.unit}</span>
          </span>
          {isAdmin && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
