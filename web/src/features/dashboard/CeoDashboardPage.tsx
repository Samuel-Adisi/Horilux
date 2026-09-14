import { DollarSign, Building2, Users, Percent, TrendingUp } from 'lucide-react';
import {
  KpiCard,
  ConversionFunnel,
  StatusDonut,
  RevenueTrendChart,
  MetricCallouts,
  DepartmentBars,
  RegionalBars,
  LeaderboardTable,
  RiskRadar,
  MilestoneFeed,
  COLORS,
} from './components/DashboardSections';
import { useCeoDashboard } from './hooks/use-ceo-dashboard';

// TODO: no backend source yet for these three — Property has no region field,
// and there's no risk/audit-feed model wired up. Kept as mock until those exist.
const MOCK_REGIONS = [
  { label: 'California Coast', value: '$348.5M (41.4%)', pct: 41.4 },
  { label: 'South Florida', value: '$224.8M (26.7%)', pct: 26.7 },
  { label: 'Texas Luxury', value: '$138.2M (16.4%)', pct: 16.4 },
  { label: 'Pacific Northwest', value: '$82.4M (9.8%)', pct: 9.8 },
  { label: 'International', value: '$48.6M (5.7%)', pct: 5.7 },
];

const MOCK_RISKS = [
  { title: 'Escrow Title Discrepancy — $48.5M', description: 'Bel-Air Estate escrow delayed 48h awaiting executive signature on cross-border clearance.', severity: 'Critical' as const, actions: ['Authorize', 'View File'] },
  { title: 'Underperforming Pod (South Florida)', description: 'Miami syndication cohort tracking -12% vs targeted Q3 absorption.', severity: 'Attention' as const },
  { title: 'AML Verification Sign-Off', description: '6 institutional offshore buyers ready for quarterly AML certification.', severity: 'Compliance' as const },
];

const MOCK_MILESTONES = [
  { title: 'Closed: $34.5M Waterfront Compound', subtitle: 'Star Island, FL • Elena Vance • Funds wired in full', time: '18m ago' },
  { title: 'Exclusive Mandate: $62M Penthouse Portfolio', subtitle: '3 ultra-prime penthouses assigned to NY Private Desk', time: '2h ago' },
  { title: 'Leadership Onboarded: Monaco Desk', subtitle: 'Jean-Paul Laurent appointed Senior Managing Director', time: '5h ago' },
  { title: 'Institutional Audit Complete', subtitle: 'Q3 FinCEN & escrow certification — 100% compliance pass', time: 'Yesterday' },
];

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

const DEPARTMENT_COLORS = [COLORS.midnight, COLORS.forest, COLORS.taupe, '#9CA3AF', '#6D28D9'];
const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', onboarding: 'Onboarding', pending_verification: 'Pending Verification',
  verified: 'Verified', pending_approval: 'Pending Approval', marketing_ready: 'Marketing Ready',
  published: 'Available for Sale', under_offer: 'Under Contract / Escrow',
  sold_rented: 'Sold/Rented', archived: 'Archived',
};

