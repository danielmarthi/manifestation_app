"use server";

import Anthropic from "@anthropic-ai/sdk";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import type { BeliefType } from "../lib/supabase/types";

export interface OnboardingAnswers {
  desire: string;
  block: string;
  body: string;
  self: string;
  practice: string;
}

interface GeneratedProfile {
  first_name: string;
  desire_area: string;
  desire_statement: string;
  primary_block: string;
  block_type: string;
  assumption: string;
  gap_statement: string;
  future_self_name: string;
  future_self_body: string[];
  future_self_traits: string[];
  old_self_name: string;
  old_self_body: string[];
  beliefs: { text: string; type: BeliefType }[];
  identity_statements: string[];
}

const SYSTEM = `You are the AI inside "The Abundance Shift", an identity-based manifestation coaching app. The user has just finished a 5-round onboarding conversation. Your job: turn their honest answers into a complete, rich belief profile.

Output STRICT JSON — no prose, no markdown fences, just the JSON object. Match this exact shape:

{
  "first_name": string,                    // 1 word, capitalized — extract from answers or infer "Friend"
  "desire_area": string,                   // 1-3 words, e.g. "Financial security"
  "desire_statement": string,              // single sentence in their voice, specific
  "primary_block": string,                 // single sentence, the "yeah but" thought
  "block_type": "past evidence" | "worthiness" | "identity" | "fear of receiving",
  "assumption": string,                    // ONE sentence they could live from, present-tense, never future
  "gap_statement": string,                 // "Right now I believe X and I want to believe Y." — one sentence
  "future_self_name": string,              // "<first_name>, Future" — e.g. "Eliza, Future"
  "future_self_body": string[],            // 4-6 short sentences. Present tense. Embodied. Specific to her desire.
  "future_self_traits": string[],          // 4-6 single lowercase words. e.g. "unhurried","generous","expectant"
  "old_self_name": string,                 // "<first_name>, Before"
  "old_self_body": string[],               // 3-4 short sentences. Third person. Honored, not criticized.
  "beliefs": [                             // 4-6 limiting beliefs surfaced by their answers
    { "text": string, "type": "inherited" | "self-created" | "fear-based" | "identity-based" }
  ],
  "identity_statements": string[]          // 5-7 "I am" statements rooted in the future self. Voice must feel like expansion, not performance.
}

Voice rules for all generated text:
- Literary, warm, intimate, never therapy-speak. Never spiritual-bypass.
- Match the way Neville Goddard / Florence Scovel Shinn write about identity — but plainer.
- Present tense for future self. Third person, gentle for old self.
- Specific to the user's actual answers — name details they gave, don't generalize.
- Never start with "You will". The future self ALREADY IS.
- Body sentences are short and breath-paced. Not paragraphs.

Be specific. Be uncomfortable-accurate. The user should read this and feel seen.`;

export async function completeOnboarding(answers: OnboardingAnswers) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY missing in server environment.");
  }

  // Ask Claude to synthesize the profile
  const client = new Anthropic({ apiKey });
  const userPrompt = `Their onboarding answers:

Round 1 — Desire: "${answers.desire}"

Round 2 — Block: "${answers.block}"

Round 3 — Body: "${answers.body}"

Round 4 — Self: "${answers.self}"

Round 5 — Practice: "${answers.practice}"

Generate the JSON belief profile now.`;

  const resp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n")
    .trim();

  // Strip any accidental code fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

  let profile: GeneratedProfile;
  try {
    profile = JSON.parse(cleaned);
  } catch {
    throw new Error("Couldn't parse the coach's response. Try again in a moment.");
  }

  // Write everything atomically-ish: profile update first, then satellite inserts.
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      first_name: profile.first_name,
      desire_area: profile.desire_area,
      desire_statement: profile.desire_statement,
      primary_block: profile.primary_block,
      block_type: profile.block_type,
      assumption: profile.assumption,
      gap_statement: profile.gap_statement,
      future_self_name: profile.future_self_name,
      future_self_body: profile.future_self_body,
      future_self_traits: profile.future_self_traits,
      old_self_name: profile.old_self_name,
      old_self_body: profile.old_self_body,
      current_phase: 1,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileErr) throw new Error(profileErr.message);

  // Clear any previous beliefs / statements (re-onboarding overwrites)
  await supabase.from("beliefs").delete().eq("user_id", user.id);
  await supabase.from("identity_statements").delete().eq("user_id", user.id);

  if (profile.beliefs?.length) {
    const { error } = await supabase.from("beliefs").insert(
      profile.beliefs.map((b) => ({
        user_id: user.id,
        text: b.text,
        type: b.type,
      })),
    );
    if (error) throw new Error(error.message);
  }

  if (profile.identity_statements?.length) {
    const { error } = await supabase.from("identity_statements").insert(
      profile.identity_statements.map((text, i) => ({
        user_id: user.id,
        text,
        position: i,
      })),
    );
    if (error) throw new Error(error.message);
  }

  redirect("/dashboard");
}
