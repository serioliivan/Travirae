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

    window.supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  } catch (e) {
    if (window.console && console.error) console.error('Travirae: errore init supabaseClient', e);
  }
})();
