-- ============================================================
-- 004_zone_rpcs_content — missions, proofs, state, challenges,
-- reports, messaging helpers, triggers
-- ============================================================

-- 1. az_declare_mission --------------------------------------
create or replace function public.az_declare_mission(
  p_local_date date, p_category text, p_title text, p_note text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_meRow public.zone_members;
  v_m public.zone_missions;
  v_xp int := 0;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  if p_title is null or trim(p_title) = '' then raise exception 'not_allowed'; end if;
  select * into v_meRow from public.zone_members where user_id = v_me;
  if not found then raise exception 'not_member'; end if;

  select * into v_m from public.zone_missions
  where user_id = v_me and mission_date = p_local_date;
  if found then
    update public.zone_missions
    set category = coalesce(nullif(trim(coalesce(p_category,'')),''), 'custom'),
        title = p_title,
        note = p_note
    where id = v_m.id
    returning * into v_m;
    v_xp := 0;
  else
    insert into public.zone_missions (user_id, mission_date, category, title, note)
    values (v_me, p_local_date,
            coalesce(nullif(trim(coalesce(p_category,'')),''), 'custom'),
            p_title, p_note)
    returning * into v_m;
    v_xp := 10;
    insert into public.feed_events (actor, event_type, payload)
    values (v_me, 'declare', jsonb_build_object(
      'category', v_m.category, 'title', v_m.title, 'note', v_m.note,
      'username', v_meRow.username, 'display_name', v_meRow.display_name,
      'avatar_url', v_meRow.avatar_url));
  end if;
  return jsonb_build_object('mission', to_jsonb(v_m), 'xp_earned', v_xp);
end;
$$;
revoke execute on function public.az_declare_mission(date, text, text, text) from public, anon;
grant execute on function public.az_declare_mission(date, text, text, text) to authenticated;

-- 2. az_post_proof — the atomic heart ------------------------
create or replace function public.az_post_proof(
  p_local_date date, p_kind text, p_caption text, p_media_path text,
  p_challenge_id uuid, p_duration_minutes int, p_local_time time, p_photo_source text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_member public.zone_members;
  v_mission public.zone_missions;
  v_today_count int;
  v_xp int;
  v_proof_id uuid;
  v_new_streak int;
  v_ch public.challenges;
  v_cm public.challenge_members;
  v_ch_result jsonb := null;
  v_partner_streak int := null;
  v_erupted jsonb := '[]'::jsonb;
  v_fire_days int;
  v_rows int;
  v_link public.partner_links;
  v_partner uuid;
  r record;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  if p_kind is null or p_kind not in ('photo','text') then raise exception 'not_allowed'; end if;
  if p_kind = 'photo' and (p_media_path is null or trim(p_media_path) = '') then
    raise exception 'not_allowed';
  end if;
  if p_duration_minutes is not null and p_duration_minutes not between 1 and 1440 then
    raise exception 'not_allowed';
  end if;
  if p_photo_source is not null and p_photo_source not in ('camera','library') then
    raise exception 'not_allowed';
  end if;

  select * into v_member from public.zone_members where user_id = v_me;
  if not found then raise exception 'not_member'; end if;

  select count(*) into v_today_count from public.zone_proofs
  where user_id = v_me and proof_date = p_local_date;
  v_xp := case when v_today_count = 0 then 25 else 5 end;

  select * into v_mission from public.zone_missions
  where user_id = v_me and mission_date = p_local_date;

  insert into public.zone_proofs
    (user_id, mission_id, proof_date, kind, caption, media_path, xp_earned,
     duration_minutes, local_time, photo_source)
  values (v_me, v_mission.id, p_local_date, p_kind, p_caption, p_media_path, v_xp,
          p_duration_minutes, p_local_time, p_photo_source)
  returning id into v_proof_id;

  -- streak
  if v_member.last_proof_date = p_local_date then
    v_new_streak := v_member.zone_streak;
  elsif v_member.last_proof_date = p_local_date - 1 then
    v_new_streak := v_member.zone_streak + 1;
  else
    v_new_streak := 1;
  end if;
  update public.zone_members set
    zone_streak = v_new_streak,
    longest_zone_streak = greatest(longest_zone_streak, v_new_streak),
    last_proof_date = greatest(coalesce(last_proof_date, '-infinity'::date), p_local_date),
    ash_since = null,
    fallen_streak = 0
  where user_id = v_me;

  -- mark today's mission done
  if v_mission.id is not null then
    update public.zone_missions set status = 'done' where id = v_mission.id;
  end if;

  -- challenge inline check-in (+15 points; personal +200 badge)
  if p_challenge_id is not null then
    select * into v_ch from public.challenges where id = p_challenge_id;
    if not found then raise exception 'not_member'; end if;
    select * into v_cm from public.challenge_members
    where challenge_id = p_challenge_id and user_id = v_me;
    if not found then raise exception 'not_member'; end if;
    if v_ch.status = 'active' then
      insert into public.challenge_checkins (challenge_id, user_id, day)
      values (p_challenge_id, v_me, p_local_date)
      on conflict do nothing;
      get diagnostics v_rows = row_count;
      if v_rows > 0 then
        update public.challenge_members
        set days_done = days_done + 1, points = points + 15, last_checkin = p_local_date
        where challenge_id = p_challenge_id and user_id = v_me
        returning * into v_cm;
        v_xp := v_xp + 15;
        if v_cm.days_done >= v_ch.duration_days and v_cm.completed_at is null then
          update public.challenge_members set completed_at = now()
          where challenge_id = p_challenge_id and user_id = v_me
          returning * into v_cm;
          v_xp := v_xp + 200;
          insert into public.feed_events (actor, event_type, squad_id, ref_id, payload)
          values (v_me, 'challenge_complete',
                  case when v_ch.scope = 'squad' then v_ch.squad_id end, v_ch.id,
                  jsonb_build_object('title', v_ch.title,
                    'username', v_member.username, 'display_name', v_member.display_name));
        end if;
      end if;
    end if;
    v_ch_result := jsonb_build_object(
      'days_done', v_cm.days_done,
      'duration_days', v_ch.duration_days,
      'completed', v_cm.completed_at is not null);
  end if;

  -- partner mutual-day streak
  select * into v_link from public.partner_links
  where status = 'active' and v_me in (user_a, user_b);
  if found then
    v_partner := case when v_link.user_a = v_me then v_link.user_b else v_link.user_a end;
    if exists (select 1 from public.zone_proofs
               where user_id = v_partner and proof_date = p_local_date)
       and v_link.last_mutual_date is distinct from p_local_date then
      update public.partner_links
      set partner_streak = partner_streak + 1, last_mutual_date = p_local_date
      where id = v_link.id
      returning partner_streak into v_partner_streak;
    else
      v_partner_streak := v_link.partner_streak;
    end if;
  end if;

  -- squad eruptions
  for r in
    select s.id, s.name, s.last_eruption_at,
      (select count(*) from public.squad_members sm2 where sm2.squad_id = s.id) as member_count,
      (select count(distinct p.user_id)
       from public.zone_proofs p
       join public.squad_members sm3 on sm3.user_id = p.user_id and sm3.squad_id = s.id
       where p.proof_date = p_local_date) as proved_today
    from public.squads s
    join public.squad_members sm on sm.squad_id = s.id
    where sm.user_id = v_me
  loop
    if r.proved_today >= greatest(2, ceil(r.member_count / 2.0))
       and (r.last_eruption_at is null
            or (r.last_eruption_at at time zone 'utc')::date < p_local_date) then
      update public.squads set last_eruption_at = now() where id = r.id;
      insert into public.feed_events (actor, event_type, squad_id, payload)
      values (v_me, 'eruption', r.id,
        jsonb_build_object('squad_name', r.name, 'count', r.proved_today));
      insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
      select sm4.user_id, 'eruption', v_me, r.id, jsonb_build_object('squad_name', r.name)
      from public.squad_members sm4
      where sm4.squad_id = r.id and sm4.user_id <> v_me;
      v_erupted := v_erupted || jsonb_build_object('squad_id', r.id, 'name', r.name);
    end if;
  end loop;

  -- proof feed event
  insert into public.feed_events (actor, event_type, ref_id, payload)
  values (v_me, 'proof', v_proof_id, jsonb_build_object(
    'caption', p_caption, 'kind', p_kind, 'media_path', p_media_path,
    'category', v_mission.category,
    'streak', v_new_streak, 'proof_id', v_proof_id,
    'duration_minutes', p_duration_minutes,
    'username', v_member.username, 'display_name', v_member.display_name,
    'avatar_url', v_member.avatar_url));

  select count(distinct proof_date) into v_fire_days
  from public.zone_proofs
  where user_id = v_me and proof_date between p_local_date - 6 and p_local_date;

  return jsonb_build_object(
    'proof_id', v_proof_id,
    'xp_earned', v_xp,
    'zone_streak', v_new_streak,
    'longest_zone_streak', greatest(v_member.longest_zone_streak, v_new_streak),
    'fire_days', v_fire_days,
    'erupted', v_erupted,
    'challenge', v_ch_result,
    'partner_streak', v_partner_streak);
end;
$$;
revoke execute on function public.az_post_proof(date, text, text, text, uuid, int, time, text) from public, anon;
grant execute on function public.az_post_proof(date, text, text, text, uuid, int, time, text) to authenticated;

-- 3. az_rise_again -------------------------------------------
create or replace function public.az_rise_again(p_local_date date)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_member public.zone_members;
  v_fallen int;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  select * into v_member from public.zone_members where user_id = v_me;
  if not found or v_member.ash_since is null then raise exception 'not_allowed'; end if;
  v_fallen := v_member.fallen_streak;
  update public.zone_members
  set ash_since = null, fallen_streak = 0
  where user_id = v_me;
  insert into public.feed_events (actor, event_type, payload)
  values (v_me, 'rise', jsonb_build_object(
    'fallen_streak', v_fallen,
    'username', v_member.username, 'display_name', v_member.display_name,
    'avatar_url', v_member.avatar_url));
  return jsonb_build_object('fallen_streak', v_fallen);
end;
$$;
revoke execute on function public.az_rise_again(date) from public, anon;
grant execute on function public.az_rise_again(date) to authenticated;

-- 4. az_get_zone_state ---------------------------------------
create or replace function public.az_get_zone_state(p_local_date date)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_member public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  select * into v_member from public.zone_members where user_id = v_me;
  if not found then
    return jsonb_build_object('member', null);
  end if;

  -- lazy lapse FIRST
  if v_member.zone_streak > 0
     and v_member.last_proof_date is not null
     and v_member.last_proof_date < p_local_date - 1 then
    update public.zone_members
    set fallen_streak = zone_streak, zone_streak = 0, ash_since = p_local_date
    where user_id = v_me
    returning * into v_member;
  end if;

  return jsonb_build_object(
    'member', to_jsonb(v_member),
    'fire_days', (select count(distinct proof_date) from public.zone_proofs
                  where user_id = v_me
                    and proof_date between p_local_date - 6 and p_local_date),
    'today_mission', (select to_jsonb(m) from public.zone_missions m
                      where m.user_id = v_me and m.mission_date = p_local_date),
    'today_proof_count', (select count(*) from public.zone_proofs
                          where user_id = v_me and proof_date = p_local_date),
    'unread_notifications', (select count(*) from public.zone_notifications
                             where user_id = v_me and read_at is null),
    'unread_messages', (select count(*)
                        from public.messages msg
                        join public.conversation_members cm
                          on cm.conversation_id = msg.conversation_id and cm.user_id = v_me
                        where msg.created_at > cm.last_read_at
                          and msg.sender <> v_me
                          and msg.deleted_at is null),
    'squads', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'emblem', s.emblem, 'invite_code', s.invite_code,
        'member_count', (select count(*) from public.squad_members x where x.squad_id = s.id),
        'proved_today', (select count(distinct p.user_id)
                         from public.zone_proofs p
                         join public.squad_members x on x.user_id = p.user_id and x.squad_id = s.id
                         where p.proof_date = p_local_date),
        'fire_pct', (select coalesce(round(
                       100.0 * count(distinct (p.user_id, p.proof_date))
                       / nullif((select count(*) from public.squad_members x2
                                 where x2.squad_id = s.id) * 7, 0)), 0)::int
                     from public.zone_proofs p
                     join public.squad_members x on x.user_id = p.user_id and x.squad_id = s.id
                     where p.proof_date between p_local_date - 6 and p_local_date)
      ) order by s.created_at)
      from public.squads s
      join public.squad_members sm on sm.squad_id = s.id
      where sm.user_id = v_me
    ), '[]'::jsonb),
    'partner', public.az_get_partner_state(p_local_date));