export function CeoDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useCeoDashboard();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-3">
          <h2 className="font-semibold text-lg text-gray-800">Couldn't load the executive dashboard</h2>
          <p className="text-sm text-gray-500">{(error as Error)?.message || 'Something went wrong fetching CEO report data.'}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: COLORS.midnight }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis, revenue_trend, conversion_funnel, departments, leaderboard, listing, finance } = data;

  const statusSegments = Object.entries(listing.by_status).map(([key, value], i) => ({
    name: STATUS_LABELS[key] || key,
    value,
    color: DEPARTMENT_COLORS[i % DEPARTMENT_COLORS.length],
  }));

  const departmentBars = departments.map((d) => ({
    name: d.name,
    tag: undefined,
    value: fmtMoney(d.value),
    delta: '',
    pct: d.pct,
    footnoteLeft: `${d.pct}% of total`,
    footnoteRight: `${d.count} deals`,
  }));

  const leaderboardRows = leaderboard.map((b) => ({
    rank: b.rank,
    name: b.name,
    title: '',
    division: b.division,
    deals: b.deals,
    volume: fmtMoney(b.volume),
    yield: `${b.yield_percent}%`,
  }));

  const peakMonth = revenue_trend.reduce(
    (max, row) => (row.current > (max?.current ?? -Infinity) ? row : max),
    revenue_trend[0]
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium uppercase tracking-wide">
              Chief Executive
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-mono text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>Executive Overview</h1>
          <p className="text-sm text-gray-500">Company-wide brokerage performance and governance overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-700">
            <span>Board Deck</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity text-sm font-medium"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <span>+ Add Broker</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Gross Volume (YTD)" value={fmtMoney(kpis.gross_volume_ytd)}
          subtext="Year to date, closed + open transactions" icon={<DollarSign size={18} />} />
        <KpiCard label="Active Mandates" value={kpis.active_mandates.toLocaleString()}
          subtext="Excludes sold/rented & archived" icon={<Building2 size={18} />} />
        <KpiCard label="Licensed Agents" value={`${kpis.active_agents} Reps`}
          subtext="Active, department-assigned" icon={<Users size={18} />} />
        <KpiCard label="Closed Yield" value={`${kpis.closed_yield_percent}%`}
          subtext="Closed transactions / total leads" icon={<Percent size={18} />} />
        <KpiCard label="Avg Deal Size" value={fmtMoney(kpis.avg_deal_size)}
          subtext="Average transaction price, YTD" icon={<TrendingUp size={18} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Brokerage Revenue Performance</h2>
          <p className="text-sm text-gray-400 mb-3">Closed transaction volume vs prior-year baseline</p>
          <RevenueTrendChart data={revenue_trend} />
          <MetricCallouts items={[
            { label: 'Peak Month', value: peakMonth ? `${fmtMoney(peakMonth.current)} (${peakMonth.month})` : '—' },
            { label: 'Outstanding Commission', value: fmtMoney(finance.commission.outstanding || 0), positive: false },
            { label: 'Commission Received', value: fmtMoney(finance.commission.received || 0), positive: true },
          ]} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Conversion Funnel</h2>
          <p className="text-sm text-gray-400 mb-3">Full pipeline throughput, org-wide</p>
          <ConversionFunnel stages={conversion_funnel} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Departmental Performance</h2>
          <p className="text-sm text-gray-400 mb-3">Ranked by closed + open transaction volume</p>
          {departmentBars.length > 0
            ? <DepartmentBars departments={departmentBars} />
            : <p className="text-sm text-gray-400 py-6 text-center">No department-attributed transactions yet.</p>}
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Regional Markets</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Sample data</span>
          </div>
          <p className="text-sm text-gray-400 mb-3">Capital concentration by geography</p>
          <RegionalBars regions={MOCK_REGIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Top Brokers Leaderboard</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">Ranked by closed commission gross</p>
          {leaderboardRows.length > 0
            ? <LeaderboardTable brokers={leaderboardRows} />
            : <p className="text-sm text-gray-400 py-6 text-center">No closed deals attributed to agents yet.</p>}
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Book Composition</h2>
          {statusSegments.length > 0
            ? <StatusDonut segments={statusSegments} />
            : <p className="text-sm text-gray-400 py-6 text-center">No properties yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Executive Risk Radar</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Sample data</span>
          </div>
          <p className="text-sm text-gray-400 mb-3">High-priority items requiring CEO review</p>
          <RiskRadar items={MOCK_RISKS} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Company-Wide Milestones</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Sample data</span>
          </div>
          <p className="text-sm text-gray-400 mb-3">Live institutional event feed</p>
          <MilestoneFeed events={MOCK_MILESTONES} />
        </div>
      </div>
    </div>
  );
}