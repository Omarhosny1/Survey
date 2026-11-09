"use client";

import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ToastProvider } from "@/components/molecules/toast";
import { useSession } from "@/features/auth/store";
import { authKeys, surveyKeys } from "@/lib/react-query/keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QueryProvider } from "@/providers/query-provider";

function AppInner({ children }: { children: ReactNode }) {
  const client = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { profile } = useSession();
  const reduceMotion = profile?.preferences.reduceMotion ?? false;

  useEffect(() => {
    if (!client) return;

    const { data } = client.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
      void queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    });

    return () => data.subscription.unsubscribe();
  }, [client, queryClient]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
  }, [reduceMotion]);

  return <ToastProvider>{children}</ToastProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppInner>{children}</AppInner>
    </QueryProvider>
  );
}
