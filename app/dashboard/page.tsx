"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ActivityIcon } from "@/components/atoms/activity-icon";
import { Button } from "@/components/atoms/button";
import { Icon, type IconName } from "@/components/atoms/icon";
import { SectionLabel } from "@/components/atoms/misc";
import { AreaChart, DonutChart, Sparkline } from "@/components/molecules/charts";
import { Segmented } from "@/components/molecules/segmented";
import { StatusBadge } from "@/components/molecules/status-badge";
import { PageHeader } from "@/components/molecules/section-heading";
import {
  averageDuration,
  buildTrend,
  completionRate,
  dayCompletionSeries,
  getInsights,
  responseCount,
  responsesInLastDays,
  responsesPerSurvey,
  statusCounts,
  todayCount,
  trendDelta,
} from "@/lib/analytics";
import { useSession } from "@/lib/session";
import { useSurveyStore } from "@/lib/store";
import {
  formatCompact,
  formatDuration,
  formatNumber,
  formatRelative,
  formatRelativeTime,
  greeting,
} from "@/lib/utils";

type RangeDays = 7 | 14 | 30;

function StatCard({
  label,
  value,
  meta,
  icon,
  visual,
  href,
}: {
  label: string;
  value: string;
  meta: ReactNode;
  icon: IconName;
  visual: ReactNode;
  href?: string;
}) {
  const content = (
    <div className="group h-full rounded-xl border border-line bg-surface p-4 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <SectionLabel className="pt-0.5">{label}</SectionLabel>
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-canvas/60 text-ink-faint">
          <Icon name={icon} size={14} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-[28px] leading-none tracking-[-0.035em] text-ink">{value}</p>
        {visual}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10.5px] text-ink-faint">{meta}</div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2">
      {content}
    </Link>
  ) : (
    content
  );
}

