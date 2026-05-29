"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProfileRow } from "../lib/supabase/types";

// Truncate portrait to first N sentences
function truncateSentences(text: string, n: number): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, n).join(" ").trim();
}

export function FutureSelfSidebar({ profile }: { profile: ProfileRow }) {
  const [showOld, setShowOld] = useState(false);

  // New v2 fields with fallbacks for legacy data
  const futureName =
    profile.future_self_name ||
    `${profile.first_name ?? "You"}, Future`;

  const futurePortrait = profile.future_self_portrait
    ? truncateSentences(profile.future_self_portrait, 2)
    : profile.future_self_body?.slice(0, 2).join(" ") ?? "";

  const futureTags = profile.future_self_tags?.length
    ? profile.future_self_tags
    : profile.future_self_traits ?? [];

  const oldName =
    profile.old_self_name ||
    `${profile.first_name ?? "You"}, Before`;

  const oldPortrait = profile.old_self_portrait
    ? truncateSentences(profile.old_self_portrait, 2)
    : profile.old_self_body?.slice(0, 2).join(" ") ?? "";

  return (
    <aside className="hidden lg:flex w-[300px] shrink-0 border-l border-line bg-surface flex-col">
      <div className="sticky top-14 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="px-6 pt-8 pb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-4">
            Who I am becoming
          </div>

          {/* Orb / avatar placeholder */}
          <div className="relative w-20 h-20 mb-5">
            <div
              className="absolute inset-0 rounded-full candle-glow"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
                boxShadow: "0 0 30px rgba(212,168,73,0.3)",
              }}
            />
          </div>

          <div className="font-display text-[20px] leading-tight text-ink mb-3">
            {futureName}
          </div>

          {futureTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {futureTags.slice(0, 5).map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2.5 py-0.5 rounded-full bg-ochre/10 border border-ochre/30 text-ochre"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="divider-line mx-6" />

        <div className="px-6 py-5 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
            Who she is
          </div>
          {futurePortrait ? (
            <p className="font-display text-[14.5px] leading-[1.6] text-ink-soft">
              {futurePortrait}
            </p>
          ) : (
            <p className="text-[13px] text-ink-muted italic">
              Your future self portrait will appear here after onboarding.
            </p>
          )}
          <Link
            href="/identity"
            className="inline-block mt-4 text-[12px] text-terracotta hover:text-ink transition-colors"
          >
            View full identity →
          </Link>
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-line/60">
          <button
            onClick={() => setShowOld(true)}
            className="w-full flex items-center justify-between gap-3 text-left group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-surface-2 border border-line old-self-treatment shrink-0"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #c9c3bb, #8a7d70 70%, #4a3f36 100%)",
                }}
              />
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Where I came from
                </div>
                <div className="text-[12.5px] text-ink-soft group-hover:text-ink transition-colors">
                  {oldName}
                </div>
              </div>
            </div>
            <span className="text-ink-muted group-hover:text-ink-soft text-sm">↗</span>
          </button>
        </div>
      </div>

      {showOld && (
        <OldSelfPopout
          name={oldName}
          portrait={oldPortrait}
          onClose={() => setShowOld(false)}
        />
      )}
    </aside>
  );
}

function OldSelfPopout({
  name,
  portrait,
  onClose,
}: {
  name: string;
  portrait: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-hidden />
      <div
        className="relative z-10 max-w-md w-full bg-surface border border-line rounded-2xl shadow-2xl p-7 page-fade"
        style={{ filter: "grayscale(70%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
          Where I came from — honored, not erased
        </div>
        <div className="font-display text-[22px] text-ink-soft mb-4">
          {name}
        </div>
        {portrait ? (
          <p className="text-[14px] leading-[1.65] text-ink-muted">
            {portrait}
          </p>
        ) : (
          <p className="text-[13px] text-ink-muted italic">
            Your old self portrait will appear here after onboarding.
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="text-[12px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
          >
            Return to who I'm becoming →
          </button>
        </div>
      </div>
    </div>
  );
}