end;
$$;
revoke execute on function public.az_get_zone_state(date) from public, anon;
grant execute on function public.az_get_zone_state(date) to authenticated;

-- 5. az_get_leaderboard --------------------------------------
create or replace function public.az_get_leaderboard(p_local_date date, p_days int default 7)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_days int := least(greatest(coalesce(p_days, 7), 1), 90);
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  return coalesce((
    with pop as (
      select v_me as uid
      union
      select case when f.requester = v_me then f.addressee else f.requester end
      from public.friendships f
      where f.status = 'accepted' and v_me in (f.requester, f.addressee)
      union
      select sm2.user_id
      from public.squad_members sm
      join public.squad_members sm2 on sm2.squad_id = sm.squad_id
      where sm.user_id = v_me
    )
    select jsonb_agg(jsonb_build_object(
      'user_id', t.user_id, 'username', t.username, 'display_name', t.display_name,
      'avatar_url', t.avatar_url, 'identity_title', t.identity_title,
      'zone_streak', t.zone_streak, 'proof_days', t.proof_days, 'proofs', t.proofs,
      'consistency_pct', round(100.0 * t.proof_days / v_days)::int)
      order by t.proof_days desc, t.zone_streak desc, t.proofs desc)
    from (
      select zm.user_id, zm.username, zm.display_name, zm.avatar_url,
             zm.identity_title, zm.zone_streak,
        (select count(distinct p.proof_date) from public.zone_proofs p
         where p.user_id = zm.user_id
           and p.proof_date between p_local_date - (v_days - 1) and p_local_date) as proof_days,
        (select count(*) from public.zone_proofs p
         where p.user_id = zm.user_id
           and p.proof_date between p_local_date - (v_days - 1) and p_local_date) as proofs
      from pop
      join public.zone_members zm on zm.user_id = pop.uid
      where not public.az_is_blocked(v_me, zm.user_id)
    ) t
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.az_get_leaderboard(date, int) from public, anon;
grant execute on function public.az_get_leaderboard(date, int) to authenticated;

-- Internal: ceremony payload builder (NOT exposed as an RPC) --
create or replace function public.az_challenge_ceremony_payload(p_challenge uuid)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare
  v_ch public.challenges;
  v_rankings jsonb;
  v_winner jsonb;
  v_total_points bigint;
  v_total_checkins bigint;
begin
  select * into v_ch from public.challenges where id = p_challenge;
  if not found then return null; end if;
  select coalesce(jsonb_agg(x.item order by x.rn), '[]'::jsonb) into v_rankings
  from (
    select row_number() over (order by cm.points desc, cm.days_done desc, cm.joined_at asc) as rn,
      jsonb_build_object(
        'user_id', cm.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'points', cm.points, 'days_done', cm.days_done) as item
    from public.challenge_members cm
    join public.zone_members zm on zm.user_id = cm.user_id
    where cm.challenge_id = p_challenge
  ) x
  where x.rn <= 10;
  select coalesce(sum(points), 0) into v_total_points
  from public.challenge_members where challenge_id = p_challenge;
  select count(*) into v_total_checkins
  from public.challenge_checkins where challenge_id = p_challenge;
  v_winner := case when jsonb_array_length(v_rankings) > 0 then
    jsonb_build_object(
      'user_id', v_rankings->0->'user_id',
      'username', v_rankings->0->'username',
      'display_name', v_rankings->0->'display_name')
    else null end;
  return jsonb_build_object(
    'title', v_ch.title, 'duration_days', v_ch.duration_days,
    'total_points', v_total_points, 'total_checkins', v_total_checkins,
    'winner', v_winner, 'rankings', v_rankings);
end;
$$;
revoke execute on function public.az_challenge_ceremony_payload(uuid) from public, anon, authenticated;

-- Internal: lazy Cup finalization (NOT exposed as an RPC) -----
create or replace function public.az_finalize_challenge(p_challenge uuid)
returns void
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_ch public.challenges;
  v_payload jsonb;
begin
  select * into v_ch from public.challenges where id = p_challenge for update;
  if not found then return; end if;
  if v_ch.status <> 'active' or v_ch.ends_on is null or v_ch.ends_on >= current_date then
    return;
  end if;
  update public.challenges set status = 'completed' where id = v_ch.id;
  v_payload := public.az_challenge_ceremony_payload(v_ch.id);
  insert into public.feed_events (actor, event_type, squad_id, ref_id, payload)
  values (v_ch.creator, 'challenge_complete',
          case when v_ch.scope = 'squad' then v_ch.squad_id end,
          v_ch.id, v_payload);
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  select r.user_id, 'challenge_complete', v_ch.creator, v_ch.id,
    jsonb_build_object('title', v_ch.title,
      'winner', v_payload->'winner'->>'username', 'my_rank', r.rn)
  from (
    select cm.user_id,
      row_number() over (order by cm.points desc, cm.days_done desc, cm.joined_at asc) as rn
    from public.challenge_members cm
    where cm.challenge_id = v_ch.id
  ) r;
end;
$$;
revoke execute on function public.az_finalize_challenge(uuid) from public, anon, authenticated;

-- 6. az_create_challenge -------------------------------------
create or replace function public.az_create_challenge(
  p_scope text, p_squad uuid, p_template_key text, p_title text,
  p_description text, p_duration_days int, p_starts_on date)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_squad uuid := null;
  v_ch public.challenges;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_scope is null or p_scope not in ('squad','friends') then raise exception 'not_allowed'; end if;
  if p_title is null or trim(p_title) = '' or char_length(trim(p_title)) > 80 then
    raise exception 'not_allowed';
  end if;
  if p_duration_days is null or p_duration_days not between 3 and 90 then
    raise exception 'not_allowed';
  end if;
  if p_starts_on is null then raise exception 'bad_date'; end if;
  if p_scope = 'squad' then
    if p_squad is null or not public.az_is_squad_member(p_squad, v_me) then
      raise exception 'not_member';
    end if;
    v_squad := p_squad;
  end if;
  select * into v_meRow from public.zone_members where user_id = v_me;
  if not found then raise exception 'not_member'; end if;

  insert into public.challenges
    (creator, scope, squad_id, template_key, title, description,
     duration_days, starts_on, ends_on)
  values (v_me, p_scope, v_squad, p_template_key, trim(p_title), p_description,
          p_duration_days, p_starts_on, p_starts_on + p_duration_days - 1)
  returning * into v_ch;
  insert into public.challenge_members (challenge_id, user_id)
  values (v_ch.id, v_me);
  insert into public.feed_events (actor, event_type, squad_id, ref_id, payload)
  values (v_me, 'challenge_join', v_squad, v_ch.id, jsonb_build_object(
    'title', v_ch.title, 'username', v_meRow.username, 'display_name', v_meRow.display_name));
  return to_jsonb(v_ch);
end;
$$;
revoke execute on function public.az_create_challenge(text, uuid, text, text, text, int, date) from public, anon;
grant execute on function public.az_create_challenge(text, uuid, text, text, text, int, date) to authenticated;

-- 7. az_join_challenge ---------------------------------------
create or replace function public.az_join_challenge(p_challenge uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_ch public.challenges;
  v_meRow public.zone_members;
  v_rows int;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_can_see_challenge(p_challenge, v_me) then raise exception 'not_allowed'; end if;
  perform public.az_finalize_challenge(p_challenge);
  select * into v_ch from public.challenges where id = p_challenge;
  if v_ch.status <> 'active' then raise exception 'not_allowed'; end if;
  insert into public.challenge_members (challenge_id, user_id)
  values (p_challenge, v_me)
  on conflict (challenge_id, user_id) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    select * into v_meRow from public.zone_members where user_id = v_me;
    insert into public.feed_events (actor, event_type, squad_id, ref_id, payload)
    values (v_me, 'challenge_join',
            case when v_ch.scope = 'squad' then v_ch.squad_id end, v_ch.id,
            jsonb_build_object('title', v_ch.title,
              'username', v_meRow.username, 'display_name', v_meRow.display_name));
  end if;
  return jsonb_build_object('joined', true, 'already', v_rows = 0);
end;
$$;
revoke execute on function public.az_join_challenge(uuid) from public, anon;
grant execute on function public.az_join_challenge(uuid) to authenticated;

-- 8. az_challenge_checkin ------------------------------------
create or replace function public.az_challenge_checkin(
  p_challenge uuid, p_local_date date, p_note text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_ch public.challenges;
  v_cm public.challenge_members;
  v_meRow public.zone_members;
  v_xp int := 0;
  v_rows int;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  perform public.az_finalize_challenge(p_challenge);
  select * into v_ch from public.challenges where id = p_challenge;
  if not found then raise exception 'not_member'; end if;
  select * into v_cm from public.challenge_members
  where challenge_id = p_challenge and user_id = v_me;
  if not found then raise exception 'not_member'; end if;
  if v_ch.status <> 'active' then raise exception 'not_allowed'; end if;

  insert into public.challenge_checkins (challenge_id, user_id, day, note)
  values (p_challenge, v_me, p_local_date, p_note)
  on conflict do nothing;
  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    update public.challenge_members
    set days_done = days_done + 1, points = points + 15, last_checkin = p_local_date
    where challenge_id = p_challenge and user_id = v_me
    returning * into v_cm;
    v_xp := 15;
    if v_cm.days_done >= v_ch.duration_days and v_cm.completed_at is null then
      update public.challenge_members set completed_at = now()
      where challenge_id = p_challenge and user_id = v_me
      returning * into v_cm;
      v_xp := v_xp + 200;
      select * into v_meRow from public.zone_members where user_id = v_me;
      insert into public.feed_events (actor, event_type, squad_id, ref_id, payload)
      values (v_me, 'challenge_complete',
              case when v_ch.scope = 'squad' then v_ch.squad_id end, v_ch.id,
              jsonb_build_object('title', v_ch.title,
                'username', v_meRow.username, 'display_name', v_meRow.display_name));
    end if;
  end if;
  return jsonb_build_object(
    'days_done', v_cm.days_done,
    'duration_days', v_ch.duration_days,
    'completed', v_cm.completed_at is not null,
    'xp_earned', v_xp);
end;
$$;
revoke execute on function public.az_challenge_checkin(uuid, date, text) from public, anon;
grant execute on function public.az_challenge_checkin(uuid, date, text) to authenticated;

-- 9. az_list_challenges --------------------------------------
create or replace function public.az_list_challenges(p_local_date date)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  r record;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;

  -- lazy Cup finalization for my ended challenges
  for r in
    select c.id from public.challenges c
    join public.challenge_members m on m.challenge_id = c.id and m.user_id = v_me
    where c.status = 'active' and c.ends_on is not null and c.ends_on < current_date
  loop
    perform public.az_finalize_challenge(r.id);
  end loop;

  return jsonb_build_object(
    'active', coalesce((
      select jsonb_agg(to_jsonb(c) || jsonb_build_object(
        'member_count', (select count(*) from public.challenge_members x
                         where x.challenge_id = c.id),
        'my_days_done', m.days_done,
        'points', m.points,
        'checked_today', exists (select 1 from public.challenge_checkins k
                                 where k.challenge_id = c.id and k.user_id = v_me
                                   and k.day = p_local_date)
      ) order by c.created_at desc)
      from public.challenges c
      join public.challenge_members m on m.challenge_id = c.id and m.user_id = v_me
      where c.status = 'active' and m.completed_at is null
    ), '[]'::jsonb),
    'available', coalesce((
      select jsonb_agg(to_jsonb(c) || jsonb_build_object(
        'member_count', (select count(*) from public.challenge_members x
                         where x.challenge_id = c.id)
      ) order by c.created_at desc)
      from public.challenges c
      where c.status = 'active'
        and not exists (select 1 from public.challenge_members m
                        where m.challenge_id = c.id and m.user_id = v_me)
        and public.az_can_see_challenge(c.id, v_me)
    ), '[]'::jsonb),
    'completed', coalesce((
      select jsonb_agg(to_jsonb(c) || jsonb_build_object(
        'member_count', (select count(*) from public.challenge_members x
                         where x.challenge_id = c.id),
        'my_days_done', m.days_done,
        'points', m.points,
        'completed_at', m.completed_at
      ) order by c.created_at desc)
      from public.challenges c
      join public.challenge_members m on m.challenge_id = c.id and m.user_id = v_me
      where m.completed_at is not null or c.status = 'completed'
    ), '[]'::jsonb));
end;
$$;
revoke execute on function public.az_list_challenges(date) from public, anon;
grant execute on function public.az_list_challenges(date) to authenticated;

-- 10. az_challenge_detail ------------------------------------
create or replace function public.az_challenge_detail(p_challenge uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_ch public.challenges;
  v_today date := (now() at time zone 'utc')::date;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_can_see_challenge(p_challenge, v_me) then raise exception 'not_allowed'; end if;
  perform public.az_finalize_challenge(p_challenge);
  select * into v_ch from public.challenges where id = p_challenge;
  return jsonb_build_object(
    'challenge', to_jsonb(v_ch),
    'ends_on', v_ch.ends_on,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', cm.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'days_done', cm.days_done, 'points', cm.points,
        'completed_at', cm.completed_at,
        'checked_today', exists (select 1 from public.challenge_checkins k
                                 where k.challenge_id = p_challenge
                                   and k.user_id = cm.user_id and k.day = v_today)
      ) order by cm.points desc, cm.days_done desc, cm.joined_at asc)
      from public.challenge_members cm
      join public.zone_members zm on zm.user_id = cm.user_id
      where cm.challenge_id = p_challenge
    ), '[]'::jsonb),
    'my_checkins', coalesce((
      select jsonb_agg(k.day order by k.day)
      from public.challenge_checkins k
      where k.challenge_id = p_challenge and k.user_id = v_me
    ), '[]'::jsonb),
    'ceremony', case when v_ch.status = 'active' then null
                     else public.az_challenge_ceremony_payload(v_ch.id) end);
end;
$$;
revoke execute on function public.az_challenge_detail(uuid) from public, anon;
grant execute on function public.az_challenge_detail(uuid) to authenticated;

-- 11. az_get_or_create_dm ------------------------------------
create or replace function public.az_get_or_create_dm(p_user uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_conv uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_user is null or p_user = v_me then raise exception 'not_allowed'; end if;
  if public.az_is_blocked(v_me, p_user)
     or not (public.az_is_friend(v_me, p_user) or public.az_shares_squad(v_me, p_user)) then
    raise exception 'not_allowed';
  end if;
  select c.id into v_conv
  from public.conversations c
  where c.kind = 'dm'
    and exists (select 1 from public.conversation_members
                where conversation_id = c.id and user_id = v_me)
    and exists (select 1 from public.conversation_members
                where conversation_id = c.id and user_id = p_user)
  limit 1;
  if v_conv is null then
    insert into public.conversations (kind) values ('dm') returning id into v_conv;
    insert into public.conversation_members (conversation_id, user_id)
    values (v_conv, v_me), (v_conv, p_user);
  end if;
  return jsonb_build_object('conversation_id', v_conv);
end;
$$;
revoke execute on function public.az_get_or_create_dm(uuid) from public, anon;
grant execute on function public.az_get_or_create_dm(uuid) to authenticated;

-- 12. az_list_conversations ----------------------------------
create or replace function public.az_list_conversations()
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'conversation_id', t.id,
      'kind', t.kind,
      'squad_id', t.squad_id,
      'title', t.title,
      'avatar_url', t.avatar_url,
      'emblem', t.emblem,
      'last_message', t.last_message,
      'unread', t.unread,
      'last_activity', t.last_activity
    ) order by t.last_activity desc)
    from (
      select c.id, c.kind, c.squad_id,
        case when c.kind = 'squad' then s.name
             else coalesce(om.display_name, om.username::text) end as title,
        case when c.kind = 'dm' then om.avatar_url end as avatar_url,
        case when c.kind = 'squad' then s.emblem end as emblem,
        lm.last_message,
        (select count(*) from public.messages m2
         where m2.conversation_id = c.id
           and m2.created_at > cm.last_read_at
           and m2.sender <> v_me
           and m2.deleted_at is null) as unread,
        greatest(c.created_at, coalesce(lm.last_created, c.created_at)) as last_activity
      from public.conversations c
      join public.conversation_members cm on cm.conversation_id = c.id and cm.user_id = v_me
      left join public.squads s on s.id = c.squad_id
      left join lateral (
        select zm.user_id as other_id, zm.display_name, zm.username, zm.avatar_url
        from public.conversation_members cm2
        join public.zone_members zm on zm.user_id = cm2.user_id
        where cm2.conversation_id = c.id and cm2.user_id <> v_me
        limit 1
      ) om on c.kind = 'dm'
      left join lateral (
        select jsonb_build_object(
            'body', case when m.deleted_at is not null then null else m.body end,
            'sender', m.sender,
            'sender_name', coalesce(zs.display_name, zs.username::text),
            'created_at', m.created_at,
            'deleted', m.deleted_at is not null) as last_message,
          m.created_at as last_created
        from public.messages m
        join public.zone_members zs on zs.user_id = m.sender
        where m.conversation_id = c.id
        order by m.created_at desc
        limit 1
      ) lm on true
      where c.kind = 'squad'
         or (om.other_id is not null and not public.az_is_blocked(v_me, om.other_id))
    ) t
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.az_list_conversations() from public, anon;
grant execute on function public.az_list_conversations() to authenticated;

