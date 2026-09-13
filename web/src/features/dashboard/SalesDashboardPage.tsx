import { Users, Zap, RefreshCw, Wallet, Hourglass } from 'lucide-react';
import {
  KpiCard,
  ConversionFunnel,
  CountBars,
  CommissionTracker,
  RadialGauge,
  ActionQueueList,
  PriorityFollowUps,
  TransactionsDetailTable,
  ReferralClientsList,
  InsightDonut,
  ClosedDealCards,
  COLORS,
} from './components/DashboardSections';

const MOCK_LEAD_FUNNEL = [
  { label: 'New', count: 48, pct: 100 },
  { label: 'Contacted', count: 36, pct: 75.0 },
  { label: 'Qualified', count: 26, pct: 54.2 },
  { label: 'Property Matched', count: 18, pct: 37.5 },
  { label: 'Viewing Scheduled', count: 12, pct: 25.0 },
  { label: 'Negotiation', count: 7, pct: 14.5 },
  { label: 'Closed & Completed', count: 5, pct: 10.4 },
];

const MOCK_TRANSACTION_STAGES = [
  { label: 'Offer Made', count: 4, pct: 60 },
  { label: 'Negotiation', count: 3, pct: 45 },
  { label: 'Sale Agreement', count: 3, pct: 45 },
  { label: 'Documentation', count: 2, pct: 30 },
  { label: 'Escrow Deposit', count: 3, pct: 45 },
  { label: 'Closing Formalities', count: 2, pct: 30 },
  { label: 'Commission Disbursing', count: 1, pct: 15 },
  { label: 'Ready to Archive', count: 1, pct: 15, highlight: true },
];

const MOCK_NEEDS_ACTION = [
  { id: 1, name: 'Kofi Mensah', waitingLabel: '3 days waiting', detail: 'Matched: Cantonments 4BR Luxury Villa · Budget: GHS 1.8M', buttonLabel: 'Schedule Viewing' },
  { id: 2, name: 'Dr. Araba Taylor', waitingLabel: '5 days waiting', waitingUrgent: true, detail: 'Matched: Ridge Signature Penthouse · Budget: GHS 3.2M', buttonLabel: 'Schedule Viewing' },
  { id: 3, name: 'Emmanuel Osei-Bonsu', waitingLabel: '2 days waiting', detail: 'Matched: Airport Hills Executive Suite · Budget: GHS 950K', buttonLabel: 'Schedule Viewing' },
];

const MOCK_FOLLOW_UPS = [
  { id: 1, initials: 'OA', name: 'Osei Kwame Despite Jr.', time: 'Today, 2:30 PM', priority: 'Hot' as const },
  { id: 2, initials: 'EB', name: 'Elizabeth Blankson', time: 'Tomorrow, 10:00 AM', priority: 'Warm' as const },
  { id: 3, initials: 'MA', name: 'Marcus Amoako', time: 'Oct 26, 4:00 PM', priority: 'Cold' as const },
];

const MOCK_TRANSACTIONS = [
  { id: 1, property: 'Villaggio Vista 3BR Penthouse', client: 'Nana Yaa Konadu', status: 'Escrow Funded', statusTone: 'success' as const, price: 'GHS 4,200,000', commission: 'GHS 126,000', updated: '2h ago' },
  { id: 2, property: 'The Mirage Cantonments', client: 'Kwesi Boakye', status: 'Contract Draft', statusTone: 'info' as const, price: 'GHS 1,950,000', commission: 'GHS 58,500', updated: 'Yesterday' },
  { id: 3, property: 'Embassy Gardens Studio Suite', client: 'David Ansah', status: 'Under Negotiation', statusTone: 'warn' as const, price: 'GHS 820,000', commission: 'GHS 24,600', updated: 'Oct 22' },
  { id: 4, property: 'Airport Residential Villa', client: 'Dr. Linda Darko', status: 'Title Search', statusTone: 'neutral' as const, price: 'GHS 5,800,000', commission: 'GHS 174,000', updated: 'Oct 20' },
];

const MOCK_BUDGET_RANGES = [
  { label: '< GHS 500K', count: 18, pct: 13 },
  { label: 'GHS 500K – 1.5M', count: 44, pct: 31 },
  { label: 'GHS 1.5M – 3.0M', count: 52, pct: 37 },
  { label: 'GHS 3.0M – 6.0M', count: 21, pct: 15 },
  { label: '> GHS 6.0M High-Net-Worth', count: 7, pct: 4 },
];

const MOCK_REFERRALS = [
  { id: 1, initials: 'AD', name: 'Afua Danquah', note: 'Referred by Justice Boateng · Tier: Platinum Partner', value: 'GHS 2.4M', valueTag: 'Potential' },
  { id: 2, initials: 'PA', name: 'Arch. Philip Adjei', note: 'Repeat Institutional Investor · 3rd Transaction this year', value: 'GHS 4.1M', valueTag: 'Active Escrow' },
];

const MOCK_LOST_REASONS = [
  { name: 'Price Disconnect', value: 13, pct: 42, color: COLORS.midnight },
  { name: 'Timing & Capital Call', value: 8, pct: 26, color: '#6D5BD0' },
  { name: 'Chose Competitor', value: 6, pct: 18, color: COLORS.taupe },
  { name: 'Unresponsive', value: 4, pct: 14, color: '#D1D5DB' },
];

