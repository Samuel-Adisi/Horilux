import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCeoDashboard } from "@/features/dashboard/hooks/use-ceo-dashboard";
import { useRecentActivity } from "@/features/ceo/hooks/use-recent-activity";
import { usePropertyPerformance } from "@/features/property-performance/hooks/use-property-performance";
import { useGovernanceActions } from "@/features/ceo/hooks/use-governance-actions";
import { useTerritoryIntelligence } from "@/features/ceo/hooks/use-territory-intelligence";
import { ScheduleBriefingModal } from "@/features/tasks/components/ScheduleBriefingModal";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/accounts/store/auth-store";

// Sections below have no backend model yet — governance action center,
// top assets, territory geo, marketing ROAS by channel, rental/occupancy,
// milestone tracker, AI diagnostic, forecast, activity feed, platform
// health. Swap for real data once those endpoints/models exist (see
// chat notes for the model list).

const RANGE_OPTIONS = ["M", "Q", "Y"] as const;

function formatGHS(value: number): string {
  return `GH₵${Math.round(value).toLocaleString()}`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityLabel(action: string, model: string): string {
  const verb = action.charAt(0).toUpperCase() + action.slice(1);
  return `${verb}: ${model}`;
}

function activityColor(action: string): string {
  if (action === "create") return "emerald";
  if (action === "delete") return "rose";
  if (action === "update") return "blue";
  return "slate";
}

function regionBadge(pct: number | null): { text: string; color: string } {
  if (pct === null) return { text: "No region data", color: "slate" };
  const sign = pct >= 0 ? "+" : "";
  return { text: `${sign}${pct}% vs region avg`, color: pct >= 0 ? "emerald" : "amber" };
}

function initials(title: string): string {
  return title.trim().charAt(0).toUpperCase() || "?";
}

function formatGHSCompact(value: number): string {
  if (value >= 1_000_000) return `GH₵${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `GH₵${(value / 1_000).toFixed(0)}K`;
  return `GH₵${Math.round(value)}`;
}

const CORRIDOR_COLORS = ["bg-indigo-400", "bg-amber-400", "bg-violet-400", "bg-emerald-400", "bg-blue-400", "bg-rose-400"];

export default function CeoOverviewPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { data, isLoading, error } = useCeoDashboard();
  const { data: activityData } = useRecentActivity();
  const { data: perfData } = usePropertyPerformance();

  const handleExportBoardPack = async () => {
    setIsExportingPdf(true);
    try {
      const response = await apiClient.get("/reports/board-pack-pdf/", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "horilux-board-pack.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export board pack PDF:", err);
      alert("Failed to export the board pack PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };
  const activeCount = perfData
    ? (perfData.status_funnel["published"] ?? 0) + (perfData.status_funnel["under_offer"] ?? 0)
    : 0;
  const soldCount = perfData?.status_funnel["sold_rented"] ?? 0;
  const { data: governanceData } = useGovernanceActions();
  const { data: territoryData } = useTerritoryIntelligence();
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>("Q");
  const { data: rangeTrendData } = useQuery({
    queryKey: ["revenue-trend", range],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports/revenue-trend/", {
        params: { range },
      });
      return data as { range: string; months: number; trend: { month: string; current: number; prior: number }[] };
    },
  });
  const [leaderboardView, setLeaderboardView] = useState<"deals" | "volume" | "conversion">("deals");

  if (isLoading) return <OverviewSkeleton />;
  if (error || !data) return <div className="text-rose-400 text-sm p-6">Failed to load dashboard data.</div>;

  const { kpis, listing, sales, finance, revenue_trend, conversion_funnel, leaderboard } = data;

  const effectiveTrend = rangeTrendData?.trend ?? revenue_trend;
  const maxRevenue = Math.max(1, ...effectiveTrend.flatMap((m) => [m.current, m.prior]));
  const latestMonth = revenue_trend[revenue_trend.length - 1];
  const priorMonth = revenue_trend[revenue_trend.length - 2];
  const momGrowthPct =
    priorMonth && priorMonth.current > 0
      ? (((latestMonth?.current ?? 0) - priorMonth.current) / priorMonth.current) * 100
      : 0;
  const totalFunnelCount = conversion_funnel[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div className="bg-[#131926] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Good morning, {user?.full_name || "there"}</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Executive Command Brief for Horilux Estates · Node Accra Core Alpha
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportBoardPack}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isExportingPdf ? "Exporting..." : "Export Board Pack PDF"}
            </button>
            <button
              onClick={() => setShowBriefingModal(true)}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors"
            >
              Schedule Exec Briefing
            </button>
            <button
              onClick={() => navigate("/ceo/ai-insights")}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              AI Strategic Memo
            </button>
          </div>
        </div>
      </div>

      {/* 8 KPI cards — matching AURA reference layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          onClick={() => navigate("/ceo/revenue")}
          label="Total Revenue"
          badge="QTD"
          value={formatGHS(kpis.gross_volume_ytd)}
          sub="Cumulative closed volume"
          trendBadge={`${momGrowthPct >= 0 ? "+" : ""}${momGrowthPct.toFixed(1)}%`}
          trendUp={momGrowthPct >= 0}
          sparkline={revenue_trend.map((m) => m.current)}
          link="Revenue & Finance →"
          hover="hover:border-blue-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/revenue")}
          label="Net Profit"
          badge="Sample data"
          value="—"
          sub="No P&L model wired yet"
          trendBadge=""
          trendUp
          sparkline={[]}
          link="Finance View →"
          hover="hover:border-emerald-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/properties")}
          label="Active Properties"
          badge="Portfolio"
          value={listing.total_properties.toLocaleString()}
          sub={`${kpis.active_mandates} active mandates`}
          trendBadge={`${listing.avg_completion_percent.toFixed(0)}%`}
          trendUp
          sparkline={[listing.total_properties * 0.7, listing.total_properties * 0.8, listing.total_properties * 0.85, listing.total_properties * 0.95, listing.total_properties]}
          link="All Properties →"
          hover="hover:border-cyan-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/sales")}
          label="Properties Sold"
          badge="Sample data"
          value="—"
          sub="No sold-count field wired yet"
          trendBadge=""
          trendUp
          sparkline={[]}
          link="Sales Analytics →"
          hover="hover:border-purple-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/leads")}
          label="Total Leads"
          badge="Inbound"
          value={sales.total_leads.toLocaleString()}
          sub={`${sales.total_clients.toLocaleString()} clients`}
          trendBadge={`${sales.overdue_followups} overdue`}
          trendUp={sales.overdue_followups === 0}
          sparkline={[sales.total_leads * 0.6, sales.total_leads * 0.75, sales.total_leads * 0.85, sales.total_leads * 0.92, sales.total_leads]}
          link="Lead Flow →"
          hover="hover:border-teal-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/sales")}
          label="Conversion Rate"
          badge={kpis.closed_yield_percent < 15 ? "Lag Warning" : "On Target"}
          badgeWarn={kpis.closed_yield_percent < 15}
          value={`${kpis.closed_yield_percent.toFixed(1)}%`}
          sub="Target: 15.0% Min"
          trendBadge=""
          trendUp={kpis.closed_yield_percent >= 15}
          sparkline={conversion_funnel.map((s) => s.pct)}
          link="CRM Diagnostics →"
          hover="hover:border-amber-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/agents")}
          label="Active Agents"
          badge="Headcount"
          value={`${kpis.active_agents} staff`}
          sub="Active producers"
          trendBadge=""
          trendUp
          sparkline={leaderboard.map((a) => a.deals)}
          link="Agent Roster →"
          hover="hover:border-pink-500"
        />
        <KpiCard
          onClick={() => navigate("/ceo/transactions")}
          label="Gross Volume"
          badge="GTV"
          value={formatGHS(kpis.gross_volume_ytd)}
          sub={`${finance.total_transactions} settled transactions`}
          trendBadge={`${momGrowthPct >= 0 ? "+" : ""}${momGrowthPct.toFixed(1)}%`}
          trendUp={momGrowthPct >= 0}
          sparkline={revenue_trend.map((m) => m.current)}
          link="Transactions →"
          hover="hover:border-indigo-500"
        />
      </div>

      {/* Revenue Realization vs Target + Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Executive Performance Analysis</p>
              <h3 className="font-bold text-white text-base mt-0.5">Revenue Realization vs Target Trajectory</h3>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    range === r ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/5">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Recorded Revenue</p>
              <p className="text-lg font-bold text-white font-mono mt-1">{formatGHS(kpis.gross_volume_ytd)}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">{momGrowthPct >= 0 ? "+" : ""}{momGrowthPct.toFixed(1)}% MoM</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Conversion Funnel Top</p>
              <p className="text-lg font-bold text-white font-mono mt-1">{totalFunnelCount.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Entry stage volume</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Closed Yield</p>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{kpis.closed_yield_percent.toFixed(1)}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Effective rate</p>
            </div>
          </div>

          <div className="h-48 flex items-end justify-center gap-6">
            {(rangeTrendData?.trend ?? revenue_trend).map((m) => (
              <div key={m.month} className="w-16 shrink-0 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-1/2 rounded-t bg-white/15" style={{ height: `${Math.max((m.prior / maxRevenue) * 100, m.prior > 0 ? 2 : 0)}%` }} />
                  <div className="w-1/2 rounded-t bg-blue-600/85" style={{ height: `${Math.max((m.current / maxRevenue) * 100, m.current > 0 ? 2 : 0)}%` }} />
                </div>
                <span className="text-[11px] text-slate-400">{m.month}</span>
              </div>
            ))}
            {!(rangeTrendData?.trend ?? revenue_trend).length && <p className="text-xs text-slate-500">No revenue trend data yet.</p>}
          </div>
          {rangeTrendData && rangeTrendData.trend.length < rangeTrendData.months / 6 * 6 && rangeTrendData.range !== "M" && (
            <p className="text-[11px] text-slate-500 mt-2">
              Showing all available data — transaction history doesn't yet span the full {rangeTrendData.range === "Q" ? "12-month" : "24-month"} window.
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600" /> Current</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white/15" /> Prior</span>
            </span>
            <button onClick={() => navigate("/ceo/revenue")} className="text-blue-400 hover:text-blue-300 font-semibold">
              View Revenue & Finance Hub →
            </button>
          </div>
        </div>

        <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Deal Conversion Velocity</p>
                <h3 className="font-bold text-white text-base mt-0.5">End-to-End Sales Pipeline</h3>
              </div>
            </div>
          </div>
          <div className="space-y-3.5 my-4">
            {conversion_funnel.map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{stage.label} {stage.pct > 0 && `(${stage.pct}%)`}</span>
                  <span className="font-mono text-white font-bold">{stage.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stage.pct}%` }} />
                </div>
              </div>
            ))}
            {!conversion_funnel.length && <p className="text-xs text-slate-500">No pipeline data yet.</p>}
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Avg Ticket: <strong className="text-white">{formatGHS(kpis.avg_deal_size)}</strong></span>
            <button onClick={() => navigate("/ceo/sales")} className="text-blue-400 hover:text-blue-300 font-semibold">
              View Sales Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* CEO Governance Action Center — sample */}
      <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400">⚠</span>
            <div>
              <h3 className="font-bold text-white text-base">CEO Governance Action Center</h3>
              <p className="text-[11px] text-slate-500">Executive approvals & unassigned high-value risks</p>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono ml-2">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-semibold">
              {governanceData?.length ?? 0} Items Require Signature / Action
            </span>
            <button onClick={() => navigate("/ceo/approvals")} className="text-xs text-blue-400 hover:underline">Operations Hub →</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {!governanceData || governanceData.length === 0 ? (
            <p className="text-[11px] text-slate-500 col-span-full">No outstanding governance actions — all clear.</p>
          ) : (
            governanceData.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-${g.severity_color}-500/15 text-${g.severity_color}-400 font-semibold`}>
                      {g.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{g.due}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{g.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{g.detail}</p>
                </div>
                <button
                  onClick={() => navigate(g.link)}
                  className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                    g.cta_style === "solid"
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
                  }`}
                >
                  {g.cta}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Assets + Agent Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Real Estate Portfolio Highlights</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-semibold">{activeCount.toLocaleString()} Active</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">{soldCount.toLocaleString()} Sold</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-base">Top Performing Prime Assets</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Live</span>
          </div>
          <div className="space-y-3">
            {!perfData || perfData.top_performers.length === 0 ? (
              <p className="text-[11px] text-slate-500">No property performance data yet.</p>
            ) : (
              perfData.top_performers.slice(0, 5).map((a) => {
                const badge = regionBadge(a.price_vs_region_avg_pct);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {initials(a.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{a.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{a.region} · <span className="capitalize">{a.status.replace(/_/g, " ")}</span></p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {a.views_count.toLocaleString()} views · {a.inquiries_count} inquiries ·{" "}
                        <span className={`text-${badge.color}-400 font-semibold`}>{badge.text}</span>
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold shrink-0 text-white">
                      {a.price !== null ? `GH₵${Math.round(a.price).toLocaleString()}` : "—"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Showing {perfData?.top_performers.length ?? 0} of {perfData?.summary.total_properties.toLocaleString() ?? 0} properties</span>
            <button onClick={() => navigate("/ceo/properties")} className="text-blue-400 hover:text-blue-300 font-semibold">
              View Property Performance →
            </button>
          </div>
        </div>

        <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Human Capital & Production</p>
              <h3 className="font-bold text-white text-base mt-0.5">Top Agent Leaderboard</h3>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {(["deals", "volume", "conversion"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setLeaderboardView(v)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    leaderboardView === v ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 mt-3">
            {leaderboard.map((agent) => {
              const initials = agent.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const avatarColors = ["bg-blue-600", "bg-amber-700", "bg-slate-700", "bg-slate-700", "bg-slate-700"];
              const metricValue =
                leaderboardView === "deals"
                  ? `${agent.deals} deals`
                  : leaderboardView === "volume"
                  ? formatGHS(agent.volume)
                  : `${agent.yield_percent.toFixed(1)}%`;
              return (
                <div key={agent.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-slate-500 font-mono w-6 shrink-0">#{agent.rank}</span>
                    <div className={`w-9 h-9 rounded-full ${avatarColors[agent.rank - 1] ?? "bg-slate-700"} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{agent.name}</p>
                      <p className="text-[10px] text-slate-500">{agent.division} · {agent.deals} closed deals · {agent.yield_percent.toFixed(1)}% conv</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-mono text-xs font-bold text-white">{formatGHS(agent.volume)} <span className="text-slate-500 font-normal">GTV</span></p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">{metricValue}</p>
                  </div>
                </div>
              );
            })}
            {!leaderboard.length && <p className="text-xs text-slate-500">No closed deals yet.</p>}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold">94% Active Broker Quota Hit <span className="text-slate-500 font-mono font-normal ml-1">(sample)</span></span>
            <button onClick={() => navigate("/ceo/agents")} className="text-blue-400 hover:text-blue-300 font-semibold">
              View Agent Performance →
            </button>
          </div>
        </div>
      </div>

      {/* Territory Intelligence + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Territory Intelligence</p>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-semibold">
              {territoryData ? formatGHSCompact(territoryData.total_gtv) : "—"} Total GTV
            </span>
          </div>
          <h3 className="font-bold text-white text-base mb-3">Greater Accra Metro Corridors</h3>

          <div className="rounded-xl bg-[#0b0f18] border border-white/5 p-3 mb-3 space-y-2.5">
            {!territoryData || territoryData.corridors.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-4 text-center">No location data available yet.</p>
            ) : (
              territoryData.corridors.map((c, i) => {
                const maxGtv = Math.max(1, ...territoryData.corridors.map((x) => x.gtv));
                const widthPct = Math.max(4, (c.gtv / maxGtv) * 100);
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${CORRIDOR_COLORS[i % CORRIDOR_COLORS.length]}`} />
                        {c.name}
                      </span>
                      <span className="text-emerald-400 font-mono">{formatGHSCompact(c.gtv)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CORRIDOR_COLORS[i % CORRIDOR_COLORS.length]}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {(territoryData?.corridors ?? []).slice(0, 6).map((c) => (
              <div key={c.name} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wide truncate">{c.name}</p>
                <p className="text-[11px] text-white font-mono font-semibold mt-0.5">
                  {c.avg_price !== null ? formatGHSCompact(c.avg_price) : "—"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{c.property_count} properties</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Live — ranked by transaction GTV</span>
            <button onClick={() => navigate("/ceo/locations")} className="text-blue-400 hover:text-blue-300 font-semibold">
              View Location Analytics →
            </button>
          </div>
        </div>

        <div className="executive-card p-5 rounded-2xl bg-[#131926] border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Audited Ledger Feed</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Live</span>
          </div>
          <h3 className="font-bold text-white text-base mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {!activityData || activityData.length === 0 ? (
              <p className="text-[11px] text-slate-500">No recent activity.</p>
            ) : (
              activityData.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${activityColor(a.action)}-400 mt-1.5 shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xs text-white font-semibold leading-snug truncate">{activityLabel(a.action, a.model)}</p>
                      <p className="text-[10px] text-slate-500">{a.actor}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap px-2 py-1 rounded bg-white/5">
                    {timeAgo(a.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-[11px]">
            <span className="text-slate-500">Live Immutable Trail</span>
            <button onClick={() => navigate("/ceo/audit-logs")} className="text-blue-400 hover:text-blue-300 font-semibold">Audit Logs →</button>
          </div>
        </div>
      </div>
      {showBriefingModal && (
        <ScheduleBriefingModal onClose={() => setShowBriefingModal(false)} />
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-[#131926] border border-white/10 rounded-2xl p-6 h-28" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#131926] border border-white/10 rounded-xl h-36" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#131926] border border-white/10 rounded-2xl h-80 lg:col-span-2" />
        <div className="bg-[#131926] border border-white/10 rounded-2xl h-80" />
      </div>
    </div>
  );
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return <div className="h-8 w-20" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 76 + 2;
      const y = 28 - ((d - min) / range) * 24 - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-20" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={up ? "#34d399" : "#fb7185"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiCard({
  onClick,
  label,
  badge,
  badgeWarn,
  value,
  sub,
  trendBadge,
  trendUp,
  sparkline,
  link,
  hover,
}: {
  onClick: () => void;
  label: string;
  badge: string;
  badgeWarn?: boolean;
  value: string;
  sub: string;
  trendBadge: string;
  trendUp: boolean;
  sparkline: number[];
  link: string;
  hover: string;
}) {
  return (
    <div onClick={onClick} className={`executive-card bg-[#131926] border border-white/10 p-4 rounded-xl cursor-pointer transition-all group overflow-hidden ${hover}`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-slate-400 uppercase">{label}</span>
        {badge && (
          <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold ${badgeWarn ? "bg-rose-500/15 text-rose-400" : "bg-white/5 text-slate-300"}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2 min-w-0">
        <h3 className="text-2xl font-extrabold text-white font-mono truncate min-w-0">{value}</h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {trendBadge && (
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold ${trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {trendUp ? "↑" : "↓"} {trendBadge}
            </span>
          )}
          <Sparkline data={sparkline} up={trendUp} />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
        <span>{sub}</span>
        <span className="text-blue-400 group-hover:underline">{link}</span>
      </div>
    </div>
  );
}
