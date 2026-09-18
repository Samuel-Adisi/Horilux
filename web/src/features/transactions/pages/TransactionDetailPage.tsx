import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { DescriptionList, ErrorState, Meter, Panel, Skeleton, Stat, StatStrip, Tag } from "@/components/ui/display";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { ConfirmDialog, Dialog } from "@/components/ui/overlay";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TransactionStatus } from "@/components/domain/status";
import { useCan } from "@/features/accounts/permissions";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney, humanize, todayISO } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { TRANSACTION_STAGES, TRANSACTION_STATUS_LABEL, useAdvanceTransaction, useRecordPayment, useTransaction, type TransactionDetail } from "../api";

const STAGE_HINT: Record<string, string> = {
  offer: "Offer received from the client.",
  negotiation: "Price and terms being negotiated.",
  agreement: "Terms agreed in principle.",
  documentation: "Sale or tenancy agreement being drawn up and signed.",
  payment: "Collecting payment from the client.",
  closing: "Handover and final paperwork.",
  commission: "Commission due to Horilux and the agent.",
  closed: "Deal complete.",
};

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const q = useTransaction(id);
  useDocumentTitle(q.data?.property_title ?? "Transaction");
  if (q.isLoading)
    return (
      <Page>
        <Skeleton className="mb-6 h-12 w-80" />
        <Skeleton className="mb-6 h-20" />
        <Skeleton className="h-80" />
      </Page>
    );
  if (q.isError || !q.data)
    return (
      <Page>
        <ErrorState error={q.error} onRetry={() => q.refetch()} title="Couldn't load this transaction" />
      </Page>
    );
  return <TransactionView t={q.data} />;
}

function Stages({ status }: { status: string }) {
  const idx = TRANSACTION_STAGES.indexOf(status as (typeof TRANSACTION_STAGES)[number]);
  return (
    <ol className="grid grid-cols-4 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-8">
      {TRANSACTION_STAGES.map((s, i) => (
        <li key={s} className={cn("bg-surface px-3 py-2.5", i === idx && "bg-brand-50")} aria-current={i === idx ? "step" : undefined}>
          <span
            className={cn(
              "mb-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold",
              i < idx || status === "closed" ? "bg-brand text-white" : i === idx ? "border-2 border-brand text-brand-fg" : "border border-line-strong text-ink-faint",
            )}
          >
            {i < idx || status === "closed" ? <Check className="size-2.5" strokeWidth={3.5} /> : i + 1}
          </span>
          <span className={cn("block truncate text-xs font-semibold", i === idx ? "text-brand-fg" : i < idx ? "text-ink" : "text-ink-subtle")}>{TRANSACTION_STATUS_LABEL[s]}</span>
        </li>
      ))}
    </ol>
  );
}

