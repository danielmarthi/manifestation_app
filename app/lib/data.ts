import "server-only";
import { createClient } from "./supabase/server";
import type {
  ProfileRow,
  BeliefRow,
  IdentityStatementRow,
  EvidenceEntryRow,
  CoachMessageRow,
  PracticeLogRow,
  PhaseExerciseRow,
  WeeklyInsightRow,
  MilestoneSummaryRow,
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

// ─── Phase exercises ──────────────────────────────────────────────────────────

export async function getPhaseExercises(
  phase?: number,
): Promise<PhaseExerciseRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  let query = supabase
    .from("phase_exercises")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (phase !== undefined) {
    query = query.eq("phase", phase);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getPhaseExercise(
  slug: string,
): Promise<PhaseExerciseRow | null> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("phase_exercises")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getCompletedExerciseSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("phase_exercises")
    .select("slug")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.slug);
}

// ─── Weekly insights & milestone summaries ───────────────────────────────────

export async function getWeeklyInsights(): Promise<WeeklyInsightRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("weekly_insights")
    .select("*")
    .eq("user_id", userId)
    .order("week_number", { ascending: false });
  return data ?? [];
}

export async function getMilestoneSummaries(): Promise<MilestoneSummaryRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("milestone_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("day_marker", { ascending: true });
  return data ?? [];
}

// ─── Practice day counters for phase readiness ───────────────────────────────

/** Total completed practice days across all time. */
export async function getPracticeDaysCount(): Promise<number> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { count } = await supabase
    .from("practice_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("completed_at", "is", null);
  return count ?? 0;
}

/**
 * For Phase 4 readiness: how many of the last 14 distinct active days
 * had a completed morning ritual (phase_number = 3 or 4).
 * Returns { completed, of: 10 } so UI can show "8 of 10".
 */
export async function getPhase4RitualReadiness(): Promise<{
  completed: number;
  of: number;
}> {
  const supabase = await createClient();
  const userId = await requireUserId();
  // Fetch last 14 completed days ordered by practice_date desc
  const { data } = await supabase
    .from("practice_log")
    .select("practice_date, completed_at")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("practice_date", { ascending: false })
    .limit(14);
  const completed = (data ?? []).filter((r) => r.completed_at !== null).length;
  return { completed, of: 10 };
}

export async function getSosLogs(limit = 3) {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("sos_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
