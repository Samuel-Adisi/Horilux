import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "../hooks/use-campaigns";
import {
  useSubmitForReview,
  useScheduleCampaign,
  usePublishCampaign,
} from "../hooks/use-campaign-actions";
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

function ScheduleForm({
  campaign,
  onClose,
}: {
  campaign: Campaign;
  onClose: () => void;
}) {
  const scheduleCampaign = useScheduleCampaign();
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Pick a future date.");
      return;
    }

    try {
      await scheduleCampaign.mutateAsync({
        id: campaign.id,
        payload: { scheduled_date: date },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule campaign.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
    >
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div>
        <label className="block text-xs font-medium mb-1">Scheduled date</label>
        <input
          type="date"
          className="w-full border rounded-md px-2 py-1 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={scheduleCampaign.isPending}
          className="bg-[#240270] text-white text-xs px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          {scheduleCampaign.isPending ? "Saving…" : "Schedule"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-md border"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const submitForReview = useSubmitForReview();
  const publishCampaign = usePublishCampaign();
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const headline = campaign.content.headline ?? "Untitled campaign";
  const views = totalMetric(campaign, "views");
  const enquiries = totalMetric(campaign, "enquiries");

  const canSubmitForReview = campaign.status === "draft";
  const canSchedule = campaign.status === "review";
  const canPublishNow = campaign.status === "review" || campaign.status === "scheduled";

  return (
    <tr className="border-b border-gray-100 last:border-0 align-top">
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
      <td className="py-3 pr-4 text-sm text-gray-600">{enquiries}</td>
      <td className="py-3 text-sm">
        <div className="flex gap-2">
          {canSubmitForReview && (
            <button
              onClick={() => submitForReview.mutate(campaign.id)}
              disabled={submitForReview.isPending}
              className="text-xs px-3 py-1.5 rounded-md bg-[#240270] text-white disabled:opacity-50"
            >
              {submitForReview.isPending ? "Submitting…" : "Submit for review"}
            </button>
          )}
          {canSchedule && !showScheduleForm && (
            <button
              onClick={() => setShowScheduleForm(true)}
              className="text-xs px-3 py-1.5 rounded-md border"
            >
              Schedule
            </button>
          )}
          {canPublishNow && (
            <button
              onClick={() => publishCampaign.mutate(campaign.id)}
              disabled={publishCampaign.isPending}
              className="text-xs px-3 py-1.5 rounded-md border border-green-300 text-green-700"
            >
              {publishCampaign.isPending ? "Publishing…" : "Publish now"}
            </button>
          )}
          {!canSubmitForReview && !canSchedule && !canPublishNow && (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
        {showScheduleForm && (
          <ScheduleForm campaign={campaign} onClose={() => setShowScheduleForm(false)} />
        )}
      </td>
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{data?.count ?? 0} total</span>
          <Link
            to="/campaigns/new"
            className="bg-[#240270] text-white text-sm px-4 py-2 rounded-md"
          >
            + New campaign
          </Link>
        </div>
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
                <th className="py-2 pr-4 font-medium">Actions</th>
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
