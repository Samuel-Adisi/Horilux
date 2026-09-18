import { useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, Skeleton } from "@/components/ui/display";
import { Input, Select, Textarea } from "@/components/ui/form";
import { useCan } from "@/features/accounts/permissions";
import { getErrorMessage } from "@/lib/api-client";
import { formatDateTime, formatRelative } from "@/lib/format";
import { toast } from "@/lib/toast";
import { INTERACTION_TYPE_LABEL, useCreateInteraction, useInteractions, type InteractionType } from "../api";

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/** Calls, messages and meetings logged against a lead or client. */
export function ActivityTimeline({ lead, client }: { lead?: string; client?: string }) {
  const can = useCan();
  const q = useInteractions({ lead, client });
  const create = useCreateInteraction();
  const [type, setType] = useState<InteractionType>("call");
  const [direction, setDirection] = useState<"outbound" | "inbound">("outbound");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [when, setWhen] = useState(nowLocal);
  const items = q.data?.results ?? [];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    try {
      await create.mutateAsync({
        lead: lead ?? null,
        client: client ?? null,
        type,
        direction,
        summary: summary.trim(),
        notes: notes.trim(),
        occurred_at: new Date(when).toISOString(),
      });
      setSummary("");
      setNotes("");
      setWhen(nowLocal());
      toast.success("Activity logged");
    } catch (err) {
      toast.error("Couldn't log the activity", getErrorMessage(err));
    }
  }

  return (
    <Panel title="Activity" description="Every call, message and meeting, newest first." flush>
      {can("interaction", "create") && (
        <form onSubmit={submit} className="space-y-2.5 border-b border-line bg-surface-sunken p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.4fr]">
            <Select value={type} onChange={(e) => setType(e.target.value as InteractionType)} aria-label="Type" className="h-8">
              {Object.entries(INTERACTION_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <Select value={direction} onChange={(e) => setDirection(e.target.value as "outbound" | "inbound")} aria-label="Direction" className="h-8">
              <option value="outbound">We reached out</option>
              <option value="inbound">They contacted us</option>
            </Select>
            <Input type="datetime-local" value={when} max={nowLocal()} onChange={(e) => setWhen(e.target.value)} aria-label="When" className="col-span-2 h-8 sm:col-span-1" />
          </div>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What happened? e.g. Called to confirm Saturday viewing" maxLength={255} />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)" />
          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="primary" loading={create.isPending} disabled={!summary.trim()}>
              Log activity
            </Button>
          </div>
        </form>
      )}

      {q.isLoading ? (
        <div className="space-y-4 p-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <MessageSquare className="mb-2 size-5 text-ink-faint" />
          <p className="text-sm text-ink-subtle">No activity logged yet.</p>
        </div>
      ) : (
        <ol className="relative px-4 py-3">
          {items.map((i) => (
            <li key={i.id} className="group relative flex gap-3 pb-4 last:pb-1">
              <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-subtle">
                {i.direction === "inbound" ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
              </span>
              <span className="absolute bottom-0 left-3 top-7 w-px bg-line group-last:hidden" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">
                  <span className="font-semibold">{i.type_label || INTERACTION_TYPE_LABEL[i.type]}</span>
                  <span className="text-ink-subtle"> · {i.direction === "inbound" ? "inbound" : "outbound"}</span>
                </p>
                <p className="text-sm text-ink">{i.summary}</p>
                {i.notes && <p className="mt-0.5 whitespace-pre-line text-sm text-ink-muted">{i.notes}</p>}
                <p className="mt-0.5 text-xs text-ink-subtle" title={formatDateTime(i.occurred_at)}>
                  {formatRelative(i.occurred_at)}
                  {i.agent_name && ` by ${i.agent_name}`}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
