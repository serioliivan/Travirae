// Travirae - Creator profile area
(function(){
  'use strict';

  if (!document.body.classList.contains('page--affiliate-profile')) return;
  if (!window.TraviraeInfluencers) return;

  var I = window.TraviraeInfluencers;
  var $ = I.$;
  var $all = I.$all;
  var t = I.t;
  var slugify = I.slugify;
  var safeJsonParse = I.safeJsonParse;
  var defaultBlock = I.defaultBlock;
  var renderContentHtml = I.renderContentHtml;
  var normalizeContentBlocks = I.normalizeContentBlocks;
  var uploadImage = I.uploadImage;
  var publicImageUrl = I.publicImageUrl;
  var normalizeSocialUrl = I.normalizeSocialUrl;
  var formatMoney = I.formatMoney;
  var formatDate = I.formatDate;
  var notify = I.notify;

  var APP = $('#if-affiliate-profile-app');
  var LANG = I.getLang();
  var TEXT = {
    it: {
      publicProfile: 'Profilo pubblico',
      myPosts: 'I miei post',
      privateStats: 'Statistiche private creator',
      composer: 'Composer post',
      avatar: 'Immagine profilo',
      displayName: 'Nome profilo',
      bio: 'Biografia',
      socialLinks: 'Link social',
      saveProfileDraft: 'Salva profilo',
      sendProfileReview: 'Invia profilo in revisione',
      liveProfile: 'Versione live pubblicata',
      pendingProfile: 'Bozza / revisione pending',
      title: 'Titolo post',
      coverImage: 'Immagine copertina',
      excerpt: 'Didascalia / estratto card',
      livePreview: 'Anteprima live card',
      postPreview: 'Anteprima post',
      postContent: 'Contenuto del post',
      addBlock: 'Aggiungi blocco',
      startNewPost: 'Crea nuovo post',
      cancelEdit: 'Chiudi composer',
      uploadAvatar: 'Carica avatar',
      uploadCover: 'Carica cover',
      emptyEditor: 'Usa blocchi controllati: heading, paragrafo, immagine, lista, quote, callout, separatore, Hotel Map e Flights Widget.',
      currentEditing: 'Post in modifica',
      reviewNotes: 'Note revisione',
      noReviewNotes: 'Nessuna nota revisione.',
      viewPublicPage: 'Apri pagina pubblica',
      creatorStatsHint: 'Queste statistiche sono private e visibili solo a te.',
      status_draft: 'Bozza',
      status_pending_review: 'In revisione',
      status_published: 'Pubblicato',
      status_changes_requested: 'Modifiche richieste',
      status_rejected: 'Rifiutato',
      status_archived: 'Archiviato',
      status_deleted: 'Eliminato',
      saveDraftBtn: 'Salva bozza',
      submitReviewBtn: 'Invia in revisione',
      showPreview: 'Mostra anteprima',
      hidePreview: 'Nascondi anteprima',
      chooseImage: 'Scegli immagine',
      noFileSelected: 'Nessun file selezionato.'
    },
    en: {
      publicProfile: 'Public profile',
      myPosts: 'My posts',
      privateStats: 'Private creator stats',
      composer: 'Post composer',
      avatar: 'Profile image',
      displayName: 'Profile name',
      bio: 'Biography',
      socialLinks: 'Social links',
      saveProfileDraft: 'Save profile',
      sendProfileReview: 'Send profile for review',
      liveProfile: 'Live published version',
      pendingProfile: 'Pending draft / review',
      title: 'Post title',
      coverImage: 'Cover image',
      excerpt: 'Card caption / excerpt',
      livePreview: 'Live card preview',
      postPreview: 'Post preview',
      postContent: 'Post content',
      addBlock: 'Add block',
      startNewPost: 'Create new post',
      cancelEdit: 'Close composer',
      uploadAvatar: 'Upload avatar',
      uploadCover: 'Upload cover',
      emptyEditor: 'Use controlled blocks only: heading, paragraph, image, list, quote, callout, separator, Hotel Map and Flights Widget.',
      currentEditing: 'Editing post',
      reviewNotes: 'Review notes',
      noReviewNotes: 'No review notes.',
      viewPublicPage: 'Open public page',
      creatorStatsHint: 'These statistics are private and visible only to you.',
      status_draft: 'Draft',
      status_pending_review: 'In review',
      status_published: 'Published',
      status_changes_requested: 'Changes requested',
      status_rejected: 'Rejected',
      status_archived: 'Archived',
      status_deleted: 'Deleted',
      saveDraftBtn: 'Save draft',
      submitReviewBtn: 'Send to review',
      showPreview: 'Show preview',
      hidePreview: 'Hide preview',
      chooseImage: 'Choose image',
      noFileSelected: 'No file selected.'
    }
  };
  function L(key){ var shared = t(key); return (TEXT[LANG] && TEXT[LANG][key]) || (shared !== key ? shared : '') || (TEXT.en && TEXT.en[key]) || (TEXT.it && TEXT.it[key]) || key; }

  var state = {
    client: null,
    user: null,
    affiliateSlug: '',
    profile: null,
    profileDraft: null,
    profilePendingRevision: null,
    profilePublishedRevision: null,
    stats: null,
    posts: [],
    postKpis: {},
    currentPost: null,
    currentRevision: null,
    editorData: null,
    autoSlug: true,
    previewVisible: false,
    postPreviewVisible: false,
    editorOpen: false
  };

  function statusLabel(status){
    return L('status_' + String(status || '').toLowerCase()) || String(status || '—');
  }

  function badge(status){
    return '<span class="if-status-badge is-' + I.escapeAttr(status || 'draft') + '">' + I.escapeHtml(statusLabel(status)) + '</span>';
  }

  function setProfileTabVisibility(isVisible){
    $all('.if-auth-only-tab').forEach(function(link){
      if (isVisible) link.removeAttribute('hidden');
      else link.setAttribute('hidden', 'hidden');
    });
  }

  function setEditorPanelVisibility(isVisible){
    state.editorOpen = !!isVisible;
    var panel = $('#if-editor-panel');
    if (!panel) return;
    panel.hidden = !state.editorOpen;
  }

  function syncPreviewToggle(){
    var btn = $('#if-toggle-preview');
    var box = $('#if-post-card-preview-box');
    if (btn) btn.textContent = state.previewVisible ? L('hidePreview') : L('showPreview');
    if (box) box.hidden = !state.previewVisible;
  }

  function syncPostPreviewToggle(){
    var btn = $('#if-toggle-post-preview');
    var box = $('#if-post-full-preview-box');
    if (btn) btn.textContent = state.postPreviewVisible ? L('hidePreview') : L('showPreview');
    if (box) box.hidden = !state.postPreviewVisible;
  }

  function makeFileControl(inputId, nameId){
    return '' +
      '<div class="if-file-control">' +
        '<button class="btn secondary small" type="button" data-file-trigger="' + I.escapeAttr(inputId) + '">' + I.escapeHtml(L('chooseImage')) + '</button>' +
        '<span class="if-file-name" id="' + I.escapeAttr(nameId) + '">' + I.escapeHtml(L('noFileSelected')) + '</span>' +
        '<input accept="image/png,image/jpeg,image/webp" class="if-native-file" id="' + I.escapeAttr(inputId) + '" type="file"/>' +
      '</div>';
  }

  function updateFileNameLabel(nameEl, file){
    if (!nameEl) return;
    nameEl.textContent = file && file.name ? file.name : L('noFileSelected');
  }

  async function ensureUniquePostSlug(baseSlug, currentPostId){
    var slugBase = slugify(baseSlug || '');
    if (!slugBase) slugBase = 'post';
    if (!state.client) return slugBase;
    var candidate = slugBase;
    var suffix = 2;
    while (true){
      var query = state.client.from('influencer_posts').select('id').eq('post_slug', candidate).limit(1);
      if (currentPostId) query = query.neq('id', currentPostId);
      var resp = await query.maybeSingle();
      var row = resp && resp.data ? resp.data : null;
      if (!row) return candidate;
      candidate = slugBase + '-' + suffix;
      suffix += 1;
    }
  }

  function getCandidateClients(){
    var out = [];
    if (window.supabaseClientSession) out.push(window.supabaseClientSession);
    if (window.supabaseClient && out.indexOf(window.supabaseClient) === -1) out.push(window.supabaseClient);
    return out;
  }

  async function findActiveClient(){
    var candidates = getCandidateClients();
    for (var i = 0; i < candidates.length; i++){
      var client = candidates[i];
      if (!client || !client.auth) continue;
      try{
        var resp = await client.auth.getUser();
        var user = resp && resp.data && resp.data.user ? resp.data.user : null;
        if (user) return { client: client, user: user };
      }catch(_){ }
    }
    return { client: candidates[0] || null, user: null };
  }

  async function getAffiliateSlug(client){
    if (!client) return '';
    try{
      var rpc = await client.rpc('get_my_affiliate_slug');
      if (rpc && rpc.data) return String(rpc.data || '').trim();
    }catch(_){ }
    try{
      var row = await client.from('affiliates').select('slug').maybeSingle();
      if (row && row.data && row.data.slug) return String(row.data.slug).trim();
    }catch(_e){ }
    return '';
  }

  function emptyProfileDraft(){
    var fallbackSlug = state.affiliateSlug || 'creator';
    return syncProfileSlug({
      display_name: fallbackSlug,
      public_slug: fallbackSlug,
      bio: '',
      avatar_path: '',
      social_links: {}
    });
  }

  function basePostEditor(){
    return {
      title: '',
      post_slug: '',
      post_short_id: 'p' + Math.random().toString(36).slice(2, 6),
      excerpt: '',
      cover_path: '',
      cover_url: '',
      blocks: [defaultBlock('paragraph')]
    };
  }

  function clone(obj){ return JSON.parse(JSON.stringify(obj || {})); }

  function syncProfileSlug(draft){
    var out = clone(draft || {});
    var fallback = state.affiliateSlug || 'creator';
    var display = String(out.display_name || fallback).trim() || fallback;
    out.display_name = display;
    out.public_slug = slugify(display) || slugify(fallback) || 'creator';
    if (!out.social_links || typeof out.social_links !== 'object') out.social_links = {};
    return out;
  }

  function extractRevisionContent(revision){
    if (!revision) return basePostEditor();
    var blocks = revision.content_json;
    if (typeof blocks === 'string') blocks = safeJsonParse(blocks, []);
    if (!Array.isArray(blocks) || !blocks.length) blocks = [defaultBlock('paragraph')];
    return {
      title: revision.title || '',
      post_slug: state.currentPost ? (state.currentPost.post_slug || '') : '',
      post_short_id: state.currentPost ? (state.currentPost.post_short_id || ('p' + Math.random().toString(36).slice(2, 6))) : ('p' + Math.random().toString(36).slice(2, 6)),
      excerpt: revision.excerpt || '',
      cover_path: revision.cover_path || '',
      cover_url: revision.cover_path ? publicImageUrl('influencer-post-media', revision.cover_path) : '',
      blocks: blocks
    };
  }

  function renderApp(){
    if (!APP) return;
    APP.innerHTML = '' +
      '<div id="if-affiliate-login-required" hidden></div>' +
      '<div id="if-affiliate-app-shell" hidden>' +
        '<div class="if-creator-grid">' +
          '<section class="auth-card if-panel" id="if-public-profile-panel">' +
            '<div class="if-section-head"><div><h2>' + I.escapeHtml(L('publicProfile')) + '</h2></div><a class="btn secondary" id="if-open-public-page" href="' + I.escapeAttr(I.buildPagePath('influencers-vlogs.html')) + '?creator=' + encodeURIComponent(state.profileDraft && state.profileDraft.public_slug ? state.profileDraft.public_slug : state.affiliateSlug || '') + '" target="_blank" rel="noopener">' + I.escapeHtml(L('viewPublicPage')) + '</a></div>' +
            '<form class="auth-form" id="if-profile-form">' +
              '<div class="if-avatar-upload"><div id="if-avatar-preview"></div><div><label class="small muted">' + I.escapeHtml(L('avatar')) + '</label>' + makeFileControl('if-profile-avatar-input','if-profile-avatar-name') + '<p class="muted small">WEBP · max 8MB · output 400×400</p></div></div>' +
              '<div class="form-group"><label for="if-profile-display-name">' + I.escapeHtml(L('displayName')) + '</label><input id="if-profile-display-name" required type="text"/></div>' +
              '<div class="form-group"><label for="if-profile-bio">' + I.escapeHtml(L('bio')) + '</label><textarea id="if-profile-bio" rows="5"></textarea></div>' +
              '<div class="if-social-grid" id="if-social-grid"></div>' +
              '<div class="auth-actions"><button class="btn secondary" id="if-profile-save-draft" type="button">' + I.escapeHtml(L('saveProfileDraft')) + '</button><button class="btn" id="if-profile-submit-review" type="button">' + I.escapeHtml(L('sendProfileReview')) + '</button></div>' +
            '</form>' +
          '</section>' +
          '<section class="auth-card if-panel" id="if-private-stats-panel">' +
            '<div class="if-section-head"><div><h2>' + I.escapeHtml(L('privateStats')) + '</h2><p class="muted small">' + I.escapeHtml(L('creatorStatsHint')) + '</p></div></div>' +
            '<div class="if-stats-grid if-stats-grid--compact" id="if-private-stats"></div>' +
          '</section>' +
        '</div>' +
        '<section class="auth-card if-panel" id="if-posts-panel">' +
          '<div class="if-section-head"><div><h2>' + I.escapeHtml(L('myPosts')) + '</h2><p class="muted small">' + I.escapeHtml(L('noPostLive')) + '</p></div><button class="btn" id="if-new-post-btn" type="button">' + I.escapeHtml(L('startNewPost')) + '</button></div>' +
          '<div id="if-posts-list"></div>' +
        '</section>' +
        '<section class="auth-card if-panel" id="if-editor-panel" hidden>' +
          '<div class="if-section-head"><div><h2 id="if-editor-heading">' + I.escapeHtml(L('composer')) + '</h2><p class="muted small">' + I.escapeHtml(L('emptyEditor')) + '</p></div><button class="btn secondary" id="if-cancel-edit-post" type="button">' + I.escapeHtml(L('cancelEdit')) + '</button></div>' +
          '<form class="auth-form" id="if-post-form">' +
            '<div id="if-post-review-note"></div>' +
            '<div class="form-group"><label for="if-post-title">' + I.escapeHtml(L('title')) + '</label><input id="if-post-title" required type="text"/></div>' +
            '<div class="if-cover-upload"><div id="if-cover-preview"></div><div><label class="small muted">' + I.escapeHtml(L('coverImage')) + '</label>' + makeFileControl('if-post-cover-input','if-post-cover-name') + '<p class="muted small">WEBP · max 8MB · output 1600×900</p></div></div>' +
            '<div class="form-group"><label for="if-post-excerpt">' + I.escapeHtml(L('excerpt')) + '</label><textarea id="if-post-excerpt" rows="3"></textarea></div>' +
            '<div class="if-card-preview-wrap">' +
              '<div class="if-preview-toggle">' +
                '<div class="if-preview-toggle__title small muted">' + I.escapeHtml(L('livePreview')) + '</div>' +
                '<button class="btn secondary" id="if-toggle-preview" type="button">' + I.escapeHtml(L('showPreview')) + '</button>' +
              '</div>' +
              '<div hidden id="if-post-card-preview-box"><div id="if-post-card-preview"></div></div>' +
            '</div>' +
            '<div class="if-section-head if-section-head--blocks"><div><h3>' + I.escapeHtml(L('postContent')) + '</h3></div></div>' +
            '<div class="if-block-toolbar" id="if-block-toolbar"></div>' +
            '<div id="if-blocks-editor"></div>' +
            '<div class="if-card-preview-wrap if-card-preview-wrap--full">' +
              '<div class="if-preview-toggle">' +
                '<div class="if-preview-toggle__title small muted">' + I.escapeHtml(L('postPreview')) + '</div>' +
                '<button class="btn secondary" id="if-toggle-post-preview" type="button">' + I.escapeHtml(L('showPreview')) + '</button>' +
              '</div>' +
              '<div hidden id="if-post-full-preview-box"><div id="if-post-full-preview"></div></div>' +
            '</div>' +
            '<div class="auth-actions"><button class="btn secondary" id="if-post-save-draft" type="button">' + I.escapeHtml(L('saveDraftBtn')) + '</button><button class="btn" id="if-post-submit-review" type="button">' + I.escapeHtml(L('submitReviewBtn')) + '</button></div>' +
          '</form>' +
        '</section>' +
      '</div>';

    bindStaticUi();
    setEditorPanelVisibility(state.editorOpen);
  }

  function bindStaticUi(){
    var openPublic = $('#if-open-public-page');
    if (openPublic){
      openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent((state.profileDraft && state.profileDraft.public_slug) || state.affiliateSlug || '');
    }

    var previewToggle = $('#if-toggle-preview');
    if (previewToggle && !previewToggle.__bound){
      previewToggle.__bound = true;
      previewToggle.addEventListener('click', function(){
        state.previewVisible = !state.previewVisible;
        if (state.previewVisible) renderPreview();
        syncPreviewToggle();
      });
    }

    var fullPreviewToggle = $('#if-toggle-post-preview');
    if (fullPreviewToggle && !fullPreviewToggle.__bound){
      fullPreviewToggle.__bound = true;
      fullPreviewToggle.addEventListener('click', function(){
        state.postPreviewVisible = !state.postPreviewVisible;
        if (state.postPreviewVisible) renderPostPreview();
        syncPostPreviewToggle();
      });
    }
    syncPreviewToggle();
    syncPostPreviewToggle();

    $all('[data-file-trigger]').forEach(function(btn){
      if (btn.__bound) return;
      btn.__bound = true;
      btn.addEventListener('click', function(){
        var input = document.getElementById(btn.getAttribute('data-file-trigger'));
        if (input) input.click();
      });
    });

    var socialGrid = $('#if-social-grid');
    if (socialGrid){
      socialGrid.innerHTML = Object.keys(I.SOCIALS).map(function(platform){
        var labelKey = I.SOCIALS[platform].labelKey;
        return '<div class="form-group"><label for="if-social-' + I.escapeAttr(platform) + '">' + I.escapeHtml(t(labelKey)) + '</label><input id="if-social-' + I.escapeAttr(platform) + '" data-social-platform="' + I.escapeAttr(platform) + '" type="url" placeholder="https://..."/></div>';
      }).join('');
    }

    var toolbar = $('#if-block-toolbar');
    if (toolbar){
      var blockButtons = [
        { type: 'heading', label: t('blockHeading') },
        { type: 'paragraph', label: t('blockParagraph') },
        { type: 'image', label: t('blockImage') },
        { type: 'list', label: t('blockList') },
        { type: 'quote', label: t('blockQuote') },
        { type: 'tip', label: t('blockTip') },
        { type: 'separator', label: t('blockSeparator') },
        { type: 'stay22', label: t('blockStay22') },
        { type: 'aviasales', label: t('blockAviasales') }
      ];
      toolbar.innerHTML = blockButtons.map(function(item){ return '<button class="btn secondary small" type="button" data-add-block="' + I.escapeAttr(item.type) + '">' + I.escapeHtml(item.label) + '</button>'; }).join('');
      $all('[data-add-block]', toolbar).forEach(function(btn){
        btn.addEventListener('click', function(){
          state.editorData.blocks.push(defaultBlock(btn.getAttribute('data-add-block')));
          renderEditor();
        });
      });
    }

    var profileName = $('#if-profile-display-name');
    if (profileName){
      profileName.addEventListener('input', function(){
        var synced = syncProfileSlug({
          display_name: profileName.value || state.affiliateSlug || 'creator',
          bio: (state.profileDraft && state.profileDraft.bio) || '',
          avatar_path: (state.profileDraft && state.profileDraft.avatar_path) || '',
          social_links: (state.profileDraft && state.profileDraft.social_links) || {}
        });
        state.profileDraft = synced;
        var openPublicLink = $('#if-open-public-page');
        if (openPublicLink) openPublicLink.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent((synced.public_slug || state.affiliateSlug || ''));
      });
    }

    var postTitle = $('#if-post-title');
    if (postTitle){
      postTitle.addEventListener('input', updateEditorStateFromForm);
    }
    var excerpt = $('#if-post-excerpt');
    if (excerpt) excerpt.addEventListener('input', updateEditorStateFromForm);

    var avatarInput = $('#if-profile-avatar-input');
    var avatarFileName = $('#if-profile-avatar-name');
    if (avatarInput){
      avatarInput.addEventListener('change', async function(){
        var file = avatarInput.files && avatarInput.files[0] ? avatarInput.files[0] : null;
        updateFileNameLabel(avatarFileName, file);
        avatarInput.value = '';
        if (!file) return;
        try{
          var upload = await uploadImage({
            bucket: 'influencer-avatars',
            file: file,
            path: state.user.id + '/avatar/profile.webp',
            maxWidth: 400,
            maxHeight: 400,
            forceSquare: true,
            quality: 0.86
          });
          state.profileDraft.avatar_path = upload.path;
          renderProfileForm();
        }catch(err){
          console.error(err);
          notify(t('invalidImage'), 'error');
        } finally {
          updateFileNameLabel(avatarFileName, null);
        }
      });
    }

    var coverInput = $('#if-post-cover-input');
    var coverFileName = $('#if-post-cover-name');
    if (coverInput){
      coverInput.addEventListener('change', async function(){
        var file = coverInput.files && coverInput.files[0] ? coverInput.files[0] : null;
        updateFileNameLabel(coverFileName, file);
        coverInput.value = '';
        if (!file) return;
        try{
          var upload = await uploadImage({
            bucket: 'influencer-post-media',
            file: file,
            path: state.user.id + '/covers/' + Date.now() + '_' + Math.random().toString(36).slice(2,8) + '.webp',
            maxWidth: 1600,
            maxHeight: 900,
            quality: 0.88
          });
          state.editorData.cover_path = upload.path;
          state.editorData.cover_url = upload.url;
          renderEditor();
        }catch(err){
          console.error(err);
          notify(t('invalidImage'), 'error');
        } finally {
          updateFileNameLabel(coverFileName, null);
        }
      });
    }

    var profileSave = $('#if-profile-save-draft');
    if (profileSave) profileSave.addEventListener('click', function(){ saveProfile('draft'); });
    var profileReview = $('#if-profile-submit-review');
    if (profileReview) profileReview.addEventListener('click', function(){ saveProfile('review'); });
    var postSave = $('#if-post-save-draft');
    if (postSave) postSave.addEventListener('click', function(){ savePost('draft'); });
    var postReview = $('#if-post-submit-review');
    if (postReview) postReview.addEventListener('click', function(){ savePost('review'); });
    var newPost = $('#if-new-post-btn');
    if (newPost) newPost.addEventListener('click', function(){ resetEditor(true); var panel = $('#if-editor-panel'); if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    var cancelEdit = $('#if-cancel-edit-post');
    if (cancelEdit) cancelEdit.addEventListener('click', function(){ resetEditor(false); });
  }

  function renderLoginRequired(){
    renderApp();
    setProfileTabVisibility(false);
    var loginReq = $('#if-affiliate-login-required');
    var shell = $('#if-affiliate-app-shell');
    if (shell) shell.hidden = true;
    if (loginReq){
      loginReq.hidden = false;
      loginReq.className = 'auth-card if-panel';
      loginReq.innerHTML = '<div class="admin-message is-error">' + I.escapeHtml(t('loginRequired')) + '</div><div class="auth-actions" style="margin-top:16px;"><a class="btn" href="' + I.escapeAttr(I.buildPagePath('area-affiliati.html')) + '">' + I.escapeHtml(t('goToLogin')) + '</a></div>';
    }
  }

  function renderProfileForm(){
    setProfileTabVisibility(true);
    var shell = $('#if-affiliate-app-shell');
    if (shell) shell.hidden = false;
    var loginReq = $('#if-affiliate-login-required');
    if (loginReq) loginReq.hidden = true;

    var draft = syncProfileSlug(state.profileDraft || emptyProfileDraft());
    state.profileDraft = draft;
    var avatarPreview = $('#if-avatar-preview');
    if (avatarPreview){
      avatarPreview.innerHTML = draft.avatar_path ? '<img class="if-profile-avatar if-profile-avatar--editable" src="' + I.escapeAttr(publicImageUrl('influencer-avatars', draft.avatar_path)) + '" alt="' + I.escapeAttr(draft.display_name || state.affiliateSlug || 'Creator') + '"/>' : '<div class="if-profile-avatar if-profile-avatar--placeholder">' + I.escapeHtml((draft.display_name || state.affiliateSlug || 'C').slice(0,1).toUpperCase()) + '</div>';
    }
    var displayName = $('#if-profile-display-name'); if (displayName) displayName.value = draft.display_name || '';
    var bio = $('#if-profile-bio'); if (bio) bio.value = draft.bio || '';
    Object.keys(I.SOCIALS).forEach(function(platform){
      var input = $('#if-social-' + platform);
      if (input) input.value = (draft.social_links && draft.social_links[platform]) || '';
    });
    var openPublic = $('#if-open-public-page');
    if (openPublic) openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent((draft.public_slug || state.affiliateSlug || ''));
    updateFileNameLabel($('#if-profile-avatar-name'), null);
  }

  function renderStats(){
    var el = $('#if-private-stats');
    if (!el) return;
    var s = state.stats || {};
    var items = [
      { label: t('cardImpressions'), value: s.card_impressions || 0 },
      { label: t('postOpens'), value: s.post_opens || 0 },
      { label: t('widgetClicks'), value: s.widget_clicks || 0 },
      { label: t('bookingPending'), value: s.booking_pending || 0 },
      { label: t('bookingConfirmed'), value: s.booking_confirmed || 0 },
      { label: t('estimatedRevenue'), value: formatMoney(s.estimated_revenue_usd || 0) },
      { label: t('confirmedRevenue'), value: formatMoney(s.confirmed_revenue_usd || 0) },
      { label: t('availableBalance'), value: formatMoney(s.available_balance || 0) }
    ];
    el.innerHTML = items.map(function(item){ return '<div class="stat-card"><div class="stat-label">' + I.escapeHtml(item.label) + '</div><div class="stat-value">' + I.escapeHtml(String(item.value)) + '</div></div>'; }).join('');
  }

  function renderPostsList(){
    var el = $('#if-posts-list');
    if (!el) return;
    if (!state.posts.length){
      el.innerHTML = '<div class="if-empty-state">' + I.escapeHtml(t('noPostsYet')) + '</div>';
      return;
    }
    el.innerHTML = state.posts.map(function(post){
      var kpi = state.postKpis[post.id] || {};
      return '' +
        '<article class="if-admin-creator-card">' +
          '<div class="if-admin-creator-card__head">' +
            '<div><h3>' + I.escapeHtml(post.title || post.post_slug || 'Post') + '</h3><div class="muted small">' + I.escapeHtml(post.post_slug || '') + ' · ' + I.escapeHtml(formatDate(post.updated_at || post.created_at)) + '</div></div>' +
            '<div class="if-admin-creator-card__actions">' + badge(post.status) + '</div>' +
          '</div>' +
          '<div class="if-post-kpi-row">' +
            '<span><strong>' + I.escapeHtml(String(kpi.card_impressions || 0)) + '</strong> ' + I.escapeHtml(t('cardImpressions')) + '</span>' +
            '<span><strong>' + I.escapeHtml(String(kpi.post_opens || 0)) + '</strong> ' + I.escapeHtml(t('postOpens')) + '</span>' +
            '<span><strong>' + I.escapeHtml(String(kpi.widget_clicks || 0)) + '</strong> ' + I.escapeHtml(t('widgetClicks')) + '</span>' +
            '<span><strong>' + I.escapeHtml(String(kpi.booking_confirmed || 0)) + '</strong> ' + I.escapeHtml(t('bookingConfirmed')) + '</span>' +
          '</div>' +
          '<div class="auth-actions if-inline-actions">' +
            '<button class="btn secondary" type="button" data-edit-post="' + I.escapeAttr(post.id) + '">' + I.escapeHtml(t('editPost')) + '</button>' +
            '<button class="btn secondary" type="button" data-delete-post="' + I.escapeAttr(post.id) + '">' + I.escapeHtml(t('deletePost')) + '</button>' +
          '</div>' +
        '</article>';
    }).join('');

    $all('[data-edit-post]', el).forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-edit-post');
        editPost(id);
      });
    });
    $all('[data-delete-post]', el).forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-delete-post');
        deletePost(id);
      });
    });
  }

  function updateEditorStateFromForm(){
    if (!state.editorData) state.editorData = basePostEditor();
    var title = $('#if-post-title');
    var excerpt = $('#if-post-excerpt');
    state.editorData.title = title ? String(title.value || '').trim() : '';
    if (!state.currentPost || !state.currentPost.current_live_revision_id){
      state.editorData.post_slug = slugify(state.editorData.title || '');
    } else {
      state.editorData.post_slug = state.currentPost.post_slug || state.editorData.post_slug;
    }
    state.editorData.excerpt = excerpt ? String(excerpt.value || '').trim() : '';
    renderPreview();
    renderPostPreview();
  }

  function renderPreview(){
    var el = $('#if-post-card-preview');
    if (!el) return;
    var editor = state.editorData || basePostEditor();
    var creatorName = (state.profileDraft && state.profileDraft.display_name) || state.affiliateSlug || 'Creator';
    el.innerHTML = '' +
      '<article class="if-post-card if-post-card--preview">' +
        '<div class="if-post-card__cover-wrap">' + (editor.cover_path ? '<img class="if-card-cover" loading="lazy" src="' + I.escapeAttr(editor.cover_url || publicImageUrl('influencer-post-media', editor.cover_path)) + '" alt=""/>' : '<div class="if-card-cover if-card-cover--placeholder"><span>Travirae</span></div>') + '</div>' +
        '<div class="if-post-card__body">' +
          '<div class="if-post-card__meta"><span class="muted small">' + I.escapeHtml(formatDate(new Date().toISOString())) + '</span></div>' +
          '<h3>' + I.escapeHtml(editor.title || '—') + '</h3>' +
          '<p class="muted">' + I.escapeHtml(editor.excerpt || '—') + '</p>' +
          '<div class="if-post-card__foot"><span class="if-link-creator">' + I.escapeHtml(creatorName) + '</span><span class="btn">' + I.escapeHtml(t('discoverMore')) + '</span></div>' +
        '</div>' +
      '</article>';
    syncPreviewToggle();
  }

  function renderPostPreview(){
    var el = $('#if-post-full-preview');
    if (!el) return;
    var editor = state.editorData || basePostEditor();
    var creatorName = (state.profileDraft && state.profileDraft.display_name) || state.affiliateSlug || 'Creator';
    var context = {
      creatorSlug: state.affiliateSlug,
      postShortId: (state.currentPost && state.currentPost.post_short_id) || editor.post_short_id,
      postId: (state.currentPost && state.currentPost.id) || '',
      postSlug: editor.post_slug || slugify(editor.title || '')
    };
    var normalized = normalizeContentBlocks(clone(editor.blocks || []), context);
    var contentHtml = renderContentHtml(normalized.blocks, context);
    el.innerHTML = '' +
      '<article class="if-post-preview-article">' +
        (editor.cover_path ? '<div class="if-post-modal-cover"><img loading="lazy" src="' + I.escapeAttr(editor.cover_url || publicImageUrl('influencer-post-media', editor.cover_path)) + '" alt=""/></div>' : '') +
        '<div class="if-post-preview-head">' +
          '<div class="muted small">' + I.escapeHtml(creatorName) + '</div>' +
          '<h2>' + I.escapeHtml(editor.title || '—') + '</h2>' +
          (editor.excerpt ? '<p class="muted">' + I.escapeHtml(editor.excerpt) + '</p>' : '') +
        '</div>' +
        '<div class="if-post-preview-body">' + contentHtml + '</div>' +
      '</article>';
    syncPostPreviewToggle();
  }

  function renderEditor(){
    if (!state.editorData) state.editorData = basePostEditor();
    setEditorPanelVisibility(true);
    var editor = state.editorData;
    var heading = $('#if-editor-heading');
    if (heading) heading.textContent = state.currentPost ? (L('currentEditing') + ': ' + (state.currentPost.title || state.currentPost.post_slug || 'Post')) : L('composer');
    var title = $('#if-post-title'); if (title) title.value = editor.title || '';
    var excerpt = $('#if-post-excerpt'); if (excerpt) excerpt.value = editor.excerpt || '';
    var coverPreview = $('#if-cover-preview');
    if (coverPreview){ coverPreview.innerHTML = editor.cover_path ? '<img class="if-cover-thumb" loading="lazy" src="' + I.escapeAttr(editor.cover_url || publicImageUrl('influencer-post-media', editor.cover_path)) + '" alt=""/>' : '<div class="if-cover-thumb if-cover-thumb--placeholder">16:9</div>'; }
    updateFileNameLabel($('#if-post-cover-name'), null);
    renderPreview();
    renderPostPreview();
    syncPreviewToggle();
    syncPostPreviewToggle();

    var reviewNote = $('#if-post-review-note');
    if (reviewNote){
      var note = state.currentRevision && state.currentRevision.review_notes ? state.currentRevision.review_notes : '';
      reviewNote.innerHTML = note ? '<div class="if-note-box"><div class="if-note-box__head">' + badge(state.currentRevision ? state.currentRevision.status : (state.currentPost ? state.currentPost.status : 'draft')) + '<span>' + I.escapeHtml(note) + '</span></div></div>' : '';
    }

    var blocksWrap = $('#if-blocks-editor');
    if (!blocksWrap) return;
    blocksWrap.innerHTML = (editor.blocks || []).map(function(block, index){
      var controls = '<div class="if-block-card__actions">' +
        '<button class="btn secondary small" type="button" data-block-up="' + index + '">↑</button>' +
        '<button class="btn secondary small" type="button" data-block-down="' + index + '">↓</button>' +
        '<button class="btn secondary small" type="button" data-block-delete="' + index + '">×</button>' +
      '</div>';
      var body = '';
      if (block.type === 'heading'){
        body = '<div class="form-row-2"><div class="form-group"><label>Level</label><select data-block-field="level" data-index="' + index + '"><option value="h2"' + (block.level === 'h2' ? ' selected' : '') + '>H2</option><option value="h3"' + (block.level === 'h3' ? ' selected' : '') + '>H3</option></select></div><div class="form-group"><label>Text</label><input type="text" value="' + I.escapeAttr(block.text || '') + '" data-block-field="text" data-index="' + index + '"/></div></div>';
      } else if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'tip'){
        body = '<div class="form-group"><label>Text</label><textarea rows="4" data-block-field="text" data-index="' + index + '">' + I.escapeHtml(block.text || '') + '</textarea></div>';
      } else if (block.type === 'list'){
        body = '<div class="form-group"><label>Items (one per line)</label><textarea rows="5" data-block-field="items" data-index="' + index + '">' + I.escapeHtml((block.items || []).join('\n')) + '</textarea></div>';
      } else if (block.type === 'separator'){
        body = '<p class="muted small">—</p>';
      } else if (block.type === 'image'){
        body = '' +
          '<div class="if-block-image-row">' + (block.path ? '<img class="if-block-image-thumb" loading="lazy" src="' + I.escapeAttr(block.url || publicImageUrl('influencer-post-media', block.path)) + '" alt=""/>' : '<div class="if-block-image-thumb if-block-image-thumb--placeholder">IMG</div>') + '<div class="form-group"><label>Upload</label><div class="if-file-control"><button class="btn secondary small" type="button" data-block-upload-trigger="' + index + '">' + I.escapeHtml(L('chooseImage')) + '</button><span class="if-file-name" id="if-block-upload-name-' + index + '">' + I.escapeHtml(L('noFileSelected')) + '</span><input accept="image/png,image/jpeg,image/webp" class="if-native-file" data-block-upload="' + index + '" id="if-block-upload-' + index + '" type="file"/></div><p class="muted small">max lato lungo ~2000px</p></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Caption</label><input type="text" value="' + I.escapeAttr(block.caption || '') + '" data-block-field="caption" data-index="' + index + '"/></div><div class="form-group"><label>Size</label><select data-block-field="size" data-index="' + index + '"><option value="small"' + (block.size === 'small' ? ' selected' : '') + '>small</option><option value="medium"' + (block.size === 'medium' ? ' selected' : '') + '>medium</option><option value="full"' + (block.size === 'full' ? ' selected' : '') + '>full</option></select></div></div>';
      } else if (block.type === 'stay22'){
        body = '' +
          '<div class="form-row-2"><div class="form-group"><label>Title</label><input type="text" value="' + I.escapeAttr(block.title || '') + '" data-block-field="title" data-index="' + index + '"/></div><div class="form-group"><label>CTA</label><input type="text" value="' + I.escapeAttr(block.ctaLabel || '') + '" data-block-field="ctaLabel" data-index="' + index + '"/></div></div>' +
          '<div class="form-group"><label>Address / destination</label><input type="text" value="' + I.escapeAttr(block.destination || '') + '" data-block-field="destination" data-index="' + index + '"/></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Check-in</label><input type="date" value="' + I.escapeAttr(block.checkin || '') + '" data-block-field="checkin" data-index="' + index + '"/></div><div class="form-group"><label>Check-out</label><input type="date" value="' + I.escapeAttr(block.checkout || '') + '" data-block-field="checkout" data-index="' + index + '"/></div></div>' +
          '<div class="form-group"><label>Description</label><textarea rows="3" data-block-field="description" data-index="' + index + '">' + I.escapeHtml(block.description || '') + '</textarea></div>';
      } else if (block.type === 'aviasales'){
        body = '' +
          '<div class="form-row-2"><div class="form-group"><label>Title</label><input type="text" value="' + I.escapeAttr(block.title || '') + '" data-block-field="title" data-index="' + index + '"/></div><div class="form-group"><label>CTA</label><input type="text" value="' + I.escapeAttr(block.ctaLabel || '') + '" data-block-field="ctaLabel" data-index="' + index + '"/></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Origin IATA</label><input maxlength="3" type="text" value="' + I.escapeAttr(block.origin || '') + '" data-block-field="origin" data-index="' + index + '"/></div><div class="form-group"><label>Destination IATA</label><input maxlength="3" type="text" value="' + I.escapeAttr(block.destination || '') + '" data-block-field="destination" data-index="' + index + '"/></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Depart date</label><input type="date" value="' + I.escapeAttr(block.checkin || '') + '" data-block-field="checkin" data-index="' + index + '"/></div><div class="form-group"><label>Return date</label><input type="date" value="' + I.escapeAttr(block.returnDate || '') + '" data-block-field="returnDate" data-index="' + index + '"/></div></div>' +
          '<div class="form-group"><label>Description</label><textarea rows="3" data-block-field="description" data-index="' + index + '">' + I.escapeHtml(block.description || '') + '</textarea></div>' +
          '<p class="muted small">Use 3-letter IATA codes for origin and destination.</p>';
      }
      return '<article class="if-block-card" data-block-type="' + I.escapeAttr(block.type) + '"><div class="if-block-card__head"><strong>' + I.escapeHtml(t('block' + block.type.charAt(0).toUpperCase() + block.type.slice(1)) || block.type) + '</strong>' + controls + '</div><div class="if-block-card__body">' + body + '</div></article>';
    }).join('');

    bindBlockEditorEvents();
  }

  function bindBlockEditorEvents(){
    $all('[data-block-up]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.getAttribute('data-block-up') || '-1', 10);
        if (idx > 0){ var tmp = state.editorData.blocks[idx - 1]; state.editorData.blocks[idx - 1] = state.editorData.blocks[idx]; state.editorData.blocks[idx] = tmp; renderEditor(); }
      });
    });
    $all('[data-block-down]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.getAttribute('data-block-down') || '-1', 10);
        if (idx >= 0 && idx < state.editorData.blocks.length - 1){ var tmp = state.editorData.blocks[idx + 1]; state.editorData.blocks[idx + 1] = state.editorData.blocks[idx]; state.editorData.blocks[idx] = tmp; renderEditor(); }
      });
    });
    $all('[data-block-delete]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.getAttribute('data-block-delete') || '-1', 10);
        if (idx >= 0){ state.editorData.blocks.splice(idx, 1); if (!state.editorData.blocks.length) state.editorData.blocks.push(defaultBlock('paragraph')); renderEditor(); }
      });
    });
    $all('[data-block-field]').forEach(function(input){
      input.addEventListener('input', function(){
        var idx = parseInt(input.getAttribute('data-index') || '-1', 10);
        var field = input.getAttribute('data-block-field');
        if (idx < 0 || !field) return;
        if (field === 'items') state.editorData.blocks[idx].items = String(input.value || '').split('\n');
        else state.editorData.blocks[idx][field] = input.value;
        renderPostPreview();
      });
      input.addEventListener('change', function(){
        var idx = parseInt(input.getAttribute('data-index') || '-1', 10);
        var field = input.getAttribute('data-block-field');
        if (idx < 0 || !field) return;
        if (field === 'items') state.editorData.blocks[idx].items = String(input.value || '').split('\n');
        else state.editorData.blocks[idx][field] = input.value;
        renderPostPreview();
      });
    });
    $all('[data-block-upload-trigger]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = btn.getAttribute('data-block-upload-trigger');
        var input = document.getElementById('if-block-upload-' + idx);
        if (input) input.click();
      });
    });
    $all('[data-block-upload]').forEach(function(input){
      input.addEventListener('change', async function(){
        var idx = parseInt(input.getAttribute('data-block-upload') || '-1', 10);
        var file = input.files && input.files[0] ? input.files[0] : null;
        updateFileNameLabel($('#if-block-upload-name-' + idx), file);
        input.value = '';
        if (idx < 0 || !file) return;
        try{
          var upload = await uploadImage({
            bucket: 'influencer-post-media',
            file: file,
            path: state.user.id + '/inline/' + Date.now() + '_' + Math.random().toString(36).slice(2,8) + '.webp',
            maxWidth: 2000,
            maxHeight: 2000,
            quality: 0.86
          });
          state.editorData.blocks[idx].path = upload.path;
          state.editorData.blocks[idx].url = upload.url;
          renderEditor();
        }catch(err){
          console.error(err);
          notify(t('invalidImage'), 'error');
        }
      });
    });
  }

  function resetEditor(openComposer){
    state.currentPost = null;
    state.currentRevision = null;
    state.editorData = basePostEditor();
    state.autoSlug = true;
    state.previewVisible = false;
    state.postPreviewVisible = false;
    state.editorOpen = !!openComposer;
    if (state.editorOpen){
      renderEditor();
    } else {
      setEditorPanelVisibility(false);
    }
  }

  async function editPost(postId){
    var post = state.posts.find(function(item){ return item.id === postId; });
    if (!post) return;
    state.currentPost = post;
    var revision = null;
    if (post.current_pending_revision_id){
      try{
        var pending = await state.client.from('influencer_post_revisions').select('*').eq('id', post.current_pending_revision_id).maybeSingle();
        revision = pending && pending.data ? pending.data : null;
      }catch(_){ }
    }
    if (!revision && post.current_live_revision_id){
      try{
        var live = await state.client.from('influencer_post_revisions').select('*').eq('id', post.current_live_revision_id).maybeSingle();
        revision = live && live.data ? live.data : null;
      }catch(_e){ }
    }
    state.currentRevision = revision;
    state.editorData = extractRevisionContent(revision || { title: post.title, excerpt: post.excerpt, cover_path: post.cover_path, content_json: [] });
    state.editorData.post_slug = post.post_slug || state.editorData.post_slug;
    state.editorData.post_short_id = post.post_short_id || state.editorData.post_short_id;
    state.previewVisible = false;
    state.postPreviewVisible = false;
    state.editorOpen = true;
    renderEditor();
    var panel = $('#if-editor-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function deletePost(postId){
    if (!state.client) return;
    try{
      var result = await state.client.from('influencer_posts').update({ status: 'deleted', deleted_at: new Date().toISOString() }).eq('id', postId);
      if (result && result.error) throw result.error;
      notify(t('postDeleted'), 'success');
      await loadDashboardData();
      if (state.currentPost && state.currentPost.id === postId) resetEditor(false);
    }catch(err){
      console.error(err);
      notify(err.message || 'Errore durante eliminazione post.', 'error');
    }
  }

  function readProfileForm(){
    var draft = syncProfileSlug({
      display_name: String(($('#if-profile-display-name') || {}).value || '').trim(),
      bio: '',
      avatar_path: (state.profileDraft && state.profileDraft.avatar_path) || '',
      social_links: {}
    });
    draft.bio = String(($('#if-profile-bio') || {}).value || '').trim();
    draft.social_links = {};
    var invalid = false;
    Object.keys(I.SOCIALS).forEach(function(platform){
      var input = $('#if-social-' + platform);
      var raw = String((input || {}).value || '').trim();
      if (!raw) return;
      var normalized = normalizeSocialUrl(platform, raw);
      if (!normalized) invalid = true;
      else draft.social_links[platform] = normalized;
    });
    if (invalid) throw new Error(t('invalidSocial'));
    return draft;
  }

  async function ensureProfileBase(seed){
    if (state.profile) return state.profile;
    seed = syncProfileSlug(seed);
    var payload = {
      affiliate_slug: state.affiliateSlug,
      display_name: seed.display_name || state.affiliateSlug,
      public_slug: seed.public_slug || slugify(seed.display_name || state.affiliateSlug || 'creator'),
      bio: seed.bio || '',
      avatar_path: seed.avatar_path || null,
      social_links: seed.social_links || {},
      status: 'draft'
    };
    var insert = await state.client.from('influencer_profiles').insert(payload).select('*').single();
    if (insert && insert.error) throw insert.error;
    state.profile = insert.data;
    return state.profile;
  }

  async function saveProfile(mode){
    if (!state.client) return;
    try{
      var draft = syncProfileSlug(readProfileForm());
      var base = await ensureProfileBase(draft);
      state.profileDraft = draft;
      var pending = null;
      if (base.current_pending_revision_id){
        try{
          var pendingResp = await state.client.from('influencer_profile_revisions').select('*').eq('id', base.current_pending_revision_id).maybeSingle();
          pending = pendingResp && pendingResp.data ? pendingResp.data : null;
        }catch(_){ }
      }
      var editablePending = pending && ['draft','pending_review','changes_requested','rejected'].indexOf(pending.status) !== -1;
      var revisionNo = editablePending ? pending.revision_no : 1;
      if (!editablePending){
        var maxResp = await state.client.from('influencer_profile_revisions').select('revision_no').eq('profile_id', base.id).order('revision_no', { ascending: false }).limit(1);
        var rows = maxResp && maxResp.data ? maxResp.data : [];
        revisionNo = rows.length ? (Number(rows[0].revision_no) + 1) : 1;
      }
      var revisionPayload = {
        profile_id: base.id,
        revision_no: revisionNo,
        display_name: draft.display_name,
        public_slug: draft.public_slug,
        bio: draft.bio,
        avatar_path: draft.avatar_path || null,
        social_links: draft.social_links || {},
        status: mode === 'review' ? 'pending_review' : 'draft',
        submitted_at: mode === 'review' ? new Date().toISOString() : null,
        review_notes: null
      };
      var revision;
      if (editablePending){
        var updateRev = await state.client.from('influencer_profile_revisions').update(revisionPayload).eq('id', pending.id).select('*').single();
        if (updateRev && updateRev.error) throw updateRev.error;
        revision = updateRev.data;
      } else {
        var insertRev = await state.client.from('influencer_profile_revisions').insert(revisionPayload).select('*').single();
        if (insertRev && insertRev.error) throw insertRev.error;
        revision = insertRev.data;
      }
      var baseUpdate = {
        current_pending_revision_id: revision.id,
        status: base.current_published_revision_id ? 'published' : (mode === 'review' ? 'pending_review' : 'draft'),
        review_notes: null
      };
      if (!base.current_published_revision_id){
        baseUpdate.display_name = draft.display_name;
        baseUpdate.public_slug = draft.public_slug;
        baseUpdate.bio = draft.bio;
        baseUpdate.avatar_path = draft.avatar_path || null;
        baseUpdate.social_links = draft.social_links || {};
      }
      var updateBase = await state.client.from('influencer_profiles').update(baseUpdate).eq('id', base.id).select('*').single();
      if (updateBase && updateBase.error) throw updateBase.error;
      state.profile = updateBase.data;
      state.profilePendingRevision = revision;
      if (mode === 'review') notify(t('toastReview'), 'info');
      else notify(t('profileSaved'), 'success');
      await loadDashboardData();
    }catch(err){
      console.error(err);
      notify(err.message || 'Errore salvataggio profilo.', 'error');
    }
  }

  async function savePost(mode){
    if (!state.client || !state.editorData) return;
    updateEditorStateFromForm();
    try{
      var editor = clone(state.editorData);
      if (!editor.title) throw new Error('Titolo post obbligatorio.');
      var profileBase = await ensureProfileBase(state.profileDraft || emptyProfileDraft());
      var postBase = state.currentPost;
      if (postBase && postBase.current_live_revision_id && postBase.post_slug){
        editor.post_slug = postBase.post_slug;
      } else {
        editor.post_slug = await ensureUniquePostSlug(slugify(editor.title), postBase ? postBase.id : null);
      }
      if (!editor.post_slug) throw new Error('Titolo post non valido per creare lo slug.');
      if (!postBase){
        var insertPost = await state.client.from('influencer_posts').insert({
          profile_id: profileBase.id,
          affiliate_slug: state.affiliateSlug,
          post_slug: editor.post_slug,
          post_short_id: editor.post_short_id || ('p' + Math.random().toString(36).slice(2, 6)),
          title: editor.title,
          excerpt: editor.excerpt || null,
          cover_path: editor.cover_path || null,
          status: mode === 'review' ? 'pending_review' : 'draft'
        }).select('*').single();
        if (insertPost && insertPost.error) throw insertPost.error;
        postBase = insertPost.data;
        state.currentPost = postBase;
      }

      var pendingRevision = null;
      if (postBase.current_pending_revision_id){
        try{
          var pendingResp = await state.client.from('influencer_post_revisions').select('*').eq('id', postBase.current_pending_revision_id).maybeSingle();
          pendingRevision = pendingResp && pendingResp.data ? pendingResp.data : null;
        }catch(_){ }
      }
      var editablePending = pendingRevision && ['draft','pending_review','changes_requested','rejected'].indexOf(pendingRevision.status) !== -1;
      var revisionNo = editablePending ? pendingRevision.revision_no : 1;
      if (!editablePending){
        var maxRev = await state.client.from('influencer_post_revisions').select('revision_no').eq('post_id', postBase.id).order('revision_no', { ascending: false }).limit(1);
        var rows = maxRev && maxRev.data ? maxRev.data : [];
        revisionNo = rows.length ? (Number(rows[0].revision_no) + 1) : 1;
      }

      var normalized = normalizeContentBlocks(editor.blocks, {
        creatorSlug: state.affiliateSlug,
        postShortId: postBase.post_short_id || editor.post_short_id,
        postId: postBase.id,
        postSlug: postBase.post_slug || editor.post_slug
      });
      editor.blocks = normalized.blocks;
      var contentHtml = renderContentHtml(editor.blocks, { creatorSlug: state.affiliateSlug, postShortId: postBase.post_short_id || editor.post_short_id, postId: postBase.id, postSlug: postBase.post_slug || editor.post_slug });
      var revisionPayload = {
        post_id: postBase.id,
        revision_no: revisionNo,
        title: editor.title,
        excerpt: editor.excerpt || null,
        cover_path: editor.cover_path || null,
        content_json: editor.blocks,
        content_html: contentHtml,
        widgets_json: normalized.widgets,
        status: mode === 'review' ? 'pending_review' : 'draft',
        submitted_at: mode === 'review' ? new Date().toISOString() : null,
        review_notes: null
      };
      var revision;
      if (editablePending){
        var updRev = await state.client.from('influencer_post_revisions').update(revisionPayload).eq('id', pendingRevision.id).select('*').single();
        if (updRev && updRev.error) throw updRev.error;
        revision = updRev.data;
      } else {
        var insRev = await state.client.from('influencer_post_revisions').insert(revisionPayload).select('*').single();
        if (insRev && insRev.error) throw insRev.error;
        revision = insRev.data;
      }

      try{ await state.client.from('influencer_post_widgets').delete().eq('revision_id', revision.id); }catch(_del){ }
      if (normalized.widgets.length){
        var widgets = normalized.widgets.map(function(item){
          return {
            post_id: postBase.id,
            revision_id: revision.id,
            affiliate_slug: state.affiliateSlug,
            post_slug: postBase.post_slug || editor.post_slug,
            widget_short_id: item.widget_short_id,
            tracking_code: item.tracking_code,
            partner: item.partner,
            title: item.title,
            config_json: item.config_json
          };
        });
        var widgetsInsert = await state.client.from('influencer_post_widgets').insert(widgets);
        if (widgetsInsert && widgetsInsert.error) throw widgetsInsert.error;
      }

      var postUpdate = {
        current_pending_revision_id: revision.id,
        status: postBase.current_live_revision_id ? 'published' : (mode === 'review' ? 'pending_review' : 'draft'),
        review_notes: null
      };
      if (!postBase.current_live_revision_id){
        postUpdate.post_slug = editor.post_slug;
        postUpdate.title = editor.title;
        postUpdate.excerpt = editor.excerpt || null;
        postUpdate.cover_path = editor.cover_path || null;
      }
      var updPost = await state.client.from('influencer_posts').update(postUpdate).eq('id', postBase.id).select('*').single();
      if (updPost && updPost.error) throw updPost.error;
      state.currentPost = updPost.data;
      state.currentRevision = revision;
      if (mode === 'review') notify(t('toastReview'), 'info');
      else notify(t('postSaved'), 'success');
      await loadDashboardData();
      editPost(state.currentPost.id);
    }catch(err){
      console.error(err);
      notify(err.message || 'Errore salvataggio post.', 'error');
    }
  }

  async function loadDashboardData(){
    if (!state.client) return;
    var profileResp = await state.client.from('influencer_profiles').select('*').eq('affiliate_slug', state.affiliateSlug).maybeSingle();
    state.profile = profileResp && profileResp.data ? profileResp.data : null;
    state.profilePendingRevision = null;
    state.profilePublishedRevision = null;
    if (state.profile && state.profile.current_pending_revision_id){
      try{
        var p1 = await state.client.from('influencer_profile_revisions').select('*').eq('id', state.profile.current_pending_revision_id).maybeSingle();
        state.profilePendingRevision = p1 && p1.data ? p1.data : null;
      }catch(_){ }
    }
    if (state.profile && state.profile.current_published_revision_id){
      try{
        var p2 = await state.client.from('influencer_profile_revisions').select('*').eq('id', state.profile.current_published_revision_id).maybeSingle();
        state.profilePublishedRevision = p2 && p2.data ? p2.data : null;
      }catch(_e){ }
    }
    if (state.profilePendingRevision){
      state.profileDraft = syncProfileSlug({
        display_name: state.profilePendingRevision.display_name,
        public_slug: state.profilePendingRevision.public_slug,
        bio: state.profilePendingRevision.bio || '',
        avatar_path: state.profilePendingRevision.avatar_path || '',
        social_links: typeof state.profilePendingRevision.social_links === 'string' ? safeJsonParse(state.profilePendingRevision.social_links, {}) : (state.profilePendingRevision.social_links || {})
      });
    } else if (state.profile){
      state.profileDraft = syncProfileSlug({
        display_name: state.profile.display_name || '',
        public_slug: state.profile.public_slug || '',
        bio: state.profile.bio || '',
        avatar_path: state.profile.avatar_path || '',
        social_links: typeof state.profile.social_links === 'string' ? safeJsonParse(state.profile.social_links, {}) : (state.profile.social_links || {})
      });
    } else {
      state.profileDraft = emptyProfileDraft();
    }

    var statsResp = await state.client.from('influencer_creator_private_stats').select('*').eq('affiliate_slug', state.affiliateSlug).maybeSingle();
    state.stats = statsResp && statsResp.data ? statsResp.data : {
      card_impressions: 0,
      post_opens: 0,
      widget_clicks: 0,
      booking_pending: 0,
      booking_confirmed: 0,
      estimated_revenue_usd: 0,
      confirmed_revenue_usd: 0,
      available_balance: 0
    };

    var postsResp = await state.client.from('influencer_posts').select('*').eq('affiliate_slug', state.affiliateSlug).order('updated_at', { ascending: false });
    state.posts = postsResp && postsResp.data ? postsResp.data.filter(function(item){ return item.status !== 'deleted'; }) : [];
    state.postKpis = {};
    if (state.posts.length){
      var ids = state.posts.map(function(item){ return item.id; });
      var kpiResp = await state.client.from('influencer_post_kpis').select('*').in('post_id', ids);
      var rows = kpiResp && kpiResp.data ? kpiResp.data : [];
      rows.forEach(function(row){ state.postKpis[row.post_id] = row; });
    }

    renderProfileForm();
    renderStats();
    renderPostsList();
    if (state.editorOpen) renderEditor();
    else setEditorPanelVisibility(false);
  }

  async function init(){
    renderApp();
    var auth = await findActiveClient();
    state.client = auth.client;
    state.user = auth.user;
    if (!state.client || !state.user){ renderLoginRequired(); return; }
    setProfileTabVisibility(true);
    state.affiliateSlug = await getAffiliateSlug(state.client);
    if (!state.affiliateSlug){ renderLoginRequired(); return; }
    state.editorData = basePostEditor();
    state.editorOpen = false;
    await loadDashboardData();
    if (!state.currentPost) resetEditor(false);
  }

  init();
})();
