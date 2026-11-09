import { Suspense } from "react";
import { AnalyticsView } from "@/features/analytics/components/analytics-view";

function AnalyticsFallback() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-64 rounded-md bg-canvas-deep/60" />
      <div className="h-4 w-96 max-w-full rounded bg-canvas-deep/40" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[118px] rounded-xl border border-line bg-surface/70" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="h-[360px] rounded-xl border border-line bg-surface/70" />
        <div className="h-[360px] rounded-xl border border-line bg-surface/70" />
      </div>
    </div>
  );
}

async function AnalyticsRoute({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string | string[] }>;
}) {
  const params = await searchParams;
  const survey = Array.isArray(params.survey) ? params.survey[0] : params.survey;
  return <AnalyticsView key={survey ?? "all"} initialSurveyId={survey} />;
}

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<AnalyticsFallback />}>
      <AnalyticsRoute searchParams={searchParams} />
    </Suspense>
  );
}
