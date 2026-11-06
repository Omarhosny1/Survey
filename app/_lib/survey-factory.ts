import type { Question, QuestionType, Survey } from "./types";
import { uid } from "./utils";

export const surveyAccents = [
  { label: "Evergreen", value: "#0d5947" },
  { label: "Coral", value: "#c94e1f" },
  { label: "Harbor", value: "#46697c" },
  { label: "Ochre", value: "#b07d1a" },
  { label: "Olive", value: "#5f6b3a" },
  { label: "Clay", value: "#a34a32" },
] as const;

export const surveyCategories = [
  "Customer experience",
  "Product research",
  "People",
  "Events",
  "Brand",
  "Design",
  "Education",
  "Other",
] as const;

export function blankQuestion(type: QuestionType = "multiple_choice"): Question {
  return {
    id: uid("q"),
    type,
    title: type === "multiple_choice" ? "Untitled question" : "Your question",
    description: "",
    required: true,
    options:
      type === "multiple_choice"
        ? [
            { id: uid("opt"), label: "Option 1" },
            { id: uid("opt"), label: "Option 2" },
            { id: uid("opt"), label: "Option 3" },
          ]
        : [],
  };
}

export function newSurvey(id: string, slug: string): Survey {
  return {
    id,
    slug,
    title: "Untitled survey",
    description: "",
    status: "draft",
    category: "Customer experience",
    questions: [
      {
        id: uid("q"),
        type: "multiple_choice",
        title: "How satisfied are you with your experience?",
        description: "",
        required: true,
        options: [
          { id: uid("opt"), label: "Very satisfied" },
          { id: uid("opt"), label: "Satisfied" },
          { id: uid("opt"), label: "Neutral" },
          { id: uid("opt"), label: "Dissatisfied" },
          { id: uid("opt"), label: "Very dissatisfied" },
        ],
      },
      {
        id: uid("q"),
        type: "text",
        title: "What could we do better?",
        description: "A sentence or two is plenty.",
        required: false,
        options: [],
      },
    ],
    theme: {
      accent: "#0d5947",
      showProgress: true,
      collectEmail: false,
      thankYouTitle: "Thank you for your response.",
      thankYouMessage: "Your feedback helps us make better decisions. We appreciate your time.",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    closedAt: null,
  };
}
