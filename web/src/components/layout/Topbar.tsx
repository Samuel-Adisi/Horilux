import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const roleLabel = user?.roles?.[0]?.name ?? "";
  const deptLabel = user?.department?.name ?? "";

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
          <p className="text-xs text-gray-500 capitalize">
            {roleLabel} {deptLabel && `· ${deptLabel}`}
          </p>
        </div>
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
