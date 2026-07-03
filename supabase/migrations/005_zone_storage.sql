-- ============================================================
-- 005_zone_storage — private media bucket for Zone proofs/avatars
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('zone-media', 'zone-media', false, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Upload only into your own top-level folder: zone-media/<auth.uid()>/...
drop policy if exists zone_media_insert on storage.objects;
create policy zone_media_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'zone-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Read your own folder, or folders of users you can see (friend/squad/partner/challenge)
drop policy if exists zone_media_select on storage.objects;
create policy zone_media_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'zone-media'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.az_can_see(
           (select auth.uid()),
           case when (storage.foldername(name))[1]
                     ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                then ((storage.foldername(name))[1])::uuid
                else null end)
    )
  );

-- Delete only within your own folder
drop policy if exists zone_media_delete on storage.objects;
create policy zone_media_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'zone-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
