# Travirae – Checklist test click -> post -> vendita -> creator

## 1. Test click widget

### Stay22
1. Apri un post influencer pubblicato
2. Clicca la mappa Stay22
3. Controlla `influencer_post_events`
   - deve esserci `event_type = widget_click`
4. Controlla `bookings`
   - deve esserci una riga con:
     - `status = click`
     - `affiliate_slug = creator_slug`
     - `metadata.source = influencer_post`

### Flights Widget
1. Apri un post influencer pubblicato
2. Clicca il widget voli
3. Controlla le stesse due tabelle come sopra

## 2. Test dashboard affiliato
1. Fai login nell'area affiliati del creator
2. Apri `Dashboard`
3. Verifica che compaia la sezione performance creator
4. Controlla che i click e le aperture si aggiornino

## 3. Test profilo creator
1. Vai su `Profilo`
2. Controlla che le statistiche private coincidano con la dashboard

## 4. Test import Travelpayouts
### Legacy
- `sub_id = slug affiliato`
- risultato atteso: continua a funzionare come prima

### Influencer
- `sub_id = ifp_creator_post_widget`
- risultato atteso:
  - booking attribuito al creator corretto
  - metadata con post / widget / tracking code

## 5. Test import Stay22 CSV
### Legacy
- `campaign = slug affiliato`
- risultato atteso: continua a funzionare come prima

### Influencer
- `campaign = ifp_creator_post_widget`
- risultato atteso:
  - booking attribuito al creator corretto
  - metadata con post / widget / tracking code

## 6. Test regola business finale
### Acquisto fuori dai vlog
1. Entra con `?ref=affiliatoA`
2. Compra su una pagina normale del sito
3. Risultato atteso:
   - la vendita resta ad `affiliatoA`

### Acquisto da post influencer
1. Entra con `?ref=affiliatoA`
2. Apri il post del creator B
3. Clicca il widget del creator B
4. Risultato atteso:
   - il click / la vendita vanno al creator B
   - la ref generale del sito non viene sovrascritta per il resto del sito
