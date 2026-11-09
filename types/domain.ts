export type SurveyStatus = "draft" | "published" | "closed";

export type QuestionType = "single_choice" | "multiple_choice" | "long_answer";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options: QuestionOption[];
}

export interface SurveyTheme {
  accent: string;
  showProgress: boolean;
  collectEmail: boolean;
  thankYouTitle: string;
  thankYouMessage: string;
}

export interface Survey {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: SurveyStatus;
  category: string;
  questions: Question[];
  theme: SurveyTheme;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  closedAt: string | null;
}

export type AnswerValue = string | string[];

export interface SurveyResponse {
  id: string;
  surveyId: string;
  submittedAt: string;
  name: string;
  email: string | null;
  answers: Record<string, AnswerValue>;
  completion: number;
  durationSeconds: number;
  device: "Desktop" | "Mobile" | "Tablet";
}

export type ActivityType =
  | "published"
  | "created"
  | "response"
  | "edited"
  | "duplicated"
  | "closed"
  | "reopened";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  surveyId: string | null;
  surveyTitle: string;
  message: string;
  at: string;
}

export interface ProfilePreferences {
  weeklyDigest: boolean;
  newResponses: boolean;
  productUpdates: boolean;
  reduceMotion: boolean;
}

export interface Profile {
  name: string;
  email: string;
  company: string;
  role: string;
  timezone: string;
  avatar: string | null;
  preferences: ProfilePreferences;
}

export interface SurveyStoreState {
  surveys: Survey[];
  responses: SurveyResponse[];
  activity: ActivityItem[];
  hydrated: boolean;
}

export interface SessionState {
  profile: Profile | null;
  hydrated: boolean;
}

export interface QuestionStat {
  optionId: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TrendPoint {
  date: string;
  label: string;
  value: number;
  previousValue: number;
}

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}
