import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "./hooks/use-auth";

export default function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div>
      <section
        className="relative min-h-[50vh] flex items-end px-6 md:px-12 pb-16"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(10,10,20,0.8), rgba(10,10,20,0.15)), linear-gradient(135deg, #240270, #003E03)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10">
          <p className="text-white/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
            Welcome back
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-white leading-tight uppercase">
            Sign In
          </h1>
        </div>
      </section>

      <section className="bg-white px-6 md:px-12 py-16 md:py-20">
        <div className="mx-auto max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-brand-taupe font-semibold mb-1 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-brand-taupe font-semibold mb-1 block">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>

            {login.isError && (
              <p className="text-sm text-red-600">
                Could not sign in. Check your email and password and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full px-6 py-3 rounded-full bg-brand-blue text-white font-serif tracking-wider uppercase text-xs hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {login.isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-brand-blue font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
