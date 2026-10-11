import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Panel } from "@/components/ui/display";
import { useCan } from "@/features/accounts/permissions";
import { apiClient } from "@/lib/api-client";
import { formatMoney, formatRelative } from "@/lib/format";
import type { PropertyDetail } from "../api";

type Offer = {
  id: string;
  amount: string;
  message: string;
  status: string;
  created_at: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
};

export function OffersPanel({ property }: { property: PropertyDetail }) {
  const navigate = useNavigate();
  const can = useCan();
  const offers = useQuery({
    queryKey: ["properties", "offers", property.id],
    queryFn: async () => (await apiClient.get<Offer[]>("/properties/" + property.id + "/offers/")).data,
  });
  const rows = offers.data ?? [];
  if (offers.isLoading || rows.length === 0) return null;

  return (
    <Panel title="Offers" description={rows.length + (rows.length === 1 ? " offer" : " offers") + " from the website, highest first."}>
      <div>
        {rows.map((o, i) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-0">
            <div className="min-w-0">
              <p className="font-semibold">
                {formatMoney(Number(o.amount), property.currency)}
                {i === 0 && rows.length > 1 && <span className="ml-2 text-xs">Highest</span>}
              </p>
              <p className="text-sm text-ink-muted">
                {o.client_name} {o.client_phone ? " - " + o.client_phone : ""} {" - "} {formatRelative(o.created_at)}
              </p>
              {o.message && <p className="max-w-[28rem] truncate text-xs text-ink-subtle">{o.message}</p>}
            </div>
            {can("transaction", "create") && (
              <button
                type="button"
                onClick={() => navigate("/transactions/new?property=" + property.id + "&client=" + o.client_id + "&price=" + o.amount)}
                className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white"
              >
                Start transaction
              </button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
