// Travirae v7-worldwide-r7
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('is-open', !expanded);
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.accordion-item', group).forEach(i=>{
          i.classList.remove('open');
          $('.accordion-toggle', i).setAttribute('aria-expanded','false');
          $('.accordion-panel', i).hidden = true;
        });
        if(!open){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          panel.hidden = false;
        }
      });
    });
  });

  // Flights form -> Google Flights
  const flightsForm = $('#flights-form');
  if(flightsForm){
    flightsForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const from = $('#from').value.trim();
      const to = $('#to').value.trim();
      const d1 = $('#depart').value;
      const d2 = $('#return').value;
      const adults = $('#adults').value || '1';
      const cabin = $('#cabin').value || 'economy';
      const parts = [];
      if(from && to) parts.push(`volo da ${from} a ${to}`);
      if(d1) parts.push(`partenza ${d1}`);
      if(d2) parts.push(`ritorno ${d2}`);
      parts.push(`${adults} adulti ${cabin}`);
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(parts.join(' ')) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }
})();


// Helpers
const $ = (sel, root=document)=> root.querySelector(sel);
const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));

// ===== Catchy content for modal =====
function catchyTagline(category, city){
  const base = (category||'').toLowerCase();
  const map = {
    mare:'spiagge da cartolina e tramonti 🔆',
    montagna:'tra vette, rifugi e cieli limpidi 🏔️',
    citta:'musei, rooftop e quartieri iconici 🏙️',
    surf:'onde perfette e chill vibes 🏄',
    golf:'fairway curati e tee time perfetti ⛳️'
  };
  const t = map[Object.keys(map).find(k=>base.includes(k))] || 'storie, sapori e panorami ✨';
  return `${city} — ${t}`;
}

