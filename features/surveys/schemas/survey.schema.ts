import { z } from "zod";
import type { Question, Survey } from "@/types/domain";

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Every option needs a label."),
});

export const questionSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(["single_choice", "multiple_choice", "long_answer"]),
    title: z.string().trim().min(1, "Every question needs a title."),
    description: z.string().optional(),
    required: z.boolean(),
    options: z.array(questionOptionSchema),
  })
  .superRefine((question, ctx) => {
    if (question.type === "long_answer") return;
    if (question.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least two options.",
        path: ["options"],
      });
    }
  });

export const surveyDraftSchema = z.object({
  title: z.string().trim().min(1, "Add a title before publishing."),
  questions: z.array(questionSchema).min(1, "Add at least one question."),
});

export function questionIssue(question: Question): string | null {
  const result = questionSchema.safeParse(question);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "This question needs a quick fix.";
}

export function surveyIssues(survey: Pick<Survey, "title" | "questions">): string[] {
  const result = surveyDraftSchema.safeParse(survey);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}
