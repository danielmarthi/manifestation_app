import Link from "next/link";
import { mockUser } from "../lib/mockUser";
import { QuickLog } from "../components/QuickLog";
import { Check, Arrow } from "../components/Icons";

export default function Dashboard() {
  const user = mockUser;
  const completed = user.todayPractice.filter((s) => s.done).length;
  const total = user.todayPractice.length;

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[980px] mx-auto">
      {/* THE ASSUMPTION */}
      <section className="mb-12">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
          My assumption — read it. Feel it. Live from it.
        </div>
        <h1 className="font-display text-[46px] sm:text-[58px] leading-[1.05] text-ink">
          "{user.assumption}"
        </h1>
        <div className="mt-5 text-[13px] text-ink-soft italic">
          {user.gapStatement}
        </div>
      </section>

      <div className="divider-line mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* TODAY'S PRACTICE */}
        <section className="md:col-span-2 bg-surface border border-line rounded-2xl p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
                Today's practice
              </div>
              <h2 className="font-display text-[22px] text-ink">
                Day {user.streak} — Morning Ritual
              </h2>
            </div>
            <Link
              href="/practice"
              className="text-[12px] text-terracotta hover:text-ink flex items-center gap-1.5"
            >
              Open <Arrow />
            </Link>
          </div>

          <div className="space-y-1.5 mb-5">
            {user.todayPractice.map((step) => (
              <div
                key={step.id}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors " +
                  (step.done ? "text-ink-muted" : "text-ink hover:bg-surface-2/60")
                }
              >
                <span
                  className={
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 " +
                    (step.done
                      ? "bg-terracotta border-terracotta text-surface"
                      : "border-line bg-background")
                  }
                >
                  {step.done && <Check />}
                </span>
                <span
                  className={
                    "text-[14px] " + (step.done ? "line-through decoration-line/70" : "")
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[12px] text-ink-soft">
            <div className="flex items-center gap-2">
              <span className="font-display text-ink text-[16px]">{completed}</span>
              <span className="text-ink-muted">/ {total} steps today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-ink text-[16px]">{user.streak}</span>
              <span className="text-ink-muted">day streak</span>
            </div>
          </div>
        </section>

        {/* CURRENT PHASE */}
        <section className="bg-surface border border-line rounded-2xl p-7">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
            Current chapter
          </div>
          <div className="font-display text-[15px] text-ink-muted mb-1">
            Phase {user.currentPhase} of 5
          </div>
          <h2 className="font-display text-[22px] text-ink leading-tight mb-5">
            {user.currentPhaseName}
          </h2>

          <div className="space-y-2 mb-4">
            {[
              "The Honest Audit",
              "The Clearing",
              "The Identity Blueprint",
              "The Practice Stack",
              "The Evidence Journal",
            ].map((name, i) => {
              const num = i + 1;
              const done = num < user.currentPhase;
              const current = num === user.currentPhase;
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

      {/* QUICK LOG */}
      <QuickLog />

      {/* RECENT EVIDENCE */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user.recentEvidence.map((e) => (
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
                <span className="text-[10px] text-ink-muted ml-auto">{e.date}</span>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-ink-soft">{e.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
