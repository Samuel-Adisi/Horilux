import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { getVisibleNavItems } from "@/config/navigation";

function Icon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const DASHBOARD_ICON = "M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9-2h7v9h-7v-9Z";
const PROPERTIES_ICON = "M4 21V9l8-6 8 6v12h-5v-7H9v7H4Z";
const REPORTS_ICON = "M4 20V10m6 10V4m6 16v-7";
const DEFAULT_ICON = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z";

const ICON_BY_LABEL: Record<string, string> = {
  Dashboard: DASHBOARD_ICON,
  Properties: PROPERTIES_ICON,
  Reports: REPORTS_ICON,
};

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const items = getVisibleNavItems(user?.department?.name);
  const initial = user?.full_name?.[0]?.toUpperCase() ?? "?";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSignOut() {
    clearAuth();
    navigate("/login");
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#EFEDE6] bg-white h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/logo1.png" alt="Horilux" className="h-9 w-9 shrink-0 object-contain" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold leading-tight tracking-tight text-[#17131F]">
            Horilux Estates
          </span>
          <span className="truncate text-[9.5px] font-medium uppercase leading-tight tracking-wider text-[#8A8578]">
            Private Wealth &amp; Realty
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-[#240270]/[0.07] text-[#240270]"
                  : "text-[#5C5747] hover:bg-[#FAF9F6] hover:text-[#17131F]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-[#240270] transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Icon
                  d={ICON_BY_LABEL[item.label] ?? DEFAULT_ICON}
                  width={16}
                  height={16}
                  className={isActive ? "text-[#240270]" : "text-[#B5AF9E] group-hover:text-[#8A8578]"}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative border-t border-[#EFEDE6] px-4 py-4" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-1 rounded-[6px] border border-[#EFEDE6] bg-white py-1 shadow-md">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#5C5747] hover:bg-[#FAF9F6] hover:text-[#17131F]"
            >
              Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex w-full items-center gap-2.5 rounded-[6px] text-left hover:bg-[#FAF9F6]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#240270] text-[11.5px] font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-[#17131F]">{user?.full_name ?? "—"}</p>
            <p className="truncate text-[11.5px] text-[#8A8578]">{user?.department?.name ?? ""}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
