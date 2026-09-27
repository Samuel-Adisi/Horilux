import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import logo from "@/assets/logo.png";

export default function Header() {
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setAccountMenuOpen(false);
    navigate("/");
  }
  const isHome = pathname === "/" || pathname.startsWith("/listings") || pathname === "/about" || pathname === "/login" || pathname === "/register" || pathname === "/favorites";
  const [menuOpen, setMenuOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  const mobileNavLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/about", label: "About", end: false },
    { to: "/contact", label: "Contact", end: false },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-block pb-1 text-sm uppercase tracking-wide transition-colors group ${
      isHome
        ? isActive
          ? "text-white"
          : "text-white/75 hover:text-white"
        : isActive
        ? "text-brand-blue"
        : "text-neutral-600 hover:text-brand-blue"
    }`;

  function NavUnderline({ isActive }: { isActive: boolean }) {
    return (
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 -bottom-0.5 h-px w-full origin-center transition-transform duration-300 ease-out ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        } ${isHome ? "bg-white" : "bg-brand-blue"}`}
      />
    );
  }

  return (
    <header
      className={
        isHome
          ? "absolute top-0 left-0 w-full z-40 bg-transparent"
          : "sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200"
      }
    >
      {isHome && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={logo}
            alt=""
            className={`h-8 sm:h-10 w-auto object-contain shrink-0 ${isHome ? "" : "brightness-0"}`}
          />
          <div className="flex flex-col leading-tight min-w-0">
            <span
              className={`text-base sm:text-xl md:text-2xl font-serif tracking-tight whitespace-nowrap truncate ${
                isHome ? "text-white" : "text-brand-blue"
              }`}
              style={{
                display: "inline-block",
                animation: "logo-spin-once 1.3s cubic-bezier(0.65, 0, 0.35, 1) both",
                backfaceVisibility: "hidden",
              }}
            >
              Horilux Estates
            </span>
            <span
              className={`block text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] whitespace-nowrap ${
                isHome ? "text-white/70" : "text-brand-taupe"
              }`}
            >
              Live Better, Invest Smart
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>
            {({ isActive }) => (
              <>
                Home
                <NavUnderline isActive={isActive} />
              </>
            )}
          </NavLink>
          <div className="relative" onMouseEnter={() => setPropertiesOpen(true)} onMouseLeave={() => setPropertiesOpen(false)}>
            <NavLink to="/listings" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Properties
                  <NavUnderline isActive={isActive || propertiesOpen} />
                </>
              )}
            </NavLink>
            <div
              className={`absolute top-full left-0 pt-3 w-48 z-50 transition-all duration-200 ease-out ${
                propertiesOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-1 invisible pointer-events-none"
              }`}
            >
              <div className="bg-white rounded-md shadow-lg border border-neutral-100 py-2">
                <Link to="/listings" onClick={() => setPropertiesOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-[#F4EFE6] hover:text-brand-blue transition-colors">All Properties</Link>
                <Link to="/listings?listing_type=rent" onClick={() => setPropertiesOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-[#F4EFE6] hover:text-brand-blue transition-colors">For Rent</Link>
                <Link to="/listings?listing_type=sale" onClick={() => setPropertiesOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-[#F4EFE6] hover:text-brand-blue transition-colors">For Sale</Link>
              </div>
            </div>
          </div>
          <NavLink to="/about" className={navLinkClass}>
            {({ isActive }) => (
              <>
                About
                <NavUnderline isActive={isActive} />
              </>
            )}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {({ isActive }) => (
              <>
                Contact
                <NavUnderline isActive={isActive} />
              </>
            )}
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {customer ? (
            <>
              <Link
                to="/favorites"
                className={`hidden md:inline-block text-sm uppercase tracking-wide transition-colors ${
                  isHome ? "text-white/75 hover:text-white" : "text-neutral-600 hover:text-brand-blue"
                }`}
              >
                Favorites
              </Link>
              <div
                className="relative hidden md:block"
                onMouseEnter={() => setAccountMenuOpen(true)}
                onMouseLeave={() => setAccountMenuOpen(false)}
              >
                <button
                  type="button"
                  className={
                    isHome
                      ? "text-xs sm:text-sm font-semibold text-white border border-white/60 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full hover:bg-white/10 transition-colors"
                      : "text-xs sm:text-sm font-semibold text-white bg-brand-blue px-4 py-1.5 sm:px-5 sm:py-2 rounded-full hover:opacity-90 transition-opacity"
                  }
                >
                  {customer.first_name || "Account"}
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm text-neutral-700 shadow-lg ring-1 ring-black/10 hover:bg-neutral-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className={
                (isHome
                  ? "text-xs sm:text-sm font-semibold text-white border border-white/60 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full hover:bg-white/10 transition-colors"
                  : "text-xs sm:text-sm font-semibold text-white bg-brand-blue px-4 py-1.5 sm:px-5 sm:py-2 rounded-full hover:opacity-90 transition-opacity") +
                " hidden md:inline-block"
              }
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setPropertiesOpen(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 shrink-0 ${
              isHome ? "text-white" : "text-brand-blue"
            }`}
          >
            <span
              className={`block h-0.5 w-6 bg-current transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-opacity ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl">
          <nav className="flex flex-col px-8 py-2">
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `-mx-4 px-4 py-5 text-[15px] uppercase tracking-[0.15em] font-medium rounded-md transition-colors ${
                  isActive ? "bg-[#F4EFE6] text-brand-blue" : "text-brand-blue/90 hover:bg-[#F4EFE6]"
                }`
              }
            >
              Home
            </NavLink>

            <button
              type="button"
              onClick={() => setPropertiesOpen((v) => !v)}
              aria-expanded={propertiesOpen}
              className="-mx-4 px-4 py-5 flex items-center justify-between text-[15px] uppercase tracking-[0.15em] font-medium rounded-md transition-colors text-brand-blue/90 hover:bg-[#F4EFE6]"
            >
              Properties
              <svg
                className={`h-4 w-4 transition-transform ${propertiesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {propertiesOpen && (
              <div className="flex flex-col pl-4 pb-2">
                <Link to="/listings" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm uppercase tracking-[0.1em] text-brand-blue/70 hover:text-brand-blue">All Properties</Link>
                <Link to="/listings?listing_type=rent" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm uppercase tracking-[0.1em] text-brand-blue/70 hover:text-brand-blue">For Rent</Link>
                <Link to="/listings?listing_type=sale" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm uppercase tracking-[0.1em] text-brand-blue/70 hover:text-brand-blue">For Sale</Link>
              </div>
            )}

            {mobileNavLinks.slice(1).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `-mx-4 px-4 py-5 text-[15px] uppercase tracking-[0.15em] font-medium rounded-md transition-colors ${
                    isActive ? "bg-[#F4EFE6] text-brand-blue" : "text-brand-blue/90 hover:bg-[#F4EFE6]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="my-1 border-t border-neutral-100" />
            {customer ? (
              <>
                <NavLink
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `-mx-4 px-4 py-5 text-[15px] uppercase tracking-[0.15em] font-medium rounded-md transition-colors ${
                      isActive ? "bg-[#F4EFE6] text-brand-blue" : "text-brand-blue/90 hover:bg-[#F4EFE6]"
                    }`
                  }
                >
                  Favorites
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="-mx-4 px-4 py-5 text-left text-[15px] uppercase tracking-[0.15em] font-medium rounded-md text-brand-blue/90 hover:bg-[#F4EFE6] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `-mx-4 px-4 py-5 text-[15px] uppercase tracking-[0.15em] font-medium rounded-md transition-colors ${
                    isActive ? "bg-[#F4EFE6] text-brand-blue" : "text-brand-blue/90 hover:bg-[#F4EFE6]"
                  }`
                }
              >
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
