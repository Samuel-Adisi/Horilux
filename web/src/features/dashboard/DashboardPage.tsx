import { useState } from 'react';
import { Building2, Users, CalendarCheck, ClipboardList, Gauge } from 'lucide-react';
import {
  KpiCard,
  EngagementVelocityChart,
  ConversionFunnel,
  StatusDonut,
  ValuationTierBars,
  ManagedPropertiesTable,
  ViewingsAgenda,
  LeadsSnapshot,
  ActivityFeed,
  COLORS,
} from './components/DashboardSections';

const MOCK_ENGAGEMENT = [
  { date: 'Oct 01', views: 1200, inquiries: 90, viewings: 8 },
  { date: 'Oct 07', views: 1800, inquiries: 130, viewings: 14 },
  { date: 'Oct 14', views: 2400, inquiries: 200, viewings: 22 },
  { date: 'Oct 21', views: 3100, inquiries: 280, viewings: 40 },
  { date: 'Today', views: 3420, inquiries: 312, viewings: 48 },
];

const MOCK_FUNNEL = [
  { label: 'New Lead Inquiries', count: 342, pct: 100 },
  { label: 'Initial Contact Confirmed', count: 248, pct: 72.5 },
  { label: 'Viewing Scheduled', count: 98, pct: 28.6 },
  { label: 'Written Offer', count: 34, pct: 9.9 },
  { label: 'Closed / Escrow', count: 18, pct: 5.3 },
];

const MOCK_STATUS = [
  { name: 'Available', value: 24, color: '#240270' },
  { name: 'Under Offer', value: 12, color: '#003E03' },
  { name: 'Sold YTD', value: 8, color: '#7A6D0C' },
  { name: 'Off-Market', value: 4, color: '#9CA3AF' },
];

const MOCK_TIERS = [
  { label: '$500k–$1.0M', units: 6, value: '$4.8M', pct: 15 },
  { label: '$1.0M–$2.5M', units: 14, value: '$23.2M', pct: 44 },
  { label: '$2.5M–$5.0M', units: 16, value: '$54.4M', pct: 78 },
  { label: '$5.0M–$10.0M', units: 8, value: '$48.0M', pct: 52 },
  { label: '$10.0M+', units: 4, value: '$42.4M', pct: 32 },
];


const MOCK_PROPERTIES = [
  { id: 1, title: 'The Bel-Air Horizon Villa', address: '740 Maplewood Drive, Bel-Air', price: '$8,450,000', status: 'Available', dom: 14, views: 3840, inquiries: 48, lastUpdated: '2 hrs ago' },
  { id: 2, title: 'The Waterfront Peninsula', address: '88 Harbor View Lane, Newport', price: '$12,800,000', status: 'Under Offer', dom: 22, views: 5190, inquiries: 92, lastUpdated: 'Yesterday' },
  { id: 3, title: 'Emerald Crest Residence', address: '1204 Emerald Bay Road, Laguna', price: '$4,200,000', status: 'Review Pending', dom: 4, views: 940, inquiries: 12, lastUpdated: '3 days ago' },
  { id: 4, title: 'Westlake Glass Penthouse', address: '550 Westlake Blvd, Austin', price: '$3,150,000', status: 'Available', dom: 31, views: 2650, inquiries: 34, lastUpdated: 'Oct 19' },
];

const MOCK_VIEWINGS = [
  { id: 1, name: 'Marcus Vance (Vance Family Trust)', address: '88 Harbor View Lane', tag: 'VIP Principal', host: 'Elena Vance', time: '2:00 PM' },
  { id: 2, name: 'Sophia Laurent & Counsel', address: '740 Maplewood Drive', tag: 'Pre-Approved Cash', host: 'Test Listing', time: '4:30 PM' },
  { id: 3, name: 'Dr. Jonathan Sterling', address: '550 Westlake Blvd, Austin', tag: 'Second Inspection', time: 'Tomorrow' },
];

const MOCK_CHANNELS = [
  { label: 'Referral', pct: 45, color: '#240270' },
  { label: 'Web Portal', pct: 35, color: '#7A6D0C' },
  { label: 'Syndication', pct: 20, color: '#9CA3AF' },
];

