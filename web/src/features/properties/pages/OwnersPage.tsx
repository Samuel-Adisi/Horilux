import { useMemo, useState, type FormEvent } from "react";
import { KeyRound, Pencil, Plus } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { usePropertyOwners, useUpdateOwner, type PropertyOwner } from "../api";
import { NewOwnerDialog } from "./PropertyFormPage";

export function OwnersPage() {
  useDocumentTitle("Owners");
  const can = useCan();
  const q = usePropertyOwners();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PropertyOwner | null>(null);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    const all = q.data ?? [];
    return s ? all.filter((o) => `${o.name} ${o.phone} ${o.email}`.toLowerCase().includes(s)) : all;
  }, [q.data, search]);

  return (
    <Page>
      <PageHeader
        title="Owners"
        description="Landlords and sellers Horilux represents."
        actions={
          can("property", "create") && (
            <Button variant="primary" icon={<Plus />} onClick={() => setAdding(true)}>
              Add owner
            </Button>
          )
        }
      />
      <Panel flush>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, phone or email" />
          {q.data && <span className="text-xs text-ink-subtle sm:ml-auto">{q.data.length} owners</span>}
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<KeyRound />} title={search ? "No owners match" : "No owners yet"} description={search ? undefined : "Owners are added when you create a property."} />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Name</TH>
                <TH>Phone</TH>
                <TH className="hidden md:table-cell">Email</TH>
                <TH className="hidden lg:table-cell">Added</TH>
                <TH className="w-12" />
              </tr>
            </THead>
            <TBody>
              {rows.map((o) => (
                <TR key={o.id}>
                  <TD>
                    <p className="font-semibold">{o.name}</p>
                    {o.address && <p className="max-w-xs truncate text-xs text-ink-subtle">{o.address}</p>}
                  </TD>
                  <TD>
                    <a href={`tel:${o.phone}`} className="hover:text-brand-fg">
                      {o.phone}
                    </a>
                  </TD>
                  <TD className="hidden text-ink-muted md:table-cell">{o.email || "—"}</TD>
                  <TD className="hidden text-ink-subtle lg:table-cell">{formatDate(o.created_at)}</TD>
                  <TD>
                    {can("property", "edit") && (
                      <Button variant="ghost" size="icon" aria-label={`Edit ${o.name}`} onClick={() => setEditing(o)}>
                        <Pencil />
                      </Button>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>
      <NewOwnerDialog open={adding} onClose={() => setAdding(false)} onCreated={() => setAdding(false)} />
      {editing && <EditOwnerDialog owner={editing} onClose={() => setEditing(null)} />}
    </Page>
  );
}

function EditOwnerDialog({ owner, onClose }: { owner: PropertyOwner; onClose: () => void }) {
  const update = useUpdateOwner();
  const [f, setF] = useState({ name: owner.name, phone: owner.phone, email: owner.email, address: owner.address, notes: owner.notes });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    try {
      await update.mutateAsync({ id: owner.id, input: f });
      toast.success("Owner updated");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the owner."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Edit owner"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="edit-owner" loading={update.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="edit-owner" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Full name">{(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">{(p) => <Input {...p} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />}</Field>
          <Field label="Email" optional>
            {(p) => <Input {...p} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}
          </Field>
        </div>
        <Field label="Address" optional>
          {(p) => <Input {...p} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />}
        </Field>
        <Field label="Notes" optional>
          {(p) => <Textarea {...p} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />}
        </Field>
      </form>
    </Dialog>
  );
}
