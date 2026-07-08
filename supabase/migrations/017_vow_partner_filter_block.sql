-- ═══════════════════════════════════════════════════════════════════════
-- 017 · VOW / PARTNER-NOTE FILTER + VOW BLOCK VISIBILITY
-- Closes the Guideline 1.2 gaps found in the pre-submission audit:
--   • THE VOW (arena_vows.title/if_cue/stake) is shown to the witness and
--     squadmates but was never run through the server content filter, and a
--     blocked user could still see a blocker's squad-scoped vow.
--   • The partner note (zone_notifications payload, kind='partner_action')
--     is free text delivered to another user, also unfiltered server-side.
-- Reuses public.az_is_objectionable() from migration 014.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Extend the shared filter trigger to cover arena_vows' text columns.
create or replace function public.az_block_objectionable()
returns trigger
language plpgsql
as $$
declare
  offending text;
begin
  if tg_table_name = 'feed_events' then
    -- scan every string value in the payload (declarations, captions, etc.)
    select string_agg(value, ' ') into offending
    from jsonb_each_text(coalesce(new.payload, '{}'::jsonb));
  elsif tg_table_name = 'arena_vows' then
    offending := concat_ws(' ', new.title, new.if_cue, new.stake);
  else
    offending := new.body;
  end if;

  if public.az_is_objectionable(offending) then
    raise exception 'content_blocked' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_filter_arena_vows on public.arena_vows;
create trigger trg_filter_arena_vows
  before insert or update on public.arena_vows
  for each row execute function public.az_block_objectionable();

-- 2. Partner note: only the 'note' key of a partner_action notification is
--    user-authored free text — scan just that, leaving system notifications
--    (friend requests, etc.) untouched.
create or replace function public.az_block_objectionable_partner_note()
returns trigger
language plpgsql
as $$
begin
  if new.kind = 'partner_action'
     and public.az_is_objectionable(new.payload->>'note') then
    raise exception 'content_blocked' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_filter_partner_note on public.zone_notifications;
create trigger trg_filter_partner_note
  before insert on public.zone_notifications
  for each row execute function public.az_block_objectionable_partner_note();

-- 3. Two-way blocking now hides a vow from a blocked party (matches the feed,
--    comments, DMs, and leaderboard). Owner still always sees their own vow.
drop policy if exists arena_vows_select on public.arena_vows;
create policy arena_vows_select on public.arena_vows
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (
      (witness_id = (select auth.uid())
       or (squad_id is not null and public.az_is_squad_member(squad_id, (select auth.uid()))))
      and not public.az_is_blocked(user_id, (select auth.uid()))
    )
  );
