import {
  LayoutDashboard,
  Flame,
  ClipboardList,
  Package,
  Users,
  Map,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Live operational summary",
  },
  {
    label: "Disasters",
    href: "/dashboard/disasters",
    icon: Flame,
    description: "Event management",
  },
  {
    label: "Emergency Requests",
    href: "/dashboard/requests",
    icon: ClipboardList,
    description: "Triage & status tracking",
  },
  {
    label: "Resources",
    href: "/dashboard/resources",
    icon: Package,
    description: "Stock & knapsack allocation",
  },
  {
    label: "Volunteers",
    href: "/dashboard/volunteers",
    icon: Users,
    description: "Skills & greedy matching",
  },
  {
    label: "Route Optimization",
    href: "/dashboard/routing",
    icon: Map,
    description: "Dijkstra · A* · road network",
  },
  {
    label: "AI Intelligence",
    href: "/dashboard/ai",
    icon: Sparkles,
    description: "Summaries & ops assistant",
  },
  {
    label: "Admin Control Center",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    description: "Consolidated system view",
  },
];
