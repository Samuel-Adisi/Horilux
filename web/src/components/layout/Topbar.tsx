import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";

const TITLE_RULES: { test: (path: string) => boolean; title: string }[] = [
  { test: (p) => p === "/dashboard", title: "Dashboard" },
  { test: (p) => p === "/properties/new", title: "New Property" },
  { test: (p) => /^\/properties\/[^/]+$/.test(p), title: "Property Details" },
  { test: (p) => p === "/properties", title: "Properties" },
  { test: (p) => p === "/leads/new", title: "New Lead" },
  { test: (p) => p === "/leads", title: "Leads" },
  { test: (p) => p === "/viewings/new", title: "New Viewing" },
  { test: (p) => p === "/viewings", title: "Viewings" },
  { test: (p) => p === "/transactions/new", title: "New Transaction" },
  { test: (p) => p === "/transactions", title: "Transactions" },
  { test: (p) => p === "/campaigns/new", title: "New Campaign" },
  { test: (p) => p === "/campaigns", title: "Campaigns" },
  { test: (p) => p === "/reports", title: "Reports" },
];

function getPageTitle(pathname: string): string {
  return TITLE_RULES.find((rule) => rule.test(pathname))?.title ?? "";
}

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const pageTitle = getPageTitle(location.pathname);

  const roleLabel = user?.roles?.[0]?.name ?? "";
  const deptLabel = user?.department?.name ?? "";

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-[15px] font-semibold text-[#17131F]">{pageTitle}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
          <p className="text-xs text-gray-500 capitalize">
            {roleLabel} {deptLabel && roleLabel !== deptLabel && `· ${deptLabel}`}
          </p>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
