import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { Panel } from "@/components/ui/display";
import { ClientPicker, PropertyPicker, UserPicker } from "@/components/domain/pickers";
import { fetchProperty } from "@/features/properties/api";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useCreateTransaction } from "../api";

const DEALABLE = ["marketing_ready", "published", "under_offer"];

export function TransactionFormPage() {
  useDocumentTitle("New transaction");
  const navigate = useNavigate();
  const can = useCan();
  const [params] = useSearchParams();
  const create = useCreateTransaction();
  const [f, setF] = useState({ property: "", client: params.get("client") ?? "", owner: "", ownerName: "", agent: "", price: "", commission_percent: "5" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  async function pickProperty(id: string) {
    setF((s) => ({ ...s, property: id, owner: "", ownerName: "" }));
    if (!id) return;
    setLoadingOwner(true);
    try {
      const p = await fetchProperty(id);
      setF((s) => ({ ...s, owner: p.owner, ownerName: p.owner_detail?.name ?? "", price: s.price || String(Number(p.price)) }));
    } catch (err) {
      toast.error("Couldn't load the property's owner", getErrorMessage(err));
    } finally {
      setLoadingOwner(false);
    }
  }

  const price = Number(f.price) || 0;
  const pct = Number(f.commission_percent) || 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.property) errs.property = "Choose the property.";
    if (!f.client) errs.client = "Choose the client.";
    if (!price || price <= 0) errs.price = "Enter the agreed price.";
    if (pct < 0 || pct > 100) errs.commission_percent = "Must be between 0 and 100.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const t = await create.mutateAsync({
        property: f.property,
        client: f.client,
        owner: f.owner,
        agent: f.agent || undefined,
        price: f.price,
        commission_percent: f.commission_percent,
      });
      toast.success("Transaction opened", "It starts at the Offer stage.");
      navigate(`/transactions/${t.id}`, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err, "Couldn't open the transaction."));
    }
  }

  return (
    <Page width="narrow">
      <PageHeader title="New transaction" description="Record an offer on a listing. You'll move it through each stage from its page." back={{ to: "/transactions", label: "Transactions" }} />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <FormError message={error} />
        <Panel title="Parties">
          <div className="space-y-4">
            <Field label="Property" error={errors.property} hint={f.ownerName ? `Owner: ${f.ownerName}` : loadingOwner ? "Loading owner…" : "Only listings approved for marketing or live."}>
              {(p) => <PropertyPicker {...p} invalid={!!errors.property} statuses={DEALABLE} value={f.property} onChange={pickProperty} />}
            </Field>
            <Field label="Client" error={errors.client}>
              {(p) => <ClientPicker {...p} invalid={!!errors.client} value={f.client} onChange={(v) => setF({ ...f, client: v })} />}
            </Field>
            {can("transaction", "edit") && (
              <Field label="Agent" optional hint="Defaults to you.">
                {(p) => <UserPicker {...p} value={f.agent} onChange={(v) => setF({ ...f, agent: v })} departments={["sales", "listing"]} clearable />}
              </Field>
            )}
          </div>
        </Panel>
        <Panel title="Terms">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Agreed price (GH₵)" error={errors.price}>
              {(p) => <Input {...p} type="number" min="0" step="0.01" className="num" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />}
            </Field>
            <Field label="Commission (%)" error={errors.commission_percent}>
              {(p) => <Input {...p} type="number" min="0" max="100" step="0.25" className="num" value={f.commission_percent} onChange={(e) => setF({ ...f, commission_percent: e.target.value })} />}
            </Field>
          </div>
          <p className="mt-4 rounded bg-surface-sunken px-3 py-2 text-sm text-ink-muted">
            Expected commission: <span className="num font-bold text-ink">{formatMoney((price * pct) / 100)}</span>
          </p>
        </Panel>
        <div className="flex justify-end gap-2">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={create.isPending} disabled={loadingOwner}>
            Open transaction
          </Button>
        </div>
      </form>
    </Page>
  );
}
