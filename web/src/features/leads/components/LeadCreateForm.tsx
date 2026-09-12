import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateLead } from "../hooks/use-create-lead";
import type { CreateLeadPayload } from "../types";

const PURPOSES = ["buy", "rent"];

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
const selectClass = `${inputClass} appearance-none pr-9 capitalize text-[#17131F]`;
const selectWrapClass = "relative text-[#8A8578]";

export function LeadCreateForm() {
  const navigate = useNavigate();
  const createLead = useCreateLead();

  const [form, setForm] = useState<CreateLeadPayload>({
    name: "",
    phone: "",
    email: "",
    source: "",
    budget: "",
    currency: "GHS",
    location_preference: "",
    property_type_preference: "",
    bedrooms_preference: undefined,
    purpose: "buy",
    notes: "",
  });

  function updateField<K extends keyof CreateLeadPayload>(key: K, value: CreateLeadPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateLeadPayload = { ...form };
    if (!payload.budget) delete payload.budget;
    if (!payload.email) delete payload.email;
    const created = await createLead.mutateAsync(payload);
    navigate("/leads", { state: { createdId: created.id } });
  }

  const canSubmit = form.name.trim() && form.phone.trim() && !createLead.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 rounded-[6px] border border-[#E4E1D9] bg-white p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            required
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Source</label>
          <input
            value={form.source}
            onChange={(e) => updateField("source", e.target.value)}
            placeholder="e.g. referral, website, walk-in"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Purpose</label>
          <div className={selectWrapClass}>
            <select
              value={form.purpose}
              onChange={(e) => updateField("purpose", e.target.value)}
              className={selectClass}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        <div>
          <label className={labelClass}>Budget (optional)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Location preference</label>
          <input
            value={form.location_preference}
            onChange={(e) => updateField("location_preference", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Property type preference</label>
          <input
            value={form.property_type_preference}
            onChange={(e) => updateField("property_type_preference", e.target.value)}
            placeholder="e.g. residential"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Bedrooms preference</label>
          <input
            type="number"
            min="0"
            value={form.bedrooms_preference ?? ""}
            onChange={(e) =>
              updateField("bedrooms_preference", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
      </div>

      {createLead.isError && (
        <p className="text-[13px] text-[#8A2E2E]">Failed to create lead. Check the fields and try again.</p>
      )}

      <div className="flex gap-3 border-t border-[#EFEDE6] pt-5">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-[4px] bg-[#240270] px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {createLead.isPending ? "Creating…" : "Create lead"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/leads")}
          className="rounded-[4px] border border-[#D8D3C6] px-4 py-2 text-[13.5px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
