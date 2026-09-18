import { NavLink } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { visibleNav } from "@/config/navigation";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { DEPARTMENT_LABELS } from "@/features/accounts/types";
import { Avatar } from "@/components/ui/display";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";
import { useSignOut } from "./use-sign-out";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const groups = visibleNav(user);
  const signOut = useSignOut();
  const roleLabel = user?.roles.map((r) => r.name).join(", ") || (user?.is_staff ? "Administrator" : "");
  const deptLabel = user?.department ? DEPARTMENT_LABELS[user.department.name] ?? user.department.name : null;

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <img src="/brand-mark.png" alt="" className="size-7" />
        <div className="leading-none">
          <p className="text-sm font-extrabold tracking-tight text-brand">Horilux</p>
          <p className="mt-0.5 text-2xs font-medium text-ink-subtle">Estates</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2.5 py-3" aria-label="Main">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className={cn(gi > 0 && "mt-5")}>
            {group.label && <p className="mb-1 px-2.5 text-2xs font-bold uppercase tracking-[0.08em] text-ink-faint">{group.label}</p>}
            <ul className="space-y-px">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex h-8 items-center gap-2.5 rounded px-2.5 text-sm font-semibold transition-colors",
                        isActive ? "bg-brand-50 text-brand" : "text-ink-muted hover:bg-surface-hover hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" aria-hidden />}
                        <item.icon className={cn("size-4 shrink-0", isActive ? "text-brand" : "text-ink-subtle group-hover:text-ink-muted")} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-2.5">
        <Menu
          side="top"
          align="start"
          className="w-[calc(100%)]"
          trigger={(p) => (
            <button
              type="button"
              {...p}
              className="flex w-full items-center gap-2.5 rounded p-1.5 text-left transition-colors hover:bg-surface-hover"
            >
              <Avatar name={user?.full_name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{user?.full_name || user?.email}</span>
                <span className="block truncate text-xs text-ink-subtle">{[roleLabel, deptLabel !== roleLabel ? deptLabel : null].filter(Boolean).join(" · ")}</span>
              </span>
            </button>
          )}
        >
          {(close) => (
            <>
              <div className="border-b border-line px-3 pb-2 pt-1.5">
                <p className="truncate text-xs text-ink-subtle">{user?.email}</p>
              </div>
              <NavLink
                to="/settings"
                onClick={() => {
                  close();
                  onNavigate?.();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink hover:bg-surface-hover"
              >
                <Settings className="size-4 text-ink-subtle" />
                Settings
              </NavLink>
              <MenuItem icon={<LogOut />} onClick={signOut}>
                Sign out
              </MenuItem>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
}
