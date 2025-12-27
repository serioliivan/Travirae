// Travirae - Admin Affiliati dashboard
(function(){
  'use strict';

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

    initSession();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
