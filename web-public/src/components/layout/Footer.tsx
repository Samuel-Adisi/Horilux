import { Link } from "react-router-dom";
import { MessageCircle, Phone, Mail } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-xl font-bold mb-1">Horilux Estates</h3>
          <p className="text-xs uppercase tracking-[0.15em] text-white/60 mb-3">
            Live Better, Invest Smart
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Premium real estate across Ghana — homes, land, and investment
            properties handled with care.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/listings" className="hover:text-white/80">All Listings</Link></li>
            <li><Link to="/about" className="hover:text-white/80">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white/80">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
            Follow Us
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
                <a
                href="https://www.facebook.com/share/18i5f5smVC/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
            </li>
            <li>
                <a
                href="https://www.tiktok.com/@horilux.estates?_r=1&_t=ZS-9A5ciJAnCD7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <TikTokIcon className="h-4 w-4" />
                TikTok
              </a>
            </li>
            <li>
                <a
                href="https://www.instagram.com/horiluxestates?stkn=MTFyMXBxYjkzYmt2aA%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
            Contact
          </h4>
            <a
            href="mailto:info@horiluxestates.com"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" />
            info@horiluxestates.com
          </a>
            <a
            href="tel:+233247628324"
            className="mt-2 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4" />
            +233 24 762 8324
          </a>
            <a
            href="https://wa.me/233247628324"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            aria-label="Chat with us on WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Horilux Estates. All rights reserved.
      </div>
    </footer>
  );
}
