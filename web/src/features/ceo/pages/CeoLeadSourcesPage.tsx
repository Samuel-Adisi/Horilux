import { useLeadSourceStats } from "@/features/crm/hooks/use-lead-source-stats";
import type { LeadSourceStat } from "@/features/crm/types";

function conversionColor(rate: number): string {
  if (rate >= 30) return "bg-emerald-500/15 text-emerald-400";
  if (rate >= 15) return "bg-amber-500/15 text-amber-400";
  return "bg-slate-500/15 text-slate-300";
}

function LeadSourcesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceRow({ stat }: { stat: LeadSourceStat }) {
  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-5 py-3.5">
        <div className="font-semibold text-white truncate max-w-xs" title={stat.source}>{stat.source}</div>
      </td>
      <td className="px-5 py-3.5 text-slate-300">{stat.total_leads.toLocaleString()}</td>
      <td className="px-5 py-3.5 text-slate-300">{stat.qualified.toLocaleString()}</td>
      <td className="px-5 py-3.5 text-slate-300">{stat.converted.toLocaleString()}</td>
      <td className="px-5 py-3.5 text-slate-300">{stat.lost.toLocaleString()}</td>
      <td className="px-5 py-3.5">
        <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-medium ${conversionColor(stat.conversion_rate)}`}>
          {stat.conversion_rate}%
        </span>
      </td>
    </tr>
  );
}

export default function CeoLeadSourcesPage() {
  const { data, isLoading, isError } = useLeadSourceStats();

  if (isLoading && !data) {
    return <LeadSourcesSkeleton />;
  }

  if (isError) {
    return <p className="text-[13px] text-red-400">Couldn't load lead source stats.</p>;
  }

  const rows = data?.results ?? [];
  const totalLeads = rows.reduce((sum, r) => sum + r.total_leads, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Lead Sources</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          {totalLeads.toLocaleString()} leads across {rows.length} source{rows.length === 1 ? "" : "s"} — volume and conversion by channel
        </p>
      </div>

      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[11.5px] uppercase tracking-wide text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Total Leads</th>
                <th className="px-5 py-3 font-medium">Qualified</th>
                <th className="px-5 py-3 font-medium">Converted</th>
                <th className="px-5 py-3 font-medium">Lost</th>
                <th className="px-5 py-3 font-medium">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No lead source data yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => <SourceRow key={r.source} stat={r} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