const MOCK_LEADS = [
  { id: 1, initials: 'AK', name: 'Alexander Kovacs', note: 'Interested in Bel-Air Horizon', tag: 'Pre-Approved' },
  { id: 2, initials: 'HL', name: 'Henrietta Lowe', note: 'Private Inquiry: Westlake', tag: 'Initial Reachout' },
];

const MOCK_ACTIVITY = [
  { id: 1, text: 'AML & Patriot Check Cleared for Marcus Vance Trust.', time: '14 mins ago' },
  { id: 2, text: 'Offer Submitted — $2,100,000 formal binding LOI for Suite 4B.', time: '1 hr ago' },
  { id: 3, text: 'Price Revision Registered on 88 Harbor View Lane.', time: '3 hrs ago' },
];

export function DashboardPage() {
  const [loading] = useState(false);
  const [error] = useState(false);

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl text-red-800">
        Failed to load dashboard data. Please retry.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-200" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 h-96 rounded-2xl bg-gray-200" />
          <div className="xl:col-span-4 h-96 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium uppercase tracking-wide">
              Listing Agent
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-mono text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>Welcome back</h1>
          <p className="text-sm text-gray-500">Here's what's happening with your listings.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-700">
            <span>Export Intel</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-700">
            <span>Schedule Viewing</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity text-sm font-medium"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <span>+ Add Property</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Active Listings" value={28} delta="+12.5%" deltaDirection="up" subtext="Vs previous month"
          icon={<Building2 size={18} />} sparkline={[12, 15, 14, 18, 22, 25, 28]} />
        <KpiCard label="New Leads This Week" value={42} delta="+18.4%" deltaDirection="up" subtext="8 high intent"
          icon={<Users size={18} />} sparkline={[20, 22, 26, 30, 34, 38, 42]} />
        <KpiCard label="Upcoming Viewings" value={9} subtext="Next: 2:00 PM"
          icon={<CalendarCheck size={18} />} sparkline={[5, 6, 7, 6, 8, 9, 9]} />
        <KpiCard label="Pending Review" value={4} subtext="Title deeds & AML"
          icon={<ClipboardList size={18} />} sparkline={[6, 5, 5, 4, 4, 3, 4]} />
        <KpiCard label="Avg Days on Market" value={19.4} delta="-4.2d" deltaDirection="down" subtext="Benchmark: 23.6d"
          icon={<Gauge size={18} />} sparkline={[24, 23, 22, 21, 20, 19.8, 19.4]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Listing Engagement Velocity</h2>
          <p className="text-sm text-gray-400 mb-3">Views, inquiries, and viewings over time</p>
          <EngagementVelocityChart data={MOCK_ENGAGEMENT} />
        </div>
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1">Conversion Funnel</h2>
          <p className="text-sm text-gray-400 mb-3">Lead progression through closure</p>
          <ConversionFunnel stages={MOCK_FUNNEL} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Portfolio Composition by Status</h2>
          <StatusDonut segments={MOCK_STATUS} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Listings by Valuation Tier</h2>
          <ValuationTierBars tiers={MOCK_TIERS} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">My Managed Properties</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{MOCK_PROPERTIES.length} Active</span>
              </div>
              <p className="text-sm text-gray-400">Live listing statuses, client traffic, and offer stages</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter address, MLS ID..."
                className="px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:bg-gray-100 w-48 sm:w-60"
              />
              <button className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600">⚙</button>
            </div>
          </div>
          <ManagedPropertiesTable properties={MOCK_PROPERTIES} />
          <div className="pt-3 flex justify-between items-center border-t mt-3">
            <span className="text-sm text-gray-400">Showing {MOCK_PROPERTIES.length} of {MOCK_PROPERTIES.length} managed properties</span>
            <a href="/properties" className="text-sm font-medium" style={{ color: COLORS.midnight }}>View all Properties →</a>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Viewings Agenda</h3>
              <a href="/viewings" className="text-sm text-gray-400">View calendar →</a>
            </div>
            <ViewingsAgenda viewings={MOCK_VIEWINGS} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Leads Origin Snapshot</h3>
            <LeadsSnapshot channels={MOCK_CHANNELS} leads={MOCK_LEADS} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Recent Activity</h3>
            <ActivityFeed events={MOCK_ACTIVITY} />
          </div>
        </div>
      </div>
    </div>
  );
}
