import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { EmptyState, ErrorState, Panel, Tag } from "@/components/ui/display";
import { Select } from "@/components/ui/form";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatDateTime } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { INTERACTION_TYPE_LABEL, useInteractions } from "../api";

export function ActivityPage() {
  useDocumentTitle("Activity");
  const { values, page, set } = useUrlState(["search", "type"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const q = useInteractions({ page, search: values.search, type: values.type });
  const rows = q.data?.results ?? [];

  return (
    <Page>
      <PageHeader title="Activity" description="Calls, messages, meetings and site visits logged by the sales team." />
      <Panel flush>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search summary, lead or client" />
          <Select value={values.type} onChange={(e) => set({ type: e.target.value })} aria-label="Type" className="h-8 sm:ml-auto sm:w-40">
            <option value="">All types</option>
            {Object.entries(INTERACTION_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton cols={4} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<MessageSquare />} title="No activity found" description="Activity is logged from a lead or client page." />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>When</TH>
                  <TH>With</TH>
                  <TH>Summary</TH>
                  <TH className="hidden lg:table-cell">Agent</TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((i) => (
                  <TR key={i.id}>
                    <TD className="whitespace-nowrap text-ink-muted">{formatDateTime(i.occurred_at)}</TD>
                    <TD className="whitespace-nowrap">
                      {i.lead ? (
                        <Link to={`/leads/${i.lead}`} className="font-semibold hover:text-brand hover:underline">
                          {i.lead_name}
                        </Link>
                      ) : i.client ? (
                        <Link to={`/clients/${i.client}`} className="font-semibold hover:text-brand hover:underline">
                          {i.client_name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD className="max-w-md">
                      <div className="flex items-center gap-2">
                        <Tag>{i.type_label || INTERACTION_TYPE_LABEL[i.type]}</Tag>
                        <span className="truncate">{i.summary}</span>
                      </div>
                    </TD>
                    <TD className="hidden text-ink-muted lg:table-cell">{i.agent_name ?? "—"}</TD>
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