-- 13. az_generate_weekly_report ------------------------------
create or replace function public.az_generate_weekly_report(p_week_start date)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_week_end date;
  v_missions int;
  v_proofs int;
  v_proof_days int;
  v_streak int;
  v_per_day jsonb;
  v_top text;
  v_report jsonb;
  v_inserted boolean;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_week_start is null or extract(isodow from p_week_start) <> 1 then
    raise exception 'bad_date';
  end if;
  v_week_end := p_week_start + 6;

  select count(*) into v_missions from public.zone_missions
  where user_id = v_me and mission_date between p_week_start and v_week_end;
  select count(*), count(distinct proof_date) into v_proofs, v_proof_days
  from public.zone_proofs
  where user_id = v_me and proof_date between p_week_start and v_week_end;
  select zone_streak into v_streak from public.zone_members where user_id = v_me;
  if v_streak is null then raise exception 'not_member'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'day', d::date,
    'missions', (select count(*) from public.zone_missions zm
                 where zm.user_id = v_me and zm.mission_date = d::date),
    'proofs', (select count(*) from public.zone_proofs zp
               where zp.user_id = v_me and zp.proof_date = d::date)
  ) order by d), '[]'::jsonb) into v_per_day
  from generate_series(p_week_start::timestamp, v_week_end::timestamp, interval '1 day') d;

  select zm.category into v_top
  from public.zone_missions zm
  where zm.user_id = v_me and zm.mission_date between p_week_start and v_week_end
  group by zm.category
  order by count(*) desc, zm.category asc
  limit 1;

  insert into public.zone_weekly_reports as r
    (user_id, week_start, missions_declared, proofs_posted, proof_days,
     consistency_pct, streak_end, payload)
  values (v_me, p_week_start, v_missions, v_proofs, v_proof_days,
          round(100.0 * v_proof_days / 7)::int, v_streak,
          jsonb_build_object('per_day', v_per_day, 'top_category', v_top))
  on conflict (user_id, week_start) do update
    set missions_declared = excluded.missions_declared,
        proofs_posted = excluded.proofs_posted,
        proof_days = excluded.proof_days,
        consistency_pct = excluded.consistency_pct,
        streak_end = excluded.streak_end,
        payload = excluded.payload
  returning to_jsonb(r.*), (xmax = 0) into v_report, v_inserted;

  return jsonb_build_object(
    'report', v_report,
    'xp_earned', case when v_inserted then 50 else 0 end);
