"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { Logo } from "@/components/atoms/logo";
import { Spinner } from "@/components/atoms/spinner";
import { DropdownMenu, type DropdownItem } from "@/components/molecules/dropdown";
import { ConfirmDialog, Modal } from "@/components/molecules/modal";
import { StatusBadge } from "@/components/molecules/status-badge";
import { Tabs } from "@/components/molecules/tabs";
import { useToast } from "@/components/molecules/toast";
import { useSession } from "@/lib/session";
import { responseCount } from "@/lib/analytics";
import { surveyActions, uniqueSlug, useSurveyStore } from "@/lib/store";
import { blankQuestion, newSurvey } from "@/lib/survey-factory";
import type { Question, QuestionType, Survey, SurveyTheme } from "@/lib/types";
import { cn, copyToClipboard, formatNumber, uid } from "@/lib/utils";
import { QuestionEditor, questionIssue } from "./question-editor";
import { QuestionList } from "./question-list";
import { SurveyPreview, SurveySettings } from "./builder-panels";

function BuilderLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
      <Logo size={34} />
      <Spinner className="text-forest" />
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
    </div>
  );
}

interface BuilderWorkspaceProps {
  surveyId?: string;
}

export function BuilderWorkspace({ surveyId }: BuilderWorkspaceProps) {
  const session = useSession();
  const store = useSurveyStore();
  const router = useRouter();

  const ready = session.hydrated && !!session.profile && store.hydrated;

  useEffect(() => {
    if (session.hydrated && !session.profile) {
      router.replace("/login");
    }
  }, [session.hydrated, session.profile, router]);

  if (!ready) {
    return <BuilderLoader label="Preparing the builder" />;
  }

  return (
    <BuilderEditor
      key={surveyId ?? "new"}
      surveyId={surveyId}
      initialSurveys={store.surveys}
    />
  );
}

