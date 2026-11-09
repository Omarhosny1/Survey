import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import type { Survey } from "@/types/domain";
import { seedActivity, seedProfile, seedResponses, seedSurveys } from "@/features/surveys/seed";
import { DEMO_COMPANY, DEMO_EMAIL, DEMO_NAME, DEMO_ROLE } from "@/features/auth/services/auth.service";
import { surveyToPayload } from "@/features/surveys/services/survey.service";
import { uid } from "@/lib/utils";

type Client = SupabaseClient<Database>;

const RESPONSES_PER_SURVEY = 18;
const CHUNK_SIZE = 200;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

/**
 * The seed file reuses option ids such as `opt_1` across questions, which would
 * collide in the database. Question ids stay stable so seeded responses and
 * activity still line up.
 */
function normalizeSurvey(survey: Survey): Survey {
  return {
    ...survey,
    questions: survey.questions.map((question) => ({
      ...question,
      options: question.options.map((option, index) => ({
        ...option,
        id: `${question.id}_opt_${index + 1}`,
      })),
    })),
    theme: { ...survey.theme },
  };
}

function normalizeActivityId(id: string): string {
  return id.startsWith("act_") ? `evt_seed_${id.slice(4)}` : id;
}

async function assertSignedIn(client: Client): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be signed in.");
  return data.user.id;
}

export function demoSignUpMetadata() {
  return {
    name: DEMO_NAME,
    company: DEMO_COMPANY,
    role: DEMO_ROLE,
    preferences: seedProfile.preferences,
  };
}

export function demoCredentials() {
  return { email: DEMO_EMAIL, password: "surveyland-demo" };
}

/**
 * Seed the signed-in demo account with a smaller, database-safe version of the
 * local demo data. Safe to call only when the workspace is empty.
 */
export async function seedDemoWorkspace(client: Client): Promise<void> {
  const ownerId = await assertSignedIn(client);

  const surveys = seedSurveys.map(normalizeSurvey);

  for (const survey of surveys) {
    const { error } = await client.rpc("save_survey_tree", {
      p_survey: surveyToPayload(survey) as unknown as Json,
    });
    if (error) throw error;
  }

  const responseCountBySurvey = new Map<string, number>();
  const responses = seedResponses.filter((response) => {
    const count = responseCountBySurvey.get(response.surveyId) ?? 0;
    if (count >= RESPONSES_PER_SURVEY) return false;
    responseCountBySurvey.set(response.surveyId, count + 1);
    return true;
  });

  for (const batch of chunk(responses, CHUNK_SIZE)) {
    const { error } = await client.from("responses").insert(
      batch.map((response) => ({
        id: response.id,
        survey_id: response.surveyId,
        name: response.name,
        email: response.email,
        completion: response.completion,
        duration_seconds: response.durationSeconds,
        device: response.device,
        submitted_at: response.submittedAt,
      })),
    );
    if (error) throw error;
  }

  const questionLookup = new Map(
    surveys.flatMap((survey) =>
      survey.questions.map((question) => [question.id, question] as const),
    ),
  );

  type ResponseAnswerInsert =
    Database["public"]["Tables"]["response_answers"]["Insert"];

  const answers: ResponseAnswerInsert[] = [];

  for (const response of responses) {
    for (const [questionId, value] of Object.entries(response.answers)) {
      const question = questionLookup.get(questionId);
      if (!question) continue;

      if (question.type === "long_answer") {
        const text = typeof value === "string" ? value.trim() : "";
        if (!text) continue;
        answers.push({
          response_id: response.id,
          question_id: questionId,
          option_id: null,
          text_value: text,
        });
        continue;
      }

      const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
      for (const label of values) {
        const option = question.options.find((item) => item.label === label.trim());
        if (!option) continue;

        answers.push({
          response_id: response.id,
          question_id: questionId,
          option_id: option.id,
          text_value: null,
        });
      }
    }
  }

  for (const batch of chunk(answers, CHUNK_SIZE)) {
    const { error } = await client.from("response_answers").insert(batch);
    if (error) throw error;
  }

  if (seedActivity.length > 0) {
    const { error } = await client.from("activity_events").insert(
      seedActivity.map((item) => ({
        id: normalizeActivityId(item.id) || uid("evt"),
        owner_id: ownerId,
        survey_id: item.surveyId,
        type: item.type,
        survey_title: item.surveyTitle,
        message: item.message,
        created_at: item.at,
      })),
    );
    if (error) throw error;
  }
}
