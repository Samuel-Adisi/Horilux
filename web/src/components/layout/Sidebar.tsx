import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { getVisibleNavItems } from "@/config/navigation";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const items = getVisibleNavItems(user?.department?.name);

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-lg font-semibold" style={{ color: "#240270" }}>
          Horilux
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#240270]/10 text-[#240270]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
