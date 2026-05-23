import { mockUser } from "../../lib/mockUser";

const typeColor: Record<string, string> = {
  inherited: "var(--ochre)",
  "self-created": "var(--terracotta)",
  "fear-based": "var(--ink-muted)",
  "identity-based": "var(--gold)",
};

export default function IdentityPage() {
  const u = mockUser;
  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[920px] mx-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
        My Identity
      </div>
      <h1 className="font-display text-[40px] text-ink leading-tight mb-3">
        Who I'm becoming, in my own words.
      </h1>
      <p className="text-[14px] text-ink-soft max-w-xl mb-10">
        Identity is the lever. Beliefs are the resistance. This page is the map of both.
      </p>

      <section className="mb-12">
        <h2 className="font-display text-[20px] text-ink mb-4">Identity statements</h2>
        <div className="space-y-2">
          {u.identityStatements.map((s, i) => (
            <div
              key={i}
              className="bg-surface border border-line rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <span className="font-display text-[22px] text-terracotta/70 w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-display text-[17px] text-ink leading-snug">
                "{s}"
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-[20px] text-ink mb-2">Belief map</h2>
        <p className="text-[13px] text-ink-muted mb-5">
          {u.beliefs.filter((b) => b.dissolved).length} dissolved ·{" "}
          {u.beliefs.filter((b) => !b.dissolved).length} still being worked through.
        </p>
        <div className="space-y-2">
          {u.beliefs.map((b) => (
            <div
              key={b.id}
              className={
                "border rounded-xl px-5 py-4 flex items-center gap-4 " +
                (b.dissolved
                  ? "bg-surface/60 border-line/60 opacity-70"
                  : "bg-surface border-line")
              }
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: typeColor[b.type] }}
              />
              <p
                className={
                  "text-[14.5px] flex-1 " +
                  (b.dissolved
                    ? "line-through decoration-line text-ink-muted"
                    : "text-ink-soft")
                }
              >
                "{b.text}"
              </p>
              <span className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                {b.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[20px] text-ink mb-2">My gap statement</h2>
        <div className="bg-surface-2/60 border border-line rounded-2xl p-7">
          <p className="font-display text-[20px] text-ink leading-snug">
            {u.gapStatement}
          </p>
          <p className="mt-3 text-[12px] text-ink-muted">
            The bridge you're crossing. Pinned to your dashboard until you cross it.
          </p>
        </div>
      </section>
    </div>
  );
}
