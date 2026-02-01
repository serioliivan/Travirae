(function(){
  'use strict';

  function getLangCode(){
    try{
      if (typeof window.TraviraeGetSiteLang === 'function') return window.TraviraeGetSiteLang();
    }catch(e){}
    try{
      return String(localStorage.getItem('travirae_email_lang') || '').toUpperCase();
    }catch(e){}
    var htmlLang = String(document.documentElement.lang || '').toLowerCase();
    if (htmlLang.indexOf('de') === 0) return 'DEU';
    if (htmlLang.indexOf('en') === 0) return 'ENG';
    if (htmlLang.indexOf('fr') === 0) return 'FRA';
    if (htmlLang.indexOf('es') === 0) return 'SPA';
    if (htmlLang.indexOf('ru') === 0) return 'RUS';
    if (htmlLang.indexOf('ar') === 0) return 'ARA';
    if (htmlLang.indexOf('nl') === 0) return 'NLD';
    if (htmlLang.indexOf('zh') === 0) return 'ZHO';
    return 'ITA';
  }

  const lang = String(getLangCode() || '').toUpperCase();
  const IS_DE = lang === 'DEU';
  const IS_EN = lang === 'ENG';
  const IS_FR = lang === 'FRA';
  const IS_ES = lang === 'SPA';
  const IS_RU = lang === 'RUS';
  const IS_AR = lang === 'ARA';
  const IS_NL = lang === 'NLD';
  const IS_ZH = lang === 'ZHO';

  const statusEl = document.getElementById('unsub-status');
  function setStatus(txt){ if (statusEl) statusEl.textContent = txt; }

  const params = new URLSearchParams(window.location.search);
  const token = (params.get('token') || '').trim();

  if (!token) {
    setStatus(IS_DE ? 'Token fehlt. Der Link könnte unvollständig sein.'
      : (IS_EN ? 'Missing token. The link may be incomplete.'
      : (IS_FR ? 'Jeton manquant. Le lien est peut‑être incomplet.'
      : (IS_ES ? 'Falta el token. El enlace puede estar incompleto.'
      : (IS_RU ? 'Отсутствует токен. Ссылка может быть неполной.'
      : (IS_AR ? 'الرمز مفقود. قد يكون الرابط غير مكتمل.'
      : (IS_NL ? 'Token ontbreekt. De link is mogelijk onvolledig.'
      : (IS_ZH ? '缺少令牌。链接可能不完整。'
      : 'Token mancante. Il link potrebbe essere incompleto.'))))))));
    return;
  }

  async function unsubscribe(){
    try {
      if (!window.supabaseClient?.functions?.invoke) {
        throw new Error(IS_DE ? 'Supabase nicht initialisiert'
          : (IS_EN ? 'Supabase not initialised'
          : (IS_FR ? 'Supabase n\'est pas initialisé'
          : (IS_ES ? 'Supabase no está inicializado'
          : (IS_RU ? 'Supabase не инициализирован'
          : (IS_AR ? 'لم يتم تهيئة Supabase'
          : (IS_NL ? 'Supabase is niet geïnitialiseerd'
          : (IS_ZH ? 'Supabase 未初始化'
          : 'Supabase non inizializzato'))))))));
      }

      const { data, error } = await window.supabaseClient.functions.invoke('newsletter-unsubscribe', {
        body: { token }
      });

      if (error) throw error;

      if (data?.ok) {
        setStatus(IS_DE ? 'Abmeldung abgeschlossen. Du erhältst den Newsletter nicht mehr.'
          : (IS_EN ? 'Unsubscription completed. You will no longer receive the newsletter.'
          : (IS_FR ? 'Désinscription effectuée. Tu ne recevras plus la newsletter.'
          : (IS_ES ? 'Cancelación de suscripción completada. Ya no recibirás el boletín.'
          : (IS_RU ? 'Отписка выполнена. Вы больше не будете получать рассылку.'
          : (IS_AR ? 'تم إلغاء الاشتراك بنجاح. لن تتلقى النشرة البريدية بعد الآن.'
          : (IS_NL ? 'Uitschrijven voltooid. Je ontvangt de nieuwsbrief niet meer.'
          : (IS_ZH ? '已成功取消订阅。你将不再收到邮件通讯。'
          : 'Disiscrizione completata. Non riceverai più la newsletter.'))))))));
      } else {
        setStatus(IS_DE ? 'Wir konnten die Abmeldung nicht abschließen.'
          : (IS_EN ? 'We could not complete the unsubscription.'
          : (IS_FR ? 'Impossible de finaliser la désinscription.'
          : (IS_ES ? 'No pudimos completar la cancelación de suscripción.'
          : (IS_RU ? 'Не удалось завершить отписку.'
          : (IS_AR ? 'لم نتمكن من إكمال إلغاء الاشتراك.'
          : (IS_NL ? 'We konden het uitschrijven niet voltooien.'
          : (IS_ZH ? '我们无法完成取消订阅。'
          : 'Non siamo riusciti a completare la disiscrizione.'))))))));
      }
    } catch (e) {
      console.error(e);
      setStatus(IS_DE ? 'Fehler bei der Abmeldung. Bitte versuche es später erneut.'
        : (IS_EN ? 'Error while unsubscribing. Please try again later.'
        : (IS_FR ? 'Erreur lors de la désinscription. Réessaie plus tard.'
        : (IS_ES ? 'Error al cancelar la suscripción. Inténtalo de nuevo más tarde.'
        : (IS_RU ? 'Ошибка при отписке. Пожалуйста, попробуйте позже.'
        : (IS_AR ? 'حدث خطأ أثناء إلغاء الاشتراك. حاول مرة أخرى لاحقًا.'
        : (IS_NL ? 'Er is een fout opgetreden bij het uitschrijven. Probeer het later opnieuw.'
        : (IS_ZH ? '取消订阅时出错。请稍后再试。'
        : 'Errore durante la disiscrizione. Riprova più tardi.'))))))));
    }
  }

  unsubscribe();
})();
