-- ============================================================
-- 008_arena_rpcs — The Squad Arena: az_* SECURITY DEFINER RPCs
-- All game outcomes are server-derived from REAL check-ins/proofs
-- (real-life-first). Clients read via RLS, mutate only through these.
-- Signatures FROZEN — arenaService.js is built to these p_ params.
-- Pattern mirrors 003/004: auth.uid() caller, REVOKE then GRANT.
-- ============================================================

-- ============================================================
-- THE VOW
-- ============================================================

-- az_vow_create -----------------------------------------------
create or replace function public.az_vow_create(
  p_title text, p_if_cue text, p_due_at timestamptz,
  p_squad uuid, p_witness uuid, p_stake text)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_meRow public.zone_members;
  v_vow public.arena_vows;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_title is null or trim(p_title) = '' or char_length(trim(p_title)) > 160 then
    raise exception 'not_allowed';
  end if;
  if p_due_at is null or p_due_at <= now() then raise exception 'bad_date'; end if;
  if p_squad is not null and not public.az_is_squad_member(p_squad, v_me) then
    raise exception 'not_member';
  end if;
  if p_witness is not null then
    if p_witness = v_me then raise exception 'not_allowed'; end if;
    if not public.az_can_see(v_me, p_witness) then raise exception 'not_allowed'; end if;
  end if;
  select * into v_meRow from public.zone_members where user_id = v_me;
  if not found then raise exception 'not_member'; end if;

  insert into public.arena_vows
    (user_id, squad_id, witness_id, title, if_cue, due_at, stake)
  values (v_me, p_squad, p_witness, trim(p_title),
          nullif(trim(coalesce(p_if_cue,'')),''), p_due_at,
          nullif(trim(coalesce(p_stake,'')),''))
  returning * into v_vow;

  if p_witness is not null then
    insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
    values (p_witness, 'vow_created', v_me, v_vow.id, jsonb_build_object(
      'title', v_vow.title, 'due_at', v_vow.due_at,
      'username', v_meRow.username, 'display_name', v_meRow.display_name));
  end if;
  return to_jsonb(v_vow);
end;
$$;
revoke execute on function public.az_vow_create(text, text, timestamptz, uuid, uuid, text) from public, anon;
grant execute on function public.az_vow_create(text, text, timestamptz, uuid, uuid, text) to authenticated;

-- az_vow_list (lazy detonation on read) -----------------------
create or replace function public.az_vow_list(p_squad uuid default null)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  r record;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  -- lazily detonate my/witnessed live vows whose fuse burned out
  for r in
    select v.id, v.user_id, v.witness_id, v.title
    from public.arena_vows v
    where v.status = 'live' and v.due_at < now()
      and (v.user_id = v_me or v.witness_id = v_me)
      and (p_squad is null or v.squad_id = p_squad)
  loop
    update public.arena_vows set status = 'detonated'
    where id = r.id and status = 'live';
    if found and r.witness_id is not null and r.witness_id <> r.user_id then
      insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
      values (r.witness_id, 'vow_detonated', r.user_id, r.id, jsonb_build_object(
        'title', r.title,
        'username', (select username from public.zone_members where user_id = r.user_id),
        'display_name', (select display_name from public.zone_members where user_id = r.user_id)));
    end if;
  end loop;

  return jsonb_build_object(
    'live',      public.az_vow_bucket(v_me, p_squad, 'live'),
    'defused',   public.az_vow_bucket(v_me, p_squad, 'defused'),
    'detonated', public.az_vow_bucket(v_me, p_squad, 'detonated'));
end;
$$;
revoke execute on function public.az_vow_list(uuid) from public, anon;
grant execute on function public.az_vow_list(uuid) to authenticated;

