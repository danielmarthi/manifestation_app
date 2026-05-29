"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "../lib/supabase/server";
import { getExerciseBySlug, getCoreExercisesByPhase } from "../lib/exercises";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ─── Submit exercise ──────────────────────────────────────────────────────────

export async function submitExercise(
  slug: string,
  response: string,
  prefillContent: string | null,
): Promise<{ ok: boolean; aiResponse?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const def = getExerciseBySlug(slug);
  if (!def) return { ok: false, error: "Unknown exercise." };

  // Fetch profile for template variables + coach style
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, desire_area, future_self_name, old_self_name, assumption, coach_style, future_self_portrait, old_self_portrait, coaching_notes",
    )
    .eq("id", user.id)
    .single();

  // Generate AI response using the exercise's aiInstruction
  let aiResponse: string | null = null;
  try {
    const coachStyle = (profile?.coach_style ?? "mentor") as
      | "mentor"
      | "strategist"
      | "guide";

    const STYLE_MAP: Record<string, string> = {
      mentor: `Speak with warmth, wisdom, and gentle challenge. Use "I notice..." and "What I see in you..." framings. Affirm before redirecting. Never lecture — illuminate.`,
      strategist: `Be precise, direct, and insight-dense. Name patterns without sentiment. Offer the clearest possible lens on what they've written. Respect their intelligence.`,
      guide: `Speak poetically and expansively. Reflect their words back as larger truths. Use metaphor. Help them feel the significance of what they're uncovering.`,
    };

    const systemPrompt = `You are an expert consciousness coach trained in Reality Transurfing and Joe Dispenza's work. Your role is to respond to a user's exercise response with insight that moves them forward — not praise, not hollow affirmation. Real coaching.

${STYLE_MAP[coachStyle]}

User's future self portrait: ${profile?.future_self_portrait ?? "Not yet defined."}
User's desire area: ${profile?.desire_area ?? "Not specified."}
${profile?.coaching_notes ? `\nPrivate coaching context (never reference directly): ${profile.coaching_notes}` : ""}

Exercise instruction given to user: ${def.aiInstruction}

Respond in 2–4 short paragraphs. No bullet points. No headers. No "Great job!" Start directly with substance.`;

    const userContent = prefillContent
      ? `[Context shown to user from their intake]\n${prefillContent}\n\n[Their written response]\n${response}`
      : response;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    aiResponse =
      msg.content[0]?.type === "text" ? msg.content[0].text.trim() : null;
  } catch (err) {
    console.error("Exercise AI response error:", err);
    // Non-fatal — save the exercise without AI response
  }

  // Upsert into phase_exercises
  const { error } = await supabase.from("phase_exercises").upsert(
    {
      user_id: user.id,
      phase: def.phase,
      slug,
      prefill_content: prefillContent,
      response,
      ai_response: aiResponse,
    },
    { onConflict: "user_id,slug" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/phases/${def.phase}/${slug}`);
  revalidatePath(`/phases/${def.phase}`);
  revalidatePath("/phases");
  revalidatePath("/today");

  return { ok: true, aiResponse: aiResponse ?? undefined };
}

// ─── Advance phase ────────────────────────────────────────────────────────────

export async function advancePhase(): Promise<{
  ok: boolean;
  newPhase?: number;
  programComplete?: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_phase")
    .eq("id", user.id)
    .single();

  if (!profile) return { ok: false, error: "Profile not found." };

  const currentPhase = profile.current_phase ?? 1;
  if (currentPhase >= 4) {
    // Program complete
    await supabase
      .from("profiles")
      .update({ program_completed_at: new Date().toISOString() })
      .eq("id", user.id);
    revalidatePath("/");
    return { ok: true, programComplete: true };
  }

  const newPhase = currentPhase + 1;
  const { error } = await supabase
    .from("profiles")
    .update({ current_phase: newPhase })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/phases");
  revalidatePath("/today");
  return { ok: true, newPhase };
}

// ─── Check phase readiness ────────────────────────────────────────────────────

export async function checkPhaseReadiness(phase: number): Promise<{
  ready: boolean;
  missingCore: string[];
  ritualShortfall?: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ready: false, missingCore: [] };

  // Get completed exercise slugs for this phase
  const { data: completedRows } = await supabase
    .from("phase_exercises")
    .select("slug")
    .eq("user_id", user.id)
    .eq("phase", phase);

  const completedSlugs = new Set((completedRows ?? []).map((r) => r.slug));
  const coreExercises = getCoreExercisesByPhase(phase);
  const missingCore = coreExercises
    .filter((e) => !completedSlugs.has(e.slug))
    .map((e) => e.slug);

  if (phase !== 4) {
    return { ready: missingCore.length === 0, missingCore };
  }

  // Phase 4: also need 10 of last 14 completed ritual days
  const { data: recentLogs } = await supabase
    .from("practice_log")
    .select("practice_date, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("practice_date", { ascending: false })
    .limit(14);

  const ritualDays = (recentLogs ?? []).filter(
    (r) => r.completed_at !== null,
  ).length;
  const ritualShortfall = Math.max(0, 10 - ritualDays);

  return {
    ready: missingCore.length === 0 && ritualShortfall === 0,
    missingCore,
    ritualShortfall: ritualShortfall > 0 ? ritualShortfall : undefined,
  };
}

// ─── Complete program ─────────────────────────────────────────────────────────

export async function completeProgram(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      program_completed_at: new Date().toISOString(),
      current_phase: 4,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/phases");
  revalidatePath("/today");
  return { ok: true };
}

// ─── Generate weekly insight ──────────────────────────────────────────────────

export async function generateWeeklyInsight(
  weekNumber: number,
  evidenceEntries: Array<{ kind: string; text: string; occurred_at: string }>,
): Promise<{ ok: boolean; content?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Check if insight already exists
  const { data: existing } = await supabase
    .from("weekly_insights")
    .select("id, content")
    .eq("user_id", user.id)
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (existing) return { ok: true, content: existing.content };

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, desire_area, future_self_name, coach_style")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name ?? "you";
  const desireArea = profile?.desire_area ?? "your life";

  try {
    const entriesByKind = {
      win: evidenceEntries.filter((e) => e.kind === "win"),
      synchronicity: evidenceEntries.filter((e) => e.kind === "synchronicity"),
      receiving: evidenceEntries.filter((e) => e.kind === "receiving"),
      resistance: evidenceEntries.filter((e) => e.kind === "resistance"),
    };

    const formatEntries = (entries: typeof evidenceEntries) =>
      entries.map((e) => `- ${e.text}`).join("\n") || "(none this week)";

    const prompt = `You are reviewing Week ${weekNumber} of ${firstName}'s abundance shift journey. Their primary desire area is: ${desireArea}.

Evidence collected this week:

WINS (things that went well / aligned with their future self):
${formatEntries(entriesByKind.win)}

SYNCHRONICITIES (meaningful coincidences / signs of alignment):
${formatEntries(entriesByKind.synchronicity)}

RECEIVING (moments of receiving, generosity, flow):
${formatEntries(entriesByKind.receiving)}

RESISTANCE (friction, old patterns, limiting reactions noticed):
${formatEntries(entriesByKind.resistance)}

Write a 3-paragraph weekly insight for ${firstName}.
Paragraph 1: What patterns are emerging in their evidence — what is the universe reflecting back?
Paragraph 2: What the resistance entries reveal about their growing edge — reframe it as data, not failure.
Paragraph 3: One precise invitation for the next week — specific to what they logged.

No headers. No bullet points. Speak directly to them as "you". Warm but not saccharine. Insightful, specific, grounded.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    if (!content) return { ok: false, error: "Empty response from AI." };

    // Save the insight
    await supabase.from("weekly_insights").upsert(
      { user_id: user.id, week_number: weekNumber, content },
      { onConflict: "user_id,week_number" },
    );

    revalidatePath("/evidence");
    return { ok: true, content };
  } catch (err) {
    console.error("Weekly insight generation error:", err);
    return { ok: false, error: "AI generation failed." };
  }
}

