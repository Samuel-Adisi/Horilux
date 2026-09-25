import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "./hooks/use-auth";

export default function RegisterPage() {
  const register = useRegister();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register.mutate({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      ...(phone ? { phone } : {}),
    });
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
            Join Horilux
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight uppercase">
            Create Account
          </h1>
        </div>
      </section>

      <section className="bg-white px-6 md:px-12 py-16 md:py-20">
        <div className="mx-auto max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-brand-taupe font-semibold mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-brand-taupe font-semibold mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

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
                Phone <span className="normal-case text-neutral-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
              />
              <p className="text-xs text-neutral-400 mt-1">At least 8 characters.</p>
            </div>

            {register.isError && (
              <p className="text-sm text-red-600">
                {(register.error as any)?.response?.data?.email?.[0] ||
                  "Could not create account. Please check your details and try again."}
              </p>
            )}

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-brand-blue text-white font-serif tracking-wider uppercase text-[11px] sm:text-xs hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {register.isPending ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-blue font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
