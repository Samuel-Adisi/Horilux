import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarPlus, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, Panel, Skeleton, Stat, StatStrip } from "@/components/ui/display";
import { TrendChart } from "@/components/ui/charts";
import { LeadStatus, PropertyStatus, TransactionStatus } from "@/components/domain/status";
import { can, primaryRole } from "@/features/accounts/permissions";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { useProperties } from "@/features/properties/api";
import { useLeads } from "@/features/crm/api";
import { useFollowUps, useViewings } from "@/features/viewings/api";
import { useTransactions } from "@/features/transactions/api";
import { useCampaigns } from "@/features/campaigns/api";
import { useTasks } from "@/features/tasks/api";
import {
  useCeoDashboard,
  useFinanceReport,
  useGovernanceActions,
  useListingReport,
  useMarketingReport,
  useOperationsReport,
  useRecentActivity,
  useSalesReport,
} from "@/features/reports/api";
import { downloadBoardPack } from "@/features/reports/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { formatDate, formatDateShort, formatMoney, formatPercent, formatRelative, formatTime, humanize, isPast, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** A compact list panel with a "view all" link and its own loading/empty states. */
function ListPanel<T>({
  title,
  to,
  query,
  items,
  empty,
  render,
  className,
}: {
  title: string;
  to?: string;
  query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => void };
  items: T[];
  empty: string;
  render: (item: T) => ReactNode;
  className?: string;
}) {
  return (
    <Panel
      title={title}
      flush
      className={className}
      actions={
        to && (
          <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-fg hover:underline">
            View all <ArrowRight className="size-3" />
          </Link>
        )
      }
    >
      {query.isLoading ? (
        <div className="space-y-3 p-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} className="py-6" />
      ) : items.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-subtle">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">{items.map(render)}</ul>
      )}
    </Panel>
  );
}

function Row({ to, title, sub, right }: { to: string; title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-hover">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{title}</span>
          {sub && <span className="block truncate text-xs text-ink-subtle">{sub}</span>}
        </span>
        {right && <span className="shrink-0 text-right">{right}</span>}
      </Link>
    </li>
  );
}

