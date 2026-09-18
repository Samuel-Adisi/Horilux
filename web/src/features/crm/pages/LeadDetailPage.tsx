import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Mail, MoreHorizontal, Pencil, Phone, RotateCcw, UserPlus, UserRoundCheck, XCircle } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { DescriptionList, ErrorState, Panel, Skeleton } from "@/components/ui/display";
import { Field } from "@/components/ui/form";
import { ConfirmDialog, Dialog, Menu, MenuItem } from "@/components/ui/overlay";
import { LeadStatus } from "@/components/domain/status";
import { UserPicker } from "@/components/domain/pickers";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatMoney, isPast } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  LEAD_NEXT,
  LEAD_OPEN,
  LEAD_PIPELINE,
  LEAD_STATUS_LABEL,
  useAssignLead,
  useClientForLead,
  useConvertLead,
  useLead,
  useTransitionLead,
  type Lead,
  type LeadStatus as LS,
} from "../api";
import { LeadFormDialog } from "../components/LeadFormDialog";
import { ActivityTimeline } from "../components/ActivityTimeline";

const NEXT_LABEL: Partial<Record<LS, string>> = {
  new: "Mark contacted",
  contacted: "Qualify",
  qualified: "Property matched",
  property_matched: "Viewing booked",
  viewing: "Move to negotiation",
  negotiation: "Close as won",
};

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const q = useLead(id);
  useDocumentTitle(q.data?.name ?? "Lead");
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
        <ErrorState error={q.error} onRetry={() => q.refetch()} title="Couldn't load this lead" />
      </Page>
    );
  return <LeadView lead={q.data} />;
}

function Pipeline({ status }: { status: LS }) {
  const idx = LEAD_PIPELINE.indexOf(status);
  return (
    <div className="flex gap-1" aria-label={`Stage: ${LEAD_STATUS_LABEL[status]}`}>
      {LEAD_PIPELINE.map((s, i) => (
        <div key={s} className="min-w-0 flex-1">
          <div
            className={cn(
              "h-1.5 rounded-full",
              status === "lost" ? "bg-line" : i <= idx ? (status === "closed" ? "bg-forest" : "bg-brand") : "bg-line",
            )}
          />
          <p className={cn("mt-1.5 hidden truncate text-2xs font-semibold md:block", i === idx ? "text-ink" : "text-ink-faint")}>{LEAD_STATUS_LABEL[s]}</p>
        </div>
      ))}
    </div>
  );
}

