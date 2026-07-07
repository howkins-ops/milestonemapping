-- ============================================================
-- 013_alpha_mode — MILESTONE QUEST: ALPHA MODE (inside THE IRON).
-- The campaign layer over the 012 workout tracker: per-user
-- campaign state (phase/week/stage/body stats/hormone dials) and
-- an append-only event log (boss defeats, cheat days, fasts,
-- stage-ups, measurements). Campaign workouts save through the
-- existing workout_sessions table, tagged via a new meta column.
-- Owner-only RLS, journal_*/workout_* pattern.
-- ============================================================

-- ---------- campaign state (one row per user) ----------
create table if not exists public.alpha_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phase text not null default 'prime'
    check (phase in ('prime','adapt','surge','complete')),
  week int not null default 1 check (week between 1 and 4),
  stage int not null default 1 check (stage between 1 and 11),
  body_weight numeric,
  body_fat numeric,
  archetype text,
  flags jsonb not null default '{}'::jsonb,
  hormones jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- event log (append-only) ----------
create table if not exists public.alpha_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 40),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- tag campaign sessions in the existing tracker ----------
alter table public.workout_sessions
  add column if not exists meta jsonb;

-- ---------- indexes ----------
create index if not exists alpha_events_user_created_idx
  on public.alpha_events (user_id, created_at desc);
create index if not exists alpha_events_user_kind_idx
  on public.alpha_events (user_id, kind);

-- ---------- RLS: owner-only ----------
alter table public.alpha_state  enable row level security;
alter table public.alpha_events enable row level security;

drop policy if exists alpha_state_owner on public.alpha_state;
create policy alpha_state_owner on public.alpha_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists alpha_events_owner on public.alpha_events;
create policy alpha_events_owner on public.alpha_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- grants ----------
revoke all on public.alpha_state, public.alpha_events from public, anon;
grant select, insert, update, delete on public.alpha_state, public.alpha_events
  to authenticated;
