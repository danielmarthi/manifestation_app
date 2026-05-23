import { mockUser } from "../../lib/mockUser";

const phases = [
  {
    n: 1,
    name: "The Honest Audit",
    line: "You can't navigate from somewhere you won't admit you are.",
    body: "Money story · Evidence inventory · Belief map · Gap statement.",
    duration: "3–5 days of reflection",
  },
  {
    n: 2,
    name: "The Clearing",
    line: "You don't manifest what you want. You manifest what you are. So we clear what you're not.",
    body: "Forgiveness · Somatic check-in · Belief dissolution · Resistance tracker · Completion letter.",
    duration: "5–7 days",
  },
  {
    n: 3,
    name: "The Identity Blueprint",
    line: "You don't attract what you want. You attract who you are.",
    body: "Future self profile · Identity statements · As If protocol · Optional character study.",
    duration: "7 days",
  },
  {
    n: 4,
    name: "The Practice Stack",
    line: "Alignment isn't a moment. It's a daily practice of returning.",
    body: "Morning ritual · Scripting studio · 369 (opt-in) · Visualizations · Assumption lock · Inspired action · Weekly detachment.",
    duration: "Ongoing — your daily home",
  },
  {
    n: 5,
    name: "The Evidence Journal",
    line: "What you focus on expands. Build an undeniable case for your own miracle.",
    body: "Daily wins · Synchronicities · Momentum milestones · Test reframe · Weekly receiving.",
    duration: "Permanent — never closes",
  },
];

export default function PhasesPage() {
  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[920px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        The Journey
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        Five chapters. One direction.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-12">
        Each phase is a return to a deeper layer of the same one truth — that what
        you want is already done, and your work is to stop being the person who
        blocks it.
      </p>

      <div className="space-y-5">
        {phases.map((p) => {
          const isDone = p.n < mockUser.currentPhase;
          const isCurrent = p.n === mockUser.currentPhase;
          return (
            <div
              key={p.n}
              className={
                "border rounded-2xl p-7 transition-colors " +
                (isCurrent
                  ? "border-terracotta bg-surface"
                  : isDone
                    ? "border-line bg-surface/60"
                    : "border-line/60 bg-surface/40")
              }
            >
              <div className="flex items-baseline gap-4 mb-2">
                <span
                  className={
                    "font-display text-[34px] leading-none " +
                    (isCurrent
                      ? "text-terracotta"
                      : isDone
                        ? "text-ochre"
                        : "text-ink-muted")
                  }
                >
                  {String(p.n).padStart(2, "0")}
                </span>
                <h2 className="font-display text-[24px] text-ink leading-tight">
                  {p.name}
                </h2>
                {isCurrent && (
                  <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-terracotta">
                    In progress
                  </span>
                )}
                {isDone && (
                  <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-ochre">
                    Walked
                  </span>
                )}
              </div>
              <p className="font-display text-[16px] text-ink-soft italic mb-3 leading-snug">
                {p.line}
              </p>
              <p className="text-[13px] text-ink-soft mb-1">{p.body}</p>
              <p className="text-[11px] text-ink-muted uppercase tracking-[0.16em] mt-3">
                {p.duration}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