function BuilderEditor({
  surveyId,
  initialSurveys,
}: {
  surveyId?: string;
  initialSurveys: Survey[];
}) {
  const store = useSurveyStore();
  const router = useRouter();
  const toast = useToast();

  const [survey, setSurvey] = useState<Survey | null>(() => {
    if (!surveyId) {
      return newSurvey(uid("srv"), uniqueSlug("Untitled survey"));
    }
    const found = initialSurveys.find((item) => item.id === surveyId);
    return found ? structuredClone(found) : null;
  });
  const [dirty, setDirty] = useState(!surveyId);
  const [activeId, setActiveId] = useState<string | null>(
    () => survey?.questions[0]?.id ?? null,
  );
  const [showErrors, setShowErrors] = useState(false);
  const [panelTab, setPanelTab] = useState<"preview" | "settings">("preview");
  const [mobilePanel, setMobilePanel] = useState<"questions" | "panel" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const notFound = Boolean(surveyId) && !survey;

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const activeIndex = survey
    ? Math.max(
        0,
        survey.questions.findIndex((question) => question.id === activeId),
      )
    : 0;
  const activeQuestion = survey?.questions[activeIndex] ?? null;
  const publicPath = survey ? `/s/${survey.slug}` : "";
  const publicUrl =
    typeof window !== "undefined" && survey
      ? `${window.location.origin}${publicPath}`
      : publicPath;

  const updateSurvey = (updater: (current: Survey) => Survey) => {
    setSurvey((current) => (current ? updater(current) : current));
    setDirty(true);
  };

  const updateTitle = (title: string) => {
    updateSurvey((current) => ({
      ...current,
      title,
      slug:
        current.status === "draft" && !current.publishedAt
          ? uniqueSlug(title, current.id)
          : current.slug,
    }));
  };

  const updateActiveQuestion = (patch: Partial<Question>) => {
    if (!activeQuestion) return;
    updateSurvey((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === activeQuestion.id ? { ...question, ...patch } : question,
      ),
    }));
  };

  const updateTheme = (patch: Partial<SurveyTheme>) => {
    updateSurvey((current) => ({
      ...current,
      theme: { ...current.theme, ...patch },
    }));
  };

  const changeType = (type: QuestionType) => {
    if (!activeQuestion || activeQuestion.type === type) return;
    updateActiveQuestion({
      type,
      options:
        type === "multiple_choice" && activeQuestion.options.length < 2
          ? [
              { id: uid("opt"), label: "Option 1" },
              { id: uid("opt"), label: "Option 2" },
            ]
          : activeQuestion.options,
    });
  };

  const addQuestion = () => {
    const question = blankQuestion();
    updateSurvey((current) => ({
      ...current,
      questions: [...current.questions, question],
    }));
    setActiveId(question.id);
    setShowErrors(false);
    setMobilePanel(null);
  };

  const duplicateQuestion = (id: string) => {
    if (!survey) return;
    const source = survey.questions.find((question) => question.id === id);
    if (!source) return;
    const copy: Question = {
      ...source,
      id: uid("q"),
      options: source.options.map((option) => ({ ...option, id: uid("opt") })),
    };
    const index = survey.questions.findIndex((question) => question.id === id);
    updateSurvey((current) => {
      const questions = [...current.questions];
      questions.splice(index + 1, 0, copy);
      return { ...current, questions };
    });
    setActiveId(copy.id);
  };

  const deleteQuestion = (id: string) => {
    if (!survey) return;
    if (survey.questions.length <= 1) {
      toast.warning("Keep at least one question", "A survey needs one question to publish.");
      return;
    }
    const index = survey.questions.findIndex((question) => question.id === id);
    const remaining = survey.questions.filter((question) => question.id !== id);
    updateSurvey((current) => ({
      ...current,
      questions: current.questions.filter((question) => question.id !== id),
    }));
    if (activeId === id) {
      const next = remaining[Math.min(index, remaining.length - 1)];
      setActiveId(next?.id ?? null);
    }
  };

  const moveQuestion = (id: string, direction: -1 | 1) => {
    if (!survey) return;
    const index = survey.questions.findIndex((question) => question.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= survey.questions.length) return;
    updateSurvey((current) => {
      const questions = [...current.questions];
      const [moved] = questions.splice(index, 1);
      if (moved) questions.splice(target, 0, moved);
      return { ...current, questions };
    });
  };

  const reorderQuestions = (sourceId: string, targetId: string) => {
    if (!survey) return;
    const from = survey.questions.findIndex((question) => question.id === sourceId);
    const to = survey.questions.findIndex((question) => question.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    updateSurvey((current) => {
      const questions = [...current.questions];
      const [moved] = questions.splice(from, 1);
      if (moved) questions.splice(to, 0, moved);
      return { ...current, questions };
    });
  };

  const addOption = () => {
    if (!activeQuestion) return;
    updateActiveQuestion({
      options: [
        ...activeQuestion.options,
        { id: uid("opt"), label: `Option ${activeQuestion.options.length + 1}` },
      ],
    });
  };

  const removeOption = (optionId: string) => {
    if (!activeQuestion || activeQuestion.options.length <= 2) return;
    updateActiveQuestion({
      options: activeQuestion.options.filter((option) => option.id !== optionId),
    });
  };

  const changeOption = (optionId: string, label: string) => {
    if (!activeQuestion) return;
    updateActiveQuestion({
      options: activeQuestion.options.map((option) =>
        option.id === optionId ? { ...option, label } : option,
      ),
    });
  };

  const selectQuestion = (id: string) => {
    setActiveId(id);
    setShowErrors(false);
    setMobilePanel(null);
  };

  const stepQuestion = (direction: -1 | 1) => {
    if (!survey) return;
    const next = survey.questions[activeIndex + direction];
    if (next) setActiveId(next.id);
  };

  const saveSurvey = (options?: { silent?: boolean; navigate?: boolean }) => {
    if (!survey) return null;
    const exists = store.surveys.some((item) => item.id === survey.id);
    const saved = surveyActions.save({
      ...survey,
      title: survey.title.trim() || "Untitled survey",
    });
    setSurvey(saved);
    setDirty(false);

    if (!exists && options?.navigate !== false) {
      router.replace(`/builder/${saved.id}`);
    }
    if (!options?.silent) {
      toast.success(exists ? "Draft saved" : "Draft created", exists ? "Your changes are saved." : "Find it in your survey library.");
    }
    return saved;
  };

  const openPanel = (tab: "preview" | "settings") => {
    setPanelTab(tab);
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches) return;
    setMobilePanel("panel");
  };

  const copyLink = async () => {
    if (!survey) return;
    if (survey.status !== "published") {
      toast.warning("Publish this survey first", "A public link is created when you publish.");
      return;
    }
    const url = `${window.location.origin}${publicPath}`;
    const copied = await copyToClipboard(url);
    if (copied) {
      toast.success("Link copied to clipboard", "Anyone with the link can now respond.");
    } else {
      toast.error("Could not copy the link", "Select and copy the URL manually.");
    }
  };

  const publish = () => {
    if (!survey) return;

    if (survey.status === "published") {
      setShareOpen(true);
      return;
    }

    if (survey.status === "closed") {
      surveyActions.reopen(survey.id);
      setSurvey({
        ...survey,
        status: "published",
        closedAt: null,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Survey reopened", "It is accepting responses again.");
      return;
    }

    const issues = survey.questions
      .map((question, index) => ({ index, issue: questionIssue(question) }))
      .filter((entry) => entry.issue);

    if (!survey.title.trim() || issues.length > 0) {
      setShowErrors(true);
      const firstIssue = issues[0];
      if (firstIssue) {
        const question = survey.questions[firstIssue.index];
        if (question) setActiveId(question.id);
      }
      toast.error(
        "A few things need attention",
        !survey.title.trim()
          ? "Add a title before publishing."
          : `${issues.length} question${issues.length === 1 ? " needs" : "s need"} a quick fix.`,
      );
      return;
    }

    const wasNew = !store.surveys.some((item) => item.id === survey.id);
    const saved = saveSurvey({ silent: true, navigate: false });
    if (!saved) return;

    surveyActions.publish(saved.id);
    setSurvey({
      ...saved,
      status: "published",
      publishedAt: saved.publishedAt ?? new Date().toISOString(),
      closedAt: null,
    });
    setDirty(false);
    setShowErrors(false);
    if (wasNew) router.replace(`/builder/${saved.id}`);
    toast.success("Your survey is live", "The public link is ready to share.");
  };

  const duplicateSurvey = () => {
    if (!survey) return;
    const saved = saveSurvey({ silent: true, navigate: false });
    if (!saved) return;
    const copy = surveyActions.duplicate(saved.id);
    if (!copy) {
      toast.error("Could not duplicate this survey");
      return;
    }
    toast.success("Survey duplicated", `“${copy.title}” is ready to edit.`);
    router.push(`/builder/${copy.id}`);
  };

  const confirmDelete = () => {
    if (!survey) return;
    surveyActions.remove(survey.id);
    setDeleteOpen(false);
    toast.success("Survey deleted", "The survey and its responses have been removed.");
    router.push("/dashboard/surveys");
  };

  if (notFound) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
        <Logo size={36} />
        <div>
          <h1 className="font-display text-2xl text-ink">Survey not found</h1>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-soft">
            This survey may have been deleted, or the link points to something that no longer exists.
          </p>
        </div>
        <Button href="/dashboard/surveys" variant="secondary" iconLeft={<Icon name="arrowLeft" size={14} />}>
          Back to surveys
        </Button>
      </div>
    );
  }

  if (!survey) {
    return <BuilderLoader label="Opening your survey" />;
  }

  const menuItems: DropdownItem[] = [
    {
      label: "Save draft",
      icon: "file",
      onSelect: () => saveSurvey(),
      disabled: !dirty,
    },
    {
      label: "Live preview",
      icon: "eye",
      onSelect: () => openPanel("preview"),
    },
    {
      label: "Survey settings",
      icon: "settings",
      onSelect: () => openPanel("settings"),
    },
    {
      label: "View responses",
      icon: "inbox",
      onSelect: () => router.push(`/dashboard/responses?survey=${survey.id}`),
    },
    {
      label: "Copy public link",
      icon: "link",
      onSelect: copyLink,
      disabled: survey.status !== "published",
    },
    {
      label: "Duplicate survey",
      icon: "copy",
      onSelect: duplicateSurvey,
      separatorBefore: true,
    },
    {
      label: "Delete survey",
      icon: "trash",
      danger: true,
      separatorBefore: true,
      onSelect: () => setDeleteOpen(true),
    },
  ];

  const statusAction =
    survey.status === "published" ? "Share" : survey.status === "closed" ? "Reopen" : "Publish";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-1 border-b border-line bg-surface/95 px-2 backdrop-blur sm:gap-2 sm:px-4">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
        >
          <Icon name="chevronLeft" size={17} />
        </Link>
        <Link href="/dashboard" aria-label="SurveyLand dashboard" className="hidden shrink-0 sm:flex">
          <Logo size={24} tone="mark" />
        </Link>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden="true" />

        <input
          aria-label="Survey title"
          value={survey.title}
          onChange={(event) => updateTitle(event.target.value)}
          placeholder="Untitled survey"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1.5 font-display text-[14px] font-semibold tracking-[-0.02em] text-ink outline-none transition-colors placeholder:text-ink-faint/70 hover:border-line focus:border-line focus:bg-surface focus:ring-2 focus:ring-forest/10 sm:text-[15.5px]"
        />

        <span className="hidden md:block">
          <StatusBadge status={survey.status} />
        </span>

        <span
          className={cn(
            "hidden items-center gap-1.5 text-[9.5px] lg:flex",
            dirty ? "text-warning" : "text-ink-faint",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              dirty ? "bg-gold animate-pulse" : "bg-forest",
            )}
          />
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>

        <button
          type="button"
          onClick={() => setMobilePanel("questions")}
          aria-label="Open questions"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink lg:hidden"
        >
          <Icon name="layers" size={16} />
        </button>

        <button
          type="button"
          onClick={() => openPanel("preview")}
          aria-label="Open live preview"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink xl:hidden"
        >
          <Icon name="eye" size={16} />
        </button>

        <Button
          variant="secondary"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => saveSurvey()}
          disabled={!dirty}
          iconLeft={<Icon name="check" size={13} />}
        >
          Save
        </Button>

        <Button
          variant={survey.status === "published" ? "secondary" : "primary"}
          size="sm"
          onClick={publish}
          iconLeft={
            <Icon
              name={survey.status === "published" ? "share" : survey.status === "closed" ? "refresh" : "send"}
              size={13}
            />
          }
        >
          {statusAction}
        </Button>

        <DropdownMenu
          align="end"
          triggerLabel="More survey actions"
          triggerClassName="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
          trigger={<Icon name="more" size={16} />}
          items={menuItems}
        />
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[248px] shrink-0 border-r border-line bg-cream/40 lg:flex">
          <QuestionList
            survey={survey}
            activeId={activeQuestion?.id ?? null}
            onSelect={selectQuestion}
            onAdd={addQuestion}
            onDuplicate={duplicateQuestion}
            onDelete={deleteQuestion}
            onMove={moveQuestion}
            onReorder={reorderQuestions}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="px-3 py-5 sm:px-6 sm:py-7">
            {activeQuestion ? (
              <QuestionEditor
                question={activeQuestion}
                index={activeIndex}
                total={survey.questions.length}
                accent={survey.theme.accent}
                showErrors={showErrors}
                onChange={updateActiveQuestion}
                onOptionChange={changeOption}
                onOptionAdd={addOption}
                onOptionRemove={removeOption}
                onTypeChange={changeType}
                onDuplicate={() => duplicateQuestion(activeQuestion.id)}
                onDelete={() => deleteQuestion(activeQuestion.id)}
                onPrevious={() => stepQuestion(-1)}
                onNext={() => stepQuestion(1)}
                canPrevious={activeIndex > 0}
                canNext={activeIndex < survey.questions.length - 1}
              />
            ) : (
              <div className="mx-auto max-w-md rounded-xl border border-dashed border-line-strong bg-cream/50 px-6 py-14 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-surface text-forest">
                  <Icon name="plus" size={18} />
                </span>
                <h2 className="mt-4 font-display text-xl text-ink">Add your first question</h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
                  Start with a question that gets to the heart of what you want to learn.
                </p>
                <Button className="mt-4" onClick={addQuestion} iconLeft={<Icon name="plus" size={14} />}>
                  Add question
                </Button>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden w-[352px] shrink-0 flex-col border-l border-line bg-surface xl:flex">
          <div className="border-b border-line px-3 py-2.5">
            <Tabs
              variant="pill"
              ariaLabel="Builder panel"
              value={panelTab}
              onChange={(value) => setPanelTab(value as "preview" | "settings")}
              tabs={[
                { value: "preview", label: "Preview", icon: <Icon name="eye" size={13} /> },
                { value: "settings", label: "Settings", icon: <Icon name="settings" size={13} /> },
              ]}
              className="w-full [&>button]:flex-1 [&>button]:justify-center"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
            {panelTab === "preview" ? (
              <SurveyPreview
                key={activeQuestion?.id ?? "root"}
                survey={survey}
                activeQuestionId={activeQuestion?.id ?? null}
              />
            ) : (
              <SurveySettings
                survey={survey}
                onTitleChange={updateTitle}
                onPatch={(patch) => updateSurvey((current) => ({ ...current, ...patch }))}
                onThemeChange={updateTheme}
                onCopyLink={copyLink}
              />
            )}
            <p className="mt-4 flex items-start gap-1.5 px-1 text-[9px] leading-relaxed text-ink-faint">
              <Icon name="info" size={11} className="mt-px shrink-0" />
              This is a local demo. Responses and changes are stored in your browser only.
            </p>
          </div>
        </aside>
      </div>

      <Modal
        open={mobilePanel === "questions"}
        onClose={() => setMobilePanel(null)}
        title="Question outline"
        description="Reorder, duplicate, or jump between questions."
        size="md"
      >
        <div className="-mx-1 max-h-[62vh] overflow-hidden rounded-lg border border-line">
          <QuestionList
            survey={survey}
            activeId={activeQuestion?.id ?? null}
            onSelect={selectQuestion}
            onAdd={addQuestion}
            onDuplicate={duplicateQuestion}
            onDelete={deleteQuestion}
            onMove={moveQuestion}
            onReorder={reorderQuestions}
          />
        </div>
      </Modal>

      <Modal
        open={mobilePanel === "panel"}
        onClose={() => setMobilePanel(null)}
        title={panelTab === "preview" ? "Live preview" : "Survey settings"}
        description={
          panelTab === "preview"
            ? "Step through the survey exactly as a respondent would."
            : "Tune the details, appearance, and closing message."
        }
        size="lg"
      >
        <div className="mb-4">
          <Tabs
            variant="pill"
            ariaLabel="Builder panel"
            value={panelTab}
            onChange={(value) => setPanelTab(value as "preview" | "settings")}
            tabs={[
              { value: "preview", label: "Preview", icon: <Icon name="eye" size={13} /> },
              { value: "settings", label: "Settings", icon: <Icon name="settings" size={13} /> },
            ]}
          />
        </div>
        {panelTab === "preview" ? (
          <SurveyPreview
            key={activeQuestion?.id ?? "root"}
            survey={survey}
            activeQuestionId={activeQuestion?.id ?? null}
          />
        ) : (
          <SurveySettings
            survey={survey}
            onTitleChange={updateTitle}
            onPatch={(patch) => updateSurvey((current) => ({ ...current, ...patch }))}
            onThemeChange={updateTheme}
            onCopyLink={copyLink}
          />
        )}
      </Modal>

      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Your survey is live"
        description="Share this link with anyone. Responses appear in your dashboard."
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShareOpen(false)}>
              Done
            </Button>
            <Button
              size="sm"
              onClick={copyLink}
              iconLeft={<Icon name="copy" size={13} />}
            >
              Copy link
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-[11px] font-medium text-ink-soft">Public link</p>
            <Input readOnly value={publicUrl} aria-label="Public survey link" className="font-mono text-[11px]" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-canvas/50 px-3 py-2">
            <p className="text-[10.5px] text-ink-faint">Responses collected so far</p>
            <p className="font-mono text-[11px] font-medium text-ink">
              {formatNumber(responseCount(store, survey.id))}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            iconRight={<Icon name="external" size={12} />}
          >
            Open public survey
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete this survey?"
        description={`“${survey.title || "Untitled survey"}” and its ${formatNumber(
          responseCount(store, survey.id),
        )} responses will be permanently removed from this demo. This cannot be undone.`}
        confirmLabel="Delete survey"
      />
    </div>
  );
}
