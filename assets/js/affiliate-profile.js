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
      saveProfile: 'Salva',
      editProfile: 'Modifica il profilo',
      viewInsights: 'Visualizza insights',
      title: 'Titolo post',
      coverImage: 'Immagine copertina',
      excerpt: 'Didascalia / estratto card',
      livePreview: 'Anteprima live card',
      postPreview: 'Anteprima post',
      postContent: 'Contenuto del post',
      startNewPost: 'Crea nuovo post',
      cancelEdit: 'Chiudi composer',
      chooseImage: 'Scegli immagine',
      noFileSelected: 'Nessun file selezionato.',
      emptyEditor: 'Usa blocchi controllati: heading, paragrafo, immagine, lista, quote, callout, separatore, Hotel Map e Flights Widget.',
      currentEditing: 'Post in modifica',
      viewPublicPage: 'Apri pagina pubblica',
      creatorStatsHint: 'Queste statistiche sono private e visibili solo a te.',
      creatorIntroText: 'Il profilo creator ti permette di comparire pubblicamente nella sezione Influencers Vlogs di Travirae. Dopo l’approvazione admin potrai gestire anche i tuoi post e le tue statistiche private.',
      createProfile: 'Crea profilo',
      profileNoChangesError: 'Errore: non è stata apportata neancora nessuna modifica al profilo.',
      profileReviewPopup: 'Le modifiche inviate sono attualmente in fase di revisione. L’elaborazione potrebbe richiedere fino a 48 ore lavorative.',
      profileAlreadyPendingPopup: 'Hai già inoltrato la richiesta. Attualmente il profilo è in fase di revisione, l’elaborazione potrebbe richiedere fino a 48 ore lavorative.',
      popupOk: 'OK',
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
      hidePreview: 'Nascondi anteprima'
    },
    en: {
      publicProfile: 'Public profile',
      myPosts: 'My posts',
      privateStats: 'Private creator stats',
      composer: 'Post composer',
      avatar: 'Profile image',
      displayName: 'Profile name',
      bio: 'Biography',
      saveProfile: 'Save',
      editProfile: 'Edit profile',
      viewInsights: 'View insights',
      title: 'Post title',
      coverImage: 'Cover image',
      excerpt: 'Card caption / excerpt',
      livePreview: 'Live card preview',
      postPreview: 'Post preview',
      postContent: 'Post content',
      startNewPost: 'Create new post',
      cancelEdit: 'Close composer',
      chooseImage: 'Choose image',
      noFileSelected: 'No file selected.',
      emptyEditor: 'Use controlled blocks only: heading, paragraph, image, list, quote, callout, separator, Hotel Map and Flights Widget.',
      currentEditing: 'Editing post',
      viewPublicPage: 'Open public page',
      creatorStatsHint: 'These statistics are private and visible only to you.',
      creatorIntroText: 'Your creator profile lets you appear publicly in the Travirae Influencers Vlogs section. After admin approval you will also be able to manage your posts and private stats.',
      createProfile: 'Create profile',
      profileNoChangesError: 'Error: no profile changes have been made yet.',
      profileReviewPopup: 'The submitted changes are currently under review. Processing may take up to 48 working hours.',
      profileAlreadyPendingPopup: 'You have already submitted the request. The profile is currently under review and processing may take up to 48 working hours.',
      popupOk: 'OK',
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
      hidePreview: 'Hide preview'
    },
    de: {
      publicProfile: 'Öffentliches Profil',
      myPosts: 'Meine Beiträge',
      privateStats: 'Private Creator-Statistiken',
      composer: 'Post-Composer',
      avatar: 'Profilbild',
      displayName: 'Profilname',
      bio: 'Biografie',
      saveProfile: 'Speichern',
      editProfile: 'Profil bearbeiten',
      viewInsights: 'Insights ansehen',
      title: 'Beitragstitel',
      coverImage: 'Titelbild',
      excerpt: 'Card-Text / Auszug',
      livePreview: 'Live-Card-Vorschau',
      postPreview: 'Beitragsvorschau',
      postContent: 'Beitragsinhalt',
      startNewPost: 'Neuen Beitrag erstellen',
      cancelEdit: 'Composer schließen',
      chooseImage: 'Bild wählen',
      noFileSelected: 'Keine Datei ausgewählt.',
      emptyEditor: 'Verwende nur kontrollierte Blöcke: Heading, Absatz, Bild, Liste, Zitat, Callout, Trenner, Hotel Map und Flights Widget.',
      currentEditing: 'Beitrag wird bearbeitet',
      viewPublicPage: 'Öffentliche Seite öffnen',
      creatorStatsHint: 'Diese Statistiken sind privat und nur für dich sichtbar.',
      creatorIntroText: 'Mit deinem Creator-Profil erscheinst du öffentlich im Bereich Travirae Influencers Vlogs. Nach der Admin-Freigabe kannst du auch deine Beiträge und privaten Statistiken verwalten.',
      createProfile: 'Profil erstellen',
      profileNoChangesError: 'Fehler: Am Profil wurden noch keine Änderungen vorgenommen.',
      profileReviewPopup: 'Die gesendeten Änderungen werden derzeit geprüft. Die Bearbeitung kann bis zu 48 Arbeitsstunden dauern.',
      profileAlreadyPendingPopup: 'Du hast die Anfrage bereits gesendet. Das Profil wird derzeit geprüft und die Bearbeitung kann bis zu 48 Arbeitsstunden dauern.',
      popupOk: 'OK',
      status_draft: 'Entwurf',
      status_pending_review: 'In Prüfung',
      status_published: 'Veröffentlicht',
      status_changes_requested: 'Änderungen angefordert',
      status_rejected: 'Abgelehnt',
      status_archived: 'Archiviert',
      status_deleted: 'Gelöscht',
      saveDraftBtn: 'Entwurf speichern',
      submitReviewBtn: 'Zur Prüfung senden',
      showPreview: 'Vorschau anzeigen',
      hidePreview: 'Vorschau ausblenden'
    },
    es: {
      publicProfile: 'Perfil público',
      myPosts: 'Mis posts',
      privateStats: 'Estadísticas privadas del creador',
      composer: 'Composer del post',
      avatar: 'Imagen de perfil',
      displayName: 'Nombre del perfil',
      bio: 'Biografía',
      saveProfile: 'Guardar',
      editProfile: 'Editar perfil',
      viewInsights: 'Ver insights',
      title: 'Título del post',
      coverImage: 'Imagen de portada',
      excerpt: 'Texto / extracto de la card',
      livePreview: 'Vista previa de la card',
      postPreview: 'Vista previa del post',
      postContent: 'Contenido del post',
      startNewPost: 'Crear nuevo post',
      cancelEdit: 'Cerrar composer',
      chooseImage: 'Elegir imagen',
      noFileSelected: 'Ningún archivo seleccionado.',
      emptyEditor: 'Usa solo bloques controlados: heading, párrafo, imagen, lista, cita, callout, separador, Hotel Map y Flights Widget.',
      currentEditing: 'Editando post',
      viewPublicPage: 'Abrir página pública',
      creatorStatsHint: 'Estas estadísticas son privadas y visibles solo para ti.',
      creatorIntroText: 'Tu perfil creator te permite aparecer públicamente en la sección Influencers Vlogs de Travirae. Tras la aprobación del admin también podrás gestionar tus posts y estadísticas privadas.',
      createProfile: 'Crear perfil',
      profileNoChangesError: 'Error: todavía no se ha realizado ningún cambio en el perfil.',
      profileReviewPopup: 'Los cambios enviados están actualmente en revisión. El procesamiento puede tardar hasta 48 horas laborables.',
      profileAlreadyPendingPopup: 'Ya has enviado la solicitud. El perfil está actualmente en revisión y el procesamiento puede tardar hasta 48 horas laborables.',
      popupOk: 'OK',
      status_draft: 'Borrador',
      status_pending_review: 'En revisión',
      status_published: 'Publicado',
      status_changes_requested: 'Cambios solicitados',
      status_rejected: 'Rechazado',
      status_archived: 'Archivado',
      status_deleted: 'Eliminado',
      saveDraftBtn: 'Guardar borrador',
      submitReviewBtn: 'Enviar a revisión',
      showPreview: 'Mostrar vista previa',
      hidePreview: 'Ocultar vista previa'
    },
    fr: {
      publicProfile: 'Profil public',
      myPosts: 'Mes posts',
      privateStats: 'Statistiques privées du créateur',
      composer: 'Composer du post',
      avatar: 'Image de profil',
      displayName: 'Nom du profil',
      bio: 'Biographie',
      saveProfile: 'Enregistrer',
      editProfile: 'Modifier le profil',
      viewInsights: 'Voir les insights',
      title: 'Titre du post',
      coverImage: 'Image de couverture',
      excerpt: 'Texte / extrait de la card',
      livePreview: 'Aperçu live de la card',
      postPreview: 'Aperçu du post',
      postContent: 'Contenu du post',
      startNewPost: 'Créer un nouveau post',
      cancelEdit: 'Fermer le composer',
      chooseImage: 'Choisir une image',
      noFileSelected: 'Aucun fichier sélectionné.',
      emptyEditor: 'Utilise uniquement des blocs contrôlés : heading, paragraphe, image, liste, citation, callout, séparateur, Hotel Map et Flights Widget.',
      currentEditing: 'Post en cours de modification',
      viewPublicPage: 'Ouvrir la page publique',
      creatorStatsHint: 'Ces statistiques sont privées et visibles uniquement par toi.',
      creatorIntroText: 'Ton profil creator te permet d’apparaître publiquement dans la section Influencers Vlogs de Travirae. Après validation admin, tu pourras aussi gérer tes posts et tes statistiques privées.',
      createProfile: 'Créer un profil',
      profileNoChangesError: 'Erreur : aucune modification n’a encore été apportée au profil.',
      profileReviewPopup: 'Les modifications envoyées sont actuellement en cours de révision. Le traitement peut prendre jusqu’à 48 heures ouvrées.',
      profileAlreadyPendingPopup: 'Tu as déjà envoyé la demande. Le profil est actuellement en cours de révision et le traitement peut prendre jusqu’à 48 heures ouvrées.',
      popupOk: 'OK',
      status_draft: 'Brouillon',
      status_pending_review: 'En révision',
      status_published: 'Publié',
      status_changes_requested: 'Modifications demandées',
      status_rejected: 'Refusé',
      status_archived: 'Archivé',
      status_deleted: 'Supprimé',
      saveDraftBtn: 'Enregistrer le brouillon',
      submitReviewBtn: 'Envoyer en révision',
      showPreview: 'Afficher l’aperçu',
      hidePreview: 'Masquer l’aperçu'
    },
    nl: {
      publicProfile: 'Openbaar profiel',
      myPosts: 'Mijn posts',
      privateStats: 'Privé creator-statistieken',
      composer: 'Post composer',
      avatar: 'Profielafbeelding',
      displayName: 'Profielnaam',
      bio: 'Biografie',
      saveProfile: 'Opslaan',
      editProfile: 'Profiel bewerken',
      viewInsights: 'Insights bekijken',
      title: 'Posttitel',
      coverImage: 'Omslagafbeelding',
      excerpt: 'Cardtekst / fragment',
      livePreview: 'Live card-voorbeeld',
      postPreview: 'Postvoorbeeld',
      postContent: 'Postinhoud',
      startNewPost: 'Nieuwe post maken',
      cancelEdit: 'Composer sluiten',
      chooseImage: 'Afbeelding kiezen',
      noFileSelected: 'Geen bestand geselecteerd.',
      emptyEditor: 'Gebruik alleen gecontroleerde blokken: heading, alinea, afbeelding, lijst, quote, callout, scheiding, Hotel Map en Flights Widget.',
      currentEditing: 'Post bewerken',
      viewPublicPage: 'Open openbare pagina',
      creatorStatsHint: 'Deze statistieken zijn privé en alleen voor jou zichtbaar.',
      creatorIntroText: 'Met je creator-profiel verschijn je openbaar in de Travirae Influencers Vlogs-sectie. Na goedkeuring door de admin kun je ook je posts en privéstatistieken beheren.',
      createProfile: 'Profiel maken',
      profileNoChangesError: 'Fout: er zijn nog geen wijzigingen aan het profiel aangebracht.',
      profileReviewPopup: 'De verzonden wijzigingen worden momenteel beoordeeld. De verwerking kan tot 48 werkuren duren.',
      profileAlreadyPendingPopup: 'Je hebt het verzoek al ingediend. Het profiel wordt momenteel beoordeeld en de verwerking kan tot 48 werkuren duren.',
      popupOk: 'OK',
      status_draft: 'Concept',
      status_pending_review: 'In beoordeling',
      status_published: 'Gepubliceerd',
      status_changes_requested: 'Wijzigingen gevraagd',
      status_rejected: 'Afgewezen',
      status_archived: 'Gearchiveerd',
      status_deleted: 'Verwijderd',
      saveDraftBtn: 'Concept opslaan',
      submitReviewBtn: 'Ter beoordeling verzenden',
      showPreview: 'Voorbeeld tonen',
      hidePreview: 'Voorbeeld verbergen'
    },
    ru: {
      publicProfile: 'Публичный профиль',
      myPosts: 'Мои посты',
      privateStats: 'Приватная статистика автора',
      composer: 'Редактор поста',
      avatar: 'Изображение профиля',
      displayName: 'Имя профиля',
      bio: 'Биография',
      saveProfile: 'Сохранить',
      editProfile: 'Редактировать профиль',
      viewInsights: 'Посмотреть инсайты',
      title: 'Заголовок поста',
      coverImage: 'Обложка поста',
      excerpt: 'Подпись / краткое описание карточки',
      livePreview: 'Предпросмотр карточки',
      postPreview: 'Предпросмотр поста',
      postContent: 'Содержимое поста',
      startNewPost: 'Создать новый пост',
      cancelEdit: 'Закрыть редактор',
      chooseImage: 'Выбрать изображение',
      noFileSelected: 'Файл не выбран.',
      emptyEditor: 'Используйте только контролируемые блоки: heading, абзац, изображение, список, цитата, callout, разделитель, Hotel Map и Flights Widget.',
      currentEditing: 'Редактирование поста',
      viewPublicPage: 'Открыть публичную страницу',
      creatorStatsHint: 'Эта статистика приватная и видна только вам.',
      creatorIntroText: 'Профиль creator позволяет вам публично отображаться в разделе Travirae Influencers Vlogs. После одобрения администратором вы также сможете управлять своими постами и личной статистикой.',
      createProfile: 'Создать профиль',
      profileNoChangesError: 'Ошибка: в профиль ещё не внесено никаких изменений.',
      profileReviewPopup: 'Отправленные изменения сейчас находятся на проверке. Обработка может занять до 48 рабочих часов.',
      profileAlreadyPendingPopup: 'Вы уже отправили запрос. Профиль сейчас находится на проверке, и обработка может занять до 48 рабочих часов.',
      popupOk: 'OK',
      status_draft: 'Черновик',
      status_pending_review: 'На проверке',
      status_published: 'Опубликовано',
      status_changes_requested: 'Запрошены изменения',
      status_rejected: 'Отклонено',
      status_archived: 'В архиве',
      status_deleted: 'Удалено',
      saveDraftBtn: 'Сохранить черновик',
      submitReviewBtn: 'Отправить на проверку',
      showPreview: 'Показать предпросмотр',
      hidePreview: 'Скрыть предпросмотр'
    },
    ar: {
      publicProfile: 'الملف العام',
      myPosts: 'مقالاتي',
      privateStats: 'إحصاءات المنشئ الخاصة',
      composer: 'محرر المقال',
      avatar: 'صورة الملف',
      displayName: 'اسم الملف',
      bio: 'نبذة',
      saveProfile: 'حفظ',
      editProfile: 'تعديل الملف',
      viewInsights: 'عرض الإحصاءات',
      title: 'عنوان المقال',
      coverImage: 'صورة الغلاف',
      excerpt: 'وصف / مقتطف البطاقة',
      livePreview: 'معاينة البطاقة',
      postPreview: 'معاينة المقال',
      postContent: 'محتوى المقال',
      startNewPost: 'إنشاء مقال جديد',
      cancelEdit: 'إغلاق المحرر',
      chooseImage: 'اختر صورة',
      noFileSelected: 'لم يتم اختيار ملف.',
      emptyEditor: 'استخدم فقط الكتل المسموح بها: heading، فقرة، صورة، قائمة، اقتباس، callout، فاصل، Hotel Map و Flights Widget.',
      currentEditing: 'تعديل المقال',
      viewPublicPage: 'فتح الصفحة العامة',
      creatorStatsHint: 'هذه الإحصاءات خاصة وتظهر لك فقط.',
      creatorIntroText: 'يتيح لك ملف creator الظهور بشكل عام في قسم Influencers Vlogs من Travirae. بعد موافقة المشرف ستتمكن أيضاً من إدارة مقالاتك وإحصاءاتك الخاصة.',
      createProfile: 'إنشاء ملف',
      profileNoChangesError: 'خطأ: لم يتم إجراء أي تعديل على الملف حتى الآن.',
      profileReviewPopup: 'التعديلات المرسلة قيد المراجعة حالياً. قد تستغرق المعالجة حتى 48 ساعة عمل.',
      profileAlreadyPendingPopup: 'لقد أرسلت الطلب بالفعل. الملف قيد المراجعة حالياً وقد تستغرق المعالجة حتى 48 ساعة عمل.',
      popupOk: 'حسنًا',
      status_draft: 'مسودة',
      status_pending_review: 'قيد المراجعة',
      status_published: 'منشور',
      status_changes_requested: 'تم طلب تعديلات',
      status_rejected: 'مرفوض',
      status_archived: 'مؤرشف',
      status_deleted: 'محذوف',
      saveDraftBtn: 'حفظ كمسودة',
      submitReviewBtn: 'إرسال للمراجعة',
      showPreview: 'إظهار المعاينة',
      hidePreview: 'إخفاء المعاينة'
    },
    zh: {
      publicProfile: '公开资料',
      myPosts: '我的文章',
      privateStats: '创作者私人统计',
      composer: '文章编辑器',
      avatar: '头像图片',
      displayName: '资料名称',
      bio: '简介',
      saveProfile: '保存',
      editProfile: '编辑资料',
      viewInsights: '查看数据洞察',
      title: '文章标题',
      coverImage: '封面图片',
      excerpt: '卡片摘要 / 文案',
      livePreview: '卡片实时预览',
      postPreview: '文章预览',
      postContent: '文章内容',
      startNewPost: '创建新文章',
      cancelEdit: '关闭编辑器',
      chooseImage: '选择图片',
      noFileSelected: '未选择文件。',
      emptyEditor: '仅使用受控区块：heading、段落、图片、列表、引用、callout、分隔线、Hotel Map 和 Flights Widget。',
      currentEditing: '正在编辑文章',
      viewPublicPage: '打开公开页面',
      creatorStatsHint: '这些统计数据为私人数据，仅你可见。',
      creatorIntroText: '你的 creator 资料可以让你公开出现在 Travirae Influencers Vlogs 板块中。管理员批准后，你还可以管理自己的文章和私人统计数据。',
      createProfile: '创建资料',
      profileNoChangesError: '错误：资料尚未进行任何修改。',
      profileReviewPopup: '你提交的修改目前正在审核中，处理可能需要最多 48 个工作小时。',
      profileAlreadyPendingPopup: '你已经提交过请求。该资料目前正在审核中，处理可能需要最多 48 个工作小时。',
      popupOk: '确定',
      status_draft: '草稿',
      status_pending_review: '审核中',
      status_published: '已发布',
      status_changes_requested: '已要求修改',
      status_rejected: '已拒绝',
      status_archived: '已归档',
      status_deleted: '已删除',
      saveDraftBtn: '保存草稿',
      submitReviewBtn: '提交审核',
      showPreview: '显示预览',
      hidePreview: '隐藏预览'
    }
  };
  function L(key){
    var shared = t(key);
    if (TEXT[LANG] && Object.prototype.hasOwnProperty.call(TEXT[LANG], key)) return TEXT[LANG][key];
    if (shared !== key) return shared;
    if (TEXT.en && Object.prototype.hasOwnProperty.call(TEXT.en, key)) return TEXT.en[key];
    if (TEXT.it && Object.prototype.hasOwnProperty.call(TEXT.it, key)) return TEXT.it[key];
    return key;
  }

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
    editorOpen: false,
    profileFormOpen: false,
    statsPanelOpen: false,
    profileBaseline: null,
    profilePopupTimer: null
  };

  var WIDGET_LOCALE_LABELS = { it: 'Italiano', en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', nl: 'Nederlands', ru: 'Русский', ar: 'العربية', zh: '中文' };

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
    out.public_slug = String(out.public_slug || '').trim() || slugify(display) || slugify(fallback) || 'creator';
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

  function canonicalizeProfileDraft(source){
    var normalized = syncProfileSlug(source || {});
    var socials = {};
    Object.keys(I.SOCIALS).sort().forEach(function(platform){
      var value = normalized.social_links && normalized.social_links[platform] ? String(normalized.social_links[platform]).trim() : '';
      if (value) socials[platform] = value;
    });
    return {
      display_name: String(normalized.display_name || '').trim(),
      public_slug: String(normalized.public_slug || '').trim(),
      bio: String(normalized.bio || '').trim(),
      avatar_path: String(normalized.avatar_path || '').trim(),
      social_links: socials
    };
  }

  function hasPublishedProfile(){
    return !!(state.profile && state.profile.current_published_revision_id);
  }

  function getPendingProfileStatus(){
    return String((state.profilePendingRevision && state.profilePendingRevision.status) || '').toLowerCase();
  }

  function hasPendingInitialProfileReview(){
    if (hasPublishedProfile()) return false;
    if (getPendingProfileStatus() === 'pending_review') return true;
    return !!(state.profile && String(state.profile.status || '').toLowerCase() === 'pending_review');
  }

  function getPublicProfileSlugForLink(){
    if (state.profilePublishedRevision && state.profilePublishedRevision.public_slug) return String(state.profilePublishedRevision.public_slug || '');
    if (hasPublishedProfile() && state.profile && state.profile.public_slug) return String(state.profile.public_slug || '');
    if (state.profileDraft && state.profileDraft.public_slug) return String(state.profileDraft.public_slug || '');
    return String(state.affiliateSlug || '');
  }

  async function ensureUniqueProfileSlug(baseSlug, currentProfileId){
    var slugBase = slugify(baseSlug || '');
    if (!slugBase) slugBase = slugify(state.affiliateSlug || 'creator') || 'creator';
    if (!state.client) return slugBase;
    var candidate = slugBase;
    var suffix = 2;
    while (true){
      var query = state.client.from('influencer_profiles').select('id').eq('public_slug', candidate).limit(1);
      if (currentProfileId) query = query.neq('id', currentProfileId);
      var resp = await query.maybeSingle();
      var row = resp && resp.data ? resp.data : null;
      if (!row) return candidate;
      candidate = slugBase + '-' + suffix;
      suffix += 1;
    }
  }

  function hideProfilePopup(){
    var popup = $('#if-profile-popup');
    if (!popup) return;
    popup.hidden = true;
    document.body.classList.remove('if-popup-open');
    if (state.profilePopupTimer){
      clearTimeout(state.profilePopupTimer);
      state.profilePopupTimer = null;
    }
  }

  function showProfilePopup(message){
    var popup = $('#if-profile-popup');
    var messageEl = $('#if-profile-popup-message');
    if (!popup || !messageEl) return;
    messageEl.textContent = String(message || '');
    popup.hidden = false;
    document.body.classList.add('if-popup-open');
    if (state.profilePopupTimer) clearTimeout(state.profilePopupTimer);
    state.profilePopupTimer = setTimeout(function(){
      hideProfilePopup();
    }, 30000);
  }

  function renderProfileUi(){
    var shell = $('#if-affiliate-app-shell');
    if (shell) shell.hidden = false;
    var loginReq = $('#if-affiliate-login-required');
    if (loginReq) loginReq.hidden = true;
    setProfileTabVisibility(true);

    var hasPublished = hasPublishedProfile();
    if (!hasPublished) state.statsPanelOpen = false;

    var introVisible = !hasPublished && !state.profileFormOpen;
    var summaryVisible = hasPublished;
    var profileVisible = !!state.profileFormOpen;
    var statsVisible = hasPublished && !!state.statsPanelOpen;
    var postsVisible = hasPublished;

    var ctaPanel = $('#if-profile-cta-panel');
    var summaryPanel = $('#if-profile-summary-panel');
    var grid = $('#if-creator-grid');
    var profilePanel = $('#if-public-profile-panel');
    var statsPanel = $('#if-private-stats-panel');
    var postsPanel = $('#if-posts-panel');
    var openPublic = $('#if-open-public-page');

    if (ctaPanel) ctaPanel.hidden = !introVisible;
    if (summaryPanel) summaryPanel.hidden = !summaryVisible;
    if (grid) grid.hidden = !(profileVisible || statsVisible);
    if (profilePanel) profilePanel.hidden = !profileVisible;
    if (statsPanel) statsPanel.hidden = !statsVisible;
    if (postsPanel) postsPanel.hidden = !postsVisible;
    if (openPublic){
      openPublic.hidden = !hasPublished;
      openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
    }

    if (summaryVisible) renderProfileSummary();
    if (profileVisible) renderProfileForm();
    if (statsVisible) renderStats();
    if (postsVisible) renderPostsList();
    if (!postsVisible) setEditorPanelVisibility(false);
    else setEditorPanelVisibility(state.editorOpen);
  }

  function openProfileForm(){
    state.profileFormOpen = true;
    renderProfileUi();
    var panel = $('#if-public-profile-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function togglePublishedProfileForm(){
    state.profileFormOpen = !state.profileFormOpen;
    renderProfileUi();
    if (state.profileFormOpen){
      var panel = $('#if-public-profile-panel');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function toggleStatsPanel(){
    state.statsPanelOpen = !state.statsPanelOpen;
    renderProfileUi();
    if (state.statsPanelOpen){
      var panel = $('#if-private-stats-panel');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function getPublishedProfilePreview(){
    if (state.profilePublishedRevision){
      return {
        display_name: state.profilePublishedRevision.display_name || (state.profile && state.profile.display_name) || state.affiliateSlug || 'Creator',
        bio: state.profilePublishedRevision.bio || '',
        avatar_path: state.profilePublishedRevision.avatar_path || ''
      };
    }
    if (state.profile){
      return {
        display_name: state.profile.display_name || state.affiliateSlug || 'Creator',
        bio: state.profile.bio || '',
        avatar_path: state.profile.avatar_path || ''
      };
    }
    return syncProfileSlug(state.profileDraft || emptyProfileDraft());
  }

  function renderProfileSummary(){
    var panel = $('#if-profile-summary-panel');
    if (!panel) return;
    var source = getPublishedProfilePreview();
    var avatar = $('#if-profile-summary-avatar');
    var name = $('#if-profile-summary-name');
    var bio = $('#if-profile-summary-bio');
    var editBtn = $('#if-open-profile-editor');
    var insightsBtn = $('#if-open-insights');
    var publicBtn = $('#if-open-summary-public-page');
    var displayName = String(source.display_name || state.affiliateSlug || 'Creator');
    if (avatar){
      avatar.innerHTML = source.avatar_path ? '<img class="if-profile-avatar if-profile-avatar--summary" src="' + I.escapeAttr(publicImageUrl('influencer-avatars', source.avatar_path)) + '" alt="' + I.escapeAttr(displayName) + '"/>' : '<div class="if-profile-avatar if-profile-avatar--placeholder if-profile-avatar--summary">' + I.escapeHtml(displayName.slice(0,1).toUpperCase()) + '</div>';
    }
    if (name) name.textContent = displayName;
    if (bio) bio.innerHTML = source.bio ? I.escapeHtml(source.bio).replace(/\n/g, '<br/>') : '&nbsp;';
    if (editBtn){
      editBtn.classList.toggle('is-active', !!state.profileFormOpen);
      editBtn.setAttribute('aria-expanded', state.profileFormOpen ? 'true' : 'false');
    }
    if (insightsBtn){
      insightsBtn.classList.toggle('is-active', !!state.statsPanelOpen);
      insightsBtn.setAttribute('aria-expanded', state.statsPanelOpen ? 'true' : 'false');
    }
    if (publicBtn){
      publicBtn.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
      publicBtn.hidden = !hasPublishedProfile();
    }
  }

  function widgetLocaleOptions(selected){
    var current = typeof I.getWidgetLocale === 'function' ? I.getWidgetLocale(selected || LANG) : String(selected || LANG || 'it');
    return Object.keys(WIDGET_LOCALE_LABELS).map(function(code){
      return '<option value="' + I.escapeAttr(code) + '"' + (code === current ? ' selected' : '') + '>' + I.escapeHtml(WIDGET_LOCALE_LABELS[code]) + '</option>';
    }).join('');
  }

  function getBlockWidgetLocale(index){
    var block = state.editorData && state.editorData.blocks ? state.editorData.blocks[index] : null;
    return typeof I.getWidgetLocale === 'function' ? I.getWidgetLocale(block && block.widgetLocale) : String(block && block.widgetLocale || LANG || 'it');
  }

  function closeAutocompleteMenu(menu, wrap){
    if (menu){ menu.hidden = true; menu.innerHTML = ''; }
    if (wrap) wrap.classList.remove('is-open');
  }

  function primeWidgetAutocompleteCatalog(){
    if (typeof I.ensureWidgetAutocompleteCatalog === 'function'){
      I.ensureWidgetAutocompleteCatalog().catch(function(err){ console.error(err); });
    }
  }

  function renderAutocompleteMenu(menu, wrap, input, items){
    if (!menu || !wrap){ return; }
    if (!items || !items.length){ closeAutocompleteMenu(menu, wrap); return; }
    menu.innerHTML = items.slice(0, 3).map(function(item, index){
      return '<button class="if-autocomplete__item" data-autocomplete-choice="' + index + '" type="button"><span class="if-autocomplete__primary">' + I.escapeHtml(item.label || item.value || '') + '</span></button>';
    }).join('');
    menu.hidden = false;
    wrap.classList.add('is-open');
    $all('[data-autocomplete-choice]', menu).forEach(function(btn){
      btn.addEventListener('mousedown', function(e){
        e.preventDefault();
        var idx = parseInt(btn.getAttribute('data-autocomplete-choice') || '-1', 10);
        var choice = items[idx];
        if (!choice) return;
        var value = String(choice.value || choice.label || '').trim();
        input.value = value;
        var blockIndex = parseInt(input.getAttribute('data-index') || '-1', 10);
        var field = input.getAttribute('data-block-field');
        if (blockIndex >= 0 && field && state.editorData && state.editorData.blocks && state.editorData.blocks[blockIndex]){
          state.editorData.blocks[blockIndex][field] = value;
          renderPostPreview();
        }
        closeAutocompleteMenu(menu, wrap);
      });
    });
  }

  function bindWidgetAutocomplete(){
    primeWidgetAutocompleteCatalog();
    $all('[data-autocomplete-kind]').forEach(function(input){
      if (input.__ifAutocompleteBound) return;
      input.__ifAutocompleteBound = true;
      var wrap = input.closest('.if-autocomplete');
      var menu = wrap ? $('.if-autocomplete__menu', wrap) : null;
      var requestSeq = 0;
      function updateMenu(){
        var term = String(input.value || '').trim();
        if (!term){ closeAutocompleteMenu(menu, wrap); return; }
        requestSeq += 1;
        var currentSeq = requestSeq;
        var blockIndex = parseInt(input.getAttribute('data-index') || '-1', 10);
        var kind = input.getAttribute('data-autocomplete-kind');
        var locale = getBlockWidgetLocale(blockIndex);
        var resolver = kind === 'airport' && typeof I.searchAirportSuggestions === 'function'
          ? I.searchAirportSuggestions(term, locale, 3)
          : (typeof I.ensureWidgetAutocompleteCatalog === 'function'
              ? I.ensureWidgetAutocompleteCatalog().then(function(){ return typeof I.searchStay22Destinations === 'function' ? I.searchStay22Destinations(term, locale, 3) : []; })
              : Promise.resolve(typeof I.searchStay22Destinations === 'function' ? I.searchStay22Destinations(term, locale, 3) : []));
        Promise.resolve(resolver).then(function(items){
          if (currentSeq !== requestSeq) return;
          renderAutocompleteMenu(menu, wrap, input, items || []);
        }).catch(function(err){
          console.error(err);
          if (currentSeq !== requestSeq) return;
          closeAutocompleteMenu(menu, wrap);
        });
      }
      input.addEventListener('input', updateMenu);
      input.addEventListener('focus', function(){ if (String(input.value || '').trim()) updateMenu(); });
      input.addEventListener('blur', function(){ window.setTimeout(function(){ closeAutocompleteMenu(menu, wrap); }, 140); });
      input.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeAutocompleteMenu(menu, wrap); });
    });
  }

  function renderApp(){
    if (!APP) return;
    APP.innerHTML = '' +
      '<div id="if-affiliate-login-required" hidden></div>' +
      '<div id="if-affiliate-app-shell" hidden>' +
        '<section class="auth-card if-panel if-creator-intro-panel" id="if-profile-cta-panel" hidden>' +
          '<p class="muted if-creator-intro-text">' + I.escapeHtml(L('creatorIntroText')) + '</p>' +
          '<div class="auth-actions if-center-actions"><button class="btn" id="if-create-profile-btn" type="button">' + I.escapeHtml(L('createProfile')) + '</button></div>' +
        '</section>' +
        '<section class="auth-card if-panel if-creator-summary" id="if-profile-summary-panel" hidden>' +
          '<div class="if-creator-summary__media" id="if-profile-summary-avatar"></div>' +
          '<div class="if-creator-summary__content">' +
            '<h2 class="if-creator-summary__name" id="if-profile-summary-name"></h2>' +
            '<p class="muted if-creator-summary__bio" id="if-profile-summary-bio"></p>' +
            '<div class="auth-actions if-creator-summary__actions">' +
              '<button class="btn secondary" id="if-open-profile-editor" type="button">' + I.escapeHtml(L('editProfile')) + '</button>' +
              '<button class="btn secondary" id="if-open-insights" type="button">' + I.escapeHtml(L('viewInsights')) + '</button>' +
              '<a class="btn secondary" id="if-open-summary-public-page" href="' + I.escapeAttr(I.buildPagePath('influencers-vlogs.html')) + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink()) + '" target="_blank" rel="noopener">' + I.escapeHtml(L('viewPublicPage')) + '</a>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<div class="if-creator-grid" id="if-creator-grid" hidden>' +
          '<section class="auth-card if-panel" id="if-public-profile-panel" hidden>' +
            '<div class="if-section-head"><div><h2>' + I.escapeHtml(L('publicProfile')) + '</h2></div><a class="btn secondary" hidden id="if-open-public-page" href="' + I.escapeAttr(I.buildPagePath('influencers-vlogs.html')) + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink()) + '" target="_blank" rel="noopener">' + I.escapeHtml(L('viewPublicPage')) + '</a></div>' +
            '<form class="auth-form" id="if-profile-form">' +
              '<div class="if-avatar-upload"><div id="if-avatar-preview"></div><div><label class="small muted">' + I.escapeHtml(L('avatar')) + '</label>' + makeFileControl('if-profile-avatar-input','if-profile-avatar-name') + '<p class="muted small">WEBP · max 8MB · output 400×400</p></div></div>' +
              '<div class="form-group"><label for="if-profile-display-name">' + I.escapeHtml(L('displayName')) + '</label><input id="if-profile-display-name" required type="text"/></div>' +
              '<div class="form-group"><label for="if-profile-bio">' + I.escapeHtml(L('bio')) + '</label><textarea id="if-profile-bio" rows="5"></textarea></div>' +
              '<div class="if-social-grid" id="if-social-grid"></div>' +
              '<div class="auth-actions if-center-actions"><button class="btn" id="if-profile-save" type="button">' + I.escapeHtml(L('saveProfile')) + '</button></div>' +
            '</form>' +
          '</section>' +
          '<section class="auth-card if-panel" id="if-private-stats-panel" hidden>' +
            '<div class="if-section-head"><div><h2>' + I.escapeHtml(L('privateStats')) + '</h2><p class="muted small">' + I.escapeHtml(L('creatorStatsHint')) + '</p></div></div>' +
            '<div class="if-stats-grid if-stats-grid--compact" id="if-private-stats"></div>' +
          '</section>' +
        '</div>' +
        '<section class="auth-card if-panel" id="if-posts-panel" hidden>' +
          '<div class="if-section-head"><div><h2>' + I.escapeHtml(L('myPosts')) + '</h2></div><button class="btn" id="if-new-post-btn" type="button">' + I.escapeHtml(L('startNewPost')) + '</button></div>' +
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
      '</div>' +
      '<div class="if-profile-popup" hidden id="if-profile-popup">' +
        '<div class="if-profile-popup__backdrop" data-popup-close="1"></div>' +
        '<div aria-modal="true" class="if-profile-popup__dialog" role="dialog">' +
          '<button aria-label="' + I.escapeAttr(t('close')) + '" class="if-profile-popup__close" id="if-profile-popup-close" type="button">×</button>' +
          '<div class="if-profile-popup__message" id="if-profile-popup-message"></div>' +
          '<div class="auth-actions if-center-actions"><button class="btn" id="if-profile-popup-ok" type="button">' + I.escapeHtml(L('popupOk')) + '</button></div>' +
        '</div>' +
      '</div>';

    bindStaticUi();
  }

  function bindStaticUi(){
    var openPublic = $('#if-open-public-page');
    if (openPublic){
      openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
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
    primeWidgetAutocompleteCatalog();

    $all('[data-file-trigger]').forEach(function(btn){
      if (btn.__bound) return;
      btn.__bound = true;
      btn.addEventListener('click', function(){
        var input = document.getElementById(btn.getAttribute('data-file-trigger'));
        if (input) input.click();
      });
    });

    var popup = $('#if-profile-popup');
    if (popup && !popup.__bound){
      popup.__bound = true;
      popup.addEventListener('click', function(e){
        if (e.target && e.target.getAttribute('data-popup-close') === '1') hideProfilePopup();
      });
    }
    var popupClose = $('#if-profile-popup-close');
    if (popupClose && !popupClose.__bound){
      popupClose.__bound = true;
      popupClose.addEventListener('click', hideProfilePopup);
    }
    var popupOk = $('#if-profile-popup-ok');
    if (popupOk && !popupOk.__bound){
      popupOk.__bound = true;
      popupOk.addEventListener('click', hideProfilePopup);
    }
    if (!document.body.__ifProfilePopupEscBound){
      document.body.__ifProfilePopupEscBound = true;
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') hideProfilePopup();
      });
    }

    var createProfileBtn = $('#if-create-profile-btn');
    if (createProfileBtn && !createProfileBtn.__bound){
      createProfileBtn.__bound = true;
      createProfileBtn.addEventListener('click', function(){
        if (hasPendingInitialProfileReview()){
          showProfilePopup(L('profileAlreadyPendingPopup'));
          return;
        }
        openProfileForm();
      });
    }

    var openProfileEditor = $('#if-open-profile-editor');
    if (openProfileEditor && !openProfileEditor.__bound){
      openProfileEditor.__bound = true;
      openProfileEditor.addEventListener('click', function(){
        togglePublishedProfileForm();
      });
    }

    var openInsights = $('#if-open-insights');
    if (openInsights && !openInsights.__bound){
      openInsights.__bound = true;
      openInsights.addEventListener('click', function(){
        toggleStatsPanel();
      });
    }

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
        var currentForm = captureProfileFormState();
        currentForm.display_name = profileName.value || state.affiliateSlug || 'creator';
        var synced = syncProfileSlug(currentForm);
        state.profileDraft = Object.assign({}, state.profileDraft || {}, synced);
        var openPublicLink = $('#if-open-public-page');
        if (openPublicLink) openPublicLink.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
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
          var currentDraft = captureProfileFormState();
          currentDraft.avatar_path = upload.path;
          state.profileDraft = syncProfileSlug(currentDraft);
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

    var profileSave = $('#if-profile-save');
    if (profileSave && !profileSave.__bound) {
      profileSave.__bound = true;
      profileSave.addEventListener('click', function(){ saveProfile(); });
    }
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
    if (openPublic){
      openPublic.hidden = !hasPublishedProfile();
      openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
    }
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
    if (state.postPreviewVisible && typeof I.hydrateWidgetEmbeds === 'function'){
      I.hydrateWidgetEmbeds(el);
    }
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
          '<div class="form-row-3"><div class="form-group"><label>Title</label><input type="text" value="' + I.escapeAttr(block.title || '') + '" data-block-field="title" data-index="' + index + '"/></div><div class="form-group"><label>CTA</label><input type="text" value="' + I.escapeAttr(block.ctaLabel || '') + '" data-block-field="ctaLabel" data-index="' + index + '"/></div><div class="form-group"><label>Widget language</label><select data-block-field="widgetLocale" data-index="' + index + '">' + widgetLocaleOptions(block.widgetLocale || LANG) + '</select></div></div>' +
          '<div class="form-group"><label>Address / destination</label><div class="if-autocomplete"><input autocomplete="off" placeholder="Type a city or destination" type="text" value="' + I.escapeAttr(block.destination || '') + '" data-autocomplete-kind="stay22" data-block-field="destination" data-index="' + index + '"/><div class="if-autocomplete__menu" hidden></div></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Check-in</label><input type="date" value="' + I.escapeAttr(block.checkin || '') + '" data-block-field="checkin" data-index="' + index + '"/></div><div class="form-group"><label>Check-out</label><input type="date" value="' + I.escapeAttr(block.checkout || '') + '" data-block-field="checkout" data-index="' + index + '"/></div></div>' +
          '<div class="form-group"><label>Description</label><textarea rows="3" data-block-field="description" data-index="' + index + '">' + I.escapeHtml(block.description || '') + '</textarea></div>';
      } else if (block.type === 'aviasales'){
        body = '' +
          '<div class="form-row-3"><div class="form-group"><label>Title</label><input type="text" value="' + I.escapeAttr(block.title || '') + '" data-block-field="title" data-index="' + index + '"/></div><div class="form-group"><label>CTA</label><input type="text" value="' + I.escapeAttr(block.ctaLabel || '') + '" data-block-field="ctaLabel" data-index="' + index + '"/></div><div class="form-group"><label>Widget language</label><select data-block-field="widgetLocale" data-index="' + index + '">' + widgetLocaleOptions(block.widgetLocale || LANG) + '</select></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Origin airport / city</label><div class="if-autocomplete"><input autocomplete="off" placeholder="Type a city, airport or IATA code" type="text" value="' + I.escapeAttr(block.origin || '') + '" data-autocomplete-kind="airport" data-block-field="origin" data-index="' + index + '"/><div class="if-autocomplete__menu" hidden></div></div></div><div class="form-group"><label>Destination airport / city</label><div class="if-autocomplete"><input autocomplete="off" placeholder="Type a city, airport or IATA code" type="text" value="' + I.escapeAttr(block.destination || '') + '" data-autocomplete-kind="airport" data-block-field="destination" data-index="' + index + '"/><div class="if-autocomplete__menu" hidden></div></div></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>Depart date</label><input type="date" value="' + I.escapeAttr(block.checkin || '') + '" data-block-field="checkin" data-index="' + index + '"/></div><div class="form-group"><label>Return date</label><input type="date" value="' + I.escapeAttr(block.returnDate || '') + '" data-block-field="returnDate" data-index="' + index + '"/></div></div>' +
          '<div class="form-group"><label>Description</label><textarea rows="3" data-block-field="description" data-index="' + index + '">' + I.escapeHtml(block.description || '') + '</textarea></div>';
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
    bindWidgetAutocomplete();
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

  function captureProfileFormState(){
    var draft = syncProfileSlug({
      display_name: String((($('#if-profile-display-name') || {}).value || (state.profileDraft && state.profileDraft.display_name) || state.affiliateSlug || '')).trim(),
      bio: String((($('#if-profile-bio') || {}).value || (state.profileDraft && state.profileDraft.bio) || '')).trim(),
      avatar_path: (state.profileDraft && state.profileDraft.avatar_path) || '',
      social_links: {}
    });
    Object.keys(I.SOCIALS).forEach(function(platform){
      var input = $('#if-social-' + platform);
      var raw = String((input || {}).value || ((state.profileDraft && state.profileDraft.social_links && state.profileDraft.social_links[platform]) || '')).trim();
      if (raw) draft.social_links[platform] = raw;
    });
    return draft;
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

  async function saveProfile(){
    if (!state.client) return;
    try{
      var currentForm = canonicalizeProfileDraft(readProfileForm());
      var baseline = canonicalizeProfileDraft(state.profileBaseline || state.profileDraft || emptyProfileDraft());
      if (JSON.stringify(currentForm) === JSON.stringify(baseline)){
        notify(L('profileNoChangesError'), 'error');
        return;
      }

      var draft = syncProfileSlug(currentForm);
      draft.public_slug = await ensureUniqueProfileSlug(draft.public_slug || draft.display_name, state.profile ? state.profile.id : null);
      state.profileDraft = draft;
      var base = await ensureProfileBase(draft);
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
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
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
        status: base.current_published_revision_id ? 'published' : 'pending_review',
        review_notes: null,
        updated_at: new Date().toISOString()
      };
      if (!base.current_published_revision_id){
        baseUpdate.display_name = draft.display_name;
        baseUpdate.public_slug = draft.public_slug;
        baseUpdate.bio = draft.bio || null;
        baseUpdate.avatar_path = draft.avatar_path || null;
        baseUpdate.social_links = draft.social_links || {};
      }
      var baseResp = await state.client.from('influencer_profiles').update(baseUpdate).eq('id', base.id).select('*').single();
      if (baseResp && baseResp.error) throw baseResp.error;
      state.profile = baseResp.data;
      state.profilePendingRevision = revision;
      state.profileFormOpen = false;
      state.statsPanelOpen = false;
      await loadDashboardData();
      showProfilePopup(L('profileReviewPopup'));
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
    state.profileBaseline = canonicalizeProfileDraft(state.profileDraft);
    if (!hasPublishedProfile() && hasPendingInitialProfileReview()) state.profileFormOpen = false;
    if (!hasPublishedProfile()) state.statsPanelOpen = false;

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

    renderProfileUi();
    if (state.editorOpen && hasPublishedProfile()) renderEditor();
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
    state.profileFormOpen = false;
    state.statsPanelOpen = false;
    await loadDashboardData();
    if (!state.currentPost) resetEditor(false);
  }

  init();
})();
