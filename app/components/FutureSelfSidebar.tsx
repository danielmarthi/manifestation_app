"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProfileRow } from "../lib/supabase/types";

export function FutureSelfSidebar({ profile }: { profile: ProfileRow }) {
  const [showOld, setShowOld] = useState(false);

  const futureName = profile.future_self_name || `${profile.first_name ?? "You"}, Future`;
  const futureBody = profile.future_self_body ?? [];
  const futureTraits = profile.future_self_traits ?? [];
  const oldName = profile.old_self_name || `${profile.first_name ?? "You"}, Before`;
  const oldBody = profile.old_self_body ?? [];

  return (
    <aside className="hidden lg:flex w-[320px] shrink-0 border-l border-line bg-surface flex-col">
      <div className="sticky top-0 flex flex-col h-screen overflow-y-auto">
        <div className="px-6 pt-8 pb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
            Who I am becoming
          </div>
          <div className="relative aspect-square rounded-full overflow-hidden bg-surface-2 border border-line">
            <Image
              src="/avatars/future.svg"
              alt="Future self portrait"
              width={320}
              height={320}
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0 candle-glow pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(230,196,122,0.18) 0%, transparent 65%)",
              }}
            />
          </div>
          <div className="mt-5 font-display text-[22px] leading-tight text-ink">
            {futureName}
          </div>
          {futureTraits.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {futureTraits.map((t) => (
                <span
                  key={t}
                  className="text-[10px] uppercase tracking-[0.14em] text-ink-soft border border-line/80 px-2 py-0.5 rounded-full bg-background/40"
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
          <div className="space-y-3 font-display text-[15px] leading-[1.55] text-ink-soft">
            {futureBody.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-line/60">
          <button
            onClick={() => setShowOld(true)}
            className="w-full flex items-center justify-between gap-3 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-2 border border-line old-self-treatment">
                <Image
                  src="/avatars/old.svg"
                  alt="Old self portrait"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Where I came from
                </div>
                <div className="text-[13px] text-ink-soft group-hover:text-ink transition-colors">
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
          body={oldBody}
          onClose={() => setShowOld(false)}
        />
      )}
    </aside>
  );
}

function OldSelfPopout({
  name,
  body,
  onClose,
}: {
  name: string;
  body: string[];
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
          Where I came from — honored, not erased
        </div>
        <div className="relative aspect-square w-32 rounded-full overflow-hidden bg-surface-2 border border-line old-self-treatment mb-4">
          <Image src="/avatars/old.svg" alt="Old self" width={128} height={128} />
        </div>
        <div className="font-display text-[22px] text-ink-soft mb-3 old-self-treatment">
          {name}
        </div>
        <div className="space-y-3 text-[14px] leading-[1.6] text-ink-muted">
          {body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
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
