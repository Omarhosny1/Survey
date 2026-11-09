import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";
import { AreaChart, DonutChart, Sparkline } from "@/components/molecules/charts";
import { DemoButton } from "./demo-button";

const trend = [
  { label: "12", value: 42 },
  { label: "14", value: 58 },
  { label: "16", value: 49 },
  { label: "18", value: 74 },
  { label: "20", value: 66 },
  { label: "22", value: 91 },
  { label: "24", value: 78 },
  { label: "26", value: 104 },
  { label: "28", value: 88 },
  { label: "30", value: 119 },
];

const miniNav = [
  { label: "Overview", icon: "home" as const, active: true },
  { label: "My surveys", icon: "layers" as const },
  { label: "Responses", icon: "inbox" as const },
  { label: "Analytics", icon: "chart" as const },
  { label: "Settings", icon: "settings" as const },
];

const activeSurveys = [
  { title: "Customer Experience Pulse", meta: "Customer experience", count: 384, tone: "#0d5947", width: "100%" },
  { title: "Onboarding Feedback", meta: "Product experience", count: 212, tone: "#517486", width: "64%" },
  { title: "Product Discovery Interviews", meta: "Product research", count: 96, tone: "#c9952f", width: "38%" },
];

const stats = [
  { label: "Responses collected", value: "1,196" },
  { label: "Surveys in the demo", value: "8" },
  { label: "Average completion", value: "87.6%" },
  { label: "Median time to finish", value: "4.8 min" },
];

