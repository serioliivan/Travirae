/*! Travirae custom accommodation search widget — official Stay22 searchbar endpoint */
(function(){
  'use strict';

  var AID = 'travirae';
  var SEARCH_ENDPOINT = 'https://www.stay22.com/allez/searchbar';
  var FALLBACK_DESTINATIONS = [
    'Rome / Roma, Italy','Paris, France','London, United Kingdom','New York, United States',
    'Barcelona, Spain','Tokyo, Japan','Dubai, United Arab Emirates','Amsterdam, Netherlands',
    'Lisbon, Portugal','Bangkok, Thailand','Bali, Indonesia','Iseo, Italy'
  ];

  var COPY = {
    it:{guestsOne:'ospite',guestsMany:'ospiti',searching:'Apro gli hotel…',destinationRequired:'Inserisci una destinazione.',datesRequired:'Seleziona le date di check-in e check-out.',dateOrder:'Il check-out deve essere successivo al check-in.',genericError:'Controlla i dati inseriti e riprova.'},
    en:{guestsOne:'guest',guestsMany:'guests',searching:'Opening hotels…',destinationRequired:'Enter a destination.',datesRequired:'Select check-in and check-out dates.',dateOrder:'Check-out must be after check-in.',genericError:'Check the information and try again.'},
    de:{guestsOne:'Gast',guestsMany:'Gäste',searching:'Hotels werden geöffnet…',destinationRequired:'Gib ein Reiseziel ein.',datesRequired:'Wähle Anreise- und Abreisedatum.',dateOrder:'Die Abreise muss nach der Anreise liegen.',genericError:'Prüfe deine Angaben und versuche es erneut.'},
    fr:{guestsOne:'voyageur',guestsMany:'voyageurs',searching:'Ouverture des hôtels…',destinationRequired:'Saisissez une destination.',datesRequired:'Sélectionnez les dates d’arrivée et de départ.',dateOrder:'La date de départ doit être postérieure à l’arrivée.',genericError:'Vérifiez les informations et réessayez.'},
    es:{guestsOne:'huésped',guestsMany:'huéspedes',searching:'Abriendo hoteles…',destinationRequired:'Introduce un destino.',datesRequired:'Selecciona las fechas de entrada y salida.',dateOrder:'La salida debe ser posterior a la entrada.',genericError:'Revisa los datos e inténtalo de nuevo.'},
    nl:{guestsOne:'gast',guestsMany:'gasten',searching:'Hotels openen…',destinationRequired:'Vul een bestemming in.',datesRequired:'Selecteer de in- en uitcheckdatum.',dateOrder:'Uitchecken moet na inchecken zijn.',genericError:'Controleer de gegevens en probeer opnieuw.'},
    ru:{guestsOne:'гость',guestsMany:'гостей',searching:'Открываем отели…',destinationRequired:'Укажите направление.',datesRequired:'Выберите даты заезда и выезда.',dateOrder:'Дата выезда должна быть позже даты заезда.',genericError:'Проверьте данные и повторите попытку.'},
    ar:{guestsOne:'ضيف',guestsMany:'ضيوف',searching:'جارٍ فتح الفنادق…',destinationRequired:'أدخل وجهة.',datesRequired:'اختر تاريخي الوصول والمغادرة.',dateOrder:'يجب أن يكون تاريخ المغادرة بعد الوصول.',genericError:'تحقق من البيانات وحاول مرة أخرى.'},
    zh:{guestsOne:'位旅客',guestsMany:'位旅客',searching:'正在打开酒店…',destinationRequired:'请输入目的地。',datesRequired:'请选择入住和退房日期。',dateOrder:'退房日期必须晚于入住日期。',genericError:'请检查信息后重试。'}
  };

  var LOCALE_CONFIG = {
    it:{lang:'it',currency:'EUR'}, en:{lang:'en',currency:'USD'}, de:{lang:'de',currency:'EUR'},
    fr:{lang:'fr',currency:'EUR'}, es:{lang:'es',currency:'EUR'}, nl:{lang:'nl',currency:'EUR'},
    ru:{lang:'ru',currency:'RUB'}, ar:{lang:'ar',currency:'AED'}, zh:{lang:'zh',currency:'CNY'}
  };

  function currentLocale(){
    var lang = String((document.documentElement && document.documentElement.lang) || 'it').toLowerCase().split(/[-_]/)[0];
    return COPY[lang] ? lang : 'it';
  }

  function normalize(value){
    var text = String(value || '').toLowerCase();
    try{ text = text.normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(_e){}
    return text.replace(/\s+/g,' ').trim();
  }

  function dateToIso(date){
    var y = date.getFullYear();
    var m = String(date.getMonth()+1).padStart(2,'0');
    var d = String(date.getDate()).padStart(2,'0');
    return y + '-' + m + '-' + d;
  }

  function addDaysIso(iso, days){
    var parts = String(iso || '').split('-').map(Number);
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return '';
    var date = new Date(parts[0],parts[1]-1,parts[2]);
    date.setDate(date.getDate() + days);
    return dateToIso(date);
  }

  function isAfter(a,b){ return !!(a && b && String(a) > String(b)); }

  function initWidget(root){
    if (!root || root.getAttribute('data-initialized') === '1') return;
    root.setAttribute('data-initialized','1');

    var locale = currentLocale();
    var copy = COPY[locale] || COPY.it;
    var localeCfg = LOCALE_CONFIG[locale] || LOCALE_CONFIG.it;
    var form = root.querySelector('#travirae-stay-search-form');
    var destination = root.querySelector('#travirae-stay-destination');
    var checkin = root.querySelector('#travirae-stay-checkin');
    var checkout = root.querySelector('#travirae-stay-checkout');
    var adultsInput = root.querySelector('#travirae-stay-adults');
    var childrenInput = root.querySelector('#travirae-stay-children');
    var guestButton = root.querySelector('#travirae-stay-guests-button');
    var guestPanel = root.querySelector('#travirae-stay-guests-panel');
    var guestDone = root.querySelector('[data-guest-done]');
    var guestSummary = root.querySelector('[data-guest-summary]');
    var suggestions = root.querySelector('#travirae-stay-suggestions');
    var submitButton = root.querySelector('.travirae-stay-search__submit');
    var submitLabel = root.querySelector('[data-submit-label]');
    var errorBox = root.querySelector('[data-search-error]');
    var campaignInput = root.querySelector('input[name="campaign"]');
    var langInput = root.querySelector('input[name="lang"]');
    var currencyInput = root.querySelector('input[name="currency"]');
    var fieldDestination = root.querySelector('[data-field="destination"]');
    var fieldCheckin = root.querySelector('[data-field="checkin"]');
    var fieldCheckout = root.querySelector('[data-field="checkout"]');
    var originalSubmitText = submitLabel ? submitLabel.textContent : '';
    var allDestinations = FALLBACK_DESTINATIONS.slice();
    var renderedSuggestions = [];
    var activeSuggestion = -1;
    var navigating = false;

    if (!form || !destination || !checkin || !checkout || !adultsInput || !childrenInput) return;

    if (langInput) langInput.value = localeCfg.lang;
    if (currencyInput) currencyInput.value = localeCfg.currency;

    function getAffiliateId(){
      try{
        if (window.traviraeAffiliate && typeof window.traviraeAffiliate.getId === 'function') {
          return String(window.traviraeAffiliate.getId() || '').trim();
        }
      }catch(_e){}
      return '';
    }

    function setError(message, field){
      [fieldDestination,fieldCheckin,fieldCheckout].forEach(function(item){ if(item) item.classList.remove('is-invalid'); });
      if (field) field.classList.add('is-invalid');
      if (errorBox) errorBox.textContent = message || '';
    }

    function clearError(){ setError('',null); }

    function guestCount(){
      return Math.max(1,Number(adultsInput.value || 1)) + Math.max(0,Number(childrenInput.value || 0));
    }

    function updateGuestSummary(){
      var total = guestCount();
      if (guestSummary) guestSummary.textContent = total + ' ' + (total === 1 ? copy.guestsOne : copy.guestsMany);
      root.querySelectorAll('[data-step-output]').forEach(function(out){
        var target = out.getAttribute('data-step-output');
        var input = target === 'adults' ? adultsInput : childrenInput;
        out.textContent = input ? String(input.value || '0') : '0';
      });
      root.querySelectorAll('[data-step-action]').forEach(function(button){
        var target = button.getAttribute('data-step-target');
        var action = button.getAttribute('data-step-action');
        var input = target === 'adults' ? adultsInput : childrenInput;
        if (!input) return;
        var min = Number(input.min || 0);
        var max = Number(input.max || 10);
        var value = Number(input.value || 0);
        button.disabled = (action === 'decrease' && value <= min) || (action === 'increase' && value >= max);
      });
    }

    function setGuestPanel(open){
      if (!guestPanel || !guestButton) return;
      guestPanel.hidden = !open;
      guestButton.setAttribute('aria-expanded',open ? 'true' : 'false');
    }

    if (guestButton){
      guestButton.addEventListener('click',function(event){
        event.preventDefault();
        setGuestPanel(guestPanel ? guestPanel.hidden : true);
      });
    }
    if (guestDone) guestDone.addEventListener('click',function(){ setGuestPanel(false); guestButton && guestButton.focus(); });

    root.querySelectorAll('[data-step-action]').forEach(function(button){
      button.addEventListener('click',function(){
        var target = button.getAttribute('data-step-target');
        var action = button.getAttribute('data-step-action');
        var input = target === 'adults' ? adultsInput : childrenInput;
        if (!input) return;
        var min = Number(input.min || 0);
        var max = Number(input.max || 10);
        var value = Number(input.value || 0) + (action === 'increase' ? 1 : -1);
        input.value = String(Math.min(max,Math.max(min,value)));
        updateGuestSummary();
      });
    });

    document.addEventListener('click',function(event){
      if (guestPanel && !guestPanel.hidden && !root.querySelector('.travirae-stay-search__field--guests').contains(event.target)) setGuestPanel(false);
      if (suggestions && !suggestions.hidden && !root.querySelector('.travirae-stay-search__field--destination').contains(event.target)) hideSuggestions();
    });
    document.addEventListener('keydown',function(event){
      if (event.key === 'Escape'){
        setGuestPanel(false);
        hideSuggestions();
      }
    });

    var today = dateToIso(new Date());
    checkin.min = today;
    checkout.min = addDaysIso(today,1);
    checkin.addEventListener('change',function(){
      clearError();
      checkout.min = checkin.value ? addDaysIso(checkin.value,1) : addDaysIso(today,1);
      if (checkin.value && checkout.value && !isAfter(checkout.value,checkin.value)) checkout.value = addDaysIso(checkin.value,1);
    });
    checkout.addEventListener('change',clearError);
    destination.addEventListener('input',function(){ clearError(); renderSuggestions(destination.value); });

    function hideSuggestions(){
      if (!suggestions) return;
      suggestions.hidden = true;
      suggestions.innerHTML = '';
      renderedSuggestions = [];
      activeSuggestion = -1;
      destination.removeAttribute('aria-activedescendant');
    }

    function chooseSuggestion(value){
      destination.value = value;
      hideSuggestions();
      destination.focus();
    }

    function setActiveSuggestion(index){
      if (!renderedSuggestions.length) return;
      activeSuggestion = (index + renderedSuggestions.length) % renderedSuggestions.length;
      renderedSuggestions.forEach(function(btn,i){
        var active = i === activeSuggestion;
        btn.setAttribute('aria-selected',active ? 'true' : 'false');
        if (active){
          destination.setAttribute('aria-activedescendant',btn.id);
          try{ btn.scrollIntoView({block:'nearest'}); }catch(_e){}
        }
      });
    }

    function renderSuggestions(term){
      if (!suggestions) return;
      var query = normalize(term);
      if (query.length < 2){ hideSuggestions(); return; }
      var matches = allDestinations.map(function(label){
        var normalized = normalize(label);
        var score = normalized.indexOf(query) === 0 ? 0 : (normalized.indexOf(' '+query) !== -1 ? 1 : (normalized.indexOf(query) !== -1 ? 2 : 9));
        return {label:label,score:score};
      }).filter(function(item){ return item.score < 9; })
        .sort(function(a,b){ return a.score-b.score || a.label.localeCompare(b.label); })
        .slice(0,8);
      suggestions.innerHTML = '';
      renderedSuggestions = [];
      activeSuggestion = -1;
      if (!matches.length){ suggestions.hidden = true; return; }
      matches.forEach(function(item,index){
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'travirae-stay-search__suggestion';
        button.id = 'travirae-stay-suggestion-' + index;
        button.setAttribute('role','option');
        button.setAttribute('aria-selected','false');
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg><span></span>';
        button.querySelector('span').textContent = item.label;
        button.addEventListener('mousedown',function(event){ event.preventDefault(); });
        button.addEventListener('click',function(){ chooseSuggestion(item.label); });
        suggestions.appendChild(button);
        renderedSuggestions.push(button);
      });
      suggestions.hidden = false;
    }

    destination.addEventListener('keydown',function(event){
      if (!suggestions || suggestions.hidden || !renderedSuggestions.length) return;
      if (event.key === 'ArrowDown'){ event.preventDefault(); setActiveSuggestion(activeSuggestion+1); }
      else if (event.key === 'ArrowUp'){ event.preventDefault(); setActiveSuggestion(activeSuggestion-1); }
      else if (event.key === 'Enter' && activeSuggestion >= 0){
        event.preventDefault();
        var selected = renderedSuggestions[activeSuggestion];
        if (selected) chooseSuggestion(selected.textContent.trim());
      }else if (event.key === 'Escape'){ hideSuggestions(); }
    });

    try{
      fetch('assets/data/widget-autocomplete.json',{credentials:'same-origin',cache:'force-cache'})
        .then(function(response){ return response.ok ? response.json() : null; })
        .then(function(data){
          if (!data || !Array.isArray(data.stay22Destinations)) return;
          var seen = Object.create(null);
          allDestinations = data.stay22Destinations.concat(FALLBACK_DESTINATIONS).map(function(item){ return String(item || '').trim(); }).filter(function(item){
            var key = normalize(item);
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
          });
        }).catch(function(){});
    }catch(_fetchError){}

    form.addEventListener('submit',function(event){
      event.preventDefault();
      if (navigating) return;
      clearError();
      hideSuggestions();
      setGuestPanel(false);

      var destinationValue = String(destination.value || '').trim();
      if (!destinationValue){ setError(copy.destinationRequired,fieldDestination); destination.focus(); return; }
      if (!checkin.value || !checkout.value){
        var missingField = !checkin.value ? fieldCheckin : fieldCheckout;
        setError(copy.datesRequired,missingField);
        (!checkin.value ? checkin : checkout).focus();
        return;
      }
      if (!isAfter(checkout.value,checkin.value)){
        setError(copy.dateOrder,fieldCheckout);
        checkout.focus();
        return;
      }

      try{
        var url = new URL(SEARCH_ENDPOINT);
        url.searchParams.set('aid',AID);
        url.searchParams.set('address',destinationValue);
        url.searchParams.set('checkin',checkin.value);
        url.searchParams.set('checkout',checkout.value);
        url.searchParams.set('adults',String(Math.max(1,Number(adultsInput.value || 1))));
        var children = Math.max(0,Number(childrenInput.value || 0));
        if (children > 0) url.searchParams.set('children',String(children));
        url.searchParams.set('lang',localeCfg.lang);
        url.searchParams.set('currency',localeCfg.currency);

        var affiliateId = getAffiliateId();
        if (affiliateId){
          url.searchParams.set('campaign',affiliateId);
          if (campaignInput) campaignInput.value = affiliateId;
        }else if (campaignInput){
          campaignInput.value = '';
        }
        if (langInput) langInput.value = localeCfg.lang;
        if (currencyInput) currencyInput.value = localeCfg.currency;

        try{
          if (window.traviraeAffiliate && typeof window.traviraeAffiliate.trackWidgetOutbound === 'function'){
            var tracked = window.traviraeAffiliate.trackWidgetOutbound({
              partner:'stay22',
              context:'homepage_stay22_search',
              href:url.toString(),
              destination:destinationValue,
              affiliateSlug:affiliateId,
              dedupeKey:'sitewidget_stay22_home_' + destinationValue + '_' + checkin.value + '_' + checkout.value,
              dedupeMs:1500
            });
            if (tracked && typeof tracked.catch === 'function') tracked.catch(function(){});
          }
        }catch(_trackError){}

        navigating = true;
        submitButton.disabled = true;
        if (submitLabel) submitLabel.textContent = copy.searching;
        window.setTimeout(function(){ window.location.assign(url.toString()); },90);
      }catch(_urlError){
        navigating = false;
        submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = originalSubmitText;
        setError(copy.genericError,null);
      }
    });

    updateGuestSummary();
  }

  function boot(){
    var root = document.getElementById('travirae-stay-search');
    if (root) initWidget(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
