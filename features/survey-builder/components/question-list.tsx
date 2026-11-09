"use client";

import { useState, type DragEvent } from "react";
import { Icon } from "@/components/atoms/icon";
import { DropdownMenu } from "@/components/molecules/dropdown";
import { SectionLabel } from "@/components/atoms/misc";
import type { Question, Survey } from "@/types/domain";
import { cn } from "@/lib/utils";

interface QuestionListProps {
  survey: Survey;
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  className?: string;
}

function typeLabel(question: Question): string {
  if (question.type === "long_answer") return "Long answer";
  const suffix = question.type === "multiple_choice" ? "multiple answer" : "single answer";
  return `${question.options.length} options · ${suffix}`;
}

function typeIcon(question: Question): "radio" | "checkSquare" | "text" {
  if (question.type === "long_answer") return "text";
  return question.type === "multiple_choice" ? "checkSquare" : "radio";
}

export function QuestionList({
  survey,
  activeId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
  onReorder,
  className,
}: QuestionListProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    setDragId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault();
    const sourceId = dragId ?? event.dataTransfer.getData("text/plain");
    if (sourceId && sourceId !== id) onReorder(sourceId, id);
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <SectionLabel>
          Questions · {survey.questions.length}
        </SectionLabel>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add question"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
        >
          <Icon name="plus" size={14} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {survey.questions.map((question, index) => {
          const active = question.id === activeId;
          const isDragging = dragId === question.id;
          const isOver = overId === question.id && dragId !== question.id;
          return (
            <div
              key={question.id}
              draggable
              onDragStart={(event) => handleDragStart(event, question.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverId(question.id);
              }}
              onDragLeave={() => setOverId((current) => (current === question.id ? null : current))}
              onDrop={(event) => handleDrop(event, question.id)}
              className={cn(
                "group flex items-start gap-0.5 rounded-lg border transition-all duration-150",
                active
                  ? "border-line bg-surface shadow-soft"
                  : "border-transparent hover:bg-surface/70",
                isDragging && "opacity-40",
                isOver && "border-forest/40 bg-forest-soft/40",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(question.id)}
                aria-current={active ? "true" : undefined}
                className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 text-left"
              >
                <span className="mt-0.5 flex w-4 shrink-0 justify-center text-ink-faint/60 transition-colors group-hover:text-ink-faint">
                  <Icon name="drag" size={13} />
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] font-mono text-[9.5px] font-medium",
                    active ? "bg-forest text-cream" : "bg-canvas-deep/70 text-ink-faint",
                  )}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[12px] leading-[1.35]",
                      active ? "font-medium text-ink" : "text-ink-soft",
                    )}
                  >
                    {question.title.trim() || "Untitled question"}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[9.5px] text-ink-faint">
                    <Icon
                      name={typeIcon(question)}
                      size={10}
                    />
                    {typeLabel(question)}
                    {question.required && (
                      <>
                        <span className="h-0.5 w-0.5 rounded-full bg-ink-faint/60" />
                        Required
                      </>
                    )}
                  </span>
                </span>
              </button>

              <DropdownMenu
                align="end"
                triggerLabel={`Question ${index + 1} actions`}
                triggerClassName="mt-1.5 mr-1 flex h-6 w-6 items-center justify-center rounded text-ink-faint opacity-0 transition-opacity hover:bg-canvas-deep/60 hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
                trigger={<Icon name="more" size={14} />}
                items={[
                  { label: "Duplicate", icon: "copy", onSelect: () => onDuplicate(question.id) },
                  {
                    label: "Move up",
                    icon: "chevronUp",
                    onSelect: () => onMove(question.id, -1),
                    disabled: index === 0,
                  },
                  {
                    label: "Move down",
                    icon: "chevronDown",
                    onSelect: () => onMove(question.id, 1),
                    disabled: index === survey.questions.length - 1,
                  },
                  {
                    label: "Delete",
                    icon: "trash",
                    danger: true,
                    separatorBefore: true,
                    disabled: survey.questions.length <= 1,
                    onSelect: () => onDelete(question.id),
                  },
                ]}
              />
            </div>
          );
        })}
      </div>

      <div className="border-t border-line/80 p-2.5">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong/80 px-3 py-2.5 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-forest/40 hover:bg-forest-soft/30 hover:text-forest"
        >
          <Icon name="plus" size={13} />
          Add question
        </button>
        <p className="mt-2 text-center text-[9px] leading-relaxed text-ink-faint/80">
          Drag questions to reorder · changes save when you choose Save
        </p>
      </div>
    </div>
  );
}
