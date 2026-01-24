(function(){
  'use strict';

  function getLangCode(){
    try{
      if (typeof window.TraviraeGetSiteLang === 'function') return String(window.TraviraeGetSiteLang() || '').toUpperCase();
    }catch(e){}
    try{
      return String(localStorage.getItem('travirae_email_lang') || '').toUpperCase();
    }catch(e){}
    var htmlLang = String(document.documentElement.lang || '').toLowerCase();
    if (htmlLang.indexOf('de') === 0) return 'DEU';
    if (htmlLang.indexOf('en') === 0) return 'ENG';
    return 'ITA';
  }

  var lang = getLangCode();
  var IS_DE = lang === 'DEU';
  var IS_EN = lang === 'ENG';

  var statusEl = document.getElementById('unsub-status');
  function setStatus(txt){ if (statusEl) statusEl.textContent = txt; }

  var params = new URLSearchParams(window.location.search);
  var token = (params.get('token') || '').trim();

  if (!token) {
    setStatus(IS_DE ? 'Token fehlt. Der Link könnte unvollständig sein.'
      : (IS_EN ? 'Missing token. The link may be incomplete.'
      : 'Token mancante. Il link potrebbe essere incompleto.'));
    return;
  }

  async function unsubscribe(){
    try {
      if (!window.supabaseClient?.functions?.invoke) {
        throw new Error(IS_DE ? 'Supabase nicht initialisiert' : (IS_EN ? 'Supabase not initialised' : 'Supabase non inizializzato'));
      }

      var res = await window.supabaseClient.functions.invoke('newsletter-unsubscribe', {
        body: { token }
      });

      var data = res?.data;
      var error = res?.error;

      if (error) throw error;

      if (data?.ok) {
        setStatus(IS_DE ? 'Abmeldung abgeschlossen. Du erhältst den Newsletter nicht mehr.'
          : (IS_EN ? 'Unsubscription completed. You will no longer receive the newsletter.'
          : 'Disiscrizione completata. Non riceverai più la newsletter.'));
      } else {
        setStatus(IS_DE ? 'Wir konnten die Abmeldung nicht abschließen.'
          : (IS_EN ? 'We could not complete the unsubscription.'
          : 'Non siamo riusciti a completare la disiscrizione.'));
      }
    } catch (e) {
      console.error(e);
      setStatus(IS_DE ? 'Fehler bei der Abmeldung. Bitte versuche es später erneut.'
        : (IS_EN ? 'Error while unsubscribing. Please try again later.'
        : 'Errore durante la disiscrizione. Riprova più tardi.'));
    }
  }

  unsubscribe();
})();