"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completePracticeStep } from "../actions/practice";

type StepId = "breathe" | "be" | "see" | "thank" | "assume" | "note";

interface Step {
  id: StepId;
  title: string;
  cue: string;
  body: React.ReactNode;
  cta: string;
}

interface PracticeFlowProps {
  assumption: string;
  journeyDay: number;
  practicedDays: number;
  streak: number;
  identityStatements: string[];
  stepsAlreadyDone: Record<string, boolean>;
  gratitudeAlready: string;
  dailyNoteAlready: string;
  moodAlready: string;
  futureSelfBody: string[];
}

const FALLBACK_VISUALIZATION = [
  "It's a Tuesday morning, six months from now. You go through your day and notice that the old knot has gone quiet.",
  "You make a decision today as the version of you who already has what you wanted. Notice how unhurried it is.",
  "You hold an image of yourself walking through the life you've been writing toward. Stay there for a slow breath.",
];

const STEP_ORDER: StepId[] = ["breathe", "be", "see", "thank", "assume", "note"];
const STEP_LABELS: Record<StepId, string> = {
  breathe: "Breathe",
  be: "Be",
  see: "See",
  thank: "Thank",
  assume: "Assume",
  note: "Note",
};

const MOODS = [
  { id: "contracted", label: "Contracted" },
  { id: "tender", label: "Tender" },
  { id: "steady", label: "Steady" },
  { id: "open", label: "Open" },
  { id: "expansive", label: "Expansive" },
];

