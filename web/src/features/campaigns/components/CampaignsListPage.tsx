import { useCampaigns } from "../hooks/use-campaigns";
import type { Campaign } from "../types";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  review: "bg-amber-100 text-amber-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
};

function totalMetric(campaign: Campaign, key: keyof Campaign["performance_records"][number]) {
  return campaign.performance_records.reduce((sum, record) => sum + Number(record[key] ?? 0), 0);
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const headline = campaign.content.headline ?? "Untitled campaign";
  const views = totalMetric(campaign, "views");
  const enquiries = totalMetric(campaign, "enquiries");

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-gray-900">{headline}</p>
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[campaign.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabel(campaign.status)}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">
        {campaign.status === "scheduled" && campaign.scheduled_date
          ? new Date(campaign.scheduled_date).toLocaleDateString()
          : campaign.published_date
            ? new Date(campaign.published_date).toLocaleDateString()
            : "—"}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">{views}</td>
      <td className="py-3 text-sm text-gray-600">{enquiries}</td>
    </tr>
  );
}

export function CampaignsListPage() {
  const { data, isLoading, isError } = useCampaigns();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading campaigns…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load campaigns.</p>;
  }

  const campaigns = data?.results ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Campaigns</h1>
        <span className="text-sm text-gray-500">{data?.count ?? 0} total</span>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-gray-500">No campaigns yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pl-4 pr-4 font-medium">Campaign</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Views</th>
                <th className="py-2 pr-4 font-medium">Enquiries</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