export function HomePage() {
  useDocumentTitle("Home");
  const user = useAuthStore((s) => s.user);
  const role = primaryRole(user);
  const first = user?.first_name || user?.full_name?.split(" ")[0] || "";

  if (role === "CEO") {
    return (
      <Page>
        <ExecutiveGreeting name={user?.full_name || first} />
        <ExecutiveHome />
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-heading">
            {greeting()}
            {first && `, ${first}`}
          </h1>
        </div>
        <div className="flex gap-2">
          {can(user, "viewing", "create") && (
            <ButtonLink to="/viewings?book=1" variant="primary" icon={<CalendarPlus />}>
              Book viewing
            </ButtonLink>
          )}
          {can(user, "property", "create") && (
            <ButtonLink to="/properties/new" variant="primary" icon={<Plus />}>
              New property
            </ButtonLink>
          )}
        </div>
      </div>

      {role === "Operations" && <OperationsHome />}
      {role === "Finance" && <FinanceHome />}
      {role === "Sales" && <SalesHome />}
      {role === "Listing" && <ListingHome />}
      {role === "Marketing" && <MarketingHome />}
      {!role && (
        <Panel>
          <p className="text-sm text-ink-muted">Your account doesn't have a role yet, so there's nothing to show. Ask an administrator to assign one from the Staff page.</p>
        </Panel>
      )}
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Shared widgets
// ---------------------------------------------------------------------------

function AttentionPanel() {
  const q = useGovernanceActions();
  return (
    <ListPanel
      title="Needs attention"
      query={q}
      items={q.data ?? []}
      empty="Nothing is waiting on you."
      render={(a) => (
        <li key={a.id}>
          <Link to={a.link.replace(/^\/ceo/, "") || "/"} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-hover">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", a.severity_color === "rose" || a.severity_color === "red" ? "bg-danger" : "bg-kokoda")} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{a.title}</span>
              <span className="block text-xs text-ink-subtle">{a.detail}</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-brand-fg">{a.cta}</span>
          </Link>
        </li>
      )}
    />
  );
}

function RecentActivityPanel() {
  const q = useRecentActivity();
  return (
    <ListPanel
      title="Recent changes"
      to="/audit-log"
      query={q}
      items={(q.data ?? []).slice(0, 8)}
      empty="No recent changes."
      render={(a) => (
        <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-ink">{a.actor}</span>{" "}
            <span className="text-ink-muted">
              {a.action === "create" ? "created" : a.action === "delete" ? "deleted" : "updated"} a {humanize(a.model.replace(/([a-z])([A-Z])/g, "$1 $2")).toLowerCase()}
            </span>
          </span>
          <span className="shrink-0 text-xs text-ink-subtle">{formatRelative(a.timestamp)}</span>
        </li>
      )}
    />
  );
}

function MyTasksPanel() {
  const q = useTasks({ mine: true, status: "" });
  const items = (q.data?.results ?? []).filter((t) => t.status !== "done").slice(0, 5);
  return (
    <ListPanel
      title="My tasks"
      to="/tasks"
      query={q}
      items={items}
      empty="No open tasks."
      render={(t) => (
        <Row
          key={t.id}
          to="/tasks"
          title={t.title}
          right={t.due_date && <span className={cn("text-xs", isPast(t.due_date) ? "font-semibold text-danger" : "text-ink-subtle")}>{formatDateShort(t.due_date)}</span>}
        />
      )}
    />
  );
}

function UpcomingViewingsPanel({ title = "Upcoming viewings" }: { title?: string }) {
  const q = useViewings({ date_from: todayISO() });
  const items = [...(q.data?.results ?? [])].reverse().filter((v) => v.status === "scheduled" || v.status === "confirmed").slice(0, 6);
  return (
    <ListPanel
      title={title}
      to="/viewings"
      query={q}
      items={items}
      empty="No viewings booked."
      render={(v) => (
        <Row
          key={v.id}
          to="/viewings"
          title={v.property_title}
          sub={`${v.client_name}${v.agent_name ? ` · ${v.agent_name}` : ""}`}
          right={
            <span className="text-xs">
              <span className="block font-semibold text-ink">{v.date === todayISO() ? "Today" : formatDateShort(v.date)}</span>
              <span className="num text-ink-subtle">{formatTime(v.time)}</span>
            </span>
          }
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Role homes
// ---------------------------------------------------------------------------

function ExecutiveGreeting({ name }: { name: string }) {
  const [exporting, setExporting] = useState(false);
  async function boardPack() {
    setExporting(true);
    try {
      await downloadBoardPack();
    } catch (err) {
      toast.error("Couldn't export the board pack", getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="mb-6 rounded-2xl border border-line bg-surface-raised p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-heading">
            {greeting()}
            {name && `, ${name}`}
          </h1>
          <p className="mt-1 text-xs text-ink-subtle">
            Executive brief for Horilux Estates · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button icon={<Download />} loading={exporting} onClick={boardPack}>
            Export board pack PDF
          </Button>
          <ButtonLink to="/approvals" variant="primary">
            Review approvals
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function ExecutiveHome() {
  const navigate = useNavigate();
  const q = useCeoDashboard();
  const d = q.data;
  const trend = d?.revenue_trend ?? [];
  const last = trend[trend.length - 1]?.current ?? 0;
  const prev = trend[trend.length - 2]?.current ?? 0;
  const mom = prev > 0 ? ((last - prev) / prev) * 100 : null;
  return (
    <div className="space-y-6">
      {q.isLoading ? (
        <Skeleton className="h-20" />
      ) : q.isError || !d ? (
        <Panel>
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        </Panel>
      ) : (
        <StatStrip>
          <Stat
            label="Gross volume"
            badge="YTD"
            value={formatMoney(d.kpis.gross_volume_ytd, "GHS", { compact: true })}
            sparkline={trend.map((t) => t.current)}
            trend={mom != null ? { label: `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}% MoM`, up: mom >= 0 } : undefined}
            onClick={() => navigate("/insights/revenue")}
          />
          <Stat
            label="Average deal"
            badge="Size"
            value={formatMoney(d.kpis.avg_deal_size, "GHS", { compact: true })}
            hint={`${d.finance.total_transactions} transactions`}
            onClick={() => navigate("/transactions")}
          />
          <Stat
            label="Active listings"
            badge="Portfolio"
            value={d.kpis.active_mandates}
            hint={`${d.listing.by_status.pending_verification ?? 0} awaiting verification`}
            onClick={() => navigate("/properties")}
          />
          <Stat
            label="Lead-to-close"
            badge="Yield"
            value={formatPercent(d.kpis.closed_yield_percent, 1)}
            hint={`${d.sales.total_leads} leads · ${d.kpis.active_agents} agents`}
            onClick={() => navigate("/insights/pipeline")}
          />
        </StatStrip>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Deal volume" description="By month, against the year before." className="lg:col-span-2">
          {d && d.revenue_trend.length > 0 ? (
            <TrendChart
              height={220}
              data={d.revenue_trend.map((t) => ({ label: t.month, current: t.current, prior: t.prior }))}
              series={[
                { key: "current", label: "This year" },
                { key: "prior", label: "Last year", dashed: true },
              ]}
            />
          ) : d ? (
            <p className="py-16 text-center text-sm text-ink-subtle">Volume appears here once transactions are recorded.</p>
          ) : (
            <Skeleton className="h-[220px]" />
          )}
        </Panel>
        <AttentionPanel />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top agents" flush actions={<Link to="/insights/agents" className="text-xs font-semibold text-brand-fg hover:underline">All agents</Link>}>
          {!d || d.leaderboard.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-subtle">{d ? "No closed deals yet." : "Loading…"}</p>
          ) : (
            <ol className="divide-y divide-line">
              {d.leaderboard.map((a) => (
                <li key={a.rank} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="num w-4 text-xs font-bold text-ink-faint">{a.rank}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{a.name}</span>
                    <span className="block text-xs text-ink-subtle">
                      {a.deals} deals · {a.division}
                    </span>
                  </span>
                  <span className="num text-sm font-semibold text-ink">{formatMoney(a.volume, "GHS", { compact: true })}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <RecentActivityPanel />
        <MyTasksPanel />
      </div>
    </div>
  );
}

function OperationsHome() {
  const ops = useOperationsReport();
  const listing = useProperties({ status: "pending_verification" });
  const unassigned = useLeads({ unassigned: true });
  return (
    <div className="space-y-6">
      <StatStrip>
        <Stat label="Open tasks" value={ops.data ? (ops.data.by_status.open ?? 0) + (ops.data.by_status.in_progress ?? 0) : "—"} />
        <Stat label="Overdue tasks" value={ops.data?.overdue_tasks ?? "—"} tone={ops.data?.overdue_tasks ? "danger" : undefined} />
        <Stat label="Awaiting verification" value={listing.data?.count ?? "—"} />
        <Stat label="Unassigned leads" value={unassigned.data?.count ?? "—"} tone={unassigned.data?.count ? "warning" : undefined} />
      </StatStrip>
      <div className="grid gap-6 lg:grid-cols-3">
        <AttentionPanel />
        <UpcomingViewingsPanel />
        <MyTasksPanel />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ListPanel
          title="Unassigned leads"
          to="/leads?unassigned=1"
          query={unassigned}
          items={(unassigned.data?.results ?? []).slice(0, 6)}
          empty="Every lead has an agent."
          render={(l) => <Row key={l.id} to={`/leads/${l.id}`} title={l.name} sub={[l.source, l.phone].filter(Boolean).join(" · ")} right={<span className="text-xs text-ink-subtle">{formatRelative(l.created_at)}</span>} />}
        />
        <RecentActivityPanel />
      </div>
    </div>
  );
}

function FinanceHome() {
  const fin = useFinanceReport();
  const payment = useTransactions({ status: "payment" });
  const commission = useTransactions({ status: "commission" });
  const c = fin.data?.commission;
  return (
    <div className="space-y-6">
      <StatStrip>
        <Stat label="Transactions" value={fin.data?.total_transactions ?? "—"} />
        <Stat label="Commission expected" value={c ? formatMoney(c.expected, "GHS", { compact: true }) : "—"} />
        <Stat label="Commission received" value={c ? formatMoney(c.received, "GHS", { compact: true }) : "—"} />
        <Stat label="Outstanding" value={c ? formatMoney(c.outstanding, "GHS", { compact: true }) : "—"} tone={c && c.outstanding > 0 ? "warning" : undefined} />
      </StatStrip>
      <div className="grid gap-6 lg:grid-cols-3">
        <ListPanel
          title="Collecting payment"
          to="/transactions?status=payment"
          query={payment}
          items={(payment.data?.results ?? []).slice(0, 6)}
          empty="No deals at the payment stage."
          render={(t) => (
            <Row
              key={t.id}
              to={`/transactions/${t.id}`}
              title={t.property_title}
              sub={t.client_name}
              right={<span className="num text-xs font-semibold text-kokoda-700">{formatMoney(t.outstanding_amount, "GHS", { compact: true })} due</span>}
            />
          )}
        />
        <ListPanel
          title="Commission due"
          to="/transactions?status=commission"
          query={commission}
          items={(commission.data?.results ?? []).slice(0, 6)}
          empty="No commissions waiting."
          render={(t) => (
            <Row key={t.id} to={`/transactions/${t.id}`} title={t.property_title} sub={t.agent_name} right={<span className="num text-xs font-semibold">{formatMoney(t.expected_commission, "GHS", { compact: true })}</span>} />
          )}
        />
        <MyTasksPanel />
      </div>
    </div>
  );
}

function SalesHome() {
  const report = useSalesReport();
  const fresh = useLeads({ status: "new" });
  const followUps = useFollowUps({ completed: "false" });
  const deals = useTransactions({});
  const due = (followUps.data?.results ?? []).filter((f) => f.due_date <= todayISO());
  return (
    <div className="space-y-6">
      <StatStrip>
        <Stat label="My leads" value={report.data?.total_leads ?? "—"} />
        <Stat label="New, not yet contacted" value={fresh.data?.count ?? "—"} tone={fresh.data?.count ? "brand" : undefined} />
        <Stat label="Clients" value={report.data?.total_clients ?? "—"} />
        <Stat label="Overdue follow-ups" value={report.data?.overdue_followups ?? "—"} tone={report.data?.overdue_followups ? "danger" : undefined} />
      </StatStrip>
      <div className="grid gap-6 lg:grid-cols-3">
        <UpcomingViewingsPanel title="My upcoming viewings" />
        <ListPanel
          title="Follow up today"
          to="/follow-ups"
          query={followUps}
          items={due.slice(0, 6)}
          empty="No follow-ups due. Nice."
          render={(f) => (
            <Row
              key={f.id}
              to={f.client ? `/clients/${f.client}` : f.lead ? `/leads/${f.lead}` : "/follow-ups"}
              title={f.client_name ?? f.lead_name ?? "Follow-up"}
              sub={f.notes || (f.property_title ? `After viewing ${f.property_title}` : undefined)}
              right={<span className={cn("text-xs", isPast(f.due_date) ? "font-semibold text-danger" : "text-ink-subtle")}>{isPast(f.due_date) ? "Overdue" : "Today"}</span>}
            />
          )}
        />
        <ListPanel
          title="New leads"
          to="/leads?status=new"
          query={fresh}
          items={(fresh.data?.results ?? []).slice(0, 6)}
          empty="No new leads waiting."
          render={(l) => <Row key={l.id} to={`/leads/${l.id}`} title={l.name} sub={[l.source, l.location_preference].filter(Boolean).join(" · ")} right={<LeadStatus status={l.status} />} />}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <ListPanel
          className="lg:col-span-2"
          title="My open deals"
          to="/transactions"
          query={deals}
          items={(deals.data?.results ?? []).filter((t) => t.status !== "closed").slice(0, 6)}
          empty="No open deals."
          render={(t) => <Row key={t.id} to={`/transactions/${t.id}`} title={t.property_title} sub={`${t.client_name ?? ""} · ${formatMoney(t.price, "GHS", { compact: true })}`} right={<TransactionStatus status={t.status} />} />}
        />
        <MyTasksPanel />
      </div>
    </div>
  );
}

function ListingHome() {
  const report = useListingReport();
  const drafts = useProperties({ status: "draft" });
  const pending = useProperties({ status: "pending_verification" });
  const verified = useProperties({ status: "verified" });
  return (
    <div className="space-y-6">
      <StatStrip>
        <Stat label="Listings" value={report.data?.total_properties ?? "—"} />
        <Stat label="Drafts" value={drafts.data?.count ?? "—"} />
        <Stat label="In verification" value={pending.data?.count ?? "—"} />
        <Stat label="Published" value={report.data?.by_status.published ?? "—"} tone="success" />
      </StatStrip>
      <div className="grid gap-6 lg:grid-cols-3">
        <ListPanel
          title="Drafts to finish"
          to="/properties?status=draft"
          query={drafts}
          items={(drafts.data?.results ?? []).slice(0, 6)}
          empty="No drafts. Everything's been submitted."
          render={(p) => <Row key={p.id} to={`/properties/${p.id}`} title={p.title} sub={p.location} right={<span className="text-xs text-ink-subtle">{p.image_url ? "Ready to submit" : "Needs photos"}</span>} />}
        />
        <ListPanel
          title="In verification"
          to="/approvals"
          query={pending}
          items={(pending.data?.results ?? []).slice(0, 6)}
          empty="Nothing waiting for verification."
          render={(p) => <Row key={p.id} to={`/properties/${p.id}`} title={p.title} sub={p.location} right={<span className="num text-xs text-ink-subtle">{p.completion_percent}% checked</span>} />}
        />
        <ListPanel
          title="Verified, awaiting approval"
          to="/approvals?queue=verified"
          query={verified}
          items={(verified.data?.results ?? []).slice(0, 6)}
          empty="Nothing waiting."
          render={(p) => <Row key={p.id} to={`/properties/${p.id}`} title={p.title} sub={formatMoney(p.price, p.currency)} right={<PropertyStatus status={p.status} />} />}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <MyTasksPanel />
      </div>
    </div>
  );
}

function MarketingHome() {
  const report = useMarketingReport();
  const ready = useProperties({ status: "marketing_ready" });
  const review = useCampaigns({ status: "in_review" });
  const scheduled = useCampaigns({ status: "scheduled" });
  const perf = report.data?.performance;
  return (
    <div className="space-y-6">
      <StatStrip>
        <Stat label="Campaigns" value={report.data?.total_campaigns ?? "—"} />
        <Stat label="Views" value={perf ? perf.views.toLocaleString() : "—"} />
        <Stat label="Leads generated" value={perf ? perf.leads_generated.toLocaleString() : "—"} />
        <Stat label="Listings ready to market" value={ready.data?.count ?? "—"} tone={ready.data?.count ? "brand" : undefined} />
      </StatStrip>
      <div className="grid gap-6 lg:grid-cols-3">
        <ListPanel
          title="Ready to market"
          to="/properties?status=marketing_ready"
          query={ready}
          items={(ready.data?.results ?? []).slice(0, 6)}
          empty="No listings are waiting for a campaign."
          render={(p) => <Row key={p.id} to={`/properties/${p.id}`} title={p.title} sub={`${p.location} · ${formatMoney(p.price, p.currency, { compact: true })}`} />}
        />
        <ListPanel
          title="In review"
          to="/campaigns?status=in_review"
          query={review}
          items={(review.data?.results ?? []).slice(0, 6)}
          empty="Nothing in review."
          render={(c) => <Row key={c.id} to="/campaigns?status=in_review" title={c.content.headline || "Untitled"} sub={c.property_title} />}
        />
        <ListPanel
          title="Scheduled"
          to="/campaigns?status=scheduled"
          query={scheduled}
          items={(scheduled.data?.results ?? []).slice(0, 6)}
          empty="Nothing scheduled."
          render={(c) => <Row key={c.id} to="/campaigns?status=scheduled" title={c.content.headline || "Untitled"} sub={c.property_title} right={c.scheduled_date && <span className="text-xs text-ink-subtle">{formatDate(c.scheduled_date)}</span>} />}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <MyTasksPanel />
      </div>
    </div>
  );
}
