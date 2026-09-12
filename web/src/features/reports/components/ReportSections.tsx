import type {
  ListingReport,
  SalesReport,
  MarketingReport,
  FinanceReport,
  OperationsReport,
} from "../types";

type Tone = "good" | "attention" | "neutral";

function getStatusTone(key: string): Tone {
  const k = key.toLowerCase();
  if (/(complete|paid|won|active|available|confirmed|approved|closed_won)/.test(k)) return "good";
  if (/(overdue|cancel|lost|reject|no_show|failed|closed_lost)/.test(k)) return "attention";
  return "neutral";
}

function toneBarClass(tone: Tone) {
  if (tone === "good") return "bg-forest";
  if (tone === "attention") return "bg-taupe";
  return "bg-midnight/60";
}

function toneDotClass(tone: Tone) {
  if (tone === "good") return "bg-forest";
  if (tone === "attention") return "bg-taupe";
  return "bg-midnight/60";
}

function toneTextClass(tone: Tone) {
  if (tone === "good") return "text-forest";
  if (tone === "attention") return "text-taupe";
  return "text-gray-900";
}

function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="text-4xl font-bold tracking-tight text-midnight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function SecondaryStat({
  value,
  label,
  tone = "neutral",
}: {
  value: string | number;
  label: string;
  tone?: Tone;
}) {
  return (
    <div>
      <p className={`text-xl font-semibold tabular-nums ${toneTextClass(tone)}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">{title}</p>
      {entries.length === 0 || total === 0 ? (
        <p className="text-sm text-gray-400">No data yet</p>
      ) : (
        <>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
            {entries.map(([key, count]) => {
              const tone = getStatusTone(key);
              const pct = (count / total) * 100;
              return (
                <div
                  key={key}
                  className={`h-full ${toneBarClass(tone)}`}
                  style={{ width: `${pct}%` }}
                  title={`${key.replace(/_/g, " ")}: ${count}`}
                />
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {entries.map(([key, count]) => {
              const tone = getStatusTone(key);
              return (
                <li key={key} className="flex items-center gap-1.5 text-sm">
                  <span className={`h-1.5 w-1.5 rounded-full ${toneDotClass(tone)}`} />
                  <span className="capitalize text-gray-600">{key.replace(/_/g, " ")}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function formatMoney(value: number, currency = "GHS") {
  return `${currency} ${value.toLocaleString()}`;
}

export function ListingReportView({ report }: { report: ListingReport }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-10">
      <div className="flex gap-8 sm:flex-col sm:gap-5">
        <HeroStat value={report.total_properties} label="Total properties" />
        <SecondaryStat value={`${Math.round(report.avg_completion_percent)}%`} label="Avg. completion" />
      </div>
      <Breakdown title="By status" data={report.by_status} />
    </div>
  );
}

export function SalesReportView({ report }: { report: SalesReport }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-10">
      <div className="flex gap-8 sm:flex-col sm:gap-5">
        <HeroStat value={report.total_leads} label="Total leads" />
        <SecondaryStat value={report.total_clients} label="Clients" />
        <SecondaryStat
          value={report.overdue_followups}
          label="Overdue follow-ups"
          tone={report.overdue_followups > 0 ? "attention" : "neutral"}
        />
      </div>
      <Breakdown title="Leads by status" data={report.leads_by_status} />
    </div>
  );
}

export function MarketingReportView({ report }: { report: MarketingReport }) {
  const { performance } = report;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,320px)_1fr] sm:gap-10">
      <div className="flex flex-col gap-5">
        <HeroStat value={report.total_campaigns} label="Total campaigns" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <SecondaryStat value={performance.views} label="Views" />
          <SecondaryStat value={performance.enquiries} label="Enquiries" />
          <SecondaryStat value={performance.leads_generated} label="Leads generated" tone="good" />
          <SecondaryStat value={performance.viewings_booked} label="Viewings booked" />
          <SecondaryStat value={performance.conversions} label="Conversions" tone="good" />
        </div>
      </div>
      <Breakdown title="Campaigns by status" data={report.by_status} />
    </div>
  );
}

export function FinanceReportView({ report }: { report: FinanceReport }) {
  const { commission } = report;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,320px)_1fr] sm:gap-10">
      <div className="flex flex-col gap-5">
        <HeroStat value={report.total_transactions} label="Total transactions" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <SecondaryStat value={formatMoney(commission.expected)} label="Expected commission" />
          <SecondaryStat value={formatMoney(commission.received)} label="Received" tone="good" />
          <SecondaryStat
            value={formatMoney(commission.outstanding)}
            label="Outstanding"
            tone={commission.outstanding > 0 ? "attention" : "neutral"}
          />
          <SecondaryStat value={formatMoney(commission.agent_share)} label="Agent share" />
          <SecondaryStat value={formatMoney(commission.company_share)} label="Company share" />
        </div>
      </div>
      <Breakdown title="Transactions by status" data={report.by_status} />
    </div>
  );
}

export function OperationsReportView({ report }: { report: OperationsReport }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-10">
      <div className="flex gap-8 sm:flex-col sm:gap-5">
        <HeroStat value={report.total_tasks} label="Total tasks" />
        <SecondaryStat
          value={report.overdue_tasks}
          label="Overdue tasks"
          tone={report.overdue_tasks > 0 ? "attention" : "neutral"}
        />
      </div>
      <Breakdown title="Tasks by status" data={report.by_status} />
    </div>
  );
}