-- Internal: one status bucket of vows the caller owns or witnesses.
create or replace function public.az_vow_bucket(p_me uuid, p_squad uuid, p_status text)
returns jsonb
language sql stable security definer set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(row_json order by due_at), '[]'::jsonb)
  from (
    select v.due_at, jsonb_build_object(
      'id', v.id, 'user_id', v.user_id, 'squad_id', v.squad_id,
      'witness_id', v.witness_id, 'title', v.title, 'if_cue', v.if_cue,
      'due_at', v.due_at, 'stake', v.stake, 'status', v.status,
      'proof_id', v.proof_id, 'created_at', v.created_at,
      'is_mine', v.user_id = p_me,
      'owner', jsonb_build_object(
        'user_id', o.user_id, 'username', o.username,
        'display_name', o.display_name, 'avatar_url', o.avatar_url),
      'witness', case when w.user_id is not null then jsonb_build_object(
        'user_id', w.user_id, 'username', w.username,
        'display_name', w.display_name, 'avatar_url', w.avatar_url) else null end
    ) as row_json
    from public.arena_vows v
    join public.zone_members o on o.user_id = v.user_id
    left join public.zone_members w on w.user_id = v.witness_id
    where v.status = p_status
      and (v.user_id = p_me or v.witness_id = p_me)
      and (p_squad is null or v.squad_id = p_squad)
  ) t;
$$;
revoke execute on function public.az_vow_bucket(uuid, uuid, text) from public, anon, authenticated;

-- az_vow_defuse -----------------------------------------------
create or replace function public.az_vow_defuse(p_vow uuid, p_proof uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_vow public.arena_vows;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_vow from public.arena_vows where id = p_vow;
  if not found or v_vow.user_id <> v_me then raise exception 'not_allowed'; end if;
  if v_vow.status <> 'live' then raise exception 'not_allowed'; end if;
  if p_proof is not null and not exists (
    select 1 from public.zone_proofs where id = p_proof and user_id = v_me) then
    raise exception 'not_allowed';
  end if;

  update public.arena_vows
  set status = 'defused', proof_id = p_proof
  where id = p_vow
  returning * into v_vow;

  if v_vow.witness_id is not null and v_vow.witness_id <> v_me then
    select * into v_meRow from public.zone_members where user_id = v_me;
    insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
    values (v_vow.witness_id, 'vow_defused', v_me, v_vow.id, jsonb_build_object(
      'title', v_vow.title,
      'username', v_meRow.username, 'display_name', v_meRow.display_name));
  end if;
  return to_jsonb(v_vow);
end;
$$;
revoke execute on function public.az_vow_defuse(uuid, uuid) from public, anon;
grant execute on function public.az_vow_defuse(uuid, uuid) to authenticated;

-- ============================================================
-- BOSS FORGE  (HP derived from the week's squad check-ins)
-- ============================================================
create or replace function public.az_arena_boss_state(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_week date := date_trunc('week', v_today::timestamp)::date;  -- Monday
  v_boss public.arena_bosses;
  v_members int;
  v_checkins int;
  v_damage int;
  v_hp int;
  v_defeated boolean := false;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_squad_member(p_squad, v_me) then raise exception 'not_member'; end if;

  select count(*) into v_members from public.squad_members where squad_id = p_squad;

  select * into v_boss from public.arena_bosses
  where squad_id = p_squad and week_start = v_week;
  if not found then
    insert into public.arena_bosses (squad_id, week_start, boss_key, max_hp)
    values (p_squad, v_week,
      -- keys must match BossForge.jsx BOSS_ART so the weekly boss art rotates
      (array['procrastigon','doubt_wraith','excuse_hydra','comfort_blob','inner_tyrant']
        )[1 + (extract(week from v_week)::int % 5)],
      greatest(70, v_members * 70))
    on conflict (squad_id, week_start) do update set week_start = excluded.week_start
    returning * into v_boss;
  end if;

  -- damage = distinct member check-in days this week × 10
  select count(*) into v_checkins from (
    select distinct p.user_id, p.proof_date
    from public.zone_proofs p
    join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
    where p.proof_date between v_week and v_week + 6
  ) x;
  v_damage := v_checkins * 10;
  v_hp := greatest(0, v_boss.max_hp - v_damage);

  if v_hp <= 0 and v_boss.defeated_at is null then
    update public.arena_bosses set defeated_at = now()
    where id = v_boss.id and defeated_at is null
    returning * into v_boss;
    if found then
      insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
      select sm.user_id, 'boss_slain', v_me, p_squad, jsonb_build_object(
        'boss_key', v_boss.boss_key, 'squad_id', p_squad)
      from public.squad_members sm where sm.squad_id = p_squad;
    end if;
  end if;
  v_defeated := v_boss.defeated_at is not null;

  return jsonb_build_object(
    'boss_key', v_boss.boss_key,
    'week_start', v_boss.week_start,
    'max_hp', v_boss.max_hp,
    'hp', case when v_defeated then 0 else v_hp end,
    'damage_done', v_damage,
    'defeated_at', v_boss.defeated_at,
    'contributors', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', c.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'hits', c.days, 'damage', c.days * 10)
        order by c.days desc, zm.username asc)
      from (
        select p.user_id, count(distinct p.proof_date) as days
        from public.zone_proofs p
        join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
        where p.proof_date between v_week and v_week + 6
        group by p.user_id
      ) c
      join public.zone_members zm on zm.user_id = c.user_id
    ), '[]'::jsonb));
