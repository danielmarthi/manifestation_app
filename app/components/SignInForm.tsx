"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export function SignInForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    setError(null);

    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setError(error.message);
      setState("error");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="bg-surface border border-line rounded-2xl p-7 page-fade">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ochre mb-2">
          Check your inbox
        </div>
        <h2 className="font-display text-[22px] text-ink leading-tight mb-3">
          The link is on its way.
        </h2>
        <p className="text-[14px] text-ink-soft leading-relaxed">
          Open <span className="text-ink">{email}</span> and click the link from
          Supabase. It will return you here, signed in. Check spam if it
          doesn't arrive within a minute.
        </p>
        <button
          onClick={() => {
            setState("idle");
            setEmail("");
          }}
          className="mt-5 text-[12px] text-ink-muted hover:text-ink"
        >
          Use a different email →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Your email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.com"
          autoComplete="email"
          autoFocus
          className="mt-2 w-full px-5 py-3.5 bg-surface border border-line rounded-xl text-[15px] focus:outline-none focus:border-terracotta"
        />
      </label>

      <button
        type="submit"
        disabled={state === "sending" || !email.trim()}
        className="w-full px-6 py-3.5 rounded-xl bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors disabled:opacity-40"
      >
        {state === "sending" ? "Sending the link…" : "Send me the link"}
      </button>

      {error && (
        <p className="text-[12.5px] text-sos pt-2">
          {error}
        </p>
      )}
    </form>
  );
}