// ─── Generate milestone summary ───────────────────────────────────────────────

export async function generateMilestoneSummary(
  dayMarker: 7 | 14 | 30 | 42,
): Promise<{ ok: boolean; content?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Check if milestone already exists
  const { data: existing } = await supabase
    .from("milestone_summaries")
    .select("id, content")
    .eq("user_id", user.id)
    .eq("day_marker", dayMarker)
    .maybeSingle();

  if (existing) return { ok: true, content: existing.content };

  // Fetch profile + recent exercises + evidence count
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, desire_area, future_self_name, old_self_name, future_self_portrait, releasing, coaching_notes",
    )
    .eq("id", user.id)
    .single();

  const { data: exercises } = await supabase
    .from("phase_exercises")
    .select("slug, response, phase")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { count: evidenceCount } = await supabase
    .from("evidence_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const firstName = profile?.first_name ?? "you";
  const milestoneLabels: Record<number, string> = {
    7: "first week",
    14: "two weeks",
    30: "one month",
    42: "six weeks",
  };

  try {
    const exerciseSummary = (exercises ?? [])
      .slice(0, 6)
      .map((e) => `[${e.slug}] ${e.response.slice(0, 150)}...`)
      .join("\n");

    const prompt = `You are writing a ${milestoneLabels[dayMarker]} milestone summary for ${firstName}'s abundance shift journey.

Their desire area: ${profile?.desire_area ?? "not specified"}
Their future self name: ${profile?.future_self_name ?? "not named yet"}
Their future self vision: ${profile?.future_self_portrait?.slice(0, 300) ?? "not yet generated"}
What they are releasing: ${(profile?.releasing ?? []).join(", ") || "nothing logged yet"}
Evidence entries logged: ${evidenceCount ?? 0}
${exercises?.length ? `\nExercise responses (sample):\n${exerciseSummary}` : ""}
${profile?.coaching_notes ? `\nPrivate coaching context (never reference directly): ${profile.coaching_notes}` : ""}

Write a 4-paragraph milestone summary. This is a meaningful moment — ${dayMarker} active practice days.

Paragraph 1: Acknowledge what they've done and what it means to have shown up for ${dayMarker} days.
Paragraph 2: Reflect back the shift you can see in their responses — be specific about the transformation visible in their words.
Paragraph 3: Name what is ready to emerge next — what the next phase of their journey is calling for.
Paragraph 4: Close with a single powerful statement of who they are becoming.

No headers. Speak as "you". Direct address. This is a sacred moment — honor it without being grandiose.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    if (!content) return { ok: false, error: "Empty response from AI." };

    await supabase.from("milestone_summaries").upsert(
      { user_id: user.id, day_marker: dayMarker, content },
      { onConflict: "user_id,day_marker" },
    );

    revalidatePath("/evidence");
    return { ok: true, content };
  } catch (err) {
    console.error("Milestone summary generation error:", err);
    return { ok: false, error: "AI generation failed." };
  }
}
