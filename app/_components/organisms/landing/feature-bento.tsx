import type { ReactNode } from "react";
import { Icon } from "@/app/_components/atoms/icon";
import { SectionLabel } from "@/app/_components/atoms/misc";
import { BarList } from "@/app/_components/molecules/charts";
import { Avatar } from "@/app/_components/atoms/avatar";

function FeatureCard({
  icon,
  eyebrow,
  title,
  copy,
  className,
  children,
}: {
  icon: "edit" | "palette" | "message" | "chartLine";
  eyebrow: string;
  title: string;
  copy: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card sm:p-6 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest/10 bg-forest-soft text-forest">
          <Icon name={icon} size={16} />
        </span>
        <SectionLabel>{eyebrow}</SectionLabel>
      </div>
      <h3 className="mt-4 font-display text-[22px] leading-[1.12] tracking-tight text-ink sm:text-[24px]">
        {title}
      </h3>
      <p className="mt-2 max-w-[440px] text-[13px] leading-relaxed text-ink-soft">{copy}</p>
      <div className="mt-5 flex-1">{children}</div>
    </article>
  );
}

function BuilderVisual() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-canvas/70 p-3 sm:p-4">
      <div className="flex items-center justify-between border-b border-line/70 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-forest px-2 py-0.5 font-mono text-[8px] uppercase tracking-wide text-white">
            Build
          </span>
          <span className="rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-wide text-ink-faint">
            Preview
          </span>
          <span className="hidden rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-wide text-ink-faint sm:block">
            Theme
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[8px] text-ink-faint">
          <Icon name="check" size={9} className="text-forest" />
          Saved
        </span>
      </div>

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1.3fr_1fr]">
        <div className="space-y-2">
          {[
            {
              icon: "radio" as const,
              label: "Question 01",
              title: "How easy was it to find what you needed?",
              type: "Multiple choice",
            },
            {
              icon: "text" as const,
              label: "Question 02",
              title: "What would have made that easier?",
              type: "Long answer",
            },
            {
              icon: "radio" as const,
              label: "Question 03",
              title: "How likely are you to recommend us?",
              type: "Scale",
            },
          ].map((question, index) => (
            <div
              key={question.label}
              className={`rounded-lg border bg-surface p-2.5 ${
                index === 0 ? "border-forest/30 shadow-soft" : "border-line/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono text-[7.5px] uppercase tracking-wide text-ink-faint">
                  <Icon name={question.icon} size={9} />
                  {question.label}
                </span>
                <Icon name="drag" size={10} className="text-line-strong" />
              </div>
              <p className="mt-1 text-[10px] font-medium leading-snug text-ink">{question.title}</p>
              <p className="mt-1 font-mono text-[7.5px] text-ink-faint">{question.type}</p>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-2 text-[9px] font-medium text-ink-faint">
            <Icon name="plus" size={11} />
            Add a question
          </div>
        </div>

        <div className="hidden rounded-lg border border-line/80 bg-surface p-3 sm:block">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-faint">Live preview</span>
            <span className="flex gap-1">
              <span className="h-1 w-1 rounded-full bg-line-strong" />
              <span className="h-1 w-1 rounded-full bg-line-strong" />
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-canvas-deep">
            <div className="h-full w-1/3 rounded-full bg-forest" />
          </div>
          <p className="mt-3 font-mono text-[7px] uppercase tracking-wide text-ink-faint">Question 1 of 3</p>
          <p className="mt-1.5 font-display text-[13px] leading-snug text-ink">
            How easy was it to find what you needed?
          </p>
          <div className="mt-2.5 space-y-1.5">
            {["Very easy", "Somewhat easy", "Not easy"].map((option, index) => (
              <div
                key={option}
                className={`rounded-md border px-2 py-1.5 text-[8.5px] ${
                  index === 0
                    ? "border-forest/30 bg-forest-soft/60 text-forest"
                    : "border-line text-ink-soft"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[7px] text-ink-faint">1 / 3</span>
            <span className="rounded-full bg-forest px-2 py-1 text-[7.5px] font-medium text-white">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeVisual() {
  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-line bg-canvas/70 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-ink-faint">Accent</span>
          <span className="rounded-full bg-coral-soft px-2 py-0.5 font-mono text-[7.5px] text-coral-deep">
            Coral
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          {["#0d5947", "#e4612d", "#c9952f", "#517486"].map((color, index) => (
            <span
              key={color}
              className={`h-7 flex-1 rounded-md ${index === 1 ? "ring-2 ring-coral/30 ring-offset-2 ring-offset-canvas" : ""}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-coral/20 bg-surface p-3">
          <p className="font-display text-[13px] leading-snug text-ink">How did we do today?</p>
          <div className="mt-2 space-y-1.5">
            {["Really good", "It was fine", "Needs work"].map((option, index) => (
              <div
                key={option}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[8px] ${
                  index === 1 ? "border-coral/40 bg-coral-soft/50 text-coral-deep" : "border-line text-ink-soft"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full border ${
                    index === 1 ? "border-coral bg-coral" : "border-line-strong"
                  }`}
                />
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Progress bar", "Email capture", "Thank-you page"].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-line bg-canvas/60 px-2 py-1 font-mono text-[7.5px] text-ink-faint"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResponsesVisual() {
  return (
    <div className="divide-y divide-line/70 overflow-hidden rounded-xl border border-line bg-canvas/70">
      {[
        {
          name: "Maya Chen",
          meta: "Mobile Â· 100% Â· 3m 42s",
          text: "The new flow felt much clearer. I found the pricing page without hunting for it.",
          time: "2m",
        },
        {
          name: "Leo Fischer",
          meta: "Desktop Â· 92% Â· 5m 08s",
          text: "Loved the quick start. I would have liked a short example before the first question.",
          time: "18m",
        },
      ].map((response) => (
        <div key={response.name} className="p-3">
          <div className="flex items-center gap-2">
            <Avatar name={response.name} size="xs" className="h-6 w-6" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9.5px] font-medium text-ink">{response.name}</p>
              <p className="font-mono text-[7px] text-ink-faint">{response.meta}</p>
            </div>
            <span className="font-mono text-[7px] text-ink-faint">{response.time} ago</span>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">{response.text}</p>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-[1.35fr_1fr]">
      <div className="rounded-xl border border-line bg-canvas/70 p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-ink">What mattered most?</p>
            <p className="font-mono text-[7px] uppercase tracking-[0.1em] text-ink-faint">
              Question 2 Â· 1,196 responses
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 font-mono text-[7px] text-success">
            <span className="h-1 w-1 rounded-full bg-success" />
            Live
          </span>
        </div>
        <div className="mt-3.5">
          <BarList
            items={[
              { label: "Speed and clarity", value: 68, color: "#0d5947" },
              { label: "Ease of onboarding", value: 54, color: "#2e7a64" },
              { label: "Pricing transparency", value: 41, color: "#c9952f" },
              { label: "Support and trust", value: 29, color: "#517486" },
            ]}
            max={68}
            suffix="%"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="rounded-xl border border-forest/15 bg-forest-soft/70 p-3.5">
          <div className="flex items-center gap-1.5 text-forest">
            <Icon name="sparkles" size={12} />
            <span className="font-mono text-[7.5px] uppercase tracking-[0.12em]">Insight</span>
          </div>
          <p className="mt-2 text-[10px] font-medium leading-relaxed text-forest-deep">
            68% of people mention speed and clarity first. It is your strongest signal this month.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-canvas/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-ink-faint">
              Completion
            </span>
            <Icon name="trendingUp" size={11} className="text-forest" />
          </div>
          <p className="mt-1 font-display text-[24px] leading-none text-ink">87.6%</p>
          <p className="mt-1 text-[8px] text-ink-faint">+2.1% vs. previous period</p>
        </div>
      </div>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section id="product" className="border-t border-line/70">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-18 sm:px-8 sm:py-24">
        <div className="max-w-[720px]">
          <SectionLabel>01 â€” The workspace</SectionLabel>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.2vw,3.15rem)] leading-[1.04] tracking-[-0.035em]">
            Everything between the question <span className="text-forest">and the decision.</span>
          </h2>
          <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
            No bolt-on tools, no tangled exports. SurveyLand keeps writing, sharing, and
            understanding in one considered place.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <FeatureCard
            icon="edit"
            eyebrow="Builder"
            title="A builder that gets out of the way."
            copy="Write questions in a calm, focused canvas. Every change appears instantly in the live preview."
            className="md:col-span-4"
          >
            <BuilderVisual />
          </FeatureCard>

          <FeatureCard
            icon="palette"
            eyebrow="Design"
            title="Beautiful by default."
            copy="Pick an accent, tune the details, and publish something people are happy to open."
            className="md:col-span-2"
          >
            <ThemeVisual />
          </FeatureCard>

          <FeatureCard
            icon="message"
            eyebrow="Responses"
            title="Answers with context."
            copy="See who replied, how they moved through the survey, and what they said â€” without losing the thread."
            className="md:col-span-2"
          >
            <ResponsesVisual />
          </FeatureCard>

          <FeatureCard
            icon="chartLine"
            eyebrow="Analytics"
            title="Insight you can read in one sitting."
            copy="Clear summaries, honest percentages, and the themes worth acting on â€” no dashboard archaeology required."
            className="md:col-span-4"
          >
            <AnalyticsVisual />
          </FeatureCard>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-cream/55 px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            Also included
          </span>
          {[
            { icon: "link" as const, label: "Shareable survey links" },
            { icon: "download" as const, label: "CSV & JSON export" },
            { icon: "shield" as const, label: "Local-first demo data" },
            { icon: "grid" as const, label: "Responsive by default" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
              <Icon name={item.icon} size={12} className="text-forest" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
