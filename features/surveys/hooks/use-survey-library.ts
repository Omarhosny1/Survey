"use client";

import { useCallback, useMemo, useState } from "react";
import { responseCount, statusCounts } from "@/features/analytics/analytics";
import type { SurveyStatus, SurveyStoreState } from "@/types/domain";

export type StatusFilter = "all" | SurveyStatus;
export type SortKey = "updated" | "responses" | "title";
export type ViewMode = "grid" | "list";

export function useSurveyLibrary(state: SurveyStoreState) {
  const { surveys } = state;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<ViewMode>("grid");

  const counts = useMemo(() => statusCounts(surveys), [surveys]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = surveys.filter((survey) => {
      const matchesStatus = status === "all" || survey.status === status;
      const matchesTerm =
        !term ||
        survey.title.toLowerCase().includes(term) ||
        survey.description.toLowerCase().includes(term) ||
        survey.category.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "responses") return responseCount(state, b.id) - responseCount(state, a.id);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [query, sort, state, status, surveys]);

  const totalResponses = useMemo(
    () => surveys.reduce((total, survey) => total + responseCount(state, survey.id), 0),
    [state, surveys],
  );

  const hasFilters = query.trim().length > 0 || status !== "all";

  const resetFilters = useCallback(() => {
    setQuery("");
    setStatus("all");
  }, []);

  return {
    query,
    setQuery,
    status,
    setStatus,
    sort,
    setSort,
    view,
    setView,
    counts,
    visible,
    totalResponses,
    hasFilters,
    resetFilters,
  };
}