export function PracticeFlow({
  assumption,
  journeyDay,
  practicedDays,
  streak,
  identityStatements,
  stepsAlreadyDone,
  gratitudeAlready,
  dailyNoteAlready,
  moodAlready,
  futureSelfBody,
}: PracticeFlowProps) {
  const router = useRouter();
  const completedCount = STEP_ORDER.filter((s) => stepsAlreadyDone[s]).length;
  const allDoneInitially = completedCount === STEP_ORDER.length;
  const partiallyDone = completedCount > 0 && !allDoneInitially;

  // overview = orientation screen; flow = stepping through; done = completion.
  const [mode, setMode] = useState<"overview" | "flow" | "done">(
    allDoneInitially ? "done" : partiallyDone ? "overview" : "flow",
  );
  const [i, setI] = useState(firstIncomplete(stepsAlreadyDone));
  const [gratitude, setGratitude] = useState(gratitudeAlready);
  const [dailyNote, setDailyNote] = useState(dailyNoteAlready);
  const [mood, setMood] = useState(moodAlready);
  const [localDone, setLocalDone] = useState<Record<string, boolean>>(stepsAlreadyDone);
  const [isPending, startTransition] = useTransition();

  const todaysStatement = identityStatements.length
    ? identityStatements[new Date().getDate() % identityStatements.length]
    : "I am the kind of person life is moving toward.";

  const visualization = futureSelfBody.length
    ? futureSelfBody.slice(0, 3)
    : FALLBACK_VISUALIZATION;

  const steps: Step[] = [
    {
      id: "breathe",
      title: "Breathe",
      cue: "Three slow breaths. Notice where you feel today.",
      body: (
        <div className="flex flex-col items-center py-8">
          <div className="relative w-44 h-44 mb-6">
            <div
              className="absolute inset-0 rounded-full breath-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(212,168,73,0.7) 0%, rgba(179,90,58,0.25) 55%, transparent 80%)",
              }}
            />
          </div>
          <p className="text-[13px] text-ink-muted">
            Inhale — hold — release. Three times.
          </p>
        </div>
      ),
      cta: "I'm here →",
    },
    {
      id: "be",
      title: "Be",
      cue: "Today's identity statement. Read it aloud.",
      body: (
        <div className="py-10 text-center">
          <p className="font-display text-[36px] sm:text-[44px] text-ink leading-[1.1]">
            “{todaysStatement}”
          </p>
          <p className="mt-6 text-[12px] text-ink-muted">
            Does it feel like expansion or performance? Stay with the lines that expand.
          </p>
        </div>
      ),
      cta: "I read it aloud →",
    },
    {
      id: "see",
      title: "See",
      cue: "Today's visualization — read slowly. Hold the image.",
      body: (
        <div className="py-8 max-w-xl mx-auto">
          <div className="space-y-4 font-display text-[18px] text-ink-soft leading-[1.65]">
            {visualization.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-surface-2/70 border border-line">
            <p className="text-[12px] text-ink-muted mb-1">Body check</p>
            <p className="text-[13.5px] text-ink-soft">
              Where do you feel this in your body? Stay there for 30 seconds.
            </p>
          </div>
        </div>
      ),
      cta: "I felt it →",
    },
    {
      id: "thank",
      title: "Thank",
      cue: "Gratitude in advance — as if it's already arrived.",
      body: (
        <div className="py-8 max-w-lg mx-auto">
          <label className="block text-[12px] text-ink-muted mb-2">
            Today I'm grateful for…
          </label>
          <textarea
            rows={4}
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Thank you for…"
            className="w-full p-4 bg-background border border-line rounded-lg text-[15px] focus:outline-none focus:border-terracotta resize-none"
          />
          <p className="mt-3 text-[11.5px] text-ink-muted">
            Present tense. As if it's already true. Specific.
          </p>
        </div>
      ),
      cta: "Logged →",
    },
    {
      id: "assume",
      title: "Assume",
      cue: "Your one sentence. Read it. Feel it. Live from it today.",
      body: (
        <div className="py-12 text-center max-w-xl mx-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-4">
            My assumption
          </div>
          <p className="font-display text-[34px] sm:text-[42px] text-ink leading-[1.1]">
            “{assumption}”
          </p>
          <p className="mt-8 text-[13px] text-ink-soft">
            Close your eyes. Say it. Notice if it lands as fact, not wish.
          </p>
        </div>
      ),
      cta: "It is done. ✓",
    },
    {
      id: "note",
      title: "Note",
      cue: "Today's note. One honest line before you carry on.",
      body: (
        <div className="py-8 max-w-lg mx-auto">
          <label className="block text-[12px] text-ink-muted mb-2">
            What's true right now? What shifted today?
          </label>
          <textarea
            rows={5}
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
            placeholder="Write freely — this becomes part of your record…"
            className="w-full p-4 bg-background border border-line rounded-lg text-[15px] focus:outline-none focus:border-terracotta resize-none"
          />
          <p className="mt-5 mb-2 text-[12px] text-ink-muted">
            How are you arriving today?
          </p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(mood === m.id ? "" : m.id)}
                className={
                  "px-3 py-1.5 rounded-full text-[12.5px] border transition-colors " +
                  (mood === m.id
                    ? "bg-ink text-surface border-ink"
                    : "bg-background border-line text-ink-soft hover:border-ink-muted")
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ),
      cta: "Complete the day ✓",
    },
  ];

  function persist(stepId: StepId) {
    return completePracticeStep({
      step: stepId,
      done: true,
      gratitude: stepId === "thank" ? gratitude : undefined,
      dailyNote: stepId === "note" ? dailyNote : undefined,
      mood: stepId === "note" ? mood : undefined,
    });
  }

  function advance() {
    const current = steps[i];
    startTransition(async () => {
      await persist(current.id);
      setLocalDone((d) => ({ ...d, [current.id]: true }));
      if (i < steps.length - 1) setI(i + 1);
      else setMode("done");
    });
  }

  // ─── Overview / orientation screen ──────────────────────────────────────────
  if (mode === "overview") {
    const resumeIndex = firstIncomplete(localDone);
    return (
      <div className="page-fade min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
            Day {journeyDay} · {practicedDays} practiced
          </div>
          <h1 className="font-display text-[30px] text-ink leading-tight mb-1">
            You're partway through.
          </h1>
          <p className="text-[13.5px] text-ink-soft mb-7">
            Pick up where you left off, or begin again from the top.
          </p>

          <div className="space-y-1.5 mb-7">
            {steps.map((s, n) => {
              const done = !!localDone[s.id];
              const isResume = n === resumeIndex;
              return (
                <div
                  key={s.id}
                  className={
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg " +
                    (isResume ? "bg-surface-2/70 border border-line" : "")
                  }
                >
                  <span
                    className={
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] " +
                      (done
                        ? "bg-terracotta border-terracotta text-surface"
                        : "border-line text-ink-muted")
                    }
                  >
                    {done ? "✓" : n + 1}
                  </span>
                  <span
                    className={
                      "text-[14px] " +
                      (done ? "text-ink-muted line-through decoration-line/70" : "text-ink")
                    }
                  >
                    {s.title}
                  </span>
                  {isResume && (
                    <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-terracotta">
                      You are here
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setI(resumeIndex);
                setMode("flow");
              }}
              className="flex-1 px-5 py-3 rounded-full bg-ink text-surface text-[13.5px] hover:bg-ink-soft transition-colors"
            >
              Resume at {steps[resumeIndex]?.title}
            </button>
            <button
              onClick={() => {
                setI(0);
                setMode("flow");
              }}
              className="px-5 py-3 rounded-full border border-line text-[13.5px] text-ink-soft hover:bg-surface-2 transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Completion screen ──────────────────────────────────────────────────────
  if (mode === "done") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 page-fade">
        <div className="text-center max-w-md">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full candle-glow"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, #e6c47a 0%, #d4a849 30%, #b35a3a 70%, transparent 100%)",
                boxShadow: "0 0 60px rgba(212,168,73,0.4)",
              }}
            />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
            Day {journeyDay} complete
          </div>
          <h1 className="font-display text-[32px] text-ink mb-4 leading-tight">
            Quietly, you returned.
          </h1>
          <p className="text-[14px] text-ink-soft leading-relaxed mb-2">
            The practice doesn't make abundance arrive. It makes you available to
            receive what's already on its way.
          </p>
          <p className="text-[12px] text-ink-muted">
            {practicedDays + (allDoneInitially ? 0 : 1)} days practiced ·{" "}
            {streak}-day streak
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => router.push("/today")}
              className="px-6 py-2.5 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
            >
              Carry it into the day
            </button>
            <button
              onClick={() => router.push("/calendar")}
              className="px-6 py-2.5 rounded-full border border-line text-[13px] text-ink-soft hover:bg-surface-2 transition-colors"
            >
              See the record
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step flow ──────────────────────────────────────────────────────────────
  const step = steps[i];

  return (
    <div className="page-fade min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Step rail — always visible orientation */}
      <div className="px-8 pt-8 pb-2">
        <div className="flex gap-1.5 mb-2">
          {steps.map((_, n) => (
            <span
              key={n}
              className={
                "h-1 rounded-full flex-1 transition-colors " +
                (n < i ? "bg-terracotta" : n === i ? "bg-terracotta/60" : "bg-line")
              }
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-[10px] uppercase tracking-[0.14em]">
            {steps.map((s, n) => (
              <span
                key={s.id}
                className={
                  n === i
                    ? "text-terracotta"
                    : localDone[s.id]
                      ? "text-ink-soft"
                      : "text-ink-muted/50"
                }
              >
                {STEP_LABELS[s.id]}
              </span>
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Day {journeyDay}
          </span>
        </div>
      </div>

      <div className="px-8 pt-6 max-w-2xl mx-auto w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
          Step {i + 1} of {steps.length} — {step.title}
        </div>
        <h1 className="font-display text-[26px] text-ink leading-tight">{step.cue}</h1>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-2xl">{step.body}</div>
      </div>

      <div className="px-8 py-6 border-t border-line/60 flex items-center justify-between max-w-3xl mx-auto w-full">
        <button
          onClick={() => i > 0 && setI(i - 1)}
          disabled={i === 0 || isPending}
          className="text-[12px] text-ink-muted hover:text-ink-soft disabled:opacity-30"
        >
          ← back
        </button>
        <button
          onClick={advance}
          disabled={isPending}
          className="px-6 py-2.5 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {isPending ? "saving…" : step.cta}
        </button>
      </div>
    </div>
  );
}

function firstIncomplete(stepsDone: Record<string, boolean>): number {
  for (let i = 0; i < STEP_ORDER.length; i++) {
    if (!stepsDone[STEP_ORDER[i]]) return i;
  }
  return STEP_ORDER.length - 1;
}
