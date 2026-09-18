import { useNavigate } from "react-router-dom";
import { Handshake, Plus } from "lucide-react";
import { Page, PageHeader, SearchInput, Segmented, Toolbar } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TransactionStatus } from "@/components/domain/status";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatRelative } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { TRANSACTION_STAGES, TRANSACTION_STATUS_LABEL, useTransactions } from "../api";

export function TransactionsPage() {
  useDocumentTitle("Transactions");
  const navigate = useNavigate();
  const can = useCan();
  const { values, page, set } = useUrlState(["search", "status"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const q = useTransactions({ page, search: values.search, status: values.status });
  const rows = q.data?.results ?? [];

  return (
    <Page>
      <PageHeader
        title="Transactions"
        count={q.data ? `${q.data.count.toLocaleString()} deals` : undefined}
        description="Deals from offer through payment to commission."
        actions={
          can("transaction", "create") && (
            <ButtonLink to="/transactions/new" variant="primary" icon={<Plus />}>
              New transaction
            </ButtonLink>
          )
        }
      />
      <Panel flush>
        <div className="border-b border-line px-4 py-3">
          <Segmented
            value={values.status}
            onChange={(v) => set({ status: v })}
            options={[{ value: "", label: "All" }, ...TRANSACTION_STAGES.map((s) => ({ value: s, label: TRANSACTION_STATUS_LABEL[s] }))]}
          />
        </div>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search property or client" />
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Handshake />} title={values.search || values.status ? "No transactions match" : "No transactions yet"} description={!values.search && !values.status ? "Start one when a client makes an offer." : undefined} />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>Property</TH>
                  <TH>Stage</TH>
                  <TH className="hidden lg:table-cell">Agent</TH>
                  <TH align="right">Price</TH>
                  <TH align="right" className="hidden md:table-cell">
                    Received
                  </TH>
                  <TH align="right" className="hidden xl:table-cell">
                    Commission
                  </TH>
                  <TH align="right" className="hidden sm:table-cell">
                    Opened
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((t) => (
                  <TR key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
                    <TD>
                      <p className="max-w-[18rem] truncate font-semibold">{t.property_title ?? "—"}</p>
                      <p className="text-xs text-ink-subtle">{t.client_name ?? "—"}</p>
                    </TD>
                    <TD>
                      <TransactionStatus status={t.status} />
                    </TD>
                    <TD className="hidden text-ink-muted lg:table-cell">{t.agent_name ?? "—"}</TD>
                    <TD align="right" className="font-semibold">
                      {formatMoney(t.price)}
                    </TD>
                    <TD align="right" className="hidden text-ink-muted md:table-cell">
                      {formatMoney(t.amount_received)}
                    </TD>
                    <TD align="right" className="hidden text-ink-muted xl:table-cell">
                      {formatMoney(t.expected_commission)}
                      <span className="block text-xs text-ink-subtle">{Number(t.commission_percent)}%</span>
                    </TD>
                    <TD align="right" className="hidden text-ink-subtle sm:table-cell">
                      {formatRelative(t.created_at)}
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
