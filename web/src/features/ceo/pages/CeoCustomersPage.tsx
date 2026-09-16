import { useMemo, useState } from "react";
import { useClients } from "@/features/crm/hooks/use-clients";
import type { Client } from "@/features/crm/types";

function formatCurrency(value: string | number | null): string {
  if (value === null) return "—";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return "—";
  return `GH₵${amount.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

function CustomersSkeleton() {
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

function ClientRow({ client }: { client: Client }) {
  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-5 py-3.5 font-semibold text-white">{client.name}</td>
      <td className="px-5 py-3.5 text-slate-300">{client.phone}</td>
      <td className="px-5 py-3.5 text-slate-300">{client.email || "—"}</td>
      <td className="px-5 py-3.5 text-slate-300 font-mono">{formatCurrency(client.budget)}</td>
      <td className="px-5 py-3.5 text-slate-300">{client.assigned_agent_name ?? "Unassigned"}</td>
      <td className="px-5 py-3.5 text-slate-400">{formatDate(client.created_at)}</td>
    </tr>
  );
}

export default function CeoCustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useClients({ page });

  const filtered = useMemo(() => {
    const rows = data?.results ?? [];
    const q = searchInput.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [data, searchInput]);

  if (isLoading && !data) {
    return <CustomersSkeleton />;
  }

  if (isError) {
    return <p className="text-[13px] text-red-400">Couldn't load customers.</p>;
  }

  const totalCount = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Customers</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          {totalCount.toLocaleString()} clients across the company
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search this page by name, phone, or email…"
          className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[11.5px] uppercase tracking-wide text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Budget</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No customers match this page's search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => <ClientRow key={c.id} client={c} />)
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
