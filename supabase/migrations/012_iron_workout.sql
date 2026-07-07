-- ============================================================
-- 012_iron_workout — THE IRON: steel/chalk/ember workout mode.
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
  emblem text not null default '▲',
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
