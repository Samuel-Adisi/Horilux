import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/use-toast";
import logo from "@/assets/logo1.png";
import { CEO_NAV } from "./ceoNav";

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
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30D");

  function handleSearch(term: string) {
    if (!term.trim()) return;
    const lower = term.toLowerCase();
    const hit = KEYWORD_ROUTES.find((r) => r.match(lower));
    navigate(hit ? hit.to : "/ceo/properties");
    if (!hit) toast({ title: `Searching enterprise records for "${term}"` });
    setSearch("");
  }

  return (
    <div className="h-full flex overflow-hidden font-sans text-sm bg-[#0b0f19] text-slate-200 dark">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 h-full bg-[#0d121f] border-r border-white/10 flex flex-col justify-between z-30 select-none">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <img src={logo} alt="Horilux" className="w-10 h-10 rounded-lg shadow-md flex-shrink-0" />
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
              Horilux{" "}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 font-mono tracking-normal">
                CEO OS
              </span>
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
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.to === "/ceo"}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-md text-left font-medium transition-colors ${
                        isActive ? "bg-blue-600 text-white" : "hover:text-white hover:bg-white/5"
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-mono text-[10px] rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 bg-[#0a0e17] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-slate-400">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0f19]">
        <header className="h-16 flex-shrink-0 border-b border-white/10 bg-[#0e1320] px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-6">
            <div className="relative w-80">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
                placeholder="Search metrics, escrow, 'East Legon', 'Agents'..."
                className="w-full bg-[#141a29] border border-white/10 focus:border-cyan-500 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                ↵
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#141a29] p-1 rounded-lg border border-white/10 text-xs text-slate-400">
              {["Today", "7D", "30D", "3M", "YTD"].map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    dateRange === r ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => toast({ title: "Generating Snapshot export…" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              Export Summary
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/ceo/settings")}>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-200 ring-2 ring-blue-500/50 group-hover:ring-blue-400 transition-all">
                  {user?.first_name?.[0] ?? "C"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0e1320] rounded-full" />
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">CEO</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet context={{ dateRange }} />
        </main>
      </div>
    </div>
  );
}
