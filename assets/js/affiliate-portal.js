// Travirae affiliate portal (area-affiliati)
(function(){
  if (!document || !document.body) return;
  if (!document.body.classList.contains('page--affiliate-portal')) return;

  var supa = window.supabaseClient || null;

  function $(sel, root){
    return (root || document).querySelector(sel);
  }
  function $all(sel, root){
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

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

  var state = {
    user: null,
    affiliate: null,
    slug: null,
    chart: null
  };

  function setMessage(text, type){
    if (!authMessageEl) return;
    authMessageEl.textContent = text || '';
    authMessageEl.classList.remove('is-error');
    authMessageEl.classList.remove('is-success');
    if (type === 'error') authMessageEl.classList.add('is-error');
    else if (type === 'success') authMessageEl.classList.add('is-success');
  }

  function showView(name){
    for (var key in views){
      if (!views.hasOwnProperty(key)) continue;
      var el = views[key];
      if (!el) continue;
      if (key === name) el.removeAttribute('hidden');
      else el.setAttribute('hidden', 'hidden');
    }
    if (tabsContainer){
      tabButtons.forEach(function(btn){
        var tab = btn.getAttribute('data-auth-tab');
        var isActive = (name === tab);
        if (isActive) btn.classList.add('is-active');
        else btn.classList.remove('is-active');
      });
    }
  }

  function getQueryParam(name){
    try{
      var params = new URLSearchParams(window.location.search || '');
      return params.get(name);
    }catch(e){
      return null;
    }
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
      var mm = (m < 10 ? '0' + m : String(m));
      return mm + '/' + y;
    }catch(e){
      return iso;
    }
  }

  async function ensureAffiliateForUser(user){
    if (!supa || !supa.from) return null;
    try{
      var resp = await supa
        .from('affiliates')
        .select('user_id,slug')
        .eq('user_id', user.id)
        .limit(1);

      if (resp.error){
        console.warn('Errore caricamento affiliate per utente', resp.error);
      }
      if (resp.data && resp.data.length){
        return resp.data[0];
      }

      // crea nuovo slug
      var email = (user.email || '').split('@')[0] || 'partner';
      var base = email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (!base) base = 'partner';
      var rand = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
      var slug = (base + '-' + rand).substring(0, 64);

      var insertResp = await supa
        .from('affiliates')
        .insert({ user_id: user.id, slug: slug })
        .select('user_id,slug')
        .limit(1);

      if (insertResp.error){
        console.error('Errore creazione affiliate', insertResp.error);
        return null;
      }
      if (insertResp.data && insertResp.data.length){
        return insertResp.data[0];
      }
      return { user_id: user.id, slug: slug };
    }catch(e){
      console.error('Errore imprevisto ensureAffiliateForUser', e);
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
        var emailInput = loginForm.querySelector('input[name="email"]');
        var passInput = loginForm.querySelector('input[name="password"]');
        var email = emailInput ? emailInput.value : '';
        var password = passInput ? passInput.value : '';
        if (!email || !password){
          setMessage('Inserisci email e password.', 'error');
          return;
        }
        if (!supa || !supa.auth){
          setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
          return;
        }
        try{
          var resp = await supa.auth.signInWithPassword({ email: email, password: password });
          if (resp.error){
            setMessage(resp.error.message || 'Credenziali non valide.', 'error');
            return;
          }
          var user = null;
          if (resp.data){
            if (resp.data.user) user = resp.data.user;
            else if (resp.data.session && resp.data.session.user) user = resp.data.session.user;
          }
          state.user = user;
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
        var emailInput = registerForm.querySelector('input[name="email"]');
        var passInput = registerForm.querySelector('input[name="password"]');
        var confirmInput = registerForm.querySelector('input[name="password_confirm"]');
        var email = emailInput ? emailInput.value : '';
        var password = passInput ? passInput.value : '';
        var confirm = confirmInput ? confirmInput.value : '';
        if (!email || !password){
          setMessage('Compila email e password.', 'error');
          return;
        }
        if (password !== confirm){
          setMessage('Le password non coincidono.', 'error');
          return;
        }
        if (!supa || !supa.auth){
          setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
          return;
        }
        try{
          var resp = await supa.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: 'https://travirae.com/area-affiliati.html?email_confirmed=1'
            }
          });
          if (resp.error){
            setMessage(resp.error.message || 'Errore durante la registrazione.', 'error');
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

    var backToLoginBtn = document.querySelector('.auth-view-forgot [data-back-to="login"]');
    if (backToLoginBtn){
      backToLoginBtn.addEventListener('click', function(e){
        e.preventDefault();
        showView('login');
        setMessage('', null);
      });
    }

    var forgotForm = $('#affiliate-forgot-form');
    if (forgotForm){
      forgotForm.addEventListener('submit', async function(e){
        e.preventDefault();
        setMessage('', null);
        var emailInput = forgotForm.querySelector('input[name="email"]');
        var email = emailInput ? emailInput.value : '';
        if (!email){
          setMessage('Inserisci la tua email.', 'error');
          return;
        }
        if (!supa || !supa.auth){
          setMessage('Servizio di recupero password non disponibile. Riprova tra poco.', 'error');
          return;
        }
        try{
          var resp = await supa.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://travirae.com/area-affiliati.html?mode=recovery'
          });
          if (resp.error){
            setMessage(resp.error.message || 'Errore durante il reset password.', 'error');
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

    var recoveryForm = $('#affiliate-recovery-form');
    if (recoveryForm){
      recoveryForm.addEventListener('submit', async function(e){
        e.preventDefault();
        setMessage('', null);
        var passInput = recoveryForm.querySelector('input[name="password"]');
        var confirmInput2 = recoveryForm.querySelector('input[name="password_confirm"]');
        var password = passInput ? passInput.value : '';
        var confirm2 = confirmInput2 ? confirmInput2.value : '';
        if (!password){
          setMessage('Inserisci una nuova password.', 'error');
          return;
        }
        if (password !== confirm2){
          setMessage('Le password non coincidono.', 'error');
          return;
        }
        if (!supa || !supa.auth){
          setMessage('Servizio di autenticazione non disponibile. Riprova tra poco.', 'error');
          return;
        }
        try{
          var resp = await supa.auth.updateUser({ password: password });
          if (resp.error){
            setMessage(resp.error.message || 'Errore durante l\'aggiornamento della password.', 'error');
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
        if (supa && supa.auth){
          try{
            await supa.auth.signOut();
          }catch(e){
            console.warn('Errore durante il logout', e);
          }
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
        try{
          linkInput.focus();
          linkInput.select();
          if (linkInput.setSelectionRange){
            linkInput.setSelectionRange(0, linkInput.value.length);
          }
        }catch(e){}
        if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(linkInput.value)
            .then(function(){
              setMessage('Link copiato negli appunti.', 'success');
            })
            .catch(function(){
              setMessage('Copia non riuscita, seleziona e copia manualmente.', 'error');
            });
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
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function updatePayoutsTable(payouts){
    var tbody = $('#affiliate-payouts-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!payouts || !payouts.length){
      var trEmpty = document.createElement('tr');
      var tdEmpty = document.createElement('td');
      tdEmpty.colSpan = 5;
      tdEmpty.className = 'muted small';
      tdEmpty.textContent = 'Nessun payout registrato finora.';
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
      return;
    }
    payouts.forEach(function(row){
      var tr = document.createElement('tr');
      function cell(text){
        var td = document.createElement('td');
        td.textContent = text;
        return td;
      }
      tr.appendChild(cell(formatMonthLabel(row.month)));
      tr.appendChild(cell(String(row.sales_count || 0)));
      tr.appendChild(cell(formatMoney(row.net_commissions || 0)));
      tr.appendChild(cell(row.share_percent != null ? String(row.share_percent) + '%' : ''));
      tr.appendChild(cell(formatMoney(row.affiliate_earnings || 0)));
      tbody.appendChild(tr);
    });
  }

  async function loadDashboardStats(){
    if (!state.slug || !supa || !supa.from) return;
    try{
      var slug = state.slug;

      var clicksPromise = supa
        .from('affiliate_clicks')
        .select('id', { count: 'exact' })
        .eq('affiliate_slug', slug);

      var payoutsPromise = supa
        .from('monthly_affiliate_payouts')
        .select('month,sales_count,net_commissions,share_percent,affiliate_earnings')
        .eq('affiliate_slug', slug)
        .order('month', { ascending: true });

      var results = await Promise.all([clicksPromise, payoutsPromise]);
      var clicksResp = results[0];
      var payoutsResp = results[1];

      if (clicksResp.error){
        console.warn('Errore caricamento click affiliato', clicksResp.error);
      }
      if (payoutsResp.error){
        console.warn('Errore caricamento payouts affiliato', payoutsResp.error);
      }

      var clickCount = 0;
      if (!clicksResp.error){
        if (typeof clicksResp.count === 'number') clickCount = clicksResp.count;
        else if (Array.isArray(clicksResp.data)) clickCount = clicksResp.data.length;
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
      var totalEl = $('#affiliate-stat-total');
      var monthEl = $('#affiliate-stat-month');
      if (clicksEl) clicksEl.textContent = String(clickCount);
      if (totalEl) totalEl.textContent = formatMoney(total);
      if (monthEl) monthEl.textContent = formatMoney(thisMonthTotal);

      updatePayoutsTable(payouts);
      renderChart(payouts);
    }catch(e){
      console.error('Errore imprevisto caricamento statistiche affiliate', e);
    }
  }

  async function initDashboard(){
    if (!supa || !supa.auth){
      showView('login');
      return;
    }
    if (!state.user){
      try{
        var respUser = await supa.auth.getUser();
        if (respUser && respUser.data && respUser.data.user){
          state.user = respUser.data.user;
        }
      }catch(e){
        console.warn('Errore getUser durante initDashboard', e);
      }
    }
    if (!state.user){
      showView('login');
      return;
    }
    var affiliate = await ensureAffiliateForUser(state.user);
    if (!affiliate){
      setMessage('Errore nel recupero del profilo affiliato. Riprova più tardi.', 'error');
      showView('login');
      return;
    }
    state.affiliate = affiliate;
    updateDashboardHeader();
    showView('dashboard');
    await loadDashboardStats();
  }

  async function init(){
    bindTabs();
    bindForms();

    var mode = getQueryParam('mode');
    if (mode === 'recovery'){
      showView('recovery');
      setMessage('Imposta una nuova password per il tuo account.', null);
      return;
    }

    if (!supa || !supa.auth){
      showView('login');
      return;
    }

    try{
      var resp = await supa.auth.getUser();
      if (resp && resp.data && resp.data.user){
        state.user = resp.data.user;
        await initDashboard();
      }else{
        showView('login');
      }
    }catch(e){
      console.warn('Errore nel recupero utente iniziale', e);
      showView('login');
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
