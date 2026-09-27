import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Mail, Phone } from "lucide-react";

const CONTACT_EMAIL = "horiluxestates@gmail.com";

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

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      await api.post("/public/contact/", {
        name,
        email,
        phone,
        country,
        message,
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setSending(false);
    }
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
          <h1 className="font-serif text-xl sm:text-2xl md:text-4xl uppercase tracking-wide text-brand-blue mb-10">
            Get In Touch
          </h1>

          {submitted ? (
            <p className="font-serif text-lg text-neutral-700">
              Thank you &mdash; we will be in touch shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <>
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
              </>

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

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="mt-4 w-full sm:w-auto px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-brand-blue text-white font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-brand-blue/90 transition-colors disabled:opacity-60"
              >
                {sending ? "Sending..." : "Submit"}
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
          <h2 className="font-serif text-xl sm:text-2xl md:text-4xl uppercase tracking-wide mb-1">
            Horilux Estates
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-white/70 mb-8">
            Live Better, Invest Smart
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 text-lg mb-3 w-fit hover:underline underline-offset-4"
          >
            <Mail className="h-5 w-5 shrink-0" />
            {CONTACT_EMAIL}
          </a>
          <a
            href="tel:+233247628324"
            className="flex items-center gap-3 text-lg mb-3 w-fit hover:underline underline-offset-4"
          >
            <Phone className="h-5 w-5 shrink-0" />
            +233 24 762 8324
          </a>
          <a
            href="https://wa.me/233247628324"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-lg mb-3 w-fit hover:underline underline-offset-4"
            aria-label="Chat with us on WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12.05 2C6.579 2 2.13 6.448 2.13 11.92c0 1.816.487 3.517 1.334 4.984L2 22l5.242-1.438a9.83 9.83 0 0 0 4.808 1.242h.004c5.472 0 9.92-4.448 9.92-9.92 0-2.65-1.033-5.144-2.907-7.018A9.865 9.865 0 0 0 12.05 2zm0 18.033a8.1 8.1 0 0 1-4.13-1.13l-.296-.176-3.11.854.83-3.03-.192-.31a8.09 8.09 0 0 1-1.24-4.33c0-4.48 3.646-8.126 8.128-8.126a8.08 8.08 0 0 1 5.75 2.382 8.076 8.076 0 0 1 2.378 5.747c0 4.481-3.646 8.126-8.128 8.126z" />
            </svg>
            Chat on WhatsApp
          </a>
          <p className="text-lg">Accra, Ghana</p>
        </div>
      </div>
    </div>
  );
}
