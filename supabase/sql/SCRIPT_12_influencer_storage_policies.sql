-- SCRIPT 12 — Influencer Storage buckets + policies
-- Eseguire DOPO SCRIPT_11_influencers_vlogs.sql
--
-- Versione aggiornata: evita l'avviso Security Advisor "Public Bucket Allows Listing".
-- I bucket restano pubblici per mostrare immagini/avatar sul sito tramite URL pubblici,
-- ma non esiste più una policy SELECT pubblica che permetta di elencare tutti i file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('influencer-avatars', 'influencer-avatars', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('influencer-post-media', 'influencer-post-media', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Su bucket pubblici, i file restano leggibili se si conosce l'URL pubblico.
-- Non serve una SELECT policy pubblica per mostrare le immagini sul sito.
-- Una SELECT policy pubblica ampia, invece, può consentire la LISTA dei file del bucket.
drop policy if exists "Public read influencer avatars" on storage.objects;
drop policy if exists "Public read influencer post media" on storage.objects;

-- Lettura/lista limitata al proprietario autenticato della cartella.
-- Serve anche per operazioni di upload con upsert/overwrite sul proprio file.
drop policy if exists "Influencer avatar select own folder" on storage.objects;
create policy "Influencer avatar select own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Influencer media select own folder" on storage.objects;
create policy "Influencer media select own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

-- Upload/update/delete limitati all'utente autenticato nel proprio path = auth.uid()/...
drop policy if exists "Influencer avatar insert own folder" on storage.objects;
create policy "Influencer avatar insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Influencer avatar update own folder" on storage.objects;
create policy "Influencer avatar update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
)
with check (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Influencer avatar delete own folder" on storage.objects;
create policy "Influencer avatar delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'influencer-avatars'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Influencer media insert own folder" on storage.objects;
create policy "Influencer media insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Influencer media update own folder" on storage.objects;
create policy "Influencer media update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
)
with check (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Influencer media delete own folder" on storage.objects;
create policy "Influencer media delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'influencer-post-media'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);