function LeadView({ lead }: { lead: Lead }) {
  const navigate = useNavigate();
  const can = useCan();
  const transition = useTransitionLead(lead.id);
  const convert = useConvertLead();
  const assign = useAssignLead();
  const client = useClientForLead(lead.id, lead.name);
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignee, setAssignee] = useState(lead.assigned_agent ?? "");
  const [confirmLost, setConfirmLost] = useState(false);

  const canEdit = can("lead", "edit");
  const next = LEAD_NEXT[lead.status];
  const isOpen = LEAD_OPEN.includes(lead.status);
  const canConvert = canEdit && (lead.status === "qualified" || lead.status === "property_matched" || lead.status === "viewing" || lead.status === "negotiation") && !client.data;

  async function move(to: LS) {
    try {
      await transition.mutateAsync(to);
      toast.success(`Moved to ${LEAD_STATUS_LABEL[to]}`);
    } catch (err) {
      toast.error("Couldn't update the lead", getErrorMessage(err));
    } finally {
      setConfirmLost(false);
    }
  }

  async function doConvert() {
    try {
      const c = await convert.mutateAsync(lead.id);
      toast.success("Client created", `${c.name} can now be booked for viewings.`);
      navigate(`/clients/${c.id}`);
    } catch (err) {
      toast.error("Couldn't convert the lead", getErrorMessage(err));
    }
  }

  async function doAssign() {
    if (!assignee) return;
    try {
      const l = await assign.mutateAsync({ id: lead.id, agentId: assignee });
      toast.success("Lead assigned", `Now with ${l.assigned_agent_name ?? "the selected agent"}.`);
      setAssigning(false);
    } catch (err) {
      toast.error("Couldn't assign the lead", getErrorMessage(err));
    }
  }

  const followUpOverdue = lead.next_follow_up && isPast(lead.next_follow_up) && isOpen;

  return (
    <Page>
      <PageHeader
        back={{ to: "/leads", label: "Leads" }}
        title={lead.name}
        meta={
          <>
            <LeadStatus status={lead.status} />
            {lead.source && <span className="text-sm text-ink-muted">via {lead.source}</span>}
            <span className="text-sm text-ink-subtle">Received {formatDate(lead.created_at)}</span>
          </>
        }
        actions={
          <>
            {canEdit && next && (
              <Button variant="primary" icon={<ArrowRight />} loading={transition.isPending} onClick={() => move(next)}>
                {NEXT_LABEL[lead.status]}
              </Button>
            )}
            {canConvert && (
              <Button icon={<UserRoundCheck />} loading={convert.isPending} onClick={doConvert}>
                Convert to client
              </Button>
            )}
            {can("lead", "assign") && (
              <Button icon={<UserPlus />} onClick={() => setAssigning(true)}>
                {lead.assigned_agent ? "Reassign" : "Assign"}
              </Button>
            )}
            {canEdit && (
              <Menu
                trigger={(t) => (
                  <Button {...t} size="icon" className="h-9 w-9" aria-label="More actions">
                    <MoreHorizontal />
                  </Button>
                )}
              >
                {(close) => (
                  <>
                    <MenuItem
                      icon={<Pencil />}
                      onClick={() => {
                        close();
                        setEditing(true);
                      }}
                    >
                      Edit details
                    </MenuItem>
                    {isOpen && (
                      <MenuItem
                        icon={<XCircle />}
                        tone="danger"
                        onClick={() => {
                          close();
                          setConfirmLost(true);
                        }}
                      >
                        Mark as lost
                      </MenuItem>
                    )}
                    {lead.status === "lost" && (
                      <MenuItem
                        icon={<RotateCcw />}
                        onClick={() => {
                          close();
                          move("contacted");
                        }}
                      >
                        Reopen lead
                      </MenuItem>
                    )}
                  </>
                )}
              </Menu>
            )}
          </>
        }
      />

      <Panel className="mb-6">
        {lead.status === "lost" ? <p className="text-sm text-ink-muted">This lead was marked lost. Reopen it if they get back in touch.</p> : <Pipeline status={lead.status} />}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline lead={lead.id} />
        </div>
        <div className="space-y-6">
          <Panel title="Contact">
            <div className="space-y-2 text-sm">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 font-semibold text-ink hover:text-brand">
                <Phone className="size-3.5 text-ink-subtle" />
                {lead.phone}
              </a>
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 break-all text-ink hover:text-brand">
                  <Mail className="size-3.5 shrink-0 text-ink-subtle" />
                  {lead.email}
                </a>
              )}
            </div>
            {client.data && (
              <Link to={`/clients/${client.data.id}`} className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                Open client record
                <ArrowRight className="size-3" />
              </Link>
            )}
          </Panel>

          <Panel title="Looking for">
            <DescriptionList
              items={[
                { label: "Purpose", value: lead.purpose === "buy" ? "Buy" : lead.purpose === "rent" ? "Rent" : "—" },
                { label: "Type", value: lead.property_type_preference ? <span className="capitalize">{lead.property_type_preference}</span> : "Any" },
                { label: "Bedrooms", value: lead.bedrooms_preference ?? "Any" },
                { label: "Budget", value: lead.budget ? formatMoney(lead.budget, lead.currency) : "—" },
                { label: "Areas", value: lead.location_preference || "—" },
              ]}
            />
          </Panel>

          <Panel title="Follow-up">
            <DescriptionList
              items={[
                { label: "Assigned to", value: lead.assigned_agent_name ?? <span className="text-kokoda-700">Unassigned</span> },
                {
                  label: "Next follow-up",
                  value: lead.next_follow_up ? (
                    <span className={cn(followUpOverdue && "text-danger")}>
                      {formatDate(lead.next_follow_up)}
                      {followUpOverdue && " (overdue)"}
                    </span>
                  ) : (
                    "Not set"
                  ),
                },
                { label: "Last contact", value: lead.last_contact ? formatDateTime(lead.last_contact) : "—" },
              ]}
            />
            {lead.notes && <p className="mt-4 whitespace-pre-line border-t border-line pt-3 text-sm text-ink-muted">{lead.notes}</p>}
          </Panel>
        </div>
      </div>

      <LeadFormDialog open={editing} onClose={() => setEditing(false)} lead={lead} />
      <ConfirmDialog
        open={confirmLost}
        onClose={() => setConfirmLost(false)}
        onConfirm={() => move("lost")}
        title="Mark this lead as lost?"
        description="It drops out of the active pipeline. You can reopen it later."
        confirmLabel="Mark lost"
        tone="danger"
        loading={transition.isPending}
      />
      <Dialog
        open={assigning}
        onClose={() => setAssigning(false)}
        title={lead.assigned_agent ? "Reassign lead" : "Assign lead"}
        description="The agent is notified and the lead moves to Contacted if it's new."
        size="sm"
        footer={
          <>
            <Button onClick={() => setAssigning(false)}>Cancel</Button>
            <Button variant="primary" onClick={doAssign} loading={assign.isPending} disabled={!assignee || assignee === lead.assigned_agent}>
              Assign
            </Button>
          </>
        }
      >
        <Field label="Sales agent">{(p) => <UserPicker {...p} value={assignee} onChange={setAssignee} departments={["sales"]} />}</Field>
      </Dialog>
    </Page>
  );
}
