(function(){
  'use strict';

  const statusEl = document.getElementById('unsub-status');
  function setStatus(txt){ if (statusEl) statusEl.textContent = txt; }

  const params = new URLSearchParams(window.location.search);
  const token = (params.get('token') || '').trim();

  if (!token) {
    setStatus('Token mancante. Il link potrebbe essere incompleto.');
    return;
  }

  async function unsubscribe(){
    try {
      if (!window.supabaseClient?.functions?.invoke) {
        throw new Error('Supabase non inizializzato');
      }

      const { data, error } = await window.supabaseClient.functions.invoke('newsletter-unsubscribe', {
        body: { token }
      });

      if (error) throw error;

      if (data?.ok) {
        setStatus('Disiscrizione completata. Non riceverai più la newsletter.');
      } else {
        setStatus('Non siamo riusciti a completare la disiscrizione.');
      }
    } catch (e) {
      console.error(e);
      setStatus('Errore durante la disiscrizione. Riprova più tardi.');
    }
  }

  unsubscribe();
})();
