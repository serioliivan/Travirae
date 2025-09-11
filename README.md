

---

## Collegare correttamente il proxy Vercel (passi precisi)
1. Apri **travirae-proxy** su GitHub (il tuo repo del proxy).
2. Crea il file **`/api/proxy.js`** nel repo **travirae-proxy** e incolla **il contenuto di** `vercel-proxy/api/proxy.js` presente in questo ZIP.
3. Su **Vercel → Project (travirae-proxy) → Settings → Environment Variables** aggiungi/controlla:
   - `TP_API_KEY` = `cbd6c03b0dba76504e72be774de3657b`
   - `TP_PARTNER_MARKER` = `669407`
   - `TP_REFERER` = `https://travirae.com/`
4. **Deploy**: Vercel → **Deployments → Redeploy** (oppure fai un commit sul repo travirae-proxy).
5. Verifica manualmente in browser (devono rispondere 200 con CORS):
   - `https://travirae-proxy.vercel.app/api/proxy/api/ping`
   - `https://travirae-proxy.vercel.app/api/proxy/ping`
   - `https://travirae-proxy.vercel.app/api/ping`
6. Nel front‑end, lascia `config/app.json` così com’è (usa `https://travirae-proxy.vercel.app/api/proxy`). L’app **si adatta automaticamente** alla forma che risponde.

Se uno dei link al punto 5 restituisce 200, `api-test.html` troverà automaticamente la base corretta e la UI non mostrerà più il banner “Proxy offline”.
