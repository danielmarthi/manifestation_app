"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeProgram } from "../../../actions/phases";

interface Props {
  firstName?: string;
  futureSelfName?: string;
  futurePortrait?: string;
  futureTags: string[];
  assumption?: string;
  totalDays: number;
  completionMessage: string;
  milestoneCount: number;
}

export function ProgramCompleteClient({
  firstName,
  futureSelfName,
  futurePortrait,
  futureTags,
  assumption,
  totalDays,
  completionMessage,
  milestoneCount,
}: Props) {
  const router = useRouter();
  const [finalising, setFinalising] = useState(false);
  const [, startTransition] = useTransition();

  function handleContinue() {
    setFinalising(true);
    startTransition(async () => {
      await completeProgram();
      router.push("/today");
    });
  }

  return (
    <div className="page-fade min-h-screen flex flex-col items-center justify-start px-8 lg:px-12 py-16 max-w-[800px] mx-auto">
      {/* Orb */}
      <div
        className="w-20 h-20 rounded-full mb-8"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
          boxShadow:
            "0 0 60px rgba(212,168,73,0.5), 0 0 120px rgba(212,168,73,0.2)",
        }}
      />

      {/* Label */}
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">
        Program complete
      </div>

      {/* Headline */}
      <h1 className="font-display text-[44px] text-ink text-center leading-tight mb-3">
        {futureSelfName ?? firstName ?? "You"}.
      </h1>

      <p className="text-[16px] text-ink-muted text-center mb-12">
        {totalDays} active days ·{" "}
        {milestoneCount} milestone{milestoneCount === 1 ? "" : "s"} reached ·
        four phases walked
      </p>

      {/* Completion message */}
      <div className="w-full bg-surface border border-line rounded-2xl p-8 mb-8">
        <div className="space-y-5">
          {completionMessage.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className={
                "leading-[1.85] " +
                (i === completionMessage.split("\n\n").length - 1
                  ? "font-display text-[18px] text-ink"
                  : "text-[15px] text-ink-soft")
              }
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Future self portrait */}
      {futurePortrait && (
        <div className="w-full border border-gold/30 bg-gold/5 rounded-2xl px-7 py-6 mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">
            {futureSelfName ?? "Your future self"}
          </div>
          <p className="text-[14px] text-ink leading-[1.8] italic">
            "{futurePortrait.slice(0, 400)}{futurePortrait.length > 400 ? "..." : ""}"
          </p>
          {futureTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {futureTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-gold/40 text-gold bg-gold/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assumption */}
      {assumption && (
        <div className="w-full border border-line rounded-xl px-6 py-4 mb-10 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
            Your assumption
          </div>
          <p className="font-display text-[18px] text-ink">{assumption}</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={finalising}
        className="px-8 py-3.5 bg-terracotta text-parchment rounded-xl font-display text-[16px] hover:bg-terracotta/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {finalising ? "Continuing..." : "Return to today →"}
      </button>

      <p className="text-[12px] text-ink-muted mt-4 text-center">
        The program is complete. The practice continues.
      </p>
    </div>
  );
}
