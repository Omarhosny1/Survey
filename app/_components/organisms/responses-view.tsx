"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input, Select } from "@/components/atoms/input";
import { SectionLabel } from "@/components/atoms/misc";
import { Progress } from "@/components/atoms/progress";
import { EmptyState } from "@/components/molecules/empty-state";
import { Modal } from "@/components/molecules/modal";
import { PageHeader } from "@/components/molecules/section-heading";
import { useToast } from "@/components/molecules/toast";
import {
  averageDuration,
  completionRate,
  formatAnswerPreview,
  responseCount,
} from "@/lib/analytics";
import { useSurveyStore } from "@/lib/store";
import {
  cn,
  downloadCsv,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatRelative,
} from "@/lib/utils";

type SortKey = "newest" | "oldest" | "longest";
const PAGE_SIZE = 12;

function StatTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: "inbox" | "checkCircle" | "clock" | "grid";
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <SectionLabel>{label}</SectionLabel>
        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-canvas/60 text-ink-faint">
          <Icon name={icon} size={12} />
        </span>
      </div>
      <p className="mt-2.5 font-display text-[24px] leading-none tracking-[-0.03em] text-ink">
        {value}
      </p>
      <p className="mt-1.5 text-[10px] text-ink-faint">{detail}</p>
    </div>
  );
}

