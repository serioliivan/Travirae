-- MIGRATION_add_metadata_if_missing.sql
-- Se la tua tabella bookings è stata creata con una versione vecchia e non ha la colonna metadata,
-- esegui questo per allinearti agli script aggiornati.
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
