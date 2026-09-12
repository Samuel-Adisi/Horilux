import { useState, type FormEvent } from "react";
import { useLogin } from "../hooks/use-login";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.7 19.7 0 0 1 4.22-5.44M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { mutate, isPending, isError, error } = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate({ email, password });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src="/assets/login-hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark contrast gradient rising from the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0" />
      {/* Extra pool of darkness right at the base for the wordmark */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

      {/* Brand mark, bottom-left, sitting on the image */}
      <div className="absolute bottom-10 left-10 flex items-center gap-3 text-white">
        <img src="/logo1.png" alt="" className="h-10 w-10 object-contain" />
        <span className="text-3xl font-semibold tracking-tight">Horilux Estates</span>
      </div>

      {/* Floating card */}
      <div className="relative z-10 flex min-h-screen items-center justify-end px-6 lg:px-20 py-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-2xl">
          <h1 className="text-3xl font-semibold text-midnight">Log in</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your credentials and get ready to explore!
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-2 focus-within:border-midnight">
              <span className="text-gray-400">
                <MailIcon />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Your Email"
                className="w-full bg-transparent text-sm text-midnight placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 border-b border-gray-200 pb-2 focus-within:border-midnight">
              <span className="text-gray-400">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your Password"
                className="w-full bg-transparent text-sm text-midnight placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-midnight focus:ring-midnight"
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            {isError && (
              <p className="text-sm text-red-600">
                {(error as any)?.response?.data?.detail || "Invalid credentials"}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Signing in..." : "Log in"}
            </button>

            <button
              type="button"
              onClick={() => {
                // TODO: wire up Google OAuth flow
              }}
              className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-blue-600 bg-white py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04l2.97-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.96l2.97 2.34C4.66 5.17 6.65 3.58 9 3.58z" />
              </svg>
              Log in with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Doesn&apos;t have an account?{" "}
            <a href="/signup" className="font-medium text-blue-600 hover:underline">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}