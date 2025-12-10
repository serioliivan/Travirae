// Travirae - Admin Affiliati dashboard
(function(){
  function $(sel, root){ return (root || document).querySelector(sel); }

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

  function init(){
    if (!document.body.classList.contains('page--affiliate-admin')) return;

    var ADMIN_EMAILS = ['serioliivan@gmail.com'];

    var supa = window.supabaseClient || null;
    var state = { user: null, chart: null };

    var loginView = $('#admin-view-login');
    var dashboardView = $('#admin-view-dashboard');
    var loginForm = $('#admin-login-form');
    var logoutBtn = $('#admin-logout-btn');
    var reloadBtn = $('#admin-reload-btn');
    var messageEl = $('#admin-message');
    var titleEl = $('#admin-title');
    var subtitleEl = $('#admin-subtitle');

    var kpiSales = $('#admin-total-sales');
    var kpiNet = $('#admin-total-net');
    var kpiAff = $('#admin-total-aff');
    var kpiTrav = $('#admin-total-trav');

    var monthlyTbody = $('#admin-monthly-tbody');
    var affiliatesTbody = $('#admin-affiliates-tbody');

    function refreshClient(){
      if (!supa && window.supabaseClient) supa = window.supabaseClient;
      return supa;
    }

    function setMessage(text, type){
      if (!messageEl) return;
      messageEl.textContent = text || '';
      messageEl.classList.remove('is-error','is-success');
      if (type === 'error') messageEl.classList.add('is-error');
      else if (type === 'success') messageEl.classList.add('is-success');
    }

    function showLogin(){
      if (loginView) loginView.removeAttribute('hidden');
      if (dashboardView) dashboardView.setAttribute('hidden','hidden');
    }

    function showDashboard(){
      if (loginView) loginView.setAttribute('hidden','hidden');
      if (dashboardView) dashboardView.removeAttribute('hidden');
    }

    function isAdminEmail(email){
      if (!email) return false;
      var lower = String(email).toLowerCase().trim();
      return ADMIN_EMAILS.map(function(x){return String(x).toLowerCase().trim();}).indexOf(lower) !== -1;
    }

    function buildChart(byMonthArray){
      var canvas = document.getElementById('admin-earnings-chart');
      if (!canvas || !window.Chart) return;
      var ctx = canvas.getContext('2d');
      if (state.chart && typeof state.chart.destroy === 'function') state.chart.destroy();

      var labels = byMonthArray.map(function(row){ return formatMonthLabel(row.month); });
      var affVals = byMonthArray.map(function(row){ return row.aff_earn; });
      var travVals = byMonthArray.map(function(row){ return row.trav_earn; });

      state.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Affiliati',
              data: affVals,
              tension: 0.25,
              fill: false
            },
            {
              label: 'Travirae',
              data: travVals,
              tension: 0.25,
              fill: false
            }
          ]
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

    function renderMonthlyTable(byMonthArray){
      if (!monthlyTbody) return;
      monthlyTbody.innerHTML = '';
      if (!byMonthArray.length){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'muted small';
        td.textContent = 'Nessun dato disponibile.';
        tr.appendChild(td);
        monthlyTbody.appendChild(tr);
        return;
      }
      byMonthArray.forEach(function(row){
        var tr = document.createElement('tr');
        function cell(text){ var td = document.createElement('td'); td.textContent = text; return td; }
        tr.appendChild(cell(formatMonthLabel(row.month)));
        tr.appendChild(cell(String(row.sales)));
        tr.appendChild(cell(formatMoney(row.net)));
        tr.appendChild(cell(formatMoney(row.aff_earn)));
        tr.appendChild(cell(formatMoney(row.trav_earn)));
        monthlyTbody.appendChild(tr);
      });
    }

    function renderAffiliatesTable(byAffArray){
      if (!affiliatesTbody) return;
      affiliatesTbody.innerHTML = '';
      if (!byAffArray.length){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'muted small';
        td.textContent = 'Nessun dato disponibile.';
        tr.appendChild(td);
        affiliatesTbody.appendChild(tr);
        return;
      }
      byAffArray.forEach(function(row){
        var tr = document.createElement('tr');
        function cell(text){ var td = document.createElement('td'); td.textContent = text; return td; }
        tr.appendChild(cell(row.slug));
        tr.appendChild(cell(String(row.sales)));
        tr.appendChild(cell(formatMoney(row.net)));
        tr.appendChild(cell(formatMoney(row.aff_earn)));
        tr.appendChild(cell(formatMoney(row.trav_earn)));
        affiliatesTbody.appendChild(tr);
      });
    }

    async function loadAdminData(){
      var client = refreshClient();
      if (!client || !client.from) {
        setMessage('Client Supabase non disponibile.', 'error');
        return;
      }
      setMessage('Caricamento dati in corso...', null);
      try {
        var resp = await client
          .from('monthly_affiliate_payouts')
          .select('affiliate_slug,month,sales_count,net_commissions,affiliate_earnings')
          .order('month', { ascending: true });
        if (resp.error) {
          console.error('Errore monthly_affiliate_payouts', resp.error);
          setMessage('Errore nel caricamento dei dati mensili: ' + (resp.error.message || ''), 'error');
          return;
        }
        var rows = Array.isArray(resp.data) ? resp.data : [];

        var byMonth = {};
        var byAff = {};
        var totalSales = 0;
        var totalNet = 0;
        var totalAff = 0;
        var totalTrav = 0;

        rows.forEach(function(r){
          var monthKey = r.month;
          var slug = r.affiliate_slug || '(sconosciuto)';
          var sales = Number(r.sales_count || 0);
          var net = Number(r.net_commissions || 0);
          var affEarn = Number(r.affiliate_earnings || 0);
          if (!isFinite(sales)) sales = 0;
          if (!isFinite(net)) net = 0;
          if (!isFinite(affEarn)) affEarn = 0;
          var travEarn = net - affEarn;

          totalSales += sales;
          totalNet += net;
          totalAff += affEarn;
          totalTrav += travEarn;

          if (!byMonth[monthKey]) {
            byMonth[monthKey] = { month: monthKey, sales: 0, net: 0, aff_earn: 0, trav_earn: 0 };
          }
          byMonth[monthKey].sales += sales;
          byMonth[monthKey].net += net;
          byMonth[monthKey].aff_earn += affEarn;
          byMonth[monthKey].trav_earn += travEarn;

          if (!byAff[slug]) {
            byAff[slug] = { slug: slug, sales: 0, net: 0, aff_earn: 0, trav_earn: 0 };
          }
          byAff[slug].sales += sales;
          byAff[slug].net += net;
          byAff[slug].aff_earn += affEarn;
          byAff[slug].trav_earn += travEarn;
        });

        var byMonthArr = Object.keys(byMonth).map(function(k){ return byMonth[k]; });
        byMonthArr.sort(function(a,b){ return new Date(a.month) - new Date(b.month); });
        var byAffArr = Object.keys(byAff).map(function(k){ return byAff[k]; });
        byAffArr.sort(function(a,b){ return b.aff_earn - a.aff_earn; });

        if (kpiSales) kpiSales.textContent = String(totalSales);
        if (kpiNet) kpiNet.textContent = formatMoney(totalNet);
        if (kpiAff) kpiAff.textContent = formatMoney(totalAff);
        if (kpiTrav) kpiTrav.textContent = formatMoney(totalTrav);

        renderMonthlyTable(byMonthArr.slice().reverse());
        renderAffiliatesTable(byAffArr);
        buildChart(byMonthArr);

        setMessage('Dati aggiornati.', 'success');
      } catch(e) {
        console.error('Errore imprevisto loadAdminData', e);
        setMessage('Errore imprevisto durante il caricamento dei dati admin.', 'error');
      }
    }

    async function handleLogin(e){
      e.preventDefault();
      setMessage('', null);
      var client = refreshClient();
      if (!client || !client.auth) {
        setMessage('Servizio di autenticazione non disponibile.', 'error');
        return;
      }
      var emailInput = document.getElementById('admin-email');
      var passwordInput = document.getElementById('admin-password');
      var email = emailInput ? (emailInput.value || '') : '';
      var password = passwordInput ? (passwordInput.value || '') : '';
      if (!email || !password) {
        setMessage('Inserisci email e password admin.', 'error');
        return;
      }
      try {
        var result = await client.auth.signInWithPassword({ email: email, password: password });
        if (result.error) {
          setMessage(result.error.message || 'Credenziali non valide.', 'error');
          return;
        }
        var data = result.data || {};
        var user = data.user || (data.session && data.session.user) || null;
        if (!user) {
          setMessage('Accesso riuscito, ma impossibile recuperare i dati utente.', 'error');
          return;
        }
        if (!isAdminEmail(user.email)) {
          setMessage('Accesso negato: questo account non è abilitato come admin.', 'error');
          try { await client.auth.signOut(); } catch(eOut) { console.warn('Errore signOut dopo accesso negato', eOut); }
          return;
        }
        state.user = user;
        if (titleEl) titleEl.textContent = 'Dashboard admin – ' + (user.email || '');
        if (subtitleEl) subtitleEl.textContent = 'Stai visualizzando tutti gli affiliati e i relativi guadagni.';
        showDashboard();
        await loadAdminData();
      } catch(e) {
        console.error('Errore login admin', e);
        setMessage('Errore imprevisto durante il login admin.', 'error');
      }
    }

    async function checkExistingSession(){
      var client = refreshClient();
      if (!client || !client.auth) return;
      try {
        var resp = await client.auth.getUser();
        if (resp && resp.data && resp.data.user) {
          var user = resp.data.user;
          if (isAdminEmail(user.email)) {
            state.user = user;
            if (titleEl) titleEl.textContent = 'Dashboard admin – ' + (user.email || '');
            if (subtitleEl) subtitleEl.textContent = 'Stai visualizzando tutti gli affiliati e i relativi guadagni.';
            showDashboard();
            await loadAdminData();
          } else {
            showLogin();
          }
        } else {
          showLogin();
        }
      } catch(e) {
        console.warn('Errore getUser admin', e);
        showLogin();
      }
    }

    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    if (logoutBtn) logoutBtn.addEventListener('click', async function(){
      var client = refreshClient();
      if (client && client.auth) {
        try { await client.auth.signOut(); } catch(e) { console.warn('Errore logout admin', e); }
      }
      state.user = null;
      if (state.chart && typeof state.chart.destroy === 'function') state.chart.destroy();
      setMessage('Sei uscito dal pannello admin.', 'success');
      showLogin();
    });

    if (reloadBtn) reloadBtn.addEventListener('click', function(){
      loadAdminData();
    });

    checkExistingSession();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
