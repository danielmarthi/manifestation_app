import Link from "next/link";
import {
  getProfile,
  getCompletedExerciseSlugs,
  getPracticeDaysCount,
} from "../../lib/data";
import {
  PHASE_INTROS,
  getCoreExercisesByPhase,
  getExercisesByPhase,
} from "../../lib/exercises";

// Proportional widths for the arc: 5 / 7 / 7 / 14 = 33 total days
const ARC_WIDTHS = ["15%", "21%", "21%", "43%"];
const ARC_COLORS = [
  "var(--terracotta)",
  "var(--ochre)",
  "var(--gold)",
  "var(--ink-soft)",
];
const PHASE_MIN_DAYS = [5, 7, 7, 14];

export default async function PhasesPage() {
  const [profile, completedSlugs, totalDays] = await Promise.all([
    getProfile(),
    getCompletedExerciseSlugs(),
    getPracticeDaysCount(),
  ]);
  if (!profile) return null;

  const currentPhase = profile.current_phase ?? 1;
  const completedSet = new Set(completedSlugs);

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[960px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        The Journey
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        Four chapters. One direction.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-10">
        Each phase is a return to a deeper layer of the same one truth — that
        what you want is already done, and your work is to stop being the person
        who blocks it.
      </p>

      {/* Arc timeline */}
      <div className="mb-12">
        <div className="flex items-end gap-1 mb-2 h-3">
          {PHASE_INTROS.map((p, i) => {
            const isDone = p.phase < currentPhase;
            const isCurrent = p.phase === currentPhase;
            return (
              <div
                key={p.phase}
                style={{
                  width: ARC_WIDTHS[i],
                  background: isDone
                    ? ARC_COLORS[i]
                    : isCurrent
                      ? ARC_COLORS[i]
                      : "var(--line)",
                  opacity: isDone ? 0.55 : isCurrent ? 1 : 0.3,
                  height: isCurrent ? "12px" : "6px",
                  borderRadius: "3px",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>
        <div className="flex items-start gap-1">
          {PHASE_INTROS.map((p, i) => (
            <div
              key={p.phase}
              style={{ width: ARC_WIDTHS[i] }}
              className="text-[9px] text-ink-muted uppercase tracking-[0.12em] truncate"
            >
              {PHASE_MIN_DAYS[i]}d min
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-5">
        {PHASE_INTROS.map((phaseIntro, i) => {
          const isDone = phaseIntro.phase < currentPhase;
          const isCurrent = phaseIntro.phase === currentPhase;
          const isFuture = phaseIntro.phase > currentPhase;

          const exercises = getExercisesByPhase(phaseIntro.phase);
          const coreExercises = getCoreExercisesByPhase(phaseIntro.phase);
          const completedInPhase = exercises.filter((e) =>
            completedSet.has(e.slug),
          ).length;
          const coreCompletedInPhase = coreExercises.filter((e) =>
            completedSet.has(e.slug),
          ).length;

          return (
            <div
              key={phaseIntro.phase}
              className={
                "border rounded-2xl overflow-hidden transition-colors " +
                (isCurrent
                  ? "border-terracotta bg-surface"
                  : isDone
                    ? "border-line bg-surface/70"
                    : "border-line/40 bg-surface/30")
              }
            >
              {/* Left accent bar */}
              <div className="flex">
                <div
                  style={{
                    width: "4px",
                    background: ARC_COLORS[i],
                    opacity: isFuture ? 0.2 : isDone ? 0.5 : 1,
                  }}
                />
                <div className="flex-1 p-7">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span
                      className={
                        "font-display text-[34px] leading-none " +
                        (isCurrent
                          ? "text-terracotta"
                          : isDone
                            ? "text-ochre"
                            : "text-ink-muted/40")
                      }
                    >
                      {String(phaseIntro.phase).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-display text-[22px] text-ink leading-tight">
                        {phaseIntro.name}
                      </h2>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted mt-0.5">
                        {phaseIntro.minDays} days minimum
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-terracotta">
                        In progress
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-ochre">
                        Walked
                      </span>
                    )}
                  </div>

                  <p className="font-display text-[15px] text-ink-soft italic mb-5 leading-snug">
                    {phaseIntro.tagline}
                  </p>

                  {/* Exercise progress */}
                  {!isFuture && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                          Exercises
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          {completedInPhase}/{exercises.length} complete ·{" "}
                          {coreCompletedInPhase}/{coreExercises.length} core
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {exercises.map((e) => (
                          <div
                            key={e.slug}
                            title={e.title}
                            className={
                              "flex-1 h-1.5 rounded-full " +
                              (completedSet.has(e.slug)
                                ? "bg-terracotta"
                                : e.isCore
                                  ? "bg-line"
                                  : "bg-line/40")
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {(isCurrent || isDone) && (
                    <Link
                      href={`/phases/${phaseIntro.phase}`}
                      className={
                        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors " +
                        (isCurrent
                          ? "bg-terracotta text-parchment hover:bg-terracotta/90"
                          : "bg-surface-2 text-ink-soft hover:bg-line border border-line")
                      }
                    >
                      {isCurrent ? "Continue phase" : "Review phase"}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="opacity-70"
                      >
                        <path
                          d="M3 7h8M7 3l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  )}
                  {isFuture && (
                    <p className="text-[12px] text-ink-muted/60">
                      Unlocks when Phase {phaseIntro.phase - 1} is complete.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ongoing evidence note */}
      <div className="mt-8 border border-line/40 rounded-xl px-6 py-4 bg-surface/40 flex items-start gap-4">
        <span className="text-[20px] mt-0.5">📖</span>
        <div>
          <p className="text-[13px] text-ink font-medium mb-0.5">
            Evidence Journal — always open
          </p>
          <p className="text-[12px] text-ink-muted">
            The journal runs alongside all phases. Weekly AI insights generate
            every 7 active days. Milestone summaries unlock at days 7, 14, 30,
            and 42.
          </p>
          <Link
            href="/evidence"
            className="text-[12px] text-terracotta hover:underline mt-1 inline-block"
          >
            Open journal →
          </Link>
        </div>
      </div>
    </div>
  );
}
