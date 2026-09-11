import { useViewings } from "../hooks/use-viewings";
import type { Viewing } from "../types";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const OUTCOME_STYLES: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-amber-100 text-amber-700",
  cold: "bg-blue-100 text-blue-700",
};

function ViewingRow({ viewing }: { viewing: Viewing }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-gray-900">
          {viewing.date} {viewing.time}
        </p>
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[viewing.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabel(viewing.status)}
        </span>
      </td>
      <td className="py-3 pr-4">
        {viewing.outcome ? (
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              OUTCOME_STYLES[viewing.outcome] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {viewing.outcome}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">{viewing.next_action || "—"}</td>
      <td className="py-3 text-sm text-gray-500">{viewing.notes || "—"}</td>
    </tr>
  );
}

export function ViewingsListPage() {
  const { data, isLoading, isError } = useViewings();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading viewings…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load viewings.</p>;
  }

  const viewings = data?.results ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Viewings</h1>
        <span className="text-sm text-gray-500">{data?.count ?? 0} total</span>
      </div>

      {viewings.length === 0 ? (
        <p className="text-sm text-gray-500">No viewings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pl-4 pr-4 font-medium">Date / Time</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Outcome</th>
                <th className="py-2 pr-4 font-medium">Next Action</th>
                <th className="py-2 pr-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {viewings.map((viewing) => (
                <ViewingRow key={viewing.id} viewing={viewing} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
