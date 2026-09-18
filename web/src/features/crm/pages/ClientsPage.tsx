import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatDate, formatMoney } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { useClients } from "../api";

export function ClientsPage() {
  useDocumentTitle("Clients");
  const navigate = useNavigate();
  const { values, page, set } = useUrlState(["search"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const q = useClients({ page, search: values.search });
  const rows = q.data?.results ?? [];

  return (
    <Page>
      <PageHeader title="Clients" count={q.data ? `${q.data.count.toLocaleString()} clients` : undefined} description="Qualified buyers and tenants. Leads become clients once they're qualified." />
      <Panel flush>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search name, phone or email" />
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton cols={4} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<UserRound />}
            title={values.search ? "No clients match" : "No clients yet"}
            description={values.search ? undefined : "Open a qualified lead and choose Convert to client."}
          />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>Client</TH>
                  <TH className="hidden md:table-cell">Contact</TH>
                  <TH className="hidden lg:table-cell">Agent</TH>
                  <TH align="right">Budget</TH>
                  <TH align="right" className="hidden sm:table-cell">
                    Since
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((c) => (
                  <TR key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
                    <TD>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-ink-subtle md:hidden">{c.phone}</p>
                    </TD>
                    <TD className="hidden text-ink-muted md:table-cell">
                      {c.phone}
                      {c.email && <span className="block text-xs text-ink-subtle">{c.email}</span>}
                    </TD>
                    <TD className="hidden text-ink-muted lg:table-cell">{c.assigned_agent_name ?? "—"}</TD>
                    <TD align="right">{c.budget ? formatMoney(c.budget) : "—"}</TD>
                    <TD align="right" className="hidden text-ink-subtle sm:table-cell">
                      {formatDate(c.created_at)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>
    </Page>
  );
}
