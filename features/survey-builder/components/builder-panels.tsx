"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input, Select, Textarea } from "@/components/atoms/input";
import { Logo } from "@/components/atoms/logo";
import { SectionLabel, Switch } from "@/components/atoms/misc";
import { Progress } from "@/components/atoms/progress";
import { SurveyQuestionField } from "@/components/molecules/survey-question";
import { surveyAccents, surveyCategories } from "@/features/surveys/factory";
import type { AnswerValue, Survey, SurveyTheme } from "@/types/domain";
import { cn } from "@/lib/utils";

interface SurveyPreviewProps {
  survey: Survey;
  activeQuestionId: string | null;
  className?: string;
}

export function SurveyPreview({ survey, activeQuestionId, className }: SurveyPreviewProps) {
  const initialIndex = Math.max(
    0,
    survey.questions.findIndex((question) => question.id === activeQuestionId),
  );
  const [previewIndex, setPreviewIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [done, setDone] = useState(false);

  const total = survey.questions.length;
  const safeIndex = Math.min(previewIndex, Math.max(total - 1, 0));
  const question = survey.questions[safeIndex];
  const accent = survey.theme.accent;
  const progress = total > 0 ? Math.round((safeIndex / total) * 100) : 0;

  const restart = () => {
    setPreviewIndex(0);
    setAnswers({});
    setDone(false);
  };

  const next = () => {
    if (safeIndex >= total - 1) {
      setDone(true);
      return;
    }
    setPreviewIndex((current) => Math.min(current + 1, total - 1));
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-line bg-surface shadow-soft",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-line/80 bg-canvas/70 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
        <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
        <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
        <span className="ml-1.5 flex min-w-0 flex-1 items-center gap-1 truncate rounded-[4px] border border-line/70 bg-surface px-2 py-0.5 font-mono text-[8px] text-ink-faint">
          <Icon name="globe" size={9} />
          survey.land/s/{survey.slug}
        </span>
      </div>

      <div className="h-[3px] w-full bg-canvas-deep" aria-hidden="true">
        <div
          className="h-full transition-[width] duration-300"
          style={{
            backgroundColor: accent,
            width: `${survey.theme.showProgress ? Math.max(progress, done ? 100 : 0) : 0}%`,
          }}
        />
      </div>

      <div className="px-4 pb-4 pt-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <Logo size={20} tone="mark" />
          <span className="rounded-full border border-line bg-canvas/60 px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.1em] text-ink-faint">
            Live preview
          </span>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-8 text-center animate-enter-fast">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: accent }}
            >
              <Icon name="check" size={20} />
            </span>
            <h3 className="mt-3.5 text-balance font-display text-[19px] leading-tight tracking-[-0.02em] text-ink">
              {survey.theme.thankYouTitle || "Thank you for your response."}
            </h3>
            <p className="mt-1.5 text-pretty text-[11.5px] leading-relaxed text-ink-soft">
              {survey.theme.thankYouMessage ||
                "Your feedback helps us make better decisions. We appreciate your time."}
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={restart}>
              Start over
            </Button>
          </div>
        ) : total === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-lg text-ink">Nothing to preview yet</p>
            <p className="mt-1 text-[11px] text-ink-faint">Add a question to see it here.</p>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <h3 className="text-balance font-display text-[17px] leading-[1.25] tracking-[-0.02em] text-ink">
                {survey.title.trim() || "Untitled survey"}
              </h3>
              {survey.description.trim() ? (
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-ink-soft">
                  {survey.description}
                </p>
              ) : null}
              {survey.theme.showProgress && (
                <div className="mt-3 flex items-center gap-2">
                  <Progress
                    value={progress}
                    color={accent}
                    height="xs"
                    barClassName="bg-transparent"
                    label="Preview progress"
                  />
                  <span className="font-mono text-[8px] text-ink-faint">
                    {safeIndex + 1}/{total}
                  </span>
                </div>
              )}
            </div>

            <div key={question?.id ?? "empty"} className="mt-5 animate-enter-fast">
              {question && (
                <SurveyQuestionField
                  question={question}
                  value={answers[question.id] ?? ""}
                  onChange={(value) =>
                    setAnswers((current) => ({ ...current, [question.id]: value }))
                  }
                  accent={accent}
                  questionNumber={safeIndex + 1}
                  totalQuestions={total}
                />
              )}
            </div>
          </>
        )}

        {!done && total > 0 && (
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-line/80 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewIndex((current) => Math.max(current - 1, 0))}
              disabled={safeIndex === 0}
              iconLeft={<Icon name="chevronLeft" size={13} />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={next}
              iconRight={<Icon name="chevronRight" size={13} />}
            >
              {safeIndex >= total - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SurveySettingsProps {
  survey: Survey;
  onTitleChange: (title: string) => void;
  onPatch: (patch: Partial<Survey>) => void;
  onThemeChange: (patch: Partial<SurveyTheme>) => void;
  onCopyLink: () => void;
  className?: string;
}

export function SurveySettings({
  survey,
  onTitleChange,
  onPatch,
  onThemeChange,
  onCopyLink,
  className,
}: SurveySettingsProps) {
  const isLive = survey.status === "published";
  const accent = survey.theme.accent;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <SectionLabel>Survey details</SectionLabel>
        <div>
          <label
            htmlFor="survey-title-setting"
            className="mb-1 block text-[11px] font-medium text-ink-soft"
          >
            Title
          </label>
          <Input
            id="survey-title-setting"
            value={survey.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Untitled survey"
            className="h-9 text-[12.5px]"
          />
        </div>
        <div>
          <label
            htmlFor="survey-description-setting"
            className="mb-1 block text-[11px] font-medium text-ink-soft"
          >
            Description
          </label>
          <Textarea
            id="survey-description-setting"
            value={survey.description}
            onChange={(event) => onPatch({ description: event.target.value })}
            rows={2}
            placeholder="Tell respondents what this survey is about."
            className="min-h-[64px] text-[12px]"
          />
        </div>
        <div>
          <label
            htmlFor="survey-category-setting"
            className="mb-1 block text-[11px] font-medium text-ink-soft"
          >
            Category
          </label>
          <Select
            id="survey-category-setting"
            value={survey.category}
            onChange={(event) => onPatch({ category: event.target.value })}
            className="h-9 text-[12px]"
          >
            {surveyCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-ink-soft">Public link</p>
          <div className="flex items-center gap-1 rounded-md border border-line bg-canvas/50 p-1 pl-2.5">
            <Icon name="link" size={12} className="shrink-0 text-ink-faint" />
            <span className="min-w-0 flex-1 truncate font-mono text-[9.5px] text-ink-soft">
              /s/{survey.slug}
            </span>
            <button
              type="button"
              onClick={onCopyLink}
              disabled={!isLive}
              aria-label="Copy public survey link"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-ink-faint transition-colors hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Icon name="copy" size={12} />
            </button>
          </div>
          <p className="mt-1 text-[9px] text-ink-faint">
            {isLive ? "Live — anyone with this link can respond." : "Publishing activates this link."}
          </p>
        </div>
      </div>

      <div className="h-px bg-line" />

      <div className="space-y-3">
        <SectionLabel>Appearance</SectionLabel>
        <div>
          <p className="mb-2 text-[11px] font-medium text-ink-soft">Accent color</p>
          <div className="flex flex-wrap items-center gap-2">
            {surveyAccents.map((option) => {
              const active = option.value === accent;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={active}
                  onClick={() => onThemeChange({ accent: option.value })}
                  className="h-7 w-7 cursor-pointer rounded-full border border-black/5 transition-transform duration-150 hover:scale-110"
                  style={{
                    backgroundColor: option.value,
                    boxShadow: active
                      ? `0 0 0 2px #fbf8f1, 0 0 0 4px ${option.value}`
                      : undefined,
                  }}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[9px] text-ink-faint">
            Used on buttons, progress, and selected answers.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-line/80 bg-canvas/30 px-2.5 py-2">
          <div>
            <p className="text-[11px] font-medium text-ink">Show progress bar</p>
            <p className="mt-0.5 text-[9px] text-ink-faint">Helps respondents see how far they are.</p>
          </div>
          <Switch
            checked={survey.theme.showProgress}
            onCheckedChange={(checked) => onThemeChange({ showProgress: checked })}
            label="Show progress bar"
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-line/80 bg-canvas/30 px-2.5 py-2">
          <div>
            <p className="text-[11px] font-medium text-ink">Collect email</p>
            <p className="mt-0.5 text-[9px] text-ink-faint">Ask for an email before the first question.</p>
          </div>
          <Switch
            checked={survey.theme.collectEmail}
            onCheckedChange={(checked) => onThemeChange({ collectEmail: checked })}
            label="Collect respondent email"
          />
        </div>
      </div>

      <div className="h-px bg-line" />

      <div className="space-y-3">
        <SectionLabel>Thank-you screen</SectionLabel>
        <div>
          <label
            htmlFor="thank-you-title"
            className="mb-1 block text-[11px] font-medium text-ink-soft"
          >
            Heading
          </label>
          <Input
            id="thank-you-title"
            value={survey.theme.thankYouTitle}
            onChange={(event) => onThemeChange({ thankYouTitle: event.target.value })}
            placeholder="Thank you for your response."
            className="h-9 text-[12px]"
          />
        </div>
        <div>
          <label
            htmlFor="thank-you-message"
            className="mb-1 block text-[11px] font-medium text-ink-soft"
          >
            Message
          </label>
          <Textarea
            id="thank-you-message"
            value={survey.theme.thankYouMessage}
            onChange={(event) => onThemeChange({ thankYouMessage: event.target.value })}
            rows={3}
            placeholder="A short note of appreciation."
            className="min-h-[68px] text-[12px]"
          />
        </div>
      </div>
    </div>
  );
}
