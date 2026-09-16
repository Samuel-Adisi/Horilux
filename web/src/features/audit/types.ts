export interface AuditLog {
  id: string;
  actor: string | null;
  actor_name: string;
  action: string;
  model_name: string;
  object_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  timestamp: string;
}

export interface AuditLogsQuery {
  search?: string;
  model_name?: string;
  action?: string;
  page?: number;
}
