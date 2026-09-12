import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/features/properties/hooks/use-properties";
import { useClients } from "@/features/leads/hooks/use-clients";
import { useUsers } from "@/features/accounts/hooks/use-users";
import { useCreateViewing } from "../hooks/use-create-viewing";
import type { CreateViewingPayload } from "../types";

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

export function ViewingCreateForm() {
  const navigate = useNavigate();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: users, isLoading: usersLoading } = useUsers();
  const createViewing = useCreateViewing();

  const [form, setForm] = useState<CreateViewingPayload>({
    property: "",
    client: "",
    agent: "",
    date: "",
    time: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CreateViewingPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.property || !form.client || !form.date || !form.time) {
      setError("Property, client, and scheduled date are required.");
      return;
    }

    try {
      const payload: CreateViewingPayload = { ...form };
      if (!payload.agent) delete payload.agent;
      const viewing = await createViewing.mutateAsync(payload);
      navigate(`/viewings/${viewing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create viewing.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-[6px] border border-[#E4E1D9] bg-white p-6"
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
            value={form.property}
            onChange={(e) => handleChange("property", e.target.value)}
            disabled={propertiesLoading}
            required
          >
            <option value="">Select a property…</option>
            {properties?.results.map((p: import("@/features/properties/types").Property) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.location}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </div>

      <div>
        <label className={labelClass}>Client *</label>
        <div className={selectWrapClass}>
          <select
            className={selectClass}
            value={form.client}
            onChange={(e) => handleChange("client", e.target.value)}
            disabled={clientsLoading}
            required
          >
            <option value="">Select a client…</option>
            {clients?.results.map((c: import("@/features/leads/types").Client) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </div>

      <div>
        <label className={labelClass}>Agent</label>
        <div className={selectWrapClass}>
          <select
            className={selectClass}
            value={form.agent}
            onChange={(e) => handleChange("agent", e.target.value)}
            disabled={usersLoading}
          >
            <option value="">Assign to me</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} {u.department_name ? `(${u.department_name})` : ""}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
        <p className="mt-1.5 text-[12px] text-[#8A8578]">Leave blank to assign yourself.</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass}>Scheduled date *</label>
          <input
            type="date"
            className={`${inputClass} [color-scheme:light]`}
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Scheduled time *</label>
          <input
            type="time"
            className={`${inputClass} [color-scheme:light]`}
            value={form.time}
            onChange={(e) => handleChange("time", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          className={inputClass}
          rows={3}
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>

      <div className="flex gap-3 border-t border-[#EFEDE6] pt-5">
        <button
          type="submit"
          disabled={createViewing.isPending}
          className="rounded-[4px] bg-[#240270] px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {createViewing.isPending ? "Creating…" : "Create viewing"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/viewings")}
          className="rounded-[4px] border border-[#D8D3C6] px-4 py-2 text-[13.5px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
