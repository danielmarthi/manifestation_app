"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advancePhase } from "../../../actions/phases";

export function AdvanceButton({
  phaseNum,
  label,
}: {
  phaseNum: number;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function go() {
    setBusy(true);
    setError(null);
    startTransition(async () => {
      const res = await advancePhase();
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      if (res.programComplete) {
        router.push("/phases/complete");
      } else if (res.newPhase) {
        router.push(`/phases/${res.newPhase}`);
      } else {
        router.push("/phases");
      }
    });
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-parchment rounded-xl text-[13px] font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {busy ? "Advancing…" : label}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7h8M7 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {error && <p className="mt-2 text-[12px] text-sos">{error}</p>}
    </div>
  );
}
