"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateMilestoneSummary } from "../../actions/phases";

interface Props {
  firstName?: string;
  startDate: string | null;
  journeyDay: number;
  practicedDays: number;
  streak: number;
  totalEntries: number;
  completedDates: string[];
  partialDates: string[];
  evidenceCounts: Record<string, number>;
  milestoneSummaries: { day_marker: number; content: string }[];
}

const MILESTONE_DAYS = [7, 14, 30, 42] as const;
type MilestoneDay = (typeof MILESTONE_DAYS)[number];
const MILESTONE_LABELS: Record<MilestoneDay, string> = {
  7: "First week complete",
  14: "Two weeks in",
  30: "One month",
  42: "Six weeks",
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CalendarClient({
  firstName,
  startDate,
  journeyDay,
  practicedDays,
  streak,
  totalEntries,
  completedDates,
  partialDates,
  evidenceCounts,
  milestoneSummaries,
}: Props) {
  const router = useRouter();
  const today = new Date();
  const todayKey = ymd(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [summaries, setSummaries] = useState(milestoneSummaries);
  const [generating, setGenerating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const completedSet = new Set(completedDates);
  const partialSet = new Set(partialDates);
  const startKey = startDate ?? todayKey;

  // Build the month grid (Sunday-first).
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDow = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  const reached = MILESTONE_DAYS.filter((d) => practicedDays >= d);
  const nextUngeneratedMilestone = reached.find(
    (d) => !summaries.find((s) => s.day_marker === d),
  );

  function handleGenerateMilestone(day: MilestoneDay) {
    setGenerating(day);
    startTransition(async () => {
      const result = await generateMilestoneSummary(day);
      if (result.ok && result.content) {
        setSummaries((prev) => [
          ...prev,
          { day_marker: day, content: result.content! },
        ]);
      }
      setGenerating(null);
    });
  }

  const isFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[960px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        The Journey
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        Day {journeyDay} of your becoming.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-10">
        Every filled day is proof you returned. Seeing the days accumulate is its
        own kind of evidence — for the part of you that forgets how far you've come.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Journey day", value: journeyDay },
          { label: "Days practiced", value: practicedDays },
          { label: "Current streak", value: streak },
          { label: "Entries logged", value: totalEntries },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-line rounded-xl px-5 py-4">
            <div className="font-display text-[30px] text-ink leading-none mb-1">
              {s.value}
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <section className="bg-surface border border-line rounded-2xl p-6 mb-10">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:bg-surface-2 transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 className="font-display text-[20px] text-ink">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            disabled={isFutureMonth}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] uppercase tracking-[0.1em] text-ink-muted py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            const key = ymd(date);
            const isToday = key === todayKey;
            const isCompleted = completedSet.has(key);
            const isPartial = partialSet.has(key);
            const evidence = evidenceCounts[key] ?? 0;
            const beforeStart = key < startKey;
            const inFuture = key > todayKey;
            const clickable = !beforeStart && !inFuture;

            return (
              <button
                key={key}
                disabled={!clickable}
                onClick={() => router.push(`/calendar/${key}`)}
                className={
                  "relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-[13px] " +
                  (beforeStart || inFuture
                    ? "text-ink-muted/30 cursor-default"
                    : isCompleted
                      ? "bg-terracotta text-parchment hover:opacity-90"
                      : isPartial
                        ? "border border-terracotta/50 text-ink hover:bg-surface-2"
                        : "border border-line text-ink-soft hover:bg-surface-2") +
                  (isToday ? " ring-2 ring-ochre ring-offset-1 ring-offset-surface" : "")
                }
              >
                <span>{date.getDate()}</span>
                {evidence > 0 && (
                  <span
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{
                      background: isCompleted ? "var(--parchment)" : "var(--gold)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-line/60 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-terracotta" /> Ritual complete
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-terracotta/50" /> Started
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Evidence logged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-line ring-2 ring-ochre" /> Today
          </span>
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-4">
        <h2 className="font-display text-[20px] text-ink mb-4">Momentum milestones</h2>
        <div className="bg-surface border border-line rounded-2xl p-6 mb-4">
          <div className="flex justify-between items-end mb-5">
            {MILESTONE_DAYS.map((day) => {
              const hit = practicedDays >= day;
              return (
                <div key={day} className="flex flex-col items-center text-center flex-1 px-1">
                  <span className={"h-2.5 w-2.5 rounded-full mb-2 " + (hit ? "bg-terracotta" : "bg-line")} />
                  <span className={"font-display text-[16px] mb-0.5 " + (hit ? "text-ink" : "text-ink-muted")}>
                    Day {day}
                  </span>
                  <span className={"text-[10.5px] leading-snug " + (hit ? "text-ink-soft" : "text-ink-muted")}>
                    {MILESTONE_LABELS[day]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (practicedDays / 42) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-ink-muted mt-2 text-center">
            {practicedDays} of 42 practiced days
          </p>
        </div>

        {/* Generate next milestone */}
        {nextUngeneratedMilestone && (
          <div className="border border-gold/40 bg-gold/5 rounded-2xl p-6 mb-4 flex items-start justify-between gap-6">
            <div>
              <p className="font-display text-[16px] text-ink mb-1">
                Day {nextUngeneratedMilestone} reached
              </p>
              <p className="text-[13px] text-ink-muted">
                {firstName ? `${firstName}, your` : "Your"} reflection is ready to be written.
              </p>
            </div>
            <button
              onClick={() => handleGenerateMilestone(nextUngeneratedMilestone)}
              disabled={generating !== null || isPending}
              className="flex-shrink-0 px-4 py-2.5 bg-gold/20 border border-gold/40 text-ink rounded-xl text-[12.5px] font-medium hover:bg-gold/30 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {generating === nextUngeneratedMilestone ? "Writing…" : "Generate reflection"}
            </button>
          </div>
        )}

        {/* Existing milestone summaries */}
        {summaries
          .sort((a, b) => a.day_marker - b.day_marker)
          .map((m) => (
            <div key={m.day_marker} className="border border-gold/30 bg-gold/5 rounded-2xl p-7 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
                  Day {m.day_marker} — {MILESTONE_LABELS[m.day_marker as MilestoneDay]}
                </span>
              </div>
              <div className="space-y-3">
                {m.content.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[14px] text-ink leading-[1.8]">{p}</p>
                ))}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
