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
      creatorHint: 'Clicca un creator per aprire o chiudere profilo, revisioni e post.',
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
      logout: 'Esci',
      loginSuccess: 'Accesso admin influencer effettuato.',
      queueProfiles: 'Profili pending',
      queuePosts: 'Post pending',
      queueChanges: 'Modifiche pending',
      noPosts: 'Nessun post associato a questo creator.',
      contentPreview: 'Anteprima contenuto',
      excerpt: 'Estratto',
      bio: 'Bio',
      displayName: 'Nome profilo',
      publicSlug: 'Slug pubblico',
      titleLabel: 'Titolo',
      postSlug: 'Slug post',
      saveOk: 'Aggiornamento admin salvato.',
      deleteProfile: 'Elimina profilo',
      deletePost: 'Elimina post',
      requestChangesLive: 'Richiedi modifiche',
      confirmDeleteProfile: 'Sei sicuro di voler eliminare questo profilo? Il creator verrà sospeso e i contenuti pubblici non saranno più visibili.',
      confirmDeletePost: 'Sei sicuro di voler eliminare questo post?',
      confirmArchivePost: 'Sei sicuro di voler archiviare questo post?',
      yesDelete: 'Sì, elimina',
      yesArchive: 'Sì, archivia',
      no: 'Annulla',
      actions: 'Azioni admin',
      closeCreator: 'Chiudi',
      openCreator: 'Apri',
      deletedOk: 'Elemento aggiornato con successo.',
      profileDeletedOk: 'Profilo sospeso correttamente.',
      postDeletedOk: 'Post eliminato correttamente.',
      archivePost: 'Archivia post',
      liveActions: 'Azioni sul contenuto live'
    },
    en: {
      title: 'Influencer panel',
      creatorList: 'Creators',
      creatorHint: 'Click a creator to open or close profile, reviews and posts.',
      liveProfile: 'Live profile',
      pendingProfile: 'Pending profile review',
      livePost: 'Live post',
      pendingPost: 'Pending post review',
      profileMeta: 'Profile metadata',
      postMeta: 'Post metadata',
      saveMeta: 'Save metadata',
      noCreator: 'No creators available.',
      noPending: 'No pending review.',
      reviewNotes: 'Review notes',
      logout: 'Log out',
      loginSuccess: 'Influencer admin login successful.',
      queueProfiles: 'Pending profiles',
      queuePosts: 'Pending posts',
      queueChanges: 'Pending changes',
      noPosts: 'No posts for this creator.',
      contentPreview: 'Content preview',
      excerpt: 'Excerpt',
      bio: 'Bio',
      displayName: 'Profile name',
      publicSlug: 'Public slug',
      titleLabel: 'Title',
      postSlug: 'Post slug',
      saveOk: 'Admin update saved.',
      deleteProfile: 'Delete profile',
      deletePost: 'Delete post',
      requestChangesLive: 'Request changes',
      confirmDeleteProfile: 'Are you sure you want to delete this profile? The creator will be suspended and public content will no longer be visible.',
      confirmDeletePost: 'Are you sure you want to delete this post?',
      confirmArchivePost: 'Are you sure you want to archive this post?',
      yesDelete: 'Yes, delete',
      yesArchive: 'Yes, archive',
      no: 'Cancel',
      actions: 'Admin actions',
      closeCreator: 'Close',
      openCreator: 'Open',
      deletedOk: 'Item updated successfully.',
      profileDeletedOk: 'Profile suspended successfully.',
      postDeletedOk: 'Post deleted successfully.',
      archivePost: 'Archive post',
      liveActions: 'Actions on live content'
    }
  };
  function L(key){
    var shared = t(key);
    return (TEXT[LANG] && TEXT[LANG][key]) || (shared !== key ? shared : '') || (TEXT.en && TEXT.en[key]) || key;
  }

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
    openCreatorId: null,
    confirmAction: null
  };

  function isAdminEmail(email){
    return ADMIN_EMAILS.indexOf(String(email || '').trim().toLowerCase()) !== -1;
  }
  function loginView(){ return $('#if-admin-login-view'); }
  function dashboardView(){ return $('#if-admin-dashboard-view'); }
  function loginForm(){ return $('#if-admin-login-form'); }
  function setAdminTabsVisibility(show){
    $all('.if-admin-auth-tabs').forEach(function(el){
      if (show) el.removeAttribute('hidden');
      else el.setAttribute('hidden', 'hidden');
    });
  }
  function redirectToAdminLogin(){
    var target = I.buildPagePath('admin-affiliati.html');
    if (window.location.pathname && window.location.pathname.indexOf(target) !== -1) return;
    window.location.replace(target);
  }
  function setViews(showDashboard){
    if (loginView()) loginView().hidden = !!showDashboard;
    if (dashboardView()) dashboardView().hidden = !showDashboard;
    var staticHeader = $('.admin-header');
    if (staticHeader) staticHeader.hidden = !!showDashboard;
    document.body.classList.toggle('if-admin-authenticated', !!showDashboard);
    setAdminTabsVisibility(!!showDashboard);
  }
  function escapeHtml(str){ return I.escapeHtml(str); }
  function statusBadge(status){ return '<span class="if-status-badge is-' + escapeHtml(status || 'draft') + '">' + escapeHtml(String(status || '—')) + '</span>'; }

  async function initSession(){
    if (!client || !client.auth){
      setViews(false);
      redirectToAdminLogin();
      return;
    }
    try{
      var resp = await client.auth.getUser();
      var user = resp && resp.data && resp.data.user ? resp.data.user : null;
      if (user && isAdminEmail(user.email)){
        state.user = user;
        setViews(true);
        await loadAll();
      } else {
        setViews(false);
        redirectToAdminLogin();
      }
    }catch(_){
      setViews(false);
      redirectToAdminLogin();
    }
  }

  function renderSkeleton(){
    var view = dashboardView();
    if (!view) return;
    view.innerHTML = '' +
      '<div class="if-admin-shell if-admin-shell--accordion">' +
        '<div class="if-admin-topbar">' +
          '<div class="if-admin-topbar__copy"><span class="chip">Travirae Creator</span><h2>' + escapeHtml(L('title')) + '</h2><p class="muted small">' + escapeHtml(L('creatorHint')) + '</p></div>' +
          '<button class="btn secondary" id="if-admin-logout-btn" type="button">' + escapeHtml(L('logout')) + '</button>' +
        '</div>' +
        '<div class="if-stats-grid if-stats-grid--compact" id="if-admin-queue-cards"></div>' +
        '<section class="if-admin-directory-card if-admin-detail-section">' +
          '<div class="if-section-head"><div><h3>' + escapeHtml(L('creatorList')) + '</h3><p class="muted small">' + escapeHtml(L('creatorHint')) + '</p></div></div>' +
          '<div class="if-admin-accordion-list" id="if-admin-creator-list"></div>' +
        '</section>' +
      '</div>' +
      '<div class="if-admin-popup" hidden id="if-admin-confirm-popup">' +
        '<div class="if-admin-popup__backdrop" data-admin-popup-close="1"></div>' +
        '<div class="if-admin-popup__dialog">' +
          '<button class="if-admin-popup__close" type="button" data-admin-popup-close="1">×</button>' +
          '<div class="if-admin-popup__message" id="if-admin-confirm-message"></div>' +
          '<div class="auth-actions if-inline-actions if-admin-popup__actions" id="if-admin-confirm-actions"></div>' +
        '</div>' +
      '</div>';

    var logout = $('#if-admin-logout-btn');
    if (logout) logout.addEventListener('click', async function(){
      try{ await client.auth.signOut(); }catch(_){ }
      state.user = null;
      setViews(false);
      redirectToAdminLogin();
    });

    view.addEventListener('click', onDashboardClick);
  }

  function findProfileRevision(id){ return state.profileRevisions.find(function(r){ return r.id === id; }) || null; }
  function findPostRevision(id){ return state.postRevisions.find(function(r){ return r.id === id; }) || null; }
  function findProfile(id){ return state.profiles.find(function(item){ return item.id === id; }) || null; }
  function findPost(id){ return state.posts.find(function(item){ return item.id === id; }) || null; }
  function postsByProfile(profileId){ return state.posts.filter(function(p){ return p.profile_id === profileId && p.status !== 'deleted'; }); }
  function isCurrentPendingProfileRevision(revision){
    if (!revision || revision.status !== 'pending_review') return false;
    var profile = state.profiles.find(function(item){ return item.id === revision.profile_id; });
    return !!(profile && profile.current_pending_revision_id === revision.id);
  }
  function isCurrentPendingPostRevision(revision){
    if (!revision || revision.status !== 'pending_review') return false;
    var post = state.posts.find(function(item){ return item.id === revision.post_id; });
    return !!(post && post.status !== 'deleted' && post.current_pending_revision_id === revision.id);
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
    renderQueueCards();
    renderCreatorList();
  }

  function renderQueueCards(){
    var el = $('#if-admin-queue-cards');
    if (!el) return;
    var pendingProfiles = state.profileRevisions.filter(isCurrentPendingProfileRevision).length;
    var pendingPosts = state.postRevisions.filter(isCurrentPendingPostRevision).length;
    var pendingChanges = state.postRevisions.filter(function(r){
      if (!isCurrentPendingPostRevision(r)) return false;
      var post = state.posts.find(function(p){ return p.id === r.post_id; });
      return !!(post && post.current_live_revision_id);
    }).length;
    var cards = [
      { label: L('queueProfiles'), value: pendingProfiles },
      { label: L('queuePosts'), value: pendingPosts },
      { label: L('queueChanges'), value: pendingChanges }
    ];
    el.innerHTML = cards.map(function(item){
      return '<div class="stat-card"><div class="stat-label">' + escapeHtml(item.label) + '</div><div class="stat-value">' + escapeHtml(String(item.value)) + '</div></div>';
    }).join('');
  }

  function renderCreatorList(){
    var el = $('#if-admin-creator-list');
    if (!el) return;
    if (!state.profiles.length){
      el.innerHTML = '<div class="if-empty-state">' + escapeHtml(L('noCreator')) + '</div>';
      return;
    }
    el.innerHTML = state.profiles.map(renderCreatorAccordion).join('');
  }

  function renderCreatorAccordion(profile){
    var creatorPosts = postsByProfile(profile.id);
    var hasPendingProfile = !!(profile.current_pending_revision_id && findProfileRevision(profile.current_pending_revision_id));
    var hasPendingPost = creatorPosts.some(function(post){ return !!(post.current_pending_revision_id && findPostRevision(post.current_pending_revision_id)); });
    var isOpen = state.openCreatorId === profile.id;
    return '' +
      '<article class="if-admin-accordion' + (isOpen ? ' is-open' : '') + '" data-creator-wrap="' + escapeHtml(profile.id) + '">' +
        '<button class="if-admin-accordion__toggle" type="button" data-toggle-creator="' + escapeHtml(profile.id) + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
          '<span class="if-admin-accordion__identity"><strong>' + escapeHtml(profile.display_name || profile.affiliate_slug) + '</strong><span class="muted small">' + escapeHtml(profile.affiliate_slug) + '</span></span>' +
          '<span class="if-admin-accordion__summary">' +
            (hasPendingProfile ? '<span class="chip">P</span>' : '') +
            (hasPendingPost ? '<span class="chip">Post</span>' : '') +
            '<span class="muted small">' + escapeHtml(String(creatorPosts.length)) + '</span>' +
            '<span class="if-admin-accordion__caret">' + (isOpen ? '−' : '+') + '</span>' +
          '</span>' +
        '</button>' +
        '<div class="if-admin-accordion__panel"' + (isOpen ? '' : ' hidden') + '>' + renderCreatorPanel(profile) + '</div>' +
      '</article>';
  }

  function renderProfilePreviewCard(label, revision){
    if (!revision) return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    var social = typeof revision.social_links === 'string' ? safeJsonParse(revision.social_links, {}) : (revision.social_links || {});
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(label) + '</h4>' + statusBadge(revision.status || 'draft') + '</div>' +
        '<div class="if-admin-review-card__body">' +
          '<div class="if-admin-profile-preview">' +
            (revision.avatar_path ? '<img class="if-profile-avatar" loading="lazy" src="' + escapeHtml(publicImageUrl('influencer-avatars', revision.avatar_path)) + '" alt=""/>' : '<div class="if-profile-avatar if-profile-avatar--placeholder">' + escapeHtml((revision.display_name || 'C').slice(0,1).toUpperCase()) + '</div>') +
            '<div><h5>' + escapeHtml(revision.display_name || '—') + '</h5><div class="muted small">' + escapeHtml(revision.public_slug || '') + '</div><p class="muted">' + escapeHtml(revision.bio || '') + '</p>' + I.renderSocialLinks(social) + '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderProfileMetaEditor(profile){
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(L('profileMeta')) + '</h4></div>' +
        '<div class="if-admin-review-card__body">' +
          '<div class="form-group"><label>' + escapeHtml(L('displayName')) + '</label><input type="text" data-profile-meta="display_name" data-profile-id="' + escapeHtml(profile.id) + '" value="' + escapeHtml(profile.display_name || '') + '"/></div>' +
          '<div class="form-group"><label>' + escapeHtml(L('publicSlug')) + '</label><input type="text" data-profile-meta="public_slug" data-profile-id="' + escapeHtml(profile.id) + '" value="' + escapeHtml(profile.public_slug || '') + '"/></div>' +
          '<div class="form-group"><label>' + escapeHtml(L('bio')) + '</label><textarea rows="4" data-profile-meta="bio" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(profile.bio || '') + '</textarea></div>' +
          '<div class="form-group"><label>' + escapeHtml(L('reviewNotes')) + '</label><textarea rows="3" data-live-profile-notes="' + escapeHtml(profile.id) + '">' + escapeHtml(profile.review_notes || '') + '</textarea></div>' +
          '<div class="auth-actions if-inline-actions">' +
            '<button class="btn secondary" type="button" data-save-profile-meta="' + escapeHtml(profile.id) + '">' + escapeHtml(L('saveMeta')) + '</button>' +
            '<button class="btn secondary" type="button" data-live-profile-action="changes_requested" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(L('requestChangesLive')) + '</button>' +
            '<button class="btn secondary" type="button" data-live-profile-action="delete" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(L('deleteProfile')) + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderPendingProfileCard(profile, pendingProfile){
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(L('pendingProfile')) + '</h4></div>' +
        '<div class="if-admin-review-card__body">' +
          revisionPreviewProfileOnly(pendingProfile) +
          (pendingProfile ? '<textarea rows="4" data-review-notes-profile="' + escapeHtml(profile.id) + '">' + escapeHtml(pendingProfile.review_notes || '') + '</textarea>' : '') +
          (pendingProfile ? '<div class="auth-actions if-inline-actions">' +
            '<button class="btn" type="button" data-review-profile="approve" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('approve')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-profile="changes_requested" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('requestChanges')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-profile="reject" data-profile-id="' + escapeHtml(profile.id) + '">' + escapeHtml(t('reject')) + '</button>' +
          '</div>' : '') +
        '</div>' +
      '</article>';
  }

  function revisionPreviewProfileOnly(revision){
    if (!revision) return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    return renderProfilePreviewCard(L('pendingProfile'), revision);
  }

  function renderPostPreview(revision, title){
    if (!revision) return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    var blocks = typeof revision.content_json === 'string' ? safeJsonParse(revision.content_json, []) : (revision.content_json || []);
    var contentHtml = (Array.isArray(blocks) && blocks.length && typeof I.renderContentHtml === 'function')
      ? I.renderContentHtml(blocks, { creatorSlug: '', postShortId: '', postId: revision.post_id || null, postSlug: '' })
      : (revision.content_html || '');
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(title) + '</h4>' + statusBadge(revision.status || 'draft') + '</div>' +
        '<div class="if-admin-review-card__body">' +
          '<div class="if-post-revision-preview">' +
            (revision.cover_path ? '<img class="if-cover-thumb" loading="lazy" src="' + escapeHtml(publicImageUrl('influencer-post-media', revision.cover_path)) + '" alt=""/>' : '') +
            '<h5>' + escapeHtml(revision.title || '—') + '</h5>' +
            '<p class="muted">' + escapeHtml(revision.excerpt || '') + '</p>' +
            '<details><summary>' + escapeHtml(L('contentPreview')) + '</summary><div class="if-modal-preview-content">' + contentHtml + '</div></details>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderPostLiveEditor(post, liveRev){
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(L('livePost')) + '</h4>' + statusBadge(post.status) + '</div>' +
        '<div class="if-admin-review-card__body">' +
          revisionPreviewBody(liveRev) +
          '<div class="if-admin-inline-editor">' +
            '<div class="form-group"><label>' + escapeHtml(L('titleLabel')) + '</label><input type="text" data-post-meta="title" data-post-id="' + escapeHtml(post.id) + '" value="' + escapeHtml(post.title || '') + '"/></div>' +
            '<div class="form-group"><label>' + escapeHtml(L('postSlug')) + '</label><input type="text" data-post-meta="post_slug" data-post-id="' + escapeHtml(post.id) + '" value="' + escapeHtml(post.post_slug || '') + '"/></div>' +
            '<div class="form-group"><label>' + escapeHtml(L('excerpt')) + '</label><textarea rows="3" data-post-meta="excerpt" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(post.excerpt || '') + '</textarea></div>' +
            '<div class="form-group"><label>' + escapeHtml(L('reviewNotes')) + '</label><textarea rows="3" data-live-post-notes="' + escapeHtml(post.id) + '">' + escapeHtml(post.review_notes || '') + '</textarea></div>' +
            '<div class="auth-actions if-inline-actions">' +
              '<button class="btn secondary" type="button" data-save-post-meta="' + escapeHtml(post.id) + '">' + escapeHtml(L('saveMeta')) + '</button>' +
              '<button class="btn secondary" type="button" data-live-post-action="changes_requested" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(L('requestChangesLive')) + '</button>' +
              '<button class="btn secondary" type="button" data-live-post-action="archive" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(L('archivePost')) + '</button>' +
              '<button class="btn secondary" type="button" data-live-post-action="delete" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(L('deletePost')) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function revisionPreviewBody(revision){
    if (!revision) return '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>';
    var blocks = typeof revision.content_json === 'string' ? safeJsonParse(revision.content_json, []) : (revision.content_json || []);
    var contentHtml = (Array.isArray(blocks) && blocks.length && typeof I.renderContentHtml === 'function')
      ? I.renderContentHtml(blocks, { creatorSlug: '', postShortId: '', postId: revision.post_id || null, postSlug: '' })
      : (revision.content_html || '');
    return '' +
      '<div class="if-post-revision-preview">' +
        (revision.cover_path ? '<img class="if-cover-thumb" loading="lazy" src="' + escapeHtml(publicImageUrl('influencer-post-media', revision.cover_path)) + '" alt=""/>' : '') +
        '<h5>' + escapeHtml(revision.title || '—') + '</h5>' +
        '<p class="muted">' + escapeHtml(revision.excerpt || '') + '</p>' +
        '<details><summary>' + escapeHtml(L('contentPreview')) + '</summary><div class="if-modal-preview-content">' + contentHtml + '</div></details>' +
      '</div>';
  }

  function renderPostPendingCard(post, pendingRev){
    return '' +
      '<article class="if-admin-review-card">' +
        '<div class="if-admin-review-card__head"><h4>' + escapeHtml(L('pendingPost')) + '</h4></div>' +
        '<div class="if-admin-review-card__body">' +
          (pendingRev ? revisionPreviewBody(pendingRev) : '<div class="if-empty-state">' + escapeHtml(L('noPending')) + '</div>') +
          (pendingRev ? '<textarea rows="3" data-review-notes-post="' + escapeHtml(post.id) + '">' + escapeHtml(pendingRev.review_notes || '') + '</textarea>' : '') +
          (pendingRev ? '<div class="auth-actions if-inline-actions">' +
            '<button class="btn" type="button" data-review-post="approve" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('approve')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-post="changes_requested" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('requestChanges')) + '</button>' +
            '<button class="btn secondary" type="button" data-review-post="reject" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('reject')) + '</button>' +
          '</div>' : '') +
        '</div>' +
      '</article>';
  }

  function renderPostCard(post){
    var liveRev = post.current_live_revision_id ? findPostRevision(post.current_live_revision_id) : null;
    var pendingRev = post.current_pending_revision_id ? findPostRevision(post.current_pending_revision_id) : null;
    var kpi = state.postKpis[post.id] || {};
    return '' +
      '<article class="if-admin-post-card">' +
        '<div class="if-admin-post-head"><div><h4>' + escapeHtml(post.title || post.post_slug || 'Post') + '</h4><div class="muted small">' + escapeHtml(post.post_slug || '') + ' · ' + escapeHtml(formatDate(post.updated_at || post.created_at)) + '</div></div>' + statusBadge(post.status) + '</div>' +
        '<div class="if-post-kpi-row">' +
          '<span><strong>' + escapeHtml(String(kpi.card_impressions || 0)) + '</strong> ' + escapeHtml(t('cardImpressions')) + '</span>' +
          '<span><strong>' + escapeHtml(String(kpi.post_opens || 0)) + '</strong> ' + escapeHtml(t('postOpens')) + '</span>' +
          '<span><strong>' + escapeHtml(String(kpi.widget_clicks || 0)) + '</strong> ' + escapeHtml(t('widgetClicks')) + '</span>' +
          '<span><strong>' + escapeHtml(formatMoney(kpi.confirmed_revenue_usd || 0)) + '</strong> ' + escapeHtml(t('confirmedRevenue')) + '</span>' +
        '</div>' +
        '<div class="if-admin-post-grid">' + renderPostLiveEditor(post, liveRev) + renderPostPendingCard(post, pendingRev) + '</div>' +
      '</article>';
  }

  function renderCreatorPanel(profile){
    var pendingProfile = profile.current_pending_revision_id ? findProfileRevision(profile.current_pending_revision_id) : null;
    var liveProfile = profile.current_published_revision_id ? findProfileRevision(profile.current_published_revision_id) : profile;
    var creatorPosts = postsByProfile(profile.id);
    var creatorStat = state.creatorStats[profile.affiliate_slug] || {};
    return '' +
      '<div class="if-admin-creator-panel">' +
        '<div class="if-stats-grid if-stats-grid--compact">' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('cardImpressions')) + '</div><div class="stat-value">' + escapeHtml(String(creatorStat.card_impressions || 0)) + '</div></div>' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('postOpens')) + '</div><div class="stat-value">' + escapeHtml(String(creatorStat.post_opens || 0)) + '</div></div>' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('widgetClicks')) + '</div><div class="stat-value">' + escapeHtml(String(creatorStat.widget_clicks || 0)) + '</div></div>' +
          '<div class="stat-card"><div class="stat-label">' + escapeHtml(t('confirmedRevenue')) + '</div><div class="stat-value">' + escapeHtml(formatMoney(creatorStat.confirmed_revenue_usd || 0)) + '</div></div>' +
        '</div>' +
        '<div class="if-admin-pane-grid">' +
          '<div class="if-admin-pane-col">' + renderProfilePreviewCard(L('liveProfile'), liveProfile) + renderProfileMetaEditor(profile) + '</div>' +
          '<div class="if-admin-pane-col">' + renderPendingProfileCard(profile, pendingProfile) + '</div>' +
        '</div>' +
        '<div class="if-admin-post-stack">' + (creatorPosts.length ? creatorPosts.map(renderPostCard).join('') : '<div class="if-empty-state">' + escapeHtml(L('noPosts')) + '</div>') + '</div>' +
      '</div>';
  }

  function getProfileNotes(profileId, selector){
    var el = selector ? $('[data-' + selector + '="' + profileId + '"]') : null;
    return el ? String(el.value || '').trim() : '';
  }
  function getPostNotes(postId, selector){
    var el = selector ? $('[data-' + selector + '="' + postId + '"]') : null;
    return el ? String(el.value || '').trim() : '';
  }

  async function saveProfileMeta(profileId){
    var inputs = $all('[data-profile-meta][data-profile-id="' + profileId + '"]');
    var payload = {};
    inputs.forEach(function(input){ payload[input.getAttribute('data-profile-meta')] = input.value; });
    try{
      var upd = await client.from('influencer_profiles').update(payload).eq('id', profileId);
      if (upd && upd.error) throw upd.error;
      var profile = findProfile(profileId);
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
      var post = findPost(postId);
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

  async function requestLiveProfileChanges(profileId){
    var profile = findProfile(profileId);
    if (!profile) return;
    var notes = getProfileNotes(profileId, 'live-profile-notes');
    if (profile.current_pending_revision_id){
      await reviewProfile(profileId, 'changes_requested');
      return;
    }
    var liveRevision = profile.current_published_revision_id ? findProfileRevision(profile.current_published_revision_id) : null;
    if (!liveRevision){
      notify(L('noPending'), 'error');
      return;
    }
    try{
      var maxResp = await client.from('influencer_profile_revisions').select('revision_no').eq('profile_id', profileId).order('revision_no', { ascending: false }).limit(1);
      var maxRow = maxResp && maxResp.data && maxResp.data[0] ? maxResp.data[0] : null;
      var revisionNo = maxRow ? (Number(maxRow.revision_no || 0) + 1) : 1;
      var insertResp = await client.from('influencer_profile_revisions').insert({
        profile_id: profileId,
        revision_no: revisionNo,
        display_name: liveRevision.display_name || profile.display_name,
        public_slug: liveRevision.public_slug || profile.public_slug,
        bio: liveRevision.bio || profile.bio || '',
        avatar_path: liveRevision.avatar_path || profile.avatar_path || '',
        social_links: liveRevision.social_links || profile.social_links || {},
        status: 'changes_requested',
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: state.user ? state.user.id : null,
        submitted_at: new Date().toISOString()
      }).select('*').single();
      if (insertResp && insertResp.error) throw insertResp.error;
      var updResp = await client.from('influencer_profiles').update({
        current_pending_revision_id: insertResp.data.id,
        review_notes: notes || null,
        status: 'published',
        updated_at: new Date().toISOString()
      }).eq('id', profileId);
      if (updResp && updResp.error) throw updResp.error;
      notify(L('saveOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore richiesta modifiche profilo.', 'error'); }
  }

  async function requestLivePostChanges(postId){
    var post = findPost(postId);
    if (!post) return;
    var notes = getPostNotes(postId, 'live-post-notes');
    if (post.current_pending_revision_id){
      await reviewPost(postId, 'changes_requested');
      return;
    }
    var liveRevision = post.current_live_revision_id ? findPostRevision(post.current_live_revision_id) : null;
    if (!liveRevision){
      notify(L('noPending'), 'error');
      return;
    }
    try{
      var maxResp = await client.from('influencer_post_revisions').select('revision_no').eq('post_id', postId).order('revision_no', { ascending: false }).limit(1);
      var maxRow = maxResp && maxResp.data && maxResp.data[0] ? maxResp.data[0] : null;
      var revisionNo = maxRow ? (Number(maxRow.revision_no || 0) + 1) : 1;
      var insertResp = await client.from('influencer_post_revisions').insert({
        post_id: postId,
        revision_no: revisionNo,
        title: liveRevision.title || post.title,
        excerpt: liveRevision.excerpt || post.excerpt || '',
        cover_path: liveRevision.cover_path || post.cover_path || '',
        content_json: liveRevision.content_json || [],
        content_html: liveRevision.content_html || '',
        widgets_json: liveRevision.widgets_json || [],
        status: 'changes_requested',
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: state.user ? state.user.id : null,
        submitted_at: new Date().toISOString()
      }).select('*').single();
      if (insertResp && insertResp.error) throw insertResp.error;
      var updResp = await client.from('influencer_posts').update({
        current_pending_revision_id: insertResp.data.id,
        review_notes: notes || null,
        status: 'published',
        updated_at: new Date().toISOString()
      }).eq('id', postId);
      if (updResp && updResp.error) throw updResp.error;
      notify(L('saveOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore richiesta modifiche post.', 'error'); }
  }

  async function softDeleteProfile(profileId){
    var profile = findProfile(profileId);
    if (!profile) return;
    var notes = getProfileNotes(profileId, 'live-profile-notes');
    try{
      if (profile.current_pending_revision_id){
        await client.from('influencer_profile_revisions').update({ status: 'archived', review_notes: notes || null, updated_at: new Date().toISOString() }).eq('id', profile.current_pending_revision_id);
      }
      var postIds = postsByProfile(profileId).map(function(post){ return post.id; });
      if (postIds.length){
        await client.from('influencer_posts').update({ status: 'archived', current_pending_revision_id: null, review_notes: notes || null, updated_at: new Date().toISOString() }).in('id', postIds);
        await client.from('influencer_post_revisions').update({ status: 'archived', review_notes: notes || null, updated_at: new Date().toISOString() }).in('post_id', postIds).neq('status', 'published');
      }
      var upd = await client.from('influencer_profiles').update({ status: 'suspended', current_pending_revision_id: null, review_notes: notes || null, updated_at: new Date().toISOString() }).eq('id', profileId);
      if (upd && upd.error) throw upd.error;
      notify(L('profileDeletedOk'), 'success');
      state.openCreatorId = null;
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore eliminazione profilo.', 'error'); }
  }

  async function deletePostByAdmin(postId){
    try{
      var notes = getPostNotes(postId, 'live-post-notes') || getPostNotes(postId, 'review-notes-post');
      var resp = await client.rpc('review_influencer_post', { p_post_id: postId, p_action: 'delete', p_notes: notes || null });
      if (resp && resp.error) throw resp.error;
      notify(L('postDeletedOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore eliminazione post.', 'error'); }
  }

  async function archivePostByAdmin(postId){
    try{
      var notes = getPostNotes(postId, 'live-post-notes') || getPostNotes(postId, 'review-notes-post');
      var resp = await client.rpc('review_influencer_post', { p_post_id: postId, p_action: 'archive', p_notes: notes || null });
      if (resp && resp.error) throw resp.error;
      notify(L('deletedOk'), 'success');
      await loadAll();
    }catch(err){ console.error(err); notify(err.message || 'Errore archiviazione post.', 'error'); }
  }

  function showConfirmPopup(message, buttons){
    var popup = $('#if-admin-confirm-popup');
    var messageEl = $('#if-admin-confirm-message');
    var actionsEl = $('#if-admin-confirm-actions');
    if (!popup || !messageEl || !actionsEl) return;
    messageEl.textContent = String(message || '');
    actionsEl.innerHTML = (buttons || []).map(function(btn, idx){
      return '<button class="btn' + (btn.secondary ? ' secondary' : '') + '" type="button" data-admin-confirm-index="' + idx + '">' + escapeHtml(btn.label || 'OK') + '</button>';
    }).join('');
    state.confirmAction = buttons || [];
    popup.hidden = false;
  }
  function hideConfirmPopup(){
    var popup = $('#if-admin-confirm-popup');
    if (popup) popup.hidden = true;
    state.confirmAction = null;
  }

  function onDashboardClick(event){
    var closePopup = event.target.closest('[data-admin-popup-close]');
    if (closePopup){
      hideConfirmPopup();
      return;
    }
    var confirmBtn = event.target.closest('[data-admin-confirm-index]');
    if (confirmBtn){
      var index = parseInt(confirmBtn.getAttribute('data-admin-confirm-index') || '-1', 10);
      var action = state.confirmAction && state.confirmAction[index] ? state.confirmAction[index] : null;
      hideConfirmPopup();
      if (action && typeof action.onClick === 'function') action.onClick();
      return;
    }

    var toggle = event.target.closest('[data-toggle-creator]');
    if (toggle){
      var creatorId = toggle.getAttribute('data-toggle-creator');
      state.openCreatorId = state.openCreatorId === creatorId ? null : creatorId;
      renderCreatorList();
      return;
    }

    var saveProfileBtn = event.target.closest('[data-save-profile-meta]');
    if (saveProfileBtn){ saveProfileMeta(saveProfileBtn.getAttribute('data-save-profile-meta')); return; }

    var liveProfileBtn = event.target.closest('[data-live-profile-action]');
    if (liveProfileBtn){
      var action = liveProfileBtn.getAttribute('data-live-profile-action');
      var profileId = liveProfileBtn.getAttribute('data-profile-id');
      if (action === 'changes_requested') requestLiveProfileChanges(profileId);
      if (action === 'delete'){
        showConfirmPopup(L('confirmDeleteProfile'), [
          { label: L('no'), secondary: true },
          { label: L('yesDelete'), onClick: function(){ softDeleteProfile(profileId); } }
        ]);
      }
      return;
    }

    var reviewProfileBtn = event.target.closest('[data-review-profile]');
    if (reviewProfileBtn){
      reviewProfile(reviewProfileBtn.getAttribute('data-profile-id'), reviewProfileBtn.getAttribute('data-review-profile'));
      return;
    }

    var savePostBtn = event.target.closest('[data-save-post-meta]');
    if (savePostBtn){ savePostMeta(savePostBtn.getAttribute('data-save-post-meta')); return; }

    var livePostBtn = event.target.closest('[data-live-post-action]');
    if (livePostBtn){
      var liveAction = livePostBtn.getAttribute('data-live-post-action');
      var postId = livePostBtn.getAttribute('data-post-id');
      if (liveAction === 'changes_requested') requestLivePostChanges(postId);
      if (liveAction === 'delete'){
        showConfirmPopup(L('confirmDeletePost'), [
          { label: L('no'), secondary: true },
          { label: L('yesDelete'), onClick: function(){ deletePostByAdmin(postId); } }
        ]);
      }
      if (liveAction === 'archive'){
        showConfirmPopup(L('confirmArchivePost'), [
          { label: L('no'), secondary: true },
          { label: L('yesArchive'), onClick: function(){ archivePostByAdmin(postId); } }
        ]);
      }
      return;
    }

    var reviewPostBtn = event.target.closest('[data-review-post]');
    if (reviewPostBtn){
      reviewPost(reviewPostBtn.getAttribute('data-post-id'), reviewPostBtn.getAttribute('data-review-post'));
      return;
    }
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
