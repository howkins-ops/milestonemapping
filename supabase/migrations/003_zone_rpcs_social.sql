-- ============================================================
-- 003_zone_rpcs_social — identity, friends, squads, partner RPCs
-- All signatures FROZEN (frontend built in parallel).
-- ============================================================

-- 1. az_username_available -----------------------------------
create or replace function public.az_username_available(p_username text)
returns boolean
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_name text := lower(trim(p_username));
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if v_name is null or v_name !~ '^[a-z0-9_]{3,20}$' then
    return false;
  end if;
  return not exists (
    select 1 from public.zone_members
    where username = v_name::extensions.citext
  );
end;
$$;
revoke execute on function public.az_username_available(text) from public, anon;
grant execute on function public.az_username_available(text) to authenticated;

-- 2. az_join_zone --------------------------------------------
create or replace function public.az_join_zone(
  p_username text, p_display_name text, p_identity_title text, p_avatar_url text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_name text := lower(trim(p_username));
  v_row public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if v_name is null or v_name !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'invalid_username';
  end if;
  begin
    insert into public.zone_members (user_id, username, display_name, identity_title, avatar_url)
    values (v_me, v_name::extensions.citext,
            nullif(trim(coalesce(p_display_name,'')),''),
            nullif(trim(coalesce(p_identity_title,'')),''),
            nullif(trim(coalesce(p_avatar_url,'')),''))
    returning * into v_row;
  exception when unique_violation then
    raise exception 'username_taken';
  end;
  return to_jsonb(v_row);
end;
$$;
revoke execute on function public.az_join_zone(text, text, text, text) from public, anon;
grant execute on function public.az_join_zone(text, text, text, text) to authenticated;

-- 3. az_find_user --------------------------------------------
create or replace function public.az_find_user(p_username text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_t public.zone_members;
  v_rel text;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_t from public.zone_members
  where username = lower(trim(coalesce(p_username,'')))::extensions.citext;
  if not found then return null; end if;
  if v_t.user_id <> v_me and public.az_is_blocked(v_me, v_t.user_id) then
    return null;
  end if;
  if v_t.user_id = v_me then
    v_rel := 'self';
  elsif public.az_is_friend(v_me, v_t.user_id) then
    v_rel := 'friends';
  elsif exists (select 1 from public.friendships f
                where f.status = 'pending' and f.requester = v_me and f.addressee = v_t.user_id) then
    v_rel := 'pending_out';
  elsif exists (select 1 from public.friendships f
                where f.status = 'pending' and f.requester = v_t.user_id and f.addressee = v_me) then
    v_rel := 'pending_in';
  else
    v_rel := 'none';
  end if;
  return jsonb_build_object(
    'user_id', v_t.user_id,
    'username', v_t.username,
    'display_name', v_t.display_name,
    'avatar_url', v_t.avatar_url,
    'identity_title', v_t.identity_title,
    'zone_streak', v_t.zone_streak,
    'relation', v_rel);
end;
$$;
revoke execute on function public.az_find_user(text) from public, anon;
grant execute on function public.az_find_user(text) to authenticated;

-- 4. az_list_friends -----------------------------------------
create or replace function public.az_list_friends()
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  return jsonb_build_object(
    'friends', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', zm.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'identity_title', zm.identity_title,
        'zone_streak', zm.zone_streak, 'last_proof_date', zm.last_proof_date,
        'friendship_id', f.id) order by zm.username)
      from public.friendships f
      join public.zone_members zm
        on zm.user_id = case when f.requester = v_me then f.addressee else f.requester end
      where f.status = 'accepted' and v_me in (f.requester, f.addressee)
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'friendship_id', f.id, 'user_id', zm.user_id, 'username', zm.username,
        'display_name', zm.display_name, 'avatar_url', zm.avatar_url,
        'created_at', f.created_at) order by f.created_at desc)
      from public.friendships f
      join public.zone_members zm on zm.user_id = f.requester
      where f.status = 'pending' and f.addressee = v_me
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object(
        'friendship_id', f.id, 'user_id', zm.user_id, 'username', zm.username,
        'display_name', zm.display_name, 'avatar_url', zm.avatar_url,
        'created_at', f.created_at) order by f.created_at desc)
      from public.friendships f
      join public.zone_members zm on zm.user_id = f.addressee
      where f.status = 'pending' and f.requester = v_me
    ), '[]'::jsonb),
    'blocked', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', zm.user_id, 'username', zm.username, 'display_name', zm.display_name)
        order by zm.username)
      from public.blocks b
      join public.zone_members zm on zm.user_id = b.blocked
      where b.blocker = v_me
    ), '[]'::jsonb));
