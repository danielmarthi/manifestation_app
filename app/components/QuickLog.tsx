"use client";

import { useState } from "react";
import { Plus, Spark, Heart, Flame } from "./Icons";

type Kind = "win" | "synchronicity" | "receiving" | "resistance";

const kinds: { id: Kind; label: string; hint: string }[] = [
  { id: "win", label: "A small win", hint: "Something that landed today, however small." },
  { id: "synchronicity", label: "A synchronicity", hint: "A nudge from the universe — a name, a number, a door opening." },
  { id: "receiving", label: "Receiving", hint: "Something that came without forcing." },
  { id: "resistance", label: "Resistance", hint: "A thought, a tightening — log it to dissolve it." },
];

export function QuickLog() {
  const [active, setActive] = useState<Kind | null>(null);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  function save() {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setActive(null);
      setText("");
    }, 1500);
  }

  return (
    <section className="bg-surface-2/60 border border-line rounded-2xl p-7">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">
            Quick log
          </div>
          <h2 className="font-display text-[20px] text-ink">
            Log a moment in 20 seconds
          </h2>
        </div>
      </div>
      <p className="text-[12.5px] text-ink-muted mb-5">
        Train the eye to see what's already arriving.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {kinds.map((k) => {
          const Icon = k.id === "resistance" ? Flame : k.id === "receiving" ? Heart : Spark;
          const isActive = active === k.id;
          return (
            <button
              key={k.id}
              onClick={() => setActive(k.id)}
              className={
                "px-3 py-3 rounded-lg border text-left transition-all flex items-start gap-2 " +
                (isActive
                  ? "bg-ink text-surface border-ink"
                  : "bg-background border-line text-ink-soft hover:border-ink-muted")
              }
            >
              <Icon className={isActive ? "text-gold-soft mt-0.5" : "text-ink-muted mt-0.5"} />
              <span className="text-[12.5px] leading-tight">{k.label}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="page-fade">
          <div className="text-[12px] text-ink-muted mb-2">
            {kinds.find((k) => k.id === active)?.hint}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="In one line…"
              className="flex-1 px-4 py-2.5 bg-background border border-line rounded-lg text-[14px] focus:outline-none focus:border-terracotta"
            />
            <button
              onClick={save}
              className={
                "px-5 rounded-lg text-[13px] transition-colors flex items-center gap-1.5 " +
                (saved
                  ? "bg-ochre text-surface"
                  : "bg-ink text-surface hover:bg-ink-soft")
              }
            >
              {saved ? "Logged ✓" : (<><Plus /> Log</>)}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
