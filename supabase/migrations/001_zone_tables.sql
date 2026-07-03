-- ============================================================
-- 001_zone_tables — The Accountability Zone: tables + indexes
-- Additive only: no existing table, policy, or function is touched.
-- ============================================================

create extension if not exists citext with schema extensions;

-- ---------- zone_members ----------
create table if not exists public.zone_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username extensions.citext unique not null check ((username)::text ~ '^[a-z0-9_]{3,20}$'),
  display_name text,
  identity_title text,
  avatar_url text,
  rules_version int not null default 1,
  rules_accepted_at timestamptz not null default now(),
  zone_streak int not null default 0,
  longest_zone_streak int not null default 0,
  last_proof_date date,
  fallen_streak int not null default 0,
  ash_since date,
  joined_at timestamptz not null default now()
);

-- ---------- friendships ----------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references public.zone_members(user_id) on delete cascade,
  addressee uuid not null references public.zone_members(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester <> addressee)
);
create unique index if not exists friendships_pair_uniq
  on public.friendships (least(requester, addressee), greatest(requester, addressee));

-- ---------- blocks ----------
create table if not exists public.blocks (
  blocker uuid not null references public.zone_members(user_id) on delete cascade,
  blocked uuid not null references public.zone_members(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);

-- ---------- reports ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references public.zone_members(user_id) on delete cascade,
  target_user uuid,
  content_type text not null check (content_type in ('feed_event','comment','message','profile','challenge')),
  content_id uuid,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- ---------- squads ----------
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  emblem text not null default '🔥',
  invite_code text unique not null,
  created_by uuid references public.zone_members(user_id) on delete set null,
  last_eruption_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- squad_members ----------
create table if not exists public.squad_members (
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  role text not null default 'member' check (role in ('owner','mod','member')),
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);
create index if not exists squad_members_user_idx on public.squad_members (user_id);

-- ---------- partner_links ----------
create table if not exists public.partner_links (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.zone_members(user_id) on delete cascade,
  user_b uuid not null references public.zone_members(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','ended')),
  partner_streak int not null default 0,
  last_mutual_date date,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  ended_at timestamptz,
  check (user_a <> user_b)
);
create unique index if not exists partner_links_active_a_uniq
  on public.partner_links (user_a) where status = 'active';
create unique index if not exists partner_links_active_b_uniq
  on public.partner_links (user_b) where status = 'active';

-- ---------- zone_missions ----------
create table if not exists public.zone_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  mission_date date not null,
  category text not null default 'custom',
  title text not null check (char_length(title) <= 120),
  note text check (char_length(note) <= 200),
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now(),
  unique (user_id, mission_date)
);

-- ---------- zone_proofs ----------
create table if not exists public.zone_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  mission_id uuid references public.zone_missions(id) on delete set null,
  proof_date date not null,
  kind text not null check (kind in ('photo','text')),
  caption text check (char_length(caption) <= 300),
  media_path text,
  xp_earned int not null default 25,
  duration_minutes int check (duration_minutes between 1 and 1440),
  local_time time,
  photo_source text check (photo_source in ('camera','library')),
  created_at timestamptz not null default now()
);
create index if not exists zone_proofs_user_date_idx on public.zone_proofs (user_id, proof_date desc);

-- ---------- feed_events ----------
create table if not exists public.feed_events (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null references public.zone_members(user_id) on delete cascade,
  event_type text not null check (event_type in
    ('declare','proof','rise','squad_join','eruption','challenge_join','challenge_complete','weekly_report')),
  squad_id uuid references public.squads(id) on delete cascade,
  ref_id uuid,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists feed_events_created_idx on public.feed_events (created_at desc);
create index if not exists feed_events_actor_idx on public.feed_events (actor, created_at desc);

-- ---------- reactions ----------
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.feed_events(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  emoji text not null check (emoji in ('🔥','💪','⚡','🦅','👏','❤️','👀','🏆','✅')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id, emoji)
);
create index if not exists reactions_event_idx on public.reactions (event_id);

-- ---------- comments ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.feed_events(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists comments_event_idx on public.comments (event_id, created_at);

-- ---------- challenges ----------
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator uuid not null references public.zone_members(user_id) on delete cascade,
  scope text not null check (scope in ('squad','friends')),
  squad_id uuid references public.squads(id) on delete cascade,
  template_key text,
  title text not null check (char_length(title) <= 80),
  description text,
  duration_days int not null check (duration_days between 3 and 90),
  starts_on date not null,
  ends_on date,
  status text not null default 'active' check (status in ('active','completed','archived')),
  created_at timestamptz not null default now(),
  check ((scope = 'squad') = (squad_id is not null))
);

-- ---------- challenge_members ----------
create table if not exists public.challenge_members (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  days_done int not null default 0,
  points int not null default 0,
  last_checkin date,
  completed_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

-- ---------- challenge_checkins ----------
create table if not exists public.challenge_checkins (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  day date not null,
  note text,
  primary key (challenge_id, user_id, day)
);

-- ---------- conversations ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('dm','squad')),
  squad_id uuid unique references public.squads(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((kind = 'squad') = (squad_id is not null))
);

-- ---------- conversation_members ----------
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  last_read_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members (user_id);

-- ---------- messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender uuid not null references public.zone_members(user_id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at desc);

-- ---------- message_reactions ----------
create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  emoji text not null,
  primary key (message_id, user_id, emoji)
);

-- ---------- zone_notifications ----------
create table if not exists public.zone_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  kind text not null check (kind in
    ('friend_request','friend_accept','squad_join','partner_invite','partner_accept','partner_action',
     'reaction','comment','challenge_invite','challenge_complete','message','eruption','system')),
  actor uuid references public.zone_members(user_id) on delete cascade,
  ref_id uuid,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists zone_notifications_user_idx on public.zone_notifications (user_id, created_at desc);

-- ---------- zone_weekly_reports ----------
create table if not exists public.zone_weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zone_members(user_id) on delete cascade,
  week_start date not null,
  missions_declared int not null default 0,
  proofs_posted int not null default 0,
  proof_days int not null default 0,
  consistency_pct int not null default 0,
  streak_end int not null default 0,
  payload jsonb not null default '{}',
  shared_event_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- ---------- invite code generator ----------
create or replace function public.az_gen_invite_code()
returns text
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
begin
  loop
    v_code := '';
    for i in 1..8 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * 31)::int, 1);
    end loop;
    exit when not exists (select 1 from public.squads where invite_code = v_code);
  end loop;
  return v_code;
end;
$$;
revoke execute on function public.az_gen_invite_code() from public, anon;
grant execute on function public.az_gen_invite_code() to authenticated;

-- ---------- RLS on (no policy = no access; writes go through RPCs) ----------
alter table public.zone_members enable row level security;
alter table public.friendships enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.partner_links enable row level security;
alter table public.zone_missions enable row level security;
alter table public.zone_proofs enable row level security;
alter table public.feed_events enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.challenge_checkins enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.zone_notifications enable row level security;
alter table public.zone_weekly_reports enable row level security;
