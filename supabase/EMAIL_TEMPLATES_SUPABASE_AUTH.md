# Travirae — Template email Supabase Auth (HTML)

Questi template sono pensati per rendere “pulite” le email di:
- conferma registrazione
- reset password
- magic link / login link

## Dove incollarli
Supabase Dashboard → **Authentication → Emails → Templates**  
Apri il template (es. “Reset password”) e sostituisci l’HTML.

## Importante sui placeholder
Nel template Supabase vedrai variabili tipo:
- `{{ .ConfirmationURL }}`
- `{{ .Token }}`

**Non cambiarle**: mantieni i placeholder che trovi nel template originale, perché Supabase li sostituisce automaticamente con il link/codice giusto.

---

## 1) Reset password (HTML)

> Se nel tuo template originale il placeholder non è `{{ .ConfirmationURL }}`, usa quello che vedi lì.

```html
<div style="background:#f6f7fb;padding:24px 12px;font-family:Inter,Arial,sans-serif;line-height:1.5;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="padding:18px 20px;border-bottom:1px solid #e5e7eb;text-align:center;">
      <div style="font-size:18px;font-weight:800;">Travirae</div>
      <div style="color:#6b7280;font-size:13px;">Reimposta la tua password</div>
    </div>

    <div style="padding:18px 20px;text-align:center;">
      <h2 style="margin:0 0 12px 0;font-size:18px;">Reset password</h2>
      <p style="margin:0 0 14px 0;color:#111827;font-size:14px;">
        Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Travirae.
      </p>

      <p style="margin:0 0 18px 0;">
        <a href="{{ .ConfirmationURL }}"
           style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;">
          Reimposta password
        </a>
      </p>

      <p style="margin:0;color:#6b7280;font-size:12px;">
        Se non hai richiesto tu il reset password, puoi ignorare questa email.
      </p>
    </div>
  </div>
</div>
```

---

## 2) Conferma registrazione (HTML)

```html
<div style="background:#f6f7fb;padding:24px 12px;font-family:Inter,Arial,sans-serif;line-height:1.5;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="padding:18px 20px;border-bottom:1px solid #e5e7eb;text-align:center;">
      <div style="font-size:18px;font-weight:800;">Travirae</div>
      <div style="color:#6b7280;font-size:13px;">Conferma il tuo account</div>
    </div>

    <div style="padding:18px 20px;text-align:center;">
      <h2 style="margin:0 0 12px 0;font-size:18px;">Conferma email</h2>
      <p style="margin:0 0 14px 0;color:#111827;font-size:14px;">
        Clicca il pulsante qui sotto per confermare la tua email e attivare l’account.
      </p>

      <p style="margin:0 0 18px 0;">
        <a href="{{ .ConfirmationURL }}"
           style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;">
          Conferma account
        </a>
      </p>

      <p style="margin:0;color:#6b7280;font-size:12px;">
        Se non hai creato tu questo account, ignora la mail.
      </p>
    </div>
  </div>
</div>
```

---

## 3) OTP (se usi il codice `{{ .Token }}`)

```html
<div style="font-family:Inter,Arial,sans-serif;line-height:1.5;text-align:center;">
  <h2>Travirae</h2>
  <p>Il tuo codice di verifica è:</p>
  <p style="font-size:24px;font-weight:800;letter-spacing:2px;">{{ .Token }}</p>
</div>
```
