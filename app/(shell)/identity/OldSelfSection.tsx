"use client";

import { useState } from "react";

interface Props {
  oldSelfName: string;
  oldSelfPortrait: string;
  oldSelfTags: string[];
  gapStatement: string;
  firstName: string;
}

export function OldSelfSection({
  oldSelfName,
  oldSelfPortrait,
  oldSelfTags,
  gapStatement,
  firstName,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section>
      <div className="divider-line mb-8" />

      {/* Collapsed trigger */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-between text-left px-5 py-4 rounded-xl border border-line bg-surface hover:bg-surface-2/40 transition-colors group"
        >
          <span className="text-[13px] text-ink-muted group-hover:text-ink-soft transition-colors">
            ↓ Where I came from — {firstName}, Before
          </span>
          <span className="text-[11px] text-ink-muted/60">expand</span>
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div
          className="rounded-2xl border border-line overflow-hidden page-fade"
          style={{ filter: "grayscale(70%)" }}
        >
          <div className="bg-surface p-7">
            <div className="text-[9px] uppercase tracking-[0.22em] text-ink-muted mb-2">
              Where I came from — honored, not erased
            </div>
            <h2 className="font-display text-[26px] text-ink-soft mb-5 leading-tight">
              {oldSelfName}
            </h2>

            <p className="text-[15px] text-ink-muted leading-[1.7] mb-6">
              {oldSelfPortrait}
            </p>

            {oldSelfTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {oldSelfTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-3 py-1 rounded-full bg-background border border-line/50 text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {gapStatement && (
              <div className="border-l-2 border-line pl-5 mb-6">
                <p className="font-display text-[16px] text-ink-muted italic leading-[1.6]">
                  {gapStatement}
                </p>
              </div>
            )}

            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted/60 mb-5">
              This is where you started.
            </p>

            <button
              onClick={() => setExpanded(false)}
              className="text-[12px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink transition-colors"
            >
              ↑ Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
