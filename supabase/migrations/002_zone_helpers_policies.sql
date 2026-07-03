-- ============================================================
-- 002_zone_helpers_policies — helper functions, all RLS policies, realtime
-- ============================================================

-- ---------- helper functions (sql, stable, security definer) ----------

create or replace function public.az_is_friend(u1 uuid, u2 uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester = u1 and f.addressee = u2)
        or (f.requester = u2 and f.addressee = u1))
  )
$$;
revoke execute on function public.az_is_friend(uuid, uuid) from public, anon;
grant execute on function public.az_is_friend(uuid, uuid) to authenticated;

create or replace function public.az_is_blocked(u1 uuid, u2 uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker = u1 and b.blocked = u2)
       or (b.blocker = u2 and b.blocked = u1)
  )
$$;
revoke execute on function public.az_is_blocked(uuid, uuid) from public, anon;
grant execute on function public.az_is_blocked(uuid, uuid) to authenticated;

create or replace function public.az_shares_squad(u1 uuid, u2 uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.squad_members a
    join public.squad_members b on b.squad_id = a.squad_id
    where a.user_id = u1 and b.user_id = u2
  )
$$;
revoke execute on function public.az_shares_squad(uuid, uuid) from public, anon;
grant execute on function public.az_shares_squad(uuid, uuid) to authenticated;

create or replace function public.az_is_squad_member(p_squad uuid, p_user uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.squad_members sm
    where sm.squad_id = p_squad and sm.user_id = p_user
  )
$$;
revoke execute on function public.az_is_squad_member(uuid, uuid) from public, anon;
grant execute on function public.az_is_squad_member(uuid, uuid) to authenticated;

create or replace function public.az_squad_role(p_squad uuid, p_user uuid)
returns text
language sql stable security definer set search_path = public, pg_temp
as $$
  select sm.role from public.squad_members sm
  where sm.squad_id = p_squad and sm.user_id = p_user
$$;
revoke execute on function public.az_squad_role(uuid, uuid) from public, anon;
grant execute on function public.az_squad_role(uuid, uuid) to authenticated;

create or replace function public.az_is_partner(u1 uuid, u2 uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.partner_links pl
    where pl.status = 'active'
      and ((pl.user_a = u1 and pl.user_b = u2)
        or (pl.user_a = u2 and pl.user_b = u1))
  )
$$;
revoke execute on function public.az_is_partner(uuid, uuid) from public, anon;
grant execute on function public.az_is_partner(uuid, uuid) to authenticated;

create or replace function public.az_shares_challenge(u1 uuid, u2 uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.challenge_members a
    join public.challenge_members b on b.challenge_id = a.challenge_id
    where a.user_id = u1 and b.user_id = u2
  )
$$;
revoke execute on function public.az_shares_challenge(uuid, uuid) from public, anon;
grant execute on function public.az_shares_challenge(uuid, uuid) to authenticated;

