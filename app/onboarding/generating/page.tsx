"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateFullProfile } from "../../actions/onboarding";

const MESSAGES = [
  "Reading what you wrote...",
  "Finding the thread that runs through it...",
  "Building who you're becoming...",
  "Mapping the gap...",
  "Almost there...",
];

export default function GeneratingPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Rotate messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Trigger generation on mount
  useEffect(() => {
    startTransition(async () => {
      const result = await generateFullProfile();
      if (result.success) {
        router.push("/onboarding/reveal");
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8 page-fade">
        <div className="max-w-md w-full text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-sos mb-3">
            The coach paused
          </div>
          <h1 className="font-display text-[26px] text-ink leading-tight mb-4">
            Something interrupted the line.
          </h1>
          <p className="text-[14px] text-ink-soft mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await generateFullProfile();
                if (result.success) {
                  router.push("/onboarding/reveal");
                } else {
                  setError(result.error ?? "Something went wrong.");
                }
              });
            }}
            className="px-6 py-3 rounded-full bg-ink text-surface text-[13.5px] hover:bg-ink-soft transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-8 page-fade">
      <div className="text-center max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-full breath-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(212,168,73,0.7) 0%, rgba(179,90,58,0.25) 55%, transparent 80%)",
            }}
          />
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
          Building your profile
        </div>
        <h1 className="font-display text-[28px] text-ink leading-tight mb-6">
          Composing your identity portrait.
        </h1>
        <p
          key={messageIndex}
          className="text-[15px] text-ink-soft transition-opacity duration-500 page-fade"
        >
          {MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