function longDescription(city, category){
  const base = (category||'').toLowerCase();
  const lang = (localStorage.getItem('lang') || document.documentElement.lang || 'it').slice(0,2);
  const D = {
    it:{ mare: `${city} profuma di salsedine e giornate lente tra spiagge, calette e chioschi sul mare.`,
         montagna: `A ${city} la montagna è un invito a respirare: sentieri, rifugi e cieli stellati.`,
         citta: `${city} sorprende a ogni angolo: musei, quartieri creativi e viste dall'alto.`,
         surf: `${city} è ritmo d'oceano: maree, spot leggendari e session all'alba.`,
         golf: `${city} è green curati, club accoglienti e tee time all'ora giusta.`,
         other: `${city} è una fuga che riconcilia: luoghi belli, gente accogliente e tempi rilassati.` },
    en:{ mare: `${city} smells of sea breeze and slow days between beaches and coves.`,
         montagna: `In ${city} the mountains invite you to breathe: trails, huts and starry skies.`,
         citta: `${city} surprises at every corner: museums, creative districts and rooftop views.`,
         surf: `${city} moves to the ocean’s rhythm: tides, iconic spots and dawn sessions.`,
         golf: `${city} means manicured greens, welcoming clubs and well‑timed tee times.`,
         other: `${city} is a soothing escape: beautiful places, friendly people and relaxed pace.` },
    zh:{ mare:`${city} 有海风与慢时光：沙滩、小海湾与海边小店。`,
         montagna:`在 ${city}，山野召唤呼吸：步道、山舍与繁星。`,
         citta:`${city} 处处有惊喜：博物馆、创意街区与屋顶风景。`,
         surf:`${city} 以海而动：潮汐、传奇浪点与清晨冲浪。`,
         golf:`${city} 代表整洁果岭、友好俱乐部与恰到好处的开球时间。`,
         other:`${city} 是一次疗愈之旅：美景、热情与从容节奏。` },
    es:{ mare:`${city} huele a brisa marina y días tranquilos entre playas y calas.`,
         montagna:`En ${city} la montaña invita a respirar: senderos, refugios y cielos estrellados.`,
         citta:`${city} sorprende en cada esquina: museos, barrios creativos y azoteas con vistas.`,
         surf:`${city} sigue el ritmo del océano: mareas, spots míticos y sesiones al amanecer.`,
         golf:`${city} es green cuidados, clubs acogedores y tee times precisos.`,
         other:`${city} es una escapada que reconcilia: lugares bellos, gente amable y ritmo relajado.` },
    hi:{ mare:`${city} में समंदर की खुशबू और धीमे दिन—समुद्रतट, छोटी खाड़ियाँ और बीच शैक।`,
         montagna:`${city} में पहाड़ साँस लेने का न्योता हैं: ट्रेल्स, पर्वत‑झोपड़ियाँ और तारों भरी रातें।`,
         citta:`${city} हर मोड़ पर चकित करे: संग्रहालय, रचनात्मक इलाक़े और रूफटॉप दृश्य।`,
         surf:`${city} का ताल समुद्र है: ज्वार, प्रसिद्ध स्पॉट और सुबह की सेशन।`,
         golf:`${city} का मतलब है तराशे हुए ग्रीन, स्वागत करते क्लब और सही समय के टी‑टाइम।`,
         other:`${city} एक सुकून भरी यात्रा है: सुन्दर जगहें, मिलनसार लोग और धीमी रफ़्तार।` },
    ar:{ mare:`${city} تعبق بنسيم البحر وأيام هادئة بين الشواطئ والخَلجان.`,
         montagna:`في ${city} الجبال دعوة للتنفس: مسارات، ملاجئ وسماء مرصعة.`,
         citta:`${city} تفاجئك في كل زاوية: متاحف وأحياء إبداعية وإطلالات من الأسطح.`,
         surf:`${city} على إيقاع المحيط: مد وجزر ونقاط شهيرة وجلسات الفجر.`,
         golf:`${city} تعني غرين مشذّبة، أندية ترحّب ومواعيد تي مثالية.`,
         other:`${city} مهرب مريح: أماكن جميلة وناس لطفاء وإيقاع هادئ.` },
    fr:{ mare:`${city} sent la brise marine et les journées lentes entre plages et criques.`,
         montagna:`À ${city}, la montagne invite à respirer : sentiers, refuges et ciels étoilés.`,
         citta:`${city} surprend à chaque coin : musées, quartiers créatifs et vues en rooftop.`,
         surf:`${city} bat au rythme de l’océan : marées, spots mythiques et sessions à l’aube.`,
         golf:`${city} rime avec greens soignés, clubs chaleureux et tee times bien calés.`,
         other:`${city} est une échappée apaisante : beaux lieux, gens accueillants et rythme posé.` },
    ru:{ mare:`В ${city} пахнет морским бризом и неторопливыми днями на пляжах и бухтах.`,
         montagna:`В ${city} горы приглашают дышать: тропы, приюты и звёздное небо.`,
         citta:`${city} удивляет на каждом шагу: музеи, креативные районы и виды с крыш.`,
         surf:`${city} живёт ритмом океана: приливы, легендарные споты и рассветные сессии.`,
         golf:`${city} — это ухоженные грины, тёплые клубы и идеальные ти‑таймы.`,
         other:`${city} — спокойный отдых: красивые места, добрые люди и размеренный темп.` },
    de:{ mare:`${city} riecht nach Meeresbrise und entspannten Tagen an Stränden und Buchten.`,
         montagna:`In ${city} laden die Berge zum Durchatmen ein: Wege, Hütten und Sternenhimmel.`,
         citta:`${city} überrascht an jeder Ecke: Museen, kreative Viertel und Rooftop‑Blicke.`,
         surf:`${city} folgt dem Rhythmus des Ozeans: Gezeiten, legendäre Spots und Sessions bei Sonnenaufgang.`,
         golf:`${city} steht für gepflegte Greens, freundliche Clubs und perfekt getimte Tee Times.`,
         other:`${city} ist eine erholsame Auszeit: schöne Orte, freundliche Menschen und ruhiges Tempo.` }
  };
  const dict = D[D[lang]?lang:'it'];
  const key = ['mare','montagna','citta','surf','golf'].find(k=>base.includes(k)) || 'other';
  return dict[key];
}

