-- 009: az_stake_list — the missing READ path for The Pit.
-- Stakes were only visible from the creator's localStorage cache, so the
-- referee's device never saw a pending stake and the verify/settle lifecycle
-- could not complete across two accounts. This RPC returns every stake the
-- caller is a party to (owner or referee), newest first, enriched with the
-- vow/challenge title (ref_label) and both parties' identities so either
-- device can render the full card. Read-only; mutations stay in 008's RPCs.

create or replace function public.az_stake_list()
returns jsonb
language sql stable security definer set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(row_json order by created_at desc), '[]'::jsonb)
  from (
    select s.created_at, jsonb_build_object(
      'id', s.id,
      'user_id', s.user_id,
      'referee_id', s.referee_id,
      'ref_kind', s.ref_kind,
      'ref_id', s.ref_id,
      'stake_kind', s.stake_kind,
      'amount', s.amount,
      'ladder_level', s.ladder_level,
      'status', s.status,
      'created_at', s.created_at,
      'ref_label', case s.ref_kind
        when 'vow' then (select v.title from public.arena_vows v where v.id = s.ref_id)
        when 'challenge' then (select c.title from public.challenges c where c.id = s.ref_id)
      end,
      'owner', jsonb_build_object(
        'user_id', zo.user_id, 'username', zo.username,
        'display_name', zo.display_name, 'avatar_url', zo.avatar_url),
      'referee', jsonb_build_object(
        'user_id', zr.user_id, 'username', zr.username,
        'display_name', zr.display_name, 'avatar_url', zr.avatar_url)
    ) as row_json
    from public.arena_stakes s
    join public.zone_members zo on zo.user_id = s.user_id
    join public.zone_members zr on zr.user_id = s.referee_id
    where auth.uid() in (s.user_id, s.referee_id)
    order by s.created_at desc
    limit 50
  ) t;
$$;
revoke execute on function public.az_stake_list() from public, anon;
grant execute on function public.az_stake_list() to authenticated;
