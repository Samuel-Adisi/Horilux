import { Target, Eye, Gem, Check, ShieldCheck, Home, Users2, FileCheck, Settings2 } from "lucide-react";

const MVV = [
  {
    icon: Target,
    title: "Our Mission",
    body:
      "To provide exceptional real estate services that create value, build wealth and make property ownership accessible and stress-free for our clients.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    body:
      "To be Ghana's most trusted and respected real estate company, known for professionalism, innovation and lasting impact.",
  },
]

const VALUES = ["Trust", "Transparency", "Integrity", "Honesty", "Customer-Centric"];

const WHY_CHOOSE = [
  { icon: ShieldCheck, label: "Verified & vetted properties" },
  { icon: Home, label: "Wide range of properties across Ghana" },
  { icon: Users2, label: "Expert guidance and support" },
  { icon: Settings2, label: "After-sales and property management" },
  { icon: FileCheck, label: "Secure and transparent transactions" },
  { icon: Users2, label: "A dedicated team that puts you first" },
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
            More Than a Real Estate Company.
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-white/80">
            We are a team, a process and a platform — built to make real estate simpler, safer and more rewarding for everyone.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#7A6D0C]">
              Our Story
            </p>
            <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
              Built on Vision. Driven by People.
            </h2>
          </div>
          <div className="md:col-span-2 space-y-5 text-neutral-600 text-base sm:text-lg leading-relaxed">
            <p>
              Horilux Estates was founded with a simple belief: real estate should create opportunity, build wealth and improve lives. What started as a passion for property has grown into a professional real estate company focused on delivering exceptional service, trusted partnerships and long-term value.
            </p>
            <p>
              We exist to connect people with the right properties — whether you're buying, selling, renting or investing. And we do it with integrity, transparency and a deep understanding of the Ghanaian real estate market.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-[#240270] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {MVV.map((item) => (
            <div key={item.title}>
              <item.icon className="h-7 w-7 text-[#7A6D0C]" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg sm:text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed">{item.body}</p>
            </div>
          ))}
          <div>
            <Gem className="h-7 w-7 text-[#7A6D0C]" strokeWidth={1.5} />
            <h3 className="mt-4 text-lg sm:text-xl font-bold">Our Values</h3>
            <ul className="mt-2 space-y-1.5">
              {VALUES.map((value) => (
                <li key={value} className="flex items-center gap-2 text-sm sm:text-base text-white/75">
                  <Check className="h-4 w-4 shrink-0 text-[#7A6D0C]" />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Horilux */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#7A6D0C]">
            Why Choose Horilux
          </p>
          <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 max-w-xl">
            A Better Real Estate Experience.
          </h2>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-600 leading-relaxed">
            We combine local expertise with a structured, professional approach to give you more than just a property — we give you peace of mind. From your first enquiry to final handover, our team is with you every step of the way.
          </p>
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {WHY_CHOOSE.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#240270]/10 text-[#240270]">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-sm sm:text-base text-neutral-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#003E03] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              The Horilux Standard
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold">
              Your Goals. Our Commitment.
            </h2>
            <p className="mt-2 text-white/80 max-w-xl">
              Whether you're looking for your dream home, a smart investment or a profitable rental, Horilux Estates is here to help you make the right move.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="/listings"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-[#003E03] hover:bg-white/90 transition"
            >
              Explore Properties
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