end;
$$;
revoke execute on function public.az_generate_weekly_report(date) from public, anon;
grant execute on function public.az_generate_weekly_report(date) to authenticated;

-- 14. az_share_weekly_report ---------------------------------
create or replace function public.az_share_weekly_report(p_report uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_r public.zone_weekly_reports;
  v_meRow public.zone_members;
  v_event uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_r from public.zone_weekly_reports
  where id = p_report and user_id = v_me;
  if not found then raise exception 'not_allowed'; end if;
  if v_r.shared_event_id is not null then
    return jsonb_build_object('already', true);
  end if;
  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.feed_events (actor, event_type, ref_id, payload)
  values (v_me, 'weekly_report', v_r.id, jsonb_build_object(
    'week_start', v_r.week_start,
    'missions_declared', v_r.missions_declared,
    'proofs_posted', v_r.proofs_posted,
    'proof_days', v_r.proof_days,
    'consistency_pct', v_r.consistency_pct,
    'streak_end', v_r.streak_end,
    'username', v_meRow.username,
    'display_name', v_meRow.display_name,
    'avatar_url', v_meRow.avatar_url))
  returning id into v_event;
  update public.zone_weekly_reports set shared_event_id = v_event where id = v_r.id;
  return jsonb_build_object('shared', true, 'event_id', v_event);
end;
$$;
revoke execute on function public.az_share_weekly_report(uuid) from public, anon;
grant execute on function public.az_share_weekly_report(uuid) to authenticated;

-- ---------- notification triggers ----------

create or replace function public.az_trg_reaction_notify()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_event_type text;
  v_reactor public.zone_members;
begin
  select fe.actor, fe.event_type into v_actor, v_event_type
  from public.feed_events fe where fe.id = new.event_id;
  if v_actor is null or v_actor = new.user_id then return new; end if;
  if public.az_is_blocked(new.user_id, v_actor) then return new; end if;
  if exists (select 1 from public.zone_notifications n
             where n.user_id = v_actor and n.kind = 'reaction'
               and n.ref_id = new.event_id and n.actor = new.user_id
               and n.read_at is null) then
    return new;
  end if;
  select * into v_reactor from public.zone_members where user_id = new.user_id;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (v_actor, 'reaction', new.user_id, new.event_id, jsonb_build_object(
    'emoji', new.emoji, 'event_type', v_event_type,
    'username', v_reactor.username, 'display_name', v_reactor.display_name));
  return new;
end;
$$;
revoke execute on function public.az_trg_reaction_notify() from public, anon;
drop trigger if exists az_reactions_notify on public.reactions;
create trigger az_reactions_notify
  after insert on public.reactions
  for each row execute function public.az_trg_reaction_notify();

create or replace function public.az_trg_comment_notify()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_event_type text;
  v_commenter public.zone_members;
begin
  select fe.actor, fe.event_type into v_actor, v_event_type
  from public.feed_events fe where fe.id = new.event_id;
  if v_actor is null or v_actor = new.user_id then return new; end if;
  if public.az_is_blocked(new.user_id, v_actor) then return new; end if;
  if exists (select 1 from public.zone_notifications n
             where n.user_id = v_actor and n.kind = 'comment'
               and n.ref_id = new.event_id and n.actor = new.user_id
               and n.read_at is null) then
    return new;
  end if;
  select * into v_commenter from public.zone_members where user_id = new.user_id;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (v_actor, 'comment', new.user_id, new.event_id, jsonb_build_object(
    'snippet', left(new.body, 80),
    'username', v_commenter.username, 'display_name', v_commenter.display_name));
  return new;
end;
$$;
revoke execute on function public.az_trg_comment_notify() from public, anon;
drop trigger if exists az_comments_notify on public.comments;
create trigger az_comments_notify
  after insert on public.comments
  for each row execute function public.az_trg_comment_notify();

create or replace function public.az_trg_message_notify()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_sender public.zone_members;
begin
  select * into v_sender from public.zone_members where user_id = new.sender;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  select cm.user_id, 'message', new.sender, new.conversation_id,
    jsonb_build_object(
      'snippet', left(new.body, 80),
      'username', v_sender.username, 'display_name', v_sender.display_name,
      'conversation_id', new.conversation_id)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id
    and cm.user_id <> new.sender
    and not public.az_is_blocked(cm.user_id, new.sender)
    and not exists (select 1 from public.zone_notifications n
                    where n.user_id = cm.user_id and n.kind = 'message'
                      and n.ref_id = new.conversation_id and n.read_at is null);
  return new;
end;
$$;
revoke execute on function public.az_trg_message_notify() from public, anon;
drop trigger if exists az_messages_notify on public.messages;
create trigger az_messages_notify
  after insert on public.messages
  for each row execute function public.az_trg_message_notify();
