"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { StatusPage } from "@/components/templates/status-page";

export default function ErrorPage({
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
    <StatusPage
      code="Something went wrong"
      title="We hit an unexpected snag"
      description="The page could not finish loading. You can retry, or head back to the dashboard while we recover."
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <Button href="/dashboard" variant="secondary">
            Go to dashboard
          </Button>
        </>
      }
    />
  );
}
