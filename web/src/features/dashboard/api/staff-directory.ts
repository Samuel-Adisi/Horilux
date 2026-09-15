import { apiClient } from "@/lib/api-client";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string | null;
  roles: string[];
  is_active: boolean;
  date_joined: string;
}

export interface StaffDirectoryData {
  total_staff: number;
  active_count: number;
  staff: StaffMember[];
}

export async function fetchStaffDirectory(): Promise<StaffDirectoryData> {
  const { data } = await apiClient.get<StaffDirectoryData>("/reports/staff-directory/");
  return data;
}


// --- CRUD layer (accounts app) -------------------------------------------
// Separate from the read-only report types above: these mirror the real
// UserSerializer/StaffWriteSerializer response shapes on the backend
// (nested department/role objects), not the flattened report shape.

export interface DepartmentOption {
  id: string;
  name: string;
  description: string;
}

export interface RoleOption {
  id: string;
  name: string;
  description: string;
  department: string;
}

export interface StaffRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  department: DepartmentOption | null;
  roles: RoleOption[];
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface StaffFormInput {
  email?: string; // only used on create -- immutable afterwards
  first_name: string;
  last_name: string;
  phone: string;
  department: string | null;
  role: string | null;
  password?: string; // required on create, optional on update
  is_active?: boolean;
}

export async function fetchDepartments(): Promise<DepartmentOption[]> {
  const { data } = await apiClient.get<DepartmentOption[]>("/accounts/departments/");
  return data;
}

export async function fetchRoles(): Promise<RoleOption[]> {
  const { data } = await apiClient.get<RoleOption[]>("/accounts/roles/");
  return data;
}

export async function createStaffMember(input: StaffFormInput): Promise<StaffRecord> {
  const { data } = await apiClient.post<StaffRecord>("/accounts/staff/", input);
  return data;
}

export async function fetchStaffMember(id: string): Promise<StaffRecord> {
  const { data } = await apiClient.get<StaffRecord>(`/accounts/staff/${id}/`);
  return data;
}

export async function updateStaffMember(id: string, input: Partial<StaffFormInput>): Promise<StaffRecord> {
  const { data } = await apiClient.patch<StaffRecord>(`/accounts/staff/${id}/`, input);
  return data;
}

export async function deactivateStaffMember(id: string): Promise<void> {
  await apiClient.delete(`/accounts/staff/${id}/`);
}

export async function reactivateStaffMember(id: string): Promise<StaffRecord> {
  const { data } = await apiClient.post<StaffRecord>(`/accounts/staff/${id}/reactivate/`);
  return data;
}
