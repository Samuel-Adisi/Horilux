import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Archive, Check, Mail, MapPin, MoreHorizontal, Pencil, Phone, Trash2 } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { DescriptionList, ErrorState, Panel, Skeleton, Tag } from "@/components/ui/display";
import { ConfirmDialog, Menu, MenuItem } from "@/components/ui/overlay";
import { PropertyStatus } from "@/components/domain/status";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney, formatNumber, formatRelative } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { PROPERTY_STATUS_LABEL, useDeleteProperty, useProperty, usePropertyAction, type PropertyAction, type PropertyDetail, type PropertyStatus as PStatus } from "../api";
import { ChecklistPanel } from "../components/ChecklistPanel";
import { MediaGallery } from "../components/MediaGallery";
import { DocumentsPanel } from "../components/DocumentsPanel";

const STEPS: { key: string; label: string; statuses: PStatus[] }[] = [
  { key: "draft", label: "Draft", statuses: ["draft", "onboarding"] },
  { key: "verify", label: "Verification", statuses: ["pending_verification"] },
  { key: "verified", label: "Verified", statuses: ["verified", "pending_approval"] },
  { key: "ready", label: "Marketing ready", statuses: ["marketing_ready"] },
  { key: "live", label: "Published", statuses: ["published", "under_offer"] },
  { key: "done", label: "Sold / rented", statuses: ["sold_rented"] },
];

