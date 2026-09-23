import api from "@/lib/api";
import type { Customer } from "@/lib/auth-store";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  customer: Customer;
  access: string;
  refresh: string;
}

export async function loginCustomer(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/public/auth/login/", payload);
  return data;
}

export async function registerCustomer(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>("/public/auth/register/", payload);
  return data;
}

export async function fetchCurrentCustomer() {
  const { data } = await api.get<Customer>("/public/auth/me/");
  return data;
}
