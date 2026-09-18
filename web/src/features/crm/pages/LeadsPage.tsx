import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target } from "lucide-react";
import { Page, PageHeader, SearchInput, Segmented, Toolbar } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel, Tag } from "@/components/ui/display";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { LeadStatus } from "@/components/domain/status";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatDateShort, formatMoney, formatRelative, isPast } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LEAD_STATUS_LABEL, useLeads, type LeadStatus as LS } from "../api";
import { LeadFormDialog } from "../components/LeadFormDialog";

const TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  ...(["new", "contacted", "qualified", "property_matched", "viewing", "negotiation", "closed", "lost"] as LS[]).map((s) => ({
    value: s,
    label: LEAD_STATUS_LABEL[s],
  })),
];

export function LeadsPage() {
  useDocumentTitle("Leads");
  const navigate = useNavigate();
  const can = useCan();
  const { values, page, set } = useUrlState(["search", "status", "unassigned"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const [creating, setCreating] = useState(false);
  const unassigned = values.unassigned === "1";
  const q = useLeads({ page, search: values.search, status: values.status, unassigned });
  const rows = q.data?.results ?? [];
  // Sales only ever see their own leads, so "unassigned" is for routers (CEO / Operations).
  const canRoute = can("lead", "assign") && !can("lead", "create");

  return (
    <Page>
      <PageHeader
        title="Leads"
        description="Enquiries from the website, walk-ins and referrals, from first contact to close."
        actions={
          can("lead", "create") && (
            <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>
              New lead
            </Button>
          )
        }
      />

      <Panel flush>
        <div className="border-b border-line px-4 pt-2">
          <Segmented value={values.status} onChange={(v) => set({ status: v })} options={TABS} />
        </div>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search name, phone, email or area" />
          {canRoute && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-muted sm:ml-auto">
              <input
                type="checkbox"
                checked={unassigned}
                onChange={(e) => set({ unassigned: e.target.checked ? "1" : null })}
                className="size-4 rounded-sm border-line-strong accent-brand"
              />
              Unassigned only
            </label>
          )}
        </Toolbar>

        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Target />}
            title={values.search || values.status || unassigned ? "No leads match" : "No leads yet"}
            description={
              values.search || values.status || unassigned
                ? "Try another filter."
                : can("lead", "create")
                  ? "Add enquiries as they come in so nothing slips."
                  : "Leads assigned to your team will show here."
            }
          />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>Lead</TH>
                  <TH>Status</TH>
                  <TH className="hidden md:table-cell">Looking for</TH>
                  <TH className="hidden lg:table-cell">Agent</TH>
                  <TH className="hidden sm:table-cell">Follow-up</TH>
                  <TH align="right" className="hidden xl:table-cell">
                    Received
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((l) => {
                  const overdue = l.next_follow_up && isPast(l.next_follow_up) && !["closed", "lost"].includes(l.status);
                  return (
                    <TR key={l.id} onClick={() => navigate(`/leads/${l.id}`)}>
                      <TD>
                        <p className="font-semibold">{l.name}</p>
                        <p className="text-xs text-ink-subtle">
                          {l.phone}
                          {l.source && ` · ${l.source}`}
                        </p>
                      </TD>
                      <TD>
                        <LeadStatus status={l.status} />
                      </TD>
                      <TD className="hidden max-w-[16rem] md:table-cell">
                        <p className="truncate text-ink-muted">
                          {[l.purpose === "rent" ? "Rent" : l.purpose === "buy" ? "Buy" : null, l.bedrooms_preference ? `${l.bedrooms_preference} bd` : null, l.location_preference]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                        {l.budget && <p className="num text-xs text-ink-subtle">up to {formatMoney(l.budget, l.currency, { compact: true })}</p>}
                      </TD>
                      <TD className="hidden lg:table-cell">{l.assigned_agent_name ?? <Tag tone="warning">Unassigned</Tag>}</TD>
                      <TD className={cn("hidden sm:table-cell", overdue ? "font-semibold text-danger" : "text-ink-muted")}>
                        {l.next_follow_up ? `${formatDateShort(l.next_follow_up)}${overdue ? " · overdue" : ""}` : "—"}
                      </TD>
                      <TD align="right" className="hidden text-ink-subtle xl:table-cell">
                        {formatRelative(l.created_at)}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={q.data?.count ?? 0}
              hasNext={!!q.data?.next}
              hasPrevious={!!q.data?.previous}
              onPageChange={(p) => set({ page: p })}
            />
          </>
        )}
      </Panel>

      <LeadFormDialog open={creating} onClose={() => setCreating(false)} onSaved={(l) => navigate(`/leads/${l.id}`)} />
    </Page>
  );
}
