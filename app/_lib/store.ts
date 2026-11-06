"use client";

import { useSyncExternalStore } from "react";
import { createSeedState } from "./seed";
import type { ActivityItem, Survey, SurveyResponse, SurveyStoreState } from "./types";
import { slugify, uid } from "./utils";

const STORAGE_KEY = "surveyland.store.v1";
const STORAGE_VERSION = 1;

const initialSnapshot: SurveyStoreState = createSeedState();
let state: SurveyStoreState = initialSnapshot;
let hasHydrated = false;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function persist(next: SurveyStoreState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        surveys: next.surveys,
        responses: next.responses,
        activity: next.activity,
      }),
    );
  } catch {
    // Storage can be unavailable in private browsing; the demo keeps working in memory.
  }
}

function commit(partial: Partial<SurveyStoreState>): void {
  state = { ...state, ...partial };
  persist(state);
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SurveyStoreState {
  return state;
}

function getServerSnapshot(): SurveyStoreState {
  return initialSnapshot;
}

export function hydrateStore(): void {
  if (hasHydrated || typeof window === "undefined") return;
  hasHydrated = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        version?: number;
        surveys?: Survey[];
        responses?: SurveyResponse[];
        activity?: ActivityItem[];
      };
      if (
        parsed.version === STORAGE_VERSION &&
        Array.isArray(parsed.surveys) &&
        Array.isArray(parsed.responses) &&
        Array.isArray(parsed.activity)
      ) {
        state = {
          surveys: parsed.surveys,
          responses: parsed.responses,
          activity: parsed.activity,
          hydrated: true,
        };
        notify();
        return;
      }
    }
  } catch {
    // Ignore corrupted demo state and fall back to the seeded workspace.
  }

  state = { ...state, hydrated: true };
  persist(state);
  notify();
}

export function useSurveyStore(): SurveyStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function activity(
  type: ActivityItem["type"],
  survey: Pick<Survey, "id" | "title">,
  message: string,
): ActivityItem {
  return {
    id: uid("act"),
    type,
    surveyId: survey.id,
    surveyTitle: survey.title,
    message,
    at: new Date().toISOString(),
  };
}

export const surveyActions = {
  save(survey: Survey): Survey {
    const exists = state.surveys.some((item) => item.id === survey.id);
    const now = new Date().toISOString();
    const nextSurvey: Survey = { ...survey, updatedAt: now };

    if (exists) {
      commit({
        surveys: state.surveys.map((item) => (item.id === survey.id ? nextSurvey : item)),
        activity: [
          activity("edited", nextSurvey, "was updated in the builder"),
          ...state.activity,
        ].slice(0, 30),
      });
    } else {
      commit({
        surveys: [nextSurvey, ...state.surveys],
        activity: [
          activity("created", nextSurvey, "was created as a draft"),
          ...state.activity,
        ].slice(0, 30),
      });
    }
    return nextSurvey;
  },

  publish(id: string): void {
    const survey = state.surveys.find((item) => item.id === id);
    if (!survey) return;
    const now = new Date().toISOString();
    const updated: Survey = {
      ...survey,
      status: "published",
      publishedAt: survey.publishedAt ?? now,
      closedAt: null,
      updatedAt: now,
    };
    commit({
      surveys: state.surveys.map((item) => (item.id === id ? updated : item)),
      activity: [activity("published", updated, "was published to its public link"), ...state.activity].slice(
        0,
        30,
      ),
    });
  },

  close(id: string): void {
    const survey = state.surveys.find((item) => item.id === id);
    if (!survey) return;
    const updated: Survey = {
      ...survey,
      status: "closed",
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    commit({
      surveys: state.surveys.map((item) => (item.id === id ? updated : item)),
      activity: [activity("closed", updated, "was closed to new responses"), ...state.activity].slice(0, 30),
    });
  },

  reopen(id: string): void {
    const survey = state.surveys.find((item) => item.id === id);
    if (!survey) return;
    const updated: Survey = {
      ...survey,
      status: "published",
      closedAt: null,
      updatedAt: new Date().toISOString(),
    };
    commit({
      surveys: state.surveys.map((item) => (item.id === id ? updated : item)),
      activity: [activity("reopened", updated, "reopened for new responses"), ...state.activity].slice(0, 30),
    });
  },

  duplicate(id: string): Survey | null {
    const source = state.surveys.find((item) => item.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const baseSlug = `${source.slug}-copy`;
    const existingSlugs = new Set(state.surveys.map((item) => item.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    const copy: Survey = {
      ...source,
      id: uid("srv"),
      slug,
      title: `${source.title} (copy)`,
      status: "draft",
      publishedAt: null,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
      questions: source.questions.map((question) => ({
        ...question,
        id: uid("q"),
        options: question.options.map((option) => ({ ...option, id: uid("opt") })),
      })),
      theme: { ...source.theme },
    };
    commit({
      surveys: [copy, ...state.surveys],
      activity: [activity("duplicated", source, `was duplicated as “${copy.title}”`), ...state.activity].slice(
        0,
        30,
      ),
    });
    return copy;
  },

  remove(id: string): void {
    const survey = state.surveys.find((item) => item.id === id);
    if (!survey) return;
    commit({
      surveys: state.surveys.filter((item) => item.id !== id),
      responses: state.responses.filter((response) => response.surveyId !== id),
      activity: state.activity.filter((item) => item.surveyId !== id),
    });
  },

  addResponse(response: SurveyResponse): void {
    const survey = state.surveys.find((item) => item.id === response.surveyId);
    const activityItems = survey
      ? [
          activity(
            "response",
            survey,
            `received a new response${response.name ? ` from ${response.name}` : ""}`,
          ),
          ...state.activity,
        ].slice(0, 30)
      : state.activity;
    commit({ responses: [response, ...state.responses], activity: activityItems });
  },

  reset(): void {
    const fresh = createSeedState();
    state = { ...fresh, hydrated: true };
    persist(state);
    notify();
  },
};

export function uniqueSlug(title: string, ignoreId?: string): string {
  const base = slugify(title);
  const existing = new Set(
    state.surveys.filter((survey) => survey.id !== ignoreId).map((survey) => survey.slug),
  );
  let slug = base;
  let suffix = 2;
  while (existing.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export function getSurveyBySlug(slug: string): Survey | undefined {
  return state.surveys.find((survey) => survey.slug === slug);
}

export function findSurvey(id: string): Survey | undefined {
  return state.surveys.find((survey) => survey.id === id);
}

export function storeSnapshot(): SurveyStoreState {
  return state;
}
