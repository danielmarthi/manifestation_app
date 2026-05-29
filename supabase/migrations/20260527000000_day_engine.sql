-- The Abundance Shift — Day Engine
-- Daily notes + mood on the practice log; backfill program_start_date.
-- Non-destructive.

set search_path = public;

-- ============================================================================
-- New columns on practice_log: the day's free-write + mood/state tag
-- ============================================================================

ALTER TABLE public.practice_log
  ADD COLUMN IF NOT EXISTS daily_note text,
  ADD COLUMN IF NOT EXISTS mood       text;

-- ============================================================================
-- Backfill program_start_date for anyone who completed onboarding before the
-- day engine existed. Falls back to their earliest practice day, else the day
-- their profile row was created.
-- ============================================================================

UPDATE public.profiles p
SET program_start_date = COALESCE(
  p.program_start_date,
  (SELECT MIN(practice_date) FROM public.practice_log pl WHERE pl.user_id = p.id),
  p.created_at::date
)
WHERE p.program_start_date IS NULL
  AND p.onboarding_completed_at IS NOT NULL;
