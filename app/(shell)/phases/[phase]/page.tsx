import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProfile,
  getCompletedExerciseSlugs,
} from "../../../lib/data";
import {
  PHASE_INTROS,
  getExercisesByPhase,
  getCoreExercisesByPhase,
} from "../../../lib/exercises";

interface Props {
  params: Promise<{ phase: string }>;
}

export default async function PhaseDetailPage({ params }: Props) {
  const { phase: phaseStr } = await params;
  const phaseNum = parseInt(phaseStr, 10);

  if (isNaN(phaseNum) || phaseNum < 1 || phaseNum > 4) notFound();

  const phaseIntro = PHASE_INTROS.find((p) => p.phase === phaseNum);
  if (!phaseIntro) notFound();

  const [profile, completedSlugs] = await Promise.all([
    getProfile(),
    getCompletedExerciseSlugs(),
  ]);
  if (!profile) return null;

  const currentPhase = profile.current_phase ?? 1;
  const isLocked = phaseNum > currentPhase;
  const isCurrent = phaseNum === currentPhase;

  if (isLocked) {
    return (
      <div className="page-fade px-8 lg:px-12 py-10 max-w-[760px] mx-auto">
        <Link
          href="/phases"
          className="text-[12px] text-ink-muted hover:text-ink transition-colors mb-8 inline-flex items-center gap-1.5"
        >
          ← Back to phases
        </Link>
        <div className="border border-line/40 rounded-2xl p-10 text-center">
          <p className="font-display text-[28px] text-ink mb-3">
            Phase {phaseNum} — {phaseIntro.name}
          </p>
          <p className="text-[14px] text-ink-muted">
            This phase unlocks when Phase {phaseNum - 1} is complete.
          </p>
        </div>
      </div>
    );
  }

  const exercises = getExercisesByPhase(phaseNum);
  const coreExercises = getCoreExercisesByPhase(phaseNum);
  const completedSet = new Set(completedSlugs);

  const completedCount = exercises.filter((e) => completedSet.has(e.slug)).length;
  const coreCount = coreExercises.filter((e) => completedSet.has(e.slug)).length;
  const allCoreComplete = coreCount === coreExercises.length;

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[760px] mx-auto">
      <Link
        href="/phases"
        className="text-[12px] text-ink-muted hover:text-ink transition-colors mb-8 inline-flex items-center gap-1.5"
      >
        ← All phases
      </Link>

      {/* Phase header */}
      <div className="mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Phase {phaseNum} of 4
        </span>
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-2">
        {phaseIntro.name}
      </h1>
      <p className="font-display text-[17px] text-ink-soft italic mb-8 leading-snug">
        {phaseIntro.tagline}
      </p>

      {/* Intro text */}
      <div className="bg-surface border border-line rounded-2xl p-7 mb-8">
        <p className="text-[14px] text-ink-soft leading-[1.75] whitespace-pre-line">
          {phaseIntro.intro}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[20px] text-ink">Exercises</h2>
        <span className="text-[12px] text-ink-muted">
          {completedCount}/{exercises.length} complete · {coreCount}/
          {coreExercises.length} core
        </span>
      </div>

      {/* Exercise list */}
      <div className="space-y-3 mb-10">
        {exercises.map((ex) => {
          const done = completedSet.has(ex.slug);
          const isAccessible = !isLocked;

          return (
            <Link
              key={ex.slug}
              href={isAccessible ? `/phases/${phaseNum}/${ex.slug}` : "#"}
              className={
                "block border rounded-xl px-6 py-4 transition-all " +
                (done
                  ? "border-ochre/40 bg-ochre/5 hover:bg-ochre/10"
                  : isCurrent
                    ? "border-line bg-surface hover:border-terracotta/50 hover:bg-surface"
                    : "border-line bg-surface/60 hover:bg-surface/80")
              }
            >
              <div className="flex items-start gap-4">
                {/* Completion indicator */}
                <div
                  className={
                    "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " +
                    (done
                      ? "border-ochre bg-ochre"
                      : ex.isCore
                        ? "border-terracotta/50"
                        : "border-line")
                  }
                >
                  {done && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="var(--parchment)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-medium text-[14px] text-ink">
                      {ex.title}
                    </span>
                    {ex.isCore && !done && (
                      <span className="text-[9px] uppercase tracking-[0.16em] text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded">
                        Core
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-ink-muted leading-snug">
                    {ex.subtitle}
                  </p>
                </div>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-ink-muted/50 flex-shrink-0 mt-1"
                >
                  <path
                    d="M3 7h8M7 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Phase readiness / advance */}
      {isCurrent && (
        <div
          className={
            "border rounded-2xl p-6 " +
            (allCoreComplete
              ? "border-terracotta/50 bg-terracotta/5"
              : "border-line bg-surface/40")
          }
        >
          {allCoreComplete ? (
            <>
              <p className="font-display text-[18px] text-ink mb-1">
                All core exercises complete.
              </p>
              <p className="text-[13px] text-ink-soft mb-4">
                {phaseNum === 4
                  ? "Complete the program when you're ready."
                  : `You're ready to move to Phase ${phaseNum + 1}.`}
              </p>
              <Link
                href={
                  phaseNum === 4
                    ? "/phases/complete"
                    : `/phases/${phaseNum + 1}`
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-parchment rounded-xl text-[13px] font-medium hover:bg-terracotta/90 transition-colors"
              >
                {phaseNum === 4 ? "Complete the program" : `Begin Phase ${phaseNum + 1}`}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8M7 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-[16px] text-ink mb-1">
                Phase in progress
              </p>
              <p className="text-[13px] text-ink-muted">
                Complete all {coreExercises.length} core exercises to unlock
                Phase {phaseNum + 1}.{" "}
                {coreExercises.length - coreCount} remaining.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
