"use client";

import { useState, useTransition } from "react";
import type { EvidenceEntryRow, WeeklyInsightRow, MilestoneSummaryRow } from "../../lib/supabase/types";
import { generateWeeklyInsight, generateMilestoneSummary } from "../../actions/phases";

interface Props {
  entries: EvidenceEntryRow[];
  weeklyInsights: WeeklyInsightRow[];
  milestoneSummaries: MilestoneSummaryRow[];
  totalDays: number;
  streak: number;
  firstName?: string;
}

const MILESTONE_DAYS = [7, 14, 30, 42] as const;
type MilestoneDay = (typeof MILESTONE_DAYS)[number];

const MILESTONE_LABELS: Record<MilestoneDay, string> = {
  7: "First week complete",
  14: "Two weeks in",
  30: "One month",
  42: "Six weeks",
};

const colorByKind: Record<string, string> = {
  win: "var(--terracotta)",
  synchronicity: "var(--gold)",
  receiving: "var(--ochre)",
  resistance: "var(--ink-muted)",
};

const labelByKind: Record<string, string> = {
  win: "Win",
  synchronicity: "Synchronicity",
  receiving: "Receiving",
  resistance: "Resistance noticed",
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}wk ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function EvidencePageClient({
  entries,
  weeklyInsights,
  milestoneSummaries,
  totalDays,
  streak,
  firstName,
}: Props) {
  const [insights, setInsights] = useState<WeeklyInsightRow[]>(weeklyInsights);
  const [milestones, setMilestones] = useState<MilestoneSummaryRow[]>(milestoneSummaries);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [generatingMilestone, setGeneratingMilestone] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Which milestones the user has reached (totalDays based)
  const reachedMilestones = MILESTONE_DAYS.filter((d) => totalDays >= d);
  const unlockedMilestoneWithoutSummary = reachedMilestones.find(
    (d) => !milestones.find((m) => m.day_marker === d),
  );

  // Current week number (totalDays / 7, floor)
  const currentWeek = Math.max(1, Math.floor(totalDays / 7));
  const hasCurrentWeekInsight = insights.some((i) => i.week_number === currentWeek);
  const canGenerateInsight = totalDays >= 7 && !hasCurrentWeekInsight;

  function handleGenerateInsight() {
    setGeneratingInsight(true);
    // Pass last 7 days of entries (approximation by date)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentEntries = entries
      .filter((e) => e.occurred_at >= sevenDaysAgo)
      .map((e) => ({ kind: e.kind, text: e.text, occurred_at: e.occurred_at }));

    startTransition(async () => {
      const result = await generateWeeklyInsight(currentWeek, recentEntries);
      if (result.ok && result.content) {
        setInsights((prev) => [
          { id: `new-${currentWeek}`, user_id: "", week_number: currentWeek, content: result.content!, created_at: new Date().toISOString() },
          ...prev,
        ]);
      }
      setGeneratingInsight(false);
    });
  }

  function handleGenerateMilestone(day: MilestoneDay) {
    setGeneratingMilestone(day);
    startTransition(async () => {
      const result = await generateMilestoneSummary(day);
      if (result.ok && result.content) {
        setMilestones((prev) => [
          ...prev,
          { id: `new-${day}`, user_id: "", day_marker: day, content: result.content!, created_at: new Date().toISOString() },
        ]);
      }
      setGeneratingMilestone(null);
    });
  }

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        Evidence Journal
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        The case for your own miracle.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-10">
        What you focus on expands. This journal trains the eye and accumulates
        the proof — especially for the part of you that still believes "it never
        works."
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Active days", value: totalDays },
          { label: "Current streak", value: streak },
          { label: "Entries logged", value: entries.length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface border border-line rounded-xl px-5 py-4"
          >
            <div className="font-display text-[32px] text-ink leading-none mb-1">
              {s.value}
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Milestone summaries */}
      {reachedMilestones.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-[20px] text-ink mb-4">
            Milestone reflections
          </h2>

          {/* Unlocked but no summary yet */}
          {unlockedMilestoneWithoutSummary && (
            <div className="border border-gold/40 bg-gold/5 rounded-2xl p-6 mb-4 flex items-start justify-between gap-6">
              <div>
                <p className="font-display text-[16px] text-ink mb-1">
                  Day {unlockedMilestoneWithoutSummary} —{" "}
                  {MILESTONE_LABELS[unlockedMilestoneWithoutSummary]}
                </p>
                <p className="text-[13px] text-ink-muted">
                  {firstName ? `${firstName}, you've` : "You've"} reached this
                  milestone. Generate your personalized reflection.
                </p>
              </div>
              <button
                onClick={() =>
                  handleGenerateMilestone(unlockedMilestoneWithoutSummary)
                }
                disabled={generatingMilestone !== null || isPending}
                className="flex-shrink-0 px-4 py-2.5 bg-gold/20 border border-gold/40 text-ink rounded-xl text-[12.5px] font-medium hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {generatingMilestone === unlockedMilestoneWithoutSummary
                  ? "Generating..."
                  : "Generate reflection"}
              </button>
            </div>
          )}

          {/* Existing milestones */}
          {milestones.map((m) => (
            <div
              key={m.id}
              className="border border-gold/30 bg-gold/5 rounded-2xl p-7 mb-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--gold)" }}
                />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
                  Day {m.day_marker} — {MILESTONE_LABELS[m.day_marker as MilestoneDay]}
                </span>
              </div>
              <div className="space-y-3">
                {m.content.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[14px] text-ink leading-[1.8]">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Weekly AI insights */}
      {(insights.length > 0 || canGenerateInsight) && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[20px] text-ink">
              Weekly pattern readings
            </h2>
            {canGenerateInsight && (
              <button
                onClick={handleGenerateInsight}
                disabled={generatingInsight || isPending}
                className="px-4 py-2 bg-surface border border-line text-ink-soft rounded-xl text-[12px] hover:bg-surface-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingInsight ? "Reading patterns..." : `Generate Week ${currentWeek} insight`}
              </button>
            )}
          </div>

          {insights.length === 0 && !canGenerateInsight && totalDays > 0 && (
            <div className="bg-surface border border-line rounded-xl p-6 text-center">
              <p className="text-[13px] text-ink-muted">
                Weekly pattern readings unlock at 7 active days. You're at{" "}
                {totalDays} — keep going.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="border border-line bg-surface rounded-2xl p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                    Week {insight.week_number} reading
                  </span>
                </div>
                <div className="space-y-3">
                  {insight.content.split("\n\n").map((p, i) => (
                    <p key={i} className="text-[14px] text-ink-soft leading-[1.8]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Milestone progress bar */}
      <section className="mb-10">
        <h2 className="font-display text-[20px] text-ink mb-4">
          Momentum milestones
        </h2>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex justify-between items-end">
            {MILESTONE_DAYS.map((day) => {
              const reached = totalDays >= day;
              return (
                <div
                  key={day}
                  className="flex flex-col items-center text-center flex-1 px-2"
                >
                  <span
                    className={
                      "h-2.5 w-2.5 rounded-full mb-2 transition-colors " +
                      (reached ? "bg-terracotta" : "bg-line")
                    }
                  />
                  <span
                    className={
                      "font-display text-[18px] mb-1 " +
                      (reached ? "text-ink" : "text-ink-muted")
                    }
                  >
                    Day {day}
                  </span>
                  <span
                    className={
                      "text-[11px] leading-snug " +
                      (reached ? "text-ink-soft" : "text-ink-muted")
                    }
                  >
                    {MILESTONE_LABELS[day]}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress fill */}
          <div className="mt-6 h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalDays / 42) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-ink-muted mt-2 text-center">
            {totalDays} of 42 active days
          </p>
        </div>
      </section>

      {/* All entries */}
      <section>
        <h2 className="font-display text-[20px] text-ink mb-1">All entries</h2>
        <p className="text-[12px] text-ink-muted mb-5">
          {entries.length} signal{entries.length === 1 ? "" : "s"} ·
          training the eye by accumulation
        </p>

        {entries.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl p-7 text-center">
            <p className="text-[13.5px] text-ink-soft mb-1">
              The journal is quiet — for now.
            </p>
            <p className="text-[12px] text-ink-muted">
              Log a small win or synchronicity from the dashboard. The eye is
              trained by use, not by waiting.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div
                key={e.id}
                className="bg-surface border border-line rounded-xl px-5 py-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: colorByKind[e.kind] }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    {labelByKind[e.kind] ?? e.kind}
                  </span>
                  <span className="text-[11px] text-ink-muted ml-auto">
                    {formatRelative(e.occurred_at)}
                  </span>
                </div>
                <p className="text-[14px] text-ink leading-[1.55]">{e.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
