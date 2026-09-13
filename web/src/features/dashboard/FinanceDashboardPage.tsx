import { HandCoins, CheckCircle2, Clock, AlertTriangle, Zap } from 'lucide-react';
import {
  KpiCard,
  StageRevenueBars,
  FinanceDonut,
  CommissionSplitCard,
  CommissionRulesTable,
  OverdueList,
  UpcomingPaymentsList,
  SettlementsLedgerTable,
  COLORS,
} from './components/DashboardSections';

const MOCK_STAGES = [
  { label: 'Offer Made', deals: 6, value: 'GHS 9,400,000', comm: 'GHS 282,000', pct: 28, color: '#9CA3AF' },
  { label: 'Negotiation', deals: 8, value: 'GHS 18,200,000', comm: 'GHS 546,000', pct: 62, color: COLORS.midnight },
  { label: 'Sale Agreement', deals: 5, value: 'GHS 12,500,000', comm: 'GHS 375,000', pct: 44, color: '#4338CA' },
  { label: 'Documentation', deals: 4, value: 'GHS 7,800,000', comm: 'GHS 234,000', pct: 32, color: '#9333EA' },
  { label: 'Escrow / Payment', deals: 4, value: 'GHS 8,600,000', comm: 'GHS 258,000', pct: 38, color: '#059669' },
  { label: 'Closing Formalities', deals: 3, value: 'GHS 6,400,000', comm: 'GHS 192,000', pct: 25, color: '#0D9488' },
  { label: 'Commission Disbursing', deals: 2, value: 'GHS 4,200,000', comm: 'GHS 126,000', pct: 18, color: COLORS.taupe },
];

const MOCK_STAGES_FOOTER = { label: 'Closed & Realized (YTD)', deals: '28 deals', value: 'GHS 64,800,000', comm: 'GHS 1,944,000' };

const MOCK_PAYMENT_STATUS = [
  { name: 'Settled / Cleared', value: 'GHS 942.8K', pct: 64, color: COLORS.forest },
  { name: 'Pending Schedule', value: 'GHS 310.2K', pct: 21, color: COLORS.midnight },
  { name: 'Partial Tranche', value: 'GHS 141.1K', pct: 10, color: COLORS.taupe },
  { name: 'Overdue Follow-up', value: 'GHS 86.4K', pct: 5, color: '#D9383A', danger: true },
];

const MOCK_RULES = [
  { role: 'Senior Partner', note: 'Quarterly volume > GHS 5M', split: '75% / 25%', active: true },
  { role: 'Lead Associate', note: 'Quarterly volume GHS 2.5M – 5M', split: '65% / 35%', active: true },
  { role: 'Sales Associate', note: 'Standard commission base', split: '55% / 45%', active: true },
  { role: 'Junior Associate', note: 'Probationary & onboarding tier', split: '45% / 55%', active: true },
  { role: 'Institutional Referrer', note: 'External lawyer / bank introduction', split: '20% Fixed', active: false },
];

const MOCK_OVERDUE = [
  { id: 1, title: 'The Residence Penthouse', daysLabel: '14 days overdue', client: 'Hon. Ken Thompson', note: 'Buyer deposit balance', amount: 'GHS 42,000', buttonLabel: 'Send Reminder' },
  { id: 2, title: 'Kwarleyz Residence Suite 5A', daysLabel: '8 days overdue', client: 'Dr. Araba Taylor', note: 'Second stage installment', amount: 'GHS 24,600', buttonLabel: 'Send Reminder' },
  { id: 3, title: 'Ridge Signature Suite', daysLabel: '5 days overdue', client: 'Kwesi Boakye', note: 'Retainer disbursal', amount: 'GHS 19,800', buttonLabel: 'Send Reminder' },
];

