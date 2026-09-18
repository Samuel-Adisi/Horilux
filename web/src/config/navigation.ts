import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckSquare,
  FileText,
  Handshake,
  Home,
  KeyRound,
  LineChart,
  MapPin,
  Megaphone,
  PieChart,
  ScrollText,
  Settings,
  Target,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { can, type Action, type Resource } from "@/features/accounts/permissions";
import type { User } from "@/features/accounts/types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Visible when the user holds ANY of these grants. Omit = everyone. */
  requires?: [Resource, Action][];
  /** Exact match only (for "/"). */
  end?: boolean;
  /** Icon colour in the dark CEO theme (the original command-centre palette). */
  color: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    items: [
      { label: "Home", path: "/", icon: Home, color: "text-blue-400", end: true },
      { label: "Tasks", path: "/tasks", icon: CheckSquare, color: "text-violet-400", requires: [["task", "view"]] },
    ],
  },
  {
    label: "Listings",
    items: [
      { label: "Properties", path: "/properties", icon: Building2, color: "text-cyan-400", requires: [["property", "view"]] },
      {
        label: "Approvals",
        path: "/approvals",
        icon: BadgeCheck, color: "text-amber-400",
        requires: [
          ["property", "approve"],
          ["property_verification", "view"],
        ],
      },
      { label: "Owners", path: "/owners", icon: KeyRound, color: "text-rose-400", requires: [["property", "create"]] },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Leads", path: "/leads", icon: Target, color: "text-teal-400", requires: [["lead", "view"]] },
      { label: "Clients", path: "/clients", icon: UserRound, color: "text-blue-400", requires: [["client", "view"]] },
      { label: "Viewings", path: "/viewings", icon: CalendarCheck, color: "text-sky-400", requires: [["viewing", "view"]] },
      { label: "Follow-ups", path: "/follow-ups", icon: CalendarClock, color: "text-orange-400", requires: [["followup", "view"]] },
      { label: "Activity", path: "/activity", icon: Activity, color: "text-fuchsia-400", requires: [["interaction", "view"]] },
    ],
  },
  {
    label: "Deals",
    items: [
      { label: "Transactions", path: "/transactions", icon: Handshake, color: "text-amber-400", requires: [["transaction", "view"]] },
      { label: "Campaigns", path: "/campaigns", icon: Megaphone, color: "text-pink-400", requires: [["marketing_campaign", "view"]] },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Revenue", path: "/insights/revenue", icon: Wallet, color: "text-emerald-400", requires: [["finance_insights", "view"]] },
      { label: "Sales pipeline", path: "/insights/pipeline", icon: LineChart, color: "text-sky-400", requires: [["executive_insights", "view"]] },
      { label: "Listing performance", path: "/insights/properties", icon: BarChart3, color: "text-indigo-400", requires: [["property_insights", "view"]] },
      { label: "Agents", path: "/insights/agents", icon: Trophy, color: "text-emerald-400", requires: [["executive_insights", "view"]] },
      { label: "Lead sources", path: "/insights/lead-sources", icon: PieChart, color: "text-cyan-400", requires: [["lead_source_stats", "view"]] },
      { label: "Locations", path: "/insights/locations", icon: MapPin, color: "text-rose-400", requires: [["property_insights", "view"]] },
      {
        label: "Reports",
        path: "/reports",
        icon: FileText, color: "text-violet-400",
        requires: [
          ["report_listing", "view"],
          ["report_sales", "view"],
          ["report_marketing", "view"],
          ["report_finance", "view"],
          ["report_operations", "view"],
        ],
      },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Staff", path: "/staff", icon: Users, color: "text-orange-400", requires: [["user_management", "view"]] },
      { label: "Audit log", path: "/audit-log", icon: ScrollText, color: "text-slate-300", requires: [["audit_log", "view"]] },
      { label: "Settings", path: "/settings", icon: Settings, color: "text-slate-400" },
    ],
  },
];

export function visibleNav(user: User | null): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.requires || i.requires.some(([r, a]) => can(user, r, a))),
  })).filter((g) => g.items.length > 0);
}
