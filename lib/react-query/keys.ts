export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export const surveyKeys = {
  all: ["surveys"] as const,
  workspace: () => [...surveyKeys.all, "workspace"] as const,
  lists: () => [...surveyKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...surveyKeys.lists(), filters ?? {}] as const,
  details: () => [...surveyKeys.all, "detail"] as const,
  detail: (id: string) => [...surveyKeys.details(), id] as const,
  public: (slug: string) => [...surveyKeys.all, "public", slug] as const,
};

export const responseKeys = {
  all: ["responses"] as const,
  lists: () => [...responseKeys.all, "list"] as const,
  list: (surveyId?: string) =>
    [...responseKeys.lists(), surveyId ?? "all"] as const,
  detail: (id: string) => [...responseKeys.all, "detail", id] as const,
};

export const analyticsKeys = {
  all: ["analytics"] as const,
  survey: (surveyId: string) => [...analyticsKeys.all, surveyId] as const,
};
