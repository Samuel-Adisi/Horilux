import { Link } from "react-router-dom";
import { Target, Eye, Gem, Check, ShieldCheck, Home, Users2, FileCheck, Settings2 } from "lucide-react";
import Reveal from "@/components/shared/Reveal";

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
];

const VALUES = ["Trust", "Transparency", "Integrity", "Honesty", "Customer-Centric"];

const WHY_CHOOSE = [
  { icon: ShieldCheck, label: "Verified & vetted properties" },
  { icon: Home, label: "Wide range of properties across Ghana" },
  { icon: Users2, label: "Expert guidance and support" },
  { icon: Settings2, label: "After-sales and property management" },
  { icon: FileCheck, label: "Secure and transparent transactions" },
  { icon: Users2, label: "A dedicated team that puts you first" },
];

function Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={"text-xs font-semibold uppercase tracking-[0.3em] " + (light ? "text-white/70" : "text-brand-taupe")}>
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(36,2,112,0.9), rgba(36,2,112,0.78)), url('/covers/cover-4.jpg')",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36 md:py-44">
          <Reveal>
            <Eyebrow light>About Horilux</Eyebrow>
            <h1 className="mt-5 max-w-3xl font-serif text-3xl leading-tight text-white sm:text-5xl md:text-6xl">
              More Than a Real Estate Company.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              We are a team, a process and a platform — built to make real estate simpler, safer and more rewarding for everyone.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-5 md:gap-16">
          <Reveal className="md:col-span-2">
            <Eyebrow>Our Story</Eyebrow>
            <h2 className="mt-4 font-serif text-2xl leading-snug text-brand-blue sm:text-3xl md:text-4xl">
              Built on Vision. Driven by People.
            </h2>
            <div className="mt-6 h-px w-16 bg-brand-taupe" />
          </Reveal>
          <Reveal delay={150} className="space-y-5 text-base leading-relaxed text-neutral-600 sm:text-lg md:col-span-3">
            <p>
              Horilux Estates was founded with a simple belief: real estate should create opportunity, build wealth and improve lives. What started as a passion for property has grown into a professional real estate company focused on delivering exceptional service, trusted partnerships and long-term value.
            </p>
            <p>
              We exist to connect people with the right properties — whether you're buying, selling, renting or investing. And we do it with integrity, transparency and a deep understanding of the Ghanaian real estate market.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {MVV.map((item, i) => (
            <Reveal key={item.title} delay={i * 120} className="h-full">
              <div className="h-full rounded-3xl border border-neutral-100 bg-cream p-8 shadow-xl shadow-neutral-200/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <item.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 font-serif text-xl text-brand-blue">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-600">{item.body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={240} className="h-full">
            <div className="h-full rounded-3xl bg-brand-blue p-8 text-white shadow-xl shadow-brand-blue/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                <Gem className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-xl">Our Values</h3>
              <ul className="mt-3 space-y-2">
                {VALUES.map((value) => (
                  <li key={value} className="flex items-center gap-2 text-white/85">
                    <Check className="h-4 w-4 shrink-0" />
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why Choose Horilux */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow>Why Choose Horilux</Eyebrow>
            <h2 className="mt-4 font-serif text-2xl uppercase tracking-[0.12em] text-brand-blue sm:text-3xl md:text-4xl">
              A Better Real Estate Experience.
            </h2>
            <p className="mt-6 leading-relaxed text-neutral-600">
              We combine local expertise with a structured, professional approach to give you more than just a property — we give you peace of mind. From your first enquiry to final handover, our team is with you every step of the way.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((item, i) => (
              <Reveal key={item.label} delay={(i % 3) * 100} className="h-full">
                <div className="flex h-full items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-neutral-800">{item.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="rounded-3xl bg-brand-green px-6 py-14 text-center text-white sm:px-12 md:py-20">
              <Eyebrow light>The Horilux Standard</Eyebrow>
              <h2 className="mt-4 font-serif text-2xl sm:text-3xl md:text-4xl">
                Your Goals. Our Commitment.
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/80">
                Whether you're looking for your dream home, a smart investment or a profitable rental, Horilux Estates is here to help you make the right move.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/listings"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 font-serif text-xs uppercase tracking-wider text-brand-green transition hover:bg-white/90"
                >
                  Explore Properties
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3.5 font-serif text-xs uppercase tracking-wider text-white transition hover:bg-white/10"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