const MOCK_CLOSED_DEALS = [
  { id: 1, badge: 'Closed 2 days ago', date: 'Oct 22', title: 'The Residence Penthouse', buyer: 'Hon. Ken Thompson', price: 'GHS 2,850,000', commission: 'GHS 85,500' },
  { id: 2, badge: 'Closed 6 days ago', date: 'Oct 18', title: 'Kwarleyz Residence Suite 5A', buyer: 'Sarah K. Asare', price: 'GHS 1,450,000', commission: 'GHS 43,500' },
  { id: 3, badge: 'Closed 12 days ago', date: 'Oct 12', title: 'Dzorwulu Commercial Hub Lot 4', buyer: 'Meridian Holdings Ltd', price: 'GHS 5,200,000', commission: 'GHS 156,000' },
];

export function SalesDashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium uppercase tracking-wide">
              Sales
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-mono text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>My Sales Pipeline</h1>
          <p className="text-sm text-gray-500">Leads, viewings, and transactions in progress.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-700">
            <span>Log Follow-up</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity text-sm font-medium"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Active Leads" value="142" delta="+12%" deltaDirection="up" subtext="vs previous month"
          icon={<Users size={18} />} sparkline={[110, 118, 122, 130, 135, 139, 142]} />
        <KpiCard label="New This Week" value="28" delta="+18%" deltaDirection="up" subtext="vs last week"
          icon={<Zap size={18} />} sparkline={[18, 20, 21, 23, 25, 27, 28]} />
        <KpiCard label="In Progress" value="19" subtext="8 closing this month"
          icon={<RefreshCw size={18} />} sparkline={[14, 15, 16, 17, 18, 18, 19]} />
        <KpiCard label="Expected Commission" value="GHS 385,400" delta="+14.2%" deltaDirection="up" subtext="Yield"
          icon={<Wallet size={18} />} sparkline={[300, 320, 335, 350, 365, 375, 385]} />
        <KpiCard label="Avg Time to Close" value="34 days" delta="4 days faster" deltaDirection="up" subtext="vs prior period"
          icon={<Hourglass size={18} />} sparkline={[42, 40, 39, 37, 36, 35, 34]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Lead Pipeline Funnel</h2>
          <p className="text-sm text-gray-400 mb-3">End-to-end deal conversion velocity — 48 total in-flow</p>
          <ConversionFunnel stages={MOCK_LEAD_FUNNEL} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Transaction Breakdown</h2>
          <p className="text-sm text-gray-400 mb-3">19 active deals · GHS 18.4M volume</p>
          <CountBars items={MOCK_TRANSACTION_STAGES} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Commission Tracker</h2>
          <p className="text-sm text-gray-400 mb-3">Realized versus queued revenue for Q4</p>
          <CommissionTracker
            earned="GHS 148,200" earnedDelta="22.4% vs Sept" earnedSparkline={[100, 108, 105, 120, 130, 148]}
            pending="GHS 84,600"
            breakdown={[
              { label: 'In Escrow', value: 'GHS 46,000', tone: 'info' },
              { label: 'Milestone Partial', value: 'GHS 24,600', tone: 'warn' },
              { label: 'Overdue Check', value: 'GHS 14,000', tone: 'danger' },
            ]}
          />
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Quota Progress (Q4)</h2>
          <p className="text-sm text-gray-400 mb-3">Annual Senior Associate Milestone</p>
          <RadialGauge percent={70} tag="Target tracking — coming soon"
            valueLabel="GHS 420,000 of GHS 600,000"
            valueSubtext="GHS 180,000 remaining to reach President's Circle" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Needs Action</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">Matched leads waiting on viewing schedules</p>
          <ActionQueueList badge="3 Urgencies" items={MOCK_NEEDS_ACTION} />
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Upcoming Follow-ups</h2>
          <p className="text-sm text-gray-400 mb-3">Prioritized client check-ins</p>
          <PriorityFollowUps items={MOCK_FOLLOW_UPS} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">My Active Transactions</h2>
            <a href="#" className="text-sm font-medium" style={{ color: COLORS.midnight }}>View All Transactions →</a>
          </div>
          <p className="text-sm text-gray-400 mb-3">Live contract and escrow tracking</p>
          <TransactionsDetailTable rows={MOCK_TRANSACTIONS} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Leads by Budget Range</h2>
          <p className="text-sm text-gray-400 mb-3">Purchasing capacity segment distribution</p>
          <CountBars items={MOCK_BUDGET_RANGES} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg mb-1">Referral & Repeat Clients</h2>
            <p className="text-sm text-gray-400 mb-3">High-affinity network relationships driving 48% of pipeline</p>
            <ReferralClientsList items={MOCK_REFERRALS} />
          </div>
          <div className="flex items-center justify-between pt-4 mt-4 border-t text-sm">
            <span className="text-gray-400">Network conversion yield: 84.6%</span>
            <a href="#" className="font-medium" style={{ color: COLORS.midnight }}>Open Network Directory →</a>
          </div>
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Lost Lead Reasons</h2>
          <p className="text-sm text-gray-400 mb-3">Attrition factor intelligence</p>
          <InsightDonut
            segments={MOCK_LOST_REASONS} centerLabel="31 Lost" tag="Reason tracking — coming soon"
            note="Targeted seller price adjustment recommended for 3 Cantonments properties."
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-lg">Recently Closed Deals</h2>
          <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ backgroundColor: `${COLORS.forest}18`, color: COLORS.forest }}>✓ 5 Closed in Q4</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">Validated settlement timeline & disbursed revenues</p>
        <ClosedDealCards deals={MOCK_CLOSED_DEALS} />
      </div>
    </div>
  );
}
