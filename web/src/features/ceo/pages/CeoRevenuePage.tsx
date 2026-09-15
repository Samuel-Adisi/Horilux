import { useFinanceDetail } from "@/features/dashboard/hooks/use-finance-detail";

function formatCurrency(value: number): string {
  return `GH\u20b5${value.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function KpiCard({ label, value, sub, subColor, hover }: { label: string; value: string; sub?: string; subColor?: string; hover?: string }) {
  return (
    <div className={`bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all ${hover ?? ""}`}>
      <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white mt-3 font-mono">{value}</p>
      {sub ? <p className={`text-xs mt-2 ${subColor ?? "text-slate-500"}`}>{sub}</p> : null}
    </div>
  );
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-7 w-28 bg-white/5 rounded animate-pulse mt-4" />
            <div className="h-3 w-24 bg-white/5 rounded animate-pulse mt-3" />
          </div>
        ))}
      </div>

      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
          <div className="h-5 w-40 bg-white/5 rounded animate-pulse mt-2" />
        </div>
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
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

export default function CeoRevenuePage() {
  const { data, isLoading, isError } = useFinanceDetail();

  if (isLoading) {
    return <RevenueSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-400">
        Couldn't load revenue data. Try refreshing, or check that you have permission to view company-wide financials.
      </div>
    );
  }

  const hasData = data.transaction_count_ytd > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue & Commission</h1>
        <p className="text-sm text-slate-400 mt-1">Gross transaction volume, commission income, and agent payouts.</p>
      </div>

      {!hasData ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-sm text-slate-400">
          No transactions recorded yet this year.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Gross Transaction Volume (YTD)"
              value={formatCurrency(data.gross_volume_ytd)}
              sub={`${data.transaction_count_ytd} transactions this year`}
              hover="hover:border-blue-500"
            />
            <KpiCard
              label="Net Commission Income"
              value={formatCurrency(data.net_commission_income)}
              sub={`${data.effective_commission_percent}% effective commission`}
              subColor="text-emerald-400"
              hover="hover:border-emerald-500"
            />
            <KpiCard
              label="Outstanding Commission"
              value={formatCurrency(data.outstanding_commission)}
              sub="Awaiting collection"
              subColor="text-amber-400"
              hover="hover:border-amber-500"
            />
            <KpiCard
              label="Agent Payouts"
              value={formatCurrency(data.agent_payouts)}
              sub={`${data.agent_payout_percent}% of commission income`}
              hover="hover:border-purple-500"
            />
          </div>

          <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Monthly Ledger</p>
                <h2 className="text-lg font-bold text-white mt-1">Trailing 6 Months</h2>
              </div>
              <span className="text-xs text-slate-500">GHS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="px-5 py-3 font-medium">Month</th>
                    <th className="px-5 py-3 font-medium">Gross Volume</th>
                    <th className="px-5 py-3 font-medium">Commission Income</th>
                    <th className="px-5 py-3 font-medium">Agent Payouts</th>
                    <th className="px-5 py-3 font-medium">Company Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly_ledger.map((row) => (
                    <tr key={row.month} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3.5 font-semibold text-white">{row.month}</td>
                      <td className="px-5 py-3.5 text-slate-300 font-mono">{formatCurrency(row.gross_volume)}</td>
                      <td className="px-5 py-3.5 text-slate-300 font-mono">{formatCurrency(row.commission_income)}</td>
                      <td className="px-5 py-3.5 text-rose-400 font-mono">-{formatCurrency(row.agent_payouts)}</td>
                      <td className="px-5 py-3.5 text-emerald-400 font-mono">{formatCurrency(row.company_retention)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
