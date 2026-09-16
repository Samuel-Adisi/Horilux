export type NavItem = { id: string; label: string; to: string; badge?: number };
export type NavGroup = { label: string; items: NavItem[] };

export const CEO_NAV: NavGroup[] = [
  { label: "Overview", items: [{ id: "overview", label: "Executive Overview", to: "/ceo" }] },
  {
    label: "Business",
    items: [
      { id: "revenue", label: "Revenue & Finance", to: "/ceo/revenue" },
      { id: "sales", label: "Sales Pipeline", to: "/ceo/sales" },
      { id: "transactions", label: "Transactions", to: "/ceo/transactions" },
      { id: "forecasting", label: "Predictive Forecast", to: "/ceo/forecasting" },
    ],
  },
  {
    label: "Properties",
    items: [
      { id: "properties", label: "All Properties", to: "/ceo/properties" },
      { id: "property-performance", label: "Performance Metrics", to: "/ceo/properties/performance" },
      { id: "locations", label: "Metro Locations", to: "/ceo/locations" },
      { id: "developers", label: "Developers & JV", to: "/ceo/developers" },
    ],
  },
  {
    label: "Customers",
    items: [
      { id: "leads", label: "Leads Management", to: "/ceo/leads" },
      { id: "customers", label: "Buyers & Investors", to: "/ceo/customers" },
      { id: "crm", label: "CRM Interactions", to: "/ceo/crm" },
    ],
  },
  {
    label: "People",
    items: [
      { id: "agents", label: "Agents Roster", to: "/ceo/agents" },
      { id: "agencies", label: "Agencies", to: "/ceo/agencies" },
      { id: "landlords", label: "Landlords", to: "/ceo/landlords" },
      { id: "staff", label: "Staff Directory", to: "/ceo/staff" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { id: "campaigns", label: "Campaigns", to: "/ceo/campaigns" },
      { id: "lead-sources", label: "Lead Sources (ROAS)", to: "/ceo/lead-sources" },
      { id: "advertising", label: "Advertising", to: "/ceo/advertising" },
    ],
  },
  {
    label: "Rentals",
    items: [
      { id: "rental-performance", label: "Rental Performance", to: "/ceo/rentals/performance" },
      { id: "occupancy", label: "Occupancy Tracker", to: "/ceo/rentals/occupancy" },
      { id: "tenancies", label: "Tenancies & Renewals", to: "/ceo/rentals/tenancies" },
    ],
  },
  {
    label: "Governance",
    items: [
      { id: "approvals", label: "CEO Approvals", to: "/ceo/approvals", badge: 3 },
      { id: "audit-logs", label: "Audit & Compliance", to: "/ceo/audit-logs" },
      { id: "risk", label: "Risk Assessment", to: "/ceo/risk" },
      { id: "ai-insights", label: "AI Strategic Hub", to: "/ceo/ai-insights" },
      { id: "settings", label: "System Settings", to: "/ceo/settings" },
    ],
  },
];
