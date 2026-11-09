"use client";

import type { AnswerValue, Question } from "@/types/domain";
import { cn } from "@/lib/utils";

interface SurveyQuestionFieldProps {
  question: Question;
  value?: AnswerValue;
  onChange?: (value: AnswerValue) => void;
  accent?: string;
  questionNumber?: number;
  totalQuestions?: number;
  className?: string;
}

export function SurveyQuestionField({
  question,
  value,
  onChange,
  accent = "#0d5947",
  questionNumber,
  totalQuestions,
  className,
}: SurveyQuestionFieldProps) {
  const selected = typeof value === "string" ? value : "";
  const selectedValues = Array.isArray(value) ? value : selected ? [selected] : [];
  const isMultiple = question.type === "multiple_choice";
  const optionLetter = (index: number) => String.fromCharCode(65 + index);

  const toggleOption = (label: string) => {
    if (!onChange) return;
    if (!isMultiple) {
      onChange(label);
      return;
    }
    const next = selectedValues.includes(label)
      ? selectedValues.filter((item) => item !== label)
      : [...selectedValues, label];
    onChange(next);
  };

  return (
    <div className={cn("w-full", className)}>
      {questionNumber && totalQuestions ? (
        <p className="mb-3 font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          Question {questionNumber} of {totalQuestions}
        </p>
      ) : null}

      <h2 className="text-balance font-display text-[21px] leading-[1.25] tracking-[-0.02em] text-ink sm:text-[23px]">
        {question.title.trim() || "Untitled question"}
        {question.required && (
          <span className="ml-1.5 align-middle text-[13px] font-sans font-normal text-coral" aria-hidden="true">
            *
          </span>
        )}
      </h2>
      {question.description?.trim() ? (
        <p className="mt-1.5 text-pretty text-[12.5px] leading-relaxed text-ink-soft">
          {question.description}
        </p>
      ) : null}

      {question.type === "long_answer" ? (
        <div className="mt-5">
          <textarea
            value={selected}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder="Type your answer here…"
            rows={4}
            aria-label={question.title || "Your answer"}
            className="w-full resize-none rounded-lg border border-line bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint/80 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-4 focus:ring-forest/10"
            style={{ borderColor: selected ? `${accent}66` : undefined }}
          />
          <p className="mt-1.5 text-[10px] text-ink-faint">
            Long answer · respondents can write as much as they need.
          </p>
        </div>
      ) : (
        <div
          className="mt-5 space-y-2"
          role={isMultiple ? "group" : "radiogroup"}
          aria-label={question.title || "Question"}
        >
          {question.options.map((option, index) => {
            const active = isMultiple
              ? selectedValues.includes(option.label)
              : selected === option.label;
            return (
              <button
                key={option.id}
                type="button"
                role={isMultiple ? "checkbox" : "radio"}
                aria-checked={active}
                onClick={() => toggleOption(option.label)}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-surface px-3 py-2.5 text-left transition-all duration-150",
                  active
                    ? "shadow-[0_2px_10px_rgba(21,33,28,0.05)]"
                    : "border-line hover:border-line-strong hover:bg-cream/50",
                )}
                style={
                  active
                    ? { borderColor: accent, backgroundColor: `${accent}0d` }
                    : undefined
                }
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] border font-mono text-[10.5px] font-medium transition-colors",
                    active ? "text-white" : "border-line bg-canvas text-ink-faint group-hover:text-ink-soft",
                  )}
                  style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                  aria-hidden="true"
                >
                  {optionLetter(index)}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[13px] leading-5",
                    active ? "font-medium text-ink" : "text-ink-soft",
                    !option.label.trim() && "italic text-ink-faint",
                  )}
                >
                  {option.label.trim() || "Empty option"}
                </span>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                    isMultiple ? "rounded-[4px]" : "rounded-full",
                    active ? "border-transparent" : "border-line-strong/70",
                  )}
                  style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                  aria-hidden="true"
                >
                  {active &&
                    (isMultiple ? (
                      <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none">
                        <path
                          d="m3.5 8.5 3 3 6-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    ))}
                </span>
              </button>
            );
          })}
          {question.options.length === 0 && (
            <p className="rounded-lg border border-dashed border-line-strong/70 px-3 py-4 text-center text-xs text-ink-faint">
              Add at least two answer options.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