create or replace function public.az_can_see(p_viewer uuid, p_owner uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select p_viewer = p_owner
      or (not public.az_is_blocked(p_viewer, p_owner)
          and (public.az_is_friend(p_viewer, p_owner)
            or public.az_shares_squad(p_viewer, p_owner)
            or public.az_is_partner(p_viewer, p_owner)
            or public.az_shares_challenge(p_viewer, p_owner)))
$$;
revoke execute on function public.az_can_see(uuid, uuid) from public, anon;
grant execute on function public.az_can_see(uuid, uuid) to authenticated;

create or replace function public.az_has_pending_friendship(u1 uuid, u2 uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'pending'
      and ((f.requester = u1 and f.addressee = u2)
        or (f.requester = u2 and f.addressee = u1))
  )
$$;
revoke execute on function public.az_has_pending_friendship(uuid, uuid) from public, anon;
grant execute on function public.az_has_pending_friendship(uuid, uuid) to authenticated;

create or replace function public.az_is_challenge_member(p_ch uuid, p_user uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.challenge_members cm
    where cm.challenge_id = p_ch and cm.user_id = p_user
  )
$$;
revoke execute on function public.az_is_challenge_member(uuid, uuid) from public, anon;
grant execute on function public.az_is_challenge_member(uuid, uuid) to authenticated;

create or replace function public.az_can_see_challenge(p_ch uuid, p_user uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.challenges c
    where c.id = p_ch
      and (c.creator = p_user
        or public.az_is_challenge_member(p_ch, p_user)
        or (c.scope = 'squad' and public.az_is_squad_member(c.squad_id, p_user))
        or (c.scope = 'friends'
            and public.az_is_friend(c.creator, p_user)
            and not public.az_is_blocked(c.creator, p_user)))
  )
$$;
revoke execute on function public.az_can_see_challenge(uuid, uuid) from public, anon;
grant execute on function public.az_can_see_challenge(uuid, uuid) to authenticated;

create or replace function public.az_is_conversation_member(p_conv uuid, p_user uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = p_conv and cm.user_id = p_user
  )
$$;
revoke execute on function public.az_is_conversation_member(uuid, uuid) from public, anon;
grant execute on function public.az_is_conversation_member(uuid, uuid) to authenticated;

create or replace function public.az_dm_open(p_conv uuid, p_user uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select case
    when exists (select 1 from public.conversations c where c.id = p_conv and c.kind = 'squad')
      then true
    else not exists (
      select 1
      from public.conversation_members cm
      join public.blocks b
        on (b.blocker = cm.user_id and b.blocked = p_user)
        or (b.blocker = p_user and b.blocked = cm.user_id)
      where cm.conversation_id = p_conv
        and cm.user_id <> p_user
    )
  end
$$;
revoke execute on function public.az_dm_open(uuid, uuid) from public, anon;
grant execute on function public.az_dm_open(uuid, uuid) to authenticated;

-- ---------- policies ----------

-- zone_members
drop policy if exists zone_members_select on public.zone_members;
create policy zone_members_select on public.zone_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.az_can_see((select auth.uid()), user_id)
    or public.az_has_pending_friendship((select auth.uid()), user_id)
  );
drop policy if exists zone_members_update on public.zone_members;
create policy zone_members_update on public.zone_members
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- friendships
drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships
  for select to authenticated
  using ((select auth.uid()) in (requester, addressee));
drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships
  for delete to authenticated
  using ((select auth.uid()) in (requester, addressee));

-- blocks
drop policy if exists blocks_select on public.blocks;
create policy blocks_select on public.blocks
  for select to authenticated
  using (blocker = (select auth.uid()));
drop policy if exists blocks_delete on public.blocks;
create policy blocks_delete on public.blocks
  for delete to authenticated
  using (blocker = (select auth.uid()));

-- reports
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert to authenticated
  with check (reporter = (select auth.uid()));
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
  for select to authenticated
  using (reporter = (select auth.uid()));

-- squads
drop policy if exists squads_select on public.squads;
create policy squads_select on public.squads
  for select to authenticated
  using (public.az_is_squad_member(id, (select auth.uid())));
drop policy if exists squads_update on public.squads;
create policy squads_update on public.squads
  for update to authenticated
  using (public.az_squad_role(id, (select auth.uid())) in ('owner','mod'))
  with check (public.az_squad_role(id, (select auth.uid())) in ('owner','mod'));

-- squad_members
drop policy if exists squad_members_select on public.squad_members;
create policy squad_members_select on public.squad_members
  for select to authenticated
  using (public.az_is_squad_member(squad_id, (select auth.uid())));

-- partner_links
drop policy if exists partner_links_select on public.partner_links;
create policy partner_links_select on public.partner_links
  for select to authenticated
  using ((select auth.uid()) in (user_a, user_b));

-- zone_missions
drop policy if exists zone_missions_select on public.zone_missions;
create policy zone_missions_select on public.zone_missions
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.az_can_see((select auth.uid()), user_id)
  );

-- zone_proofs
drop policy if exists zone_proofs_select on public.zone_proofs;
create policy zone_proofs_select on public.zone_proofs
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.az_can_see((select auth.uid()), user_id)
  );
