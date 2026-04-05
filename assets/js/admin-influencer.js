// Travirae - Influencer admin panel
(function(){
  'use strict';

  if (!document.body.classList.contains('page--admin-influencer')) return;
  if (!window.TraviraeInfluencers) return;

  var I = window.TraviraeInfluencers;
  var $ = I.$;
  var $all = I.$all;
  var t = I.t;
  var notify = I.notify;
  var safeJsonParse = I.safeJsonParse;
  var publicImageUrl = I.publicImageUrl;
  var formatMoney = I.formatMoney;
  var formatDate = I.formatDate;
  var LANG = I.getLang();

  var TEXT = {
    it: {
      title: 'Pannello influencer',
      creatorList: 'Creator',
      liveProfile: 'Profilo live',
      pendingProfile: 'Revisione profilo pending',
      livePost: 'Post live',
      pendingPost: 'Revisione post pending',
      profileMeta: 'Metadati profilo',
      postMeta: 'Metadati post',
      saveMeta: 'Salva metadati',
      noCreator: 'Nessun creator disponibile.',
      noPending: 'Nessuna revisione pending.',
      reviewNotes: 'Note revisione',
      creatorStats: 'Statistiche creator',
      logout: 'Esci',
      loginSuccess: 'Accesso admin influencer effettuato.',
      queueProfiles: 'Profili pending',
      queuePosts: 'Post pending',
      queueChanges: 'Modifiche pending',
      statusLive: 'Live',
      statusPending: 'Pending',
      noPosts: 'Nessun post associato a questo creator.',
      contentPreview: 'Anteprima contenuto',
      excerpt: 'Estratto',
      bio: 'Bio',
      displayName: 'Nome profilo',
      publicSlug: 'Slug pubblico',
      titleLabel: 'Titolo',
      postSlug: 'Slug post',
      saveOk: 'Aggiornamento admin salvato.'
    },
    en: {
      title: 'Influencer panel', creatorList: 'Creators', liveProfile: 'Live profile', pendingProfile: 'Pending profile review', livePost: 'Live post', pendingPost: 'Pending post review', profileMeta: 'Profile metadata', postMeta: 'Post metadata', saveMeta: 'Save metadata', noCreator: 'No creators available.', noPending: 'No pending review.', reviewNotes: 'Review notes', creatorStats: 'Creator stats', logout: 'Log out', loginSuccess: 'Influencer admin login successful.', queueProfiles: 'Pending profiles', queuePosts: 'Pending posts', queueChanges: 'Pending changes', statusLive: 'Live', statusPending: 'Pending', noPosts: 'No posts for this creator.', contentPreview: 'Content preview', excerpt: 'Excerpt', bio: 'Bio', displayName: 'Profile name', publicSlug: 'Public slug', titleLabel: 'Title', postSlug: 'Post slug', saveOk: 'Admin update saved.'
    }
  };
  function L(key){ var shared = t(key); return (TEXT[LANG] && TEXT[LANG][key]) || (shared !== key ? shared : '') || (TEXT.en && TEXT.en[key]) || key; }

  var ADMIN_EMAILS = ['serioliivan@gmail.com'];
  var client = window.supabaseAdminClient || window.supabaseClient || null;
  var state = {
    user: null,
    profiles: [],
    profileRevisions: [],
    posts: [],
    postRevisions: [],
    creatorStats: {},
    postKpis: {},
    selectedCreatorId: null
  };

  function isAdminEmail(email){
    return ADMIN_EMAILS.indexOf(String(email || '').trim().toLowerCase()) !== -1;
  }
  function loginView(){ return $('#if-admin-login-view'); }
  function dashboardView(){ return $('#if-admin-dashboard-view'); }
  function loginForm(){ return $('#if-admin-login-form'); }
  function setViews(showDashboard){
    if (loginView()) loginView().hidden = !!showDashboard;
    if (dashboardView()) dashboardView().hidden = !showDashboard;
  }
  function escapeHtml(str){ return I.escapeHtml(str); }
  function statusBadge(status){ return '<span class="if-status-badge is-' + escapeHtml(status || 'draft') + '">' + escapeHtml(String(status || '—')) + '</span>'; }

  async function initSession(){
    if (!client || !client.auth) return setViews(false);
    try{
      var resp = await client.auth.getUser();
      var user = resp && resp.data && resp.data.user ? resp.data.user : null;
      if (user && isAdminEmail(user.email)){
        state.user = user;
        setViews(true);
        await loadAll();
      } else {
        setViews(false);
      }
    }catch(_){ setViews(false); }
  }

  function renderSkeleton(){
    var view = dashboardView();
    if (!view) return;
    view.innerHTML = '' +
      '<div class="if-admin-shell">' +
        '<div class="if-section-head"><div><h2>' + escapeHtml(L('title')) + '</h2><p class="muted small">Travirae + creator moderation</p></div><button class="btn secondary" id="if-admin-logout-btn" type="button">' + escapeHtml(L('logout')) + '</button></div>' +
        '<div class="if-stats-grid if-stats-grid--compact" id="if-admin-queue-cards"></div>' +
        '<div class="if-admin-layout">' +
          '<aside class="if-admin-sidebar"><h3>' + escapeHtml(L('creatorList')) + '</h3><div id="if-admin-creator-list"></div></aside>' +
          '<section class="if-admin-detail" id="if-admin-detail"></section>' +
        '</div>' +
      '</div>';
    var logout = $('#if-admin-logout-btn');
    if (logout) logout.addEventListener('click', async function(){ try{ await client.auth.signOut(); }catch(_){ } state.user = null; setViews(false); });
  }

  async function loadAll(){
    renderSkeleton();
    if (!client) return;
    var profilesResp = await client.from('influencer_profiles').select('*').order('updated_at', { ascending: false });
    state.profiles = profilesResp && profilesResp.data ? profilesResp.data : [];
    var profileRevisionsResp = await client.from('influencer_profile_revisions').select('*').order('created_at', { ascending: false });
    state.profileRevisions = profileRevisionsResp && profileRevisionsResp.data ? profileRevisionsResp.data : [];
    var postsResp = await client.from('influencer_posts').select('*').order('updated_at', { ascending: false });
    state.posts = postsResp && postsResp.data ? postsResp.data : [];
    var postRevisionsResp = await client.from('influencer_post_revisions').select('*').order('created_at', { ascending: false });
    state.postRevisions = postRevisionsResp && postRevisionsResp.data ? postRevisionsResp.data : [];
    var statsResp = await client.from('influencer_creator_private_stats').select('*');
    (statsResp && statsResp.data ? statsResp.data : []).forEach(function(row){ state.creatorStats[row.affiliate_slug] = row; });
    var kpiResp = await client.from('influencer_post_kpis').select('*');
    (kpiResp && kpiResp.data ? kpiResp.data : []).forEach(function(row){ state.postKpis[row.post_id] = row; });
    if (!state.selectedCreatorId && state.profiles.length) state.selectedCreatorId = state.profiles[0].id;
    renderQueueCards();
    renderCreatorList();
    renderCreatorDetail();
  }

  function findProfileRevision(id){ return state.profileRevisions.find(function(r){ return r.id === id; }) || null; }
  function findPostRevision(id){ return state.postRevisions.find(function(r){ return r.id === id; }) || null; }
  function postsByProfile(profileId){ return state.posts.filter(function(p){ return p.profile_id === profileId && p.status !== 'deleted'; }); }

  function renderQueueCards(){
    var el = $('#if-admin-queue-cards');
    if (!el) return;
    var pendingProfiles = state.profileRevisions.filter(function(r){ return r.status === 'pending_review'; }).length;
    var pendingPosts = state.postRevisions.filter(function(r){ return r.status === 'pending_review'; }).length;
    var pendingChanges = state.postRevisions.filter(function(r){
      if (r.status !== 'pending_review') return false;
      var post = state.posts.find(function(p){ return p.id === r.post_id; });
      return !!(post && post.current_live_revision_id);
    }).length;
    var cards = [
      { label: L('queueProfiles'), value: pendingProfiles },
      { label: L('queuePosts'), value: pendingPosts },
      { label: L('queueChanges'), value: pendingChanges }
    ];
    el.innerHTML = cards.map(function(item){ return '<div class="stat-card"><div class="stat-label">' + escapeHtml(item.label) + '</div><div class="stat-value">' + escapeHtml(String(item.value)) + '</div></div>'; }).join('');
  }

  function renderCreatorList(){
    var el = $('#if-admin-creator-list');
    if (!el) return;
    if (!state.profiles.length){ el.innerHTML = '<div class="if-empty-state">' + escapeHtml(L('noCreator')) + '</div>'; return; }
    el.innerHTML = state.profiles.map(function(profile){
      var postsCount = postsByProfile(profile.id).length;
      var hasPendingProfile = !!(profile.current_pending_revision_id && (function(){ var pr = findProfileRevision(profile.current_pending_revision_id); return pr && pr.status !== 'published'; })());
      var hasPendingPost = postsByProfile(profile.id).some(function(post){ var rev = post.current_pending_revision_id ? findPostRevision(post.current_pending_revision_id) : null; return rev && rev.status === 'pending_review'; });
      return '' +
        '<button class="if-admin-creator-btn' + (state.selectedCreatorId === profile.id ? ' is-active' : '') + '" type="button" data-creator-id="' + escapeHtml(profile.id) + '">' +
          '<strong>' + escapeHtml(profile.display_name || profile.affiliate_slug) + '</strong>' +
          '<span class="muted small">' + escapeHtml(profile.affiliate_slug) + '</span>' +
          '<span class="if-admin-creator-flags">' + (hasPendingProfile ? '<span class="chip">P</span>' : '') + (hasPendingPost ? '<span class="chip">Post</span>' : '') + '<span class="muted small">' + postsCount + '</span></span>' +
        '</button>';
    }).join('');
    $all('[data-creator-id]', el).forEach(function(btn){
      btn.addEventListener('click', function(){ state.selectedCreatorId = btn.getAttribute('data-creator-id'); renderCreatorList(); renderCreatorDetail(); });
    });
  }

  function profilePreviewCard(label, revision, isLive){
    if (!revision) return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    var social = typeof revision.social_links === 'string' ? safeJsonParse(revision.social_links, {}) : (revision.social_links || {});
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head">' + statusBadge(revision.status || (isLive ? 'published' : 'draft')) + '<h4>' + escapeHtml(label) + '</h4></div>' +
        '<div class="if-admin-review-card__body">' +
          '<div class="if-admin-profile-preview">' +
            (revision.avatar_path ? '<img class="if-profile-avatar" loading="lazy" src="' + escapeHtml(publicImageUrl('influencer-avatars', revision.avatar_path)) + '" alt=""/>' : '<div class="if-profile-avatar if-profile-avatar--placeholder">' + escapeHtml((revision.display_name || 'C').slice(0,1).toUpperCase()) + '</div>') +
            '<div><h5>' + escapeHtml(revision.display_name || '—') + '</h5><div class="muted small">' + escapeHtml(revision.public_slug || '') + '</div><p class="muted">' + escapeHtml(revision.bio || '') + '</p>' + I.renderSocialLinks(social) + '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderCreatorDetail(){
    var el = $('#if-admin-detail');
    if (!el) return;
    var profile = state.profiles.find(function(item){ return item.id === state.selectedCreatorId; }) || null;
    if (!profile){ el.innerHTML = '<div class="if-empty-state">' + escapeHtml(L('noCreator')) + '</div>'; return; }
    var pendingProfile = profile.current_pending_revision_id ? findProfileRevision(profile.current_pending_revision_id) : null;
    var liveProfile = profile.current_published_revision_id ? findProfileRevision(profile.current_published_revision_id) : profile;
    var creatorPosts = postsByProfile(profile.id);
    var creatorStat = state.creatorStats[profile.affiliate_slug] || {};

    el.innerHTML = '' +
      '<section class="if-admin-detail-section">' +
        '<div class="if-section-head"><div><h3>' + escapeHtml(profile.display_name || profile.affiliate_slug) + '</h3><p class="muted small">' + escapeHtml(profile.affiliate_slug) + '</p></div></div>' +
        '<div class="if-stats-grid if-stats-grid--compact">' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('cardImpressions')) + '</div><div class="stat-value">' + escapeHtml(String(creatorStat.card_impressions || 0)) + '</div></div>' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('postOpens')) + '</div><div class="stat-value">' + escapeHtml(String(creatorStat.post_opens || 0)) + '</div></div>' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('widgetClicks')) + '</div><div class="stat-value">' + escapeHtml(String(creatorStat.widget_clicks || 0)) + '</div></div>' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('confirmedRevenue')) + '</div><div class="stat-value">' + escapeHtml(formatMoney(creatorStat.confirmed_revenue_usd || 0)) + '</div></div>' +
        '</div>' +
      '</section>' +
      '<section class="if-admin-detail-section">' +
        '<div class="if-two-col">' +
          '<div>' + profilePreviewCard(L('liveProfile'), liveProfile, true) + renderProfileMetaEditor(profile) + '</div>' +
          '<div>' + profilePreviewCard(L('pendingProfile'), pendingProfile, false) + renderProfileReviewActions(profile, pendingProfile) + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="if-admin-detail-section">' +
        '<div class="if-section-head"><div><h3>' + escapeHtml(L('livePost')) + '</h3></div></div>' +
        '<div id="if-admin-posts-wrap">' + (creatorPosts.length ? creatorPosts.map(renderPostAdminCard).join('') : '<div class="if-empty-state">' + escapeHtml(L('noPosts')) + '</div>') + '</div>' +
      '</section>';

    bindDetailEvents(profile, pendingProfile, creatorPosts);
  }

  function renderProfileMetaEditor(profile){
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(L('profileMeta')) + '</h4></div>' +
        '<div class="if-admin-review-card__body">' +
          '<div class="form-group"><label>' + escapeHtml(L('displayName')) + '</label><input type="text" data-profile-meta="display_name" value="' + escapeHtml(profile.display_name || '') + '"/></div>' +
          '<div class="form-group"><label>' + escapeHtml(L('publicSlug')) + '</label><input type="text" data-profile-meta="public_slug" value="' + escapeHtml(profile.public_slug || '') + '"/></div>' +
          '<div class="form-group"><label>' + escapeHtml(L('bio')) + '</label><textarea rows="4" data-profile-meta="bio">' + escapeHtml(profile.bio || '') + '</textarea></div>' +
          '<div class="auth-actions"><button class="btn secondary" type="button" data-save-profile-meta="' + escapeHtml(profile.id) + '">' + escapeHtml(L('saveMeta')) + '</button></div>' +
        '</div>' +
      '</article>';
  }

  function renderProfileReviewActions(profile, pendingProfile){
    if (!pendingProfile || pendingProfile.status === 'published') return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(L('reviewNotes')) + '</h4></div>' +
        '<div class="if-admin-review-card__body">' +
          '<textarea rows="4" data-review-notes-profile="' + escapeHtml(profile.id) + '">' + escapeHtml(pendingProfile.review_notes || '') + '</textarea>' +
          '<div class="auth-actions if-inline-actions">' +
            '<button class="btn" type="button" data-review-profile="approve" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('approve')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-profile="changes_requested" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('requestChanges')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-profile="reject" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('reject')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-profile="archive" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('archive')) + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function revisionPreviewHtml(revision, type){
    if (!revision) return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    var contentHtml = revision.content_html || '';
    return '' +
      '<div class="if-post-revision-preview">' +
        (revision.cover_path ? '<img class="if-cover-thumb" loading="lazy" src="' + escapeHtml(publicImageUrl('influencer-post-media', revision.cover_path)) + '" alt=""/>' : '') +
        '<h5>' + escapeHtml(revision.title || '—') + '</h5>' +
        '<p class="muted">' + escapeHtml(revision.excerpt || '') + '</p>' +
        '<details><summary>' + escapeHtml(L('contentPreview')) + '</summary><div class="if-modal-preview-content">' + contentHtml + '</div></details>' +
      '</div>';
  }

  function renderPostAdminCard(post){
    var liveRev = post.current_live_revision_id ? findPostRevision(post.current_live_revision_id) : (post.title ? { title: post.title, excerpt: post.excerpt, cover_path: post.cover_path, content_html: '' } : null);
    var pendingRev = post.current_pending_revision_id ? findPostRevision(post.current_pending_revision_id) : null;
    var kpi = state.postKpis[post.id] || {};
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><div><h4>' + escapeHtml(post.title || post.post_slug || 'Post') + '</h4><div class="muted small">' + escapeHtml(post.post_slug || '') + ' · ' + escapeHtml(formatDate(post.updated_at || post.created_at)) + '</div></div>' + statusBadge(post.status) + '</div>' +
        '<div class="if-post-kpi-row">' +
          '<span><strong>' + escapeHtml(String(kpi.card_impressions || 0)) + '</strong> ' + escapeHtml(t('cardImpressions')) + '</span>' +
          '<span><strong>' + escapeHtml(String(kpi.post_opens || 0)) + '</strong> ' + escapeHtml(t('postOpens')) + '</span>' +
          '<span><strong>' + escapeHtml(String(kpi.widget_clicks || 0)) + '</strong> ' + escapeHtml(t('widgetClicks')) + '</span>' +
          '<span><strong>' + escapeHtml(formatMoney(kpi.confirmed_revenue_usd || 0)) + '</strong> ' + escapeHtml(t('confirmedRevenue')) + '</span>' +
        '</div>' +
        '<div class="if-two-col">' +
          '<div>' +
            '<h5>' + escapeHtml(L('livePost')) + '</h5>' + revisionPreviewHtml(liveRev, 'live') +
            '<div class="if-admin-inline-editor">' +
              '<div class="form-group"><label>' + escapeHtml(L('titleLabel')) + '</label><input type="text" data-post-meta="title" data-post-id="' + escapeHtml(post.id) + '" value="' + escapeHtml(post.title || '') + '"/></div>' +
              '<div class="form-group"><label>' + escapeHtml(L('postSlug')) + '</label><input type="text" data-post-meta="post_slug" data-post-id="' + escapeHtml(post.id) + '" value="' + escapeHtml(post.post_slug || '') + '"/></div>' +
              '<div class="form-group"><label>' + escapeHtml(L('excerpt')) + '</label><textarea rows="3" data-post-meta="excerpt" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(post.excerpt || '') + '</textarea></div>' +
              '<div class="auth-actions"><button class="btn secondary" type="button" data-save-post-meta="' + escapeHtml(post.id) + '">' + escapeHtml(L('saveMeta')) + '</button></div>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h5>' + escapeHtml(L('pendingPost')) + '</h5>' + revisionPreviewHtml(pendingRev, 'pending') +
            '<textarea rows="3" data-review-notes-post="' + escapeHtml(post.id) + '">' + escapeHtml((pendingRev && pendingRev.review_notes) || '') + '</textarea>' +
            '<div class="auth-actions if-inline-actions">' +
              '<button class="btn" type="button" data-review-post="approve" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('approve')) + '</button>' +
              '<button class="btn secondary" type="button" data-review-post="changes_requested" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('requestChanges')) + '</button>' +
              '<button class="btn secondary" type="button" data-review-post="reject" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('reject')) + '</button>' +
              '<button class="btn secondary" type="button" data-review-post="archive" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('archive')) + '</button>' +
              '<button class="btn secondary" type="button" data-review-post="delete" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('logicalDelete')) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  async function saveProfileMeta(profileId){
    var inputs = $all('[data-profile-meta]');
    var payload = {};
    inputs.forEach(function(input){ payload[input.getAttribute('data-profile-meta')] = input.value; });
    try{
      var upd = await client.from('influencer_profiles').update(payload).eq('id', profileId);
      if (upd && upd.error) throw upd.error;
      var profile = state.profiles.find(function(item){ return item.id === profileId; });
      if (profile && profile.current_published_revision_id){
        await client.from('influencer_profile_revisions').update({ display_name: payload.display_name, public_slug: payload.public_slug, bio: payload.bio }).eq('id', profile.current_published_revision_id);
      }
      notify(L('saveOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore salvataggio metadati profilo.', 'error'); }
  }

  async function savePostMeta(postId){
    var inputs = $all('[data-post-meta][data-post-id="' + postId + '"]');
    var payload = {};
    inputs.forEach(function(input){ payload[input.getAttribute('data-post-meta')] = input.value; });
    try{
      var upd = await client.from('influencer_posts').update(payload).eq('id', postId);
      if (upd && upd.error) throw upd.error;
      var post = state.posts.find(function(item){ return item.id === postId; });
      if (post && post.current_live_revision_id){
        await client.from('influencer_post_revisions').update({ title: payload.title, excerpt: payload.excerpt }).eq('id', post.current_live_revision_id);
      }
      notify(L('saveOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore salvataggio metadati post.', 'error'); }
  }

  async function reviewProfile(profileId, action){
    var notesInput = $('[data-review-notes-profile="' + profileId + '"]');
    var notes = notesInput ? notesInput.value : null;
    try{
      var resp = await client.rpc('review_influencer_profile', { p_profile_id: profileId, p_action: action, p_notes: notes || null });
      if (resp && resp.error) throw resp.error;
      notify(L('saveOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore revisione profilo.', 'error'); }
  }

  async function reviewPost(postId, action){
    var notesInput = $('[data-review-notes-post="' + postId + '"]');
    var notes = notesInput ? notesInput.value : null;
    try{
      var resp = await client.rpc('review_influencer_post', { p_post_id: postId, p_action: action, p_notes: notes || null });
      if (resp && resp.error) throw resp.error;
      notify(L('saveOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore revisione post.', 'error'); }
  }

  function bindDetailEvents(profile, pendingProfile, creatorPosts){
    var saveProfile = $('[data-save-profile-meta="' + profile.id + '"]');
    if (saveProfile) saveProfile.addEventListener('click', function(){ saveProfileMeta(profile.id); });
    $all('[data-review-profile]').forEach(function(btn){
      btn.addEventListener('click', function(){ reviewProfile(btn.getAttribute('data-profile-id'), btn.getAttribute('data-review-profile')); });
    });
    creatorPosts.forEach(function(post){
      var savePost = $('[data-save-post-meta="' + post.id + '"]');
      if (savePost) savePost.addEventListener('click', function(){ savePostMeta(post.id); });
    });
    $all('[data-review-post]').forEach(function(btn){
      btn.addEventListener('click', function(){ reviewPost(btn.getAttribute('data-post-id'), btn.getAttribute('data-review-post')); });
    });
  }

  var form = loginForm();
  if (form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      if (!client || !client.auth) return;
      var email = ($('#if-admin-email') || {}).value || '';
      var password = ($('#if-admin-password') || {}).value || '';
      try{
        var res = await client.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        var user = res.data && res.data.user ? res.data.user : (res.data && res.data.session && res.data.session.user ? res.data.session.user : null);
        if (!user || !isAdminEmail(user.email)){
          try{ await client.auth.signOut(); }catch(_){ }
          throw new Error('Questo account non è admin.');
        }
        state.user = user;
        setViews(true);
        notify(L('loginSuccess'), 'success');
        await loadAll();
      }catch(err){
        console.error(err);
        notify(err.message || 'Errore login admin.', 'error');
      }
    });
  }

  initSession();
})();
