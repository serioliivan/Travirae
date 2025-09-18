
// Simple i18n without dependencies
const T = {
  en: {
    home: "Home", flights: "Flights", hotels:"Hotels", partners:"Partner",
    login:"Login", signup:"Sign up",
    heroKicker: "TRAVIRAE",
    heroTitle: "Find your next Vacation stay",
    heroSub: "Compare flights and stays in one place. Below you can also browse the live hotel map.",
    mapTitle:"Type where you want to go to see nearby stays",
    seeStays:"Stays", seeFlights:"Flights",
    popular:"Popular destinations",
    saveBanner:"Want to save money? Open the Price Calendar and find the cheapest days.",
    openCalendar:"Open price calendar"
  },
  it: {
    home:"Home", flights:"Voli", hotels:"Hotel", partners:"Partner",
    login:"Login", signup:"Sign up",
    heroKicker:"TRAVIRAE",
    heroTitle:"Find your next Vacation stay",
    heroSub:"Confronta voli e alloggi in un'unica interfaccia. Sotto trovi anche la mappa degli alloggi.",
    mapTitle:"Digita qui dove vorresti andare in modo da vedere ulteriori alloggi",
    seeStays:"Alloggi", seeFlights:"Voli",
    popular:"Destinazioni popolari",
    saveBanner:"Vuoi risparmiare? Apri il calendario prezzi e trova i giorni più economici.",
    openCalendar:"Apri calendario prezzi"
  },
  es: {
    home:"Inicio", flights:"Vuelos", hotels:"Hoteles", partners:"Partners",
    login:"Acceder", signup:"Registrarse",
    heroKicker:"TRAVIRAE",
    heroTitle:"Encuentra tu próxima estancia",
    heroSub:"Compara vuelos y alojamientos en un solo lugar. Debajo tienes el mapa de hoteles.",
    mapTitle:"Escribe adónde quieres ir para ver más alojamientos",
    seeStays:"Alojamientos", seeFlights:"Vuelos",
    popular:"Destinos populares",
    saveBanner:"¿Quieres ahorrar? Abre el calendario de precios y encuentra los días más económicos.",
    openCalendar:"Abrir calendario"
  },
  fr: {
    home:"Accueil", flights:"Vols", hotels:"Hôtels", partners:"Partenaires",
    login:"Connexion", signup:"S'inscrire",
    heroKicker:"TRAVIRAE",
    heroTitle:"Trouvez votre prochain séjour",
    heroSub:"Comparez vols et logements au même endroit. La carte des hôtels est plus bas.",
    mapTitle:"Saisissez où vous voulez aller pour voir plus de logements",
    seeStays:"Séjours", seeFlights:"Vols",
    popular:"Destinations populaires",
    saveBanner:"Envie d'économiser ? Ouvrez le calendrier des prix et trouvez les jours les moins chers.",
    openCalendar:"Ouvrir le calendrier"
  },
  de: {
    home:"Start", flights:"Flüge", hotels:"Hotels", partners:"Partner",
    login:"Anmelden", signup:"Registrieren",
    heroKicker:"TRAVIRAE",
    heroTitle:"Finde deine nächste Reise",
    heroSub:"Vergleiche Flüge und Unterkünfte an einem Ort. Unten findest du die Hotelkarte.",
    mapTitle:"Gib dein Ziel ein, um mehr Unterkünfte in der Nähe zu sehen",
    seeStays:"Unterkünfte", seeFlights:"Flüge",
    popular:"Beliebte Reiseziele",
    saveBanner:"Sparen? Öffne den Preiskalender und finde die günstigsten Tage.",
    openCalendar:"Preiskalender öffnen"
  },
  ru: {
    home:"Главная", flights:"Авиабилеты", hotels:"Отели", partners:"Партнёры",
    login:"Войти", signup:"Регистрация",
    heroKicker:"TRAVIRAE",
    heroTitle:"Найдите своё следующее путешествие",
    heroSub:"Сравнивайте авиабилеты и жильё в одном месте. Ниже — карта отелей.",
    mapTitle:"Введите место назначения, чтобы увидеть больше вариантов рядом",
    seeStays:"Жильё", seeFlights:"Авиабилеты",
    popular:"Популярные направления",
    saveBanner:"Хотите сэкономить? Откройте календарь цен и найдите самые дешёвые дни.",
    openCalendar:"Открыть календарь"
  },
  zh: {
    home:"首页", flights:"机票", hotels:"酒店", partners:"合作伙伴",
    login:"登录", signup:"注册",
    heroKicker:"TRAVIRAE",
    heroTitle:"寻找下一次度假之旅",
    heroSub:"在一个地方比较机票与住宿。下方可浏览酒店地图。",
    mapTitle:"输入目的地以查看附近住宿",
    seeStays:"住宿", seeFlights:"机票",
    popular:"热门目的地",
    saveBanner:"想省钱？打开价格日历，找到最便宜的日期。",
    openCalendar:"打开价格日历"
  },
  hi: {
    home:"होम", flights:"उड़ानें", hotels:"होटल", partners:"पार्टनर",
    login:"लॉगिन", signup:"साइन अप",
    heroKicker:"TRAVIRAE",
    heroTitle:"अपनी अगली यात्रा खोजें",
    heroSub:"एक ही जगह पर फ़्लाइट और ठहरने की तुलना करें। नीचे होटल मैप भी है।",
    mapTitle:"जहाँ जाना चाहते हैं लिखें ताकि आसपास के ठहराव दिखें",
    seeStays:"स्टे", seeFlights:"फ़्लाइट",
    popular:"लोकप्रिय स्थान",
    saveBanner:"बचत करना चाहते हैं? कीमत कैलेंडर खोलें और सबसे सस्ते दिन देखें.",
    openCalendar:"कैलेंडर खोलें"
  }
};

function setLang(code){
  const t = T[code] || T['en'];
  document.querySelectorAll('[data-t]').forEach(el=>{
    const k = el.getAttribute('data-t');
    if (t[k]) el.textContent = t[k];
  });
  // Buttons
  document.querySelectorAll('[data-t-btn-stays]').forEach(el=> el.textContent = t.seeStays);
  document.querySelectorAll('[data-t-btn-flights]').forEach(el=> el.textContent = t.seeFlights);
  // html lang
  document.documentElement.setAttribute('lang', code);
  localStorage.setItem('lang', code);
}

window.addEventListener('DOMContentLoaded', ()=>{
  const sel = document.getElementById('lang');
  const saved = localStorage.getItem('lang') || 'it';
  sel.value = saved; setLang(saved);
  sel.addEventListener('change', e=> setLang(e.target.value));
  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href').slice(1);
      const dst = document.getElementById(id);
      if (dst){ e.preventDefault(); dst.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });
});
