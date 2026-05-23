import { mockUser } from "../../lib/mockUser";

const moreEvidence = [
  { id: "e4", date: "4 days ago", kind: "win", text: "Asked for the raise I'd been avoiding. They said they'd been waiting for me to bring it up." },
  { id: "e5", date: "5 days ago", kind: "synchronicity", text: "The number 444 three times in one afternoon. Each time I felt a quiet 'yes.'" },
  { id: "e6", date: "6 days ago", kind: "receiving", text: "An old client referred me to someone new, unprompted." },
  { id: "e7", date: "8 days ago", kind: "synchronicity", text: "Overheard the exact phrase from my visualization on the radio in a coffee shop." },
  { id: "e8", date: "10 days ago", kind: "win", text: "Bank balance higher than expected. Didn't double-check it nine times — just trusted." },
  { id: "e9", date: "12 days ago", kind: "receiving", text: "A surprise tax refund — $312." },
];

const milestones = [
  { day: 7, label: "Practice is a habit" },
  { day: 14, label: "Identity has texture", reached: true },
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

export default function EvidencePage() {
  const all = [...mockUser.recentEvidence, ...moreEvidence];
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
              const reached = mockUser.streak >= m.day;
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
          {all.length} signals · grouped by what they're training in you.
        </p>
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
                <span className="text-[11px] text-ink-muted ml-auto">{e.date}</span>
              </div>
              <p className="text-[14px] text-ink leading-[1.55]">{e.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
