import { Suspense } from "react";
import { Logo } from "@/components/atoms/logo";
import { Spinner } from "@/components/atoms/spinner";
import { BuilderWorkspace } from "@/features/survey-builder/components/builder-workspace";

function BuilderFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
      <Logo size={34} />
      <Spinner className="text-forest" />
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        Opening the builder
      </p>
    </div>
  );
}

async function BuilderRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuilderWorkspace surveyId={id} />;
}

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <BuilderRoute params={params} />
    </Suspense>
  );
}
