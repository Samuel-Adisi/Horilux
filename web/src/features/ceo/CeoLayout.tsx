import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { useToast } from "@/components/ui/use-toast";
import { CEO_NAV } from "./ceoNav";
import { useGlobalSearch, type GlobalSearchResult } from "./hooks/use-global-search";

const KEYWORD_ROUTES: { match: (t: string) => boolean; to: string }[] = [
  { match: (t) => /rev|fin/.test(t), to: "/ceo/revenue" },
  { match: (t) => /prop|house|villa/.test(t), to: "/ceo/properties" },
  { match: (t) => /agent|broker/.test(t), to: "/ceo/agents" },
  { match: (t) => /appr|escrow|sign/.test(t), to: "/ceo/approvals" },
  { match: (t) => /lead|crm/.test(t), to: "/ceo/leads" },
  { match: (t) => /loc|legon|airport/.test(t), to: "/ceo/locations" },
  { match: (t) => /ai|insight/.test(t), to: "/ceo/ai-insights" },
];

export default function CeoLayout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const avatarUrl = (user as unknown as { avatar_url?: string })?.avatar_url;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults, isFetching: isSearching } = useGlobalSearch(search);

  useEffect(() => {
    function handleClickOutsideSearch(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  function goToResult(result: GlobalSearchResult) {
    navigate(result.path);
    setSearch("");
    setSearchOpen(false);
  }

  function handleSearch(term: string) {
    if (!term.trim()) return;
    const lower = term.toLowerCase();
    const hit = KEYWORD_ROUTES.find((r) => r.match(lower));
    if (hit) {
      navigate(hit.to);
      setSearch("");
      setSearchOpen(false);
      return;
    }
    navigate(`/ceo/properties?search=${encodeURIComponent(term)}`);
    setSearch("");
    setSearchOpen(false);
  }

  const groupedResults: { label: string; items: GlobalSearchResult[] }[] = searchResults
    ? [
        { label: "Properties", items: searchResults.properties },
        { label: "Leads", items: searchResults.leads },
        { label: "Clients", items: searchResults.clients },
        { label: "Staff", items: searchResults.staff },
      ].filter((g) => g.items.length > 0)
    : [];

  return (
    <div className="h-full flex overflow-hidden font-sans text-sm bg-[#0b0f19] text-slate-200 dark">
      <aside className="w-[260px] flex-shrink-0 h-full bg-[#0d121f] border-r border-white/10 flex flex-col justify-between z-30 select-none">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <img src="/logo1.png" alt="Horilux" className="w-10 h-10 rounded-lg shadow-md flex-shrink-0" />
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">
              Horilux
            </h1>
            <p className="text-[11px] text-slate-400 truncate">Real Estate Command Center</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5 text-xs text-slate-400">
          {CEO_NAV.map((group) => (
            <div key={group.label}>
              <span className="px-3 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
                {group.label}
              </span>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      end={item.to === "/ceo"}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left font-medium transition-colors ${
                          isActive ? "bg-blue-600 text-white" : "hover:text-white hover:bg-white/5"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : item.color}`} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-mono text-[10px] rounded-full">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0f19]">
        <header className="h-16 flex-shrink-0 border-b border-white/10 bg-[#0e1320] px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-6">
            <div className="relative w-80 group" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => search.trim() && setSearchOpen(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
                placeholder="Search metrics, escrow, 'East Legon', 'Agents'..."
                className="w-full h-9 bg-[#141a29] border border-white/10 focus:border-cyan-500/60 rounded-lg pl-9 pr-10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {search ? (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                  ↵
                </span>
              ) : null}

              {searchOpen && search.trim().length > 1 ? (
                <div className="absolute left-0 top-full mt-2 w-[420px] max-h-96 overflow-y-auto bg-[#141a29] border border-white/10 rounded-lg shadow-xl z-40">
                  {isSearching && groupedResults.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400">Searching…</p>
                  ) : groupedResults.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400">No matches. Press Enter to search properties.</p>
                  ) : (
                    groupedResults.map((group) => (
                      <div key={group.label} className="py-1.5">
                        <p className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => goToResult(item)}
                            className="w-full flex flex-col items-start px-4 py-2 text-left hover:bg-white/5 transition-colors"
                          >
                            <span className="text-xs font-semibold text-white">{item.title}</span>
                            <span className="text-[11px] text-slate-400">{item.subtitle}</span>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toast({ title: "Generating Snapshot export…" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              Export Summary
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  {avatarUrl && !avatarFailed ? (
                    <img
                      src={avatarUrl}
                      alt={user?.full_name ?? "Profile"}
                      onError={() => setAvatarFailed(true)}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50 group-hover:ring-blue-400 transition-all"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-200 ring-2 ring-blue-500/50 group-hover:ring-blue-400 transition-all">
                      {user?.first_name?.[0] ?? "C"}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0e1320] rounded-full" />
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{user?.roles?.[0]?.name ?? "\u2014"}</p>
                </div>
                <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#141a29] border border-white/10 rounded-lg shadow-xl overflow-hidden z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/ceo/settings");
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </button>
                  <div className="h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
