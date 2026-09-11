import { apiClient } from "@/lib/api-client";
import type { LoginCredentials, AuthTokens, User } from "../types";

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>("/auth/login/", credentials);
  return data;
}

export async function logout(refresh: string): Promise<void> {
  await apiClient.post("/auth/logout/", { refresh });
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/accounts/me/");
  return data;
}
