import Link from "next/link";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { SectionLabel } from "@/components/atoms/misc";
import { DemoButton } from "./demo-button";

const steps = [
  {
    title: "Write with intent",
    copy: "Start from a blank page or a proven structure. Add choice questions, open text, required fields, and a thank-you that sounds like you.",
    tag: "Draft in minutes",
  },
  {
    title: "Meet people where they are",
    copy: "Publish a responsive link that works beautifully on any screen. No app install, no account required for respondents.",
    tag: "One link, everywhere",
  },
  {
    title: "Read between the lines",
    copy: "Watch responses arrive, compare completion, and see the themes behind the numbers. Then decide with confidence.",
    tag: "Decisions, not dashboards",
  },
];

const principles = [
  {
    title: "Respect the person",
    copy: "Short surveys, clear language, and no dark patterns. Asking for someone's time is a privilege.",
  },
  {
    title: "Design for honesty",
    copy: "Neutral questions, comfortable pacing, and room for nuance. Better answers come from better conditions.",
  },
  {
    title: "Close the loop",
    copy: "A response is only useful if it changes something. We help you find the story and share it plainly.",
  },
];

const templates = [
  {
    slug: "customer-experience-pulse",
    category: "Customer experience",
    title: "Customer Experience Pulse",
    description:
      "A short monthly check-in on how customers feel about working with you — and where you can make their day lighter.",
    responses: "384 responses",
    accent: "#0d5947",
    accentSoft: "#e2ede7",
  },
  {
    slug: "onboarding-feedback",
    category: "Product experience",
    title: "Onboarding Feedback",
    description:
      "Understand the first fifteen minutes. What helped, what got in the way, and what would have made it effortless.",
    responses: "212 responses",
    accent: "#e4612d",
    accentSoft: "#fbe9df",
  },
  {
    slug: "product-discovery-interviews",
    category: "Product research",
    title: "Product Discovery Interviews",
    description:
      "Open-ended prompts designed to uncover the jobs people are trying to get done — in their own words.",
    responses: "96 responses",
    accent: "#517486",
    accentSoft: "#e6eef2",
  },
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-3 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-faint">Question 1 of 4</span>
          <span className="rounded-full bg-forest-soft px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-wide text-forest">
            Required
          </span>
        </div>
        <p className="mt-2 font-display text-[12px] leading-snug text-ink">
          What almost stopped you from getting started today?
        </p>
        <div className="mt-2 space-y-1">
          {["Nothing, it was smooth", "I wasn't sure where to begin", "Something technical"].map((option, i) => (
            <div
              key={option}
              className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[7.5px] ${
                i === 0 ? "border-forest/30 bg-forest-soft/60 text-forest" : "border-line text-ink-soft"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full border ${
                  i === 0 ? "border-forest bg-forest" : "border-line-strong"
                }`}
              />
              {option}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="rounded-lg border border-line bg-surface p-3 shadow-soft">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" />
          <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-faint">Live survey link</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-line bg-canvas/60 px-2 py-1.5">
          <Icon name="link" size={10} className="shrink-0 text-forest" />
          <span className="min-w-0 flex-1 truncate font-mono text-[8px] text-ink-soft">
            survey.land/s/customer-experience
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[7px] text-ink-faint">Works on any screen</span>
          <span className="rounded-full bg-forest px-2 py-0.5 text-[7px] font-medium text-white">Copy link</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-faint">Top theme</span>
        <Icon name="trendingUp" size={11} className="text-forest" />
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <p className="font-display text-[26px] leading-none text-ink">68%</p>
        <span className="text-[8px] text-ink-faint">mention speed</span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-1 overflow-hidden rounded-full bg-canvas-deep">
          <div className="bar-grow h-full w-[68%] rounded-full bg-forest" />
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-canvas-deep">
          <div className="bar-grow h-full w-[42%] rounded-full bg-forest/60" />
        </div>
      </div>
      <p className="mt-2 text-[7.5px] leading-relaxed text-ink-faint">
        A clear signal for the next planning cycle.
      </p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line/70 bg-cream/45">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-18 sm:px-8 sm:py-24">
        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <SectionLabel>02 — How it works</SectionLabel>
            <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.2vw,3.15rem)] leading-[1.04] tracking-[-0.035em]">
              From a hunch to a decision in three moves.
            </h2>
          </div>
          <p className="max-w-[400px] text-[14px] leading-relaxed text-ink-soft md:justify-self-end">
            The best research is rarely complicated. It is simply well considered — written
            clearly, shared generously, and read with care.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-forest-soft font-display text-[13px] text-forest">
                  0{index + 1}
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.1em] text-ink-faint">
                  {step.tag}
                </span>
              </div>
              <h3 className="mt-5 font-display text-[23px] leading-tight tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{step.copy}</p>
              <div className="mt-5">
                <StepVisual index={index} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TemplateLibrary() {
  return (
    <section id="surveys">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-18 sm:px-8 sm:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-[620px]">
            <SectionLabel>03 — Survey library</SectionLabel>
            <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.2vw,3.15rem)] leading-[1.04] tracking-[-0.035em]">
              A head start for questions that matter.
            </h2>
            <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-ink-soft">
              Thoughtful starting points for the moments teams ask most often. Open one live,
              or make it your own in the demo workspace.
            </p>
          </div>
          <DemoButton
            label="Explore all 8 demo surveys"
            signedInLabel="Open the survey library"
            variant="outline"
            size="sm"
            icon={false}
            className="shrink-0 self-start sm:self-auto"
          />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.slug}
              href={`/s/${template.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
            >
              <div
                className="relative h-[136px] overflow-hidden border-b border-line/70 p-4"
                style={{
                  background: `linear-gradient(135deg, ${template.accentSoft}, var(--color-cream))`,
                }}
              >
                <div className="absolute inset-0 line-grid opacity-40" aria-hidden="true" />
                <span
                  className="relative inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft shadow-soft"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: template.accent }} />
                  {template.category}
                </span>

                <div className="absolute -right-3 top-6 w-[62%] rotate-[-3deg] rounded-lg border border-line bg-surface p-3 shadow-card transition-transform duration-300 group-hover:rotate-[-1deg]">
                  <p className="font-mono text-[6px] uppercase tracking-[0.12em] text-ink-faint">
                    Survey preview
                  </p>
                  <p className="mt-1 font-display text-[10px] leading-tight text-ink">{template.title}</p>
                  <div className="mt-2 space-y-1">
                    {[88, 64, 76].map((width, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full border border-line-strong" />
                        <span
                          className="h-1 rounded-full bg-canvas-deep"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-soft shadow-soft transition-colors group-hover:bg-forest group-hover:text-white">
                  <Icon name="arrowUpRight" size={13} />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[20px] leading-tight tracking-tight text-ink">
                    {template.title}
                  </h3>
                  <Badge tone="success" dot className="mt-0.5 shrink-0">
                    Live
                  </Badge>
                </div>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-soft">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3">
                  <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-faint">
                    <Icon name="users" size={11} />
                    {template.responses}
                  </span>
                  <span className="flex items-center gap-1 text-[10.5px] font-medium text-forest">
                    Open live survey
                    <Icon
                      name="arrowRight"
                      size={12}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Manifesto() {
  return (
    <section className="relative overflow-hidden bg-forest-deep">
      <div className="gradient-forest grain absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 opacity-[0.06] line-grid" aria-hidden="true" />
      <div
        className="absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-cream/10"
        aria-hidden="true"
      />
      <div
        className="absolute -right-10 top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full border border-cream/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-18 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/55">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            04 — What we believe
          </p>
          <h2 className="mt-5 max-w-[540px] text-balance font-display text-[clamp(2.1rem,4.5vw,3.5rem)] font-light leading-[1.02] tracking-[-0.035em] text-cream">
            A survey is a conversation with a purpose.
          </h2>
          <p className="mt-6 max-w-[460px] text-[14px] leading-relaxed text-cream/65">
            Somewhere between the form and the spreadsheet, the person on the other side got
            lost. SurveyLand is built to remember them: to ask fewer, better questions and to
            treat every answer as something worth understanding.
          </p>
          <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-cream/15 bg-cream/[0.06] px-3.5 py-2">
            <Icon name="quote" size={14} className="text-coral" />
            <span className="text-[11px] text-cream/75">Made for research-minded teams</span>
          </div>
        </div>

        <div className="space-y-0 lg:pt-2">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="grid grid-cols-[32px_1fr] gap-4 border-t border-cream/15 py-5 first:border-t-0 first:pt-0 last:pb-0"
            >
              <span className="pt-0.5 font-mono text-[10px] tracking-[0.1em] text-cream/40">
                0{index + 1}
              </span>
              <div>
                <h3 className="font-display text-[19px] font-normal tracking-tight text-cream">
                  {principle.title}
                </h3>
                <p className="mt-1.5 max-w-[390px] text-[12.5px] leading-relaxed text-cream/55">
                  {principle.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
