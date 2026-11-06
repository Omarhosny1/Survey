"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Icon, type IconName } from "@/components/atoms/icon";
import { SectionLabel } from "@/components/atoms/misc";
import { Select } from "@/components/atoms/input";
import { AreaChart, BarList, DonutChart, Sparkline } from "@/components/molecules/charts";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/section-heading";
import { Segmented } from "@/components/molecules/segmented";
import {
  answeredCount,
  averageDuration,
  buildTrend,
  completionRate,
  dayCompletionSeries,
  getInsights,
  peakWeekday,
  questionStats,
  responseCount,
  responsesFor,
  responsesInLastDays,
  textAnswers,
  topSurvey,
  trendDelta,
} from "@/lib/analytics";
import { useSurveyStore } from "@/lib/store";
import type { Survey } from "@/lib/types";
import { cn, formatCompact, formatDuration, formatNumber } from "@/lib/utils";

type RangeDays = 7 | 14 | 30;

const deviceColors: Record<string, string> = {
  Desktop: "#0d5947",
  Mobile: "#c9952f",
  Tablet: "#517486",
};

function MetricCard({
  label,
  value,
  detail,
  icon,
  visual,
}: {
  label: string;
  value: string;
  detail: ReactNode;
  icon: IconName;
  visual?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <SectionLabel className="pt-0.5">{label}</SectionLabel>
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-canvas/60 text-ink-faint">
          <Icon name={icon} size={13} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-[27px] leading-none tracking-[-0.035em] text-ink">{value}</p>
        {visual}
      </div>
      <div className="mt-2.5 text-[10px] leading-relaxed text-ink-faint">{detail}</div>
    </div>
  );
}