const MOCK_UPCOMING = [
  { id: 1, title: 'Meridian Industrial Hub', statusTag: 'In Escrow', statusTone: 'info' as const, client: 'Meridian Logistics Ltd', expected: 'Oct 26', amount: 'GHS 78,000', dueLabel: 'Due in 2d' },
  { id: 2, title: 'Villagio Vista 3BR Penthouse', statusTag: 'Processing', statusTone: 'warn' as const, client: 'Nana Yaa Konadu', expected: 'Oct 28', amount: 'GHS 63,000', dueLabel: 'Due in 4d' },
  { id: 3, title: 'Cantonments Luxury Villa', statusTag: 'Scheduled', statusTone: 'neutral' as const, client: 'Emmanuel Osei-Bonsu', expected: 'Nov 02', amount: 'GHS 34,500', dueLabel: 'Due in 9d' },
];

const MOCK_SETTLEMENTS = [
  { id: 1, initials: 'VP', property: 'Villagio Vista 3BR Penthouse', area: 'Airport Residential', client: 'Nana Yaa Konadu', total: 'GHS 126,000', agentShare: 'GHS 81,900 (65%)', companyShare: 'GHS 44,100 (35%)', date: 'Oct 22, 2024', status: 'Disbursed', statusTone: 'success' as const },
  { id: 2, initials: 'MC', property: 'The Mirage Cantonments', area: 'Cantonments Diplomatic Area', client: 'Kwesi Boakye', total: 'GHS 58,500', agentShare: 'GHS 38,025 (65%)', companyShare: 'GHS 20,475 (35%)', date: 'Oct 20, 2024', status: 'Escrow Cleared', statusTone: 'success' as const },
  { id: 3, initials: 'AR', property: 'Airport Residential Villa', area: 'Exclusive Gated Enclave', client: 'Dr. Linda Darko', total: 'GHS 174,000', agentShare: 'GHS 130,500 (75%)', companyShare: 'GHS 43,500 (25%)', date: 'Oct 18, 2024', status: 'Verified', statusTone: 'success' as const },
  { id: 4, initials: 'RS', property: 'Ridge Signature Penthouse', area: 'North Ridge Towers', client: 'Arch. Philip Adjei', total: 'GHS 85,500', agentShare: 'GHS 55,575 (65%)', companyShare: 'GHS 29,925 (35%)', date: 'Oct 15, 2024', status: 'Partial Tranche', statusTone: 'warn' as const },
  { id: 5, initials: 'KR', property: 'Kwarleyz Luxury Suite 5A', area: 'Airport Residential', client: 'Sarah K. Asare', total: 'GHS 43,500', agentShare: 'GHS 28,275 (65%)', companyShare: 'GHS 15,225 (35%)', date: 'Oct 12, 2024', status: 'Disbursed', statusTone: 'success' as const },
];

