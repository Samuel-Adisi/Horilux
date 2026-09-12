import type {
  ListingReport,
  SalesReport,
  MarketingReport,
  FinanceReport,
  OperationsReport,
} from "../types";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  TrendingUp,
  Users,
  UserCheck,
  AlertTriangle,
  Eye,
  MessageSquare,
  Target,
  CalendarCheck,
  CheckCircle2,
  Receipt,
  Wallet,
  PiggyBank,
  ClipboardList,
  Clock,
  Megaphone,
} from "lucide-react";

type Tone = "neutral" | "positive" | "attention" | "brand";

const TONE_STYLES: Record<Tone, { text: string; bg: string }> = {
  neutral: { text: "text-gray-700", bg: "bg-gray-100" },
  positive: { text: "text-emerald-700", bg: "bg-emerald-50" },
  attention: { text: "text-amber-700", bg: "bg-amber-50" },
  brand: { text: "text-midnight", bg: "bg-midnight/5" },
};

/** Gradient used for the department's hero card + KPI accents */
const GRADIENTS: Record<string, string> = {
  listing: "from-[#0b132b] via-[#1c2541] to-[#3a506b]",
  sales: "from-[#1e40af] via-[#2563eb] to-[#38bdf8]",
  marketing: "from-[#065f46] via-[#059669] to-[#34d399]",
  finance: "from-[#92400e] via-[#d97706] to-[#fbbf24]",
  operations: "from-[#581c87] via-[#7c3aed] to-[#a855f7]",
};

/** Color pairs cycled across breakdown rows (bar fill + legend chip tint) */
const PALETTE = [
  { solid: "#0f172a", light: "#3b82f6", chipBg: "bg-slate-100", chipText: "text-slate-800" },
  { solid: "#ea580c", light: "#f97316", chipBg: "bg-orange-100", chipText: "text-orange-800" },
  { solid: "#d97706", light: "#fbbf24", chipBg: "bg-amber-100", chipText: "text-amber-800" },
  { solid: "#0284c7", light: "#38bdf8", chipBg: "bg-sky-100", chipText: "text-sky-800" },
  { solid: "#059669", light: "#10b981", chipBg: "bg-emerald-100", chipText: "text-emerald-800" },
  { solid: "#7c3aed", light: "#a78bfa", chipBg: "bg-purple-100", chipText: "text-purple-800" },
];

/** Gradient hero card — big number, icon badge, department-colored */
function HeroCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-white/70">
          {label}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
          <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.25} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

/** Compact metric row with round icon badge, used inside side panels */
function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3.5 transition-colors hover:bg-gray-100">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.bg}`}>
          <Icon className={`h-[18px] w-[18px] ${t.text}`} strokeWidth={2.25} />
        </div>
        <p className="truncate text-sm font-medium text-gray-700">{label}</p>
      </div>
      <p className="shrink-0 text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}

/** Horizontal breakdown bars + legend chip deck, driven by a dynamic Record<string, number> */
function BreakdownBars({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-bold text-gray-900">{title}</p>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-100">
          {total} total
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">No data yet</p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {entries.map(([key, count], i) => {
              const pct = total === 0 ? 0 : Math.round((count / total) * 100);
              const c = PALETTE[i % PALETTE.length];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="capitalize text-gray-800">{key.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{count}</span>
                      <span className="w-10 text-right font-bold text-gray-900">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${c.solid}, ${c.light})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {entries.map(([key, count], i) => {
              const pct = total === 0 ? 0 : Math.round((count / total) * 100);
              const c = PALETTE[i % PALETTE.length];
              return (
                <div key={key} className="flex flex-col justify-between rounded-xl bg-white p-3.5 shadow-sm">
                  <span className="truncate text-xs capitalize text-gray-400">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${c.chipBg} ${c.chipText}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c.solid}, ${c.light})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <HeroCard icon={Home} label="Total Properties" value={report.total_properties} gradient={GRADIENTS.listing} />
        <MiniStat
          icon={TrendingUp}
          label="Average completion"
          value={`${Math.round(report.avg_completion_percent)}%`}
          tone="positive"
        />
      </div>
      <div className="lg:col-span-2">
        <BreakdownBars title="Properties by Status" data={report.by_status} />
      </div>
    </div>
  );
}

export function SalesReportView({ report }: { report: SalesReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <HeroCard icon={Users} label="Total Leads" value={report.total_leads} gradient={GRADIENTS.sales} />
        <MiniStat icon={UserCheck} label="Clients" value={report.total_clients} tone="positive" />
        <MiniStat
          icon={AlertTriangle}
          label="Overdue follow-ups"
          value={report.overdue_followups}
          tone={report.overdue_followups > 0 ? "attention" : "neutral"}
        />
      </div>
      <div className="lg:col-span-2">
        <BreakdownBars title="Leads by Status" data={report.leads_by_status} />
      </div>
    </div>
  );
}

export function MarketingReportView({ report }: { report: MarketingReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <HeroCard icon={Megaphone} label="Total Campaigns" value={report.total_campaigns} gradient={GRADIENTS.marketing} />
        <MiniStat icon={Eye} label="Views" value={report.performance.views} />
        <MiniStat icon={MessageSquare} label="Enquiries" value={report.performance.enquiries} />
        <MiniStat icon={Target} label="Leads generated" value={report.performance.leads_generated} tone="positive" />
        <MiniStat icon={CalendarCheck} label="Viewings booked" value={report.performance.viewings_booked} />
        <MiniStat icon={CheckCircle2} label="Conversions" value={report.performance.conversions} tone="positive" />
      </div>
      <div className="lg:col-span-2">
        <BreakdownBars title="Campaigns by Status" data={report.by_status} />
      </div>
    </div>
  );
}

export function FinanceReportView({ report }: { report: FinanceReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <HeroCard icon={Receipt} label="Total Transactions" value={report.total_transactions} gradient={GRADIENTS.finance} />
        <MiniStat icon={Wallet} label="Expected" value={formatMoney(report.commission.expected)} />
        <MiniStat icon={PiggyBank} label="Received" value={formatMoney(report.commission.received)} tone="positive" />
        <MiniStat
          icon={AlertTriangle}
          label="Outstanding"
          value={formatMoney(report.commission.outstanding)}
          tone={report.commission.outstanding > 0 ? "attention" : "neutral"}
        />
        <MiniStat icon={Users} label="Agent share" value={formatMoney(report.commission.agent_share)} />
        <MiniStat icon={Home} label="Company share" value={formatMoney(report.commission.company_share)} tone="brand" />
      </div>
      <div className="lg:col-span-2">
        <BreakdownBars title="Transactions by Status" data={report.by_status} />
      </div>
    </div>
  );
}

export function OperationsReportView({ report }: { report: OperationsReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <HeroCard icon={ClipboardList} label="Total Tasks" value={report.total_tasks} gradient={GRADIENTS.operations} />
        <MiniStat
          icon={Clock}
          label="Overdue tasks"
          value={report.overdue_tasks}
          tone={report.overdue_tasks > 0 ? "attention" : "neutral"}
        />
      </div>
      <div className="lg:col-span-2">
        <BreakdownBars title="Tasks by Status" data={report.by_status} />
      </div>
    </div>
  );
}
