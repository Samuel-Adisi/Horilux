import { useState } from "react";
import { useAgentsRoster } from "@/features/dashboard/hooks/use-agents-roster";
import type { RosterAgent } from "@/features/dashboard/api/agents-roster";

function formatCurrency(value: number): string {
  return `GH\u20b5${value.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

type SortKey = "volume" | "deals_closed" | "active_deals" | "conversion_percent";

function RosterSkeleton() {
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-9 w-9 rounded-full bg-white/5 animate-pulse" />
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

const AVATAR_COLORS = ["bg-blue-600", "bg-emerald-600", "bg-amber-700", "bg-fuchsia-700", "bg-cyan-700", "bg-teal-700"];

function AgentRow({ agent, rank }: { agent: RosterAgent; rank: number }) {
  const initials = agent.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono w-5 shrink-0">#{rank}</span>
          <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[rank % AVATAR_COLORS.length]} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{agent.name}</p>
            <p className="text-[11px] text-slate-500">{agent.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-slate-300">{agent.department}</td>
      <td className="px-5 py-3.5 text-slate-300 font-mono">{agent.deals_closed}</td>
      <td className="px-5 py-3.5 text-slate-300 font-mono">{agent.active_deals}</td>
      <td className="px-5 py-3.5 text-white font-mono font-semibold">{formatCurrency(agent.volume)}</td>
      <td className="px-5 py-3.5 text-slate-300 font-mono">{agent.leads_assigned}</td>
      <td className="px-5 py-3.5">
        <span className={`font-mono text-sm font-semibold ${agent.conversion_percent >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
          {agent.conversion_percent}%
        </span>
      </td>
    </tr>
  );
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "volume", label: "Volume" },
  { key: "deals_closed", label: "Deals Closed" },
  { key: "active_deals", label: "Active Deals" },
  { key: "conversion_percent", label: "Conversion" },
];

export default function CeoAgentsRosterPage() {
  const { data, isLoading, isError } = useAgentsRoster();
  const [sortKey, setSortKey] = useState<SortKey>("volume");

  if (isLoading) {
    return <RosterSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-rose-400">
        Couldn't load the agent roster. Try refreshing, or check that you have permission to view company-wide sales data.
      </div>
    );
  }

  const hasAgents = data.agents.length > 0;
  const totalVolume = data.agents.reduce((sum, a) => sum + a.volume, 0);
  const totalDealsClosed = data.agents.reduce((sum, a) => sum + a.deals_closed, 0);
  const totalActiveDeals = data.agents.reduce((sum, a) => sum + a.active_deals, 0);

  const sortedAgents = [...data.agents].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agents Roster</h1>
        <p className="text-sm text-slate-400 mt-1">Full team performance: closed deals, active pipeline, and lead conversion per agent.</p>
      </div>

      {!hasAgents ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-sm text-slate-400">
          No active agents found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-blue-500">
              <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Active Agents</p>
              <p className="text-2xl font-bold text-white mt-3 font-mono">{data.total_agents}</p>
            </div>
            <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-emerald-500">
              <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Total Closed Volume</p>
              <p className="text-2xl font-bold text-white mt-3 font-mono">{formatCurrency(totalVolume)}</p>
            </div>
            <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-amber-500">
              <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Deals Closed / Active</p>
              <p className="text-2xl font-bold text-white mt-3 font-mono">{totalDealsClosed} / {totalActiveDeals}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">Sort by:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sortKey === opt.key ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="px-5 py-3 font-medium">Agent</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Deals Closed</th>
                    <th className="px-5 py-3 font-medium">Active Deals</th>
                    <th className="px-5 py-3 font-medium">Closed Volume</th>
                    <th className="px-5 py-3 font-medium">Leads Assigned</th>
                    <th className="px-5 py-3 font-medium">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAgents.map((agent, i) => (
                    <AgentRow key={agent.id} agent={agent} rank={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
