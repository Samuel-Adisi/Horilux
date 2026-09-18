import { Status, Tag, type Tone } from "@/components/ui/display";
import { PROPERTY_STATUS_LABEL, type PropertyStatus } from "@/features/properties/api";
import { LEAD_STATUS_LABEL, type LeadStatus } from "@/features/crm/api";
import { VIEWING_STATUS_LABEL, OUTCOME_LABEL, type ViewingOutcome, type ViewingStatus } from "@/features/viewings/api";
import { TRANSACTION_STATUS_LABEL, type TransactionStatus } from "@/features/transactions/api";
import { CAMPAIGN_STATUS_LABEL, type CampaignStatus } from "@/features/campaigns/api";
import { TASK_STATUS_LABEL, type TaskStatus } from "@/features/tasks/api";
import { humanize } from "@/lib/format";

const PROPERTY_TONE: Record<PropertyStatus, Tone> = {
  draft: "muted",
  onboarding: "neutral",
  pending_verification: "warning",
  verified: "brand",
  pending_approval: "warning",
  marketing_ready: "brand",
  published: "success",
  under_offer: "warning",
  sold_rented: "success",
  archived: "muted",
};

const LEAD_TONE: Record<LeadStatus, Tone> = {
  new: "brand",
  contacted: "neutral",
  qualified: "neutral",
  property_matched: "neutral",
  viewing: "warning",
  negotiation: "warning",
  closed: "success",
  lost: "muted",
};

const VIEWING_TONE: Record<ViewingStatus, Tone> = {
  scheduled: "neutral",
  confirmed: "brand",
  completed: "success",
  cancelled: "muted",
  no_show: "danger",
};

const TRANSACTION_TONE: Record<TransactionStatus, Tone> = {
  offer: "neutral",
  negotiation: "neutral",
  agreement: "brand",
  documentation: "brand",
  payment: "warning",
  closing: "warning",
  commission: "warning",
  closed: "success",
};

const CAMPAIGN_TONE: Record<CampaignStatus, Tone> = {
  draft: "muted",
  in_review: "warning",
  scheduled: "brand",
  published: "success",
};

const TASK_TONE: Record<TaskStatus, Tone> = { open: "neutral", in_progress: "brand", done: "success" };

export function PropertyStatus({ status }: { status: string }) {
  const s = status as PropertyStatus;
  return <Status tone={PROPERTY_TONE[s] ?? "neutral"}>{PROPERTY_STATUS_LABEL[s] ?? humanize(status)}</Status>;
}

export function LeadStatus({ status }: { status: string }) {
  const s = status as LeadStatus;
  return <Status tone={LEAD_TONE[s] ?? "neutral"}>{LEAD_STATUS_LABEL[s] ?? humanize(status)}</Status>;
}

export function ViewingStatus({ status }: { status: string }) {
  const s = status as ViewingStatus;
  return <Status tone={VIEWING_TONE[s] ?? "neutral"}>{VIEWING_STATUS_LABEL[s] ?? humanize(status)}</Status>;
}

export function TransactionStatus({ status }: { status: string }) {
  const s = status as TransactionStatus;
  return <Status tone={TRANSACTION_TONE[s] ?? "neutral"}>{TRANSACTION_STATUS_LABEL[s] ?? humanize(status)}</Status>;
}

export function CampaignStatus({ status }: { status: string }) {
  const s = status as CampaignStatus;
  return <Status tone={CAMPAIGN_TONE[s] ?? "neutral"}>{CAMPAIGN_STATUS_LABEL[s] ?? humanize(status)}</Status>;
}

export function TaskStatus({ status }: { status: string }) {
  const s = status as TaskStatus;
  return <Status tone={TASK_TONE[s] ?? "neutral"}>{TASK_STATUS_LABEL[s] ?? humanize(status)}</Status>;
}

export function OutcomeTag({ outcome }: { outcome: string | null }) {
  if (!outcome) return <span className="text-ink-faint">—</span>;
  const tone: Tone = outcome === "hot" ? "danger" : outcome === "warm" ? "warning" : "muted";
  return <Tag tone={tone}>{OUTCOME_LABEL[outcome as ViewingOutcome] ?? humanize(outcome)}</Tag>;
}
