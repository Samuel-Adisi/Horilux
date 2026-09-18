import { Link } from "react-router-dom";
import { CalendarClock, Check } from "lucide-react";
import { Page, PageHeader, Segmented } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, isPast, todayISO } from "@/lib/format";
import { toast } from "@/lib/toast";
import { PAGE_SIZE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompleteFollowUp, useFollowUps, type FollowUp } from "../api";

function Who({ f }: { f: FollowUp }) {
  if (f.client)
    return (
      <Link to={`/clients/${f.client}`} className="font-semibold hover:text-brand-fg hover:underline">
        {f.client_name ?? "Client"}
      </Link>
    );
  if (f.lead)
    return (
      <Link to={`/leads/${f.lead}`} className="font-semibold hover:text-brand-fg hover:underline">
        {f.lead_name ?? "Lead"}
      </Link>
    );
  return <span className="text-ink-subtle">—</span>;
}

export function FollowUpsPage() {
  useDocumentTitle("Follow-ups");
  const can = useCan();
  const { values, page, set } = useUrlState(["show"] as const);
  const show = values.show || "open";
  const q = useFollowUps({ page, completed: show === "open" ? "false" : show === "done" ? "true" : "" });
  const complete = useCompleteFollowUp();
  const rows = q.data?.results ?? [];

  async function done(f: FollowUp) {
    try {
      await complete.mutateAsync(f.id);
      toast.success("Follow-up done");
    } catch (err) {
      toast.error("Couldn't update the follow-up", getErrorMessage(err));
    }
  }

  return (
    <Page>
      <PageHeader title="Follow-ups" description="Promised call-backs after viewings, oldest due first." />
      <Panel flush>
        <div className="border-b border-line px-4 py-3">
          <Segmented
            value={show}
            onChange={(v) => set({ show: v === "open" ? null : v })}
            options={[
              { value: "open", label: "To do" },
              { value: "done", label: "Done" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        {q.isLoading ? (
          <TableSkeleton cols={4} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<CalendarClock />} title={show === "open" ? "Nothing to follow up" : "No follow-ups"} description={show === "open" ? "Follow-ups are created when you complete a viewing." : undefined} />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>Due</TH>
                  <TH>With</TH>
                  <TH className="hidden md:table-cell">What</TH>
                  <TH className="hidden lg:table-cell">Agent</TH>
                  <TH className="w-28" />
                </tr>
              </THead>
              <TBody>
                {rows.map((f) => {
                  const overdue = !f.completed && isPast(f.due_date);
                  const today = f.due_date === todayISO();
                  return (
                    <TR key={f.id}>
                      <TD className={cn("whitespace-nowrap", overdue ? "font-semibold text-danger" : today ? "font-semibold text-kokoda-700" : "text-ink-muted")}>
                        {today ? "Today" : formatDate(f.due_date)}
                        {overdue && <span className="block text-2xs font-bold uppercase tracking-wide">Overdue</span>}
                      </TD>
                      <TD>
                        <Who f={f} />
                      </TD>
                      <TD className="hidden max-w-md md:table-cell">
                        {f.property_title && <p className="truncate text-xs text-ink-subtle">After viewing {f.property_title}</p>}
                        <p className="truncate">{f.notes || "Follow up"}</p>
                      </TD>
                      <TD className="hidden text-ink-muted lg:table-cell">{f.responsible_agent_name ?? "—"}</TD>
                      <TD align="right">
                        {f.completed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
                            <Check className="size-3.5" /> Done
                          </span>
                        ) : (
                          can("followup", "edit") && (
                            <Button size="sm" onClick={() => done(f)} loading={complete.isPending && complete.variables === f.id}>
                              Mark done
                            </Button>
                          )
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>
    </Page>
  );
}
