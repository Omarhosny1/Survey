import type {
  Question,
  QuestionStat,
  Survey,
  SurveyResponse,
  SurveyStoreState,
  TrendPoint,
} from "./types";
import { dayKey, percentage, startOfUtcDay } from "./utils";

const DAY = 86_400_000;

export function responsesFor(
  state: Pick<SurveyStoreState, "responses">,
  surveyId?: string,
): SurveyResponse[] {
  if (!surveyId || surveyId === "all") return state.responses;
  return state.responses.filter((response) => response.surveyId === surveyId);
}

export function responseCount(
  state: Pick<SurveyStoreState, "responses">,
  surveyId: string,
): number {
  return state.responses.reduce(
    (total, response) => (response.surveyId === surveyId ? total + 1 : total),
    0,
  );
}

export function completionRate(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  return (
    Math.round(
      (responses.reduce((total, response) => total + response.completion, 0) /
        responses.length) *
        10,
    ) / 10
  );
}

export function averageDuration(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  return Math.round(
    responses.reduce((total, response) => total + response.durationSeconds, 0) /
      responses.length,
  );
}

export function todayCount(responses: SurveyResponse[], now = new Date()): number {
  const today = dayKey(new Date(startOfUtcDay(now)).toISOString());
  return responses.filter((response) => dayKey(response.submittedAt) === today).length;
}

export function responsesInLastDays(
  responses: SurveyResponse[],
  days: number,
  now = new Date(),
): SurveyResponse[] {
  const end = startOfUtcDay(now) + DAY - 1;
  const start = end - days * DAY;
  return responses.filter((response) => {
    const time = new Date(response.submittedAt).getTime();
    return time >= start && time <= end;
  });
}

export function buildTrend(
  responses: SurveyResponse[],
  days: number,
  now = new Date(),
): TrendPoint[] {
  const base = startOfUtcDay(now);
  const counts = new Map<string, number>();
  responses.forEach((response) => {
    const key = dayKey(response.submittedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const points: TrendPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const currentDate = new Date(base - offset * DAY);
    const previousDate = new Date(base - (offset + days) * DAY);
    const currentKey = dayKey(currentDate.toISOString());
    const previousKey = dayKey(previousDate.toISOString());
    const label =
      days <= 7
        ? new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
            currentDate,
          )
        : new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }).format(currentDate);
    points.push({
      date: currentKey,
      label,
      value: counts.get(currentKey) ?? 0,
      previousValue: counts.get(previousKey) ?? 0,
    });
  }
  return points;
}

