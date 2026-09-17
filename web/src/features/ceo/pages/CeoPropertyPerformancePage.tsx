import { useMemo, useState } from "react";
import { usePropertyPerformance } from "@/features/property-performance/hooks/use-property-performance";
import type { PropertyPerformanceRow } from "@/features/property-performance/types";
import { KpiCard } from "@/features/dashboard/components/DashboardSections";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  onboarding: "Onboarding",
  pending_verification: "Pending Verification",
  verified: "Verified",
  pending_approval: "Pending Approval",
  marketing_ready: "Marketing Ready",
  published: "Published",
  under_offer: "Under Offer",
  sold_rented: "Sold / Rented",
  archived: "Archived",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500",
  onboarding: "bg-slate-500",
  pending_verification: "bg-amber-500",
  verified: "bg-blue-500",
  pending_approval: "bg-amber-500",
  marketing_ready: "bg-blue-500",
  published: "bg-emerald-500",
  under_offer: "bg-emerald-500",
  sold_rented: "bg-emerald-600",
  archived: "bg-slate-600",
};

function formatMoney(value: number | null): string {
  if (value === null) return "\u2014";
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value);
}

function StatusFunnelBar({ funnel, total }: { funnel: Record<string, number>; total: number }) {
  const entries = Object.entries(funnel).filter(([, count]) => count > 0);
  return (
    <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
      <h3 className="text-[15px] font-semibold text-white mb-4">Status Funnel</h3>
      <div className="space-y-3">
        {entries.map(([status, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="text-slate-300">{STATUS_LABELS[status] ?? status}</span>
                <span className="text-slate-400">{count} ({pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${STATUS_COLORS[status] ?? "bg-slate-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PropertyMiniTable({ title, rows }: { title: string; rows: PropertyPerformanceRow[] }) {
  return (
    <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] text-left">
          <thead className="text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
            <tr>
              <th className="px-5 py-2.5 font-medium">Property</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Price</th>
              <th className="px-5 py-2.5 font-medium">Views</th>
              <th className="px-5 py-2.5 font-medium">Days on Market</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-500">No data.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-white">{r.title}</td>
                  <td className="px-5 py-3 text-slate-300">{STATUS_LABELS[r.status] ?? r.status}</td>
                  <td className="px-5 py-3 text-slate-300">{formatMoney(r.price)}</td>
                  <td className="px-5 py-3 text-slate-300">{r.views_count}</td>
                  <td className="px-5 py-3 text-slate-300">{r.days_on_market}d</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PropertyPerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
    </div>
  );
}

export default function CeoPropertyPerformancePage() {
  const { data, isLoading, isError } = usePropertyPerformance();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const filtered = useMemo(() => {
    const rows = data?.properties ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.property_type.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  if (isLoading && !data) {
    return <PropertyPerformanceSkeleton />;
  }

  if (isError || !data) {
    return <p className="text-[13px] text-red-400">Couldn't load property performance.</p>;
  }

  const statusOptions = Object.keys(data.status_funnel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Property Performance</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          Engagement, conversion, and time-on-market across {data.summary.total_properties} properties
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Properties" value={data.summary.total_properties} />
        <KpiCard label="Total Views" value={data.summary.total_views.toLocaleString()} />
        <KpiCard label="Total Inquiries" value={data.summary.total_inquiries.toLocaleString()} />
        <KpiCard label="Avg. Days on Market" value={`${data.summary.avg_days_on_market}d`} />
      </div>

      <StatusFunnelBar funnel={data.status_funnel} total={data.summary.total_properties} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PropertyMiniTable title="Top Performers" rows={data.top_performers} />
        <PropertyMiniTable title="Stale Listings" rows={data.stale_listings} />
      </div>

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by property or type\u2026"
          className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Region</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">vs Region Avg</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Inquiries</th>
                <th className="px-5 py-3 font-medium">Viewings</th>
                <th className="px-5 py-3 font-medium">Days on Market</th>
                <th className="px-5 py-3 font-medium">Converted</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-500">
                    No properties match this page's filters.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-white">{r.title}</td>
                    <td className="px-5 py-3 text-slate-300">{STATUS_LABELS[r.status] ?? r.status}</td>
                    <td className="px-5 py-3 text-slate-400">{r.region || "\u2014"}</td>
                    <td className="px-5 py-3 text-slate-300">{formatMoney(r.price)}</td>
                    <td className="px-5 py-3 text-slate-300">
                      {r.price_vs_region_avg_pct === null ? "\u2014" : `${r.price_vs_region_avg_pct > 0 ? "+" : ""}${r.price_vs_region_avg_pct}%`}
                    </td>
                    <td className="px-5 py-3 text-slate-300">{r.views_count}</td>
                    <td className="px-5 py-3 text-slate-300">{r.inquiries_count}</td>
                    <td className="px-5 py-3 text-slate-300">
                      {r.viewings_total} <span className="text-slate-500">({r.viewings_hot}H / {r.viewings_warm}W / {r.viewings_cold}C)</span>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{r.days_on_market}d</td>
                    <td className="px-5 py-3">
                      {r.converted_to_transaction ? (
                        <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-400">Yes</span>
                      ) : (
                        <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium bg-slate-500/15 text-slate-400">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {paginated.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{(currentPage - 1) * PAGE_SIZE + paginated.length} of {filtered.length}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-slate-500">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
