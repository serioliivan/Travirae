// Travirae - Admin Affiliati dashboard
(function(){
  'use strict';

  function $(sel, root){ return (root || document).querySelector(sel); }

  // Alias used by some UI modules (e.g. newsletter preview & clear drafts).
  // Keeping this helper tiny avoids relying on jQuery-like globals.
  function q(sel, root){ return (root || document).querySelector(sel); }

  function formatMoney(value){
    var n = Number(value || 0);
    if (!isFinite(n)) n = 0;
    try{
      return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }catch(e){
      return n.toFixed(2);
    }
  }

  function formatUsd(value){
    return formatMoney(value) + ' USD';
  }

  function formatMonthLabel(iso){
    if (!iso) return '';
    try{
      var d = new Date(iso);
      var m = d.getMonth() + 1;
      var y = d.getFullYear();
      return (m < 10 ? '0'+m : m) + '/' + y;
    }catch(e){
      return iso;
    }
  }

  function formatDateTime(iso){
    if (!iso) return '';
    try{
      var d = new Date(iso);
      return d.toLocaleString('it-IT');
    }catch(e){
      return String(iso);
    }
  }

  function escapeHtml(str){
    return String(str || '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function init(){
    if (!document.body.classList.contains('page--affiliate-admin')) return;

    var ADMIN_EMAILS = ['serioliivan@gmail.com'];

    // Usa un client admin NON persistente (se disponibile) per evitare auto-login.
    // Fallback: supabaseClient standard.
    var supa = window.supabaseAdminClient || window.supabaseClient || null;
    var state = {
      user: null,
      chart: null,
      refreshTimer: null,
      realtimeChannel: null,
    };

    var loginView = $('#admin-view-login');
    var dashboardView = $('#admin-view-dashboard');
    var loginForm = $('#admin-login-form');
    var logoutBtn = $('#admin-logout-btn');
    var reloadBtn = $('#admin-reload-btn');
    var importBtn = $('#admin-import-aviasales-btn');
    var refreshPayoutsBtn = $('#admin-refresh-payouts-btn');
    var stay22CsvBtn = $('#admin-import-stay22-csv-btn');
    var stay22CsvInput = $('#admin-stay22-csv-input');
    var btn2fa = $('#admin-2fa-btn');

    var msgEl = $('#admin-message');

    // KPI
    var elTotalSales = $('#admin-total-sales');
    var elTotalNet = $('#admin-total-net');
    var elTotalAff = $('#admin-total-aff');
    var elTotalTrav = $('#admin-total-trav');
    var elDirectSales = $('#admin-direct-sales');
    var elDirectNet = $('#admin-direct-net');

    // Traffico sito (visite/pageview)
    var elTrafficVisits = $('#admin-traffic-visits');
    var elTrafficPageviews = $('#admin-traffic-pageviews');
    var elTrafficVisitsAffiliate = $('#admin-traffic-visits-affiliate');
    var elTrafficVisitsDirect = $('#admin-traffic-visits-direct');

    // Newsletter
    var elNewsletterCount = $('#admin-newsletter-count');
    var elNewsletterLangs = $('#admin-newsletter-langs');
    var newsletterForm = $('#admin-newsletter-form');
    var newsletterSubject = $('#newsletter-subject');
    var newsletterBody = $('#newsletter-body');
    var newsletterSendBtn = $('#admin-newsletter-send-btn');
    var newsletterStatusEl = $('#admin-newsletter-status');

    // Booking click (mese corrente)
    var elBClickTotal = $('#admin-bclick-total');
    var elBClickAffiliate = $('#admin-bclick-affiliate');
    var elBClickDirect = $('#admin-bclick-direct');

    // Tables
    var tbodyMonthly = $('#admin-monthly-tbody');
    var tbodyAffiliates = $('#admin-affiliates-tbody');
    var tbodyOperational = $('#admin-affiliates-kpi-tbody');
    var tbodyPayoutRequests = $('#admin-payout-requests-tbody');

    function refreshClient(){
      if (!supa && window.supabaseAdminClient) supa = window.supabaseAdminClient;
      if (!supa && window.supabaseClient) supa = window.supabaseClient;
      return supa;
    }

    function setMessage(text, type){
      if (!msgEl) return;
      msgEl.textContent = text || '';
      msgEl.classList.remove('is-error','is-success');
      if (type === 'error') msgEl.classList.add('is-error');
      if (type === 'success') msgEl.classList.add('is-success');

      // Popup (toast) per feedback immediato
      try{
        if (text && window.TraviraeToast && typeof window.TraviraeToast.showToast === 'function'){
          var t = (type === 'error' || type === 'success') ? type : 'success';
          window.TraviraeToast.showToast(String(text), t);
        }
      }catch(e){}
    }

    // ============================================================
    // Modal helper (usato per 2FA)
    // ============================================================

    var modalEl = null;

    function ensureModal(){
      if (modalEl) return modalEl;
      modalEl = document.createElement('div');
      modalEl.className = 'tva-modal';
      modalEl.innerHTML = [
        '<div class="tva-modal__card" role="dialog" aria-modal="true">',
        '  <div class="tva-modal__header">',
        '    <div class="tva-modal__title" id="tvaModalTitle"></div>',
        '    <button type="button" class="tva-modal__close" aria-label="Chiudi" id="tvaModalClose">×</button>',
        '  </div>',
        '  <div class="tva-modal__body" id="tvaModalBody"></div>',
        '  <div class="tva-modal__actions" id="tvaModalActions"></div>',
        '</div>'
      ].join('');
      document.body.appendChild(modalEl);
      modalEl.addEventListener('click', function(ev){
        if (ev.target === modalEl) requestCloseModal();
      });
      var closeBtn = document.getElementById('tvaModalClose');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      return modalEl;
    }

    function closeModal(){
      if (!modalEl) return;
      modalEl.classList.remove('is-open');
      modalEl._onClose = null;
      var body = document.getElementById('tvaModalBody');
      var actions = document.getElementById('tvaModalActions');
      var titleEl = document.getElementById('tvaModalTitle');
      if (titleEl) titleEl.textContent = '';
      if (body) body.innerHTML = '';
      if (actions) actions.innerHTML = '';
    }

    
    function requestCloseModal(){
      if (!modalEl) return;
      var cb = modalEl._onClose;
      if (typeof cb === 'function'){
        modalEl._onClose = null;
        try { cb(); } catch(e){ console.warn(e); closeModal(); }
        return;
      }
      closeModal();
    }

function openModal(opts){
      opts = opts || {};
      var overlay = ensureModal();
      modalEl._onClose = (opts && typeof opts.onClose === 'function') ? opts.onClose : null;
      var titleEl = document.getElementById('tvaModalTitle');
      var body = document.getElementById('tvaModalBody');
      var actions = document.getElementById('tvaModalActions');
      if (titleEl) titleEl.textContent = opts.title || '';
      if (body) body.innerHTML = opts.bodyHtml || '';
      if (actions){
        actions.innerHTML = '';
        (opts.actions || []).forEach(function(a){
          var b = document.createElement('button');
          b.type = 'button';
          b.className = a.className || 'btn';
          b.textContent = a.label || 'OK';
          b.addEventListener('click', function(){
            if (typeof a.onClick === 'function') a.onClick();
          });
          actions.appendChild(b);
        });
      }
      overlay.classList.add('is-open');
    }

    // ============================================================
    // 2FA / MFA (TOTP)
    // ============================================================

    async function getVerifiedTotpFactor(client){
      try{
        if (!client || !client.auth || !client.auth.mfa) return null;
        var res = await client.auth.mfa.listFactors();
        if (res.error) return null;
        var totpList = (res.data && res.data.totp) ? res.data.totp : [];
        for (var i=0;i<totpList.length;i++){
          if (totpList[i] && totpList[i].status === 'verified') return totpList[i];
        }
        return null;
      }catch(e){
        console.warn(e);
        return null;
      }
    }

    function getFactorFriendlyName(f){
      return (f && (f.friendly_name || f.friendlyName)) || '';
    }

    async function listTotpFactors(client){
      try{
        if (!client || !client.auth || !client.auth.mfa) return [];
        var res = await client.auth.mfa.listFactors();
        if (res.error) return [];
        return (res.data && res.data.totp) ? res.data.totp : [];
      }catch(e){
        console.warn(e);
        return [];
      }
    }

    async function cleanupStaleUnverifiedTotpFactors(client, friendlyName){
      try{
        var totpList = await listTotpFactors(client);
        if (!totpList || !totpList.length) return;
        var tasks = [];
        for (var i=0;i<totpList.length;i++){
          var f = totpList[i];
          if (!f || !f.id) continue;
          var status = f.status || '';
          var fname = getFactorFriendlyName(f);
          if (status !== 'verified' && (!fname || fname === friendlyName)){
            tasks.push(client.auth.mfa.unenroll({ factorId: f.id }));
          }
        }
        if (tasks.length) await Promise.all(tasks);
      }catch(e){
        console.warn(e);
      }
    }

    function normalizeQrToDataUrl(qr){
      if (!qr || typeof qr !== 'string') return null;
      var s = qr.trim();
      if (!s) return null;
      if (s.startsWith('data:')) return s;

      var lower = s.toLowerCase();
      if (lower.startsWith('<img')){
        var m = s.match(/src\s*=\s*["']([^"']+)["']/i);
        if (m && m[1]) return normalizeQrToDataUrl(m[1]);
        return null;
      }

      if (s.startsWith('<svg')){
        try{
          var b64 = btoa(unescape(encodeURIComponent(s)));
          return 'data:image/svg+xml;base64,' + b64;
        }catch(e){
          return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
        }
      }

      if (s.startsWith('otpauth://')) return null;
      return s;
    }

    async function verifyTotpCode(client, factorId, code){
      try{
        if (!client || !client.auth || !client.auth.mfa) return false;
        var ch = await client.auth.mfa.challenge({ factorId: factorId });
        if (ch.error) return false;
        var challengeId = ch.data && (ch.data.id || ch.data.challengeId);
        var vr = await client.auth.mfa.verify({ factorId: factorId, challengeId: challengeId, code: code });
        return !vr.error;
      }catch(e){
        console.warn(e);
        return false;
      }
    }

    async function promptAndVerifyTotpCode(client, factorId, promptTitle){
      var code = await promptTotpCodeModal({ title: (promptTitle || 'Verifica 2FA') });
      if (!code) return false;
      var ok = await verifyTotpCode(client, factorId, code);
      if (!ok) showToast('Codice 2FA non valido.', 'error');
      return ok;
    }


    function promptTotpCodeModal(opts){
      opts = opts || {};
      return new Promise(function(resolve){
        openModal({
          title: opts.title || 'Verifica 2FA',
          bodyHtml: [
            '<p class="tva-modal__hint">Inserisci il codice a 6 cifre della tua app di autenticazione.</p>',
            '<div class="tva-modal__field">',
            '  <label class="tva-modal__label">Codice 2FA</label>',
            '  <input class="tva-modal__input" id="tvaMfaCode" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" />',
            '  <div class="tva-modal__error" id="tvaMfaErr"></div>',
            '</div>'
          ].join(''),
          actions: [
            { label: 'Annulla', className: 'btn secondary', onClick: function(){ closeModal(); resolve(null); } },
            { label: 'Verifica', className: 'btn', onClick: function(){
              var code = document.getElementById('tvaMfaCode');
              resolve(code ? String(code.value || '').trim() : '');
            } }
          ],
          onClose: function(){ closeModal(); resolve(null); }
        });

        setTimeout(function(){
          var el = document.getElementById('tvaMfaCode');
          if (el) el.focus();
        }, 50);
      });
    }

    async function ensureMfaAal2IfNeeded(client, opts){
        opts = opts || {};
        var force = !!opts.force;
      try{
        if (!client || !client.auth || !client.auth.mfa) return true;
        var aal = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (!force && (!aal || aal.error)) return true;
        var cur = aal.data ? aal.data.currentLevel : null;
        var next = aal.data ? aal.data.nextLevel : null;
        if (force || (cur === 'aal1' && next === 'aal2')){
          var factor = await getVerifiedTotpFactor(client);
          if (!factor || !factor.id){
            setMessage('2FA attiva ma nessun fattore TOTP trovato.', 'error');
            return false;
          }

          while (true){
            var code = await promptTotpCodeModal({ title: 'Verifica 2FA' });
            if (code === null){
              try{ await client.auth.signOut(); }catch(_e){}
              return false;
            }
            code = String(code || '').replace(/\s+/g,'');
            if (!/^\d{6}$/.test(code)){
              var errEl = document.getElementById('tvaMfaErr');
              if (errEl) errEl.textContent = 'Inserisci un codice valido (6 cifre).';
              continue;
            }

            var ok = false;
            if (client.auth.mfa.challengeAndVerify){
              var v1 = await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code });
              ok = !(v1 && v1.error);
              if (!ok){
                var e1 = document.getElementById('tvaMfaErr');
                if (e1) e1.textContent = (v1 && v1.error && v1.error.message) ? v1.error.message : 'Codice non valido.';
              }
            }else{
              var ch = await client.auth.mfa.challenge({ factorId: factor.id });
              if (ch && ch.error){
                var e2 = document.getElementById('tvaMfaErr');
                if (e2) e2.textContent = ch.error.message || 'Impossibile creare challenge.';
                continue;
              }
              var challengeId = ch && ch.data ? ch.data.id : null;
              var v2 = await client.auth.mfa.verify({ factorId: factor.id, challengeId: challengeId, code: code });
              ok = !(v2 && v2.error);
              if (!ok){
                var e3 = document.getElementById('tvaMfaErr');
                if (e3) e3.textContent = (v2 && v2.error && v2.error.message) ? v2.error.message : 'Codice non valido.';
              }
            }

            if (ok){
              closeModal();
              return true;
            }
          }
        }
        return true;
      }catch(_err){
        return true;
      }
    }

    async function open2faSettings(){
      var client = refreshClient();
      var userRes = await client.auth.getUser();
      var user = userRes.data ? userRes.data.user : null;
      if (!user){
        showToast('Devi essere loggato come admin per gestire la 2FA.', 'error');
        return;
      }

      var TOTP_FRIENDLY_NAME = 'Travirae 2FA';

      var verifiedFactor = await getVerifiedTotpFactor(client);
      if (verifiedFactor && verifiedFactor.id){
        openModal({
          title: 'Sicurezza (2FA)',
          bodyHtml: '<p class="tva-modal__subtitle">2FA attiva. Per disattivarla, conferma con un codice dalla tua app.</p>',
          actions: [
            { label: 'Chiudi', className: 'btn btn-outline', onClick: closeModal },
            { label: 'Disattiva 2FA', className: 'btn btn-danger', onClick: async function(){
                var ok = await promptAndVerifyTotpCode(client, verifiedFactor.id, 'Disattiva 2FA');
                if (!ok) return;

                var un = await client.auth.mfa.unenroll({ factorId: verifiedFactor.id });
                if (un.error){
                  showToast(un.error.message || 'Errore durante disattivazione 2FA', 'error');
                  return;
                }
                closeModal();
                showToast('2FA disattivata.', 'success');
              } }
          ]
        });
        return;
      }

      // Clean stale unverified factors (e.g. user clicked "Annulla")
      await cleanupStaleUnverifiedTotpFactors(client, TOTP_FRIENDLY_NAME);

      openModal({
        title: 'Sicurezza (2FA)',
        bodyHtml: '<p class="tva-modal__subtitle">Proteggi l’accesso admin con un secondo fattore (Authenticator).</p>',
        actions: [
          { label: 'Chiudi', className: 'btn btn-outline', onClick: closeModal },
          { label: 'Abilita 2FA', className: 'btn btn-primary', onClick: async function(){

              // Ensure no verified factor already
              var existing = await getVerifiedTotpFactor(client);
              if (existing && existing.id){
                showToast('2FA già attiva.', 'success');
                open2faSettings();
                return;
              }

              // Clean again before enrolling
              await cleanupStaleUnverifiedTotpFactors(client, TOTP_FRIENDLY_NAME);

              var en = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: TOTP_FRIENDLY_NAME });
              if (en.error){
                var msg = (en.error.message || '').toLowerCase();
                if (msg.includes('friendly') || msg.includes('already exists')){
                  await cleanupStaleUnverifiedTotpFactors(client, TOTP_FRIENDLY_NAME);
                  en = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: TOTP_FRIENDLY_NAME });
                }
              }

              if (en.error){
                showToast(en.error.message || 'Errore durante abilitazione 2FA', 'error');
                return;
              }

              var factorId = en.data && en.data.id;
              var totp = (en.data && en.data.totp) ? en.data.totp : {};
              var qrUrl = normalizeQrToDataUrl(totp.qr_code || totp.qrCode || totp.qr);
              var manualKey = totp.secret || totp.uri || '';

              function cleanupEnroll(){
                closeModal();
                if (factorId){
                  client.auth.mfa.unenroll({ factorId: factorId }).then(function(){});
                }
              }

              openModal({
                title: 'Abilita 2FA',
                bodyHtml:
                  '<div class="tva-modal__stack">'+
                    '<p class="tva-modal__subtitle">1) Scansiona il QR con Google Authenticator / Authy / Microsoft Authenticator.</p>'+
                    '<div class="mfa-qr" id="tvaMfaQrWrap"></div>'+
                    '<p class="tva-muted" id="tvaMfaSecretWrap" style="margin-top:10px; display:none;">Se non puoi scansionare: <code style="user-select:all; word-break:break-all;" id="tvaMfaSecret"></code></p>'+
                    '<p class="tva-modal__subtitle" style="margin-top:12px;">2) Inserisci il codice generato:</p>'+
                    '<div class="tva-modal__field">'+
                      '<label class="tva-modal__label">Codice 2FA</label>'+
                      '<input class="tva-modal__input" id="tvaMfaSetupCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="123456" />'+
                      '<div class="tva-modal__error" id="tvaMfaSetupError" style="display:none;"></div>'+
                    '</div>'+
                  '</div>',
                actions: [
                  { label: 'Annulla', className: 'btn btn-outline', onClick: cleanupEnroll },
                  { label: 'Verifica & Attiva', className: 'btn btn-primary', onClick: async function(){
                      var codeEl = document.getElementById('tvaMfaSetupCode');
                      var errEl = document.getElementById('tvaMfaSetupError');
                      var code = (codeEl && codeEl.value ? codeEl.value : '').trim();
                      if (errEl){ errEl.style.display = 'none'; errEl.textContent = ''; }

                      if (!code){
                        if (errEl){ errEl.style.display = 'block'; errEl.textContent = 'Inserisci il codice 2FA.'; }
                        return;
                      }

                      var ok = await verifyTotpCode(client, factorId, code);
                      if (!ok){
                        if (errEl){ errEl.style.display = 'block'; errEl.textContent = 'Codice non valido. Riprova.'; }
                        return;
                      }

                      closeModal();
                      showToast('2FA attivata!', 'success');
                    } }
                ],
                onClose: cleanupEnroll
              });

              setTimeout(function(){
                try{
                  var qrWrap = document.getElementById('tvaMfaQrWrap');
                  if (qrWrap){
                    qrWrap.innerHTML = '';
                    if (qrUrl){
                      var img = document.createElement('img');
                      img.alt = 'QR 2FA';
                      img.src = qrUrl;
                      img.decoding = 'async';
                      img.loading = 'eager';
                      qrWrap.appendChild(img);
                    } else {
                      var p = document.createElement('p');
                      p.className = 'tva-muted';
                      p.textContent = 'QR non disponibile. Usa la chiave qui sotto.';
                      qrWrap.appendChild(p);
                    }
                  }

                  var secretWrap = document.getElementById('tvaMfaSecretWrap');
                  var secretEl = document.getElementById('tvaMfaSecret');
                  if (secretWrap && secretEl){
                    if (manualKey){
                      secretWrap.style.display = '';
                      secretEl.textContent = manualKey;
                    } else {
                      secretWrap.style.display = 'none';
                    }
                  }
                }catch(e){ console.warn(e); }
              }, 0);

            } }
        ]
      });
    }


    function showDashboard(show){
      if (loginView) loginView.toggleAttribute('hidden', !!show);
      if (dashboardView) dashboardView.toggleAttribute('hidden', !show);
    }

    function isAdminEmail(email){
      var e = String(email || '').toLowerCase().trim();
      return ADMIN_EMAILS.indexOf(e) !== -1;
    }

    function destroyChart(){
      if (state.chart && typeof state.chart.destroy === 'function'){
        state.chart.destroy();
      }
      state.chart = null;
    }

    function renderChart(monthly){
      var canvas = $('#admin-earnings-chart');
      if (!canvas || !window.Chart) return;
      var ctx = canvas.getContext('2d');
      destroyChart();

      var labels = [];
      var affValues = [];
      var travValues = [];
      (monthly || []).forEach(function(r){
        labels.push(formatMonthLabel(r.month));
        affValues.push(Number(r.total_affiliate_earnings || 0));
        travValues.push(Number(r.travirae_margin || 0));
      });

      state.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            { label: 'Payout affiliati', data: affValues, tension: 0.25, fill: false },
            { label: 'Margine Travirae', data: travValues, tension: 0.25, fill: false },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    function safeSetText(el, txt){ if (el) el.textContent = txt; }

    // -----------------------------
    // Newsletter (admin)
    // -----------------------------
    function setNewsletterStatus(message, type){
      if (!newsletterStatusEl) return;
      newsletterStatusEl.textContent = message || '';
      newsletterStatusEl.classList.remove('is-success', 'is-error', 'is-info');
      if (type) newsletterStatusEl.classList.add('is-' + type);
    }

    async function loadNewsletterStats(){
  const totalEl = $('#admin-newsletter-count');
  const LANGS = ['ITA','ENG','ARA','DEU','SPA','RUS','NLD','ZHO','FRA'];
  const perLangEls = {};
  LANGS.forEach(code => {
    perLangEls[code] = document.getElementById(`admin-newsletter-count-${code}`);
  });

  // If the section isn't in DOM, skip
  const hasAnyEl = !!totalEl || LANGS.some(code => !!perLangEls[code]);
  if (!hasAnyEl) return;

  const client = refreshClient();
  if (!client){
    if (totalEl) totalEl.textContent = '—';
    LANGS.forEach(code => { if (perLangEls[code]) perLangEls[code].textContent = '—'; });
    return;
  }

  try{
    const { data, error } = await client
      .from('newsletter_subscribers')
      .select('language')
      .eq('subscribed', true);

    if (error) throw error;

    const counts = {};
    let total = 0;

    (data || []).forEach(row => {
      let lang = row && row.language ? String(row.language).toUpperCase() : 'ITA';
      if (!LANGS.includes(lang)) lang = 'ITA';
      counts[lang] = (counts[lang] || 0) + 1;
      total += 1;
    });

    if (totalEl) totalEl.textContent = String(total);
    LANGS.forEach(code => {
      if (perLangEls[code]) perLangEls[code].textContent = String(counts[code] || 0);
    });
  } catch (err){
    console.error('[admin] newsletter stats error', err);
    if (totalEl) totalEl.textContent = '—';
    LANGS.forEach(code => { if (perLangEls[code]) perLangEls[code].textContent = '—'; });

    try{
      setNewsletterStatus('Errore caricamento newsletter: ' + (err?.message || String(err)), 'error');
    }catch(_){}
  }
}


    function bindNewsletterComposer(){
  const form = $('#admin-newsletter-form');
  if(!form) return;

  const sendBtn = $('#admin-newsletter-send-btn');
  const status = $('#admin-newsletter-status');

  // 9 lingue supportate (codici a 3 caratteri)
  const NL_LANGS = ['ITA','ENG','FRA','DEU','SPA','RUS','NLD','ARA','ZHO'];

  function getVal(id){
    const el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  // Build newsletter content from the 9 language fields.
  // Returns an object like: { ITA: {subject, body}, ENG: {subject, body}, ... }
  function buildNewsletterContent(){
    const contentByLang = {};
    NL_LANGS.forEach(code=>{
      const subject = getVal(`newsletter-subject-${code}`);
      const body = getVal(`newsletter-body-${code}`);
      contentByLang[code] = { subject, body };
    });
    return contentByLang;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();

    const contentByLang = buildNewsletterContent();
    // Edge Function expects: { languages: { CODE: { subject, body } }, fallback?: 'ITA' }
    const payload = { languages: contentByLang, fallback: 'ITA' };

    // Richiede OGGETTO + TESTO per TUTTE le lingue
    const missing = NL_LANGS.filter((code)=>{
      const c = contentByLang[code] || { subject:'', body:'' };
      return (!c.subject || !c.body);
    });
    if(missing.length){
      const msg = 'Compila tutti i campi per continuare.';
      setNewsletterStatus(`${msg} Mancano: ${missing.join(', ')}`, 'error');
      try{
        if (window.TraviraeToast) window.TraviraeToast(msg, 'error');
      }catch(_e){}
      return;
    }

    const ita = contentByLang.ITA || { subject:'', body:'' };

    const totalFilled = NL_LANGS.filter(code=>{
      const c = contentByLang[code];
      return (c && c.subject && c.body);
    }).length;

    const ok = confirm(
      `Inviare la newsletter a tutti gli iscritti?

`+
      `Fallback: ITA
`+
      `Lingue compilate: ${totalFilled}/${NL_LANGS.length}

`+
      `Oggetto (ITA): ${ita.subject}`
    );
    if(!ok) return;

    try{
      if(sendBtn){ sendBtn.disabled = true; sendBtn.textContent = 'Invio...'; }
      setNewsletterStatus('Invio in corso...', 'info');

      const client = refreshClient();
      if(!client) throw new Error('Supabase client non disponibile');

      const resp = await client.functions.invoke('newsletter-send', { body: payload });
      if(resp.error) throw resp.error;
      const data = resp.data || {};

      // Supporta risposta: { total, sent, failed, by_language? }
      const total = data?.total ?? 0;
      const sent = data?.sent ?? 0;
      const failed = data?.failed ?? 0;

      let extra = '';
      if(data?.by_language && typeof data.by_language === 'object'){
        const parts = [];
        for(const [code, obj] of Object.entries(data.by_language)){
          if(!obj) continue;
          const t = obj.total ?? 0;
          const s = obj.sent ?? 0;
          const f = obj.failed ?? 0;
          if(t>0) parts.push(`${code}: ${s}/${t}${f?` (fail ${f})`:''}`);
        }
        if(parts.length) extra = `
Dettaglio: ${parts.join(' · ')}`;
      }

      setNewsletterStatus(`Newsletter inviata.
Totale: ${total} · Inviate: ${sent} · Errori: ${failed}${extra}`, failed ? 'warn' : 'success');

      // refresh stats
      await loadNewsletterStats();
    }catch(err){
      setNewsletterStatus('Errore invio newsletter: ' + (err?.message || String(err)), 'error');
    }finally{
      if(sendBtn){ sendBtn.disabled = false; sendBtn.textContent = 'Invia newsletter'; }
    }
  });

  // --- Mini preview HTML (admin) ---
  (function setupNewsletterPreview(){
    const langSelect = document.getElementById('admin-newsletter-preview-lang');
    const subjectPreviewEl = document.getElementById('admin-newsletter-preview-subject');
    const rawBodyPreviewEl = document.getElementById('admin-newsletter-preview-body');
    const iframeEl = document.getElementById('admin-newsletter-preview-iframe');

    if(!langSelect || !subjectPreviewEl || !iframeEl) return;

    // Popola la select solo se vuota (così l'HTML può anche avere opzioni hardcoded).
    if(langSelect.options.length === 0){
      // Usa la stessa lista di lingue del composer (NL_LANGS), così non dipende da variabili globali.
      (NL_LANGS || []).forEach((code)=>{
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = code;
        langSelect.appendChild(opt);
      });
    }

    // Default: ITA
    if(!langSelect.value){ langSelect.value = 'ITA'; }

    // Helper: escape attribute
    function escapeAttr(str){
      return String(str ?? '')
        .replace(/&/g,'&amp;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;');
    }

    function looksLikeHtml(str){
      return /<[^>]+>/.test(String(str ?? ''));
    }

    function wrapPlainTextToHtml(text){
      const safe = escapeHtml(String(text ?? '')).replace(/\n/g,'<br/>');
      return `<p style="margin:0;color:#111;line-height:1.6;">${safe}</p>`;
    }

    // Replica (in modo leggero) lo stesso wrapper usato dalla Edge Function.
    function buildPreviewEmailHtml(language, subject, bodyRaw){
      const unsubUrl = `https://travirae.com/newsletter-unsubscribe.html?token=PREVIEW_TOKEN&lang=${encodeURIComponent(language || '')}`;
      const safeUnsub = escapeAttr(unsubUrl);

      const raw = (bodyRaw || '').toString();
      const hasPlaceholder = raw.includes('{{UNSUBSCRIBE_URL}}');

      const footer = `
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#6b7280;margin:0;">
          Se non vuoi più ricevere queste email, puoi <a href="${safeUnsub}" target="_blank" rel="noopener">disiscriverti</a>.
        </p>
      `;

      const applyPlaceholder = (html) => html.split('{{UNSUBSCRIBE_URL}}').join(unsubUrl);

      // Se l'utente incolla un documento HTML completo, mostriamolo (iniettando il link di disiscrizione se manca).
      const isFullHtmlDoc = /<!doctype\s+html/i.test(raw) || /<html[\s>]/i.test(raw);
      if(isFullHtmlDoc){
        let html = applyPlaceholder(raw);
        if(!hasPlaceholder){
          if(/<\/body>/i.test(html)){
            html = html.replace(/<\/body>/i, `${footer}\n</body>`);
          }else{
            html = html + footer;
          }
        }
        return html;
      }

      // HTML frammento → render diretto. Testo semplice → render come testo (senza template fisso).
      let contentHtml = '';
      if(looksLikeHtml(raw)){
        contentHtml = applyPlaceholder(raw);
      }else{
        contentHtml = wrapPlainTextToHtml(raw);
      }

      const footerHtml = hasPlaceholder ? '' : footer;

      return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Arial;">
    ${contentHtml}
    ${footerHtml}
  </body>
</html>`;
    }

    function getCurrentLangInputs(lang){
      const subjInput = document.getElementById(`newsletter-subject-${lang}`);
      const bodyInput = document.getElementById(`newsletter-body-${lang}`);
      return {
        subject: subjInput ? (subjInput.value || '').trim() : '',
        body: bodyInput ? (bodyInput.value || '').trim() : ''
      };
    }

    function updatePreview(){
      const lang = (langSelect.value || 'ITA').trim();
      const {subject, body} = getCurrentLangInputs(lang);

      subjectPreviewEl.textContent = subject || '(nessun oggetto)';
      if(rawBodyPreviewEl) rawBodyPreviewEl.value = body || '';

      const wrap = document.getElementById('newsletter-preview-wrap');
      const canPreview = (subject || '').trim().length > 0 && (body || '').trim().length > 0;

      // Mostra l'anteprima solo se OGGETTO e TESTO sono compilati per la lingua selezionata
      if(!canPreview){
        if(wrap) wrap.style.display = 'none';
        iframeEl.srcdoc = '';
        return;
      }

      if(wrap) wrap.style.display = '';
      iframeEl.srcdoc = buildPreviewEmailHtml(lang, subject, body);
    }

    let t;
    function scheduleUpdate(){
      window.clearTimeout(t);
      t = window.setTimeout(updatePreview, 120);
    }

    const clearBtn = q('#admin-newsletter-clear-btn');
      if(clearBtn){
        clearBtn.addEventListener('click', () => {
          NL_LANGS.forEach((lang) => {
            const s = q(`#newsletter-subject-${lang}`);
            const b = q(`#newsletter-body-${lang}`);
            if(s) s.value = '';
            if(b) b.value = '';
          });
          setNewsletterStatus('Bozze cancellate.', 'success');
          updatePreview();
        });
      }

      langSelect.addEventListener('change', updatePreview);
    form.addEventListener('input', scheduleUpdate);
    form.addEventListener('change', scheduleUpdate);
    updatePreview();
  })();

  function setNewsletterStatus(msg, type){
    if(!status) return;
    status.style.display = 'block';
    status.className = 'admin-message ' + (type ? `is-${type}` : '');
    status.textContent = msg;
  }
}

