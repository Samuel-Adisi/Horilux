import { Link } from "react-router-dom";
import { Page, PageHeader } from "@/components/ui/page";
import { ErrorState, Panel, Skeleton, Stat, StatStrip } from "@/components/ui/display";
import { BarList } from "@/components/ui/charts";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCeoDashboard, useSalesPipeline } from "@/features/reports/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatPercent } from "@/lib/format";

export function PipelinePage() {
  useDocumentTitle("Sales pipeline");
  const q = useSalesPipeline();
  const dash = useCeoDashboard();
  const d = q.data;

  return (
    <Page>
      <PageHeader title="Sales pipeline" description="Where every lead sits, and the biggest deals still open." />
      {q.isLoading ? (
        <Skeleton className="h-96" />
      ) : q.isError || !d ? (
        <Panel>
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        </Panel>
      ) : (
        <>
          <StatStrip>
            <Stat label="Total leads" value={d.total_leads} />
            <Stat label="In negotiation" value={d.stages.find((s) => s.status === "negotiation")?.deal_count ?? 0} />
            <Stat label="Closed" value={d.stages.find((s) => s.status === "closed")?.deal_count ?? 0} tone="success" />
            <Stat label="Lost" value={d.lost_count} hint={d.total_leads ? `${formatPercent((d.lost_count / d.total_leads) * 100)} of leads` : undefined} />
          </StatStrip>
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Panel title="Leads by stage" className="lg:col-span-2">
              <BarList items={d.stages.map((s) => ({ key: s.status, label: s.label, value: s.deal_count }))} />
            </Panel>
            <Panel title="Stage conversion" description="Share of all leads that reached each stage." className="lg:col-span-3">
              {dash.data ? (
                <BarList
                  items={dash.data.conversion_funnel.map((f) => ({ key: f.label, label: f.label, value: f.pct, hint: `${f.count} leads` }))}
                  format={(v) => formatPercent(v, 1)}
                />
              ) : (
                <Skeleton className="h-48" />
              )}
            </Panel>
          </div>
          <Panel className="mt-6" title="Largest open deals" flush>
            {d.deals_in_flight.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-subtle">No open deals.</p>
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Property</TH>
                    <TH className="hidden md:table-cell">Client</TH>
                    <TH className="hidden lg:table-cell">Agent</TH>
                    <TH>Stage</TH>
                    <TH align="right">Value</TH>
                  </tr>
                </THead>
                <TBody>
                  {d.deals_in_flight.map((x) => (
                    <TR key={x.id}>
                      <TD>
                        <Link to={`/transactions/${x.id}`} className="font-semibold hover:text-brand-fg hover:underline">
                          {x.property_title}
                        </Link>
                      </TD>
                      <TD className="hidden text-ink-muted md:table-cell">{x.client_name}</TD>
                      <TD className="hidden text-ink-muted lg:table-cell">{x.agent_name}</TD>
                      <TD className="text-ink-muted">{x.status_label}</TD>
                      <TD align="right" className="font-semibold">
                        {formatMoney(x.price)}
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
