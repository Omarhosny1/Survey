"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { Logo } from "@/components/atoms/logo";
import { Progress } from "@/components/atoms/progress";
import { Spinner } from "@/components/atoms/spinner";
import { SurveyQuestionField } from "@/components/molecules/survey-question";
import { surveyActions, useSurveyStore } from "@/lib/store";
import type { AnswerValue, SurveyResponse } from "@/lib/types";
import { formatDate, isEmail, uid } from "@/lib/utils";

interface PublicSurveyProps {
  slug: string;
}

type Stage = "intro" | "survey" | "done";

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-forest-soft/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[360px] w-[360px] rounded-full bg-gold-soft/50 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="SurveyLand home">
          <Logo size={26} />
        </Link>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-faint">
          Thoughtful surveys
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:items-center sm:pt-0">
        <div className="w-full max-w-[560px]">{children}</div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-5 py-5 text-center sm:flex-row sm:text-left">
        <p className="text-[9.5px] text-ink-faint">
          Demo survey · responses are stored in this browser only.
        </p>
        <Link
          href="/"
          className="flex items-center gap-1 text-[9.5px] font-medium text-ink-faint transition-colors hover:text-forest"
        >
          Made with SurveyLand
          <Icon name="arrowUpRight" size={10} />
        </Link>
      </footer>
    </div>
  );
}

function NoticeCard({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: "lock" | "clock" | "search";
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-float animate-enter">
      <div className="h-1.5 w-full bg-line-strong" aria-hidden="true" />
      <div className="px-6 py-10 text-center sm:px-9">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-forest/10 bg-forest-soft/50 text-forest">
          <Icon name={icon} size={20} />
        </span>
        <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{eyebrow}</p>
        <h1 className="mt-2 text-balance font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[12.5px] leading-relaxed text-ink-soft">
          {description}
        </p>
        <Button href="/" variant="secondary" className="mt-6" iconLeft={<Icon name="arrowLeft" size={14} />}>
          Back to SurveyLand
        </Button>
      </div>
    </div>
  );
}

