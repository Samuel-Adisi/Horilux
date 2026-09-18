import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { Page, PageHeader, Segmented } from "@/components/ui/page";
import { EmptyState, ErrorState, Meter, Panel } from "@/components/ui/display";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCan } from "@/features/accounts/permissions";
import { useApprovalThreshold } from "@/features/admin/api";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatRelative } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { useProperties } from "../api";
import { PropertyThumb } from "../components/PropertyThumb";

const QUEUES = [
  { value: "pending_verification", label: "Verification", hint: "Check the listing and tick the checklist, then mark it verified." },
  { value: "verified", label: "Marketing approval", hint: "Verified listings waiting for sign-off before marketing can use them." },
  { value: "marketing_ready", label: "Ready to publish", hint: "Approved for marketing. Publishing makes the listing live." },
] as const;

export function ApprovalsPage() {
  useDocumentTitle("Approvals");
  const navigate = useNavigate();
  const can = useCan();
  const { values, page, set } = useUrlState(["queue"] as const);
  const queue = QUEUES.find((q) => q.value === values.queue) ?? QUEUES[0];

  const counts = {
    pending_verification: useProperties({ status: "pending_verification" }),
    verified: useProperties({ status: "verified" }),
    marketing_ready: useProperties({ status: "marketing_ready" }),
  };
  const list = useProperties({ status: queue.value, page });
  const threshold = useApprovalThreshold(can("company_settings", "view"));
  const rows = list.data?.results ?? [];
  const thresholdValue = Number(threshold.data?.ceo_approval_min_price ?? 0);

  return (
    <Page>
      <PageHeader
        title="Approvals"
        description={queue.hint}
        meta={
          threshold.data && (
            <span className="text-xs text-ink-subtle">
              {thresholdValue > 0
                ? `Listings priced at ${formatMoney(thresholdValue)} or more need CEO approval.`
                : "Every approval currently needs the CEO — set a threshold in Settings to delegate smaller listings."}
            </span>
          )
        }
      />

      <Panel flush>
        <div className="border-b border-line px-4 pt-2">
          <Segmented
            value={queue.value}
            onChange={(v) => set({ queue: v === QUEUES[0].value ? null : v })}
            options={QUEUES.map((q) => ({ value: q.value, label: q.label, count: counts[q.value].data?.count }))}
          />
        </div>

        {list.isLoading ? (
          <TableSkeleton rows={4} />
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={() => list.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<BadgeCheck />} title="Nothing waiting here" description="New items appear as listings move through the workflow." />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Property</TH>
                  <TH className="hidden md:table-cell">Agent</TH>
                  {queue.value === "pending_verification" && <TH className="w-44">Checklist</TH>}
                  <TH align="right">Price</TH>
                  <TH align="right" className="hidden sm:table-cell">
                    Submitted
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((p) => {
                  const needsCeo = thresholdValue > 0 && Number(p.price) >= thresholdValue;
                  return (
                    <TR key={p.id} onClick={() => navigate(`/properties/${p.id}`)}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <PropertyThumb src={p.image_url} className="size-10" />
                          <div className="min-w-0">
                            <p className="max-w-[20rem] truncate font-semibold">{p.title}</p>
                            <p className="truncate text-xs text-ink-subtle">{p.location}</p>
                          </div>
                        </div>
                      </TD>
                      <TD className="hidden text-ink-muted md:table-cell">{p.agent_name ?? "—"}</TD>
                      {queue.value === "pending_verification" && (
                        <TD>
                          <div className="flex items-center gap-2">
                            <Meter value={p.completion_percent} max={100} tone={p.completion_percent >= 100 ? "success" : "brand"} />
                            <span className="num w-9 text-right text-xs text-ink-subtle">{p.completion_percent}%</span>
                          </div>
                        </TD>
                      )}
                      <TD align="right">
                        {formatMoney(p.price, p.currency)}
                        {needsCeo && <span className="block text-2xs font-semibold text-kokoda-700">CEO sign-off</span>}
                      </TD>
                      <TD align="right" className="hidden text-ink-subtle sm:table-cell">
                        {formatRelative(p.created_at)}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={list.data?.count ?? 0}
              hasNext={!!list.data?.next}
              hasPrevious={!!list.data?.previous}
              onPageChange={(p) => set({ page: p })}
            />
          </>
        )}
      </Panel>
    </Page>
  );
}
