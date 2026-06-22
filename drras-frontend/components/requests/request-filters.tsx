"use client";

import { cn } from "@/lib/utils";

export type RequestFilter = "all" | "high_priority" | "pending" | "resolved";

const FILTERS: { value: RequestFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high_priority", label: "High Priority" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
];

export function RequestFilters({
  value,
  onChange,
  counts,
}: {
  value: RequestFilter;
  onChange: (value: RequestFilter) => void;
  counts: Record<RequestFilter, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === f.value
              ? "border-signal/30 bg-signal/15 text-signal"
              : "border-border bg-surface text-muted-foreground hover:text-foreground"
          )}
        >
          {f.label}
          <span className="data-mono rounded-full bg-background/60 px-1.5 text-[10px]">
            {counts[f.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
