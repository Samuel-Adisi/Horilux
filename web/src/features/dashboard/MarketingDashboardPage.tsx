import { Megaphone, Eye, MessageSquare, Users, TrendingUp } from 'lucide-react';
import {
  KpiCard,
  ConversionFunnel,
  CountBars,
  TeamLeaderboardTable,
  DualMetricBars,
  ActionQueueList,
  ScheduleList,
  PublishedCampaignCards,
  COLORS,
} from './components/DashboardSections';

const MOCK_FUNNEL = [
  { label: 'Views', count: 342850, pct: 100 },
  { label: 'Enquiries', count: 24180, pct: 7.1 },
  { label: 'Leads Generated', count: 1420, pct: 5.9 },
  { label: 'Viewings Booked', count: 412, pct: 29.0 },
  { label: 'Conversions', count: 58, pct: 14.1 },
];

const MOCK_STATUS = [
  { label: 'Published', count: 12, pct: 75 },
  { label: 'Scheduled', count: 6, pct: 45 },
  { label: 'In Review', count: 4, pct: 30 },
  { label: 'Draft', count: 9, pct: 60 },
];

const MOCK_LEADERBOARD = [
  { rank: 1, initials: 'ES', name: 'Efua Sutherland', title: 'Lead Campaign Strategist', campaigns: 8, views: '124K', leads: 142, conversion: '5.2%' },
  { rank: 2, initials: 'KM', name: 'Kwame Mensah', title: 'Senior Marketing Associate', campaigns: 6, views: '98K', leads: 118, conversion: '4.4%' },
  { rank: 3, initials: 'AA', name: 'Akosua Agyapong', title: 'Digital Media Specialist', campaigns: 4, views: '72K', leads: 76, conversion: '3.8%' },
];

const MOCK_PROPERTY_TYPES = [
  { label: 'Luxury Penthouses & Villas', metricText: '94K views • 480 enq', pct: 85 },
  { label: 'Residential Apartments', metricText: '82K views • 410 enq', pct: 74 },
  { label: 'Commercial Office Suites', metricText: '54K views • 210 enq', pct: 49 },
  { label: 'Gated Community Plots / Land', metricText: '38K views • 180 enq', pct: 35 },
];

const MOCK_NEEDS_REVIEW = [
  { id: 1, name: 'Villagio Vista Penthouse Spring Push', waitingLabel: 'In Review', detail: 'Created 4 days ago • Assigned: Efua Sutherland', buttonLabel: 'Review' },
  { id: 2, name: 'Cantonments Luxury Villas Showcase', waitingLabel: 'Draft > 6d', waitingUrgent: true, detail: 'Created 6 days ago • Assigned: Kwame Mensah', buttonLabel: 'Review' },
  { id: 3, name: 'Airport Hills Executive Suites Re-launch', waitingLabel: 'In Review', detail: 'Created 8 days ago • Assigned: Akosua Agyapong', buttonLabel: 'Review' },
];

const MOCK_SCHEDULE = [
  { id: 1, month: 'Oct', day: '26', title: 'Ridge Signature Penthouse Video Tour', time: '10:00 AM', channel: 'Meta & YouTube Ad Sequence', tag: 'Scheduled' },
  { id: 2, month: 'Oct', day: '28', title: 'East Legon Smart Living Promo', time: '02:30 PM', channel: 'Google Search & Display Network', tag: 'Scheduled' },
  { id: 3, month: 'Nov', day: '01', title: 'Dzorwulu Commercial Hub Launch', time: '09:00 AM', channel: 'Institutional Investor Newsletter', tag: 'Scheduled' },
];

const MOCK_PUBLISHED = [
  { id: 1, badge: 'Live', publishedLabel: 'Published 2 days ago', title: 'The Residence Penthouse Campaign', subtitle: 'Prime Cantonments Multi-Platform Blast', views: '14.2k', enquiries: 84, leads: 18 },
  { id: 2, badge: 'Live', publishedLabel: 'Published 5 days ago', title: 'Kwarleyz Residence Suite 5A', subtitle: 'Airport Residential Luxury Studio Promo', views: '9.8k', enquiries: 52, leads: 12 },
  { id: 3, badge: 'Live', publishedLabel: 'Published 10 days ago', title: 'Meridian Industrial Hub Promo', subtitle: 'Tema Commercial Logistics Warehousing', views: '22.4k', enquiries: 140, leads: 34 },
];