function clearTbody(tbody){
      if (!tbody) return;
      while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    }

    function td(text){
      var cell = document.createElement('td');
      cell.textContent = text;
      return cell;
    }

    function renderMonthlyTable(rows){
      if (!tbodyMonthly) return;
      clearTbody(tbodyMonthly);
      if (!rows || !rows.length){
        var tr0 = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.colSpan = 5;
        td0.className = 'muted small';
        td0.textContent = 'Nessun dato disponibile.';
        tr0.appendChild(td0);
        tbodyMonthly.appendChild(tr0);
        return;
      }

      rows.forEach(function(r){
        var tr = document.createElement('tr');
        tr.appendChild(td(formatMonthLabel(r.month)));
        tr.appendChild(td(String(r.total_sales || 0)));
        tr.appendChild(td(formatUsd(r.total_net_commissions || 0)));
        tr.appendChild(td(formatUsd(r.total_affiliate_earnings || 0)));
        tr.appendChild(td(formatUsd(r.travirae_margin || 0)));
        tbodyMonthly.appendChild(tr);
      });
    }

    function renderAffiliatesSummaryTable(rows){
      if (!tbodyAffiliates) return;
      clearTbody(tbodyAffiliates);
      if (!rows || !rows.length){
        var tr0 = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.colSpan = 5;
        td0.className = 'muted small';
        td0.textContent = 'Nessun dato disponibile.';
        tr0.appendChild(td0);
        tbodyAffiliates.appendChild(tr0);
        return;
      }

      rows.forEach(function(r){
        var tr = document.createElement('tr');
        var slugLabel = String(r.affiliate_slug || '');
        if (slugLabel === 'direct') slugLabel = 'Traffico diretto (senza affiliato)';
        tr.appendChild(td(slugLabel));
        tr.appendChild(td(String(r.total_sales || 0)));
        tr.appendChild(td(formatUsd(r.total_net_commissions || 0)));
        tr.appendChild(td(formatUsd(r.total_affiliate_earnings || 0)));
        tr.appendChild(td(formatUsd(r.travirae_margin || 0)));
        tbodyAffiliates.appendChild(tr);
      });
    }

    function renderOperationalTable(rows){
      if (!tbodyOperational) return;
      clearTbody(tbodyOperational);
      if (!rows || !rows.length){
        var tr0 = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.colSpan = 12;
        td0.className = 'muted small';
        td0.textContent = 'Nessun dato disponibile.';
        tr0.appendChild(td0);
        tbodyOperational.appendChild(tr0);
        return;
      }

      rows.forEach(function(r){
        var tr = document.createElement('tr');
        var sharePct = '';
        if (r.share_percent_month != null){
          var sp = Number(r.share_percent_month);
          if (!isFinite(sp)) sp = 0;
          sharePct = (sp * 100).toFixed(0) + '%';
        }
        var lastActivity = r.last_activity_at ? formatDateTime(r.last_activity_at) : '';

        tr.appendChild(td(String(r.affiliate_slug || '')));
        tr.appendChild(td(String(r.email || '')));
        tr.appendChild(td(String(r.total_clicks || 0)));
        tr.appendChild(td(String(r.booking_clicks_total || 0)));
        tr.appendChild(td(String(r.booking_clicks_aviasales || 0)));
        tr.appendChild(td(String(r.booking_clicks_stay22 || 0)));
        tr.appendChild(td(String(r.sales_count_month || 0)));
        tr.appendChild(td(sharePct));
        tr.appendChild(td(formatUsd(r.affiliate_earnings_month || 0)));
        tr.appendChild(td(formatUsd(r.available_balance_usd || 0)));
        tr.appendChild(td((r.pending_payout_count ? (r.pending_payout_count + ' (' + formatMoney(r.pending_payout_amount_usd || 0) + ' USD)') : '0')));
        tr.appendChild(td(lastActivity));

        tbodyOperational.appendChild(tr);
      });
    }

    function statusBadge(status){
      var s = String(status || '').toLowerCase();
      if (!s) s = 'pending';
      if (s === 'paid') return '✅ pagato';
      if (s === 'approved') return '🟦 approvato';
      if (s === 'rejected') return '❌ rifiutato';
      return '⏳ in attesa';
    }

    function renderPayoutRequestsTable(rows){
      if (!tbodyPayoutRequests) return;
      clearTbody(tbodyPayoutRequests);
      if (!rows || !rows.length){
        var tr0 = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.colSpan = 7;
        td0.className = 'muted small';
        td0.textContent = 'Nessuna richiesta pagamento.';
        tr0.appendChild(td0);
        tbodyPayoutRequests.appendChild(tr0);
        return;
      }

      rows.forEach(function(r){
        var tr = document.createElement('tr');

        var detailsCell = document.createElement('td');
        var details = document.createElement('details');
        var summary = document.createElement('summary');
        summary.textContent = 'Vedi';
        details.appendChild(summary);
        var pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.maxWidth = '540px';
        pre.textContent = JSON.stringify(r.payout_snapshot || {}, null, 2);
        details.appendChild(pre);
        detailsCell.appendChild(details);

        var actionsCell = document.createElement('td');
        actionsCell.style.whiteSpace = 'nowrap';

        var s = String(r.status || 'pending').toLowerCase();

        function makeAction(label, newStatus){
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'btn secondary';
          b.style.padding = '.45rem .75rem';
          b.style.fontSize = '.85rem';
          b.textContent = label;
          b.addEventListener('click', async function(){
            await updatePayoutRequestStatus(r.id, newStatus);
          });
          return b;
        }

        if (s === 'pending'){
          actionsCell.appendChild(makeAction('Approva', 'approved'));
          actionsCell.appendChild(makeAction('Rifiuta', 'rejected'));
          actionsCell.appendChild(makeAction('Segna pagato', 'paid'));
        } else if (s === 'approved'){
          actionsCell.appendChild(makeAction('Segna pagato', 'paid'));
          actionsCell.appendChild(makeAction('Rifiuta', 'rejected'));
        } else {
          var small = document.createElement('span');
          small.className = 'muted small';
          small.textContent = '—';
          actionsCell.appendChild(small);
        }

        tr.appendChild(td(formatDateTime(r.requested_at)));
        tr.appendChild(td(String(r.affiliate_slug || '')));
        tr.appendChild(td(formatUsd(r.amount_usd || 0)));
        tr.appendChild(td(String(r.method || '')));
        tr.appendChild(td(statusBadge(r.status)));
        tr.appendChild(detailsCell);
        tr.appendChild(actionsCell);

        tbodyPayoutRequests.appendChild(tr);
      });
    }

    async function updatePayoutRequestStatus(id, newStatus){
      var client = refreshClient();
      if (!client || !client.from) return;

      var status = String(newStatus || '').toLowerCase();
      if (!id || !status) return;

      var note = window.prompt('Note admin (opzionale):', '') || '';

      var patch = {
        status: status,
        admin_notes: note || null,
        processed_by: state.user ? state.user.id : null,
      };
      if (status === 'paid' || status === 'rejected'){
        patch.processed_at = new Date().toISOString();
      }

      setMessage('Aggiornamento richiesta...', null);
      try{
        var resp = await client.from('payout_requests').update(patch).eq('id', id);
        if (resp.error){
          console.error(resp.error);
          setMessage('Errore aggiornando richiesta: ' + (resp.error.message || 'unknown'), 'error');
          return;
        }
        setMessage('Richiesta aggiornata.', 'success');
        await loadAll();
      }catch(e){
        console.error(e);
        setMessage('Errore imprevisto aggiornando richiesta.', 'error');
      }
    }

    async function loadSiteTraffic(){
      var client = refreshClient();
      if (!client || !client.from) return;

      try{
        var resp = await client
          .from('admin_site_traffic_summary')
          .select('*')
          .maybeSingle();

        if (resp.error){
          console.warn('Errore caricamento admin_site_traffic_summary', resp.error);
          return;
        }

        var d = resp.data || {};
        safeSetText(elTrafficVisits, String(d.visits_month ?? '0'));
        safeSetText(elTrafficPageviews, String(d.pageviews_month ?? '0'));
        safeSetText(elTrafficVisitsAffiliate, String(d.visits_affiliate_month ?? '0'));
        safeSetText(elTrafficVisitsDirect, String(d.visits_direct_month ?? '0'));
      }catch(e){
        console.warn('Errore imprevisto loadSiteTraffic', e);
      }
    }

    // Totali booking click (mese corrente): include click da affiliati e "direct" (senza affiliato)
    async function loadBookingClickSummary(){
      var client = refreshClient();
      if (!client || !client.from) return;

      // Default (se qualcosa va storto, mostriamo comunque 0)
      safeSetText(elBClickTotal, '0');
      safeSetText(elBClickAffiliate, '0');
      safeSetText(elBClickDirect, '0');

      // Range mese corrente (UTC) in ISO, coerente con booked_at (ISO) inserito dal sito
      var now = new Date();
      var start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
      var end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
      var startIso = start.toISOString();
      var endIso = end.toISOString();

      try {
        var totalResp = await client
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'click')
          .gte('booked_at', startIso)
          .lt('booked_at', endIso);

        var affiliateResp = await client
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'click')
          .neq('affiliate_slug', 'direct')
          .gte('booked_at', startIso)
          .lt('booked_at', endIso);

        var directResp = await client
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'click')
          .eq('affiliate_slug', 'direct')
          .gte('booked_at', startIso)
          .lt('booked_at', endIso);

        safeSetText(elBClickTotal, String(totalResp.count || 0));
        safeSetText(elBClickAffiliate, String(affiliateResp.count || 0));
        safeSetText(elBClickDirect, String(directResp.count || 0));
      } catch (e) {
        console.warn('loadBookingClickSummary error', e);
        safeSetText(elBClickTotal, '0');
        safeSetText(elBClickAffiliate, '0');
        safeSetText(elBClickDirect, '0');
      }
    }

    async function loadAggregates(){
      var client = refreshClient();
      if (!client || !client.from) return;

      // Monthly aggregate (from monthly_affiliate_payouts)
      var resp = await client
        .from('monthly_affiliate_payouts')
        .select('affiliate_slug,month,sales_count,net_commissions,affiliate_earnings,share_percent')
        .order('month', { ascending: true });

      if (resp.error){
        console.warn('Errore caricamento monthly_affiliate_payouts', resp.error);
        return { monthly: [], affiliates: [] };
      }

      var rows = Array.isArray(resp.data) ? resp.data : [];

      // Build aggregates
      var byMonth = {};
      var byAffiliate = {};

      rows.forEach(function(r){
        var monthKey = String(r.month);
        if (!byMonth[monthKey]){
          byMonth[monthKey] = { month: r.month, total_sales: 0, total_net_commissions: 0, total_affiliate_earnings: 0 };
        }
        byMonth[monthKey].total_sales += Number(r.sales_count || 0);
        byMonth[monthKey].total_net_commissions += Number(r.net_commissions || 0);
        byMonth[monthKey].total_affiliate_earnings += Number(r.affiliate_earnings || 0);

        var slug = r.affiliate_slug;
        if (!byAffiliate[slug]){
          byAffiliate[slug] = { affiliate_slug: slug, total_sales: 0, total_net_commissions: 0, total_affiliate_earnings: 0 };
        }
        byAffiliate[slug].total_sales += Number(r.sales_count || 0);
        byAffiliate[slug].total_net_commissions += Number(r.net_commissions || 0);
        byAffiliate[slug].total_affiliate_earnings += Number(r.affiliate_earnings || 0);
      });

      var monthly = Object.keys(byMonth).sort().map(function(k){
        var x = byMonth[k];
        x.travirae_margin = (x.total_net_commissions - x.total_affiliate_earnings);
        return x;
      });

      var affiliates = Object.keys(byAffiliate).sort().map(function(k){
        var x = byAffiliate[k];
        x.travirae_margin = (x.total_net_commissions - x.total_affiliate_earnings);
        return x;
      });

      // Chiave mese corrente nel formato YYYY-MM-01 (coerente con Postgres DATE)
      var now = new Date();
      var monthStartKey = String(now.getFullYear()) + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';

      // KPI: mese corrente (coerente con le label UI)
      var monthSales = 0;
      var monthNet = 0;
      var monthAff = 0;

      // KPI: vendite/commissioni “dirette” (senza affiliato)
      var directSales = 0;
      var directNet = 0;

      // Tabelle/aggregati
      var totalByMonth = {};
      var byAffiliate = {};

      rows.forEach(function(r){
        var rMonth = String(r.month || '');
        var rSales = Number(r.sales_count || 0);
        var rNet = Number(r.net_commissions || 0);
        var rAff = Number(r.affiliate_earnings || 0);
        var rSlug = String(r.affiliate_slug || '');

        // KPI mese corrente
        if (String(rMonth).slice(0,10) === monthStartKey){
          monthSales += rSales;
          monthNet += rNet;
          monthAff += rAff;

          if (rSlug === 'direct'){
            directSales += rSales;
            directNet += rNet;
          }
        }

        // By month (per tabella)
        if (!totalByMonth[rMonth]){
          totalByMonth[rMonth] = { sales: 0, net: 0, affiliate: 0 };
        }
        totalByMonth[rMonth].sales += rSales;
        totalByMonth[rMonth].net += rNet;
        totalByMonth[rMonth].affiliate += rAff;

        // By affiliate (per tabella)
        if (!byAffiliate[rSlug]){
          byAffiliate[rSlug] = { sales: 0, net: 0, affiliate: 0, months: {} };
        }
        byAffiliate[rSlug].sales += rSales;
        byAffiliate[rSlug].net += rNet;
        byAffiliate[rSlug].affiliate += rAff;
        byAffiliate[rSlug].months[rMonth] = { sales: rSales, net: rNet, affiliate: rAff };
      });

      safeSetText(elTotalSales, String(monthSales));
      safeSetText(elTotalNet, formatUsd(monthNet));
      safeSetText(elTotalAff, formatUsd(monthAff));
      safeSetText(elTotalTrav, formatUsd(monthNet - monthAff));

      safeSetText(elDirectSales, String(directSales));
      safeSetText(elDirectNet, formatUsd(directNet));

      renderMonthlyTable(monthly);
      renderAffiliatesSummaryTable(affiliates);
      renderChart(monthly);

      return { monthly: monthly, affiliates: affiliates };
    }

    async function loadOperationalOverview(){
      var client = refreshClient();
      if (!client || !client.from) return;

      // View: admin_affiliate_overview
      var resp = await client
        .from('admin_affiliate_overview')
        .select('*')
        .order('available_balance_usd', { ascending: false });

      if (resp.error){
        console.warn('Errore caricamento admin_affiliate_overview', resp.error);
        return;
      }
      renderOperationalTable(resp.data || []);
    }

    async function loadPayoutRequests(){
      var client = refreshClient();
      if (!client || !client.from) return;

      var resp = await client
        .from('payout_requests')
        .select('id,affiliate_slug,amount_usd,method,status,requested_at,processed_at,payout_snapshot,admin_notes')
        .order('requested_at', { ascending: false })
        .limit(100);

      if (resp.error){
        console.warn('Errore caricamento payout_requests', resp.error);
        return;
      }
      renderPayoutRequestsTable(resp.data || []);
    }

    async function loadAll(){
      await loadAggregates();
      await loadSiteTraffic();
      await loadBookingClickSummary();
      await loadOperationalOverview();
      await loadPayoutRequests();
      await loadNewsletterStats();
    }

    async function runImportTravelpayouts(){
      var client = refreshClient();
      if (!client || !client.functions || !client.auth) return;

      setMessage('Import in corso (Aviasales)...', null);
      try{
        // days = 45 default
        var resp = await client.functions.invoke('import-travelpayouts', { body: { days: 45, campaign_id: 100 } });
        if (resp.error){
          console.error(resp.error);
          setMessage('Errore import: ' + (resp.error.message || 'unknown'), 'error');
          return;
        }
        setMessage('Import completato. Aggiorno dashboard...', 'success');
        // Refresh materialized table (best effort)
        try{ await client.rpc('refresh_monthly_affiliate_payouts'); }catch(_){ }
        await loadAll();
      }catch(e){
        console.error(e);
        setMessage('Errore imprevisto durante import.', 'error');
      }
    }

    async function runRefreshPayouts(){
      var client = refreshClient();
      if (!client || !client.rpc) return;
      setMessage('Aggiornamento payouts...', null);
      try{
        var resp = await client.rpc('refresh_monthly_affiliate_payouts');
        if (resp && resp.error){
          setMessage('Errore refresh: ' + (resp.error.message || 'unknown'), 'error');
          return;
        }
        setMessage('Payouts aggiornati.', 'success');
        await loadAll();
      }catch(e){
        console.error(e);
        setMessage('Errore imprevisto durante refresh.', 'error');
      }
    }

    // ---- Stay22 CSV import (fallback manuale) ----
    function parseCSV(text){
      // Parser semplice (supporta , o ; e virgolette base)
      var lines = String(text || '').replace(/\r/g,'').split('\n').filter(function(l){ return l.trim() !== ''; });
      if (!lines.length) return { headers: [], rows: [] };

      function splitLine(line, sep){
        var out = [];
        var cur = '';
        var inQ = false;
        for (var i=0;i<line.length;i++){
          var ch = line[i];
          if (ch === '"'){
            if (inQ && line[i+1] === '"'){
              cur += '"';
              i++;
            }else{
              inQ = !inQ;
            }
          }else if (!inQ && ch === sep){
            out.push(cur);
            cur = '';
          }else{
            cur += ch;
          }
        }
        out.push(cur);
        return out;
      }

      var sep = lines[0].indexOf(';') !== -1 && lines[0].indexOf(',') === -1 ? ';' : ',';
      var headers = splitLine(lines[0], sep).map(function(h){ return h.trim().replace(/^"|"$/g,''); });

      var rows = [];
      for (var i=1;i<lines.length;i++){
        var cols = splitLine(lines[i], sep);
        var obj = {};
        headers.forEach(function(h, idx){
          obj[h] = (cols[idx] != null ? String(cols[idx]).trim().replace(/^"|"$/g,'') : '');
        });
        rows.push(obj);
      }

      return { headers: headers, rows: rows };
    }

    async function importStay22CSV(file){
      var client = refreshClient();
      if (!client || !client.from) return;
      if (!file) return;

      setMessage('Leggo CSV...', null);

      var text = await new Promise(function(resolve, reject){
        var r = new FileReader();
        r.onload = function(){ resolve(String(r.result || '')); };
        r.onerror = function(){ reject(new Error('read error')); };
        r.readAsText(file);
      });

      var parsed = parseCSV(text);
      if (!parsed.rows.length){
        setMessage('CSV vuoto o non valido.', 'error');
        return;
      }

      // CSV supportati:

      // A) Formato normalizzato (colonne: affiliate_slug, partner_reference, status, booked_at, commission_partner, amount, currency)

      // B) Export Stay22 Hub (esempi colonne: Campaign ID, Transaction ID, Transaction Date, Transaction Status, Payment Status, Commission (USD), ...)

      function normKey(k){ return String(k||'').trim().toLowerCase(); }
      var headersLower = parsed.headers.map(normKey);

      function pick(obj, keys){
        for (var i=0;i<keys.length;i++){
          var k = normKey(keys[i]);
          var idx = headersLower.indexOf(k);
          if (idx !== -1){
            var realKey = parsed.headers[idx];
            return obj[realKey];
          }
        }
        return '';
      }

      function toNumber(v){
        if (v == null) return null;
        var s = String(v).trim();
        if (!s) return null;
        s = s.replace(/[^0-9,\.\-]/g, '');
        if (!s) return null;
        if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) s = s.replace(',', '.');
        if (s.indexOf(',') !== -1 && s.indexOf('.') !== -1) s = s.replace(/,/g, '');
        var n = Number(s);
        return isFinite(n) ? n : null;
      }

      function mapStay22Status(transactionStatus, paymentStatus){
        var t = String(transactionStatus || '').trim().toLowerCase();
        var p = String(paymentStatus || '').trim().toLowerCase();
        if (t.includes('cancel')) return 'cancelled';
        if (t.includes('canceled')) return 'cancelled';
        if (t.includes('approved')) return 'confirmed';
        if (t.includes('confirmed')) return 'confirmed';
        if (t.includes('pending')) return 'pending';
        if (p.includes('paid') || p.includes('ready')) return 'confirmed';
        return 'confirmed';
      }

      var rows = parsed.rows.map(function(r){
        var affiliateSlug = String(pick(r, ['affiliate_slug','campaign id','campaign','campaign_id'])).trim();
        if (!affiliateSlug) affiliateSlug = 'direct';
        var partnerRef = String(pick(r, ['partner_reference','transaction id','transaction_id','booking id','id'])).trim();
        var bookedAt = String(pick(r, ['booked_at','transaction date','transaction_date','date'])).trim();
        var transactionStatus = String(pick(r, ['status','transaction status','transaction_status'])).trim();
        var paymentStatus = String(pick(r, ['payment status','payment_status'])).trim();
        var status = mapStay22Status(transactionStatus, paymentStatus);

        var amount = toNumber(pick(r, ['amount','total','total amount','sale amount','price']));
        var commission = toNumber(pick(r, ['commission_partner','commission (usd)','commission usd','commission']));

        var currency = String(pick(r, ['currency','currency code'])).trim().toUpperCase() || 'USD';
        if (!currency) currency = 'USD';

        return {
          affiliate_slug: affiliateSlug,
          partner: 'stay22',
          partner_reference: partnerRef,
          status: status,
          booked_at: bookedAt,
          confirmed_at: (status === 'confirmed' ? (bookedAt || new Date().toISOString()) : null),
          currency: currency,
          amount: amount,
          commission_partner: commission,
          metadata: r,
        };
      }).filter(function(r){
        return r.partner_reference;
      });

      if (!rows.length){
        setMessage('CSV non compatibile: non trovo righe valide. Assicurati che nel CSV ci siano almeno Campaign ID (o affiliate_slug) e Transaction ID (o partner_reference).', 'error');
        return;
      }
      setMessage('Import CSV Stay22: upsert in corso...', null);

      // chunked upsert
      var chunkSize = 200;
      for (var i=0;i<rows.length;i+=chunkSize){
        var chunk = rows.slice(i, i+chunkSize);
        var up = await client.from('bookings').upsert(chunk, { onConflict: 'partner,partner_reference' });
        if (up.error){
          console.error(up.error);
          setMessage('Errore import CSV: ' + (up.error.message || 'unknown'), 'error');
          return;
        }
      }

      try{ await client.rpc('refresh_monthly_affiliate_payouts'); }catch(_){ }

      setMessage('CSV importato. Dashboard aggiornata.', 'success');
      await loadAll();
    }

    function startRealtime(){
      var client = refreshClient();
      if (!client || !client.channel) return;

      try{
        if (state.realtimeChannel){
          try{
            if (typeof state.realtimeChannel.unsubscribe === 'function') state.realtimeChannel.unsubscribe();
            if (typeof client.removeChannel === 'function') client.removeChannel(state.realtimeChannel);
          }catch(_){ }
        }
      }catch(_){ }

      try{
        state.realtimeChannel = client
          .channel('travirae-admin-affiliates')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payout_requests' }, function(){
            loadPayoutRequests();
            loadOperationalOverview();
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'affiliate_clicks' }, function(){
            loadOperationalOverview();
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, function(){
            loadOperationalOverview();
          })
          .subscribe();
      }catch(e){
        console.warn('Realtime non disponibile o non configurato', e);
      }
    }

    function startAutoRefresh(){
      if (state.refreshTimer) clearInterval(state.refreshTimer);
      state.refreshTimer = setInterval(function(){
        loadOperationalOverview();
        loadPayoutRequests();
      }, 30000);
    }

    function stopAutoRefresh(){
      if (state.refreshTimer){
        clearInterval(state.refreshTimer);
        state.refreshTimer = null;
      }
      var client = refreshClient();
      if (client && state.realtimeChannel){
        try{
          if (typeof state.realtimeChannel.unsubscribe === 'function') state.realtimeChannel.unsubscribe();
          if (typeof client.removeChannel === 'function') client.removeChannel(state.realtimeChannel);
        }catch(_){ }
      }
      state.realtimeChannel = null;
    }

    // ---- Auth ----
    async function initSession(){
      var client = refreshClient();
      if (!client || !client.auth) return;

      try{
        var resp = await client.auth.getUser();
        if (resp && resp.data && resp.data.user && isAdminEmail(resp.data.user.email)){
          state.user = resp.data.user;

          // 2FA (TOTP): se attiva per l'admin, richiedi il codice ad ogni accesso (per sessione/tab),
// anche se la sessione Supabase è già AAL2 (es: "Ricordami" / sessione persistente).
          var accessKey = 'travirae_mfa_access_ok_admin_' + state.user.id;
          var alreadyVerified = false;
          try { alreadyVerified = sessionStorage.getItem(accessKey) === '1'; } catch(e) { alreadyVerified = false; }

          if (!alreadyVerified){
            var mfaOk = await ensureMfaAal2IfNeeded(client, { force: true });
            if (!mfaOk){
              state.user = null;
              showDashboard(false);
              return;
            }
            try { sessionStorage.setItem(accessKey, '1'); } catch(e) {}
          }
showDashboard(true);
          setMessage('', null);
          await loadAll();
          startRealtime();
          startAutoRefresh();
        }else{
          showDashboard(false);
        }
      }catch(e){
        console.warn(e);
        showDashboard(false);
      }
    }

    if (loginForm){
      loginForm.addEventListener('submit', async function(e){
        e.preventDefault();
        setMessage('', null);
        var client = refreshClient();
        if (!client || !client.auth){
          setMessage('Supabase Auth non disponibile.', 'error');
          return;
        }
        var email = ($('#admin-email') || {}).value || '';
        var password = ($('#admin-password') || {}).value || '';
        try{
          var res = await client.auth.signInWithPassword({ email: email, password: password });
          if (res.error){
            setMessage(res.error.message || 'Errore login.', 'error');
            return;
          }
          var u = res.data && res.data.user ? res.data.user : (res.data && res.data.session && res.data.session.user ? res.data.session.user : null);
          if (!u || !isAdminEmail(u.email)){
            // logout immediato
            try{ await client.auth.signOut(); }catch(_){ }
            setMessage('Questo account non è admin.', 'error');
            return;
          }
          state.user = u;

          // 2FA (TOTP): se attiva per l'admin, richiedi il codice ad ogni accesso (per sessione/tab),
// anche se la sessione Supabase è già AAL2 (es: "Ricordami" / sessione persistente).
          var accessKey = 'travirae_mfa_access_ok_admin_' + state.user.id;
          var alreadyVerified = false;
          try { alreadyVerified = sessionStorage.getItem(accessKey) === '1'; } catch(e) { alreadyVerified = false; }

          if (!alreadyVerified){
            var mfaOk = await ensureMfaAal2IfNeeded(client, { force: true });
            if (!mfaOk){
              state.user = null;
              showDashboard(false);
              return;
            }
            try { sessionStorage.setItem(accessKey, '1'); } catch(e) {}
          }
showDashboard(true);
          setMessage('Accesso admin effettuato.', 'success');
          await loadAll();
          startRealtime();
          startAutoRefresh();
        }catch(err){
          console.error(err);
          setMessage('Errore imprevisto durante login.', 'error');
        }
      });
    }

    if (logoutBtn){
      logoutBtn.addEventListener('click', async function(){
        stopAutoRefresh();
        var client = refreshClient();
        if (client && client.auth){
          try{ await client.auth.signOut(); }catch(_){ }
        }
        state.user = null;
        destroyChart();
        showDashboard(false);
        setMessage('Logout effettuato.', 'success');
      });
    }

    if (reloadBtn){
      reloadBtn.addEventListener('click', function(){
        loadAll();
      });
    }

    if (importBtn){
      importBtn.addEventListener('click', function(){
        runImportTravelpayouts();
      });
    }

    if (refreshPayoutsBtn){
      refreshPayoutsBtn.addEventListener('click', function(){
        runRefreshPayouts();
      });
    }

    if (stay22CsvBtn && stay22CsvInput){
      stay22CsvBtn.addEventListener('click', function(){
        stay22CsvInput.click();
      });
      stay22CsvInput.addEventListener('change', function(){
        var file = stay22CsvInput.files && stay22CsvInput.files[0] ? stay22CsvInput.files[0] : null;
        stay22CsvInput.value = '';
        if (file) importStay22CSV(file);
      });
    }

    if (btn2fa){
      btn2fa.addEventListener('click', function(){
        open2faSettings();
      });
    }

    bindNewsletterComposer();

    initSession();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
