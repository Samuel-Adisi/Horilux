import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  ClipboardList,
  BarChart3,
  Radar,
  Lock,
  SettingsIcon,
  Building,
  Home,
  Landmark,
  Megaphone,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReport } from "../hooks/use-report";
import {
  ListingReportView,
  SalesReportView,
  MarketingReportView,
  FinanceReportView,
  OperationsReportView,
} from "./ReportSections";
import {
  StitchKpiRow,
  StitchListingSection,
  StitchEscrowStream,
} from "./StitchListingSection";

const SECTIONS = [
  {
    key: "listing",
    title: "Listing & Inventory Intelligence",
    subtitle: "Property portfolio overview and turnover velocity",
    icon: Home,
    kpiIcon: Building2,
    watermarkIcon: Building,
    gradient: "from-[#0b132b] via-[#1c2541] to-[#3a506b]",
    View: ListingReportView,
    valueKey: "total_properties" as const,
  },
  {
    key: "sales",
    title: "Sales & Acquisitions",
    subtitle: "Gross transaction volume and settlement velocity",
    icon: Wallet,
    kpiIcon: ShieldCheck,
    watermarkIcon: BarChart3,
    gradient: "from-[#1e40af] via-[#2563eb] to-[#38bdf8]",
    View: SalesReportView,
    valueKey: "total_leads" as const,
  },
  {
    key: "marketing",
    title: "Marketing & Lead Acquisition",
    subtitle: "Campaign conversion and channel reach",
    icon: Megaphone,
    kpiIcon: CheckCircle2,
    watermarkIcon: Radar,
    gradient: "from-[#065f46] via-[#059669] to-[#34d399]",
    View: MarketingReportView,
    valueKey: "total_campaigns" as const,
  },
  {
    key: "finance",
    title: "Finance & Commissions",
    subtitle: "Revenue, commission, and settlement tracking",
    icon: Landmark,
    kpiIcon: Receipt,
    watermarkIcon: Lock,
    gradient: "from-[#92400e] via-[#d97706] to-[#fbbf24]",
    View: FinanceReportView,
    valueKey: "total_transactions" as const,
  },
  {
    key: "operations",
    title: "Operations & Workflow",
    subtitle: "Task health and workflow compliance",
    icon: ClipboardList,
    kpiIcon: CheckCircle2,
    watermarkIcon: SettingsIcon,
    gradient: "from-[#581c87] via-[#7c3aed] to-[#a855f7]",
    View: OperationsReportView,
    valueKey: "total_tasks" as const,
  },
] as const;

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-midnight/10">
        <Icon className="h-5 w-5 text-midnight" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-gray-50 p-6">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function ReportsPage() {
  const result = useReport();

  if (result.isLoading) {
    return <ReportSkeleton />;
  }

  if (result.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load report. Please try again.
      </div>
    );
  }

  if (result.mode === "dashboard") {
    const dashboard = result.dashboard;
    if (!dashboard) return null;

    return (
      <div className="space-y-8 px-6 py-6 lg:px-10 lg:py-8">
        <StitchKpiRow
          listingTotal={dashboard.listing.total_properties}
          salesLeadsTotal={dashboard.sales.total_leads}
          marketingCampaignsTotal={dashboard.marketing.total_campaigns}
          financeTransactionsTotal={dashboard.finance.total_transactions}
          operationsTasksTotal={dashboard.operations.total_tasks}
        />

        <StitchListingSection report={dashboard.listing} />

        {/* Sales, Marketing, Finance, Operations: still on the generic
            data-driven views until their Stitch ports are wired (they
            reference fields — commission rate, CAC, escrow velocity —
            that don't exist in these report types yet). */}
        {SECTIONS.filter((s) => s.key !== "listing").map(
          ({ key, title, subtitle, icon: Icon, View }) => (
            <section key={key} className="rounded-2xl bg-white p-6 shadow-sm sm:p-7">
              <SectionHeader icon={Icon} title={title} subtitle={subtitle} />
              <View report={dashboard[key] as never} />
            </section>
          )
        )}

        <StitchEscrowStream />
      </div>
    );
  }

  const { department, report } = result;
  if (!report) return null;

  if (department === "listing") {
    return (
      <div className="px-6 py-6 lg:px-10 lg:py-8">
        <StitchListingSection report={report as never} />
      </div>
    );
  }

  const section = SECTIONS.find((s) => s.key === department);
  if (!section) return null;
  const { icon: Icon, title, subtitle, View } = section;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-7 mx-6 my-6 lg:mx-10 lg:my-8">
      <SectionHeader icon={Icon} title={title} subtitle={subtitle} />
      <View report={report as never} />
    </div>
  );
}
