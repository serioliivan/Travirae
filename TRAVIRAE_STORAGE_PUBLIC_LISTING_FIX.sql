-- SCRIPT 22 — Storage Public Listing Fix
-- ============================================================================
-- Scopo:
-- - rimuove l'avviso Supabase Security Advisor "Public Bucket Allows Listing"
--   per i bucket pubblici Travirae:
--     storage.influencer-avatars
--     storage.influencer-post-media
-- - mantiene visibili avatar e immagini dei post tramite URL pubblico
-- - impedisce la LISTA pubblica/anonima dei file nei bucket
-- - mantiene upload/update/delete consentiti solo all'utente autenticato nel proprio path auth.uid()/...
-- - mantiene supporto a upload con upsert:true aggiungendo SELECT solo sul proprio path
--
-- Eseguire dopo SCRIPT_21, oppure direttamente sul progetto già configurato.
-- È idempotente: puoi rieseguirlo.
-- ============================================================================

begin;

-- 1) I bucket restano pubblici perché avatar e media dei post devono essere visibili sul sito.
--    Il bucket pubblico permette di servire file a chi possiede l'URL, ma non serve una policy
--    SELECT pubblica su storage.objects per mostrare le immagini.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('influencer-avatars', 'influencer-avatars', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('influencer-post-media', 'influencer-post-media', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2) Rimuovi le policy pubbliche create dagli script precedenti.
drop policy if exists "Public read influencer avatars" on storage.objects;
drop policy if exists "Public read influencer post media" on storage.objects;

-- 3) Rimuovi eventuali altre SELECT policy pubbliche/anonime sui bucket Travirae.
--    È volutamente limitato ai due bucket influencer, così non tocca altri bucket del progetto.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd in ('SELECT', 'ALL')
      and coalesce(roles::text, '') ~ '(public|anon)'
      and (
        coalesce(qual, '') like '%influencer-avatars%'
        or coalesce(qual, '') like '%influencer-post-media%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

-- 4) SELECT/list solo per la cartella dell'utente autenticato.
--    Serve anche per upload con upsert:true quando l'utente sovrascrive un proprio file.
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

-- 5) Upload/update/delete nel proprio folder auth.uid()/...
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

commit;

-- Dopo il RUN:
-- 1) Security Advisor -> Refresh / Rerun linter.
-- 2) Gli avvisi "Public Bucket Allows Listing" per influencer-avatars e influencer-post-media dovrebbero sparire.
-- 3) Testare caricamento avatar, caricamento cover/post e visualizzazione pubblica delle immagini.
