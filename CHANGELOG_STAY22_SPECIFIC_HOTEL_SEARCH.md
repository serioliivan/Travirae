# Travirae — ricerca di un hotel specifico

- Aggiunto al widget della homepage il selettore tra **Per destinazione** e **Hotel specifico**.
- La modalità hotel richiede **nome della struttura** e **città/Paese**, oltre a date e ospiti.
- La ricerca generale continua a usare l'endpoint Stay22 Searchbar.
- La ricerca di una struttura precisa usa l’endpoint Stay22 Roam con `hotelname` + `address`, così Stay22 identifica l’hotel e seleziona il provider più adatto.
- Restano invariati `aid=travirae`, lingua, valuta, campagna creator/affiliato e tracking Supabase esistente.
- Implementazione estesa a tutte le nove homepage linguistiche.
- Nessuna modifica a Supabase, tabelle, Edge Functions o SQL.
