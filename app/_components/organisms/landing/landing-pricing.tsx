import { Button } from "@/app/_components/atoms/button";
import { Icon } from "@/app/_components/atoms/icon";
import { SectionLabel } from "@/app/_components/atoms/misc";
import { DemoButton } from "./demo-button";

const plans = [
  {
    name: "Fieldwork",
    price: "$0",
    cadence: "forever",
    description: "For small teams testing the waters.",
    features: [
      "3 active surveys",
      "100 responses per month",
      "Beautiful survey themes",
      "CSV export",
    ],
    cta: "Start for free",
    featured: false,
  },
  {
    name: "Studio",
    price: "$24",
    cadence: "per month",
    description: "For teams who research often.",
    features: [
      "Unlimited surveys",
      "2,500 responses per month",
      "Full analytics and insights",
      "Custom accents and thank-you pages",
      "Email capture and CSV / JSON export",
    ],
    cta: "Choose Studio",
    featured: true,
  },
  {
    name: "Scale",
    price: "$79",
    cadence: "per month",
    description: "For research across the organisation.",
    features: [
      "Everything in Studio",
      "10,000 responses per month",
      "Advanced response comparison",
      "Priority support",
      "Centralised workspace settings",
    ],
    cta: "Choose Scale",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-line/70 bg-cream/35">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-18 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <SectionLabel>05 â€” Pricing</SectionLabel>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.2vw,3.15rem)] leading-[1.04] tracking-[-0.035em]">
            Simple pricing, no surprises.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[14px] leading-relaxed text-ink-soft">
            Start free, upgrade when research becomes a habit. Every plan includes the full
            builder and a genuinely pleasant respondent experience.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 sm:p-6 ${
                plan.featured
                  ? "border-forest-deep bg-forest-deep text-cream shadow-lift"
                  : "border-line bg-surface shadow-soft"
              }`}
            >
              {plan.featured && (
                <>
                  <div className="gradient-forest pointer-events-none absolute inset-0" aria-hidden="true" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.07] line-grid" aria-hidden="true" />
                </>
              )}

              <div className="relative flex items-center justify-between">
                <h3
                  className={`font-display text-[21px] tracking-tight ${
                    plan.featured ? "text-cream" : "text-ink"
                  }`}
                >
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span className="rounded-full bg-coral px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-white">
                    Most popular
                  </span>
                )}
              </div>

              <div className="relative mt-4 flex items-baseline gap-1.5">
                <span
                  className={`font-display text-[44px] leading-none tracking-[-0.04em] ${
                    plan.featured ? "text-cream" : "text-ink"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-[11px] ${plan.featured ? "text-cream/55" : "text-ink-faint"}`}
                >
                  {plan.cadence}
                </span>
              </div>

              <p
                className={`relative mt-3 text-[12.5px] leading-relaxed ${
                  plan.featured ? "text-cream/65" : "text-ink-soft"
                }`}
              >
                {plan.description}
              </p>

              <div
                className={`relative my-5 h-px ${plan.featured ? "bg-cream/15" : "bg-line"}`}
                aria-hidden="true"
              />

              <ul className="relative flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        plan.featured ? "bg-cream/10 text-cream" : "bg-forest-soft text-forest"
                      }`}
                    >
                      <Icon name="check" size={9} />
                    </span>
                    <span
                      className={`text-[12px] leading-relaxed ${
                        plan.featured ? "text-cream/80" : "text-ink-soft"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-6">
                <Button href="/register" variant={plan.featured ? "cream" : "outline"} fullWidth>
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-ink-faint">
          <Icon name="info" size={12} />
          Preview pricing only â€” this demo does not connect to billing or collect payment.
        </p>
      </div>
    </section>
  );
}

const questions = [
  {
    question: "Do I need an account to try SurveyLand?",
    answer:
      "Not at all. The demo tour signs you into a local workspace instantly. Signing in and registering are also self-contained demo flows â€” no email is sent and no account is created on a server.",
  },
  {
    question: "Where is my survey data stored?",
    answer:
      "In this build, everything lives in your browser's localStorage. There is no external database, no tracking, and no server receiving your responses. Clearing site data resets the workspace.",
  },
  {
    question: "Can I export what I collect?",
    answer:
      "Yes. The Responses workspace includes CSV and JSON export so you can take answers into a spreadsheet or another tool whenever you like.",
  },
  {
    question: "What can I customise in a survey?",
    answer:
      "Title, description, questions, answer types, required fields, accent colour, progress display, email capture, and the entire thank-you message. The builder preview updates as you go.",
  },
  {
    question: "How do I start over?",
    answer:
      "Open Settings from the workspace and choose Reset demo data. That restores the original eight surveys, 1,196 responses, and sample activity.",
  },
  {
    question: "Is this connected to a real backend?",
    answer:
      "No â€” and the interface says so in the places that matter. SurveyLand is a polished front-end demonstration. Workflows are real and persistent in your browser, but there is no billing, email delivery, or remote API.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-line/70">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-18 sm:px-8 sm:py-24 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <SectionLabel>06 â€” Good to know</SectionLabel>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.04] tracking-[-0.035em]">
            Questions, answered.
          </h2>
          <p className="mt-4 max-w-[320px] text-[14px] leading-relaxed text-ink-soft">
            Clear answers about how this demo behaves, where the data goes, and what is real.
          </p>
          <div className="mt-6">
            <DemoButton label="See it for yourself" variant="outline" size="sm" icon={false} />
          </div>
          <div className="mt-8 hidden items-center gap-2 rounded-lg border border-line bg-cream/60 px-3 py-2.5 lg:flex">
            <Icon name="shield" size={15} className="shrink-0 text-forest" />
            <p className="text-[10.5px] leading-relaxed text-ink-faint">
              No trackers. No remote storage. Your demo stays in this browser.
            </p>
          </div>
        </div>

        <div className="divide-y divide-line border-t border-line">
          {questions.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 marker:hidden">
                <span className="text-[13.5px] font-medium leading-relaxed text-ink">
                  {item.question}
                </span>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-faint transition-[transform,background-color,color] duration-200 group-open:rotate-45 group-open:border-forest/20 group-open:bg-forest-soft group-open:text-forest">
                  <Icon name="plus" size={12} />
                </span>
              </summary>
              <p className="max-w-[620px] pb-5 pr-10 text-[12.5px] leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
