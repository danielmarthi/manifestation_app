import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPracticeLogByDate,
  getEvidenceByDate,
  getJourneyState,
} from "../../../lib/data";

interface Props {
  params: Promise<{ date: string }>;
}

const RITUAL_STEPS: { id: string; label: string }[] = [
  { id: "breathe", label: "Breathe" },
  { id: "be", label: "Be" },
  { id: "see", label: "See" },
  { id: "thank", label: "Thank" },
  { id: "assume", label: "Assume" },
  { id: "note", label: "Note" },
];

const MOOD_LABELS: Record<string, string> = {
  contracted: "Contracted",
  tender: "Tender",
  steady: "Steady",
  open: "Open",
  expansive: "Expansive",
};

const KIND_COLORS: Record<string, string> = {
  win: "var(--terracotta)",
  synchronicity: "var(--gold)",
  receiving: "var(--ochre)",
  resistance: "var(--ink-muted)",
};

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DayDetailPage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const [log, evidence, journey] = await Promise.all([
    getPracticeLogByDate(date),
    getEvidenceByDate(date),
    getJourneyState(),
  ]);

  // Compute which journey day this date was.
  let dayNumber: number | null = null;
  if (journey.startDate) {
    const start = new Date(journey.startDate + "T00:00:00Z").getTime();
    const that = new Date(date + "T00:00:00Z").getTime();
    const diff = Math.floor((that - start) / (1000 * 60 * 60 * 24)) + 1;
    if (diff >= 1) dayNumber = diff;
  }

  const steps = (log?.steps_completed ?? {}) as Record<string, boolean>;
  const completedCount = RITUAL_STEPS.filter((s) => steps[s.id]).length;
  const dayComplete = !!log?.completed_at;

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[720px] mx-auto">
      <Link
        href="/calendar"
        className="text-[12px] text-ink-muted hover:text-ink transition-colors mb-8 inline-flex items-center gap-1.5"
      >
        ← Back to journey
      </Link>

      <div className="mb-1 flex items-center gap-3">
        {dayNumber && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            Day {dayNumber}
          </span>
        )}
        {dayComplete && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-terracotta">
            Ritual complete
          </span>
        )}
      </div>
      <h1 className="font-display text-[30px] text-ink leading-tight mb-8">
        {formatLongDate(date)}
      </h1>

      {/* Practice */}
      <section className="bg-surface border border-line rounded-2xl p-7 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[18px] text-ink">Morning ritual</h2>
          <span className="text-[12px] text-ink-muted">
            {completedCount}/{RITUAL_STEPS.length} steps
          </span>
        </div>
        {completedCount === 0 ? (
          <p className="text-[13px] text-ink-muted">No practice logged this day.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RITUAL_STEPS.map((s) => {
              const done = !!steps[s.id];
              return (
                <div
                  key={s.id}
                  className={
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] " +
                    (done ? "bg-terracotta/10 text-ink" : "bg-background text-ink-muted")
                  }
                >
                  <span
                    className={
                      "w-4 h-4 rounded-full flex items-center justify-center text-[10px] " +
                      (done ? "bg-terracotta text-parchment" : "border border-line")
                    }
                  >
                    {done ? "✓" : ""}
                  </span>
                  {s.label}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mood */}
      {log?.mood && MOOD_LABELS[log.mood] && (
        <section className="bg-surface border border-line rounded-2xl px-7 py-5 mb-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
            How you arrived
          </div>
          <p className="font-display text-[20px] text-ink">{MOOD_LABELS[log.mood]}</p>
        </section>
      )}

      {/* Gratitude */}
      {log?.gratitude && (
        <section className="bg-surface border border-line rounded-2xl p-7 mb-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
            Gratitude in advance
          </div>
          <p className="text-[14.5px] text-ink-soft leading-[1.7] whitespace-pre-line">
            {log.gratitude}
          </p>
        </section>
      )}

      {/* Daily note */}
      {log?.daily_note && (
        <section className="bg-surface border border-line rounded-2xl p-7 mb-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
            Today's note
          </div>
          <p className="text-[14.5px] text-ink leading-[1.8] whitespace-pre-line">
            {log.daily_note}
          </p>
        </section>
      )}

      {/* Evidence */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
          Evidence logged this day
        </div>
        {evidence.length === 0 ? (
          <p className="text-[13px] text-ink-muted">Nothing logged this day.</p>
        ) : (
          <div className="space-y-3">
            {evidence.map((e) => (
              <div key={e.id} className="bg-surface border border-line rounded-xl px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: KIND_COLORS[e.kind] }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    {e.kind}
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
