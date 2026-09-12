import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import "@/features/reports/stitch-fonts.css";

const NAV_LINKS: { label: string; path: string }[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Properties", path: "/properties" },
  { label: "Leads", path: "/leads" },
  { label: "Viewings", path: "/viewings" },
  { label: "Transactions", path: "/transactions" },
  { label: "Campaigns", path: "/campaigns" },
  { label: "Reports", path: "/reports" },
];

function isActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-6">
        {/* Nav pills */}
        <nav className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(location.pathname, link.path);
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className={
                  active
                    ? "whitespace-nowrap rounded-lg bg-[#131a33] px-3 py-1.5 text-sm font-semibold text-white transition-colors"
                    : "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                }
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center rounded-lg bg-gray-50 px-3 py-1.5 text-gray-400 shadow-sm md:flex">
            <span className="material-symbols-outlined mr-2 text-[18px] text-gray-400">search</span>
            <span className="text-sm text-gray-400">Search reports, listings, agents...</span>
            <kbd className="ml-3 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">⌘K</kbd>
          </div>

          <button
            type="button"
            className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <div className="flex items-center pl-1">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
