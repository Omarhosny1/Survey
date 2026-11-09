import type { Database } from "@/types/database.types";
import type {
  ActivityItem,
  AnswerValue,
  Profile,
  ProfilePreferences,
  Question,
  QuestionOption,
  QuestionType,
  Survey,
  SurveyResponse,
} from "@/types/domain";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type SurveyRow = Database["public"]["Tables"]["surveys"]["Row"];
export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionOptionRow = Database["public"]["Tables"]["question_options"]["Row"];
export type ResponseRow = Database["public"]["Tables"]["responses"]["Row"];
export type ResponseAnswerRow = Database["public"]["Tables"]["response_answers"]["Row"];
export type ActivityRow = Database["public"]["Tables"]["activity_events"]["Row"];

const defaultPreferences: ProfilePreferences = {
  weeklyDigest: true,
  newResponses: true,
  productUpdates: false,
  reduceMotion: false,
};

function mapPreferences(value: unknown): ProfilePreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultPreferences };
  }

  const record = value as Record<string, unknown>;
  return {
    weeklyDigest:
      typeof record.weeklyDigest === "boolean"
        ? record.weeklyDigest
        : defaultPreferences.weeklyDigest,
    newResponses:
      typeof record.newResponses === "boolean"
        ? record.newResponses
        : defaultPreferences.newResponses,
    productUpdates:
      typeof record.productUpdates === "boolean"
        ? record.productUpdates
        : defaultPreferences.productUpdates,
    reduceMotion:
      typeof record.reduceMotion === "boolean"
        ? record.reduceMotion
        : defaultPreferences.reduceMotion,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    email: row.email,
    company: row.company ?? "",
    role: row.role ?? "",
    timezone: row.timezone ?? "UTC",
    avatar: row.avatar,
    preferences: mapPreferences(row.preferences),
  };
}

export function mapQuestionOption(row: QuestionOptionRow): QuestionOption {
  return { id: row.id, label: row.label };
}

function normalizeQuestionType(type: string): QuestionType {
  if (type === "single_choice" || type === "multiple_choice" || type === "long_answer") {
    return type;
  }
  return "long_answer";
}

export function mapQuestion(row: QuestionRow, options: QuestionOptionRow[]): Question {
  return {
    id: row.id,
    type: normalizeQuestionType(row.type),
    title: row.title,
    description: row.description,
    required: row.required,
    options: [...options]
      .sort((a, b) => a.position - b.position)
      .map(mapQuestionOption),
  };
}

export function mapSurvey(row: SurveyRow, questions: Question[]): Survey {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: row.status,
    category: row.category,
    questions,
    theme: {
      accent: row.accent,
      showProgress: row.show_progress,
      collectEmail: row.collect_email,
      thankYouTitle: row.thank_you_title,
      thankYouMessage: row.thank_you_message,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    closedAt: row.closed_at,
  };
}

export function mapResponse(
  row: ResponseRow,
  answers: Record<string, AnswerValue>,
): SurveyResponse {
  return {
    id: row.id,
    surveyId: row.survey_id,
    submittedAt: row.submitted_at,
    name: row.name ?? "Anonymous",
    email: row.email,
    answers,
    completion: row.completion,
    durationSeconds: row.duration_seconds,
    device: row.device,
  };
}

export function mapActivity(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    type: row.type,
    surveyId: row.survey_id,
    surveyTitle: row.survey_title,
    message: row.message,
    at: row.created_at,
  };
}
