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
      continueEditing: 'Continua a modificare',
      confirmSave: 'Salva',
      profileSaveConfirm: 'Stai per inviare il profilo in revisione. Controlla che le informazioni siano complete: la revisione potrebbe richiedere fino a 48 ore lavorative. Vuoi procedere?',
      postSaveConfirm: 'Stai per inviare il post in revisione. Controlla che titolo, contenuti e widget siano completi: la revisione potrebbe richiedere fino a 48 ore lavorative. Vuoi procedere?',
      creatorStatsHint: 'Queste statistiche sono private e visibili solo a te.',
      creatorIntroText: 'Il profilo creator ti permette di comparire pubblicamente nella sezione Vlog degli influencer di Travirae. Dopo l’approvazione admin potrai gestire anche i tuoi post e le tue statistiche private.',
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
      savePost: 'Salva',
      postNoChangesError: 'Errore: non è stata apportata neancora nessuna modifica al post.',
      postReviewPopup: 'Le modifiche inviate al post sono attualmente in fase di revisione. L’elaborazione potrebbe richiedere fino a 48 ore lavorative.',
      showPreview: 'Mostra anteprima',
      hidePreview: 'Nascondi anteprima',
      exitComposerConfirm: 'Sei sicuro di voler uscire senza salvare?',
      cancelClose: 'Annulla',
      exitWithoutSaving: 'Esci senza salvare',
      saveAndExit: 'Salva ed esci'
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
      continueEditing: 'Continue editing',
      confirmSave: 'Save',
      profileSaveConfirm: 'You are about to send this profile for review. Make sure the information is complete: the review may take up to 48 working hours. Do you want to continue?',
      postSaveConfirm: 'You are about to send this post for review. Make sure title, content and widgets are complete: the review may take up to 48 working hours. Do you want to continue?',
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
      savePost: 'Save',
      postNoChangesError: 'Error: no post changes have been made yet.',
      postReviewPopup: 'The submitted post changes are currently under review. Processing may take up to 48 working hours.',
      showPreview: 'Show preview',
      hidePreview: 'Hide preview',
      exitComposerConfirm: 'Are you sure you want to exit without saving?',
      cancelClose: 'Cancel',
      exitWithoutSaving: 'Exit without saving',
      saveAndExit: 'Save and exit'
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
      creatorIntroText: 'Mit deinem Creator-Profil erscheinst du öffentlich im Bereich Travirae Influencer-Vlogs. Nach der Admin-Freigabe kannst du auch deine Beiträge und privaten Statistiken verwalten.',
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
      savePost: 'Speichern',
      postNoChangesError: 'Fehler: Am Beitrag wurden noch keine Änderungen vorgenommen.',
      postReviewPopup: 'Die gesendeten Änderungen am Beitrag werden derzeit geprüft. Die Bearbeitung kann bis zu 48 Arbeitsstunden dauern.',
      showPreview: 'Vorschau anzeigen',
      hidePreview: 'Vorschau ausblenden',
      exitComposerConfirm: 'Möchtest du wirklich ohne Speichern schließen?',
      cancelClose: 'Abbrechen',
      exitWithoutSaving: 'Ohne Speichern schließen',
      saveAndExit: 'Speichern und schließen'
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
      creatorIntroText: 'Tu perfil de creador te permite aparecer públicamente en la sección Vlogs de influencers de Travirae. Tras la aprobación del admin también podrás gestionar tus posts y estadísticas privadas.',
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
      savePost: 'Guardar',
      postNoChangesError: 'Error: todavía no se ha realizado ningún cambio en el post.',
      postReviewPopup: 'Los cambios enviados al post están actualmente en revisión. El procesamiento puede tardar hasta 48 horas laborables.',
      showPreview: 'Mostrar vista previa',
      hidePreview: 'Ocultar vista previa',
      exitComposerConfirm: '¿Seguro que quieres salir sin guardar?',
      cancelClose: 'Cancelar',
      exitWithoutSaving: 'Salir sin guardar',
      saveAndExit: 'Guardar y salir'
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
      creatorIntroText: 'Ton profil créateur te permet d’apparaître publiquement dans la section Vlogs d’influenceurs de Travirae. Après validation admin, tu pourras aussi gérer tes posts et tes statistiques privées.',
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
      savePost: 'Enregistrer',
      postNoChangesError: 'Erreur : aucune modification n’a encore été apportée au post.',
      postReviewPopup: 'Les modifications envoyées pour le post sont actuellement en cours de révision. Le traitement peut prendre jusqu’à 48 heures ouvrées.',
      showPreview: 'Afficher l’aperçu',
      hidePreview: 'Masquer l’aperçu',
      exitComposerConfirm: 'Voulez-vous vraiment quitter sans enregistrer ?',
      cancelClose: 'Annuler',
      exitWithoutSaving: 'Quitter sans enregistrer',
      saveAndExit: 'Enregistrer et quitter'
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
      creatorIntroText: 'Met je creator-profiel verschijn je openbaar in de sectie Influencer-vlogs van Travirae. Na goedkeuring door de admin kun je ook je posts en privéstatistieken beheren.',
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
      savePost: 'Opslaan',
      postNoChangesError: 'Fout: er zijn nog geen wijzigingen aan de post aangebracht.',
      postReviewPopup: 'De ingediende wijzigingen aan de post worden momenteel beoordeeld. Dit kan tot 48 werkuren duren.',
      showPreview: 'Voorbeeld tonen',
      hidePreview: 'Voorbeeld verbergen',
      exitComposerConfirm: 'Weet je zeker dat je wilt afsluiten zonder op te slaan?',
      cancelClose: 'Annuleren',
      exitWithoutSaving: 'Afsluiten zonder opslaan',
      saveAndExit: 'Opslaan en afsluiten'
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
      creatorIntroText: 'Профиль автора позволяет вам публично отображаться в разделе «Влоги инфлюенсеров» на Travirae. После одобрения администратором вы также сможете управлять своими постами и личной статистикой.',
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
      savePost: 'Сохранить',
      postNoChangesError: 'Ошибка: в пост ещё не было внесено никаких изменений.',
      postReviewPopup: 'Отправленные изменения поста сейчас находятся на проверке. Обработка может занять до 48 рабочих часов.',
      showPreview: 'Показать предпросмотр',
      hidePreview: 'Скрыть предпросмотр',
      exitComposerConfirm: 'Вы уверены, что хотите выйти без сохранения?',
      cancelClose: 'Отмена',
      exitWithoutSaving: 'Выйти без сохранения',
      saveAndExit: 'Сохранить и выйти'
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
      creatorIntroText: 'يتيح لك ملف المنشئ الظهور بشكل عام في قسم مدونات المؤثرين على Travirae. بعد موافقة المشرف ستتمكن أيضاً من إدارة مقالاتك وإحصاءاتك الخاصة.',
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
      savePost: 'حفظ',
      postNoChangesError: 'خطأ: لم يتم إجراء أي تعديل على المنشور بعد.',
      postReviewPopup: 'التعديلات المرسلة على المنشور قيد المراجعة حالياً. قد تستغرق المعالجة حتى 48 ساعة عمل.',
      showPreview: 'إظهار المعاينة',
      hidePreview: 'إخفاء المعاينة',
      exitComposerConfirm: 'هل أنت متأكد أنك تريد الخروج بدون حفظ؟',
      cancelClose: 'إلغاء',
      exitWithoutSaving: 'الخروج بدون حفظ',
      saveAndExit: 'حفظ والخروج'
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
      creatorIntroText: '你的创作者资料可以让你公开出现在 Travirae 的达人旅行日志 板块中。管理员批准后，你还可以管理自己的文章和私人统计数据。',
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
      savePost: '保存',
      postNoChangesError: '错误：文章尚未进行任何修改。',
      postReviewPopup: '你提交的文章修改目前正在审核中，处理时间最多可能需要 48 个工作小时。',
      showPreview: '显示预览',
      hidePreview: '隐藏预览',
      exitComposerConfirm: '确定要在不保存的情况下退出吗？',
      cancelClose: '取消',
      exitWithoutSaving: '不保存退出',
      saveAndExit: '保存并退出'
    }
  };

  var EXTRA_TEXT = {
    it: {
      addBlock: 'Aggiungi',
      noBlocksTitle: 'Nessun elemento ancora',
      noBlocksBody: 'Clicca “Aggiungi” per inserire testi, immagini, mappe e widget nel post.',
      fieldLevel: 'Livello',
      fieldText: 'Testo',
      fieldItems: 'Elementi (uno per riga)',
      fieldUpload: 'Upload',
      fieldCaption: 'Didascalia',
      fieldSize: 'Dimensione',
      sizeSmall: 'Piccola',
      sizeMedium: 'Media',
      sizeFull: 'Intera larghezza',
      fieldAlign: 'Allineamento',
      sizeLarge: 'Grande',
      alignLeft: 'Sinistra',
      alignCenter: 'Centro',
      alignRight: 'Destra',
      fieldBlockTitle: 'Titolo',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Lingua widget',
      fieldDestination: 'Indirizzo / destinazione',
      fieldOrigin: 'Partenza aeroporto / città',
      fieldDestinationAirport: 'Destinazione aeroporto / città',
      fieldCheckin: 'Check-in',
      fieldCheckout: 'Check-out',
      fieldDepartDate: 'Data partenza',
      fieldReturnDate: 'Data ritorno',
      fieldDescription: 'Descrizione',
      placeholderDestination: 'Scrivi una città, destinazione o hotel',
      placeholderAirport: 'Scrivi città, aeroporto o codice IATA',
      imageHelp: 'lato lungo max ~2000px'
    },
    en: {
      addBlock: 'Add',
      noBlocksTitle: 'No content yet',
      noBlocksBody: 'Click “Add” to insert text, images, maps and widgets into the post.',
      fieldLevel: 'Level',
      fieldText: 'Text',
      fieldItems: 'Items (one per line)',
      fieldUpload: 'Upload',
      fieldCaption: 'Caption',
      fieldSize: 'Size',
      sizeSmall: 'Small',
      sizeMedium: 'Medium',
      sizeFull: 'Full width',
      fieldAlign: 'Alignment',
      sizeLarge: 'Large',
      alignLeft: 'Left',
      alignCenter: 'Center',
      alignRight: 'Right',
      fieldBlockTitle: 'Title',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Widget language',
      fieldDestination: 'Address / destination',
      fieldOrigin: 'Origin airport / city',
      fieldDestinationAirport: 'Destination airport / city',
      fieldCheckin: 'Check-in',
      fieldCheckout: 'Check-out',
      fieldDepartDate: 'Depart date',
      fieldReturnDate: 'Return date',
      fieldDescription: 'Description',
      placeholderDestination: 'Type a city, destination or hotel',
      placeholderAirport: 'Type a city, airport or IATA code',
      imageHelp: 'max long side ~2000px'
    },
    de: {
      addBlock: 'Hinzufügen',
      noBlocksTitle: 'Noch kein Inhalt',
      noBlocksBody: 'Klicke auf „Hinzufügen“, um Text, Bilder, Karten und Widgets in den Beitrag einzufügen.',
      fieldLevel: 'Ebene',
      fieldText: 'Text',
      fieldItems: 'Elemente (eine pro Zeile)',
      fieldUpload: 'Upload',
      fieldCaption: 'Bildunterschrift',
      fieldSize: 'Größe',
      sizeSmall: 'Klein',
      sizeMedium: 'Mittel',
      sizeFull: 'Volle Breite',
      fieldAlign: 'Ausrichtung',
      sizeLarge: 'Groß',
      alignLeft: 'Links',
      alignCenter: 'Zentriert',
      alignRight: 'Rechts',
      fieldAlign: 'Uitlijning',
      sizeLarge: 'Groot',
      alignLeft: 'Links',
      alignCenter: 'Midden',
      alignRight: 'Rechts',
      fieldBlockTitle: 'Titel',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Widget-Sprache',
      fieldDestination: 'Adresse / Ziel',
      fieldOrigin: 'Abflughafen / Stadt',
      fieldDestinationAirport: 'Zielflughafen / Stadt',
      fieldCheckin: 'Check-in',
      fieldCheckout: 'Check-out',
      fieldDepartDate: 'Abflugdatum',
      fieldReturnDate: 'Rückflugdatum',
      fieldDescription: 'Beschreibung',
      placeholderDestination: 'Stadt, Reiseziel oder Hotel eingeben',
      placeholderAirport: 'Stadt, Flughafen oder IATA-Code eingeben',
      imageHelp: 'max. lange Seite ~2000px'
    },
    es: {
      addBlock: 'Añadir',
      noBlocksTitle: 'Todavía no hay contenido',
      noBlocksBody: 'Haz clic en “Añadir” para insertar texto, imágenes, mapas y widgets en el post.',
      fieldLevel: 'Nivel',
      fieldText: 'Texto',
      fieldItems: 'Elementos (uno por línea)',
      fieldUpload: 'Subida',
      fieldCaption: 'Pie de foto',
      fieldSize: 'Tamaño',
      sizeSmall: 'Pequeño',
      sizeMedium: 'Mediano',
      sizeFull: 'Ancho completo',
      fieldAlign: 'Alineación',
      sizeLarge: 'Grande',
      alignLeft: 'Izquierda',
      alignCenter: 'Centro',
      alignRight: 'Derecha',
      fieldBlockTitle: 'Título',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Idioma del widget',
      fieldDestination: 'Dirección / destino',
      fieldOrigin: 'Aeropuerto / ciudad de origen',
      fieldDestinationAirport: 'Aeropuerto / ciudad de destino',
      fieldCheckin: 'Check-in',
      fieldCheckout: 'Check-out',
      fieldDepartDate: 'Fecha de salida',
      fieldReturnDate: 'Fecha de regreso',
      fieldDescription: 'Descripción',
      placeholderDestination: 'Escribe una ciudad, destino u hotel',
      placeholderAirport: 'Escribe ciudad, aeropuerto o código IATA',
      imageHelp: 'lado largo máx. ~2000px'
    },
    fr: {
      addBlock: 'Ajouter',
      noBlocksTitle: 'Aucun contenu pour le moment',
      noBlocksBody: 'Clique sur « Ajouter » pour insérer du texte, des images, des cartes et des widgets dans le post.',
      fieldLevel: 'Niveau',
      fieldText: 'Texte',
      fieldItems: 'Éléments (un par ligne)',
      fieldUpload: 'Téléversement',
      fieldCaption: 'Légende',
      fieldSize: 'Taille',
      sizeSmall: 'Petite',
      sizeMedium: 'Moyenne',
      sizeFull: 'Pleine largeur',
      fieldAlign: 'Alignement',
      sizeLarge: 'Grande',
      alignLeft: 'Gauche',
      alignCenter: 'Centre',
      alignRight: 'Droite',
      fieldBlockTitle: 'Titre',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Langue du widget',
      fieldDestination: 'Adresse / destination',
      fieldOrigin: 'Aéroport / ville de départ',
      fieldDestinationAirport: 'Aéroport / ville de destination',
      fieldCheckin: 'Check-in',
      fieldCheckout: 'Check-out',
      fieldDepartDate: 'Date de départ',
      fieldReturnDate: 'Date de retour',
      fieldDescription: 'Description',
      placeholderDestination: 'Saisis une ville, une destination ou un hôtel',
      placeholderAirport: 'Saisis une ville, un aéroport ou un code IATA',
      imageHelp: 'côté long max. ~2000px'
    },
    nl: {
      addBlock: 'Toevoegen',
      noBlocksTitle: 'Nog geen inhoud',
      noBlocksBody: 'Klik op “Toevoegen” om tekst, afbeeldingen, kaarten en widgets aan de post toe te voegen.',
      fieldLevel: 'Niveau',
      fieldText: 'Tekst',
      fieldItems: 'Items (één per regel)',
      fieldUpload: 'Upload',
      fieldCaption: 'Bijschrift',
      fieldSize: 'Grootte',
      sizeSmall: 'Klein',
      sizeMedium: 'Middel',
      sizeFull: 'Volledige breedte',
      fieldAlign: 'Ausrichtung',
      sizeLarge: 'Groß',
      alignLeft: 'Links',
      alignCenter: 'Zentriert',
      alignRight: 'Rechts',
      fieldAlign: 'Uitlijning',
      sizeLarge: 'Groot',
      alignLeft: 'Links',
      alignCenter: 'Midden',
      alignRight: 'Rechts',
      fieldBlockTitle: 'Titel',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Widgettaal',
      fieldDestination: 'Adres / bestemming',
      fieldOrigin: 'Vertrekluchthaven / stad',
      fieldDestinationAirport: 'Bestemmingsluchthaven / stad',
      fieldCheckin: 'Check-in',
      fieldCheckout: 'Check-out',
      fieldDepartDate: 'Vertrekdatum',
      fieldReturnDate: 'Retourdatum',
      fieldDescription: 'Beschrijving',
      placeholderDestination: 'Typ een stad, bestemming of hotel',
      placeholderAirport: 'Typ een stad, luchthaven of IATA-code',
      imageHelp: 'max. lange zijde ~2000px'
    },
    ru: {
      addBlock: 'Добавить',
      noBlocksTitle: 'Контента пока нет',
      noBlocksBody: 'Нажмите «Добавить», чтобы вставить текст, изображения, карты и виджеты в пост.',
      fieldLevel: 'Уровень',
      fieldText: 'Текст',
      fieldItems: 'Элементы (по одному в строке)',
      fieldUpload: 'Загрузка',
      fieldCaption: 'Подпись',
      fieldSize: 'Размер',
      sizeSmall: 'Маленький',
      sizeMedium: 'Средний',
      sizeFull: 'Во всю ширину',
      fieldAlign: 'Выравнивание',
      sizeLarge: 'Большой',
      alignLeft: 'Слева',
      alignCenter: 'По центру',
      alignRight: 'Справа',
      fieldBlockTitle: 'Заголовок',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'Язык виджета',
      fieldDestination: 'Адрес / направление',
      fieldOrigin: 'Аэропорт / город вылета',
      fieldDestinationAirport: 'Аэропорт / город назначения',
      fieldCheckin: 'Заезд',
      fieldCheckout: 'Выезд',
      fieldDepartDate: 'Дата вылета',
      fieldReturnDate: 'Дата возврата',
      fieldDescription: 'Описание',
      placeholderDestination: 'Введите город, направление или отель',
      placeholderAirport: 'Введите город, аэропорт или IATA-код',
      imageHelp: 'макс. длинная сторона ~2000px'
    },
    ar: {
      addBlock: 'إضافة',
      noBlocksTitle: 'لا يوجد محتوى بعد',
      noBlocksBody: 'اضغط على «إضافة» لإدراج نصوص وصور وخرائط وويدجت داخل المنشور.',
      fieldLevel: 'المستوى',
      fieldText: 'النص',
      fieldItems: 'العناصر (عنصر واحد في كل سطر)',
      fieldUpload: 'رفع',
      fieldCaption: 'التسمية',
      fieldSize: 'الحجم',
      sizeSmall: 'صغير',
      sizeMedium: 'متوسط',
      sizeFull: 'بعرض كامل',
      fieldAlign: 'المحاذاة',
      sizeLarge: 'كبير',
      alignLeft: 'يسار',
      alignCenter: 'وسط',
      alignRight: 'يمين',
      fieldBlockTitle: 'العنوان',
      fieldCta: 'CTA',
      fieldWidgetLanguage: 'لغة الويدجت',
      fieldDestination: 'العنوان / الوجهة',
      fieldOrigin: 'مدينة / مطار الانطلاق',
      fieldDestinationAirport: 'مدينة / مطار الوصول',
      fieldCheckin: 'تسجيل الوصول',
      fieldCheckout: 'تسجيل المغادرة',
      fieldDepartDate: 'تاريخ المغادرة',
      fieldReturnDate: 'تاريخ العودة',
      fieldDescription: 'الوصف',
      placeholderDestination: 'اكتب مدينة أو وجهة أو فندقًا',
      placeholderAirport: 'اكتب مدينة أو مطارًا أو رمز IATA',
      imageHelp: 'الضلع الأطول الأقصى ~2000px'
    },
    zh: {
      addBlock: '添加',
      noBlocksTitle: '还没有内容',
      noBlocksBody: '点击“添加”即可向文章中插入文字、图片、地图和小组件。',
      fieldLevel: '级别',
      fieldText: '文本',
      fieldItems: '项目（每行一个）',
      fieldUpload: '上传',
      fieldCaption: '图片说明',
      fieldSize: '尺寸',
      fieldAlign: '对齐',
      sizeSmall: '小',
      sizeMedium: '中',
      sizeLarge: '大',
      sizeFull: '全宽',
      alignLeft: '左侧',
      alignCenter: '居中',
      alignRight: '右侧',
      fieldBlockTitle: '标题',
      fieldCta: 'CTA',
      fieldWidgetLanguage: '小组件语言',
      fieldDestination: '地址 / 目的地',
      fieldOrigin: '出发机场 / 城市',
      fieldDestinationAirport: '到达机场 / 城市',
      fieldCheckin: '入住',
      fieldCheckout: '退房',
      fieldDepartDate: '出发日期',
      fieldReturnDate: '返程日期',
      fieldDescription: '描述',
      placeholderDestination: '输入城市、目的地或酒店',
      placeholderAirport: '输入城市、机场或 IATA 代码',
      imageHelp: '最长边约 2000px 以内'
    }
  };
  Object.keys(EXTRA_TEXT).forEach(function(lang){
    TEXT[lang] = Object.assign({}, TEXT[lang] || {}, EXTRA_TEXT[lang]);
  });

  var POPUP_TEXT = {
    it: {
      deletePostConfirm: 'Sei sicuro di voler eliminare questo post?',
      popupYes: 'Sì',
      popupNo: 'No'
    },
    en: {
      deletePostConfirm: 'Are you sure you want to delete this post?',
      popupYes: 'Yes',
      popupNo: 'No'
    },
    de: {
      deletePostConfirm: 'Möchtest du diesen Beitrag wirklich löschen?',
      popupYes: 'Ja',
      popupNo: 'Nein'
    },
    es: {
      deletePostConfirm: '¿Seguro que quieres eliminar este post?',
      popupYes: 'Sí',
      popupNo: 'No'
    },
    fr: {
      deletePostConfirm: 'Voulez-vous vraiment supprimer ce post ?',
      popupYes: 'Oui',
      popupNo: 'Non'
    },
    nl: {
      deletePostConfirm: 'Weet je zeker dat je dit bericht wilt verwijderen?',
      popupYes: 'Ja',
      popupNo: 'Nee'
    },
    ru: {
      deletePostConfirm: 'Вы уверены, что хотите удалить этот пост?',
      popupYes: 'Да',
      popupNo: 'Нет'
    },
    ar: {
      deletePostConfirm: 'هل أنت متأكد أنك تريد حذف هذا المنشور؟',
      popupYes: 'نعم',
      popupNo: 'لا'
    },
    zh: {
      deletePostConfirm: '确定要删除这篇文章吗？',
      popupYes: '是',
      popupNo: '否'
    }
  };
  Object.keys(POPUP_TEXT).forEach(function(lang){
    TEXT[lang] = Object.assign({}, TEXT[lang] || {}, POPUP_TEXT[lang]);
  });

  var PROFILE_TEXT_FIXES_V51 = {
    de: {
      composer: 'Beitrags-Editor',
      emptyEditor: 'Verwende nur kontrollierte Blöcke: Überschrift, Absatz, Bild, Liste, Zitat, Hinweis, Trenner, Hotelkarte und Flug-Widget.',
      creatorIntroText: 'Mit deinem Creator-Profil erscheinst du öffentlich im Bereich Influencer-Vlogs von Travirae. Nach der Admin-Freigabe kannst du auch deine Beiträge und privaten Statistiken verwalten.'
    },
    es: {
      privateStats: 'Estadísticas privadas del creador',
      composer: 'Editor del post',
      emptyEditor: 'Usa solo bloques controlados: título, párrafo, imagen, lista, cita, aviso, separador, mapa de hoteles y widget de vuelos.',
      creatorIntroText: 'Tu perfil de creador te permite aparecer públicamente en la sección Vlogs de influencers de Travirae. Tras la aprobación del admin también podrás gestionar tus posts y estadísticas privadas.'
    },
    fr: {
      privateStats: 'Statistiques privées du créateur',
      composer: 'Éditeur du post',
      emptyEditor: 'Utilise uniquement des blocs contrôlés : titre, paragraphe, image, liste, citation, encadré, séparateur, carte hôtels et widget vols.',
      creatorIntroText: 'Ton profil créateur te permet d’apparaître publiquement dans la section Vlogs d’influenceurs de Travirae. Après validation admin, tu pourras aussi gérer tes posts et tes statistiques privées.'
    },
    nl: {
      composer: 'Post-editor',
      emptyEditor: 'Gebruik alleen gecontroleerde blokken: titel, alinea, afbeelding, lijst, citaat, kader, scheiding, hotelkaart en vluchten-widget.',
      creatorIntroText: 'Met je creatorprofiel verschijn je openbaar in de sectie Influencer-vlogs van Travirae. Na goedkeuring door de admin kun je ook je posts en privéstatistieken beheren.'
    },
    ru: {
      privateStats: 'Приватная статистика автора',
      composer: 'Редактор поста',
      emptyEditor: 'Используйте только управляемые блоки: заголовок, абзац, изображение, список, цитата, заметка, разделитель, карта отелей и виджет авиабилетов.',
      creatorIntroText: 'Ваш профиль автора позволяет вам публично отображаться в разделе «Влоги инфлюенсеров» Travirae. После одобрения администратором вы также сможете управлять своими постами и личной статистикой.'
    },
    ar: {
      privateStats: 'إحصاءات صانع المحتوى الخاصة',
      composer: 'محرر المنشور',
      emptyEditor: 'استخدم فقط الكتل المسموح بها: عنوان، فقرة، صورة، قائمة، اقتباس، تنبيه، فاصل، خريطة الفنادق وأداة الرحلات.',
      creatorIntroText: 'يتيح لك ملف صانع المحتوى الظهور بشكل عام في قسم مدونات المؤثرين في Travirae. بعد موافقة المشرف ستتمكن أيضاً من إدارة منشوراتك وإحصاءاتك الخاصة.'
    },
    zh: {
      privateStats: '创作者私人统计',
      composer: '文章编辑器',
      emptyEditor: '仅使用受控区块：标题、段落、图片、列表、引用、提示框、分隔线、酒店地图和航班小组件。',
      creatorIntroText: '你的创作者资料可以让你公开出现在 Travirae 的达人旅行日志板块中。管理员批准后，你还可以管理自己的文章和私人统计数据。'
    }
  };
  Object.keys(PROFILE_TEXT_FIXES_V51).forEach(function(lang){
    TEXT[lang] = Object.assign({}, TEXT[lang] || {}, PROFILE_TEXT_FIXES_V51[lang]);
  });

  var CREATOR_METRIC_LABEL_FIXES_V2 = {
    it: { postOpens: 'Aperture post', widgetClicks: 'Click widget outbound', bookingConfirmed: 'Vendite confermate dai tuoi post', creatorStatsHint: 'Queste statistiche sono private, visibili solo a te e rappresentano totali storici.' },
    en: { postOpens: 'Post opens', widgetClicks: 'Outbound widget clicks', bookingConfirmed: 'Confirmed sales from your posts', creatorStatsHint: 'These statistics are private, visible only to you, and shown as lifetime totals.' },
    de: { postOpens: 'Post-Öffnungen', widgetClicks: 'Outbound-Widget-Klicks', bookingConfirmed: 'Bestätigte Verkäufe aus deinen Posts', creatorStatsHint: 'Diese Statistiken sind privat, nur für dich sichtbar und werden als historische Gesamtwerte angezeigt.' },
    es: { postOpens: 'Aperturas del post', widgetClicks: 'Clics outbound en widgets', bookingConfirmed: 'Ventas confirmadas de tus posts', creatorStatsHint: 'Estas estadísticas son privadas, solo visibles para ti y se muestran como totales históricos.' },
    fr: { postOpens: 'Ouvertures du post', widgetClicks: 'Clics widget sortants', bookingConfirmed: 'Ventes confirmées de vos posts', creatorStatsHint: 'Ces statistiques sont privées, visibles uniquement par vous et affichées comme des totaux historiques.' },
    nl: { postOpens: 'Post-openingen', widgetClicks: 'Uitgaande widgetklikken', bookingConfirmed: 'Bevestigde verkopen uit je posts', creatorStatsHint: 'Deze statistieken zijn privé, alleen voor jou zichtbaar en worden als historische totalen weergegeven.' },
    ru: { postOpens: 'Открытия поста', widgetClicks: 'Исходящие клики по виджету', bookingConfirmed: 'Подтверждённые продажи из ваших постов', creatorStatsHint: 'Эта статистика приватная, видна только вам и отображается как исторические итоги.' },
    ar: { postOpens: 'مرات فتح المنشور', widgetClicks: 'نقرات الودجت الخارجية', bookingConfirmed: 'المبيعات المؤكدة من منشوراتك', creatorStatsHint: 'هذه الإحصاءات خاصة وتظهر لك فقط ويتم عرضها كإجماليات تاريخية.' },
    zh: { postOpens: '文章打开次数', widgetClicks: '外跳组件点击', bookingConfirmed: '来自你帖子的已确认销售', creatorStatsHint: '这些统计数据为私人数据，仅你可见，并以历史累计总数显示。' }
  };
  Object.keys(CREATOR_METRIC_LABEL_FIXES_V2).forEach(function(lang){
    TEXT[lang] = Object.assign({}, TEXT[lang] || {}, CREATOR_METRIC_LABEL_FIXES_V2[lang]);
  });

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
    postPendingRevisions: {},
    currentPost: null,
    currentRevision: null,
    editorData: null,
    autoSlug: true,
    previewVisible: false,
    postPreviewVisible: false,
    editorOpen: false,
    editorBaseline: null,
    profileFormOpen: false,
    statsPanelOpen: false,
    profileBaseline: null,
    postBaseline: null,
    profilePopupTimer: null,
    pendingDeletePostId: null
  };

  var VISIBLE_SOCIALS = Object.keys(I.SOCIALS).filter(function(platform){ return platform !== 'website' && platform !== 'telegram'; });

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
    syncComposerLayout();
  }

  function syncPreviewToggle(){
    var btn = $('#if-toggle-preview');
    var box = $('#if-post-card-preview-box');
    if (btn) btn.textContent = state.previewVisible ? L('hidePreview') : L('showPreview');
    if (box) box.hidden = !state.previewVisible;
    syncComposerLayout();
  }

  function syncPostPreviewToggle(){
    var btn = $('#if-toggle-post-preview');
    var box = $('#if-post-full-preview-box');
    if (btn) btn.textContent = state.postPreviewVisible ? L('hidePreview') : L('showPreview');
    if (box) box.hidden = !state.postPreviewVisible;
    syncComposerLayout();
  }


  function syncComposerLayout(){
    var panel = $('#if-editor-panel');
    if (!panel) return;
    var isModalComposer = !!state.editorOpen;
    panel.classList.toggle('has-side-preview', !!(state.previewVisible || state.postPreviewVisible));
    panel.classList.toggle('is-new-post-composer', isModalComposer);
    document.body.classList.toggle('if-composer-modal-open', isModalComposer);

    var cancelBtn = $('#if-cancel-edit-post');
    if (cancelBtn){
      cancelBtn.classList.toggle('if-composer-close', isModalComposer);
      cancelBtn.setAttribute('aria-label', L('cancelEdit'));
      cancelBtn.setAttribute('title', L('cancelEdit'));
      cancelBtn.textContent = isModalComposer ? '×' : L('cancelEdit');
    }
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

  function buildDateField(field, index, value, label){
    return '' +
      '<div class="if-date-field">' +
        '<input class="if-date-field__display" autocomplete="off" inputmode="none" placeholder="' + I.escapeAttr(datePlaceholder()) + '" readonly type="text" value="' + I.escapeAttr(formatDateFieldValue(value || '')) + '"/>' +
        '<input data-block-field="' + I.escapeAttr(field) + '" data-index="' + index + '" type="hidden" value="' + I.escapeAttr(value || '') + '"/>' +
        '<button aria-label="' + I.escapeAttr(label) + '" class="if-date-field__toggle" data-date-open type="button">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"></rect><path d="M8 2v4M16 2v4M3 9h18"></path></svg>' +
        '</button>' +
        '<div class="if-date-field__picker" hidden></div>' +
      '</div>';
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

  function sanitizeTextSize(value){
    value = String(value || 'medium').toLowerCase().trim();
    return ['small','medium','large'].indexOf(value) !== -1 ? value : 'medium';
  }

  function sanitizeTextAlign(value){
    value = String(value || 'left').toLowerCase().trim();
    return ['left','center','right'].indexOf(value) !== -1 ? value : 'left';
  }

  function getEditorTextMeta(source){
    source = source && typeof source === 'object' ? source : {};
    return {
      title_size: sanitizeTextSize(source.title_size || 'medium'),
      title_align: sanitizeTextAlign(source.title_align || 'center'),
      excerpt_size: sanitizeTextSize(source.excerpt_size || 'medium'),
      excerpt_align: sanitizeTextAlign(source.excerpt_align || 'center')
    };
  }

  function extractEditorMetaFromBlocks(blocks){
    var items = Array.isArray(blocks) ? clone(blocks) : [];
    var meta = getEditorTextMeta({});
    if (items.length && items[0] && String(items[0].type || '') === '__post_meta'){
      meta = getEditorTextMeta(items[0]);
      items.shift();
    }
    return { meta: meta, blocks: items };
  }

  function injectEditorMetaBlock(blocks, source){
    var meta = getEditorTextMeta(source || {});
    var items = Array.isArray(blocks) ? clone(blocks) : [];
    items.unshift({
      type: '__post_meta',
      title_size: meta.title_size,
      title_align: meta.title_align,
      excerpt_size: meta.excerpt_size,
      excerpt_align: meta.excerpt_align
    });
    return items;
  }

  function basePostEditor(){
    var meta = getEditorTextMeta({});
    return {
      title: '',
      post_slug: '',
      post_short_id: 'p' + Math.random().toString(36).slice(2, 6),
      excerpt: '',
      title_size: meta.title_size,
      title_align: meta.title_align,
      excerpt_size: meta.excerpt_size,
      excerpt_align: meta.excerpt_align,
      cover_path: '',
      cover_url: '',
      blocks: []
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
    var extracted = extractEditorMetaFromBlocks(blocks);
    blocks = extracted.blocks;
    if (!Array.isArray(blocks) || !blocks.length) blocks = [defaultBlock('paragraph')];
    return {
      title: revision.title || '',
      post_slug: state.currentPost ? (state.currentPost.post_slug || '') : '',
      post_short_id: state.currentPost ? (state.currentPost.post_short_id || ('p' + Math.random().toString(36).slice(2, 6))) : ('p' + Math.random().toString(36).slice(2, 6)),
      excerpt: revision.excerpt || '',
      title_size: extracted.meta.title_size,
      title_align: extracted.meta.title_align,
      excerpt_size: extracted.meta.excerpt_size,
      excerpt_align: extracted.meta.excerpt_align,
      cover_path: revision.cover_path || '',
      cover_url: revision.cover_path ? publicImageUrl('influencer-post-media', revision.cover_path) : '',
      blocks: blocks
    };
  }

  function canonicalizeProfileDraft(source){
    var normalized = syncProfileSlug(source || {});
    var socials = {};
    VISIBLE_SOCIALS.slice().sort().forEach(function(platform){
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

  function canonicalizeCompareValue(value){
    if (Array.isArray(value)) return value.map(canonicalizeCompareValue);
    if (value && typeof value === 'object'){
      var out = {};
      Object.keys(value).sort().forEach(function(key){
        if (key === 'url' || key === 'trackingCode' || key === 'tracking_code') return;
        out[key] = canonicalizeCompareValue(value[key]);
      });
      return out;
    }
    if (typeof value === 'string') return value.trim();
    return value == null ? '' : value;
  }

  function canonicalizePostEditor(source){
    var editor = source && typeof source === 'object' ? source : {};
    var meta = getEditorTextMeta(editor);
    return {
      title: String(editor.title || '').trim(),
      excerpt: String(editor.excerpt || '').trim(),
      title_size: meta.title_size,
      title_align: meta.title_align,
      excerpt_size: meta.excerpt_size,
      excerpt_align: meta.excerpt_align,
      cover_path: String(editor.cover_path || '').trim(),
      blocks: canonicalizeCompareValue(editor.blocks || [])
    };
  }

  function canonicalizePostBlocks(blocks){
    return (Array.isArray(blocks) ? blocks : []).map(function(block){
      block = block && typeof block === 'object' ? block : {};
      var out = { type: String(block.type || '').trim() };
      if (out.type === 'heading'){
        out.level = 'h2';
        out.text = String(block.text || '').trim();
        out.size = String(block.size || 'medium').trim() || 'medium';
        out.align = String(block.align || 'left').trim() || 'left';
      } else if (out.type === 'paragraph' || out.type === 'quote' || out.type === 'tip'){
        out.text = String(block.text || '').trim();
        out.size = String(block.size || 'medium').trim() || 'medium';
        out.align = String(block.align || 'left').trim() || 'left';
      } else if (out.type === 'list'){
        out.items = (Array.isArray(block.items) ? block.items : String(block.items || '').split('\n')).map(function(item){ return String(item || '').trim(); }).filter(Boolean);
        out.size = String(block.size || 'medium').trim() || 'medium';
        out.align = String(block.align || 'left').trim() || 'left';
      } else if (out.type === 'image'){
        out.path = String(block.path || '').trim();
        out.caption = String(block.caption || '').trim();
        out.size = String(block.size || 'medium').trim() || 'medium';
      } else if (out.type === 'stay22'){
        out.title = String(block.title || '').trim();
        out.ctaLabel = String(block.ctaLabel || '').trim();
        out.widgetLocale = String(block.widgetLocale || LANG).trim() || LANG;
        out.destination = String(block.destination || '').trim();
        out.checkin = String(block.checkin || '').trim();
        out.checkout = String(block.checkout || '').trim();
        out.description = String(block.description || '').trim();
      } else if (out.type === 'aviasales'){
        out.title = String(block.title || '').trim();
        out.ctaLabel = String(block.ctaLabel || '').trim();
        out.widgetLocale = String(block.widgetLocale || LANG).trim() || LANG;
        out.origin = String(block.origin || '').trim();
        out.destination = String(block.destination || '').trim();
        out.checkin = String(block.checkin || '').trim();
        out.returnDate = String(block.returnDate || '').trim();
        out.description = String(block.description || '').trim();
      }
      return out;
    });
  }

  function canonicalizePostDraft(source){
    source = source || {};
    var meta = getEditorTextMeta(source);
    return {
      title: String(source.title || '').trim(),
      excerpt: String(source.excerpt || '').trim(),
      title_size: meta.title_size,
      title_align: meta.title_align,
      excerpt_size: meta.excerpt_size,
      excerpt_align: meta.excerpt_align,
      cover_path: String(source.cover_path || '').trim(),
      blocks: canonicalizePostBlocks(source.blocks || [])
    };
  }

  function clonePostBaseline(){
    return canonicalizePostDraft(state.editorData || basePostEditor());
  }

  function hasPostChanges(){
    return JSON.stringify(canonicalizePostEditor(state.editorData || basePostEditor())) !== JSON.stringify(state.editorBaseline || canonicalizePostEditor(basePostEditor()));
  }

  function hasAnyEditorContent(editor){
    var payload = canonicalizePostDraft(editor || state.editorData || basePostEditor());
    return !!(payload.title || payload.excerpt || payload.cover_path || (payload.blocks && payload.blocks.length));
  }

  function hasPublishedProfile(){
    return !!(state.profile && state.profile.current_published_revision_id && state.profilePublishedRevision);
  }

  function hasApprovedProfile(){
    if (!hasPublishedProfile()) return false;
    var status = String((state.profile && state.profile.status) || '').toLowerCase();
    return status === 'published';
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

  function normalizeDraftStatus(value){
    return String(value || '').toLowerCase().trim();
  }

  function getPendingPostRevision(post){
    if (!post || !state.postPendingRevisions) return null;
    return state.postPendingRevisions[post.id] || null;
  }

  function getDefaultChangeRequestText(kind){
    var map = {
      it: { profile: "L'admin ha richiesto delle modifiche al profilo. Aggiorna i dati e salva di nuovo per reinviarlo in revisione.", post: "L'admin ha richiesto delle modifiche al post. Aggiorna il contenuto e salva di nuovo per reinviarlo in revisione." },
      en: { profile: 'The admin requested changes to your profile. Update the details and save again to send it back for review.', post: 'The admin requested changes to your post. Update the content and save again to send it back for review.' },
      de: { profile: 'Der Admin hat Änderungen an deinem Profil angefordert. Aktualisiere die Daten und speichere erneut, um es wieder zur Prüfung zu senden.', post: 'Der Admin hat Änderungen an deinem Beitrag angefordert. Aktualisiere den Inhalt und speichere erneut, um ihn wieder zur Prüfung zu senden.' },
      es: { profile: 'El administrador solicitó cambios en tu perfil. Actualiza los datos y guarda de nuevo para enviarlo otra vez a revisión.', post: 'El administrador solicitó cambios en tu publicación. Actualiza el contenido y guarda de nuevo para enviarla otra vez a revisión.' },
      fr: { profile: "L'admin a demandé des modifications pour votre profil. Mettez les informations à jour et enregistrez à nouveau pour le renvoyer en révision.", post: "L'admin a demandé des modifications pour votre post. Mettez le contenu à jour et enregistrez à nouveau pour le renvoyer en révision." },
      nl: { profile: 'De admin heeft wijzigingen gevraagd voor je profiel. Werk de gegevens bij en sla opnieuw op om het opnieuw ter controle te sturen.', post: 'De admin heeft wijzigingen gevraagd voor je bericht. Werk de inhoud bij en sla opnieuw op om het opnieuw ter controle te sturen.' },
      ru: { profile: 'Администратор запросил изменения профиля. Обновите данные и снова сохраните, чтобы отправить профиль на повторную проверку.', post: 'Администратор запросил изменения поста. Обновите содержимое и снова сохраните, чтобы отправить пост на повторную проверку.' },
      ar: { profile: 'طلب المسؤول تعديلات على الملف الشخصي. حدّث البيانات واحفظ مرة أخرى لإعادة إرساله للمراجعة.', post: 'طلب المسؤول تعديلات على المنشور. حدّث المحتوى واحفظ مرة أخرى لإعادة إرساله للمراجعة.' },
      zh: { profile: '管理员要求你修改个人资料。更新资料后再次保存，即可重新提交审核。', post: '管理员要求你修改帖子。更新内容后再次保存，即可重新提交审核。' }
    };
    var set = map[LANG] || map.en;
    return kind === 'profile' ? set.profile : set.post;
  }

  function renderAdminNoteBox(info){
    if (!info) return '';
    var kind = info.kind === 'profile' ? 'profile' : 'post';
    var noteText = String(info.note || '').trim() || getDefaultChangeRequestText(kind);
    return '' +
      '<div class="if-note-box if-note-box--admin-request">' +
        '<div class="if-note-box__head">' + badge(info.status || 'changes_requested') + '<strong>' + I.escapeHtml(L('reviewNotes')) + '</strong></div>' +
        '<div class="if-note-box__body">' + I.escapeHtml(noteText).replace(/\n/g, '<br/>') + '</div>' +
      '</div>';
  }

  function getProfileChangeRequestInfo(){
    if (state.profilePendingRevision && normalizeDraftStatus(state.profilePendingRevision.status) === 'changes_requested'){
      return { kind: 'profile', status: state.profilePendingRevision.status, note: String(state.profilePendingRevision.review_notes || '').trim() || getDefaultChangeRequestText('profile') };
    }
    if (state.profile && normalizeDraftStatus(state.profile.status) === 'changes_requested'){
      return { kind: 'profile', status: state.profile.status, note: String(state.profile.review_notes || '').trim() || getDefaultChangeRequestText('profile') };
    }
    return null;
  }

  function getPostChangeRequestInfo(post){
    if (!post) return null;
    var pending = getPendingPostRevision(post);
    if (pending && normalizeDraftStatus(pending.status) === 'changes_requested'){
      return { kind: 'post', status: pending.status, note: String(pending.review_notes || '').trim() || getDefaultChangeRequestText('post') };
    }
    if (normalizeDraftStatus(post.status) === 'changes_requested'){
      return { kind: 'post', status: post.status, note: String(post.review_notes || '').trim() || getDefaultChangeRequestText('post') };
    }
    return null;
  }

  function renderProfileRequestNotes(){
    var html = renderAdminNoteBox(getProfileChangeRequestInfo());
    ['#if-profile-request-note-intro', '#if-profile-request-note-summary', '#if-profile-request-note-form'].forEach(function(sel){
      var el = $(sel);
      if (el) el.innerHTML = html;
    });
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

  function isProfilePopupOpen(){
    var popup = $('#if-profile-popup');
    return !!(popup && !popup.hidden);
  }

  function isExitPopupOpen(){
    var popup = $('#if-exit-popup');
    return !!(popup && !popup.hidden);
  }

  function isDeletePopupOpen(){
    var popup = $('#if-delete-popup');
    return !!(popup && !popup.hidden);
  }

  function syncBodyPopupState(){
    document.body.classList.toggle('if-popup-open', isProfilePopupOpen() || isExitPopupOpen() || isDeletePopupOpen() || isSaveConfirmPopupOpen());
  }

  function hideProfilePopup(){
    var popup = $('#if-profile-popup');
    if (!popup) return;
    popup.hidden = true;
    syncBodyPopupState();
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
    syncBodyPopupState();
    if (state.profilePopupTimer) clearTimeout(state.profilePopupTimer);
    state.profilePopupTimer = setTimeout(function(){
      hideProfilePopup();
    }, 30000);
  }

  function hideExitPopup(){
    var popup = $('#if-exit-popup');
    if (!popup) return;
    popup.hidden = true;
    syncBodyPopupState();
  }

  function showExitPopup(message){
    var popup = $('#if-exit-popup');
    var messageEl = $('#if-exit-popup-message');
    if (!popup || !messageEl) return;
    messageEl.textContent = String(message || L('exitComposerConfirm'));
    popup.hidden = false;
    syncBodyPopupState();
  }

  function hideDeletePopup(){
    var popup = $('#if-delete-popup');
    if (!popup) return;
    popup.hidden = true;
    state.pendingDeletePostId = null;
    syncBodyPopupState();
  }

  function showDeletePopup(message, postId){
    var popup = $('#if-delete-popup');
    var messageEl = $('#if-delete-popup-message');
    if (!popup || !messageEl) return;
    state.pendingDeletePostId = postId || null;
    messageEl.textContent = String(message || L('deletePostConfirm'));
    popup.hidden = false;
    syncBodyPopupState();
  }

  function isSaveConfirmPopupOpen(){
    var popup = $('#if-save-confirm-popup');
    return !!(popup && !popup.hidden);
  }

  function hideSaveConfirmPopup(){
    var popup = $('#if-save-confirm-popup');
    if (!popup) return;
    popup.hidden = true;
    state.pendingSaveAction = null;
    syncBodyPopupState();
  }

  function showSaveConfirmPopup(message, onConfirm){
    var popup = $('#if-save-confirm-popup');
    var messageEl = $('#if-save-confirm-message');
    if (!popup || !messageEl) return;
    state.pendingSaveAction = typeof onConfirm === 'function' ? onConfirm : null;
    messageEl.textContent = String(message || '');
    popup.hidden = false;
    syncBodyPopupState();
  }

  function requestDeletePost(postId){
    if (!postId) return;
    showDeletePopup(L('deletePostConfirm'), postId);
  }

  function requestComposerClose(){
    var panel = $('#if-editor-panel');
    if (panel && panel.classList.contains('is-new-post-composer')){
      showExitPopup(L('exitComposerConfirm'));
      return;
    }
    resetEditor(false);
  }

  function renderProfileUi(){
    var shell = $('#if-affiliate-app-shell');
    if (shell) shell.hidden = false;
    var loginReq = $('#if-affiliate-login-required');
    if (loginReq) loginReq.hidden = true;
    setProfileTabVisibility(true);

    var hasPublished = hasPublishedProfile();
    var hasApproved = hasApprovedProfile();
    document.body.classList.toggle('if-profile-approved', !!hasApproved);
    document.body.classList.toggle('if-profile-has-approved', !!hasApproved);
    document.body.classList.toggle('if-profile-awaiting-approval', !hasApproved);
    if (!hasApproved) state.statsPanelOpen = false;

    var summaryVisible = !!(hasApproved && hasPublished && state.profilePublishedRevision && !hasPendingInitialProfileReview());
    var introVisible = !summaryVisible && !state.profileFormOpen;
    var profileVisible = !!state.profileFormOpen;
    var statsVisible = summaryVisible && !!state.statsPanelOpen;
    var postsVisible = summaryVisible;

    var ctaPanel = $('#if-profile-cta-panel');
    var summaryPanel = $('#if-profile-summary-panel');
    var grid = $('#if-creator-grid');
    var profilePanel = $('#if-public-profile-panel');
    var statsPanel = $('#if-private-stats-panel');
    var postsPanel = $('#if-posts-panel');
    var openPublic = $('#if-open-public-page');

    if (ctaPanel){ ctaPanel.hidden = !introVisible; ctaPanel.style.display = introVisible ? '' : 'none'; }
    if (summaryPanel){ summaryPanel.hidden = !summaryVisible; summaryPanel.style.display = summaryVisible ? '' : 'none'; summaryPanel.classList.toggle('is-force-hidden', !summaryVisible); }
    if (grid){ grid.hidden = !(profileVisible || statsVisible); grid.style.display = (profileVisible || statsVisible) ? '' : 'none'; }
    if (profilePanel){ profilePanel.hidden = !profileVisible; profilePanel.style.display = profileVisible ? '' : 'none'; }
    if (statsPanel){ statsPanel.hidden = !statsVisible; statsPanel.style.display = statsVisible ? '' : 'none'; }
    if (postsPanel){ postsPanel.hidden = !postsVisible; postsPanel.style.display = postsVisible ? '' : 'none'; postsPanel.classList.toggle('is-force-hidden', !postsVisible); }
    if (openPublic){
      openPublic.hidden = !hasApproved;
      openPublic.style.display = hasApproved ? '' : 'none';
      openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
    }

    if (summaryVisible) renderProfileSummary();
    if (profileVisible) renderProfileForm();
    renderProfileRequestNotes();
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
      var canOpenPublic = hasPublishedProfile() && hasApprovedProfile();
      publicBtn.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
      publicBtn.hidden = !canOpenPublic;
      publicBtn.style.display = canOpenPublic ? '' : 'none';
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

  function closeAllCustomSelects(except){
    $all('.if-custom-select.is-open').forEach(function(root){
      if (except && root === except) return;
      root.classList.remove('is-open');
      var menu = $('.if-custom-select__menu', root);
      if (menu) menu.hidden = true;
    });
  }

  function syncCustomSelect(select){
    if (!select || !select.__ifCustomSelect) return;
    var refs = select.__ifCustomSelect;
    var option = select.options[select.selectedIndex] || null;
    refs.label.textContent = option ? option.textContent : '';
    refs.menu.innerHTML = Array.prototype.map.call(select.options, function(opt){
      return '<button class="if-custom-select__option' + (opt.selected ? ' is-selected' : '') + '" data-value="' + I.escapeAttr(opt.value) + '" type="button">' + I.escapeHtml(opt.textContent || '') + '</button>';
    }).join('');
    $all('[data-value]', refs.menu).forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        select.value = btn.getAttribute('data-value') || '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        syncCustomSelect(select);
        closeAllCustomSelects();
      });
    });
  }

  function enhanceCustomSelects(root){
    root = root || document;
    var selects = [];
    if (root.matches && root.matches('select')) selects.push(root);
    selects = selects.concat($all('select', root));
    selects.forEach(function(select){
      if (!select || select.multiple || select.size > 1) return;
      if (select.__ifCustomSelectEnhanced){ syncCustomSelect(select); return; }
      var wrapper = document.createElement('div');
      wrapper.className = 'if-custom-select';
      if (select.id === 'site-lang-select') wrapper.classList.add('if-custom-select--site-lang');
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      select.classList.add('if-custom-select__native');
      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'if-custom-select__trigger';
      var label = document.createElement('span');
      label.className = 'if-custom-select__label';
      var arrow = document.createElement('span');
      arrow.className = 'if-custom-select__arrow';
      trigger.appendChild(label);
      trigger.appendChild(arrow);
      var menu = document.createElement('div');
      menu.className = 'if-custom-select__menu';
      menu.hidden = true;
      wrapper.appendChild(trigger);
      wrapper.appendChild(menu);
      select.__ifCustomSelect = { wrapper: wrapper, trigger: trigger, label: label, menu: menu };
      select.__ifCustomSelectEnhanced = true;
      trigger.addEventListener('click', function(e){
        e.preventDefault();
        var willOpen = menu.hidden;
        closeAllCustomSelects(wrapper);
        wrapper.classList.toggle('is-open', willOpen);
        menu.hidden = !willOpen;
      });
      select.addEventListener('change', function(){ syncCustomSelect(select); });
      syncCustomSelect(select);
    });
  }

  function dateLocale(){
    return { it: 'it-IT', en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', nl: 'nl-NL', ru: 'ru-RU', ar: 'ar', zh: 'zh-CN' }[LANG] || 'en-US';
  }

  function getDateWeekStart(){ return LANG === 'en' ? 0 : 1; }

  function parseIsoDate(value){
    var str = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    var parts = str.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDateFieldValue(value){
    var date = parseIsoDate(value);
    if (!date) return '';
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = String(date.getFullYear());
    return LANG === 'en' ? (mm + '/' + dd + '/' + yyyy) : (dd + '/' + mm + '/' + yyyy);
  }

  function datePlaceholder(){ return LANG === 'en' ? 'mm/dd/yyyy' : 'dd/mm/yyyy'; }

  function dateActionLabels(){
    var clearMap = { it: 'Pulisci', en: 'Clear', de: 'Löschen', es: 'Limpiar', fr: 'Effacer', nl: 'Wissen', ru: 'Очистить', ar: 'مسح', zh: '清除' };
    var todayMap = { it: 'Oggi', en: 'Today', de: 'Heute', es: 'Hoy', fr: 'Aujourd’hui', nl: 'Vandaag', ru: 'Сегодня', ar: 'اليوم', zh: '今天' };
    return { clear: clearMap[LANG] || clearMap.en, today: todayMap[LANG] || todayMap.en };
  }

  function monthLabel(year, month){
    try { return new Intl.DateTimeFormat(dateLocale(), { month: 'long', year: 'numeric' }).format(new Date(year, month, 1)); } catch (_) { return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); }
  }

  function weekdayLabels(){
    var start = getDateWeekStart();
    var labels = [];
    for (var i = 0; i < 7; i += 1){
      var day = new Date(2024, 0, 7 + ((start + i) % 7));
      try { labels.push(new Intl.DateTimeFormat(dateLocale(), { weekday: 'short' }).format(day)); } catch (_) { labels.push(['Su','Mo','Tu','We','Th','Fr','Sa'][(start + i) % 7]); }
    }
    return labels;
  }

  function isoFromParts(year, month, day){
    return [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
  }

  function closeAllDatePickers(except){
    $all('.if-date-field.is-open').forEach(function(root){
      if (except && root === except) return;
      root.classList.remove('is-open');
      var picker = $('.if-date-field__picker', root);
      if (picker) picker.hidden = true;
    });
  }

  function renderDatePicker(root){
    if (!root) return;
    var picker = $('.if-date-field__picker', root);
    var hidden = $('[data-block-field]', root);
    var display = $('.if-date-field__display', root);
    if (!picker || !hidden || !display) return;
    var selected = parseIsoDate(hidden.value) || new Date();
    var year = Number(root.getAttribute('data-picker-year') || selected.getFullYear());
    var month = Number(root.getAttribute('data-picker-month') || selected.getMonth());
    root.setAttribute('data-picker-year', year);
    root.setAttribute('data-picker-month', month);
    var firstDay = new Date(year, month, 1);
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var offset = (firstDay.getDay() - getDateWeekStart() + 7) % 7;
    var today = new Date();
    var todayIso = isoFromParts(today.getFullYear(), today.getMonth(), today.getDate());
    var selectedIso = hidden.value || '';
    var cells = [];
    for (var blank = 0; blank < offset; blank += 1) cells.push('<span class="if-date-field__empty"></span>');
    for (var day = 1; day <= daysInMonth; day += 1){
      var iso = isoFromParts(year, month, day);
      var classes = ['if-date-field__day'];
      if (iso === selectedIso) classes.push('is-selected');
      if (iso === todayIso) classes.push('is-today');
      cells.push('<button class="' + classes.join(' ') + '" data-date-day="' + iso + '" type="button">' + day + '</button>');
    }
    picker.innerHTML = '' +
      '<div class="if-date-field__calendar">' +
        '<div class="if-date-field__calendar-head">' +
          '<button class="if-date-field__nav" data-date-nav="prev" type="button">‹</button>' +
          '<div class="if-date-field__calendar-title">' + I.escapeHtml(monthLabel(year, month)) + '</div>' +
          '<button class="if-date-field__nav" data-date-nav="next" type="button">›</button>' +
        '</div>' +
        '<div class="if-date-field__weekdays">' + weekdayLabels().map(function(label){ return '<span>' + I.escapeHtml(label) + '</span>'; }).join('') + '</div>' +
        '<div class="if-date-field__days">' + cells.join('') + '</div>' +
        '<div class="if-date-field__actions">' +
          '<button class="if-date-field__action" data-date-action="clear" type="button">' + I.escapeHtml(dateActionLabels().clear) + '</button>' +
          '<button class="if-date-field__action" data-date-action="today" type="button">' + I.escapeHtml(dateActionLabels().today) + '</button>' +
        '</div>' +
      '</div>';

    $all('[data-date-nav]', picker).forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var delta = btn.getAttribute('data-date-nav') === 'next' ? 1 : -1;
        var next = new Date(year, month + delta, 1);
        root.setAttribute('data-picker-year', next.getFullYear());
        root.setAttribute('data-picker-month', next.getMonth());
        renderDatePicker(root);
      });
    });
    $all('[data-date-day]', picker).forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        hidden.value = btn.getAttribute('data-date-day') || '';
        display.value = formatDateFieldValue(hidden.value);
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        closeAllDatePickers();
      });
    });
    $all('[data-date-action]', picker).forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var action = btn.getAttribute('data-date-action');
        if (action === 'clear'){
          hidden.value = '';
        } else {
          hidden.value = todayIso;
        }
        display.value = formatDateFieldValue(hidden.value);
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        closeAllDatePickers();
      });
    });
  }

  function enhanceDateFields(root){
    root = root || document;
    var fields = [];
    if (root.matches && root.matches('.if-date-field')) fields.push(root);
    fields = fields.concat($all('.if-date-field', root));
    fields.forEach(function(field){
      if (field.__ifDateBound) return;
      field.__ifDateBound = true;
      var display = $('.if-date-field__display', field);
      var hidden = $('[data-block-field]', field);
      var toggle = $('[data-date-open]', field);
      if (!display || !hidden || !toggle) return;
      display.value = formatDateFieldValue(hidden.value);
      function openPicker(e){
        if (e) e.preventDefault();
        closeAllDatePickers(field);
        field.classList.add('is-open');
        var picker = $('.if-date-field__picker', field);
        if (picker) picker.hidden = false;
        var seed = parseIsoDate(hidden.value) || new Date();
        field.setAttribute('data-picker-year', seed.getFullYear());
        field.setAttribute('data-picker-month', seed.getMonth());
        renderDatePicker(field);
      }
      display.addEventListener('click', openPicker);
      toggle.addEventListener('click', openPicker);
    });
  }

  function renderApp(){
    if (!APP) return;
    APP.innerHTML = '' +
      '<div id="if-affiliate-login-required" hidden></div>' +
      '<div id="if-affiliate-app-shell" hidden>' +
        '<section class="auth-card if-panel if-creator-intro-panel" id="if-profile-cta-panel" hidden>' +
          '<p class="muted if-creator-intro-text">' + I.escapeHtml(L('creatorIntroText')) + '</p>' +
          '<div id="if-profile-request-note-intro"></div>' +
          '<div class="auth-actions if-center-actions"><button class="btn" id="if-create-profile-btn" type="button">' + I.escapeHtml(L('createProfile')) + '</button></div>' +
        '</section>' +
        '<section class="auth-card if-panel if-creator-summary" id="if-profile-summary-panel" hidden>' +
          '<div class="if-creator-summary__media" id="if-profile-summary-avatar"></div>' +
          '<div class="if-creator-summary__content">' +
            '<h2 class="if-creator-summary__name" id="if-profile-summary-name"></h2>' +
            '<p class="muted if-creator-summary__bio" id="if-profile-summary-bio"></p>' +
            '<div id="if-profile-request-note-summary"></div>' +
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
            '<div id="if-profile-request-note-form"></div>' +
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
          '<form class="auth-form if-post-form" id="if-post-form">' +
            '<div class="if-post-form__layout">' +
              '<div class="if-post-form__main">' +
                '<div id="if-post-review-note"></div>' +
                '<div class="form-group"><label for="if-post-title">' + I.escapeHtml(L('title')) + '</label><input id="if-post-title" required type="text"/></div>' +
                '<div class="form-row-2 if-post-meta-controls"><div class="form-group"><label for="if-post-title-size">' + I.escapeHtml(L('fieldSize')) + '</label><select class="if-select" id="if-post-title-size"><option value="small">' + I.escapeHtml(L('sizeSmall')) + '</option><option value="medium">' + I.escapeHtml(L('sizeMedium')) + '</option><option value="large">' + I.escapeHtml(L('sizeLarge')) + '</option></select></div><div class="form-group"><label for="if-post-title-align">' + I.escapeHtml(L('fieldAlign')) + '</label><select class="if-select" id="if-post-title-align"><option value="left">' + I.escapeHtml(L('alignLeft')) + '</option><option value="center">' + I.escapeHtml(L('alignCenter')) + '</option><option value="right">' + I.escapeHtml(L('alignRight')) + '</option></select></div></div>' +
                '<div class="if-cover-upload"><div id="if-cover-preview"></div><div><label class="small muted">' + I.escapeHtml(L('coverImage')) + '</label>' + makeFileControl('if-post-cover-input','if-post-cover-name') + '<p class="muted small">WEBP · max 8MB · output 1600×900</p></div></div>' +
                '<div class="form-group"><label for="if-post-excerpt">' + I.escapeHtml(L('excerpt')) + '</label><textarea id="if-post-excerpt" rows="3"></textarea></div>' +
                '<div class="form-row-2 if-post-meta-controls"><div class="form-group"><label for="if-post-excerpt-size">' + I.escapeHtml(L('fieldSize')) + '</label><select class="if-select" id="if-post-excerpt-size"><option value="small">' + I.escapeHtml(L('sizeSmall')) + '</option><option value="medium">' + I.escapeHtml(L('sizeMedium')) + '</option><option value="large">' + I.escapeHtml(L('sizeLarge')) + '</option></select></div><div class="form-group"><label for="if-post-excerpt-align">' + I.escapeHtml(L('fieldAlign')) + '</label><select class="if-select" id="if-post-excerpt-align"><option value="left">' + I.escapeHtml(L('alignLeft')) + '</option><option value="center">' + I.escapeHtml(L('alignCenter')) + '</option><option value="right">' + I.escapeHtml(L('alignRight')) + '</option></select></div></div>' +
                '<div class="if-section-head if-section-head--blocks"><div><h3>' + I.escapeHtml(L('postContent')) + '</h3></div></div>' +
                '<div class="if-block-toolbar" id="if-block-toolbar"><div class="if-add-menu" id="if-add-menu"><button class="btn secondary" id="if-add-block-toggle" type="button">' + I.escapeHtml(L('addBlock')) + '</button><div class="if-add-menu__dropdown" hidden id="if-add-block-menu"></div></div></div>' +
                '<div id="if-blocks-editor"></div>' +
                '<div class="auth-actions if-center-actions"><button class="btn" id="if-post-save" type="button">' + I.escapeHtml(L('savePost')) + '</button></div>' +
              '</div>' +
              '<aside class="if-post-form__side">' +
                '<div class="if-card-preview-wrap">' +
                  '<div class="if-preview-toggle">' +
                    '<div class="if-preview-toggle__title small muted">' + I.escapeHtml(L('livePreview')) + '</div>' +
                    '<button class="btn secondary" id="if-toggle-preview" type="button">' + I.escapeHtml(L('showPreview')) + '</button>' +
                  '</div>' +
                  '<div hidden id="if-post-card-preview-box"><div id="if-post-card-preview"></div></div>' +
                '</div>' +
                '<div class="if-card-preview-wrap if-card-preview-wrap--full">' +
                  '<div class="if-preview-toggle">' +
                    '<div class="if-preview-toggle__title small muted">' + I.escapeHtml(L('postPreview')) + '</div>' +
                    '<button class="btn secondary" id="if-toggle-post-preview" type="button">' + I.escapeHtml(L('showPreview')) + '</button>' +
                  '</div>' +
                  '<div hidden id="if-post-full-preview-box"><div id="if-post-full-preview"></div></div>' +
                '</div>' +
              '</aside>' +
            '</div>' +
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
      '</div>' +
      '<div class="if-profile-popup if-profile-popup--confirm" hidden id="if-exit-popup">' +
        '<div class="if-profile-popup__backdrop" data-exit-popup-close="1"></div>' +
        '<div aria-modal="true" class="if-profile-popup__dialog if-profile-popup__dialog--wide" role="dialog">' +
          '<div class="if-profile-popup__message" id="if-exit-popup-message">' + I.escapeHtml(L('exitComposerConfirm')) + '</div>' +
          '<div class="auth-actions if-profile-popup__actions if-profile-popup__actions--triple">' +
            '<button class="btn secondary" id="if-exit-popup-cancel" type="button">' + I.escapeHtml(L('cancelClose')) + '</button>' +
            '<button class="btn secondary" id="if-exit-popup-discard" type="button">' + I.escapeHtml(L('exitWithoutSaving')) + '</button>' +
            '<button class="btn" id="if-exit-popup-save" type="button">' + I.escapeHtml(L('saveAndExit')) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="if-profile-popup if-profile-popup--confirm" hidden id="if-save-confirm-popup">' +
        '<div class="if-profile-popup__backdrop" data-save-confirm-close="1"></div>' +
        '<div aria-modal="true" class="if-profile-popup__dialog if-profile-popup__dialog--wide" role="dialog">' +
          '<button aria-label="' + I.escapeAttr(t('close')) + '" class="if-profile-popup__close" id="if-save-confirm-close" type="button">×</button>' +
          '<div class="if-profile-popup__message" id="if-save-confirm-message"></div>' +
          '<div class="auth-actions if-profile-popup__actions if-profile-popup__actions--double">' +
            '<button class="btn secondary" id="if-save-confirm-cancel" type="button">' + I.escapeHtml(L('continueEditing')) + '</button>' +
            '<button class="btn" id="if-save-confirm-ok" type="button">' + I.escapeHtml(L('confirmSave')) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="if-profile-popup if-profile-popup--confirm" hidden id="if-delete-popup">' +
        '<div class="if-profile-popup__backdrop" data-delete-popup-close="1"></div>' +
        '<div aria-modal="true" class="if-profile-popup__dialog" role="dialog">' +
          '<div class="if-profile-popup__message" id="if-delete-popup-message">' + I.escapeHtml(L('deletePostConfirm')) + '</div>' +
          '<div class="auth-actions if-profile-popup__actions if-profile-popup__actions--double">' +
            '<button class="btn secondary" id="if-delete-popup-no" type="button">' + I.escapeHtml(L('popupNo')) + '</button>' +
            '<button class="btn" id="if-delete-popup-yes" type="button">' + I.escapeHtml(L('popupYes')) + '</button>' +
          '</div>' +
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
    var saveConfirm = $('#if-save-confirm-popup');
    if (saveConfirm && !saveConfirm.__bound){
      saveConfirm.__bound = true;
      saveConfirm.addEventListener('click', function(e){
        if (e.target && e.target.getAttribute('data-save-confirm-close') === '1') hideSaveConfirmPopup();
      });
    }
    var saveConfirmCancel = $('#if-save-confirm-cancel');
    if (saveConfirmCancel && !saveConfirmCancel.__bound){
      saveConfirmCancel.__bound = true;
      saveConfirmCancel.addEventListener('click', hideSaveConfirmPopup);
    }
    var saveConfirmClose = $('#if-save-confirm-close');
    if (saveConfirmClose && !saveConfirmClose.__bound){
      saveConfirmClose.__bound = true;
      saveConfirmClose.addEventListener('click', hideSaveConfirmPopup);
    }
    var saveConfirmOk = $('#if-save-confirm-ok');
    if (saveConfirmOk && !saveConfirmOk.__bound){
      saveConfirmOk.__bound = true;
      saveConfirmOk.addEventListener('click', async function(){
        var action = state.pendingSaveAction;
        hideSaveConfirmPopup();
        if (typeof action === 'function') await action();
      });
    }
    var exitPopup = $('#if-exit-popup');
    if (exitPopup && !exitPopup.__bound){
      exitPopup.__bound = true;
      exitPopup.addEventListener('click', function(e){
        if (e.target && e.target.getAttribute('data-exit-popup-close') === '1') hideExitPopup();
      });
    }
    var exitCancel = $('#if-exit-popup-cancel');
    if (exitCancel && !exitCancel.__bound){
      exitCancel.__bound = true;
      exitCancel.addEventListener('click', hideExitPopup);
    }
    var exitDiscard = $('#if-exit-popup-discard');
    if (exitDiscard && !exitDiscard.__bound){
      exitDiscard.__bound = true;
      exitDiscard.addEventListener('click', function(){
        hideExitPopup();
        resetEditor(false);
      });
    }
    var exitSave = $('#if-exit-popup-save');
    if (exitSave && !exitSave.__bound){
      exitSave.__bound = true;
      exitSave.addEventListener('click', async function(){
        hideExitPopup();
        await savePost({ skipConfirm: true, closeAfterSave: true });
      });
    }
    var deletePopup = $('#if-delete-popup');
    if (deletePopup && !deletePopup.__bound){
      deletePopup.__bound = true;
      deletePopup.addEventListener('click', function(e){
        if (e.target && e.target.getAttribute('data-delete-popup-close') === '1') hideDeletePopup();
      });
    }
    var deleteNo = $('#if-delete-popup-no');
    if (deleteNo && !deleteNo.__bound){
      deleteNo.__bound = true;
      deleteNo.addEventListener('click', hideDeletePopup);
    }
    var deleteYes = $('#if-delete-popup-yes');
    if (deleteYes && !deleteYes.__bound){
      deleteYes.__bound = true;
      deleteYes.addEventListener('click', async function(){
        var postId = state.pendingDeletePostId;
        hideDeletePopup();
        if (postId) await deletePost(postId);
      });
    }
    if (!document.body.__ifProfilePopupEscBound){
      document.body.__ifProfilePopupEscBound = true;
      document.addEventListener('keydown', function(e){
        if (e.key !== 'Escape') return;
        if (isExitPopupOpen()){ hideExitPopup(); return; }
        if (isDeletePopupOpen()){ hideDeletePopup(); return; }
        if (isSaveConfirmPopupOpen()){ hideSaveConfirmPopup(); return; }
        if (isProfilePopupOpen()){ hideProfilePopup(); return; }
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
      socialGrid.innerHTML = VISIBLE_SOCIALS.map(function(platform){
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
      var addMenuRoot = $('#if-add-menu');
      var addMenuToggle = $('#if-add-block-toggle');
      var addMenu = $('#if-add-block-menu');
      function closeAddMenu(){
        if (addMenuRoot) addMenuRoot.classList.remove('is-open');
        if (addMenu) addMenu.hidden = true;
      }
      if (addMenu){
        addMenu.innerHTML = blockButtons.map(function(item){
          return '<button class="if-add-menu__item" type="button" data-add-block="' + I.escapeAttr(item.type) + '"><strong>' + I.escapeHtml(item.label) + '</strong></button>';
        }).join('');
      }
      if (addMenuToggle && !addMenuToggle.__bound){
        addMenuToggle.__bound = true;
        addMenuToggle.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          var willOpen = !!(addMenu && addMenu.hidden);
          if (willOpen){
            if (addMenuRoot) addMenuRoot.classList.add('is-open');
            if (addMenu) addMenu.hidden = false;
          } else {
            closeAddMenu();
          }
        });
      }
      $all('[data-add-block]', addMenu || toolbar).forEach(function(btn){
        btn.addEventListener('click', function(){
          state.editorData.blocks.push(defaultBlock(btn.getAttribute('data-add-block')));
          closeAddMenu();
          renderEditor();
        });
      });
      if (!document.body.__ifAddMenuBound){
        document.body.__ifAddMenuBound = true;
        document.addEventListener('click', function(e){
          if (addMenuRoot && !addMenuRoot.contains(e.target)) closeAddMenu();
        });
        document.addEventListener('keydown', function(e){
          if (e.key === 'Escape') closeAddMenu();
        });
      }
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
    ['#if-post-title-size','#if-post-title-align','#if-post-excerpt-size','#if-post-excerpt-align'].forEach(function(sel){
      var control = $(sel);
      if (control){
        control.addEventListener('change', updateEditorStateFromForm);
        control.addEventListener('input', updateEditorStateFromForm);
      }
    });

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
      profileSave.addEventListener('click', function(){ saveProfile({}); });
    }
    var postSave = $('#if-post-save');
    if (postSave && !postSave.__bound){
      postSave.__bound = true;
      postSave.addEventListener('click', function(){ savePost({}); });
    }
    var newPost = $('#if-new-post-btn');
    if (newPost) newPost.addEventListener('click', function(){ resetEditor(true); });
    var cancelEdit = $('#if-cancel-edit-post');
    if (cancelEdit) cancelEdit.addEventListener('click', function(){ requestComposerClose(); });

    enhanceCustomSelects(document);
    enhanceDateFields(document);

    if (!document.body.__ifCustomUiCloseBound){
      document.body.__ifCustomUiCloseBound = true;
      document.addEventListener('click', function(e){
        if (!e.target.closest('.if-custom-select')) closeAllCustomSelects();
        if (!e.target.closest('.if-date-field')) closeAllDatePickers();
      });
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){
          closeAllCustomSelects();
          closeAllDatePickers();
          if (isExitPopupOpen() || isProfilePopupOpen()) return;
          if (state.editorOpen && !state.currentPost) requestComposerClose();
        }
      });
    }
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
    VISIBLE_SOCIALS.forEach(function(platform){
      var input = $('#if-social-' + platform);
      if (input) input.value = (draft.social_links && draft.social_links[platform]) || '';
    });
    var openPublic = $('#if-open-public-page');
    if (openPublic){
      var canOpenPublicProfile = hasPublishedProfile() && hasApprovedProfile();
      openPublic.hidden = !canOpenPublicProfile;
      openPublic.style.display = canOpenPublicProfile ? '' : 'none';
      openPublic.href = I.buildPagePath('influencers-vlogs.html') + '?creator=' + encodeURIComponent(getPublicProfileSlugForLink());
    }
    updateFileNameLabel($('#if-profile-avatar-name'), null);
  }

  function renderStats(){

    var el = $('#if-private-stats');
    if (!el) return;
    var s = state.stats || {};
    var items = [
      { label: L('postOpens'), value: s.post_opens || 0 },
      { label: L('widgetClicks'), value: s.widget_clicks || 0 },
      { label: L('bookingConfirmed'), value: s.booking_confirmed || 0 },
      { label: L('availableBalance'), value: formatMoney(s.available_balance || 0) }
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
      var requestInfo = getPostChangeRequestInfo(post);
      var pendingRevision = getPendingPostRevision(post);
      var displayStatus = pendingRevision && ['pending_review','changes_requested','rejected','draft'].indexOf(normalizeDraftStatus(pendingRevision.status)) !== -1 ? pendingRevision.status : post.status;
      return '' +
        '<article class="if-admin-creator-card">' +
          '<div class="if-admin-creator-card__head">' +
            '<div><h3>' + I.escapeHtml(post.title || post.post_slug || 'Post') + '</h3><div class="muted small">' + I.escapeHtml(post.post_slug || '') + ' · ' + I.escapeHtml(formatDate(post.updated_at || post.created_at)) + '</div></div>' +
            '<div class="if-admin-creator-card__actions">' + badge(displayStatus) + '</div>' +
          '</div>' +
          (requestInfo ? renderAdminNoteBox(requestInfo) : '') +
          '<div class="if-post-kpi-row">' +
            '<span><strong>' + I.escapeHtml(String(kpi.post_opens || 0)) + '</strong> ' + I.escapeHtml(L('postOpens')) + '</span>' +
            '<span><strong>' + I.escapeHtml(String(kpi.widget_clicks || 0)) + '</strong> ' + I.escapeHtml(L('widgetClicks')) + '</span>' +
            '<span><strong>' + I.escapeHtml(String(kpi.booking_confirmed || 0)) + '</strong> ' + I.escapeHtml(L('bookingConfirmed')) + '</span>' +
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
        requestDeletePost(id);
      });
    });
  }

  function updateEditorStateFromForm(){
    if (!state.editorData) state.editorData = basePostEditor();
    var title = $('#if-post-title');
    var excerpt = $('#if-post-excerpt');
    var titleSize = $('#if-post-title-size');
    var titleAlign = $('#if-post-title-align');
    var excerptSize = $('#if-post-excerpt-size');
    var excerptAlign = $('#if-post-excerpt-align');
    state.editorData.title = title ? String(title.value || '').trim() : '';
    if (!state.currentPost || !state.currentPost.current_live_revision_id){
      state.editorData.post_slug = slugify(state.editorData.title || '');
    } else {
      state.editorData.post_slug = state.currentPost.post_slug || state.editorData.post_slug;
    }
    state.editorData.excerpt = excerpt ? String(excerpt.value || '').trim() : '';
    state.editorData.title_size = sanitizeTextSize(titleSize ? titleSize.value : state.editorData.title_size);
    state.editorData.title_align = sanitizeTextAlign(titleAlign ? titleAlign.value : state.editorData.title_align);
    state.editorData.excerpt_size = sanitizeTextSize(excerptSize ? excerptSize.value : state.editorData.excerpt_size);
    state.editorData.excerpt_align = sanitizeTextAlign(excerptAlign ? excerptAlign.value : state.editorData.excerpt_align);
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
          '<h3 class="if-post-title-display is-size-' + I.escapeAttr(editor.title_size || 'medium') + ' is-align-' + I.escapeAttr(editor.title_align || 'center') + '">' + I.escapeHtml(editor.title || '—') + '</h3>' +
          '<p class="if-post-excerpt-display muted is-size-' + I.escapeAttr(editor.excerpt_size || 'medium') + ' is-align-' + I.escapeAttr(editor.excerpt_align || 'center') + '">' + I.escapeHtml(editor.excerpt || '—') + '</p>' +
          '<div class="if-post-card__foot"><span class="btn">' + I.escapeHtml(t('discoverMore')) + '</span><div class="if-post-card__creator"><span class="if-link-creator">' + I.escapeHtml(creatorName) + '</span></div></div>' +
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
          '<h2 class="if-post-title-display is-size-' + I.escapeAttr(editor.title_size || 'medium') + ' is-align-' + I.escapeAttr(editor.title_align || 'center') + '">' + I.escapeHtml(editor.title || '—') + '</h2>' +
          (editor.excerpt ? '<p class="if-post-excerpt-display muted is-size-' + I.escapeAttr(editor.excerpt_size || 'medium') + ' is-align-' + I.escapeAttr(editor.excerpt_align || 'center') + '">' + I.escapeHtml(editor.excerpt) + '</p>' : '') +
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
    var titleSize = $('#if-post-title-size'); if (titleSize) titleSize.value = sanitizeTextSize(editor.title_size || 'medium');
    var titleAlign = $('#if-post-title-align'); if (titleAlign) titleAlign.value = sanitizeTextAlign(editor.title_align || 'center');
    var excerptSize = $('#if-post-excerpt-size'); if (excerptSize) excerptSize.value = sanitizeTextSize(editor.excerpt_size || 'medium');
    var excerptAlign = $('#if-post-excerpt-align'); if (excerptAlign) excerptAlign.value = sanitizeTextAlign(editor.excerpt_align || 'center');
    var coverPreview = $('#if-cover-preview');
    if (coverPreview){ coverPreview.innerHTML = editor.cover_path ? '<img class="if-cover-thumb" loading="lazy" src="' + I.escapeAttr(editor.cover_url || publicImageUrl('influencer-post-media', editor.cover_path)) + '" alt=""/>' : '<div class="if-cover-thumb if-cover-thumb--placeholder">16:9</div>'; }
    updateFileNameLabel($('#if-post-cover-name'), null);
    renderPreview();
    renderPostPreview();
    syncPreviewToggle();
    syncPostPreviewToggle();

    var reviewNote = $('#if-post-review-note');
    if (reviewNote){
      var reviewInfo = null;
      if (state.currentRevision && state.currentRevision.review_notes){
        reviewInfo = { status: state.currentRevision.status || (state.currentPost ? state.currentPost.status : 'draft'), note: state.currentRevision.review_notes };
      } else if (state.currentPost) {
        reviewInfo = getPostChangeRequestInfo(state.currentPost);
      }
      reviewNote.innerHTML = renderAdminNoteBox(reviewInfo);
    }

    var blocksWrap = $('#if-blocks-editor');
    if (!blocksWrap) return;
    if (!(editor.blocks || []).length){
      blocksWrap.innerHTML = '<div class="if-empty-state if-editor-empty"><strong>' + I.escapeHtml(L('noBlocksTitle')) + '</strong><p>' + I.escapeHtml(L('noBlocksBody')) + '</p></div>';
      return;
    }
    blocksWrap.innerHTML = (editor.blocks || []).map(function(block, index){
      var controls = '<div class="if-block-card__actions">' +
        '<button class="btn secondary small" type="button" data-block-up="' + index + '">↑</button>' +
        '<button class="btn secondary small" type="button" data-block-down="' + index + '">↓</button>' +
        '<button class="btn secondary small" type="button" data-block-delete="' + index + '">×</button>' +
      '</div>';
      var body = '';
      if (block.type === 'heading'){
        body = '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldSize')) + '</label><select class="if-select" data-block-field="size" data-index="' + index + '"><option value="small"' + ((block.size || 'medium') === 'small' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeSmall')) + '</option><option value="medium"' + ((block.size || 'medium') === 'medium' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeMedium')) + '</option><option value="large"' + ((block.size || 'medium') === 'large' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeLarge')) + '</option></select></div><div class="form-group"><label>' + I.escapeHtml(L('fieldAlign')) + '</label><select class="if-select" data-block-field="align" data-index="' + index + '"><option value="left"' + ((block.align || 'left') === 'left' ? ' selected' : '') + '>' + I.escapeHtml(L('alignLeft')) + '</option><option value="center"' + ((block.align || 'left') === 'center' ? ' selected' : '') + '>' + I.escapeHtml(L('alignCenter')) + '</option><option value="right"' + ((block.align || 'left') === 'right' ? ' selected' : '') + '>' + I.escapeHtml(L('alignRight')) + '</option></select></div></div><div class="form-group"><label>' + I.escapeHtml(L('fieldText')) + '</label><input type="text" value="' + I.escapeAttr(block.text || '') + '" data-block-field="text" data-index="' + index + '"/></div>';
      } else if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'tip'){
        body = '<div class="form-group"><label>' + I.escapeHtml(L('fieldText')) + '</label><textarea rows="4" data-block-field="text" data-index="' + index + '">' + I.escapeHtml(block.text || '') + '</textarea></div>' + '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldSize')) + '</label><select class="if-select" data-block-field="size" data-index="' + index + '"><option value="small"' + ((block.size || 'medium') === 'small' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeSmall')) + '</option><option value="medium"' + ((block.size || 'medium') === 'medium' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeMedium')) + '</option><option value="large"' + ((block.size || 'medium') === 'large' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeLarge')) + '</option></select></div><div class="form-group"><label>' + I.escapeHtml(L('fieldAlign')) + '</label><select class="if-select" data-block-field="align" data-index="' + index + '"><option value="left"' + ((block.align || 'left') === 'left' ? ' selected' : '') + '>' + I.escapeHtml(L('alignLeft')) + '</option><option value="center"' + ((block.align || 'left') === 'center' ? ' selected' : '') + '>' + I.escapeHtml(L('alignCenter')) + '</option><option value="right"' + ((block.align || 'left') === 'right' ? ' selected' : '') + '>' + I.escapeHtml(L('alignRight')) + '</option></select></div></div>';
      } else if (block.type === 'list'){
        body = '<div class="form-group"><label>' + I.escapeHtml(L('fieldItems')) + '</label><textarea rows="5" data-block-field="items" data-index="' + index + '">' + I.escapeHtml((block.items || []).join('\n')) + '</textarea></div>' + '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldSize')) + '</label><select class="if-select" data-block-field="size" data-index="' + index + '"><option value="small"' + ((block.size || 'medium') === 'small' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeSmall')) + '</option><option value="medium"' + ((block.size || 'medium') === 'medium' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeMedium')) + '</option><option value="large"' + ((block.size || 'medium') === 'large' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeLarge')) + '</option></select></div><div class="form-group"><label>' + I.escapeHtml(L('fieldAlign')) + '</label><select class="if-select" data-block-field="align" data-index="' + index + '"><option value="left"' + ((block.align || 'left') === 'left' ? ' selected' : '') + '>' + I.escapeHtml(L('alignLeft')) + '</option><option value="center"' + ((block.align || 'left') === 'center' ? ' selected' : '') + '>' + I.escapeHtml(L('alignCenter')) + '</option><option value="right"' + ((block.align || 'left') === 'right' ? ' selected' : '') + '>' + I.escapeHtml(L('alignRight')) + '</option></select></div></div>';
      } else if (block.type === 'separator'){
        body = '<p class="muted small">—</p>';
      } else if (block.type === 'image'){
        body = '' +
          '<div class="if-block-image-row">' + (block.path ? '<img class="if-block-image-thumb" loading="lazy" src="' + I.escapeAttr(block.url || publicImageUrl('influencer-post-media', block.path)) + '" alt=""/>' : '<div class="if-block-image-thumb if-block-image-thumb--placeholder">IMG</div>') + '<div class="form-group"><label>' + I.escapeHtml(L('fieldUpload')) + '</label><div class="if-file-control"><button class="btn secondary small" type="button" data-block-upload-trigger="' + index + '">' + I.escapeHtml(L('chooseImage')) + '</button><span class="if-file-name" id="if-block-upload-name-' + index + '">' + I.escapeHtml(L('noFileSelected')) + '</span><input accept="image/png,image/jpeg,image/webp" class="if-native-file" data-block-upload="' + index + '" id="if-block-upload-' + index + '" type="file"/></div><p class="muted small">' + I.escapeHtml(L('imageHelp')) + '</p></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldCaption')) + '</label><input type="text" value="' + I.escapeAttr(block.caption || '') + '" data-block-field="caption" data-index="' + index + '"/></div><div class="form-group"><label>' + I.escapeHtml(L('fieldSize')) + '</label><select class="if-select" data-block-field="size" data-index="' + index + '"><option value="small"' + (block.size === 'small' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeSmall')) + '</option><option value="medium"' + (block.size === 'medium' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeMedium')) + '</option><option value="full"' + (block.size === 'full' ? ' selected' : '') + '>' + I.escapeHtml(L('sizeFull')) + '</option></select></div></div>';
      } else if (block.type === 'stay22'){
        body = '' +
          '<div class="form-row-3"><div class="form-group"><label>' + I.escapeHtml(L('fieldBlockTitle')) + '</label><input type="text" value="' + I.escapeAttr(block.title || '') + '" data-block-field="title" data-index="' + index + '"/></div><div class="form-group"><label>' + I.escapeHtml(L('fieldCta')) + '</label><input type="text" value="' + I.escapeAttr(block.ctaLabel || '') + '" data-block-field="ctaLabel" data-index="' + index + '"/></div><div class="form-group"><label>' + I.escapeHtml(L('fieldWidgetLanguage')) + '</label><select class="if-select" data-block-field="widgetLocale" data-index="' + index + '">' + widgetLocaleOptions(block.widgetLocale || LANG) + '</select></div></div>' +
          '<div class="form-group"><label>' + I.escapeHtml(L('fieldDestination')) + '</label><div class="if-autocomplete"><input autocomplete="off" placeholder="' + I.escapeAttr(L('placeholderDestination')) + '" type="text" value="' + I.escapeAttr(block.destination || '') + '" data-autocomplete-kind="stay22" data-block-field="destination" data-index="' + index + '"/><div class="if-autocomplete__menu" hidden></div></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldCheckin')) + '</label>' + buildDateField('checkin', index, block.checkin || '', L('fieldCheckin')) + '</div><div class="form-group"><label>' + I.escapeHtml(L('fieldCheckout')) + '</label>' + buildDateField('checkout', index, block.checkout || '', L('fieldCheckout')) + '</div></div>' +
          '<div class="form-group"><label>' + I.escapeHtml(L('fieldDescription')) + '</label><textarea rows="3" data-block-field="description" data-index="' + index + '">' + I.escapeHtml(block.description || '') + '</textarea></div>';
      } else if (block.type === 'aviasales'){
        body = '' +
          '<div class="form-row-3"><div class="form-group"><label>' + I.escapeHtml(L('fieldBlockTitle')) + '</label><input type="text" value="' + I.escapeAttr(block.title || '') + '" data-block-field="title" data-index="' + index + '"/></div><div class="form-group"><label>' + I.escapeHtml(L('fieldCta')) + '</label><input type="text" value="' + I.escapeAttr(block.ctaLabel || '') + '" data-block-field="ctaLabel" data-index="' + index + '"/></div><div class="form-group"><label>' + I.escapeHtml(L('fieldWidgetLanguage')) + '</label><select class="if-select" data-block-field="widgetLocale" data-index="' + index + '">' + widgetLocaleOptions(block.widgetLocale || LANG) + '</select></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldOrigin')) + '</label><div class="if-autocomplete"><input autocomplete="off" placeholder="' + I.escapeAttr(L('placeholderAirport')) + '" type="text" value="' + I.escapeAttr(block.origin || '') + '" data-autocomplete-kind="airport" data-block-field="origin" data-index="' + index + '"/><div class="if-autocomplete__menu" hidden></div></div></div><div class="form-group"><label>' + I.escapeHtml(L('fieldDestinationAirport')) + '</label><div class="if-autocomplete"><input autocomplete="off" placeholder="' + I.escapeAttr(L('placeholderAirport')) + '" type="text" value="' + I.escapeAttr(block.destination || '') + '" data-autocomplete-kind="airport" data-block-field="destination" data-index="' + index + '"/><div class="if-autocomplete__menu" hidden></div></div></div></div>' +
          '<div class="form-row-2"><div class="form-group"><label>' + I.escapeHtml(L('fieldDepartDate')) + '</label>' + buildDateField('checkin', index, block.checkin || '', L('fieldDepartDate')) + '</div><div class="form-group"><label>' + I.escapeHtml(L('fieldReturnDate')) + '</label>' + buildDateField('returnDate', index, block.returnDate || '', L('fieldReturnDate')) + '</div></div>' +
          '<div class="form-group"><label>' + I.escapeHtml(L('fieldDescription')) + '</label><textarea rows="3" data-block-field="description" data-index="' + index + '">' + I.escapeHtml(block.description || '') + '</textarea></div>';
      }
      return '<article class="if-block-card" data-block-type="' + I.escapeAttr(block.type) + '"><div class="if-block-card__head"><strong>' + I.escapeHtml(t('block' + block.type.charAt(0).toUpperCase() + block.type.slice(1)) || block.type) + '</strong>' + controls + '</div><div class="if-block-card__body">' + body + '</div></article>';
    }).join('');

    bindBlockEditorEvents();
    enhanceCustomSelects($('#if-editor-panel') || APP || document);
    enhanceDateFields($('#if-editor-panel') || APP || document);
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
        if (idx >= 0){ state.editorData.blocks.splice(idx, 1); renderEditor(); }
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
    state.editorBaseline = canonicalizePostEditor(state.editorData);
    state.autoSlug = true;
    state.previewVisible = false;
    state.postPreviewVisible = false;
    state.editorOpen = !!openComposer;
    state.editorBaseline = canonicalizePostEditor(state.editorData);
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
    var revision = getPendingPostRevision(post);
    if (!revision && post.current_pending_revision_id){
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
    state.editorBaseline = canonicalizePostEditor(state.editorData);
    state.editorOpen = true;
    renderEditor();
    var panel = $('#if-editor-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function deletePost(postId){
    if (!state.client) return;
    try{
      var nowIso = new Date().toISOString();
      try{
        await state.client
          .from('influencer_post_revisions')
          .update({
            status: 'archived',
            review_notes: 'Deleted by creator',
            reviewed_at: nowIso
          })
          .eq('post_id', postId)
          .in('status', ['draft', 'pending_review', 'changes_requested', 'rejected']);
      }catch(_revErr){ }
      var result = await state.client
        .from('influencer_posts')
        .update({
          status: 'deleted',
          deleted_at: nowIso,
          current_pending_revision_id: null,
          review_notes: null,
          updated_at: nowIso
        })
        .eq('id', postId);
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
    VISIBLE_SOCIALS.forEach(function(platform){
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
    VISIBLE_SOCIALS.forEach(function(platform){
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

  async function saveProfile(options){
    if (!state.client) return false;
    options = options || {};
    try{
      var currentForm = canonicalizeProfileDraft(readProfileForm());
      var baseline = canonicalizeProfileDraft(state.profileBaseline || state.profileDraft || emptyProfileDraft());
      if (JSON.stringify(currentForm) === JSON.stringify(baseline)){
        notify(L('profileNoChangesError'), 'error');
        return false;
      }
      if (!options.skipConfirm){
        showSaveConfirmPopup(L('profileSaveConfirm'), function(){ return saveProfile({ skipConfirm: true }); });
        return false;
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

  async function savePost(options){

    if (!state.client || !state.editorData) return false;
    options = options || {};
    updateEditorStateFromForm();
    try{
      if (!hasAnyEditorContent(state.editorData) || !hasPostChanges()){
        notify(L('postNoChangesError'), 'error');
        return false;
      }
      if (!options.skipConfirm){
        showSaveConfirmPopup(L('postSaveConfirm'), function(){ return savePost({ skipConfirm: true, closeAfterSave: !!options.closeAfterSave }); });
        return false;
      }

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
          status: 'pending_review'
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
      var storedContentJson = injectEditorMetaBlock(editor.blocks, editor);
      var contentHtml = renderContentHtml(editor.blocks, { creatorSlug: state.affiliateSlug, postShortId: postBase.post_short_id || editor.post_short_id, postId: postBase.id, postSlug: postBase.post_slug || editor.post_slug });
      var revisionPayload = {
        post_id: postBase.id,
        revision_no: revisionNo,
        title: editor.title,
        excerpt: editor.excerpt || null,
        cover_path: editor.cover_path || null,
        content_json: storedContentJson,
        content_html: contentHtml,
        widgets_json: normalized.widgets,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
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
        status: postBase.current_live_revision_id ? 'published' : 'pending_review',
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
      await loadDashboardData();
      resetEditor(false);
      showProfilePopup(L('postReviewPopup'));
      if (options.closeAfterSave) setEditorPanelVisibility(false);
      return true;
    }catch(err){
      console.error(err);
      notify(err.message || 'Errore salvataggio post.', 'error');
      return false;
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
    state.postPendingRevisions = {};
    var pendingRevisionIds = state.posts.map(function(item){ return item.current_pending_revision_id; }).filter(Boolean);
    if (pendingRevisionIds.length){
      try{
        var pendingRowsResp = await state.client.from('influencer_post_revisions').select('*').in('id', pendingRevisionIds);
        var pendingRows = pendingRowsResp && pendingRowsResp.data ? pendingRowsResp.data : [];
        pendingRows.forEach(function(row){ if (row && row.post_id) state.postPendingRevisions[row.post_id] = row; });
      }catch(_pendingErr){ state.postPendingRevisions = {}; }
    }
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
    state.editorBaseline = canonicalizePostEditor(state.editorData);
    state.editorOpen = false;
    state.profileFormOpen = false;
    state.statsPanelOpen = false;
    await loadDashboardData();
    if (!state.currentPost) resetEditor(false);
  }

  init();
})();
