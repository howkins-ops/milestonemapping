-- ═══════════════════════════════════════════════════════════════════════
-- 013 · REPORT INTAKE — close the loop behind the Report button.
-- App Store Guideline 1.2: reports must actually be reviewed. This adds the
-- admin read/resolve path the ToS's "reviewed within 24 hours" promise needs.
-- ═══════════════════════════════════════════════════════════════════════

-- ---------- admin flag ----------
alter table public.zone_members
  add column if not exists is_admin boolean not null default false;

create or replace function public.az_is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select is_admin from public.zone_members where user_id = auth.uid()),
    false
  );
$$;

grant execute on function public.az_is_admin() to authenticated;

-- ---------- admin visibility over reports ----------
drop policy if exists reports_admin_select on public.reports;
create policy reports_admin_select on public.reports
  for select using (public.az_is_admin());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports
  for update using (public.az_is_admin());

-- ---------- RPCs ----------
create or replace function public.az_admin_list_reports(p_status text default null)
returns table (
  id uuid,
  reporter uuid,
  reporter_name text,
  target_user uuid,
  target_name text,
  content_type text,
  content_id uuid,
  reason text,
  details text,
  status text,
  created_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select r.id, r.reporter, rm.username, r.target_user, tm.username,
         r.content_type, r.content_id, r.reason, r.details, r.status, r.created_at
  from public.reports r
  left join public.zone_members rm on rm.user_id = r.reporter
  left join public.zone_members tm on tm.user_id = r.target_user
  where public.az_is_admin()
    and (p_status is null or r.status = p_status)
  order by r.created_at desc
  limit 200;
$$;

create or replace function public.az_admin_resolve_report(p_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.az_is_admin() then
    raise exception 'not authorized';
  end if;
  if p_status not in ('open', 'reviewing', 'resolved', 'dismissed') then
    raise exception 'invalid status';
  end if;
  update public.reports set status = p_status where id = p_id;
end;
$$;

create or replace function public.az_admin_open_report_count()
returns integer
language sql stable security definer set search_path = public
as $$
  select case
    when public.az_is_admin()
      then (select count(*)::integer from public.reports where status = 'open')
    else 0
  end;
$$;

grant execute on function public.az_admin_list_reports(text) to authenticated;
grant execute on function public.az_admin_resolve_report(uuid, text) to authenticated;
grant execute on function public.az_admin_open_report_count() to authenticated;

-- ---------- seed the founding admin accounts ----------
update public.zone_members set is_admin = true
where user_id in (
  select id from auth.users
  where email in ('howkins.ops@gmail.com', 'coachhowkins@gmail.com')
);
