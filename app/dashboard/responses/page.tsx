import { Suspense } from "react";
import { ResponsesView } from "@/app/_components/organisms/responses-view";

function ResponsesFallback() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-56 rounded-md bg-canvas-deep/60" />
      <div className="h-4 w-80 max-w-full rounded bg-canvas-deep/40" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[104px] rounded-xl border border-line bg-surface/70" />
        ))}
      </div>
      <div className="h-16 rounded-xl border border-line bg-surface/70" />
      <div className="h-[420px] rounded-xl border border-line bg-surface/70" />
    </div>
  );
}

async function ResponsesRoute({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string | string[] }>;
}) {
  const params = await searchParams;
  const survey = Array.isArray(params.survey) ? params.survey[0] : params.survey;
  return <ResponsesView key={survey ?? "all"} initialSurveyId={survey} />;
}

export default function ResponsesPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<ResponsesFallback />}>
      <ResponsesRoute searchParams={searchParams} />
    </Suspense>
  );
}
