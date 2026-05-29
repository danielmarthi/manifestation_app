import Link from "next/link";
import {
  getProfile,
  getRecentEvidence,
  getTodayPracticeLog,
  getJourneyState,
} from "../../lib/data";
import { QuickLog } from "../../components/QuickLog";
import { Check, Arrow } from "../../components/Icons";

const RITUAL_STEPS = [
  { id: "breathe", label: "Breathe — three breaths, body scan" },
  { id: "be",      label: "Be — read today's identity statement aloud" },
  { id: "see",     label: "See — today's visualization (90s)" },
  { id: "thank",   label: "Thank — one gratitude in advance" },
  { id: "assume",  label: "Assume — read & feel the assumption" },
  { id: "note",    label: "Note — one honest line about today" },
] as const;

const PHASES = [
  "Awakening",
  "The Clearing",
  "Identity Blueprint",
  "Living As",
] as const;

export default async function Today() {
  const [profile, recentEvidence, todayLog, journey] = await Promise.all([
    getProfile(),
    getRecentEvidence(3),
    getTodayPracticeLog(),
    getJourneyState(),
  ]);
  if (!profile) return null;

  const stepsCompleted = (todayLog?.steps_completed ?? {}) as Record<string, boolean>;
  const completed = RITUAL_STEPS.filter((s) => stepsCompleted[s.id]).length;
  const total = RITUAL_STEPS.length;
  const dayComplete = !!todayLog?.completed_at;

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[980px] mx-auto">
      <section className="mb-12">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
          My assumption — read it. Feel it. Live from it.
        </div>
        <h1 className="font-display text-[46px] sm:text-[58px] leading-[1.05] text-ink">
          “{profile.assumption ?? "It is already done."}”
        </h1>
        {profile.gap_statement && (
          <div className="mt-5 text-[13px] text-ink-soft italic">
            {profile.gap_statement}
          </div>
        )}
      </section>

      <div className="divider-line mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <section className="md:col-span-2 bg-surface border border-line rounded-2xl p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
                Today's practice
              </div>
              <h2 className="font-display text-[22px] text-ink">
                Day {journey.journeyDay} — Morning Ritual
              </h2>
              <div className="text-[11px] text-ink-muted mt-0.5">
                {journey.practicedDays} practiced · {dayComplete ? "complete today" : "not yet today"}
              </div>
            </div>
            <Link
              href="/practice"
              className="text-[12px] text-terracotta hover:text-ink flex items-center gap-1.5"
            >
              Open <Arrow />
            </Link>
          </div>

          <div className="space-y-1.5 mb-5">
            {RITUAL_STEPS.map((step) => {
              const done = !!stepsCompleted[step.id];
              return (
                <div
                  key={step.id}
                  className={
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors " +
                    (done ? "text-ink-muted" : "text-ink hover:bg-surface-2/60")
                  }
                >
                  <span
                    className={
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 " +
                      (done
                        ? "bg-terracotta border-terracotta text-surface"
                        : "border-line bg-background")
                    }
                  >
                    {done && <Check />}
                  </span>
                  <span
                    className={
                      "text-[14px] " +
                      (done ? "line-through decoration-line/70" : "")
                    }
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[12px] text-ink-soft">
            <div className="flex items-center gap-2">
              <span className="font-display text-ink text-[16px]">{completed}</span>
              <span className="text-ink-muted">/ {total} steps today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-ink text-[16px]">{journey.streak}</span>
              <span className="text-ink-muted">day streak</span>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-line rounded-2xl p-7">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
            Current chapter
          </div>
          <div className="font-display text-[15px] text-ink-muted mb-1">
            Phase {profile.current_phase} of 4
          </div>
          <h2 className="font-display text-[22px] text-ink leading-tight mb-5">
            {PHASES[profile.current_phase - 1]}
          </h2>

          <div className="space-y-2 mb-4">
            {PHASES.map((name, i) => {
              const num = i + 1;
              const done = num < profile.current_phase;
              const current = num === profile.current_phase;
              return (
                <div key={name} className="flex items-center gap-3">
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (done
                        ? "bg-ochre"
                        : current
                          ? "bg-terracotta"
                          : "bg-line")
                    }
                  />
                  <span
                    className={
                      "text-[12.5px] " +
                      (current
                        ? "text-ink"
                        : done
                          ? "text-ink-soft"
                          : "text-ink-muted")
                    }
                  >
                    {name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[11.5px] text-ink-muted leading-relaxed">
            Next milestone: 7 consecutive morning rituals → practice is a habit.
          </div>
        </section>
      </div>

      <QuickLog />

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
              Recent evidence
            </div>
            <h2 className="font-display text-[22px] text-ink">The case is accumulating</h2>
          </div>
          <Link
            href="/evidence"
            className="text-[12px] text-terracotta hover:text-ink flex items-center gap-1.5"
          >
            Open journal <Arrow />
          </Link>
        </div>

        {recentEvidence.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl p-7 text-center">
            <p className="text-[13px] text-ink-muted">
              Nothing logged yet. Open the Quick Log above and start training the
              eye. The first entry is always the hardest.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentEvidence.map((e) => (
              <div
                key={e.id}
                className="bg-surface border border-line rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background:
                        e.kind === "synchronicity"
                          ? "var(--gold)"
                          : e.kind === "win"
                            ? "var(--terracotta)"
                            : e.kind === "receiving"
                              ? "var(--ochre)"
                              : "var(--ink-muted)",
                    }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    {e.kind}
                  </span>
                  <span className="text-[10px] text-ink-muted ml-auto">
                    {formatRelative(e.occurred_at)}
                  </span>
                </div>
                <p className="text-[13.5px] leading-[1.55] text-ink-soft">{e.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return `${Math.floor(days / 30)} mo ago`;
}
