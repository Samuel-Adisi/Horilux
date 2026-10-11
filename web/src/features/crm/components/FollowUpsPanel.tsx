import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/display";
import { useCan } from "@/features/accounts/permissions";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, isPast } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useCompleteFollowUp, useFollowUps, type FollowUp } from "@/features/viewings/api";

export function FollowUpsPanel({ clientId }: { clientId: string }) {
  const can = useCan();
  const q = useFollowUps({ client: clientId, completed: "false" });
  const complete = useCompleteFollowUp();
  const rows = q.data?.results ?? [];

  async function done(f: FollowUp) {
    try {
      await complete.mutateAsync(f.id);
      toast.success("Follow-up done");
    } catch (err) {
      toast.error("Couldn't update the follow-up", getErrorMessage(err));
    }
  }

  return (
    <Panel title="Follow-ups">
      <div className="space-y-3 text-sm">
        {q.isLoading && <p className="text-ink-muted">Loading...</p>}
        {!q.isLoading && rows.length === 0 && <p className="text-ink-muted">Nothing to follow up.</p>}
        {rows.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className={cn("text-xs font-semibold", isPast(f.due_date) ? "text-red-400" : "text-ink-subtle")}>Due {formatDate(f.due_date)}</p>
              {f.notes && <p className="text-ink-muted">{f.notes}</p>}
            </div>
            {can("followup", "edit") && (
              <Button size="sm" icon={<Check />} onClick={() => done(f)} loading={complete.isPending && complete.variables === f.id}>
                Done
              </Button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
