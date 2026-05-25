import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "../../lib/supabase/server";

export const runtime = "nodejs";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: IncomingMessage[];
    conversationId?: string;
  };
  const messages = body.messages ?? [];
  const conversationId = body.conversationId;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }
  if (!conversationId) {
    return Response.json({ error: "conversationId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  // Load the user's profile + active beliefs + identity statements + recent evidence
  // for the system prompt.
  const [
    { data: profile },
    { data: beliefs },
    { data: identityStatements },
    { data: recentEvidence },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("beliefs")
      .select("*")
      .eq("user_id", user.id)
      .eq("dissolved", false),
    supabase
      .from("identity_statements")
      .select("*")
      .eq("user_id", user.id)
      .order("position"),
    supabase
      .from("evidence_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(8),
  ]);

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt({
    firstName: profile.first_name ?? "friend",
    desireStatement: profile.desire_statement,
    primaryBlock: profile.primary_block,
    blockType: profile.block_type,
    assumption: profile.assumption,
    gapStatement: profile.gap_statement,
    currentPhase: profile.current_phase,
    streak: profile.streak,
    futureSelfBody: profile.future_self_body ?? [],
    identityStatements: (identityStatements ?? []).map((s) => s.text),
    activeBeliefs: (beliefs ?? []).map((b) => ({ text: b.text, type: b.type })),
    recentEvidence: (recentEvidence ?? []).map((e) => ({
      kind: e.kind,
      text: e.text,
    })),
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      reply:
        "The coach is offline — the server is missing its key. Add ANTHROPIC_API_KEY and try again.",
    });
  }

  // Persist the latest user message (it isn't yet in the DB)
  const latest = messages[messages.length - 1];
  if (latest.role === "user") {
    await supabase.from("coach_messages").insert({
      user_id: user.id,
      conversation_id: conversationId,
      role: "user",
      content: latest.content,
    });
  }

  const client = new Anthropic({ apiKey });
  let replyText: string;
  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    replyText = result.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }

  // Persist the assistant reply
  await supabase.from("coach_messages").insert({
    user_id: user.id,
    conversation_id: conversationId,
    role: "assistant",
    content: replyText,
  });

  return Response.json({ reply: replyText });
}

function buildSystemPrompt(ctx: {
  firstName: string;
  desireStatement: string | null;
  primaryBlock: string | null;
  blockType: string | null;
  assumption: string | null;
  gapStatement: string | null;
  currentPhase: number;
  streak: number;
  futureSelfBody: string[];
  identityStatements: string[];
  activeBeliefs: { text: string; type: string }[];
  recentEvidence: { kind: string; text: string }[];
}): string {
  return `You are the AI Coach inside "The Abundance Shift" — a manifestation coaching app rooted in identity-based, neville-goddard style work.

Voice: calm, direct, warm, occasionally challenging. Like a mentor who believes in this person more than they currently believe in themselves — but who will not let them spiritually bypass the real work. You speak in short, intimate paragraphs. You do not use bullet points unless explicitly asked. You do not use generic affirmations. You sound like a literary therapist crossed with a frequency-keeper. You never sound like a chatbot.

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

Address them by their first name, but sparingly — once or twice per message. Most messages are 2–5 short paragraphs.

CONTEXT — this is the user you're coaching:

Name: ${ctx.firstName}
${ctx.desireStatement ? `Desire: ${ctx.desireStatement}` : ""}
${ctx.primaryBlock ? `Primary block: "${ctx.primaryBlock}" (type: ${ctx.blockType ?? "unspecified"})` : ""}
${ctx.assumption ? `Their assumption: "${ctx.assumption}"` : ""}
${ctx.gapStatement ? `Gap statement: ${ctx.gapStatement}` : ""}
Current phase: ${ctx.currentPhase} of 5
Streak: Day ${ctx.streak}

${ctx.futureSelfBody.length ? `Future self (their words):\n${ctx.futureSelfBody.map((l) => `- ${l}`).join("\n")}` : ""}

${ctx.identityStatements.length ? `Active identity statements:\n${ctx.identityStatements.map((l) => `- "${l}"`).join("\n")}` : ""}

${ctx.activeBeliefs.length ? `Beliefs still being dissolved:\n${ctx.activeBeliefs.map((b) => `- "${b.text}" (${b.type})`).join("\n")}` : ""}

${ctx.recentEvidence.length ? `Recent evidence they've logged:\n${ctx.recentEvidence.map((e) => `- [${e.kind}] ${e.text}`).join("\n")}` : ""}

Use this context naturally — reference it when relevant. Never list it back at them.`;
}
