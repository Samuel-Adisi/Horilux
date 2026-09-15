import { useSalesPipeline } from "@/features/dashboard/hooks/use-sales-pipeline";

function formatCurrency(value: number): string {
  return `GH\u20b5${value.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

const STAGE_HOVER_COLORS = [
  "hover:border-blue-500",
  "hover:border-cyan-500",
  "hover:border-teal-500",
  "hover:border-amber-500",
  "hover:border-orange-500",
  "hover:border-fuchsia-500",
  "hover:border-emerald-500",
];

function PipelineSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-72 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-7 w-20 bg-white/5 rounded animate-pulse mt-4" />
            <div className="h-3 w-24 bg-white/5 rounded animate-pulse mt-3" />
          </div>
        ))}
      </div>
      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="h-5 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="p-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-36 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CeoSalesPipelinePage() {
  const { data, isLoading, isError } = useSalesPipeline();

  if (isLoading) {
    return <PipelineSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-400">
        Couldn't load sales pipeline data. Try refreshing, or check that you have permission to view company-wide sales data.
      </div>
    );
  }

  const hasData = data.total_leads > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
        <p className="text-sm text-slate-400 mt-1">
          Lead stage breakdown and active transactions still in progress.
          {data.lost_count > 0 ? ` ${data.lost_count} lead${data.lost_count === 1 ? "" : "s"} lost.` : ""}
        </p>
      </div>

      {!hasData ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-sm text-slate-400">
          No leads recorded yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.stages.map((stage, i) => (
              <div
                key={stage.status}
                className={`bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all ${STAGE_HOVER_COLORS[i % STAGE_HOVER_COLORS.length]}`}
              >
                <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">{stage.label}</p>
                <p className="text-2xl font-bold text-white mt-3 font-mono">{stage.deal_count} leads</p>
                <p className="text-xs text-slate-500 mt-2">{formatCurrency(stage.value)} pipeline value</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Transactions in Progress</h2>
              <span className="text-xs text-slate-500">Top {data.deals_in_flight.length} by value</span>
            </div>
            {data.deals_in_flight.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No transactions currently in progress.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-slate-500 border-b border-white/10">
                      <th className="px-5 py-3 font-medium">Property</th>
                      <th className="px-5 py-3 font-medium">Client</th>
                      <th className="px-5 py-3 font-medium">Agent</th>
                      <th className="px-5 py-3 font-medium">Value</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deals_in_flight.map((deal) => (
                      <tr key={deal.id} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3.5 font-semibold text-white">{deal.property_title}</td>
                        <td className="px-5 py-3.5 text-slate-300">{deal.client_name}</td>
                        <td className="px-5 py-3.5 text-slate-300">{deal.agent_name}</td>
                        <td className="px-5 py-3.5 text-slate-300 font-mono">{formatCurrency(deal.price)}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-600/20 text-blue-300">
                            {deal.status_label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
