import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, createTask } from "../api/tasks";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
