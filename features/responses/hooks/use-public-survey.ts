"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { responseKeys, surveyKeys } from "@/lib/react-query/keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Survey } from "@/types/domain";
import {
  fetchPublicSurvey,
  submitResponse,
  type SubmitResponseInput,
  type SubmitResponseResult,
} from "../services/response.service";

export function usePublicSurvey(slug: string) {
  const client = getSupabaseBrowserClient();

  return useQuery<Survey | null>({
    queryKey: surveyKeys.public(slug),
    queryFn: async () => {
      if (!client) throw new Error("Supabase is not configured.");
      return fetchPublicSurvey(client, slug);
    },
    enabled: Boolean(client),
    staleTime: 30_000,
  });
}

export function useSubmitResponse() {
  const client = getSupabaseBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<SubmitResponseResult, Error, SubmitResponseInput>({
    mutationFn: async (input) => {
      if (!client) throw new Error("Supabase is not configured.");
      return submitResponse(client, input);
    },
    onSuccess: (result) => {
      if (!result.ok) return;
      void queryClient.invalidateQueries({ queryKey: responseKeys.all });
    },
  });
}
