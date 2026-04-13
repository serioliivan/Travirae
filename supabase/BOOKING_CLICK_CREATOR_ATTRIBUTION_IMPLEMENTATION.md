# Travirae – Booking click, attribuzione creator e dashboard collegata

## Come funziona in modo semplice

Ci sono due momenti diversi:

1. **Booking click**
   - l'utente apre un post influencer
   - clicca su un widget partner (`Hotel Map` o `Flights Widget`)
   - Travirae registra subito il click
   - questo click non è ancora una vendita

2. **Vendita / conversione**
   - il partner conferma una prenotazione
   - il report partner restituisce `campaign` o `sub_id`
   - Travirae risolve quel codice e attribuisce la vendita al creator corretto

## Dove viene registrato il click

Quando l'utente clicca un widget dentro un post, il frontend registra due cose:

- un evento in `influencer_post_events`
  - `event_type = widget_click`
- un record in `bookings`
  - `status = click`
  - `metadata.source = influencer_post`
  - `affiliate_slug = slug del creator`

## Tracking code del widget

Ogni widget ha un tracking code stabile, per esempio:

`ifp_travirae-test_a12_w03`

Quel codice viene salvato in:

- `influencer_post_widgets.tracking_code`
- `bookings.metadata.widget_tracking_code`
- `influencer_post_events.metadata.tracking_code`
- `campaign` per Stay22
- `sub_id` per Travelpayouts / Aviasales

## Regola di attribuzione

### Caso 1 – sito normale
L'utente arriva con `?ref=slug-affiliato` e compra fuori dai post influencer.

Risultato:
- la vendita resta attribuita all'affiliato legacy del sito

### Caso 2 – post influencer
L'utente arriva anche da `?ref=slug-affiliato`, ma poi clicca un widget dentro un post influencer.

Risultato:
- quel click / quella vendita vengono attribuiti al creator proprietario del post
- la ref generale del sito non viene sovrascritta per tutto il resto

## Dashboard affiliato collegata al profilo creator

La dashboard affiliato ora mostra anche una sezione dedicata alle performance creator.

Quella sezione legge la view:

- `public.influencer_creator_private_stats`

e mostra:

- visite profilo
- impression card
- aperture popup post
- click widget outbound
- booking pending
- booking confirmed
- revenue stimata
- revenue confermata

I booking click dei post entrano anche nella dashboard affiliato perché vengono salvati in `bookings` con `status = click` e `affiliate_slug = creator_slug`.

## Import partner

### Travelpayouts / Aviasales
La Edge Function risolve così:

- se `sub_id` è uno slug legacy → attribuzione legacy
- se `sub_id` è un tracking code widget → `resolve_influencer_tracking_code(...)`

### Stay22 CSV
L'import CSV fa lo stesso con `campaign`.

## Cosa NON serve cambiare in questo step

Se hai già applicato il modulo influencer:

- non serve un nuovo script SQL per questa parte
- non serve cambiare auth
- non serve cambiare il tracking pubblico legacy

Questa parte si appoggia alla struttura già presente nel progetto.
