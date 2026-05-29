"use client";

import { useState, useTransition } from "react";
import {
  addIdentityStatement,
  updateIdentityStatement,
  deleteIdentityStatement,
} from "../../actions/identity";

interface Statement {
  id: string;
  text: string;
}

export function IdentityStatementsEditor({ initial }: { initial: Statement[] }) {
  const [statements, setStatements] = useState<Statement[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Mirror the practice flow's rotation: today's statement.
  const todayIndex = statements.length
    ? new Date().getDate() % statements.length
    : -1;

  function startEdit(s: Statement) {
    setEditingId(s.id);
    setDraft(s.text);
  }

  function saveEdit(id: string) {
    const next = draft.trim();
    if (!next) return;
    startTransition(async () => {
      const res = await updateIdentityStatement(id, next);
      if (res.ok) {
        setStatements((prev) =>
          prev.map((s) => (s.id === id ? { ...s, text: next } : s)),
        );
        setEditingId(null);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteIdentityStatement(id);
      if (res.ok) setStatements((prev) => prev.filter((s) => s.id !== id));
    });
  }

  function add() {
    const next = newText.trim();
    if (!next) return;
    startTransition(async () => {
      const res = await addIdentityStatement(next);
      if (res.ok && res.id) {
        setStatements((prev) => [...prev, { id: res.id!, text: next }]);
        setNewText("");
        setAdding(false);
      }
    });
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[20px] text-ink">Identity statements</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-[12px] text-terracotta hover:text-ink transition-colors"
          >
            + Add statement
          </button>
        )}
      </div>

      {statements.length === 0 && !adding ? (
        <p className="text-[13px] text-ink-muted">
          No statements yet. Add the first "I am" line you want to live from.
        </p>
      ) : (
        <div className="space-y-2">
          {statements.map((s, i) => {
            const isToday = i === todayIndex;
            const isEditing = editingId === s.id;
            return (
              <div
                key={s.id}
                className={
                  "bg-surface border rounded-xl px-5 py-4 " +
                  (isToday ? "border-terracotta/60" : "border-line")
                }
              >
                {isEditing ? (
                  <div>
                    <textarea
                      rows={2}
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full bg-background border border-line rounded-lg p-3 font-display text-[16px] text-ink focus:outline-none focus:border-terracotta resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(s.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-lg bg-ink text-surface text-[12px] hover:bg-ink-soft transition-colors disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-line text-[12px] text-ink-soft hover:bg-surface-2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="font-display text-[22px] text-terracotta/70 w-8 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-display text-[17px] text-ink leading-snug flex-1">
                      "{s.text}"
                    </p>
                    {isToday && (
                      <span className="text-[9px] uppercase tracking-[0.16em] text-terracotta shrink-0">
                        Today
                      </span>
                    )}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(s)}
                        className="text-[11px] text-ink-muted hover:text-terracotta transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        disabled={isPending}
                        className="text-[11px] text-ink-muted hover:text-sos transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <div className="bg-surface border border-terracotta/40 rounded-xl px-5 py-4 mt-2">
          <textarea
            rows={2}
            value={newText}
            autoFocus
            placeholder="I am the kind of person who…"
            onChange={(e) => setNewText(e.target.value)}
            className="w-full bg-background border border-line rounded-lg p-3 font-display text-[16px] text-ink focus:outline-none focus:border-terracotta resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={add}
              disabled={isPending || !newText.trim()}
              className="px-3 py-1.5 rounded-lg bg-ink text-surface text-[12px] hover:bg-ink-soft transition-colors disabled:opacity-60"
            >
              {isPending ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewText("");
              }}
              className="px-3 py-1.5 rounded-lg border border-line text-[12px] text-ink-soft hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {statements.length > 0 && (
        <p className="text-[11px] text-ink-muted mt-3">
          The highlighted statement rotates daily — it's the one your morning ritual surfaces today.
        </p>
      )}
    </section>
  );
}
