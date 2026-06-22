import { cn } from "@/lib/utils";

export function StatusDot({
  className,
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-pulse-dot rounded-full",
            className
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", className)} />
    </span>
  );
}
