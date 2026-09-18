import { useNavigate } from "react-router-dom";
import { logout } from "@/features/accounts/api/auth";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { tokenStorage } from "@/lib/token-storage";

export function useSignOut() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return () => {
    void logout(tokenStorage.getRefresh());
    clearAuth();
    navigate("/login", { replace: true });
  };
}
