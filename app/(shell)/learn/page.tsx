const chapters = [
  {
    title: "Why the gap exists",
    line: "The space between wanting it and having it isn't a punishment. It's where the becoming happens.",
    body: "Manifestation isn't a delivery service. It's an identity match. The reason your desire hasn't arrived yet is almost never about effort — it's about the version of you the universe is still rearranging to meet. Every day you tend the inner state, the gap closes. Not by force. By alignment.",
  },
  {
    title: "Why things often get harder first",
    line: "The test before the threshold.",
    body: "When you commit to a new belief, your nervous system reorganizes around it. Old loyalties — to scarcity, to small living, to suffering as identity — surface. They're not proof you're failing. They're proof the system is moving. This is the most common quitting point and the most important place to stay.",
  },
  {
    title: "Why detachment accelerates",
    line: "Desperation tells the universe you still believe you don't have it.",
    body: "Detachment is not resignation. Resignation says 'it won't happen so I stop wanting.' Detachment says 'it's done, so I stop watching the door.' The difference is everything. One leaks energy. The other rests in trust.",
  },
  {
    title: "How timing actually works",
    line: "You can't rush a tree.",
    body: "Things arrive when the inner version of you that can receive them, hold them, and not collapse under them is ready. Rushing creates friction. Allowing creates flow. Your only job is to keep becoming — quietly, consistently, even on the hard days.",
  },
  {
    title: "What to do when belief is gone",
    line: "Belief is not the prerequisite. Practice is.",
    body: "On the days you can't feel it, you don't have to. Read the assumption anyway. Do the ritual anyway. Move as if. Belief returns as a result of practice — not the cause of it. This is the quiet professionalism of manifestation.",
  },
];

export default function LearnPage() {
  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[760px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        Learn
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        Why it hasn't happened yet.
      </h1>
      <p className="text-[14px] text-ink-soft mb-12 max-w-xl">
        Plain language. No spiritual bypassing. Read this before the hard days
        come — and again on the days that already are.
      </p>

      <div className="space-y-12">
        {chapters.map((c, i) => (
          <article key={i}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
              Chapter {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="font-display text-[28px] text-ink leading-tight mb-2">
              {c.title}
            </h2>
            <p className="font-display italic text-[17px] text-terracotta/90 mb-4">
              {c.line}
            </p>
            <p className="text-[15.5px] leading-[1.7] text-ink-soft">{c.body}</p>
            <div className="divider-line mt-10" />
          </article>
        ))}
      </div>
    </div>
  );
}
