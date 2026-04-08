# Travirae - Newsletter (Edge Functions) - Deploy rapido

Queste funzioni devono esistere in Supabase Edge Functions con gli stessi nomi:

- newsletter-subscribe   (PUBBLICA)  -> deploy con: --no-verify-jwt
- newsletter-unsubscribe (PUBBLICA)  -> deploy con: --no-verify-jwt
- newsletter-send        (ADMIN)     -> deploy normale (JWT ON)

## Comandi CLI consigliati (Windows)

```bash
supabase login
supabase link --project-ref ccihuwvtlvmyzharkblj

supabase functions deploy newsletter-subscribe --no-verify-jwt
supabase functions deploy newsletter-unsubscribe --no-verify-jwt
supabase functions deploy newsletter-send
```

## SQL
Esegui anche `supabase/sql/SCRIPT_09_newsletter.sql` nel Supabase SQL Editor.

## Secrets richiesti (Supabase -> Edge Functions -> Secrets)
- RESEND_API_KEY
- RESEND_FROM  (es: Travirae <info@travirae.com>)
- ADMIN_EMAIL  (es: serioliivan@gmail.com)
- SITE_URL     (es: https://travirae.com)
- SUPABASE_SERVICE_ROLE_KEY
