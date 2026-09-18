import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { fetchCurrentUser } from "@/features/accounts/api/auth";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { Button } from "@/components/ui/button";
import { getStatus } from "@/lib/api-client";

/** Gate for every signed-in route. Loads the current user exactly once per session. */
export function RequireAuth() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || status !== "loading") return;
    let cancelled = false;
    fetchCurrentUser()
      .then((u) => !cancelled && setUser(u))
      .catch((err) => {
        if (cancelled) return;
        // 401s are handled by the API client (refresh, then sign-out).
        if (getStatus(err) === 401) return;
        if (getStatus(err) === 403) clearAuth();
        else setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, status, setUser, clearAuth, attempt]);

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={from !== "/" ? { from } : undefined} />;
  }

  if (failed) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-bold text-ink">Can't reach Horilux right now</p>
        <p className="max-w-sm text-sm text-ink-muted">Check your internet connection. Your session is still saved.</p>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => clearAuth()}>Sign out</Button>
          <Button
            variant="primary"
            onClick={() => {
              setFailed(false);
              setAttempt((a) => a + 1);
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="flex min-h-full items-center justify-center" aria-busy="true" aria-label="Loading">
        <img src="/brand-mark.png" alt="" className="size-10 animate-pulse" />
      </div>
    );
  }

  return <Outlet />;
}
