-- ═══════════════════════════════════════════════════════════
-- ALPHA MODE + THE IRON — one-paste migration bundle
-- Paste this WHOLE file into: supabase.com → project
-- gvtxvwlzyzmfszapzcce → SQL Editor → Run.
-- Safe to run twice (everything is IF NOT EXISTS / DROP-IF).
-- Bundles migrations: 012_iron_workout, 013_alpha_mode,
-- 016_fridge_photos.
-- ═══════════════════════════════════════════════════════════

-- ============================================================
-- 012_iron_workout â€” THE IRON: steel/chalk/ember workout mode.
-- Training plans (built or from templates), logged sessions
-- (full set-by-set jsonb), an auto-detected PR wall, and
-- per-user workout state. Private single-user data: direct
-- table access under owner-only RLS (journal_* pattern).
-- ============================================================

-- ---------- plans ----------
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  focus text check (focus is null or char_length(focus) <= 40),
  steel text not null default 'gunmetal',
  emblem text not null default 'â–²',
  exercises jsonb not null default '[]'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- sessions (one finished workout) ----------
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.workout_plans(id) on delete set null,
  plan_name text check (plan_name is null or char_length(plan_name) <= 60),
  duration_s int not null default 0,
  total_volume numeric not null default 0,
  total_sets int not null default 0,
  exercises jsonb not null default '[]'::jsonb,
  note text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

-- ---------- PRs (auto-detected heaviest lifts) ----------
create table if not exists public.workout_prs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null check (char_length(exercise) between 1 and 60),
  weight numeric not null,
  reps int not null default 1,
  session_id uuid references public.workout_sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- per-user workout state ----------
create table if not exists public.workout_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creed_seen boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists workout_sessions_user_created_idx
  on public.workout_sessions (user_id, created_at desc);
create index if not exists workout_plans_user_pos_idx
  on public.workout_plans (user_id, position);
create index if not exists workout_prs_user_exercise_idx
  on public.workout_prs (user_id, exercise);

-- ---------- RLS: owner-only, all four verbs ----------
alter table public.workout_plans    enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_prs      enable row level security;
alter table public.workout_state    enable row level security;

drop policy if exists workout_plans_owner on public.workout_plans;
create policy workout_plans_owner on public.workout_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_sessions_owner on public.workout_sessions;
create policy workout_sessions_owner on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_prs_owner on public.workout_prs;
create policy workout_prs_owner on public.workout_prs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_state_owner on public.workout_state;
create policy workout_state_owner on public.workout_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- grants ----------
revoke all on public.workout_plans, public.workout_sessions,
  public.workout_prs, public.workout_state from public, anon;
grant select, insert, update, delete on public.workout_plans,
  public.workout_sessions, public.workout_prs, public.workout_state
  to authenticated;

-- ─────────────────── 013 ───────────────────

-- ============================================================
-- 013_alpha_mode â€” MILESTONE QUEST: ALPHA MODE (inside THE IRON).
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

-- ─────────────────── 016 ───────────────────

-- ============================================================
-- 016_fridge_photos â€” ALPHA MODE Â· The Stockpile.
-- Private storage bucket for daily meal-photo accountability
-- ("pin a picture to your fridge door"). Owner-only via the
-- folder-name = auth.uid() pattern (zone storage precedent).
-- Photos default private; sharing goes through the Zone flow.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('fridge-photos', 'fridge-photos', false)
on conflict (id) do nothing;

drop policy if exists fridge_photos_select on storage.objects;
create policy fridge_photos_select on storage.objects
  for select to authenticated
  using (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists fridge_photos_insert on storage.objects;
create policy fridge_photos_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists fridge_photos_update on storage.objects;
create policy fridge_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists fridge_photos_delete on storage.objects;
create policy fridge_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);