export function MarketingDashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium uppercase tracking-wide">
              Marketing
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-mono text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>Marketing Performance</h1>
          <p className="text-sm text-gray-500">Campaign pipeline and property listing engagement across channels.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-700">
            <span>View Calendar</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity text-sm font-medium"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <span>+ New Campaign</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Active Campaigns" value="18" delta="+8%" deltaDirection="up" subtext="Scheduled + Published"
          icon={<Megaphone size={18} />} sparkline={[10, 12, 13, 15, 16, 17, 18]} />
        <KpiCard label="Total Views" value="342,850" delta="+24.5%" deltaDirection="up" subtext="vs last month"
          icon={<Eye size={18} />} />
        <KpiCard label="Total Enquiries" value="1,420" subtext="+12% closing rate"
          icon={<MessageSquare size={18} />} />
        <KpiCard label="Leads Generated" value="384" delta="+16.8%" deltaDirection="up" subtext="Yield"
          icon={<Users size={18} />} />
        <KpiCard label="Conversion Rate" value="4.1%" delta="+0.6%" deltaDirection="up" subtext="Improvement"
          icon={<TrendingUp size={18} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Campaign Performance Funnel</h2>
          <p className="text-sm text-gray-400 mb-3">End-to-end listing acquisition and conversion velocity — 342,850 total reach</p>
          <ConversionFunnel stages={MOCK_FUNNEL} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg mb-1">Campaign Status</h2>
            <p className="text-sm text-gray-400 mb-3">Lifecycle distribution</p>
            <CountBars items={MOCK_STATUS} />
          </div>
          <div className="pt-4 mt-4 border-t flex items-center justify-between text-xs font-semibold" style={{ color: COLORS.forest }}>
            <span>● 72% on-schedule rate</span>
            <span className="text-gray-400 font-normal">31 Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Avg Campaign Turnaround</h2>
          <p className="text-sm text-gray-400 mb-3">Draft to published lifecycle velocity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wide text-gray-400">Avg Creation Cycle</span>
              <div><span className="text-2xl font-bold" style={{ color: COLORS.midnight }}>4.2</span> <span className="text-sm text-gray-500">days</span></div>
              <span className="text-xs font-semibold" style={{ color: COLORS.forest }}>+1.1 days faster</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wide text-gray-400">Stale Drafts</span>
              <div><span className="text-2xl font-bold text-red-600">3</span> <span className="text-xs text-gray-500">campaigns</span></div>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 w-fit">Needs Attention &gt; 7d</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-lg text-gray-400">Spend & Budget Tracker</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-gray-100 text-gray-500">Budget tracking — coming soon</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Realized cost and acquisition margin</p>
            <div className="grid grid-cols-2 gap-4 opacity-50 select-none">
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed">
                <span className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Total Spend</span>
                <p className="text-xl font-bold text-gray-400 mt-2">GHS --,--</p>
                <p className="text-[11px] text-gray-400 mt-1">Target cap: GHS 120,000</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed">
                <span className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Cost per Lead</span>
                <p className="text-xl font-bold text-gray-400 mt-2">GHS --.--</p>
                <p className="text-[11px] text-gray-400 mt-1">Industry avg: GHS 62.00</p>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-4 border-t flex items-center justify-between text-xs text-gray-400">
            <span>Module in Q4 roadmap deployment</span>
            <span>v2.4 preview</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Team Performance Leaderboard</h2>
            <a href="#" className="text-sm font-medium" style={{ color: COLORS.midnight }}>View All →</a>
          </div>
          <p className="text-sm text-gray-400 mb-3">Top marketing associates driving verified leads</p>
          <TeamLeaderboardTable rows={MOCK_LEADERBOARD} />
        </div>
        <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Performance by Property Type</h2>
          <p className="text-sm text-gray-400 mb-3">Channel reach & direct enquiries</p>
          <DualMetricBars items={MOCK_PROPERTY_TYPES}
            footnoteLeft="High-net-worth segment drives 58% of conversions"
            footnoteRight="Luxury +22% YoY" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Campaigns Needing Review</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">Pending creative and institutional sign-off</p>
          <ActionQueueList badge="3 Urgencies" items={MOCK_NEEDS_REVIEW} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Upcoming Schedule</h2>
          <p className="text-sm text-gray-400 mb-3">Approved campaigns set for channel deployment</p>
          <ScheduleList items={MOCK_SCHEDULE} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-lg">Recently Published Campaigns</h2>
          <span className="text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5" style={{ backgroundColor: `${COLORS.forest}18`, color: COLORS.forest }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.forest }} /> 4 Active Campaigns
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-4">Real-time performance metrics for current broadcast activations</p>
        <PublishedCampaignCards campaigns={MOCK_PUBLISHED} />
      </div>
    </div>
  );
}
