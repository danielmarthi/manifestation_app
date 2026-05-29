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

// ─── The day engine ───────────────────────────────────────────────────────────

export interface JourneyState {
  /** Calendar days since program start (start date = Day 1). */
  journeyDay: number;
  /** Distinct days a full ritual was completed. Drives milestones + phase gating. */
  practicedDays: number;
  /** Consecutive completed days. */
  streak: number;
  /** ISO date (YYYY-MM-DD) the program began, or null if not set. */
  startDate: string | null;
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetweenInclusive(startISO: string, endISO: string): number {
  const start = new Date(startISO + "T00:00:00Z").getTime();
  const end = new Date(endISO + "T00:00:00Z").getTime();
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return diff + 1; // start date counts as Day 1
}

/**
 * The single source of truth for "what day is it" in the program.
 * - journeyDay: calendar-based (days since program_start_date, inclusive)
 * - practicedDays: completion-based (rows in practice_log with completed_at)
 */
export async function getJourneyState(): Promise<JourneyState> {
  const supabase = await createClient();
  const userId = await requireUserId();

  const { data: profile } = await supabase
    .from("profiles")
    .select("program_start_date, streak, created_at")
    .eq("id", userId)
    .maybeSingle();

  const startDate =
    profile?.program_start_date ??
    (profile?.created_at ? dateOnly(new Date(profile.created_at)) : null);

  const today = dateOnly(new Date());
  const journeyDay = startDate
    ? Math.max(1, daysBetweenInclusive(startDate, today))
    : 1;

  const { count } = await supabase
    .from("practice_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("completed_at", "is", null);

  return {
    journeyDay,
    practicedDays: count ?? 0,
    streak: profile?.streak ?? 0,
    startDate,
  };
}

export async function getPracticeLogByDate(
  date: string,
): Promise<PracticeLogRow | null> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("practice_log")
    .select("*")
    .eq("user_id", userId)
    .eq("practice_date", date)
    .maybeSingle();
  return data;
}

export async function getAllPracticeLogs(): Promise<PracticeLogRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("practice_log")
    .select("*")
    .eq("user_id", userId)
    .order("practice_date", { ascending: true });
  return data ?? [];
}

export async function getEvidenceByDate(
  date: string,
): Promise<EvidenceEntryRow[]> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  const { data } = await supabase
    .from("evidence_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_at", start)
    .lte("occurred_at", end)
    .order("occurred_at", { ascending: true });
  return data ?? [];
}

/** Completed ritual days logged while in a given phase. Drives phase day-gating. */
export async function getCompletedDaysInPhase(phase: number): Promise<number> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { count } = await supabase
    .from("practice_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("phase_number", phase)
    .not("completed_at", "is", null);
  return count ?? 0;
}

/** Map of YYYY-MM-DD → count of evidence entries that day (for calendar dots). */
export async function getEvidenceCountsByDate(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const userId = await requireUserId();
  const { data } = await supabase
    .from("evidence_entries")
    .select("occurred_at")
    .eq("user_id", userId);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const d = dateOnly(new Date(row.occurred_at));
    counts[d] = (counts[d] ?? 0) + 1;
  }
  return counts;
}
