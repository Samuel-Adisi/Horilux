import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useProperties } from "@/features/properties/hooks/use-properties";
import { useClients } from "@/features/leads/hooks/use-clients";
import { useCreateTransaction } from "../hooks/use-create-transaction";
import type { CreateTransactionPayload } from "../types";
import type { PropertyDetail } from "@/features/properties/types";

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const labelClass = "mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8578]";
const inputClass =
  "w-full rounded-[6px] border border-[#D8D3C6] bg-white px-3 py-2.5 text-[13.5px] text-[#17131F] transition-colors focus:outline-none focus:border-[#240270] focus:ring-1 focus:ring-[#240270]/20";
const selectClass = `${inputClass} appearance-none pr-9 text-[#17131F]`;
const selectWrapClass = "relative text-[#8A8578]";

export function TransactionCreateForm() {
  const navigate = useNavigate();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createTransaction = useCreateTransaction();

  const [propertyId, setPropertyId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [price, setPrice] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // When a property is picked, fetch its detail to get the owner id
  // (owner is only present on PropertyDetail, not the list Property).
  useEffect(() => {
    if (!propertyId) {
      setOwnerId("");
      return;
    }
    setOwnerLoading(true);
    apiClient
      .get<PropertyDetail>(`/properties/${propertyId}/`)
      .then(({ data }) => {
        setOwnerId(data.owner);
        if (!price) setPrice(data.price);
      })
      .catch(() => setError("Failed to load property owner details."))
      .finally(() => setOwnerLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyId || !clientId || !ownerId || !price || !commissionPercent) {
      setError("Property, client, price, and commission percent are required.");
      return;
    }

    const payload: CreateTransactionPayload = {
      property: propertyId,
      client: clientId,
      owner: ownerId,
      price,
      commission_percent: commissionPercent,
    };

    try {
      const transaction = await createTransaction.mutateAsync(payload);
      navigate(`/transactions/${transaction.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-6 rounded-[6px] border border-[#E4E1D9] bg-white p-6"
    >
      {error && (
        <div className="rounded-[6px] border border-[#E7B7B0] bg-[#FBF1EF] px-4 py-3 text-[13px] text-[#8A2E2E]">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Property *</label>
        <div className={selectWrapClass}>
          <select
            className={selectClass}
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            disabled={propertiesLoading}
            required
          >
            <option value="">Select a property…</option>
            {properties?.results.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.location}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
        {ownerLoading && (
          <p className="mt-1.5 text-[12px] text-[#8A8578]">Loading owner…</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Client *</label>
        <div className={selectWrapClass}>
          <select
            className={selectClass}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={clientsLoading}
            required
          >
            <option value="">Select a client…</option>
            {clients?.results.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </div>

      <div>
        <label className={labelClass}>Price *</label>
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Commission percent *</label>
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
          placeholder="e.g. 5"
          required
        />
      </div>

      <div className="flex gap-3 border-t border-[#EFEDE6] pt-5">
        <button
          type="submit"
          disabled={createTransaction.isPending || ownerLoading}
          className="rounded-[4px] bg-[#240270] px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {createTransaction.isPending ? "Creating…" : "Create transaction"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="rounded-[4px] border border-[#D8D3C6] px-4 py-2 text-[13.5px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
