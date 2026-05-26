-- The Abundance Shift — Phases v3
-- 4-phase structure with exercises, weekly insights, milestones.
-- Non-destructive: existing columns remain.

set search_path = public;

-- ============================================================================
-- phase_exercises — stores user responses to phase exercises
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.phase_exercises (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phase           integer     NOT NULL CHECK (phase BETWEEN 1 AND 4),
  slug            text        NOT NULL,
  prefill_content text,
  response        text        NOT NULL,
  ai_response     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

CREATE INDEX IF NOT EXISTS phase_exercises_user_idx
  ON public.phase_exercises (user_id, phase, created_at DESC);

-- ============================================================================
-- weekly_insights — AI analysis of evidence journal each week
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_insights (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number integer     NOT NULL,
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);

-- ============================================================================
-- milestone_summaries — AI summaries at practice days 7, 14, 30, 42
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.milestone_summaries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_marker  integer     NOT NULL CHECK (day_marker IN (7, 14, 30, 42)),
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_marker)
);

-- ============================================================================
-- New columns on practice_log
-- ============================================================================

ALTER TABLE public.practice_log
  ADD COLUMN IF NOT EXISTS phase_number integer DEFAULT 1;

-- ============================================================================
-- New columns on profiles
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS program_start_date     date,
  ADD COLUMN IF NOT EXISTS total_practice_days    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS program_completed_at   timestamptz;

-- ============================================================================
-- RLS on new tables
-- ============================================================================

ALTER TABLE public.phase_exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_insights    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "phase_exercises: own row all"     ON public.phase_exercises
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "weekly_insights: own row all"     ON public.weekly_insights
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "milestone_summaries: own row all" ON public.milestone_summaries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- updated_at trigger on phase_exercises
-- ============================================================================

CREATE TRIGGER phase_exercises_set_updated_at
  BEFORE UPDATE ON public.phase_exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