function strongBonuses(category){
  const base = (category||'').toLowerCase();
  const lang = (localStorage.getItem('lang') || document.documentElement.lang || 'it').slice(0,2);
  const B = {
    it:{mare:'🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).',
        montagna:'🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato.',
        citta:'🎁 Bonus: pass salta‑fila a 2 musei + drink su un rooftop panoramico.',
        surf:'🎁 Bonus: session all’alba con coach locale e foto professionali.',
        golf:'🎁 Bonus: tee time al mattino con green veloci garantiti.'},
    en:{mare:'🎁 Bonus: sunset boat tour with snorkelling in a secret cove (+ drink on board).',
        montagna:'🎁 Bonus: hut dinner with starry‑sky return.',
        citta:'🎁 Bonus: skip‑the‑line pass to 2 museums + rooftop drink.',
        surf:'🎁 Bonus: dawn session with local coach and pro photos.',
        golf:'🎁 Bonus: morning tee time with fast greens guaranteed.'},
    zh:{mare:'🎁 赠礼：日落船游+秘境浮潜（含饮品）。',
        montagna:'🎁 赠礼：山舍晚餐＋仰望繁星返程。',
        citta:'🎁 赠礼：两家博物馆免排队+屋顶饮品。',
        surf:'🎁 赠礼：拂晓课程（本地教练）+ 专业照片。',
        golf:'🎁 赠礼：清晨开球，保证快速果岭。'},
    es:{mare:'🎁 Bonus: paseo en barco al atardecer con snorkel en cala secreta (+ bebida a bordo).',
        montagna:'🎁 Bonus: cena en refugio y regreso bajo el cielo estrellado.',
        citta:'🎁 Bonus: acceso sin colas a 2 museos + copa en rooftop.',
        surf:'🎁 Bonus: sesión al amanecer con coach local y fotos pro.',
        golf:'🎁 Bonus: tee time por la mañana con greens rápidos garantizados.'},
    hi:{mare:'🎁 बोनस: सूर्यास्त बोट‑टूर + छुपी खाड़ी में स्नॉर्कलिंग (ड्रिंक सहित)।',
        montagna:'🎁 बोनस: पहाड़ी झोपड़ी में डिनर, वापसी तारों के नीचे।',
        citta:'🎁 बोनस: 2 म्यूज़ियम में स्किप‑द‑लाइन पास + रूफटॉप ड्रिंक।',
        surf:'🎁 बोनस: अलस्सुबह सेशन (लोकल कोच) + प्रो फोटो।',
        golf:'🎁 बोनस: सुबह टी‑टाइम, तेज़ ग्रीन्स की गारंटी।'},
    ar:{mare:'🎁 هدية: جولة بالقارب عند الغروب مع سنوركلينغ في خليج سري (+ مشروب).',
        montagna:'🎁 هدية: عشاء في الملجأ والعودة تحت سماء مرصعة.',
        citta:'🎁 هدية: تذكرة تخطي الصفوف لمتحفين + مشروب على السطح.',
        surf:'🎁 هدية: جلسة فجر مع مدرب محلي وصور احترافية.',
        golf:'🎁 هدية: Tee time صباحًا مع غرين سريع مضمونة.'},
    fr:{mare:'🎁 Bonus : tour en bateau au coucher du soleil avec snorkeling dans une crique secrète (+ boisson).',
        montagna:'🎁 Bonus : dîner en refuge, retour sous ciel étoilé.',
        citta:'🎁 Bonus : coupe‑file pour 2 musées + verre sur un rooftop.',
        surf:'🎁 Bonus : session à l’aube avec coach local et photos pro.',
        golf:'🎁 Bonus : tee time le matin avec greens rapides garantis.'},
    ru:{mare:'🎁 Бонус: прогулка на закате с сноркелингом в тайной бухте (+ напиток).',
        montagna:'🎁 Бонус: ужин в горном приюте и возвращение под звёздами.',
        citta:'🎁 Бонус: билет без очереди в 2 музея + напиток на руфтопе.',
        surf:'🎁 Бонус: рассветная сессия с местным тренером и проф‑фото.',
        golf:'🎁 Бонус: утренний ти‑тайм с быстрыми гринами.'},
    de:{mare:'🎁 Bonus: Bootstour zum Sonnenuntergang mit Schnorcheln in geheimer Bucht (+ Getränk).',
        montagna:'🎁 Bonus: Hütten‑Dinner und Rückweg unter Sternenhimmel.',
        citta:'🎁 Bonus: Skip‑the‑Line für 2 Museen + Drink auf dem Rooftop.',
        surf:'🎁 Bonus: Morgendliche Session mit lokalem Coach & Pro‑Fotos.',
        golf:'🎁 Bonus: Tee Time am Morgen, schnelle Greens garantiert.'}
  };
  const dict = B[B[lang]?lang:'it'];
  if(base.includes('mare')||base.includes('isole')||base.includes('snork')) return dict.mare;
  if(base.includes('montagna')||base.includes('trek')||base.includes('arramp')) return dict.montagna;
  if(base.includes('citt')) return dict.citta;
  if(base.includes('surf')) return dict.surf;
  if(base.includes('golf')) return dict.golf;
  return dict.mare;
}