export function trendDelta(points: TrendPoint[]): number {
  const current = points.reduce((total, point) => total + point.value, 0);
  const previous = points.reduce((total, point) => total + point.previousValue, 0);
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function questionStats(
  question: Question,
  responses: SurveyResponse[],
): QuestionStat[] {
  if (question.type !== "multiple_choice") return [];
  const counts = new Map<string, number>();
  responses.forEach((response) => {
    const answer = response.answers[question.id];
    if (typeof answer === "string") {
      counts.set(answer, (counts.get(answer) ?? 0) + 1);
    }
  });
  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
  return question.options.map((option) => {
    const count = counts.get(option.label) ?? 0;
    return {
      optionId: option.id,
      label: option.label,
      count,
      percentage: percentage(count, total),
    };
  });
}

export function textAnswers(
  question: Question,
  responses: SurveyResponse[],
  limit = 6,
): string[] {
  const answers: string[] = [];
  for (const response of responses) {
    const answer = response.answers[question.id];
    if (typeof answer === "string" && answer.trim().length > 0) {
      answers.push(answer.trim());
      if (answers.length >= limit) break;
    }
  }
  return answers;
}

export function answeredCount(question: Question, responses: SurveyResponse[]): number {
  return responses.filter((response) => {
    const answer = response.answers[question.id];
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
  }).length;
}

export function responsesPerSurvey(
  state: Pick<SurveyStoreState, "surveys" | "responses">,
  days?: number,
  now = new Date(),
): Array<{ survey: Survey; count: number }> {
  const scoped = days ? responsesInLastDays(state.responses, days, now) : state.responses;
  return state.surveys
    .map((survey) => ({
      survey,
      count: scoped.reduce(
        (total, response) => (response.surveyId === survey.id ? total + 1 : total),
        0,
      ),
    }))
    .sort((a, b) => b.count - a.count);
}

export function statusCounts(surveys: Survey[]): {
  all: number;
  draft: number;
  published: number;
  closed: number;
} {
  return {
    all: surveys.length,
    draft: surveys.filter((survey) => survey.status === "draft").length,
    published: surveys.filter((survey) => survey.status === "published").length,
    closed: surveys.filter((survey) => survey.status === "closed").length,
  };
}

export function peakWeekday(responses: SurveyResponse[]): string {
  const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const counts = new Array<number>(7).fill(0);
  responsesInLastDays(responses, 30).forEach((response) => {
    const day = new Date(response.submittedAt).getUTCDay();
    counts[day] = (counts[day] ?? 0) + 1;
  });
  const max = Math.max(...counts);
  const index = counts.indexOf(max);
  return max > 0 ? labels[index] ?? "Thursday" : "No data yet";
}

export function topSurvey(
  state: Pick<SurveyStoreState, "surveys" | "responses">,
): { survey: Survey | null; count: number } {
  const ranked = responsesPerSurvey(state);
  const first = ranked[0];
  if (!first || first.count === 0) return { survey: null, count: 0 };
  return { survey: first.survey, count: first.count };
}

export function dayCompletionSeries(
  responses: SurveyResponse[],
  days: number,
  now = new Date(),
): number[] {
  const base = startOfUtcDay(now);
  const buckets = new Map<string, { total: number; count: number }>();
  responses.forEach((response) => {
    const key = dayKey(response.submittedAt);
    const current = buckets.get(key) ?? { total: 0, count: 0 };
    buckets.set(key, {
      total: current.total + response.completion,
      count: current.count + 1,
    });
  });
  return Array.from({ length: days }, (_, index) => {
    const key = dayKey(new Date(base - (days - 1 - index) * DAY).toISOString());
    const bucket = buckets.get(key);
    return bucket ? Math.round(bucket.total / bucket.count) : 0;
  });
}

export function getInsights(
  state: Pick<SurveyStoreState, "surveys" | "responses">,
  surveyId?: string,
): Array<{ label: string; value: string; detail: string; tone: "forest" | "coral" | "gold" }> {
  const scoped = responsesFor(state, surveyId);
  const recent = responsesInLastDays(scoped, 30);
  const previous = scoped.filter((response) => {
    const time = new Date(response.submittedAt).getTime();
    const end = startOfUtcDay(new Date()) - 30 * DAY;
    const start = end - 30 * DAY;
    return time >= start && time < end;
  });
  const top = topSurvey(
    surveyId && surveyId !== "all"
      ? { surveys: state.surveys, responses: scoped }
      : state,
  );

  const completionNow = completionRate(recent);
  const completionBefore = completionRate(previous);
  const delta = Math.round((completionNow - completionBefore) * 10) / 10;

  return [
    {
      label: "Busiest day",
      value: peakWeekday(scoped),
      detail: "Most responses over the last 30 days",
      tone: "forest",
    },
    {
      label: "Completion shift",
      value: `${delta >= 0 ? "+" : ""}${delta} pts`,
      detail: "Compared with the previous 30 days",
      tone: "coral",
    },
    {
      label: "Top collector",
      value: top.survey?.title ?? "No responses",
      detail: top.count > 0 ? `${top.count.toLocaleString()} responses all time` : "Publish a survey",
      tone: "gold",
    },
  ];
}

export function formatAnswerPreview(value: string | string[] | undefined): string {
  if (value === undefined) return "No answer";
  return Array.isArray(value) ? value.join(", ") : value;
}
