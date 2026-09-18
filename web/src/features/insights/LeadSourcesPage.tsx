import { Page, PageHeader } from "@/components/ui/page";
import { EmptyState, ErrorState, Meter, Panel } from "@/components/ui/display";
import { Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useLeadSourceStats } from "@/features/crm/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatPercent } from "@/lib/format";

export function LeadSourcesPage() {
  useDocumentTitle("Lead sources");
  const q = useLeadSourceStats();
  const rows = q.data ?? [];
  const total = rows.reduce((n, r) => n + r.total_leads, 0);
  return (
    <Page>
      <PageHeader title="Lead sources" description="Where enquiries come from, and which channels turn into clients." />
      <Panel flush>
        {q.isLoading ? (
          <TableSkeleton cols={5} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="No leads yet" />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Source</TH>
                <TH align="right">Leads</TH>
                <TH className="hidden w-48 md:table-cell">Share</TH>
                <TH align="right" className="hidden sm:table-cell">
                  Qualified
                </TH>
                <TH align="right">Converted</TH>
                <TH align="right" className="hidden sm:table-cell">
                  Lost
                </TH>
                <TH align="right">Conversion</TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((r) => (
                <TR key={r.source}>
                  <TD className="font-semibold">{r.source}</TD>
                  <TD align="right">{r.total_leads}</TD>
                  <TD className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Meter value={r.total_leads} max={total} />
                      <span className="num w-10 text-right text-xs text-ink-subtle">{formatPercent((r.total_leads / total) * 100)}</span>
                    </div>
                  </TD>
                  <TD align="right" className="hidden sm:table-cell">
                    {r.qualified}
                  </TD>
                  <TD align="right">{r.converted}</TD>
                  <TD align="right" className="hidden text-ink-muted sm:table-cell">
                    {r.lost}
                  </TD>
                  <TD align="right" className="font-semibold">
                    {formatPercent(r.conversion_rate, 1)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>
    </Page>
  );
}
