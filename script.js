(() => {
  // IMPORTANT: non cambiare questo embed ID (è la parte dopo /embed/).
  // Cambiarlo significherebbe cambiare embed e perdere l'associazione/tracking.
  const EMBED_ID = "68e1638724ecc1f8e809a503";

  const iframe = document.getElementById("stay22-widget");
  if (!iframe) return;

  const base = `https://www.stay22.com/embed/${EMBED_ID}`;
  const pageUrl = new URL(window.location.href);
  const campaign = pageUrl.searchParams.get("campaign");

  const url = new URL(base);

  // 1) Campo destinazione visivamente vuoto:
  //    Impostiamo 'venue' a uno zero-width space (carattere invisibile),
  //    così il widget non ripristina una destinazione precedente tipo “Dubai…”
  //    ma la barra resta senza testo.
  url.searchParams.set("venue", "\u200B");

  // 2) Lingua UI (puoi cambiarla senza toccare l'embed ID).
  url.searchParams.set("ljs", "it");

  // 3) Sub-tracking (opzionale): se usi campaign per affiliate, lo manteniamo invariato.
  if (campaign) {
    url.searchParams.set("campaign", campaign);
  }

  iframe.src = url.toString();
})();