import { useTransactions } from "../hooks/use-transactions";
import type { Transaction } from "../types";

function formatMoney(value: string, currency = "GHS") {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `${currency} ${value}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const STATUS_ORDER = [
  "offer",
  "negotiation",
  "agreement",
  "documentation",
  "payment",
  "closing",
  "commission",
  "closed",
];

const STATUS_STYLES: Record<string, string> = {
  offer: "bg-gray-100 text-gray-600",
  negotiation: "bg-amber-100 text-amber-700",
  agreement: "bg-blue-100 text-blue-700",
  documentation: "bg-blue-100 text-blue-700",
  payment: "bg-purple-100 text-purple-700",
  closing: "bg-purple-100 text-purple-700",
  commission: "bg-green-100 text-green-700",
  closed: "bg-green-100 text-green-800",
};

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const stepIndex = STATUS_ORDER.indexOf(transaction.status);
  const progress = stepIndex >= 0 ? Math.round(((stepIndex + 1) / STATUS_ORDER.length) * 100) : 0;

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4 font-medium text-gray-900">
        {formatMoney(transaction.price)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">
        {transaction.commission_percent}% · {formatMoney(transaction.expected_commission)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">
        {formatMoney(transaction.amount_received)} received
        {Number(transaction.outstanding_amount) > 0 && (
          <span className="text-gray-400"> · {formatMoney(transaction.outstanding_amount)} due</span>
        )}
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[transaction.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabel(transaction.status)}
        </span>
      </td>
      <td className="py-3 text-sm text-gray-500">{progress}%</td>
    </tr>
  );
}

export function TransactionsListPage() {
  const { data, isLoading, isError } = useTransactions();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading transactions…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load transactions.</p>;
  }

  const transactions = data?.results ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
        <span className="text-sm text-gray-500">{data?.count ?? 0} total</span>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pl-4 pr-4 font-medium">Price</th>
                <th className="py-2 pr-4 font-medium">Commission</th>
                <th className="py-2 pr-4 font-medium">Payment</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
