"use client";

import { useState } from "react";
import Link from "next/link";

interface Round {
  id: string;
  label: string;
  heading: string;
  prompts: string[];
  reflect: string;
}

const rounds: Round[] = [
  {
    id: "desire",
    label: "Round 1 · The Desire",
    heading: "What is it you actually want?",
    prompts: [
      "Which area of life — money, love, health, work?",
      "Be specific. \"More money\" becomes \"financial security that means I never panic about a bill again.\"",
    ],
    reflect:
      "Good. So when you say it, you're not pointing at a number — you're pointing at how you'd move through your days. That's the real desire. I'll hold it.",
  },
  {
    id: "block",
    label: "Round 2 · The Block",
    heading: "What's the \"yeah but\" thought that keeps surfacing?",
    prompts: [
      "What's tried to come before and didn't land?",
      "What's the story you tell yourself about why?",
    ],
    reflect:
      "Got it. The block isn't \"you're not trying hard enough.\" It sounds more like past-evidence — you've been keeping receipts. We'll work with that exactly, not around it.",
  },
  {
    id: "body",
    label: "Round 3 · The Body",
    heading: "When you imagine already having this — where do you feel it?",
    prompts: [
      "Expansion or tightening?",
      "Chest, stomach, throat, behind the eyes — where does it live?",
    ],
    reflect:
      "Notice that. The body is the most honest reporter you have. If there's tightening, we don't override it — we soften it. That's what Phase 2 is for.",
  },
  {
    id: "self",
    label: "Round 4 · The Self",
    heading: "Who are you now in relation to this desire?",
    prompts: [
      "How far does the future self feel?",
      "What's one word for who you'd need to become?",
    ],
    reflect:
      "Hold that word. That word is the doorway. Every practice in here is just a different way of walking through it.",
  },
  {
    id: "practice",
    label: "Round 5 · The Practice",
    heading: "How will you actually show up?",
    prompts: [
      "Morning or evening person?",
      "How much time daily — honest answer, not aspirational?",
      "What's worked before? What hasn't?",
    ],
    reflect:
      "Perfect. We'll build the morning ritual around that. Five to ten minutes, every day, the same direction. Practice is the whole game.",
  },
];

export function Onboarding() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<"answer" | "reflect">("answer");
  const [showProfile, setShowProfile] = useState(false);

  const round = rounds[i];

  function submit(text: string) {
    if (!text.trim()) return;
    setAnswers({ ...answers, [round.id]: text });
    setStage("reflect");
  }

  function next() {
    if (i < rounds.length - 1) {
      setI(i + 1);
      setStage("answer");
    } else {
      setShowProfile(true);
    }
  }

  if (showProfile) return <BeliefProfile answers={answers} />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-8 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <Link href="/" className="text-[12px] text-ink-muted hover:text-ink">
          ← skip onboarding
        </Link>
      </div>
      <div className="px-8 max-w-2xl mx-auto w-full mb-2">
        <div className="flex gap-1.5">
          {rounds.map((_, n) => (
            <span
              key={n}
              className={
                "h-1 rounded-full flex-1 transition-colors " +
                (n <= i ? "bg-terracotta" : "bg-line")
              }
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-2xl w-full page-fade">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
            {round.label}
          </div>
          <h1 className="font-display text-[36px] sm:text-[42px] text-ink leading-[1.1] mb-5">
            {round.heading}
          </h1>
          <ul className="space-y-1.5 mb-7">
            {round.prompts.map((p, n) => (
              <li key={n} className="text-[14px] text-ink-soft">— {p}</li>
            ))}
          </ul>

          {stage === "answer" ? (
            <AnswerInput onSubmit={submit} />
          ) : (
            <Reflection text={round.reflect} onNext={next} isLast={i === rounds.length - 1} />
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Say it like it's real."
        className="w-full p-5 bg-surface border border-line rounded-xl text-[15.5px] focus:outline-none focus:border-terracotta resize-none"
        autoFocus
      />
      <div className="mt-5 flex justify-end">
        <button
          onClick={() => onSubmit(text)}
          disabled={!text.trim()}
          className="px-6 py-2.5 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors disabled:opacity-30"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function Reflection({ text, onNext, isLast }: { text: string; onNext: () => void; isLast: boolean }) {
  return (
    <div className="page-fade">
      <div className="flex gap-3 p-5 bg-surface border-l-2 border-terracotta rounded-r-xl">
        <div
          className="w-7 h-7 rounded-full shrink-0 mt-0.5"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
          }}
        />
        <p className="font-display text-[16.5px] leading-[1.65] text-ink-soft">
          {text}
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
        >
          {isLast ? "See my belief profile →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function BeliefProfile({ answers }: { answers: Record<string, string> }) {
  return (
    <div className="min-h-screen bg-background flex flex-col page-fade">
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-2xl w-full">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
            Your Belief Profile
          </div>
          <h1 className="font-display text-[36px] text-ink leading-tight mb-6">
            Here's what I see — honestly.
          </h1>

          <div className="bg-surface border border-line rounded-2xl p-7 mb-6">
            <p className="font-display text-[18px] leading-[1.65] text-ink-soft">
              You want{" "}
              <span className="text-ink italic">
                {answers.desire || "more than the version of life you're currently allowing yourself"}
              </span>
              . You've been keeping a quiet ledger of every time it didn't land — and that
              ledger has become the loudest voice in the room. Your body knows: when
              you reach for the desire, something{" "}
              <span className="text-ink italic">
                {answers.body || "tightens"}
              </span>
              . Your future self isn't far away. She's just been waiting for you to stop
              flinching when she walks in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface border border-line rounded-xl p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
                Primary block type
              </div>
              <div className="font-display text-[18px] text-ink">Past evidence</div>
              <p className="text-[12px] text-ink-muted mt-1">
                "It hasn't worked, so it won't."
              </p>
            </div>
            <div className="bg-surface border border-line rounded-xl p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">
                Direction
              </div>
              <div className="font-display text-[18px] text-ink">
                {answers.self || "Becoming"}
              </div>
              <p className="text-[12px] text-ink-muted mt-1">
                Your future self's one-word doorway.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-ink text-surface text-[13.5px] hover:bg-ink-soft transition-colors"
          >
            Begin Phase 1 — The Honest Audit
          </Link>
        </div>
      </div>
    </div>
  );
}
