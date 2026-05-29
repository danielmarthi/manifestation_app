"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "../lib/supabase/server";
import type { BeliefType } from "../lib/supabase/types";

// ============================================================================
// Types
// ============================================================================

export interface PersonalContextData {
  first_name: string;
  age?: number | null;
  occupation?: string | null;
  relationship_status?: string | null;
  about_text: string;
  coach_style: "mentor" | "strategist" | "guide";
}

export interface AreaAnswerData {
  area: string;
  question: string;
  answer: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

export interface EvaluateResult {
  needsFollowUp: boolean;
  followUpQuestion?: string;
  acknowledgment?: string;
}

// ============================================================================
// Stage 1 — Save personal context
// ============================================================================

export async function savePersonalContext(data: PersonalContextData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name,
      full_name: data.first_name,
      age: data.age ?? null,
      occupation: data.occupation ?? null,
      relationship_status: data.relationship_status ?? null,
      about_text: data.about_text,
      coach_style: data.coach_style,
      personal_context: {
        first_name: data.first_name,
        age: data.age ?? null,
        occupation: data.occupation ?? null,
        relationship_status: data.relationship_status ?? null,
        about_text: data.about_text,
      },
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

// ============================================================================
// Stage 2 — Save selected areas (ranked array)
// ============================================================================

export async function saveSelectedAreas(areas: string[]): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase
    .from("profiles")
    .update({ selected_areas: areas })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

// ============================================================================
// Stage 3 — Evaluate answer for follow-up
// ============================================================================

const EVALUATE_SYSTEM = `A person is completing an onboarding intake for a personal development program about identity shifting. They answered a question about a specific life area.

Your job: decide if this answer is specific enough to build a real identity profile from.

An answer is SUFFICIENT if it contains at least two of:
- A named emotion or felt sense
- A specific situation or behaviour
- A stated belief ("I believe...", "I feel like...", "I always...")
- A concrete example from their life
- Real self-awareness about a pattern

An answer is VAGUE if it:
- Is under 30 words
- Uses only abstract language ("I want to be better with money")
- Could apply to literally anyone
- Avoids any specific feeling or situation

If VAGUE: return one precise follow-up question that asks for what's missing. Not a rephrasing of the original question — a specific probe. Examples: "What does that actually look like day to day for you?" / "When did you first start believing that about yourself?" / "What's the specific situation where this shows up most?"

If SUFFICIENT: return one sentence acknowledging what they shared. Warm but not effusive. Like a good coach nodding. Never say "great", "amazing", "that's so insightful". Say something that shows you actually read what they wrote.

Return ONLY valid JSON:
{ "needsFollowUp": boolean, "followUpQuestion": string | null, "acknowledgment": string | null }`;

export async function evaluateAnswer(
  area: string,
  question: string,
  answer: string
): Promise<EvaluateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing.");

  const client = new Anthropic({ apiKey });
  const prompt = `Area: ${area}\nQuestion: ${question}\nAnswer: "${answer}"\n\nEvaluate this answer.`;

  const resp = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: [{ type: "text", text: EVALUATE_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: prompt }],
  });

  const raw = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");

  try {
    const parsed = JSON.parse(raw) as {
      needsFollowUp: boolean;
      followUpQuestion: string | null;
      acknowledgment: string | null;
    };
    return {
      needsFollowUp: parsed.needsFollowUp,
      followUpQuestion: parsed.followUpQuestion ?? undefined,
      acknowledgment: parsed.acknowledgment ?? undefined,
    };
  } catch {
    // Default to sufficient if parse fails
    return { needsFollowUp: false, acknowledgment: "Got it. Let's keep going." };
  }
}

// ============================================================================
// Stage 3 — Persist one area answer to DB
// ============================================================================

export async function saveAreaAnswer(data: AreaAnswerData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  // Read existing answers
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_answers")
    .eq("id", user.id)
    .single();

  const existing = (profile?.onboarding_answers as Record<string, unknown>[] | null) ?? [];

  // Remove any previous answer for this area (idempotent)
  const filtered = existing.filter(
    (a) => (a as { area: string }).area !== data.area
  );

  const updated = [...filtered, {
    area: data.area,
    question: data.question,
    answer: data.answer,
    ...(data.followUpQuestion ? { followUpQuestion: data.followUpQuestion } : {}),
    ...(data.followUpAnswer ? { followUpAnswer: data.followUpAnswer } : {}),
  }];

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_answers: updated })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

