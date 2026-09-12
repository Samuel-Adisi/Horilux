import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLeads } from "../hooks/use-leads";
import { useQualifyLead, useConvertToClient, useAssignLead } from "../hooks/use-lead-actions";
import { useUsers } from "@/features/accounts/hooks/use-users";
import type { Lead } from "../types";

function Icon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const SEARCH_ICON = "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35";
const PLUS_ICON = "M12 5v14M5 12h14";

function formatBudget(budget: string | null, currency: string) {
  if (budget === null) return "—";
  const amount = Number(budget);
  if (Number.isNaN(amount)) return `${currency} ${budget}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const STATUS_DOT: Record<string, string> = {
  new: "bg-[#2E6BE8]",
  contacted: "bg-[#C98A1F]",
  qualified: "bg-[#240270]",
  property_matched: "bg-[#240270]",
  viewing: "bg-[#5B3FA6]",
  negotiation: "bg-[#5B3FA6]",
  closed: "bg-[#2E7D46]",
  lost: "bg-[#8A8578]",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E1D9] bg-white px-2.5 py-1 text-[12px] font-medium text-[#3E3A31]">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-[#8A8578]"}`} />
      {statusLabel(status)}
    </span>
  );
}

function AssignPicker({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { data: users, isLoading } = useUsers();
  const assignLead = useAssignLead();
  const [agentId, setAgentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!agentId) {
      setError("Pick an agent.");
      return;
    }
    setError(null);
    try {
      await assignLead.mutateAsync({ id: lead.id, agentId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign.");
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[6px] border border-[#EFEDE6] bg-[#FAF9F6] p-2.5">
      <select
        className="rounded-[4px] border border-[#D8D3C6] bg-white px-2 py-1.5 text-[12px] text-[#17131F] focus:outline-none focus:border-[#240270]"
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Select agent…</option>
        {users?.map((u) => (
          <option key={u.id} value={u.id}>
            {u.full_name} {u.department_name ? `(${u.department_name})` : ""}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={assignLead.isPending}
        className="rounded-[4px] bg-[#240270] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {assignLead.isPending ? "Assigning…" : "Assign"}
      </button>
      <button
        onClick={onClose}
        className="rounded-[4px] border border-[#D8D3C6] px-3 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-white"
      >
        Cancel
      </button>
      {error && <span className="text-[12px] text-[#B3453D]">{error}</span>}
    </div>
  );
}

function LeadActions({ lead }: { lead: Lead }) {
  const qualify = useQualifyLead();
  const convert = useConvertToClient();
  const [showAssign, setShowAssign] = useState(false);

  const canQualify = lead.status === "new" || lead.status === "contacted";
  const canConvert = lead.status === "qualified" || lead.status === "property_matched";
  const pending = qualify.isPending || convert.isPending;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {!showAssign && (
          <button
            onClick={() => setShowAssign(true)}
            className="rounded-[4px] border border-[#D8D3C6] px-2.5 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
          >
            Assign
          </button>
        )}
        {canQualify && (
          <button
            onClick={() => qualify.mutate(lead.id)}
            disabled={pending}
            className="rounded-[4px] border border-[#D8D3C6] px-2.5 py-1.5 text-[12px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3] disabled:opacity-50"
          >
            {qualify.isPending ? "Qualifying…" : "Qualify"}
          </button>
        )}
        {canConvert && (
          <button
            onClick={() => convert.mutate(lead.id)}
            disabled={pending}
            className="rounded-[4px] bg-[#240270] px-2.5 py-1.5 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {convert.isPending ? "Converting…" : "Convert to client"}
          </button>
        )}
      </div>
      {showAssign && <AssignPicker lead={lead} onClose={() => setShowAssign(false)} />}
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#EFEDE6] px-5 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-1 flex-wrap items-start gap-x-8 gap-y-2">
        <div className="min-w-[160px]">
          <p className="text-[13.5px] font-medium text-[#17131F]">{lead.name}</p>
          <p className="text-[12px] text-[#8A8578]">{lead.phone || lead.email || "—"}</p>
        </div>

        <div className="min-w-[120px]">
          <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Source</p>
          <p className="mt-0.5 text-[13px] capitalize text-[#3E3A31]">{lead.source || "—"}</p>
        </div>

        <div className="min-w-[160px]">
          <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Preferences</p>
          <p className="mt-0.5 text-[13px] text-[#3E3A31]">
            {lead.location_preference || "—"}
            {lead.property_type_preference ? ` · ${lead.property_type_preference}` : ""}
          </p>
        </div>

        <div className="min-w-[110px]">
          <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Budget</p>
          <p className="mt-0.5 text-[13px] font-medium text-[#17131F]">
            {formatBudget(lead.budget, lead.currency)}
          </p>
        </div>

        <div className="min-w-[110px]">
          <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Status</p>
          <div className="mt-1">
            <StatusPill status={lead.status} />
          </div>
        </div>

        <div className="min-w-[100px]">
          <p className="text-[11px] uppercase tracking-wide text-[#B5AF9E]">Next follow-up</p>
          <p className="mt-0.5 text-[13px] text-[#3E3A31]">
            {lead.next_follow_up ? new Date(lead.next_follow_up).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <div className="shrink-0 sm:pl-4">
        <LeadActions lead={lead} />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex gap-8 border-b border-[#EFEDE6] px-5 py-4 last:border-0">
      <div className="space-y-2">
        <div className="h-3.5 w-28 animate-pulse rounded bg-[#EFEDE6]" />
        <div className="h-3 w-20 animate-pulse rounded bg-[#EFEDE6]" />
      </div>
      <div className="h-3.5 w-16 animate-pulse self-center rounded bg-[#EFEDE6]" />
      <div className="h-3.5 w-24 animate-pulse self-center rounded bg-[#EFEDE6]" />
      <div className="h-3.5 w-20 animate-pulse self-center rounded bg-[#EFEDE6]" />
    </div>
  );
}

export function LeadsListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useLeads(page);
  const [search, setSearch] = useState("");

  const leads = useMemo(() => {
    const all = data?.results ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        (lead.email ?? "").toLowerCase().includes(q) ||
        (lead.phone ?? "").toLowerCase().includes(q) ||
        (lead.location_preference ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-3 py-4">
      <div className="mb-5">
        <p className="text-[13px] text-[#8A8578]">{data?.count ?? 0} total leads</p>
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
            placeholder="Search by name, phone, email, or location…"
            className="w-full bg-transparent text-[13px] text-[#17131F] placeholder:text-[#8A8578] focus:outline-none"
          />
        </div>

        <Link
          to="/leads/new"
          className="flex items-center gap-2 rounded-[4px] bg-[#240270] px-4 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          <Icon d={PLUS_ICON} width={15} height={15} />
          New lead
        </Link>
      </div>

      <div className="overflow-hidden rounded-[6px] border border-[#E4E1D9] bg-white">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <div className="px-5 py-10 text-center text-[13px] text-[#8A2E2E]">
            Couldn't load leads. Check your connection and try again.
          </div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-[13.5px] font-medium text-[#17131F]">No leads match your search</p>
            <p className="mt-1 text-[12.5px] text-[#8A8578]">Try a different name, phone, or location.</p>
          </div>
        ) : (
          leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
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
