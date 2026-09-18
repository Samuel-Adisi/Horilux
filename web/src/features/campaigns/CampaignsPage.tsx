import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import { Page, PageHeader, Segmented } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { DescriptionList, EmptyState, ErrorState, Panel, Tag } from "@/components/ui/display";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { Dialog, Drawer } from "@/components/ui/overlay";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { CampaignStatus } from "@/components/domain/status";
import { PropertyPicker } from "@/components/domain/pickers";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { toast } from "@/lib/toast";
import { PAGE_SIZE } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_STATUS_LABEL,
  CHANNELS,
  useCampaignAction,
  useCampaigns,
  useCreateCampaign,
  useRecordPerformance,
  useUpdateCampaign,
  type Campaign,
  type CampaignStatus as CS,
} from "./api";

function totals(c: Campaign) {
  return c.performance_records.reduce(
    (acc, r) => ({
      views: acc.views + r.views,
      enquiries: acc.enquiries + r.enquiries,
      leads: acc.leads + r.leads_generated,
      viewings: acc.viewings + r.viewings_booked,
      conversions: acc.conversions + r.conversions,
    }),
    { views: 0, enquiries: 0, leads: 0, viewings: 0, conversions: 0 },
  );
}

export function CampaignsPage() {
  useDocumentTitle("Campaigns");
  const can = useCan();
  const { values, page, set } = useUrlState(["status"] as const);
  const q = useCampaigns({ page, status: values.status });
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = q.data?.results ?? [];
  const open = rows.find((c) => c.id === openId) ?? null;

  return (
    <Page>
      <PageHeader
        title="Campaigns"
        count={q.data ? `${q.data.count.toLocaleString()} campaigns` : undefined}
        description="Marketing for listings approved for marketing, from draft to published."
        actions={
          can("marketing_campaign", "create") && (
            <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>
              New campaign
            </Button>
          )
        }
      />
      <Panel flush>
        <div className="border-b border-line px-4 py-3">
          <Segmented
            value={values.status}
            onChange={(v) => set({ status: v })}
            options={[{ value: "", label: "All" }, ...(Object.keys(CAMPAIGN_STATUS_LABEL) as CS[]).map((s) => ({ value: s, label: CAMPAIGN_STATUS_LABEL[s] }))]}
          />
        </div>
        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Megaphone />}
            title="No campaigns"
            description={can("marketing_campaign", "create") ? "Create one for any listing approved for marketing." : undefined}
          />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>Campaign</TH>
                  <TH>Status</TH>
                  <TH className="hidden md:table-cell">Channels</TH>
                  <TH className="hidden lg:table-cell">Goes out</TH>
                  <TH align="right">Views</TH>
                  <TH align="right" className="hidden sm:table-cell">
                    Leads
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((c) => {
                  const t = totals(c);
                  return (
                    <TR key={c.id} onClick={() => setOpenId(c.id)}>
                      <TD>
                        <p className="max-w-[20rem] truncate font-semibold">{c.content.headline || "Untitled campaign"}</p>
                        <p className="max-w-[20rem] truncate text-xs text-ink-subtle">{c.property_title ?? "—"}</p>
                      </TD>
                      <TD>
                        <CampaignStatus status={c.status} />
                      </TD>
                      <TD className="hidden md:table-cell">
                        <div className="flex max-w-[14rem] flex-wrap gap-1">
                          {(c.content.channels ?? []).slice(0, 3).map((ch) => (
                            <Tag key={ch}>{ch}</Tag>
                          ))}
                          {(c.content.channels?.length ?? 0) > 3 && <Tag>+{(c.content.channels?.length ?? 0) - 3}</Tag>}
                          {!c.content.channels?.length && <span className="text-ink-faint">—</span>}
                        </div>
                      </TD>
                      <TD className="hidden text-ink-muted lg:table-cell">
                        {c.published_date ? formatDate(c.published_date) : c.scheduled_date ? formatDate(c.scheduled_date) : "—"}
                      </TD>
                      <TD align="right">{c.performance_records.length ? formatNumber(t.views) : "—"}</TD>
                      <TD align="right" className="hidden sm:table-cell">
                        {c.performance_records.length ? formatNumber(t.leads) : "—"}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>

      {creating && <CampaignFormDialog onClose={() => setCreating(false)} onCreated={(c) => setOpenId(c.id)} />}
      {open && <CampaignDrawer campaign={open} onClose={() => setOpenId(null)} />}
    </Page>
  );
}

function ChannelPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CHANNELS.map((ch) => {
        const on = value.includes(ch);
        return (
          <button
            key={ch}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== ch) : [...value, ch])}
            className={cn(
              "rounded-sm border px-2.5 py-1 text-xs font-semibold transition-colors",
              on ? "border-brand bg-brand-50 text-brand-fg" : "border-line-strong text-ink-muted hover:border-ink-faint",
            )}
          >
            {ch}
          </button>
        );
      })}
    </div>
  );
}

