import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Heart, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useFavoritesCount } from "@/features/favorites/hooks/use-saved-properties";

const PROPERTY_LINKS = [
  { to: "/listings", label: "All Properties" },
  { to: "/listings?listing_type=sale", label: "For Sale" },
  { to: "/listings?listing_type=rent", label: "For Rent" },
  { to: "/listings?property_type=residential", label: "Residential" },
  { to: "/listings?property_type=commercial", label: "Commercial" },
];

export default function Header() {
  const { pathname, search } = useLocation();
  const favCount = useFavoritesCount();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const overHero =
    pathname === "/" || pathname.startsWith("/listings") || pathname === "/about" || pathname === "/favorites";
  const onDark = overHero && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "relative inline-flex min-h-11 items-center text-[13px] font-medium uppercase tracking-[0.14em] transition-colors " +
    (onDark
      ? isActive ? "text-white" : "text-white/80 hover:text-white"
      : isActive ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue");

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    "flex min-h-12 items-center rounded-xl px-4 text-[15px] font-medium uppercase tracking-[0.14em] transition-colors " +
    (isActive ? "bg-sand text-brand-blue" : "text-brand-blue/90 hover:bg-sand");

  const iconBtn = onDark ? "text-white" : "text-brand-blue";

  return (
    <header
      className={
        (overHero ? "fixed inset-x-0 top-0 " : "sticky top-0 ") +
        "z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 " +
        (onDark ? "bg-transparent" : "border-b border-line bg-white/90 shadow-sm backdrop-blur-md")
      }
    >
      {onDark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40"
          style={{ backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.2) 60%, rgba(0,0,0,0))" }}
        />
      )}

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" aria-label="Horilux Estates home" className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className={"h-9 w-auto shrink-0 object-contain sm:h-10 " + (onDark ? "" : "brightness-0")} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className={"truncate font-serif text-lg tracking-tight sm:text-2xl " + (onDark ? "text-white" : "text-brand-blue")}>
              Horilux Estates
            </span>
            <span className={"truncate text-[9px] uppercase tracking-[0.16em] sm:text-[11px] " + (onDark ? "text-white/75" : "text-brand-taupe")}>
              Live Better, Invest Smart
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={linkClass}>Home</NavLink>

          <div
            ref={dropRef}
            className="relative flex items-center"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
            onBlur={(e) => {
              if (!dropRef.current?.contains(e.relatedTarget as Node)) setDropOpen(false);
            }}
          >
            <NavLink to="/listings" end={false} className={linkClass}>Properties</NavLink>
            <button
              type="button"
              aria-label="Properties menu"
              aria-haspopup="true"
              aria-expanded={dropOpen}
              onClick={() => setDropOpen((v) => !v)}
              className={"ml-1 flex h-11 w-8 items-center justify-center " + iconBtn}
            >
              <ChevronDown className={"h-4 w-4 transition-transform " + (dropOpen ? "rotate-180" : "")} aria-hidden />
            </button>
            {dropOpen && (
              <div className="absolute left-0 top-full z-50 w-56 pt-2 animate-menu-in">
                <ul className="overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-xl">
                  {PROPERTY_LINKS.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        onClick={() => setDropOpen(false)}
                        className="flex min-h-11 items-center px-5 text-sm text-neutral-700 transition-colors hover:bg-sand hover:text-brand-blue"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/favorites"
            aria-label={"Favorites" + (favCount > 0 ? ", " + favCount + " saved" : "")}
            className={"relative flex h-11 w-11 items-center justify-center " + iconBtn}
          >
            <Heart className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            {favCount > 0 && (
              <span
                className={
                  "absolute right-0.5 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none " +
                  (onDark ? "bg-white text-brand-blue" : "bg-brand-blue text-white")
                }
              >
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={"flex h-11 w-11 items-center justify-center md:hidden " + iconBtn}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute left-0 top-full max-h-[calc(100dvh-5rem)] w-full overflow-y-auto border-t border-line bg-white px-4 pb-6 pt-3 shadow-2xl animate-menu-in md:hidden"
        >
          <NavLink to="/" end className={mobileLink}>Home</NavLink>
          <p className="px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-taupe">Properties</p>
          {PROPERTY_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="flex min-h-12 items-center rounded-xl px-4 text-sm uppercase tracking-[0.12em] text-brand-blue/80 hover:bg-sand">
              {l.label}
            </Link>
          ))}
          <div className="my-3 border-t border-line" />
          <NavLink to="/about" className={mobileLink}>About</NavLink>
          <NavLink to="/contact" className={mobileLink}>Contact</NavLink>
          <NavLink to="/favorites" className={mobileLink}>
            Favorites{favCount > 0 ? " (" + favCount + ")" : ""}
          </NavLink>
        </nav>
      )}
    </header>
  );
}
