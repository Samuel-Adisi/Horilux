import { useRef, useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { Page, PageHeader, Segmented } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { DescriptionList, ErrorState, Panel, Skeleton, Status } from "@/components/ui/display";
import { Field, FormError, Input, Switch } from "@/components/ui/form";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useCan, useCurrentUser } from "@/features/accounts/permissions";
import { DEPARTMENT_LABELS } from "@/features/accounts/types";
import { useCommissionRules, useSaveCommissionRule, type CommissionRule } from "@/features/transactions/api";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDateTime, formatMoney, formatRelative } from "@/lib/format";
import { toast } from "@/lib/toast";
import {
  useApprovalThreshold,
  useCompanyProfile,
  useIntegrations,
  useNotificationPreferences,
  useRoles,
  useUpdateApprovalThreshold,
  useUpdateCompanyProfile,
  useUpdateNotificationPreference,
  useUploadCompanyLogo,
  type CompanyProfile,
} from "./api";

export function SettingsPage() {
  useDocumentTitle("Settings");
  const can = useCan();
  const { values, set } = useUrlState(["tab"] as const);
  const tabs = [
    { value: "account", label: "Your account" },
    { value: "notifications", label: "Notifications" },
    ...(can("company_settings", "view") ? [{ value: "company", label: "Company" }, { value: "approvals", label: "Approvals" }] : []),
    ...(can("payment_commission", "view") ? [{ value: "commission", label: "Commission" }] : []),
    ...(can("company_settings", "view") ? [{ value: "integrations", label: "Integrations" }] : []),
  ];
  const tab = tabs.some((t) => t.value === values.tab) ? values.tab : "account";

  return (
    <Page width="narrow">
      <PageHeader title="Settings" />
      <div className="mb-6 border-b border-line">
        <Segmented value={tab} onChange={(v) => set({ tab: v === "account" ? null : v })} options={tabs} />
      </div>
      {tab === "account" && <AccountSection />}
      {tab === "notifications" && <NotificationsSection />}
      {tab === "company" && <CompanySection />}
      {tab === "approvals" && <ApprovalSection />}
      {tab === "commission" && <CommissionSection />}
      {tab === "integrations" && <IntegrationsSection />}
    </Page>
  );
}

function AccountSection() {
  const user = useCurrentUser();
  if (!user) return null;
  return (
    <Panel title="Your account" description="Contact an administrator to change your name, role or password.">
      <DescriptionList
        items={[
          { label: "Name", value: user.full_name },
          { label: "Email", value: user.email },
          { label: "Phone", value: user.phone || "—" },
          { label: "Department", value: user.department ? DEPARTMENT_LABELS[user.department.name] ?? user.department.name : "—" },
          { label: "Role", value: user.roles.map((r) => r.name).join(", ") || (user.is_staff ? "Administrator" : "—") },
        ]}
      />
    </Panel>
  );
}

