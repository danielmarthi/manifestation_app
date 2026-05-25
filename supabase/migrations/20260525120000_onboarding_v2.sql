-- The Abundance Shift — Onboarding v2 additions
-- Non-destructive: all existing columns and data remain intact.

set search_path = public;

-- ============================================================================
-- New columns on profiles
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name            text,
  ADD COLUMN IF NOT EXISTS age                  integer,
  ADD COLUMN IF NOT EXISTS occupation           text,
  ADD COLUMN IF NOT EXISTS relationship_status  text,
  ADD COLUMN IF NOT EXISTS about_text           text,
  ADD COLUMN IF NOT EXISTS personal_context     jsonb,
  ADD COLUMN IF NOT EXISTS selected_areas       jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_answers   jsonb,
  ADD COLUMN IF NOT EXISTS old_self_portrait    text,
  ADD COLUMN IF NOT EXISTS old_self_tags        text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS future_self_portrait text,
  ADD COLUMN IF NOT EXISTS future_self_tags     text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS releasing            text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coaching_notes       text,
  ADD COLUMN IF NOT EXISTS coach_style          text    NOT NULL DEFAULT 'mentor';

-- ============================================================================
-- Area column on beliefs (for richer filtering)
-- ============================================================================

ALTER TABLE public.beliefs
  ADD COLUMN IF NOT EXISTS area text;
