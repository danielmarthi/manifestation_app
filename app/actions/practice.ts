"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

export interface PracticeStepUpdate {
  step: "breathe" | "be" | "see" | "thank" | "assume" | "note";
  done?: boolean;
  gratitude?: string;
  dailyNote?: string;
  mood?: string;
}

export async function completePracticeStep(update: PracticeStepUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" } as const;

  const today = new Date().toISOString().slice(0, 10);

  // Fetch existing row to merge steps_completed
  const { data: existing } = await supabase
    .from("practice_log")
    .select("*")
    .eq("user_id", user.id)
    .eq("practice_date", today)
    .maybeSingle();

  const stepsCompleted: Record<string, boolean> = {
    ...((existing?.steps_completed as Record<string, boolean>) || {}),
  };
  if (update.done !== undefined) stepsCompleted[update.step] = update.done;

  // The daily ritual is six steps: the five practice steps + the day's note.
  const allSteps = ["breathe", "be", "see", "thank", "assume", "note"] as const;
  const allDone = allSteps.every((s) => stepsCompleted[s]);
  const completedAt = allDone
    ? existing?.completed_at ?? new Date().toISOString()
    : existing?.completed_at ?? null;

  // Get current phase + start date for phase_number / lazy backfill.
  const { data: profileData } = await supabase
    .from("profiles")
    .select("current_phase, program_start_date, streak, last_practice_date")
    .eq("id", user.id)
    .maybeSingle();
  const phaseNumber = profileData?.current_phase ?? 1;

  const upsertPayload = {
    user_id: user.id,
    practice_date: today,
    steps_completed: stepsCompleted,
    gratitude: update.gratitude ?? existing?.gratitude ?? null,
    daily_note: update.dailyNote ?? existing?.daily_note ?? null,
    mood: update.mood ?? existing?.mood ?? null,
    completed_at: completedAt,
    phase_number: phaseNumber,
  };

  const { error } = await supabase
    .from("practice_log")
    .upsert(upsertPayload, { onConflict: "user_id,practice_date" });
  if (error) return { ok: false, error: error.message } as const;

  // Lazily set program_start_date if it was never initialised.
  if (!profileData?.program_start_date) {
    await supabase
      .from("profiles")
      .update({ program_start_date: today })
      .eq("id", user.id);
  }

  // If the ritual just completed, advance the streak + practiced-day counter.
  if (allDone && !existing?.completed_at) {
    let newStreak = 1;
    if (profileData?.last_practice_date) {
      const last = new Date(profileData.last_practice_date);
      const todayDate = new Date(today);
      const diffDays = Math.round(
        (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 0) newStreak = profileData.streak; // already counted today
      else if (diffDays === 1) newStreak = (profileData.streak ?? 0) + 1;
      else newStreak = 1; // missed a day → restart
    }

    // Recount practiced days from the source of truth.
    const { count } = await supabase
      .from("practice_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("completed_at", "is", null);

    await supabase
      .from("profiles")
      .update({
        streak: newStreak,
        last_practice_date: today,
        total_practice_days: count ?? 0,
      })
      .eq("id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/practice");
  revalidatePath("/calendar");
  return { ok: true, allDone } as const;
}