export function FinanceDashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium uppercase tracking-wide">
              Finance
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-mono text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>Finance Overview</h1>
          <p className="text-sm text-gray-500">Commission, payments, and revenue across active transactions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-700">
            <span>Export Ledger</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity text-sm font-medium"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <span>+ Record Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Expected Comm." value="GHS 1,480,500" delta="+14.2%" deltaDirection="up" subtext="Open deal pipeline"
          icon={<HandCoins size={18} />} sparkline={[1100, 1200, 1250, 1320, 1380, 1420, 1480]} />
        <KpiCard label="Comm. Received" value="GHS 942,800" delta="+21.5%" deltaDirection="up" subtext="Recognized revenue"
          icon={<CheckCircle2 size={18} />} />
        <KpiCard label="Outstanding Comm." value="GHS 537,700" subtext="18 pending transactions"
          icon={<Clock size={18} />} />
        <KpiCard label="Overdue Payments" value="3 deals" delta="GHS 86,400 arrears" deltaDirection="down" subtext="Needs Collection · 14d max"
          icon={<AlertTriangle size={18} />} />
        <KpiCard label="Avg Collection Time" value="18.4 days" delta="3.2 days faster" deltaDirection="up" subtext="Invoice to settlement"
          icon={<Zap size={18} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Revenue by Transaction Stage</h2>
          <p className="text-sm text-gray-400 mb-3">Aggregate listing value & commission potential by workflow pipeline stage — Pipeline Total: GHS 123.7M</p>
          <StageRevenueBars stages={MOCK_STAGES} footer={MOCK_STAGES_FOOTER} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Payment Status</h2>
          <p className="text-sm text-gray-400 mb-3">Volume & settlement velocity — Q4 Total</p>
          <FinanceDonut segments={MOCK_PAYMENT_STATUS} centerPct={64} centerLabel="Paid On Time"
            footerLeft="Audit Ref: HORI-FIN-2024-Q4" footerRight="View Ledger Details →" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Commission Split — Agent vs Company</h2>
          <p className="text-sm text-gray-400 mb-3">Net revenue distribution across closed & queued deals for current period</p>
          <CommissionSplitCard
            total="GHS 942,800" tag="Standard 65/35 Model" splitPct={65}
            agentLabel="Agent Disbursed Share (65% avg)" agentValue="GHS 612,820" agentNote="Disbursed to primary & secondary brokers"
            companyLabel="Brokerage Gross Margin (35% avg)" companyValue="GHS 329,980" companyNote="Horilux corporate retained operations"
            footerItems={[
              { label: 'Avg Payout Velocity', value: '4.2 days post-closing' },
              { label: 'Top Producing Agent', value: 'Efua Sutherland (34% volume)' },
            ]}
          />
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Commission Rules Schedule</h2>
          <p className="text-sm text-gray-400 mb-3">Current institutional tier schedule (Read-Only)</p>
          <CommissionRulesTable rows={MOCK_RULES} tag="Tier V4" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="font-semibold text-lg">Overdue Payments</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">Requires follow-up</p>
          <OverdueList badge="3 Urgencies" items={MOCK_OVERDUE} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Upcoming Expected Payments</h2>
          <p className="text-sm text-gray-400 mb-3">Approved upcoming disbursements — Next 14 Days</p>
          <UpcomingPaymentsList items={MOCK_UPCOMING} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <h2 className="font-semibold text-lg">Recent Commission Settlements</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border">Filter by Agent</button>
            <button className="px-3 py-1.5 text-xs font-bold rounded-lg" style={{ color: COLORS.midnight, backgroundColor: `${COLORS.midnight}0d` }}>View Full Audit Ledger →</button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4">Validated transactions, disbursal receipts, and revenue allocation ledger</p>
        <SettlementsLedgerTable rows={MOCK_SETTLEMENTS} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Cash Flow Forecast</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-extrabold uppercase tracking-wider">Forecasting — coming soon</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Predictive liquidity modeling based on active contracts and standard settlement velocities.</p>
            <div className="p-4 rounded-xl bg-gray-50 border border-dashed h-20 flex items-center justify-center text-gray-300 text-xs">
              [ forecast chart preview ]
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 mt-4 border-t">
            <span>Automated predictive receivables modeling</span>
            <span className="font-bold text-gray-500">Q1 Roadmap</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Tax & GRA Compliance Summary</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-extrabold uppercase tracking-wider">Tax reporting — coming soon</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Automated withholding tax (WHT) schedules for Ghana Revenue Authority compliance.</p>
            <div className="space-y-2.5 p-4 rounded-xl bg-gray-50 border border-dashed text-xs text-gray-400">
              <div className="flex justify-between"><span>GRA WHT 5% (Agency Standard)</span><span className="font-bold">Locked</span></div>
              <div className="flex justify-between"><span>VAT & Levy Withholding (15% + 6%)</span><span className="font-bold">Locked</span></div>
              <div className="flex justify-between"><span>Annual Audit Reconciliation Pack</span><span className="font-bold">Generating</span></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 mt-4 border-t">
            <span>Direct GRA e-Tax portal integration</span>
            <span className="font-bold text-gray-500">v2.5 preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
