import { useState } from "react";
import { useNavigate } from "react-router-dom";

const inputClass =
  "w-full rounded-2xl bg-white px-5 py-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow";

export default function ContactPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // NOTE: no general-purpose contact endpoint exists on the backend yet.
    // This form is fully built and validated on the frontend but has nothing
    // to submit to until that endpoint is added.
    console.warn("Contact form submitted locally — no backend endpoint wired yet.", {
      name,
      email,
      phone,
      country,
      message,
      consent,
    });
    setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen grid grid-cols-1 md:grid-cols-2">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Close"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-50 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10 text-brand-blue hover:bg-neutral-100 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
          <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* Left: form */}
      <div className="bg-cream px-6 sm:px-12 lg:px-16 py-16 md:py-24 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto md:mx-0">
          <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-wide text-brand-blue mb-10">
            Get In Touch
          </h1>

          {submitted ? (
            <p className="font-serif text-lg text-neutral-700">
              Thank you &mdash; we will be in touch shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Name*"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="email"
                  required
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Country of origin"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                />
              </div>

              <textarea
                placeholder="Message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass + " resize-y"}
              />

              <label className="flex items-start gap-3 text-xs text-neutral-500 leading-relaxed pt-2">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-brand-blue focus:ring-brand-blue/30"
                />
                <span>
                  By providing Horilux Estates your contact information, you acknowledge and agree
                  to our Privacy Policy and consent to receiving marketing communications,
                  including through calls, texts, and emails. This consent isn&apos;t necessary for
                  purchasing any products or services and you may opt out at any time.
                </span>
              </label>

              <button
                type="submit"
                className="mt-4 w-full sm:w-auto px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-brand-blue text-white font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-brand-blue/90 transition-colors"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right: image + company info */}
      <div className="relative min-h-[420px] md:min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(10,10,20,0.55), rgba(10,10,20,0.15)), url(\'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop\')",
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 md:py-24 text-white">
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-wide mb-1">
            Horilux Estates
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-white/70 mb-8">
            Live Better, Invest Smart
          </p>
          <a href="mailto:info@horiluxestates.com" className="underline underline-offset-4 text-lg mb-3 w-fit">
            info@horiluxestates.com
          </a>
          <p className="text-lg mb-3">+233247628324</p>
          <p className="text-lg">Accra, Ghana</p>
        </div>
      </div>
    </div>
  );
}
