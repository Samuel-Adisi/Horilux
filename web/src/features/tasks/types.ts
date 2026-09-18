export interface Task {
  id: string;
  title: string;
  owner: string | null;
  owner_name: string | null;
  status: "open" | "in_progress" | "done";
  due_date: string | null;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  due_date?: string;
  owner?: string;
}
