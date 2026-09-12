import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useViewings } from "../hooks/use-viewings";
import {
  useConfirmViewing,
  useCompleteViewing,
  useCancelViewing,
} from "../hooks/use-viewing-actions";
import type { Viewing, ViewingOutcome } from "../types";

function Icon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const SEARCH_ICON = "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35";
const PLUS_ICON = "M12 5v14M5 12h14";

function statusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-[#2E6BE8]",
  confirmed: "bg-[#5B3FA6]",
  completed: "bg-[#2E7D46]",
  cancelled: "bg-[#8A8578]",
  no_show: "bg-[#B3453D]",
};

const OUTCOME_DOT: Record<string, string> = {
  hot: "bg-[#B3453D]",
  warm: "bg-[#C98A1F]",
  cold: "bg-[#2E6BE8]",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E1D9] bg-white px-2.5 py-1 text-[12px] font-medium text-[#3E3A31]">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-[#8A8578]"}`} />
      {statusLabel(status)}
    </span>
  );
}

function OutcomePill({ outcome }: { outcome: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E1D9] bg-white px-2.5 py-1 text-[12px] font-medium capitalize text-[#3E3A31]">
      <span className={`h-1.5 w-1.5 rounded-full ${OUTCOME_DOT[outcome] ?? "bg-[#8A8578]"}`} />
      {outcome}
    </span>
  );
}

