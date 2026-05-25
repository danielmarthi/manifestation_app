import { getProfile, getAllEvidence } from "../../lib/data";

const milestones = [
  { day: 7, label: "Practice is a habit" },
  { day: 14, label: "Identity has texture" },
  { day: 30, label: "Receiving feels safe" },
  { day: 60, label: "Old self is unfamiliar" },
  { day: 90, label: "It's already arriving" },
];

const colorByKind: Record<string, string> = {
  win: "var(--terracotta)",
  synchronicity: "var(--gold)",
  receiving: "var(--ochre)",
  resistance: "var(--ink-muted)",
};

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

export default async function EvidencePage() {
  const [profile, all] = await Promise.all([getProfile(), getAllEvidence()]);
  if (!profile) return null;

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[960px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        Evidence Journal
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        The case for your own miracle.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-10">
        What you focus on expands. This journal trains the eye and accumulates the proof —
        especially for the part of you that still believes "it never works."
      </p>

      <section className="mb-12">
        <h2 className="font-display text-[20px] text-ink mb-4">Momentum milestones</h2>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex justify-between items-end">
            {milestones.map((m) => {
              const reached = profile.streak >= m.day;
              return (
                <div key={m.day} className="flex flex-col items-center text-center flex-1 px-2">
                  <span
                    className={
                      "h-2.5 w-2.5 rounded-full mb-2 " +
                      (reached ? "bg-terracotta" : "bg-line")
                    }
                  />
                  <span
                    className={
                      "font-display text-[18px] mb-1 " +
                      (reached ? "text-ink" : "text-ink-muted")
                    }
                  >
                    Day {m.day}
                  </span>
                  <span
                    className={
                      "text-[11px] leading-snug " +
                      (reached ? "text-ink-soft" : "text-ink-muted")
                    }
                  >
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-[20px] text-ink mb-1">All entries</h2>
        <p className="text-[12px] text-ink-muted mb-5">
          {all.length} signal{all.length === 1 ? "" : "s"} · grouped by what they're training in you.
        </p>
        {all.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl p-7 text-center">
            <p className="text-[13.5px] text-ink-soft mb-1">
              The journal is quiet — for now.
            </p>
            <p className="text-[12px] text-ink-muted">
              Log a small win or synchronicity from the dashboard. The eye is trained
              by use, not by waiting.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {all.map((e) => (
              <div key={e.id} className="bg-surface border border-line rounded-xl px-5 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: colorByKind[e.kind] }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    {e.kind}
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
