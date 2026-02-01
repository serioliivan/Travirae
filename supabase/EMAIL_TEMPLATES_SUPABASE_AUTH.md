# Travirae – Supabase Auth Email Templates (multi‑lingua)

Questi template usano **`user_metadata.language`** (accessibile come `{{ .Data.language }}` nei template) per scegliere automaticamente la lingua dell’email.

Valori supportati (3 lettere maiuscole):
- ITA, ENG, ARA, DEU, SPA, RUS, NLD, ZHO, FRA

Se `language` non è impostata, viene usato **ITA** come default.

---

## 1) Reset password (HTML)

> Incolla questo HTML in: **Supabase Dashboard → Authentication → Emails → "Reset password"**

```html
{{ $lang := .Data.language }}{{ if not $lang }}{{ $lang = "ITA" }}{{ end }}
<!doctype html>
<html {{ if eq $lang "ARA" }}dir="rtl" lang="ar"{{ else }}dir="ltr"{{ end }}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:16px;overflow:hidden;">
        <div style="padding:18px 22px;border-bottom:1px solid rgba(0,0,0,0.06);text-align:center;">
          <div style="font-weight:800;letter-spacing:0.4px;">Travirae</div>
          <div style="margin-top:6px;font-size:13px;color:#667085;">
            {{ if eq $lang "ENG" }}Reset your password{{ else if eq $lang "FRA" }}Réinitialisez votre mot de passe{{ else if eq $lang "DEU" }}Passwort zurücksetzen{{ else if eq $lang "SPA" }}Restablecer contraseña{{ else if eq $lang "RUS" }}Сброс пароля{{ else if eq $lang "NLD" }}Wachtwoord resetten{{ else if eq $lang "ZHO" }}重置密码{{ else if eq $lang "ARA" }}إعادة تعيين كلمة المرور{{ else }}Reimposta la tua password{{ end }}
          </div>
        </div>

        <div style="padding:24px 22px;text-align:center;">
          <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;">
            {{ if eq $lang "ENG" }}Reset password{{ else if eq $lang "FRA" }}Réinitialiser le mot de passe{{ else if eq $lang "DEU" }}Passwort zurücksetzen{{ else if eq $lang "SPA" }}Restablecer contraseña{{ else if eq $lang "RUS" }}Сбросить пароль{{ else if eq $lang "NLD" }}Wachtwoord opnieuw instellen{{ else if eq $lang "ZHO" }}重置密码{{ else if eq $lang "ARA" }}إعادة تعيين كلمة المرور{{ else }}Reset password{{ end }}
          </h2>

          <p style="margin:0 0 18px 0;color:#475467;font-size:14px;line-height:1.6;">
            {{ if eq $lang "ENG" }}
              We received a request to reset the password for your Travirae account.
            {{ else if eq $lang "FRA" }}
              Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Travirae.
            {{ else if eq $lang "DEU" }}
              Wir haben eine Anfrage erhalten, das Passwort für dein Travirae‑Konto zurückzusetzen.
            {{ else if eq $lang "SPA" }}
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta Travirae.
            {{ else if eq $lang "RUS" }}
              Мы получили запрос на сброс пароля для вашей учетной записи Travirae.
            {{ else if eq $lang "NLD" }}
              We hebben een verzoek ontvangen om het wachtwoord van je Travirae‑account opnieuw in te stellen.
            {{ else if eq $lang "ZHO" }}
              我们收到了为你的 Travirae 账户重置密码的请求。
            {{ else if eq $lang "ARA" }}
              تلقّينا طلبًا لإعادة تعيين كلمة مرور حسابك على Travirae.
            {{ else }}
              Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Travirae.
            {{ end }}
          </p>

          <a href="{{ .ConfirmationURL }}"
             style="display:inline-block;background:#2245ff;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;">
            {{ if eq $lang "ENG" }}Reset password{{ else if eq $lang "FRA" }}Réinitialiser le mot de passe{{ else if eq $lang "DEU" }}Passwort zurücksetzen{{ else if eq $lang "SPA" }}Restablecer contraseña{{ else if eq $lang "RUS" }}Сбросить пароль{{ else if eq $lang "NLD" }}Wachtwoord resetten{{ else if eq $lang "ZHO" }}重置密码{{ else if eq $lang "ARA" }}إعادة تعيين كلمة المرور{{ else }}Reimposta password{{ end }}
          </a>

          <p style="margin:16px 0 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">
            {{ if eq $lang "ENG" }}
              If you didn't request a password reset, you can ignore this email.
            {{ else if eq $lang "FRA" }}
              Si vous n'avez pas demandé la réinitialisation, vous pouvez ignorer cet email.
            {{ else if eq $lang "DEU" }}
              Wenn du das nicht angefordert hast, kannst du diese E‑Mail ignorieren.
            {{ else if eq $lang "SPA" }}
              Si no solicitaste este cambio, puedes ignorar este correo.
            {{ else if eq $lang "RUS" }}
              Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
            {{ else if eq $lang "NLD" }}
              Als jij dit niet hebt aangevraagd, kun je deze e‑mail negeren.
            {{ else if eq $lang "ZHO" }}
              如果你没有发起该请求，请忽略此邮件。
            {{ else if eq $lang "ARA" }}
              إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
            {{ else }}
              Se non hai richiesto tu il reset password, puoi ignorare questa email.
            {{ end }}
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 2) Conferma registrazione (HTML)

> Incolla questo HTML in: **Supabase Dashboard → Authentication → Emails → "Confirm signup"**

```html
{{ $lang := .Data.language }}{{ if not $lang }}{{ $lang = "ITA" }}{{ end }}
<!doctype html>
<html {{ if eq $lang "ARA" }}dir="rtl" lang="ar"{{ else }}dir="ltr"{{ end }}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:16px;overflow:hidden;">
        <div style="padding:18px 22px;border-bottom:1px solid rgba(0,0,0,0.06);text-align:center;">
          <div style="font-weight:800;letter-spacing:0.4px;">Travirae</div>
          <div style="margin-top:6px;font-size:13px;color:#667085;">
            {{ if eq $lang "ENG" }}Confirm your email{{ else if eq $lang "FRA" }}Confirmez votre e‑mail{{ else if eq $lang "DEU" }}E‑Mail bestätigen{{ else if eq $lang "SPA" }}Confirma tu correo{{ else if eq $lang "RUS" }}Подтвердите e‑mail{{ else if eq $lang "NLD" }}Bevestig je e‑mail{{ else if eq $lang "ZHO" }}确认邮箱{{ else if eq $lang "ARA" }}تأكيد البريد الإلكتروني{{ else }}Conferma la tua email{{ end }}
          </div>
        </div>

        <div style="padding:24px 22px;text-align:center;">
          <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;">
            {{ if eq $lang "ENG" }}Confirm signup{{ else if eq $lang "FRA" }}Confirmer l’inscription{{ else if eq $lang "DEU" }}Registrierung bestätigen{{ else if eq $lang "SPA" }}Confirmar registro{{ else if eq $lang "RUS" }}Подтвердить регистрацию{{ else if eq $lang "NLD" }}Registratie bevestigen{{ else if eq $lang "ZHO" }}确认注册{{ else if eq $lang "ARA" }}تأكيد التسجيل{{ else }}Conferma registrazione{{ end }}
          </h2>

          <p style="margin:0 0 18px 0;color:#475467;font-size:14px;line-height:1.6;">
            {{ if eq $lang "ENG" }}
              We received a signup request for Travirae. Please confirm your email address by clicking the button below.
            {{ else if eq $lang "FRA" }}
              Nous avons reçu une demande d’inscription à Travirae. Veuillez confirmer votre adresse e‑mail en cliquant sur le bouton ci‑dessous.
            {{ else if eq $lang "DEU" }}
              Wir haben eine Registrierungsanfrage für Travirae erhalten. Bitte bestätige deine E‑Mail‑Adresse mit dem Button unten.
            {{ else if eq $lang "SPA" }}
              Hemos recibido una solicitud de registro en Travirae. Confirma tu correo haciendo clic en el botón de abajo.
            {{ else if eq $lang "RUS" }}
              Мы получили запрос на регистрацию в Travirae. Подтвердите ваш адрес электронной почты, нажав кнопку ниже.
            {{ else if eq $lang "NLD" }}
              We hebben een registratieverzoek voor Travirae ontvangen. Bevestig je e‑mailadres via de knop hieronder.
            {{ else if eq $lang "ZHO" }}
              我们收到了 Travirae 的注册请求。请点击下方按钮确认你的邮箱地址。
            {{ else if eq $lang "ARA" }}
              تلقّينا طلب تسجيل في Travirae. يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه.
            {{ else }}
              Abbiamo ricevuto una richiesta di registrazione per Travirae. Conferma il tuo indirizzo email cliccando il pulsante qui sotto.
            {{ end }}
          </p>

          <a href="{{ .ConfirmationURL }}"
             style="display:inline-block;background:#2245ff;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;">
            {{ if eq $lang "ENG" }}Confirm email{{ else if eq $lang "FRA" }}Confirmer l’e‑mail{{ else if eq $lang "DEU" }}E‑Mail bestätigen{{ else if eq $lang "SPA" }}Confirmar correo{{ else if eq $lang "RUS" }}Подтвердить e‑mail{{ else if eq $lang "NLD" }}E‑mail bevestigen{{ else if eq $lang "ZHO" }}确认邮箱{{ else if eq $lang "ARA" }}تأكيد البريد الإلكتروني{{ else }}Conferma email{{ end }}
          </a>

          <p style="margin:16px 0 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">
            {{ if eq $lang "ENG" }}
              If you didn't create an account on Travirae, you can ignore this email.
            {{ else if eq $lang "FRA" }}
              Si vous n’avez pas créé de compte Travirae, vous pouvez ignorer cet e‑mail.
            {{ else if eq $lang "DEU" }}
              Wenn du kein Travirae‑Konto erstellt hast, kannst du diese E‑Mail ignorieren.
            {{ else if eq $lang "SPA" }}
              Si no creaste una cuenta en Travirae, puedes ignorar este correo.
            {{ else if eq $lang "RUS" }}
              Если вы не создавали аккаунт Travirae, вы можете проигнорировать это письмо.
            {{ else if eq $lang "NLD" }}
              Als je geen Travirae‑account hebt aangemaakt, kun je deze e‑mail negeren.
            {{ else if eq $lang "ZHO" }}
              如果你没有在 Travirae 创建账户，请忽略此邮件。
            {{ else if eq $lang "ARA" }}
              إذا لم تقم بإنشاء حساب على Travirae، يمكنك تجاهل هذه الرسالة.
            {{ else }}
              Se non hai creato tu un account Travirae, puoi ignorare questa email.
            {{ end }}
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 3) Magic link / Login link (HTML) – opzionale

