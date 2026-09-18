import { Page, PageHeader, Segmented } from "@/components/ui/page";
import { ErrorState, Panel, Skeleton, Stat, StatStrip } from "@/components/ui/display";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TrendChart } from "@/components/ui/charts";
import { useCan } from "@/features/accounts/permissions";
import { useFinanceDetail, useRevenueTrend } from "@/features/reports/api";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatPercent } from "@/lib/format";

export function RevenuePage() {
  useDocumentTitle("Revenue");
  const can = useCan();
  const { values, set } = useUrlState(["range"] as const);
  const range = (["M", "Q", "Y"].includes(values.range) ? values.range : "Q") as "M" | "Q" | "Y";
  const detail = useFinanceDetail(12);
  const trend = useRevenueTrend(range, can("executive_insights"));
  const d = detail.data;

  return (
    <Page>
      <PageHeader title="Revenue" description="Deal volume and commission income, year to date." />
      {detail.isLoading ? (
        <Skeleton className="h-20" />
      ) : detail.isError || !d ? (
        <Panel>
          <ErrorState error={detail.error} onRetry={() => detail.refetch()} />
        </Panel>
      ) : (
        <>
          <StatStrip>
            <Stat label="Gross volume (YTD)" value={formatMoney(d.gross_volume_ytd, "GHS", { compact: true })} hint={`${d.transaction_count_ytd} transactions`} />
            <Stat label="Commission income" value={formatMoney(d.net_commission_income, "GHS", { compact: true })} hint={`${formatPercent(d.effective_commission_percent, 1)} effective rate`} />
            <Stat label="Company retention" value={formatMoney(d.company_retention, "GHS", { compact: true })} hint={`Agents paid ${formatPercent(d.agent_payout_percent)}`} />
            <Stat label="Commission outstanding" value={formatMoney(d.outstanding_commission, "GHS", { compact: true })} tone={d.outstanding_commission > 0 ? "warning" : undefined} />
          </StatStrip>

          {can("executive_insights") && (
            <Panel
              className="mt-6"
              title="Volume trend"
              description="Closed and in-flight deal value by month, against the same months a year earlier."
              actions={
                <Segmented
                  value={range}
                  onChange={(v) => set({ range: v === "Q" ? null : v })}
                  options={[
                    { value: "M", label: "6 mo" },
                    { value: "Q", label: "12 mo" },
                    { value: "Y", label: "24 mo" },
                  ]}
                />
              }
            >
              {trend.isLoading ? (
                <Skeleton className="h-[260px]" />
              ) : (trend.data?.trend.length ?? 0) === 0 ? (
                <p className="py-16 text-center text-sm text-ink-subtle">No transactions in this period yet.</p>
              ) : (
                <TrendChart
                  data={trend.data!.trend.map((t) => ({ label: t.month, current: t.current, prior: t.prior }))}
                  series={[
                    { key: "current", label: "This period" },
                    { key: "prior", label: "Year before", dashed: true },
                  ]}
                />
              )}
            </Panel>
          )}

          <Panel className="mt-6" title="Monthly ledger" flush>
            {d.monthly_ledger.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-subtle">No ledger entries yet.</p>
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Month</TH>
                    <TH align="right">Gross volume</TH>
                    <TH align="right">Commission</TH>
                    <TH align="right" className="hidden sm:table-cell">
                      Agent payouts
                    </TH>
                    <TH align="right">Retained</TH>
                  </tr>
                </THead>
                <TBody>
                  {d.monthly_ledger.map((m) => (
                    <TR key={m.month}>
                      <TD className="font-semibold">{m.month}</TD>
                      <TD align="right">{formatMoney(m.gross_volume)}</TD>
                      <TD align="right">{formatMoney(m.commission_income)}</TD>
                      <TD align="right" className="hidden text-ink-muted sm:table-cell">
                        {formatMoney(m.agent_payouts)}
                      </TD>
                      <TD align="right" className="font-semibold">
                        {formatMoney(m.company_retention)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Panel>
        </>
      )}
    </Page>
  );
}
