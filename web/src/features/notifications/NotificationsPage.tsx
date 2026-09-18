import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Page, PageHeader, Segmented } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Pagination, TableSkeleton } from "@/components/ui/table";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatDateTime, formatRelative } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { notificationLink, useMarkAllRead, useMarkRead, useNotifications, type Notification } from "./api";

export function NotificationsPage() {
  useDocumentTitle("Notifications");
  const navigate = useNavigate();
  const { values, page, set } = useUrlState(["show"] as const);
  const q = useNotifications({ page, read: values.show === "unread" ? "false" : "" });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const rows = q.data?.results ?? [];

  function open(n: Notification) {
    if (!n.read) markRead.mutate(n.id);
    const to = notificationLink(n);
    if (to) navigate(to);
  }

  return (
    <Page width="narrow">
      <PageHeader
        title="Notifications"
        actions={
          <Button size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
            Mark all read
          </Button>
        }
      />
      <Panel flush>
        <div className="border-b border-line px-4 py-3">
          <Segmented
            value={values.show || "all"}
            onChange={(v) => set({ show: v === "all" ? null : v })}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
            ]}
          />
        </div>
        {q.isLoading ? (
          <TableSkeleton cols={2} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Bell />} title="No notifications" description="You'll hear about assignments, approvals and deadlines here." />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {rows.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => open(n)} className={cn("flex w-full gap-3 px-4 py-3 text-left hover:bg-surface-hover", !n.read && "bg-brand-50/40")}>
                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm", n.read ? "text-ink-muted" : "font-semibold text-ink")}>{n.message}</span>
                      <span className="text-xs text-ink-subtle" title={formatDateTime(n.created_at)}>
                        {formatRelative(n.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>
    </Page>
  );
}
