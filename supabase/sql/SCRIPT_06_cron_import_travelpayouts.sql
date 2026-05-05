-- SCRIPT 06 — (OPZIONALE) CRON AUTOMATICO PER IMPORT AVIASALES (copia/incolla e RUN)
-- Questo script programma un job ogni 6 ore che chiama l'Edge Function "import-travelpayouts".
--
-- ✅ Nota IMPORTANTISSIMA:
-- Di default Supabase verifica il JWT quando chiami una Edge Function.
-- Quindi il CRON deve inviare anche l'header:
--   Authorization: Bearer <SUPABASE_ANON_KEY>
--
-- Requisiti:
-- 1) Devi aver DEPLOYATO la Edge Function import-travelpayouts
-- 2) Devi aver creato un segreto "TRAVIRAE_CRON_SECRET" nelle Edge Functions Secrets
-- 3) Devi salvare (in Vault) lo stesso TRAVIRAE_CRON_SECRET e anche la tua SUPABASE_ANON_KEY

-- 6.1) Salva URL progetto in Vault (una volta)
-- Sostituisci il tuo Project URL se diverso
select vault.create_secret('https://ccihuwvtlvmyzharkblj.supabase.co', 'travirae_project_url')
where not exists (select 1 from vault.secrets where name='travirae_project_url');

-- 6.1b) Salva ANON KEY in Vault (una volta)
-- Incolla qui la tua SUPABASE_ANON_KEY (quella "anon" lunga JWT)
select vault.create_secret('PASTE_YOUR_SUPABASE_ANON_KEY_HERE', 'travirae_anon_key')
where not exists (select 1 from vault.secrets where name='travirae_anon_key');

-- 6.2) Salva CRON secret in Vault (una volta)
-- IMPORTANTISSIMO: incolla la stessa stringa che userai anche in Edge Functions Secrets -> TRAVIRAE_CRON_SECRET
-- Esempio: 'tva_cron_...una stringa lunga...'
select vault.create_secret('PASTE_YOUR_CRON_SECRET_HERE', 'travirae_cron_secret')
where not exists (select 1 from vault.secrets where name='travirae_cron_secret');

-- 6.3) Schedula job ogni 6 ore (minuto 10)
-- Se vuoi cambiare orario: modifica la stringa CRON. Esempio ogni ora: '10 * * * *'
select
  cron.schedule(
    'travirae-import-travelpayouts',
    '10 */6 * * *',
    $$
    select net.http_post(
      url:= (select decrypted_secret from vault.decrypted_secrets where name = 'travirae_project_url') || '/functions/v1/import-travelpayouts',
      headers:=jsonb_build_object(
        'Content-type','application/json',
        'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'travirae_anon_key'),
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'travirae_cron_secret')
      ),
      body:=jsonb_build_object('days', 45)
    ) as request_id;
    $$
  );