// ===== Open/close modal and delegate clicks on "Scopri di più"
(function(){
  const modal = document.getElementById('destination-modal');
  if(!modal) return;
  const titleEl = modal.querySelector('#dest-title');
  const descEl = modal.querySelector('.dest-desc');
  const hiEl   = modal.querySelector('.dest-highlights');
  const bonusEl= modal.querySelector('.dest-bonus');

  function open(){ modal.classList.add('open'); document.body.style.overflow='hidden'; var ifr=modal.querySelector('iframe[data-src]'); if(ifr && !ifr.src){ ifr.src=ifr.getAttribute('data-src'); } try{ applyModalI18n(); }catch(e){} }
  function close(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  modal.querySelectorAll('[data-close]').forEach(x=> x.addEventListener('click', close));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  document.addEventListener('click', (ev)=>{
    const trg = ev.target.closest('.more'); if(!trg) return;
    ev.preventDefault();
    const card = trg.closest('.city-card');
    const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent || 'La destinazione') : 'La destinazione');
    const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
    titleEl.textContent = catchyTagline(category, city);
    descEl.textContent = longDescription(city, category);
    hiEl.innerHTML = '';
    (trg.dataset.highlights ? trg.dataset.highlights.split('|') : ['scorci fotogenici','cucina locale','atmosfera rilassata','passeggiate al tramonto']).forEach(x=>{
      const li = document.createElement('li'); li.textContent = x.trim(); hiEl.appendChild(li);
    });
    bonusEl.textContent = trg.dataset.bonus || strongBonuses(category);
    open();
  });
})();

// ===== Background photos for category bars (Unsplash)
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const map = {
    'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine',
    'isole':'tropical island,lagoon','cultura':'museum,old town','relax':'spa,resort',
    'citta':'city skyline,europe','safari':'safari,africa','esotici':'tropical,paradise',
    'natura':'forest,nature','fuga-romantica':'romantic,couple','anniversario':'anniversary,romantic',
    'luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
    'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
    'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
    'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
    'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving,reef','snorkeling':'snorkeling,reef',
    'golf':'golf course'
  };
  function applyBG(){
  document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
    const label = btn.querySelector('.label')?.textContent || '';
    const s = slug(label);
    const qmap = {
      mare:'beach,tropical,blue water',
      montagna:'mountain,alps',
      lago:'lake,alpine lake',
      isole:'island,tropical',
      cultura:'culture,city old town',
      relax:'spa,resort',
      'città':'city skyline',
      safari:'safari,africa wildlife',
      esotici:'tropical,exotic island',
      natura:'nature,landscape',
      'destinazioni-popolari':'famous landmarks',
      'fuga-romantica':'romantic getaway,couple',
      anniversario:'romantic dinner,hotel',
      'luna-di-miele':'honeymoon,overwater villa',
      'addio-celibato':'party,nightlife',
      'capodanno-caldo':'new year,beach fireworks',
      premium:'luxury,resort',
      luxury:'luxury,resort',
      estate:'summer,beach',
      primavera:'spring,flowers',
      autunno:'autumn,foliage',
      inverno:'winter,snow',
      snowboard:'snowboard,freeride',
      sci:'ski,alps',
      trekking:'hiking,trail',
      arrampicata:'rock climbing',
      ciclismo:'cycling,road bike',
      surf:'surf,wave',
      immersioni:'scuba diving,reef',
      snorkeling:'snorkeling,reef',
      golf:'golf course'
    };
    const query = qmap[s] || 'travel,landscape';
    const local = 'assets/img/categories/' + s + '.jpg';
    const unsplash = 'https://source.unsplash.com/1600x400/?' + encodeURIComponent(query);
    const explicit = btn.dataset.photo;

    function setBG(url){ btn.style.backgroundImage = 'url(\"'+url+'\")'; }
    function tryURL(url, onfail){
      const test = new Image();
      test.onload = ()=> setBG(url);
      test.onerror = onfail;
      test.src = url;
    }
    // Priority: explicit data-photo -> local -> unsplash -> fallback
    if(explicit){ tryURL(explicit, ()=>tryURL(local, ()=>tryURL(unsplash, ()=>setBG('linear-gradient(120deg,#e8edff,#efe8ff)')))); }
    else { tryURL(local, ()=>tryURL(unsplash, ()=>setBG('linear-gradient(120deg,#e8edff,#efe8ff)'))); }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
else applyBG();
})();


