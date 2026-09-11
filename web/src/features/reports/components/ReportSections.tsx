import type {
  ListingReport,
  SalesReport,
  MarketingReport,
  FinanceReport,
  OperationsReport,
} from "../types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function BreakdownList({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-3 text-xs uppercase text-gray-500">{title}</p>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ul className="space-y-1.5">
          {entries.map(([key, count]) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="capitalize text-gray-600">{key.replace(/_/g, " ")}</span>
              <span className="font-medium text-gray-900">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatMoney(value: number, currency = "GHS") {
  return `${currency} ${value.toLocaleString()}`;
}

export function ListingReportView({ report }: { report: ListingReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Properties" value={report.total_properties} />
      <StatCard label="Avg Completion" value={`${Math.round(report.avg_completion_percent)}%`} />
      <BreakdownList title="By Status" data={report.by_status} />
    </div>
  );
}

export function SalesReportView({ report }: { report: SalesReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Leads" value={report.total_leads} />
      <StatCard label="Total Clients" value={report.total_clients} />
      <StatCard label="Overdue Follow-ups" value={report.overdue_followups} />
      <BreakdownList title="Leads by Status" data={report.leads_by_status} />
    </div>
  );
}

export function MarketingReportView({ report }: { report: MarketingReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Campaigns" value={report.total_campaigns} />
      <StatCard label="Views" value={report.performance.views} />
      <StatCard label="Enquiries" value={report.performance.enquiries} />
      <StatCard label="Leads Generated" value={report.performance.leads_generated} />
      <StatCard label="Viewings Booked" value={report.performance.viewings_booked} />
      <StatCard label="Conversions" value={report.performance.conversions} />
      <BreakdownList title="Campaigns by Status" data={report.by_status} />
    </div>
  );
}

export function FinanceReportView({ report }: { report: FinanceReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Transactions" value={report.total_transactions} />
      <StatCard label="Expected Commission" value={formatMoney(report.commission.expected)} />
      <StatCard label="Received" value={formatMoney(report.commission.received)} />
      <StatCard label="Outstanding" value={formatMoney(report.commission.outstanding)} />
      <StatCard label="Agent Share" value={formatMoney(report.commission.agent_share)} />
      <StatCard label="Company Share" value={formatMoney(report.commission.company_share)} />
      <BreakdownList title="Transactions by Status" data={report.by_status} />
    </div>
  );
}

export function OperationsReportView({ report }: { report: OperationsReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Tasks" value={report.total_tasks} />
      <StatCard label="Overdue Tasks" value={report.overdue_tasks} />
      <BreakdownList title="Tasks by Status" data={report.by_status} />
    </div>
  );
}