export default function DashboardOverviewPage() {
  const { profile } = useSession();
  const state = useSurveyStore();
  const { surveys, responses, activity } = state;
  const [range, setRange] = useState<RangeDays>(14);

  const trend = useMemo(() => buildTrend(responses, range), [responses, range]);
  const rangeTotal = trend.reduce((total, point) => total + point.value, 0);
  const delta = trendDelta(trend);
  const recent30 = useMemo(() => responsesInLastDays(responses, 30), [responses]);
  const completion = completionRate(recent30);
  const avgSeconds = averageDuration(recent30);
  const counts = statusCounts(surveys);
  const today = todayCount(responses);
  const insights = getInsights(state);
  const ranked = responsesPerSurvey(state);
  const recentSurveys = [...surveys]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const completionSeries = useMemo(() => dayCompletionSeries(responses, 14), [responses]);
  const bestPoint = trend.reduce(
    (best, point) => (point.value > best.value ? point : best),
    trend[0] ?? { label: "—", value: 0, previousValue: 0, date: "" },
  );
  const averagePerDay = rangeTotal > 0 ? (rangeTotal / range).toFixed(1) : "0";
  const firstName = profile?.name.split(" ")[0] ?? "there";
  const recent7 = responsesInLastDays(responses, 7).length;

  const deviceCounts = ["Desktop", "Mobile", "Tablet"].map((device) => ({
    label: device,
    value: responses.filter((response) => response.device === device).length,
  }));
  const deviceColors: Record<string, string> = {
    Desktop: "#0d5947",
    Mobile: "#c9952f",
    Tablet: "#517486",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace overview"
        title={`${greeting()}, ${firstName}.`}
        description={`You've collected ${formatNumber(recent7)} responses in the last 7 days. ${counts.published} surveys are live and ${counts.draft} drafts are waiting for a final look.`}
        actions={
          <>
            <Button
              href="/dashboard/analytics"
              variant="secondary"
              iconLeft={<Icon name="chart" size={15} />}
            >
              Analytics
            </Button>
            <Button href="/builder/new" iconLeft={<Icon name="plus" size={15} />}>
              New survey
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total responses"
          value={formatNumber(responses.length)}
          icon="inbox"
          href="/dashboard/responses"
          meta={
            <>
              <span
                className={`flex items-center gap-0.5 font-medium ${delta >= 0 ? "text-success" : "text-danger"}`}
              >
                <Icon name={delta >= 0 ? "trendingUp" : "trendingDown"} size={11} />
                {delta >= 0 ? "+" : ""}
                {delta}%
              </span>
              <span>vs previous {range} days</span>
              <span className="ml-auto font-mono text-[9px] uppercase tracking-wide">
                {today} today
              </span>
            </>
          }
          visual={<Sparkline data={trend.map((point) => point.value)} width={74} height={26} />}
        />
        <StatCard
          label="Completion rate"
          value={`${completion}%`}
          icon="checkCircle"
          href="/dashboard/analytics"
          meta={
            <>
              <span className="text-ink-soft">Last 30 days</span>
              <span className="ml-auto font-mono text-[9px] uppercase tracking-wide">
                {formatNumber(recent30.length)} replies
              </span>
            </>
          }
          visual={<Sparkline data={completionSeries} width={74} height={26} color="#517486" />}
        />
        <StatCard
          label="Live surveys"
          value={String(counts.published)}
          icon="layers"
          href="/dashboard/surveys"
          meta={
            <>
              <span className="text-ink-soft">
                {counts.draft} drafts · {counts.closed} closed
              </span>
            </>
          }
          visual={
            <div className="flex h-6 w-[74px] items-end gap-1" aria-hidden="true">
              {[
                { value: counts.published, color: "#0d5947" },
                { value: counts.draft, color: "#e4612d" },
                { value: counts.closed, color: "#517486" },
              ].map((item, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-[2px]"
                  style={{
                    height: `${Math.max((item.value / Math.max(counts.all, 1)) * 24, item.value > 0 ? 5 : 3)}px`,
                    backgroundColor: item.color,
                    opacity: item.value > 0 ? 1 : 0.18,
                  }}
                />
              ))}
            </div>
          }
        />
        <StatCard
          label="Avg. time to complete"
          value={formatDuration(avgSeconds)}
          icon="clock"
          meta={
            <>
              <span className="text-ink-soft">Last 30 days</span>
              <span className="ml-auto font-mono text-[9px] uppercase tracking-wide">
                {avgSeconds > 0 && avgSeconds < 360 ? "On target" : "Worth a look"}
              </span>
            </>
          }
          visual={
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#0d5947 ${Math.min((avgSeconds / 600) * 100, 100)}%, #efe9de 0)`,
              }}
              aria-hidden="true"
            >
              <span className="h-5 w-5 rounded-full bg-surface" />
            </div>
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.62fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5">
            <div>
              <SectionLabel>Response activity</SectionLabel>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="font-display text-[30px] leading-none tracking-[-0.04em] text-ink">
                  {formatNumber(rangeTotal)}
                </h2>
                <span className="text-[12px] text-ink-faint">responses</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${
                    delta >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                  }`}
                >
                  <Icon name={delta >= 0 ? "trendingUp" : "trendingDown"} size={10} />
                  {delta >= 0 ? "+" : ""}
                  {delta}%
                </span>
                <span>compared with the previous {range} days</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Segmented
                ariaLabel="Chart time range"
                value={String(range)}
                onChange={(value) => setRange(value === "7" ? 7 : value === "30" ? 30 : 14)}
                options={[
                  { value: "7", label: "7d" },
                  { value: "14", label: "14d" },
                  { value: "30", label: "30d" },
                ]}
              />
              <div className="flex items-center gap-3 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-faint">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  This period
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                  Previous
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 px-2 pb-1 sm:px-3">
            <AreaChart data={trend} height={244} showComparison valueLabel="responses" />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/80 bg-cream/40 px-5 py-3 text-[10.5px] text-ink-faint">
            <span>
              Best day{" "}
              <span className="font-medium text-ink">
                {bestPoint.label} · {formatNumber(bestPoint.value)}
              </span>
            </span>
            <span>
              Daily average <span className="font-medium text-ink">{averagePerDay}</span>
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Icon name="info" size={11} />
              From 8 demo surveys
            </span>
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <SectionLabel>What stands out</SectionLabel>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-1 text-[10.5px] font-medium text-forest transition-colors hover:text-forest-deep"
            >
              Full analytics
              <Icon name="arrowRight" size={11} />
            </Link>
          </div>

          <div className="mt-3 divide-y divide-line/80">
            {insights.map((insight) => {
              const iconName: IconName =
                insight.tone === "forest" ? "target" : insight.tone === "coral" ? "trendingUp" : "star";
              const toneClass =
                insight.tone === "forest"
                  ? "border-forest/10 bg-forest-soft text-forest"
                  : insight.tone === "coral"
                    ? "border-coral/10 bg-coral-soft text-coral-deep"
                    : "border-gold/15 bg-gold-soft text-[#8a6515]";
              return (
                <div key={insight.label} className="flex items-start gap-3 py-3 first:pt-1">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${toneClass}`}>
                    <Icon name={iconName} size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-faint">
                      {insight.label}
                    </p>
                    <p className="mt-0.5 truncate text-[12.5px] font-medium text-ink">{insight.value}</p>
                    <p className="mt-0.5 truncate text-[10px] text-ink-faint">{insight.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto border-t border-line/80 pt-4">
            <div className="flex items-center gap-4">
              <DonutChart
                size={94}
                thickness={10}
                centerValue={formatCompact(responses.length)}
                centerLabel="responses"
                data={deviceCounts.map((item) => ({
                  ...item,
                  color: deviceColors[item.label] ?? "#0d5947",
                }))}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[11px] font-medium text-ink">How people replied</p>
                {deviceCounts.map((device) => (
                  <div key={device.label} className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: deviceColors[device.label] }}
                      />
                      {device.label}
                    </span>
                    <span className="font-mono text-ink-faint">
                      {Math.round((device.value / Math.max(responses.length, 1)) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-display text-lg tracking-tight text-ink">Surveys in motion</h2>
              <p className="mt-0.5 text-[10.5px] text-ink-faint">Recently touched, ranked by latest edit</p>
            </div>
            <Link
              href="/dashboard/surveys"
              className="flex items-center gap-1 text-[10.5px] font-medium text-forest transition-colors hover:text-forest-deep"
            >
              View all
              <Icon name="arrowRight" size={11} />
            </Link>
          </div>
          <div className="divide-y divide-line/80 border-t border-line/80">
            {recentSurveys.map((survey) => {
              const count = responseCount(state, survey.id);
              return (
                <Link
                  key={survey.id}
                  href={`/builder/${survey.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-canvas/60"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: `${survey.theme.accent}12`,
                      borderColor: `${survey.theme.accent}22`,
                      color: survey.theme.accent,
                    }}
                  >
                    <Icon name="file" size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink group-hover:text-forest">
                      {survey.title}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.06em] text-ink-faint">
                      {survey.category} · updated {formatRelative(survey.updatedAt)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-mono text-[11px] font-medium text-ink">{formatNumber(count)}</p>
                    <p className="font-mono text-[8px] uppercase tracking-wide text-ink-faint">responses</p>
                  </div>
                  <StatusBadge status={survey.status} />
                  <Icon
                    name="chevronRight"
                    size={14}
                    className="shrink-0 text-line-strong transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink-faint"
                  />
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-line/80 bg-cream/35 px-5 py-3">
            <p className="text-[10px] text-ink-faint">
              Top collector:{" "}
              <span className="font-medium text-ink-soft">{ranked[0]?.survey.title ?? "None yet"}</span>
            </p>
            <Button href="/builder/new" variant="ghost" size="sm" iconLeft={<Icon name="plus" size={13} />}>
              New survey
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-display text-lg tracking-tight text-ink">Recent activity</h2>
              <p className="mt-0.5 text-[10.5px] text-ink-faint">The last few things that happened</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-line bg-cream/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live
            </span>
          </div>
          <div className="divide-y divide-line/80 border-t border-line/80">
            {activity.slice(0, 5).map((item) => {
              const body = (
                <>
                  <ActivityIcon type={item.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] text-ink-soft">
                      <span className="font-medium text-ink">{item.surveyTitle}</span> {item.message}
                    </p>
                    <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.07em] text-ink-faint">
                      {formatRelativeTime(item.at)}
                    </p>
                  </div>
                  {item.surveyId && (
                    <Icon name="chevronRight" size={12} className="shrink-0 text-line-strong" />
                  )}
                </>
              );
              return item.surveyId ? (
                <Link
                  key={item.id}
                  href={`/builder/${item.surveyId}`}
                  className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-canvas/60"
                >
                  {body}
                </Link>
              ) : (
                <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                  {body}
                </div>
              );
            })}
          </div>
          <div className="border-t border-line/80 bg-cream/35 px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                <Icon name="shield" size={11} />
                Stored locally in your browser
              </p>
              <Link
                href="/dashboard/responses"
                className="flex items-center gap-1 text-[10px] font-medium text-forest"
              >
                Open inbox
                <Icon name="arrowRight" size={10} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="rounded-xl border border-line bg-cream/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest/10 bg-surface text-forest">
              <Icon name="sparkles" size={15} />
            </span>
            <div>
              <p className="text-[12px] font-medium text-ink">The demo workspace is yours to explore.</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-faint">
                Eight surveys, 1,196 responses, and a builder ready for your next question. Everything
                stays in this browser.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:pl-4">
            <Button href="/builder/new" size="sm" iconLeft={<Icon name="plus" size={13} />}>
              Start a survey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
