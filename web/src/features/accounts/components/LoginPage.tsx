import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
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

  const fieldRow = "flex items-center gap-3 border-b border-gray-200 pb-2 transition-colors focus-within:border-[#240270]";

  return (
    <div className="relative min-h-full w-full overflow-hidden bg-black">
      <img src="/assets/login-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

      <div className="absolute bottom-10 left-10 hidden items-center gap-3 text-white md:flex">
        <img src="/logo.png" alt="" className="size-10 object-contain" />
        <span className="text-3xl font-semibold tracking-tight">Horilux Estates</span>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 md:justify-end lg:px-20">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl sm:p-10">
          <div className="mb-6 flex items-center gap-2.5 md:hidden">
            <img src="/logo1.png" alt="" className="size-8" />
            <span className="text-base font-semibold text-[#240270]">Horilux Estates</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#240270]">Log in</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your work email and password to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {expired && !login.isError && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Your session expired. Log in again to continue.</p>
            )}

            <div className={fieldRow}>
              <Mail className="size-[18px] text-gray-400" aria-hidden />
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full bg-transparent text-sm text-[#240270] placeholder:text-gray-400 focus:outline-none focus-visible:ring-0"
              />
            </div>

            <div className={fieldRow}>
              <Lock className="size-[18px] text-gray-400" aria-hidden />
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Password"
                className="w-full bg-transparent text-sm text-[#240270] placeholder:text-gray-400 focus:outline-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending || !email.trim() || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {login.isPending && <Loader2 className="size-4 animate-spin" />}
              {login.isPending ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">Forgot your password? Ask your administrator to reset it.</p>
        </div>
      </div>
    </div>
  );
}
