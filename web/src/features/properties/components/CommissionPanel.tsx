import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Panel } from "@/components/ui/display";
import { useCan } from "@/features/accounts/permissions";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import type { PropertyDetail } from "../api";

type WithCommission = PropertyDetail & {
  commission_percent: string | null;
  commission_approved: boolean;
};

export function CommissionPanel({ property }: { property: PropertyDetail }) {
  const p = property as WithCommission;
  const can = useCan();
  const qc = useQueryClient();
  const [value, setValue] = useState(p.commission_percent ?? "");

  const refresh = () => qc.invalidateQueries();

  const save = useMutation({
    mutationFn: async () =>
      (await apiClient.post("/properties/" + p.id + "/set_commission/", { commission_percent: value })).data,
    onSuccess: () => { toast.success("Commission saved"); refresh(); },
    onError: (err) => toast.error("Couldn't save the commission", getErrorMessage(err)),
  });

  const approve = useMutation({
    mutationFn: async () => (await apiClient.post("/properties/" + p.id + "/approve_commission/", {})).data,
    onSuccess: () => { toast.success("Commission approved"); refresh(); },
    onError: (err) => toast.error("Couldn't approve the commission", getErrorMessage(err)),
  });

  const isSet = p.commission_percent !== null && p.commission_percent !== undefined;
  const status = !isSet
    ? "Not set yet. It must be set and approved before this property can be verified."
    : p.commission_approved
      ? p.commission_percent + "% (approved)"
      : p.commission_percent + "% (waiting for CEO approval)";

  return (
    <Panel title="Commission" description={status}>
      {can("property", "edit") && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number" min="0" max="100" step="0.25" value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 5"
            className="num w-28 rounded border px-2 py-1.5 text-sm"
          />
          <button
            type="button" disabled={!value || save.isPending} onClick={() => save.mutate()}
            className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {save.isPending ? "Saving..." : "Set commission"}
          </button>
          {isSet && !p.commission_approved && can("property", "approve") && (
            <button
              type="button" disabled={approve.isPending} onClick={() => approve.mutate()}
              className="rounded border px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
            >
              {approve.isPending ? "Approving..." : "Approve (CEO)"}
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}
