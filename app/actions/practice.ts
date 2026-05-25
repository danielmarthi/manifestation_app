"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

export interface PracticeStepUpdate {
  step: "breathe" | "be" | "see" | "thank" | "assume";
  done?: boolean;
  gratitude?: string;
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

  const allSteps = ["breathe", "be", "see", "thank", "assume"] as const;
  const allDone = allSteps.every((s) => stepsCompleted[s]);
  const completedAt = allDone ? new Date().toISOString() : existing?.completed_at ?? null;

  const upsertPayload = {
    user_id: user.id,
    practice_date: today,
    steps_completed: stepsCompleted,
    gratitude: update.gratitude ?? existing?.gratitude ?? null,
    completed_at: completedAt,
  };

  const { error } = await supabase
    .from("practice_log")
    .upsert(upsertPayload, { onConflict: "user_id,practice_date" });
  if (error) return { ok: false, error: error.message } as const;

  // If the ritual just completed, advance the streak.
  if (allDone && !existing?.completed_at) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak,last_practice_date")
      .eq("id", user.id)
      .single();

    let newStreak = 1;
    if (profile?.last_practice_date) {
      const last = new Date(profile.last_practice_date);
      const todayDate = new Date(today);
      const diffDays = Math.round(
        (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 0) newStreak = profile.streak; // already counted today
      else if (diffDays === 1) newStreak = (profile.streak ?? 0) + 1;
      else newStreak = 1; // missed a day → restart
    }

    await supabase
      .from("profiles")
      .update({ streak: newStreak, last_practice_date: today })
      .eq("id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/practice");
  return { ok: true, allDone } as const;
}
