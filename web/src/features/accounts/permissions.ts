import { useAuthStore } from "./store/auth-store";
import type { User } from "./types";

/**
 * Client-side mirror of the backend RBAC matrix (accounts/management/commands/seed_rbac.py).
 * This only decides what to SHOW — the API enforces every permission itself.
 * Keep in sync when the matrix changes.
 */
export type Resource =
  | "property"
  | "property_verification"
  | "lead"
  | "client"
  | "interaction"
  | "lead_source_stats"
  | "viewing"
  | "followup"
  | "transaction"
  | "payment_commission"
  | "marketing_campaign"
  | "user_management"
  | "report_listing"
  | "report_sales"
  | "report_marketing"
  | "report_finance"
  | "report_operations"
  | "audit_log"
  | "company_settings"
  | "task"
  | "system"
  /** Company-wide analytics endpoints (reports/*) gated on company scope. */
  | "executive_insights"
  | "finance_insights"
  | "property_insights"
  | "staff_directory";

export type Action = "view" | "create" | "edit" | "delete" | "assign" | "approve" | "publish";

type Grants = Partial<Record<Resource, Action[]>>;

const V: Action[] = ["view"];
const VCE: Action[] = ["view", "create", "edit"];

const CEO_GRANTS: Grants = {
  property: ["view", "create", "edit", "delete", "approve", "publish"],
  property_verification: ["view", "edit", "approve"],
  lead: ["view", "create", "edit", "assign", "delete"],
  client: ["view", "create", "edit", "delete"],
  interaction: V,
  lead_source_stats: V,
  viewing: ["view", "edit"],
  followup: ["view", "edit"],
  transaction: ["view", "create", "edit", "delete", "approve"],
  payment_commission: V,
  marketing_campaign: V,
  user_management: ["view", "create", "edit", "delete", "assign"],
  report_listing: V,
  report_sales: V,
  report_marketing: V,
  report_finance: V,
  report_operations: V,
  audit_log: V,
  company_settings: ["view", "edit"],
  task: ["view", "create", "edit", "delete"],
  executive_insights: V,
  finance_insights: V,
  property_insights: V,
  staff_directory: V,
};

// Operations = CEO in everything except managing staff.
const OPERATIONS_GRANTS: Grants = { ...CEO_GRANTS };
delete OPERATIONS_GRANTS.user_management;

// Developer: read-only on business data, no money resources, full control of staff.
const DEVELOPER_GRANTS: Grants = {
  property: V, property_verification: V, lead: V, client: V, interaction: V, lead_source_stats: V,
  viewing: V, followup: V, marketing_campaign: V, report_listing: V, report_sales: V,
  report_marketing: V, report_operations: V, task: V, audit_log: V, company_settings: V,
  user_management: ["view", "create", "edit", "delete", "assign"],
  system: V, executive_insights: V, property_insights: V, staff_directory: V,
};

const ROLE_GRANTS: Record<string, Grants> = {
  CEO: CEO_GRANTS,
  Developer: DEVELOPER_GRANTS,
  Operations: OPERATIONS_GRANTS,
  Listing: {
    property: VCE,
    property_verification: VCE,
    lead: ["view", "create", "edit", "assign"],
    report_listing: V,
    task: ["view", "edit"],
  },
  Sales: {
    property: VCE,
    lead: ["view", "create", "edit", "assign"],
    client: VCE,
    interaction: VCE,
    viewing: VCE,
    followup: VCE,
    transaction: VCE,
    report_sales: V,
    task: ["view", "edit"],
  },
  Marketing: {
    property: V,
    marketing_campaign: ["view", "create", "edit", "publish"],
    lead_source_stats: V,
    report_marketing: V,
    task: ["view", "edit"],
  },
  Finance: {
    lead: ["view", "create", "edit", "assign"],
    property: V,
    client: V,
    transaction: VCE,
    payment_commission: ["view", "create", "edit", "approve"],
    report_finance: V,
    task: ["view", "edit"],
    finance_insights: V,
    property_insights: V,
  },
};

/** Staff accounts with no role are Django superusers/admins — the API lets them do everything. */
export function isAdmin(user: User | null | undefined): boolean {
  return !!user && user.is_staff && user.roles?.length === 0;
}

export function can(user: User | null | undefined, resource: Resource, action: Action = "view"): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.roles?.some((r) => ROLE_GRANTS[r.name]?.[resource]?.includes(action)) ?? false;
}

export function hasRole(user: User | null | undefined, role: string): boolean {
  return !!user?.roles?.some((r) => r.name === role);
}

/** The role that decides which home dashboard a user lands on. */
export function primaryRole(user: User | null | undefined): string | null {
  if (!user) return null;
  if (isAdmin(user)) return "CEO";
  const order = ["CEO", "Operations", "Finance", "Sales", "Listing", "Marketing"];
  return order.find((r) => hasRole(user, r)) ?? user.roles?.[0]?.name ?? null;
}

export function useCan() {
  const user = useAuthStore((s) => s.user);
  return (resource: Resource, action: Action = "view") => can(user, resource, action);
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}
