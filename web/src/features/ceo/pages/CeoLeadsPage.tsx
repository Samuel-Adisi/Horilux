import { useState } from "react";
import { useLeads } from "@/features/leads/hooks/use-leads";
import type { Lead } from "@/features/leads/types";

function formatCurrency(value: string | null): string {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `GH₵${amount.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_ORDER: { value: string; label: string; badge: string }[] = [
  { value: "new", label: "New", badge: "bg-blue-500/15 text-blue-400" },
  { value: "contacted", label: "Contacted", badge: "bg-cyan-500/15 text-cyan-400" },
  { value: "qualified", label: "Qualified", badge: "bg-teal-500/15 text-teal-400" },
  { value: "property_matched", label: "Property Matched", badge: "bg-purple-500/15 text-purple-400" },
  { value: "viewing", label: "Viewing", badge: "bg-amber-500/15 text-amber-400" },
  { value: "negotiation", label: "Negotiation", badge: "bg-fuchsia-500/15 text-fuchsia-400" },
  { value: "closed", label: "Closed", badge: "bg-emerald-500/15 text-emerald-400" },
  { value: "lost", label: "Lost", badge: "bg-rose-500/15 text-rose-400" },
];

function statusMeta(status: string) {
  return STATUS_ORDER.find((s) => s.value === status) ?? { value: status, label: status, badge: "bg-slate-500/15 text-slate-300" };
}

function LeadsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-7 w-20 bg-white/5 rounded animate-pulse mt-4" />
          </div>
        ))}
      </div>
      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const meta = statusMeta(lead.status);
  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-5 py-3.5 font-semibold text-white">{lead.name}</td>
      <td className="px-5 py-3.5 text-slate-300">{lead.source || "—"}</td>
      <td className="px-5 py-3.5 text-slate-300">{lead.location_preference || "—"}</td>
      <td className="px-5 py-3.5 text-slate-300 font-mono">{formatCurrency(lead.budget)}</td>
      <td className="px-5 py-3.5 text-slate-300 capitalize">{lead.purpose || "—"}</td>
      <td className="px-5 py-3.5 text-slate-300">{lead.assigned_agent_name ?? "Unassigned"}</td>
      <td className="px-5 py-3.5 text-slate-300">{formatDate(lead.last_contact)}</td>
      <td className="px-5 py-3.5">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.badge}`}>{lead.status_label ?? meta.label}</span>
      </td>
    </tr>
  );
}

export default function CeoLeadsPage() {
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useLeads({ status: status || undefined, search: search || undefined, page });

  if (isLoading && !data) {
    return <LeadsSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-sm text-rose-400">
        Couldn't load leads. Try refreshing, or check that you have permission to view company-wide lead data.
      </div>
    );
  }

  const leads = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const pageBudgetValue = leads.reduce((sum, l) => sum + (l.budget ? Number(l.budget) : 0), 0);
  const lostCount = leads.filter((l) => l.status === "lost").length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leads Management</h1>
        <p className="text-sm text-slate-400 mt-1">Full lead pipeline across every stage, from first contact to closed or lost.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-blue-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Total Leads</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{totalCount.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-emerald-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Page Budget Value</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{formatCurrency(String(pageBudgetValue))}</p>
          <p className="text-xs text-slate-500 mt-2">Sum of budgets shown below</p>
        </div>
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-rose-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Lost (this page)</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{lostCount}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setStatus(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              status === "" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                status === s.value ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search name or location…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-[#0d121f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-56"
          />
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors">
            Search
          </button>
        </form>
      </div>

      {leads.length === 0 ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-sm text-slate-400">
          No leads match this filter.
        </div>
      ) : (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-slate-500 border-b border-white/10">
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Budget</th>
                  <th className="px-5 py-3 font-medium">Purpose</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Last Contact</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {leads.length} of {totalCount.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data?.previous}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-slate-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data?.next}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