// ===== Simple i18n for more site texts =====
const I18N_MAP = {
  it:{ nav:{hotel:"Hotel",flights:"Voli",affiliates:"Programma affiliato"},
       legal:{privacy:"Privacy",terms:"Termini",cookie:"Cookie"},
       newsletter:{placeholder:"La tua email",subscribe:"Iscriviti"},
       cta:{searchFlights:"Cerca voli"},
       home:{heroTitle:"Trova il tuo prossimo viaggio", heroSubtitle:"Trova l'alloggio che fa per te qui sotto.",
             mapTitle:"Mappa hotel", poweredBy:"Powered by Stay22", categories:"Categorie",
             more:"Scopri di più", seasons:"Stagioni", summer:"Estate", autumn:"Autunno", winter:"Inverno", spring:"Primavera",
             lowcost:"Low Cost", premium:"Premium", luxury:"Luxury",
             trust:{users:"Utenti soddisfatti", destinations:"Destinazioni", partners:"Partner affidabili"},
             cat:{mare:"Mare", montagna:"Montagna", citta:"Città", surf:"Surf", golf:"Golf"}},
       modal:{description:"Descrizione", highlights:"Punti forti", bonus:"Un piccolo bonus"},
       footer:{services:"Servizi", keepintouch:"Resta in contatto", newsletterTitle:"Iscriviti alla nostra newsletter"} },
  en:{ nav:{hotel:"Hotels",flights:"Flights",affiliates:"Affiliate Program"},
       legal:{privacy:"Privacy",terms:"Terms",cookie:"Cookie"},
       newsletter:{placeholder:"Your email",subscribe:"Subscribe"},
       cta:{searchFlights:"Search flights"},
       home:{heroTitle:"Find your next trip", heroSubtitle:"Choose the right stay below.",
             mapTitle:"Hotel map", poweredBy:"Powered by Stay22", categories:"Categories",
             more:"Learn more", seasons:"Seasons", summer:"Summer", autumn:"Autumn", winter:"Winter", spring:"Spring",
             lowcost:"Low Cost", premium:"Premium", luxury:"Luxury",
             trust:{users:"Happy users", destinations:"Destinations", partners:"Trusted partners"},
             cat:{mare:"Sea", montagna:"Mountains", citta:"City", surf:"Surf", golf:"Golf"}},
       modal:{description:"Description", highlights:"Highlights", bonus:"A little bonus"},
       footer:{services:"Services", keepintouch:"Keep in touch", newsletterTitle:"Subscribe to our newsletter"} },
  zh:{ nav:{hotel:"酒店",flights:"机票",affiliates:"联盟计划"},
       legal:{privacy:"隐私政策",terms:"使用条款",cookie:"Cookie 政策"},
       newsletter:{placeholder:"您的邮箱",subscribe:"订阅"},
       cta:{searchFlights:"搜索机票"},
       home:{heroTitle:"发现下一次旅行", heroSubtitle:"在下方选择合适的住宿。",
             mapTitle:"酒店地图", poweredBy:"Powered by Stay22", categories:"分类",
             more:"了解更多", seasons:"季节", summer:"夏季", autumn:"秋季", winter:"冬季", spring:"春季",
             lowcost:"经济", premium:"高端", luxury:"奢华",
             trust:{users:"满意用户", destinations:"目的地", partners:"可靠合作伙伴"},
             cat:{mare:"海边", montagna:"山地", citta:"城市", surf:"冲浪", golf:"高尔夫"}},
       modal:{description:"简介", highlights:"亮点", bonus:"小礼遇"},
       footer:{services:"服务", keepintouch:"保持联系", newsletterTitle:"订阅我们的通讯"} },
  es:{ nav:{hotel:"Hoteles",flights:"Vuelos",affiliates:"Programa de afiliados"},
       legal:{privacy:"Privacidad",terms:"Términos",cookie:"Cookies"},
       newsletter:{placeholder:"Tu correo electrónico",subscribe:"Suscribirse"},
       cta:{searchFlights:"Buscar vuelos"},
       home:{heroTitle:"Encuentra tu próximo viaje", heroSubtitle:"Elige el alojamiento adecuado aquí abajo.",
             mapTitle:"Mapa de hoteles", poweredBy:"Powered by Stay22", categories:"Categorías",
             more:"Saber más", seasons:"Estaciones", summer:"Verano", autumn:"Otoño", winter:"Invierno", spring:"Primavera",
             lowcost:"Económico", premium:"Premium", luxury:"Lujo",
             trust:{users:"Usuarios satisfechos", destinations:"Destinos", partners:"Socios de confianza"},
             cat:{mare:"Costa", montagna:"Montaña", citta:"Ciudad", surf:"Surf", golf:"Golf"}},
       modal:{description:"Descripción", highlights:"Puntos fuertes", bonus:"Un pequeño bonus"},
       footer:{services:"Servicios", keepintouch:"Mantente en contacto", newsletterTitle:"Suscríbete a nuestro boletín"} },
  hi:{ nav:{hotel:"होटल",flights:"उड़ानें",affiliates:"सहबद्ध कार्यक्रम"},
       legal:{privacy:"गोपनीयता नीति",terms:"नियम एवं शर्तें",cookie:"कुकी नीति"},
       newsletter:{placeholder:"आपका ई‑मेल",subscribe:"सब्स्क्राइब करें"},
       cta:{searchFlights:"उड़ानें खोजें"},
       home:{heroTitle:"अपनी अगली यात्रा चुनें", heroSubtitle:"नीचे सही ठहरने की जगह चुनें।",
             mapTitle:"होटल मानचित्र", poweredBy:"Powered by Stay22", categories:"श्रेणियाँ",
             more:"और जानें", seasons:"मौसम", summer:"गर्मी", autumn:"पतझड़", winter:"सर्दी", spring:"बसंत",
             lowcost:"लो‑कॉस्ट", premium:"प्रीमियम", luxury:"लक्ज़री",
             trust:{users:"खुश उपयोगकर्ता", destinations:"गंतव्य", partners:"विश्वसनीय पार्टनर"},
             cat:{mare:"समुद्र", montagna:"पहाड़", citta:"शहर", surf:"सर्फ", golf:"गोल्फ"}},
       modal:{description:"विवरण", highlights:"विशेषताएँ", bonus:"एक छोटा बोनस"},
       footer:{services:"सेवाएँ", keepintouch:"संपर्क बनाए रखें", newsletterTitle:"हमारे न्यूज़लेटर की सदस्यता लें"} },
  ar:{ nav:{hotel:"الفنادق",flights:"الرحلات",affiliates:"برنامج التسويق بالعمولة"},
       legal:{privacy:"سياسة الخصوصية",terms:"الشروط والأحكام",cookie:"سياسة ملفات تعريف الارتباط"},
       newsletter:{placeholder:"بريدك الإلكتروني",subscribe:"اشترك"},
       cta:{searchFlights:"ابحث عن رحلات"},
       home:{heroTitle:"اعثر على رحلتك القادمة", heroSubtitle:"اختر الإقامة المناسبة أدناه.",
             mapTitle:"خريطة الفنادق", poweredBy:"Powered by Stay22", categories:"التصنيفات",
             more:"اعرف المزيد", seasons:"الفصول", summer:"الصيف", autumn:"الخريف", winter:"الشتاء", spring:"الربيع",
             lowcost:"اقتصادي", premium:"ممتاز", luxury:"فاخر",
             trust:{users:"مستخدمون سعداء", destinations:"وجهات", partners:"شركاء موثوقون"},
             cat:{mare:"بحر", montagna:"جبال", citta:"مدينة", surf:"ركمجة", golf:"غولف"}},
       modal:{description:"الوصف", highlights:"أبرز الميزات", bonus:"هدية صغيرة"},
       footer:{services:"الخدمات", keepintouch:"ابقَ على اتصال", newsletterTitle:"اشترك في نشرتنا"} },
  fr:{ nav:{hotel:"Hôtels",flights:"Vols",affiliates:"Programme d’affiliation"},
       legal:{privacy:"Confidentialité",terms:"Conditions",cookie:"Cookies"},
       newsletter:{placeholder:"Votre e‑mail",subscribe:"S’abonner"},
       cta:{searchFlights:"Rechercher des vols"},
       home:{heroTitle:"Trouvez votre prochain voyage", heroSubtitle:"Choisissez l’hébergement adapté ci‑dessous.",
             mapTitle:"Carte des hôtels", poweredBy:"Powered by Stay22", categories:"Catégories",
             more:"En savoir plus", seasons:"Saisons", summer:"Été", autumn:"Automne", winter:"Hiver", spring:"Printemps",
             lowcost:"Petit budget", premium:"Premium", luxury:"Luxe",
             trust:{users:"Utilisateurs satisfaits", destinations:"Destinations", partners:"Partenaires de confiance"},
             cat:{mare:"Mer", montagna:"Montagne", citta:"Ville", surf:"Surf", golf:"Golf"}},
       modal:{description:"Description", highlights:"Points forts", bonus:"Un petit bonus"},
       footer:{services:"Services", keepintouch:"Restez en contact", newsletterTitle:"Abonnez‑vous à notre newsletter"} },
  ru:{ nav:{hotel:"Отели",flights:"Авиабилеты",affiliates:"Партнёрская программа"},
       legal:{privacy:"Политика конфиденциальности",terms:"Условия",cookie:"Политика cookie"},
       newsletter:{placeholder:"Ваш e‑mail",subscribe:"Подписаться"},
       cta:{searchFlights:"Поиск авиабилетов"},
       home:{heroTitle:"Найдите следующую поездку", heroSubtitle:"Выберите подходящее размещение ниже.",
             mapTitle:"Карта отелей", poweredBy:"Powered by Stay22", categories:"Категории",
             more:"Подробнее", seasons:"Сезоны", summer:"Лето", autumn:"Осень", winter:"Зима", spring:"Весна",
             lowcost:"Недорого", premium:"Премиум", luxury:"Люкс",
             trust:{users:"Довольные пользователи", destinations:"Направления", partners:"Надёжные партнёры"},
             cat:{mare:"Море", montagna:"Горы", citta:"Город", surf:"Сёрфинг", golf:"Гольф"}},
       modal:{description:"Описание", highlights:"Сильные стороны", bonus:"Небольшой бонус"},
       footer:{services:"Сервисы", keepintouch:"Оставайтесь на связи", newsletterTitle:"Подпишитесь на нашу рассылку"} },
  de:{ nav:{hotel:"Hotels",flights:"Flüge",affiliates:"Partnerprogramm"},
       legal:{privacy:"Datenschutz",terms:"AGB",cookie:"Cookies"},
       newsletter:{placeholder:"Ihre E‑Mail",subscribe:"Abonnieren"},
       cta:{searchFlights:"Flüge suchen"},
       home:{heroTitle:"Finde deine nächste Reise", heroSubtitle:"Wähle unten die passende Unterkunft.",
             mapTitle:"Hotelkarte", poweredBy:"Powered by Stay22", categories:"Kategorien",
             more:"Mehr erfahren", seasons:"Jahreszeiten", summer:"Sommer", autumn:"Herbst", winter:"Winter", spring:"Frühling",
             lowcost:"Günstig", premium:"Premium", luxury:"Luxus",
             trust:{users:"Zufriedene Nutzer", destinations:"Ziele", partners:"Vertrauenspartner"},
             cat:{mare:"Meer", montagna:"Berge", citta:"Stadt", surf:"Surf", golf:"Golf"}},
       modal:{description:"Beschreibung", highlights:"Highlights", bonus:"Ein kleines Extra"},
       footer:{services:"Services", keepintouch:"Bleib in Kontakt", newsletterTitle:"Newsletter abonnieren"} }
};

