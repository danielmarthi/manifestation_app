"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { evaluateAnswer, saveAreaAnswer } from "../../actions/onboarding";

// ============================================================================
// Area question data
// ============================================================================

interface AreaQuestion {
  area: string;
  question: string;
  context: string;
  cta: string;
}

const AREA_QUESTIONS: Record<string, AreaQuestion> = {
  "Money & Abundance": {
    area: "Money & Abundance",
    question: "What's your actual relationship with money right now — not what you wish was true, but what is true?",
    context: "Think about how you feel when you check your bank account. What you believe about whether you can earn more. Whether you feel like money is something that happens to other people.",
    cta: "That's honest →",
  },
  "Health & Body": {
    area: "Health & Body",
    question: "How do you feel in your body day to day — and what do you believe about your ability to change that?",
    context: "Not your goals. Your current reality. Your energy levels, how you treat your body, what you tell yourself about it when no one's watching.",
    cta: "That's true →",
  },
  "Love & Relationships": {
    area: "Love & Relationships",
    question: "Where are you with love right now — what's the real story?",
    context: "Whether you're single, partnered, or somewhere in between. What you actually believe about whether you can have the relationship you want. What keeps showing up.",
    cta: "That's real →",
  },
  "Career & Purpose": {
    area: "Career & Purpose",
    question: "Do you feel like you're doing what you're here to do — and if not, what's actually in the way?",
    context: "Not the résumé version. The version you'd tell someone you trusted. What lights you up, what drains you, and the honest gap between where you are and where you want to be.",
    cta: "That's it →",
  },
  "Family & Connections": {
    area: "Family & Connections",
    question: "What's true about your most important relationships right now — family, close friends, the people who make up your world?",
    context: "What's solid, what's strained, what you wish was different. What you believe about your ability to have the connections you actually want.",
    cta: "That's true →",
  },
  "Personal Growth": {
    area: "Personal Growth",
    question: "What's the main thing that feels like it's holding you back from the version of yourself you sense is possible?",
    context: "Not a goal. The thing underneath the goals. The pattern that keeps showing up across different areas of your life. The story you keep telling yourself about why not yet.",
    cta: "That's honest →",
  },
};

const CLOSING_QUESTIONS = [
  {
    id: "closing1",
    area: "Pattern",
    question: "Looking at everything you've just shared — what's the common thread?",
    context: "What's the one belief about yourself that shows up across most of these areas, even if it looks different in each one? 'I'm not someone who...' 'People like me don't...' 'I can't have both...' Take a moment. What's the real story?",
    cta: "That's the pattern →",
  },
  {
    id: "closing2",
    area: "Vision",
    question: "If you woke up 12 months from now and everything had genuinely shifted — not fantasy, but real, felt change — who would you be?",
    context: "Not what you'd have. Who you'd be. How would you move through the world differently? What would you take for granted that you're currently afraid to hope for? Be specific — vague answers build vague results.",
    cta: "That's the vision →",
  },
];

// ============================================================================
// Types
// ============================================================================

type Mode =
  | "area-question"
  | "evaluating"
  | "follow-up"
  | "acknowledging"
  | "closing-transition"
  | "closing-question"
  | "saving";

