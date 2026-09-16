import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCeoDashboard } from "@/features/dashboard/hooks/use-ceo-dashboard";

export default function CeoOverviewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, error } = useCeoDashboard();

  if (isLoading) return <div className="text-slate-400 text-sm p-6">Loading executive data…</div>;
  if (error || !data) return <div className="text-rose-400 text-sm p-6">Failed to load dashboard data.</div>;

  const { kpis, revenue_trend, conversion_funnel, agent_leaderboard } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-950/30 to-[#131926] p-6 rounded-2xl border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs border border-blue-500/30">
              LIVE PORTFOLIO
            </span>
            <span className="text-xs text-slate-400">Horilux Estates</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Command Summary & Performance Pulse</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Consolidated portfolio status across active listings, pipeline, and agent production.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/ceo/approvals")}
            className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Pending CEO Approvals
          </button>
          <button
            onClick={() => navigate("/ceo/ai-insights")}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            Run AI Diagnostic →
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          onClick={() => navigate("/ceo/revenue")}
          label="Gross Commission Rev"
          badge={`${kpis.revenue_growth_pct >= 0 ? "+" : ""}${kpis.revenue_growth_pct}% YoY`}
          value={`$${kpis.total_revenue.toLocaleString()}`}
          sub={`Target: $${kpis.revenue_target?.toLocaleString() ?? "—"}`}
          link="View P&L →"
          hover="hover:border-blue-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/properties")}
          label="Active Portfolio Units"
          badge="Listings"
          value={kpis.active_properties.toLocaleString()}
          sub={`${kpis.total_properties.toLocaleString()} total`}
          link="Catalog →"
          hover="hover:border-cyan-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/sales")}
          label="Closed Transactions"
          badge="MTD"
          value={`${kpis.properties_sold} Deals`}
          sub="Sales Funnel"
          link="Funnel →"
          hover="hover:border-purple-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/leads")}
          label="Total Leads"
          badge={`${kpis.new_leads} new`}
          value={kpis.total_leads.toLocaleString()}
          sub="Leads CRM"
          link="Leads CRM →"
          hover="hover:border-teal-500"
        />
      </div>

      {/* Funnel */}
      <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
        <h3 className="font-bold text-white text-base mb-4">Deal Velocity Funnel</h3>
        <div className="space-y-3.5">
          {conversion_funnel.map((stage) => (
            <div key={stage.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{stage.label}</span>
                <span className="font-mono text-white font-bold">
                  {stage.count} ({stage.pct}%)
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stage.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Leaderboard */}
      <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
        <h3 className="font-bold text-white text-base mb-4">Top Producer Leaderboard</h3>
        <div className="space-y-3">
          {agent_leaderboard.map((agent, i) => (
            <div key={agent.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <p className="text-xs font-bold text-white">{agent.name}</p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                ${agent.revenue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/ceo/agents")}
          className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          Manage Agents →
        </button>
      </div>
    </div>
  );
}

function KpiCard({
  onClick,
  label,
  badge,
  value,
  sub,
  link,
  hover,
}: {
  onClick: () => void;
  label: string;
  badge: string;
  value: string;
  sub: string;
  link: string;
  hover: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`executive-card bg-[#131926] border border-white/10 p-4 rounded-xl cursor-pointer transition-all group ${hover}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-slate-400 uppercase">{label}</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
          {badge}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-extrabold text-white font-mono">{value}</h3>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
        <span>{sub}</span>
        <span className="text-blue-400 group-hover:underline">{link}</span>
      </div>
    </div>
  );
}
