import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { ErrorState, Panel, Skeleton } from "@/components/ui/display";
import { Combobox } from "@/components/ui/combobox";
import { Dialog } from "@/components/ui/overlay";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  useCreateOwner,
  useCreateProperty,
  useProperty,
  usePropertyOwners,
  useUpdateProperty,
  type PropertyDetail,
  type PropertyInput,
} from "../api";
import { AMENITIES, GHANA_REGIONS } from "../constants";

type FormState = {
  title: string;
  property_type: "residential" | "commercial";
  listing_type: "sale" | "rent";
  rental_period: "" | "daily" | "monthly" | "yearly";
  price: string;
  currency: string;
  location: string;
  region: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  land_size: string;
  building_size: string;
  amenities: string[];
  description: string;
  owner: string;
};

function fromProperty(p?: PropertyDetail): FormState {
  return {
    title: p?.title ?? "",
    property_type: p?.property_type ?? "residential",
    listing_type: p?.listing_type ?? "sale",
    rental_period: p?.rental_period ?? "",
    price: p?.price ? String(Number(p.price)) : "",
    currency: p?.currency ?? "GHS",
    location: p?.location ?? "",
    region: p?.region ?? "",
    address: p?.address ?? "",
    bedrooms: p?.bedrooms != null ? String(p.bedrooms) : "",
    bathrooms: p?.bathrooms != null ? String(p.bathrooms) : "",
    land_size: p?.land_size ? String(Number(p.land_size)) : "",
    building_size: p?.building_size ? String(Number(p.building_size)) : "",
    amenities: p?.amenities ?? [],
    description: p?.description ?? "",
    owner: p?.owner ?? "",
  };
}

function toInput(f: FormState): PropertyInput {
  const intOrNull = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.round(Number(v))));
  const decOrNull = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    title: f.title.trim(),
    property_type: f.property_type,
    listing_type: f.listing_type,
    rental_period: f.listing_type === "rent" && f.rental_period ? f.rental_period : null,
    price: f.price.trim(),
    currency: f.currency,
    location: f.location.trim(),
    region: f.region,
    address: f.address.trim(),
    bedrooms: intOrNull(f.bedrooms),
    bathrooms: intOrNull(f.bathrooms),
    land_size: decOrNull(f.land_size),
    building_size: decOrNull(f.building_size),
    amenities: f.amenities,
    description: f.description.trim(),
    owner: f.owner,
  };
}

export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const existing = useProperty(id);

  if (id && existing.isLoading) {
    return (
      <Page width="narrow">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-96" />
      </Page>
    );
  }
  if (id && existing.isError) {
    return (
      <Page width="narrow">
        <ErrorState error={existing.error} onRetry={() => existing.refetch()} />
      </Page>
    );
  }
  return <PropertyForm key={id ?? "new"} property={existing.data} />;
}

