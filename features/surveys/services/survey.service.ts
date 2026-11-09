import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import type {
  ActivityItem,
  AnswerValue,
  Question,
  Survey,
  SurveyStoreState,
} from "@/types/domain";
import {
  mapActivity,
  mapQuestion,
  mapResponse,
  mapSurvey,
  type ActivityRow,
  type QuestionOptionRow,
  type QuestionRow,
  type ResponseAnswerRow,
  type ResponseRow,
  type SurveyRow,
} from "@/lib/supabase/mappers";
import { uid } from "@/lib/utils";

type Client = SupabaseClient<Database>;
type SurveyRowWithQuestions = SurveyRow & {
  questions: Array<QuestionRow & { question_options: QuestionOptionRow[] }>;
};

const surveySelect = `
  *,
  questions (
    *,
    question_options (*)
  )
`;

function toSurvey(row: SurveyRowWithQuestions): Survey {
  const questions = [...(row.questions ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((question) => mapQuestion(question, question.question_options ?? []));

  return mapSurvey(row, questions);
}

async function requireUserId(client: Client): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be signed in.");
  return data.user.id;
}

export async function fetchWorkspace(client: Client): Promise<SurveyStoreState> {
  const [surveysResult, responsesResult, answersResult, activityResult] = await Promise.all([
    client
      .from("surveys")
      .select(surveySelect)
      .order("updated_at", { ascending: false }),
    client.from("responses").select("*").order("submitted_at", { ascending: false }),
    client.from("response_answers").select("*"),
    client
      .from("activity_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (surveysResult.error) throw surveysResult.error;
  if (responsesResult.error) throw responsesResult.error;
  if (answersResult.error) throw answersResult.error;
  if (activityResult.error) throw activityResult.error;

  const surveys = ((surveysResult.data ?? []) as unknown as SurveyRowWithQuestions[]).map(
    toSurvey,
  );

  const optionLabels = new Map<string, string>();
  for (const survey of surveys) {
    for (const question of survey.questions) {
      for (const option of question.options) {
        optionLabels.set(option.id, option.label);
      }
    }
  }

  const answersByResponse = new Map<string, Record<string, AnswerValue>>();
  for (const answer of (answersResult.data ?? []) as ResponseAnswerRow[]) {
    const answers = answersByResponse.get(answer.response_id) ?? {};
    const value = answer.option_id
      ? optionLabels.get(answer.option_id) ?? ""
      : answer.text_value ?? "";
    const existing = answers[answer.question_id];
    if (existing === undefined) {
      answers[answer.question_id] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      answers[answer.question_id] = [existing, value];
    }
    answersByResponse.set(answer.response_id, answers);
  }

  const responses = ((responsesResult.data ?? []) as ResponseRow[]).map((row) =>
    mapResponse(row, answersByResponse.get(row.id) ?? {}),
  );

  const activity = ((activityResult.data ?? []) as ActivityRow[]).map(mapActivity);

  return { surveys, responses, activity, hydrated: true };
}

export async function fetchSurveyById(
  client: Client,
  id: string,
): Promise<Survey | null> {
  const { data, error } = await client
    .from("surveys")
    .select(surveySelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toSurvey(data as unknown as SurveyRowWithQuestions);
}

export function surveyToPayload(survey: Survey) {
  return {
    id: survey.id,
    slug: survey.slug,
    title: survey.title,
    description: survey.description,
    status: survey.status,
    category: survey.category,
    accent: survey.theme.accent,
    show_progress: survey.theme.showProgress,
    collect_email: survey.theme.collectEmail,
    thank_you_title: survey.theme.thankYouTitle,
    thank_you_message: survey.theme.thankYouMessage,
    published_at: survey.publishedAt,
    closed_at: survey.closedAt,
    questions: survey.questions.map((question: Question) => ({
      id: question.id,
      type: question.type,
      title: question.title,
      description: question.description ?? "",
      required: question.required,
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label,
      })),
    })),
  };
}

async function insertActivity(
  client: Client,
  ownerId: string,
  activity: Omit<ActivityItem, "id" | "at">,
): Promise<void> {
  const { error } = await client.from("activity_events").insert({
    id: uid("evt"),
    owner_id: ownerId,
    survey_id: activity.surveyId,
    type: activity.type,
    survey_title: activity.surveyTitle,
    message: activity.message,
  });

  if (error) throw error;
}

/**
 * Atomically saves the survey, its questions, and their options.
 * Position collisions and ownership are enforced inside the RPC.
 */
export async function saveSurveyTree(client: Client, survey: Survey): Promise<Survey> {
  const ownerId = await requireUserId(client);

  const { data: existing } = await client
    .from("surveys")
    .select("id")
    .eq("id", survey.id)
    .maybeSingle();

  const { error } = await client.rpc("save_survey_tree", {
    p_survey: surveyToPayload(survey) as unknown as Json,
  });

  if (error) throw error;

  try {
    await insertActivity(client, ownerId, {
      type: existing ? "edited" : "created",
      surveyId: survey.id,
      surveyTitle: survey.title,
      message: existing ? "was updated in the builder" : "was created as a draft",
    });
  } catch {
    // Activity is best-effort; the survey itself was saved.
  }

  const saved = await fetchSurveyById(client, survey.id);
  if (!saved) throw new Error("The survey could not be loaded after saving.");
  return saved;
}

export async function setSurveyStatus(
  client: Client,
  id: string,
  status: "published" | "closed",
): Promise<void> {
  const ownerId = await requireUserId(client);
  const now = new Date().toISOString();

  const patch =
    status === "published"
      ? {
          status,
          published_at: now,
          closed_at: null,
        }
      : {
          status,
          closed_at: now,
        };

  const { data, error } = await client
    .from("surveys")
    .update(patch)
    .eq("id", id)
    .select("title, published_at")
    .single();

  if (error) throw error;

  const type = status === "published" ? "published" : "closed";
  const message =
    status === "published"
      ? "was published to its public link"
      : "was closed to new responses";

  try {
    await insertActivity(client, ownerId, {
      type,
      surveyId: id,
      surveyTitle: data.title,
      message,
    });
  } catch {
    // Activity is best-effort.
  }
}

export async function reopenSurvey(client: Client, id: string): Promise<void> {
  const ownerId = await requireUserId(client);

  const { data, error } = await client
    .from("surveys")
    .update({ status: "published", closed_at: null })
    .eq("id", id)
    .select("title")
    .single();

  if (error) throw error;

  try {
    await insertActivity(client, ownerId, {
      type: "reopened",
      surveyId: id,
      surveyTitle: data.title,
      message: "reopened for new responses",
    });
  } catch {
    // Activity is best-effort.
  }
}

export async function deleteSurvey(client: Client, id: string): Promise<void> {
  const { error } = await client.from("surveys").delete().eq("id", id);
  if (error) throw error;

  try {
    await client.from("activity_events").delete().eq("survey_id", id);
  } catch {
    // Activity is best-effort.
  }
}

export async function duplicateSurvey(
  client: Client,
  id: string,
): Promise<Survey | null> {
  const { data, error } = await client.rpc("duplicate_survey", { p_survey_id: id });
  if (error) throw error;
  if (!data) return null;
  return fetchSurveyById(client, data);
}

export async function clearWorkspace(client: Client): Promise<void> {
  const ownerId = await requireUserId(client);

  const { error: surveysError } = await client
    .from("surveys")
    .delete()
    .eq("owner_id", ownerId);
  if (surveysError) throw surveysError;

  const { error: activityError } = await client
    .from("activity_events")
    .delete()
    .eq("owner_id", ownerId);
  if (activityError) throw activityError;
}
