"use client";

import { useEffect, useRef, useState } from "react";
import { mockUser } from "../lib/mockUser";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "I'm feeling resistance.",
  "Write me a new visualization.",
  "Help me reframe something.",
  "I need to do The Test Reframe.",
];

const OPENERS = [
  `Good morning, ${mockUser.firstName}. Day ${mockUser.streak} — you've kept showing up. What's alive for you this morning?`,
  `Hi ${mockUser.firstName}. I noticed yesterday you logged an unexpected refund. That's the third small return this week. Want to talk about what that's training in you?`,
  `${mockUser.firstName}. Welcome back. Your assumption today is "${mockUser.assumption}" — how true does that sentence feel right now, on a scale you actually mean?`,
];

export function CoachConversation() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [opener] = useState(() => OPENERS[Math.floor(Math.random() * OPENERS.length)]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const reply: string =
        data.reply ||
        data.error ||
        "The coach is silent for a moment. Try again.";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Something interrupted the line. Take a breath — try again when you're ready.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-fade flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="px-8 lg:px-12 pt-8 pb-4 max-w-3xl mx-auto w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
          AI Coach
        </div>
        <h1 className="font-display text-[28px] text-ink leading-tight">
          {opener}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 lg:px-12">
        <div className="max-w-3xl mx-auto py-4 space-y-6">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse [animation-delay:240ms]" />
              <span className="text-[12px] italic">she's listening</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-line/70 bg-surface/70 px-8 lg:px-12 py-5">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[12.5px] px-3 py-1.5 rounded-full border border-line text-ink-soft hover:bg-surface-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say what's true right now…"
              className="flex-1 px-4 py-3 bg-background border border-line rounded-xl text-[14.5px] focus:outline-none focus:border-terracotta"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 rounded-xl bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-surface-2 border border-line/60 rounded-2xl rounded-tr-sm px-5 py-3 text-[14.5px] text-ink leading-[1.55] whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full shrink-0 mt-1"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
        }}
      />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-1">
          Coach
        </div>
        <div className="font-display text-[16px] leading-[1.65] text-ink whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
