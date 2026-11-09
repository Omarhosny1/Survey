"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { authKeys, surveyKeys } from "@/lib/react-query/keys";
import { getQueryClient } from "@/lib/react-query/query-client";
import { seedProfile } from "@/features/surveys/seed";
import { clearWorkspace, fetchWorkspace } from "@/features/surveys/services/survey.service";
import { seedDemoWorkspace } from "@/features/surveys/services/demo.service";
import type { Profile, SessionState } from "@/types/domain";
import {
  DEMO_COMPANY,
  DEMO_EMAIL,
  DEMO_NAME,
  DEMO_PASSWORD,
  getSessionProfile,
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
  updateProfile,
} from "./services/auth.service";

function requireClient() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

function setSessionProfile(profile: Profile | null): void {
  getQueryClient().setQueryData(authKeys.session(), profile);
}

function invalidateWorkspace(): Promise<void> {
  return getQueryClient().invalidateQueries({ queryKey: surveyKeys.workspaces() });
}

function clearUserData(): void {
  getQueryClient().removeQueries({ queryKey: surveyKeys.all });
}

export function useSession(): SessionState {
  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      if (!client) return null;
      return getSessionProfile(client);
    },
    staleTime: 30_000,
  });

  return {
    profile: query.data ?? null,
    hydrated: !query.isPending,
  };
}

export function demoProfile(): Profile {
  return {
    ...seedProfile,
    preferences: { ...seedProfile.preferences },
  };
}

export const sessionActions = {
  async signIn(email: string, password: string): Promise<Profile> {
    const client = requireClient();
    const profile = await signIn(client, email, password);
    clearUserData();
    setSessionProfile(profile);
    await invalidateWorkspace();
    return profile;
  },

  async signUp(input: {
    name: string;
    company: string;
    email: string;
    password: string;
  }): Promise<{ profile: Profile | null; needsConfirmation: boolean }> {
    const client = requireClient();
    const result = await signUp(client, input);
    if (result.profile) {
      clearUserData();
      setSessionProfile(result.profile);
      await invalidateWorkspace();
    }
    return result;
  },

  async signInDemo(): Promise<Profile> {
    const client = requireClient();

    let profile: Profile;
    try {
      profile = await signIn(client, DEMO_EMAIL, DEMO_PASSWORD);
    } catch (signInError) {
      try {
        const result = await signUp(client, {
          name: DEMO_NAME,
          company: DEMO_COMPANY,
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        if (!result.profile) {
          throw new Error(
            "The demo account exists but could not be opened. Check your Supabase auth settings.",
          );
        }
        profile = result.profile;
      } catch {
        throw signInError;
      }
    }

    clearUserData();
    setSessionProfile(profile);

    const workspace = await fetchWorkspace(client);
    if (workspace.surveys.length === 0) {
      await seedDemoWorkspace(client);
    }

    await invalidateWorkspace();
    return profile;
  },

  async signOut(): Promise<void> {
    const client = requireClient();
    await signOut(client);
    clearUserData();
    setSessionProfile(null);
  },

  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    const client = requireClient();
    const profile = await updateProfile(client, patch);
    setSessionProfile(profile);
    return profile;
  },

  async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    const client = requireClient();
    await requestPasswordReset(client, email, redirectTo);
  },

  async updatePassword(password: string): Promise<void> {
    const client = requireClient();
    await updatePassword(client, password);
  },

  async reset(): Promise<void> {
    const client = requireClient();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (data.user?.email !== DEMO_EMAIL) {
      throw new Error("Demo reset is only available in the demo workspace.");
    }

    await clearWorkspace(client);
    await seedDemoWorkspace(client);
    await invalidateWorkspace();
  },
};
