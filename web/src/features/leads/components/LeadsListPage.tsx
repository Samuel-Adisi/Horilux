import { Link } from "react-router-dom";
import { useLeads } from "../hooks/use-leads";
import { useQualifyLead, useConvertToClient } from "../hooks/use-lead-actions";
import type { Lead } from "../types";

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

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-purple-100 text-purple-700",
  property_matched: "bg-purple-100 text-purple-700",
  viewing: "bg-indigo-100 text-indigo-700",
  negotiation: "bg-indigo-100 text-indigo-700",
  closed: "bg-green-100 text-green-700",
  lost: "bg-gray-100 text-gray-500",
};

function LeadActions({ lead }: { lead: Lead }) {
  const qualify = useQualifyLead();
  const convert = useConvertToClient();

  const canQualify = lead.status === "new" || lead.status === "contacted";
  const canConvert = lead.status === "qualified" || lead.status === "property_matched";
  const pending = qualify.isPending || convert.isPending;

  return (
    <div className="flex items-center gap-2">
      <span
        title="Requires a user-directory endpoint to pick an agent — not yet available in the API"
        className="cursor-not-allowed rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-400"
      >
        Assign
      </span>
      {canQualify && (
        <button
          onClick={() => qualify.mutate(lead.id)}
          disabled={pending}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {qualify.isPending ? "Qualifying…" : "Qualify"}
        </button>
      )}
      {canConvert && (
        <button
          onClick={() => convert.mutate(lead.id)}
          disabled={pending}
          className="rounded-md bg-[#240270] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {convert.isPending ? "Converting…" : "Convert to client"}
        </button>
      )}
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-gray-900">{lead.name}</p>
        <p className="text-sm text-gray-500">{lead.phone || lead.email || "—"}</p>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600 capitalize">{lead.source || "—"}</td>
      <td className="py-3 pr-4 text-sm text-gray-600">
        {lead.location_preference || "—"}
        {lead.property_type_preference ? ` · ${lead.property_type_preference}` : ""}
      </td>
      <td className="py-3 pr-4 font-medium text-gray-900">
        {formatBudget(lead.budget, lead.currency)}
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[lead.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabel(lead.status)}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500">
        {lead.next_follow_up ? new Date(lead.next_follow_up).toLocaleDateString() : "—"}
      </td>
      <td className="py-3">
        <LeadActions lead={lead} />
      </td>
    </tr>
  );
}

export function LeadsListPage() {
  const { data, isLoading, isError } = useLeads();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading leads…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load leads.</p>;
  }

  const leads = data?.results ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <span className="text-sm text-gray-500">{data?.count ?? 0} total</span>
        </div>
        <Link
          to="/leads/new"
          className="rounded-md bg-[#240270] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          New Lead
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-gray-500">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pl-4 pr-4 font-medium">Lead</th>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 font-medium">Preferences</th>
                <th className="py-2 pr-4 font-medium">Budget</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Next Follow-up</th>
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
