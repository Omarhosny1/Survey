import { Suspense } from "react";
import { Logo } from "@/app/_components/atoms/logo";
import { Spinner } from "@/app/_components/atoms/spinner";
import { PublicSurvey } from "@/app/_components/organisms/public-survey";

function SurveyFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
      <Logo size={32} />
      <Spinner className="text-forest" />
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        Loading survey
      </p>
    </div>
  );
}

async function SurveyRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicSurvey slug={slug} />;
}

export default function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<SurveyFallback />}>
      <SurveyRoute params={params} />
    </Suspense>
  );
}