function CampaignFormDialog({ campaign, onClose, onCreated }: { campaign?: Campaign; onClose: () => void; onCreated?: (c: Campaign) => void }) {
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const [property, setProperty] = useState(campaign?.property ?? "");
  const [headline, setHeadline] = useState(campaign?.content.headline ?? "");
  const [body, setBody] = useState(campaign?.content.body ?? "");
  const [channels, setChannels] = useState<string[]>(campaign?.content.channels ?? []);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!property) return setError("Choose the listing this campaign promotes.");
    if (!headline.trim()) return setError("Give the campaign a headline.");
    const content = { ...(campaign?.content ?? {}), headline: headline.trim(), body: body.trim(), channels };
    try {
      if (campaign) {
        await update.mutateAsync({ id: campaign.id, input: { content } });
        toast.success("Campaign updated");
      } else {
        const c = await create.mutateAsync({ property, content });
        toast.success("Campaign drafted", "Submit it for review when it's ready.");
        onCreated?.(c);
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the campaign."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={campaign ? "Edit campaign" : "New campaign"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="campaign-form" variant="primary" loading={create.isPending || update.isPending}>
            {campaign ? "Save" : "Create draft"}
          </Button>
        </>
      }
    >
      <form id="campaign-form" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        {!campaign && (
          <Field label="Listing" hint="Only listings approved for marketing or already published.">
            {(p) => <PropertyPicker {...p} statuses={["marketing_ready", "published"]} value={property} onChange={setProperty} />}
          </Field>
        )}
        <Field label="Headline">{(p) => <Input {...p} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Move-in ready 4-bed in East Legon" maxLength={120} />}</Field>
        <Field label="Copy" optional>
          {(p) => <Textarea {...p} rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="The post or ad text" />}
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-ink-muted">Channels</legend>
          <ChannelPicker value={channels} onChange={setChannels} />
        </fieldset>
      </form>
    </Dialog>
  );
}