function PreviewSidebar() {
  return (
    <div className="hidden flex-col border-r border-line/80 bg-cream/60 p-3 md:flex">
      <div className="flex items-center gap-1.5 px-1 py-1">
        <Logo size={18} tone="mark" />
        <span className="font-display text-[11.5px] font-semibold tracking-tight text-ink">
          SurveyLand
        </span>
      </div>
      <div className="mt-3 space-y-0.5">
        {miniNav.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-[5px] px-2 py-[7px] text-[10px] font-medium ${
              item.active ? "bg-forest-soft text-forest" : "text-ink-faint"
            }`}
          >
            <Icon name={item.icon} size={12} />
            {item.label}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-line/80 bg-surface p-2">
        <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-faint">This month</p>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="font-display text-[15px] leading-none text-ink">1,196</span>
          <span className="font-mono text-[7px] text-forest">+18.4%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-canvas-deep">
          <div className="h-full w-[78%] rounded-full bg-forest" />
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1.5 rounded-md px-1.5 py-2">
        <Avatar name="Amara Osei" size="xs" />
        <div className="min-w-0">
          <p className="truncate text-[9px] font-medium text-ink">Amara Osei</p>
          <p className="truncate text-[7.5px] text-ink-faint">Northwind Studio</p>
        </div>
      </div>
    </div>
  );
}

function PreviewContent() {
  return (
    <div className="min-w-0 flex-1 bg-[#fbfaf6] p-3.5 sm:p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-faint">Overview</p>
          <h3 className="mt-1 font-display text-lg leading-tight tracking-tight text-ink sm:text-[22px]">
            Good morning, Amara.
          </h3>
          <p className="mt-0.5 hidden text-[10px] text-ink-faint sm:block">
            Here is what people have been telling you this fortnight.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 font-mono text-[8px] text-ink-faint sm:flex">
            <Icon name="calendar" size={10} />
            Last 14 days
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink-faint">
            <Icon name="bell" size={11} />
          </span>
          <Avatar name="Amara Osei" size="xs" className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2">
        <div className="rounded-md border border-line/80 bg-surface p-2 sm:p-2.5">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate font-mono text-[7px] uppercase tracking-[0.1em] text-ink-faint">Responses</p>
            <span className="rounded-full bg-success-soft px-1 py-0.5 font-mono text-[6.5px] text-success">+18%</span>
          </div>
          <div className="mt-1 flex items-end justify-between gap-1">
            <p className="font-display text-[17px] leading-none text-ink sm:text-xl">1,196</p>
            <Sparkline data={[8, 12, 10, 16, 14, 19, 17, 24]} width={40} height={14} className="hidden sm:block" />
          </div>
        </div>
        <div className="rounded-md border border-line/80 bg-surface p-2 sm:p-2.5">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate font-mono text-[7px] uppercase tracking-[0.1em] text-ink-faint">Completion</p>
            <span className="rounded-full bg-success-soft px-1 py-0.5 font-mono text-[6.5px] text-success">+2.1</span>
          </div>
          <p className="mt-1 font-display text-[17px] leading-none text-ink sm:text-xl">87.6%</p>
        </div>
        <div className="rounded-md border border-line/80 bg-surface p-2 sm:p-2.5">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate font-mono text-[7px] uppercase tracking-[0.1em] text-ink-faint">Live surveys</p>
            <span className="h-1 w-1 rounded-full bg-forest" />
          </div>
          <p className="mt-1 font-display text-[17px] leading-none text-ink sm:text-xl">4</p>
        </div>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-[1.45fr_1fr]">
        <div className="rounded-md border border-line/80 bg-surface p-2.5 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-ink">Response volume</p>
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-ink-faint">Daily submissions</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-line px-1.5 py-0.5 font-mono text-[7px] text-ink-faint">
              <span className="h-1 w-1 rounded-full bg-forest" />
              This period
            </span>
          </div>
          <div className="mt-1.5">
            <AreaChart data={trend} height={150} valueLabel="responses" />
          </div>
        </div>

        <div className="hidden rounded-md border border-line/80 bg-surface p-3 lg:block">
          <p className="text-[10px] font-medium text-ink">Survey mix</p>
          <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-ink-faint">By status</p>
          <div className="mt-3 flex justify-center">
            <DonutChart
              size={94}
              thickness={9}
              centerValue="8"
              centerLabel="surveys"
              data={[
                { label: "Published", value: 4, color: "#0d5947" },
                { label: "Closed", value: 2, color: "#517486" },
                { label: "Draft", value: 2, color: "#e4612d" },
              ]}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { label: "Published", value: 4, color: "#0d5947" },
              { label: "Closed", value: 2, color: "#517486" },
              { label: "Draft", value: 2, color: "#e4612d" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[8px]">
                <span className="flex items-center gap-1.5 text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-mono text-ink-faint">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-md border border-line/80 bg-surface p-2.5 sm:p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-ink">Active surveys</p>
          <span className="flex items-center gap-0.5 font-mono text-[7.5px] text-forest">
            View all
            <Icon name="arrowRight" size={9} />
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {activeSurveys.map((survey) => (
            <div key={survey.title} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: survey.tone }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[8.5px] font-medium text-ink">{survey.title}</p>
                  <span className="shrink-0 font-mono text-[7.5px] text-ink-faint">{survey.count}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-canvas-deep">
                    <div
                      className="h-full rounded-full"
                      style={{ width: survey.width, backgroundColor: survey.tone, opacity: 0.7 }}
                    />
                  </div>
                  <span className="hidden shrink-0 font-mono text-[6.5px] uppercase tracking-wide text-ink-faint sm:block">
                    {survey.meta}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-[-26rem] h-[46rem] w-[72rem] -translate-x-1/2 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(13,89,71,0.14), rgba(13,89,71,0.04) 55%, transparent 75%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] line-grid opacity-60 mask-fade-x"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1180px] px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-[880px] text-center">
          <div className="animate-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/90 py-1.5 pl-2.5 pr-3.5 text-[11px] font-medium text-ink-soft shadow-soft">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-coral-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              </span>
              The considered survey platform
            </span>
          </div>

          <h1
            className="mt-7 animate-enter text-balance font-display text-[clamp(2.85rem,6.7vw,5.1rem)] font-medium leading-[0.96] tracking-[-0.045em]"
            style={{ animationDelay: "60ms" }}
          >
            Surveys that feel like
            <br className="hidden sm:block" />{" "}
            <span className="relative inline-block text-forest">
              <em className="font-light italic">a conversation.</em>
              <svg
                viewBox="0 0 260 14"
                fill="none"
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-3 w-full text-coral/70 sm:-bottom-2"
                preserveAspectRatio="none"
              >
                <path
                  d="M3 10.5C46 4.5 92 6 128 7.5c38 1.6 78-3 129-4.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            className="mx-auto mt-7 max-w-[590px] animate-enter text-pretty text-[15.5px] leading-relaxed text-ink-soft sm:text-[17px]"
            style={{ animationDelay: "120ms" }}
          >
            Write surveys that respect people&apos;s time. Share them anywhere. Understand
            what people actually mean — all in one calm, beautifully made workspace.
          </p>

          <div
            className="mt-8 flex animate-enter flex-col items-center justify-center gap-2.5 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <Button
              href="/register"
              size="lg"
              className="w-full sm:w-auto"
              iconRight={<Icon name="arrowRight" size={16} />}
            >
              Create your first survey
            </Button>
            <DemoButton label="Take the demo tour" className="w-full sm:w-auto" />
          </div>

          <div
            className="mt-5 flex animate-enter flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-ink-faint"
            style={{ animationDelay: "240ms" }}
          >
            {["Free to explore", "No credit card", "1,196 sample responses"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Icon name="check" size={12} className="text-forest" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-14 animate-enter sm:mt-16" style={{ animationDelay: "280ms" }}>
          <div className="relative mx-auto max-w-[1000px]">
            <div
              className="absolute -inset-4 -z-10 rounded-[32px] bg-forest-deep/[0.06] blur-xl"
              aria-hidden="true"
            />
            <div className="overflow-hidden rounded-xl border border-line-strong/80 bg-surface shadow-float sm:rounded-2xl">
              <div className="flex h-9 items-center gap-2 border-b border-line/80 bg-cream/80 px-3.5">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-[#e4c7bd]" />
                  <span className="h-2 w-2 rounded-full bg-[#ded4bb]" />
                  <span className="h-2 w-2 rounded-full bg-[#c7d6c9]" />
                </div>
                <div className="mx-auto flex items-center gap-1.5 rounded-full border border-line/70 bg-surface/80 px-3 py-1 font-mono text-[8px] text-ink-faint">
                  <Icon name="lock" size={8} />
                  app.surveyland.com/dashboard
                </div>
                <span className="w-10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[148px_1fr]">
                <PreviewSidebar />
                <PreviewContent />
              </div>
            </div>

            <div className="absolute -left-5 top-24 hidden w-[212px] animate-float lg:block">
              <div className="rounded-lg border border-line bg-surface p-3 shadow-lift">
                <div className="flex items-start gap-2.5">
                  <Avatar name="Maya Chen" size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[8px] font-medium text-forest">
                      <span className="h-1 w-1 rounded-full bg-forest" />
                      New response
                    </div>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-ink">
                      Maya just finished a survey.
                    </p>
                    <p className="mt-0.5 font-mono text-[8px] text-ink-faint">Customer Experience Pulse</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-line/70 pt-2">
                  <span className="font-mono text-[7.5px] uppercase tracking-wide text-ink-faint">2 min ago</span>
                  <span className="flex items-center gap-1 rounded-full bg-success-soft px-1.5 py-0.5 text-[7.5px] font-medium text-success">
                    <Icon name="check" size={8} />
                    100% complete
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-20 hidden w-[192px] animate-float lg:block" style={{ animationDelay: "1.5s" }}>
              <div className="rounded-lg border border-line bg-surface p-3 shadow-lift">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-ink-faint">
                    Completion rate
                  </p>
                  <Icon name="trendingUp" size={12} className="text-forest" />
                </div>
                <p className="mt-1.5 font-display text-[26px] leading-none tracking-tight text-ink">87.6%</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-canvas-deep">
                  <div className="bar-grow h-full w-[87.6%] rounded-full bg-forest" />
                </div>
                <p className="mt-1.5 text-[8px] text-ink-faint">
                  <span className="font-medium text-success">+2.1%</span> vs. last period
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            A real look inside the demo workspace
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[900px] grid-cols-2 overflow-hidden rounded-xl border border-line bg-cream/55 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-4 py-4 text-center sm:px-5 ${
                index % 2 === 1 ? "border-l border-line/80" : ""
              } ${index >= 2 ? "border-t border-line/80 sm:border-t-0" : ""} ${
                index > 0 ? "sm:border-l sm:border-line/80" : ""
              }`}
            >
              <p className="font-display text-xl leading-none tracking-tight text-ink sm:text-2xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[10px] text-ink-faint">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
