-- ============================================================
-- 010_recommit — The Recommit: the Shift One integrity ritual.
-- Face the lie → the truth → declaration + a 24h proof promise,
-- posted publicly to the feed. The cost step is private and
-- never reaches the server. Additive: extends feed_events
-- kinds and adds one az_* SECURITY DEFINER RPC (004 pattern).
-- ============================================================

-- ---------- allow 'recommit' feed events ----------
-- Drop + recreate idempotently, preserving every original kind (001).
alter table public.feed_events
  drop constraint if exists feed_events_event_type_check;
alter table public.feed_events
  add constraint feed_events_event_type_check check (event_type in (
    -- original zone kinds (001)
    'declare','proof','rise','squad_join','eruption',
    'challenge_join','challenge_complete','weekly_report',
    -- shift one ritual (010)
    'recommit'
  ));

-- ---------- az_recommit ----------
-- Posts the ritual as a feed event. A recommit is also a rise: if the
-- member is in ash, ash clears (same move as az_rise_again, deeper walk).
-- Optionally puts the proof promise on the board as today's mission
-- (az_declare_mission semantics: update-in-place, never resets status).
-- XP lands once per local day; the post itself always lands.
create or replace function public.az_recommit(
  p_local_date date, p_lie text, p_truth text,
  p_declaration text, p_proof text, p_as_mission boolean)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_member public.zone_members;
  v_mission public.zone_missions;
  v_rose boolean := false;
  v_fallen int := 0;
  v_first_today boolean;
  v_xp int := 0;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  if p_lie is null or trim(p_lie) = '' or char_length(p_lie) > 200
     or p_truth is null or trim(p_truth) = '' or char_length(p_truth) > 200
     or p_declaration is null or trim(p_declaration) = '' or char_length(p_declaration) > 200
     or p_proof is null or trim(p_proof) = '' or char_length(p_proof) > 200 then
    raise exception 'not_allowed';
  end if;

  select * into v_member from public.zone_members where user_id = v_me;
  if not found then raise exception 'not_member'; end if;

  -- ash has one door, and this walks through it
  if v_member.ash_since is not null then
    v_rose := true;
    v_fallen := v_member.fallen_streak;
    update public.zone_members
    set ash_since = null, fallen_streak = 0
    where user_id = v_me;
  end if;

  -- XP once per local day (anti-farm)
  select not exists (
    select 1 from public.feed_events
    where actor = v_me and event_type = 'recommit'
      and payload->>'local_date' = p_local_date::text
  ) into v_first_today;
  if v_first_today then v_xp := 20; end if;

  -- the proof promise becomes today's mission (custom category)
  if coalesce(p_as_mission, false) then
    select * into v_mission from public.zone_missions
    where user_id = v_me and mission_date = p_local_date;
    if found then
      update public.zone_missions
      set category = 'custom', title = p_proof, note = p_declaration
      where id = v_mission.id
      returning * into v_mission;
    else
      insert into public.zone_missions (user_id, mission_date, category, title, note)
      values (v_me, p_local_date, 'custom', p_proof, p_declaration)
      returning * into v_mission;
    end if;
  end if;

  insert into public.feed_events (actor, event_type, payload)
  values (v_me, 'recommit', jsonb_build_object(
    'local_date', p_local_date::text,
    'lie', trim(p_lie), 'truth', trim(p_truth),
    'declaration', trim(p_declaration), 'proof', trim(p_proof),
    'rose', v_rose, 'fallen_streak', v_fallen,
    'xp', v_xp,
    'username', v_member.username, 'display_name', v_member.display_name,
    'avatar_url', v_member.avatar_url));

  return jsonb_build_object(
    'xp_earned', v_xp,
    'rose', v_rose,
    'fallen_streak', v_fallen,
    'mission', to_jsonb(v_mission));
end;
$$;
revoke execute on function public.az_recommit(date, text, text, text, text, boolean) from public, anon;
grant execute on function public.az_recommit(date, text, text, text, text, boolean) to authenticated;