function CompleteForm({ viewing, onClose }: { viewing: Viewing; onClose: () => void }) {
  const completeViewing = useCompleteViewing();
  const [outcome, setOutcome] = useState<ViewingOutcome>("hot");
  const [nextAction, setNextAction] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const needsFollowUp = outcome === "warm" || outcome === "cold";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (needsFollowUp && !followUpDate) {
      setError("Follow-up due date is required for warm/cold outcomes.");
      return;
    }
    try {
      await completeViewing.mutateAsync({
        id: viewing.id,
        payload: {
          outcome,
          next_action: nextAction || undefined,
          follow_up_due_date: needsFollowUp ? followUpDate : undefined,
        },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete viewing.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2.5 rounded-[6px] border border-[#EFEDE6] bg-[#FAF9F6] p-3">
      {error && <p className="text-[12px] text-[#B3453D]">{error}</p>}

      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B5AF9E]">Outcome</label>
        <select
          className="w-full rounded-[4px] border border-[#D8D3C6] bg-white px-2 py-1.5 text-[13px] text-[#17131F] focus:outline-none focus:border-[#240270]"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as ViewingOutcome)}
        >
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B5AF9E]">Next action</label>
        <input
          type="text"
          className="w-full rounded-[4px] border border-[#D8D3C6] bg-white px-2 py-1.5 text-[13px] text-[#17131F] focus:outline-none focus:border-[#240270]"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
        />
      </div>

      {needsFollowUp && (
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B5AF9E]">
            Follow-up due date *
          </label>
          <input
            type="date"
            className="w-full rounded-[4px] border border-[#D8D3C6] bg-white px-2 py-1.5 text-[13px] text-[#17131F] focus:outline-none focus:border-[#240270]"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            required
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={completeViewing.isPending}
          className="rounded-[4px] bg-[#240270] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {completeViewing.isPending ? "Saving…" : "Mark complete"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[4px] border border-[#D8D3C6] px-3 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CancelForm({ viewing, onClose }: { viewing: Viewing; onClose: () => void }) {
  const cancelViewing = useCancelViewing();
  const [reason, setReason] = useState("");
  const [noShow, setNoShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await cancelViewing.mutateAsync({
        id: viewing.id,
        payload: { reason: reason || undefined, no_show: noShow },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel viewing.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2.5 rounded-[6px] border border-[#EFEDE6] bg-[#FAF9F6] p-3">
      {error && <p className="text-[12px] text-[#B3453D]">{error}</p>}

      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B5AF9E]">Reason</label>
        <input
          type="text"
          className="w-full rounded-[4px] border border-[#D8D3C6] bg-white px-2 py-1.5 text-[13px] text-[#17131F] focus:outline-none focus:border-[#240270]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-[12.5px] text-[#3E3A31]">
        <input type="checkbox" checked={noShow} onChange={(e) => setNoShow(e.target.checked)} />
        Mark as no-show
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={cancelViewing.isPending}
          className="rounded-[4px] bg-[#B3453D] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {cancelViewing.isPending ? "Saving…" : "Confirm cancel"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[4px] border border-[#D8D3C6] px-3 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-white"
        >
          Back
        </button>
      </div>
    </form>
  );
}

function formatDateTime(dateStr: string, timeStr: string) {
  const d = new Date(`${dateStr}T${timeStr}`);
  const dateLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return { dateLabel, timeLabel };
}

function ViewingRow({ viewing }: { viewing: Viewing }) {
  const confirmViewing = useConfirmViewing();
  const [activeForm, setActiveForm] = useState<"complete" | "cancel" | null>(null);
  const [imgError, setImgError] = useState(false);

  const canConfirm = viewing.status === "scheduled";
  const canComplete = viewing.status === "confirmed";
  const canCancel = viewing.status === "scheduled" || viewing.status === "confirmed";
  const { dateLabel, timeLabel } = formatDateTime(viewing.date, viewing.time);

  const isPast =
    viewing.status === "completed" ||
    viewing.status === "cancelled" ||
    viewing.status === "no_show" ||
    new Date(`${viewing.date}T${viewing.time}`) < new Date();

  return (
    <div className={`border-b border-[#EFEDE6] px-5 py-4 last:border-0 ${isPast ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 flex-wrap items-start gap-x-8 gap-y-2">
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-[4px] bg-[#EFEDE6]">
            {viewing.property_image_url && !imgError ? (
              <img
                src={viewing.property_image_url}
                alt={viewing.property_title}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#B5AF9E]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 21V9l8-6 8 6v12h-5v-7H9v7H4Z" />
                </svg>
              </div>
            )}
          </div>

          <div className="min-w-[100px]">
            <p className="text-[13.5px] font-medium text-[#17131F]">{dateLabel}</p>
            <p className="text-[12px] text-[#8A8578]">{timeLabel}</p>
          </div>

          <div className="min-w-[160px]">
            <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Property</p>
            <p className="mt-0.5 text-[13px] font-medium text-[#17131F]">{viewing.property_title}</p>
            <p className="text-[12px] text-[#8A8578]">{viewing.property_location}</p>
          </div>

          <div className="min-w-[130px]">
            <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Client</p>
            <p className="mt-0.5 text-[13px] text-[#3E3A31]">{viewing.client_name}</p>
          </div>

          <div className="min-w-[120px]">
            <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Agent</p>
            <p className="mt-0.5 text-[13px] text-[#3E3A31]">{viewing.agent_name || "Unassigned"}</p>
          </div>

          <div className="min-w-[110px]">
            <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Status</p>
            <div className="mt-1">
              <StatusPill status={viewing.status} />
            </div>
          </div>

          {viewing.outcome && (
            <div className="min-w-[100px]">
              <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Outcome</p>
              <div className="mt-1">
                <OutcomePill outcome={viewing.outcome} />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 sm:pl-4">
          {!activeForm && (
            <div className="flex gap-2">
              {canConfirm && (
                <button
                  onClick={() => confirmViewing.mutate(viewing.id)}
                  disabled={confirmViewing.isPending}
                  className="rounded-[4px] bg-[#240270] px-2.5 py-1.5 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {confirmViewing.isPending ? "Confirming…" : "Confirm"}
                </button>
              )}
              {canComplete && (
                <button
                  onClick={() => setActiveForm("complete")}
                  className="rounded-[4px] border border-[#D8D3C6] px-2.5 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
                >
                  Complete
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setActiveForm("cancel")}
                  className="rounded-[4px] border border-[#E7B7B0] px-2.5 py-1.5 text-[12px] font-medium text-[#B3453D] hover:bg-[#FBF1EF]"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {(viewing.notes || viewing.next_action) && (
        <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#F5F3EE] pt-2.5 text-[12.5px] text-[#8A8578]">
          {viewing.next_action && (
            <p>
              <span className="font-medium text-[#3E3A31]">Next: </span>
              {viewing.next_action}
            </p>
          )}
          {viewing.notes && <p>{viewing.notes}</p>}
        </div>
      )}

      {activeForm === "complete" && <CompleteForm viewing={viewing} onClose={() => setActiveForm(null)} />}
      {activeForm === "cancel" && <CancelForm viewing={viewing} onClose={() => setActiveForm(null)} />}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex gap-8 border-b border-[#EFEDE6] px-5 py-4 last:border-0">
      <div className="space-y-2">
        <div className="h-3.5 w-16 animate-pulse rounded bg-[#EFEDE6]" />
        <div className="h-3 w-12 animate-pulse rounded bg-[#EFEDE6]" />
      </div>
      <div className="h-3.5 w-32 animate-pulse self-center rounded bg-[#EFEDE6]" />
      <div className="h-3.5 w-20 animate-pulse self-center rounded bg-[#EFEDE6]" />
      <div className="h-3.5 w-20 animate-pulse self-center rounded bg-[#EFEDE6]" />
    </div>
  );
}

export function ViewingsListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useViewings(page);
  const [search, setSearch] = useState("");

  const viewings = useMemo(() => {
    const all = data?.results ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (v) =>
        (v.client_name ?? "").toLowerCase().includes(q) ||
        (v.property_title ?? "").toLowerCase().includes(q) ||
        (v.agent_name ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-3 py-4">
      <div className="mb-5">
        <p className="text-[13px] text-[#8A8578]">{data?.count ?? 0} total viewings</p>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[4px] border border-[#E4E1D9] bg-white px-3 py-2.5">
          <span className="text-[#8A8578]">
            <Icon d={SEARCH_ICON} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by client, property, or agent…"
            className="w-full bg-transparent text-[13px] text-[#17131F] placeholder:text-[#8A8578] focus:outline-none"
          />
        </div>

        <Link
          to="/viewings/new"
          className="flex items-center gap-2 rounded-[4px] bg-[#240270] px-4 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          <Icon d={PLUS_ICON} width={15} height={15} />
          New viewing
        </Link>
      </div>

      <div className="overflow-hidden rounded-[6px] border border-[#E4E1D9] bg-white">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <div className="px-5 py-10 text-center text-[13px] text-[#8A2E2E]">
            Couldn't load viewings. Check your connection and try again.
          </div>
        ) : viewings.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-[13.5px] font-medium text-[#17131F]">No viewings match your search</p>
            <p className="mt-1 text-[12.5px] text-[#8A8578]">Try a different client, property, or agent.</p>
          </div>
        ) : (
          viewings.map((viewing) => <ViewingRow key={viewing.id} viewing={viewing} />)
        )}
      </div>

      {!search && (data?.next || data?.previous) && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data?.previous}
            className="rounded-[4px] border border-[#D8D3C6] px-3 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[12px] text-[#8A8578]">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.next}
            className="rounded-[4px] border border-[#D8D3C6] px-3 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
