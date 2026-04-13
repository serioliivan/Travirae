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
  var LANG_TO_TP_AUTOCOMPLETE = { it: 'it', en: 'en', de: 'de', es: 'es', fr: 'fr', nl: 'nl', ru: 'ru', ar: 'ar', zh: 'zh-Hans' };
  var LANG_TO_AVIASALES_SEARCH = { it: 'it', en: 'en', de: 'de', es: 'es', fr: 'fr', nl: 'en', ru: 'ru', ar: 'en', zh: 'en' };
  var LANG_TO_AVIASALES_MARKET = { it: 'it', en: 'us', de: 'de', es: 'es', fr: 'fr', nl: 'nl', ru: 'ru', ar: 'ae', zh: 'cn' };
  var LANG_TO_AVIASALES_WIDGET = { it: 'it', en: 'en', de: 'de', es: 'es', fr: 'fr', nl: 'nl', ru: 'ru', ar: 'en', zh: 'en' };
  var LANG_TO_WIDGET_CURRENCY = { it: 'eur', en: 'usd', de: 'eur', es: 'eur', fr: 'eur', nl: 'eur', ru: 'rub', ar: 'aed', zh: 'cny' };
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
    shareablePopup: 'Popup condivisibile via URL',
    searchPosts: 'Cerca post o creator',
    searchPlaceholder: 'Cerca qui…',
    noSearchResults: 'Nessun risultato per la ricerca effettuata.'
  };
  var STRINGS = {
    it: DEFAULTS,
    en: Object.assign({}, DEFAULTS, {
      loading: 'Loading…', noPosts: 'No published posts yet.', noCreator: 'Creator not found or not published.', discoverMore: 'Discover more', copyLink: 'Copy link', linkCopied: 'Link copied.', close: 'Close', previous: 'Previous', next: 'Next', page: 'Page', by: 'by', creatorPosts: 'Published posts', publicProfile: 'Public profile', loadingCreator: 'Loading creator profile…', toastReview: 'Your post is under review. The operation may take up to 48 working hours.', saveDraft: 'Save draft', submitReview: 'Send to review', profileSaved: 'Profile saved.', postSaved: 'Draft saved.', postDeleted: 'Post logically deleted.', invalidSocial: 'One or more social links are invalid for the required domain.', invalidImage: 'Invalid image file. Use JPG, PNG or WEBP up to 8 MB.', loginRequired: 'You need to sign in in the affiliate area to access this section.', goToLogin: 'Go to login', cardImpressions: 'Card impressions', postOpens: 'Post popup opens', widgetClicks: 'Outbound widget clicks', bookingPending: 'Pending bookings', bookingConfirmed: 'Confirmed bookings', estimatedRevenue: 'Estimated revenue', confirmedRevenue: 'Confirmed revenue', availableBalance: 'Available balance', profileViews: 'Profile views', blockParagraph: 'Paragraph', blockImage: 'Image', blockList: 'Bulleted list', blockTip: 'Tip / Callout', blockSeparator: 'Separator', newPost: 'New post', editPost: 'Edit post', deletePost: 'Delete post', createFirstPost: 'Create your first post', noPostsYet: 'You have not created any posts yet.', status: 'Status', live: 'Live', pending: 'Pending', reviewNotes: 'Review notes', approve: 'Approve', reject: 'Reject', requestChanges: 'Request changes', archive: 'Archive', logicalDelete: 'Logical delete', creators: 'Creators', emptyState: 'Nothing to show.', queueProfiles: 'Pending profiles', queuePosts: 'Pending posts', queueChanges: 'Pending changes', liveProfile: 'Live profile', pendingProfile: 'Pending draft / review', livePost: 'Live post', pendingPost: 'Pending post', socialWebsite: 'Website / Blog', creatorLink: 'Open creator profile', widgetStay22Action: 'Open Hotel Map', widgetAviasalesAction: 'Open Flights Widget', backToList: 'Back to list', shareablePopup: 'Shareable popup via URL', searchPosts: 'Search posts or creators', searchPlaceholder: 'Search here…', noSearchResults: 'No results for your search.'
    }),
    de: Object.assign({}, DEFAULTS, { loading: 'Laden…', noPosts: 'Noch keine veröffentlichten Beiträge.', noCreator: 'Creator nicht gefunden oder nicht veröffentlicht.', discoverMore: 'Mehr erfahren', copyLink: 'Link kopieren', linkCopied: 'Link kopiert.', close: 'Schließen', previous: 'Zurück', next: 'Weiter', page: 'Seite', by: 'von', creatorPosts: 'Veröffentlichte Beiträge', publicProfile: 'Öffentliches Profil', loadingCreator: 'Creator-Profil wird geladen…', toastReview: 'Dein Beitrag wird geprüft. Der Vorgang kann bis zu 48 Arbeitsstunden dauern.', saveDraft: 'Entwurf speichern', submitReview: 'Zur Prüfung senden', profileSaved: 'Profil gespeichert.', postSaved: 'Entwurf gespeichert.', postDeleted: 'Beitrag logisch gelöscht.', invalidSocial: 'Mindestens ein Social-Link ist für die erforderliche Domain ungültig.', invalidImage: 'Ungültige Bilddatei. Bitte JPG, PNG oder WEBP bis 8 MB verwenden.', loginRequired: 'Du musst dich im Affiliate-Bereich anmelden, um diese Seite zu öffnen.', goToLogin: 'Zum Login', cardImpressions: 'Card-Impressionen', postOpens: 'Post-Popup-Öffnungen', widgetClicks: 'Outbound-Widget-Klicks', bookingPending: 'Offene Buchungen', bookingConfirmed: 'Bestätigte Buchungen', estimatedRevenue: 'Geschätzter Umsatz', confirmedRevenue: 'Bestätigter Umsatz', availableBalance: 'Verfügbares Guthaben', profileViews: 'Profilaufrufe' }),
    es: Object.assign({}, DEFAULTS, { loading: 'Cargando…', noPosts: 'Todavía no hay publicaciones publicadas.', noCreator: 'Creador no encontrado o no publicado.', discoverMore: 'Descubrir más', copyLink: 'Copiar enlace', linkCopied: 'Enlace copiado.', close: 'Cerrar', previous: 'Anterior', next: 'Siguiente', page: 'Página', by: 'por', creatorPosts: 'Posts publicados', publicProfile: 'Perfil público', loadingCreator: 'Cargando perfil del creador…', toastReview: 'Tu publicación está en revisión. La operación puede tardar hasta 48 horas laborables.', saveDraft: 'Guardar borrador', submitReview: 'Enviar a revisión', profileSaved: 'Perfil guardado.', postSaved: 'Borrador guardado.', postDeleted: 'Post eliminado lógicamente.' }),
    fr: Object.assign({}, DEFAULTS, { loading: 'Chargement…', noPosts: 'Aucun post publié pour le moment.', noCreator: 'Créateur introuvable ou non publié.', discoverMore: 'En savoir plus', copyLink: 'Copier le lien', linkCopied: 'Lien copié.', close: 'Fermer', previous: 'Précédent', next: 'Suivant', page: 'Page', by: 'par', creatorPosts: 'Posts publiés', publicProfile: 'Profil public', loadingCreator: 'Chargement du profil créateur…', toastReview: 'Votre post est en cours de révision. L’opération peut prendre jusqu’à 48 heures ouvrées.', saveDraft: 'Enregistrer le brouillon', submitReview: 'Envoyer en revue', profileSaved: 'Profil enregistré.', postSaved: 'Brouillon enregistré.', postDeleted: 'Post supprimé logiquement.' }),
    nl: Object.assign({}, DEFAULTS, { loading: 'Laden…', noPosts: 'Nog geen gepubliceerde posts.', noCreator: 'Creator niet gevonden of niet gepubliceerd.', discoverMore: 'Meer ontdekken', copyLink: 'Link kopiëren', linkCopied: 'Link gekopieerd.', close: 'Sluiten', previous: 'Vorige', next: 'Volgende', page: 'Pagina', by: 'door', creatorPosts: 'Gepubliceerde posts', publicProfile: 'Openbaar profiel', loadingCreator: 'Creator-profiel laden…', toastReview: 'Je post wordt beoordeeld. Dit kan tot 48 werkuren duren.', saveDraft: 'Concept opslaan', submitReview: 'Ter review versturen', profileSaved: 'Profiel opgeslagen.', postSaved: 'Concept opgeslagen.', postDeleted: 'Post logisch verwijderd.' }),
    ru: Object.assign({}, DEFAULTS, { loading: 'Загрузка…', noPosts: 'Опубликованных постов пока нет.', noCreator: 'Автор не найден или не опубликован.', discoverMore: 'Подробнее', copyLink: 'Скопировать ссылку', linkCopied: 'Ссылка скопирована.', close: 'Закрыть', previous: 'Назад', next: 'Далее', page: 'Страница', by: 'автор', creatorPosts: 'Опубликованные посты', publicProfile: 'Публичный профиль', loadingCreator: 'Загружаю профиль автора…', toastReview: 'Ваш пост находится на проверке. Операция может занять до 48 рабочих часов.', saveDraft: 'Сохранить черновик', submitReview: 'Отправить на проверку', profileSaved: 'Профиль сохранён.', postSaved: 'Черновик сохранён.', postDeleted: 'Пост логически удалён.' }),
    ar: Object.assign({}, DEFAULTS, { loading: 'جارٍ التحميل…', noPosts: 'لا توجد مقالات منشورة حالياً.', noCreator: 'صانع المحتوى غير موجود أو غير منشور.', discoverMore: 'اكتشف المزيد', copyLink: 'نسخ الرابط', linkCopied: 'تم نسخ الرابط.', close: 'إغلاق', previous: 'السابق', next: 'التالي', page: 'الصفحة', by: 'بواسطة', creatorPosts: 'المقالات المنشورة', publicProfile: 'الملف العام', loadingCreator: 'جارٍ تحميل ملف صانع المحتوى…', toastReview: 'منشورك قيد المراجعة، وقد تستغرق العملية حتى 48 ساعة عمل.', saveDraft: 'حفظ كمسودة', submitReview: 'إرسال للمراجعة', profileSaved: 'تم حفظ الملف.', postSaved: 'تم حفظ المسودة.', postDeleted: 'تم حذف المقال منطقياً.' }),
    zh: Object.assign({}, DEFAULTS, { loading: '加载中…', noPosts: '目前还没有已发布文章。', noCreator: '未找到创作者或尚未发布。', discoverMore: '了解更多', copyLink: '复制链接', linkCopied: '链接已复制。', close: '关闭', previous: '上一页', next: '下一页', page: '页', by: '作者', creatorPosts: '已发布文章', publicProfile: '公开资料', loadingCreator: '正在加载创作者资料…', toastReview: '你的文章正在审核中，处理时间最多可能需要 48 个工作小时。', saveDraft: '保存草稿', submitReview: '提交审核', profileSaved: '资料已保存。', postSaved: '草稿已保存。', postDeleted: '文章已逻辑删除。' })
  };


  var EXTRA_STRINGS = {
    it: { blockHeading: 'Titolo', blockQuote: 'Citazione', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    en: { blockHeading: 'Heading', blockQuote: 'Quote', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    de: { blockHeading: 'Überschrift', blockQuote: 'Zitat', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    es: { blockHeading: 'Encabezado', blockQuote: 'Cita', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    fr: { blockHeading: 'Titre', blockQuote: 'Citation', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    nl: { blockHeading: 'Kop', blockQuote: 'Citaat', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    ru: { blockHeading: 'Заголовок', blockQuote: 'Цитата', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    ar: { blockHeading: 'عنوان', blockQuote: 'اقتباس', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' },
    zh: { blockHeading: '标题', blockQuote: '引用', blockStay22: 'Hotel Map', blockAviasales: 'Flights Widget' }
  };
  Object.keys(EXTRA_STRINGS).forEach(function(lang){
    STRINGS[lang] = Object.assign({}, STRINGS[lang] || {}, EXTRA_STRINGS[lang]);
  });

  var SOCIALS = {
    instagram: { labelKey: 'socialInstagram', domains: ['instagram.com'], image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.4" cy="6.6" r="1"></circle></svg>' },
    tiktok: { labelKey: 'socialTiktok', domains: ['tiktok.com'], image: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Tiktok_icon.svg', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v10.1a3.7 3.7 0 1 1-3.7-3.7c.2 0 .4 0 .6.1V7.1a6.6 6.6 0 1 0 6.6 6.6V9c1.1 1 2.5 1.6 3.9 1.6V7.9a4.9 4.9 0 0 1-3.9-2 5.4 5.4 0 0 1-1-2.9H14z"></path></svg>' },
    youtube: { labelKey: 'socialYoutube', domains: ['youtube.com', 'youtu.be'], image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.9 4.4 12 4.4 12 4.4s-6.9 0-8.5.5A3 3 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.6.4-5 .4-5Z"></path><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"></path></svg>' },
    facebook: { labelKey: 'socialFacebook', domains: ['facebook.com', 'fb.com'], image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-6 2.7-6 6v2H5v4h3v4h4v-4h3l1-4h-4v-2c0-1.1.9-2 2-2Z"></path></svg>' },
    pinterest: { labelKey: 'socialPinterest', domains: ['pinterest.com', 'pin.it'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6 2 11.1c0 3 1.7 5.7 4.4 6.8-.1-.6-.1-1.6 0-2.2.1-.6.9-3.8.9-3.8s-.2-.6-.2-1.4c0-1.3.7-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2- .8 3.1-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.3 0-2.2-1.6-3.8-3.9-3.8-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.2.1.1.1.3.1.4-.1.4-.2.9-.3 1-.1.2-.2.2-.4.1-1.5-.6-2.4-2.5-2.4-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.8-2.4 6.9-5.7 6.9-1.1 0-2.2-.6-2.6-1.3l-.7 2.4c-.2.8-.7 1.8-1 2.4.7.2 1.4.3 2.1.3 5.5 0 10-4 10-9.1C22 6 17.5 2 12 2Z"></path></svg>' },
    x: { labelKey: 'socialX', domains: ['x.com', 'twitter.com'], icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4.3l4.2 5.8L17.3 4H20l-6.4 7.2L20 20h-4.3l-4.5-6.2L6.1 20H4l6.3-7.2L4 4Z"></path></svg>' }
  };

  var VISIBLE_SOCIAL_PLATFORMS = Object.keys(SOCIALS).filter(function(platform){ return platform !== 'website' && platform !== 'telegram'; });

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
  var WIDGET_AUTOCOMPLETE = { loaded: false, loading: null, stay22: [], airports: [], airportLookup: Object.create(null), travelpayoutsHotels: [], remoteCache: Object.create(null), hotellookFunctionState: 'unknown' };
  var POPULAR_STAY22_DESTINATIONS = [
    'Rome / Roma, Italy','Naples / Napoli, Italy','Milan / Milano, Italy','Florence / Firenze, Italy','Venice / Venezia, Italy','Barcelona, Spain','Paris, France','London, United Kingdom','New York City, USA','Corfu / Kerkyra, Greece','Santorini / Thira, Greece','Mykonos, Greece','Sicily / Sicilia, Italy','Sardinia / Sardegna, Italy','Sorrento, Italy','Amalfi Coast / Costiera Amalfitana, Italy'
  ];
  function normalizeLookupKey(value){
    return slugify(String(value || '')).replace(/-/g, ' ').trim();
  }
  function normalizeAirportLabel(value){
    return String(value || '').replace(/\s+/g, ' ').trim();
  }
  function getWidgetLocale(locale){
    var key = String(locale || '').trim().toLowerCase();
    if (!key) return getLang();
    return Object.prototype.hasOwnProperty.call(SUFFIX_BY_LANG, key) ? key : getLang();
  }
  function getTravelpayoutsAutocompleteLocale(locale){ return LANG_TO_TP_AUTOCOMPLETE[getWidgetLocale(locale)] || 'en'; }
  function getAviasalesSearchLocale(locale){ return LANG_TO_AVIASALES_SEARCH[getWidgetLocale(locale)] || 'en'; }
  function getAviasalesMarket(locale){ return LANG_TO_AVIASALES_MARKET[getWidgetLocale(locale)] || 'us'; }
  function getAviasalesWidgetLocale(locale){ return LANG_TO_AVIASALES_WIDGET[getWidgetLocale(locale)] || 'en'; }
  function getWidgetCurrency(locale){ return LANG_TO_WIDGET_CURRENCY[getWidgetLocale(locale)] || 'usd'; }
  function scoreAutocompleteMatch(term, label){
    var query = normalizeLookupKey(term);
    var target = normalizeLookupKey(label);
    if (!query || !target) return -1;
    if (target === query) return 1000;
    if (target.indexOf(query + ' ') === 0) return 930;
    if (target.indexOf(query) === 0) return 880;
    if ((' ' + target).indexOf(' ' + query) !== -1) return 720;
    if (target.indexOf(query) !== -1) return 560;
    return -1;
  }
  function uniqueSuggestionItems(items, limit){
    var seen = Object.create(null);
    var out = [];
    (items || []).forEach(function(item){
      var label = normalizeAirportLabel(item && item.label || item && item.value || '');
      var key = normalizeLookupKey((item && item.code ? item.code + ' ' : '') + label);
      if (!label || seen[key]) return;
      seen[key] = true;
      out.push(item);
    });
    return typeof limit === 'number' ? out.slice(0, limit) : out;
  }
  function readLocalizedTravelpayoutsName(value, locale){
    if (!value) return '';
    if (typeof value === 'string') return normalizeAirportLabel(value);
    if (Array.isArray(value)) {
      var preferred = value.find(function(entry){ return String(entry && entry.isVariation || '0') === '0' && entry && entry.name; }) || value.find(function(entry){ return entry && entry.name; }) || value[0];
      return preferred ? readLocalizedTravelpayoutsName(preferred.name || preferred, locale) : '';
    }
    if (typeof value === 'object') {
      var lang = String(locale || 'en').toUpperCase().replace(/-/g, '_');
      var base = lang.split('_')[0] || lang;
      var candidates = [lang, lang.toLowerCase(), base, base.toLowerCase(), 'EN', 'en', 'IT', 'it', 'FR', 'fr', 'DE', 'de', 'ES', 'es', 'RU', 'ru'];
      for (var i = 0; i < candidates.length; i += 1){
        var key = candidates[i];
        if (Object.prototype.hasOwnProperty.call(value, key) && value[key]) return readLocalizedTravelpayoutsName(value[key], locale);
      }
      var firstKey = Object.keys(value)[0];
      if (firstKey) return readLocalizedTravelpayoutsName(value[firstKey], locale);
    }
    return '';
  }
  function collectTravelpayoutsHotelDbArrays(data){
    if (!data) return { locations: [], hotels: [] };
    var locations = [];
    var hotels = [];
    function absorb(payload){
      if (!payload) return;
      if (Array.isArray(payload)) {
        var isLocationArray = payload.some(function(item){ return item && (item.cityName || item.fullName || item.countryName || item.countryCode || item.countryId || item.hotelsCount || item.iata); });
        var isHotelArray = payload.some(function(item){ return item && (item.locationName || item.locationId || item.cityId || item.pricefrom || item.address || item.propertyType); });
        if (isLocationArray && !isHotelArray) locations = locations.concat(payload);
        else if (isHotelArray && !isLocationArray) hotels = hotels.concat(payload);
        else if (isLocationArray || isHotelArray) {
          locations = locations.concat(payload.filter(function(item){ return item && (item.cityName || item.countryName || item.hotelsCount || item.countryId || item.iata); }));
          hotels = hotels.concat(payload.filter(function(item){ return item && (item.locationName || item.cityId || item.pricefrom || item.address || item.propertyType); }));
        }
        return;
      }
      if (Array.isArray(payload.locations)) locations = locations.concat(payload.locations);
      if (Array.isArray(payload.hotels)) hotels = hotels.concat(payload.hotels);
      if (payload.results) absorb(payload.results);
      if (payload.data) absorb(payload.data);
      if (Array.isArray(payload.entries)) absorb(payload.entries);
    }
    absorb(data);
    return { locations: locations, hotels: hotels };
  }
  function normalizeTravelpayoutsLocationRecord(item, locale){
    if (!item) return null;
    if (item.label || item.value) {
      var normalizedLabel = normalizeAirportLabel(item.label || item.value || '');
      if (!normalizedLabel) return null;
      return { type: 'location', label: normalizedLabel, value: normalizeAirportLabel(item.value || normalizedLabel), locationId: String(item.locationId || item.id || ''), countryCode: String(item.countryCode || item.country_code || item.code || '').trim().toUpperCase() };
    }
    var fullName = normalizeAirportLabel(item.fullName || item.full_name || '');
    var localeCode = getTravelpayoutsAutocompleteLocale(locale);
    var cityName = normalizeAirportLabel(item.cityName || item.city_name || readLocalizedTravelpayoutsName(item.name, localeCode));
    var countryName = normalizeAirportLabel(item.countryName || item.country_name || '');
    var label = fullName || cityName;
    if (!label && countryName) label = countryName;
    if (!label) return null;
    if (!fullName && countryName && cityName && normalizeLookupKey(cityName).indexOf(normalizeLookupKey(countryName)) === -1) label = cityName + ', ' + countryName;
    return {
      type: 'location',
      label: normalizeAirportLabel(label),
      value: normalizeAirportLabel(label),
      locationId: String(item.id || item.locationId || ''),
      countryCode: String(item.countryCode || item.country_code || item.code || '').trim().toUpperCase()
    };
  }
  function normalizeTravelpayoutsHotelRecord(item, locale, locationLabels){
    if (!item) return null;
    if (item.label || item.value) {
      var normalizedLabel = normalizeAirportLabel(item.label || item.value || '');
      if (!normalizedLabel) return null;
      return { type: 'hotel', label: normalizedLabel, value: normalizeAirportLabel(item.value || normalizedLabel), hotelId: String(item.hotelId || item.id || ''), locationId: String(item.locationId || item.cityId || '') };
    }
    var localeCode = getTravelpayoutsAutocompleteLocale(locale);
    var hotelName = normalizeAirportLabel(item.fullName || item.label || readLocalizedTravelpayoutsName(item.name, localeCode));
    var locationName = normalizeAirportLabel(item.locationName || item.location_name || (locationLabels && locationLabels[String(item.locationId || item.cityId || '')]) || '');
    if (!locationName && item.address) locationName = normalizeAirportLabel(readLocalizedTravelpayoutsName(item.address, localeCode));
    var label = hotelName;
    if (hotelName && locationName && normalizeLookupKey(hotelName).indexOf(normalizeLookupKey(locationName)) === -1) label = hotelName + ', ' + locationName;
    if (!label) label = locationName;
    if (!label) return null;
    return {
      type: 'hotel',
      label: normalizeAirportLabel(label),
      value: normalizeAirportLabel(label),
      hotelId: String(item.id || item.hotelId || ''),
      locationId: String(item.locationId || item.cityId || '')
    };
  }
  function normalizeTravelpayoutsHotelsDb(data, locale){
    var arrays = collectTravelpayoutsHotelDbArrays(data);
    var locationLabels = Object.create(null);
    var items = [];
    (arrays.locations || []).forEach(function(raw){
      var normalized = normalizeTravelpayoutsLocationRecord(raw, locale);
      if (!normalized) return;
      if (normalized.locationId) locationLabels[normalized.locationId] = normalized.label;
      items.push(normalized);
    });
    (arrays.hotels || []).forEach(function(raw){
      var normalized = normalizeTravelpayoutsHotelRecord(raw, locale, locationLabels);
      if (!normalized) return;
      items.push(normalized);
    });
    return uniqueSuggestionItems(items);
  }
  function loadTravelpayoutsHotelDbSnapshot(){
    return fetch('assets/data/travelpayouts-hotels-db.json', { cache: 'force-cache' })
      .then(function(res){ return res.ok ? res.json() : null; })
      .catch(function(){ return null; });
  }
  function searchStay22DestinationsLocal(term, limit){
    var query = String(term || '').trim();
    if (!query) return [];
    var max = typeof limit === 'number' ? limit : 3;
    var ranked = [];
    var travelpayoutsItems = Array.isArray(WIDGET_AUTOCOMPLETE.travelpayoutsHotels) ? WIDGET_AUTOCOMPLETE.travelpayoutsHotels : [];
    travelpayoutsItems.forEach(function(item, index){
      var label = normalizeAirportLabel(item && item.label || item && item.value || '');
      if (!label) return;
      var score = scoreAutocompleteMatch(query, label);
      if (score < 0) return;
      var typeBoost = item.type === 'location' ? 40 : 16;
      ranked.push({ label: label, value: normalizeAirportLabel(item.value || label), score: score + typeBoost + Math.max(0, 260 - index) });
    });
    POPULAR_STAY22_DESTINATIONS.concat(WIDGET_AUTOCOMPLETE.stay22 || []).forEach(function(label, index){
      var normalized = String(label || '').trim();
      var score = scoreAutocompleteMatch(query, normalized);
      if (score < 0) return;
      ranked.push({ label: normalized, value: normalized, score: score + Math.max(0, 120 - index) });
    });
    return uniqueSuggestionItems(ranked.sort(function(a,b){ return b.score - a.score; }), max);
  }
  function formatAutocompleteDestinationLabel(item){
    if (!item) return '';
    var type = String(item.type || item.kind || '').trim().toLowerCase();
    var name = normalizeAirportLabel(item.city_name || item.cityName || item.name || item.label || item.value || '');
    var country = normalizeAirportLabel(item.country_name || item.countryName || '');
    var code = String(item.country_code || item.countryCode || item.code || item.city_code || item.cityCode || '').trim().toUpperCase();
    var base = name || country || code;
    if (!base) return '';
    if (type === 'country') {
      if (country && normalizeLookupKey(base) !== normalizeLookupKey(country)) base = country;
      else if (!country && name) base = name;
    } else if (country && normalizeLookupKey(base).indexOf(normalizeLookupKey(country)) === -1) {
      base += ', ' + country;
    }
    if (!country && code && code.length === 2 && type === 'country' && base.indexOf('(') === -1) {
      base += ' (' + code + ')';
    }
    return normalizeAirportLabel(base);
  }
  function normalizeTravelpayoutsHotelAutocompletePayload(data, locale, term, limit){
    var results = data && data.results ? data.results : data;
    var arrays = collectTravelpayoutsHotelDbArrays(results);
    var locationLabels = Object.create(null);
    var ranked = [];
    var query = String(term || '').trim();
    (arrays.locations || []).forEach(function(raw, index){
      var normalized = normalizeTravelpayoutsLocationRecord(raw, locale);
      if (!normalized) return;
      if (normalized.locationId) locationLabels[normalized.locationId] = normalized.label;
      var score = Math.max(scoreAutocompleteMatch(query, normalized.label), scoreAutocompleteMatch(query, normalized.value));
      if (score < 0) score = 560;
      ranked.push({ label: normalized.label, value: normalized.value || normalized.label, type: 'location', locationId: normalized.locationId, source: 'travelpayouts_hotels_lookup', score: score + 90 + Math.max(0, 18 - index) });
    });
    (arrays.hotels || []).forEach(function(raw, index){
      var normalized = normalizeTravelpayoutsHotelRecord(raw, locale, locationLabels);
      if (!normalized) return;
      var score = Math.max(scoreAutocompleteMatch(query, normalized.label), scoreAutocompleteMatch(query, normalized.value));
      if (score < 0) score = 620;
      ranked.push({ label: normalized.label, value: normalized.value || normalized.label, type: 'hotel', hotelId: normalized.hotelId, locationId: normalized.locationId, source: 'travelpayouts_hotels_lookup', score: score + 140 + Math.max(0, 18 - index) });
    });
    return uniqueSuggestionItems(ranked.sort(function(a,b){ return b.score - a.score; }), typeof limit === 'number' ? limit : 3);
  }
  function fetchTravelpayoutsHotelAutocompleteSuggestions(term, locale, limit){
    var query = String(term || '').trim();
    if (!query) return Promise.resolve([]);
    var max = typeof limit === 'number' ? limit : 3;
    if (WIDGET_AUTOCOMPLETE.hotellookFunctionState === 'unavailable') return Promise.resolve([]);
    var functionUrl = buildFunctionUrl('travelpayouts-hotel-autocomplete');
    if (!functionUrl) return Promise.resolve([]);
    var cacheKey = 'hotel_lookup|' + getTravelpayoutsAutocompleteLocale(locale) + '|' + query.toLowerCase();
    if (WIDGET_AUTOCOMPLETE.remoteCache[cacheKey]) return WIDGET_AUTOCOMPLETE.remoteCache[cacheKey];
    var url;
    try{
      url = new URL(functionUrl, window.location.origin);
      url.searchParams.set('q', query);
      url.searchParams.set('lang', getTravelpayoutsAutocompleteLocale(locale));
      url.searchParams.set('limit', String(Math.max(1, Math.min(10, max))));
    }catch(_){
      return Promise.resolve([]);
    }
    WIDGET_AUTOCOMPLETE.remoteCache[cacheKey] = fetch(url.toString(), { method: 'GET', mode: 'cors', cache: 'no-store', headers: getPublicFunctionHeaders() })
      .then(function(res){
        if (!res.ok){
          if (res.status === 404 || res.status === 401 || res.status === 403) WIDGET_AUTOCOMPLETE.hotellookFunctionState = 'unavailable';
          return res.text().then(function(message){ throw new Error(message || ('HTTP ' + res.status)); });
        }
        return res.json().catch(function(){ return { items: [] }; });
      })
      .then(function(payload){
        WIDGET_AUTOCOMPLETE.hotellookFunctionState = 'available';
        if (Array.isArray(payload && payload.items)) {
          return uniqueSuggestionItems(payload.items.map(function(item, index){
            var label = normalizeAirportLabel(item && item.label || item && item.value || '');
            if (!label) return null;
            var score = typeof item.score === 'number' ? item.score : Math.max(scoreAutocompleteMatch(query, label), 540);
            var typeBoost = String(item && item.type || '').toLowerCase() === 'hotel' ? 140 : 90;
            return { label: label, value: normalizeAirportLabel(item.value || label), type: item.type || '', hotelId: item.hotelId || '', locationId: item.locationId || '', score: score + typeBoost + Math.max(0, 16 - index) };
          }).filter(Boolean).sort(function(a,b){ return b.score - a.score; }), max);
        }
        return normalizeTravelpayoutsHotelAutocompletePayload(payload, locale, query, max);
      })
      .catch(function(err){
        if (window.console && console.warn) console.warn('Travelpayouts hotel autocomplete unavailable:', err && err.message ? err.message : err);
        return [];
      });
    return WIDGET_AUTOCOMPLETE.remoteCache[cacheKey];
  }
  function fetchDestinationSuggestions(term, locale, limit){
    var query = String(term || '').trim();
    if (!query) return Promise.resolve([]);
    var max = typeof limit === 'number' ? limit : 3;
    var cacheKey = 'places|' + getTravelpayoutsAutocompleteLocale(locale) + '|' + query.toLowerCase();
    if (WIDGET_AUTOCOMPLETE.remoteCache[cacheKey]) return WIDGET_AUTOCOMPLETE.remoteCache[cacheKey];
    var url = new URL('https://autocomplete.travelpayouts.com/places2');
    url.searchParams.set('term', query);
    url.searchParams.set('locale', getTravelpayoutsAutocompleteLocale(locale));
    url.searchParams.append('types[]', 'city');
    url.searchParams.append('types[]', 'country');
    WIDGET_AUTOCOMPLETE.remoteCache[cacheKey] = fetch(url.toString(), { mode: 'cors', cache: 'no-store' })
      .then(function(res){ return res.ok ? res.json() : []; })
      .then(function(data){
        return uniqueSuggestionItems((Array.isArray(data) ? data : []).map(function(item, index){
          var label = formatAutocompleteDestinationLabel(item);
          if (!label) return null;
          var score = Math.max(scoreAutocompleteMatch(query, label), scoreAutocompleteMatch(query, item.name), scoreAutocompleteMatch(query, item.city_name), scoreAutocompleteMatch(query, item.country_name));
          if (score < 0) score = 420;
          return { label: label, value: label, score: score + Number(item.weight || 0) + Math.max(0, 48 - index) };
        }).filter(Boolean).sort(function(a,b){ return b.score - a.score; }), max);
      })
      .catch(function(){ return searchStay22DestinationsLocal(query, max); });
    return WIDGET_AUTOCOMPLETE.remoteCache[cacheKey];
  }
  function searchStay22Destinations(term, locale, limit){
    return ensureWidgetAutocompleteCatalog().then(function(){
      var max = typeof limit === 'number' ? limit : 3;
      return Promise.all([
        fetchTravelpayoutsHotelAutocompleteSuggestions(term, locale, max).catch(function(){ return []; }),
        fetchDestinationSuggestions(term, locale, max).catch(function(){ return []; })
      ]).then(function(results){
        var hotellookItems = Array.isArray(results[0]) ? results[0] : [];
        var destinationItems = Array.isArray(results[1]) ? results[1] : [];
        var localItems = searchStay22DestinationsLocal(term, max);
        var merged = uniqueSuggestionItems([].concat(hotellookItems, destinationItems, localItems), max);
        if (merged.length) return merged.slice(0, max);
        return searchStay22DestinationsLocal(term, max);
      }, function(){
        return searchStay22DestinationsLocal(term, max);
      });
    });
  }
  function formatAutocompleteAirportLabel(item){
    if (!item) return '';
    var city = normalizeAirportLabel(item.city_name || item.cityName || '');
    var airport = normalizeAirportLabel(item.name || item.airport_name || item.airportName || '');
    var country = normalizeAirportLabel(item.country_name || item.countryName || '');
    var code = String(item.city_code || item.cityCode || item.code || '').trim().toUpperCase();
    var base = city || airport || code;
    if (airport && city && normalizeLookupKey(airport) !== normalizeLookupKey(city)) base = city + ' — ' + airport;
    if (country && base.toLowerCase().indexOf(country.toLowerCase()) === -1) base += ', ' + country;
    if (code) base += ' (' + code + ')';
    return normalizeAirportLabel(base);
  }
  function searchAirportSuggestionsLocal(term, limit){
    var query = String(term || '').trim();
    if (!query) return [];
    return uniqueSuggestionItems((WIDGET_AUTOCOMPLETE.airports || []).map(function(item, index){
      var label = formatAutocompleteAirportLabel(item) || normalizeAirportLabel(item.label);
      var score = Math.max(scoreAutocompleteMatch(query, label), scoreAutocompleteMatch(query, item.code), scoreAutocompleteMatch(query, item.label));
      if (score < 0) return null;
      return { label: label, value: label, code: item.code, score: score + Math.max(0, 120 - index) };
    }).filter(Boolean).sort(function(a,b){ return b.score - a.score; }), typeof limit === 'number' ? limit : 3);
  }
  function fetchAviasalesAirportSuggestions(term, locale, limit){
    var query = String(term || '').trim();
    if (!query) return Promise.resolve([]);
    var max = typeof limit === 'number' ? limit : 3;
    var cacheKey = getTravelpayoutsAutocompleteLocale(locale) + '|' + query.toLowerCase();
    if (WIDGET_AUTOCOMPLETE.remoteCache[cacheKey]) return WIDGET_AUTOCOMPLETE.remoteCache[cacheKey];
    var url = new URL('https://autocomplete.travelpayouts.com/places2');
    url.searchParams.set('term', query);
    url.searchParams.set('locale', getTravelpayoutsAutocompleteLocale(locale));
    url.searchParams.append('types[]', 'airport');
    url.searchParams.append('types[]', 'city');
    WIDGET_AUTOCOMPLETE.remoteCache[cacheKey] = fetch(url.toString(), { mode: 'cors', cache: 'no-store' })
      .then(function(res){ return res.ok ? res.json() : []; })
      .then(function(data){
        return uniqueSuggestionItems((Array.isArray(data) ? data : []).map(function(item, index){
          var label = formatAutocompleteAirportLabel(item);
          if (!label) return null;
          var score = Math.max(scoreAutocompleteMatch(query, label), scoreAutocompleteMatch(query, item.code), scoreAutocompleteMatch(query, item.city_name), scoreAutocompleteMatch(query, item.name));
          if (score < 0) score = 400;
          return { label: label, value: label, code: String(item.city_code || item.code || '').trim().toUpperCase(), score: score + Number(item.weight || 0) + Math.max(0, 50 - index) };
        }).filter(Boolean).sort(function(a,b){ return b.score - a.score; }), max);
      })
      .catch(function(){ return searchAirportSuggestionsLocal(query, max); });
    return WIDGET_AUTOCOMPLETE.remoteCache[cacheKey];
  }
  function searchAirportSuggestions(term, locale, limit){
    return ensureWidgetAutocompleteCatalog().then(function(){
      return fetchAviasalesAirportSuggestions(term, locale, limit).then(function(items){
        if (items && items.length) return items.slice(0, typeof limit === 'number' ? limit : 3);
        return searchAirportSuggestionsLocal(term, limit);
      }, function(){
        return searchAirportSuggestionsLocal(term, limit);
      });
    });
  }
  function ensureWidgetAutocompleteCatalog(){
    if (WIDGET_AUTOCOMPLETE.loaded) return Promise.resolve(WIDGET_AUTOCOMPLETE);
    if (WIDGET_AUTOCOMPLETE.loading) return WIDGET_AUTOCOMPLETE.loading;
    WIDGET_AUTOCOMPLETE.loading = Promise.all([
      fetch('assets/data/widget-autocomplete.json', { cache: 'force-cache' })
        .then(function(res){ return res.ok ? res.json() : { stay22Destinations: [], airports: [] }; })
        .catch(function(){ return { stay22Destinations: [], airports: [] }; }),
      loadTravelpayoutsHotelDbSnapshot()
    ])
      .then(function(results){
        var data = results[0] || { stay22Destinations: [], airports: [] };
        var travelpayoutsDb = results[1];
        var seenStay22 = Object.create(null);
        WIDGET_AUTOCOMPLETE.stay22 = (Array.isArray(data && data.stay22Destinations) ? data.stay22Destinations : []).map(function(item){ return String(item || '').trim(); }).filter(function(item){
          var key = normalizeLookupKey(item);
          if (!key || seenStay22[key]) return false;
          seenStay22[key] = true;
          return true;
        });
        WIDGET_AUTOCOMPLETE.airports = (Array.isArray(data && data.airports) ? data.airports : []).map(function(item){
          var code = String(item && item.code || '').trim().toUpperCase();
          var label = normalizeAirportLabel(item && item.label || code);
          return { code: code, label: label };
        }).filter(function(item){ return item.code && item.label; });
        WIDGET_AUTOCOMPLETE.travelpayoutsHotels = normalizeTravelpayoutsHotelsDb(travelpayoutsDb, getLang());
        var lookup = Object.create(null);
        WIDGET_AUTOCOMPLETE.airports.forEach(function(item){
          lookup[item.code] = item;
          lookup[normalizeLookupKey(item.label)] = item;
          var withoutCode = normalizeAirportLabel(item.label.replace(/\s*\([A-Z]{3}\)\s*$/i, ''));
          if (withoutCode) lookup[normalizeLookupKey(withoutCode)] = item;
        });
        WIDGET_AUTOCOMPLETE.airportLookup = lookup;
        WIDGET_AUTOCOMPLETE.loaded = true;
        return WIDGET_AUTOCOMPLETE;
      })
      .catch(function(){
        WIDGET_AUTOCOMPLETE.loaded = true;
        return WIDGET_AUTOCOMPLETE;
      });
    return WIDGET_AUTOCOMPLETE.loading;
  }
  function resolveAirportRecord(value){
    var raw = normalizeAirportLabel(value);
    if (!raw) return null;
    var exactCode = raw.match(/^[A-Za-z]{3}$/);
    if (exactCode && WIDGET_AUTOCOMPLETE.airportLookup[exactCode[0].toUpperCase()]) return WIDGET_AUTOCOMPLETE.airportLookup[exactCode[0].toUpperCase()];
    var tailCode = raw.match(/\(([A-Za-z]{3})\)\s*$/);
    if (tailCode && WIDGET_AUTOCOMPLETE.airportLookup[tailCode[1].toUpperCase()]) return WIDGET_AUTOCOMPLETE.airportLookup[tailCode[1].toUpperCase()];
    var key = normalizeLookupKey(raw);
    if (key && WIDGET_AUTOCOMPLETE.airportLookup[key]) return WIDGET_AUTOCOMPLETE.airportLookup[key];
    for (var i = 0; i < WIDGET_AUTOCOMPLETE.airports.length; i += 1){
      var item = WIDGET_AUTOCOMPLETE.airports[i];
      if (normalizeLookupKey(item.label).indexOf(key) !== -1) return item;
    }
    return null;
  }
  function resolveAirportCode(value){
    var raw = normalizeAirportLabel(value);
    if (!raw) return '';
    var exactCode = raw.match(/^[A-Za-z]{3}$/);
    if (exactCode) return exactCode[0].toUpperCase();
    var tailCode = raw.match(/\(([A-Za-z]{3})\)\s*$/);
    if (tailCode) return tailCode[1].toUpperCase();
    var record = resolveAirportRecord(raw);
    return record ? String(record.code || '').toUpperCase() : '';
  }
  function formatAirportDisplay(value){
    var raw = normalizeAirportLabel(value);
    if (!raw) return '—';
    var record = resolveAirportRecord(raw);
    if (record && record.label) return record.label;
    var code = resolveAirportCode(raw);
    if (code && WIDGET_AUTOCOMPLETE.airportLookup[code] && WIDGET_AUTOCOMPLETE.airportLookup[code].label) return WIDGET_AUTOCOMPLETE.airportLookup[code].label;
    return raw;
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
  function getFunctionsBaseUrl(){
    if (window.TRAVIRAE_FUNCTIONS_BASE_URL) return String(window.TRAVIRAE_FUNCTIONS_BASE_URL || '').replace(/\/$/, '');
    var cfg = window.TRAVIRAE_CONFIG || {};
    var base = String(cfg.SUPABASE_URL || window.TRAVIRAE_SUPABASE_URL || '').replace(/\/$/, '');
    return base ? (base + '/functions/v1') : '';
  }
  function getPublicAnonKey(){
    var cfg = window.TRAVIRAE_CONFIG || {};
    return String(cfg.SUPABASE_ANON_KEY || window.TRAVIRAE_SUPABASE_ANON_KEY || '');
  }
  function buildFunctionUrl(functionName){
    var base = getFunctionsBaseUrl();
    return base ? (base + '/' + String(functionName || '').replace(/^\/+/, '')) : '';
  }
  function getPublicFunctionHeaders(extra){
    var headers = Object.assign({}, extra || {});
    var anonKey = getPublicAnonKey();
    if (anonKey){
      headers.apikey = anonKey;
      headers.Authorization = 'Bearer ' + anonKey;
    }
    return headers;
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
    var def = SOCIALS[platform];
    if (!def) return '';
    var host = String(url.hostname || '').toLowerCase().replace(/^www\./, '');
    if (Array.isArray(def.domains) && def.domains.length){
      var ok = def.domains.some(function(domain){ return host === domain || host.endsWith('.' + domain); });
      if (!ok) return '';
    }
    return url.toString();
  }
  function socialListFromObject(obj){
    var source = obj && typeof obj === 'object' ? obj : {};
    return VISIBLE_SOCIAL_PLATFORMS.map(function(platform){
      return { platform: platform, url: String(source[platform] || '').trim() };
    }).filter(function(item){ return !!item.url; });
  }
  function renderSocialLinks(obj){
    var items = socialListFromObject(obj);
    if (!items.length) return '';
    return '<div class="if-social-list">' + items.map(function(item){
      var def = SOCIALS[item.platform];
      var iconHtml = def.image
        ? '<img class="if-social-link__img" loading="lazy" src="' + escapeAttr(def.image) + '" alt=""/>'
        : def.icon;
      return '<a class="if-social-link if-social-link--' + escapeAttr(item.platform) + '" href="' + escapeAttr(item.url) + '" target="_blank" rel="noopener" aria-label="' + escapeAttr(t(def.labelKey)) + '">' + iconHtml + '<span>' + escapeHtml(t(def.labelKey)) + '</span></a>';
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
    var locale = getWidgetLocale(config.locale);
    var url = new URL('https://www.stay22.com/allez/roam');
    url.searchParams.set('aid', STAY22_AID);
    url.searchParams.set('campaign', String(config.trackingCode || ''));
    if (config.destination) url.searchParams.set('address', String(config.destination));
    if (config.checkin) url.searchParams.set('checkin', String(config.checkin));
    if (config.checkout) url.searchParams.set('checkout', String(config.checkout));
    if (locale){ url.searchParams.set('ljs', locale); url.searchParams.set('lang', locale); }
    return url.toString();
  }
  function buildStay22EmbedUrl(config){
    config = config || {};
    var locale = getWidgetLocale(config.locale);
    var url = new URL('https://www.stay22.com/embed/gm');
    url.searchParams.set('aid', STAY22_AID);
    if (config.trackingCode) url.searchParams.set('campaign', String(config.trackingCode || ''));
    if (config.destination) url.searchParams.set('address', String(config.destination));
    if (config.checkin) url.searchParams.set('checkin', String(config.checkin));
    if (config.checkout) url.searchParams.set('checkout', String(config.checkout));
    if (locale){ url.searchParams.set('ljs', locale); url.searchParams.set('lang', locale); }
    url.searchParams.set('maincolor', '293BFF');
    return url.toString();
  }
  function buildAviasalesUrl(config){
    config = config || {};
    var widgetLocale = getWidgetLocale(config.locale);
    var url = new URL('https://search.aviasales.com/flights/');
    var originCode = resolveAirportCode(config.origin);
    var destinationCode = resolveAirportCode(config.destination);
    var locale = getAviasalesSearchLocale(widgetLocale);
    url.searchParams.set('marker', AVIASALES_MARKER);
    url.searchParams.set('sub_id', String(config.trackingCode || ''));
    url.searchParams.set('currency', String(getWidgetCurrency(widgetLocale) || 'usd').toUpperCase());
    url.searchParams.set('adults', '1');
    url.searchParams.set('children', '0');
    url.searchParams.set('infants', '0');
    url.searchParams.set('trip_class', '0');
    url.searchParams.set('locale', locale);
    url.searchParams.set('lang', locale);
    url.searchParams.set('market', getAviasalesMarket(widgetLocale));
    if (originCode) url.searchParams.set('origin_iata', originCode);
    if (destinationCode) url.searchParams.set('destination_iata', destinationCode);
    if (config.departDate) url.searchParams.set('depart_date', String(config.departDate));
    if (config.returnDate) url.searchParams.set('return_date', String(config.returnDate));
    url.searchParams.set('one_way', config.returnDate ? 'false' : 'true');
    return url.toString();
  }

  function buildAviasalesWidgetScriptUrl(config){
    config = config || {};
    var widgetLocale = getWidgetLocale(config.locale);
    var locale = getAviasalesWidgetLocale(widgetLocale);
    var originCode = resolveAirportCode(config.origin);
    var destinationCode = resolveAirportCode(config.destination);
    var url = new URL('https://tpemd.com/content');
    url.searchParams.set('currency', getWidgetCurrency(widgetLocale));
    url.searchParams.set('trs', '454819');
    url.searchParams.set('shmarker', AVIASALES_MARKER);
    url.searchParams.set('show_hotels', 'false');
    url.searchParams.set('powered_by', 'true');
    url.searchParams.set('locale', locale);
    url.searchParams.set('searchUrl', 'www.aviasales.com/search');
    url.searchParams.set('primary_override', '#2739FEff');
    url.searchParams.set('color_button', '#2739FEff');
    url.searchParams.set('color_icons', '#2739FEff');
    url.searchParams.set('dark', '#262626');
    url.searchParams.set('light', '#FFFFFF');
    url.searchParams.set('secondary', '#FFFFFF');
    url.searchParams.set('special', '#C4C4C4');
    url.searchParams.set('color_focused', '#2739FEff');
    url.searchParams.set('border_radius', '24');
    url.searchParams.set('no_labels', '');
    url.searchParams.set('plain', 'true');
    url.searchParams.set('promo_id', '7879');
    url.searchParams.set('campaign_id', '100');
    if (config.trackingCode) url.searchParams.set('sub_id', String(config.trackingCode || ''));
    if (originCode){ url.searchParams.set('origin', originCode); url.searchParams.set('origin_iata', originCode); }
    if (destinationCode){ url.searchParams.set('destination', destinationCode); url.searchParams.set('destination_iata', destinationCode); }
    if (config.departDate) url.searchParams.set('depart_date', String(config.departDate));
    if (config.returnDate) url.searchParams.set('return_date', String(config.returnDate));
    url.searchParams.set('one_way', config.returnDate ? 'false' : 'true');
    return url.toString();
  }
  function hasAviasalesWidgetRendered(mount){
    if (!mount) return false;
    var nodes = mount.children || [];
    for (var i = 0; i < nodes.length; i += 1){
      var tag = String(nodes[i].tagName || '').toUpperCase();
      if (tag && tag !== 'SCRIPT') return true;
    }
    return false;
  }
  function hydrateAviasalesWidgets(root){
    var scope = root || document;
    $all('[data-if-aviasales-widget]', scope).forEach(function(host){
      var src = host.getAttribute('data-widget-src') || '';
      var mount = $('[data-if-aviasales-mount]', host);
      var fallback = $('[data-if-aviasales-fallback]', host);
      if (!mount) return;
      if (!src){
        host.classList.remove('is-embedded');
        if (fallback) fallback.hidden = false;
        mount.innerHTML = '';
        return;
      }
      if (host.getAttribute('data-hydrated-src') === src && hasAviasalesWidgetRendered(mount)){
        host.classList.add('is-embedded');
        if (fallback) fallback.hidden = true;
        return;
      }
      host.setAttribute('data-hydrated-src', src);
      host.classList.remove('is-embedded');
      if (fallback) fallback.hidden = false;
      mount.innerHTML = '';
      var script = document.createElement('script');
      script.async = true;
      script.charset = 'utf-8';
      script.src = src;
      script.addEventListener('load', function(){
        window.setTimeout(function(){
          if (hasAviasalesWidgetRendered(mount)){
            host.classList.add('is-embedded');
            if (fallback) fallback.hidden = true;
          }
        }, 800);
      });
      script.addEventListener('error', function(){
        host.classList.remove('is-embedded');
        if (fallback) fallback.hidden = false;
      });
      mount.appendChild(script);
      window.setTimeout(function(){
        if (hasAviasalesWidgetRendered(mount)){
          host.classList.add('is-embedded');
          if (fallback) fallback.hidden = true;
        }
      }, 2500);
    });
  }
  function hydrateWidgetEmbeds(root){
    hydrateAviasalesWidgets(root || document);
  }

  function bindWidgetTouchGuard(root){
    var scope = root || document;
    var modalBody = scope && scope.closest ? scope.closest('.if-modal__body') : null;
    if (!modalBody) modalBody = document.getElementById('if-modal-body');
    if (!modalBody) return;
    var scrollHost = modalBody.closest ? (modalBody.closest('.if-modal__dialog') || modalBody) : modalBody;
    var releaseTimer = null;
    function releaseLock(delay){
      if (releaseTimer) window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(function(){
        modalBody.classList.remove('if-modal__body--widget-active');
        if (scrollHost) scrollHost.classList.remove('if-modal__dialog--widget-active');
        document.body.classList.remove('if-modal-widget-active');
      }, typeof delay === 'number' ? delay : 220);
    }
    function engageLock(){
      if (releaseTimer) window.clearTimeout(releaseTimer);
      modalBody.classList.add('if-modal__body--widget-active');
      if (scrollHost) scrollHost.classList.add('if-modal__dialog--widget-active');
      document.body.classList.add('if-modal-widget-active');
    }
    if (!scrollHost.getAttribute('data-widget-guard-root')){
      scrollHost.setAttribute('data-widget-guard-root', '1');
      ['touchstart','pointerdown','mousedown'].forEach(function(evt){
        scrollHost.addEventListener(evt, function(e){
          var target = e.target;
          if (target && target.closest && target.closest('[data-widget-interactive="1"], .if-widget-card__embed, .if-aviasales-widget-host, .if-aviasales-widget-host *')) return;
          releaseLock(0);
        }, { passive: true });
      });
      scrollHost.addEventListener('scroll', function(){ releaseLock(0); }, { passive: true });
    }
    var selector = '[data-widget-interactive="1"], .if-widget-card__embed, .if-aviasales-widget-host, .if-widget-card__embed iframe, .if-aviasales-widget-host *';
    $all(selector, scope).forEach(function(el){
      if (!el || el.getAttribute('data-widget-touch-bound') === '1') return;
      el.setAttribute('data-widget-touch-bound', '1');
      ['touchstart','pointerdown','mousedown'].forEach(function(evt){
        el.addEventListener(evt, function(){ engageLock(); }, { passive: true });
      });
      ['touchmove','pointermove'].forEach(function(evt){
        el.addEventListener(evt, function(){ engageLock(); }, { passive: true });
      });
      ['touchend','touchcancel','pointerup','pointercancel','mouseleave','mouseup','blur'].forEach(function(evt){
        el.addEventListener(evt, function(){ releaseLock(260); }, { passive: true });
      });
    });
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
      if (block.type === '__post_meta'){
        return;
      }
      if (block.type === 'heading'){
        block.level = block.level === 'h3' ? 'h3' : 'h2';
        block.text = String(block.text || '').trim();
        block.size = ['small','medium','large'].indexOf(block.size) === -1 ? 'medium' : block.size;
        block.align = ['left','center','right'].indexOf(block.align) === -1 ? 'left' : block.align;
      } else if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'tip'){
        block.text = String(block.text || '').trim();
        block.size = ['small','medium','large'].indexOf(block.size) === -1 ? 'medium' : block.size;
        block.align = ['left','center','right'].indexOf(block.align) === -1 ? 'left' : block.align;
      } else if (block.type === 'image'){
        block.path = String(block.path || '').trim();
        block.url = String(block.url || (block.path ? publicImageUrl('influencer-post-media', block.path) : '')).trim();
        block.caption = String(block.caption || '').trim();
        block.size = ['small','medium','full'].indexOf(block.size) === -1 ? 'medium' : block.size;
      } else if (block.type === 'list'){
        if (typeof block.items === 'string') block.items = block.items.split('\n');
        block.items = (Array.isArray(block.items) ? block.items : []).map(function(item){ return String(item || '').trim(); }).filter(Boolean);
        block.size = ['small','medium','large'].indexOf(block.size) === -1 ? 'medium' : block.size;
        block.align = ['left','center','right'].indexOf(block.align) === -1 ? 'left' : block.align;
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
    var href = block.partner === 'stay22' ? buildStay22Url({ trackingCode: trackingCode, destination: block.destination, checkin: block.checkin, checkout: block.checkout, locale: block.widgetLocale }) : buildAviasalesUrl({ trackingCode: trackingCode, origin: block.origin, destination: block.destination, departDate: block.checkin, returnDate: block.returnDate, locale: block.widgetLocale });
    var meta = [];
    if (block.partner === 'stay22'){
      if (block.destination) meta.push(escapeHtml(block.destination));
      if (block.checkin) meta.push(escapeHtml(block.checkin));
      if (block.checkout) meta.push(escapeHtml(block.checkout));
    } else {
      if (block.origin && block.destination) meta.push(escapeHtml(formatAirportDisplay(block.origin)) + ' → ' + escapeHtml(formatAirportDisplay(block.destination)));
      if (block.checkin) meta.push(escapeHtml(block.checkin));
      if (block.returnDate) meta.push(escapeHtml(block.returnDate));
    }
    var embedHtml = '';
    if (block.partner === 'stay22' && block.destination){
      embedHtml = '' +
        '<div class="if-widget-card__embed if-widget-card__embed--map" data-widget-interactive="1">' +
          '<iframe loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="' + escapeAttr(buildStay22EmbedUrl({ trackingCode: trackingCode, destination: block.destination, checkin: block.checkin, checkout: block.checkout, locale: block.widgetLocale })) + '" title="' + escapeAttr(block.title || 'Hotel Map') + '" data-widget-interactive="1"></iframe>' +
        '</div>';
    } else if (block.partner === 'aviasales'){
      var aviaWidgetSrc = buildAviasalesWidgetScriptUrl({ trackingCode: trackingCode, origin: block.origin, destination: block.destination, departDate: block.checkin, returnDate: block.returnDate, locale: block.widgetLocale });
      embedHtml = '' +
        '<div class="if-widget-card__embed if-widget-card__embed--aviasales" data-widget-interactive="1">' +
          '<div class="if-aviasales-widget-host" data-if-aviasales-widget="1" data-widget-src="' + escapeAttr(aviaWidgetSrc) + '" data-widget-interactive="1">' +
            '<div class="if-aviasales-widget-fallback" data-if-aviasales-fallback="1">' +
              '<div class="if-flight-widget-preview">' +
                '<div class="if-flight-widget-preview__route">' +
                  '<div class="if-flight-widget-preview__field"><span class="muted small">' + escapeHtml(formatAirportDisplay(block.origin)) + '</span></div>' +
                  '<div class="if-flight-widget-preview__arrow">→</div>' +
                  '<div class="if-flight-widget-preview__field"><span class="muted small">' + escapeHtml(formatAirportDisplay(block.destination)) + '</span></div>' +
                '</div>' +
                '<div class="if-flight-widget-preview__dates">' +
                  '<span>' + escapeHtml(block.checkin || '—') + '</span>' +
                  '<span>' + escapeHtml(block.returnDate || '—') + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="if-aviasales-widget-mount" data-if-aviasales-mount="1" data-widget-interactive="1"></div>' +
          '</div>' +
        '</div>';
    }
    return '' +
      '<section class="if-widget-card if-widget-card--' + escapeAttr(block.partner) + '" data-widget-wrap="1">' +
        '<h3>' + escapeHtml(block.title || (block.partner === 'stay22' ? 'Hotel Map' : 'Flights Widget')) + '</h3>' +
        (block.description ? '<p class="muted">' + escapeHtml(block.description) + '</p>' : '') +
        embedHtml +
        (meta.length ? '<div class="if-widget-meta">' + meta.map(function(item){ return '<span>' + item + '</span>'; }).join('') + '</div>' : '') +
      '</section>';
  }
  function renderContentHtml(blocks, context){
    var normalized = normalizeContentBlocks(blocks, context).blocks;
    return normalized.map(function(block){
      if (block.type === 'heading') return '<' + block.level + ' class="if-rich-heading is-size-' + escapeAttr(block.size || 'medium') + ' is-align-' + escapeAttr(block.align || 'left') + '">' + escapeHtml(block.text) + '</' + block.level + '>';
      if (block.type === 'paragraph') return '<p class="if-rich-paragraph is-size-' + escapeAttr(block.size || 'medium') + ' is-align-' + escapeAttr(block.align || 'left') + '">' + escapeHtml(block.text).replace(/\n/g, '<br/>') + '</p>';
      if (block.type === 'quote') return '<blockquote class="if-rich-quote is-size-' + escapeAttr(block.size || 'medium') + ' is-align-' + escapeAttr(block.align || 'left') + '">' + escapeHtml(block.text).replace(/\n/g, '<br/>') + '</blockquote>';
      if (block.type === 'tip') return '<div class="if-rich-callout is-size-' + escapeAttr(block.size || 'medium') + ' is-align-' + escapeAttr(block.align || 'left') + '">' + escapeHtml(block.text).replace(/\n/g, '<br/>') + '</div>';
      if (block.type === 'separator') return '<hr class="if-rich-separator"/>';
      if (block.type === 'list') return '<ul class="if-rich-list is-size-' + escapeAttr(block.size || 'medium') + ' is-align-' + escapeAttr(block.align || 'left') + '">' + (block.items || []).map(function(item){ return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
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


  function extractPostDisplayMeta(blocks){
    var items = Array.isArray(blocks) ? blocks.slice() : [];
    var meta = { title_size: 'medium', title_align: 'center', excerpt_size: 'medium', excerpt_align: 'center' };
    if (items.length && items[0] && String(items[0].type || '') === '__post_meta'){
      var source = items.shift() || {};
      if (['small','medium','large'].indexOf(source.title_size) !== -1) meta.title_size = source.title_size;
      if (['left','center','right'].indexOf(source.title_align) !== -1) meta.title_align = source.title_align;
      if (['small','medium','large'].indexOf(source.excerpt_size) !== -1) meta.excerpt_size = source.excerpt_size;
      if (['left','center','right'].indexOf(source.excerpt_align) !== -1) meta.excerpt_align = source.excerpt_align;
    }
    return { meta: meta, blocks: items };
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
      pageSize: 6,
      currentPage: Math.max(1, parseInt(readQueryParam('page') || '1', 10) || 1),
      creatorSlug: readQueryParam('creator') || '',
      postSlug: readQueryParam('post') || '',
      searchQuery: String(readQueryParam('q') || '').trim(),
      searchCache: null,
      searchCacheCreator: null,
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
              '<div class="if-profile-card__top if-profile-card__top--public"><a class="if-profile-card__back" href="' + escapeAttr(buildPagePath('influencers-vlogs.html')) + '"><span class="if-profile-card__back-icon" aria-hidden="true">←</span><span>' + escapeHtml(t('backToList')) + '</span></a></div>' +
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
        '<button class="btn secondary if-pagination-arrow" type="button" aria-label="' + escapeHtml(t('previous')) + '" data-page="' + (state.currentPage - 1) + '"' + (state.currentPage <= 1 ? ' disabled' : '') + '><span aria-hidden="true">&lt;</span></button>' +
        '<span class="if-pagination-status">' + escapeHtml(t('page')) + ' ' + escapeHtml(String(state.currentPage)) + ' / ' + escapeHtml(String(totalPages)) + '</span>' +
        '<button class="btn secondary if-pagination-arrow" type="button" aria-label="' + escapeHtml(t('next')) + '" data-page="' + (state.currentPage + 1) + '"' + (state.currentPage >= totalPages ? ' disabled' : '') + '><span aria-hidden="true">&gt;</span></button>';
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


    function bindPublicSearchInput(input){
      if (!input || input.__ifBound) return;
      input.__ifBound = true;
      input.placeholder = t('searchPlaceholder');
      input.value = state.searchQuery || '';
      var timer = null;
      input.addEventListener('input', function(){
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(function(){
          state.searchQuery = String(input.value || '').trim();
          state.currentPage = 1;
          updateQueryParam('q', state.searchQuery || null, 'replace');
          loadPosts();
        }, 120);
      });
      input.addEventListener('search', function(){
        state.searchQuery = String(input.value || '').trim();
        state.currentPage = 1;
        updateQueryParam('q', state.searchQuery || null, 'replace');
        loadPosts();
      });
    }

    function ensureSearchUi(){
      if (!elSection) return;
      var existing = document.getElementById('if-post-search-row');
      if (existing) {
        var input = document.getElementById('if-post-search');
        if (!input) {
          existing.innerHTML = '<input id="if-post-search" type="search" placeholder="' + escapeAttr(t('searchPlaceholder')) + '" autocomplete="off"/>';
          input = document.getElementById('if-post-search');
        }
        bindPublicSearchInput(input);
        return;
      }
      var head = $('.if-section-head', elSection);
      if (!head) return;
      var row = document.createElement('div');
      row.className = 'if-public-search-row';
      row.id = 'if-post-search-row';
      row.innerHTML = '<input id="if-post-search" type="search" placeholder="' + escapeAttr(t('searchPlaceholder')) + '" autocomplete="off"/>';
      head.insertAdjacentElement('afterend', row);
      bindPublicSearchInput(document.getElementById('if-post-search'));
    }

    async function fetchAllPublicPostsForSearch(){
      if (state.searchCache && state.searchCacheCreator === (state.creatorSlug || '')) return state.searchCache;
      var limit = 100;
      var offset = 0;
      var total = null;
      var rows = [];
      while (total === null || offset < total) {
        var resp = await client.rpc('get_influencer_public_posts', { p_limit: limit, p_offset: offset, p_creator_slug: state.creatorSlug || null });
        if (resp && resp.error) throw resp.error;
        var batch = resp && resp.data ? resp.data : [];
        if (!batch.length) break;
        rows = rows.concat(batch);
        total = Number(batch[0].total_count || rows.length) || rows.length;
        offset += batch.length;
        if (batch.length < limit || offset > 1000) break;
      }
      state.searchCacheCreator = state.creatorSlug || '';
      state.searchCache = rows;
      return rows;
    }

    function filterPublicPosts(rows){
      var q = String(state.searchQuery || '').trim().toLowerCase();
      if (!q) return rows;
      return (Array.isArray(rows) ? rows : []).filter(function(post){
        var hay = [post.title, post.excerpt, post.creator_name, post.creator_slug, post.post_slug].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    async function loadPosts(){
      if (!elList) return;
      ensureSearchUi();
      if (!client || !client.rpc){ setMessage('Supabase RPC non disponibile.', 'error'); return; }
      elList.innerHTML = '<div class="if-empty-state">' + escapeHtml(t('loading')) + '</div>';
      var offset = (state.currentPage - 1) * state.pageSize;
      var totalCount = 0;
      var rows = [];
      try {
        if (state.searchQuery) {
          var allRows = await fetchAllPublicPostsForSearch();
          var filtered = filterPublicPosts(allRows);
          totalCount = filtered.length;
          rows = filtered.slice(offset, offset + state.pageSize);
        } else {
          var resp = await client.rpc('get_influencer_public_posts', { p_limit: state.pageSize, p_offset: offset, p_creator_slug: state.creatorSlug || null });
          if (resp && resp.error){ console.error(resp.error); setMessage(resp.error.message || 'Errore caricamento post.', 'error'); elList.innerHTML = ''; return; }
          rows = resp && resp.data ? resp.data : [];
          totalCount = rows.length ? (Number(rows[0].total_count || rows.length) || rows.length) : 0;
        }
      } catch (err) {
        console.error(err);
        setMessage((err && err.message) ? err.message : 'Errore caricamento post.', 'error');
        elList.innerHTML = '';
        return;
      }
      if (!rows.length){ elList.innerHTML = '<div class="if-empty-state">' + escapeHtml(state.searchQuery ? t('noSearchResults') : t('noPosts')) + '</div>'; renderPagination(totalCount); return; }
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
                '<div class="if-post-card__cta"><button class="btn" type="button" data-open-post="' + escapeAttr(post.post_slug || '') + '">' + escapeHtml(t('discoverMore')) + '</button></div>' +
                '<div class="if-post-card__creatorline"><a class="if-link-creator" href="' + escapeAttr(creatorHref) + '" data-creator-link="' + escapeAttr(post.creator_slug || '') + '">' + escapeHtml(post.creator_name || (t('by') + ' ' + post.creator_slug)) + '</a></div>' +
              '</div>' +
            '</div>' +
          '</article>';
      }).join('');
      elList.setAttribute('data-post-count', String(rows.length));
      renderPagination(totalCount);
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
      var contentBlocks = typeof post.content_json === 'string' ? safeJsonParse(post.content_json, []) : (post.content_json || []);
      var extractedMeta = extractPostDisplayMeta(contentBlocks);
      contentBlocks = extractedMeta.blocks;
      var postMeta = extractedMeta.meta;
      var contentHtml = (Array.isArray(contentBlocks) && contentBlocks.length)
        ? renderContentHtml(contentBlocks, { creatorSlug: post.creator_affiliate_slug || post.creator_slug || '', postShortId: '', postId: post.post_id, postSlug: post.post_slug, post: post })
        : (post.content_html || '');
      var shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('post', post.post_slug);
      if (post.creator_slug) shareUrl.searchParams.set('creator', post.creator_slug);
      modalBody.innerHTML = '' +
        '<article class="if-post-modal-article">' +
          '<div class="if-post-modal-head">' +
            '<h2 id="if-post-modal-title" class="if-post-title-display is-size-' + escapeAttr(postMeta.title_size || 'medium') + ' is-align-' + escapeAttr(postMeta.title_align || 'center') + '">' + escapeHtml(post.title || '') + '</h2>' +
            '<div class="if-post-modal-submeta if-post-modal-submeta--stacked">' +
              '<a class="if-link-creator if-link-creator--modal" href="' + escapeAttr(buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(post.creator_slug || '')) + '" data-creator-link-modal="' + escapeAttr(post.creator_slug || '') + '">' + escapeHtml(post.creator_name || '') + '</a>' +
              '<button class="btn secondary small" type="button" id="if-copy-post-link">' + escapeHtml(t('copyLink')) + '</button>' +
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
      hydrateWidgetEmbeds(modalBody);
      bindWidgetTouchGuard(modalBody);
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
      document.body.classList.remove('if-modal-widget-active');
      if (modalBody) modalBody.classList.remove('if-modal__body--widget-active');
      if (readQueryParam('post')) updateQueryParam('post', null, 'replace');
      state.postSlug = '';
    }

    async function initPage(){
      ensureSearchUi();
      var strayHint = document.querySelector('#if-post-list-section > p');
      if (strayHint) strayHint.remove();
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
    if (type === 'heading') return { id: randomId('blk_'), type: 'heading', level: 'h2', text: '', size: 'medium', align: 'left' };
    if (type === 'image') return { id: randomId('blk_'), type: 'image', path: '', url: '', caption: '', size: 'medium' };
    if (type === 'list') return { id: randomId('blk_'), type: 'list', items: [''], size: 'medium', align: 'left' };
    if (type === 'quote') return { id: randomId('blk_'), type: 'quote', text: '', size: 'medium', align: 'left' };
    if (type === 'tip') return { id: randomId('blk_'), type: 'tip', text: '', size: 'medium', align: 'left' };
    if (type === 'separator') return { id: randomId('blk_'), type: 'separator' };
    if (type === 'stay22') return { id: randomId('blk_'), type: 'stay22', widgetShortId: shortId('w'), title: 'Hotel Map', description: '', destination: '', checkin: '', checkout: '', widgetLocale: getLang(), ctaLabel: t('widgetStay22Action') };
    if (type === 'aviasales') return { id: randomId('blk_'), type: 'aviasales', widgetShortId: shortId('w'), title: 'Flights Widget', description: '', origin: '', destination: '', checkin: '', returnDate: '', widgetLocale: getLang(), ctaLabel: t('widgetAviasalesAction') };
    return { id: randomId('blk_'), type: 'paragraph', text: '', size: 'medium', align: 'left' };
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
    buildAviasalesWidgetScriptUrl: buildAviasalesWidgetScriptUrl,
    hydrateWidgetEmbeds: hydrateWidgetEmbeds,
    ensureWidgetAutocompleteCatalog: ensureWidgetAutocompleteCatalog,
    searchStay22Destinations: searchStay22Destinations,
    searchAirportSuggestions: searchAirportSuggestions,
    getWidgetLocale: getWidgetLocale,
    resolveAirportCode: resolveAirportCode,
    formatAirportDisplay: formatAirportDisplay,
    initPublicPage: initPublicPage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ if (document.body.classList.contains('page--influencers-vlogs')) initPublicPage(); });
  } else if (document.body && document.body.classList.contains('page--influencers-vlogs')) {
    initPublicPage();
  }
})();