// ============================================================================
// Stage 4 — Generate full profile via AI
// ============================================================================

const GENERATE_SYSTEM = `You are building a complete identity profile for someone beginning a program about alignment and identity shifting.

The entire program rests on one premise: you attract who you are, not what you want. The gap between someone's current life and what they want is not a strategy gap — it is an identity gap. Your job is to map that gap with precision and warmth.

You are not a therapist. You are not a life coach. You are not spiritual. You are a very perceptive reader of people who sees patterns clearly and names them plainly.

TONE: Literary, warm, specific. Never say: vibration, the universe, manifest, energy, abundance mindset, inner child, trauma, healing journey, higher self, divine, alignment (as a spiritual term), frequency, attract, law of attraction. Speak like a perceptive friend — direct, caring, zero fluff.

VOICE RULES:
- old_self_portrait: second or third person, past/present tense
- future_self_portrait: FIRST PERSON ONLY, present tense, "I am" voice
- identity_statements: FIRST PERSON ONLY, present tense, "I am" voice
- future_self_tags: first person implied ("Financially unhurried" not "She is financially unhurried")
- assumption: first person present tense, max 15 words

You will return ONLY valid JSON. No prose outside the JSON. No markdown. No explanation. Just the JSON object.

JSON SCHEMA (follow exactly):
{
  "future_self_name": string,
  "old_self_name": string,
  "old_self_portrait": string,
  "old_self_tags": string[],
  "future_self_portrait": string,
  "future_self_tags": string[],
  "releasing": string[],
  "assumption": string,
  "gap_statement": string,
  "beliefs": [{ "belief": string, "type": "inherited" | "self-created" | "fear-based" | "identity-based", "area": string }],
  "identity_statements": string[],
  "primary_block": string,
  "block_type": "past_evidence" | "worthiness" | "identity" | "fear_of_receiving",
  "desire_area": string,
  "desire_statement": string,
  "coaching_notes": string
}

FIELD GUIDANCE:
- future_self_name: "[FirstName], [OneWord]" — the word captures their primary shift. Never: "Happy", "Successful", "Blessed". YES: "Abundant", "Free", "Whole", "Rooted", "Open", "Clear", "Unhurried", "Known", "Embodied", "Purposeful"
- old_self_name: Always "[FirstName], Before" — no variation
- old_self_portrait: 3-4 sentences. Pull from what they actually wrote. Compassionate, not pitying. Like being seen clearly.
- old_self_tags: 4-6 tags. Behaviorally specific. Max 4 words each. NOT "Low self-esteem" — YES "Earns rest", "Waits for proof", "Checks account with held breath"
- future_self_portrait: 4-5 sentences. FIRST PERSON. Present tense. "I am" throughout. Not aspirational — pure identity. This is read every day. It must feel settled, not reached for.
- future_self_tags: 5-7 tags. Implied first person. Max 4 words. "Financially unhurried", "Moves from purpose", "Receives without apology"
- releasing: 3-4 specific patterns being released. Short phrases, max 5 words. Specific to what they shared.
- assumption: ONE sentence. Present tense. First person. Settled as fact. Based on their #1 area and vision. Max 15 words. NOT "I will be abundant" — YES "I am already the person money flows to."
- gap_statement: "Right now I believe [current honest belief]. I am becoming someone who knows [future belief as fact]." Pull specifically from their pattern and vision answers.
- beliefs: 4-8 beliefs. Only real ones from what they wrote. First person. "Money is for people who are luckier than me."
- identity_statements: 6-8 statements. First person present. "I am" format. Must feel like expansion when read aloud, not performance.
- primary_block: 1-2 sentences. Plain language. Specific to them.
- desire_area: name of their #1 ranked area
- desire_statement: 1-2 sentences. What they actually want beneath the surface.
- coaching_notes: 2-3 sentences for coach context only. Never shown to user. What to watch for? What might make them abandon practice? What needs careful handling?`;

interface GeneratedProfile {
  future_self_name: string;
  old_self_name: string;
  old_self_portrait: string;
  old_self_tags: string[];
  future_self_portrait: string;
  future_self_tags: string[];
  releasing: string[];
  assumption: string;
  gap_statement: string;
  beliefs: { belief: string; type: BeliefType; area: string }[];
  identity_statements: string[];
  primary_block: string;
  block_type: string;
  desire_area: string;
  desire_statement: string;
  coaching_notes: string;
}

