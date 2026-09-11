import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login, fetchCurrentUser } from "../api/auth";
import { useAuthStore } from "../store/auth-store";
import type { LoginCredentials } from "../types";

export function useLogin() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: async (tokens) => {
      setTokens(tokens.access, tokens.refresh);
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch {
        // /accounts/me/ not available yet — role-based nav will be limited until this is wired
      }
      navigate("/dashboard");
    },
  });
}
