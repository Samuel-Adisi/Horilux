import { useReport } from "../hooks/use-report";
import {
  ListingReportView,
  SalesReportView,
  MarketingReportView,
  FinanceReportView,
  OperationsReportView,
} from "./ReportSections";

const SECTION_TITLES: Record<string, string> = {
  listing: "Listing",
  sales: "Sales",
  marketing: "Marketing",
  finance: "Finance",
  operations: "Operations",
};

export function ReportsPage() {
  const result = useReport();

  if (result.isLoading) {
    return <p className="text-sm text-gray-500">Loading report…</p>;
  }

  if (result.isError) {
    return <p className="text-sm text-red-600">Failed to load report.</p>;
  }

  if (result.mode === "dashboard") {
    const dashboard = result.dashboard;
    if (!dashboard) return null;

    return (
      <div>
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">{SECTION_TITLES.listing}</h2>
            <ListingReportView report={dashboard.listing} />
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">{SECTION_TITLES.sales}</h2>
            <SalesReportView report={dashboard.sales} />
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">{SECTION_TITLES.marketing}</h2>
            <MarketingReportView report={dashboard.marketing} />
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">{SECTION_TITLES.finance}</h2>
            <FinanceReportView report={dashboard.finance} />
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">{SECTION_TITLES.operations}</h2>
            <OperationsReportView report={dashboard.operations} />
          </section>
        </div>
      </div>
    );
  }

  const { department, report } = result;
  if (!report) return null;

  return (
    <div>
      {department === "listing" && <ListingReportView report={report as never} />}
      {department === "sales" && <SalesReportView report={report as never} />}
      {department === "marketing" && <MarketingReportView report={report as never} />}
      {department === "finance" && <FinanceReportView report={report as never} />}
      {department === "operations" && <OperationsReportView report={report as never} />}
    </div>
  );
}
