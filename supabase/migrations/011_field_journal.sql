-- ============================================================
-- 011_field_journal — The Field Journal: dark-leather/gold-foil
-- sales-entrepreneur journal. Five pillar entries, story chapters,
-- a prayer ledger (lift → answered), and per-user journal state.
-- Private single-user data: direct table access under RLS
-- (gratitude_entries pattern), no RPCs needed.
-- ============================================================

-- ---------- chapters ----------
create table if not exists public.journal_chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  epigraph text check (epigraph is null or char_length(epigraph) <= 160),
  leather text not null default 'oxblood',
  emblem text not null default '✦',
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- entries (pillar + story) ----------
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space text not null check (space in ('pillar','story')),
  pillar text check (pillar is null or pillar in
    ('physical','intellectual','emotional','spiritual','financial')),
  chapter_id uuid references public.journal_chapters(id) on delete set null,
  title text check (title is null or char_length(title) <= 60),
  body text not null check (char_length(body) between 1 and 20000),
  mood text,
  linked_to uuid references public.journal_entries(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- prayers (lifted up → answered) ----------
create table if not exists public.journal_prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text check (title is null or char_length(title) <= 60),
  body text not null check (char_length(body) between 1 and 4000),
  answered_at timestamptz,
  answered_note text check (answered_note is null or char_length(answered_note) <= 2000),
  created_at timestamptz not null default now()
);

-- ---------- per-user journal state ----------
create table if not exists public.journal_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  wizard_seen boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);
create index if not exists journal_entries_chapter_idx
  on public.journal_entries (chapter_id);
create index if not exists journal_chapters_user_pos_idx
  on public.journal_chapters (user_id, position);
create index if not exists journal_prayers_user_created_idx
  on public.journal_prayers (user_id, created_at desc);

-- ---------- RLS: owner-only, all four verbs ----------
alter table public.journal_chapters enable row level security;
alter table public.journal_entries  enable row level security;
alter table public.journal_prayers  enable row level security;
alter table public.journal_state    enable row level security;

drop policy if exists journal_chapters_owner on public.journal_chapters;
create policy journal_chapters_owner on public.journal_chapters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists journal_entries_owner on public.journal_entries;
create policy journal_entries_owner on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists journal_prayers_owner on public.journal_prayers;
create policy journal_prayers_owner on public.journal_prayers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists journal_state_owner on public.journal_state;
create policy journal_state_owner on public.journal_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- grants ----------
revoke all on public.journal_chapters, public.journal_entries,
  public.journal_prayers, public.journal_state from public, anon;
grant select, insert, update, delete on public.journal_chapters,
  public.journal_entries, public.journal_prayers, public.journal_state
  to authenticated;
