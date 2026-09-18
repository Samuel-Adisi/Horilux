import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { LEAD_SOURCES, useCreateLead, useUpdateLead, type Lead, type LeadInput } from "../api";

type F = {
  name: string;
  phone: string;
  email: string;
  source: string;
  purpose: "" | "buy" | "rent";
  property_type_preference: string;
  location_preference: string;
  bedrooms_preference: string;
  budget: string;
  next_follow_up: string;
  notes: string;
};

function init(l?: Lead): F {
  return {
    name: l?.name ?? "",
    phone: l?.phone ?? "",
    email: l?.email ?? "",
    source: l?.source ?? "",
    purpose: l?.purpose ?? "",
    property_type_preference: l?.property_type_preference ?? "",
    location_preference: l?.location_preference ?? "",
    bedrooms_preference: l?.bedrooms_preference != null ? String(l.bedrooms_preference) : "",
    budget: l?.budget ? String(Number(l.budget)) : "",
    next_follow_up: l?.next_follow_up ?? "",
    notes: l?.notes ?? "",
  };
}

export function LeadFormDialog({ open, onClose, lead, onSaved }: { open: boolean; onClose: () => void; lead?: Lead; onSaved?: (l: Lead) => void }) {
  if (!open) return null;
  return <LeadForm onClose={onClose} lead={lead} onSaved={onSaved} />;
}

function LeadForm({ onClose, lead, onSaved }: { onClose: () => void; lead?: Lead; onSaved?: (l: Lead) => void }) {
  const create = useCreateLead();
  const update = useUpdateLead(lead?.id ?? "");
  const [f, setF] = useState<F>(() => init(lead));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const saving = create.isPending || update.isPending;

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = "Enter the enquirer's name.";
    if (!f.phone.trim()) errs.phone = "A phone number is needed to follow up.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const input: LeadInput = {
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      source: f.source,
      purpose: f.purpose || null,
      property_type_preference: f.property_type_preference,
      location_preference: f.location_preference.trim(),
      bedrooms_preference: f.bedrooms_preference ? Number(f.bedrooms_preference) : null,
      budget: f.budget.trim() || null,
      next_follow_up: f.next_follow_up || null,
      notes: f.notes.trim(),
    };
    try {
      const saved = lead ? await update.mutateAsync(input) : await create.mutateAsync(input);
      toast.success(lead ? "Lead updated" : "Lead added", lead ? undefined : `${saved.name} is assigned to ${saved.assigned_agent_name ?? "you"}.`);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err, "Couldn't save the lead."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={lead ? "Edit lead" : "New lead"}
      description={lead ? undefined : "Capture the enquiry now — you can fill in preferences later."}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="lead-form" variant="primary" loading={saving}>
            {lead ? "Save" : "Add lead"}
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={submit} className="space-y-5" noValidate>
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            {(p) => <Input {...p} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />}
          </Field>
          <Field label="Phone" error={errors.phone}>
            {(p) => <Input {...p} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="024 000 0000" />}
          </Field>
          <Field label="Email" optional error={errors.email}>
            {(p) => <Input {...p} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
          <Field label="Source" optional>
            {(p) => (
              <Select {...p} value={f.source} onChange={(e) => set("source", e.target.value)}>
                <option value="">Unknown</option>
                {[...new Set([...LEAD_SOURCES, ...(f.source ? [f.source] : [])])].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div className="border-t border-line pt-4">
          <p className="mb-3 text-xs font-bold text-ink">Looking for</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Purpose" optional>
              {(p) => (
                <Select {...p} value={f.purpose} onChange={(e) => set("purpose", e.target.value as F["purpose"])}>
                  <option value="">Not sure yet</option>
                  <option value="buy">To buy</option>
                  <option value="rent">To rent</option>
                </Select>
              )}
            </Field>
            <Field label="Property type" optional>
              {(p) => (
                <Select {...p} value={f.property_type_preference} onChange={(e) => set("property_type_preference", e.target.value)}>
                  <option value="">Any</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </Select>
              )}
            </Field>
            <Field label="Bedrooms" optional>
              {(p) => <Input {...p} type="number" min="0" value={f.bedrooms_preference} onChange={(e) => set("bedrooms_preference", e.target.value)} />}
            </Field>
            <Field label="Preferred areas" optional className="sm:col-span-2">
              {(p) => <Input {...p} value={f.location_preference} onChange={(e) => set("location_preference", e.target.value)} placeholder="Cantonments, Airport Residential" />}
            </Field>
            <Field label="Budget (GH₵)" optional error={errors.budget}>
              {(p) => <Input {...p} type="number" min="0" inputMode="decimal" className="num" value={f.budget} onChange={(e) => set("budget", e.target.value)} />}
            </Field>
          </div>
        </div>

        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
          <Field label="Next follow-up" optional>
            {(p) => <Input {...p} type="date" value={f.next_follow_up} onChange={(e) => set("next_follow_up", e.target.value)} />}
          </Field>
          <Field label="Notes" optional className="sm:col-span-2">
            {(p) => <Textarea {...p} rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} />}
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