> Se non usi il Magic Link puoi ignorare. Incolla in: **Authentication → Emails → "Magic link"**.

```html
{{ $lang := .Data.language }}{{ if not $lang }}{{ $lang = "ITA" }}{{ end }}
<!doctype html>
<html {{ if eq $lang "ARA" }}dir="rtl" lang="ar"{{ else }}dir="ltr"{{ end }}>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:16px;overflow:hidden;">
        <div style="padding:18px 22px;border-bottom:1px solid rgba(0,0,0,0.06);text-align:center;">
          <div style="font-weight:800;letter-spacing:0.4px;">Travirae</div>
          <div style="margin-top:6px;font-size:13px;color:#667085;">
            {{ if eq $lang "ENG" }}Login link{{ else if eq $lang "FRA" }}Lien de connexion{{ else if eq $lang "DEU" }}Login‑Link{{ else if eq $lang "SPA" }}Enlace de acceso{{ else if eq $lang "RUS" }}Ссылка для входа{{ else if eq $lang "NLD" }}Inloglink{{ else if eq $lang "ZHO" }}登录链接{{ else if eq $lang "ARA" }}رابط تسجيل الدخول{{ else }}Link di accesso{{ end }}
          </div>
        </div>

        <div style="padding:24px 22px;text-align:center;">
          <p style="margin:0 0 18px 0;color:#475467;font-size:14px;line-height:1.6;">
            {{ if eq $lang "ENG" }}
              Click the button below to log in to Travirae.
            {{ else if eq $lang "FRA" }}
              Cliquez sur le bouton ci‑dessous pour vous connecter à Travirae.
            {{ else if eq $lang "DEU" }}
              Klicke auf den Button unten, um dich bei Travirae anzumelden.
            {{ else if eq $lang "SPA" }}
              Haz clic en el botón de abajo para iniciar sesión en Travirae.
            {{ else if eq $lang "RUS" }}
              Нажмите кнопку ниже, чтобы войти в Travirae.
            {{ else if eq $lang "NLD" }}
              Klik op de knop hieronder om in te loggen bij Travirae.
            {{ else if eq $lang "ZHO" }}
              点击下方按钮登录 Travirae。
            {{ else if eq $lang "ARA" }}
              انقر على الزر أدناه لتسجيل الدخول إلى Travirae.
            {{ else }}
              Clicca il pulsante qui sotto per accedere a Travirae.
            {{ end }}
          </p>

          <a href="{{ .ConfirmationURL }}"
             style="display:inline-block;background:#2245ff;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;">
            {{ if eq $lang "ENG" }}Log in{{ else if eq $lang "FRA" }}Se connecter{{ else if eq $lang "DEU" }}Anmelden{{ else if eq $lang "SPA" }}Iniciar sesión{{ else if eq $lang "RUS" }}Войти{{ else if eq $lang "NLD" }}Inloggen{{ else if eq $lang "ZHO" }}登录{{ else if eq $lang "ARA" }}تسجيل الدخول{{ else }}Accedi{{ end }}
          </a>
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## Nota operativa (importante)

1) Il selettore nel sito salva la preferenza in **localStorage** e la scrive in **`user_metadata.language`**:
- in fase di **registrazione** (signUp)
- ad ogni **login** (updateUser), così l’utente può cambiarla quando vuole.

2) Per gli utenti già creati: fai un login una volta con la lingua scelta → da quel momento le email Auth seguiranno quella lingua.