end;
$$;
revoke execute on function public.az_arena_boss_state(uuid) from public, anon;
grant execute on function public.az_arena_boss_state(uuid) to authenticated;

-- ============================================================
-- CHAIN OF FIRE  (advances only when ALL active members check in)
-- ============================================================
create or replace function public.az_arena_chain_state(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_chain public.arena_chains;
  v_members int;
  v_all_in boolean;
  v_new_len int;
  v_fallen int;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_squad_member(p_squad, v_me) then raise exception 'not_member'; end if;

  select * into v_chain from public.arena_chains where squad_id = p_squad;
  if not found then
    insert into public.arena_chains (squad_id) values (p_squad)
    on conflict (squad_id) do nothing;
    select * into v_chain from public.arena_chains where squad_id = p_squad;
  end if;

  select count(*) into v_members from public.squad_members where squad_id = p_squad;
  v_all_in := v_members > 0 and not exists (
    select 1 from public.squad_members sm
    where sm.squad_id = p_squad
      and not exists (
        select 1 from public.zone_proofs p
        where p.user_id = sm.user_id and p.proof_date = v_today)
  );

  -- lazy resolution (only when we haven't already settled today)
  if v_chain.last_advanced_on is distinct from v_today then
    if v_all_in then
      v_new_len := case
        when v_chain.last_advanced_on = v_today - 1 then v_chain.current_len + 1
        else 1 end;
      update public.arena_chains
      set current_len = v_new_len,
          best_len = greatest(best_len, v_new_len),
          last_advanced_on = v_today
      where squad_id = p_squad
      returning * into v_chain;
      -- shame-free carrot: tell the squad the chain grew (once/day via the gate above)
      insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
      select sm.user_id, 'chain_extended', v_me, p_squad, jsonb_build_object(
        'current_len', v_new_len, 'squad_id', p_squad)
      from public.squad_members sm
      where sm.squad_id = p_squad and sm.user_id <> v_me;
    elsif v_chain.current_len > 0
      and (v_chain.last_advanced_on is null or v_chain.last_advanced_on < v_today - 1) then
      -- a full day passed unbroken by a freeze → chain resets. NEUTRAL, never a
      -- shame wall: the witness copy frames this as ash you rebuild from today.
      -- Fires exactly once (next reads see current_len = 0 and skip this branch).
      v_fallen := v_chain.current_len;
      update public.arena_chains set current_len = 0
      where squad_id = p_squad
      returning * into v_chain;
      insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
      select sm.user_id, 'chain_broken', v_me, p_squad, jsonb_build_object(
        'fallen_len', v_fallen, 'squad_id', p_squad)
      from public.squad_members sm
      where sm.squad_id = p_squad and sm.user_id <> v_me;
    end if;
  end if;

  return jsonb_build_object(
    'current_len', v_chain.current_len,
    'best_len', v_chain.best_len,
    'freezes_remaining', v_chain.freezes_remaining,
    'last_advanced_on', v_chain.last_advanced_on,
    'all_checked_in_today', v_all_in,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', sm.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url,
        'checked_in', exists (select 1 from public.zone_proofs p
                              where p.user_id = sm.user_id and p.proof_date = v_today))
        order by zm.username asc)
      from public.squad_members sm
      join public.zone_members zm on zm.user_id = sm.user_id
      where sm.squad_id = p_squad
    ), '[]'::jsonb));
