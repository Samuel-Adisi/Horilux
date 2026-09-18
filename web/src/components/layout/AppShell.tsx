import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet, useLocation } from "react-router-dom";
import { Menu as MenuIcon, Search, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationsMenu } from "./NotificationsMenu";
import { CommandPalette } from "./CommandPalette";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function AppShell() {
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Each page starts at the top. (The mobile drawer closes itself via onNavigate.)
  useEffect(() => {
    document.getElementById("main")?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="flex h-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow-pop">
        Skip to content
      </a>

      <aside className="hidden w-60 shrink-0 border-r border-line lg:block">
        <Sidebar />
      </aside>

      {mobileNav &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileNav(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-in-left shadow-pop">
              <Sidebar onNavigate={() => setMobileNav(false)} />
              <button
                type="button"
                onClick={() => setMobileNav(false)}
                className="absolute right-2 top-3 rounded p-1.5 text-ink-subtle hover:bg-surface-hover"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>,
          document.body,
        )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            className="-ml-1.5 rounded p-1.5 text-ink-muted hover:bg-surface-hover lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" />
          </button>
          <img src="/brand-mark.png" alt="" className="size-6 lg:hidden" />

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex h-8 w-full max-w-sm items-center gap-2 rounded border border-line-strong bg-surface-sunken px-2.5 text-sm text-ink-subtle transition-colors hover:border-ink-faint lg:ml-0"
          >
            <Search className="size-4" />
            <span className="flex-1 truncate text-left">Search</span>
            <kbd className="hidden rounded-sm border border-line bg-white px-1.5 text-2xs font-semibold sm:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>

          <div className="flex items-center gap-1 lg:ml-auto">
            <NotificationsMenu />
          </div>
        </header>

        <main id="main" className="scrollbar-thin flex-1 overflow-y-auto" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
