import { useState } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../hooks/use-transactions";
import { useAdvanceTransaction, useRecordPayment } from "../hooks/use-transaction-actions";
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

function RecordPaymentForm({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid positive amount.");
      return;
    }

    try {
      await recordPayment.mutateAsync({ id: transaction.id, payload: { amount } });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
    >
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div>
        <label className="block text-xs font-medium mb-1">
          Payment amount (outstanding: {formatMoney(transaction.outstanding_amount)})
        </label>
        <input
          type="number"
          step="0.01"
          className="w-full border rounded-md px-2 py-1 text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={recordPayment.isPending}
          className="bg-[#240270] text-white text-xs px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          {recordPayment.isPending ? "Saving…" : "Record payment"}
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

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const advanceTransaction = useAdvanceTransaction();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const stepIndex = STATUS_ORDER.indexOf(transaction.status);
  const progress = stepIndex >= 0 ? Math.round(((stepIndex + 1) / STATUS_ORDER.length) * 100) : 0;
  const canAdvance = transaction.status !== "closed";
  const canRecordPayment =
    Number(transaction.outstanding_amount) > 0 && transaction.status !== "closed";

  return (
    <tr className="border-b border-gray-100 last:border-0 align-top">
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
      <td className="py-3 pr-4 text-sm text-gray-500">{progress}%</td>
      <td className="py-3 text-sm">
        <div className="flex gap-2">
          {canAdvance && (
            <button
              onClick={() => advanceTransaction.mutate(transaction.id)}
              disabled={advanceTransaction.isPending}
              className="text-xs px-3 py-1.5 rounded-md bg-[#240270] text-white disabled:opacity-50"
            >
              {advanceTransaction.isPending ? "Advancing…" : "Advance"}
            </button>
          )}
          {canRecordPayment && !showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="text-xs px-3 py-1.5 rounded-md border"
            >
              Record payment
            </button>
          )}
          {!canAdvance && !canRecordPayment && (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
        {showPaymentForm && (
          <RecordPaymentForm
            transaction={transaction}
            onClose={() => setShowPaymentForm(false)}
          />
        )}
      </td>
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{data?.count ?? 0} total</span>
          <Link
            to="/transactions/new"
            className="bg-[#240270] text-white text-sm px-4 py-2 rounded-md"
          >
            + New transaction
          </Link>
        </div>
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
                <th className="py-2 pr-4 font-medium">Actions</th>
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
