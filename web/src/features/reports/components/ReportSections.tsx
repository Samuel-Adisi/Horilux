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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Tone = "neutral" | "positive" | "attention" | "brand";

const TONE_STYLES: Record<Tone, { text: string; bg: string; ring: string }> = {
  neutral: { text: "text-gray-900", bg: "bg-gray-50", ring: "ring-gray-200" },
  positive: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  attention: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  brand: { text: "text-midnight", bg: "bg-midnight/5", ring: "ring-midnight/10" },
};

const PALETTE = ["#1e1b4b", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e"];

function HeroStat({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ${t.ring}`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${t.bg}`}>
        <Icon className={`h-5 w-5 ${t.text}`} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatCard({
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${t.text}`} strokeWidth={2.5} />
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      </div>
      <p className={`mt-2 text-xl font-semibold ${t.text}`}>{value}</p>
    </div>
  );
}

function BreakdownChart({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const chartData = entries.map(([key, value]) => ({
    name: key.replace(/_/g, " "),
    value,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
          <div className="mx-auto h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="100%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const num = typeof value === "number" ? value : 0;
                    const pct = total === 0 ? 0 : Math.round((num / total) * 100);
                    return [`${num} (${pct}%)`, String(name)] as [string, string];
                  }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2.5">
            {entries.map(([key, count], i) => {
              const pct = total === 0 ? 0 : Math.round((count / total) * 100);
              return (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-semibold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatMoney(value: number, currency = "GHS") {
  return `${currency} ${value.toLocaleString()}`;
}

export function ListingReportView({ report }: { report: ListingReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-8">
      <div className="flex gap-4 sm:flex-col">
        <HeroStat icon={Home} label="Total Properties" value={report.total_properties} />
        <StatCard
          icon={TrendingUp}
          label="Avg Completion"
          value={`${Math.round(report.avg_completion_percent)}%`}
          tone="positive"
        />
      </div>
      <BreakdownChart title="By Status" data={report.by_status} />
    </div>
  );
}

export function SalesReportView({ report }: { report: SalesReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-8">
      <div className="flex gap-4 sm:flex-col">
        <HeroStat icon={Users} label="Total Leads" value={report.total_leads} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          <StatCard icon={UserCheck} label="Total Clients" value={report.total_clients} tone="positive" />
          <StatCard
            icon={AlertTriangle}
            label="Overdue Follow-ups"
            value={report.overdue_followups}
            tone={report.overdue_followups > 0 ? "attention" : "neutral"}
          />
        </div>
      </div>
      <BreakdownChart title="Leads by Status" data={report.leads_by_status} />
    </div>
  );
}

export function MarketingReportView({ report }: { report: MarketingReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-8">
      <div className="flex flex-col gap-4">
        <HeroStat icon={Megaphone} label="Total Campaigns" value={report.total_campaigns} />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Eye} label="Views" value={report.performance.views} />
          <StatCard icon={MessageSquare} label="Enquiries" value={report.performance.enquiries} />
          <StatCard icon={Target} label="Leads Generated" value={report.performance.leads_generated} tone="positive" />
          <StatCard icon={CalendarCheck} label="Viewings Booked" value={report.performance.viewings_booked} />
          <StatCard icon={CheckCircle2} label="Conversions" value={report.performance.conversions} tone="positive" />
        </div>
      </div>
      <BreakdownChart title="Campaigns by Status" data={report.by_status} />
    </div>
  );
}

export function FinanceReportView({ report }: { report: FinanceReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-8">
      <div className="flex flex-col gap-4">
        <HeroStat icon={Receipt} label="Total Transactions" value={report.total_transactions} />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Wallet} label="Expected" value={formatMoney(report.commission.expected)} />
          <StatCard icon={PiggyBank} label="Received" value={formatMoney(report.commission.received)} tone="positive" />
          <StatCard
            icon={AlertTriangle}
            label="Outstanding"
            value={formatMoney(report.commission.outstanding)}
            tone={report.commission.outstanding > 0 ? "attention" : "neutral"}
          />
          <StatCard icon={Users} label="Agent Share" value={formatMoney(report.commission.agent_share)} />
          <StatCard icon={Home} label="Company Share" value={formatMoney(report.commission.company_share)} />
        </div>
      </div>
      <BreakdownChart title="Transactions by Status" data={report.by_status} />
    </div>
  );
}

export function OperationsReportView({ report }: { report: OperationsReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-8">
      <div className="flex gap-4 sm:flex-col">
        <HeroStat icon={ClipboardList} label="Total Tasks" value={report.total_tasks} />
        <StatCard
          icon={Clock}
          label="Overdue Tasks"
          value={report.overdue_tasks}
          tone={report.overdue_tasks > 0 ? "attention" : "neutral"}
        />
      </div>
      <BreakdownChart title="Tasks by Status" data={report.by_status} />
    </div>
  );
}