end;
$$;
revoke execute on function public.az_arena_chain_state(uuid) from public, anon;
grant execute on function public.az_arena_chain_state(uuid) to authenticated;

-- az_arena_chain_freeze (spend a shared Ember Freeze) ---------
create or replace function public.az_arena_chain_freeze(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_chain public.arena_chains;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_squad_member(p_squad, v_me) then raise exception 'not_member'; end if;

  select * into v_chain from public.arena_chains where squad_id = p_squad;
  if not found then
    insert into public.arena_chains (squad_id) values (p_squad)
    on conflict (squad_id) do nothing;
    select * into v_chain from public.arena_chains where squad_id = p_squad;
  end if;
  if v_chain.freezes_remaining <= 0 then raise exception 'no_freezes'; end if;

  -- bridge the day so a miss can't break the chain; current_len is preserved
  update public.arena_chains
  set freezes_remaining = freezes_remaining - 1,
      last_advanced_on = v_today
  where squad_id = p_squad
  returning * into v_chain;

  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  select sm.user_id, 'chain_frozen', v_me, p_squad, jsonb_build_object(
    'freezes_remaining', v_chain.freezes_remaining, 'squad_id', p_squad,
    'username', v_meRow.username, 'display_name', v_meRow.display_name)
  from public.squad_members sm
  where sm.squad_id = p_squad and sm.user_id <> v_me;

  return jsonb_build_object(
    'current_len', v_chain.current_len,
    'best_len', v_chain.best_len,
    'freezes_remaining', v_chain.freezes_remaining,
    'last_advanced_on', v_chain.last_advanced_on);
end;
$$;
revoke execute on function public.az_arena_chain_freeze(uuid) from public, anon;
grant execute on function public.az_arena_chain_freeze(uuid) to authenticated;

-- ============================================================
-- THE DUEL  (7-day 1v1; scores derived from proofs in range)
-- ============================================================
create or replace function public.az_arena_duel_start(p_partner uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_duel public.arena_duels;
  v_meRow public.zone_members;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_partner is null or p_partner = v_me then raise exception 'not_allowed'; end if;
  if not public.az_can_see(v_me, p_partner) then raise exception 'not_allowed'; end if;
  if exists (
    select 1 from public.arena_duels
    where status = 'live'
      and ((a_user = v_me and b_user = p_partner)
        or (a_user = p_partner and b_user = v_me))
  ) then raise exception 'duel_exists'; end if;

  insert into public.arena_duels (a_user, b_user, starts_on, ends_on)
  values (v_me, p_partner, v_today, v_today + 6)
  returning * into v_duel;

  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (p_partner, 'duel_started', v_me, v_duel.id, jsonb_build_object(
    'ends_on', v_duel.ends_on,
    'username', v_meRow.username, 'display_name', v_meRow.display_name));
  return to_jsonb(v_duel);
end;
$$;
revoke execute on function public.az_arena_duel_start(uuid) from public, anon;
grant execute on function public.az_arena_duel_start(uuid) to authenticated;

-- az_arena_duel_state -----------------------------------------
create or replace function public.az_arena_duel_state()
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  r record;
  v_a int;
  v_b int;
  v_winner uuid;
  v_loser uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  -- lazily end + resolve duels whose window closed
  for r in
    select * from public.arena_duels
    where status = 'live' and ends_on < v_today and v_me in (a_user, b_user)
  loop
    update public.arena_duels set status = 'ended'
    where id = r.id and status = 'live';
    if found then
      select count(*) into v_a from public.zone_proofs
      where user_id = r.a_user and proof_date between r.starts_on and r.ends_on;
      select count(*) into v_b from public.zone_proofs
      where user_id = r.b_user and proof_date between r.starts_on and r.ends_on;
      if v_a <> v_b then
        v_winner := case when v_a > v_b then r.a_user else r.b_user end;
        v_loser  := case when v_a > v_b then r.b_user else r.a_user end;
        insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
        values (v_winner, 'duel_won', v_loser, r.id, jsonb_build_object(
          'my_score', greatest(v_a, v_b), 'their_score', least(v_a, v_b),
          'username', (select username from public.zone_members where user_id = v_loser),
          'display_name', (select display_name from public.zone_members where user_id = v_loser)));
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'active',  public.az_duel_bucket(v_me, 'live'),
    'past',    public.az_duel_bucket(v_me, 'ended'));
end;
$$;
revoke execute on function public.az_arena_duel_state() from public, anon;
grant execute on function public.az_arena_duel_state() to authenticated;

-- Internal: derived-score duel rows for one status.
create or replace function public.az_duel_bucket(p_me uuid, p_status text)
returns jsonb
language sql stable security definer set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(row_json order by ends_on desc), '[]'::jsonb)
  from (
    select d.ends_on, jsonb_build_object(
      'id', d.id, 'starts_on', d.starts_on, 'ends_on', d.ends_on, 'status', d.status,
      'me_is_a', d.a_user = p_me,
      'my_score', case when d.a_user = p_me then sa.score else sb.score end,
      'their_score', case when d.a_user = p_me then sb.score else sa.score end,
      'a', jsonb_build_object('user_id', za.user_id, 'username', za.username,
        'display_name', za.display_name, 'avatar_url', za.avatar_url, 'score', sa.score),
      'b', jsonb_build_object('user_id', zb.user_id, 'username', zb.username,
        'display_name', zb.display_name, 'avatar_url', zb.avatar_url, 'score', sb.score)
    ) as row_json
    from public.arena_duels d
    join public.zone_members za on za.user_id = d.a_user
    join public.zone_members zb on zb.user_id = d.b_user
    join lateral (select count(*)::int as score from public.zone_proofs p
      where p.user_id = d.a_user
        and p.proof_date between d.starts_on
          and least(d.ends_on, (now() at time zone 'utc')::date)) sa on true
    join lateral (select count(*)::int as score from public.zone_proofs p
      where p.user_id = d.b_user
        and p.proof_date between d.starts_on
          and least(d.ends_on, (now() at time zone 'utc')::date)) sb on true
    where d.status = p_status and p_me in (d.a_user, d.b_user)
  ) t;
