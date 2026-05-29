"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { EvidenceEntryRow, WeeklyInsightRow } from "../../lib/supabase/types";
import { generateWeeklyInsight } from "../../actions/phases";
import { QuickLog } from "../../components/QuickLog";

interface Props {
  entries: EvidenceEntryRow[];
  weeklyInsights: WeeklyInsightRow[];
  totalDays: number;
  firstName?: string;
}

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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "win", label: "Wins" },
  { id: "synchronicity", label: "Synchronicities" },
  { id: "receiving", label: "Receiving" },
  { id: "resistance", label: "Resistance" },
];

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
  totalDays,
  firstName,
}: Props) {
  const [insights, setInsights] = useState<WeeklyInsightRow[]>(weeklyInsights);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const currentWeek = Math.max(1, Math.floor(totalDays / 7));
  const hasCurrentWeekInsight = insights.some((i) => i.week_number === currentWeek);
  const canGenerateInsight = totalDays >= 7 && !hasCurrentWeekInsight;

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.kind === filter);

  function handleGenerateInsight() {
    setGenerating(true);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentEntries = entries
      .filter((e) => e.occurred_at >= sevenDaysAgo)
      .map((e) => ({ kind: e.kind, text: e.text, occurred_at: e.occurred_at }));

    startTransition(async () => {
      const result = await generateWeeklyInsight(currentWeek, recentEntries);
      if (result.ok && result.content) {
        setInsights((prev) => [
          {
            id: `new-${currentWeek}`,
            user_id: "",
            week_number: currentWeek,
            content: result.content!,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setGenerating(false);
    });
  }

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[860px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        Evidence Journal
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        The case for your own miracle.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-8">
        What you focus on expands. Every entry is proof, filed against the part
        of you that still whispers "it never works."{" "}
        <Link href="/calendar" className="text-terracotta hover:underline">
          See the timeline →
        </Link>
      </p>

      {/* Log a moment */}
      <div className="mb-10">
        <QuickLog />
      </div>

      {/* Weekly AI readings */}
      {(insights.length > 0 || canGenerateInsight) && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[20px] text-ink">Weekly pattern readings</h2>
            {canGenerateInsight && (
              <button
                onClick={handleGenerateInsight}
                disabled={generating || isPending}
                className="px-4 py-2 bg-surface border border-line text-ink-soft rounded-xl text-[12px] hover:bg-surface-2 transition-colors disabled:opacity-50"
              >
                {generating ? "Reading patterns…" : `Read Week ${currentWeek}`}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border border-line bg-surface rounded-2xl p-7">
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">
                  Week {insight.week_number} reading
                </div>
                <div className="space-y-3">
                  {insight.content.split("\n\n").map((p, i) => (
                    <p key={i} className="text-[14px] text-ink-soft leading-[1.8]">{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Entry feed */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display text-[20px] text-ink">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </h2>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={
                  "px-3 py-1.5 rounded-full text-[12px] border transition-colors " +
                  (filter === f.id
                    ? "bg-ink text-surface border-ink"
                    : "bg-background border-line text-ink-soft hover:border-ink-muted")
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl p-7 text-center">
            <p className="text-[13.5px] text-ink-soft mb-1">
              {filter === "all" ? "The journal is quiet — for now." : "Nothing here yet."}
            </p>
            <p className="text-[12px] text-ink-muted">
              Log a moment above. The eye is trained by use, not by waiting.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div key={e.id} className="bg-surface border border-line rounded-xl px-5 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: colorByKind[e.kind] }} />
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