function NotificationsSection() {
  const q = useNotificationPreferences();
  const update = useUpdateNotificationPreference();
  return (
    <Panel title="Notifications" description="Choose which events send you a notification." flush>
      {q.isLoading ? (
        <div className="space-y-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <ul className="divide-y divide-line">
          {(q.data ?? []).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm text-ink">{p.event_type_display}</span>
              <Switch
                label={p.event_type_display}
                checked={p.enabled}
                onChange={(enabled) =>
                  update.mutate({ id: p.id, enabled }, { onError: (err) => toast.error("Couldn't save", getErrorMessage(err)) })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function CompanySection() {
  const q = useCompanyProfile();
  if (q.isLoading) return <Skeleton className="h-96" />;
  if (q.isError || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return <CompanyForm profile={q.data} />;
}

function CompanyForm({ profile }: { profile: CompanyProfile }) {
  const can = useCan();
  const update = useUpdateCompanyProfile();
  const uploadLogo = useUploadCompanyLogo();
  const fileRef = useRef<HTMLInputElement>(null);
  const editable = can("company_settings", "edit");
  const [f, setF] = useState({
    name: profile.name,
    registered_address: profile.registered_address,
    contact_email: profile.contact_email,
    contact_phone: profile.contact_phone,
    license_number: profile.license_number,
    default_currency: profile.default_currency,
    timezone: profile.timezone,
  });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync(f);
      toast.success("Company details saved");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    try {
      await uploadLogo.mutateAsync(file);
      toast.success("Logo updated");
    } catch (err) {
      toast.error("Couldn't upload the logo", getErrorMessage(err));
    }
  }

  const text = (k: keyof typeof f, label: string, opts: { type?: string; className?: string } = {}) => (
    <Field label={label} className={opts.className}>
      {(p) => <Input {...p} type={opts.type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
    </Field>
  );

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FormError message={error} />
      <Panel title="Company" description={profile.updated_at ? `Last updated ${formatRelative(profile.updated_at)}` : undefined}>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded border border-line bg-surface-sunken">
            <img src={profile.logo || "/brand-mark.png"} alt="" className="size-full object-contain p-1.5" />
          </div>
          {editable && (
            <>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
              <Button size="sm" icon={<Upload />} loading={uploadLogo.isPending} onClick={() => fileRef.current?.click()}>
                Replace logo
              </Button>
            </>
          )}
        </div>
        <fieldset disabled={!editable} className="grid gap-4 sm:grid-cols-2">
          {text("name", "Company name", { className: "sm:col-span-2" })}
          {text("registered_address", "Registered address", { className: "sm:col-span-2" })}
          {text("contact_email", "Contact email", { type: "email" })}
          {text("contact_phone", "Contact phone", { type: "tel" })}
          {text("license_number", "Licence number")}
          {text("default_currency", "Default currency")}
          {text("timezone", "Time zone")}
        </fieldset>
      </Panel>
      {editable && (
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={update.isPending}>
            Save company details
          </Button>
        </div>
      )}
    </form>
  );
}

function ApprovalSection() {
  const can = useCan();
  const q = useApprovalThreshold();
  const update = useUpdateApprovalThreshold();
  const [value, setValue] = useState<string | null>(null);
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (q.isError || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const current = value ?? String(Number(q.data.ceo_approval_min_price));

  async function save(e: FormEvent) {
    e.preventDefault();
    if (Number(current) < 0 || current === "") return;
    try {
      await update.mutateAsync(current);
      setValue(null);
      toast.success("Approval threshold saved");
    } catch (err) {
      toast.error("Couldn't save", getErrorMessage(err));
    }
  }

  return (
    <Panel
      title="CEO approval threshold"
      description="Listings priced at or above this amount need the CEO to verify them and approve them for marketing. Below it, listing managers can approve on their own."
    >
      <form onSubmit={save} className="flex items-end gap-2" noValidate>
        <Field label="Threshold (GH₵)" className="flex-1" hint={Number(current) === 0 ? "At 0, every listing needs CEO approval." : `Listings from ${formatMoney(current)} need CEO sign-off.`}>
          {(p) => <Input {...p} type="number" min="0" step="any" className="num" disabled={!can("company_settings", "edit")} value={current} onChange={(e) => setValue(e.target.value)} />}
        </Field>
        {can("company_settings", "edit") && (
          <Button type="submit" variant="primary" loading={update.isPending} disabled={value === null || Number(value) === Number(q.data.ceo_approval_min_price)} className="mb-5">
            Save
          </Button>
        )}
      </form>
    </Panel>
  );
}

function CommissionSection() {
  const can = useCan();
  const rules = useCommissionRules();
  const roles = useRoles();
  const [editing, setEditing] = useState<CommissionRule | "new" | null>(null);
  const editable = can("payment_commission", "edit");

  return (
    <Panel
      title="Commission split"
      description="The agent's share of each commission. The default rule applies when there's no rule for the agent's role."
      flush
      actions={
        editable && (
          <Button size="sm" onClick={() => setEditing("new")}>
            Add rule
          </Button>
        )
      }
    >
      {rules.isLoading ? (
        <Skeleton className="m-4 h-20" />
      ) : rules.isError ? (
        <ErrorState error={rules.error} onRetry={() => rules.refetch()} />
      ) : (rules.data ?? []).length === 0 ? (
        <p className="px-4 py-6 text-sm text-danger">No rules set. Deals can't reach the Commission stage until a default rule exists.</p>
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Applies to</TH>
              <TH align="right">Agent share</TH>
              <TH align="right">Company share</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <TBody>
            {(rules.data ?? []).map((r) => (
              <TR key={r.id} onClick={editable ? () => setEditing(r) : undefined}>
                <TD className="font-semibold">{r.role_name ?? "Default (all roles)"}</TD>
                <TD align="right">{Number(r.agent_split_percent)}%</TD>
                <TD align="right">{100 - Number(r.agent_split_percent)}%</TD>
                <TD>{r.active ? <Status tone="success">Active</Status> : <Status tone="muted">Off</Status>}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
      {editing && <RuleEditor rule={editing === "new" ? undefined : editing} roles={roles.data ?? []} onClose={() => setEditing(null)} />}
    </Panel>
  );
}

function RuleEditor({ rule, roles, onClose }: { rule?: CommissionRule; roles: { id: string; name: string }[]; onClose: () => void }) {
  const save = useSaveCommissionRule();
  const [role, setRole] = useState(rule?.role ?? "");
  const [split, setSplit] = useState(rule ? String(Number(rule.agent_split_percent)) : "50");
  const [active, setActive] = useState(rule?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(split);
    if (Number.isNaN(n) || n < 0 || n > 100) return setError("Enter a share between 0 and 100.");
    try {
      await save.mutateAsync({ id: rule?.id, input: { role: role || null, agent_split_percent: split, active } });
      toast.success("Commission rule saved");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border-t border-line bg-surface-sunken p-4" noValidate>
      <FormError message={error} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Role">
          {(p) => (
            <select
              {...p}
              disabled={!!rule}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 w-full rounded border border-line-strong bg-white px-3 text-sm disabled:bg-surface-sunken"
            >
              <option value="">Default (all roles)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Agent share (%)">{(p) => <Input {...p} type="number" min="0" max="100" step="0.5" className="num" value={split} onChange={(e) => setSplit(e.target.value)} />}</Field>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-muted">Active</p>
          <div className="flex h-9 items-center">
            <Switch label="Active" checked={active} onChange={setActive} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" variant="primary" loading={save.isPending}>
          Save rule
        </Button>
      </div>
    </form>
  );
}

function IntegrationsSection() {
  const q = useIntegrations();
  return (
    <Panel title="Integrations" description="Connection status for payment, storage, email and SMS providers. Credentials are managed in the server environment." flush>
      {q.isLoading ? (
        <Skeleton className="m-4 h-24" />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (q.data ?? []).length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-subtle">No integrations have been set up.</p>
      ) : (
        <ul className="divide-y divide-line">
          {(q.data ?? []).map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{i.provider_display}</p>
                <p className="text-xs text-ink-subtle">{i.last_checked_at ? `Checked ${formatDateTime(i.last_checked_at)}` : "Never checked"}{i.notes && ` · ${i.notes}`}</p>
              </div>
              {!i.configured ? (
                <Status tone="muted">Not configured</Status>
              ) : i.last_check_ok === false ? (
                <Status tone="danger">Failing</Status>
              ) : (
                <Status tone="success">Configured</Status>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
