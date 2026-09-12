import { apiClient } from "@/lib/api-client";
import type { UserListItem } from "../types";

export async function fetchUsers(): Promise<UserListItem[]> {
  const { data } = await apiClient.get<UserListItem[]>("/accounts/users/");
  return data;
}
