export type DepartmentKey = "ceo" | "listing" | "sales" | "marketing" | "transactions" | "operations";
export type RoleName = "CEO" | "Listing" | "Sales" | "Marketing" | "Finance" | "Operations";

export interface Department {
  id: string;
  name: DepartmentKey | string;
  description: string;
}

export interface Role {
  id: string;
  name: RoleName | string;
  description: string;
  department: string | null;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  department: Department | null;
  roles: Role[];
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

/** Lightweight user row from GET accounts/users/ (active users only). */
export interface UserListItem {
  id: string;
  full_name: string;
  email: string;
  department_name: DepartmentKey | null;
}

export const DEPARTMENT_LABELS: Record<string, string> = {
  ceo: "Executive",
  listing: "Listing",
  sales: "Sales",
  marketing: "Marketing",
  transactions: "Finance",
  operations: "Operations",
};
