import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

export type TaskStatus = "open" | "in_progress" | "done";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

export interface Task {
  id: string;
  title: string;
  owner: string | null;
  owner_name: string | null;
  status: TaskStatus;
  status_label?: string;
  due_date: string | null;
  created_at: string;
}

export interface TaskInput {
  title: string;
  owner?: string | null;
  status?: TaskStatus;
  due_date?: string | null;
}

export interface TasksQuery {
  page?: number;
  status?: string;
  search?: string;
  mine?: boolean;
}

export function useTasks(q: TasksQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["tasks", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<Task>>("/tasks/", {
          params: cleanParams({ page: q.page ?? 1, status: q.status, search: q.search, mine: q.mine ? "true" : undefined }),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useSaveTask() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: Partial<TaskInput> }) =>
      id ? (await apiClient.patch<Task>(`/tasks/${id}/`, input)).data : (await apiClient.post<Task>("/tasks/", input)).data,
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tasks/${id}/`);
    },
    onSuccess: invalidate,
  });
}
