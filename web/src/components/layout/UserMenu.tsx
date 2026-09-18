import { NavLink } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/display";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { DEPARTMENT_LABELS } from "@/features/accounts/types";
import { cn } from "@/lib/utils";
import { useSignOut } from "./use-sign-out";

/**
 * The signed-in user with a settings / sign-out menu.
 * "sidebar" sits at the foot of the staff sidebar; "topbar" is the CEO header chip.
 */
export function UserMenu({ variant, onNavigate }: { variant: "sidebar" | "topbar"; onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  const roleLabel = user?.roles.map((r) => r.name).join(", ") || (user?.is_staff ? "Administrator" : "");
  const deptLabel = user?.department ? DEPARTMENT_LABELS[user.department.name] ?? user.department.name : null;

  return (
    <Menu
      side={variant === "sidebar" ? "top" : "bottom"}
      align={variant === "sidebar" ? "start" : "end"}
      className={variant === "sidebar" ? "w-full" : "w-52"}
      trigger={(p) =>
        variant === "sidebar" ? (
          <button type="button" {...p} className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-surface-hover">
            <Avatar name={user?.full_name} size="sm" className="size-7" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium text-heading">{user?.full_name || user?.email}</span>
              <span className="block truncate text-[11.5px] text-ink-subtle">{deptLabel ?? roleLabel}</span>
            </span>
          </button>
        ) : (
          <button type="button" {...p} className="group flex items-center gap-3">
            <span className="relative">
              <Avatar name={user?.full_name} className="size-9 bg-brand/30 text-brand-fg ring-2 ring-brand/50 transition group-hover:ring-brand-fg" />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-topbar bg-emerald-500" aria-hidden />
            </span>
            <span className="hidden text-left xl:block">
              <span className="block text-xs font-semibold text-heading transition-colors group-hover:text-brand-fg">{user?.full_name}</span>
              <span className="block font-mono text-[10px] text-ink-subtle">{roleLabel || "—"}</span>
            </span>
            <ChevronDown className="hidden size-3.5 text-ink-faint transition-colors group-hover:text-ink xl:block" />
          </button>
        )
      }
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
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-hover"
          >
            <Settings className="size-4 text-ink-subtle" />
            Settings
          </NavLink>
          <div className={cn(variant === "topbar" && "border-t border-line")}>
            <MenuItem icon={<LogOut />} tone="danger" onClick={signOut}>
              Sign out
            </MenuItem>
          </div>
        </>
      )}
    </Menu>
  );
}
