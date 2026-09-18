import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { getErrorMessage, getStatus } from "@/lib/api-client";
import { useAuthStore } from "../store/auth-store";
import { useLogin } from "../hooks/use-login";

export function LoginPage() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const expired = useAuthStore((s) => s.expired);
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  if (isAuthenticated && !login.isPending) {
    return <Navigate to={from ?? "/"} replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ credentials: { email: email.trim(), password }, redirectTo: from });
  }

  const errorMessage = login.isError
    ? getStatus(login.error) === 401 || getStatus(login.error) === 400
      ? "That email and password don't match an active account."
      : getErrorMessage(login.error)
    : null;

  return (
    <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col bg-surface px-6 py-8 sm:px-12">
        <div className="flex items-center gap-2.5">
          <img src="/brand-mark.png" alt="" className="size-8" />
          <span className="text-base font-bold tracking-tight text-brand">Horilux Estates</span>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-ink-muted">Use the work email your administrator set up for you.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            {expired && !login.isError && (
              <div className="rounded border border-kokoda-100 bg-kokoda-50 px-3 py-2 text-sm text-kokoda-700">
                Your session expired. Sign in again to continue.
              </div>
            )}
            <FormError message={errorMessage} />

            <Field label="Email">
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@horiluxestates.com"
                  className="h-10"
                />
              )}
            </Field>

            <Field label="Password">
              {(p) => (
                <div className="relative">
                  <Input
                    {...p}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded text-ink-subtle hover:text-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              )}
            </Field>

            <Button
              type="submit"
              variant="primary"
              className="h-10 w-full"
              loading={login.isPending}
              disabled={!email.trim() || !password}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-xs text-ink-subtle">
            Forgotten your password? Ask your administrator to reset it from the staff directory.
          </p>
        </div>

        <p className="text-2xs text-ink-faint">© {new Date().getFullYear()} Horilux Estates</p>
      </div>

      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <img src="/assets/login-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent" />
        <div className="motif-slant absolute -right-24 top-0 h-full w-1/2 text-white/[0.07]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-md text-2xl font-semibold leading-snug tracking-tight">
            Listings, clients, viewings and deals, from first enquiry to commission paid.
          </p>
          <p className="mt-3 text-sm text-white/60">Horilux Estates operations platform</p>
        </div>
      </div>
    </div>
  );
}
