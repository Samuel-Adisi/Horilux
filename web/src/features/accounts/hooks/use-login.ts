import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "@/lib/token-storage";
import { login, fetchCurrentUser } from "../api/auth";
import { useAuthStore } from "../store/auth-store";
import type { LoginCredentials } from "../types";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ credentials }: { credentials: LoginCredentials; redirectTo?: string }) => {
      const tokens = await login(credentials);
      // Store tokens first so the /me request is authenticated, but only flip
      // the store to "authenticated" once we actually know who the user is.
      tokenStorage.set(tokens.access, tokens.refresh);
      try {
        const user = await fetchCurrentUser();
        return { tokens, user };
      } catch (err) {
        tokenStorage.clear();
        throw err;
      }
    },
    onSuccess: ({ tokens, user }, { redirectTo }) => {
      const store = useAuthStore.getState();
      store.setTokens(tokens.access, tokens.refresh);
      store.setUser(user);
      navigate(redirectTo ?? "/", { replace: true });
    },
  });
}
