import { apiClient } from "@/lib/api-client";
import type { LoginCredentials, AuthTokens, User } from "../types";

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>("/auth/login/", credentials);
  return data;
}

/** Blacklists the refresh token server-side. Best effort — never blocks sign-out. */
export async function logout(refresh: string | null): Promise<void> {
  if (!refresh) return;
  try {
    await apiClient.post("/auth/logout/", { refresh });
  } catch {
    /* token may already be expired/blacklisted */
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/accounts/me/");
  return data;
}
