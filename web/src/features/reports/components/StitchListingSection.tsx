import "../stitch-fonts.css";
import type { ListingReport } from "../types";

export function StitchKpiRow({
  listingTotal,
  salesLeadsTotal,
  marketingCampaignsTotal,
  financeTransactionsTotal,
  operationsTasksTotal,
}: {
  listingTotal: number;
  salesLeadsTotal: number;
  marketingCampaignsTotal: number;
  financeTransactionsTotal: number;
  operationsTasksTotal: number;
}) {
  return (
    <section className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <div className="group relative cursor-default overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-white/60">Department</span>
            <span className="text-lg font-semibold tracking-tight text-white">Listing</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#0b132b" }}>real_estate_agent</span>
          </div>
        </div>
        <div className="relative z-10 mt-4 text-3xl font-bold tracking-tight text-white">
          {listingTotal.toLocaleString()}
        </div>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-3 select-none text-[96px] text-white/10 transition-transform duration-500 group-hover:scale-105">
          apartment
        </span>
      </div>

      <div className="group relative cursor-default overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#38bdf8] p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-white/70">Department</span>
            <span className="text-lg font-semibold tracking-tight text-white">Sales</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#1e40af" }}>monetization_on</span>
          </div>
        </div>
        <div className="relative z-10 mt-4 text-3xl font-bold tracking-tight text-white">
          {salesLeadsTotal.toLocaleString()}
        </div>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-3 select-none text-[96px] text-white/15 transition-transform duration-500 group-hover:scale-105">
          query_stats
        </span>
      </div>

      <div className="group relative cursor-default overflow-hidden rounded-2xl bg-gradient-to-br from-[#065f46] via-[#059669] to-[#34d399] p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-white/70">Department</span>
            <span className="text-lg font-semibold tracking-tight text-white">Marketing</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#065f46" }}>campaign</span>
          </div>
        </div>
        <div className="relative z-10 mt-4 text-3xl font-bold tracking-tight text-white">
          {marketingCampaignsTotal.toLocaleString()}
        </div>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-3 select-none text-[96px] text-white/15 transition-transform duration-500 group-hover:scale-105">
          travel_explore
        </span>
      </div>

      <div className="group relative cursor-default overflow-hidden rounded-2xl bg-gradient-to-br from-[#92400e] via-[#d97706] to-[#fbbf24] p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-white/70">Department</span>
            <span className="text-lg font-semibold tracking-tight text-white">Finance</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#92400e" }}>account_balance_wallet</span>
          </div>
        </div>
        <div className="relative z-10 mt-4 text-3xl font-bold tracking-tight text-white">
          {financeTransactionsTotal.toLocaleString()}
        </div>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-3 select-none text-[96px] text-white/15 transition-transform duration-500 group-hover:scale-105">
          lock
        </span>
      </div>

      <div className="group relative cursor-default overflow-hidden rounded-2xl bg-gradient-to-br from-[#581c87] via-[#7c3aed] to-[#a855f7] p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-white/70">Department</span>
            <span className="text-lg font-semibold tracking-tight text-white">Operations</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#581c87" }}>verified</span>
          </div>
        </div>
        <div className="relative z-10 mt-4 text-3xl font-bold tracking-tight text-white">
          {operationsTasksTotal.toLocaleString()}
        </div>
        <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-3 select-none text-[96px] text-white/15 transition-transform duration-500 group-hover:scale-105">
          settings_suggest
        </span>
      </div>
    </section>
  );
}

