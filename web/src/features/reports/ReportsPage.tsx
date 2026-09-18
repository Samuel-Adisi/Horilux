import { useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ErrorState, Panel, Skeleton, Stat } from "@/components/ui/display";
import { BarList } from "@/components/ui/charts";
import { useCan } from "@/features/accounts/permissions";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_ORDER } from "@/features/properties/api";
import { LEAD_STATUS_LABEL, type LeadStatus } from "@/features/crm/api";
import { CAMPAIGN_STATUS_LABEL, type CampaignStatus } from "@/features/campaigns/api";
import { TRANSACTION_STAGES, TRANSACTION_STATUS_LABEL } from "@/features/transactions/api";
import { TASK_STATUS_LABEL, type TaskStatus } from "@/features/tasks/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatMoney, formatNumber, formatPercent, humanize } from "@/lib/format";
import { toast } from "@/lib/toast";
import { downloadBoardPack, useFinanceReport, useListingReport, useMarketingReport, useOperationsReport, useSalesReport } from "./api";

function breakdown<K extends string>(counts: Record<string, number>, order: readonly K[], labels: Record<K, string>) {
  const known = order.map((k) => ({ key: k, label: labels[k], value: counts[k] ?? 0 }));
  const extra = Object.keys(counts)
    .filter((k) => !order.includes(k as K))
    .map((k) => ({ key: k, label: humanize(k), value: counts[k] }));
  return [...known, ...extra].filter((i) => i.value > 0);
}

function Section({
  title,
  query,
  stats,
  children,
}: {
  title: string;
  query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => void };
  stats?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Panel title={title}>
      {query.isLoading ? (
        <Skeleton className="h-40" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} className="py-6" />
      ) : (
        <>
          {stats && <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{stats}</div>}
          {children}
        </>
      )}
    </Panel>
  );
}

export function ReportsPage() {
  useDocumentTitle("Reports");
  const can = useCan();
  const [downloading, setDownloading] = useState(false);
  const listing = useListingReport(can("report_listing"));
  const sales = useSalesReport(can("report_sales"));
  const marketing = useMarketingReport(can("report_marketing"));
  const finance = useFinanceReport(can("report_finance"));
  const ops = useOperationsReport(can("report_operations"));

  async function boardPack() {
    setDownloading(true);
    try {
      await downloadBoardPack();
    } catch (err) {
      toast.error("Couldn't generate the board pack", getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Reports"
        description="Department summaries, scoped to what your role can see."
        actions={
          can("executive_insights") && (
            <Button icon={<Download />} loading={downloading} onClick={boardPack}>
              Board pack (PDF)
            </Button>
          )
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {can("report_listing") && (
          <Section
            title="Listings"
            query={listing}
            stats={
              listing.data && (
                <>
                  <Stat label="Properties" value={formatNumber(listing.data.total_properties)} />
                  <Stat label="Avg. verification" value={formatPercent(listing.data.avg_completion_percent)} />
                  <Stat label="Published" value={listing.data.by_status.published ?? 0} />
                  <Stat label="Awaiting verification" value={listing.data.by_status.pending_verification ?? 0} />
                </>
              )
            }
          >
            {listing.data && <BarList items={breakdown(listing.data.by_status, PROPERTY_STATUS_ORDER, PROPERTY_STATUS_LABEL)} />}
          </Section>
        )}

        {can("report_sales") && (
          <Section
            title="Sales"
            query={sales}
            stats={
              sales.data && (
                <>
                  <Stat label="Leads" value={formatNumber(sales.data.total_leads)} />
                  <Stat label="Clients" value={formatNumber(sales.data.total_clients)} />
                  <Stat label="Closed" value={sales.data.leads_by_status.closed ?? 0} />
                  <Stat label="Overdue follow-ups" value={sales.data.overdue_followups} tone={sales.data.overdue_followups ? "danger" : undefined} />
                </>
              )
            }
          >
            {sales.data && (
              <BarList
                items={breakdown(sales.data.leads_by_status, Object.keys(LEAD_STATUS_LABEL) as LeadStatus[], LEAD_STATUS_LABEL)}
              />
            )}
          </Section>
        )}

        {can("report_marketing") && (
          <Section
            title="Marketing"
            query={marketing}
            stats={
              marketing.data && (
                <>
                  <Stat label="Campaigns" value={marketing.data.total_campaigns} />
                  <Stat label="Views" value={formatNumber(marketing.data.performance.views)} />
                  <Stat label="Leads generated" value={formatNumber(marketing.data.performance.leads_generated)} />
                  <Stat label="Deals" value={formatNumber(marketing.data.performance.conversions)} />
                </>
              )
            }
          >
            {marketing.data && (
              <BarList
                items={breakdown(marketing.data.by_status, Object.keys(CAMPAIGN_STATUS_LABEL) as CampaignStatus[], CAMPAIGN_STATUS_LABEL)}
              />
            )}
          </Section>
        )}

        {can("report_finance") && (
          <Section
            title="Finance"
            query={finance}
            stats={
              finance.data && (
                <>
                  <Stat label="Transactions" value={finance.data.total_transactions} />
                  <Stat label="Commission expected" value={formatMoney(finance.data.commission.expected, "GHS", { compact: true })} />
                  <Stat label="Received" value={formatMoney(finance.data.commission.received, "GHS", { compact: true })} />
                  <Stat
                    label="Outstanding"
                    value={formatMoney(finance.data.commission.outstanding, "GHS", { compact: true })}
                    tone={finance.data.commission.outstanding > 0 ? "warning" : undefined}
                  />
                </>
              )
            }
          >
            {finance.data && <BarList items={breakdown(finance.data.by_status, TRANSACTION_STAGES, TRANSACTION_STATUS_LABEL)} />}
          </Section>
        )}

        {can("report_operations") && (
          <Section
            title="Operations"
            query={ops}
            stats={
              ops.data && (
                <>
                  <Stat label="Tasks" value={ops.data.total_tasks} />
                  <Stat label="Open" value={ops.data.by_status.open ?? 0} />
                  <Stat label="Done" value={ops.data.by_status.done ?? 0} />
                  <Stat label="Overdue" value={ops.data.overdue_tasks} tone={ops.data.overdue_tasks ? "danger" : undefined} />
                </>
              )
            }
          >
            {ops.data && <BarList items={breakdown(ops.data.by_status, Object.keys(TASK_STATUS_LABEL) as TaskStatus[], TASK_STATUS_LABEL)} />}
          </Section>
        )}
      </div>
    </Page>
  );
}
