// Travirae - Area Affiliati (auth + dashboard)
(function(){
  function $(sel, root){ return (root || document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function init(){
    if (!document.body.classList.contains('page--affiliate-portal')) return;

    var supa = window.supabaseClient || null;
    var state = { user: null, affiliate: null, slug: null, chart: null };

    var tabsContainer = $('.auth-tabs');
    var tabButtons = $all('.auth-tab');
    var views = {
      login: $('.auth-view-login'),
      register: $('.auth-view-register'),
      forgot: $('.auth-view-forgot'),
      recovery: $('.auth-view-recovery'),
      dashboard: $('.auth-view-dashboard')
    };
    var authMessageEl = $('#affiliate-auth-message');
    var logoutBtn = $('#affiliate-logout-btn');

    function refreshClient(){
      if (!supa && window.supabaseClient) supa = window.supabaseClient;
      return supa;
    }

    function setMessage(text, type){
      if (!authMessageEl) return;
      authMessageEl.textContent = text || '';
      authMessageEl.classList.remove('is-error','is-success');
      if (type === 'error') authMessageEl.classList.add('is-error');
      else if (type === 'success') authMessageEl.classList.add('is-success');
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

    async function ensureAffiliateForUser(user){
      var client = refreshClient();
      if (!client || !client.from) return null;
      try{
        var resp = await client
          .from('affiliates')
          .select('user_id,slug')
          .eq('user_id', user.id)
          .limit(1);

        if (resp.error) console.warn('Errore caricamento affiliate', resp.error);
        if (resp.data && resp.data.length) return resp.data[0];

        var email = (user.email || '').split('@')[0] || 'partner';
        var baseSlug = email.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
        if (!baseSlug) baseSlug = 'partner';
        var rand = Math.floor(Math.random()*9000) + 1000;
        var slug = (baseSlug + '-' + rand).substring(0,64);

        var ins = await client
          .from('affiliates')
          .insert({ user_id: user.id, slug: slug })
          .select('user_id,slug')
          .limit(1);
        if (ins.error){
          console.error('Errore creazione affiliate', ins.error);
          return null;
        }
        if (ins.data && ins.data.length) return ins.data[0];
        return { user_id: user.id, slug: slug };
      }catch(e){
        console.error('Errore ensureAffiliateForUser', e);
        return null;
      }
    }

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

    function bindForms(){
      var loginForm = $('#affiliate-login-form');
      if (loginForm){
        loginForm.addEventListener('submit', async function(e){
          e.preventDefault();
          setMessage('', null);
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
            state.user = result.data && result.data.user ? result.data.user : (result.data && result.data.session && result.data.session.user ? result.data.session.user : null);
            if (!state.user){
              setMessage('Accesso riuscito, ma impossibile recuperare i dati utente.', 'error');
              return;
            }
            setMessage('Accesso effettuato.', 'success');
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
              options: {
                emailRedirectTo: 'https://travirae.com/area-affiliati.html?email_confirmed=1'
              }
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
          var client = refreshClient();
          if (client && client.auth){
            try{ await client.auth.signOut(); }catch(e){ console.warn('Errore durante il logout', e); }
          }
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
    }

    function updateDashboardHeader(){
      var slugEl = $('#affiliate-slug');
      var linkInput = $('#affiliate-link-input');
      if (!state.affiliate || !state.affiliate.slug) return;
      state.slug = state.affiliate.slug;
      var slug = state.slug;
      var baseUrl = 'https://travirae.com/';
      var refUrl = baseUrl + '?ref=' + encodeURIComponent(slug);
      if (slugEl) slugEl.textContent = slug;
      if (linkInput) linkInput.value = refUrl;

      var copyBtn = $('#affiliate-copy-btn');
      if (copyBtn && linkInput){
        copyBtn.addEventListener('click', function(){
          try{ linkInput.select(); linkInput.setSelectionRange(0, 99999); }catch(e){}
          if (navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(linkInput.value)
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
      payouts.forEach(function(row){
        labels.push(formatMonthLabel(row.month));
        values.push(Number(row.affiliate_earnings || 0));
      });
      state.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Guadagni mensili',
            data: values,
            tension: 0.25,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    function updatePayoutsTable(payouts){
      var tbody = $('#affiliate-payouts-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (!payouts || !payouts.length){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'muted small';
        td.textContent = 'Nessun payout registrato finora.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      payouts.forEach(function(row){
        var tr = document.createElement('tr');
        function cell(text){ var td = document.createElement('td'); td.textContent = text; return td; }
        var shareDisplay = '';
        if (row.share_percent != null){
          var sp = Number(row.share_percent);
          if (!isFinite(sp)) sp = 0;
          shareDisplay = (sp * 100).toFixed(0) + '%';
        }
        tr.appendChild(cell(formatMonthLabel(row.month)));
        tr.appendChild(cell(String(row.sales_count || 0)));
        tr.appendChild(cell(formatMoney(row.net_commissions || 0)));
        tr.appendChild(cell(shareDisplay));
        tr.appendChild(cell(formatMoney(row.affiliate_earnings || 0)));
        tbody.appendChild(tr);
      });
    }

    async function loadDashboardStats(){
      var client = refreshClient();
      if (!state.slug || !client || !client.from) return;
      try{
        var slug = state.slug;
        var clicksPromise = client
          .from('affiliate_clicks')
          .select('id', { count: 'exact' })
          .eq('affiliate_slug', slug);
        var payoutsPromise = client
          .from('monthly_affiliate_payouts')
          .select('month,sales_count,net_commissions,share_percent,affiliate_earnings')
          .eq('affiliate_slug', slug)
          .order('month', { ascending: true });
        var bookingsPromise = client
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('affiliate_slug', slug);

        var results = await Promise.all([clicksPromise, payoutsPromise, bookingsPromise]);
        var clicksResp = results[0];
        var payoutsResp = results[1];
        var bookingsResp = results[2];

        if (clicksResp.error) console.warn('Errore caricamento click affiliato', clicksResp.error);
        if (payoutsResp.error) console.warn('Errore caricamento payouts affiliato', payoutsResp.error);
        if (bookingsResp.error) console.warn('Errore caricamento bookings affiliato', bookingsResp.error);

        var clickCount = 0;
        if (!clicksResp.error){
          if (typeof clicksResp.count === 'number') clickCount = clicksResp.count;
          else if (Array.isArray(clicksResp.data)) clickCount = clicksResp.data.length;
        }

        var bookingsCount = 0;
        if (!bookingsResp.error){
          if (typeof bookingsResp.count === 'number') bookingsCount = bookingsResp.count;
          else if (Array.isArray(bookingsResp.data)) bookingsCount = bookingsResp.data.length;
        }

        var payouts = Array.isArray(payoutsResp.data) ? payoutsResp.data : [];
        var total = 0;
        var thisMonthTotal = 0;
        var now = new Date();
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

        var clicksEl = $('#affiliate-stat-clicks');
        var bookingsEl = $('#affiliate-stat-bookings');
        var totalEl = $('#affiliate-stat-total');
        var monthEl = $('#affiliate-stat-month');
        if (clicksEl) clicksEl.textContent = String(clickCount);
        if (bookingsEl) bookingsEl.textContent = String(bookingsCount);
        if (totalEl) totalEl.textContent = formatMoney(total);
        if (monthEl) monthEl.textContent = formatMoney(thisMonthTotal);

        updatePayoutsTable(payouts);
        renderChart(payouts);
      }catch(e){
        console.error('Errore caricamento statistiche affiliate', e);
      }
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
      var aff = await ensureAffiliateForUser(state.user);
      if (!aff){
        setMessage('Errore nel recupero del profilo affiliato. Riprova più tardi.', 'error');
        showView('login');
        return;
      }
      state.affiliate = aff;
      updateDashboardHeader();
      showView('dashboard');
      await loadDashboardStats();
    }

    bindTabs();
    bindForms();

    var mode = getQueryParam('mode');
    if (mode === 'recovery'){
      showView('recovery');
      setMessage('Imposta una nuova password per il tuo account.', null);
      return;
    }
    var initialView = getInitialView();
    showView(initialView);

    var client = refreshClient();
    if (!client || !client.auth) return;

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

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
