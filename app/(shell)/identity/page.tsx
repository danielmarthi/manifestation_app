import {
  getProfile,
  getBeliefs,
  getIdentityStatements,
} from "../../lib/data";
import { OldSelfSection } from "./OldSelfSection";
import { AssumptionEditor } from "./AssumptionEditor";
import { IdentityStatementsEditor } from "./IdentityStatementsEditor";

const typeColor: Record<string, string> = {
  inherited: "var(--ochre)",
  "self-created": "var(--terracotta)",
  "fear-based": "var(--ink-muted)",
  "identity-based": "var(--gold)",
};

export default async function IdentityPage() {
  const [profile, beliefs, identityStatements] = await Promise.all([
    getProfile(),
    getBeliefs(),
    getIdentityStatements(),
  ]);
  if (!profile) return null;

  const dissolved = beliefs.filter((b) => b.dissolved).length;
  const active = beliefs.length - dissolved;

  // New v2 fields with fallbacks
  const futureSelfName =
    profile.future_self_name ?? `${profile.first_name ?? "Friend"}, Future`;
  const futureSelfTags = profile.future_self_tags?.length
    ? profile.future_self_tags
    : profile.future_self_traits ?? [];
  const futureSelfPortrait = profile.future_self_portrait ?? null;
  const releasing = profile.releasing ?? [];

  const hasOldSelf =
    !!(profile.old_self_portrait ?? profile.old_self_body?.join(" "));

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[920px] mx-auto">

      {/* ── SECTION 1: Future Self ──────────────────────────────────────── */}
      <section className="mb-14">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
          Who I'm becoming
        </div>
        <h1 className="font-display text-[40px] sm:text-[50px] text-ink leading-[1.05] mb-4">
          {futureSelfName}
        </h1>

        {/* Future self tags */}
        {futureSelfTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {futureSelfTags.map((tag) => (
              <span
                key={tag}
                className="text-[11.5px] px-3.5 py-1.5 rounded-full bg-ochre/10 border border-ochre/40 text-ochre"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Future self portrait */}
        {futureSelfPortrait ? (
          <div className="mb-8">
            <p className="font-display text-[19px] sm:text-[21px] text-ink leading-[1.7]">
              {futureSelfPortrait}
            </p>
          </div>
        ) : null}

        {/* What I'm releasing */}
        {releasing.length > 0 && (
          <div className="mb-8 p-6 bg-surface border border-line rounded-2xl">
            <div className="text-[9px] uppercase tracking-[0.22em] text-ink-muted mb-4">
              I am releasing
            </div>
            <ul className="space-y-2.5">
              {releasing.map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <span className="w-5 h-px bg-line shrink-0" />
                  <span className="text-[14px] text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assumption — editable */}
        <AssumptionEditor initial={profile.assumption ?? "It is already done."} />

        {/* Identity statements — editable */}
        <IdentityStatementsEditor
          initial={identityStatements.map((s) => ({ id: s.id, text: s.text }))}
        />

        {/* Belief map */}
        <section>
          <h2 className="font-display text-[20px] text-ink mb-2">
            Belief map
          </h2>
          <p className="text-[13px] text-ink-muted mb-5">
            {dissolved} dissolved · {active} still being worked through.
          </p>
          {beliefs.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              No beliefs surfaced yet — Phase 1 (the Honest Audit) names them.
            </p>
          ) : (
            <div className="space-y-2">
              {beliefs.map((b) => (
                <div
                  key={b.id}
                  className={
                    "border rounded-xl px-5 py-4 flex items-start gap-4 " +
                    (b.dissolved
                      ? "bg-surface/60 border-line/60 opacity-70"
                      : "bg-surface border-line")
                  }
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 mt-1.5"
                    style={{ background: typeColor[b.type] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={
                        "text-[14.5px] " +
                        (b.dissolved
                          ? "line-through decoration-line text-ink-muted"
                          : "text-ink-soft")
                      }
                    >
                      "{b.text}"
                    </p>
                    {b.area && (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted/70 mt-1 block">
                        {b.area}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-ink-muted shrink-0">
                    {b.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      {/* ── SECTION 2: Old Self (collapsible) ──────────────────────────── */}
      {hasOldSelf && (
        <OldSelfSection
          oldSelfName={profile.old_self_name ?? `${profile.first_name ?? "Friend"}, Before`}
          oldSelfPortrait={
            profile.old_self_portrait ??
            profile.old_self_body?.join(" ") ??
            ""
          }
          oldSelfTags={profile.old_self_tags ?? []}
          gapStatement={profile.gap_statement ?? ""}
          firstName={profile.first_name ?? "Friend"}
        />
      )}
    </div>
  );
}
