(function(){
  'use strict';

  function getLangCode(){
    try{
      if (typeof window.TraviraeGetSiteLang === 'function') return window.TraviraeGetSiteLang();
    }catch(e){}
    try{
      return String(localStorage.getItem('travirae_email_lang') || '').toUpperCase();
    }catch(e){}
    return (String(document.documentElement.lang || '').toLowerCase().indexOf('de') === 0) ? 'DEU' : 'ITA';
  }

  const IS_DE = getLangCode() === 'DEU';

  const statusEl = document.getElementById('unsub-status');
  function setStatus(txt){ if (statusEl) statusEl.textContent = txt; }

  const params = new URLSearchParams(window.location.search);
  const token = (params.get('token') || '').trim();

  if (!token) {
    setStatus(IS_DE ? 'Token fehlt. Der Link könnte unvollständig sein.' : 'Token mancante. Il link potrebbe essere incompleto.');
    return;
  }

  async function unsubscribe(){
    try {
      if (!window.supabaseClient?.functions?.invoke) {
        throw new Error(IS_DE ? 'Supabase nicht initialisiert' : 'Supabase non inizializzato');
      }

      const { data, error } = await window.supabaseClient.functions.invoke('newsletter-unsubscribe', {
        body: { token }
      });

      if (error) throw error;

      if (data?.ok) {
        setStatus(IS_DE ? 'Abmeldung abgeschlossen. Du erhältst den Newsletter nicht mehr.' : 'Disiscrizione completata. Non riceverai più la newsletter.');
      } else {
        setStatus(IS_DE ? 'Wir konnten die Abmeldung nicht abschließen.' : 'Non siamo riusciti a completare la disiscrizione.');
      }
    } catch (e) {
      console.error(e);
      setStatus(IS_DE ? 'Fehler bei der Abmeldung. Bitte versuche es später erneut.' : 'Errore durante la disiscrizione. Riprova più tardi.');
    }
  }

  unsubscribe();
})();
