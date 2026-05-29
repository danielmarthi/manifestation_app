"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import type { EvidenceKind } from "../lib/supabase/types";

export async function logEvidence(kind: EvidenceKind, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty" } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" } as const;

  const { error } = await supabase.from("evidence_entries").insert({
    user_id: user.id,
    kind,
    text: trimmed,
  });
  if (error) return { ok: false, error: error.message } as const;

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/evidence");
  revalidatePath("/calendar");
  return { ok: true } as const;
}
