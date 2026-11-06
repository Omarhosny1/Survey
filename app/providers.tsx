"use client";

import { useEffect, type ReactNode } from "react";
import { ToastProvider } from "@/app/_components/molecules/toast";
import { hydrateSession, useSession } from "@/app/_lib/session";
import { hydrateStore } from "@/app/_lib/store";

export function AppProviders({ children }: { children: ReactNode }) {
  const { profile } = useSession();
  const reduceMotion = profile?.preferences.reduceMotion ?? false;

  useEffect(() => {
    hydrateStore();
    hydrateSession();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
  }, [reduceMotion]);

  return <ToastProvider>{children}</ToastProvider>;
}
