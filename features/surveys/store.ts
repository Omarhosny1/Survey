"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { surveyKeys } from "@/lib/react-query/keys";
import { getQueryClient } from "@/lib/react-query/query-client";
import { sessionActions, useSession } from "@/features/auth/store";
import type { Survey, SurveyStoreState } from "@/types/domain";
import { slugify } from "@/lib/utils";
import {
  deleteSurvey,
  duplicateSurvey,
  fetchWorkspace,
  reopenSurvey,
  saveSurveyTree,
  setSurveyStatus,
} from "./services/survey.service";

let latestSurveys: Survey[] = [];

function requireClient() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

async function refreshWorkspace(): Promise<void> {
  await getQueryClient().invalidateQueries({ queryKey: surveyKeys.workspaces() });
}

export function useSurveyStore(): SurveyStoreState {
  const client = getSupabaseBrowserClient();
  const { profile, hydrated } = useSession();
  const userId = profile?.id ?? null;
  const query = useQuery({
    queryKey: surveyKeys.workspace(userId ?? "anonymous"),
    queryFn: () => fetchWorkspace(requireClient()),
    enabled: Boolean(client) && hydrated && Boolean(userId),
    staleTime: 10_000,
  });

  useEffect(() => {
    latestSurveys = userId && query.data ? query.data.surveys : [];
  }, [query.data, userId]);

  const fallback = useMemo<SurveyStoreState>(
    () => ({
      surveys: [],
      responses: [],
      activity: [],
      hydrated: !client ? true : !query.isPending,
    }),
    [client, query.isPending],
  );

  return query.data ?? fallback;
}

export const surveyActions = {
  async save(survey: Survey): Promise<Survey> {
    const client = requireClient();
    const saved = await saveSurveyTree(client, survey);
    await refreshWorkspace();
    return saved;
  },

  async publish(id: string): Promise<void> {
    const client = requireClient();
    await setSurveyStatus(client, id, "published");
    await refreshWorkspace();
  },

  async close(id: string): Promise<void> {
    const client = requireClient();
    await setSurveyStatus(client, id, "closed");
    await refreshWorkspace();
  },

  async reopen(id: string): Promise<void> {
    const client = requireClient();
    await reopenSurvey(client, id);
    await refreshWorkspace();
  },

  async duplicate(id: string): Promise<Survey | null> {
    const client = requireClient();
    const copy = await duplicateSurvey(client, id);
    await refreshWorkspace();
    return copy;
  },

  async remove(id: string): Promise<void> {
    const client = requireClient();
    await deleteSurvey(client, id);
    await refreshWorkspace();
  },

  async reset(): Promise<void> {
    await sessionActions.reset();
  },
};

export function uniqueSlug(
  title: string,
  ignoreId?: string,
  surveys: Survey[] = latestSurveys,
): string {
  const base = slugify(title);
  const existing = new Set(
    surveys.filter((survey) => survey.id !== ignoreId).map((survey) => survey.slug),
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
  return latestSurveys.find((survey) => survey.slug === slug);
}

export function findSurvey(id: string): Survey | undefined {
  return latestSurveys.find((survey) => survey.id === id);
}

export function storeSnapshot(userId: string): SurveyStoreState {
  return (
    getQueryClient().getQueryData<SurveyStoreState>(surveyKeys.workspace(userId)) ?? {
      surveys: [],
      responses: [],
      activity: [],
      hydrated: true,
    }
  );
}
