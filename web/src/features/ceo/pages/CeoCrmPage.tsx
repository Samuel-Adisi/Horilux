import { useMemo, useState } from "react";
import { useInteractions } from "@/features/crm/hooks/use-interactions";
import type { Interaction, InteractionType } from "@/features/crm/types";

const TYPE_OPTIONS: { value: InteractionType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meeting", label: "Meeting" },
  { value: "site_visit", label: "Site Visit" },
  { value: "sms", label: "SMS" },
  { value: "other", label: "Other" },
];

const TYPE_BADGE: Record<InteractionType, string> = {
  call: "bg-blue-500/15 text-blue-400",
  email: "bg-cyan-500/15 text-cyan-400",
  whatsapp: "bg-emerald-500/15 text-emerald-400",
  meeting: "bg-amber-500/15 text-amber-400",
  site_visit: "bg-fuchsia-500/15 text-fuchsia-400",
  sms: "bg-violet-500/15 text-violet-400",
  other: "bg-slate-500/15 text-slate-300",
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

function CrmSkeleton() {
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
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractionRow({ interaction }: { interaction: Interaction }) {
  const who = interaction.client_name ?? interaction.lead_name ?? "Unknown";
  const kind = interaction.client_name ? "Client" : "Lead";

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-5 py-3.5">
        <div className="font-semibold text-white">{who}</div>
        <div className="text-[11.5px] text-slate-500">{kind}</div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize ${TYPE_BADGE[interaction.type]}`}>
          {interaction.type_label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-slate-300 capitalize">{interaction.direction_label}</td>
      <td className="px-5 py-3.5 text-slate-300 max-w-sm">
        <div className="truncate" title={interaction.summary}>{interaction.summary}</div>
        {interaction.notes && (
          <div className="text-[11.5px] text-slate-500 mt-0.5 truncate" title={interaction.notes}>
            {interaction.notes}
          </div>
        )}
      </td>
      <td className="px-5 py-3.5 text-slate-300">{interaction.agent_name ?? "Unassigned"}</td>
      <td className="px-5 py-3.5 text-slate-400">{formatDateTime(interaction.occurred_at)}</td>
    </tr>
  );
}

export default function CeoCrmPage() {
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState<InteractionType | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInteractions({
    page,
    type: type || undefined,
  });

  const filtered = useMemo(() => {
    const rows = data?.results ?? [];
    const q = searchInput.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (i) =>
        i.summary.toLowerCase().includes(q) ||
        (i.lead_name ?? "").toLowerCase().includes(q) ||
        (i.client_name ?? "").toLowerCase().includes(q) ||
        (i.agent_name ?? "").toLowerCase().includes(q)
    );
  }, [data, searchInput]);

  if (isLoading && !data) {
    return <CrmSkeleton />;
  }

  if (isError) {
    return <p className="text-[13px] text-red-400">Couldn't load CRM interactions.</p>;
  }

  const totalCount = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">CRM Interactions</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          {totalCount.toLocaleString()} logged touchpoints across leads and customers
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search this page by name, summary, or agent…"
          className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as InteractionType | "");
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white focus:outline-none focus:border-blue-500"
        >
          {TYPE_OPTIONS.map((opt) => (
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
                <th className="px-5 py-3 font-medium">Who</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Direction</th>
                <th className="px-5 py-3 font-medium">Summary</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No interactions match this page's search.
                  </td>
                </tr>
              ) : (
                filtered.map((i) => <InteractionRow key={i.id} interaction={i} />)
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
