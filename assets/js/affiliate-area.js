// Travirae - Area Affiliati (auth + dashboard)
(function(){
  'use strict';

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // Email language preference (used by Supabase Auth email templates via user_metadata.language)
  const EMAIL_LANG_STORAGE_KEY = 'travirae_email_lang';
  const EMAIL_LANG_DEFAULT = 'ITA';

  function getEmailLang(){
    try{
      const v = localStorage.getItem(EMAIL_LANG_STORAGE_KEY);
      return (v && typeof v === 'string') ? v : EMAIL_LANG_DEFAULT;
    }catch(_e){
      return EMAIL_LANG_DEFAULT;
    }
  }

  function setEmailLang(lang){
    const safe = (lang && typeof lang === 'string') ? lang : EMAIL_LANG_DEFAULT;
    try{ localStorage.setItem(EMAIL_LANG_STORAGE_KEY, safe); }catch(_e){}
    // Keep all language selects in sync
    $all('select[data-lang-select]').forEach((sel) => { sel.value = safe; });
  }

  function initEmailLangSelect(){
    const selects = $all('select[data-lang-select]');
    if (!selects.length) return;

    const initial = getEmailLang();
    selects.forEach((sel) => { sel.value = initial; });

    selects.forEach((sel) => {
      sel.addEventListener('change', () => {
        setEmailLang(sel.value);
      });
    });
  }

  function init(){
    if (!document.body.classList.contains('page--affiliate-portal')) return;

    var AUTH_MODE_KEY = 'tva_aff_auth_mode'; // sessionStorage key
    function getAuthMode(){
      try{ return window.sessionStorage.getItem(AUTH_MODE_KEY) || 'persist'; }catch(e){ return 'persist'; }
    }
    function setAuthMode(mode){
      try{
        if (mode === 'session') window.sessionStorage.setItem(AUTH_MODE_KEY,'session');
        else window.sessionStorage.removeItem(AUTH_MODE_KEY);
      }catch(e){}
    }
    function selectClient(mode){
      if (mode === 'session' && window.supabaseClientSession) return window.supabaseClientSession;
      return window.supabaseClient || null;
    }

    var supa = selectClient(getAuthMode()) || window.supabaseClient || null;
    var state = {
      user: null,
      affiliate: null,
      slug: null,
      chart: null,
      refreshTimer: null,
      realtimeChannel: null,
      payoutUIBound: false,
      availableBalance: 0,
    };

    // Init email language selector (persisted in localStorage)
    initEmailLangSelect();

    // ---- Views / DOM ----
    var tabsContainer = $('.auth-tabs');
    var tabButtons = $all('.auth-tab');

    var views = {
      login: $('.auth-view-login'),
      register: $('.auth-view-register'),
      forgot: $('.auth-view-forgot'),
      recovery: $('.auth-view-recovery'),
      dashboard: $('.auth-view-dashboard')
    };

    // Intro (testo sopra la card). Serve solo prima del login.
    // In dashboard lo nascondiamo per non occupare spazio.
    var introEl = $('.affiliate-intro');

    // Card principale: ridimensioniamo in base alla vista (auth vs dashboard)
    var authCard = $('.auth-card');

    var authMessageEl = $('#affiliate-auth-message');
    var logoutBtn = $('#affiliate-logout-btn');
    var btn2fa = $('#affiliate-2fa-btn');

    // Dashboard DOM
    var elSlug = $('#affiliate-slug');
    var elLinkInput = $('#affiliate-link-input');
    var elCopyBtn = $('#affiliate-copy-btn');

    var elClicks = $('#affiliate-stat-clicks');
    var elBookingClicks = $('#affiliate-stat-bookings');
    var elTotal = $('#affiliate-stat-total');
    var elMonth = $('#affiliate-stat-month');

    var elTierPercent = $('#affiliate-share-percent');
    var elTierSales = $('#affiliate-tier-sales');
    var elTierNext = $('#affiliate-tier-next');
    var elTierProgress = $('#affiliate-tier-progress');

    var elAvailableBalance = $('#affiliate-available-balance');
    var btnOpenPayoutForm = $('#affiliate-open-payout-form-btn');
    var payoutFormWrap = $('#affiliate-payout-form-wrap');
    var payoutForm = $('#affiliate-payout-form');
    var payoutCancelBtn = $('#affiliate-cancel-payout-form-btn');

    var payoutRequestsTbody = $('#affiliate-payout-requests-tbody');

    function refreshClient(){
      // Scegli client in base alla modalità auth:
      // - persist (default): resta loggato (localStorage)
      // - session: resta loggato finché il browser resta aperto (sessionStorage)
      supa = selectClient(getAuthMode()) || supa || window.supabaseClient || null;
      return supa;
    }

    // ---- Popup / Toast (per feedback utente) ----
    var toastEl = null;
    var toastMsgEl = null;
    var toastCloseEl = null;
    var toastTimer = null;
    var toastKeydownBound = false;

    function ensureToast(){
      if (toastEl) return toastEl;

      toastEl = document.getElementById('tva-toast');
      if (toastEl){
        toastMsgEl = toastEl.querySelector('.tva-toast__message');
        toastCloseEl = toastEl.querySelector('.tva-toast__close');
        if (toastCloseEl && !toastCloseEl.__bound){
          toastCloseEl.__bound = true;
          toastCloseEl.addEventListener('click', hideToast);
        }
      } else {
        toastEl = document.createElement('div');
        toastEl.id = 'tva-toast';
        toastEl.className = 'tva-toast';
        toastEl.innerHTML = ''+
          '<div class="tva-toast__inner" role="alert" aria-live="polite">'+
            '<div class="tva-toast__message"></div>'+
            '<button type="button" class="tva-toast__close" aria-label="Chiudi">×</button>'+
          '</div>';
        document.body.appendChild(toastEl);

        toastMsgEl = toastEl.querySelector('.tva-toast__message');
        toastCloseEl = toastEl.querySelector('.tva-toast__close');
        if (toastCloseEl) toastCloseEl.addEventListener('click', hideToast);
      }

      if (!toastKeydownBound){
        toastKeydownBound = true;
        document.addEventListener('keydown', function(e){
          if (e.key === 'Escape') hideToast();
        });
      }

      return toastEl;
    }

    function hideToast(){
      if (!toastEl) toastEl = document.getElementById('tva-toast');
      if (!toastEl) return;
      toastEl.classList.remove('is-visible','is-success','is-error','is-info');
      if (toastTimer){
        clearTimeout(toastTimer);
        toastTimer = null;
      }
    }

    function showToast(text, type){
      ensureToast();
      if (!toastEl || !toastMsgEl) return;

      toastMsgEl.textContent = String(text || '');
      toastEl.classList.remove('is-success','is-error','is-info');

      if (type === 'error') toastEl.classList.add('is-error');
      else if (type === 'success') toastEl.classList.add('is-success');
      else toastEl.classList.add('is-info');

      toastEl.classList.add('is-visible');

      if (toastTimer) clearTimeout(toastTimer);
      // Auto-hide, ma l'utente può chiuderlo con la X
      toastTimer = setTimeout(hideToast, 5000);
    }

    function setMessage(text, type){
      // Manteniamo un elemento aria-live per accessibilità, ma il feedback visivo è un popup.
      if (authMessageEl){
        authMessageEl.textContent = text || '';
        authMessageEl.classList.remove('is-error','is-success');
        if (type === 'error') authMessageEl.classList.add('is-error');
        else if (type === 'success') authMessageEl.classList.add('is-success');
      }

      if (!text){
        hideToast();
        return;
      }
      showToast(text, type);
    }

    // ============================================================
    // Modal helper (usato per 2FA)
    // ============================================================

    var modalEl = null;

    function ensureModal(){
      if (modalEl) return modalEl;
      modalEl = document.createElement('div');
      modalEl.className = 'tva-modal';
      modalEl.innerHTML = ''+
        '<div class="tva-modal__card" role="dialog" aria-modal="true">'+
          '<div class="tva-modal__header">'+
            '<div class="tva-modal__title" id="tvaModalTitle"></div>'+
            '<button type="button" class="tva-modal__close" aria-label="Chiudi">×</button>'+
          '</div>'+
          '<div class="tva-modal__body" id="tvaModalBody"></div>'+
          '<div class="tva-modal__actions" id="tvaModalActions"></div>'+
        '</div>';
      document.body.appendChild(modalEl);

      // Click fuori per chiudere
      modalEl.addEventListener('click', function(ev){
        if (ev.target === modalEl) requestCloseModal();
      });
      // X
      modalEl.querySelector('.tva-modal__close').addEventListener('click', function(){
        closeModal();
      });

      // ESC
      document.addEventListener('keydown', function(ev){
        if (!modalEl || !modalEl.classList.contains('is-open')) return;
        if (ev.key === 'Escape') requestCloseModal();
      });

      return modalEl;
    }

    
    function requestCloseModal(){
      if (!modalEl) return;
      var cb = modalEl._onClose;
      if (typeof cb === 'function'){
        // prevent double-calls
        modalEl._onClose = null;
        try { cb(); } catch(e){ console.warn(e); closeModal(); }
        return;
      }
      closeModal();
    }

function openModal(opts){
      ensureModal();
      modalEl._onClose = (opts && typeof opts.onClose === 'function') ? opts.onClose : null;
      var titleEl = modalEl.querySelector('#tvaModalTitle');
      var bodyEl = modalEl.querySelector('#tvaModalBody');
      var actionsEl = modalEl.querySelector('#tvaModalActions');
      titleEl.textContent = (opts && opts.title) ? opts.title : '';
      bodyEl.innerHTML = (opts && opts.bodyHtml) ? opts.bodyHtml : '';
      actionsEl.innerHTML = '';

      var buttons = (opts && opts.buttons) ? opts.buttons : [];
      buttons.forEach(function(b){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = b.className || 'btn';
        btn.textContent = b.label || 'OK';
        btn.addEventListener('click', function(){
          if (b.onClick) b.onClick();
        });
        actionsEl.appendChild(btn);
      });

      modalEl.classList.add('is-open');
    }

    function closeModal(){
      if (!modalEl) return;
      modalEl.classList.remove('is-open');
      // Pulisci il body per evitare che input restino in DOM con valori sensibili
      try{ modalEl.querySelector('#tvaModalBody').innerHTML = ''; }catch(e){}
      try{ modalEl.querySelector('#tvaModalActions').innerHTML = ''; }catch(e){}
    }

    // ============================================================
    // 2FA (TOTP) su Supabase Auth
    // Docs: Supabase Auth MFA (TOTP)
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


    async function ensureMfaAal2IfNeeded(client){
      try{
        client = client || refreshClient();
        if (!client || !client.auth || !client.auth.mfa) return true;

        var aal = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        var current = aal.data && aal.data.currentLevel;
        var next = aal.data && aal.data.nextLevel;

        // already AAL2
        if (current === 'aal2') return true;
        // no MFA required for next actions
        if (next !== 'aal2') return true;

        var factor = await getVerifiedTotpFactor(client);
        if (!factor || !factor.id){
          showToast('2FA non configurata su questo account.', 'error');
          return false;
        }

        var ok = await promptAndVerifyTotpCode(client, factor.id, 'Verifica 2FA');
        if (!ok) return false;

        showToast('2FA verificato.', 'success');
        return true;
      }catch(e){
        console.warn(e);
        return true;
      }
    }


    function normalizeQrToDataUrl(qr){
      if (!qr || typeof qr !== 'string') return null;
      var s = qr.trim();
      if (!s) return null;
      if (s.startsWith('data:')) return s;

      // If provider returns an <img ...> tag, extract src
      var lower = s.toLowerCase();
      if (lower.startsWith('<img')){
        var m = s.match(/src\s*=\s*["']([^"']+)["']/i);
        if (m && m[1]) return normalizeQrToDataUrl(m[1]);
        return null;
      }

      if (s.startsWith('<svg')){
        // Base64 encode for broad browser compatibility
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
      var code = await promptTotpCodeModal(promptTitle || 'Verifica 2FA');
      if (!code) return false;
      var ok = await verifyTotpCode(client, factorId, code);
      if (!ok) showToast('Codice 2FA non valido.', 'error');
      return ok;
    }


    function promptTotpVerification(factorId, title, subtitle){
      return new Promise(function(resolve){
        var body = ''+
          '<p class="tva-modal__subtitle">' + (subtitle || '') + '</p>'+
          '<label class="tva-field">Codice 2FA</label>'+
          '<input id="tvaTotpCode" class="tva-input" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" maxlength="6" />'+
          '<div id="tvaTotpErr" class="tva-error" style="display:none;"></div>';

        openModal({
          title: title || 'Verifica 2FA',
          bodyHtml: body,
          buttons: [
            {
              label: 'Annulla',
              className: 'btn secondary',
              onClick: async function(){
                closeModal();
                resolve(false);
              }
            },
            {
              label: 'Verifica',
              className: 'btn',
              onClick: async function(){
                var codeEl = document.getElementById('tvaTotpCode');
                var errEl = document.getElementById('tvaTotpErr');
                var code = (codeEl && codeEl.value) ? codeEl.value.trim() : '';
                if (!/^\d{6}$/.test(code)){
                  if (errEl){ errEl.textContent = 'Inserisci un codice valido (6 cifre).'; errEl.style.display = 'block'; }
                  return;
                }
                if (errEl) errEl.style.display = 'none';

                // challenge + verify (compat)
                try{
                  if (client.auth.mfa.challengeAndVerify){
                    var r1 = await client.auth.mfa.challengeAndVerify({ factorId: factorId, code: code });
                    if (r1.error) throw r1.error;
                  }else{
                    var ch = await client.auth.mfa.challenge({ factorId: factorId });
                    if (ch.error) throw ch.error;
                    var v = await client.auth.mfa.verify({ factorId: factorId, challengeId: ch.data.id, code: code });
                    if (v.error) throw v.error;
                  }

                  closeModal();
                  showToast('2FA verificata.', 'success');
                  resolve(true);
                }catch(err){
                  if (errEl){ errEl.textContent = (err && err.message) ? err.message : 'Codice non valido. Riprova.'; errEl.style.display = 'block'; }
                }
              }
            }
          ]
        });

        // Focus
        setTimeout(function(){
          var codeEl = document.getElementById('tvaTotpCode');
          if (codeEl) codeEl.focus();
        }, 50);
      });
    }

    async function promptTotpCodeModal(promptTitle){
      promptTitle = promptTitle || 'Verifica 2FA';
      return new Promise(function(resolve){
        var done = false;
        function finish(val){
          if (done) return;
          done = true;
          resolve(val);
        }

        openModal({
          title: promptTitle,
          bodyHtml: ''+
            '<p class="tva-modal__subtitle">Inserisci il codice a 6 cifre generato dalla tua app Authenticator.</p>'+
            '<div class="tva-field">'+
              '<label class="tva-label">Codice 2FA</label>'+
              '<input class="tva-input" id="tvaMfaPromptCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="123456" />'+
              '<div class="tva-error" id="tvaMfaPromptError" style="display:none;"></div>'+
            '</div>',
          buttons: [
            { label: 'Annulla', className: 'btn btn-outline', onClick: function(){ closeModal(); finish(null); } },
            { label: 'Verifica', className: 'btn btn-primary', onClick: function(){
                var codeEl = document.getElementById('tvaMfaPromptCode');
                var errEl = document.getElementById('tvaMfaPromptError');
                var code = (codeEl && codeEl.value ? codeEl.value : '').trim();
                if (errEl){ errEl.style.display = 'none'; errEl.textContent = ''; }
                if (!code){
                  if (errEl){ errEl.style.display = 'block'; errEl.textContent = 'Inserisci il codice 2FA.'; }
                  return;
                }
                closeModal();
                finish(code);
              } }
          ],
          onClose: function(){ closeModal(); finish(null); }
        });

        setTimeout(function(){
          var codeEl = document.getElementById('tvaMfaPromptCode');
          if (codeEl) codeEl.focus();
        }, 50);
      });
    }


    async function open2faSettings(){
      var client = refreshClient();
      var userRes = await client.auth.getUser();
      var user = userRes.data ? userRes.data.user : null;
      if (!user){
        showToast('Devi essere loggato per gestire la 2FA.', 'error');
        return;
      }

      var TOTP_FRIENDLY_NAME = 'Travirae 2FA';

      // Consider "active" only if there's a VERIFIED factor.
      var verifiedFactor = await getVerifiedTotpFactor(client);
      if (verifiedFactor && verifiedFactor.id){
        openModal({
          title: 'Sicurezza (2FA)',
          bodyHtml: '<p class="tva-modal__subtitle">2FA attiva. Per disattivarla, conferma con un codice dalla tua app.</p>',
          buttons: [
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

      // Clean stale unverified factors (e.g. user pressed "Annulla" during setup)
      await cleanupStaleUnverifiedTotpFactors(client, TOTP_FRIENDLY_NAME);

      openModal({
        title: 'Sicurezza (2FA)',
        bodyHtml: '<p class="tva-modal__subtitle">Aggiungi un secondo livello di sicurezza al tuo account (Authenticator).</p>',
        buttons: [
          { label: 'Chiudi', className: 'btn btn-outline', onClick: closeModal },
          { label: 'Abilita 2FA', className: 'btn btn-primary', onClick: async function(){
              // Double-check
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
                // treat X / outside click like cancel
                closeModal();
                if (factorId){
                  client.auth.mfa.unenroll({ factorId: factorId }).then(function(){});
                }
              }

              openModal({
                title: 'Abilita 2FA',
                bodyHtml:
                  '<div class="tva-modal__stack">'+
                    '<p class="tva-modal__subtitle">1) Scansiona il QR con la tua app Authenticator.</p>'+
                    '<div class="mfa-qr" id="tvaMfaQrWrap"></div>'+
                    '<p class="tva-muted" id="tvaMfaSecretWrap" style="margin-top:10px; display:none;">Se non puoi scansionare: <code style="user-select:all; word-break:break-all;" id="tvaMfaSecret"></code></p>'+
                    '<p class="tva-modal__subtitle" style="margin-top:12px;">2) Inserisci il codice generato:</p>'+
                    '<div class="tva-field">'+
                      '<label class="tva-label">Codice 2FA</label>'+
                      '<input class="tva-input" id="tvaMfaSetupCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="123456" />'+
                      '<div class="tva-error" id="tvaMfaSetupError" style="display:none;"></div>'+
                    '</div>'+
                  '</div>',
                buttons: [
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

              // DOM-inject QR + key (prevents QR glitches / bad escaping)
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


    function showView(name){
      Object.keys(views).forEach(function(key){
        var el = views[key];
        if (!el) return;
        if (key === name) el.removeAttribute('hidden');
        else el.setAttribute('hidden','hidden');
      });

      if (tabsContainer){
        tabButtons.forEach(function(btn){
          var tab = btn.getAttribute('data-auth-tab');
          btn.classList.toggle('is-active', name === tab);
        });
      }

      // Ridimensiona la card principale in base alla vista
      if (authCard) {
        var isDashboard = (name === 'dashboard');
        authCard.classList.toggle('is-dashboard', isDashboard);
        authCard.classList.toggle('is-auth', !isDashboard);
      }

      // Nascondi intro quando l'utente è in dashboard
      if (introEl) {
        introEl.classList.toggle('is-hidden', name === 'dashboard');
      }
    }

    function getQueryParam(name){
      try{
        var params = new URLSearchParams(window.location.search || '');
        return params.get(name);
      }catch(e){ return null; }
    }

    function getInitialView(){
      var v = (getQueryParam('view') || '').toLowerCase();
      if (v === 'login' || v === 'register') return v;
      var h = (window.location.hash || '').toLowerCase();
      if (h.indexOf('registr') !== -1) return 'register';
      if (h.indexOf('accedi') !== -1 || h.indexOf('login') !== -1) return 'login';
      return 'login';
    }

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

    function monthStartYMD(d){
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2,'0');
      return y + '-' + m + '-01';
    }

    function computeTier(salesCount){
      var n = Number(salesCount || 0);
      if (!isFinite(n) || n < 0) n = 0;

      var current = 0.40;
      var next = null;
      var nextAt = null;
      var tierMin = 0;
      var tierMax = 20;

      if (n < 20){
        current = 0.40;
        next = 0.45;
        nextAt = 20;
        tierMin = 0;
        tierMax = 20;
      } else if (n < 50){
        current = 0.45;
        next = 0.50;
        nextAt = 50;
        tierMin = 20;
        tierMax = 50;
      } else if (n < 100){
        current = 0.50;
        next = 0.55;
        nextAt = 100;
        tierMin = 50;
        tierMax = 100;
      } else if (n < 200){
        current = 0.55;
        next = 0.60;
        nextAt = 200;
        tierMin = 100;
        tierMax = 200;
      } else {
        current = 0.60;
        next = null;
        nextAt = null;
        tierMin = 200;
        tierMax = 200;
      }

      var progress = 100;
      if (nextAt != null){
        var denom = (tierMax - tierMin);
        if (denom <= 0) progress = 100;
        else progress = ((n - tierMin) / denom) * 100;
        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;
      }

      var missing = null;
      if (nextAt != null) missing = Math.max(0, nextAt - n);

      return {
        sales: n,
        currentPercent: current,
        nextPercent: next,
        nextAt: nextAt,
        progress: progress,
        missing: missing
      };
    }

    async function ensureAffiliateForUser(user){
      var client = refreshClient();
      if (!client || !client.from) return null;

      try{
        var resp = await client
          .from('affiliates')
          .select('user_id,slug,email')
          .eq('user_id', user.id)
          .limit(1);

        if (resp.error) console.warn('Errore caricamento affiliate', resp.error);

        if (resp.data && resp.data.length){
          var row = resp.data[0];

          // Best effort: sincronizza email nella tabella affiliates
          if ((!row.email || String(row.email).trim() === '') && user.email){
            try{
              await client.from('affiliates')
                .update({ email: user.email })
                .eq('user_id', user.id);
              row.email = user.email;
            } catch(eUp) {}
          }

          return row;
        }

        var emailPrefix = (user.email || '').split('@')[0] || 'partner';
        var baseSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
        if (!baseSlug) baseSlug = 'partner';
        var rand = Math.floor(Math.random() * 9000) + 1000;
        var slug = (baseSlug + '-' + rand).substring(0, 64);

        var ins = await client
          .from('affiliates')
          .insert({ user_id: user.id, slug: slug, email: user.email || null })
          .select('user_id,slug,email')
          .limit(1);

        if (ins.error){
          console.error('Errore creazione affiliate', ins.error);
          return null;
        }
        if (ins.data && ins.data.length) return ins.data[0];
        return { user_id: user.id, slug: slug, email: user.email || null };
      } catch(e){
        console.error('Errore ensureAffiliateForUser', e);
        return null;
      }
    }

    // ---------- AUTH UI ----------
    function bindTabs(){
      if (!tabsContainer) return;
      tabButtons.forEach(function(btn){
        btn.addEventListener('click', function(){
          var tab = btn.getAttribute('data-auth-tab');
          if (tab === 'login' || tab === 'register'){
            showView(tab);
            setMessage('', null);
          }
        });
      });
    }

    function bindAuthForms(){
      var loginForm = $('#affiliate-login-form');
      if (loginForm){
        loginForm.addEventListener('submit', async function(e){
          e.preventDefault();
          setMessage('', null);

          // Ricordami: se NON spuntato, la sessione viene salvata in sessionStorage (non resta dopo chiusura browser)
          var remember = true;
          try{
            var rememberEl = loginForm.querySelector('#login-remember');
            if (rememberEl) remember = !!rememberEl.checked;
          }catch(_e){}

          // Imposta modalità auth
          setAuthMode(remember ? 'persist' : 'session');

          // Evita conflitti: se cambi modalità, pulisci l'altra sessione (best-effort)
          try{
            if (remember){
              if (window.supabaseClientSession && window.supabaseClientSession.auth) await window.supabaseClientSession.auth.signOut();
            } else {
              if (window.supabaseClient && window.supabaseClient.auth) await window.supabaseClient.auth.signOut();
            }
          }catch(_e){}

          var client = refreshClient();
          if (!client || !client.auth){
            setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
            return;
          }

          var email = (loginForm.querySelector('input[name="email"]') || {}).value || '';
          var password = (loginForm.querySelector('input[name="password"]') || {}).value || '';

          try{
            var result = await client.auth.signInWithPassword({ email: email, password: password });
            if (result.error){
              setMessage(result.error.message || 'Credenziali non valide.', 'error');
              return;
            }

            state.user = (result.data && result.data.user) ? result.data.user : ((result.data && result.data.session && result.data.session.user) ? result.data.session.user : null);
            if (!state.user){
              setMessage('Accesso riuscito, ma impossibile recuperare i dati utente.', 'error');
              return;
            }

            setMessage('Accesso effettuato.', 'success');
	            // 2FA (TOTP): se l'utente ha 2FA attiva, chiedi il codice prima di mostrare la dashboard
	            var mfaOk = await ensureMfaAal2IfNeeded(client);
	            if (!mfaOk) return;

            // Persist email language preference in user metadata (used by Supabase Auth email templates)
            try { await client.auth.updateUser({ data: { language: getEmailLang() } }); } catch(_e) {}

            await initDashboard();
          }catch(err){
            console.error(err);
            setMessage('Errore durante il login. Riprova tra poco.', 'error');
          }
        });
      }

      var registerForm = $('#affiliate-register-form');
      if (registerForm){
        registerForm.addEventListener('submit', async function(e){
          e.preventDefault();
          setMessage('', null);

          // Ricordami: se NON spuntato, la sessione viene salvata in sessionStorage (non resta dopo chiusura browser)
          var remember = true;
          try{
            var rememberEl = loginForm.querySelector('#login-remember');
            if (rememberEl) remember = !!rememberEl.checked;
          }catch(_e){}

          // Imposta modalità auth
          setAuthMode(remember ? 'persist' : 'session');

          // Evita conflitti: se cambi modalità, pulisci l'altra sessione (best-effort)
          try{
            if (remember){
              if (window.supabaseClientSession && window.supabaseClientSession.auth) await window.supabaseClientSession.auth.signOut();
            } else {
              if (window.supabaseClient && window.supabaseClient.auth) await window.supabaseClient.auth.signOut();
            }
          }catch(_e){}

          var client = refreshClient();
          if (!client || !client.auth){
            setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
            return;
          }

          var email = (registerForm.querySelector('input[name="email"]') || {}).value || '';
          var password = (registerForm.querySelector('input[name="password"]') || {}).value || '';
          var confirm = (registerForm.querySelector('input[name="password_confirm"]') || {}).value || '';

          if (!email || !password){
            setMessage('Compila email e password.', 'error');
            return;
          }
          if (password !== confirm){
            setMessage('Le password non coincidono.', 'error');
            return;
          }

          try{
            var result = await client.auth.signUp({
              email: email,
              password: password,
              options: { emailRedirectTo: 'https://travirae.com/area-affiliati.html?email_confirmed=1', data: { language: getEmailLang() } }
            });

            if (result.error){
              setMessage(result.error.message || 'Errore durante la registrazione.', 'error');
              return;
            }

            setMessage('Registrazione completata! Controlla la tua email per confermare l\'indirizzo prima di accedere.', 'success');
            showView('login');
          }catch(err){
            console.error(err);
            setMessage('Errore imprevisto durante la registrazione.', 'error');
          }
        });
      }

      var forgotLink = $('#affiliate-forgot-link');
      if (forgotLink){
        forgotLink.addEventListener('click', function(e){
          e.preventDefault();
          showView('forgot');
          setMessage('', null);
        });
      }

      var forgotForm = $('#affiliate-forgot-form');
      if (forgotForm){
        forgotForm.addEventListener('submit', async function(e){
          e.preventDefault();
          setMessage('', null);

          // Ricordami: se NON spuntato, la sessione viene salvata in sessionStorage (non resta dopo chiusura browser)
          var remember = true;
          try{
            var rememberEl = loginForm.querySelector('#login-remember');
            if (rememberEl) remember = !!rememberEl.checked;
          }catch(_e){}

          // Imposta modalità auth
          setAuthMode(remember ? 'persist' : 'session');

          // Evita conflitti: se cambi modalità, pulisci l'altra sessione (best-effort)
          try{
            if (remember){
              if (window.supabaseClientSession && window.supabaseClientSession.auth) await window.supabaseClientSession.auth.signOut();
            } else {
              if (window.supabaseClient && window.supabaseClient.auth) await window.supabaseClient.auth.signOut();
            }
          }catch(_e){}

          var client = refreshClient();
          if (!client || !client.auth){
            setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
            return;
          }

          var email = (forgotForm.querySelector('input[name="email"]') || {}).value || '';
          if (!email){
            setMessage('Inserisci la tua email.', 'error');
            return;
          }

          try{
            var result = await client.auth.resetPasswordForEmail(email, {
              redirectTo: 'https://travirae.com/area-affiliati.html?mode=recovery'
            });

            if (result.error){
              setMessage(result.error.message || 'Errore durante il reset password.', 'error');
              return;
            }

            setMessage('Se l\'indirizzo esiste nel sistema, riceverai una email con il link per reimpostare la password.', 'success');
            showView('login');
          }catch(err){
            console.error(err);
            setMessage('Errore imprevisto durante il recupero password.', 'error');
          }
        });
      }

      var backToLoginBtn = document.querySelector('.auth-view-forgot [data-back-to="login"]');
      if (backToLoginBtn){
        backToLoginBtn.addEventListener('click', function(e){
          e.preventDefault();
          showView('login');
          setMessage('', null);
        });
      }

      var recoveryForm = $('#affiliate-recovery-form');
      if (recoveryForm){
        recoveryForm.addEventListener('submit', async function(e){
          e.preventDefault();
          setMessage('', null);

          // Ricordami: se NON spuntato, la sessione viene salvata in sessionStorage (non resta dopo chiusura browser)
          var remember = true;
          try{
            var rememberEl = loginForm.querySelector('#login-remember');
            if (rememberEl) remember = !!rememberEl.checked;
          }catch(_e){}

          // Imposta modalità auth
          setAuthMode(remember ? 'persist' : 'session');

          // Evita conflitti: se cambi modalità, pulisci l'altra sessione (best-effort)
          try{
            if (remember){
              if (window.supabaseClientSession && window.supabaseClientSession.auth) await window.supabaseClientSession.auth.signOut();
            } else {
              if (window.supabaseClient && window.supabaseClient.auth) await window.supabaseClient.auth.signOut();
            }
          }catch(_e){}

          var client = refreshClient();
          if (!client || !client.auth){
            setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
            return;
          }

          var password = (recoveryForm.querySelector('input[name="password"]') || {}).value || '';
          var confirm = (recoveryForm.querySelector('input[name="password_confirm"]') || {}).value || '';

          if (!password){
            setMessage('Inserisci una nuova password.', 'error');
            return;
          }
          if (password !== confirm){
            setMessage('Le password non coincidono.', 'error');
            return;
          }

          try{
            var result = await client.auth.updateUser({ password: password });
            if (result.error){
              setMessage(result.error.message || 'Errore durante l\'aggiornamento della password.', 'error');
              return;
            }

            setMessage('Password aggiornata con successo! Ora puoi accedere con le nuove credenziali.', 'success');
            showView('login');
          }catch(err){
            console.error(err);
            setMessage('Errore imprevisto durante l\'aggiornamento della password.', 'error');
          }
        });
      }

      if (logoutBtn){
        logoutBtn.addEventListener('click', async function(){
          stopRealtimeAndPolling();

          // Logout da entrambi i client (persistente e session-only) + reset modalità
          try{ setAuthMode('persist'); }catch(_e){}

          try{
            if (window.supabaseClient && window.supabaseClient.auth){
              await window.supabaseClient.auth.signOut();
            }
          }catch(e){ console.warn('Errore durante il logout (persist)', e); }

          try{
            if (window.supabaseClientSession && window.supabaseClientSession.auth){
              await window.supabaseClientSession.auth.signOut();
            }
          }catch(e){ console.warn('Errore durante il logout (session)', e); }

          state.user = null;
          state.affiliate = null;
          state.slug = null;

          if (state.chart && typeof state.chart.destroy === 'function'){
            state.chart.destroy();
          }

          setMessage('Sei uscito dall\'area affiliati.', 'success');
          showView('login');
        });
      }

      if (btn2fa){
        btn2fa.addEventListener('click', function(){
          open2faSettings();
        });
      }
    }

    // ---------- DASHBOARD UI ----------
    function updateDashboardHeader(){
      if (!state.affiliate || !state.affiliate.slug) return;
      state.slug = state.affiliate.slug;

      var slug = state.slug;
      var baseUrl = 'https://travirae.com/';
      var refUrl = baseUrl + '?ref=' + encodeURIComponent(slug);

      if (elSlug) elSlug.textContent = slug;
      if (elLinkInput) elLinkInput.value = refUrl;

      if (elCopyBtn && elLinkInput && !elCopyBtn.__bound){
        elCopyBtn.__bound = true;
        elCopyBtn.addEventListener('click', function(){
          try{ elLinkInput.select(); elLinkInput.setSelectionRange(0, 99999); }catch(e){}

          if (navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(elLinkInput.value)
              .then(function(){ setMessage('Link copiato negli appunti.', 'success'); })
              .catch(function(){ setMessage('Copia non riuscita, seleziona e copia manualmente.', 'error'); });
          }else{
            try{
              var ok = document.execCommand('copy');
              setMessage(ok ? 'Link copiato negli appunti.' : 'Copia non riuscita, seleziona e copia manualmente.', ok ? 'success' : 'error');
            }catch(e){
              setMessage('Seleziona il link e copialo manualmente.', 'error');
            }
          }
        });
      }
    }

    function renderChart(payouts){
      var canvas = $('#affiliate-payouts-chart');
      if (!canvas || !window.Chart) return;

      var ctx = canvas.getContext('2d');
      if (state.chart && typeof state.chart.destroy === 'function'){
        state.chart.destroy();
      }

      var labels = [];
      var values = [];
      (payouts || []).forEach(function(row){
        labels.push(formatMonthLabel(row.month));
        values.push(Number(row.affiliate_earnings || 0));
      });

      state.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Guadagni mensili (USD)',
            data: values,
            tension: 0.25,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    function updatePayoutsTable(payouts){
      var tbody = $('#affiliate-payouts-table-body');
      if (!tbody) return;

      tbody.innerHTML = '';

      if (!payouts || !payouts.length){
        var tr0 = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.colSpan = 5;
        td0.className = 'muted small';
        td0.textContent = 'Nessun payout registrato finora.';
        tr0.appendChild(td0);
        tbody.appendChild(tr0);
        return;
      }

      payouts.forEach(function(row){
        var tr = document.createElement('tr');

        function cell(text){
          var td = document.createElement('td');
          td.textContent = text;
          return td;
        }

        var shareDisplay = '';
        if (row.share_percent != null){
          var sp = Number(row.share_percent);
          if (!isFinite(sp)) sp = 0;
          shareDisplay = (sp * 100).toFixed(0) + '%';
        }

        tr.appendChild(cell(formatMonthLabel(row.month)));
        tr.appendChild(cell(String(row.sales_count || 0)));
        tr.appendChild(cell(formatUsd(row.net_commissions || 0)));
        tr.appendChild(cell(shareDisplay));
        tr.appendChild(cell(formatUsd(row.affiliate_earnings || 0)));
        tbody.appendChild(tr);
      });
    }

    function setTierUI(tier){
      if (elTierPercent){
        elTierPercent.textContent = (tier.currentPercent * 100).toFixed(0) + '%';
        elTierPercent.classList.remove('is-green','is-amber','is-red');
        if (tier.currentPercent >= 0.55) elTierPercent.classList.add('is-green');
        else if (tier.currentPercent >= 0.45) elTierPercent.classList.add('is-amber');
      }

      if (elTierSales) elTierSales.textContent = String(tier.sales || 0);

      if (elTierProgress){
        elTierProgress.style.width = (tier.progress || 0) + '%';
      }

      if (elTierNext){
        if (tier.nextAt == null){
          elTierNext.textContent = 'Hai raggiunto il livello massimo (60%).';
        } else {
          elTierNext.textContent = 'Prossimo livello: ' + (tier.nextPercent * 100).toFixed(0) + '% a ' + tier.nextAt + ' vendite (mancano ' + tier.missing + ').';
        }
      }
    }

    function renderPayoutRequestsTable(rows){
      if (!payoutRequestsTbody) return;

      payoutRequestsTbody.innerHTML = '';

      if (!rows || !rows.length){
        var tr0 = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.colSpan = 4;
        td0.className = 'muted small';
        td0.textContent = 'Nessuna richiesta inviata finora.';
        tr0.appendChild(td0);
        payoutRequestsTbody.appendChild(tr0);
        return;
      }

      rows.forEach(function(r){
        var tr = document.createElement('tr');

        function td(text){
          var x = document.createElement('td');
          x.textContent = text;
          return x;
        }

        var date = '';
        try{ date = new Date(r.requested_at).toLocaleString('it-IT'); }catch(e){ date = String(r.requested_at || ''); }

        var status = String(r.status || 'pending');
        var statusLabel = status;
        if (status === 'pending') statusLabel = 'In attesa';
        if (status === 'approved') statusLabel = 'Approvata';
        if (status === 'paid') statusLabel = 'Pagata';
        if (status === 'rejected') statusLabel = 'Rifiutata';

        tr.appendChild(td(date));
        tr.appendChild(td(formatUsd(r.amount_usd || 0)));
        tr.appendChild(td(String(r.method || '')));
        tr.appendChild(td(statusLabel));

        payoutRequestsTbody.appendChild(tr);
      });
    }

    // ---------- PAYOUT FORM ----------
    function togglePayoutMethodFields(){
      var methodSel = $('#payout-method');
      var m = methodSel ? (methodSel.value || 'paypal') : 'paypal';

      var wrapPaypal = $('#payout-method-paypal');
      var wrapBank = $('#payout-method-bank');

      if (wrapPaypal) wrapPaypal.hidden = (m !== 'paypal');
      if (wrapBank) wrapBank.hidden = (m !== 'bank');
    }

    async function prefillPayoutForm(){
      var client = refreshClient();
      if (!client || !client.from || !state.slug) return;

      try{
        var resp = await client
          .from('payout_profiles')
          .select('method,payout_details,fiscal_details')
          .eq('affiliate_slug', state.slug)
          .limit(1);

        if (resp.error) return;
        if (!resp.data || !resp.data.length) return;

        var row = resp.data[0] || {};
        var method = row.method || 'paypal';
        var payout = row.payout_details || {};
        var fiscal = row.fiscal_details || {};

        var methodSel = $('#payout-method');
        if (methodSel) methodSel.value = method;
        togglePayoutMethodFields();

        // PayPal
        var paypalEmail = $('#payout-paypal-email');
        if (paypalEmail && payout.paypal_email) paypalEmail.value = payout.paypal_email;

        // Bank
        var beneficiary = $('#payout-beneficiary-name');
        if (beneficiary && payout.beneficiary_name) beneficiary.value = payout.beneficiary_name;

        var bankCountry = $('#payout-bank-country');
        if (bankCountry && payout.bank_country) bankCountry.value = payout.bank_country;

        var iban = $('#payout-iban');
        if (iban && payout.iban) iban.value = payout.iban;

        var swift = $('#payout-swift');
        if (swift && payout.swift_bic) swift.value = payout.swift_bic;

        var bankName = $('#payout-bank-name');
        if (bankName && payout.bank_name) bankName.value = payout.bank_name;

        var bankAddress = $('#payout-bank-address');
        if (bankAddress && payout.bank_address) bankAddress.value = payout.bank_address;

        // Fiscal
        var legalName = $('#payout-legal-name');
        if (legalName && fiscal.legal_name) legalName.value = fiscal.legal_name;

        var subjectType = $('#payout-subject-type');
        if (subjectType && fiscal.subject_type) subjectType.value = fiscal.subject_type;

        var taxCountry = $('#payout-tax-country');
        if (taxCountry && fiscal.tax_residence_country) taxCountry.value = fiscal.tax_residence_country;

        var taxId = $('#payout-tax-id');
        if (taxId && fiscal.tax_id) taxId.value = fiscal.tax_id;

        var addrCountry = $('#payout-address-country');
        if (addrCountry && fiscal.address_country) addrCountry.value = fiscal.address_country;

        var addrCity = $('#payout-address-city');
        if (addrCity && fiscal.address_city) addrCity.value = fiscal.address_city;

      } catch(e){
        // ignore
      }
    }

    function bindPayoutUIOnce(){
      if (state.payoutUIBound) return;
      state.payoutUIBound = true;

      if (btnOpenPayoutForm){
        btnOpenPayoutForm.addEventListener('click', async function(){
          // Se non raggiunge la soglia minima, mostriamo un popup e non apriamo il form.
          if ((Number(state.availableBalance || 0) || 0) < 50){
            setMessage('Saldo insufficiente: devi raggiungere almeno 50 USD di saldo disponibile per richiedere un pagamento.', 'error');
            return;
          }
          if (payoutFormWrap) payoutFormWrap.hidden = false;
          await prefillPayoutForm();
          togglePayoutMethodFields();
          setMessage('', null);
        });
      }

      if (payoutCancelBtn){
        payoutCancelBtn.addEventListener('click', function(){
          if (payoutFormWrap) payoutFormWrap.hidden = true;
          setMessage('', null);
        });
      }

      var methodSel = $('#payout-method');
      if (methodSel){
        methodSel.addEventListener('change', togglePayoutMethodFields);
      }

      if (payoutForm){
        payoutForm.addEventListener('submit', async function(e){
          e.preventDefault();
          setMessage('', null);

          var client = refreshClient();
          if (!client || !client.functions){
            setMessage('Servizio payout non disponibile (Functions).', 'error');
            return;
          }

          var amountEl = $('#payout-amount');
          var methodEl = $('#payout-method');
          var confirmEl = $('#payout-confirm');
          var rememberEl = $('#payout-remember');

          var amount = amountEl ? Number(amountEl.value || 0) : 0;
          if (!isFinite(amount)) amount = 0;

          var availableNow = Number(state.availableBalance || 0);
          if (!isFinite(availableNow)) availableNow = 0;

          if (availableNow < 50){
            setMessage('Saldo insufficiente: devi raggiungere almeno 50 USD di saldo disponibile per richiedere un pagamento.', 'error');
            return;
          }

          if (amount > availableNow){
            setMessage('Saldo insufficiente: l\'importo richiesto supera il tuo saldo disponibile.', 'error');
            return;
          }

          if (amount < 50){
            setMessage('Errore: il limite minimo di prelievo è di 50 USD.', 'error');
            return;
          }

          if (confirmEl && !confirmEl.checked){
            setMessage('Devi confermare che i dati sono corretti.', 'error');
            return;
          }

          var method = methodEl ? (methodEl.value || 'paypal') : 'paypal';

          var payout = {};
          if (method === 'paypal'){
            payout.paypal_email = ($('#payout-paypal-email') || {}).value || '';
          } else {
            payout.beneficiary_name = ($('#payout-beneficiary-name') || {}).value || '';
            payout.bank_country = ($('#payout-bank-country') || {}).value || '';
            payout.iban = ($('#payout-iban') || {}).value || '';
            payout.swift_bic = ($('#payout-swift') || {}).value || '';
            payout.bank_name = ($('#payout-bank-name') || {}).value || '';
            payout.bank_address = ($('#payout-bank-address') || {}).value || '';
          }

          var fiscal = {
            legal_name: ($('#payout-legal-name') || {}).value || '',
            subject_type: ($('#payout-subject-type') || {}).value || 'individual',
            tax_residence_country: ($('#payout-tax-country') || {}).value || '',
            tax_id: ($('#payout-tax-id') || {}).value || '',
            address_country: ($('#payout-address-country') || {}).value || '',
            address_city: ($('#payout-address-city') || {}).value || ''
          };

          // Basic form validation client-side
          if (!fiscal.legal_name || !fiscal.tax_residence_country || !fiscal.address_country || !fiscal.address_city){
            setMessage('Compila i dati fiscali richiesti.', 'error');
            return;
          }

          if (method === 'paypal'){
            if (!payout.paypal_email){
              setMessage('Inserisci l\'email PayPal.', 'error');
              return;
            }
          } else {
            if (!payout.beneficiary_name || !payout.bank_country){
              setMessage('Inserisci intestatario e paese banca.', 'error');
              return;
            }
            // IBAN è richiesto per SEPA; per SWIFT puro potrebbe essere diverso, ma per semplicità lo chiediamo.
            if (!payout.iban){
              setMessage('Inserisci un IBAN (per bonifici SEPA).', 'error');
              return;
            }
          }

          var remember = rememberEl ? !!rememberEl.checked : false;

          // Disable submit button
          var submitBtn = payoutForm.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.disabled = true;

          try{
            var resp = await client.functions.invoke('request-payout', {
              body: {
                amount_usd: amount,
                method: method,
                payout: payout,
                fiscal: fiscal,
                remember: remember
              }
            });

            if (resp && resp.error){
              throw resp.error;
            }

            setMessage('✅ Richiesta inviata! La vedrai nello storico e l\'admin riceverà anche una email.', 'success');
            if (payoutFormWrap) payoutFormWrap.hidden = true;

            // Reset
            try{ payoutForm.reset(); }catch(e){}
            togglePayoutMethodFields();

            // Reload dashboard data
            await loadDashboardStats();
          }catch(err){
            console.error('Errore request-payout', err);
            var msg = (err && err.message) ? err.message : String(err);
            setMessage('❌ Errore richiesta pagamento: ' + msg, 'error');
          }finally{
            if (submitBtn) submitBtn.disabled = false;
          }
        });
      }
    }

    // ---------- DATA LOAD ----------
    async function loadDashboardStats(){
      var client = refreshClient();
      if (!state.slug || !client || !client.from) return;

      var slug = state.slug;
      var now = new Date();
      var currentMonth = monthStartYMD(now);

      try{
        var clicksPromise = client
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .eq('affiliate_slug', slug);

        var bookingClicksPromise = client
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('affiliate_slug', slug)
          .eq('status', 'click');

        var payoutsPromise = client
          .from('monthly_affiliate_stats')
          .select('month,sales_count,net_commissions,share_percent,affiliate_earnings')
          .eq('affiliate_slug', slug)
          .order('month', { ascending: true });

        var monthRowPromise = client
          .from('monthly_affiliate_stats')
          .select('sales_count')
          .eq('affiliate_slug', slug)
          .eq('month', currentMonth)
          .limit(1);

        var balancePromise = client
          .from('affiliate_balances')
          .select('total_earnings_usd,paid_total_usd,reserved_total_usd,available_balance_usd')
          .eq('affiliate_slug', slug)
          .limit(1);

        var payoutReqPromise = client
          .from('payout_requests')
          .select('id,amount_usd,method,status,requested_at,processed_at')
          .eq('affiliate_slug', slug)
          .order('requested_at', { ascending: false })
          .limit(20);

        var results = await Promise.allSettled([
          clicksPromise,
          bookingClicksPromise,
          payoutsPromise,
          monthRowPromise,
          balancePromise,
          payoutReqPromise
        ]);

        function getOk(i){
          return (results[i] && results[i].status === 'fulfilled') ? results[i].value : null;
        }

        var clicksResp = getOk(0);
        var bookingClicksResp = getOk(1);
        var payoutsResp = getOk(2);
        var monthRowResp = getOk(3);
        var balanceResp = getOk(4);
        var payoutReqResp = getOk(5);

        // Click counts
        var clickCount = 0;
        if (clicksResp && !clicksResp.error && typeof clicksResp.count === 'number') clickCount = clicksResp.count;
        if (elClicks) elClicks.textContent = String(clickCount);

        var bookingClicksCount = 0;
        if (bookingClicksResp && !bookingClicksResp.error && typeof bookingClicksResp.count === 'number') bookingClicksCount = bookingClicksResp.count;
        if (elBookingClicks) elBookingClicks.textContent = String(bookingClicksCount);

        // Payout stats
        var payouts = (payoutsResp && !payoutsResp.error && Array.isArray(payoutsResp.data)) ? payoutsResp.data : [];
        var total = 0;
        var thisMonthTotal = 0;
        var cy = now.getFullYear();
        var cm = now.getMonth();

        payouts.forEach(function(row){
          var v = Number(row.affiliate_earnings || 0);
          if (!isFinite(v)) v = 0;
          total += v;
          try{
            var d = new Date(row.month);
            if (d.getFullYear() === cy && d.getMonth() === cm){
              thisMonthTotal += v;
            }
          }catch(e){}
        });

        if (elTotal) elTotal.textContent = formatUsd(total);
        if (elMonth) elMonth.textContent = formatUsd(thisMonthTotal);

        updatePayoutsTable(payouts);
        renderChart(payouts);

        // Tier (current month sales count)
        var salesCount = 0;
        if (monthRowResp && !monthRowResp.error && Array.isArray(monthRowResp.data) && monthRowResp.data.length){
          salesCount = Number(monthRowResp.data[0].sales_count || 0);
          if (!isFinite(salesCount)) salesCount = 0;
        }
        var tier = computeTier(salesCount);
        setTierUI(tier);

        // Balance
        var available = 0;
        if (balanceResp && !balanceResp.error && Array.isArray(balanceResp.data) && balanceResp.data.length){
          available = Number(balanceResp.data[0].available_balance_usd || 0);
          if (!isFinite(available)) available = 0;
        }

        state.availableBalance = available;

        if (elAvailableBalance) elAvailableBalance.textContent = formatUsd(available);

        if (btnOpenPayoutForm){
          // Non disabilitiamo il bottone: se l'utente ci clicca, mostriamo un popup "Saldo insufficiente".
          // Lo rendiamo solo visivamente "disabled".
          btnOpenPayoutForm.disabled = false;
          btnOpenPayoutForm.classList.toggle('is-disabled', available < 50);
          btnOpenPayoutForm.setAttribute('aria-disabled', (available < 50) ? 'true' : 'false');
          btnOpenPayoutForm.title = (available < 50) ? 'Saldo insufficiente: serve un minimo di 50 USD disponibili per richiedere un pagamento.' : '';
        }

        // Requests table
        var reqRows = (payoutReqResp && !payoutReqResp.error && Array.isArray(payoutReqResp.data)) ? payoutReqResp.data : [];
        renderPayoutRequestsTable(reqRows);

      }catch(e){
        console.error('Errore caricamento statistiche affiliate', e);
      }
    }

    function startRealtimeAndPolling(){
      stopRealtimeAndPolling();

      // Polling light
      state.refreshTimer = setInterval(function(){
        if (state.slug && state.user) loadDashboardStats();
      }, 45000);

      // Realtime (best effort)
      var client = refreshClient();
      if (!client || typeof client.channel !== 'function') return;

      try{
        var slug = state.slug;
        state.realtimeChannel = client.channel('tva-affiliate-' + slug)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'affiliate_clicks',
            filter: 'affiliate_slug=eq.' + slug
          }, function(){
            loadDashboardStats();
          })
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
            filter: 'affiliate_slug=eq.' + slug
          }, function(){
            loadDashboardStats();
          })
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'payout_requests',
            filter: 'affiliate_slug=eq.' + slug
          }, function(){
            loadDashboardStats();
          })
          .subscribe(function(status){
            if (window.console && console.log) console.log('Travirae realtime affiliate:', status);
          });
      }catch(e){
        console.warn('Travirae: realtime non disponibile', e);
      }
    }

    function stopRealtimeAndPolling(){
      if (state.refreshTimer){
        try{ clearInterval(state.refreshTimer); }catch(e){}
        state.refreshTimer = null;
      }

      var client = refreshClient();
      if (state.realtimeChannel && client){
        try{
          if (typeof state.realtimeChannel.unsubscribe === 'function') state.realtimeChannel.unsubscribe();
          if (typeof client.removeChannel === 'function') client.removeChannel(state.realtimeChannel);
        }catch(e){}
      }
      state.realtimeChannel = null;
    }

    async function initDashboard(){
      var client = refreshClient();
      if (!client || !client.auth){
        showView('login');
        return;
      }

      if (!state.user){
        try{
          var resp = await client.auth.getUser();
          if (resp && resp.data && resp.data.user){
            state.user = resp.data.user;
          }
        }catch(e){
          console.warn('Errore getUser durante initDashboard', e);
        }
      }

      if (!state.user){
        showView('login');
        return;
      }

      // 2FA (TOTP): se la sessione è AAL1 ma l'utente ha fattori, chiedi il codice prima di proseguire
      var mfaOk = await ensureMfaAal2IfNeeded(client);
      if (!mfaOk){
        state.user = null;
        showView('login');
        return;
      }

      var aff = await ensureAffiliateForUser(state.user);
      if (!aff){
        setMessage('Errore nel recupero del profilo affiliato. Riprova più tardi.', 'error');
        showView('login');
        return;
      }

      state.affiliate = aff;
      updateDashboardHeader();
      showView('dashboard');

      bindPayoutUIOnce();

      await loadDashboardStats();
      startRealtimeAndPolling();
    }

    // ---------- INIT ----------
    bindTabs();
    bindAuthForms();

    var mode = getQueryParam('mode');
    if (mode === 'recovery'){
      showView('recovery');
      setMessage('Imposta una nuova password per il tuo account.', null);
      return;
    }

    var initialView = getInitialView();
    showView(initialView);

    // If already logged in, open dashboard
    var client = refreshClient();
    if (client && client.auth){
      client.auth.getUser()
        .then(function(resp){
          if (resp && resp.data && resp.data.user){
            state.user = resp.data.user;
            initDashboard();
          }
        })
        .catch(function(e){
          console.warn('Errore getUser iniziale', e);
        });
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