export function StitchListingSection({ report }: { report: ListingReport }) {
  const entries = Object.entries(report.by_status).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const ROW_STYLES = [
    { bar: "from-[#0F172A] to-[#1E40AF]", chipBg: "bg-slate-100", chipText: "text-slate-800" },
    { bar: "from-[#EA580C] to-[#F97316]", chipBg: "bg-orange-100", chipText: "text-orange-800" },
    { bar: "from-[#D97706] to-[#FBBF24]", chipBg: "bg-amber-100", chipText: "text-amber-800" },
    { bar: "from-[#0284C7] to-[#38BDF8]", chipBg: "bg-sky-100", chipText: "text-sky-800" },
    { bar: "from-[#059669] to-[#10B981]", chipBg: "bg-emerald-100", chipText: "text-emerald-800" },
  ];

  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex flex-col gap-4 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#131a33]/10">
            <span className="material-symbols-outlined text-[22px]" style={{ color: "#0b132b" }}>domain</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0b1c30]">Listing &amp; Inventory Intelligence</h2>
            <p className="text-xs text-[#45464d]">Property portfolio overview, turnover velocity &amp; tier allocations</p>
          </div>
        </div>

        {/* Action Pill Group — was missing */}
        <div className="flex shrink-0 items-center gap-1 self-start rounded-xl bg-[#eff4ff] p-1 md:self-auto">
          <button type="button" className="rounded-lg px-3 py-1.5 text-sm text-[#45464d] transition-colors hover:bg-[#dce9ff]">
            Past 30 Days
          </button>
          <button type="button" className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[#0b1c30] shadow-sm transition-colors">
            Quarterly
          </button>
          <button type="button" className="rounded-lg px-3 py-1.5 text-sm text-[#45464d] transition-colors hover:bg-[#dce9ff]">
            YTD
          </button>
          <div className="mx-1 h-4 w-px bg-[#c6c6ce]/60" />
          <button type="button" className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-[#0b1c30] shadow-sm transition-colors hover:bg-[#dce9ff]">
            <span className="material-symbols-outlined text-[16px] text-[#45464d]">file_download</span>
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#1E3A8A] p-6 text-white shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase text-slate-300">Active Managed Portfolio</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px] text-white">real_estate_agent</span>
              </div>
            </div>
            <div className="text-[34px] font-bold leading-tight text-white">
              {report.total_properties.toLocaleString()} Properties
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2 text-slate-200">
              <span className="text-sm">Average Completion</span>
              <span className="font-mono font-semibold text-white">{Math.round(report.avg_completion_percent)}%</span>
            </div>
          </div>

          {/* Pill sub-cards — these 4 were missing entirely.
              NOTE: Average Days on Market, Pending Inspections, Overdue Docs,
              New Listings This Week have NO matching field in ListingReport.
              Static placeholder values below, copied from the Stitch mock. */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3.5 transition-colors hover:bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0b1c30]">Average Days on Market</span>
                  <span className="font-mono text-xs text-emerald-700">-4 days faster than luxury avg</span>
                </div>
              </div>
              <span className="text-[20px] font-bold text-emerald-950">24 Days</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3.5 transition-colors hover:bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0b1c30]">Pending Inspections</span>
                  <span className="font-mono text-xs text-blue-700">All within 7-day window</span>
                </div>
              </div>
              <span className="text-[20px] font-bold text-blue-950">86 Units</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3.5 transition-colors hover:bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0b1c30]">Overdue Docs / Disclosures</span>
                  <span className="font-mono text-xs text-amber-700">Requires escrow desk review</span>
                </div>
              </div>
              <span className="text-[20px] font-bold text-amber-950">14 Flagged</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 p-3.5 transition-colors hover:bg-indigo-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <span className="material-symbols-outlined text-[18px]">add_home</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0b1c30]">New Listings This Week</span>
                  <span className="font-mono text-xs text-indigo-700">Mansions, Estates &amp; Penthouses</span>
                </div>
              </div>
              <span className="text-[20px] font-bold text-indigo-950">+42</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown Panel */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#eff4ff]/60 p-6 lg:col-span-8">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#0b1c30]">Properties by Status</h3>
                <p className="text-xs text-[#45464d]">Real-time distribution across active portfolio inventory tiers</p>
              </div>
              <span className="rounded bg-[#dce9ff] px-2.5 py-1 font-mono text-xs font-medium text-[#0b1c30]">
                {total.toLocaleString()} Total
              </span>
            </div>

            <div className="flex flex-col gap-4 py-2">
              {entries.map(([key, count], i) => {
                const pct = total === 0 ? 0 : Math.round((count / total) * 100);
                const s = ROW_STYLES[i % ROW_STYLES.length];
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="w-40 font-semibold capitalize text-[#0b1c30]">{key.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#45464d]">{count} units</span>
                        <span className="w-12 text-right font-mono font-bold text-[#0b1c30]">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#d3e4fe]">
                      <div className={`h-full rounded-full bg-gradient-to-r ${s.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {entries.map(([key, count], i) => {
              const pct = total === 0 ? 0 : Math.round((count / total) * 100);
              const s = ROW_STYLES[i % ROW_STYLES.length];
              return (
                <div key={key} className="flex flex-col justify-between rounded-xl bg-white p-3.5 shadow-sm">
                  <span className="text-[12px] capitalize text-[#45464d]">{key.replace(/_/g, " ")}</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-[20px] font-bold text-[#0b1c30]">{count}</span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${s.chipBg} ${s.chipText}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#d3e4fe]">
                    <div className={`h-full bg-gradient-to-r ${s.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Escrow Verification Stream strip — was missing entirely.
   NOTE: none of these three transactions exist in your data model.
   Static placeholder content copied verbatim from the Stitch mock. */
export function StitchEscrowStream() {
  const deals = [
    { name: "The Bel-Air Promontory", address: "10724 Chalon Rd, Los Angeles", status: "Closed", statusBg: "bg-emerald-100", statusText: "text-emerald-800", noteLabel: "Wire Confirmed", amount: "$48,500,000" },
    { name: "Tribeca Penthouse Suite IV", address: "443 Greenwich St, New York", status: "Escrow Day 14", statusBg: "bg-blue-100", statusText: "text-blue-800", noteLabel: "Title Clean", amount: "$22,750,000" },
    { name: "Star Island Waterfront Compound", address: "28 Star Island Dr, Miami Beach", status: "Review", statusBg: "bg-amber-100", statusText: "text-amber-800", noteLabel: "Financing Waiver", amount: "$34,000,000" },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce9ff]">
            <span className="material-symbols-outlined text-[20px] text-[#131a33]">receipt_long</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0b1c30]">Escrow Verification Stream</h3>
            <p className="text-xs text-[#45464d]">Real-time institutional escrow settlements and regulatory filings</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-xs text-[#45464d]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Live Settlement Feed
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {deals.map((deal) => (
          <div key={deal.name} className="flex flex-col justify-between rounded-xl bg-[#eff4ff]/70 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <span className="block text-sm font-semibold text-[#0b1c30]">{deal.name}</span>
                <span className="block text-xs text-[#45464d]">{deal.address}</span>
              </div>
              <span className={`rounded px-2 py-0.5 text-[11px] font-mono font-semibold ${deal.statusBg} ${deal.statusText}`}>
                {deal.status}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-[#d3e4fe]/60 pt-2">
              <span className="font-mono text-xs text-[#45464d]">{deal.noteLabel}</span>
              <span className="text-[18px] font-bold text-[#0b1c30]">{deal.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
