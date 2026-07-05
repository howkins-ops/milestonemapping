-- ============================================================
-- 007_arena_tables — The Squad Arena: tables + indexes + RLS
-- Additive only. Mirrors 001/002 conventions (snake_case,
-- RLS on every table, SELECT policies only — all writes go
-- through az_* SECURITY DEFINER RPCs in 008). Server is
-- authoritative; clients never write game outcomes directly.
-- ============================================================

-- ---------- extend zone_notifications kinds (arena events) ----------
-- InboxPanel/NotificationRow switch on `kind` (with a graceful default),
-- so the arena kinds must be permitted by the CHECK constraint before any
-- RPC can insert them. Drop + recreate idempotently, preserving every
-- original kind and appending the arena notification/witness kinds.
alter table public.zone_notifications
  drop constraint if exists zone_notifications_kind_check;
alter table public.zone_notifications
  add constraint zone_notifications_kind_check check (kind in (
    -- original zone kinds (001)
    'friend_request','friend_accept','squad_join','partner_invite','partner_accept',
    'partner_action','reaction','comment','challenge_invite','challenge_complete',
    'message','eruption','system',
    -- arena kinds (007)
    'vow_created','vow_defused','vow_detonated',
    'boss_hit','boss_slain',
    'chain_extended','chain_broken','chain_frozen',
    'duel_started','duel_won',
    'dawn_first',
    'stake_set','stake_kept','stake_forfeit',
    'league_promoted','league_relegated'
  ));

