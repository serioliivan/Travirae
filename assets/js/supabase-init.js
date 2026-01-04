// Travirae - Supabase init (browser)
// Crea window.supabaseClient usando le chiavi pubbliche definite in assets/js/config.js

(function(){
  'use strict';

  try {
    if (typeof window === 'undefined') return;
    if (window.supabaseClient) return;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      if (window.console && console.warn) console.warn('Travirae: supabase-js non caricato');
      return;
    }

    var cfg = window.TRAVIRAE_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      if (window.console && console.warn) console.warn('Travirae: config Supabase mancante (config.js)');
      return;
    }

    // Client standard (persistente) per le aree utente/affiliate
    window.supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    // Client affiliati "session-only" (se l'utente NON spunta "Ricordami")
    // Usa sessionStorage: resta loggato finché la scheda/browser resta aperto.
    try {
      window.supabaseClientSession = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: {
          storage: window.sessionStorage,
          storageKey: 'travirae-affiliate-auth-session',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
    } catch(_e) {
      // se fallisce (browser/permessi), useremo il client standard
    }

    // Client admin (NON persistente) per evitare auto-login sulla pagina admin.
    // In questo modo, anche se sei già loggato come affiliato o avevi una sessione salvata,
    // la pagina admin richiede sempre email+password.
    try {
      window.supabaseAdminClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          // storageKey diverso per isolare completamente la sessione admin
          storageKey: 'travirae-admin-auth'
        }
      });
    } catch (_e) {
      // se fallisce, la pagina admin userà supabaseClient standard
    }
  } catch (e) {
    if (window.console && console.error) console.error('Travirae: errore init supabaseClient', e);
  }
})();
