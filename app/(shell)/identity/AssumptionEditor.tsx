"use client";

import { useState, useTransition } from "react";
import { updateAssumption } from "../../actions/identity";

export function AssumptionEditor({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    const next = value.trim();
    if (!next || next === saved) {
      setEditing(false);
      setValue(saved);
      return;
    }
    startTransition(async () => {
      const res = await updateAssumption(next);
      if (res.ok) {
        setSaved(next);
        setEditing(false);
      }
    });
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          My assumption — I live from this
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] text-ink-muted hover:text-terracotta transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      <div className="bg-surface-2/60 border border-line rounded-2xl p-7">
        {editing ? (
          <div>
            <textarea
              rows={3}
              value={value}
              autoFocus
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-background border border-line rounded-lg p-4 font-display text-[24px] text-ink leading-[1.2] focus:outline-none focus:border-terracotta resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={save}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setValue(saved);
                }}
                className="px-4 py-2 rounded-lg border border-line text-[13px] text-ink-soft hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="font-display text-[26px] sm:text-[30px] text-ink leading-[1.2]">
            "{saved}"
          </p>
        )}
      </div>
    </div>
  );
}
