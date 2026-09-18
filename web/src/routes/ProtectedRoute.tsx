import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { fetchCurrentUser } from "@/features/accounts/api/auth";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser()
        .then(setUser)
        .catch(() => {
          // token may be stale/invalid -- let the normal 401 refresh/logout
          // flow in api-client handle it, nothing to do here
        });
    }
  }, [isAuthenticated, user, setUser]);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
