-- ============================================================
-- 016_fridge_photos — ALPHA MODE · The Stockpile.
-- Private storage bucket for daily meal-photo accountability
-- ("pin a picture to your fridge door"). Owner-only via the
-- folder-name = auth.uid() pattern (zone storage precedent).
-- Photos default private; sharing goes through the Zone flow.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('fridge-photos', 'fridge-photos', false)
on conflict (id) do nothing;

drop policy if exists fridge_photos_select on storage.objects;
create policy fridge_photos_select on storage.objects
  for select to authenticated
  using (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists fridge_photos_insert on storage.objects;
create policy fridge_photos_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists fridge_photos_update on storage.objects;
create policy fridge_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists fridge_photos_delete on storage.objects;
create policy fridge_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'fridge-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);