export async function generateFullProfile(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false, error: "Profile not found." };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { success: false, error: "ANTHROPIC_API_KEY missing." };

  // Build the user prompt from all saved data
  const areas = (profile.selected_areas as string[] | null) ?? [];
  const answers = (profile.onboarding_answers as Record<string, unknown>[] | null) ?? [];
  const ctx = profile.personal_context as Record<string, unknown> | null;

  const formatAnswers = answers.map((a) => {
    const ans = a as {
      area: string;
      question: string;
      answer: string;
      followUpQuestion?: string;
      followUpAnswer?: string;
    };
    let block = `AREA: ${ans.area}\nQ: ${ans.question}\nA: ${ans.answer}`;
    if (ans.followUpQuestion && ans.followUpAnswer) {
      block += `\nFollow-up Q: ${ans.followUpQuestion}\nFollow-up A: ${ans.followUpAnswer}`;
    }
    return block;
  }).join("\n\n");

  const userPrompt = `PERSONAL CONTEXT:
Name: ${ctx?.first_name ?? profile.first_name ?? "unknown"}
${ctx?.age ? `Age: ${ctx.age}` : ""}
${ctx?.occupation ? `Occupation: ${ctx.occupation}` : ""}
${ctx?.relationship_status ? `Relationship status: ${ctx.relationship_status}` : ""}

Who they are right now:
"${ctx?.about_text ?? profile.about_text ?? ""}"

SELECTED LIFE AREAS (in order of priority, #1 is primary focus):
${areas.map((a, i) => `${i + 1}. ${a}`).join("\n")}

THEIR ANSWERS:

${formatAnswers}

Generate the complete JSON identity profile now.`;

  const client = new Anthropic({ apiKey });
  let raw: string;
  try {
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: [{ type: "text", text: GENERATE_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userPrompt }],
    });
    raw = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "AI call failed." };
  }

  let generated: GeneratedProfile;
  try {
    generated = JSON.parse(raw) as GeneratedProfile;
  } catch {
    return { success: false, error: "Couldn't parse the coach's response. Try again." };
  }

  // Save everything to profiles
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      future_self_name: generated.future_self_name,
      old_self_name: generated.old_self_name,
      old_self_portrait: generated.old_self_portrait,
      old_self_tags: generated.old_self_tags ?? [],
      future_self_portrait: generated.future_self_portrait,
      future_self_tags: generated.future_self_tags ?? [],
      releasing: generated.releasing ?? [],
      assumption: generated.assumption,
      gap_statement: generated.gap_statement,
      primary_block: generated.primary_block,
      block_type: generated.block_type,
      desire_area: generated.desire_area,
      desire_statement: generated.desire_statement,
      coaching_notes: generated.coaching_notes,
      // Also populate legacy fields for backward compat with practice flow, dashboard, etc.
      future_self_body: generated.future_self_portrait
        ? generated.future_self_portrait.split(". ").filter(Boolean)
        : [],
      future_self_traits: generated.future_self_tags?.slice(0, 5) ?? [],
      old_self_body: generated.old_self_portrait
        ? generated.old_self_portrait.split(". ").filter(Boolean)
        : [],
      current_phase: 1,
    })
    .eq("id", user.id);

  if (profileErr) return { success: false, error: profileErr.message };

  // Clear and re-insert beliefs
  await supabase.from("beliefs").delete().eq("user_id", user.id);
  if (generated.beliefs?.length) {
    const { error: bErr } = await supabase.from("beliefs").insert(
      generated.beliefs.map((b) => ({
        user_id: user.id,
        text: b.belief,
        type: b.type,
        area: b.area ?? null,
      }))
    );
    if (bErr) return { success: false, error: bErr.message };
  }

  // Clear and re-insert identity statements
  await supabase.from("identity_statements").delete().eq("user_id", user.id);
  if (generated.identity_statements?.length) {
    const { error: iErr } = await supabase.from("identity_statements").insert(
      generated.identity_statements.map((text, i) => ({
        user_id: user.id,
        text,
        position: i,
      }))
    );
    if (iErr) return { success: false, error: iErr.message };
  }

  return { success: true };
}

// ============================================================================
// Stage 5 — Complete onboarding (called on reveal CTA click)
// ============================================================================

export async function finaliseOnboarding(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  await supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      // Day 1 of the journey begins the moment onboarding completes.
      program_start_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", user.id);
}