drop policy if exists zone_proofs_delete on public.zone_proofs;
create policy zone_proofs_delete on public.zone_proofs
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- feed_events
drop policy if exists feed_events_select on public.feed_events;
create policy feed_events_select on public.feed_events
  for select to authenticated
  using (
    actor = (select auth.uid())
    or (squad_id is not null
        and public.az_is_squad_member(squad_id, (select auth.uid()))
        and not public.az_is_blocked((select auth.uid()), actor))
    or (squad_id is null
        and public.az_can_see((select auth.uid()), actor))
  );
drop policy if exists feed_events_delete on public.feed_events;
create policy feed_events_delete on public.feed_events
  for delete to authenticated
  using (actor = (select auth.uid()));

-- reactions (exists subqueries run under the caller's feed_events RLS — intentional)
drop policy if exists reactions_select on public.reactions;
create policy reactions_select on public.reactions
  for select to authenticated
  using (
    not public.az_is_blocked((select auth.uid()), user_id)
    and exists (select 1 from public.feed_events fe where fe.id = event_id)
  );
drop policy if exists reactions_insert on public.reactions;
create policy reactions_insert on public.reactions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.feed_events fe where fe.id = event_id)
  );
drop policy if exists reactions_delete on public.reactions;
create policy reactions_delete on public.reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- comments
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
  for select to authenticated
  using (
    not public.az_is_blocked((select auth.uid()), user_id)
    and exists (select 1 from public.feed_events fe where fe.id = event_id)
  );
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.feed_events fe where fe.id = event_id)
  );
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- challenges
drop policy if exists challenges_select on public.challenges;
create policy challenges_select on public.challenges
  for select to authenticated
  using (public.az_can_see_challenge(id, (select auth.uid())));

-- challenge_members
drop policy if exists challenge_members_select on public.challenge_members;
create policy challenge_members_select on public.challenge_members
  for select to authenticated
  using (public.az_can_see_challenge(challenge_id, (select auth.uid())));

-- challenge_checkins
drop policy if exists challenge_checkins_select on public.challenge_checkins;
create policy challenge_checkins_select on public.challenge_checkins
  for select to authenticated
  using (public.az_can_see_challenge(challenge_id, (select auth.uid())));

-- conversations
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated
  using (public.az_is_conversation_member(id, (select auth.uid())));

-- conversation_members
drop policy if exists conversation_members_select on public.conversation_members;
create policy conversation_members_select on public.conversation_members
  for select to authenticated
  using (public.az_is_conversation_member(conversation_id, (select auth.uid())));
drop policy if exists conversation_members_update on public.conversation_members;
create policy conversation_members_update on public.conversation_members
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- messages
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (
    public.az_is_conversation_member(conversation_id, (select auth.uid()))
    and not public.az_is_blocked((select auth.uid()), sender)
  );
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender = (select auth.uid())
    and public.az_is_conversation_member(conversation_id, (select auth.uid()))
    and public.az_dm_open(conversation_id, (select auth.uid()))
  );
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated
  using (sender = (select auth.uid()))
  with check (sender = (select auth.uid()));

-- message_reactions
drop policy if exists message_reactions_select on public.message_reactions;
create policy message_reactions_select on public.message_reactions
  for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id));
drop policy if exists message_reactions_insert on public.message_reactions;
create policy message_reactions_insert on public.message_reactions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.messages m where m.id = message_id)
  );
drop policy if exists message_reactions_delete on public.message_reactions;
create policy message_reactions_delete on public.message_reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- zone_notifications
drop policy if exists zone_notifications_select on public.zone_notifications;
create policy zone_notifications_select on public.zone_notifications
  for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists zone_notifications_update on public.zone_notifications;
create policy zone_notifications_update on public.zone_notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- zone_weekly_reports
drop policy if exists zone_weekly_reports_select on public.zone_weekly_reports;
create policy zone_weekly_reports_select on public.zone_weekly_reports
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------- realtime ----------
do $$
declare
  t text;
begin
  foreach t in array array['zone_notifications','messages','feed_events'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
