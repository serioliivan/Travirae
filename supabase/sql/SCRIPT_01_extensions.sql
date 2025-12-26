-- SCRIPT 01 — ESTENSIONI (copia/incolla in SQL Editor e RUN)
-- Serve per gen_random_uuid() e per (opzionale) scheduling CRON.
create extension if not exists pgcrypto;
create extension if not exists pg_net;
create extension if not exists pg_cron;