function PropertyForm({ property }: { property?: PropertyDetail }) {
  const isEdit = !!property;
  useDocumentTitle(isEdit ? `Edit ${property.title}` : "New property");
  const navigate = useNavigate();
  const owners = usePropertyOwners();
  const create = useCreateProperty();
  const update = useUpdateProperty(property?.id ?? "");
  const [form, setForm] = useState<FormState>(() => fromProperty(property));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [ownerDialog, setOwnerDialog] = useState(false);
  const saving = create.isPending || update.isPending;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Give the listing a title.";
    if (!form.price.trim() || Number(form.price) <= 0) e.price = "Enter a price above zero.";
    if (!form.location.trim()) e.location = "Where is the property?";
    if (!form.owner) e.owner = "Choose the owner, or add a new one.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    try {
      const saved = isEdit ? await update.mutateAsync(toInput(form)) : await create.mutateAsync(toInput(form));
      toast.success(isEdit ? "Changes saved" : "Property created", isEdit ? undefined : "It starts as a draft. Add photos, then submit it for verification.");
      navigate(`/properties/${saved.id}`, { replace: isEdit });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, "Couldn't save the property."));
    }
  }

  const ownerOptions = (owners.data ?? []).map((o) => ({ value: o.id, label: o.name, hint: [o.phone, o.email].filter(Boolean).join(" · ") }));

  return (
    <Page width="narrow">
      <PageHeader
        title={isEdit ? "Edit property" : "New property"}
        description={isEdit ? property.title : "Captured as a draft. Nothing is public until it's verified and published."}
        back={isEdit ? { to: `/properties/${property.id}`, label: "Back to property" } : { to: "/properties", label: "Properties" }}
      />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormError message={formError} />

        <Panel title="Listing">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title} className="sm:col-span-2">
              {(p) => <Input {...p} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="4-bedroom house, East Legon Hills" />}
            </Field>
            <Field label="Property type">
              {(p) => (
                <Select {...p} value={form.property_type} onChange={(e) => set("property_type", e.target.value as FormState["property_type"])}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </Select>
              )}
            </Field>
            <Field label="Listed for">
              {(p) => (
                <Select {...p} value={form.listing_type} onChange={(e) => set("listing_type", e.target.value as FormState["listing_type"])}>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </Select>
              )}
            </Field>
            <Field label={form.listing_type === "rent" ? "Rent" : "Asking price"} error={errors.price}>
              {(p) => (
                <div className="flex">
                  <Select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    aria-label="Currency"
                    className="w-[84px] rounded-r-none border-r-0"
                  >
                    <option value="GHS">GH₵</option>
                    <option value="USD">USD</option>
                  </Select>
                  <Input
                    {...p}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className="num rounded-l-none"
                  />
                </div>
              )}
            </Field>
            {form.listing_type === "rent" ? (
              <Field label="Rent period" optional>
                {(p) => (
                  <Select {...p} value={form.rental_period} onChange={(e) => set("rental_period", e.target.value as FormState["rental_period"])}>
                    <option value="">Not specified</option>
                    <option value="monthly">Per month</option>
                    <option value="yearly">Per year</option>
                    <option value="daily">Per day</option>
                  </Select>
                )}
              </Field>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </Panel>

        <Panel title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area / neighbourhood" error={errors.location}>
              {(p) => <Input {...p} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="East Legon" />}
            </Field>
            <Field label="Region" optional>
              {(p) => (
                <Select {...p} value={form.region} onChange={(e) => set("region", e.target.value)}>
                  <option value="">Select region</option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Street address or GPS code" optional className="sm:col-span-2">
              {(p) => <Input {...p} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="GA-492-7381" />}
            </Field>
          </div>
        </Panel>

        <Panel title="Details">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Bedrooms" optional>
              {(p) => <Input {...p} type="number" min="0" inputMode="numeric" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />}
            </Field>
            <Field label="Bathrooms" optional>
              {(p) => <Input {...p} type="number" min="0" inputMode="numeric" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />}
            </Field>
            <Field label="Building (sq ft)" optional>
              {(p) => <Input {...p} type="number" min="0" inputMode="decimal" value={form.building_size} onChange={(e) => set("building_size", e.target.value)} />}
            </Field>
            <Field label="Land (sq ft)" optional>
              {(p) => <Input {...p} type="number" min="0" inputMode="decimal" value={form.land_size} onChange={(e) => set("land_size", e.target.value)} />}
            </Field>
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-semibold text-ink-muted">Amenities</legend>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set([...AMENITIES, ...form.amenities])].map((a) => {
                const on = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("amenities", on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])}
                    className={cn(
                      "rounded-sm border px-2.5 py-1 text-xs font-semibold transition-colors",
                      on ? "border-brand bg-brand-50 text-brand-fg" : "border-line-strong bg-field text-ink-muted hover:border-ink-faint",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Description" optional className="mt-5">
            {(p) => (
              <Textarea
                {...p}
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What makes it worth viewing: layout, finishes, access roads, nearby schools…"
              />
            )}
          </Field>
        </Panel>

        <Panel title="Owner" description="The landlord or seller you're representing.">
          <Field label="Owner" error={errors.owner}>
            {(p) => (
              <Combobox
                {...p}
                invalid={!!errors.owner}
                value={form.owner}
                onChange={(v) => set("owner", v)}
                options={ownerOptions}
                loading={owners.isLoading}
                placeholder="Search owners"
                emptyText="No owner by that name"
                footer={
                  <Button type="button" variant="ghost" size="sm" className="w-full justify-start" icon={<Plus />} onClick={() => setOwnerDialog(true)}>
                    Add a new owner
                  </Button>
                }
              />
            )}
          </Field>
          {!form.owner && (
            <button type="button" onClick={() => setOwnerDialog(true)} className="mt-2 text-xs font-semibold text-brand-fg hover:underline">
              Owner not on file? Add them
            </button>
          )}
        </Panel>

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded sm:border sm:bg-surface">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEdit ? "Save changes" : "Create draft"}
          </Button>
        </div>
      </form>

      <NewOwnerDialog
        open={ownerDialog}
        onClose={() => setOwnerDialog(false)}
        onCreated={(id) => {
          set("owner", id);
          setOwnerDialog(false);
        }}
      />
    </Page>
  );
}

export function NewOwnerDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const create = useCreateOwner();
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "" });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.name.trim() || !f.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    try {
      const owner = await create.mutateAsync({ name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() || undefined, address: f.address.trim() || undefined });
      toast.success("Owner added", owner.name);
      setF({ name: "", phone: "", email: "", address: "" });
      onCreated(owner.id);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't add the owner."));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add owner"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="new-owner" loading={create.isPending}>
            Add owner
          </Button>
        </>
      }
    >
      <form id="new-owner" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Full name">{(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">{(p) => <Input {...p} type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="024 000 0000" />}</Field>
          <Field label="Email" optional>
            {(p) => <Input {...p} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}
          </Field>
        </div>
        <Field label="Address" optional>
          {(p) => <Input {...p} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />}
        </Field>
      </form>
    </Dialog>
  );
}
