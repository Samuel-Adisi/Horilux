import { useMemo, useState } from "react";
import { useAuditLogs } from "@/features/audit/hooks/use-audit-logs";
import type { AuditLog } from "@/features/audit/types";

const MODEL_OPTIONS = [
  { value: "", label: "All models" },
  { value: "Property", label: "Property" },
  { value: "Transaction", label: "Transaction" },
  { value: "Commission", label: "Commission" },
  { value: "CommissionRule", label: "Commission Rule" },
  { value: "Lead", label: "Lead" },
  { value: "MarketingCampaign", label: "Marketing Campaign" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
];

const ACTION_BADGE: Record<string, string> = {
  create: "bg-emerald-500/15 text-emerald-400",
  update: "bg-blue-500/15 text-blue-400",
  delete: "bg-red-500/15 text-red-400",
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function diffFields(oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null) {
  const keys = new Set([...Object.keys(oldValue ?? {}), ...Object.keys(newValue ?? {})]);
  const changed: { key: string; before: unknown; after: unknown }[] = [];
  keys.forEach((key) => {
    const before = oldValue?.[key];
    const after = newValue?.[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changed.push({ key, before, after });
    }
  });
  return changed;
}

function AuditSkeleton() {
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

function LogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const changed = log.action === "update" ? diffFields(log.old_value, log.new_value) : [];
  const canExpand = log.action !== "delete" && (changed.length > 0 || log.action === "create");

  return (
    <>
      <tr
        className={`border-b border-white/5 last:border-0 ${canExpand ? "cursor-pointer hover:bg-white/[0.02]" : ""}`}
        onClick={() => canExpand && setExpanded((e) => !e)}
      >
        <td className="px-5 py-3.5">
          <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize ${ACTION_BADGE[log.action] ?? "bg-slate-500/15 text-slate-300"}`}>
            {log.action}
          </span>
        </td>
        <td className="px-5 py-3.5 font-semibold text-white">{log.model_name}</td>
        <td className="px-5 py-3.5 text-slate-400 font-mono text-[11.5px]">{log.object_id.slice(0, 8)}…</td>
        <td className="px-5 py-3.5 text-slate-300">{log.actor_name}</td>
        <td className="px-5 py-3.5 text-slate-400">{formatDateTime(log.timestamp)}</td>
        <td className="px-5 py-3.5 text-slate-500 text-[11.5px]">
          {canExpand ? (expanded ? "Hide details ▲" : "View details ▼") : "—"}
        </td>
      </tr>
      {expanded && canExpand && (
        <tr className="border-b border-white/5 bg-white/[0.015]">
          <td colSpan={6} className="px-5 py-4">
            {log.action === "create" ? (
              <div className="text-[12.5px] text-slate-400">
                Created with {Object.keys(log.new_value ?? {}).length} fields set.
              </div>
            ) : changed.length === 0 ? (
              <div className="text-[12.5px] text-slate-500">No field-level changes captured.</div>
            ) : (
              <table className="w-full text-[12.5px]">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left font-medium pb-2 pr-4">Field</th>
                    <th className="text-left font-medium pb-2 pr-4">Before</th>
                    <th className="text-left font-medium pb-2">After</th>
                  </tr>
                </thead>
                <tbody>
                  {changed.map((c) => (
                    <tr key={c.key} className="align-top">
                      <td className="pr-4 py-1 text-slate-400 font-mono">{c.key}</td>
                      <td className="pr-4 py-1 text-red-400/80">{String(c.before ?? "—")}</td>
                      <td className="py-1 text-emerald-400/80">{String(c.after ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function CeoAuditLogsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [modelName, setModelName] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAuditLogs({
    page,
    model_name: modelName || undefined,
    action: action || undefined,
  });

  const filtered = useMemo(() => {
    const rows = data?.results ?? [];
    const q = searchInput.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (l) =>
        l.actor_name.toLowerCase().includes(q) ||
        l.object_id.toLowerCase().includes(q) ||
        l.model_name.toLowerCase().includes(q)
    );
  }, [data, searchInput]);

  if (isLoading && !data) {
    return <AuditSkeleton />;
  }

  if (isError) {
    return <p className="text-[13px] text-red-400">Couldn't load audit logs.</p>;
  }

  const totalCount = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Audit & Compliance</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          {totalCount.toLocaleString()} recorded changes across the platform
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search this page by actor, model, or record ID…"
          className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={modelName}
          onChange={(e) => {
            setModelName(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white focus:outline-none focus:border-blue-500"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white focus:outline-none focus:border-blue-500"
        >
          {ACTION_OPTIONS.map((opt) => (
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
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Record</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No audit records match this page's search.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => <LogRow key={l.id} log={l} />)
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