$$;
revoke execute on function public.az_duel_bucket(uuid, text) from public, anon, authenticated;

-- ============================================================
-- ASCENSION  (squad league; points derived from check-ins)
-- ============================================================
create or replace function public.az_arena_league_state(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_week date := date_trunc('week', v_today::timestamp)::date;
  v_points int;
  v_div text;
  v_rank int;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_squad_member(p_squad, v_me) then raise exception 'not_member'; end if;

  -- derive this week's points from real member check-in days (×10)
  select count(*) * 10 into v_points from (
    select distinct p.user_id, p.proof_date
    from public.zone_proofs p
    join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
    where p.proof_date between v_week and v_week + 6
  ) x;
  insert into public.arena_squad_week (squad_id, week_start, points)
  values (p_squad, v_week, v_points)
  on conflict (squad_id, week_start) do update set points = excluded.points;

  -- ensure a division (default 'warm')
  select division into v_div from public.arena_league where squad_id = p_squad;
  if not found then
    insert into public.arena_league (squad_id) values (p_squad)
    on conflict (squad_id) do nothing;
    select division into v_div from public.arena_league where squad_id = p_squad;
  end if;

  select rnk into v_rank from (
    select s.id, rank() over (order by coalesce(w.points, 0) desc, s.name asc) as rnk
    from public.squads s
    join public.arena_league l on l.squad_id = s.id and l.division = v_div
    left join public.arena_squad_week w on w.squad_id = s.id and w.week_start = v_week
  ) z where z.id = p_squad;

  return jsonb_build_object(
    'division', v_div,
    'points', v_points,
    'rank', v_rank,
    'week_start', v_week,
    'peers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'squad_id', z.id, 'name', z.name, 'emblem', z.emblem,
        'points', z.points, 'rank', z.rnk, 'is_mine', z.id = p_squad)
        order by z.rnk)
      from (
        select s.id, s.name, s.emblem, coalesce(w.points, 0) as points,
          rank() over (order by coalesce(w.points, 0) desc, s.name asc) as rnk
        from public.squads s
        join public.arena_league l on l.squad_id = s.id and l.division = v_div
        left join public.arena_squad_week w on w.squad_id = s.id and w.week_start = v_week
      ) z
    ), '[]'::jsonb));
