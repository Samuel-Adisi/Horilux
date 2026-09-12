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

const MOCK_REVENUE = [
  { month: 'Jan', current: 48, prior: 40 },
  { month: 'Mar', current: 61, prior: 50 },
  { month: 'May', current: 74, prior: 58 },
  { month: 'Jul', current: 98.4, prior: 72 },
  { month: 'Sep', current: 88, prior: 80 },
  { month: 'Oct', current: 96, prior: 84 },
];

const MOCK_FUNNEL = [
  { label: 'Inbound Leads', count: 94240, pct: 100 },
  { label: 'Contact Verified', count: 68324, pct: 72.5 },
  { label: 'Private Viewing', count: 26952, pct: 28.6 },
  { label: 'Written LOI / Offer', count: 9330, pct: 9.9 },
  { label: 'Executed Escrow', count: 4994, pct: 5.3 },
];

const MOCK_DEPARTMENTS = [
  { name: 'Sales & Brokerage', tag: 'Core', value: '$520.4M', delta: '+18.2%', pct: 62, footnoteLeft: '61.7% of total', footnoteRight: 'Quota: 108.4%' },
  { name: 'Listings & Mandate Advisory', tag: 'Mandates', value: '$184.2M', delta: '+14.0%', pct: 22, footnoteLeft: '21.9% advisory share', footnoteRight: '92 exclusive mandates' },
  { name: 'Private Wealth Syndications', tag: 'Private', value: '$92.5M', delta: '+32.1%', pct: 11, footnoteLeft: '11.0% capital deployed', footnoteRight: 'Fastest growing' },
];

const MOCK_REGIONS = [
  { label: 'California Coast', value: '$348.5M (41.4%)', pct: 41.4 },
  { label: 'South Florida', value: '$224.8M (26.7%)', pct: 26.7 },
  { label: 'Texas Luxury', value: '$138.2M (16.4%)', pct: 16.4 },
  { label: 'Pacific Northwest', value: '$82.4M (9.8%)', pct: 9.8 },
  { label: 'International', value: '$48.6M (5.7%)', pct: 5.7 },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Elena Vance', title: 'Tier 1 Elite Partner', division: 'Ultra-Luxury / Bel-Air', deals: 42, volume: '$148.2M', yield: '64.2%' },
  { rank: 2, name: 'Marcus Vance', title: 'Private Wealth Partner', division: 'Star Island / Florida', deals: 31, volume: '$112.5M', yield: '58.0%' },
  { rank: 3, name: 'David Sterling', title: 'Managing Director', division: 'Texas Luxury / Austin', deals: 28, volume: '$86.4M', yield: '54.1%' },
  { rank: 4, name: 'Alastair Wright', title: 'Family Office Principal', division: 'Pacific NW / Aspen', deals: 22, volume: '$79.8M', yield: '49.5%' },
  { rank: 5, name: 'Sophia Laurent', title: 'Coastal Acquisitions', division: 'Monaco & Newport Desk', deals: 19, volume: '$68.1M', yield: '51.2%' },
];

const MOCK_STATUS = [
  { name: 'Available for Sale', value: 642, color: COLORS.midnight },
  { name: 'Under Contract / Escrow', value: 371, color: COLORS.forest },
  { name: 'Pending Closing', value: 228, color: COLORS.taupe },
  { name: 'Off-Market Pocket', value: 187, color: '#9CA3AF' },
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

export function CeoDashboardPage() {
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
        <KpiCard label="Gross Volume (YTD)" value="$842.52M" delta="+24.8%" deltaDirection="up" subtext="vs $675M benchmark"
          icon={<DollarSign size={18} />} sparkline={[675, 720, 760, 800, 820, 835, 842]} />
        <KpiCard label="Active Mandates" value="1,428" delta="+12.4%" deltaDirection="up" subtext="$3.18B aggregate valuation"
          icon={<Building2 size={18} />} sparkline={[1200, 1250, 1300, 1350, 1390, 1410, 1428]} />
        <KpiCard label="Licensed Agents" value="184 Reps" subtext="98.4% FINRA active"
          icon={<Users size={18} />} sparkline={[160, 165, 170, 175, 178, 182, 184]} />
        <KpiCard label="Closed Yield" value="52.9%" delta="+4.1%" deltaDirection="up" subtext="Offer-to-escrow velocity"
          icon={<Percent size={18} />} sparkline={[45, 47, 48, 50, 51, 52, 52.9]} />
        <KpiCard label="Avg Deal Size" value="$3.45M" delta="+8.5%" deltaDirection="up" subtext="Ultra-prime tier: 38 units"
          icon={<TrendingUp size={18} />} sparkline={[2.8, 2.95, 3.05, 3.2, 3.3, 3.4, 3.45]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Brokerage Revenue Performance</h2>
          <p className="text-sm text-gray-400 mb-3">Closed transaction volume vs prior fiscal baseline</p>
          <RevenueTrendChart data={MOCK_REVENUE} />
          <MetricCallouts items={[
            { label: 'All-Time Peak Month', value: '$98.4M (July)', subtext: 'Driven by Malibu portfolio' },
            { label: 'Projected Q4 Close', value: '$240.0M', subtext: '+14.2% over Q3', positive: true },
            { label: 'Gross Margin', value: '18.6%', subtext: 'Net retained advisory fee' },
          ]} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Conversion Funnel</h2>
          <p className="text-sm text-gray-400 mb-3">Full pipeline throughput, org-wide</p>
          <ConversionFunnel stages={MOCK_FUNNEL} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Departmental Performance</h2>
          <p className="text-sm text-gray-400 mb-3">Ranked by revenue generation and unit economics</p>
          <DepartmentBars departments={MOCK_DEPARTMENTS} />
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Regional Markets</h2>
          <p className="text-sm text-gray-400 mb-3">Capital concentration by geography</p>
          <RegionalBars regions={MOCK_REGIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Top Managing Brokers Leaderboard</h2>
            <a href="#" className="text-sm font-medium" style={{ color: COLORS.midnight }}>View Complete Roster →</a>
          </div>
          <p className="text-sm text-gray-400 mb-3">Ranked by closed commission gross and conversion yield</p>
          <LeaderboardTable brokers={MOCK_LEADERBOARD} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Book Composition</h2>
          <StatusDonut segments={MOCK_STATUS} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Executive Risk Radar</h2>
          <p className="text-sm text-gray-400 mb-3">High-priority items requiring CEO review</p>
          <RiskRadar items={MOCK_RISKS} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Company-Wide Milestones</h2>
          <p className="text-sm text-gray-400 mb-3">Live institutional event feed</p>
          <MilestoneFeed events={MOCK_MILESTONES} />
        </div>
      </div>
    </div>
  );
}
