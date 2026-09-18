import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Menu } from "@/components/ui/overlay";
import { Skeleton } from "@/components/ui/display";
import { notificationLink, useMarkAllRead, useMarkRead, useNotifications, useUnreadCount, type Notification } from "@/features/notifications/api";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationsMenu() {
  const navigate = useNavigate();
  const unread = useUnreadCount(true);
  const count = unread.data ?? 0;

  return (
    <Menu
      className="w-[min(92vw,380px)] py-0"
      trigger={(p) => (
        <button
          type="button"
          {...p}
          aria-label={count ? `Notifications, ${count} unread` : "Notifications"}
          className="relative flex size-8 items-center justify-center rounded text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <Bell className="size-[18px]" />
          {count > 0 && (
            <span className="num absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      )}
    >
      {(close) => <NotificationsPanel close={close} onOpen={(to) => navigate(to)} />}
    </Menu>
  );
}

function NotificationsPanel({ close, onOpen }: { close: () => void; onOpen: (to: string) => void }) {
  const list = useNotifications({ page: 1 });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const items = list.data?.results.slice(0, 8) ?? [];
  const hasUnread = items.some((n) => !n.read);

  function open(n: Notification) {
    if (!n.read) markRead.mutate(n.id);
    const to = notificationLink(n);
    close();
    if (to) onOpen(to);
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="text-sm font-bold text-ink">Notifications</p>
        {hasUnread && (
          <button type="button" onClick={() => markAll.mutate()} className="text-xs font-semibold text-brand hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="scrollbar-thin max-h-[60vh] overflow-y-auto">
        {list.isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-subtle">You're all caught up.</p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={cn("flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover", !n.read && "bg-brand-50/50")}
                >
                  <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", n.read ? "text-ink-muted" : "font-semibold text-ink")}>{n.message}</span>
                    <span className="mt-0.5 block text-xs text-ink-subtle">{formatRelative(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link to="/notifications" onClick={close} className="block border-t border-line px-4 py-2.5 text-center text-xs font-semibold text-brand hover:bg-surface-hover">
        View all notifications
      </Link>
    </div>
  );
}
