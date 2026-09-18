import { Page, PageHeader } from "@/components/ui/page";
import { Avatar, EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useAgentsRoster } from "@/features/reports/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatPercent } from "@/lib/format";

export function AgentsPage() {
  useDocumentTitle("Agents");
  const q = useAgentsRoster();
  const agents = q.data?.agents ?? [];
  return (
    <Page>
      <PageHeader title="Agents" description="Closed volume, open deals and lead conversion per agent, highest volume first." />
      <Panel flush>
        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : agents.length === 0 ? (
          <EmptyState title="No agents yet" description="Staff with a department appear here." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH className="w-10">#</TH>
                <TH>Agent</TH>
                <TH align="right">Closed volume</TH>
                <TH align="right">Deals closed</TH>
                <TH align="right" className="hidden sm:table-cell">
                  Open deals
                </TH>
                <TH align="right" className="hidden md:table-cell">
                  Leads
                </TH>
                <TH align="right" className="hidden md:table-cell">
                  Conversion
                </TH>
              </tr>
            </THead>
            <TBody>
              {agents.map((a, i) => (
                <TR key={a.id}>
                  <TD className="num text-ink-faint">{i + 1}</TD>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.name} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{a.name}</p>
                        <p className="truncate text-xs text-ink-subtle">{a.department}</p>
                      </div>
                    </div>
                  </TD>
                  <TD align="right" className="font-semibold">
                    {formatMoney(a.volume, "GHS", { compact: true })}
                  </TD>
                  <TD align="right">{a.deals_closed}</TD>
                  <TD align="right" className="hidden sm:table-cell">
                    {a.active_deals}
                  </TD>
                  <TD align="right" className="hidden md:table-cell">
                    {a.leads_assigned}
                  </TD>
                  <TD align="right" className="hidden md:table-cell">
                    {a.leads_assigned ? formatPercent(a.conversion_percent) : "—"}
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
