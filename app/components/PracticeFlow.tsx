"use client";

import { useState } from "react";
import { mockUser } from "../lib/mockUser";

interface Step {
  id: string;
  title: string;
  cue: string;
  body: React.ReactNode;
  cta: string;
}

export function PracticeFlow() {
  const [i, setI] = useState(0);
  const [gratitude, setGratitude] = useState("");
  const [done, setDone] = useState(false);

  const todayStatement =
    mockUser.identityStatements[
      new Date().getDate() % mockUser.identityStatements.length
    ];

  const steps: Step[] = [
    {
      id: "breathe",
      title: "Breathe",
      cue: "Three slow breaths. Notice where you feel today.",
      body: (
        <div className="flex flex-col items-center py-8">
          <div className="relative w-44 h-44 mb-6">
            <div
              className="absolute inset-0 rounded-full breath-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(212,168,73,0.7) 0%, rgba(179,90,58,0.25) 55%, transparent 80%)",
              }}
            />
          </div>
          <p className="text-[13px] text-ink-muted">
            Inhale — hold — release. Three times.
          </p>
        </div>
      ),
      cta: "I'm here →",
    },
    {
      id: "be",
      title: "Be",
      cue: "Today's identity statement. Read it aloud.",
      body: (
        <div className="py-10 text-center">
          <p className="font-display text-[36px] sm:text-[44px] text-ink leading-[1.1]">
            "{todayStatement}"
          </p>
          <p className="mt-6 text-[12px] text-ink-muted">
            Does it feel like expansion or performance? Stay with the lines that expand.
          </p>
        </div>
      ),
      cta: "I read it aloud →",
    },
    {
      id: "see",
      title: "See",
      cue: "Today's visualization — read slowly. Hold the image.",
      body: (
        <div className="py-8 max-w-xl mx-auto">
          <p className="font-display text-[19px] text-ink-soft leading-[1.65]">
            It's a Tuesday morning, six months from now. You open your bank account
            and the number doesn't make your chest tighten. You notice the absence
            of the old knot — and almost laugh at how foreign the panic feels now.
            You think about a recent transfer you sent to someone who needed it.
            You gave it without flinching. You move on with your day.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-surface-2/70 border border-line">
            <p className="text-[12px] text-ink-muted mb-1">Body check</p>
            <p className="text-[13.5px] text-ink-soft">
              Where do you feel this in your body? Stay there for 30 seconds.
            </p>
          </div>
        </div>
      ),
      cta: "I felt it →",
    },
    {
      id: "thank",
      title: "Thank",
      cue: "Gratitude in advance — as if it's already arrived.",
      body: (
        <div className="py-8 max-w-lg mx-auto">
          <label className="block text-[12px] text-ink-muted mb-2">
            Today I'm grateful for…
          </label>
          <textarea
            rows={4}
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Thank you for…"
            className="w-full p-4 bg-background border border-line rounded-lg text-[15px] focus:outline-none focus:border-terracotta resize-none"
          />
          <p className="mt-3 text-[11.5px] text-ink-muted">
            Present tense. As if it's already true. Specific.
          </p>
        </div>
      ),
      cta: "Logged →",
    },
    {
      id: "assume",
      title: "Assume",
      cue: "Your one sentence. Read it. Feel it. Live from it today.",
      body: (
        <div className="py-12 text-center max-w-xl mx-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-4">
            My assumption
          </div>
          <p className="font-display text-[34px] sm:text-[42px] text-ink leading-[1.1]">
            "{mockUser.assumption}"
          </p>
          <p className="mt-8 text-[13px] text-ink-soft">
            Close your eyes. Say it. Notice if it lands as fact, not wish.
          </p>
        </div>
      ),
      cta: "It is done. ✓",
    },
  ];

  function next() {
    if (i < steps.length - 1) setI(i + 1);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 page-fade">
        <div className="text-center max-w-md">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full candle-glow"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, #e6c47a 0%, #d4a849 30%, #b35a3a 70%, transparent 100%)",
                boxShadow: "0 0 60px rgba(212,168,73,0.4)",
              }}
            />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
            Day {mockUser.streak} complete
          </div>
          <h1 className="font-display text-[32px] text-ink mb-4 leading-tight">
            Quietly, you returned.
          </h1>
          <p className="text-[14px] text-ink-soft leading-relaxed">
            The practice doesn't make abundance arrive. It makes you available to
            receive what's already on its way.
          </p>
          <a
            href="/"
            className="inline-block mt-8 px-6 py-2.5 rounded-full border border-line text-[13px] text-ink-soft hover:bg-surface-2 transition-colors"
          >
            Carry it into the day
          </a>
        </div>
      </div>
    );
  }

  const step = steps[i];

  return (
    <div className="page-fade min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="px-8 pt-8 pb-2 flex gap-1.5">
        {steps.map((_, n) => (
          <span
            key={n}
            className={
              "h-1 rounded-full flex-1 transition-colors " +
              (n <= i ? "bg-terracotta" : "bg-line")
            }
          />
        ))}
      </div>

      <div className="px-8 pt-6 max-w-2xl mx-auto w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
          Step {i + 1} of {steps.length} — {step.title}
        </div>
        <h1 className="font-display text-[26px] text-ink leading-tight">{step.cue}</h1>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-2xl">{step.body}</div>
      </div>

      <div className="px-8 py-6 border-t border-line/60 flex items-center justify-between max-w-3xl mx-auto w-full">
        <button
          onClick={() => i > 0 && setI(i - 1)}
          disabled={i === 0}
          className="text-[12px] text-ink-muted hover:text-ink-soft disabled:opacity-30"
        >
          ← back
        </button>
        <button
          onClick={next}
          className="px-6 py-2.5 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
        >
          {step.cta}
        </button>
      </div>
    </div>
  );
}
