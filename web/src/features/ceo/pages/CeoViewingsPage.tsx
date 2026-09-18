import { useMemo, useState } from "react";
import { useViewings } from "@/features/viewings/hooks/use-viewings";
import type { Viewing } from "@/features/viewings/types";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-blue-500/15 text-blue-400",
  confirmed: "bg-violet-500/15 text-violet-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-slate-500/15 text-slate-400",
  no_show: "bg-red-500/15 text-red-400",
};

const OUTCOME_BADGE: Record<string, string> = {
  hot: "bg-red-500/15 text-red-400",
  warm: "bg-amber-500/15 text-amber-400",
  cold: "bg-blue-500/15 text-blue-400",
};

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateTime(date: string, time: string): string {
  const d = new Date(`${date}T${time}`);
  if (isNaN(d.getTime())) return `${date} ${time}`;
  return d.toLocaleString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isOverdue(v: Viewing): boolean {
  if (v.status !== "scheduled" && v.status !== "confirmed") return false;
  return new Date(v.date) < new Date(new Date().toDateString());
}

function ViewingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CeoViewingsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useViewings(page);

  const filtered = useMemo(() => {
    const rows = data?.results ?? [];
    const q = searchInput.trim().toLowerCase();
    const byStatus = status ? rows.filter((v) => v.status === status) : rows;
    if (!q) return byStatus;
    return byStatus.filter(
      (v) =>
        v.client_name.toLowerCase().includes(q) ||
        v.property_title.toLowerCase().includes(q) ||
        (v.agent_name ?? "").toLowerCase().includes(q)
    );
  }, [data, searchInput, status]);

  if (isLoading && !data) {
    return <ViewingsSkeleton />;
  }

  if (isError) {
    return <p className="text-[13px] text-red-400">Couldn't load viewings.</p>;
  }

  const totalCount = data?.count ?? 0;
  const overdueCount = (data?.results ?? []).filter(isOverdue).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Viewings</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          {totalCount.toLocaleString()} scheduled viewings across the platform
          {overdueCount > 0 && (
            <span className="text-red-400 ml-2">• {overdueCount} overdue on this page</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search this page by client, property, or agent…"
          className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white focus:outline-none focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[11.5px] uppercase tracking-wide text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Date & Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No viewings match this page's search.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className={`border-b border-white/5 last:border-0 ${isOverdue(v) ? "bg-red-500/[0.03]" : ""}`}>
                    <td className="px-5 py-3.5 font-semibold text-white">{v.property_title}</td>
                    <td className="px-5 py-3.5 text-slate-300">{v.client_name}</td>
                    <td className="px-5 py-3.5 text-slate-400">{v.agent_name ?? "Unassigned"}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatDateTime(v.date, v.time)}
                      {isOverdue(v) && <span className="text-red-400 ml-2 text-[11px]">Overdue</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-medium ${STATUS_BADGE[v.status] ?? "bg-slate-500/15 text-slate-300"}`}>
                        {statusLabel(v.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {v.outcome ? (
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize ${OUTCOME_BADGE[v.outcome] ?? "bg-slate-500/15 text-slate-300"}`}>
                          {v.outcome}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} of {totalCount.toLocaleString()}</span>
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
    </div>
  );
}
