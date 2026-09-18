import { Link } from "react-router-dom";
import { Page, PageHeader } from "@/components/ui/page";
import { EmptyState, ErrorState, Panel, Stat, StatStrip } from "@/components/ui/display";
import { BarList } from "@/components/ui/charts";
import { Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useTerritory } from "@/features/reports/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney } from "@/lib/format";

export function LocationsPage() {
  useDocumentTitle("Locations");
  const q = useTerritory();
  const rows = q.data?.corridors ?? [];
  return (
    <Page>
      <PageHeader title="Locations" description="The six areas with the most listings, by number of listings and total asking value." />
      {q.isLoading ? (
        <Panel flush>
          <TableSkeleton cols={4} />
        </Panel>
      ) : q.isError ? (
        <Panel>
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState title="No listings yet" />
        </Panel>
      ) : (
        <>
          <StatStrip className="lg:grid-cols-3">
            <Stat label="Top area" value={rows[0].name} />
            <Stat label="Listings across these areas" value={rows.reduce((n, r) => n + r.property_count, 0)} />
            <Stat label="Total asking value" value={formatMoney(q.data!.total_gtv, "GHS", { compact: true })} />
          </StatStrip>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Asking value by area">
              <BarList items={rows.map((r) => ({ key: r.name, label: r.name, value: r.gtv }))} format={(v) => formatMoney(v, "GHS", { compact: true })} />
            </Panel>
            <Panel flush title="Detail">
              <Table>
                <THead>
                  <tr>
                    <TH>Area</TH>
                    <TH align="right">Listings</TH>
                    <TH align="right">Avg. price</TH>
                  </tr>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={r.name}>
                      <TD>
                        <Link to={`/properties?search=${encodeURIComponent(r.name)}`} className="font-semibold hover:text-brand-fg hover:underline">
                          {r.name}
                        </Link>
                      </TD>
                      <TD align="right">{r.property_count}</TD>
                      <TD align="right">{r.avg_price != null ? formatMoney(r.avg_price, "GHS", { compact: true }) : "—"}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Panel>
          </div>
        </>
      )}
    </Page>
  );
}
