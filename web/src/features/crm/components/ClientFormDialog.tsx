import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useCreateClient, type Client, type ClientInput } from "../api";

export function ClientFormDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: (c: Client) => void }) {
  if (!open) return null;
  return <ClientForm onClose={onClose} onSaved={onSaved} />;
}

function ClientForm({ onClose, onSaved }: { onClose: () => void; onSaved?: (c: Client) => void }) {
  const create = useCreateClient();
  const [f, setF] = useState({ name: "", phone: "", email: "", budget: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = "Enter the client's name.";
    if (!f.phone.trim()) errs.phone = "A phone number is needed to reach the client.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const input: ClientInput = {
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      budget: f.budget.trim() || null,
    };
    try {
      const saved = await create.mutateAsync(input);
      toast.success("Client added", saved.name + " is now in your clients.");
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err, "Couldn't save the client."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title="New client"
      description="Add a buyer or tenant directly. You can book viewings and open transactions for them straight away."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="client-form" variant="primary" loading={create.isPending}>
            Add client
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={submit} className="space-y-5" noValidate>
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            {(p) => <Input {...p} value={f.name} onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))} autoComplete="off" />}
          </Field>
          <Field label="Phone" error={errors.phone}>
            {(p) => <Input {...p} type="tel" value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))} placeholder="024 000 0000" />}
          </Field>
          <Field label="Email" optional error={errors.email}>
            {(p) => <Input {...p} type="email" value={f.email} onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))} />}
          </Field>
          <Field label="Budget (GH₵)" optional error={errors.budget}>
            {(p) => <Input {...p} type="number" min="0" inputMode="decimal" className="num" value={f.budget} onChange={(e) => setF((s) => ({ ...s, budget: e.target.value }))} />}
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
