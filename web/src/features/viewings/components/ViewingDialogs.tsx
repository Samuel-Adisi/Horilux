import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { ClientPicker, PropertyPicker, UserPicker } from "@/components/domain/pickers";
import { useCan } from "@/features/accounts/permissions";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { formatDate, formatTime, todayISO } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { OUTCOME_LABEL, useCancelViewing, useCompleteViewing, useCreateViewing, type Viewing, type ViewingOutcome } from "../api";

/** Bookable listings: anything live or about to be. */
const BOOKABLE = ["marketing_ready", "published", "under_offer", "verified"];

export function BookViewingDialog({ onClose, clientId }: { onClose: () => void; clientId?: string }) {
  const can = useCan();
  const create = useCreateViewing();
  const [f, setF] = useState({ client: clientId ?? "", property: "", agent: "", date: todayISO(), time: "10:00", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.client) errs.client = "Choose the client.";
    if (!f.property) errs.property = "Choose the property.";
    if (!f.date) errs.date = "Pick a date.";
    else if (f.date < todayISO()) errs.date = "Viewings can't be booked in the past.";
    if (!f.time) errs.time = "Pick a time.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await create.mutateAsync({ client: f.client, property: f.property, agent: f.agent || undefined, date: f.date, time: f.time, notes: f.notes.trim() });
      toast.success("Viewing booked", `${formatDate(f.date)} at ${f.time}`);
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err, "Couldn't book the viewing."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Book a viewing"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="book-viewing" variant="primary" loading={create.isPending}>
            Book viewing
          </Button>
        </>
      }
    >
      <form id="book-viewing" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Client" error={errors.client}>
          {(p) => <ClientPicker {...p} invalid={!!errors.client} value={f.client} onChange={(v) => setF({ ...f, client: v })} />}
        </Field>
        <Field label="Property" error={errors.property} hint="Only verified and live listings can be viewed.">
          {(p) => <PropertyPicker {...p} invalid={!!errors.property} statuses={BOOKABLE} value={f.property} onChange={(v) => setF({ ...f, property: v })} />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" error={errors.date}>
            {(p) => <Input {...p} type="date" min={todayISO()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />}
          </Field>
          <Field label="Time" error={errors.time}>
            {(p) => <Input {...p} type="time" step={900} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />}
          </Field>
        </div>
        {can("viewing", "edit") && (
          <Field label="Agent" optional hint="Leave blank to take it yourself.">
            {(p) => <UserPicker {...p} value={f.agent} onChange={(v) => setF({ ...f, agent: v })} departments={["sales"]} clearable />}
          </Field>
        )}
        <Field label="Notes" optional>
          {(p) => <Textarea {...p} rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Access instructions, who's meeting them…" />}
        </Field>
      </form>
    </Dialog>
  );
}

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CompleteViewingDialog({ viewing, onClose }: { viewing: Viewing; onClose: () => void }) {
  const complete = useCompleteViewing();
  const [outcome, setOutcome] = useState<ViewingOutcome | "">("");
  const [nextAction, setNextAction] = useState("");
  const [followUp, setFollowUp] = useState(addDays(2));
  const [error, setError] = useState<string | null>(null);
  const followUpRequired = outcome === "warm" || outcome === "cold";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!outcome) {
      setError("How did it go? Choose an outcome.");
      return;
    }
    if (followUpRequired && !followUp) {
      setError("Warm and cold outcomes need a follow-up date.");
      return;
    }
    try {
      await complete.mutateAsync({
        id: viewing.id,
        payload: { outcome, next_action: nextAction.trim() || undefined, follow_up_due_date: followUp || undefined },
      });
      toast.success("Viewing completed", followUp ? `Follow-up set for ${formatDate(followUp)}.` : undefined);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't record the outcome."));
    }
  }

  const hints: Record<ViewingOutcome, string> = {
    hot: "Ready to make an offer",
    warm: "Interested, needs time or options",
    cold: "Not a fit",
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Record viewing outcome"
      description={`${viewing.client_name} at ${viewing.property_title}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="complete-viewing" variant="primary" loading={complete.isPending}>
            Complete viewing
          </Button>
        </>
      }
    >
      <form id="complete-viewing" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-ink-muted">Outcome</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {(["hot", "warm", "cold"] as ViewingOutcome[]).map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={outcome === o}
                onClick={() => setOutcome(o)}
                className={cn(
                  "rounded border px-3 py-2.5 text-left transition-colors",
                  outcome === o ? "border-brand bg-brand-50" : "border-line-strong hover:border-ink-faint",
                )}
              >
                <span className="block text-sm font-bold text-ink">{OUTCOME_LABEL[o]}</span>
                <span className="block text-xs text-ink-subtle">{hints[o]}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Next step" optional>
          {(p) => <Input {...p} value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Send the payment plan, show the Airport listing…" />}
        </Field>
        <Field label="Follow up on" optional={!followUpRequired} hint={followUpRequired ? "Required for warm and cold outcomes." : "A follow-up task will be created for the agent."}>
          {(p) => <Input {...p} type="date" min={todayISO()} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />}
        </Field>
      </form>
    </Dialog>
  );
}

export function CancelViewingDialog({ viewing, noShow, onClose }: { viewing: Viewing; noShow: boolean; onClose: () => void }) {
  const cancel = useCancelViewing();
  const [reason, setReason] = useState("");

  async function submit() {
    try {
      await cancel.mutateAsync({ id: viewing.id, payload: { reason: reason.trim() || undefined, no_show: noShow } });
      toast.success(noShow ? "Marked as no-show" : "Viewing cancelled");
      onClose();
    } catch (err) {
      toast.error("Couldn't update the viewing", getErrorMessage(err));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="sm"
      title={noShow ? "Client didn't show up?" : "Cancel this viewing?"}
      description={`${viewing.client_name}, ${formatDate(viewing.date)} at ${formatTime(viewing.time)}`}
      footer={
        <>
          <Button onClick={onClose}>Keep it</Button>
          <Button variant="danger" onClick={submit} loading={cancel.isPending}>
            {noShow ? "Mark no-show" : "Cancel viewing"}
          </Button>
        </>
      }
    >
      <Field label="Reason" optional>
        {(p) => <Textarea {...p} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />}
      </Field>
    </Dialog>
  );
}
