import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Handshake } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { apiClient } from "@/lib/api-client";
import { formatMoney, formatRelative } from "@/lib/format";

type OfferRow = {
  id: string;
  amount: string;
  message: string;
  created_at: string;
  rank: number;
  property_id: string;
  property_title: string;
  property_price: string;
  property_currency: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
};

export function OffersPage() {
  useDocumentTitle("Offers");
  const navigate = useNavigate();
  const can = useCan();
  const q = useQuery({
    queryKey: ["properties", "all-offers"],
    queryFn: async () => (await apiClient.get<OfferRow[]>("/properties/all-offers/")).data,
  });
  const rows = q.data ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.property_id] = (c[r.property_id] ?? 0) + 1; });
    return c;
  }, [rows]);

  return (
    <Page>
      <PageHeader title="Offers" description="Offers made by visitors on the public website. Start a transaction from the one you want to take forward." />
      <Panel flush>
        {q.isLoading ? (
          <TableSkeleton rows={4} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Handshake />} title="No open offers" description="Offers from the website appear here." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Property</TH>
                <TH>Client</TH>
                <TH align="right">Offer</TH>
                <TH align="right" className="hidden md:table-cell">Of asking</TH>
                <TH align="right" className="hidden sm:table-cell">Received</TH>
                <TH align="right"></TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((o) => {
                const pct = Number(o.property_price) > 0 ? (Number(o.amount) / Number(o.property_price)) * 100 : 0;
                return (
                  <TR key={o.id}>
                    <TD>
                      <Link to={"/properties/" + o.property_id} className="font-semibold hover:underline">{o.property_title}</Link>
                      <p className="text-xs text-ink-subtle">Asking {formatMoney(Number(o.property_price), o.property_currency)}</p>
                    </TD>
                    <TD>
                      <p className="font-semibold">{o.client_name}</p>
                      <p className="text-xs text-ink-subtle">{o.client_phone}</p>
                    </TD>
                    <TD align="right">
                      {formatMoney(Number(o.amount), o.property_currency)}
                      {o.rank === 1 && counts[o.property_id] > 1 && <span className="block text-xs font-semibold">Highest</span>}
                    </TD>
                    <TD align="right" className="hidden md:table-cell">{pct.toFixed(1)}%</TD>
                    <TD align="right" className="hidden text-ink-subtle sm:table-cell">{formatRelative(o.created_at)}</TD>
                    <TD align="right">
                      {can("transaction", "create") && (
                        <button
                          type="button"
                          onClick={() => navigate("/transactions/new?property=" + o.property_id + "&client=" + o.client_id + "&price=" + o.amount)}
                          className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                        >
                          Start transaction
                        </button>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Panel>
    </Page>
  );
}
