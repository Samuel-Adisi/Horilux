import { useState, type FormEvent } from "react";
import { CheckSquare, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Page, PageHeader, SearchInput, Segmented, Toolbar } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { ConfirmDialog, Dialog, Menu, MenuItem } from "@/components/ui/overlay";
import { Pagination, TableSkeleton } from "@/components/ui/table";
import { TaskStatus } from "@/components/domain/status";
import { UserPicker } from "@/components/domain/pickers";
import { useCan, useCurrentUser } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, isPast, todayISO } from "@/lib/format";
import { toast } from "@/lib/toast";
import { PAGE_SIZE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TASK_STATUS_LABEL, useDeleteTask, useSaveTask, useTasks, type Task, type TaskStatus as TS } from "./api";

export function TasksPage() {
  useDocumentTitle("Tasks");
  const can = useCan();
  const me = useCurrentUser();
  const canManage = can("task", "create");
  const { values, page, set } = useUrlState(["status", "search", "scope"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const status = values.status || "active";
  const mine = !canManage || values.scope !== "all";
  const q = useTasks({ page, search: values.search, status: status === "active" ? "" : status, mine });
  const save = useSaveTask();
  const del = useDeleteTask();
  const [editing, setEditing] = useState<Task | "new" | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  // "Active" hides finished work client-side; the API filters one status at a time.
  const rows = (q.data?.results ?? []).filter((t) => status !== "active" || t.status !== "done");

  async function toggle(t: Task) {
    const next: TS = t.status === "done" ? "open" : "done";
    try {
      await save.mutateAsync({ id: t.id, input: { status: next } });
      if (next === "done") toast.success("Task done", t.title);
    } catch (err) {
      toast.error("Couldn't update the task", getErrorMessage(err));
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Couldn't delete the task", getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Tasks"
        description={canManage ? "Work assigned across the company, including verification tasks raised by the system." : "Work assigned to you."}
        actions={
          canManage && (
            <Button variant="primary" icon={<Plus />} onClick={() => setEditing("new")}>
              New task
            </Button>
          )
        }
      />
      <Panel flush>
        <div className="border-b border-line px-4 py-3">
          <Segmented
            value={status}
            onChange={(v) => set({ status: v === "active" ? null : v })}
            options={[
              { value: "active", label: "Active" },
              ...(Object.keys(TASK_STATUS_LABEL) as TS[]).map((s) => ({ value: s, label: TASK_STATUS_LABEL[s] })),
            ]}
          />
        </div>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search tasks" />
          {canManage && (
            <Select value={mine ? "mine" : "all"} onChange={(e) => set({ scope: e.target.value === "all" ? "all" : null })} className="h-8 sm:ml-auto sm:w-40" aria-label="Whose tasks">
              <option value="mine">Assigned to me</option>
              <option value="all">Everyone's</option>
            </Select>
          )}
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton cols={3} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<CheckSquare />} title={status === "active" ? "Nothing on the list" : "No tasks here"} description={status === "active" ? "New tasks show up here when they're assigned." : undefined} />
        ) : (
          <>
            <ul className={cn("divide-y divide-line", q.isPlaceholderData && "opacity-60")}>
              {rows.map((t) => {
                const overdue = t.due_date && t.status !== "done" && isPast(t.due_date);
                const canEditThis = can("task", "edit") && (canManage || t.owner === me?.id);
                return (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={t.status === "done"}
                      disabled={!canEditThis}
                      onChange={() => toggle(t)}
                      className="size-4 shrink-0 cursor-pointer rounded-sm border-line-strong accent-forest"
                      aria-label={t.status === "done" ? `Reopen ${t.title}` : `Complete ${t.title}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm font-semibold", t.status === "done" ? "text-ink-subtle line-through" : "text-ink")}>{t.title}</p>
                      <p className="text-xs text-ink-subtle">
                        {t.owner_name ?? "Unassigned"}
                        {t.due_date && (
                          <span className={cn(overdue && "font-semibold text-danger")}>
                            {" · "}
                            {t.due_date === todayISO() ? "due today" : `due ${formatDate(t.due_date)}`}
                            {overdue && " (overdue)"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <TaskStatus status={t.status} />
                    </div>
                    {canEditThis && (
                      <Menu
                        trigger={(p) => (
                          <Button {...p} variant="ghost" size="icon" className="h-7 w-7" aria-label="More">
                            <MoreHorizontal />
                          </Button>
                        )}
                      >
                        {(close) => (
                          <>
                            {t.status === "open" && (
                              <MenuItem
                                onClick={() => {
                                  close();
                                  save.mutate({ id: t.id, input: { status: "in_progress" } });
                                }}
                              >
                                Start working on it
                              </MenuItem>
                            )}
                            {canManage && (
                              <MenuItem
                                icon={<Pencil />}
                                onClick={() => {
                                  close();
                                  setEditing(t);
                                }}
                              >
                                Edit
                              </MenuItem>
                            )}
                            {can("task", "delete") && (
                              <MenuItem
                                icon={<Trash2 />}
                                tone="danger"
                                onClick={() => {
                                  close();
                                  setDeleting(t);
                                }}
                              >
                                Delete
                              </MenuItem>
                            )}
                          </>
                        )}
                      </Menu>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>
      {editing && <TaskDialog task={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete this task?"
        description={deleting?.title}
        confirmLabel="Delete"
        tone="danger"
        loading={del.isPending}
      />
    </Page>
  );
}

function TaskDialog({ task, onClose }: { task?: Task; onClose: () => void }) {
  const save = useSaveTask();
  const [title, setTitle] = useState(task?.title ?? "");
  const [owner, setOwner] = useState(task?.owner ?? "");
  const [due, setDue] = useState(task?.due_date ?? "");
  const [status, setStatus] = useState<TS>(task?.status ?? "open");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("What needs doing?");
    try {
      await save.mutateAsync({ id: task?.id, input: { title: title.trim(), owner: owner || null, due_date: due || null, status } });
      toast.success(task ? "Task updated" : "Task created", owner ? "The assignee has been notified." : undefined);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the task."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={task ? "Edit task" : "New task"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-form" variant="primary" loading={save.isPending}>
            {task ? "Save" : "Create task"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Task">{(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} placeholder="Prepare Q3 board pack" />}</Field>
        <Field label="Assign to" optional>
          {(p) => <UserPicker {...p} value={owner} onChange={setOwner} clearable />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Due" optional>
            {(p) => <Input {...p} type="date" value={due} onChange={(e) => setDue(e.target.value)} />}
          </Field>
          {task && (
            <Field label="Status">
              {(p) => (
                <Select {...p} value={status} onChange={(e) => setStatus(e.target.value as TS)}>
                  {(Object.keys(TASK_STATUS_LABEL) as TS[]).map((s) => (
                    <option key={s} value={s}>
                      {TASK_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
        </div>
      </form>
    </Dialog>
  );
}
