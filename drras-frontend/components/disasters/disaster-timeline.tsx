import { CheckCircle2, Circle, Flame } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Disaster } from "@/lib/types";

export function DisasterTimeline({ disaster }: { disaster: Disaster }) {
  const events = [
    {
      label: "Disaster logged",
      detail: `Reported in ${disaster.city} at severity ${disaster.severity}/10`,
      timestamp: disaster.created_at,
      done: true,
    },
    {
      label: "Contained",
      detail: "Spread or escalation has been brought under control",
      timestamp: disaster.status !== "active" ? disaster.updated_at : null,
      done: disaster.status !== "active",
    },
    {
      label: "Resolved",
      detail: "All response operations for this event have concluded",
      timestamp: disaster.status === "resolved" ? disaster.updated_at : null,
      done: disaster.status === "resolved",
    },
  ];

  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div key={event.label} className="relative flex gap-3 pb-6 last:pb-0">
          {i < events.length - 1 && (
            <span className="absolute left-[9px] top-5 h-full w-px bg-border" aria-hidden />
          )}
          <span className="relative z-10 mt-0.5">
            {event.done ? (
              <CheckCircle2 className="h-[18px] w-[18px] text-success" />
            ) : (
              <Circle className="h-[18px] w-[18px] text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className={event.done ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"}>
              {event.label}
            </p>
            <p className="text-xs text-muted-foreground">{event.detail}</p>
            {event.timestamp && (
              <p className="data-mono mt-0.5 text-[11px] text-muted-foreground">
                {formatDateTime(event.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
      {disaster.status === "active" && (
        <div className="mt-1 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <Flame className="h-3.5 w-3.5" />
          Still active — no containment or resolution timestamp yet
        </div>
      )}
    </div>
  );
}
