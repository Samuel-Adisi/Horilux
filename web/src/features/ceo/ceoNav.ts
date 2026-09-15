import type { LucideIcon } from "lucide-react";
import {
  Home,
  DollarSign,
  TrendingUp,
  FileText,
  MonitorPlay,
  Building2,
  BarChart3,
  MapPin,
  Briefcase,
  UserPlus,
  Users,
  MessageSquare,
  CircleUserRound,
  Building,
  Landmark,
  UsersRound,
  Megaphone,
  Target,
  Radio,
  DoorOpen,
  FileSignature,
  ShieldCheck,
  ScrollText,
  AlertTriangle,
  Sparkles,
  Settings,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  to: string;
  badge?: number;
  icon: LucideIcon;
  color: string;
};
export type NavGroup = { label: string; items: NavItem[] };

export const CEO_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ id: "overview", label: "Executive Overview", to: "/ceo", icon: Home, color: "text-blue-400" }],
  },
  {
    label: "Business",
    items: [
      { id: "revenue", label: "Revenue & Finance", to: "/ceo/revenue", icon: DollarSign, color: "text-emerald-400" },
      { id: "sales", label: "Sales Pipeline", to: "/ceo/sales", icon: TrendingUp, color: "text-sky-400" },
      { id: "transactions", label: "Transactions", to: "/ceo/transactions", icon: FileText, color: "text-amber-400" },
      { id: "forecasting", label: "Predictive Forecast", to: "/ceo/forecasting", icon: MonitorPlay, color: "text-violet-400" },
    ],
  },
  {
    label: "Properties",
    items: [
      { id: "properties", label: "All Properties", to: "/ceo/properties", icon: Building2, color: "text-cyan-400" },
      { id: "property-performance", label: "Performance Metrics", to: "/ceo/properties/performance", icon: BarChart3, color: "text-indigo-400" },
      { id: "locations", label: "Metro Locations", to: "/ceo/locations", icon: MapPin, color: "text-rose-400" },
      { id: "developers", label: "Developers & JV", to: "/ceo/developers", icon: Briefcase, color: "text-amber-400" },
    ],
  },
  {
    label: "Customers",
    items: [
      { id: "leads", label: "Leads Management", to: "/ceo/leads", icon: UserPlus, color: "text-teal-400" },
      { id: "customers", label: "Buyers & Investors", to: "/ceo/customers", icon: Users, color: "text-blue-400" },
      { id: "crm", label: "CRM Interactions", to: "/ceo/crm", icon: MessageSquare, color: "text-fuchsia-400" },
    ],
  },
  {
    label: "People",
    items: [
      { id: "agents", label: "Agents Roster", to: "/ceo/agents", icon: CircleUserRound, color: "text-emerald-400" },
      { id: "agencies", label: "Agencies", to: "/ceo/agencies", icon: Building, color: "text-slate-300" },
      { id: "landlords", label: "Landlords", to: "/ceo/landlords", icon: Landmark, color: "text-indigo-400" },
      { id: "staff", label: "Staff Directory", to: "/ceo/staff", icon: UsersRound, color: "text-orange-400" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { id: "campaigns", label: "Campaigns", to: "/ceo/campaigns", icon: Megaphone, color: "text-pink-400" },
      { id: "lead-sources", label: "Lead Sources (ROAS)", to: "/ceo/lead-sources", icon: Target, color: "text-cyan-400" },
      { id: "advertising", label: "Advertising", to: "/ceo/advertising", icon: Radio, color: "text-yellow-400" },
    ],
  },
  {
    label: "Rentals",
    items: [
      { id: "rental-performance", label: "Rental Performance", to: "/ceo/rentals/performance", icon: Home, color: "text-emerald-400" },
      { id: "occupancy", label: "Occupancy Tracker", to: "/ceo/rentals/occupancy", icon: DoorOpen, color: "text-sky-400" },
      { id: "tenancies", label: "Tenancies & Renewals", to: "/ceo/rentals/tenancies", icon: FileSignature, color: "text-violet-400" },
    ],
  },
  {
    label: "Governance",
    items: [
      { id: "approvals", label: "CEO Approvals", to: "/ceo/approvals", badge: 3, icon: ShieldCheck, color: "text-amber-400" },
      { id: "audit-logs", label: "Audit & Compliance", to: "/ceo/audit-logs", icon: ScrollText, color: "text-slate-300" },
      { id: "risk", label: "Risk Assessment", to: "/ceo/risk", icon: AlertTriangle, color: "text-red-400" },
      { id: "ai-insights", label: "AI Strategic Hub", to: "/ceo/ai-insights", icon: Sparkles, color: "text-violet-400" },
      { id: "settings", label: "System Settings", to: "/ceo/settings", icon: Settings, color: "text-slate-400" },
    ],
  },
];
