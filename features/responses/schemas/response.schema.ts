import { z } from "zod";

export const answerValueSchema = z.union([
  z.string(),
  z.array(z.string().min(1)),
]);

export const responseSubmissionSchema = z.object({
  surveyId: z.string().min(1),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().max(254).optional(),
  answers: z.record(z.string(), answerValueSchema),
});

export type ResponseSubmissionValues = z.infer<typeof responseSubmissionSchema>;

export const responseFiltersSchema = z.object({
  surveyId: z.string().optional(),
  query: z.string().optional(),
  device: z.enum(["Desktop", "Mobile", "Tablet"]).optional(),
  completion: z.enum(["all", "complete", "partial"]).optional(),
});

export type ResponseFilters = z.infer<typeof responseFiltersSchema>;
