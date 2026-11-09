"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface px-6 py-12 text-center shadow-soft">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-danger/20 bg-danger/10 text-danger">
        <Icon name="alert" size={18} />
      </span>
      <h1 className="mt-4 font-display text-xl text-ink">This view could not load</h1>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
        Your data is safe. Retry the page, or return to the overview.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Button onClick={reset} iconLeft={<Icon name="refresh" size={14} />}>
          Retry
        </Button>
        <Button href="/dashboard" variant="secondary">
          Overview
        </Button>
      </div>
    </div>
  );
}
