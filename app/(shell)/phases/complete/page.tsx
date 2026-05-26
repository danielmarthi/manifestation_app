import { redirect } from "next/navigation";
import { getProfile, getPracticeDaysCount, getMilestoneSummaries } from "../../../lib/data";
import { ProgramCompleteClient } from "./ProgramCompleteClient";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "../../../lib/supabase/server";

async function getOrGenerateCompletionMessage(
  profile: Awaited<ReturnType<typeof getProfile>>,
  totalDays: number,
): Promise<string> {
  if (!profile) return "";

  const supabase = await createClient();

  // Check if we already have it stored (use coaching_notes slot or a simple check on program_completed_at)
  // We'll generate fresh — it's a one-time event
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const prompt = `You are writing a program completion message for ${profile.first_name ?? "this person"}.

They have just completed The Abundance Shift — all four phases across ${totalDays} active practice days.

Their future self name: ${profile.future_self_name ?? "not named"}
Their desire area: ${profile.desire_area ?? "not specified"}
Their future self portrait (opening): ${profile.future_self_portrait?.slice(0, 400) ?? "not generated"}
What they are releasing: ${(profile.releasing ?? []).join(", ") || "nothing specified"}
Their assumption: ${profile.assumption ?? "not set"}

Write a 4-paragraph completion message. This is a significant moment — ${totalDays} days of genuine practice.

Paragraph 1: Acknowledge what completing this actually means — not the certificate, but what it says about who they now are.
Paragraph 2: Name what has shifted — reference their specific future self vision and desire area.
Paragraph 3: What "completion" means in this context — the program ends, the practice continues. They are ${profile.future_self_name ?? "their future self"} now.
Paragraph 4: A single, powerful closing line — not motivational, not aspirational. A statement of fact about who they are.

No headers. No bullet points. Write to them directly as "you". Warm, real, specific. This is not a certificate — it is a recognition.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    return msg.content[0]?.type === "text"
      ? msg.content[0].text.trim()
      : fallbackMessage(profile, totalDays);
  } catch {
    return fallbackMessage(profile, totalDays);
  }
}

function fallbackMessage(
  profile: Awaited<ReturnType<typeof getProfile>>,
  totalDays: number,
): string {
  const name = profile?.first_name ?? "You";
  const futureName = profile?.future_self_name ?? "your future self";
  return `${name}, you came to this program carrying a story. Over ${totalDays} active days — through honest seeing, genuine clearing, identity work, and daily practice — you changed that story.

Not by believing harder. Not by thinking more positively. By actually doing the work: examining what you believed, feeling where it lived, clearing what was in the way, and building the identity of ${futureName} one ordinary day at a time.

The program is complete. The practice is not — it never is. But you are different now than the person who started this. You have built the daily habit of returning to who you actually are. That is the only technique that matters.

${futureName} is not coming. They are here.`;
}

export default async function ProgramCompletePage() {
  const [profile, totalDays, milestones] = await Promise.all([
    getProfile(),
    getPracticeDaysCount(),
    getMilestoneSummaries(),
  ]);

  if (!profile) redirect("/dashboard");

  // Gate: must have actually completed phase 4
  // Allow access if current_phase is 4 and program_completed_at is set,
  // OR if current_phase is 4 (completion in progress)
  if ((profile.current_phase ?? 1) < 4) {
    redirect("/phases");
  }

  const completionMessage = await getOrGenerateCompletionMessage(
    profile,
    totalDays,
  );

  return (
    <ProgramCompleteClient
      firstName={profile.first_name ?? undefined}
      futureSelfName={profile.future_self_name ?? undefined}
      futurePortrait={profile.future_self_portrait ?? undefined}
      futureTags={profile.future_self_tags ?? []}
      assumption={profile.assumption ?? undefined}
      totalDays={totalDays}
      completionMessage={completionMessage}
      milestoneCount={milestones.length}
    />
  );
}
