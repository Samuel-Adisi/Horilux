import { Building2, Users, Megaphone, Wallet, ClipboardList } from "lucide-react";
import { useReport } from "../hooks/use-report";
import {
  ListingReportView,
  SalesReportView,
  MarketingReportView,
  FinanceReportView,
  OperationsReportView,
} from "./ReportSections";

const SECTIONS = [
  { key: "listing", title: "Listing", icon: Building2, View: ListingReportView },
  { key: "sales", title: "Sales", icon: Users, View: SalesReportView },
  { key: "marketing", title: "Marketing", icon: Megaphone, View: MarketingReportView },
  { key: "finance", title: "Finance", icon: Wallet, View: FinanceReportView },
  { key: "operations", title: "Operations", icon: ClipboardList, View: OperationsReportView },
] as const;

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
      <div className="divide-y divide-gray-100">
        {SECTIONS.map(({ key, title, icon: Icon, View }) => (
          <section key={key} className="py-8 first:pt-0">
            <div className="mb-5 flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-midnight" strokeWidth={2} />
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            </div>
            <View report={dashboard[key] as never} />
          </section>
        ))}
      </div>
    );
  }

  const { department, report } = result;
  if (!report) return null;
  const section = SECTIONS.find((s) => s.key === department);
  if (!section) return null;
  const { icon: Icon, title, View } = section;

  return (
    <div>
      <div className="mb-5 flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-midnight" strokeWidth={2} />
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <View report={report as never} />
    </div>
  );
}