function applyLocale(lang){
  const L = I18N_MAP[I18N_MAP[lang]?lang:'it'];
  document.documentElement.lang = lang;
  document.documentElement.dir  = (lang==='ar') ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n').split('.').reduce((o,k)=>o&&o[k], L);
    if(key && el.textContent!==key) el.textContent = key;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder').split('.').reduce((o,k)=>o&&o[k], L);
    if(key) el.setAttribute('placeholder', key);
  });
  // Translate some raw texts if still present
  const RAW = {
    "Trova il tuo prossimo viaggio":"home.heroTitle",
    "Trova l'alloggio che fa per te qui sotto.":"home.heroSubtitle",
    "Mappa hotel":"home.mapTitle",
    "Powered by Stay22":"home.poweredBy",
    "Categorie":"home.categories",
    "Scopri di più":"home.more",
    "Stagioni":"home.seasons",
    "Estate":"home.summer","Autunno":"home.autumn","Inverno":"home.winter","Primavera":"home.spring",
    "Low Cost":"home.lowcost","Premium":"home.premium","Luxury":"home.luxury",
    "Utenti soddisfatti":"home.trust.users","Destinazioni":"home.trust.destinations","Partner affidabili":"home.trust.partners",
    "Servizi":"footer.services","Resta in contatto":"footer.keepintouch","Iscriviti alla nostra newsletter":"footer.newsletterTitle",
    "Hotel":"nav.hotel","Voli":"nav.flights","Programma affiliato":"nav.affiliates"
  };
  Object.keys(RAW).forEach(it=>{
    document.querySelectorAll('*').forEach(el=>{
      if(el.children.length===0 && el.textContent.trim()===it){
        const key = RAW[it].split('.').reduce((o,k)=>o&&o[k], L);
        if(key) el.textContent = key;
      }
    });
  });
}