function CampaignDrawer({ campaign: c, onClose }: { campaign: Campaign; onClose: () => void }) {
  const can = useCan();
  const action = useCampaignAction();
  const [editing, setEditing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [recording, setRecording] = useState(false);
  const canEdit = can("marketing_campaign", "edit");
  const canPublish = can("marketing_campaign", "publish");
  const t = totals(c);
  const scheduledInFuture = c.scheduled_date && new Date(c.scheduled_date) > new Date();

  async function run(a: "submit_for_review" | "publish", label: string) {
    try {
      await action.mutateAsync({ id: c.id, action: a });
      toast.success(label);
    } catch (err) {
      toast.error(`Couldn't ${label.toLowerCase()}`, getErrorMessage(err));
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      width="lg"
      title={c.content.headline || "Untitled campaign"}
      subtitle={
        <span className="flex items-center gap-3">
          <CampaignStatus status={c.status} />
          <Link to={`/properties/${c.property}`} className="truncate hover:text-brand-fg">
            {c.property_title}
          </Link>
        </span>
      }
      footer={
        <>
          {canEdit && c.status === "draft" && <Button onClick={() => setEditing(true)}>Edit</Button>}
          {canEdit && c.status === "draft" && (
            <Button variant="primary" loading={action.isPending} onClick={() => run("submit_for_review", "Submitted for review")}>
              Submit for review
            </Button>
          )}
          {canEdit && c.status === "in_review" && <Button onClick={() => setScheduling(true)}>Schedule</Button>}
          {canPublish && (c.status === "in_review" || c.status === "scheduled") && (
            <Button
              variant="success"
              loading={action.isPending}
              disabled={!!scheduledInFuture}
              title={scheduledInFuture ? "Scheduled campaigns publish on their date" : undefined}
              onClick={() => run("publish", "Campaign published")}
            >
              Publish now
            </Button>
          )}
          {canEdit && c.status === "published" && (
            <Button variant="primary" icon={<Plus />} onClick={() => setRecording(true)}>
              Record results
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <DescriptionList
          items={[
            { label: "Created by", value: c.created_by_name ?? "—" },
            { label: "Created", value: formatDate(c.created_at) },
            { label: "Scheduled for", value: c.scheduled_date ? formatDateTime(c.scheduled_date) : "—" },
            { label: "Published", value: c.published_date ? formatDateTime(c.published_date) : "—" },
          ]}
        />
        {(c.content.channels?.length ?? 0) > 0 && (
          <div>
            <p className="mb-1.5 text-xs text-ink-subtle">Channels</p>
            <div className="flex flex-wrap gap-1.5">
              {c.content.channels!.map((ch) => (
                <Tag key={ch}>{ch}</Tag>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="mb-1.5 text-xs text-ink-subtle">Copy</p>
          {c.content.body ? <p className="whitespace-pre-line rounded bg-surface-sunken p-3 text-sm text-ink">{c.content.body}</p> : <p className="text-sm text-ink-subtle">No copy written yet.</p>}
        </div>
        <div>
          <p className="mb-2 text-xs text-ink-subtle">Results {c.performance_records.length > 0 && `(${c.performance_records.length} reports)`}</p>
          {c.performance_records.length === 0 ? (
            <p className="text-sm text-ink-subtle">{c.status === "published" ? "Record views, enquiries and leads as they come in." : "Results can be recorded once the campaign is published."}</p>
          ) : (
            <dl className="grid grid-cols-5 divide-x divide-line rounded border border-line text-center">
              {[
                ["Views", t.views],
                ["Enquiries", t.enquiries],
                ["Leads", t.leads],
                ["Viewings", t.viewings],
                ["Deals", t.conversions],
              ].map(([label, v]) => (
                <div key={label as string} className="px-2 py-2.5">
                  <dt className="text-2xs text-ink-subtle">{label}</dt>
                  <dd className="num text-base font-bold text-ink">{formatNumber(v as number)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      {editing && <CampaignFormDialog campaign={c} onClose={() => setEditing(false)} />}
      {scheduling && <ScheduleDialog campaign={c} onClose={() => setScheduling(false)} />}
      {recording && <PerformanceDialog campaign={c} onClose={() => setRecording(false)} />}
    </Drawer>
  );
}

function ScheduleDialog({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const action = useCampaignAction();
  const [when, setWhen] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!when || new Date(when) <= new Date()) return setError("Pick a time in the future.");
    try {
      await action.mutateAsync({ id: campaign.id, action: "schedule", body: { scheduled_date: new Date(when).toISOString() } });
      toast.success("Campaign scheduled", formatDateTime(when));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="sm"
      title="Schedule campaign"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={action.isPending}>
            Schedule
          </Button>
        </>
      }
    >
      <FormError message={error} />
      <Field label="Go live at" className="mt-3">
        {(p) => <Input {...p} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />}
      </Field>
    </Dialog>
  );
}

function PerformanceDialog({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const record = useRecordPerformance();
  const [f, setF] = useState({ views: "", enquiries: "", leads_generated: "", viewings_booked: "", conversions: "" });
  const [error, setError] = useState<string | null>(null);
  const fields: [keyof typeof f, string][] = [
    ["views", "Views"],
    ["enquiries", "Enquiries"],
    ["leads_generated", "Leads"],
    ["viewings_booked", "Viewings booked"],
    ["conversions", "Deals closed"],
  ];

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = (v: string) => Math.max(0, Math.round(Number(v) || 0));
    try {
      await record.mutateAsync({
        campaign: campaign.id,
        views: n(f.views),
        enquiries: n(f.enquiries),
        leads_generated: n(f.leads_generated),
        viewings_booked: n(f.viewings_booked),
        conversions: n(f.conversions),
      });
      toast.success("Results recorded");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Record results"
      description="Numbers since the last report. They're added to the campaign totals."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="perf-form" variant="primary" loading={record.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="perf-form" onSubmit={submit} className="grid grid-cols-2 gap-4" noValidate>
        <div className="col-span-2">
          <FormError message={error} />
        </div>
        {fields.map(([k, label]) => (
          <Field key={k} label={label}>
            {(p) => <Input {...p} type="number" min="0" inputMode="numeric" className="num" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </Field>
        ))}
      </form>
    </Dialog>
  );
}
