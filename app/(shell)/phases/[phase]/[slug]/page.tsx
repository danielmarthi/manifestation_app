import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getExerciseBySlug, fillTemplate } from "../../../../lib/exercises";
import {
  getProfile,
  getPhaseExercise,
  getBeliefs,
} from "../../../../lib/data";
import { ExerciseClient } from "./ExerciseClient";
import type { BeliefRow } from "../../../../lib/supabase/types";

interface Props {
  params: Promise<{ phase: string; slug: string }>;
}

/**
 * Assembles the pre-fill text block shown to the user before their textarea.
 * Returns null if no pre-fill is needed.
 */
async function buildPrefillContent(
  prefillType: string | null,
  profile: Awaited<ReturnType<typeof getProfile>>,
  beliefs: BeliefRow[],
): Promise<string | null> {
  if (!prefillType || !profile) return null;

  switch (prefillType) {
    case "desire": {
      const parts: string[] = [];
      if (profile.desire_statement) parts.push(profile.desire_statement);
      if (profile.desire_area) parts.push(`Area: ${profile.desire_area}`);
      return parts.join("\n") || null;
    }

    case "story": {
      const parts: string[] = [];
      if (profile.about_text) parts.push(profile.about_text);
      // Pull the primary area answer from onboarding_answers if available
      const answers = profile.onboarding_answers as
        | Array<{ area?: string; answer?: string; followUp?: string }>
        | null;
      if (answers?.length && profile.selected_areas?.[0]) {
        const primaryArea = profile.selected_areas[0];
        const primaryAnswer = answers.find(
          (a) => a.area === primaryArea || a.area?.toLowerCase() === primaryArea.toLowerCase(),
        );
        if (primaryAnswer?.answer) {
          parts.push(`On ${primaryArea}: ${primaryAnswer.answer}`);
        }
      }
      return parts.join("\n\n") || null;
    }

    case "beliefs-all": {
      if (!beliefs.length) return null;
      return beliefs
        .filter((b) => !b.dissolved)
        .map((b) => `• ${b.text} [${b.type}]`)
        .join("\n");
    }

    case "beliefs-inherited": {
      const inherited = beliefs.filter(
        (b) => b.type === "inherited" && !b.dissolved,
      );
      if (!inherited.length) return null;
      return inherited.map((b) => `• ${b.text}`).join("\n");
    }

    case "beliefs-identity": {
      const identity = beliefs.filter(
        (b) => b.type === "identity-based" && !b.dissolved,
      );
      if (!identity.length) return null;
      return identity.map((b) => `• ${b.text}`).join("\n");
    }

    case "gap-statement": {
      return profile.gap_statement || null;
    }

    case "old-self-portrait": {
      const parts: string[] = [];
      if (profile.old_self_portrait) parts.push(profile.old_self_portrait);
      if (profile.old_self_tags?.length) {
        parts.push(`Tags: ${profile.old_self_tags.join(", ")}`);
      }
      return parts.join("\n\n") || null;
    }

    case "old-self-name-header": {
      return profile.old_self_name
        ? `From the perspective of: ${profile.old_self_name}`
        : null;
    }

    case "future-self-portrait": {
      const parts: string[] = [];
      if (profile.future_self_portrait) parts.push(profile.future_self_portrait);
      if (profile.future_self_tags?.length) {
        parts.push(`Tags: ${profile.future_self_tags.join(", ")}`);
      }
      return parts.join("\n\n") || null;
    }

    case "assumption": {
      return profile.assumption || null;
    }

    case "ritual-data": {
      // Fetch last 7 practice log entries
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: logs } = await supabase
        .from("practice_log")
        .select("practice_date, completed_at, steps_completed")
        .eq("user_id", user.id)
        .order("practice_date", { ascending: false })
        .limit(7);

      if (!logs?.length) return "No ritual days logged yet.";

      const lines = logs.map((l) => {
        const date = new Date(l.practice_date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const steps = l.steps_completed as Record<string, boolean> | null;
        const completed = steps
          ? Object.values(steps).filter(Boolean).length
          : 0;
        const status = l.completed_at ? "✓ Full ritual" : `${completed}/5 steps`;
        return `${date}: ${status}`;
      });

      return lines.join("\n");
    }

    case "future-self-name-sender": {
      return profile.future_self_name
        ? `Written as: ${profile.future_self_name} (your future self)`
        : null;
    }

    default:
      return null;
  }
}

export default async function ExercisePage({ params }: Props) {
  const { phase: phaseStr, slug } = await params;
  const phaseNum = parseInt(phaseStr, 10);

  if (isNaN(phaseNum) || phaseNum < 1 || phaseNum > 4) notFound();

  const def = getExerciseBySlug(slug);
  if (!def || def.phase !== phaseNum) notFound();

  const [profile, existingResponse, beliefs] = await Promise.all([
    getProfile(),
    getPhaseExercise(slug),
    getBeliefs(),
  ]);

  if (!profile) return null;

  // Gate: user must be on this phase or have passed it
  if ((profile.current_phase ?? 1) < phaseNum) {
    return (
      <div className="page-fade px-8 lg:px-12 py-10 max-w-[760px] mx-auto">
        <p className="text-[14px] text-ink-muted">
          This exercise is locked. Complete Phase {phaseNum - 1} first.
        </p>
      </div>
    );
  }

  // Build template values
  const templateValues = {
    desire_area: profile.desire_area ?? "your desire",
    future_self_name: profile.future_self_name ?? "your future self",
    old_self_name: profile.old_self_name ?? "your old self",
    assumption: profile.assumption ?? "It is done.",
  };

  // Apply template to strings that might contain {placeholders}
  const resolvedPrompt = fillTemplate(def.prompt, templateValues);
  const resolvedContext = fillTemplate(def.context, templateValues);
  const resolvedPrefillLabel = def.prefillLabel
    ? fillTemplate(def.prefillLabel, templateValues)
    : null;

  // Build pre-fill content (only shown when there's no existing response)
  const prefillContent = existingResponse?.prefill_content
    ?? (await buildPrefillContent(def.prefillType, profile, beliefs));

  return (
    <ExerciseClient
      slug={def.slug}
      phase={phaseNum}
      title={def.title}
      subtitle={def.subtitle}
      isCore={def.isCore}
      context={resolvedContext}
      instruction={def.instruction}
      prompt={resolvedPrompt}
      cta={def.cta}
      prefillContent={prefillContent}
      prefillLabel={resolvedPrefillLabel}
      existingResponse={existingResponse?.response ?? null}
      existingAiResponse={existingResponse?.ai_response ?? null}
      firstName={profile.first_name ?? undefined}
    />
  );
}