function WorkflowSteps({ status }: { status: PStatus }) {
  if (status === "archived") {
    return <p className="rounded border border-line bg-surface-sunken px-4 py-2.5 text-sm text-ink-muted">This listing is archived and hidden from the active pipeline.</p>;
  }
  const current = STEPS.findIndex((s) => s.statuses.includes(status));
  return (
    <ol className="scrollbar-thin flex overflow-x-auto rounded border border-line bg-surface">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={s.key}
            className={cn(
              "relative flex min-w-[120px] flex-1 items-center gap-2 border-r border-line px-3.5 py-2.5 last:border-r-0",
              active && "bg-brand-50",
            )}
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                done && "bg-brand text-white",
                active && "border-2 border-brand text-brand-fg",
                !done && !active && "border border-line-strong text-ink-faint",
              )}
            >
              {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("truncate text-xs font-semibold", active ? "text-brand-fg" : done ? "text-ink" : "text-ink-subtle")}>
              {status === "under_offer" && s.key === "live" ? "Under offer" : s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

interface NextStep {
  action: PropertyAction;
  label: string;
  confirm: string;
  disabled?: string;
  variant?: "primary" | "success";
}

function nextSteps(p: PropertyDetail, can: ReturnType<typeof useCan>): NextStep[] {
  const steps: NextStep[] = [];
  const photos = p.media.filter((m) => m.media_type === "photo").length;
  switch (p.status) {
    case "draft":
    case "onboarding":
      if (can("property", "edit"))
        steps.push({
          action: "submit_for_verification",
          label: "Submit for verification",
          confirm: "The verification team will be notified to check the owner, price, documents and photos.",
          disabled: photos === 0 ? "Add at least one photo before submitting." : undefined,
          variant: "primary",
        });
      break;
    case "pending_verification":
      if (can("property", "approve"))
        steps.push({
          action: "approve",
          label: "Mark as verified",
          confirm: "Confirms every checklist item has been checked. Listings at or above the CEO approval threshold need CEO sign-off.",
          disabled: p.verification?.is_complete ? undefined : "Complete the verification checklist first.",
          variant: "primary",
        });
      break;
    case "verified":
    case "pending_approval":
      if (can("property", "approve"))
        steps.push({
          action: "mark_marketing_ready",
          label: "Approve for marketing",
          confirm: "The marketing team will be able to build campaigns for this listing.",
          variant: "primary",
        });
      break;
    case "marketing_ready":
      if (can("property", "publish"))
        steps.push({ action: "publish", label: "Publish listing", confirm: "The listing goes live and the agent is notified.", variant: "success" });
      break;
    case "published":
      if (can("property", "edit")) {
        steps.push({ action: "mark_under_offer", label: "Mark under offer", confirm: "Use this once an offer has been accepted in principle." });
        steps.push({
          action: "mark_sold",
          label: p.listing_type === "rent" ? "Mark rented" : "Mark sold",
          confirm: "Closes the listing as completed.",
          variant: "success",
        });
      }
      break;
    case "under_offer":
      if (can("property", "edit"))
        steps.push({
          action: "mark_sold",
          label: p.listing_type === "rent" ? "Mark rented" : "Mark sold",
          confirm: "Closes the listing as completed.",
          variant: "success",
        });
      break;
  }
  return steps;
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const q = useProperty(id);
  useDocumentTitle(q.data?.title ?? "Property");

  if (q.isLoading) {
    return (
      <Page>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-6 h-8 w-80" />
        <Skeleton className="mb-6 h-11" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[420px] lg:col-span-2" />
          <Skeleton className="h-[420px]" />
        </div>
      </Page>
    );
  }
  if (q.isError || !q.data) {
    return (
      <Page>
        <ErrorState error={q.error} onRetry={() => q.refetch()} title="Couldn't load this property" />
      </Page>
    );
  }
  return <PropertyView property={q.data} />;
}

function PropertyView({ property: p }: { property: PropertyDetail }) {
  const navigate = useNavigate();
  const can = useCan();
  const action = usePropertyAction(p.id);
  const del = useDeleteProperty();
  const [pending, setPending] = useState<NextStep | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const steps = nextSteps(p, can);
  const canEdit = can("property", "edit") && p.status !== "archived";

  async function run(step: { action: PropertyAction; label: string }) {
    try {
      const updated = await action.mutateAsync(step.action);
      toast.success(step.label, `Status is now ${(PROPERTY_STATUS_LABEL[updated.status] ?? updated.status_label).toLowerCase()}.`);
    } catch (err) {
      toast.error(`Couldn't ${step.label.toLowerCase()}`, getErrorMessage(err));
    } finally {
      setPending(null);
      setConfirmArchive(false);
    }
  }

  async function remove() {
    try {
      const result = await del.mutateAsync(p.id);
      if (result?.archived) {
        toast.success("Property archived", result.detail ?? "This property has linked transactions, so it was archived instead of deleted.");
        setConfirmDelete(false);
      } else {
        toast.success("Property deleted");
        navigate("/properties", { replace: true });
      }
    } catch (err) {
      toast.error("Couldn't delete", getErrorMessage(err));
      setConfirmDelete(false);
    }
  }

  const facts = [
    { label: "Type", value: <span className="capitalize">{p.property_type}</span> },
    { label: "Listed for", value: p.listing_type === "rent" ? `Rent${p.rental_period ? ` (${p.rental_period})` : ""}` : "Sale" },
    { label: "Bedrooms", value: p.bedrooms ?? "—" },
    { label: "Bathrooms", value: p.bathrooms ?? "—" },
    { label: "Building", value: p.building_size ? `${formatNumber(p.building_size)} sq ft` : "—" },
    { label: "Land", value: p.land_size ? `${formatNumber(p.land_size)} sq ft` : "—" },
    { label: "Region", value: p.region || "—" },
    { label: "Address", value: p.address || "—" },
  ];

  return (
    <Page>
      <PageHeader
        back={{ to: "/properties", label: "Properties" }}
        title={p.title}
        meta={
          <>
            <PropertyStatus status={p.status} />
            <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
              <MapPin className="size-3.5" />
              {[p.location, p.region].filter(Boolean).join(", ")}
            </span>
            <span className="num text-sm font-bold text-ink">
              {formatMoney(p.price, p.currency)}
              {p.listing_type === "rent" && p.rental_period && <span className="font-medium text-ink-subtle"> / {p.rental_period.replace("ly", "")}</span>}
            </span>
          </>
        }
        actions={
          <>
            {steps.some((s) => s.disabled) && <span className="text-xs text-ink-subtle sm:max-w-[16rem] sm:text-right">{steps.find((s) => s.disabled)?.disabled}</span>}
            {steps.map((s) => (
              <Button key={s.action} variant={s.variant ?? "secondary"} onClick={() => setPending(s)} disabled={!!s.disabled}>
                {s.label}
              </Button>
            ))}
            {canEdit && (
              <ButtonLink to={`/properties/${p.id}/edit`} icon={<Pencil />}>
                Edit
              </ButtonLink>
            )}
            {(canEdit || can("property", "delete")) && (
              <Menu
                trigger={(t) => (
                  <Button {...t} size="icon" className="h-9 w-9" aria-label="More actions">
                    <MoreHorizontal />
                  </Button>
                )}
              >
                {(close) => (
                  <>
                    {canEdit && (
                      <MenuItem
                        icon={<Archive />}
                        onClick={() => {
                          close();
                          setConfirmArchive(true);
                        }}
                      >
                        Archive listing
                      </MenuItem>
                    )}
                    {can("property", "delete") && (
                      <MenuItem
                        icon={<Trash2 />}
                        tone="danger"
                        onClick={() => {
                          close();
                          setConfirmDelete(true);
                        }}
                      >
                        Delete permanently
                      </MenuItem>
                    )}
                  </>
                )}
              </Menu>
            )}
          </>
        }
      />

      <WorkflowSteps status={p.status} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MediaGallery property={p} canUpload={canEdit} canDelete={can("property", "delete")} />

          <Panel title="Details">
            <DescriptionList items={facts} columns={4} />
            {p.amenities.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-2 text-xs text-ink-subtle">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.amenities.map((a) => (
                    <Tag key={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</Tag>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-1.5 text-xs text-ink-subtle">Description</p>
              {p.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{p.description}</p>
              ) : (
                <p className="text-sm text-ink-subtle">No description yet.{canEdit && " Buyers read this first, so it's worth writing one."}</p>
              )}
            </div>
          </Panel>

          <DocumentsPanel property={p} canUpload={canEdit} />
        </div>

        <div className="space-y-6">
          <ChecklistPanel property={p} />

          <Panel title="Owner">
            <p className="text-sm font-semibold text-ink">{p.owner_detail.name}</p>
            <div className="mt-2 space-y-1.5 text-sm">
              {p.owner_detail.phone && (
                <a href={`tel:${p.owner_detail.phone}`} className="flex items-center gap-2 text-ink-muted hover:text-brand-fg">
                  <Phone className="size-3.5" />
                  {p.owner_detail.phone}
                </a>
              )}
              {p.owner_detail.email && (
                <a href={`mailto:${p.owner_detail.email}`} className="flex items-center gap-2 break-all text-ink-muted hover:text-brand-fg">
                  <Mail className="size-3.5 shrink-0" />
                  {p.owner_detail.email}
                </a>
              )}
            </div>
          </Panel>

          <Panel title="Record">
            <DescriptionList
              columns={2}
              items={[
                { label: "Agent", value: p.agent_name ?? "—" },
                { label: "Completion", value: `${p.completion_percent}%` },
                { label: "Created", value: formatDate(p.created_at) },
                { label: "Last updated", value: formatRelative(p.updated_at) },
                ...(p.published_at ? [{ label: "Published", value: formatDate(p.published_at) }] : []),
                ...(p.views_count != null ? [{ label: "Views", value: formatNumber(p.views_count) }] : []),
                ...(p.inquiries_count != null ? [{ label: "Enquiries", value: formatNumber(p.inquiries_count) }] : []),
              ]}
            />
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && run(pending)}
        title={pending?.label ?? ""}
        description={pending?.confirm}
        confirmLabel={pending?.label}
        loading={action.isPending}
      />
      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={() => run({ action: "archive", label: "Archive listing" })}
        title="Archive this listing?"
        description="It leaves the active pipeline. The record, photos and history are kept."
        confirmLabel="Archive"
        loading={action.isPending}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Delete this property?"
        description="This removes the listing, its photos and documents for good. Listings tied to transactions will be archived instead of deleted."
        confirmLabel="Delete"
        tone="danger"
        loading={del.isPending}
      />
    </Page>
  );
}
