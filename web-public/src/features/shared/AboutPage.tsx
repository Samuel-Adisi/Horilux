import { Building2, Home, ShieldCheck, Users2 } from "lucide-react";

const STATS = [
  { value: "100+", label: "Properties Managed" },
  { value: "6", label: "Departments, One Platform" },
  { value: "100%", label: "GH₵-Native Workflow" },
  { value: "24/7", label: "Real-Time Operations" },
];

const PILLARS = [
  {
    icon: Building2,
    title: "Built for the Full Property Lifecycle",
    body:
      "From first listing to closed transaction, Horilux tracks every property, lead, viewing, and deal in one system — so nothing falls through the cracks between departments.",
  },
  {
    icon: Users2,
    title: "One Platform, Every Team",
    body:
      "Listing, Sales, Marketing, Finance, and Operations each work from role-based consoles built around how they actually work — not a generic dashboard bolted onto a spreadsheet.",
  },
  {
    icon: ShieldCheck,
    title: "Accountability by Design",
    body:
      "Every action is tied to a role and an audit trail. Leadership sees real activity across the business, not a summary someone compiled the night before.",
  },
  {
    icon: Home,
    title: "Made for the Ghanaian Market",
    body:
      "Pricing, workflows, and reporting run in Ghana Cedis from the ground up — built around how real estate actually moves in Accra and beyond, not adapted from a foreign template.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-[#240270] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            About Horilux
          </p>
          <h1 className="mt-4 max-w-3xl text-2xl sm:text-4xl md:text-6xl font-bold leading-tight">
            A Real Estate Operating System, built from the ground up.
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-white/80">
            Horilux exists because real estate businesses don't run on listings alone.
            They run on leads, viewings, contracts, finance, and follow-through — all
            happening at once, across teams that rarely see the same picture. We built
            Horilux to be that picture.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#240270]">
                {stat.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
              Why we built this
            </h2>
          </div>
          <div className="md:col-span-2 space-y-5 text-neutral-600 text-base sm:text-lg leading-relaxed">
            <p>
              Most real estate teams operate across a patchwork of spreadsheets, phone
              calls, and disconnected tools — one for listings, another for leads,
              a notebook for viewings, and finance finding out about a closed deal days
              later. Horilux was built to close that gap.
            </p>
            <p>
              We built Horilux as a complete operating system for real estate
              businesses: a shared source of truth where Listing, Sales, Marketing,
              Finance, and Operations all work from the same live data, with the roles,
              permissions, and reporting that a real company — not a demo —
              actually needs.
            </p>
            <p>
              Every property, lead, viewing, and transaction on this platform runs
              through the same system your team uses internally every day. This
              website is the public front door to that operating system — the
              same platform, the same data, built for the people looking for their
              next home.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 max-w-xl">
            What makes Horilux different
          </h2>
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="flex gap-4">
                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#240270]/10 text-[#240270]">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-base sm:text-lg">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#003E03] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Looking for a property, or a partner?
            </h2>
            <p className="mt-2 text-white/80 max-w-xl">
              Browse live listings, or reach out to our team directly — we're
              building this platform in the open, one property and one client at a
              time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="/listings"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-[#003E03] hover:bg-white/90 transition"
            >
              View Listings
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
