# Test checklist — click widget creator e attribuzione

## Prerequisiti

- modulo influencer già installato
- SCRIPT_11 e SCRIPT_12 già eseguiti in Supabase
- `import-travelpayouts` già deployata
- almeno 2 creator attivi, ad esempio:
  - creator-a
  - creator-b
- almeno 1 post pubblicato di creator-a con:
  - widget Stay22
  - oppure Flights Widget

## Test 1 — ingresso da creator-b, click sul widget di creator-a

1. Apri il sito usando un link con `?ref=creator-b`
2. Apri un post pubblico di `creator-a`
3. Tocca il widget del post di `creator-a`

### Controlla in Supabase

#### Tabella `influencer_post_events`
Deve comparire una riga con:

- `event_type = widget_click`
- `affiliate_slug = creator-a`
- `metadata.source = influencer_post`

#### Tabella `bookings`
Deve comparire una riga con:

- `status = click`
- `affiliate_slug = creator-a`
- `metadata.site_affiliate_slug = creator-b` (se l'utente era arrivato da quel ref)
- `metadata.source = influencer_post`

### Risultato atteso

- creator-a vede il click widget
- creator-b non vede quel click tra le metriche creator

## Test 2 — dashboard creator-a

1. login come `creator-a`
2. apri `area-affiliati.html`
3. verifica la sezione performance creator nella dashboard
4. apri anche `area-affiliati-profilo.html`

### Risultato atteso

Devono aggiornarsi le metriche:

- click widget outbound
- eventuali booking pending / confirmed quando arriveranno i partner

## Test 3 — dashboard creator-b

1. login come `creator-b`
2. apri la dashboard affiliato

### Risultato atteso

- il click sul widget di creator-a **non** deve comparire nei numeri creator di creator-b

## Test 4 — regola legacy del sito

1. entra sul sito con `?ref=creator-b`
2. fai un acquisto fuori dall'area influencer, su una pagina normale hotel/voli

### Risultato atteso

- la vendita legacy resta attribuita a `creator-b`
- il click del widget del post di creator-a, invece, resta attribuito a creator-a

## Test 5 — import conversione partner

### Travelpayouts

Se `sub_id = tracking_code_widget_creator-a`

Risultato atteso:

- conversione attribuita a creator-a

### Stay22

Se `campaign = tracking_code_widget_creator-a`

Risultato atteso:

- conversione attribuita a creator-a