export function ResponsesView({ initialSurveyId }: { initialSurveyId?: string }) {
  const state = useSurveyStore();
  const { surveys, responses } = state;
  const toast = useToast();

  const validInitialId =
    initialSurveyId && surveys.some((survey) => survey.id === initialSurveyId)
      ? initialSurveyId
      : null;
  const [surveyFilter, setSurveyFilter] = useState<string>(validInitialId ?? "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const surveysById = useMemo(
    () => new Map(surveys.map((survey) => [survey.id, survey])),
    [surveys],
  );

  const scoped = useMemo(
    () =>
      surveyFilter === "all"
        ? responses
        : responses.filter((response) => response.surveyId === surveyFilter),
    [responses, surveyFilter],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = scoped.filter((response) => {
      if (!term) return true;
      const survey = surveysById.get(response.surveyId);
      const answerText = Object.values(response.answers).map(formatAnswerPreview).join(" ");
      return `${response.name} ${response.email ?? ""} ${survey?.title ?? ""} ${answerText}`
        .toLowerCase()
        .includes(term);
    });

    return [...list].sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sort === "longest") return b.durationSeconds - a.durationSeconds;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [query, scoped, sort, surveysById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const mobileShare =
    scoped.length > 0
      ? Math.round((scoped.filter((response) => response.device === "Mobile").length / scoped.length) * 100)
      : 0;
  const selected = selectedId ? responses.find((response) => response.id === selectedId) : null;
  const selectedSurvey = selected ? surveysById.get(selected.surveyId) : null;
  const activeSurvey = surveyFilter === "all" ? null : surveysById.get(surveyFilter);
  const hasFilters = query.trim().length > 0 || surveyFilter !== "all";

  const resetFilters = () => {
    setQuery("");
    setSurveyFilter("all");
    setSort("newest");
    setPage(1);
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.warning("Nothing to export", "Adjust the filters to find some responses first.");
      return;
    }

    if (activeSurvey) {
      downloadCsv(`${activeSurvey.slug}-responses.csv`, [
        [
          "Respondent",
          "Email",
          "Submitted",
          "Completion %",
          "Duration (seconds)",
          "Device",
          ...activeSurvey.questions.map((question) => question.title),
        ],
        ...filtered.map((response) => [
          response.name,
          response.email ?? "",
          formatDateTime(response.submittedAt),
          String(response.completion),
          String(response.durationSeconds),
          response.device,
          ...activeSurvey.questions.map((question) =>
            formatAnswerPreview(response.answers[question.id]),
          ),
        ]),
      ]);
      toast.success("CSV exported", `${formatNumber(filtered.length)} responses from “${activeSurvey.title}”.`);
      return;
    }

    downloadCsv("surveyland-responses.csv", [
      [
        "Respondent",
        "Email",
        "Survey",
        "Submitted",
        "Completion %",
        "Duration (seconds)",
        "Device",
        "Answers",
      ],
      ...filtered.map((response) => {
        const survey = surveysById.get(response.surveyId);
        const answers = survey
          ? survey.questions
              .map(
                (question) =>
                  `${question.title}: ${formatAnswerPreview(response.answers[question.id])}`,
              )
              .join(" | ")
          : "";
        return [
          response.name,
          response.email ?? "",
          survey?.title ?? "Deleted survey",
          formatDateTime(response.submittedAt),
          String(response.completion),
          String(response.durationSeconds),
          response.device,
          answers,
        ];
      }),
    ]);
    toast.success("CSV exported", `${formatNumber(filtered.length)} responses across all surveys.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Response inbox"
        title="Every answer, in one place"
        description={`${formatNumber(responses.length)} responses across ${surveys.length} surveys. Search, read individual replies, or export the raw data.`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={exportCsv}
              iconLeft={<Icon name="download" size={14} />}
            >
              Export CSV
            </Button>
            <Button href="/dashboard/analytics" variant="outline" iconLeft={<Icon name="chart" size={14} />}>
              Analytics
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Responses"
          value={formatNumber(scoped.length)}
          detail={activeSurvey ? `From ${activeSurvey.title}` : "Across every survey"}
          icon="inbox"
        />
        <StatTile
          label="Completion"
          value={`${completionRate(scoped)}%`}
          detail="Average completion rate"
          icon="checkCircle"
        />
        <StatTile
          label="Avg. duration"
          value={formatDuration(averageDuration(scoped))}
          detail="Time spent per response"
          icon="clock"
        />
        <StatTile
          label="On mobile"
          value={`${mobileShare}%`}
          detail="Share of responses by device"
          icon="grid"
        />
      </div>

      <div className="rounded-xl border border-line bg-surface p-3 shadow-soft">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search names, emails, or answers…"
              aria-label="Search responses"
              className="pr-9"
              prefix={<Icon name="search" size={14} />}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
              >
                <Icon name="x" size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="response-survey-filter" className="sr-only">
              Filter by survey
            </label>
            <Select
              id="response-survey-filter"
              value={surveyFilter}
              onChange={(event) => {
                setSurveyFilter(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full min-w-[170px] text-[12px] sm:w-[220px]"
            >
              <option value="all">All surveys ({formatNumber(responses.length)})</option>
              {surveys.map((survey) => (
                <option key={survey.id} value={survey.id}>
                  {survey.title} ({formatNumber(responseCount(state, survey.id))})
                </option>
              ))}
            </Select>

            <label htmlFor="response-sort" className="sr-only">
              Sort responses
            </label>
            <Select
              id="response-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortKey);
                setPage(1);
              }}
              className="h-9 w-[148px] text-[12px]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="longest">Longest first</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-[11px] text-ink-faint">
          {filtered.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-ink-soft">
                {formatNumber(start + 1)}–{formatNumber(Math.min(start + PAGE_SIZE, filtered.length))}
              </span>{" "}
              of {formatNumber(filtered.length)}
              {hasFilters ? " filtered responses" : " responses"}
            </>
          ) : (
            "No responses match these filters"
          )}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex cursor-pointer items-center gap-1 text-[10.5px] font-medium text-forest transition-colors hover:text-forest-deep"
          >
            <Icon name="x" size={11} />
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={hasFilters ? "search" : "inbox"}
          title={hasFilters ? "No matching responses" : "Waiting for the first response"}
          description={
            hasFilters
              ? "Try a simpler search, or switch back to all surveys to see everything."
              : "Publish a survey and share its link. New answers will appear here as they arrive."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Button href="/dashboard/surveys" iconLeft={<Icon name="layers" size={14} />}>
                View surveys
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
          <div className="hidden items-center gap-3 border-b border-line/80 bg-cream/40 px-4 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint md:flex">
            <span className="w-8" />
            <span className="min-w-0 flex-1">Respondent</span>
            <span className="hidden w-[22%] shrink-0 lg:block">Survey</span>
            <span className="w-[76px] shrink-0">Submitted</span>
            <span className="hidden w-[78px] shrink-0 sm:block">Completion</span>
            <span className="hidden w-[54px] shrink-0 lg:block">Time</span>
            <span className="hidden w-[64px] shrink-0 xl:block">Device</span>
            <span className="w-4" />
          </div>

          <div className="divide-y divide-line/80">
            {pageItems.map((response) => {
              const survey = surveysById.get(response.surveyId);
              const accent = survey?.theme.accent ?? "#0d5947";
              return (
                <button
                  key={response.id}
                  type="button"
                  onClick={() => setSelectedId(response.id)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas/55"
                >
                  <Avatar name={response.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[12.5px] font-medium text-ink">{response.name}</p>
                      {response.email && (
                        <span className="hidden shrink-0 rounded-full border border-line bg-canvas/60 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.06em] text-ink-faint sm:inline-flex">
                          Email
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[10px] text-ink-faint">
                      {response.email ?? "No email provided"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 truncate text-[9.5px] text-ink-faint md:hidden">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      {survey?.title ?? "Deleted survey"}
                    </p>
                  </div>

                  <div className="hidden w-[22%] shrink-0 items-center gap-1.5 lg:flex">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[11px] text-ink-soft">
                      {survey?.title ?? "Deleted survey"}
                    </span>
                  </div>

                  <div className="w-[76px] shrink-0">
                    <p className="text-[10.5px] text-ink-soft" title={formatDateTime(response.submittedAt)}>
                      {formatRelative(response.submittedAt)}
                    </p>
                  </div>

                  <div className="hidden w-[78px] shrink-0 items-center gap-1.5 sm:flex">
                    <Progress
                      value={response.completion}
                      height="xs"
                      color={accent}
                      className="flex-1"
                      label="Completion"
                    />
                    <span className="font-mono text-[9px] text-ink-faint">{response.completion}%</span>
                  </div>

                  <div className="hidden w-[54px] shrink-0 font-mono text-[10px] text-ink-faint lg:block">
                    {formatDuration(response.durationSeconds)}
                  </div>

                  <div className="hidden w-[64px] shrink-0 xl:block">
                    <Badge tone="outline" className="px-1.5 text-[9.5px] font-normal">
                      {response.device}
                    </Badge>
                  </div>

                  <Icon name="chevronRight" size={13} className="shrink-0 text-line-strong" />
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/80 bg-cream/35 px-4 py-2.5">
            <p className="text-[10px] text-ink-faint">
              Page <span className="font-medium text-ink-soft">{safePage}</span> of{" "}
              {formatNumber(totalPages)}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={safePage <= 1}
                iconLeft={<Icon name="chevronLeft" size={13} />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                disabled={safePage >= totalPages}
                iconRight={<Icon name="chevronRight" size={13} />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 px-0.5 text-[9.5px] text-ink-faint">
        <Icon name="shield" size={11} />
        Demo responses live in this browser. Export a CSV to keep a copy elsewhere.
      </p>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Response"}
        description={
          selected
            ? `${selectedSurvey?.title ?? "Deleted survey"} · ${formatDateTime(selected.submittedAt)}`
            : undefined
        }
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSelectedId(null)}>
              Close
            </Button>
            {selected && selectedSurvey && (
              <>
                <Button
                  href={`/builder/${selectedSurvey.id}`}
                  variant="secondary"
                  size="sm"
                  iconLeft={<Icon name="edit" size={13} />}
                >
                  Open survey
                </Button>
                <Button
                  href={`/dashboard/analytics?survey=${selectedSurvey.id}`}
                  size="sm"
                  iconLeft={<Icon name="chart" size={13} />}
                >
                  View analytics
                </Button>
              </>
            )}
          </>
        }
      >
        {selected && selectedSurvey && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-cream/40 p-3 sm:grid-cols-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                  Completion
                </p>
                <p className="mt-1 font-display text-lg leading-none text-ink">{selected.completion}%</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                  Duration
                </p>
                <p className="mt-1 font-display text-lg leading-none text-ink">
                  {formatDuration(selected.durationSeconds)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                  Device
                </p>
                <p className="mt-1 font-display text-lg leading-none text-ink">{selected.device}</p>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                  Email
                </p>
                <p className="mt-1 truncate text-[11px] leading-5 text-ink-soft">
                  {selected.email ?? "Not collected"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedSurvey.questions.map((question, index) => {
                const answer = formatAnswerPreview(selected.answers[question.id]);
                const answered = answer !== "No answer" && answer.trim().length > 0;
                return (
                  <div key={question.id}>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-faint">
                      Question {index + 1} ·{" "}
                      {question.type === "multiple_choice" ? "Multiple choice" : "Long answer"}
                    </p>
                    <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink">
                      {question.title}
                    </p>
                    <div
                      className={cn(
                        "mt-1.5 rounded-md border-l-2 bg-canvas/60 px-3 py-2 text-[12px] leading-relaxed",
                        answered ? "text-ink-soft" : "text-ink-faint italic",
                      )}
                      style={{ borderLeftColor: answered ? selectedSurvey.theme.accent : "#e5e0d4" }}
                    >
                      {answered ? answer : "No answer"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <p className="flex items-center gap-1.5 text-[9.5px] text-ink-faint">
                <Icon name="calendar" size={11} />
                {formatDate(selected.submittedAt, { withYear: true })}
              </p>
              <Link
                href={`/dashboard/analytics?survey=${selectedSurvey.id}`}
                className="flex items-center gap-1 text-[10.5px] font-medium text-forest transition-colors hover:text-forest-deep"
              >
                Survey analytics
                <Icon name="arrowRight" size={11} />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