interface SavedAnswer {
  area: string;
  question: string;
  answer: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

// ============================================================================
// Component
// ============================================================================

interface Props {
  selectedAreas: string[];
  savedAnswers: Record<string, unknown>[];
}

export function OnboardingQuestions({ selectedAreas, savedAnswers }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Figure out resume point from saved answers
  const savedMap = new Map<string, SavedAnswer>(
    (savedAnswers as unknown as SavedAnswer[]).map((a) => [a.area, a])
  );
  const allAreasDone = selectedAreas.every((a) => savedMap.has(a));
  const closingDone = savedMap.has("closing1") && savedMap.has("closing2");

  // Find first unanswered area
  const firstUnansweredIdx = selectedAreas.findIndex((a) => !savedMap.has(a));
  const initialAreaIdx = firstUnansweredIdx === -1 ? selectedAreas.length : firstUnansweredIdx;

  const [areaIndex, setAreaIndex] = useState(initialAreaIdx);
  const [mode, setMode] = useState<Mode>(
    closingDone
      ? "saving"
      : allAreasDone
      ? "closing-transition"
      : initialAreaIdx < selectedAreas.length
      ? "area-question"
      : "closing-transition"
  );
  const [closingIndex, setClosingIndex] = useState(
    savedMap.has("closing1") ? 1 : 0
  );

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [acknowledgment, setAcknowledgment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Auto-redirect if already all done
  useEffect(() => {
    if (closingDone) {
      router.push("/onboarding/generating");
    }
  }, [closingDone, router]);

  // ── Compute progress ──────────────────────────────────────────────────────
  const totalSteps = selectedAreas.length + 2; // areas + 2 closing
  const stepsCompleted =
    savedMap.size + (mode === "closing-question" ? closingIndex : 0);
  const progressPct = Math.min(
    (stepsCompleted / totalSteps) * 100,
    99
  );

  // ── Current question ──────────────────────────────────────────────────────
  const isInAreaPhase =
    mode === "area-question" ||
    mode === "evaluating" ||
    mode === "follow-up" ||
    mode === "acknowledging";

  const currentAreaName =
    isInAreaPhase && areaIndex < selectedAreas.length
      ? selectedAreas[areaIndex]
      : null;

  const currentAreaQ = currentAreaName
    ? AREA_QUESTIONS[currentAreaName] ?? {
        area: currentAreaName,
        question: `Tell me about your relationship with ${currentAreaName} right now.`,
        context: "Be specific and honest.",
        cta: "That's true →",
      }
    : null;

  const currentClosingQ =
    mode === "closing-question" ? CLOSING_QUESTIONS[closingIndex] : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAreaSubmit() {
    if (!currentAreaQ || !currentAnswer.trim() || isEvaluating) return;

    if (mode === "follow-up") {
      // Submit follow-up answer directly (no second eval)
      await persistAreaAnswer({
        area: currentAreaQ.area,
        question: currentAreaQ.question,
        answer: currentAnswer,
        followUpQuestion,
        followUpAnswer: followUpAnswer.trim() || currentAnswer.trim(),
      });
      return;
    }

    // Evaluate original answer
    setIsEvaluating(true);
    setMode("evaluating");
    try {
      const result = await evaluateAnswer(
        currentAreaQ.area,
        currentAreaQ.question,
        currentAnswer
      );

      if (result.needsFollowUp && result.followUpQuestion) {
        setFollowUpQuestion(result.followUpQuestion);
        setFollowUpAnswer("");
        setMode("follow-up");
      } else {
        setAcknowledgment(result.acknowledgment ?? "Got it.");
        await persistAreaAnswer({
          area: currentAreaQ.area,
          question: currentAreaQ.question,
          answer: currentAnswer,
        });
      }
    } catch {
      setError("Couldn't evaluate your answer. Moving on.");
      await persistAreaAnswer({
        area: currentAreaQ.area,
        question: currentAreaQ.question,
        answer: currentAnswer,
      });
    } finally {
      setIsEvaluating(false);
    }
  }

  async function handleFollowUpSubmit() {
    if (!currentAreaQ || !followUpAnswer.trim()) return;
    await persistAreaAnswer({
      area: currentAreaQ.area,
      question: currentAreaQ.question,
      answer: currentAnswer,
      followUpQuestion,
      followUpAnswer: followUpAnswer.trim(),
    });
  }

  async function persistAreaAnswer(data: SavedAnswer) {
    startTransition(async () => {
      try {
        await saveAreaAnswer(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
      }
    });

    setAcknowledgment(acknowledgment || "Got it.");
    setMode("acknowledging");

    // Show acknowledgment for 1.8s then advance
    await new Promise((r) => setTimeout(r, 1800));

    const nextIdx = areaIndex + 1;
    if (nextIdx < selectedAreas.length) {
      setAreaIndex(nextIdx);
      setCurrentAnswer("");
      setFollowUpQuestion("");
      setFollowUpAnswer("");
      setAcknowledgment("");
      setMode("area-question");
    } else {
      setMode("closing-transition");
    }
  }

  async function handleClosingSubmit() {
    const q = CLOSING_QUESTIONS[closingIndex];
    if (!currentAnswer.trim()) return;

    startTransition(async () => {
      try {
        await saveAreaAnswer({
          area: q.id,
          question: q.question,
          answer: currentAnswer.trim(),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
      }
    });

    if (closingIndex === 0) {
      setClosingIndex(1);
      setCurrentAnswer("");
    } else {
      // All done — go to generating
      router.push("/onboarding/generating");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col page-fade">
      {/* Progress bar */}
      <div className="h-1 bg-line">
        <div
          className="h-full bg-terracotta transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step 3 of 4 indicator */}
      <div className="px-8 pt-6 max-w-2xl mx-auto w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Step 3 of 4
        </div>
      </div>

      {/* ── Closing transition ────────────────────────────────────────────── */}
      {mode === "closing-transition" && (
        <div className="flex-1 flex items-center justify-center px-8 page-fade">
          <div className="max-w-md text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div
                className="absolute inset-0 rounded-full breath-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(212,168,73,0.7) 0%, rgba(179,90,58,0.25) 55%, transparent 80%)",
                }}
              />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
              One area at a time is done.
            </div>
            <h2 className="font-display text-[28px] text-ink mb-4 leading-tight">
              Two final questions — these are the most important ones.
            </h2>
            <button
              onClick={() => setMode("closing-question")}
              className="mt-2 px-8 py-3 rounded-full bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors"
            >
              I'm ready →
            </button>
          </div>
        </div>
      )}

      {/* ── Area question ─────────────────────────────────────────────────── */}
      {(mode === "area-question" ||
        mode === "evaluating" ||
        mode === "follow-up" ||
        mode === "acknowledging") &&
        currentAreaQ && (
          <div className="flex-1 flex flex-col px-8 pb-8 max-w-2xl mx-auto w-full">
            <div className="pt-4 pb-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-1">
                {currentAreaQ.area} · Area {areaIndex + 1} of {selectedAreas.length}
              </div>
              {mode === "follow-up" && (
                <div className="text-[10px] uppercase tracking-[0.14em] text-terracotta mb-1">
                  Tell me more →
                </div>
              )}
              <h1 className="font-display text-[28px] sm:text-[34px] text-ink leading-[1.15]">
                {mode === "follow-up" ? followUpQuestion : currentAreaQ.question}
              </h1>
              {mode !== "follow-up" && (
                <p className="mt-3 text-[13.5px] text-ink-muted italic leading-[1.6]">
                  {currentAreaQ.context}
                </p>
              )}
            </div>

            {/* Acknowledging overlay */}
            {mode === "acknowledging" && (
              <div className="flex-1 flex items-center justify-center page-fade">
                <div className="text-center max-w-sm">
                  <p className="font-display text-[20px] text-ink-soft leading-[1.5] italic">
                    "{acknowledgment}"
                  </p>
                </div>
              </div>
            )}

            {/* Evaluating */}
            {mode === "evaluating" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse [animation-delay:240ms]" />
                  <span className="text-[12px]">Reading what you wrote...</span>
                </div>
              </div>
            )}

            {/* Input */}
            {(mode === "area-question" || mode === "follow-up") && (
              <div className="flex-1 flex flex-col">
                <textarea
                  rows={7}
                  value={mode === "follow-up" ? followUpAnswer : currentAnswer}
                  onChange={(e) =>
                    mode === "follow-up"
                      ? setFollowUpAnswer(e.target.value)
                      : setCurrentAnswer(e.target.value)
                  }
                  placeholder="Say it like it's real."
                  autoFocus
                  className="flex-1 w-full p-5 bg-surface border border-line rounded-xl text-[15.5px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-terracotta resize-none leading-[1.65]"
                />

                {error && (
                  <p className="mt-2 text-[12px] text-sos">{error}</p>
                )}

                <div className="mt-5 flex justify-between items-center">
                  {areaIndex > 0 ? (
                    <button
                      onClick={() => {
                        setAreaIndex((i) => i - 1);
                        setMode("area-question");
                        setCurrentAnswer("");
                      }}
                      className="text-[12px] text-ink-muted hover:text-ink-soft"
                    >
                      ← back
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={
                      mode === "follow-up"
                        ? handleFollowUpSubmit
                        : handleAreaSubmit
                    }
                    disabled={
                      mode === "follow-up"
                        ? !followUpAnswer.trim()
                        : !currentAnswer.trim()
                    }
                    className="px-8 py-3 rounded-full bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors disabled:opacity-30"
                  >
                    {mode === "follow-up"
                      ? "That's it →"
                      : currentAreaQ.cta}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      {/* ── Closing questions ─────────────────────────────────────────────── */}
      {mode === "closing-question" && currentClosingQ && (
        <div className="flex-1 flex flex-col px-8 pb-8 max-w-2xl mx-auto w-full">
          <div className="pt-4 pb-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-1">
              {currentClosingQ.area} · Closing {closingIndex + 1} of 2
            </div>
            <h1 className="font-display text-[28px] sm:text-[34px] text-ink leading-[1.15]">
              {currentClosingQ.question}
            </h1>
            <p className="mt-3 text-[13.5px] text-ink-muted italic leading-[1.6]">
              {currentClosingQ.context}
            </p>
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              rows={7}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Say it like it's real."
              autoFocus
              key={closingIndex}
              className="flex-1 w-full p-5 bg-surface border border-line rounded-xl text-[15.5px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-terracotta resize-none leading-[1.65]"
            />

            {error && (
              <p className="mt-2 text-[12px] text-sos">{error}</p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleClosingSubmit}
                disabled={!currentAnswer.trim()}
                className="px-8 py-3 rounded-full bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors disabled:opacity-30"
              >
                {currentClosingQ.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