function QuestionAnalysis({ survey, responses }: { survey: Survey; responses: ReturnType<typeof responsesFor> }) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {survey.questions.map((question, index) => {
        const stats = questionStats(question, responses);
        const answered = answeredCount(question, responses);
        const quotes = question.type === "text" ? textAnswers(question, responses, 3) : [];
        return (
          <div key={question.id} className="rounded-xl border border-line bg-surface p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                  Question {String(index + 1).padStart(2, "0")} ·{" "}
                  {question.type === "multiple_choice" ? "Multiple choice" : "Long answer"}
                </p>
                <h3 className="mt-1.5 text-pretty text-[13.5px] font-medium leading-relaxed text-ink">
                  {question.title}
                </h3>
              </div>
              <span className="shrink-0 rounded-full border border-line bg-canvas/60 px-2 py-0.5 font-mono text-[8.5px] text-ink-faint">
                {formatNumber(answered)} answered
              </span>
            </div>

            {question.type === "multiple_choice" ? (
              <BarList
                className="mt-4"
                items={stats.map((stat) => ({
                  label: stat.label,
                  value: stat.percentage,
                  meta: `${formatNumber(stat.count)}`,
                  color: survey.theme.accent,
                }))}
                suffix="%"
              />
            ) : quotes.length > 0 ? (
              <div className="mt-3.5 space-y-2">
                {quotes.map((quote, quoteIndex) => (
                  <blockquote
                    key={quoteIndex}
                    className="relative rounded-lg border border-line/80 bg-cream/35 px-3 py-2.5 pl-8"
                  >
                    <Icon
                      name="quote"
                      size={12}
                      className="absolute left-2.5 top-3 text-ink-faint/70"
                    />
                    <p className="text-pretty text-[11.5px] leading-relaxed text-ink-soft">
                      {quote}
                    </p>
                  </blockquote>
                ))}
              </div>
            ) : (
              <div className="mt-3.5 rounded-lg border border-dashed border-line-strong/70 px-3 py-5 text-center">
                <p className="text-[11px] text-ink-faint">No written answers yet.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsView({ initialSurveyId }: { initialSurveyId?: string }) {
  const state = useSurveyStore();
  const { surveys, responses } = state;
  const validInitialId =
    initialSurveyId && surveys.some((survey) => survey.id === initialSurveyId)
      ? initialSurveyId
      : null;
  const [surveyFilter, setSurveyFilter] = useState<string>(validInitialId ?? "all");
  const [range, setRange] = useState<RangeDays>(30);

  const scoped = useMemo(
    () => responsesFor(state, surveyFilter === "all" ? undefined : surveyFilter),
    [state, surveyFilter],
  );
  const activeSurvey = surveyFilter === "all" ? null : surveys.find((survey) => survey.id === surveyFilter) ?? null;

  const trend = useMemo(() => buildTrend(scoped, range), [scoped, range]);
  const rangeTotal = trend.reduce((total, point) => total + point.value, 0);
  const delta = trendDelta(trend);
  const recent = useMemo(() => responsesInLastDays(scoped, range), [scoped, range]);
  const completion = completionRate(recent);
  const avgSeconds = averageDuration(recent);
  const completionSeries = useMemo(() => dayCompletionSeries(scoped, range), [scoped, range]);
  const bestPoint = trend.reduce(
    (best, point) => (point.value > best.value ? point : best),
    trend[0] ?? { label: "—", value: 0, previousValue: 0, date: "" },
  );
  const averagePerDay = rangeTotal > 0 ? (rangeTotal / range).toFixed(1) : "0";
  const insights = getInsights(state, surveyFilter);
  const top = topSurvey({ surveys, responses: scoped });
  const breakdownSurvey = activeSurvey ?? top.survey;
  const breakdownResponses = breakdownSurvey
    ? responsesFor(state, breakdownSurvey.id)
    : [];

  const deviceCounts = ["Desktop", "Mobile", "Tablet"].map((device) => ({
    label: device,
    value: recent.filter((response) => response.device === device).length,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Analytics"
        title="What the responses are telling you"
        description="Response volume, completion quality, and the answers behind the numbers. Switch surveys to focus the picture."
        actions={
          <>
            <Button
              href="/dashboard/responses"
              variant="secondary"
              iconLeft={<Icon name="inbox" size={14} />}
            >
              Responses inbox
            </Button>
            {activeSurvey && (
              <Button
                href={`/builder/${activeSurvey.id}`}
                variant="outline"
                iconLeft={<Icon name="edit" size={14} />}
              >
                Open survey
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-canvas/60 text-ink-faint">
            <Icon name="filter" size={13} />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">Scope</p>
            <p className="mt-0.5 truncate text-[11.5px] font-medium text-ink-soft">
              {activeSurvey ? activeSurvey.title : "All surveys"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="analytics-survey-filter" className="sr-only">
            Filter analytics by survey
          </label>
          <Select
            id="analytics-survey-filter"
            value={surveyFilter}
            onChange={(event) => setSurveyFilter(event.target.value)}
            className="h-9 w-full min-w-[190px] text-[12px] sm:w-[250px]"
          >
            <option value="all">All surveys ({formatNumber(responses.length)})</option>
            {surveys.map((survey) => (
              <option key={survey.id} value={survey.id}>
                {survey.title} ({formatNumber(responseCount(state, survey.id))})
              </option>
            ))}
          </Select>
          <Segmented
            ariaLabel="Analytics time range"
            value={String(range)}
            onChange={(value) => setRange(value === "7" ? 7 : value === "30" ? 30 : 14)}
            options={[
              { value: "7", label: "7d" },
              { value: "14", label: "14d" },
              { value: "30", label: "30d" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Responses"
          value={formatNumber(rangeTotal)}
          icon="inbox"
          detail={
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  delta >= 0 ? "text-success" : "text-danger",
                )}
              >
                <Icon name={delta >= 0 ? "trendingUp" : "trendingDown"} size={10} />
                {delta >= 0 ? "+" : ""}
                {delta}%
              </span>
              vs previous {range} days
            </span>
          }
          visual={<Sparkline data={trend.map((point) => point.value)} width={68} height={24} />}
        />
        <MetricCard
          label="Completion"
          value={`${completion}%`}
          icon="checkCircle"
          detail={`${formatNumber(recent.length)} replies in this period`}
          visual={
            <Sparkline
              data={completionSeries}
              width={68}
              height={24}
              color="#517486"
            />
          }
        />
        <MetricCard
          label="Avg. duration"
          value={formatDuration(avgSeconds)}
          icon="clock"
          detail={completion >= 80 ? "Healthy completion window" : "Short responses can still be useful"}
        />
        <MetricCard
          label="Busiest day"
          value={peakWeekday(scoped)}
          icon="calendar"
          detail={
            <span className="flex items-center gap-1">
              <Icon name="info" size={10} />
              Based on the last 30 days
            </span>
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
            <div>
              <SectionLabel>Response activity</SectionLabel>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="font-display text-[30px] leading-none tracking-[-0.04em] text-ink">
                  {formatNumber(rangeTotal)}
                </h2>
                <span className="text-[12px] text-ink-faint">responses</span>
              </div>
              <p className="mt-2 text-[10.5px] text-ink-faint">
                {activeSurvey ? activeSurvey.title : "Across all surveys"} · last {range} days
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              href="/dashboard/responses"
              iconRight={<Icon name="arrowRight" size={12} />}
            >
              Read responses
            </Button>
          </div>

          <div className="mt-2 px-2 pb-1 sm:px-3">
            <AreaChart data={trend} height={250} showComparison valueLabel="responses" />
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
            <span className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                This period
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                Previous
              </span>
            </span>
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <SectionLabel>Response mix</SectionLabel>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
              Last {range} days
            </span>
          </div>
          <div className="mt-4 flex items-center gap-5">
            <DonutChart
              size={120}
              thickness={12}
              centerValue={formatCompact(recent.length)}
              centerLabel="replies"
              data={deviceCounts.map((item) => ({
                ...item,
                color: deviceColors[item.label] ?? "#0d5947",
              }))}
            />
            <div className="min-w-0 flex-1 space-y-2.5">
              {deviceCounts.map((device) => {
                const share =
                  recent.length > 0 ? Math.round((device.value / recent.length) * 100) : 0;
                return (
                  <div key={device.label} className="flex items-center justify-between gap-2 text-[10.5px]">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: deviceColors[device.label] }}
                      />
                      {device.label}
                    </span>
                    <span className="font-mono text-ink-faint">{share}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-line/80 pt-4">
            <p className="flex items-center justify-between gap-2 text-[10px] text-ink-faint">
              <span>Completion snapshot</span>
              <span className="font-mono text-ink">{completion}%</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas-deep">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${completion}%`,
                  backgroundColor: activeSurvey?.theme.accent ?? "#0d5947",
                }}
              />
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-ink-faint">
              Percentage of questions answered, averaged across {formatNumber(recent.length)} responses.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>What stands out</SectionLabel>
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-cream/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Auto insights
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
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
              <div
                key={insight.label}
                className="rounded-lg border border-line/80 bg-cream/30 p-3.5"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border",
                    toneClass,
                  )}
                >
                  <Icon name={iconName} size={13} />
                </span>
                <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">
                  {insight.label}
                </p>
                <p className="mt-1 truncate font-display text-[17px] leading-tight text-ink">
                  {insight.value}
                </p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-ink-faint">{insight.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-0.5">
          <div>
            <h2 className="font-display text-xl tracking-tight text-ink">Question-level results</h2>
            <p className="mt-1 text-[10.5px] text-ink-faint">
              {breakdownSurvey
                ? `${breakdownSurvey.title} · ${formatNumber(breakdownResponses.length)} responses, all time`
                : "Select a survey to explore its answers."}
            </p>
          </div>
          {breakdownSurvey && (
            <Link
              href={`/dashboard/analytics?survey=${breakdownSurvey.id}`}
              className="flex items-center gap-1 text-[10.5px] font-medium text-forest transition-colors hover:text-forest-deep"
            >
              Focus this survey
              <Icon name="arrowRight" size={11} />
            </Link>
          )}
        </div>

        {breakdownSurvey && breakdownResponses.length > 0 ? (
          <QuestionAnalysis survey={breakdownSurvey} responses={breakdownResponses} />
        ) : (
          <EmptyState
            icon="chart"
            title="No answers to analyze yet"
            description="Once a survey collects responses, its option breakdowns and written answers will appear here."
            action={
              <Button href="/dashboard/surveys" variant="secondary" iconLeft={<Icon name="layers" size={14} />}>
                View surveys
              </Button>
            }
          />
        )}
      </section>

      <p className="flex items-center gap-1.5 px-0.5 text-[9.5px] text-ink-faint">
        <Icon name="info" size={11} />
        Insights use the demo responses stored in this browser. Small samples can look dramatic.
      </p>
    </div>
  );
}