end;
$$;
revoke execute on function public.az_arena_league_state(uuid) from public, anon;
grant execute on function public.az_arena_league_state(uuid) to authenticated;

-- ============================================================
-- FULL COURT  (season log persisted; season/H2H read from DB)
-- ============================================================

-- Internal: season aggregate for one user (reused by log + season).
create or replace function public.az_fullcourt_season_payload(p_user uuid)
returns jsonb
language sql stable security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'games', coalesce(count(*), 0),
    'best_points', coalesce(max(points), 0),
    'totals', jsonb_build_object(
      'points', coalesce(sum(points), 0),
      'doors', coalesce(sum(doors), 0),
      'contacts', coalesce(sum(contacts), 0),
      'pitches', coalesce(sum(pitches), 0),
      'sales', coalesce(sum(sales), 0),
      'q_won', coalesce(sum(q_won), 0)),
    'averages', jsonb_build_object(
      'points', coalesce(round(avg(points), 1), 0),
      'doors', coalesce(round(avg(doors), 1), 0),
      'contacts', coalesce(round(avg(contacts), 1), 0),
      'pitches', coalesce(round(avg(pitches), 1), 0),
      'sales', coalesce(round(avg(sales), 1), 0),
      'avg_dollar', coalesce(round(avg(avg_dollar), 2), 0)),
    'last', coalesce((
      select jsonb_agg(to_jsonb(g) order by g.played_on desc, g.created_at desc)
      from (
        select * from public.arena_fullcourt_games
        where user_id = p_user
        order by played_on desc, created_at desc
        limit 10
      ) g), '[]'::jsonb))
  from public.arena_fullcourt_games where user_id = p_user;
$$;
revoke execute on function public.az_fullcourt_season_payload(uuid) from public, anon, authenticated;

