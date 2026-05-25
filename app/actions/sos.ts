"use server";

import { createClient } from "../lib/supabase/server";

type SosUpdate =
  | { step: "named"; feeling: string; id?: undefined }
  | { step: "reframed"; id: string; feeling?: undefined }
  | { step: "returned"; id: string; feeling?: undefined };

export async function logSos(update: SosUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" } as const;

  if (update.step === "named") {
    const { data, error } = await supabase
      .from("sos_logs")
      .insert({ user_id: user.id, feeling: update.feeling.trim() || null })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true, id: data.id } as const;
  }

  const patch =
    update.step === "reframed" ? { reframed: true } : { returned: true };
  const { error } = await supabase
    .from("sos_logs")
    .update(patch)
    .eq("id", update.id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message } as const;
  return { ok: true, id: update.id } as const;
}
