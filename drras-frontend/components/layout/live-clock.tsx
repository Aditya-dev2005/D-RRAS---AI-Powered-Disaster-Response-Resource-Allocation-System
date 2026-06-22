"use client";

import { useEffect, useState } from "react";
import { StatusDot } from "@/components/shared/status-dot";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 sm:flex">
      <StatusDot className="bg-success" pulse />
      <span className="text-[11px] font-medium uppercase tracking-wide text-success">
        System Nominal
      </span>
      <span className="data-mono text-[11px] text-muted-foreground">
        {now ? now.toLocaleTimeString("en-IN", { hour12: false }) : "--:--:--"}
      </span>
    </div>
  );
}
