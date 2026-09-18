import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet, useLocation } from "react-router-dom";
import { Menu as MenuIcon, Search, X } from "lucide-react";
import { useApplyTheme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { NotificationsMenu } from "./NotificationsMenu";
import { CommandPalette } from "./CommandPalette";
import { UserMenu } from "./UserMenu";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function AppShell() {
  const location = useLocation();
  const theme = useTheme();
  useApplyTheme(theme);
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const ceo = theme === "ceo";

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
    <div className="flex h-full overflow-hidden bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:shadow-pop">
        Skip to content
      </a>

      <aside className={cn("hidden shrink-0 border-r border-line lg:block", ceo ? "w-[260px]" : "w-60")}>
        <Sidebar />
      </aside>

      {mobileNav &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} aria-hidden />
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
        <header
          className={cn(
            "z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6",
            ceo ? "bg-topbar" : "bg-topbar/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl",
          )}
        >
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            className="-ml-1.5 rounded p-1.5 text-ink-muted hover:bg-surface-hover lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" />
          </button>
          <img src="/logo1.png" alt="" className="size-7 lg:hidden" />

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "group ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border px-3 text-xs transition-colors lg:ml-0 lg:w-80 lg:max-w-none",
              ceo
                ? "border-line bg-field text-ink-faint hover:border-cyan-500/60"
                : "border-transparent bg-canvas text-ink-subtle shadow-sm hover:border-line",
            )}
          >
            <Search className={cn("size-4", ceo && "group-hover:text-cyan-400")} />
            <span className="flex-1 truncate text-left">{ceo ? "Search properties, leads, clients, pages…" : "Search listings, leads, clients…"}</span>
            <kbd className="hidden rounded border border-line bg-surface-hover px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle sm:inline">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <div className="flex items-center gap-3 lg:ml-auto">
            <NotificationsMenu />
            {ceo && (
              <>
                <div className="hidden h-6 w-px bg-line sm:block" />
                <div className="hidden sm:block">
                  <UserMenu variant="topbar" />
                </div>
              </>
            )}
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
