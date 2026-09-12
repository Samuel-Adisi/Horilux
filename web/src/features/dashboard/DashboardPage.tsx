import { useState } from 'react';
import {
  KpiCard,
  EngagementVelocityChart,
  ConversionFunnel,
  StatusDonut,
  ValuationTierBars,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: '#240270' }}>Welcome back</h1>
        <p className="text-sm text-gray-500">Here's what's happening with your listings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Active Listings" value={28} delta="+12.5%" deltaDirection="up" subtext="Vs previous month" />
        <KpiCard label="New Leads This Week" value={42} delta="+18.4%" deltaDirection="up" subtext="8 high intent" />
        <KpiCard label="Upcoming Viewings" value={9} subtext="Next: 2:00 PM" />
        <KpiCard label="Pending Review" value={4} subtext="Title deeds & AML" />
        <KpiCard label="Avg Days on Market" value={19.4} delta="-4.2d" deltaDirection="down" subtext="Benchmark: 23.6d" />
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
    </div>
  );
}