export function PublicSurvey({ slug }: PublicSurveyProps) {
  const store = useSurveyStore();
  const survey = store.surveys.find((item) => item.slug === slug);
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const submitted = useRef(false);

  if (!store.hydrated) {
    return (
      <PublicShell>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-16 shadow-soft">
          <Spinner size={20} className="text-forest" />
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            Loading survey
          </p>
        </div>
      </PublicShell>
    );
  }

  if (!survey) {
    return (
      <PublicShell>
        <NoticeCard
          icon="search"
          eyebrow="Link not found"
          title="This survey isn’t available"
          description="The link may be incorrect, or the survey may have been removed. Double-check the URL and try again."
        />
      </PublicShell>
    );
  }

  if (survey.status === "draft") {
    return (
      <PublicShell>
        <NoticeCard
          icon="lock"
          eyebrow="Private draft"
          title="This survey isn’t published yet"
          description="The owner is still working on it. Once they publish, this link will open the live survey."
        />
      </PublicShell>
    );
  }

  if (survey.status === "closed") {
    return (
      <PublicShell>
        <NoticeCard
          icon="clock"
          eyebrow="Survey closed"
          title={(survey.title || "Untitled survey")}
          description={`This survey closed${
            survey.closedAt ? ` on ${formatDate(survey.closedAt, { withYear: true })}` : ""
          } and is no longer accepting responses. Thanks for stopping by.`}
        />
      </PublicShell>
    );
  }

  const total = survey.questions.length;
  const accent = survey.theme.accent;
  const question = survey.questions[Math.min(index, Math.max(total - 1, 0))];
  const answeredCount = survey.questions.filter((item) => {
    const value = answers[item.id];
    return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value.length > 0;
  }).length;
  const progress = stage === "done" ? 100 : total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const start = () => {
    if (survey.theme.collectEmail && !isEmail(email)) {
      setEmailError("Enter a valid email address to continue.");
      return;
    }
    setEmailError(null);
    startedAt.current = new Date().getTime();
    setStage("survey");
    setIndex(0);
    setError(null);
  };

  const goBack = () => {
    setError(null);
    if (index === 0) {
      setStage("intro");
      return;
    }
    setIndex((current) => Math.max(current - 1, 0));
  };

  const submit = () => {
    if (submitted.current || !survey) return;
    submitted.current = true;

    const seconds = startedAt.current
      ? Math.max(1, Math.round((new Date().getTime() - startedAt.current) / 1000))
      : Math.max(1, total * 8);
    const width = typeof window !== "undefined" ? window.innerWidth : 1280;
    const device = width < 640 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";

    const response: SurveyResponse = {
      id: uid("res"),
      surveyId: survey.id,
      submittedAt: new Date().toISOString(),
      name:
        name.trim() ||
        (survey.theme.collectEmail && email.trim() ? email.trim().split("@")[0] : "Anonymous"),
      email: survey.theme.collectEmail && email.trim() ? email.trim() : null,
      answers,
      completion: total > 0 ? Math.round((answeredCount / total) * 100) : 100,
      durationSeconds: seconds,
      device,
    };

    surveyActions.addResponse(response);
    setStage("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!question) return;
    const value = answers[question.id];
    const hasAnswer =
      typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value.length > 0;
    if (question.required && !hasAnswer) {
      setError("This question is required. Add an answer to continue.");
      return;
    }
    setError(null);
    if (index >= total - 1) {
      submit();
      return;
    }
    setIndex((current) => Math.min(current + 1, total - 1));
  };

  const restart = () => {
    submitted.current = false;
    setStage("intro");
    setIndex(0);
    setAnswers({});
    setName("");
    setEmail("");
    setError(null);
    setEmailError(null);
    startedAt.current = null;
  };

  return (
    <PublicShell>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-float animate-enter">
        <div className="h-1.5 w-full bg-canvas-deep" aria-hidden="true">
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{ backgroundColor: accent, width: `${survey.theme.showProgress ? progress : 0}%` }}
          />
        </div>

        {stage === "intro" && (
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-line bg-canvas/60 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">
                {survey.category}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-ink-faint">
                <Icon name="shield" size={11} />
                {survey.theme.collectEmail ? "Email required" : "Anonymous"}
              </span>
            </div>

            <h1 className="mt-4 text-balance font-display text-[28px] leading-[1.12] tracking-[-0.03em] text-ink sm:text-[32px]">
              {survey.title.trim() || "Untitled survey"}
            </h1>
            {survey.description.trim() ? (
              <p className="mt-2.5 text-pretty text-[13px] leading-relaxed text-ink-soft">
                {survey.description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line/80 py-3 text-[10.5px] text-ink-faint">
              <span className="flex items-center gap-1.5">
                <Icon name="layers" size={12} />
                {total} question{total === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={12} />~{Math.max(1, Math.ceil(total * 0.5))} min
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="lock" size={12} />
                Private by default
              </span>
            </div>

            {survey.theme.collectEmail && (
              <div className="mt-5 space-y-3 rounded-lg border border-line bg-cream/40 p-3.5">
                <div>
                  <label
                    htmlFor="respondent-email"
                    className="mb-1 block text-[11px] font-medium text-ink-soft"
                  >
                    Email address
                  </label>
                  <Input
                    id="respondent-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError(null);
                    }}
                    placeholder="you@company.com"
                    invalid={Boolean(emailError)}
                    prefix={<Icon name="mail" size={13} />}
                    aria-describedby={emailError ? "respondent-email-error" : undefined}
                  />
                  {emailError && (
                    <p id="respondent-email-error" className="mt-1.5 text-[10px] text-danger">
                      {emailError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="respondent-name"
                    className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-soft"
                  >
                    Name
                    <span className="text-[9px] font-normal text-ink-faint">Optional</span>
                  </label>
                  <Input
                    id="respondent-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    prefix={<Icon name="user" size={13} />}
                  />
                </div>
              </div>
            )}

            <Button
              fullWidth
              className="mt-5"
              size="lg"
              onClick={start}
              style={{ backgroundColor: accent, borderColor: accent }}
              iconRight={<Icon name="arrowRight" size={15} />}
            >
              Start survey
            </Button>
            <p className="mt-2.5 text-center text-[9px] leading-relaxed text-ink-faint">
              Your answers are saved in this browser for the demo. Nothing is sent to a server.
            </p>
          </div>
        )}

        {stage === "survey" && question && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-line/80 bg-cream/30 px-5 py-3 sm:px-8">
              <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-faint">
                <Icon name="globe" size={10} />
                Live survey
              </span>
              <span className="font-mono text-[9px] text-ink-faint">
                {index + 1} / {total}
              </span>
            </div>

            <div key={question.id} className="px-5 py-6 animate-enter-fast sm:px-8 sm:py-7">
              {survey.theme.showProgress && (
                <div className="mb-6">
                  <Progress
                    value={progress}
                    height="xs"
                    color={accent}
                    label={`${index + 1} of ${total} questions`}
                  />
                </div>
              )}

              <SurveyQuestionField
                question={question}
                value={answers[question.id] ?? ""}
                onChange={(value) => {
                  setAnswers((current) => ({ ...current, [question.id]: value }));
                  setError(null);
                }}
                accent={accent}
                questionNumber={index + 1}
                totalQuestions={total}
              />

              {error && (
                <p className="mt-3 flex items-start gap-1.5 rounded-md border border-danger/20 bg-danger-soft/40 px-2.5 py-2 text-[10.5px] leading-relaxed text-danger">
                  <Icon name="alert" size={12} className="mt-px shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-cream/30 px-4 py-3 sm:px-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                iconLeft={<Icon name="chevronLeft" size={14} />}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                style={{ backgroundColor: accent, borderColor: accent }}
                iconRight={
                  <Icon name={index >= total - 1 ? "check" : "chevronRight"} size={14} />
                }
              >
                {index >= total - 1 ? "Submit response" : "Next question"}
              </Button>
            </div>
          </>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center px-6 py-12 text-center animate-enter sm:px-9">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-soft"
              style={{ backgroundColor: accent }}
            >
              <Icon name="check" size={26} />
            </span>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
              Response recorded
            </p>
            <h1 className="mt-2 text-balance font-display text-[27px] leading-[1.15] tracking-[-0.025em] text-ink">
              {survey.theme.thankYouTitle || "Thank you for your response."}
            </h1>
            <p className="mx-auto mt-2.5 max-w-sm text-pretty text-[12.5px] leading-relaxed text-ink-soft">
              {survey.theme.thankYouMessage ||
                "Your feedback helps us make better decisions. We appreciate your time."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button href="/" variant="secondary" size="sm" iconLeft={<Icon name="home" size={13} />}>
                Back to SurveyLand
              </Button>
              <Button variant="ghost" size="sm" onClick={restart} iconLeft={<Icon name="refresh" size={13} />}>
                Submit another response
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
