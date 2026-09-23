import { Link } from "react-router-dom";

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
            Account
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white/80">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white/80">Create Account</Link></li>
            <li><Link to="/account" className="hover:text-white/80">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
            Contact
          </h4>
          <p className="text-sm text-white/70">info@horiluxestates.com</p>
          <p className="text-sm text-white/70">+233247628324</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Horilux Estates. All rights reserved.
      </div>
    </footer>
  );
}
