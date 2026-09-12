import type { LucideIcon } from "lucide-react";

export interface PillMetric {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  note: string;
  noteColor: string;
  value: string;
}

export interface BreakdownRow {
  label: string;
  shortLabel: string;
  value: string;
  percent: number;
  barGradient: string;
  legendBg: string;
  legendText: string;
}

export interface DepartmentSectionProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  tabs: string[];
  activeTabIndex?: number;
  exportLabel?: string;
  exportIcon: LucideIcon;

  heroGradient: string;
  heroIcon: LucideIcon;
  heroLabel: string;
  heroValue: string;
  heroSubLabel: string;
  heroSubValue: string;
  heroBadgeIcon: LucideIcon;
  heroBadgeText: string;

  pills: PillMetric[];

  breakdownTitle: string;
  breakdownSubtitle: string;
  breakdownTotalLabel: string;
  rows: BreakdownRow[];
}

export function DepartmentSection({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  tabs,
  activeTabIndex = 1,
  exportLabel = "Export Data",
  exportIcon: ExportIcon,
  heroGradient,
  heroIcon: HeroIcon,
  heroLabel,
  heroValue,
  heroSubLabel,
  heroSubValue,
  heroBadgeIcon: HeroBadgeIcon,
  heroBadgeText,
  pills,
  breakdownTitle,
  breakdownSubtitle,
  breakdownTotalLabel,
  rows,
}: DepartmentSectionProps) {
  return (
    <section className="flex flex-col gap-space-lg rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col gap-space-md pb-space-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-space-md">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-[22px] w-[22px] ${iconColor}`} strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
              {title}
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-space-xs self-start rounded-xl bg-surface-container-low p-1 md:self-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={
                i === activeTabIndex
                  ? "rounded-lg bg-surface-container-lowest px-3 py-1.5 font-headline-md text-body-sm text-on-surface shadow-sm transition-colors"
                  : "rounded-lg px-3 py-1.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
              }
            >
              {tab}
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-outline-variant/40" />
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 py-1.5 font-body-sm text-body-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
          >
            <ExportIcon className="h-4 w-4 text-secondary" strokeWidth={2} />
            <span>{exportLabel}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:col-span-4">
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${heroGradient} p-space-lg text-on-primary shadow-md`}
          >
            <div className="mb-space-sm flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-white/70">
                {heroLabel}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                <HeroIcon className="h-[18px] w-[18px] text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="font-display-hero text-[34px] font-bold leading-tight text-on-primary">
              {heroValue}
            </div>
            <div className="mt-space-md flex items-center justify-between border-t border-white/10 pt-space-sm text-white/80">
              <span className="font-body-sm text-body-sm">{heroSubLabel}</span>
              <span className="font-data-mono text-data-mono font-semibold text-white">
                {heroSubValue}
              </span>
            </div>
            <div className="mt-space-sm inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-data-mono text-data-mono text-white">
              <HeroBadgeIcon className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{heroBadgeText}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {pills.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center justify-between rounded-xl bg-surface-container-low p-3.5 transition-colors hover:bg-surface-container-high"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${pill.iconBg} ${pill.iconColor}`}>
                    <pill.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-body-md font-medium text-on-surface">
                      {pill.label}
                    </span>
                    <span className={`font-data-mono text-data-mono ${pill.noteColor}`}>
                      {pill.note}
                    </span>
                  </div>
                </div>
                <span className="font-metric-stat text-[20px] font-bold text-on-surface">
                  {pill.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low/60 p-space-lg lg:col-span-8">
          <div>
            <div className="mb-space-md flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
                  {breakdownTitle}
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">{breakdownSubtitle}</p>
              </div>
              <span className="rounded bg-surface-container-high px-2.5 py-1 font-data-mono text-data-mono font-medium text-on-surface">
                {breakdownTotalLabel}
              </span>
            </div>

            <div className="flex flex-col gap-4 py-space-sm">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-body-sm font-medium">
                    <span className="font-semibold text-on-surface">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-data-mono text-data-mono text-secondary">{row.value}</span>
                      <span className="w-12 text-right font-data-mono text-data-mono font-bold text-on-surface">
                        {row.percent}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.barGradient}`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-space-md grid grid-cols-2 gap-space-sm sm:grid-cols-3 xl:grid-cols-5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
              >
                <span className="truncate font-body-sm text-[12px] text-secondary">
                  {row.shortLabel}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-metric-stat text-[18px] font-bold text-on-surface">
                    {row.value}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 font-data-mono text-[11px] font-semibold ${row.legendBg} ${row.legendText}`}>
                    {row.percent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className={`h-full bg-gradient-to-r ${row.barGradient}`}
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
