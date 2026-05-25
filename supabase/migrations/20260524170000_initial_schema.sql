-- The Abundance Shift — initial schema
-- Every user owns their own journal. RLS enforces that strictly.

set search_path = public;

-- ============================================================================
-- ENUMS
-- ============================================================================

create type belief_type as enum ('inherited', 'self-created', 'fear-based', 'identity-based');
create type evidence_kind as enum ('win', 'synchronicity', 'receiving', 'resistance');
create type coach_role as enum ('user', 'assistant');

-- ============================================================================
-- profiles — one row per auth.users; the user's belief profile
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  first_name           text,
  desire_area          text,
  desire_statement     text,
  primary_block        text,
  block_type           text,
  assumption           text,
  gap_statement        text,

  current_phase        smallint not null default 1 check (current_phase between 1 and 5),
  streak               integer  not null default 0,
  last_practice_date   date,

  -- Future Self snapshot (lives here for fast SSR reads; richer history kept in beliefs/identity_statements)
  future_self_name     text,
  future_self_body     text[]  not null default '{}',
  future_self_traits   text[]  not null default '{}',

  -- Old Self snapshot
  old_self_name        text,
  old_self_body        text[]  not null default '{}',

  onboarding_completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_updated_at_idx on public.profiles (updated_at desc);

-- ============================================================================
-- beliefs — the user's belief map; can be marked dissolved
-- ============================================================================

create table public.beliefs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  text        text not null,
  type        belief_type not null,
  dissolved   boolean not null default false,
  dissolved_at timestamptz,
  created_at  timestamptz not null default now()
);

create index beliefs_user_idx on public.beliefs (user_id, created_at desc);

-- ============================================================================
-- identity_statements — the user's "I am" lines, ordered
-- ============================================================================

create table public.identity_statements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  text        text not null,
  position    smallint not null default 0,
  created_at  timestamptz not null default now()
);

create index identity_statements_user_idx on public.identity_statements (user_id, position);

-- ============================================================================
-- evidence_entries — the journal of wins / syncs / receiving / resistance
-- ============================================================================

create table public.evidence_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        evidence_kind not null,
  text        text not null,
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index evidence_entries_user_time_idx on public.evidence_entries (user_id, occurred_at desc);

-- ============================================================================
-- coach_messages — conversation history with the AI coach
-- ============================================================================

create table public.coach_messages (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null,
  role            coach_role not null,
  content         text not null,
  created_at      timestamptz not null default now()
);

create index coach_messages_user_conv_idx on public.coach_messages (user_id, conversation_id, created_at);

-- ============================================================================
-- practice_log — daily morning ritual completion
-- ============================================================================

create table public.practice_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  practice_date   date not null,
  steps_completed jsonb not null default '{}'::jsonb,  -- e.g. {breathe:true, be:true, see:false, ...}
  gratitude       text,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (user_id, practice_date)
);

create index practice_log_user_date_idx on public.practice_log (user_id, practice_date desc);

-- ============================================================================
-- sos_logs — emergency-protocol entries
-- ============================================================================

create table public.sos_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  feeling    text,
  reframed   boolean not null default false,
  returned   boolean not null default false,
  created_at timestamptz not null default now()
);

create index sos_logs_user_idx on public.sos_logs (user_id, created_at desc);

-- ============================================================================
-- updated_at trigger on profiles
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Auto-create a profile row when a new user signs up
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.beliefs             enable row level security;
alter table public.identity_statements enable row level security;
alter table public.evidence_entries    enable row level security;
alter table public.coach_messages      enable row level security;
alter table public.practice_log        enable row level security;
alter table public.sos_logs            enable row level security;

-- profiles: user can read/write their own row only
create policy "profiles: own row read"   on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: own row update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- insert is handled by the handle_new_user trigger (security definer), so no public insert policy needed.

-- Generic owner-only policy for the satellite tables
create policy "beliefs: own row all"             on public.beliefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "identity_statements: own row all" on public.identity_statements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "evidence_entries: own row all"    on public.evidence_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "coach_messages: own row all"      on public.coach_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "practice_log: own row all"        on public.practice_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sos_logs: own row all"            on public.sos_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