-- az_fullcourt_log_game ---------------------------------------
create or replace function public.az_fullcourt_log_game(p_payload jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_payload is null then raise exception 'not_allowed'; end if;

  insert into public.arena_fullcourt_games
    (user_id, played_on, mode, points, doors, contacts, pitches, sales, q_won, ot, avg_dollar)
  values (
    v_me,
    coalesce((p_payload->>'played_on')::date, (now() at time zone 'utc')::date),
    case when p_payload->>'mode' in ('rookie','pro') then p_payload->>'mode' else 'rookie' end,
    coalesce((p_payload->>'points')::int, 0),
    coalesce((p_payload->>'doors')::int, 0),
    coalesce((p_payload->>'contacts')::int, 0),
    coalesce((p_payload->>'pitches')::int, 0),
    coalesce((p_payload->>'sales')::int, 0),
    coalesce((p_payload->>'q_won')::int, 0),
    coalesce((p_payload->>'ot')::boolean, false),
    coalesce((p_payload->>'avg_dollar')::numeric, 0));

  return jsonb_build_object('season', public.az_fullcourt_season_payload(v_me));
end;
$$;
revoke execute on function public.az_fullcourt_log_game(jsonb) from public, anon;
grant execute on function public.az_fullcourt_log_game(jsonb) to authenticated;

-- az_fullcourt_season -----------------------------------------
create or replace function public.az_fullcourt_season(p_user uuid)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_target uuid := coalesce(p_user, auth.uid());
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if v_target <> v_me and not public.az_can_see(v_me, v_target) then
    raise exception 'not_allowed';
  end if;
  return public.az_fullcourt_season_payload(v_target);
end;
$$;
revoke execute on function public.az_fullcourt_season(uuid) from public, anon;
grant execute on function public.az_fullcourt_season(uuid) to authenticated;

-- az_fullcourt_h2h --------------------------------------------
create or replace function public.az_fullcourt_h2h(p_partner uuid)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_partner is null or p_partner = v_me then raise exception 'not_allowed'; end if;
  if not public.az_can_see(v_me, p_partner) then raise exception 'not_allowed'; end if;
  return jsonb_build_object(
    'me',   public.az_fullcourt_season_payload(v_me),
    'them', public.az_fullcourt_season_payload(p_partner));
end;
$$;
revoke execute on function public.az_fullcourt_h2h(uuid) from public, anon;
grant execute on function public.az_fullcourt_h2h(uuid) to authenticated;

-- ============================================================
-- DAWN RAID  (first frog before 09:00 wins the day)
-- ============================================================
create or replace function public.az_arena_dawn_state(p_squad uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_winner uuid;
  v_winner_time time;
  v_my_time time;
  v_streak int := 0;
  v_d date;
  v_day_winner uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not public.az_is_squad_member(p_squad, v_me) then raise exception 'not_member'; end if;

  -- today's first frog (earliest proof before 09:00 among squad members)
  select p.user_id, p.local_time into v_winner, v_winner_time
  from public.zone_proofs p
  join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
  where p.proof_date = v_today and p.local_time is not null and p.local_time < time '09:00'
  order by p.local_time asc, p.created_at asc
  limit 1;

  select min(p.local_time) into v_my_time
  from public.zone_proofs p
  where p.user_id = v_me and p.proof_date = v_today
    and p.local_time is not null and p.local_time < time '09:00';

  -- first-strike announcement (once per squad per day)
  if v_winner is not null and not exists (
    select 1 from public.zone_notifications n
    where n.kind = 'dawn_first' and n.ref_id = p_squad
      and (n.created_at at time zone 'utc')::date = v_today
  ) then
    insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
    select sm.user_id, 'dawn_first', v_winner, p_squad, jsonb_build_object(
      'squad_id', p_squad,
      'username', (select username from public.zone_members where user_id = v_winner),
      'display_name', (select display_name from public.zone_members where user_id = v_winner))
    from public.squad_members sm
    where sm.squad_id = p_squad and sm.user_id <> v_winner;
  end if;

  -- my current first-frog streak (bounded lookback)
  v_d := case when v_winner = v_me then v_today else v_today - 1 end;
  loop
    select p.user_id into v_day_winner
    from public.zone_proofs p
    join public.squad_members sm on sm.user_id = p.user_id and sm.squad_id = p_squad
    where p.proof_date = v_d and p.local_time is not null and p.local_time < time '09:00'
    order by p.local_time asc, p.created_at asc
    limit 1;
    exit when v_day_winner is null or v_day_winner <> v_me;
    v_streak := v_streak + 1;
    v_d := v_d - 1;
    exit when v_today - v_d > 60;
  end loop;

  return jsonb_build_object(
    'winner_username', (select username from public.zone_members where user_id = v_winner),
    'winner_user_id', v_winner,
    'my_frog_time', v_my_time,
    'my_won_today', v_winner is not null and v_winner = v_me,
    'streak', v_streak,
    'board', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', sm.user_id, 'username', zm.username, 'display_name', zm.display_name,
        'avatar_url', zm.avatar_url, 'frog_time', ft.t,
        'is_winner', sm.user_id = v_winner)
        order by ft.t asc nulls last, zm.username asc)
      from public.squad_members sm
      join public.zone_members zm on zm.user_id = sm.user_id
      left join lateral (
        select min(p.local_time) as t from public.zone_proofs p
        where p.user_id = sm.user_id and p.proof_date = v_today
          and p.local_time is not null and p.local_time < time '09:00'
      ) ft on true
      where sm.squad_id = p_squad
    ), '[]'::jsonb));
