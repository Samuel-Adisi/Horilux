import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMarketingCampaigns } from "@/features/dashboard/hooks/use-marketing-campaigns";
import type { MarketingCampaignRow } from "@/features/dashboard/api/marketing-campaigns";

type StatusFilter = "all" | "draft" | "in_review" | "scheduled" | "published";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "in_review", label: "In Review" },
  { key: "scheduled", label: "Scheduled" },
  { key: "published", label: "Published" },
];

function SummaryCard({
  label,
  value,
  hoverColor = "blue-500",
}: {
  label: string;
  value: string | number;
  hoverColor?: string;
}) {
  return (
    <div className={`bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-${hoverColor}`}>
      <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white mt-3 font-mono">{value}</p>
    </div>
  );
}

function StatusBadge({ status, label }: { status: MarketingCampaignRow["status"]; label: string }) {
  const colors: Record<string, string> = {
    draft: "bg-white/10 text-white/70",
    in_review: "bg-[#7A6D0C]/30 text-[#c9b84f]",
    scheduled: "bg-[#240270]/40 text-[#b6a3f5]",
    published: "bg-[#003E03]/40 text-[#6fd473]",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status] ?? "bg-white/10 text-white/70"}`}>
      {label}
    </span>
  );
}

function exportCsv(rows: MarketingCampaignRow[]) {
  const header = [
    "Property",
    "Status",
    "Headline",
    "Created By",
    "Created At",
    "Scheduled Date",
    "Published Date",
    "Views",
    "Enquiries",
    "Leads",
    "Viewings Booked",
    "Conversions",
  ];
  const lines = rows.map((c) => [
    c.property_title,
    c.status_label,
    c.headline ?? "",
    c.created_by_name,
    c.created_at,
    c.scheduled_date ?? "",
    c.published_date ?? "",
    c.performance?.views ?? "",
    c.performance?.enquiries ?? "",
    c.performance?.leads_generated ?? "",
    c.performance?.viewings_booked ?? "",
    c.performance?.conversions ?? "",
  ]);
  const csv = [header, ...lines]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "marketing-campaigns.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function CampaignDrawer({ campaign, onClose }: { campaign: MarketingCampaignRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0d121f] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {campaign.property_image_url && (
          <img
            src={campaign.property_image_url}
            alt={campaign.property_title}
            className="mb-4 h-40 w-full rounded-lg object-cover"
          />
        )}

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{campaign.property_title}</h2>
            <p className="mt-1 text-sm text-white/50">{campaign.headline ?? "No headline set"}</p>
            <Link
              to={`/ceo/properties/${campaign.property_id}`}
              className="mt-3 inline-block rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:border-blue-500 hover:text-white"
            >
              View Property →
            </Link>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        <div className="mt-4">
          <StatusBadge status={campaign.status} label={campaign.status_label} />
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/50">Created by</dt>
            <dd className="text-white">{campaign.created_by_name}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/50">Created at</dt>
            <dd className="text-white">{new Date(campaign.created_at).toLocaleDateString("en-GH")}</dd>
          </div>
          {campaign.scheduled_date && (
            <div className="flex justify-between border-b border-white/10 pb-2">
              <dt className="text-white/50">Scheduled date</dt>
              <dd className="text-white">{new Date(campaign.scheduled_date).toLocaleDateString("en-GH")}</dd>
            </div>
          )}
          {campaign.published_date && (
            <div className="flex justify-between border-b border-white/10 pb-2">
              <dt className="text-white/50">Published date</dt>
              <dd className="text-white">{new Date(campaign.published_date).toLocaleDateString("en-GH")}</dd>
            </div>
          )}
        </dl>

        <h3 className="mt-6 text-sm font-semibold text-white/70">Performance</h3>
        {campaign.has_performance && campaign.performance ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <SummaryCard label="Views" value={campaign.performance.views} />
            <SummaryCard label="Enquiries" value={campaign.performance.enquiries} />
            <SummaryCard label="Leads" value={campaign.performance.leads_generated} />
            <SummaryCard label="Viewings Booked" value={campaign.performance.viewings_booked} />
            <SummaryCard label="Conversions" value={campaign.performance.conversions} />
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/50">
            No performance data yet — this campaign hasn't been published.
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ""}`} />;
}

export default function CeoCampaignsPage() {
  const { data, isLoading, isError } = useMarketingCampaigns();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MarketingCampaignRow | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.campaigns.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.property_title.toLowerCase().includes(q) ||
        (c.headline ?? "").toLowerCase().includes(q) ||
        c.created_by_name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [data, statusFilter, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-24" />
          ))}
        </div>
        <SkeletonBlock className="h-96" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d121f] p-6 text-sm text-white/60">
        Couldn't load campaign data. Try refreshing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Campaigns" value={data.total_campaigns} hoverColor="blue-500" />
        <SummaryCard label="Total Views" value={data.totals.views} hoverColor="purple-500" />
        <SummaryCard label="Total Leads Generated" value={data.totals.leads_generated} hoverColor="amber-500" />
        <SummaryCard label="Total Conversions" value={data.totals.conversions} hoverColor="emerald-500" />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d121f] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const count = tab.key === "all" ? data.total_campaigns : data.status_counts[tab.key];
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active ? "bg-[#240270] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, headline, creator…"
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#240270]"
            />
            <button
              onClick={() => exportCsv(filtered)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Headline</th>
                <th className="py-2 pr-4">Created By</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer border-b border-white/5 text-white/80 hover:bg-white/5"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {c.property_image_url ? (
                        <img
                          src={c.property_image_url}
                          alt={c.property_title}
                          className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
                          </svg>
                        </div>
                      )}
                      <span>{c.property_title}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={c.status} label={c.status_label} />
                  </td>
                  <td className="py-3 pr-4 text-white/60">{c.headline ?? "—"}</td>
                  <td className="py-3 pr-4">{c.created_by_name}</td>
                  <td className="py-3 pr-4 text-white/60">
                    {new Date(c.created_at).toLocaleDateString("en-GH")}
                  </td>
                  <td className="py-3 pr-4">
                    {c.has_performance ? (
                      <span className="text-[#6fd473]">{c.performance?.conversions ?? 0} conv.</span>
                    ) : (
                      <span className="text-white/30">No data</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40">
                    No campaigns match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <CampaignDrawer campaign={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
