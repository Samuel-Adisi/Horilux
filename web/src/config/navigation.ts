export interface NavItem {
  label: string;
  path: string;
  departments?: string[]; // lowercase department names that can see this item; omit = visible to all
}

// Kept in sync with accounts/management/commands/seed_rbac.py RBAC_MATRIX —
// each item's departments list is every role with `view` on the backend
// resource that page's API is gated by. If the matrix changes, update here too.
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Properties", path: "/properties" }, // property.view: all six departments
  { label: "Leads", path: "/leads", departments: ["ceo", "sales", "operations"] },
  { label: "Viewings", path: "/viewings", departments: ["ceo", "sales", "operations"] },
  { label: "Transactions", path: "/transactions", departments: ["ceo", "sales", "finance", "operations"] },
  { label: "Campaigns", path: "/campaigns", departments: ["ceo", "marketing", "operations"] },
  { label: "Reports", path: "/reports" }, // report_*: every department has view on their own
  // "Clients" intentionally omitted — no /clients page/route exists yet.
];

export function getVisibleNavItems(departmentName: string | undefined): NavItem[] {
  if (!departmentName) return [];
  const dept = departmentName.toLowerCase();
  return NAV_ITEMS.filter((item) => !item.departments || item.departments.includes(dept));
}
