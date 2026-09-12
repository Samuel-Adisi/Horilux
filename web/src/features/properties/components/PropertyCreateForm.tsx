import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePropertyOwners } from "../hooks/use-property-owners";
import { useCreateProperty, useCreatePropertyOwner } from "../hooks/use-create-property";
import type { CreatePropertyPayload } from "../types";

const PROPERTY_TYPES = ["residential", "commercial"];
const LISTING_TYPES = ["sale", "rent"];

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

export function PropertyCreateForm() {
  const navigate = useNavigate();
  const { data: ownersData, isLoading: ownersLoading } = usePropertyOwners();
  const createProperty = useCreateProperty();
  const createOwner = useCreatePropertyOwner();

  const [showNewOwner, setShowNewOwner] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");

  const [form, setForm] = useState<CreatePropertyPayload>({
    title: "",
    property_type: "residential",
    listing_type: "sale",
    price: "",
    currency: "GHS",
    location: "",
    owner: "",
    address: "",
    bedrooms: undefined,
    bathrooms: undefined,
    description: "",
  });

  const owners = ownersData?.results ?? [];

  function updateField<K extends keyof CreatePropertyPayload>(key: K, value: CreatePropertyPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateOwner() {
    if (!newOwnerName.trim() || !newOwnerPhone.trim()) return;
    const owner = await createOwner.mutateAsync({
      name: newOwnerName.trim(),
      phone: newOwnerPhone.trim(),
      email: newOwnerEmail.trim() || undefined,
    });
    updateField("owner", owner.id);
    setShowNewOwner(false);
    setNewOwnerName("");
    setNewOwnerPhone("");
    setNewOwnerEmail("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.owner) return;
    const created = await createProperty.mutateAsync(form);
    navigate(`/properties`, { state: { createdId: created.id } });
  }

  const canSubmit =
    form.title.trim() &&
    form.price.trim() &&
    form.location.trim() &&
    form.owner &&
    !createProperty.isPending;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={inputClass}
            placeholder="e.g. 4-Bedroom Villa in East Legon"
          />
        </div>

        <div>
          <label className={labelClass}>Property type</label>
          <div className={selectWrapClass}>
            <select
              value={form.property_type}
              onChange={(e) => updateField("property_type", e.target.value)}
              className={selectClass}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        <div>
          <label className={labelClass}>Listing type</label>
          <div className={selectWrapClass}>
            <select
              value={form.listing_type}
              onChange={(e) => updateField("listing_type", e.target.value)}
              className={selectClass}
            >
              {LISTING_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        <div>
          <label className={labelClass}>Price</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <input
            required
            value={form.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Location</label>
          <input
            required
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className={inputClass}
            placeholder="e.g. Accra"
          />
        </div>

        <div>
          <label className={labelClass}>Bedrooms</label>
          <input
            type="number"
            min="0"
            value={form.bedrooms ?? ""}
            onChange={(e) => updateField("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Bathrooms</label>
          <input
            type="number"
            min="0"
            value={form.bathrooms ?? ""}
            onChange={(e) => updateField("bathrooms", e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-[6px] border border-[#EFEDE6] bg-[#FAF9F6] p-4">
        <label className={labelClass}>Owner</label>

        {!showNewOwner ? (
          <div className="flex items-center gap-3">
            <div className={`${selectWrapClass} flex-1`}>
              <select
                required
                value={form.owner}
                disabled={ownersLoading}
                onChange={(e) => updateField("owner", e.target.value)}
                className={selectClass}
              >
                <option value="">
                  {ownersLoading ? "Loading owners…" : "Select an owner"}
                </option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} — {owner.phone}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
            <button
              type="button"
              onClick={() => setShowNewOwner(true)}
              className="whitespace-nowrap text-[13px] font-medium text-[#240270] hover:underline"
            >
              + New owner
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Full name"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Phone"
                value={newOwnerPhone}
                onChange={(e) => setNewOwnerPhone(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Email (optional)"
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
                className={`col-span-2 ${inputClass}`}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCreateOwner}
                disabled={!newOwnerName.trim() || !newOwnerPhone.trim() || createOwner.isPending}
                className="rounded-[4px] bg-[#240270] px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {createOwner.isPending ? "Saving…" : "Save owner"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewOwner(false)}
                className="text-[13px] text-[#8A8578] hover:text-[#3E3A31]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {createProperty.isError && (
        <p className="text-[13px] text-[#8A2E2E]">
          Failed to create property. Check the fields and try again.
        </p>
      )}

      <div className="flex gap-3 border-t border-[#EFEDE6] pt-5">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-[4px] bg-[#240270] px-4 py-2 text-[13.5px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {createProperty.isPending ? "Creating…" : "Create property"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="rounded-[4px] border border-[#D8D3C6] px-4 py-2 text-[13.5px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
