import type { Question, QuestionType, Survey } from "@/types/domain";
import { uid } from "@/lib/utils";

export function updateQuestion(
  survey: Survey,
  questionId: string,
  patch: Partial<Question>,
): Survey {
  return {
    ...survey,
    questions: survey.questions.map((question) =>
      question.id === questionId ? { ...question, ...patch } : question,
    ),
  };
}

export function appendQuestion(survey: Survey, question: Question): Survey {
  return { ...survey, questions: [...survey.questions, question] };
}

export function duplicateQuestion(
  survey: Survey,
  questionId: string,
): { survey: Survey; copy: Question } | null {
  const index = survey.questions.findIndex((question) => question.id === questionId);
  if (index < 0) return null;

  const source = survey.questions[index];
  if (!source) return null;

  const copy: Question = {
    ...source,
    id: uid("q"),
    options: source.options.map((option) => ({ ...option, id: uid("opt") })),
  };

  const questions = [...survey.questions];
  questions.splice(index + 1, 0, copy);
  return { survey: { ...survey, questions }, copy };
}

export function removeQuestion(survey: Survey, questionId: string): Survey {
  return {
    ...survey,
    questions: survey.questions.filter((question) => question.id !== questionId),
  };
}

export function shiftQuestion(
  survey: Survey,
  questionId: string,
  direction: -1 | 1,
): Survey {
  const index = survey.questions.findIndex((question) => question.id === questionId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= survey.questions.length) return survey;

  const questions = [...survey.questions];
  const [moved] = questions.splice(index, 1);
  if (moved) questions.splice(target, 0, moved);
  return { ...survey, questions };
}

export function reorderQuestions(
  survey: Survey,
  sourceId: string,
  targetId: string,
): Survey {
  const from = survey.questions.findIndex((question) => question.id === sourceId);
  const to = survey.questions.findIndex((question) => question.id === targetId);
  if (from < 0 || to < 0 || from === to) return survey;

  const questions = [...survey.questions];
  const [moved] = questions.splice(from, 1);
  if (moved) questions.splice(to, 0, moved);
  return { ...survey, questions };
}

export function changeQuestionType(
  survey: Survey,
  questionId: string,
  type: QuestionType,
): Survey {
  const question = survey.questions.find((item) => item.id === questionId);
  if (!question || question.type === type) return survey;

  const isChoice = type === "single_choice" || type === "multiple_choice";

  if (!isChoice) {
    return updateQuestion(survey, questionId, { type, options: [] });
  }

  const options =
    question.options.length < 2
      ? [
          { id: uid("opt"), label: "Option 1" },
          { id: uid("opt"), label: "Option 2" },
        ]
      : question.options;

  return updateQuestion(survey, questionId, { type, options });
}

export function appendOption(survey: Survey, questionId: string): Survey {
  const question = survey.questions.find((item) => item.id === questionId);
  if (!question) return survey;

  return updateQuestion(survey, questionId, {
    options: [
      ...question.options,
      { id: uid("opt"), label: `Option ${question.options.length + 1}` },
    ],
  });
}

export function removeOption(
  survey: Survey,
  questionId: string,
  optionId: string,
): Survey {
  const question = survey.questions.find((item) => item.id === questionId);
  if (!question || question.options.length <= 2) return survey;

  return updateQuestion(survey, questionId, {
    options: question.options.filter((option) => option.id !== optionId),
  });
}

export function updateOption(
  survey: Survey,
  questionId: string,
  optionId: string,
  label: string,
): Survey {
  const question = survey.questions.find((item) => item.id === questionId);
  if (!question) return survey;

  return updateQuestion(survey, questionId, {
    options: question.options.map((option) =>
      option.id === optionId ? { ...option, label } : option,
    ),
  });
}
