import { NavLink } from "react-router-dom";
import { visibleNav, type NavItem } from "@/config/navigation";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { can } from "@/features/accounts/permissions";
import { useProperties } from "@/features/properties/api";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

/** Live count for the Approvals item (listings waiting on verification). */
function useApprovalsBadge(enabled: boolean) {
  const q = useProperties({ status: "pending_verification" }, { enabled });
  return q.data?.count ?? 0;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();
  const groups = visibleNav(user);
  const pending = useApprovalsBadge(can(user, "property", "approve") || can(user, "property_verification", "view"));
  const badges: Record<string, number> = { "/approvals": pending };

  return theme === "ceo" ? (
    <CeoSidebar groups={groups} badges={badges} onNavigate={onNavigate} />
  ) : (
    <StaffSidebar groups={groups} badges={badges} onNavigate={onNavigate} />
  );
}

type Props = { groups: ReturnType<typeof visibleNav>; badges: Record<string, number>; onNavigate?: () => void };

function CeoSidebar({ groups, badges, onNavigate }: Props) {
  return (
    <div className="flex h-full select-none flex-col bg-sidebar">
      <div className="flex items-center gap-3 border-b border-line p-4">
        <img src="/logo1.png" alt="" className="size-10 shrink-0 rounded-lg shadow-md" />
        <div className="overflow-hidden">
          <p className="text-sm font-bold uppercase tracking-tight text-heading">Horilux</p>
          <p className="truncate text-[11px] text-ink-subtle">Real Estate Command Center</p>
        </div>
      </div>
      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-2 py-3 text-xs" aria-label="Main">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi}>
            <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{group.label ?? "Overview"}</p>
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => (
                <CeoLink key={item.path} item={item} badge={badges[item.path]} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      {/* On desktop the CEO's account menu lives in the top bar. */}
      <div className="relative border-t border-line p-3 sm:hidden">
        <UserMenu variant="sidebar" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function CeoLink({ item, badge, onNavigate }: { item: NavItem; badge?: number; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left font-medium transition-colors",
          isActive ? "bg-brand text-white" : "text-ink-subtle hover:bg-white/5 hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("size-[18px] shrink-0", isActive ? "text-white" : item.color)} />
          <span className="flex-1">{item.label}</span>
          {badge ? <span className="rounded-full bg-amber-500/20 px-1.5 font-mono text-[10px] text-amber-300">{badge}</span> : null}
        </>
      )}
    </NavLink>
  );
}

function StaffSidebar({ groups, badges, onNavigate }: Props) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/logo1.png" alt="" className="size-9 shrink-0 object-contain" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold leading-tight tracking-tight text-ink">Horilux Estates</span>
          <span className="truncate text-[9.5px] font-medium uppercase leading-tight tracking-wider text-ink-subtle">Private Wealth &amp; Realty</span>
        </div>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2" aria-label="Main">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className={cn(gi > 0 && "mt-4")}>
            {group.label && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[13.5px] font-medium transition-colors",
                      isActive ? "bg-brand/[0.07] text-brand-fg" : "text-[#5C5747] hover:bg-canvas hover:text-ink",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-brand transition-opacity",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <item.icon className={cn("size-4 shrink-0", isActive ? "text-brand-fg" : "text-ink-faint group-hover:text-ink-subtle")} />
                      <span className="flex-1">{item.label}</span>
                      {badges[item.path] ? (
                        <span className="rounded-full bg-brand/10 px-1.5 font-mono text-[10px] font-semibold text-brand-fg">{badges[item.path]}</span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="relative border-t border-line px-4 py-4">
        <UserMenu variant="sidebar" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
