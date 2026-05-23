"use client";

import { useState, useEffect } from "react";
import { mockUser } from "../lib/mockUser";

type Step = 1 | 2 | 3;

export function SOSModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [feeling, setFeeling] = useState("");

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setFeeling("");
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-surface border border-line rounded-2xl shadow-2xl page-fade">
        <div className="px-7 pt-6 pb-3 border-b border-line/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-sos" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              Return to alignment
            </span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-sm">
            close
          </button>
        </div>

        <div className="px-7 pt-2 pb-3 flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={
                "h-1 rounded-full flex-1 transition-colors " +
                (n <= step ? "bg-terracotta" : "bg-line")
              }
            />
          ))}
        </div>

        <div className="px-7 pb-7 pt-3 min-h-[280px]">
          {step === 1 && (
            <div className="page-fade">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
                Step 1 — Name it
              </div>
              <h2 className="font-display text-[24px] text-ink leading-tight mb-4">
                What happened? What are you feeling right now?
              </h2>
              <p className="text-[13px] text-ink-soft mb-3">
                Don't soften it. Don't perform. Honest, 30 seconds.
              </p>
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                rows={4}
                placeholder="It feels like…"
                className="w-full p-4 bg-background border border-line rounded-lg text-[14.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-terracotta resize-none"
                autoFocus
              />
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="page-fade">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
                Step 2 — The reframe
              </div>
              <h2 className="font-display text-[22px] text-ink leading-tight mb-4">
                Hear this — specifically, for you.
              </h2>
              <div className="space-y-3 text-[15px] leading-[1.6] text-ink-soft border-l-2 border-terracotta pl-5">
                <p>
                  {mockUser.firstName}, this moment is not a verdict. It's the texture
                  of the test before the threshold.
                </p>
                <p>
                  Your evidence journal already holds <span className="text-ink font-medium">{mockUser.recentEvidence.length} signals from this week alone</span>.
                  The story "it doesn't work for me" is the old self talking — and you
                  archived her in Phase 2.
                </p>
                <p>
                  Your future self would look at this and not even flinch. She knows
                  what's already in motion.
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-[12px] text-ink-muted hover:text-ink-soft"
                >
                  ← back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="page-fade">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
                Step 3 — The return
              </div>
              <h2 className="font-display text-[22px] text-ink leading-tight mb-5">
                One thing — right now.
              </h2>

              <div className="rounded-xl border border-line bg-background p-6 mb-5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
                  Your assumption
                </div>
                <p className="font-display text-[20px] text-ink leading-tight">
                  "{mockUser.assumption}"
                </p>
              </div>

              <div className="flex items-center justify-center py-3">
                <div className="relative w-24 h-24">
                  <div
                    className="absolute inset-0 rounded-full breath-pulse"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(212,168,73,0.6) 0%, rgba(179,90,58,0.15) 60%, transparent 80%)",
                    }}
                  />
                </div>
              </div>
              <p className="text-center text-[12px] text-ink-muted">
                Breathe with this for 60 seconds. Then close the modal and go gently.
              </p>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-[12px] text-ink-muted hover:text-ink-soft"
                >
                  ← back
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full border border-line text-ink-soft text-[13px] hover:bg-surface-2 transition-colors"
                >
                  Return to my day
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