function TransactionView({ t }: { t: TransactionDetail }) {
  const can = useCan();
  const advance = useAdvanceTransaction(t.id);
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const [paying, setPaying] = useState(false);
  const idx = TRANSACTION_STAGES.indexOf(t.status);
  const next = idx >= 0 && idx < TRANSACTION_STAGES.length - 1 ? TRANSACTION_STAGES[idx + 1] : null;
  const canEdit = can("transaction", "edit");
  const price = Number(t.price);
  const received = Number(t.amount_received);
  const paidPct = price > 0 ? Math.min(100, (received / price) * 100) : 0;

  async function doAdvance() {
    try {
      const updated = await advance.mutateAsync();
      toast.success(`Moved to ${TRANSACTION_STATUS_LABEL[updated.status]}`);
    } catch (err) {
      toast.error("Couldn't advance the transaction", getErrorMessage(err));
    } finally {
      setConfirmAdvance(false);
    }
  }

  return (
    <Page>
      <PageHeader
        back={{ to: "/transactions", label: "Transactions" }}
        title={t.property_title ?? "Transaction"}
        meta={
          <>
            <TransactionStatus status={t.status} />
            {t.client_name && (
              <Link to={`/clients/${t.client}`} className="text-sm text-ink-muted hover:text-brand-fg">
                {t.client_name}
              </Link>
            )}
            <span className="text-sm text-ink-subtle">Opened {formatDate(t.created_at)}</span>
          </>
        }
        actions={
          canEdit && (
            <>
              {t.status !== "closed" && (
                <Button icon={<Plus />} onClick={() => setPaying(true)}>
                  Record payment
                </Button>
              )}
              {next && (
                <Button variant="primary" icon={<ArrowRight />} onClick={() => setConfirmAdvance(true)}>
                  Move to {TRANSACTION_STATUS_LABEL[next]}
                </Button>
              )}
            </>
          )
        }
      />

      <Stages status={t.status} />
      <p className="mt-2 text-xs text-ink-subtle">{STAGE_HINT[t.status]}</p>

      <StatStrip className="mt-6">
        <Stat label="Agreed price" value={formatMoney(t.price)} />
        <Stat label="Received" value={formatMoney(t.amount_received)} hint={`${paidPct.toFixed(0)}% of price`} tone={paidPct >= 100 ? "success" : undefined} />
        <Stat label="Outstanding" value={formatMoney(t.outstanding_amount)} tone={Number(t.outstanding_amount) > 0 ? "warning" : undefined} />
        <Stat label="Expected commission" value={formatMoney(t.expected_commission)} hint={`${Number(t.commission_percent)}% of price`} />
      </StatStrip>
      <div className="mt-2">
        <Meter value={received} max={price} tone={paidPct >= 100 ? "success" : "brand"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Payments" description={t.payments.length ? `${t.payments.length} recorded` : undefined} flush>
            {t.payments.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-subtle">No payments recorded yet.</p>
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Date</TH>
                    <TH>Method</TH>
                    <TH className="hidden sm:table-cell">Reference</TH>
                    <TH>Status</TH>
                    <TH align="right">Amount</TH>
                  </tr>
                </THead>
                <TBody>
                  {t.payments.map((p) => (
                    <TR key={p.id}>
                      <TD className="whitespace-nowrap">{formatDate(p.date)}</TD>
                      <TD className="text-ink-muted">{p.method || "—"}</TD>
                      <TD className="hidden text-ink-muted sm:table-cell">{p.reference || "—"}</TD>
                      <TD>
                        <Tag tone={p.status === "paid" ? "success" : p.status === "overdue" ? "danger" : "warning"}>{humanize(p.status)}</Tag>
                      </TD>
                      <TD align="right" className="font-semibold">
                        {formatMoney(p.amount)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Commission">
            {t.commission ? (
              <DescriptionList
                items={[
                  { label: "Expected", value: formatMoney(t.commission.expected) },
                  { label: "Received", value: formatMoney(t.commission.received) },
                  { label: "Outstanding", value: formatMoney(t.commission.outstanding) },
                  { label: "Status", value: humanize(t.commission.payment_status) },
                  { label: "Agent share", value: formatMoney(t.commission.agent_share) },
                  { label: "Company share", value: formatMoney(t.commission.company_share) },
                ]}
              />
            ) : (
              <p className="text-sm text-ink-subtle">
                Calculated when the deal reaches the Commission stage, using the split set in Settings.
                <span className="num mt-2 block text-ink">Expected: {formatMoney(t.expected_commission)}</span>
              </p>
            )}
          </Panel>
          <Panel title="Parties">
            <DescriptionList
              columns={2}
              items={[
                { label: "Client", value: t.client_name ?? "—" },
                { label: "Owner", value: t.owner_name ?? "—" },
                { label: "Agent", value: t.agent_name ?? "—" },
                {
                  label: "Property",
                  value: (
                    <Link to={`/properties/${t.property}`} className="text-brand-fg hover:underline">
                      View listing
                    </Link>
                  ),
                },
              ]}
            />
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAdvance}
        onClose={() => setConfirmAdvance(false)}
        onConfirm={doAdvance}
        title={next ? `Move to ${TRANSACTION_STATUS_LABEL[next]}?` : ""}
        description={
          next === "commission"
            ? "Commission will be calculated from the active split rule and Finance will be notified."
            : next
              ? STAGE_HINT[next]
              : undefined
        }
        confirmLabel="Move stage"
        loading={advance.isPending}
      />
      {paying && <PaymentDialog t={t} onClose={() => setPaying(false)} />}
    </Page>
  );
}

const METHODS = ["Bank transfer", "Mobile money", "Cheque", "Cash", "Card"];

function PaymentDialog({ t, onClose }: { t: TransactionDetail; onClose: () => void }) {
  const record = useRecordPayment(t.id);
  const [f, setF] = useState({ amount: "", date: todayISO(), method: METHODS[0], reference: "" });
  const [error, setError] = useState<string | null>(null);
  const outstanding = Number(t.outstanding_amount) || Math.max(0, Number(t.price) - Number(t.amount_received));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(f.amount);
    if (!amount || amount <= 0) {
      setError("Enter an amount above zero.");
      return;
    }
    try {
      await record.mutateAsync({ amount: f.amount, date: f.date, method: f.method, reference: f.reference.trim() });
      toast.success("Payment recorded", formatMoney(amount));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't record the payment."));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Record payment"
      description={outstanding > 0 ? `${formatMoney(outstanding)} outstanding` : undefined}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="payment-form" variant="primary" loading={record.isPending}>
            Record payment
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (GH₵)">
            {(p) => (
              <div>
                <Input {...p} type="number" min="0" step="0.01" className="num" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
                {outstanding > 0 && (
                  <button type="button" onClick={() => setF({ ...f, amount: String(outstanding) })} className="mt-1 text-xs font-semibold text-brand-fg hover:underline">
                    Full balance
                  </button>
                )}
              </div>
            )}
          </Field>
          <Field label="Date received">{(p) => <Input {...p} type="date" max={todayISO()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />}</Field>
          <Field label="Method">
            {(p) => (
              <Select {...p} value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Reference" optional>
            {(p) => <Input {...p} value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} placeholder="Bank ref or MoMo ID" />}
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
