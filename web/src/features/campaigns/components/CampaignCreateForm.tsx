import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/features/properties/hooks/use-properties";
import { useCreateCampaign } from "../hooks/use-create-campaign";
import type { CreateCampaignPayload } from "../types";

const ELIGIBLE_STATUSES = ["marketing_ready", "published"];

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

export function CampaignCreateForm() {
  const navigate = useNavigate();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const createCampaign = useCreateCampaign();

  const [propertyId, setPropertyId] = useState("");
  const [headline, setHeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  const eligibleProperties = (properties?.results ?? []).filter((p) =>
    ELIGIBLE_STATUSES.includes(p.status)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyId || !headline) {
      setError("Property and headline are required.");
      return;
    }

    const payload: CreateCampaignPayload = {
      property: propertyId,
      content: { headline },
    };

    try {
      const campaign = await createCampaign.mutateAsync(payload);
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign.");
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
            {eligibleProperties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.location}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
        <p className="mt-1.5 text-[12px] text-[#8A8578]">
          Only properties that are marketing-ready or published can have campaigns.
        </p>
      </div>

      <div>
        <label className={labelClass}>Headline *</label>
        <input
          type="text"
          className={inputClass}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 border-t border-[#EFEDE6] pt-5">
        <button
          type="submit"
          disabled={createCampaign.isPending}
          className="rounded-[4px] bg-[#240270] px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {createCampaign.isPending ? "Creating…" : "Create campaign"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/campaigns")}
          className="rounded-[4px] border border-[#D8D3C6] px-4 py-2 text-[13.5px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
