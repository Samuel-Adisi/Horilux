import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { ErrorState, Panel, Skeleton, Stat, StatStrip } from "@/components/ui/display";
import { BarList } from "@/components/ui/charts";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PropertyStatus } from "@/components/domain/status";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_ORDER } from "@/features/properties/api";
import { usePropertyPerformance, type PropertyPerformanceRow } from "@/features/reports/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "title" | "days_on_market" | "views_count" | "inquiries_count" | "viewings_total" | "price";

export function PropertyPerformancePage() {
  useDocumentTitle("Listing performance");
  const navigate = useNavigate();
  const q = usePropertyPerformance();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "views_count", dir: -1 });

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = (q.data?.properties ?? []).filter((p) => !s || `${p.title} ${p.region}`.toLowerCase().includes(s));
    return [...list].sort((a, b) => {
      const av = a[sort.key] ?? 0;
      const bv = b[sort.key] ?? 0;
      return (typeof av === "string" ? av.localeCompare(String(bv)) : Number(av) - Number(bv)) * sort.dir;
    });
  }, [q.data, search, sort]);

  function header(key: SortKey, label: string, align?: "right", className?: string) {
    const active = sort.key === key;
    return (
      <TH align={align} className={className} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
        <button
          type="button"
          onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }))}
          className={cn("inline-flex items-center gap-1 uppercase hover:text-ink", active && "text-ink")}
        >
          {label}
          {active && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
        </button>
      </TH>
    );
  }

  if (q.isLoading)
    return (
      <Page>
        <Skeleton className="mb-6 h-10 w-64" />
        <Skeleton className="h-96" />
      </Page>
    );
  if (q.isError || !q.data)
    return (
      <Page>
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      </Page>
    );
  const d = q.data;

  return (
    <Page>
      <PageHeader title="Listing performance" description="Attention and conversion for every listing." />
      <StatStrip>
        <Stat label="Listings" value={formatNumber(d.summary.total_properties)} />
        <Stat label="Views" value={formatNumber(d.summary.total_views)} />
        <Stat label="Enquiries" value={formatNumber(d.summary.total_inquiries)} />
        <Stat label="Avg. days on market" value={Math.round(d.summary.avg_days_on_market)} />
      </StatStrip>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Listings by status">
          <BarList
            items={PROPERTY_STATUS_ORDER.filter((s) => (d.status_funnel[s] ?? 0) > 0).map((s) => ({ key: s, label: PROPERTY_STATUS_LABEL[s], value: d.status_funnel[s] ?? 0 }))}
          />
        </Panel>
        <Panel title="Most viewed" flush>
          <ShortList rows={d.top_performers} metric={(r) => `${formatNumber(r.views_count)} views`} onOpen={(id) => navigate(`/properties/${id}`)} />
        </Panel>
        <Panel title="Longest on market" description="Live listings with the least traction." flush>
          <ShortList rows={d.stale_listings} metric={(r) => `${r.days_on_market} days`} onOpen={(id) => navigate(`/properties/${id}`)} />
        </Panel>
      </div>

      <Panel className="mt-6" flush>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Filter listings" />
          <span className="text-xs text-ink-subtle sm:ml-auto">{rows.length} listings</span>
        </Toolbar>
        <Table>
          <THead>
            <tr>
              {header("title", "Listing")}
              <TH className="hidden md:table-cell">Status</TH>
              {header("price", "Price", "right", "hidden lg:table-cell")}
              {header("days_on_market", "Days", "right")}
              {header("views_count", "Views", "right")}
              {header("inquiries_count", "Enquiries", "right", "hidden sm:table-cell")}
              {header("viewings_total", "Viewings", "right", "hidden sm:table-cell")}
            </tr>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id} onClick={() => navigate(`/properties/${r.id}`)}>
                <TD>
                  <p className="max-w-[18rem] truncate font-semibold">{r.title}</p>
                  <p className="text-xs text-ink-subtle">{r.region || "—"}</p>
                </TD>
                <TD className="hidden md:table-cell">
                  <PropertyStatus status={r.status} />
                </TD>
                <TD align="right" className="hidden lg:table-cell">
                  {formatMoney(r.price)}
                  {r.price_vs_region_avg_pct != null && (
                    <span className="block text-xs text-ink-subtle">
                      {r.price_vs_region_avg_pct > 0 ? "+" : ""}
                      {formatPercent(r.price_vs_region_avg_pct)} vs area
                    </span>
                  )}
                </TD>
                <TD align="right">{r.days_on_market}</TD>
                <TD align="right">{formatNumber(r.views_count)}</TD>
                <TD align="right" className="hidden sm:table-cell">
                  {formatNumber(r.inquiries_count)}
                </TD>
                <TD align="right" className="hidden sm:table-cell">
                  {r.viewings_total}
                  {r.viewings_total > 0 && <span className="block text-xs text-ink-subtle">{r.viewings_hot} hot</span>}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Panel>
    </Page>
  );
}

function ShortList({ rows, metric, onOpen }: { rows: PropertyPerformanceRow[]; metric: (r: PropertyPerformanceRow) => string; onOpen: (id: string) => void }) {
  if (rows.length === 0) return <p className="px-4 py-6 text-sm text-ink-subtle">Nothing to show yet.</p>;
  return (
    <ol className="divide-y divide-line">
      {rows.map((r, i) => (
        <li key={r.id}>
          <button type="button" onClick={() => onOpen(r.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-hover">
            <span className="num w-4 text-xs font-bold text-ink-faint">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{r.title}</span>
            <span className="num shrink-0 text-xs text-ink-muted">{metric(r)}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