-- ---------- arena_vows ----------
-- THE VOW: a dated if-then commitment a witness sees. Detonation resolves
-- LAZILY on read (az_vow_list): due_at < now() and still 'live' → 'detonated'.
create table if not exists public.arena_vows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  squad_id uuid references public.squads(id) on delete set null,
  witness_id uuid references public.zone_members(user_id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  if_cue text check (char_length(if_cue) <= 200),
  due_at timestamptz not null,
  stake text check (char_length(stake) <= 200),
  status text not null default 'live' check (status in ('live','defused','detonated')),
  proof_id uuid references public.zone_proofs(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists arena_vows_user_idx on public.arena_vows (user_id, created_at desc);
create index if not exists arena_vows_witness_idx on public.arena_vows (witness_id, created_at desc);
create index if not exists arena_vows_squad_idx on public.arena_vows (squad_id, created_at desc);
create index if not exists arena_vows_live_due_idx on public.arena_vows (status, due_at);

-- ---------- arena_bosses ----------
-- Squad co-op weekly boss. HP is DERIVED server-side from that week's squad
-- check-ins (damage) — max_hp is fixed at creation, hp/defeated computed on read.
create table if not exists public.arena_bosses (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  week_start date not null,
  boss_key text not null,
  max_hp int not null check (max_hp > 0),
  created_at timestamptz not null default now(),
  defeated_at timestamptz,
  unique (squad_id, week_start)
);
create index if not exists arena_bosses_squad_idx on public.arena_bosses (squad_id, week_start desc);

-- ---------- arena_chains ----------
-- Shared squad streak. Advances only when all active members checked in that day.
create table if not exists public.arena_chains (
  squad_id uuid primary key references public.squads(id) on delete cascade,
  current_len int not null default 0,
  best_len int not null default 0,
  last_advanced_on date,
  freezes_remaining int not null default 2
);

-- ---------- arena_duels ----------
-- 7-day 1v1 on activity. Scores DERIVED from each user's proofs in range.
create table if not exists public.arena_duels (
  id uuid primary key default gen_random_uuid(),
  a_user uuid not null references public.zone_members(user_id) on delete cascade,
  b_user uuid not null references public.zone_members(user_id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'live' check (status in ('live','ended')),
  created_at timestamptz not null default now(),
  check (a_user <> b_user)
);
create index if not exists arena_duels_a_idx on public.arena_duels (a_user, ends_on desc);
create index if not exists arena_duels_b_idx on public.arena_duels (b_user, ends_on desc);
create index if not exists arena_duels_status_idx on public.arena_duels (status);

-- ---------- arena_squad_week ----------
-- Weekly squad points (derived from check-ins) for Ascension ranking.
create table if not exists public.arena_squad_week (
  squad_id uuid not null references public.squads(id) on delete cascade,
  week_start date not null,
  points int not null default 0,
  primary key (squad_id, week_start)
);

-- ---------- arena_league ----------
-- Division mapping to fire tiers for Ascension promote/relegate.
create table if not exists public.arena_league (
  squad_id uuid primary key references public.squads(id) on delete cascade,
  division text not null default 'warm'
    check (division in ('cold','warm','burning','inferno','phoenix'))
);

-- ---------- arena_fullcourt_games ----------
-- One row per finished FULL COURT game — the season log (replaces localStorage).
create table if not exists public.arena_fullcourt_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  played_on date not null,
  mode text not null default 'rookie' check (mode in ('rookie','pro')),
  points int not null default 0,
  doors int not null default 0,
  contacts int not null default 0,
  pitches int not null default 0,
  sales int not null default 0,
  q_won int not null default 0,
  ot boolean not null default false,
  avg_dollar numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists arena_fullcourt_user_idx
  on public.arena_fullcourt_games (user_id, played_on desc, created_at desc);

-- ---------- arena_stakes ----------
-- The Pit: opt-in stakes (fire/Cups/ego — NO real money). Partner referees.
create table if not exists public.arena_stakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  referee_id uuid not null references public.zone_members(user_id) on delete cascade,
  ref_kind text not null check (ref_kind in ('vow','challenge')),
  ref_id uuid,
  stake_kind text not null check (stake_kind in ('fire','cups','ego')),
  amount int not null default 0 check (amount >= 0),
  ladder_level int not null default 0,
  status text not null default 'pending' check (status in ('pending','kept','forfeit')),
  created_at timestamptz not null default now(),
  check (user_id <> referee_id)
);
create index if not exists arena_stakes_user_idx on public.arena_stakes (user_id, created_at desc);
create index if not exists arena_stakes_referee_idx on public.arena_stakes (referee_id, created_at desc);
create index if not exists arena_stakes_status_idx on public.arena_stakes (status);

-- ---------- RLS on (SELECT policies only; writes flow through RPCs) ----------
alter table public.arena_vows enable row level security;
alter table public.arena_bosses enable row level security;
alter table public.arena_chains enable row level security;
alter table public.arena_duels enable row level security;
alter table public.arena_squad_week enable row level security;
alter table public.arena_league enable row level security;
alter table public.arena_fullcourt_games enable row level security;
alter table public.arena_stakes enable row level security;

-- arena_vows: owner, witness, or squadmates (when squad-scoped) may read
drop policy if exists arena_vows_select on public.arena_vows;
create policy arena_vows_select on public.arena_vows
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or witness_id = (select auth.uid())
    or (squad_id is not null and public.az_is_squad_member(squad_id, (select auth.uid())))
  );

-- arena_bosses: squadmates read
drop policy if exists arena_bosses_select on public.arena_bosses;
create policy arena_bosses_select on public.arena_bosses
  for select to authenticated
  using (public.az_is_squad_member(squad_id, (select auth.uid())));

-- arena_chains: squadmates read
drop policy if exists arena_chains_select on public.arena_chains;
create policy arena_chains_select on public.arena_chains
  for select to authenticated
  using (public.az_is_squad_member(squad_id, (select auth.uid())));

-- arena_duels: the two combatants read
drop policy if exists arena_duels_select on public.arena_duels;
create policy arena_duels_select on public.arena_duels
  for select to authenticated
  using ((select auth.uid()) in (a_user, b_user));

-- arena_squad_week: squadmates read
drop policy if exists arena_squad_week_select on public.arena_squad_week;
create policy arena_squad_week_select on public.arena_squad_week
  for select to authenticated
  using (public.az_is_squad_member(squad_id, (select auth.uid())));

-- arena_league: squadmates read (peers surfaced via definer RPC)
drop policy if exists arena_league_select on public.arena_league;
create policy arena_league_select on public.arena_league
  for select to authenticated
  using (public.az_is_squad_member(squad_id, (select auth.uid())));

-- arena_fullcourt_games: owner + anyone who can see the owner (partner/squad/friend)
drop policy if exists arena_fullcourt_games_select on public.arena_fullcourt_games;
create policy arena_fullcourt_games_select on public.arena_fullcourt_games
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.az_can_see((select auth.uid()), user_id)
  );

-- arena_stakes: the staker and the referee read
drop policy if exists arena_stakes_select on public.arena_stakes;
create policy arena_stakes_select on public.arena_stakes
  for select to authenticated
  using ((select auth.uid()) in (user_id, referee_id));
