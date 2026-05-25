import "server-only";
import { createClient } from "./supabase/server";
import type {
  ProfileRow,
  BeliefRow,
  IdentityStatementRow,
  EvidenceEntryRow,
  CoachMessageRow,
  PracticeLogRow,
} from "./supabase/types";

/**
 * Returns the auth.users id of the signed-in user, or throws.
 * Middleware should have already redirected unauthenticated traffic,
 * so this is a defensive check.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return user.id;
}

export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function getBeliefs(): Promise<BeliefRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("beliefs")
    .select("*")
    .eq("user_id", userId)
    .order("dissolved", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getIdentityStatements(): Promise<IdentityStatementRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("identity_statements")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function getRecentEvidence(limit = 3): Promise<EvidenceEntryRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("evidence_entries")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllEvidence(): Promise<EvidenceEntryRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("evidence_entries")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false });
  return data ?? [];
}

export async function getTodayPracticeLog(): Promise<PracticeLogRow | null> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("practice_log")
    .select("*")
    .eq("user_id", userId)
    .eq("practice_date", today)
    .maybeSingle();
  return data;
}

export async function getCoachConversation(
  conversationId: string,
): Promise<CoachMessageRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("coach_messages")
    .select("*")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
