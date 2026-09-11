import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateLead } from "../hooks/use-create-lead";
import type { CreateLeadPayload } from "../types";

const PURPOSES = ["buy", "rent"];

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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
          <input
            required
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
          <input
            value={form.source}
            onChange={(e) => updateField("source", e.target.value)}
            placeholder="e.g. referral, website, walk-in"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Purpose</label>
          <select
            value={form.purpose}
            onChange={(e) => updateField("purpose", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm capitalize"
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Budget (optional)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location preference</label>
          <input
            value={form.location_preference}
            onChange={(e) => updateField("location_preference", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Property type preference</label>
          <input
            value={form.property_type_preference}
            onChange={(e) => updateField("property_type_preference", e.target.value)}
            placeholder="e.g. residential"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms preference</label>
          <input
            type="number"
            min="0"
            value={form.bedrooms_preference ?? ""}
            onChange={(e) =>
              updateField("bedrooms_preference", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {createLead.isError && (
        <p className="text-sm text-red-600">Failed to create lead. Check the fields and try again.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-[#240270] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {createLead.isPending ? "Creating…" : "Create lead"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/leads")}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