end;
$$;
revoke execute on function public.az_arena_dawn_state(uuid) from public, anon;
grant execute on function public.az_arena_dawn_state(uuid) to authenticated;

-- ============================================================
-- THE PIT  (opt-in stakes — fire/Cups/ego only, NO real money)
-- ============================================================
create or replace function public.az_stake_create(
  p_referee uuid, p_ref_kind text, p_ref_id uuid,
  p_stake_kind text, p_amount int, p_ladder_level int)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_meRow public.zone_members;
  v_stake public.arena_stakes;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_referee is null or p_referee = v_me then raise exception 'not_allowed'; end if;
  if not public.az_can_see(v_me, p_referee) then raise exception 'not_allowed'; end if;
  if p_ref_kind is null or p_ref_kind not in ('vow','challenge') then raise exception 'not_allowed'; end if;
  if p_stake_kind is null or p_stake_kind not in ('fire','cups','ego') then raise exception 'not_allowed'; end if;

  insert into public.arena_stakes
    (user_id, referee_id, ref_kind, ref_id, stake_kind, amount, ladder_level)
  values (v_me, p_referee, p_ref_kind, p_ref_id, p_stake_kind,
          greatest(coalesce(p_amount, 0), 0), coalesce(p_ladder_level, 0))
  returning * into v_stake;

  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (p_referee, 'stake_set', v_me, v_stake.id, jsonb_build_object(
    'stake_kind', v_stake.stake_kind, 'amount', v_stake.amount, 'ref_kind', v_stake.ref_kind,
    'username', v_meRow.username, 'display_name', v_meRow.display_name));
  return to_jsonb(v_stake);
end;
$$;
revoke execute on function public.az_stake_create(uuid, text, uuid, text, int, int) from public, anon;
grant execute on function public.az_stake_create(uuid, text, uuid, text, int, int) to authenticated;

-- az_stake_verify (referee only; kept or forfeit) -------------
create or replace function public.az_stake_verify(p_stake uuid, p_kept boolean)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_stake public.arena_stakes;
  v_meRow public.zone_members;
  v_new_status text;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_stake from public.arena_stakes where id = p_stake;
  if not found or v_stake.referee_id <> v_me then raise exception 'not_allowed'; end if;
  if v_stake.status <> 'pending' then raise exception 'not_allowed'; end if;

  v_new_status := case when coalesce(p_kept, false) then 'kept' else 'forfeit' end;
  update public.arena_stakes set status = v_new_status
  where id = p_stake
  returning * into v_stake;

  select * into v_meRow from public.zone_members where user_id = v_me;
  insert into public.zone_notifications (user_id, kind, actor, ref_id, payload)
  values (v_stake.user_id,
    case when v_new_status = 'kept' then 'stake_kept' else 'stake_forfeit' end,
    v_me, v_stake.id, jsonb_build_object(
      'stake_kind', v_stake.stake_kind, 'amount', v_stake.amount,
      'username', v_meRow.username, 'display_name', v_meRow.display_name));
  return to_jsonb(v_stake);
end;
$$;
revoke execute on function public.az_stake_verify(uuid, boolean) from public, anon;
grant execute on function public.az_stake_verify(uuid, boolean) to authenticated;

-- az_stake_settle (thin finalizer; fire/Cups/ego are cosmetic) -
create or replace function public.az_stake_settle(p_stake uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_stake public.arena_stakes;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select * into v_stake from public.arena_stakes where id = p_stake;
  if not found or v_me not in (v_stake.user_id, v_stake.referee_id) then
    raise exception 'not_allowed';
  end if;
  -- No real-money ledger: stakes are honor-based (fire/Cups/ego). Settle simply
  -- surfaces the resolved stake; the verify step already recorded kept/forfeit.
  return to_jsonb(v_stake);
end;
$$;
revoke execute on function public.az_stake_settle(uuid) from public, anon;
grant execute on function public.az_stake_settle(uuid) to authenticated;
