import { create } from "zustand";
import { setSessionExpiredHandler } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";
import { queryClient } from "@/lib/query-client";
import type { User } from "../types";

type SessionStatus = "anonymous" | "loading" | "ready";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** "loading" while we have a token but haven't fetched /accounts/me/ yet. */
  status: SessionStatus;
  /** Set when the session ended because a token expired, so login can say why. */
  expired: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  clearAuth: (opts?: { expired?: boolean }) => void;
}

const hasToken = !!tokenStorage.getAccess();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: hasToken,
  status: hasToken ? "loading" : "anonymous",
  expired: false,

  setTokens: (access, refresh) => {
    tokenStorage.set(access, refresh);
    set({ isAuthenticated: true, status: "loading", expired: false });
  },

  setUser: (user) => set({ user, status: "ready" }),

  clearAuth: (opts) => {
    tokenStorage.clear();
    queryClient.clear();
    set({ user: null, isAuthenticated: false, status: "anonymous", expired: !!opts?.expired });
  },
}));

setSessionExpiredHandler(() => {
  if (useAuthStore.getState().isAuthenticated) {
    useAuthStore.getState().clearAuth({ expired: true });
  }
});
