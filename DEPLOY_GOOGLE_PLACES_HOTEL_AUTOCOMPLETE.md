# Travirae — attivazione autocomplete hotel Google Places tramite Supabase

Questa versione dello ZIP contiene già:

- il campo unico **Hotel o struttura**;
- la tendina con **nome struttura + località**;
- la selezione obbligatoria di un risultato;
- il passaggio a Stay22 di `hotelname`, `address`, `lat`, `lng`, date, ospiti e tracking;
- la Edge Function Supabase che mantiene nascosta la chiave Google.

Non devi eseguire SQL e non devi creare tabelle.

---

## 1. Controlla la chiave Google

La chiave verrà usata dai server Supabase, non direttamente dal browser.

Apri Google Cloud Console:

1. seleziona il progetto Google usato per Travirae;
2. vai in **API e servizi → Credenziali**;
3. apri la chiave che hai creato;
4. in **Restrizioni applicazione** seleziona **Nessuna**;
5. in **Restrizioni API** seleziona **Limita chiave**;
6. abilita soltanto **Places API (New)**;
7. salva.

Assicurati inoltre che:

- **Places API (New)** sia abilitata;
- la fatturazione Google Cloud sia collegata al progetto.

### Importante

Una chiave limitata con `Siti web / HTTP referrers` non funziona dentro una Supabase Edge Function, perché la richiesta a Google parte dai server Supabase.

Se la tua chiave è già utilizzata da altri widget web, crea una seconda chiave dedicata chiamata, per esempio:

`Travirae Places Supabase Server`

La chiave resta protetta nel Secret Supabase e non è contenuta nello ZIP.

---

## 2. Salva la chiave nei Secrets Supabase

1. apri il progetto Supabase di Travirae;
2. nel menu laterale entra in **Edge Functions**;
3. apri **Secrets** oppure **Secrets Management**;
4. premi **Add secret**;
5. nel campo nome inserisci esattamente:

   `GOOGLE_PLACES_API_KEY`

6. nel campo valore incolla la chiave Google;
7. salva.

Non inserire la chiave in:

- `assets/js/config.js`;
- file HTML;
- GitHub;
- messaggi pubblici;
- screenshot non oscurati.

Non è necessario ridistribuire una funzione già pubblicata dopo la modifica di un Secret: Supabase rende il valore disponibile alla funzione.

---

## 3. Pubblica la Edge Function

1. in Supabase apri **Edge Functions**;
2. premi **Deploy a new function**;
3. scegli **Via Editor**;
4. come nome inserisci esattamente:

   `google-hotel-autocomplete`

5. nello ZIP apri questo file:

   `supabase/functions/google-hotel-autocomplete/index.ts`

6. copia tutto il suo contenuto;
7. nell’editor Supabase elimina il codice di esempio;
8. incolla il codice dello ZIP;
9. lascia attiva l’opzione **Verify JWT / Enforce JWT verification**;
10. premi **Deploy function**.

Se la funzione esiste già:

1. apri `google-hotel-autocomplete`;
2. entra nell’editor;
3. sostituisci il codice;
4. premi **Deploy updates**.

### Perché Verify JWT deve rimanere attivo

Il sito Travirae chiama la funzione usando la chiave pubblica/anon del progetto già configurata in `assets/js/config.js`. I visitatori non devono essere registrati, ma la richiesta passa comunque attraverso la verifica della chiave pubblica Supabase.

---

## 4. Testa l’autocomplete dal pannello Supabase

Apri la funzione `google-hotel-autocomplete` e premi **Test**.

Imposta:

- metodo: `GET`;
- autorizzazione: chiave `anon` o `publishable` del progetto;
- query parameters:

  - `action` = `autocomplete`
  - `q` = `Hotel Danieli Venezia`
  - `lang` = `it`
  - `session_token` = `11111111-1111-4111-8111-111111111111`

Non inserire body.

Premi **Send Request**.

La risposta corretta contiene una struttura simile a:

```json
{
  "items": [
    {
      "placeId": "...",
      "name": "Hotel Danieli",
      "location": "Venezia, Italia"
    }
  ],
  "provider": "google_places_new",
  "status": "ok"
}
```

### Test dei dettagli

Copia il `placeId` del primo risultato e crea un secondo test:

- metodo: `GET`;
- autorizzazione: chiave `anon` o `publishable`;
- query parameters:

  - `action` = `details`
  - `place_id` = il `placeId` copiato
  - `lang` = `it`
  - `session_token` = lo stesso token del test precedente

La risposta corretta deve contenere:

- `address`;
- `lat`;
- `lng`;
- `status: "ok"`.

---

## 5. Pubblica lo ZIP sul sito

1. estrai lo ZIP aggiornato in una cartella temporanea;
2. apri la cartella locale del repository Travirae;
3. non cancellare la cartella nascosta `.git`;
4. copia dentro il repository tutto il contenuto della cartella `Travirae DEFINITIVO`;
5. scegli **Sostituisci i file nella destinazione**;
6. apri GitHub Desktop;
7. crea un commit, per esempio:

   `Autocomplete hotel Google Places`

8. premi **Commit to main**;
9. premi **Push origin**;
10. attendi il completamento di GitHub Pages;
11. apri `travirae.com` e premi `Ctrl + F5`.

---

## 6. Funzionamento finale

Nella modalità **Hotel specifico**:

1. l’utente scrive almeno tre caratteri;
2. Travirae chiama la Edge Function Supabase;
3. Supabase usa in modo protetto `GOOGLE_PLACES_API_KEY`;
4. Google restituisce massimo cinque strutture;
5. la tendina mostra il nome dell’hotel e sotto la località;
6. l’utente deve selezionare una struttura;
7. Travirae recupera indirizzo e coordinate;
8. il pulsante **Trova questo hotel** passa a Stay22:

   - `aid=travirae`;
   - `hotelname`;
   - `address`;
   - `lat` e `lng`;
   - check-in e check-out;
   - adulti e bambini;
   - lingua e valuta;
   - eventuale `campaign` del creator/affiliato.

Il tracking Stay22, il tracking Supabase e l’attribuzione creator già esistenti rimangono invariati.

---

## 7. Errori comuni

### `401 Unauthorized`

Nel tester Supabase non hai selezionato la chiave `anon/publishable`, oppure la richiesta dal sito non sta inviando la configurazione pubblica Supabase.

Non disattivare Verify JWT come prima soluzione.

### `google_places_key_not_configured`

Il Secret non esiste oppure il nome non è esattamente:

`GOOGLE_PLACES_API_KEY`

### `google_places_unavailable`

Controlla in Google Cloud:

- fatturazione collegata;
- Places API (New) abilitata;
- restrizione API corretta;
- restrizione applicazione impostata su `Nessuna`;
- quota non esaurita.

Apri anche **Edge Functions → google-hotel-autocomplete → Logs** per vedere l’errore Google completo.

### `origin_not_allowed`

La funzione accetta già:

- `https://travirae.com`;
- `https://www.travirae.com`;
- `https://serioliivan.github.io`;
- localhost per i test.

Per aggiungere altri domini, modifica l’elenco iniziale della Edge Function oppure crea il Secret opzionale:

`GOOGLE_PLACES_ALLOWED_ORIGINS`

con valori separati da virgola.

### Nessun risultato

Prova una ricerca più precisa, per esempio:

`Hilton New York Times Square`

invece di:

`Hilton`

---

## 8. SQL richiesto

Nessuno.
