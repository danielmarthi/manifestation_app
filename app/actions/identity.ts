"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

function revalidateIdentity() {
  revalidatePath("/identity");
  revalidatePath("/today");
  revalidatePath("/practice");
}

export async function updateAssumption(
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Assumption can't be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ assumption: trimmed })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidateIdentity();
  return { ok: true };
}

export async function addIdentityStatement(
  text: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Statement can't be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Place new statements at the end.
  const { data: existing } = await supabase
    .from("identity_statements")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition = (existing?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("identity_statements")
    .insert({ user_id: user.id, text: trimmed, position: nextPosition })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidateIdentity();
  return { ok: true, id: data.id };
}

export async function updateIdentityStatement(
  id: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Statement can't be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("identity_statements")
    .update({ text: trimmed })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidateIdentity();
  return { ok: true };
}

export async function deleteIdentityStatement(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("identity_statements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidateIdentity();
  return { ok: true };
}
