"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finaliseOnboarding } from "../../actions/onboarding";

interface Props {
  firstName: string;
  futureSelfName: string;
  futureSelfPortrait: string;
  futureSelfTags: string[];
  releasing: string[];
  oldSelfName: string;
  oldSelfPortrait: string;
  oldSelfTags: string[];
  gapStatement: string;
}

export function RevealClient({
  futureSelfName,
  futureSelfPortrait,
  futureSelfTags,
  releasing,
  oldSelfName,
  oldSelfPortrait,
  oldSelfTags,
  gapStatement,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [animating, setAnimating] = useState(false);

  function handleCTA() {
    if (isPending || animating) return;
    setAnimating(true);

    // Animation plays (600ms), then save + redirect
    setTimeout(() => {
      startTransition(async () => {
        await finaliseOnboarding();
        router.push("/today");
      });
    }, 700);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 page-fade">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="font-display text-[36px] sm:text-[44px] text-ink leading-[1.1] mb-3">
          Here's what I see.
        </h1>
        <p className="text-[14px] text-ink-muted max-w-lg mx-auto leading-[1.6]">
          The person you've been. The person you're becoming. Both are you. Only one is running your life right now.
        </p>
      </div>

      {/* Two-panel reveal */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-5 mb-10">

        {/* LEFT — Old Self */}
        <div
          className="flex-1 rounded-2xl border border-line bg-surface p-7 transition-all duration-700"
          style={{
            filter: animating ? "grayscale(100%)" : "grayscale(80%)",
            opacity: animating ? 0.15 : 0.85,
          }}
        >
          <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted mb-2">
            Where you've been
          </div>
          <h2 className="font-display text-[22px] text-ink-soft mb-4 leading-tight">
            {oldSelfName}
          </h2>
          <p className="text-[14px] text-ink-muted leading-[1.65] mb-5">
            {oldSelfPortrait}
          </p>
          {oldSelfTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {oldSelfTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-3 py-1 rounded-full bg-background border border-line/60 text-ink-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Future Self */}
        <div
          className="flex-1 md:flex-[1.15] rounded-2xl border bg-surface p-7 transition-all duration-700"
          style={{
            borderColor: animating ? "var(--gold)" : "var(--ochre)",
            boxShadow: animating
              ? "0 0 40px rgba(212,168,73,0.3)"
              : "0 4px 20px rgba(179,90,58,0.08)",
            transform: animating ? "scale(1.02)" : "scale(1.0)",
          }}
        >
          <div className="text-[9px] uppercase tracking-[0.2em] text-ochre mb-2">
            Who you're becoming
          </div>
          <h2 className="font-display text-[24px] text-ink mb-4 leading-tight">
            {futureSelfName}
          </h2>

          {futureSelfTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {futureSelfTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-3 py-1 rounded-full bg-ochre/10 border border-ochre/30 text-ochre"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-[14.5px] text-ink leading-[1.7] mb-6 font-display">
            {futureSelfPortrait}
          </p>

          {releasing.length > 0 && (
            <div className="border-t border-line/60 pt-4">
              <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted mb-3">
                I am releasing
              </div>
              <ul className="space-y-1.5">
                {releasing.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-4 h-px bg-line/80 shrink-0" />
                    <span className="text-[13px] text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Gap statement */}
      {gapStatement && (
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-surface-2/60 border border-line rounded-xl px-6 py-5">
            <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted mb-2">
              The honest bridge
            </div>
            <p className="font-display text-[17px] text-ink leading-[1.55]">
              {gapStatement}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={handleCTA}
          disabled={isPending || animating}
          className="px-10 py-3.5 rounded-full bg-ink text-surface text-[15px] hover:bg-ink-soft transition-all disabled:opacity-60"
          style={{
            boxShadow: animating ? "0 0 30px rgba(212,168,73,0.3)" : "none",
          }}
        >
          {isPending || animating ? "Opening your practice..." : "This is who I'm becoming →"}
        </button>
        <p className="mt-4 text-[12px] text-ink-muted">
          Your full identity portrait lives in the Identity page. You can return to it anytime.
        </p>
      </div>
    </div>
  );
}
