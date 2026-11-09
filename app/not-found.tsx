import type { Metadata } from "next";
import { Button } from "@/components/atoms/button";
import { StatusPage } from "@/components/templates/status-page";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="This page wandered off"
      description="The link may be broken, or the survey could have been moved, renamed, or deleted."
      actions={
        <>
          <Button href="/">Back to home</Button>
          <Button href="/dashboard" variant="secondary">
            Go to dashboard
          </Button>
        </>
      }
    />
  );
}
