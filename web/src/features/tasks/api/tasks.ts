import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/features/properties/types";
import type { Task, CreateTaskPayload } from "../types";

export async function fetchTasks(): Promise<PaginatedResponse<Task>> {
  const { data } = await apiClient.get<PaginatedResponse<Task>>("/tasks/");
  return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks/", payload);
  return data;
}
