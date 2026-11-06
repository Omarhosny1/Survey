"use client";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { Switch } from "@/components/atoms/misc";
import { DropdownMenu } from "@/components/molecules/dropdown";
import { Segmented } from "@/components/molecules/segmented";
import type { Question, QuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function questionIssue(question: Question): string | null {
  if (!question.title.trim()) return "Add a question title before publishing.";
  if (question.type === "multiple_choice") {
    const labels = question.options.map((option) => option.label.trim()).filter(Boolean);
    if (labels.length < 2) return "Answer options need at least two non-empty choices.";
  }
  return null;
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  total: number;
  accent: string;
  showErrors: boolean;
  onChange: (patch: Partial<Question>) => void;
  onOptionChange: (optionId: string, label: string) => void;
  onOptionAdd: () => void;
  onOptionRemove: (optionId: string) => void;
  onTypeChange: (type: QuestionType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

export function QuestionEditor({
  question,
  index,
  total,
  accent,
  showErrors,
  onChange,
  onOptionChange,
  onOptionAdd,
  onOptionRemove,
  onTypeChange,
  onDuplicate,
  onDelete,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: QuestionEditorProps) {
  const issue = questionIssue(question);
  const optionLetter = (optionIndex: number) => String.fromCharCode(65 + optionIndex);

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            Question {String(index + 1).padStart(2, "0")}
            <span className="text-ink-faint/50"> / {String(total).padStart(2, "0")}</span>
          </p>
          <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-faint">
            {question.type === "multiple_choice" ? "Multiple choice" : "Long answer"}
          </span>
        </div>

        <DropdownMenu
          align="end"
          triggerLabel="Question actions"
          triggerClassName="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
          trigger={<Icon name="more" size={16} />}
          items={[
            { label: "Duplicate question", icon: "copy", onSelect: onDuplicate },
            {
              label: "Delete question",
              icon: "trash",
              danger: true,
              separatorBefore: true,
              disabled: total <= 1,
              onSelect: onDelete,
            },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
        <div className="h-1 w-full" style={{ backgroundColor: accent }} aria-hidden="true" />

        <div className="space-y-5 p-4 sm:p-6">
          <div>
            <label
              htmlFor="question-title"
              className="mb-1.5 block font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-faint"
            >
              Question
            </label>
            <textarea
              id="question-title"
              value={question.title}
              onChange={(event) => onChange({ title: event.target.value })}
              rows={2}
              placeholder="What would you like to ask?"
              className={cn(
                "min-h-[58px] w-full resize-none rounded-md border bg-surface px-3 py-2.5 font-display text-[18px] leading-[1.35] tracking-[-0.015em] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:font-sans placeholder:text-[14px] placeholder:tracking-normal placeholder:text-ink-faint/80 focus:ring-4 focus:ring-forest/10",
                showErrors && !question.title.trim()
                  ? "border-danger/60 focus:border-danger"
                  : "border-line hover:border-line-strong focus:border-forest/50",
              )}
            />
          </div>

          <div>
            <label
              htmlFor="question-description"
              className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-faint"
            >
              Helper text
              <span className="text-[8px] normal-case tracking-normal text-ink-faint/70">Optional</span>
            </label>
            <textarea
              id="question-description"
              value={question.description ?? ""}
              onChange={(event) => onChange({ description: event.target.value })}
              rows={2}
              placeholder="Add context or an example to help respondents answer."
              className="min-h-[52px] w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink-soft outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint/70 hover:border-line-strong focus:border-forest/50 focus:ring-4 focus:ring-forest/10"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line/80 py-4">
            <div>
              <p className="mb-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Answer type
              </p>
              <Segmented
                ariaLabel="Answer type"
                value={question.type}
                onChange={(value) => onTypeChange(value as QuestionType)}
                options={[
                  { value: "multiple_choice", label: "Multiple choice" },
                  { value: "text", label: "Long answer" },
                ]}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[12px] font-medium text-ink">Required</p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Respondents must answer</p>
              </div>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onChange({ required: checked })}
                label="Require an answer to this question"
              />
            </div>
          </div>

          {question.type === "multiple_choice" ? (
            <div>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium text-ink">Answer options</p>
                  <p className="mt-0.5 text-[10px] text-ink-faint">
                    Respondents choose one option.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOptionAdd}
                  iconLeft={<Icon name="plus" size={13} />}
                >
                  Add option
                </Button>
              </div>

              <div className="space-y-1.5">
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="group flex items-center gap-1.5">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-line bg-canvas/60 font-mono text-[10px] font-medium text-ink-faint"
                      aria-hidden="true"
                    >
                      {optionLetter(optionIndex)}
                    </span>
                    <Input
                      value={option.label}
                      onChange={(event) => onOptionChange(option.id, event.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      aria-label={`Option ${optionLetter(optionIndex)}`}
                      invalid={showErrors && !option.label.trim()}
                      className="h-9 text-[12.5px]"
                    />
                    <button
                      type="button"
                      onClick={() => onOptionRemove(option.id)}
                      disabled={question.options.length <= 2}
                      aria-label={`Remove option ${optionLetter(optionIndex)}`}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint/70 transition-colors hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onOptionAdd}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong/80 px-3 py-2 text-[11px] font-medium text-ink-faint transition-colors hover:border-forest/40 hover:bg-forest-soft/30 hover:text-forest"
              >
                <Icon name="plus" size={12} />
                Add another option
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-2.5 text-[12px] font-medium text-ink">Long-answer field</p>
              <div
                className="rounded-lg border border-line bg-canvas/40 p-3"
                style={{ borderLeftColor: accent, borderLeftWidth: 2 }}
              >
                <div className="space-y-1.5" aria-hidden="true">
                  <div className="h-2 w-full rounded-full bg-line/80" />
                  <div className="h-2 w-[88%] rounded-full bg-line/70" />
                  <div className="h-2 w-[62%] rounded-full bg-line/50" />
                </div>
                <p className="mt-3 text-[10px] text-ink-faint">
                  Respondents see a free-text box. No answer options needed.
                </p>
              </div>
            </div>
          )}

          {showErrors && issue && (
            <p className="flex items-start gap-1.5 rounded-md border border-danger/20 bg-danger-soft/40 px-2.5 py-2 text-[11px] leading-relaxed text-danger">
              <Icon name="alert" size={13} className="mt-0.5 shrink-0" />
              {issue}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-cream/40 px-4 py-2.5 sm:px-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={!canPrevious}
            iconLeft={<Icon name="chevronLeft" size={14} />}
          >
            Previous
          </Button>
          <p className="hidden text-[9.5px] text-ink-faint sm:block">
            {index + 1} of {total} questions
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onNext}
            disabled={!canNext}
            iconRight={<Icon name="chevronRight" size={14} />}
          >
            Next question
          </Button>
        </div>
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 px-1 text-[9.5px] text-ink-faint">
        <Icon name="info" size={11} />
        Press Save in the top bar to keep your changes. Publishing validates every question.
      </p>
    </div>
  );
}
