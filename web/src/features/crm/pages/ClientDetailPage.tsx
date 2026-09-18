import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CalendarPlus, Handshake, Mail, Pencil, Phone } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { DescriptionList, ErrorState, Panel, Skeleton } from "@/components/ui/display";
import { Field, FormError, Input } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useClient, useUpdateClient, type Client } from "../api";
import { ActivityTimeline } from "../components/ActivityTimeline";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const q = useClient(id);
  useDocumentTitle(q.data?.name ?? "Client");
  if (q.isLoading)
    return (
      <Page>
        <Skeleton className="mb-6 h-12 w-72" />
        <Skeleton className="h-96" />
      </Page>
    );
  if (q.isError || !q.data)
    return (
      <Page>
        <ErrorState error={q.error} onRetry={() => q.refetch()} title="Couldn't load this client" />
      </Page>
    );
  return <ClientView client={q.data} />;
}

function ClientView({ client }: { client: Client }) {
  const can = useCan();
  const [editing, setEditing] = useState(false);

  return (
    <Page>
      <PageHeader
        back={{ to: "/clients", label: "Clients" }}
        title={client.name}
        meta={<span className="text-sm text-ink-subtle">Client since {formatDate(client.created_at)}</span>}
        actions={
          <>
            {can("viewing", "create") && (
              <ButtonLink to={`/viewings?book=1&client=${client.id}`} variant="primary" icon={<CalendarPlus />}>
                Book viewing
              </ButtonLink>
            )}
            {can("transaction", "create") && (
              <ButtonLink to={`/transactions/new?client=${client.id}`} icon={<Handshake />}>
                Start deal
              </ButtonLink>
            )}
            {can("client", "edit") && (
              <Button icon={<Pencil />} onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline client={client.id} />
        </div>
        <div className="space-y-6">
          <Panel title="Contact">
            <div className="space-y-2 text-sm">
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 font-semibold text-ink hover:text-brand-fg">
                <Phone className="size-3.5 text-ink-subtle" />
                {client.phone}
              </a>
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 break-all text-ink hover:text-brand-fg">
                  <Mail className="size-3.5 shrink-0 text-ink-subtle" />
                  {client.email}
                </a>
              )}
            </div>
          </Panel>
          <Panel title="Account">
            <DescriptionList
              items={[
                { label: "Agent", value: client.assigned_agent_name ?? "—" },
                { label: "Budget", value: client.budget ? formatMoney(client.budget) : "—" },
              ]}
            />
            {client.lead && (
              <Link to={`/leads/${client.lead}`} className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-fg hover:underline">
                View original enquiry
                <ArrowRight className="size-3" />
              </Link>
            )}
          </Panel>
        </div>
      </div>

      {editing && <EditClientDialog client={client} onClose={() => setEditing(false)} />}
    </Page>
  );
}

function EditClientDialog({ client, onClose }: { client: Client; onClose: () => void }) {
  const update = useUpdateClient(client.id);
  const [f, setF] = useState({ name: client.name, phone: client.phone, email: client.email, budget: client.budget ? String(Number(client.budget)) : "" });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    try {
      await update.mutateAsync({ name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), budget: f.budget.trim() || null });
      toast.success("Client updated");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the client."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Edit client"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="client-form" variant="primary" loading={update.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Name">{(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">{(p) => <Input {...p} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />}</Field>
          <Field label="Email" optional>
            {(p) => <Input {...p} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}
          </Field>
        </div>
        <Field label="Budget (GH₵)" optional>
          {(p) => <Input {...p} type="number" min="0" className="num" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} />}
        </Field>
      </form>
    </Dialog>
  );
}
