// Travirae - Influencers Vlogs shared module
(function(){
  'use strict';

  if (window.TraviraeInfluencers && window.TraviraeInfluencers.__ready) {
    if (document.body && document.body.classList.contains('page--influencers-vlogs') && typeof window.TraviraeInfluencers.initPublicPage === 'function') {
      window.TraviraeInfluencers.initPublicPage();
    }
    return;
  }

  var LANG_BY_SUFFIX = { en: 'en', de: 'de', es: 'es', fr: 'fr', nl: 'nl', ru: 'ru', ar: 'ar', zh: 'zh' };
  var LANG_TO_AVIASALES = { it: 'it', en: 'en', de: 'de', es: 'es', fr: 'fr', nl: 'nl', ru: 'ru', ar: 'ar', zh: 'zh' };
  var SUFFIX_BY_LANG = { it: '', en: '-en', de: '-de', es: '-es', fr: '-fr', nl: '-nl', ru: '-ru', ar: '-ar', zh: '-zh' };
  var STAY22_AID = 'travirae';
  var AVIASALES_MARKER = '669407';
  var DEFAULTS = {
    loading: 'Caricamento in corso…',
    noPosts: 'Nessun post pubblicato al momento.',
    noCreator: 'Creator non trovato o non pubblicato.',
    discoverMore: 'Scopri di più',
    copyLink: 'Copia link',
    linkCopied: 'Link copiato.',
    close: 'Chiudi',
    previous: 'Precedente',
    next: 'Successiva',
    page: 'Pagina',
    by: 'di',
    creatorPosts: 'Post pubblicati',
    publicProfile: 'Profilo pubblico',
    loadingCreator: 'Carico il profilo creator…',
    toastReview: 'Il tuo post è in fase di revisione, l’operazione potrebbe richiedere fino a 48 ore lavorative.',
    saveDraft: 'Salva bozza',
    submitReview: 'Invia in revisione',
    profileSaved: 'Profilo salvato.',
    postSaved: 'Bozza salvata.',
    postDeleted: 'Post eliminato logicamente.',
    invalidSocial: 'Uno o più link social non sono validi per il dominio richiesto.',
    invalidImage: 'File immagine non valido. Usa JPG, PNG o WEBP fino a 8 MB.',
    loginRequired: 'Per accedere a questa sezione devi effettuare il login nell’area affiliati.',
    goToLogin: 'Vai al login',
    cardImpressions: 'Impression card',
    postOpens: 'Aperture popup post',
    widgetClicks: 'Click widget outbound',
    bookingPending: 'Booking pending',
    bookingConfirmed: 'Booking confirmed',
    estimatedRevenue: 'Revenue stimata',
    confirmedRevenue: 'Revenue confermata',
    availableBalance: 'Saldo disponibile',
    profileViews: 'Visualizzazioni profilo',
    blockHeading: 'Heading',
    blockParagraph: 'Paragrafo',
    blockImage: 'Immagine',
    blockList: 'Lista puntata',
    blockQuote: 'Quote',
    blockTip: 'Tip / Callout',
    blockSeparator: 'Separatore',
    blockStay22: 'Hotel Map',
    blockAviasales: 'Flights Widget',
    newPost: 'Nuovo post',
    editPost: 'Modifica post',
    deletePost: 'Elimina post',
    createFirstPost: 'Crea il tuo primo post',
    noPostsYet: 'Non hai ancora creato post.',
    status: 'Stato',
    live: 'Live',
    pending: 'Pending',
    reviewNotes: 'Note revisione',
    approve: 'Approva',
    reject: 'Rifiuta',
    requestChanges: 'Richiedi modifiche',
    archive: 'Archivia',
    logicalDelete: 'Eliminazione logica',
    creators: 'Creator',
    emptyState: 'Nessun elemento da mostrare.',
    queueProfiles: 'Profili pending',
    queuePosts: 'Post pending',
    queueChanges: 'Modifiche pending',
    liveProfile: 'Profilo live',
    pendingProfile: 'Bozza / revisione pending',
    livePost: 'Post live',
    pendingPost: 'Post pending',
    socialInstagram: 'Instagram',
    socialTiktok: 'TikTok',
    socialYoutube: 'YouTube',
    socialFacebook: 'Facebook',
    socialPinterest: 'Pinterest',
    socialTelegram: 'Telegram',
    socialWebsite: 'Website / Blog',
    socialX: 'X',
    creatorLink: 'Apri profilo creator',
    widgetStay22Action: 'Apri Hotel Map',
    widgetAviasalesAction: 'Apri Flights Widget',
    backToList: 'Torna alla lista',
    shareablePopup: 'Popup condivisibile via URL'
  };
  var STRINGS = {
    it: DEFAULTS,
    en: Object.assign({}, DEFAULTS, {
      loading: 'Loading…', noPosts: 'No published posts yet.', noCreator: 'Creator not found or not published.', discoverMore: 'Discover more', copyLink: 'Copy link', linkCopied: 'Link copied.', close: 'Close', previous: 'Previous', next: 'Next', page: 'Page', by: 'by', creatorPosts: 'Published posts', publicProfile: 'Public profile', loadingCreator: 'Loading creator profile…', toastReview: 'Your post is under review. The operation may take up to 48 working hours.', saveDraft: 'Save draft', submitReview: 'Send to review', profileSaved: 'Profile saved.', postSaved: 'Draft saved.', postDeleted: 'Post logically deleted.', invalidSocial: 'One or more social links are invalid for the required domain.', invalidImage: 'Invalid image file. Use JPG, PNG or WEBP up to 8 MB.', loginRequired: 'You need to sign in in the affiliate area to access this section.', goToLogin: 'Go to login', cardImpressions: 'Card impressions', postOpens: 'Post popup opens', widgetClicks: 'Outbound widget clicks', bookingPending: 'Pending bookings', bookingConfirmed: 'Confirmed bookings', estimatedRevenue: 'Estimated revenue', confirmedRevenue: 'Confirmed revenue', availableBalance: 'Available balance', profileViews: 'Profile views', blockParagraph: 'Paragraph', blockImage: 'Image', blockList: 'Bulleted list', blockTip: 'Tip / Callout', blockSeparator: 'Separator', newPost: 'New post', editPost: 'Edit post', deletePost: 'Delete post', createFirstPost: 'Create your first post', noPostsYet: 'You have not created any posts yet.', status: 'Status', live: 'Live', pending: 'Pending', reviewNotes: 'Review notes', approve: 'Approve', reject: 'Reject', requestChanges: 'Request changes', archive: 'Archive', logicalDelete: 'Logical delete', creators: 'Creators', emptyState: 'Nothing to show.', queueProfiles: 'Pending profiles', queuePosts: 'Pending posts', queueChanges: 'Pending changes', liveProfile: 'Live profile', pendingProfile: 'Pending draft / review', livePost: 'Live post', pendingPost: 'Pending post', socialWebsite: 'Website / Blog', creatorLink: 'Open creator profile', widgetStay22Action: 'Open Hotel Map', widgetAviasalesAction: 'Open Flights Widget', backToList: 'Back to list', shareablePopup: 'Shareable popup via URL'
    }),
    de: Object.assign({}, DEFAULTS, { loading: 'Laden…', noPosts: 'Noch keine veröffentlichten Beiträge.', noCreator: 'Creator nicht gefunden oder nicht veröffentlicht.', discoverMore: 'Mehr erfahren', copyLink: 'Link kopieren', linkCopied: 'Link kopiert.', close: 'Schließen', previous: 'Zurück', next: 'Weiter', page: 'Seite', by: 'von', creatorPosts: 'Veröffentlichte Beiträge', publicProfile: 'Öffentliches Profil', loadingCreator: 'Creator-Profil wird geladen…', toastReview: 'Dein Beitrag wird geprüft. Der Vorgang kann bis zu 48 Arbeitsstunden dauern.', saveDraft: 'Entwurf speichern', submitReview: 'Zur Prüfung senden', profileSaved: 'Profil gespeichert.', postSaved: 'Entwurf gespeichert.', postDeleted: 'Beitrag logisch gelöscht.', invalidSocial: 'Mindestens ein Social-Link ist für die erforderliche Domain ungültig.', invalidImage: 'Ungültige Bilddatei. Bitte JPG, PNG oder WEBP bis 8 MB verwenden.', loginRequired: 'Du musst dich im Affiliate-Bereich anmelden, um diese Seite zu öffnen.', goToLogin: 'Zum Login', cardImpressions: 'Card-Impressionen', postOpens: 'Post-Popup-Öffnungen', widgetClicks: 'Outbound-Widget-Klicks', bookingPending: 'Offene Buchungen', bookingConfirmed: 'Bestätigte Buchungen', estimatedRevenue: 'Geschätzter Umsatz', confirmedRevenue: 'Bestätigter Umsatz', availableBalance: 'Verfügbares Guthaben', profileViews: 'Profilaufrufe' }),
    es: Object.assign({}, DEFAULTS, { loading: 'Cargando…', noPosts: 'Todavía no hay publicaciones publicadas.', noCreator: 'Creador no encontrado o no publicado.', discoverMore: 'Descubrir más', copyLink: 'Copiar enlace', linkCopied: 'Enlace copiado.', close: 'Cerrar', previous: 'Anterior', next: 'Siguiente', page: 'Página', by: 'por', creatorPosts: 'Posts publicados', publicProfile: 'Perfil público', loadingCreator: 'Cargando perfil del creador…', toastReview: 'Tu publicación está en revisión. La operación puede tardar hasta 48 horas laborables.', saveDraft: 'Guardar borrador', submitReview: 'Enviar a revisión', profileSaved: 'Perfil guardado.', postSaved: 'Borrador guardado.', postDeleted: 'Post eliminado lógicamente.' }),
    fr: Object.assign({}, DEFAULTS, { loading: 'Chargement…', noPosts: 'Aucun post publié pour le moment.', noCreator: 'Créateur introuvable ou non publié.', discoverMore: 'En savoir plus', copyLink: 'Copier le lien', linkCopied: 'Lien copié.', close: 'Fermer', previous: 'Précédent', next: 'Suivant', page: 'Page', by: 'par', creatorPosts: 'Posts publiés', publicProfile: 'Profil public', loadingCreator: 'Chargement du profil créateur…', toastReview: 'Votre post est en cours de révision. L’opération peut prendre jusqu’à 48 heures ouvrées.', saveDraft: 'Enregistrer le brouillon', submitReview: 'Envoyer en revue', profileSaved: 'Profil enregistré.', postSaved: 'Brouillon enregistré.', postDeleted: 'Post supprimé logiquement.' }),
    nl: Object.assign({}, DEFAULTS, { loading: 'Laden…', noPosts: 'Nog geen gepubliceerde posts.', noCreator: 'Creator niet gevonden of niet gepubliceerd.', discoverMore: 'Meer ontdekken', copyLink: 'Link kopiëren', linkCopied: 'Link gekopieerd.', close: 'Sluiten', previous: 'Vorige', next: 'Volgende', page: 'Pagina', by: 'door', creatorPosts: 'Gepubliceerde posts', publicProfile: 'Openbaar profiel', loadingCreator: 'Creator-profiel laden…', toastReview: 'Je post wordt beoordeeld. Dit kan tot 48 werkuren duren.', saveDraft: 'Concept opslaan', submitReview: 'Ter review versturen', profileSaved: 'Profiel opgeslagen.', postSaved: 'Concept opgeslagen.', postDeleted: 'Post logisch verwijderd.' }),
    ru: Object.assign({}, DEFAULTS, { loading: 'Загрузка…', noPosts: 'Опубликованных постов пока нет.', noCreator: 'Автор не найден или не опубликован.', discoverMore: 'Подробнее', copyLink: 'Скопировать ссылку', linkCopied: 'Ссылка скопирована.', close: 'Закрыть', previous: 'Назад', next: 'Далее', page: 'Страница', by: 'автор', creatorPosts: 'Опубликованные посты', publicProfile: 'Публичный профиль', loadingCreator: 'Загружаю профиль автора…', toastReview: 'Ваш пост находится на проверке. Операция может занять до 48 рабочих часов.', saveDraft: 'Сохранить черновик', submitReview: 'Отправить на проверку', profileSaved: 'Профиль сохранён.', postSaved: 'Черновик сохранён.', postDeleted: 'Пост логически удалён.' }),
    ar: Object.assign({}, DEFAULTS, { loading: 'جارٍ التحميل…', noPosts: 'لا توجد مقالات منشورة حالياً.', noCreator: 'صانع المحتوى غير موجود أو غير منشور.', discoverMore: 'اكتشف المزيد', copyLink: 'نسخ الرابط', linkCopied: 'تم نسخ الرابط.', close: 'إغلاق', previous: 'السابق', next: 'التالي', page: 'الصفحة', by: 'بواسطة', creatorPosts: 'المقالات المنشورة', publicProfile: 'الملف العام', loadingCreator: 'جارٍ تحميل ملف صانع المحتوى…', toastReview: 'منشورك قيد المراجعة، وقد تستغرق العملية حتى 48 ساعة عمل.', saveDraft: 'حفظ كمسودة', submitReview: 'إرسال للمراجعة', profileSaved: 'تم حفظ الملف.', postSaved: 'تم حفظ المسودة.', postDeleted: 'تم حذف المقال منطقياً.' }),
    zh: Object.assign({}, DEFAULTS, { loading: '加载中…', noPosts: '目前还没有已发布文章。', noCreator: '未找到创作者或尚未发布。', discoverMore: '了解更多', copyLink: '复制链接', linkCopied: '链接已复制。', close: '关闭', previous: '上一页', next: '下一页', page: '页', by: '作者', creatorPosts: '已发布文章', publicProfile: '公开资料', loadingCreator: '正在加载创作者资料…', toastReview: '你的文章正在审核中，处理时间最多可能需要 48 个工作小时。', saveDraft: '保存草稿', submitReview: '提交审核', profileSaved: '资料已保存。', postSaved: '草稿已保存。', postDeleted: '文章已逻辑删除。' })
  };

  var SOCIALS = {
    instagram: { labelKey: 'socialInstagram', domains: ['instagram.com'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.4" cy="6.6" r="1"></circle></svg>' },
    tiktok: { labelKey: 'socialTiktok', domains: ['tiktok.com'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v10.1a3.7 3.7 0 1 1-3.7-3.7c.2 0 .4 0 .6.1V7.1a6.6 6.6 0 1 0 6.6 6.6V9c1.1 1 2.5 1.6 3.9 1.6V7.9a4.9 4.9 0 0 1-3.9-2 5.4 5.4 0 0 1-1-2.9H14z"></path></svg>' },
    youtube: { labelKey: 'socialYoutube', domains: ['youtube.com', 'youtu.be'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.9 4.4 12 4.4 12 4.4s-6.9 0-8.5.5A3 3 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.6.4-5 .4-5Z"></path><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"></path></svg>' },
    facebook: { labelKey: 'socialFacebook', domains: ['facebook.com', 'fb.com'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-6 2.7-6 6v2H5v4h3v4h4v-4h3l1-4h-4v-2c0-1.1.9-2 2-2Z"></path></svg>' },
    pinterest: { labelKey: 'socialPinterest', domains: ['pinterest.com', 'pin.it'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6 2 11.1c0 3 1.7 5.7 4.4 6.8-.1-.6-.1-1.6 0-2.2.1-.6.9-3.8.9-3.8s-.2-.6-.2-1.4c0-1.3.7-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2- .8 3.1-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.3 0-2.2-1.6-3.8-3.9-3.8-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.2.1.1.1.3.1.4-.1.4-.2.9-.3 1-.1.2-.2.2-.4.1-1.5-.6-2.4-2.5-2.4-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.8-2.4 6.9-5.7 6.9-1.1 0-2.2-.6-2.6-1.3l-.7 2.4c-.2.8-.7 1.8-1 2.4.7.2 1.4.3 2.1.3 5.5 0 10-4 10-9.1C22 6 17.5 2 12 2Z"></path></svg>' },
    telegram: { labelKey: 'socialTelegram', domains: ['t.me', 'telegram.me', 'telegram.org'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 3 2 10.8l5.8 2.2L18.6 6l-8 7.2.3 5L13.8 15l3.7 2.7L22 3Z"></path></svg>' },
    website: { labelKey: 'socialWebsite', domains: [], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14.8 14.8 0 0 1 0 18"></path><path d="M12 3a14.8 14.8 0 0 0 0 18"></path></svg>' },
    x: { labelKey: 'socialX', domains: ['x.com', 'twitter.com'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4.3l4.2 5.8L17.3 4H20l-6.4 7.2L20 20h-4.3l-4.5-6.2L6.1 20H4l6.3-7.2L4 4Z"></path></svg>' }
  };

  function getLang(){
    try{
      var file = (window.location.pathname || '').split('/').pop() || '';
      var match = file.match(/-(en|de|es|fr|nl|ru|ar|zh)\.html$/i);
      if (match) return LANG_BY_SUFFIX[match[1].toLowerCase()] || 'it';
      var htmlLang = String(document.documentElement.getAttribute('lang') || '').toLowerCase();
      if (SUFFIX_BY_LANG.hasOwnProperty(htmlLang)) return htmlLang;
      var siteLang = String(window.TRAVIRAE_LANG || '').toUpperCase();
      var map = { ENG: 'en', DEU: 'de', FRA: 'fr', SPA: 'es', NLD: 'nl', RUS: 'ru', ARA: 'ar', ZHO: 'zh', ITA: 'it' };
      return map[siteLang] || 'it';
    }catch(_){ return 'it'; }
  }
  function t(key){
    var lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || DEFAULTS[key] || key;
  }
  function $(sel, root){ return (root || document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function escapeHtml(str){
    return String(str == null ? '' : str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function escapeAttr(str){ return escapeHtml(str); }
  function safeJsonParse(value, fallback){ try{ return value ? JSON.parse(value) : fallback; }catch(_){ return fallback; } }
  function randomId(prefix){
    prefix = prefix || '';
    try{ if (window.crypto && window.crypto.randomUUID) return prefix + window.crypto.randomUUID().replace(/-/g,'').slice(0,12); }catch(_){ }
    return prefix + Math.random().toString(36).slice(2, 12);
  }
  function shortId(prefix){ return String(prefix || '') + Math.random().toString(36).slice(2, 6); }
  function slugify(value){
    var source = String(value || '').toLowerCase();
    try{ source = source.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }catch(_){ }
    return source.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-').slice(0, 80);
  }
  function truncate(value, max){
    var text = String(value || '').trim();
    if (text.length <= max) return text;
    return text.slice(0, Math.max(0, max - 1)).trim() + '…';
  }
  function formatMoney(value){
    var n = Number(value || 0);
    if (!isFinite(n)) n = 0;
    try{ return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD'; }catch(_){ return n.toFixed(2) + ' USD'; }
  }
  function formatDate(value){
    if (!value) return '';
    var d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    try{ return d.toLocaleDateString(getLang(), { year: 'numeric', month: 'short', day: 'numeric' }); }catch(_){ return d.toISOString().slice(0, 10); }
  }
  function getClient(){ return window.supabaseClient || window.supabaseClientSession || null; }
  function notify(message, type){
    try{
      if (window.showToast) return window.showToast(String(message || ''), type || 'success');
      if (window.TraviraeToast) return window.TraviraeToast(String(message || ''), type || 'success');
    }catch(_){ }
    try{ alert(String(message || '')); }catch(_e){}
  }
  function getStorageValue(storage, key){ try{ return storage.getItem(key) || ''; }catch(_){ return ''; } }
  function setStorageValue(storage, key, value){ try{ storage.setItem(key, value); }catch(_){ } }
  function getPersistentId(storage, key){
    var value = getStorageValue(storage, key);
    if (value) return value;
    value = randomId('if_');
    setStorageValue(storage, key, value);
    return value;
  }
  function getSessionId(){ return getPersistentId(window.sessionStorage, 'travirae_influencer_session'); }
  function getVisitorId(){ return getPersistentId(window.localStorage, 'travirae_influencer_visitor'); }
  function publicImageUrl(bucket, path){
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    try{
      var client = getClient();
      if (client && client.storage){
        var result = client.storage.from(bucket).getPublicUrl(String(path).replace(/^\/+/, ''));
        if (result && result.data && result.data.publicUrl) return result.data.publicUrl;
      }
    }catch(_){ }
    var cfg = window.TRAVIRAE_CONFIG || {};
    var base = String(cfg.SUPABASE_URL || '').replace(/\/$/, '');
    if (!base) return path;
    return base + '/storage/v1/object/public/' + bucket + '/' + String(path).replace(/^\/+/, '');
  }
  function buildPagePath(baseName, lang){
    var suffix = SUFFIX_BY_LANG[lang || getLang()] || '';
    return String(baseName || '').replace(/-(en|de|es|fr|nl|ru|ar|zh)\.html$/i, '.html').replace(/\.html$/i, suffix + '.html');
  }
  function readQueryParam(name){ try{ return new URLSearchParams(window.location.search || '').get(name); }catch(_){ return null; } }
  function updateQueryParam(name, value, mode){
    var url = new URL(window.location.href);
    if (value == null || value === '') url.searchParams.delete(name);
    else url.searchParams.set(name, value);
    if (mode === 'push') window.history.pushState({}, '', url.toString());
    else window.history.replaceState({}, '', url.toString());
  }
  function normalizeSocialUrl(platform, raw){
    var value = String(raw || '').trim();
    if (!value) return '';
    var url;
    try{ url = new URL(/^https?:\/\//i.test(value) ? value : ('https://' + value)); }catch(_){ return ''; }
    var host = String(url.hostname || '').toLowerCase().replace(/^www\./, '');
    if (platform !== 'website'){
      var def = SOCIALS[platform];
      if (!def) return '';
      var ok = def.domains.some(function(domain){ return host === domain || host.endsWith('.' + domain); });
      if (!ok) return '';
    }
    return url.toString();
  }
  function socialListFromObject(obj){
    var source = obj && typeof obj === 'object' ? obj : {};
    return Object.keys(SOCIALS).map(function(platform){
      return { platform: platform, url: String(source[platform] || '').trim() };
    }).filter(function(item){ return !!item.url; });
  }
  function renderSocialLinks(obj){
    var items = socialListFromObject(obj);
    if (!items.length) return '';
    return '<div class="if-social-list">' + items.map(function(item){
      var def = SOCIALS[item.platform];
      return '<a class="if-social-link" href="' + escapeAttr(item.url) + '" target="_blank" rel="noopener" aria-label="' + escapeAttr(t(def.labelKey)) + '">' + def.icon + '<span>' + escapeHtml(t(def.labelKey)) + '</span></a>';
    }).join('') + '</div>';
  }
  function isImageType(file){ return !!(file && file.type && /image\/(jpeg|png|webp)/i.test(file.type)); }
  function readFileAsDataUrl(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(){ resolve(String(reader.result || '')); };
      reader.onerror = function(){ reject(new Error('read_error')); };
      reader.readAsDataURL(file);
    });
  }
  function loadImage(src){
    return new Promise(function(resolve, reject){
      var img = new Image();
      img.onload = function(){ resolve(img); };
      img.onerror = function(){ reject(new Error('image_load_error')); };
      img.src = src;
    });
  }
  async function compressImage(file, opts){
    opts = opts || {};
    var dataUrl = await readFileAsDataUrl(file);
    var img = await loadImage(dataUrl);
    var maxWidth = Number(opts.maxWidth || img.width) || img.width;
    var maxHeight = Number(opts.maxHeight || img.height) || img.height;
    var forceSquare = !!opts.forceSquare;
    var targetW = img.width;
    var targetH = img.height;
    if (forceSquare){
      var side = Math.min(img.width, img.height, maxWidth, maxHeight);
      targetW = side;
      targetH = side;
    } else {
      var ratio = Math.min(1, maxWidth / img.width || 1, maxHeight / img.height || 1);
      targetW = Math.max(1, Math.round(img.width * ratio));
      targetH = Math.max(1, Math.round(img.height * ratio));
    }
    var canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas_error');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    if (forceSquare){
      var sourceSide = Math.min(img.width, img.height);
      var sx = Math.round((img.width - sourceSide) / 2);
      var sy = Math.round((img.height - sourceSide) / 2);
      ctx.drawImage(img, sx, sy, sourceSide, sourceSide, 0, 0, targetW, targetH);
    } else {
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }
    var blob = await new Promise(function(resolve){ canvas.toBlob(resolve, 'image/webp', Math.min(0.95, Math.max(0.7, Number(opts.quality || 0.86)))); });
    if (!blob) throw new Error('encode_error');
    return blob;
  }
  async function uploadImage(options){
    options = options || {};
    var client = getClient();
    if (!client || !client.storage) throw new Error('supabase_storage_missing');
    var file = options.file;
    if (!file || !isImageType(file) || file.size > (options.maxInputBytes || 8 * 1024 * 1024)) throw new Error('invalid_image_file');
    var path = String(options.path || '').replace(/^\/+/, '');
    if (!path) throw new Error('missing_upload_path');
    var blob = await compressImage(file, options);
    var response = await client.storage.from(options.bucket).upload(path, blob, { upsert: true, contentType: 'image/webp', cacheControl: '3600' });
    if (response && response.error) throw response.error;
    return { path: path, url: publicImageUrl(options.bucket, path), contentType: 'image/webp', size: blob.size };
  }
  async function deleteStorageObject(bucket, path){
    var client = getClient();
    if (!client || !client.storage || !path) return;
    try{ await client.storage.from(bucket).remove([path]); }catch(_){ }
  }

  function buildWidgetTrackingCode(creatorSlug, postShortId, widgetShortId){
    var creator = String(creatorSlug || 'creator').replace(/[^a-zA-Z0-9_-]/g,'').slice(0, 30) || 'creator';
    var post = String(postShortId || 'post').replace(/[^a-zA-Z0-9_-]/g,'').slice(0, 12) || 'post';
    var wid = String(widgetShortId || 'w1').replace(/[^a-zA-Z0-9_-]/g,'').slice(0, 12) || 'w1';
    return 'ifp_' + creator + '_' + post + '_' + wid;
  }
  function buildStay22Url(config){
    config = config || {};
    var url = new URL('https://www.stay22.com/allez/roam');
    url.searchParams.set('aid', STAY22_AID);
    url.searchParams.set('campaign', String(config.trackingCode || ''));
    if (config.destination) url.searchParams.set('address', String(config.destination));
    if (config.checkin) url.searchParams.set('checkin', String(config.checkin));
    if (config.checkout) url.searchParams.set('checkout', String(config.checkout));
    return url.toString();
  }
  function buildAviasalesUrl(config){
    config = config || {};
    var url = new URL('https://search.aviasales.com/flights/');
    url.searchParams.set('marker', AVIASALES_MARKER);
    url.searchParams.set('sub_id', String(config.trackingCode || ''));
    url.searchParams.set('currency', 'USD');
    url.searchParams.set('adults', '1');
    url.searchParams.set('children', '0');
    url.searchParams.set('infants', '0');
    url.searchParams.set('trip_class', '0');
    url.searchParams.set('locale', LANG_TO_AVIASALES[getLang()] || 'en');
    if (config.origin) url.searchParams.set('origin_iata', String(config.origin).toUpperCase());
    if (config.destination) url.searchParams.set('destination_iata', String(config.destination).toUpperCase());
    if (config.departDate) url.searchParams.set('depart_date', String(config.departDate));
    if (config.returnDate) url.searchParams.set('return_date', String(config.returnDate));
    return url.toString();
  }
  function normalizeContentBlocks(blocks, context){
    context = context || {};
    var creatorSlug = context.creatorSlug || '';
    var postShortId = context.postShortId || '';
    var postId = context.postId || null;
    var postSlug = context.postSlug || '';
    var normalized = [];
    var widgets = [];
    (Array.isArray(blocks) ? blocks : []).forEach(function(raw){
      var block = Object.assign({}, raw || {});
      block.id = block.id || randomId('blk_');
      block.type = String(block.type || 'paragraph');
      if (block.type === 'heading'){
        block.level = block.level === 'h3' ? 'h3' : 'h2';
        block.text = String(block.text || '').trim();
      } else if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'tip'){
        block.text = String(block.text || '').trim();
      } else if (block.type === 'image'){
        block.path = String(block.path || '').trim();
        block.url = String(block.url || (block.path ? publicImageUrl('influencer-post-media', block.path) : '')).trim();
        block.caption = String(block.caption || '').trim();
        block.size = ['small','medium','full'].indexOf(block.size) === -1 ? 'medium' : block.size;
      } else if (block.type === 'list'){
        if (typeof block.items === 'string') block.items = block.items.split('\n');
        block.items = (Array.isArray(block.items) ? block.items : []).map(function(item){ return String(item || '').trim(); }).filter(Boolean);
      } else if (block.type === 'separator'){
        block.text = '';
      } else if (block.type === 'stay22' || block.type === 'aviasales'){
        block.partner = block.type === 'stay22' ? 'stay22' : 'aviasales';
        block.widgetShortId = block.widgetShortId || shortId('w');
        block.title = String(block.title || (block.partner === 'stay22' ? 'Hotel Map' : 'Flights Widget')).trim();
        block.description = String(block.description || '').trim();
        block.ctaLabel = String(block.ctaLabel || t('discoverMore')).trim();
        block.destination = String(block.destination || '').trim();
        block.checkin = String(block.checkin || '').trim();
        block.checkout = String(block.checkout || '').trim();
        block.origin = String(block.origin || '').trim();
        block.returnDate = String(block.returnDate || '').trim();
        block.widgetLocale = String(block.widgetLocale || getLang()).trim();
        block.trackingCode = block.trackingCode || buildWidgetTrackingCode(creatorSlug, postShortId, block.widgetShortId);
        widgets.push({
          widget_short_id: block.widgetShortId,
          partner: block.partner,
          tracking_code: block.trackingCode,
          title: block.title,
          config_json: {
            destination: block.destination,
            description: block.description,
            ctaLabel: block.ctaLabel,
            checkin: block.checkin,
            checkout: block.checkout,
            origin: block.origin,
            returnDate: block.returnDate,
            widgetLocale: block.widgetLocale,
            title: block.title,
            post_id: postId,
            post_slug: postSlug,
            source: 'influencer_post'
          }
        });
      }
      normalized.push(block);
    });
    return { blocks: normalized, widgets: widgets };
  }
  function renderWidgetCard(block, context){
    context = context || {};
    var post = context.post || {};
    var trackingCode = block.trackingCode || buildWidgetTrackingCode(context.creatorSlug, context.postShortId, block.widgetShortId);
    var href = block.partner === 'stay22' ? buildStay22Url({ trackingCode: trackingCode, destination: block.destination, checkin: block.checkin, checkout: block.checkout }) : buildAviasalesUrl({ trackingCode: trackingCode, origin: block.origin, destination: block.destination, departDate: block.checkin, returnDate: block.returnDate });
    var meta = [];
    if (block.partner === 'stay22'){
      if (block.destination) meta.push(escapeHtml(block.destination));
      if (block.checkin) meta.push(escapeHtml(block.checkin));
      if (block.checkout) meta.push(escapeHtml(block.checkout));
    } else {
      if (block.origin && block.destination) meta.push(escapeHtml(String(block.origin).toUpperCase()) + ' → ' + escapeHtml(String(block.destination).toUpperCase()));
      if (block.checkin) meta.push(escapeHtml(block.checkin));
      if (block.returnDate) meta.push(escapeHtml(block.returnDate));
    }
    return '' +
      '<section class="if-widget-card if-widget-card--' + escapeAttr(block.partner) + '" data-widget-wrap="1">' +
        '<div class="if-widget-card__head">' +
          '<span class="chip">' + escapeHtml(block.partner === 'stay22' ? 'Hotel Map' : 'Flights Widget') + '</span>' +
          '<span class="muted small">' + escapeHtml(t('shareablePopup')) + '</span>' +
        '</div>' +
        '<h3>' + escapeHtml(block.title || (block.partner === 'stay22' ? 'Hotel Map' : 'Flights Widget')) + '</h3>' +
        (block.description ? '<p class="muted">' + escapeHtml(block.description) + '</p>' : '') +
        (meta.length ? '<div class="if-widget-meta">' + meta.map(function(item){ return '<span>' + item + '</span>'; }).join('') + '</div>' : '') +
        '<a class="btn if-widget-card__cta" href="' + escapeAttr(href) + '" target="_blank" rel="noopener" ' +
          'data-widget-click="1" data-partner="' + escapeAttr(block.partner) + '" data-widget-short-id="' + escapeAttr(block.widgetShortId || '') + '" data-tracking-code="' + escapeAttr(trackingCode) + '" ' +
          'data-post-id="' + escapeAttr(post.post_id || '') + '" data-post-slug="' + escapeAttr(post.post_slug || context.postSlug || '') + '" data-creator-slug="' + escapeAttr(post.creator_affiliate_slug || post.creator_slug || context.creatorSlug || '') + '">' +
          escapeHtml(block.ctaLabel || t(block.partner === 'stay22' ? 'widgetStay22Action' : 'widgetAviasalesAction')) +
        '</a>' +
      '</section>';
  }
  function renderContentHtml(blocks, context){
    var normalized = normalizeContentBlocks(blocks, context).blocks;
    return normalized.map(function(block){
      if (block.type === 'heading') return '<' + block.level + ' class="if-rich-heading">' + escapeHtml(block.text) + '</' + block.level + '>';
      if (block.type === 'paragraph') return '<p class="if-rich-paragraph">' + escapeHtml(block.text).replace(/\n/g, '<br/>') + '</p>';
      if (block.type === 'quote') return '<blockquote class="if-rich-quote">' + escapeHtml(block.text).replace(/\n/g, '<br/>') + '</blockquote>';
      if (block.type === 'tip') return '<div class="if-rich-callout">' + escapeHtml(block.text).replace(/\n/g, '<br/>') + '</div>';
      if (block.type === 'separator') return '<hr class="if-rich-separator"/>';
      if (block.type === 'list') return '<ul class="if-rich-list">' + (block.items || []).map(function(item){ return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
      if (block.type === 'image'){
        var imgUrl = block.url || (block.path ? publicImageUrl('influencer-post-media', block.path) : '');
        if (!imgUrl) return '';
        return '<figure class="if-rich-image is-' + escapeAttr(block.size || 'medium') + '"><img loading="lazy" src="' + escapeAttr(imgUrl) + '" alt=""/>' + (block.caption ? '<figcaption class="if-rich-caption">' + escapeHtml(block.caption) + '</figcaption>' : '') + '</figure>';
      }
      if (block.type === 'stay22' || block.type === 'aviasales') return renderWidgetCard(block, context);
      return '';
    }).join('');
  }
  async function trackEvent(payload, dedupeKey, dedupeMs){
    var client = getClient();
    if (!client || !client.from || !payload) return false;
    try{
      if (dedupeKey){
        var key = 'if_event_' + dedupeKey;
        var now = Date.now();
        var last = parseInt(getStorageValue(window.sessionStorage, key) || '0', 10);
        if (last && (now - last) < (dedupeMs || 1000 * 60 * 30)) return false;
        setStorageValue(window.sessionStorage, key, String(now));
      }
      var row = Object.assign({ session_id: getSessionId(), visitor_id: getVisitorId(), created_at: new Date().toISOString() }, payload);
      var result = await client.from('influencer_post_events').insert(row);
      return !(result && result.error);
    }catch(_){ return false; }
  }
  function bindRenderedWidgetClicks(root, post){
    $all('[data-widget-click="1"]', root).forEach(function(link){
      if (link.__ifBound) return;
      link.__ifBound = true;
      link.addEventListener('click', function(){
        var partner = String(link.getAttribute('data-partner') || '').trim() || 'unknown';
        var trackingCode = String(link.getAttribute('data-tracking-code') || '').trim();
        var widgetShortId = String(link.getAttribute('data-widget-short-id') || '').trim();
        var creatorSlug = String(link.getAttribute('data-creator-slug') || post.creator_affiliate_slug || post.creator_slug || '').trim();
        var postId = String(link.getAttribute('data-post-id') || post.post_id || '').trim();
        var postSlug = String(link.getAttribute('data-post-slug') || post.post_slug || '').trim();
        trackEvent({ post_id: post.post_id || null, profile_id: post.profile_id || null, affiliate_slug: creatorSlug || null, event_type: 'widget_click', partner: partner, widget_id: widgetShortId || null, metadata: { source: 'influencer_post', creator_slug: creatorSlug || null, post_slug: postSlug || null, tracking_code: trackingCode || null } }, 'widget_' + (trackingCode || (postId + '_' + widgetShortId)), 500);
        if (window.traviraeAffiliate && typeof window.traviraeAffiliate.trackBookingClick === 'function'){
          try{
            window.traviraeAffiliate.trackBookingClick({
              partner: partner,
              affiliateSlugOverride: creatorSlug,
              source: 'influencer_post',
              postId: postId || null,
              postSlug: postSlug || null,
              widgetId: widgetShortId || null,
              widgetTrackingCode: trackingCode || null,
              metadata: {
                source: 'influencer_post',
                creator_slug: creatorSlug || null,
                post_id: postId || null,
                post_slug: postSlug || null,
                widget_id: widgetShortId || null,
                widget_tracking_code: trackingCode || null,
                raw_partner_sub_id: partner === 'aviasales' ? trackingCode : null,
                raw_partner_campaign: partner === 'stay22' ? trackingCode : null
              }
            });
          }catch(_){ }
        }
      });
    });
  }

  function renderCover(path, bucket, alt){
    var url = path ? publicImageUrl(bucket, path) : '';
    if (!url) return '<div class="if-card-cover if-card-cover--placeholder"><span>Travirae</span></div>';
    return '<img class="if-card-cover" loading="lazy" src="' + escapeAttr(url) + '" alt="' + escapeAttr(alt || '') + '"/>';
  }

  function initPublicPage(){
    if (!document.body.classList.contains('page--influencers-vlogs')) return;
    var client = getClient();
    var elMessage = $('#if-public-message');
    var elProfile = $('#if-creator-profile');
    var elSection = $('#if-post-list-section');
    var elList = $('#if-post-list');
    var elPagination = $('#if-pagination');
    var modal = $('#if-post-modal');
    var modalBody = $('#if-modal-body');
    var modalClose = $('#if-modal-close');
    var state = {
      pageSize: 5,
      currentPage: Math.max(1, parseInt(readQueryParam('page') || '1', 10) || 1),
      creatorSlug: readQueryParam('creator') || '',
      postSlug: readQueryParam('post') || '',
      modalPushed: false,
      observer: null
    };

    function setMessage(text, type){
      if (!elMessage) return;
      if (!text){ elMessage.hidden = true; elMessage.className = 'admin-message'; elMessage.textContent = ''; return; }
      elMessage.hidden = false;
      elMessage.className = 'admin-message' + (type ? ' is-' + type : '');
      elMessage.textContent = text;
    }

    async function loadProfile(){
      if (!state.creatorSlug){
        if (elProfile) elProfile.hidden = true;
        if (elSection) elSection.hidden = false;
        return null;
      }
      if (!client || !client.rpc){ setMessage(t('noCreator'), 'error'); return null; }
      var resp = await client.rpc('get_influencer_public_profile', { p_creator_slug: state.creatorSlug });
      var rows = resp && resp.data ? resp.data : [];
      var profile = rows && rows[0] ? rows[0] : null;
      if (!profile){
        if (elProfile) elProfile.hidden = true;
        setMessage(t('noCreator'), 'error');
        return null;
      }
      setMessage('', null);
      if (elProfile){
        elProfile.hidden = false;
        elProfile.innerHTML = '' +
          '<section class="if-profile-card">' +
            '<div class="if-profile-card__media">' + (profile.avatar_path ? '<img class="if-profile-avatar" loading="lazy" src="' + escapeAttr(publicImageUrl('influencer-avatars', profile.avatar_path)) + '" alt="' + escapeAttr(profile.display_name || profile.public_slug || 'Creator') + '"/>' : '<div class="if-profile-avatar if-profile-avatar--placeholder">' + escapeHtml((profile.display_name || profile.public_slug || 'C').slice(0,1).toUpperCase()) + '</div>') + '</div>' +
            '<div class="if-profile-card__body">' +
              '<div class="if-profile-card__top"><span class="chip">' + escapeHtml(t('publicProfile')) + '</span><a class="muted small" href="' + escapeAttr(buildPagePath('influencers-vlogs.html')) + '">' + escapeHtml(t('backToList')) + '</a></div>' +
              '<h2>' + escapeHtml(profile.display_name || profile.public_slug || '') + '</h2>' +
              (profile.bio ? '<p class="muted">' + escapeHtml(profile.bio).replace(/\n/g, '<br/>') + '</p>' : '') +
              renderSocialLinks(typeof profile.social_links === 'string' ? safeJsonParse(profile.social_links, {}) : (profile.social_links || {})) +
            '</div>' +
          '</section>';
      }
      trackEvent({ profile_id: profile.profile_id, affiliate_slug: profile.affiliate_slug, event_type: 'profile_view', metadata: { creator_slug: profile.public_slug, source: 'influencer_profile' } }, 'profile_view_' + profile.profile_id, 1000 * 60 * 30);
      return profile;
    }

    function setupImpressionObserver(){
      if (!elList) return;
      if (state.observer){ try{ state.observer.disconnect(); }catch(_){ } }
      if (!('IntersectionObserver' in window)){
        $all('[data-post-card-id]', elList).forEach(function(card){
          trackEvent({ post_id: card.getAttribute('data-post-card-id'), affiliate_slug: card.getAttribute('data-creator-slug') || null, event_type: 'card_impression', metadata: { post_slug: card.getAttribute('data-post-slug') || null } }, 'impression_' + card.getAttribute('data-post-card-id'), 1000 * 60 * 30);
        });
        return;
      }
      state.observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          var card = entry.target;
          state.observer.unobserve(card);
          trackEvent({ post_id: card.getAttribute('data-post-card-id'), affiliate_slug: card.getAttribute('data-creator-slug') || null, event_type: 'card_impression', metadata: { post_slug: card.getAttribute('data-post-slug') || null } }, 'impression_' + card.getAttribute('data-post-card-id'), 1000 * 60 * 30);
        });
      }, { threshold: [0.5] });
      $all('[data-post-card-id]', elList).forEach(function(card){ state.observer.observe(card); });
    }

    function renderPagination(totalCount){
      if (!elPagination) return;
      var totalPages = Math.max(1, Math.ceil((Number(totalCount || 0) || 0) / state.pageSize));
      if (totalPages <= 1){ elPagination.innerHTML = ''; return; }
      var html = '' +
        '<button class="btn secondary" type="button" data-page="' + (state.currentPage - 1) + '"' + (state.currentPage <= 1 ? ' disabled' : '') + '>' + escapeHtml(t('previous')) + '</button>' +
        '<span class="muted small">' + escapeHtml(t('page')) + ' ' + escapeHtml(String(state.currentPage)) + ' / ' + escapeHtml(String(totalPages)) + '</span>' +
        '<button class="btn secondary" type="button" data-page="' + (state.currentPage + 1) + '"' + (state.currentPage >= totalPages ? ' disabled' : '') + '>' + escapeHtml(t('next')) + '</button>';
      elPagination.innerHTML = html;
      $all('button[data-page]', elPagination).forEach(function(btn){
        btn.addEventListener('click', function(){
          var nextPage = Math.max(1, parseInt(btn.getAttribute('data-page') || '1', 10) || 1);
          state.currentPage = nextPage;
          updateQueryParam('page', String(nextPage), 'replace');
          loadPosts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }

    async function loadPosts(){
      if (!elList) return;
      if (!client || !client.rpc){ setMessage('Supabase RPC non disponibile.', 'error'); return; }
      elList.innerHTML = '<div class="if-empty-state">' + escapeHtml(t('loading')) + '</div>';
      var offset = (state.currentPage - 1) * state.pageSize;
      var resp = await client.rpc('get_influencer_public_posts', { p_limit: state.pageSize, p_offset: offset, p_creator_slug: state.creatorSlug || null });
      if (resp && resp.error){ console.error(resp.error); setMessage(resp.error.message || 'Errore caricamento post.', 'error'); elList.innerHTML = ''; return; }
      var rows = resp && resp.data ? resp.data : [];
      if (!rows.length){ elList.innerHTML = '<div class="if-empty-state">' + escapeHtml(t('noPosts')) + '</div>'; renderPagination(0); return; }
      elList.innerHTML = rows.map(function(post){
        var creatorHref = buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(post.creator_slug || '');
        return '' +
          '<article class="if-post-card" data-post-card-id="' + escapeAttr(post.post_id) + '" data-post-slug="' + escapeAttr(post.post_slug) + '" data-creator-slug="' + escapeAttr(post.creator_slug || '') + '">' +
            '<div class="if-post-card__cover-wrap">' + renderCover(post.cover_path, 'influencer-post-media', post.title || '') + '</div>' +
            '<div class="if-post-card__body">' +
              '<div class="if-post-card__meta"><span class="muted small">' + escapeHtml(formatDate(post.first_published_at || post.updated_at)) + '</span></div>' +
              '<h3>' + escapeHtml(post.title || '') + '</h3>' +
              '<p class="muted">' + escapeHtml(truncate(post.excerpt || '', 180)) + '</p>' +
              '<div class="if-post-card__foot">' +
                '<a class="if-link-creator" href="' + escapeAttr(creatorHref) + '" data-creator-link="' + escapeAttr(post.creator_slug || '') + '">' + escapeHtml(post.creator_name || (t('by') + ' ' + post.creator_slug)) + '</a>' +
                '<button class="btn" type="button" data-open-post="' + escapeAttr(post.post_slug || '') + '">' + escapeHtml(t('discoverMore')) + '</button>' +
              '</div>' +
            '</div>' +
          '</article>';
      }).join('');
      renderPagination(rows[0].total_count || rows.length);
      $all('[data-open-post]', elList).forEach(function(btn){
        btn.addEventListener('click', function(){ openPost(btn.getAttribute('data-open-post') || '', true); });
      });
      $all('[data-creator-link]', elList).forEach(function(link){
        link.addEventListener('click', function(e){
          e.preventDefault();
          state.creatorSlug = link.getAttribute('data-creator-link') || '';
          state.currentPage = 1;
          updateQueryParam('creator', state.creatorSlug, 'replace');
          updateQueryParam('page', '1', 'replace');
          updateQueryParam('post', null, 'replace');
          closeModal(false);
          initPage();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
      setupImpressionObserver();
    }

    function renderModalPost(post){
      if (!modalBody) return;
      var contentHtml = post.content_html || renderContentHtml(typeof post.content_json === 'string' ? safeJsonParse(post.content_json, []) : (post.content_json || []), { creatorSlug: post.creator_affiliate_slug || post.creator_slug || '', postShortId: '', postId: post.post_id, postSlug: post.post_slug, post: post });
      var shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('post', post.post_slug);
      if (post.creator_slug) shareUrl.searchParams.set('creator', post.creator_slug);
      modalBody.innerHTML = '' +
        '<article class="if-post-modal-article">' +
          '<div class="if-post-modal-head">' +
            '<div class="if-post-modal-head__meta"><span class="chip">Travirae Creator</span><span class="muted small">' + escapeHtml(t('shareablePopup')) + '</span></div>' +
            '<h2 id="if-post-modal-title">' + escapeHtml(post.title || '') + '</h2>' +
            '<div class="if-post-modal-submeta">' +
              '<button class="btn secondary small" type="button" id="if-copy-post-link">' + escapeHtml(t('copyLink')) + '</button>' +
              '<a class="if-link-creator" href="' + escapeAttr(buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(post.creator_slug || '')) + '" data-creator-link-modal="' + escapeAttr(post.creator_slug || '') + '">' + escapeHtml(post.creator_name || '') + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="if-post-modal-cover">' + renderCover(post.cover_path, 'influencer-post-media', post.title || '') + '</div>' +
          '<div class="if-post-modal-meta muted small">' + escapeHtml(formatDate(post.first_published_at || post.updated_at)) + '</div>' +
          '<div class="if-post-modal-content" id="if-post-modal-content">' + contentHtml + '</div>' +
        '</article>';
      var copyBtn = $('#if-copy-post-link', modalBody);
      if (copyBtn){
        copyBtn.addEventListener('click', async function(){
          try{ await navigator.clipboard.writeText(shareUrl.toString()); notify(t('linkCopied'), 'success'); }catch(_){ notify(t('linkCopied'), 'success'); }
        });
      }
      var creatorModal = $('[data-creator-link-modal]', modalBody);
      if (creatorModal){
        creatorModal.addEventListener('click', function(e){
          e.preventDefault();
          state.creatorSlug = creatorModal.getAttribute('data-creator-link-modal') || '';
          updateQueryParam('creator', state.creatorSlug, 'replace');
          closeModal(false);
          initPage();
        });
      }
      bindRenderedWidgetClicks(modalBody, post);
      trackEvent({ post_id: post.post_id, affiliate_slug: post.creator_affiliate_slug || post.creator_slug || null, event_type: 'post_open', metadata: { post_slug: post.post_slug, creator_slug: post.creator_slug || null, source: 'influencer_post' } }, 'post_open_' + post.post_id, 1000 * 60 * 30);
    }

    async function openPost(slug, pushState){
      if (!slug || !client || !client.rpc || !modal) return;
      var resp = await client.rpc('get_influencer_public_post', { p_post_slug: slug });
      var rows = resp && resp.data ? resp.data : [];
      var post = rows && rows[0] ? rows[0] : null;
      if (!post){ notify(t('noPosts'), 'error'); return; }
      if (pushState){
        state.modalPushed = true;
        updateQueryParam('post', slug, 'push');
      } else {
        state.modalPushed = false;
      }
      state.postSlug = slug;
      renderModalPost(post);
      modal.hidden = false;
      document.body.classList.add('if-modal-open');
    }

    function closeModal(tryHistoryBack){
      if (!modal) return;
      if (!modal.hidden && tryHistoryBack !== false && state.modalPushed && readQueryParam('post')){
        state.modalPushed = false;
        window.history.back();
        return;
      }
      modal.hidden = true;
      document.body.classList.remove('if-modal-open');
      if (readQueryParam('post')) updateQueryParam('post', null, 'replace');
      state.postSlug = '';
    }

    async function initPage(){
      await loadProfile();
      await loadPosts();
      var postFromUrl = readQueryParam('post');
      if (postFromUrl && (!modal || modal.hidden)) await openPost(postFromUrl, false);
    }

    if (modalClose) modalClose.addEventListener('click', function(){ closeModal(true); });
    if (modal) modal.addEventListener('click', function(e){ if (e.target && e.target.getAttribute('data-close-modal') === '1') closeModal(true); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && modal && !modal.hidden) closeModal(true); });
    window.addEventListener('popstate', function(){
      var slug = readQueryParam('post');
      if (!slug && modal && !modal.hidden){ closeModal(false); return; }
      if (slug && (!modal || modal.hidden)) openPost(slug, false);
      var creator = readQueryParam('creator') || '';
      if (creator !== state.creatorSlug){ state.creatorSlug = creator; state.currentPage = Math.max(1, parseInt(readQueryParam('page') || '1', 10) || 1); initPage(); }
    });

    initPage();
  }

  function defaultBlock(type){
    type = type || 'paragraph';
    if (type === 'heading') return { id: randomId('blk_'), type: 'heading', level: 'h2', text: '' };
    if (type === 'image') return { id: randomId('blk_'), type: 'image', path: '', url: '', caption: '', size: 'medium' };
    if (type === 'list') return { id: randomId('blk_'), type: 'list', items: [''] };
    if (type === 'quote') return { id: randomId('blk_'), type: 'quote', text: '' };
    if (type === 'tip') return { id: randomId('blk_'), type: 'tip', text: '' };
    if (type === 'separator') return { id: randomId('blk_'), type: 'separator' };
    if (type === 'stay22') return { id: randomId('blk_'), type: 'stay22', widgetShortId: shortId('w'), title: 'Hotel Map', description: '', destination: '', checkin: '', checkout: '', ctaLabel: t('widgetStay22Action') };
    if (type === 'aviasales') return { id: randomId('blk_'), type: 'aviasales', widgetShortId: shortId('w'), title: 'Flights Widget', description: '', origin: '', destination: '', checkin: '', returnDate: '', ctaLabel: t('widgetAviasalesAction') };
    return { id: randomId('blk_'), type: 'paragraph', text: '' };
  }

  window.TraviraeInfluencers = {
    __ready: true,
    getLang: getLang,
    t: t,
    $, $all,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    safeJsonParse: safeJsonParse,
    slugify: slugify,
    randomId: randomId,
    shortId: shortId,
    defaultBlock: defaultBlock,
    SOCIALS: SOCIALS,
    publicImageUrl: publicImageUrl,
    uploadImage: uploadImage,
    deleteStorageObject: deleteStorageObject,
    normalizeSocialUrl: normalizeSocialUrl,
    socialListFromObject: socialListFromObject,
    renderSocialLinks: renderSocialLinks,
    buildWidgetTrackingCode: buildWidgetTrackingCode,
    normalizeContentBlocks: normalizeContentBlocks,
    renderContentHtml: renderContentHtml,
    trackEvent: trackEvent,
    bindRenderedWidgetClicks: bindRenderedWidgetClicks,
    formatMoney: formatMoney,
    formatDate: formatDate,
    buildPagePath: buildPagePath,
    notify: notify,
    buildStay22Url: buildStay22Url,
    buildAviasalesUrl: buildAviasalesUrl,
    initPublicPage: initPublicPage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ if (document.body.classList.contains('page--influencers-vlogs')) initPublicPage(); });
  } else if (document.body && document.body.classList.contains('page--influencers-vlogs')) {
    initPublicPage();
  }
})();
