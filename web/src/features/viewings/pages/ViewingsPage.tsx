import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarPlus, Check, MoreHorizontal, UserX, X } from "lucide-react";
import { Page, PageHeader, Segmented, Toolbar } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Select } from "@/components/ui/form";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { Pagination, TableSkeleton } from "@/components/ui/table";
import { OutcomeTag, ViewingStatus } from "@/components/domain/status";
import { PropertyThumb } from "@/features/properties/components/PropertyThumb";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatTime, todayISO } from "@/lib/format";
import { toast } from "@/lib/toast";
import { PAGE_SIZE } from "@/lib/types";
import { VIEWING_STATUS_LABEL, useConfirmViewing, useViewings, type Viewing, type ViewingStatus as VS } from "../api";
import { BookViewingDialog, CancelViewingDialog, CompleteViewingDialog } from "../components/ViewingDialogs";

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(iso: string) {
  const today = todayISO();
  if (iso === today) return "Today";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  if (iso === yesterday()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

export function ViewingsPage() {
  useDocumentTitle("Viewings");
  const can = useCan();
  const { values, page, set } = useUrlState(["when", "status", "book", "client"] as const);
  const when = values.when || "upcoming";
  const q = useViewings({
    page,
    status: values.status,
    date_from: when === "upcoming" ? todayISO() : undefined,
    date_to: when === "past" ? yesterday() : undefined,
  });
  const confirm = useConfirmViewing();
  const [completing, setCompleting] = useState<Viewing | null>(null);
  const [cancelling, setCancelling] = useState<{ v: Viewing; noShow: boolean } | null>(null);

  // The API returns newest first; upcoming reads better soonest first.
  const rows = [...(q.data?.results ?? [])];
  if (when === "upcoming") rows.reverse();
  const groups: { date: string; items: Viewing[] }[] = [];
  for (const v of rows) {
    const last = groups[groups.length - 1];
    if (last?.date === v.date) last.items.push(v);
    else groups.push({ date: v.date, items: [v] });
  }

  async function doConfirm(v: Viewing) {
    try {
      await confirm.mutateAsync(v.id);
      toast.success("Viewing confirmed", `${v.client_name} is expecting you.`);
    } catch (err) {
      toast.error("Couldn't confirm", getErrorMessage(err));
    }
  }

  const canAct = can("viewing", "edit");

  return (
    <Page>
      <PageHeader
        title="Viewings"
        description="Property tours with clients, from booking to outcome."
        actions={
          can("viewing", "create") && (
            <Button variant="primary" icon={<CalendarPlus />} onClick={() => set({ book: "1" })}>
              Book viewing
            </Button>
          )
        }
      />
      <Panel flush>
        <div className="border-b border-line px-4 pt-2">
          <Segmented
            value={when}
            onChange={(v) => set({ when: v === "upcoming" ? null : v })}
            options={[
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        <Toolbar>
          <Select value={values.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status" className="h-8 sm:w-44">
            <option value="">All statuses</option>
            {(Object.keys(VIEWING_STATUS_LABEL) as VS[]).map((s) => (
              <option key={s} value={s}>
                {VIEWING_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          {q.data && <span className="text-xs text-ink-subtle sm:ml-auto">{q.data.count} viewings</span>}
        </Toolbar>

        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck />}
            title={when === "upcoming" ? "No upcoming viewings" : "No viewings found"}
            description={when === "upcoming" && can("viewing", "create") ? "Book one from a client's page or with the button above." : undefined}
          />
        ) : (
          <>
            <div className={q.isPlaceholderData ? "opacity-60" : undefined}>
              {groups.map((g) => (
                <section key={g.date}>
                  <h3 className="sticky top-0 z-[1] border-b border-line bg-surface-sunken px-4 py-1.5 text-xs font-bold text-ink-muted">{dayLabel(g.date)}</h3>
                  <ul className="divide-y divide-line">
                    {g.items.map((v) => {
                      const open = v.status === "scheduled" || v.status === "confirmed";
                      return (
                        <li key={v.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4">
                          <span className="num w-12 shrink-0 text-sm font-bold text-ink">{formatTime(v.time)}</span>
                          <PropertyThumb src={v.property_image_url} className="hidden size-10 sm:flex" />
                          <div className="min-w-0 flex-1">
                            <Link to={`/properties/${v.property}`} className="block truncate text-sm font-semibold text-ink hover:text-brand">
                              {v.property_title}
                            </Link>
                            <p className="truncate text-xs text-ink-subtle">
                              <Link to={`/clients/${v.client}`} className="hover:text-brand">
                                {v.client_name}
                              </Link>
                              {v.agent_name && ` · with ${v.agent_name}`}
                              {v.property_location && ` · ${v.property_location}`}
                            </p>
                            {v.next_action && <p className="mt-0.5 truncate text-xs text-ink-muted">Next: {v.next_action}</p>}
                          </div>
                          <div className="hidden w-16 sm:block">
                            <OutcomeTag outcome={v.outcome} />
                          </div>
                          <div className="w-28 shrink-0">
                            <ViewingStatus status={v.status} />
                          </div>
                          <div className="flex w-[140px] shrink-0 justify-end gap-1">
                            {canAct && open && (
                              <>
                                {v.status === "scheduled" ? (
                                  <Button size="sm" onClick={() => doConfirm(v)} loading={confirm.isPending && confirm.variables === v.id}>
                                    Confirm
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="primary" icon={<Check />} onClick={() => setCompleting(v)}>
                                    Complete
                                  </Button>
                                )}
                                <Menu
                                  trigger={(t) => (
                                    <Button {...t} size="icon" variant="ghost" className="h-7 w-7" aria-label="More">
                                      <MoreHorizontal />
                                    </Button>
                                  )}
                                >
                                  {(close) => (
                                    <>
                                      {v.status === "scheduled" && (
                                        <MenuItem
                                          icon={<Check />}
                                          onClick={() => {
                                            close();
                                            setCompleting(v);
                                          }}
                                        >
                                          Record outcome
                                        </MenuItem>
                                      )}
                                      <MenuItem
                                        icon={<UserX />}
                                        onClick={() => {
                                          close();
                                          setCancelling({ v, noShow: true });
                                        }}
                                      >
                                        Client didn't show
                                      </MenuItem>
                                      <MenuItem
                                        icon={<X />}
                                        tone="danger"
                                        onClick={() => {
                                          close();
                                          setCancelling({ v, noShow: false });
                                        }}
                                      >
                                        Cancel viewing
                                      </MenuItem>
                                    </>
                                  )}
                                </Menu>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>

      {values.book === "1" && can("viewing", "create") && <BookViewingDialog clientId={values.client || undefined} onClose={() => set({ book: null, client: null })} />}
      {completing && <CompleteViewingDialog viewing={completing} onClose={() => setCompleting(null)} />}
      {cancelling && <CancelViewingDialog viewing={cancelling.v} noShow={cancelling.noShow} onClose={() => setCancelling(null)} />}
    </Page>
  );
}
