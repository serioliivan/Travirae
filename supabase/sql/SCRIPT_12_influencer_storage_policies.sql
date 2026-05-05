-- SCRIPT 12 — Influencer Storage buckets + policies
-- Eseguire DOPO SCRIPT_11_influencers_vlogs.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('influencer-avatars', 'influencer-avatars', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('influencer-post-media', 'influencer-post-media', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Lettura pubblica: i contenuti devono essere visibili sul sito pubblico.
drop policy if exists "Public read influencer avatars" on storage.objects;
create policy "Public read influencer avatars"
on storage.objects
for select
to public
using (bucket_id = 'influencer-avatars');

drop policy if exists "Public read influencer post media" on storage.objects;
create policy "Public read influencer post media"
on storage.objects
for select
to public
using (bucket_id = 'influencer-post-media');

-- Upload/update/delete limitati all'utente autenticato nel proprio path = auth.uid()/...
drop policy if exists "Influencer avatar insert own folder" on storage.objects;
create policy "Influencer avatar insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Influencer avatar update own folder" on storage.objects;
create policy "Influencer avatar update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Influencer avatar delete own folder" on storage.objects;
create policy "Influencer avatar delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Influencer media insert own folder" on storage.objects;
create policy "Influencer media insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Influencer media update own folder" on storage.objects;
create policy "Influencer media update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Influencer media delete own folder" on storage.objects;
create policy "Influencer media delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
