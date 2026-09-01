/*! Travirae hotel autocomplete — Google Places (New) through Supabase Edge Function */
(function(){
  'use strict';

  function normalizeText(value){
    return String(value || '').replace(/\s+/g,' ').trim();
  }

  function createSessionToken(){
    try{
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    }catch(_e){}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(char){
      var random = Math.random() * 16 | 0;
      var value = char === 'x' ? random : (random & 3 | 8);
      return value.toString(16);
    });
  }

  function getEndpoint(){
    var cfg = window.TRAVIRAE_CONFIG || {};
    var base = normalizeText(cfg.SUPABASE_URL).replace(/\/$/,'');
    return base ? base + '/functions/v1/google-hotel-autocomplete' : '';
  }

  function getHeaders(){
    var cfg = window.TRAVIRAE_CONFIG || {};
    var anon = normalizeText(cfg.SUPABASE_ANON_KEY);
    var headers = { 'Accept':'application/json' };
    if (anon){
      headers.apikey = anon;
      headers.Authorization = 'Bearer ' + anon;
    }
    return headers;
  }

  function create(options){
    options = options || {};
    var input = options.input;
    var panel = options.panel;
    var field = options.field;
    var selectionBox = options.selectionBox;
    var selectionLocation = options.selectionLocation;
    var clearButton = options.clearButton;
    var hiddenPlaceId = options.hiddenPlaceId;
    var hiddenAddress = options.hiddenAddress;
    var hiddenLat = options.hiddenLat;
    var hiddenLng = options.hiddenLng;
    var locale = normalizeText(options.locale || 'it') || 'it';
    var copy = options.copy || {};
    var onError = typeof options.onError === 'function' ? options.onError : function(){};
    var onClearError = typeof options.onClearError === 'function' ? options.onClearError : function(){};
    var onSelectionChange = typeof options.onSelectionChange === 'function' ? options.onSelectionChange : function(){};

    if (!input || !panel || !field) return null;

    var endpoint = getEndpoint();
    var active = false;
    var selected = null;
    var sessionToken = createSessionToken();
    var debounceTimer = null;
    var abortController = null;
    var requestSerial = 0;
    var renderedButtons = [];
    var activeIndex = -1;
    var destroyed = false;

    var messages = {
      loading: copy.hotelAutocompleteLoading || 'Ricerca hotel…',
      noResults: copy.hotelAutocompleteNoResults || 'Nessuna struttura trovata. Prova ad aggiungere la città o il Paese.',
      unavailable: copy.hotelAutocompleteUnavailable || 'Ricerca hotel temporaneamente non disponibile. Usa la ricerca per destinazione.',
      selecting: copy.hotelAutocompleteSelecting || 'Recupero i dettagli della struttura…',
      attribution: 'Powered by Google'
    };

    function syncHiddenValues(hotel){
      if (hiddenPlaceId) hiddenPlaceId.value = hotel ? normalizeText(hotel.placeId) : '';
      if (hiddenAddress) hiddenAddress.value = hotel ? normalizeText(hotel.address) : '';
      if (hiddenLat) hiddenLat.value = hotel && Number.isFinite(Number(hotel.lat)) ? String(hotel.lat) : '';
      if (hiddenLng) hiddenLng.value = hotel && Number.isFinite(Number(hotel.lng)) ? String(hotel.lng) : '';
    }

    function showSelection(hotel){
      if (!selectionBox) return;
      if (!hotel){
        selectionBox.hidden = true;
        if (selectionLocation) selectionLocation.textContent = '';
        return;
      }
      if (selectionLocation) selectionLocation.textContent = normalizeText(hotel.address || hotel.location || '');
      selectionBox.hidden = !normalizeText(hotel.address || hotel.location || '');
    }

    function clearPanel(){
      renderedButtons = [];
      activeIndex = -1;
      panel.innerHTML = '';
      panel.hidden = true;
      field.classList.remove('is-open');
      input.removeAttribute('aria-activedescendant');
      input.setAttribute('aria-expanded','false');
    }

    function addAttribution(container){
      var attribution = document.createElement('div');
      attribution.className = 'travirae-stay-search__google-attribution';
      attribution.setAttribute('translate','no');
      var logo = document.createElement('img');
      logo.src = 'https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png';
      logo.alt = messages.attribution;
      logo.width = 120;
      logo.height = 14;
      logo.loading = 'lazy';
      attribution.appendChild(logo);
      container.appendChild(attribution);
    }

    function showStatus(message, kind){
      panel.innerHTML = '';
      renderedButtons = [];
      activeIndex = -1;
      var status = document.createElement('div');
      status.className = 'travirae-stay-search__hotel-status' + (kind ? ' is-' + kind : '');
      if (kind === 'loading'){
        var spinner = document.createElement('span');
        spinner.className = 'travirae-stay-search__hotel-spinner';
        spinner.setAttribute('aria-hidden','true');
        status.appendChild(spinner);
      }
      var text = document.createElement('span');
      text.textContent = message;
      status.appendChild(text);
      panel.appendChild(status);
      addAttribution(panel);
      panel.hidden = false;
      field.classList.add('is-open');
      input.setAttribute('aria-expanded','true');
    }

    function setActiveSuggestion(index){
      if (!renderedButtons.length) return;
      activeIndex = (index + renderedButtons.length) % renderedButtons.length;
      renderedButtons.forEach(function(button,buttonIndex){
        var isActive = buttonIndex === activeIndex;
        button.setAttribute('aria-selected',isActive ? 'true' : 'false');
        if (isActive){
          input.setAttribute('aria-activedescendant',button.id);
          try{ button.scrollIntoView({block:'nearest'}); }catch(_e){}
        }
      });
    }

    function renderSuggestions(items){
      panel.innerHTML = '';
      renderedButtons = [];
      activeIndex = -1;
      if (!items.length){
        showStatus(messages.noResults,'empty');
        return;
      }

      var list = document.createElement('div');
      list.className = 'travirae-stay-search__hotel-suggestion-list';
      items.slice(0,5).forEach(function(item,index){
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'travirae-stay-search__hotel-suggestion';
        button.id = 'travirae-stay-hotel-suggestion-' + index;
        button.setAttribute('role','option');
        button.setAttribute('aria-selected','false');

        var icon = document.createElement('span');
        icon.className = 'travirae-stay-search__hotel-suggestion-icon';
        icon.innerHTML = '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18"></path><path d="M6 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15"></path><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"></path></svg>';

        var content = document.createElement('span');
        content.className = 'travirae-stay-search__hotel-suggestion-copy';
        var name = document.createElement('strong');
        name.textContent = normalizeText(item.name || item.label || item.text);
        var location = document.createElement('small');
        location.textContent = normalizeText(item.location || item.address || '');
        content.appendChild(name);
        if (location.textContent) content.appendChild(location);

        button.appendChild(icon);
        button.appendChild(content);
        button.addEventListener('mousedown',function(event){ event.preventDefault(); });
        button.addEventListener('click',function(){ selectSuggestion(item); });
        list.appendChild(button);
        renderedButtons.push(button);
      });
      panel.appendChild(list);
      addAttribution(panel);
      panel.hidden = false;
      field.classList.add('is-open');
      input.setAttribute('aria-expanded','true');
    }

    async function request(action, parameters, signal){
      if (!endpoint) throw new Error('missing_supabase_url');
      var url = new URL(endpoint);
      url.searchParams.set('action',action);
      Object.keys(parameters || {}).forEach(function(key){
        var value = parameters[key];
        if (value !== null && value !== undefined && String(value) !== '') url.searchParams.set(key,String(value));
      });
      var response = await fetch(url.toString(),{
        method:'GET',
        headers:getHeaders(),
        signal:signal,
        credentials:'omit',
        cache:'no-store'
      });
      var payload = null;
      try{ payload = await response.json(); }catch(_e){ payload = null; }
      if (!response.ok){
        var message = payload && (payload.error || payload.message || payload.code);
        throw new Error(normalizeText(message) || ('HTTP_' + response.status));
      }
      return payload || {};
    }

    async function search(query){
      var cleanQuery = normalizeText(query);
      if (!active || cleanQuery.length < 3){
        clearPanel();
        return;
      }
      if (abortController) abortController.abort();
      abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var serial = ++requestSerial;
      showStatus(messages.loading,'loading');
      try{
        var payload = await request('autocomplete',{
          q:cleanQuery,
          lang:locale,
          session_token:sessionToken
        },abortController ? abortController.signal : undefined);
        if (destroyed || serial !== requestSerial || !active) return;
        renderSuggestions(Array.isArray(payload.items) ? payload.items : []);
      }catch(error){
        if (error && error.name === 'AbortError') return;
        if (destroyed || serial !== requestSerial || !active) return;
        showStatus(messages.unavailable,'error');
        onError(messages.unavailable,error);
      }
    }

    async function selectSuggestion(item){
      if (!item || !normalizeText(item.placeId)) return;
      var typedQuery = normalizeText(input.value);
      var selectedName = normalizeText(item.name || item.label || item.text);
      var fallbackAddress = normalizeText(item.location || item.address || '');
      showStatus(messages.selecting,'loading');
      input.disabled = true;
      try{
        var payload = await request('details',{
          place_id:item.placeId,
          lang:locale,
          session_token:sessionToken
        });
        var details = payload && payload.place ? payload.place : {};
        selected = {
          placeId:normalizeText(details.placeId || item.placeId),
          name:selectedName,
          searchQuery:typedQuery,
          address:normalizeText(details.address || fallbackAddress || item.text),
          lat:Number(details.lat),
          lng:Number(details.lng),
          types:Array.isArray(details.types) ? details.types.slice() : (Array.isArray(item.types) ? item.types.slice() : []),
          primaryType:normalizeText(details.primaryType || item.primaryType)
        };
        if (!Number.isFinite(selected.lat)) selected.lat = null;
        if (!Number.isFinite(selected.lng)) selected.lng = null;
      }catch(error){
        // The prediction itself still identifies the intended property. Use its
        // visible name/location if Place Details is temporarily unavailable.
        selected = {
          placeId:normalizeText(item.placeId),
          name:selectedName,
          searchQuery:typedQuery,
          address:fallbackAddress || normalizeText(item.text),
          lat:null,
          lng:null,
          types:Array.isArray(item.types) ? item.types.slice() : [],
          primaryType:normalizeText(item.primaryType)
        };
      }finally{
        input.disabled = false;
      }

      input.value = selected.name;
      input.setAttribute('data-selected-place-id',selected.placeId);
      syncHiddenValues(selected);
      showSelection(selected);
      clearPanel();
      onClearError();
      onSelectionChange(selected);
      sessionToken = createSessionToken();
      window.setTimeout(function(){ input.focus(); },0);
    }

    function clearSelected(options){
      options = options || {};
      selected = null;
      input.removeAttribute('data-selected-place-id');
      syncHiddenValues(null);
      showSelection(null);
      if (!options.preserveInput) input.value = '';
      clearPanel();
      sessionToken = createSessionToken();
      onSelectionChange(null);
      if (options.focus) window.setTimeout(function(){ input.focus(); },0);
    }

    function handleInput(){
      onClearError();
      if (selected) clearSelected({preserveInput:true});
      window.clearTimeout(debounceTimer);
      var value = normalizeText(input.value);
      if (!active || value.length < 3){
        clearPanel();
        return;
      }
      debounceTimer = window.setTimeout(function(){ search(value); },350);
    }

    input.setAttribute('aria-expanded','false');
    input.addEventListener('input',handleInput);
    input.addEventListener('focus',function(){
      if (active && !selected && normalizeText(input.value).length >= 3) search(input.value);
    });
    input.addEventListener('keydown',function(event){
      if (panel.hidden || !renderedButtons.length){
        if (event.key === 'Escape') clearPanel();
        return;
      }
      if (event.key === 'ArrowDown'){
        event.preventDefault();
        setActiveSuggestion(activeIndex + 1);
      }else if (event.key === 'ArrowUp'){
        event.preventDefault();
        setActiveSuggestion(activeIndex - 1);
      }else if (event.key === 'Enter' && activeIndex >= 0){
        event.preventDefault();
        renderedButtons[activeIndex].click();
      }else if (event.key === 'Escape'){
        event.preventDefault();
        clearPanel();
      }
    });

    if (clearButton){
      clearButton.addEventListener('click',function(event){
        event.preventDefault();
        clearSelected({focus:true});
      });
    }

    function documentClickHandler(event){
      if (!field.contains(event.target)) clearPanel();
    }
    document.addEventListener('click',documentClickHandler);

    return {
      setActive:function(value){
        active = Boolean(value);
        if (!active){
          clearPanel();
          if (abortController) abortController.abort();
        }
      },
      getSelected:function(){ return selected ? Object.assign({},selected) : null; },
      clear:function(focus){ clearSelected({focus:Boolean(focus)}); },
      hide:clearPanel,
      focus:function(){ input.focus(); },
      destroy:function(){
        destroyed = true;
        active = false;
        window.clearTimeout(debounceTimer);
        if (abortController) abortController.abort();
        document.removeEventListener('click',documentClickHandler);
        clearPanel();
      }
    };
  }

  window.TraviraeHotelAutocomplete = { create:create };
})();
