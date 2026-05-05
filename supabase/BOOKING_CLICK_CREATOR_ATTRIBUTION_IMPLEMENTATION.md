> [!IMPORTANT]
> Questo documento descrive il **flusso legacy dei booking click**.
> Nel frontend aggiornato di Travirae il tracking dei booking click è disattivato e i widget non usano più overlay invisibili.
> Le dashboard si basano su landing affiliate, traffico e vendite confermate importate dai partner.

# Booking click creator attribution — come funziona

## Obiettivo

Quando un utente clicca un widget dentro un post influencer:

- il click deve essere attribuito **al creator proprietario di quel widget/post**
- **non** al creator dal cui link di ingresso l'utente era arrivato sul sito
- il click deve comparire sia:
  - nelle statistiche creator del profilo
  - nella dashboard affiliato

## Regola di business

Esempio:

- utente entra sul sito da `?ref=creator-b`
- poi apre un post di `creator-a`
- poi tocca la mappa Stay22 o il Flights Widget del post di `creator-a`

Risultato corretto:

- `creator-a` vede il click del widget
- `creator-b` **non** vede quel click tra i widget/post del creator
- l'eventuale ref generale del sito di `creator-b` continua a valere solo per il resto del sito fuori dai widget del post influencer

## Come viene fatto tecnicamente

Ogni widget del post ha un tracking code stabile, ad esempio:

`ifp_creator-a_p12_w03`

Quando il widget viene renderizzato nel popup pubblico del post, il codice Travirae scrive sul contenitore del widget questi dati:

- partner
- tracking code widget
- widget short id
- affiliate slug del creator proprietario
- creator public slug
- post id
- post slug

Quando l'utente **interagisce** con il widget nel popup pubblico:

1. viene salvato un evento in `influencer_post_events`
2. viene salvato un booking click in `bookings`
3. l'affiliate slug usato è quello del creator proprietario del widget, non il ref generale del sito

## Tabelle coinvolte

### `influencer_post_events`

Evento registrato:

- `event_type = widget_click`
- `affiliate_slug = creator_affiliate_slug`
- `metadata.source = influencer_post`
- `metadata.creator_affiliate_slug`
- `metadata.creator_slug`
- `metadata.post_slug`
- `metadata.tracking_code`

### `bookings`

Riga registrata:

- `status = click`
- `affiliate_slug = creator_affiliate_slug`
- `partner = stay22` oppure `aviasales`
- `metadata.source = influencer_post`
- `metadata.widget_tracking_code`
- `metadata.site_affiliate_slug` = eventuale ref generale del sito

In questo modo la vendita futura resta ricollegabile al creator corretto.

## Perché non viene attribuito al creator di ingresso

Per il widget click viene usato esplicitamente:

- `affiliateSlugOverride = creator proprietario del widget`

Quindi il ref legacy del sito viene lasciato nei metadati, ma **non** diventa il titolare del click del widget.

## Dashboard affiliato

La dashboard affiliato legge:

- i click widget dai dati creator (`influencer_creator_private_stats`)
- i booking click dal flusso `bookings`

Quindi il creator proprietario del widget vede il numero giusto.

## Vendite / conversioni

Quando poi arrivano le vendite dai partner:

- Travelpayouts usa `sub_id`
- Stay22 usa `campaign`

Se il valore corrisponde a un tracking code widget creator, il backend risolve:

`tracking code -> widget -> post -> creator`

Così la vendita confermata viene attribuita al creator corretto.