end;
$$;
revoke execute on function public.az_list_friends() from public, anon;
grant execute on function public.az_list_friends() to authenticated;

-- 5. az_send_friend_request ----------------------------------
create or replace function public.az_send_friend_request(p_username text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_t public.zone_members;
  v_meRow public.zone_members;
  v_f public.friendships;
  v_id uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_t from public.zone_members
  where username = lower(trim(coalesce(p_username,'')))::extensions.citext;
  if not found or public.az_is_blocked(v_me, v_t.user_id) then
    raise exception 'user_not_found';
  end if;
  if v_t.user_id = v_me then raise exception 'cannot_add_self'; end if;
  if public.az_is_friend(v_me, v_t.user_id) then raise exception 'already_friends'; end if;

  select * into v_meRow from public.zone_members where user_id = v_me;

  select * into v_f from public.friendships f
  where f.status = 'pending'
    and ((f.requester = v_me and f.addressee = v_t.user_id)
      or (f.requester = v_t.user_id and f.addressee = v_me));
  if found then
    if v_f.requester = v_me then
      raise exception 'request_pending';
    else
      -- mutual request: auto-accept
      update public.friendships
      set status = 'accepted', responded_at = now()
      where id = v_f.id;
      insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
      values (v_f.requester, 'friend_accept', v_me, v_f.id,
        jsonb_build_object('username', v_meRow.username, 'display_name', v_meRow.display_name));
      return jsonb_build_object('status', 'accepted');
    end if;
  end if;

  insert into public.friendships (requester, addressee)
  values (v_me, v_t.user_id)
  returning id into v_id;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (v_t.user_id, 'friend_request', v_me, v_id,
    jsonb_build_object('username', v_meRow.username, 'display_name', v_meRow.display_name));
  return jsonb_build_object('status', 'pending');
end;
$$;
revoke execute on function public.az_send_friend_request(text) from public, anon;
grant execute on function public.az_send_friend_request(text) to authenticated;

-- 6. az_respond_friend_request -------------------------------
create or replace function public.az_respond_friend_request(p_request_id uuid, p_accept boolean)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_f public.friendships;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_f from public.friendships
  where id = p_request_id and addressee = v_me and status = 'pending';
  if not found then raise exception 'not_allowed'; end if;
  if coalesce(p_accept, false) then
    update public.friendships
    set status = 'accepted', responded_at = now()
    where id = v_f.id;
    select * into v_meRow from public.zone_members where user_id = v_me;
    insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
    values (v_f.requester, 'friend_accept', v_me, v_f.id,
      jsonb_build_object('username', v_meRow.username, 'display_name', v_meRow.display_name));
    return jsonb_build_object('status', 'accepted');
  else
    delete from public.friendships where id = v_f.id;
    return jsonb_build_object('status', 'declined');
  end if;
end;
$$;
revoke execute on function public.az_respond_friend_request(uuid, boolean) from public, anon;
grant execute on function public.az_respond_friend_request(uuid, boolean) to authenticated;

-- 7. az_remove_friend ----------------------------------------
create or replace function public.az_remove_friend(p_user uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  delete from public.friendships
  where (requester = v_me and addressee = p_user)
     or (requester = p_user and addressee = v_me);
  update public.partner_links
  set status = 'ended', ended_at = now()
  where status = 'active'
    and ((user_a = v_me and user_b = p_user) or (user_a = p_user and user_b = v_me));
  return jsonb_build_object('removed', true);
end;
$$;
revoke execute on function public.az_remove_friend(uuid) from public, anon;
grant execute on function public.az_remove_friend(uuid) to authenticated;

-- 8. az_block_user -------------------------------------------
create or replace function public.az_block_user(p_user uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_user is null or p_user = v_me then raise exception 'not_allowed'; end if;
  if not exists (select 1 from public.zone_members where user_id = p_user) then
    raise exception 'user_not_found';
  end if;
  insert into public.blocks (blocker, blocked)
  values (v_me, p_user)
  on conflict (blocker, blocked) do nothing;
  delete from public.friendships
  where (requester = v_me and addressee = p_user)
     or (requester = p_user and addressee = v_me);
  update public.partner_links
  set status = 'ended', ended_at = now()
  where status = 'active'
    and ((user_a = v_me and user_b = p_user) or (user_a = p_user and user_b = v_me));
  return jsonb_build_object('blocked', true);
end;
$$;
revoke execute on function public.az_block_user(uuid) from public, anon;
grant execute on function public.az_block_user(uuid) to authenticated;

-- 9. az_create_squad -----------------------------------------
create or replace function public.az_create_squad(p_name text, p_emblem text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_squad public.squads;
  v_conv uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_name is null or char_length(trim(p_name)) not between 2 and 40 then
    raise exception 'not_allowed';
  end if;
  insert into public.squads (name, emblem, invite_code, created_by)
  values (trim(p_name), coalesce(nullif(trim(coalesce(p_emblem,'')),''), '🔥'),
          public.az_gen_invite_code(), v_me)
  returning * into v_squad;
  insert into public.squad_members (squad_id, user_id, role)
  values (v_squad.id, v_me, 'owner');
  insert into public.conversations (kind, squad_id)
  values ('squad', v_squad.id)
  returning id into v_conv;
  insert into public.conversation_members (conversation_id, user_id)
  values (v_conv, v_me);
  return to_jsonb(v_squad);
end;
$$;
revoke execute on function public.az_create_squad(text, text) from public, anon;
grant execute on function public.az_create_squad(text, text) to authenticated;

-- 10. az_join_squad_by_code ----------------------------------
create or replace function public.az_join_squad_by_code(p_code text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_squad public.squads;
  v_conv uuid;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_squad from public.squads
  where invite_code = upper(trim(coalesce(p_code,'')));
  if not found then raise exception 'invalid_code'; end if;
  if exists (select 1 from public.squad_members
             where squad_id = v_squad.id and user_id = v_me) then
    return to_jsonb(v_squad) || jsonb_build_object('already', true);
  end if;
  insert into public.squad_members (squad_id, user_id, role)
  values (v_squad.id, v_me, 'member');
  select id into v_conv from public.conversations where squad_id = v_squad.id;
  if not found then
    insert into public.conversations (kind, squad_id)
    values ('squad', v_squad.id)
    returning id into v_conv;
  end if;
  insert into public.conversation_members (conversation_id, user_id)
  values (v_conv, v_me)
  on conflict (conversation_id, user_id) do nothing;
  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.feed_events (actor, event_type, squad_id, payload)
  values (v_me, 'squad_join', v_squad.id, jsonb_build_object(
    'squad_name', v_squad.name,
    'username', v_meRow.username,
    'display_name', v_meRow.display_name));
  return to_jsonb(v_squad);
end;
$$;
revoke execute on function public.az_join_squad_by_code(text) from public, anon;
grant execute on function public.az_join_squad_by_code(text) to authenticated;

-- 11. az_squad_detail ----------------------------------------
create or replace function public.az_squad_detail(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_squad public.squads;
  v_days int;
  v_total_checkins bigint;
  v_total_points bigint;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_squad_member(p_squad, v_me) then raise exception 'not_member'; end if;
  select * into v_squad from public.squads where id = p_squad;

  select count(*), coalesce(sum(p.xp_earned), 0)
  into v_total_checkins, v_total_points
  from public.zone_proofs p
  join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
  where p.proof_date between v_today - 29 and v_today;

  v_days := greatest(1, v_today - greatest(v_squad.created_at::date, v_today - 29) + 1);

  return jsonb_build_object(
    'squad', to_jsonb(v_squad),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', m.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'identity_title', zm.identity_title,
        'role', m.role, 'zone_streak', zm.zone_streak,
        'proved_today', exists (select 1 from public.zone_proofs p
                                where p.user_id = m.user_id and p.proof_date = v_today),
        'last_proof_date', zm.last_proof_date) order by m.joined_at)
      from public.squad_members m
      join public.zone_members zm on zm.user_id = m.user_id
      where m.squad_id = p_squad
    ), '[]'::jsonb),
    'stats', jsonb_build_object(
      'total_checkins', v_total_checkins,
      'total_points', v_total_points,
      'avg_per_day', round(v_total_checkins::numeric / v_days, 1),
      'early_bird', (
        select jsonb_build_object('user_id', zm.user_id, 'username', zm.username,
                                  'display_name', zm.display_name, 'count', count(*))
        from public.zone_proofs p
        join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
        join public.zone_members zm on zm.user_id = p.user_id
        where p.proof_date between v_today - 29 and v_today
          and p.local_time is not null and p.local_time < time '09:00'
        group by zm.user_id, zm.username, zm.display_name
        order by count(*) desc, zm.username asc
        limit 1),
      'night_owl', (
        select jsonb_build_object('user_id', zm.user_id, 'username', zm.username,
                                  'display_name', zm.display_name, 'count', count(*))
        from public.zone_proofs p
        join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
        join public.zone_members zm on zm.user_id = p.user_id
        where p.proof_date between v_today - 29 and v_today
          and p.local_time is not null and p.local_time >= time '21:00'
        group by zm.user_id, zm.username, zm.display_name
        order by count(*) desc, zm.username asc
        limit 1)
    ));
end;
$$;
revoke execute on function public.az_squad_detail(uuid) from public, anon;
grant execute on function public.az_squad_detail(uuid) to authenticated;

-- 12. az_kick_member -----------------------------------------
create or replace function public.az_kick_member(p_squad uuid, p_user uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_my_role text;
  v_target_role text;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_user = v_me then raise exception 'not_allowed'; end if;
  v_my_role := public.az_squad_role(p_squad, v_me);
  v_target_role := public.az_squad_role(p_squad, p_user);
  if v_target_role is null then raise exception 'not_member'; end if;
  if not ((v_my_role = 'owner' and v_target_role in ('mod','member'))
       or (v_my_role = 'mod' and v_target_role = 'member')) then
    raise exception 'not_allowed';
  end if;
  delete from public.squad_members where squad_id = p_squad and user_id = p_user;
  delete from public.conversation_members cm
  using public.conversations c
  where c.id = cm.conversation_id and c.squad_id = p_squad and cm.user_id = p_user;
  return jsonb_build_object('kicked', true);
end;
$$;
revoke execute on function public.az_kick_member(uuid, uuid) from public, anon;
grant execute on function public.az_kick_member(uuid, uuid) to authenticated;

-- 13. az_transfer_ownership ----------------------------------
create or replace function public.az_transfer_ownership(p_squad uuid, p_user uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if public.az_squad_role(p_squad, v_me) is distinct from 'owner' then
    raise exception 'not_allowed';
  end if;
  if p_user = v_me then raise exception 'not_allowed'; end if;
  if public.az_squad_role(p_squad, p_user) is null then
    raise exception 'not_member';
  end if;
  update public.squad_members set role = 'owner'
  where squad_id = p_squad and user_id = p_user;
  update public.squad_members set role = 'mod'
  where squad_id = p_squad and user_id = v_me;
  return jsonb_build_object('transferred', true);
end;
$$;
revoke execute on function public.az_transfer_ownership(uuid, uuid) from public, anon;
grant execute on function public.az_transfer_ownership(uuid, uuid) to authenticated;

-- 14. az_leave_squad -----------------------------------------
create or replace function public.az_leave_squad(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_role text;
  v_others int;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  v_role := public.az_squad_role(p_squad, v_me);
  if v_role is null then raise exception 'not_member'; end if;
  select count(*) into v_others from public.squad_members
  where squad_id = p_squad and user_id <> v_me;
  if v_role = 'owner' and v_others > 0 then raise exception 'transfer_first'; end if;
  if v_others = 0 then
    delete from public.squads where id = p_squad; -- cascades members/conversation/feed
  else
    delete from public.squad_members where squad_id = p_squad and user_id = v_me;
    delete from public.conversation_members cm
    using public.conversations c
    where c.id = cm.conversation_id and c.squad_id = p_squad and cm.user_id = v_me;
  end if;
  return jsonb_build_object('left', true);
end;
$$;
revoke execute on function public.az_leave_squad(uuid) from public, anon;
grant execute on function public.az_leave_squad(uuid) to authenticated;

-- 15. az_invite_partner --------------------------------------
create or replace function public.az_invite_partner(p_user uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_link public.partner_links;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_friend(v_me, p_user) then raise exception 'not_friends'; end if;
  if exists (select 1 from public.partner_links
             where status in ('pending','active')
               and (user_a in (v_me, p_user) or user_b in (v_me, p_user))) then
    raise exception 'link_exists';
  end if;
  insert into public.partner_links (user_a, user_b)
  values (v_me, p_user)
  returning * into v_link;
  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (p_user, 'partner_invite', v_me, v_link.id,
    jsonb_build_object('username', v_meRow.username, 'display_name', v_meRow.display_name));
  return to_jsonb(v_link);
end;
$$;
revoke execute on function public.az_invite_partner(uuid) from public, anon;
grant execute on function public.az_invite_partner(uuid) to authenticated;

-- 16. az_respond_partner -------------------------------------
create or replace function public.az_respond_partner(p_link uuid, p_accept boolean)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_link public.partner_links;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_link from public.partner_links
  where id = p_link and user_b = v_me and status = 'pending';
  if not found then raise exception 'not_allowed'; end if;
  if coalesce(p_accept, false) then
    update public.partner_links
    set status = 'active', accepted_at = now()
    where id = v_link.id;
    select * into v_meRow from public.zone_members where user_id = v_me;
    insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
    values (v_link.user_a, 'partner_accept', v_me, v_link.id,
      jsonb_build_object('username', v_meRow.username, 'display_name', v_meRow.display_name));
    return jsonb_build_object('status', 'active');
  else
    delete from public.partner_links where id = v_link.id;
    return jsonb_build_object('status', 'declined');
  end if;
end;
$$;
revoke execute on function public.az_respond_partner(uuid, boolean) from public, anon;
grant execute on function public.az_respond_partner(uuid, boolean) to authenticated;

-- 17. az_end_partnership -------------------------------------
create or replace function public.az_end_partnership(p_link uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_id uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  update public.partner_links
  set status = 'ended', ended_at = now()
  where id = p_link and status = 'active' and v_me in (user_a, user_b)
  returning id into v_id;
  if v_id is null then raise exception 'not_allowed'; end if;
  return jsonb_build_object('ended', true);
end;
$$;
revoke execute on function public.az_end_partnership(uuid) from public, anon;
grant execute on function public.az_end_partnership(uuid) to authenticated;

-- 18. az_partner_action --------------------------------------
create or replace function public.az_partner_action(p_kind text, p_note text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_link public.partner_links;
  v_partner uuid;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_kind is null or p_kind not in ('nudge','celebrate','request_proof') then
    raise exception 'not_allowed';
  end if;
  select * into v_link from public.partner_links
  where status = 'active' and v_me in (user_a, user_b);
  if not found then raise exception 'not_member'; end if;
  v_partner := case when v_link.user_a = v_me then v_link.user_b else v_link.user_a end;
  if exists (
    select 1 from public.zone_notifications n
    where n.user_id = v_partner and n.actor = v_me
      and n.kind = 'partner_action' and n.read_at is null
      and n.payload->>'action_kind' = p_kind
      and (n.created_at at time zone 'utc')::date = (now() at time zone 'utc')::date
  ) then
    return jsonb_build_object('sent', false, 'reason', 'already_sent');
  end if;
  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (v_partner, 'partner_action', v_me, v_link.id, jsonb_build_object(
    'action_kind', p_kind, 'note', p_note,
    'username', v_meRow.username, 'display_name', v_meRow.display_name));
  return jsonb_build_object('sent', true);
end;
$$;
revoke execute on function public.az_partner_action(text, text) from public, anon;
grant execute on function public.az_partner_action(text, text) to authenticated;

-- 19. az_get_partner_state -----------------------------------
create or replace function public.az_get_partner_state(p_local_date date)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_link public.partner_links;
  v_partner uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_local_date is null or p_local_date not between current_date - 1 and current_date + 1 then
    raise exception 'bad_date';
  end if;
  select * into v_link from public.partner_links
  where v_me in (user_a, user_b) and status in ('pending','active')
  order by case when status = 'active' then 0 else 1 end, created_at desc
  limit 1;
  if not found then
    return jsonb_build_object(
      'link', null, 'partner', null,
      'partner_proved_today', false,
      'i_proved_today', exists (select 1 from public.zone_proofs
                                where user_id = v_me and proof_date = p_local_date),
      'i_am_inviter', false);
  end if;
  v_partner := case when v_link.user_a = v_me then v_link.user_b else v_link.user_a end;
  return jsonb_build_object(
    'link', to_jsonb(v_link),
    'partner', (select jsonb_build_object(
        'user_id', zm.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'identity_title', zm.identity_title,
        'zone_streak', zm.zone_streak)
      from public.zone_members zm where zm.user_id = v_partner),
    'partner_proved_today', exists (select 1 from public.zone_proofs
                                    where user_id = v_partner and proof_date = p_local_date),
    'i_proved_today', exists (select 1 from public.zone_proofs
                              where user_id = v_me and proof_date = p_local_date),
    'i_am_inviter', v_link.user_a = v_me);
end;
$$;
revoke execute on function public.az_get_partner_state(date) from public, anon;
grant execute on function public.az_get_partner_state(date) to authenticated;
