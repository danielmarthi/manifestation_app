"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { submitExercise } from "../../../../actions/phases";

interface Props {
  slug: string;
  phase: number;
  title: string;
  subtitle: string;
  isCore: boolean;
  context: string;
  instruction: string;
  prompt: string;
  cta: string;
  prefillContent: string | null;
  prefillLabel: string | null;
  existingResponse: string | null;
  existingAiResponse: string | null;
  firstName?: string;
}

export function ExerciseClient({
  slug,
  phase,
  title,
  subtitle,
  isCore,
  context,
  instruction,
  prompt,
  cta,
  prefillContent,
  prefillLabel,
  existingResponse,
  existingAiResponse,
  firstName,
}: Props) {
  const [response, setResponse] = useState(existingResponse ?? "");
  const [aiResponse, setAiResponse] = useState(existingAiResponse ?? "");
  const [submitted, setSubmitted] = useState(!!existingResponse);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const aiRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to AI response on reveal
  useEffect(() => {
    if (aiResponse && !existingAiResponse) {
      setTimeout(() => {
        aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [aiResponse, existingAiResponse]);

  function handleSubmit() {
    if (response.trim().length < 10) {
      setError("Please write at least a sentence before submitting.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await submitExercise(slug, response.trim(), prefillContent);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      if (result.aiResponse) {
        setAiResponse(result.aiResponse);
      }
    });
  }

  return (
    <div className="page-fade px-8 lg:px-12 py-10 max-w-[760px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-ink-muted mb-8">
        <Link href="/phases" className="hover:text-ink transition-colors">
          Phases
        </Link>
        <span className="opacity-40">›</span>
        <Link
          href={`/phases/${phase}`}
          className="hover:text-ink transition-colors"
        >
          Phase {phase}
        </Link>
        <span className="opacity-40">›</span>
        <span className="text-ink-soft">{title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {isCore && (
            <span className="text-[9px] uppercase tracking-[0.18em] text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded">
              Core
            </span>
          )}
          {submitted && (
            <span className="text-[9px] uppercase tracking-[0.18em] text-ochre bg-ochre/10 px-1.5 py-0.5 rounded">
              ✓ Complete
            </span>
          )}
        </div>
        <h1 className="font-display text-[38px] text-ink leading-tight mb-1">
          {title}
        </h1>
        <p className="text-[15px] text-ink-muted">{subtitle}</p>
      </div>

      {/* Context block */}
      <div className="bg-surface border border-line rounded-2xl p-7 mb-8">
        <p className="text-[14px] text-ink-soft leading-[1.8] whitespace-pre-line">
          {context}
        </p>
      </div>

      {/* Pre-fill block — FROM YOUR INTAKE */}
      {prefillContent && (
        <div className="mb-6">
          {prefillLabel && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
              {prefillLabel}
            </div>
          )}
          <div className="border border-line/60 rounded-xl px-5 py-4 bg-surface/50 relative">
            <div className="absolute top-3 right-3">
              <span className="text-[9px] uppercase tracking-[0.16em] text-ink-muted/60 bg-surface border border-line/40 px-1.5 py-0.5 rounded">
                From your intake
              </span>
            </div>
            <p className="text-[13.5px] text-ink-soft leading-[1.75] whitespace-pre-line pr-20">
              {prefillContent}
            </p>
          </div>
        </div>
      )}

      {/* Exercise prompt + textarea */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
          {instruction}
        </div>
        <p className="text-[15px] text-ink leading-[1.7] mb-4 font-medium">
          {prompt}
        </p>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={submitted && !!existingResponse}
          placeholder={
            firstName
              ? `${firstName}, write what's true for you here...`
              : "Write what's true for you here..."
          }
          rows={8}
          className={
            "w-full rounded-xl border px-5 py-4 text-[14px] text-ink leading-[1.75] placeholder:text-ink-muted/50 bg-surface resize-none focus:outline-none transition-colors " +
            (submitted && existingResponse
              ? "border-line/40 opacity-80 cursor-default"
              : "border-line focus:border-terracotta/60")
          }
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-[12.5px] text-terracotta mb-4">{error}</p>
      )}

      {/* Submit / re-do controls */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={isPending || response.trim().length < 10}
          className="px-6 py-3 bg-terracotta text-parchment rounded-xl text-[13px] font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : cta}
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-ink-muted">
            ✓ Saved
            {existingResponse && !aiResponse
              ? ""
              : ""}
          </span>
          <button
            onClick={() => {
              setSubmitted(false);
              setAiResponse("");
            }}
            className="text-[12px] text-ink-muted hover:text-ink transition-colors underline underline-offset-2"
          >
            Edit response
          </button>
          <Link
            href={`/phases/${phase}`}
            className="text-[12px] text-ink-soft hover:text-ink transition-colors"
          >
            ← Back to phase
          </Link>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && (
        <div ref={aiRef} className="mt-10 pt-10 border-t border-line">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">
            Your coach reflects
          </div>
          <div className="space-y-4">
            {aiResponse.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="text-[15px] text-ink leading-[1.8]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Navigation to next exercise */}
          <div className="mt-8 flex items-center gap-4">
            <Link
              href={`/phases/${phase}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-line text-ink-soft rounded-xl text-[13px] hover:bg-surface-2 transition-colors"
            >
              ← Back to phase
            </Link>
          </div>
        </div>
      )}

      {/* Show existing AI response even if not re-submitting */}
      {submitted && existingAiResponse && !aiResponse && (
        <div className="mt-10 pt-10 border-t border-line">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">
            Your coach reflected
          </div>
          <div className="space-y-4">
            {existingAiResponse.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-[15px] text-ink leading-[1.8]">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={`/phases/${phase}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-line text-ink-soft rounded-xl text-[13px] hover:bg-surface-2 transition-colors"
            >
              ← Back to phase
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
