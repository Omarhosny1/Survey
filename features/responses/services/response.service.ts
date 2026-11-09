import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/types/database.types";
import type {
  AnswerValue,
  Question,
  QuestionType,
  Survey,
  SurveyResponse,
  SurveyStatus,
} from "@/types/domain";
import { responseSubmissionSchema } from "../schemas/response.schema";

type Client = SupabaseClient<Database>;

export type Device = SurveyResponse["device"];

export interface SubmitResponseInput {
  survey: Survey;
  answers: Record<string, AnswerValue>;
  name?: string;
  email?: string;
  durationSeconds: number;
  device: Device;
}

export type SubmitResponseResult =
  | { ok: true; response: SurveyResponse }
  | { ok: false; error: string };

const emailSchema = z.string().email();

function isAnswered(value: AnswerValue | undefined): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  return Array.isArray(value) && value.length > 0;
}

interface PublicQuestionShape {
  id: string;
  type: string;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  options: Array<{ id: string; label: string; position: number }>;
}

interface PublicSurveyShape {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  category: string | null;
  accent: string | null;
  show_progress: boolean | null;
  collect_email: boolean | null;
  thank_you_title: string | null;
  thank_you_message: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  closed_at: string | null;
  questions: PublicQuestionShape[];
}

function normalizeQuestionType(type: string): QuestionType {
  if (type === "single_choice" || type === "multiple_choice" || type === "long_answer") {
    return type;
  }
  return "long_answer";
}

function mapPublicSurvey(payload: unknown): Survey | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as PublicSurveyShape;
  if (!data.id || !data.slug) return null;

  const questions: Question[] = [...(data.questions ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((question) => ({
      id: question.id,
      type: normalizeQuestionType(question.type),
      title: question.title,
      description: question.description ?? "",
      required: question.required,
      options: [...(question.options ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((option) => ({ id: option.id, label: option.label })),
    }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? "",
    status: data.status as SurveyStatus,
    category: data.category ?? "Other",
    questions,
    theme: {
      accent: data.accent ?? "#0d5947",
      showProgress: data.show_progress ?? true,
      collectEmail: data.collect_email ?? false,
      thankYouTitle: data.thank_you_title ?? "Thank you for your response.",
      thankYouMessage:
        data.thank_you_message ??
        "Your feedback helps us make better decisions. We appreciate your time.",
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    publishedAt: data.published_at,
    closedAt: data.closed_at,
  };
}

/**
 * Public surveys are fetched exclusively through a SECURITY DEFINER RPC so
 * anonymous visitors cannot enumerate drafts or read tables directly.
 */
export async function fetchPublicSurvey(client: Client, slug: string): Promise<Survey | null> {
  const { data, error } = await client.rpc("get_public_survey", { p_slug: slug });
  if (error) throw error;
  return mapPublicSurvey(data);
}

function toRpcAnswers(answers: Record<string, AnswerValue>): Record<string, string | string[]> {
  const entries: Record<string, string | string[]> = {};
  for (const [questionId, value] of Object.entries(answers)) {
    if (typeof value === "string") {
      const text = value.trim();
      if (text) entries[questionId] = text;
      continue;
    }
    const values = value.map((item) => item.trim()).filter(Boolean);
    if (values.length) entries[questionId] = values;
  }
  return entries;
}

/**
 * Validates a public submission against the survey definition, then submits it
 * through the SECURITY DEFINER RPC which re-validates and writes atomically.
 */
export async function submitResponse(
  client: Client,
  input: SubmitResponseInput,
): Promise<SubmitResponseResult> {
  const { survey } = input;

  if (survey.status !== "published") {
    return { ok: false, error: "This survey is not accepting responses." };
  }

  const parsed = responseSubmissionSchema.safeParse({
    surveyId: survey.id,
    name: input.name,
    email: input.email,
    answers: input.answers,
  });

  if (!parsed.success) {
    return { ok: false, error: "Some answers could not be validated. Please review and retry." };
  }

  const questionsById = new Map(survey.questions.map((question) => [question.id, question]));
  const normalizedAnswers: Record<string, AnswerValue> = {};

  for (const [questionId, value] of Object.entries(parsed.data.answers)) {
    const question = questionsById.get(questionId);
    if (!question) {
      return { ok: false, error: "This response references an unknown question." };
    }

    if (question.type === "long_answer") {
      const text = typeof value === "string" ? value.trim() : "";
      if (!text) continue;
      if (text.length > 5000) {
        return { ok: false, error: "An answer is too long. Keep answers under 5,000 characters." };
      }
      normalizedAnswers[questionId] = text;
      continue;
    }

    const allowed = new Set(question.options.map((option) => option.label));

    if (question.type === "multiple_choice") {
      const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
      const chosen = Array.from(
        new Set(values.map((item) => item.trim()).filter(Boolean)),
      );
      if (chosen.some((item) => !allowed.has(item))) {
        return { ok: false, error: "An answer does not match the available options." };
      }
      if (chosen.length) normalizedAnswers[questionId] = chosen;
      continue;
    }

    const choice = typeof value === "string" ? value.trim() : "";
    if (choice && !allowed.has(choice)) {
      return { ok: false, error: "An answer does not match the available options." };
    }
    if (choice) normalizedAnswers[questionId] = choice;
  }

  for (const question of survey.questions) {
    if (question.required && !isAnswered(normalizedAnswers[question.id])) {
      return { ok: false, error: "Please answer all required questions." };
    }
  }

  const email = input.email?.trim() || null;
  if (survey.theme.collectEmail) {
    if (!email) return { ok: false, error: "Enter a valid email address to continue." };
    if (!emailSchema.safeParse(email).success) {
      return { ok: false, error: "Enter a valid email address to continue." };
    }
  }

  const answeredQuestions = survey.questions.filter((question) =>
    isAnswered(normalizedAnswers[question.id]),
  ).length;
  const completion =
    survey.questions.length > 0
      ? Math.round((answeredQuestions / survey.questions.length) * 100)
      : 100;

  const name =
    input.name?.trim() ||
    (email ? email.split("@")[0] ?? "Anonymous" : "Anonymous");

  const { data, error } = await client.rpc("submit_survey_response", {
    p_slug: survey.slug,
    p_name: name,
    p_email: email ?? "",
    p_duration_seconds: Math.max(1, Math.round(input.durationSeconds)),
    p_device: input.device,
    p_answers: toRpcAnswers(normalizedAnswers) as unknown as Json,
  });

  if (error) {
    return { ok: false, error: error.message || "Your response could not be saved." };
  }

  const response: SurveyResponse = {
    id: data ?? `res_${Date.now()}`,
    surveyId: survey.id,
    submittedAt: new Date().toISOString(),
    name,
    email,
    answers: normalizedAnswers,
    completion,
    durationSeconds: Math.max(1, Math.round(input.durationSeconds)),
    device: input.device,
  };

  return { ok: true, response };
}
