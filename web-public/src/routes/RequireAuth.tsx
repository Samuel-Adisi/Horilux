import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";

export default function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
