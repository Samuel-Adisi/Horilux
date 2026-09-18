import { useMemo, useState, type FormEvent } from "react";
import { Plus, Users } from "lucide-react";
import { Page, PageHeader, SearchInput, Segmented, Toolbar } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, ErrorState, Panel, Status } from "@/components/ui/display";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { ConfirmDialog, Drawer } from "@/components/ui/overlay";
import { Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCan, useCurrentUser } from "@/features/accounts/permissions";
import { DEPARTMENT_LABELS, type User } from "@/features/accounts/types";
import { useDebounced } from "@/hooks/use-debounced";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useDepartments, useRoles, useSaveStaff, useSetStaffActive, useStaff, type StaffInput } from "./api";

export function StaffPage() {
  useDocumentTitle("Staff");
  const can = useCan();
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<"active" | "inactive" | "all">("active");
  const debounced = useDebounced(search.trim(), 300);
  const q = useStaff(debounced);
  const [editing, setEditing] = useState<User | "new" | null>(null);

  const rows = useMemo(
    () => (q.data ?? []).filter((u) => (show === "all" ? true : show === "active" ? u.is_active : !u.is_active)),
    [q.data, show],
  );
  const counts = {
    active: (q.data ?? []).filter((u) => u.is_active).length,
    inactive: (q.data ?? []).filter((u) => !u.is_active).length,
  };

  return (
    <Page>
      <PageHeader
        title="Staff"
        description="Who can sign in, and what their role lets them do."
        actions={
          can("user_management", "create") && (
            <Button variant="primary" icon={<Plus />} onClick={() => setEditing("new")}>
              Add staff
            </Button>
          )
        }
      />
      <Panel flush>
        <div className="border-b border-line px-4 pt-2">
          <Segmented
            value={show}
            onChange={setShow}
            options={[
              { value: "active", label: "Active", count: q.data ? counts.active : undefined },
              { value: "inactive", label: "Deactivated", count: q.data ? counts.inactive : undefined },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton cols={4} />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Users />} title="No staff found" />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Name</TH>
                <TH className="hidden md:table-cell">Department</TH>
                <TH>Role</TH>
                <TH className="hidden sm:table-cell">Status</TH>
                <TH className="hidden lg:table-cell" align="right">
                  Joined
                </TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((u) => (
                <TR key={u.id} onClick={() => setEditing(u)}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.full_name} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{u.full_name || "—"}</p>
                        <p className="truncate text-xs text-ink-subtle">{u.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="hidden text-ink-muted md:table-cell">{u.department ? DEPARTMENT_LABELS[u.department.name] ?? u.department.name : "—"}</TD>
                  <TD className="text-ink-muted">{u.roles.map((r) => r.name).join(", ") || (u.is_staff ? "Administrator" : "No role")}</TD>
                  <TD className="hidden sm:table-cell">{u.is_active ? <Status tone="success">Active</Status> : <Status tone="muted">Deactivated</Status>}</TD>
                  <TD align="right" className="hidden text-ink-subtle lg:table-cell">
                    {formatDate(u.date_joined)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>
      {editing && <StaffDrawer user={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </Page>
  );
}

function StaffDrawer({ user, onClose }: { user?: User; onClose: () => void }) {
  const can = useCan();
  const me = useCurrentUser();
  const departments = useDepartments();
  const roles = useRoles();
  const save = useSaveStaff();
  const setActive = useSetStaffActive();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const canEdit = user ? can("user_management", "edit") : can("user_management", "create");
  const [f, setF] = useState({
    email: user?.email ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: user?.phone ?? "",
    department: user?.department?.id ?? "",
    role: user?.roles[0]?.id ?? "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Keep role choices consistent with the chosen department.
  const roleOptions = (roles.data ?? []).filter((r) => !f.department || !r.department || r.department === f.department);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.first_name.trim()) errs.first_name = "Required.";
    if (!f.last_name.trim()) errs.last_name = "Required.";
    if (!user && !/^\S+@\S+\.\S+$/.test(f.email.trim())) errs.email = "Enter a valid email.";
    if (!user && f.password.length < 8) errs.password = "At least 8 characters.";
    if (user && f.password && f.password.length < 8) errs.password = "At least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const input: StaffInput = {
      first_name: f.first_name.trim(),
      last_name: f.last_name.trim(),
      phone: f.phone.trim(),
      department: f.department || null,
      role: f.role || null,
      ...(user ? {} : { email: f.email.trim().toLowerCase() }),
      ...(f.password ? { password: f.password } : {}),
    };
    try {
      await save.mutateAsync({ id: user?.id, input });
      toast.success(user ? "Staff member updated" : "Staff member added", user ? undefined : `${input.first_name} can now sign in with ${f.email.trim()}.`);
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err, "Couldn't save."));
    }
  }

  async function toggleActive() {
    if (!user) return;
    try {
      await setActive.mutateAsync({ id: user.id, active: !user.is_active });
      toast.success(user.is_active ? "Access removed" : "Access restored", user.full_name);
      onClose();
    } catch (err) {
      toast.error("Couldn't change access", getErrorMessage(err));
    } finally {
      setConfirmDeactivate(false);
    }
  }

  const isSelf = user?.id === me?.id;

  return (
    <Drawer
      open
      onClose={onClose}
      title={user ? user.full_name || user.email : "Add staff member"}
      subtitle={user ? user.email : "They'll sign in with this email and the password you set."}
      footer={
        <>
          {user && !isSelf && (user.is_active ? can("user_management", "delete") : can("user_management", "edit")) && (
            <Button variant={user.is_active ? "danger" : "secondary"} className="mr-auto" onClick={() => (user.is_active ? setConfirmDeactivate(true) : toggleActive())} loading={setActive.isPending}>
              {user.is_active ? "Deactivate" : "Reactivate"}
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          {canEdit && (
            <Button type="submit" form="staff-form" variant="primary" loading={save.isPending}>
              {user ? "Save changes" : "Add staff member"}
            </Button>
          )}
        </>
      }
    >
      <form id="staff-form" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <fieldset disabled={!canEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" error={errors.first_name}>
              {(p) => <Input {...p} value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} />}
            </Field>
            <Field label="Last name" error={errors.last_name}>
              {(p) => <Input {...p} value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} />}
            </Field>
          </div>
          {!user && (
            <Field label="Work email" error={errors.email}>
              {(p) => <Input {...p} type="email" autoComplete="off" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}
            </Field>
          )}
          <Field label="Phone" optional error={errors.phone}>
            {(p) => <Input {...p} type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department">
              {(p) => (
                <Select {...p} value={f.department} onChange={(e) => setF({ ...f, department: e.target.value, role: "" })}>
                  <option value="">None</option>
                  {(departments.data ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {DEPARTMENT_LABELS[d.name] ?? d.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Role" hint="Decides what they can see and do.">
              {(p) => (
                <Select {...p} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                  <option value="">No role (no access)</option>
                  {roleOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Field
            label={user ? "Reset password" : "Temporary password"}
            optional={!!user}
            error={errors.password}
            hint={user ? "Leave blank to keep their current password." : "Share it with them securely; they can't reset it themselves yet."}
          >
            {(p) => <Input {...p} type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />}
          </Field>
        </fieldset>
      </form>
      <ConfirmDialog
        open={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={toggleActive}
        title="Deactivate this account?"
        description="They'll be signed out and won't be able to sign in. Their records and history stay intact, and you can reactivate them later."
        confirmLabel="Deactivate"
        tone="danger"
        loading={setActive.isPending}
      />
    </Drawer>
  );
}
