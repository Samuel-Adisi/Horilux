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
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    items: [
      { label: "Home", path: "/", icon: Home, end: true },
      { label: "Tasks", path: "/tasks", icon: CheckSquare, requires: [["task", "view"]] },
    ],
  },
  {
    label: "Listings",
    items: [
      { label: "Properties", path: "/properties", icon: Building2, requires: [["property", "view"]] },
      {
        label: "Approvals",
        path: "/approvals",
        icon: BadgeCheck,
        requires: [
          ["property", "approve"],
          ["property_verification", "view"],
        ],
      },
      { label: "Owners", path: "/owners", icon: KeyRound, requires: [["property", "create"]] },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Leads", path: "/leads", icon: Target, requires: [["lead", "view"]] },
      { label: "Clients", path: "/clients", icon: UserRound, requires: [["client", "view"]] },
      { label: "Viewings", path: "/viewings", icon: CalendarCheck, requires: [["viewing", "view"]] },
      { label: "Follow-ups", path: "/follow-ups", icon: CalendarClock, requires: [["followup", "view"]] },
      { label: "Activity", path: "/activity", icon: Activity, requires: [["interaction", "view"]] },
    ],
  },
  {
    label: "Deals",
    items: [
      { label: "Transactions", path: "/transactions", icon: Handshake, requires: [["transaction", "view"]] },
      { label: "Campaigns", path: "/campaigns", icon: Megaphone, requires: [["marketing_campaign", "view"]] },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Revenue", path: "/insights/revenue", icon: Wallet, requires: [["finance_insights", "view"]] },
      { label: "Sales pipeline", path: "/insights/pipeline", icon: LineChart, requires: [["executive_insights", "view"]] },
      { label: "Listing performance", path: "/insights/properties", icon: BarChart3, requires: [["property_insights", "view"]] },
      { label: "Agents", path: "/insights/agents", icon: Trophy, requires: [["executive_insights", "view"]] },
      { label: "Lead sources", path: "/insights/lead-sources", icon: PieChart, requires: [["lead_source_stats", "view"]] },
      { label: "Locations", path: "/insights/locations", icon: MapPin, requires: [["property_insights", "view"]] },
      {
        label: "Reports",
        path: "/reports",
        icon: FileText,
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
      { label: "Staff", path: "/staff", icon: Users, requires: [["user_management", "view"]] },
      { label: "Audit log", path: "/audit-log", icon: ScrollText, requires: [["audit_log", "view"]] },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

export function visibleNav(user: User | null): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.requires || i.requires.some(([r, a]) => can(user, r, a))),
  })).filter((g) => g.items.length > 0);
}
