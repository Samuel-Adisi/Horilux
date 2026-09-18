import { Check } from "lucide-react";
import { Panel, Meter } from "@/components/ui/display";
import { useCan } from "@/features/accounts/permissions";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { CHECKLIST_ITEMS, useUpdateChecklist, type ChecklistKey, type PropertyDetail } from "../api";

const EDITABLE_STATUSES = ["draft", "onboarding", "pending_verification"];

export function ChecklistPanel({ property }: { property: PropertyDetail }) {
  const can = useCan();
  const update = useUpdateChecklist(property.id);
  const checklist = property.verification;
  if (!checklist) return null;

  const done = CHECKLIST_ITEMS.filter((i) => checklist[i.key]).length;
  const editable = can("property_verification", "edit") && EDITABLE_STATUSES.includes(property.status);

  function toggle(key: ChecklistKey) {
    if (!editable || !checklist) return;
    update.mutate(
      { checklistId: checklist.id, patch: { [key]: !checklist[key] } },
      { onError: (err) => toast.error("Couldn't update the checklist", getErrorMessage(err)) },
    );
  }

  return (
    <Panel
      title="Verification"
      description={
        checklist.manager_approved
          ? `Approved${checklist.approved_at ? ` on ${formatDate(checklist.approved_at)}` : ""}`
          : editable
            ? "Tick each item once it has been checked."
            : `${done} of ${CHECKLIST_ITEMS.length} checks complete`
      }
    >
      <div className="mb-3 flex items-center gap-3">
        <Meter value={done} max={CHECKLIST_ITEMS.length} tone={done === CHECKLIST_ITEMS.length ? "success" : "brand"} />
        <span className="num shrink-0 text-xs font-semibold text-ink-muted">
          {done}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      <ul className="-mx-1.5 space-y-px">
        {CHECKLIST_ITEMS.map((item) => {
          const on = checklist[item.key];
          return (
            <li key={item.key}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                disabled={!editable}
                onClick={() => toggle(item.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded px-1.5 py-1.5 text-left text-sm transition-colors",
                  editable && "hover:bg-surface-hover",
                  !editable && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    on ? "border-forest bg-forest text-white" : "border-line-strong bg-white",
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className={on ? "text-ink" : "text-ink-muted"}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
