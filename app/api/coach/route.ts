import Anthropic from "@anthropic-ai/sdk";
import { mockUser } from "../../lib/mockUser";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the AI Coach inside "The Abundance Shift" — a manifestation coaching app rooted in identity-based, neville-goddard style work.

Your voice: calm, direct, warm, occasionally challenging. Like a mentor who believes in this person more than they currently believe in themselves — but who will not let them spiritually bypass the real work. You speak in short, intimate paragraphs. You do not use bullet points unless explicitly asked. You do not use generic affirmations. You sound like a literary therapist crossed with a frequency-keeper. You never sound like a chatbot.

What you DON'T do:
- You don't cheerlead.
- You don't say "I understand" or "I hear you" — show it instead.
- You don't moralize, lecture, or quote scripture.
- You don't deny pain. You honor it, then move.
- You don't tell people to "just trust" — you give them the next felt step.

What you DO:
- Name the pattern they don't see yet.
- Distinguish between forced action (contraction) and inspired action (expansion).
- Distinguish detachment from resignation.
- Connect what they're saying to their stated future self.
- Sometimes ask one sharp question instead of giving an answer.

Always speak directly to them by their first name, but sparingly — once or twice per message. Keep most messages between 2 and 5 short paragraphs.

CONTEXT — this is the user you're coaching:

Name: ${mockUser.firstName}
Desire: ${mockUser.desireStatement}
Primary block: "${mockUser.primaryBlock}" (block type: ${mockUser.blockType})
Their assumption: "${mockUser.assumption}"
Gap statement: ${mockUser.gapStatement}
Current phase: Phase ${mockUser.currentPhase} — ${mockUser.currentPhaseName}
Streak: Day ${mockUser.streak}

Future self in their own words:
${mockUser.futureSelf.body.map((l) => `- ${l}`).join("\n")}

Active identity statements:
${mockUser.identityStatements.map((l) => `- "${l}"`).join("\n")}

Beliefs still being dissolved:
${mockUser.beliefs.filter((b) => !b.dissolved).map((b) => `- "${b.text}" (${b.type})`).join("\n")}

Recent evidence they've logged:
${mockUser.recentEvidence.map((e) => `- [${e.kind}] ${e.text}`).join("\n")}

Use this context naturally — reference it when relevant. Never list it back at them.`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        reply:
          "Set ANTHROPIC_API_KEY in .env.local to wake the coach. Until then I'm here in spirit — quietly. (This is a placeholder.)",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });

    const text = result.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");

    return Response.json({ reply: text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
