import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePropertyOwners } from "../hooks/use-property-owners";
import { useCreateProperty, useCreatePropertyOwner } from "../hooks/use-create-property";
import type { CreatePropertyPayload } from "../types";

const PROPERTY_TYPES = ["residential", "commercial"];
const LISTING_TYPES = ["sale", "rent"];

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
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. 4-Bedroom Villa in East Legon"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Property type</label>
          <select
            value={form.property_type}
            onChange={(e) => updateField("property_type", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm capitalize"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Listing type</label>
          <select
            value={form.listing_type}
            onChange={(e) => updateField("listing_type", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm capitalize"
          >
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
          <input
            required
            value={form.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            required
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. Accra"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms</label>
          <input
            type="number"
            min="0"
            value={form.bedrooms ?? ""}
            onChange={(e) => updateField("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bathrooms</label>
          <input
            type="number"
            min="0"
            value={form.bathrooms ?? ""}
            onChange={(e) => updateField("bathrooms", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Owner</label>

        {!showNewOwner ? (
          <div className="flex items-center gap-3">
            <select
              required
              value={form.owner}
              disabled={ownersLoading}
              onChange={(e) => updateField("owner", e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <button
              type="button"
              onClick={() => setShowNewOwner(true)}
              className="whitespace-nowrap text-sm font-medium text-[#240270] hover:underline"
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
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone"
                value={newOwnerPhone}
                onChange={(e) => setNewOwnerPhone(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Email (optional)"
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
                className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCreateOwner}
                disabled={!newOwnerName.trim() || !newOwnerPhone.trim() || createOwner.isPending}
                className="rounded-md bg-[#240270] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {createOwner.isPending ? "Saving…" : "Save owner"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewOwner(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {createProperty.isError && (
        <p className="text-sm text-red-600">
          Failed to create property. Check the fields and try again.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-[#240270] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {createProperty.isPending ? "Creating…" : "Create property"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
