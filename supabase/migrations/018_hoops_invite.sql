-- HOOPS live-match invite: let a rep invite a Zone friend/partner to a live
-- head-to-head match. The match itself is ephemeral (runs over Realtime
-- Broadcast keyed by a shared 5-char code — no table), so this just drops a
-- notification carrying the code. Mirrors az_arena_duel_start (008).
-- The invitee's app, if open, gets it in real time via the zone-notif-<uid>
-- subscription (useZone.js); it also persists to their inbox. Tapping it deep-
-- links them into joinLiveMatch(code) in HOOPS. (No lock-screen push — that
-- needs separate device-token + APNs/FCM infra.)

-- 1) permit the new notification kind (preserve every existing kind + add match_invite)
alter table public.zone_notifications
  drop constraint if exists zone_notifications_kind_check;
alter table public.zone_notifications
  add constraint zone_notifications_kind_check check (kind = any (array[
    'friend_request','friend_accept','squad_join','partner_invite','partner_accept',
    'partner_action','reaction','comment','challenge_invite','challenge_complete',
    'message','eruption','system',
    'vow_created','vow_defused','vow_detonated',
    'boss_hit','boss_slain',
    'chain_extended','chain_broken','chain_frozen',
    'duel_started','duel_won',
    'dawn_first',
    'stake_set','stake_kept','stake_forfeit',
    'league_promoted','league_relegated',
    'match_invite'
  ]::text[]));

-- 2) az_hoops_invite(partner, code) — notify a visible friend they've been challenged
create or replace function public.az_hoops_invite(p_partner uuid, p_match_code text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_meRow public.zone_members;
  v_code text := upper(regexp_replace(coalesce(p_match_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_partner is null or p_partner = v_me then raise exception 'not_allowed'; end if;
  if not public.az_can_see(v_me, p_partner) then raise exception 'not_allowed'; end if;
  if length(v_code) < 4 then raise exception 'bad_code'; end if;

  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (p_partner, 'match_invite', v_me, null, jsonb_build_object(
    'match_code', v_code,
    'game', 'hoops',
    'username', v_meRow.username,
    'display_name', v_meRow.display_name));
  return jsonb_build_object('ok', true, 'match_code', v_code);
end;
$$;
revoke execute on function public.az_hoops_invite(uuid, text) from public, anon;
grant execute on function public.az_hoops_invite(uuid, text) to authenticated;
