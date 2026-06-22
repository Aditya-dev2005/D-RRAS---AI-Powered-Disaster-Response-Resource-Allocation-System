import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function ChartCard({
  title,
  description,
  icon: Icon,
  loading,
  isEmpty,
  emptyLabel = "No data yet",
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-md bg-muted" />
        ) : isEmpty ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