// Modal translation hooks: translate highlights on the fly
function applyModalI18n(){
  const lang = (localStorage.getItem('lang') || document.documentElement.lang || 'it').slice(0,2);
  const L = I18N_MAP[I18N_MAP[lang]?lang:'it'];
  const map = {
    it:{'scorci fotogenici':'scorci fotogenici','cucina locale':'cucina locale','atmosfera rilassata':'atmosfera rilassata','passeggiate al tramonto':'passeggiate al tramonto'},
    en:{'scorci fotogenici':'photogenic spots','cucina locale':'local cuisine','atmosfera rilassata':'laid‑back vibe','passeggiate al tramonto':'sunset walks'},
    zh:{'scorci fotogenici':'出片机位','cucina locale':'地道美食','atmosfera rilassata':'松弛氛围','passeggiate al tramonto':'日落漫步'},
    es:{'scorci fotogenici':'rincones fotogénicos','cucina locale':'cocina local','atmosfera rilassata':'ambiente relajado','passeggiate al tramonto':'paseos al atardecer'},
    hi:{'scorci fotogenici':'फोटोजेनिक स्थान','cucina locale':'लोकल खाना','atmosfera rilassata':'आरामदायक माहौल','passeggiate al tramonto':'सूर्यास्त की सैर'},
    ar:{'scorci fotogenici':'أماكن فوتوجينية','cucina locale':'مطبخ محلي','atmosfera rilassata':'أجواء مريحة','passeggiate al tramonto':'نزهات الغروب'},
    fr:{'scorci fotogenici':'spots photogéniques','cucina locale':'cuisine locale','atmosfera rilassata':'ambiance décontractée','passeggiate al tramonto':'balades au coucher du soleil'},
    ru:{'scorci fotogenici':'фотогеничные места','cucina locale':'местная кухня','atmosfera rilassata':'расслабленная атмосфера','passeggiate al tramonto':'прогулки на закате'},
    de:{'scorci fotogenici':'fotogene Orte','cucina locale':'lokale Küche','atmosfera rilassata':'entspannte Atmosphäre','passeggiate al tramonto':'Spaziergänge bei Sonnenuntergang'}
  }[lang];
  document.querySelectorAll('.dest-highlights li').forEach(li=>{
    const it = li.textContent.trim();
    if(map[it]) li.textContent = map[it];
  });
}

function initI18n(){
  const sel = document.getElementById('lang-switcher');
  const saved = localStorage.getItem('lang') || 'it';
  if(sel){
    sel.value = saved;
    sel.addEventListener('change', ()=>{
      localStorage.setItem('lang', sel.value);
      applyLocale(sel.value);
      applyModalI18n();
    });
  }
  applyLocale(saved);
  applyModalI18n();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initI18n);
else initI18n();
