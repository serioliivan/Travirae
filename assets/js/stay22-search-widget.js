/*! Travirae custom accommodation search widget — official Stay22 searchbar endpoint */
(function(){
  'use strict';

  var AID = 'travirae';
  var SEARCH_ENDPOINT = 'https://www.stay22.com/allez/searchbar';
  var HOTEL_ENDPOINT = 'https://www.stay22.com/allez/booking';
  var FALLBACK_DESTINATIONS = [
    'Rome / Roma, Italy','Paris, France','London, United Kingdom','New York, United States',
    'Barcelona, Spain','Tokyo, Japan','Dubai, United Arab Emirates','Amsterdam, Netherlands',
    'Lisbon, Portugal','Bangkok, Thailand','Bali, Indonesia','Iseo, Italy'
  ];

  // Exact Booking.com property links for known name collisions or listings
  // that Booking finds correctly but Stay22/OTA search may resolve ambiguously.
  // The final click still passes through Stay22 Allez with aid=travirae and
  // the existing creator/affiliate campaign, so attribution is preserved.
  var BOOKING_PROPERTY_OVERRIDES = [
    {
      nameTokens:['nizza'],
      locationTokens:['riccione'],
      url:'https://www.booking.com/hotel/it/nizza-riccione.html'
    }
  ];

  var COPY = {
    it:{guestsOne:'ospite',guestsMany:'ospiti',searching:'Apro gli hotel…',searchingSpecific:'Cerco l’hotel…',specificSubmit:'Trova questo hotel',destinationRequired:'Inserisci una destinazione.',hotelNameRequired:'Inserisci il nome dell’hotel.',hotelLocationRequired:'Inserisci la città o il Paese dell’hotel.',hotelSelectionRequired:'Scrivi il nome e seleziona una struttura dall’elenco.',hotelAutocompleteLoading:'Ricerca hotel…',hotelAutocompleteNoResults:'Nessuna struttura trovata. Prova ad aggiungere la città o il Paese.',hotelAutocompleteUnavailable:'Ricerca hotel temporaneamente non disponibile. Usa la ricerca per destinazione.',hotelAutocompleteSelecting:'Recupero i dettagli della struttura…',datesRequired:'Seleziona le date di check-in e check-out.',dateOrder:'Il check-out deve essere successivo al check-in.',genericError:'Controlla i dati inseriti e riprova.',datePlaceholder:'gg/mm/aaaa',today:'Oggi',close:'Chiudi'},
    en:{guestsOne:'guest',guestsMany:'guests',searching:'Opening hotels…',searchingSpecific:'Finding the hotel…',specificSubmit:'Find this hotel',destinationRequired:'Enter a destination.',hotelNameRequired:'Enter the hotel name.',hotelLocationRequired:'Enter the hotel city or country.',hotelSelectionRequired:'Type the name and select a property from the list.',hotelAutocompleteLoading:'Searching hotels…',hotelAutocompleteNoResults:'No property found. Try adding the city or country.',hotelAutocompleteUnavailable:'Hotel search is temporarily unavailable. Use destination search.',hotelAutocompleteSelecting:'Loading property details…',datesRequired:'Select check-in and check-out dates.',dateOrder:'Check-out must be after check-in.',genericError:'Check the information and try again.',datePlaceholder:'dd/mm/yyyy',today:'Today',close:'Close'},
    de:{guestsOne:'Gast',guestsMany:'Gäste',searching:'Hotels werden geöffnet…',searchingSpecific:'Hotel wird gesucht…',specificSubmit:'Dieses Hotel finden',destinationRequired:'Gib ein Reiseziel ein.',hotelNameRequired:'Gib den Hotelnamen ein.',hotelLocationRequired:'Gib die Stadt oder das Land des Hotels ein.',hotelSelectionRequired:'Gib den Namen ein und wähle eine Unterkunft aus der Liste.',hotelAutocompleteLoading:'Hotels werden gesucht…',hotelAutocompleteNoResults:'Keine Unterkunft gefunden. Ergänze Stadt oder Land.',hotelAutocompleteUnavailable:'Die Hotelsuche ist vorübergehend nicht verfügbar. Nutze die Reisezielsuche.',hotelAutocompleteSelecting:'Unterkunftsdetails werden geladen…',datesRequired:'Wähle Anreise- und Abreisedatum.',dateOrder:'Die Abreise muss nach der Anreise liegen.',genericError:'Prüfe deine Angaben und versuche es erneut.',datePlaceholder:'tt/mm/jjjj',today:'Heute',close:'Schließen'},
    fr:{guestsOne:'voyageur',guestsMany:'voyageurs',searching:'Ouverture des hôtels…',searchingSpecific:'Recherche de l’hôtel…',specificSubmit:'Trouver cet hôtel',destinationRequired:'Saisissez une destination.',hotelNameRequired:'Saisissez le nom de l’hôtel.',hotelLocationRequired:'Saisissez la ville ou le pays de l’hôtel.',hotelSelectionRequired:'Saisissez le nom puis sélectionnez un hébergement dans la liste.',hotelAutocompleteLoading:'Recherche d’hôtels…',hotelAutocompleteNoResults:'Aucun hébergement trouvé. Ajoutez la ville ou le pays.',hotelAutocompleteUnavailable:'La recherche d’hôtels est temporairement indisponible. Utilisez la recherche par destination.',hotelAutocompleteSelecting:'Chargement des détails de l’hébergement…',datesRequired:'Sélectionnez les dates d’arrivée et de départ.',dateOrder:'La date de départ doit être postérieure à l’arrivée.',genericError:'Vérifiez les informations et réessayez.',datePlaceholder:'jj/mm/aaaa',today:'Aujourd’hui',close:'Fermer'},
    es:{guestsOne:'huésped',guestsMany:'huéspedes',searching:'Abriendo hoteles…',searchingSpecific:'Buscando el hotel…',specificSubmit:'Encontrar este hotel',destinationRequired:'Introduce un destino.',hotelNameRequired:'Introduce el nombre del hotel.',hotelLocationRequired:'Introduce la ciudad o el país del hotel.',hotelSelectionRequired:'Escribe el nombre y selecciona un alojamiento de la lista.',hotelAutocompleteLoading:'Buscando hoteles…',hotelAutocompleteNoResults:'No se encontró ningún alojamiento. Añade la ciudad o el país.',hotelAutocompleteUnavailable:'La búsqueda de hoteles no está disponible temporalmente. Usa la búsqueda por destino.',hotelAutocompleteSelecting:'Cargando los datos del alojamiento…',datesRequired:'Selecciona las fechas de entrada y salida.',dateOrder:'La salida debe ser posterior a la entrada.',genericError:'Revisa los datos e inténtalo de nuevo.',datePlaceholder:'dd/mm/aaaa',today:'Hoy',close:'Cerrar'},
    nl:{guestsOne:'gast',guestsMany:'gasten',searching:'Hotels openen…',searchingSpecific:'Hotel zoeken…',specificSubmit:'Vind dit hotel',destinationRequired:'Vul een bestemming in.',hotelNameRequired:'Vul de hotelnaam in.',hotelLocationRequired:'Vul de stad of het land van het hotel in.',hotelSelectionRequired:'Typ de naam en kies een accommodatie uit de lijst.',hotelAutocompleteLoading:'Hotels zoeken…',hotelAutocompleteNoResults:'Geen accommodatie gevonden. Voeg de stad of het land toe.',hotelAutocompleteUnavailable:'Hotel zoeken is tijdelijk niet beschikbaar. Gebruik zoeken op bestemming.',hotelAutocompleteSelecting:'Accommodatiegegevens laden…',datesRequired:'Selecteer de in- en uitcheckdatum.',dateOrder:'Uitchecken moet na inchecken zijn.',genericError:'Controleer de gegevens en probeer opnieuw.',datePlaceholder:'dd/mm/jjjj',today:'Vandaag',close:'Sluiten'},
    ru:{guestsOne:'гость',guestsMany:'гостей',searching:'Открываем отели…',searchingSpecific:'Ищем отель…',specificSubmit:'Найти этот отель',destinationRequired:'Укажите направление.',hotelNameRequired:'Укажите название отеля.',hotelLocationRequired:'Укажите город или страну отеля.',hotelSelectionRequired:'Введите название и выберите объект размещения из списка.',hotelAutocompleteLoading:'Поиск отелей…',hotelAutocompleteNoResults:'Объект размещения не найден. Добавьте город или страну.',hotelAutocompleteUnavailable:'Поиск отелей временно недоступен. Используйте поиск по направлению.',hotelAutocompleteSelecting:'Загрузка данных объекта размещения…',datesRequired:'Выберите даты заезда и выезда.',dateOrder:'Дата выезда должна быть позже даты заезда.',genericError:'Проверьте данные и повторите попытку.',datePlaceholder:'дд/мм/гггг',today:'Сегодня',close:'Закрыть'},
    ar:{guestsOne:'ضيف',guestsMany:'ضيوف',searching:'جارٍ فتح الفنادق…',searchingSpecific:'جارٍ البحث عن الفندق…',specificSubmit:'اعثر على هذا الفندق',destinationRequired:'أدخل وجهة.',hotelNameRequired:'أدخل اسم الفندق.',hotelLocationRequired:'أدخل مدينة الفندق أو دولته.',hotelSelectionRequired:'اكتب الاسم واختر مكان إقامة من القائمة.',hotelAutocompleteLoading:'جارٍ البحث عن الفنادق…',hotelAutocompleteNoResults:'لم يتم العثور على مكان إقامة. أضف المدينة أو الدولة.',hotelAutocompleteUnavailable:'البحث عن الفنادق غير متاح مؤقتًا. استخدم البحث حسب الوجهة.',hotelAutocompleteSelecting:'جارٍ تحميل تفاصيل مكان الإقامة…',datesRequired:'اختر تاريخي الوصول والمغادرة.',dateOrder:'يجب أن يكون تاريخ المغادرة بعد الوصول.',genericError:'تحقق من البيانات وحاول مرة أخرى.',datePlaceholder:'يوم/شهر/سنة',today:'اليوم',close:'إغلاق'},
    zh:{guestsOne:'位旅客',guestsMany:'位旅客',searching:'正在打开酒店…',searchingSpecific:'正在查找酒店…',specificSubmit:'查找这家酒店',destinationRequired:'请输入目的地。',hotelNameRequired:'请输入酒店名称。',hotelLocationRequired:'请输入酒店所在城市或国家。',hotelSelectionRequired:'输入名称并从列表中选择住宿。',hotelAutocompleteLoading:'正在搜索酒店…',hotelAutocompleteNoResults:'未找到住宿，请添加城市或国家。',hotelAutocompleteUnavailable:'酒店搜索暂时不可用，请使用目的地搜索。',hotelAutocompleteSelecting:'正在加载住宿详情…',datesRequired:'请选择入住和退房日期。',dateOrder:'退房日期必须晚于入住日期。',genericError:'请检查信息后重试。',datePlaceholder:'日/月/年',today:'今天',close:'关闭'}
  };

  var LOCALE_CONFIG = {
    it:{lang:'it',currency:'EUR',months:['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],weekdays:['lu','ma','me','gi','ve','sa','do']},
    en:{lang:'en',currency:'USD',months:['January','February','March','April','May','June','July','August','September','October','November','December'],weekdays:['mo','tu','we','th','fr','sa','su']},
    de:{lang:'de',currency:'EUR',months:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],weekdays:['mo','di','mi','do','fr','sa','so']},
    fr:{lang:'fr',currency:'EUR',months:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],weekdays:['lu','ma','me','je','ve','sa','di']},
    es:{lang:'es',currency:'EUR',months:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],weekdays:['lu','ma','mi','ju','vi','sa','do']},
    nl:{lang:'nl',currency:'EUR',months:['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'],weekdays:['ma','di','wo','do','vr','za','zo']},
    ru:{lang:'ru',currency:'RUB',months:['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],weekdays:['пн','вт','ср','чт','пт','сб','вс']},
    ar:{lang:'ar',currency:'AED',months:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],weekdays:['ن','ث','ر','خ','ج','س','ح']},
    zh:{lang:'zh',currency:'CNY',months:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],weekdays:['一','二','三','四','五','六','日']}
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

  function parseIso(iso){
    var match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function displayFromIso(iso){
    var date = parseIso(iso);
    if (!date) return '';
    return String(date.getDate()).padStart(2,'0') + '/' + String(date.getMonth()+1).padStart(2,'0') + '/' + date.getFullYear();
  }

  function isoFromDisplay(value){
    var match = String(value || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return '';
    var day = Number(match[1]);
    var month = Number(match[2]);
    var year = Number(match[3]);
    var date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
    return dateToIso(date);
  }

  function addDaysIso(iso, days){
    var date = parseIso(iso);
    if (!date) return '';
    date.setDate(date.getDate() + days);
    return dateToIso(date);
  }

  function isAfter(a,b){ return !!(a && b && String(a) > String(b)); }


  function normalizeForMatch(value){
    var text = normalize(value).replace(/[^a-z0-9\u0400-\u04ff\u0600-\u06ff\u4e00-\u9fff]+/g,' ');
    return text.replace(/\s+/g,' ').trim();
  }

  function containsAllTokens(text, tokens){
    var haystack = ' ' + normalizeForMatch(text) + ' ';
    return (tokens || []).every(function(token){
      var needle = normalizeForMatch(token);
      return needle && haystack.indexOf(' ' + needle + ' ') !== -1;
    });
  }

  function findBookingPropertyOverride(hotelName, hotelAddress, typedQuery){
    var nameContext = [hotelName,typedQuery].filter(Boolean).join(' ');
    var locationContext = String(hotelAddress || '').trim() || String(typedQuery || '').trim();
    for (var i=0;i<BOOKING_PROPERTY_OVERRIDES.length;i+=1){
      var entry = BOOKING_PROPERTY_OVERRIDES[i];
      if (containsAllTokens(nameContext,entry.nameTokens) && containsAllTokens(locationContext,entry.locationTokens)) return entry;
    }
    return null;
  }

  function extractLikelyCity(hotelAddress){
    var parts = String(hotelAddress || '').split(',').map(function(part){ return part.trim(); }).filter(Boolean);
    if (parts.length < 2) return '';
    // Work backwards, skip the country and street/number-only fragments.
    for (var i=parts.length-2;i>=0;i-=1){
      var candidate = parts[i]
        .replace(/^\d{3,7}\s+/,'')
        .replace(/\s+\d{3,7}$/,'')
        .replace(/\s+[A-Z]{2,3}$/,'')
        .replace(/^[A-Z]{2,3}\s+\d{3,7}$/,'')
        .trim();
      if (!candidate || /^\d+[A-Za-z]?$/.test(candidate)) continue;
      if (/^(via|viale|piazza|corso|strada|street|st|road|rd|avenue|ave|boulevard|blvd|rue|calle|carrer|ulica|prospekt)\b/i.test(candidate)) continue;
      if (/^[A-Z]{2,3}$/.test(candidate)) continue;
      return candidate;
    }
    return '';
  }

  function cleanHotelNameForBooking(hotelName){
    var name = String(hotelName || '').trim();
    // Google business names often append a long marketing description after a
    // dash. Booking tends to resolve the core property name more reliably.
    var pieces = name.split(/\s+[–—-]\s+/);
    if (pieces.length > 1 && pieces[0].trim().length >= 5) name = pieces[0].trim();
    return name;
  }

  function addBookingStayParameters(target, checkinIso, checkoutIso, adults, children, localeCfg){
    target.searchParams.set('checkin',checkinIso);
    target.searchParams.set('checkout',checkoutIso);
    target.searchParams.set('group_adults',String(Math.max(1,Number(adults || 1))));
    target.searchParams.set('group_children',String(Math.max(0,Number(children || 0))));
    target.searchParams.set('no_rooms','1');
    target.searchParams.set('sb_travel_purpose','leisure');
    if (localeCfg && localeCfg.lang) target.searchParams.set('lang',String(localeCfg.lang));
    if (localeCfg && localeCfg.currency) target.searchParams.set('selected_currency',String(localeCfg.currency));
    return target;
  }

  function buildBookingHotelLink(hotelName, hotelAddress, typedQuery, checkinIso, checkoutIso, adults, children, localeCfg){
    var override = findBookingPropertyOverride(hotelName,hotelAddress,typedQuery);
    if (override && override.url){
      var exactTarget = addBookingStayParameters(new URL(override.url),checkinIso,checkoutIso,adults,children,localeCfg);
      return {url:exactTarget.toString(),strategy:'booking_exact_property_override',searchQuery:''};
    }

    var target = new URL('https://www.booking.com/searchresults.html');
    var exactQuery = cleanHotelNameForBooking(hotelName);
    var cityHint = extractLikelyCity(hotelAddress);
    var normalizedName = normalizeForMatch(exactQuery);
    var normalizedCity = normalizeForMatch(cityHint);
    if (cityHint && normalizedCity && normalizedName.indexOf(normalizedCity) === -1) exactQuery += ' ' + cityHint;
    if (!exactQuery) exactQuery = String(typedQuery || hotelName || '').trim();
    target.searchParams.set('ss',exactQuery);
    addBookingStayParameters(target,checkinIso,checkoutIso,adults,children,localeCfg);
    return {url:target.toString(),strategy:'booking_search_name_city',searchQuery:exactQuery};
  }

  function getInputIso(input){ return input ? String(input.getAttribute('data-iso') || '').trim() : ''; }
  function setInputIso(input, iso){
    if (!input) return;
    var value = String(iso || '').trim();
    if (value){
      input.setAttribute('data-iso', value);
      input.value = displayFromIso(value);
    } else {
      input.removeAttribute('data-iso');
      input.value = '';
    }
  }

  function buildDatepicker(root, localeCfg, copy, checkin, checkout, onDateApplied){
    var panel = document.createElement('div');
    panel.className = 'travirae-stay-search__calendar';
    panel.hidden = true;
    panel.innerHTML = [
      '<div class="travirae-stay-search__calendar-head">',
        '<button type="button" class="travirae-stay-search__calendar-nav" data-cal-nav="prev" aria-label="Previous month">',
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>',
        '</button>',
        '<strong class="travirae-stay-search__calendar-month" data-cal-month></strong>',
        '<button type="button" class="travirae-stay-search__calendar-nav" data-cal-nav="next" aria-label="Next month">',
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>',
        '</button>',
      '</div>',
      '<div class="travirae-stay-search__calendar-weekdays" data-cal-weekdays></div>',
      '<div class="travirae-stay-search__calendar-grid" data-cal-grid></div>',
      '<div class="travirae-stay-search__calendar-actions">',
        '<button type="button" class="travirae-stay-search__calendar-action" data-cal-today>' + copy.today + '</button>',
        '<button type="button" class="travirae-stay-search__calendar-action travirae-stay-search__calendar-action--primary" data-cal-close>' + copy.close + '</button>',
      '</div>'
    ].join('');

    var monthLabel = panel.querySelector('[data-cal-month]');
    var weekdays = panel.querySelector('[data-cal-weekdays]');
    var grid = panel.querySelector('[data-cal-grid]');
    var state = { activeInput:null, viewYear:0, viewMonth:0, minIso:'', checkinInput:checkin, checkoutInput:checkout };

    localeCfg.weekdays.forEach(function(day){
      var el = document.createElement('span');
      el.textContent = day;
      weekdays.appendChild(el);
    });

    function startOfCalendar(month, year){
      var first = new Date(year, month, 1);
      var day = first.getDay();
      var mondayIndex = (day + 6) % 7;
      first.setDate(first.getDate() - mondayIndex);
      return first;
    }

    function close(){
      panel.hidden = true;
      if (panel.parentNode) panel.parentNode.classList.remove('is-open');
      state.activeInput = null;
    }

    function render(){
      monthLabel.textContent = localeCfg.months[state.viewMonth] + ' ' + state.viewYear;
      grid.innerHTML = '';
      var base = startOfCalendar(state.viewMonth, state.viewYear);
      var todayIso = dateToIso(new Date());
      var selectedIso = state.activeInput ? getInputIso(state.activeInput) : '';
      var minIso = state.minIso;
      for (var i = 0; i < 42; i++){
        var current = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
        var iso = dateToIso(current);
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'travirae-stay-search__calendar-day';
        button.textContent = String(current.getDate());
        button.setAttribute('data-date', iso);
        if (current.getMonth() !== state.viewMonth) button.classList.add('is-muted');
        if (iso === todayIso) button.classList.add('is-today');
        if (iso === selectedIso) button.classList.add('is-selected');
        if (minIso && iso < minIso){
          button.disabled = true;
          button.classList.add('is-disabled');
        }
        button.addEventListener('click', function(event){
          var value = event.currentTarget.getAttribute('data-date') || '';
          if (!value || event.currentTarget.disabled || !state.activeInput) return;
          onDateApplied(state.activeInput, value);
          close();
        });
        grid.appendChild(button);
      }
    }

    panel.querySelector('[data-cal-nav="prev"]').addEventListener('click', function(){
      state.viewMonth -= 1;
      if (state.viewMonth < 0){ state.viewMonth = 11; state.viewYear -= 1; }
      render();
    });
    panel.querySelector('[data-cal-nav="next"]').addEventListener('click', function(){
      state.viewMonth += 1;
      if (state.viewMonth > 11){ state.viewMonth = 0; state.viewYear += 1; }
      render();
    });
    panel.querySelector('[data-cal-today]').addEventListener('click', function(){
      var todayIso = dateToIso(new Date());
      var targetIso = todayIso;
      if (state.minIso && targetIso < state.minIso) targetIso = state.minIso;
      var targetDate = parseIso(targetIso) || new Date();
      state.viewMonth = targetDate.getMonth();
      state.viewYear = targetDate.getFullYear();
      render();
    });
    panel.querySelector('[data-cal-close]').addEventListener('click', close);

    return {
      openFor: function(input, minIso){
        if (!input) return;
        var field = input.closest('.travirae-stay-search__field');
        if (!field) return;
        if (panel.parentNode && panel.parentNode !== field) panel.parentNode.classList.remove('is-open');
        field.appendChild(panel);
        field.classList.add('is-open');
        state.activeInput = input;
        state.minIso = String(minIso || '').trim();
        var selectedIso = getInputIso(input) || state.minIso || dateToIso(new Date());
        var date = parseIso(selectedIso) || new Date();
        state.viewMonth = date.getMonth();
        state.viewYear = date.getFullYear();
        panel.hidden = false;
        render();
      },
      close: close,
      isOpen: function(){ return !panel.hidden; },
      contains: function(node){ return panel.contains(node); },
      activeInput: function(){ return state.activeInput; }
    };
  }

  function initWidget(root){
    if (!root || root.getAttribute('data-initialized') === '1') return;
    root.setAttribute('data-initialized','1');

    var locale = currentLocale();
    var copy = COPY[locale] || COPY.it;
    var localeCfg = LOCALE_CONFIG[locale] || LOCALE_CONFIG.it;
    var form = root.querySelector('#travirae-stay-search-form');
    var destination = root.querySelector('#travirae-stay-destination');
    var hotelName = root.querySelector('#travirae-stay-hotel-name');
    var hotelSuggestionsPanel = root.querySelector('#travirae-stay-hotel-suggestions');
    var hotelSelectionBox = root.querySelector('#travirae-stay-hotel-selection');
    var hotelSelectionLocation = root.querySelector('[data-selected-hotel-location]');
    var hotelClearButton = root.querySelector('[data-clear-selected-hotel]');
    var hotelPlaceIdInput = root.querySelector('#travirae-stay-hotel-place-id');
    var hotelAddressInput = root.querySelector('#travirae-stay-hotel-address');
    var hotelLatInput = root.querySelector('#travirae-stay-hotel-lat');
    var hotelLngInput = root.querySelector('#travirae-stay-hotel-lng');
    var modeInput = root.querySelector('#travirae-stay-search-mode');
    var modeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-search-mode]'));
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
    var fieldHotelName = root.querySelector('[data-field="hotelname"]');
    var fieldCheckin = root.querySelector('[data-field="checkin"]');
    var fieldCheckout = root.querySelector('[data-field="checkout"]');
    var originalSubmitText = submitLabel ? submitLabel.textContent : '';
    var searchMode = 'destination';
    var allDestinations = FALLBACK_DESTINATIONS.slice();
    var renderedSuggestions = [];
    var activeSuggestion = -1;
    var navigating = false;
    var hotelAutocomplete = null;

    if (!form || !destination || !hotelName || !hotelSuggestionsPanel || !checkin || !checkout || !adultsInput || !childrenInput) return;

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
      [fieldDestination,fieldHotelName,fieldCheckin,fieldCheckout].forEach(function(item){ if(item) item.classList.remove('is-invalid'); });
      if (field) field.classList.add('is-invalid');
      if (errorBox) errorBox.textContent = message || '';
    }

    function clearError(){ setError('',null); }

    function currentSubmitText(){
      return searchMode === 'hotel' ? copy.specificSubmit : originalSubmitText;
    }

    function setSearchMode(mode, focusField){
      searchMode = mode === 'hotel' ? 'hotel' : 'destination';
      var isHotel = searchMode === 'hotel';
      root.classList.toggle('is-hotel-mode',isHotel);
      root.setAttribute('data-search-mode',searchMode);
      if (modeInput) modeInput.value = searchMode;

      fieldDestination.hidden = isHotel;
      destination.disabled = isHotel;
      destination.required = !isHotel;
      fieldHotelName.hidden = !isHotel;
      hotelName.disabled = !isHotel;
      hotelName.required = isHotel;
      if (hotelAutocomplete) hotelAutocomplete.setActive(isHotel);

      modeButtons.forEach(function(button){
        var active = button.getAttribute('data-search-mode') === searchMode;
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-pressed',active ? 'true' : 'false');
      });

      if (submitLabel) submitLabel.textContent = currentSubmitText();
      clearError();
      hideSuggestions();
      setGuestPanel(false);
      if (typeof datepicker !== 'undefined' && datepicker) datepicker.close();
      if (focusField){
        window.setTimeout(function(){ (isHotel ? hotelName : destination).focus(); },0);
      }
    }

    modeButtons.forEach(function(button){
      button.addEventListener('click',function(){
        setSearchMode(button.getAttribute('data-search-mode'),true);
      });
    });

    hotelName.addEventListener('input',clearError);

    if (window.TraviraeHotelAutocomplete && typeof window.TraviraeHotelAutocomplete.create === 'function'){
      hotelAutocomplete = window.TraviraeHotelAutocomplete.create({
        input:hotelName,
        panel:hotelSuggestionsPanel,
        field:fieldHotelName,
        selectionBox:hotelSelectionBox,
        selectionLocation:hotelSelectionLocation,
        clearButton:hotelClearButton,
        hiddenPlaceId:hotelPlaceIdInput,
        hiddenAddress:hotelAddressInput,
        hiddenLat:hotelLatInput,
        hiddenLng:hotelLngInput,
        locale:localeCfg.lang,
        copy:copy,
        onError:function(message){
          if (searchMode === 'hotel' && message) setError(message,fieldHotelName);
        },
        onClearError:clearError
      });
    }

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
        datepicker.close();
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

    destination.addEventListener('input',function(){ clearError(); renderSuggestions(destination.value); });
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

    checkin.type = 'text';
    checkout.type = 'text';
    checkin.readOnly = true;
    checkout.readOnly = true;
    checkin.inputMode = 'none';
    checkout.inputMode = 'none';
    checkin.autocomplete = 'off';
    checkout.autocomplete = 'off';
    checkin.placeholder = copy.datePlaceholder;
    checkout.placeholder = copy.datePlaceholder;

    var today = dateToIso(new Date());
    var tomorrow = addDaysIso(today,1);

    function syncDatesAfterSelection(input, iso){
      clearError();
      if (input === checkin){
        setInputIso(checkin, iso);
        var checkoutIso = getInputIso(checkout);
        // Check-in and check-out are selected independently. If a previously
        // selected check-out is no longer valid, clear it instead of choosing
        // a new date automatically.
        if (checkoutIso && !isAfter(checkoutIso, iso)) setInputIso(checkout, '');
      } else {
        setInputIso(checkout, iso);
      }
    }

    var datepicker = buildDatepicker(root, localeCfg, copy, checkin, checkout, syncDatesAfterSelection);

    function openDatepickerFor(input){
      hideSuggestions();
      setGuestPanel(false);
      clearError();
      var minIso = input === checkin ? today : (getInputIso(checkin) ? addDaysIso(getInputIso(checkin),1) : tomorrow);
      datepicker.openFor(input, minIso);
    }

    [checkin, checkout].forEach(function(input){
      var field = input.closest('.travirae-stay-search__field');
      var control = field ? field.querySelector('.travirae-stay-search__control') : null;
      var existingIso = String(input.value || '').trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(existingIso)) setInputIso(input, existingIso); else input.value = '';
      input.addEventListener('click', function(){ openDatepickerFor(input); });
      input.addEventListener('focus', function(){ openDatepickerFor(input); });
      input.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown'){
          event.preventDefault();
          openDatepickerFor(input);
        }
      });
      if (control){
        control.addEventListener('click', function(event){
          if (event.target === input) return;
          openDatepickerFor(input);
        });
      }
    });

    document.addEventListener('click',function(event){
      var guestField = root.querySelector('.travirae-stay-search__field--guests');
      var destinationField = root.querySelector('.travirae-stay-search__field--destination');
      var dateFields = [fieldCheckin, fieldCheckout].filter(Boolean);
      if (guestPanel && !guestPanel.hidden && guestField && !guestField.contains(event.target)) setGuestPanel(false);
      if (suggestions && !suggestions.hidden && destinationField && !destinationField.contains(event.target)) hideSuggestions();
      if (datepicker.isOpen()){
        var insideDateField = dateFields.some(function(field){ return field.contains(event.target); });
        if (!insideDateField) datepicker.close();
      }
    });
    document.addEventListener('keydown',function(event){
      if (event.key === 'Escape'){
        setGuestPanel(false);
        hideSuggestions();
        if (hotelAutocomplete) hotelAutocomplete.hide();
        datepicker.close();
      }
    });

    form.addEventListener('submit',function(event){
      event.preventDefault();
      if (navigating) return;
      clearError();
      hideSuggestions();
      setGuestPanel(false);
      datepicker.close();

      var isHotelSearch = searchMode === 'hotel';
      var destinationValue = String(destination.value || '').trim();
      var selectedHotel = hotelAutocomplete ? hotelAutocomplete.getSelected() : null;
      var hotelNameValue = selectedHotel ? String(selectedHotel.name || '').trim() : String(hotelName.value || '').trim();
      var hotelLocationValue = selectedHotel ? String(selectedHotel.address || '').trim() : '';
      var checkinIso = getInputIso(checkin) || isoFromDisplay(checkin.value);
      var checkoutIso = getInputIso(checkout) || isoFromDisplay(checkout.value);
      if (isHotelSearch){
        if (!hotelNameValue || !selectedHotel){ setError(copy.hotelSelectionRequired || copy.hotelNameRequired,fieldHotelName); hotelName.focus(); return; }
      }else if (!destinationValue){
        setError(copy.destinationRequired,fieldDestination); destination.focus(); return;
      }
      if (!checkinIso || !checkoutIso){
        var missingField = !checkinIso ? fieldCheckin : fieldCheckout;
        setError(copy.datesRequired,missingField);
        (!checkinIso ? checkin : checkout).focus();
        return;
      }
      if (!isAfter(checkoutIso,checkinIso)){
        setError(copy.dateOrder,fieldCheckout);
        checkout.focus();
        return;
      }

      try{
        var adults = Math.max(1,Number(adultsInput.value || 1));
        var children = Math.max(0,Number(childrenInput.value || 0));
        var url = new URL(isHotelSearch ? HOTEL_ENDPOINT : SEARCH_ENDPOINT);
        var hotelBookingTarget = null;
        url.searchParams.set('aid',AID);
        if (isHotelSearch){
          // Do not let Stay22 fuzzy-match the Google-selected property again.
          // Send a direct Booking.com property URL when an exact mapping is
          // available; otherwise use a focused name + city Booking search.
          // Both routes pass through Stay22's tracked `link` parameter, keeping
          // aid/campaign attribution without re-running Stay22 fuzzy matching.
          hotelBookingTarget = buildBookingHotelLink(
            hotelNameValue,
            hotelLocationValue,
            selectedHotel ? String(selectedHotel.searchQuery || '') : '',
            checkinIso,
            checkoutIso,
            adults,
            children,
            localeCfg
          );
          url.searchParams.set('link',hotelBookingTarget.url);
        }else{
          url.searchParams.set('address',destinationValue);
          url.searchParams.set('checkin',checkinIso);
          url.searchParams.set('checkout',checkoutIso);
          url.searchParams.set('adults',String(adults));
          if (children > 0) url.searchParams.set('children',String(children));
        }
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
              context:isHotelSearch ? 'homepage_stay22_specific_hotel' : 'homepage_stay22_search',
              href:url.toString(),
              destination:isHotelSearch ? (hotelNameValue + (hotelLocationValue ? ', ' + hotelLocationValue : '')) : destinationValue,
              affiliateSlug:affiliateId,
              hotelPlaceId:isHotelSearch && selectedHotel ? String(selectedHotel.placeId || '') : '',
              hotelName:isHotelSearch ? hotelNameValue : '',
              hotelAddress:isHotelSearch ? hotelLocationValue : '',
              searchMode:searchMode,
              hotelResolution:isHotelSearch && hotelBookingTarget ? hotelBookingTarget.strategy : '',
              bookingSearchQuery:isHotelSearch && hotelBookingTarget ? hotelBookingTarget.searchQuery : '',
              otaProvider:isHotelSearch ? 'booking' : '',
              dedupeKey:'sitewidget_stay22_home_' + searchMode + '_' + (isHotelSearch ? (hotelNameValue + '_' + hotelLocationValue) : destinationValue) + '_' + checkinIso + '_' + checkoutIso,
              dedupeMs:1500
            });
            if (tracked && typeof tracked.catch === 'function') tracked.catch(function(){});
          }
        }catch(_trackError){}

        navigating = true;
        submitButton.disabled = true;
        if (submitLabel) submitLabel.textContent = isHotelSearch ? copy.searchingSpecific : copy.searching;
        window.setTimeout(function(){ window.location.assign(url.toString()); },90);
      }catch(_urlError){
        navigating = false;
        submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = currentSubmitText();
        setError(copy.genericError,null);
      }
    });

    setSearchMode('destination',false);
    updateGuestSummary();
  }

  function boot(){
    var root = document.getElementById('travirae-stay-search');
    if (root) initWidget(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
