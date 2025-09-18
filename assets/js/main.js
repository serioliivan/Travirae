
(() => {
  const T = {
    it:{home:"HOME",flights:"VOLI",hotels:"HOTEL",partner:"PARTNER",
        heroTitle:"Trova il tuo prossimo viaggio", heroSub:"Confronta voli e alloggi nelle migliori destinazioni.",
        mapTitle:"Digita qui dove vorresti andare in modo da vedere ulteriori alloggi",
        dest:"Destinazioni popolari", btnStays:"Alloggi", btnFlights:"Voli",
        cta:"Vuoi risparmiare? Apri il calendario prezzi e trova i giorni più economici.", ctaBtn:"Apri calendario prezzi",
        login:"ACCEDI", signup:"REGISTRATI"},
    en:{home:"HOME",flights:"FLIGHTS",hotels:"HOTELS",partner:"PARTNER",
        heroTitle:"Find your next trip", heroSub:"Compare flights and stays in top destinations worldwide.",
        mapTitle:"Type where you want to go to see more stays nearby",
        dest:"Popular destinations", btnStays:"Stays", btnFlights:"Flights",
        cta:"Want to save? Open the price calendar to find the cheapest days.", ctaBtn:"Open price calendar",
        login:"LOGIN", signup:"SIGN UP"}
  };
  const langSel = document.getElementById('lang-select');
  const current = localStorage.getItem('lang') || 'it';
  function apply(l){
    const t = T[l]||T.it;
    document.documentElement.lang = l;
    document.querySelector('[data-i18n=nav.home]').textContent = t.home;
    document.querySelector('[data-i18n=nav.flights]').textContent = t.flights;
    document.querySelector('[data-i18n=nav.hotels]').textContent = t.hotels;
    document.querySelector('[data-i18n=nav.partner]').textContent = t.partner;
    document.querySelector('[data-i18n=hero.title]').textContent = t.heroTitle;
    document.querySelector('[data-i18n=hero.sub]').textContent = t.heroSub;
    document.querySelector('[data-i18n=map.title]').textContent = t.mapTitle;
    document.querySelector('[data-i18n=dest.title]').textContent = t.dest;
    document.querySelectorAll('[data-i18n=btn.stays]').forEach(b=>b.textContent=t.btnStays);
    document.querySelectorAll('[data-i18n=btn.flights]').forEach(b=>b.textContent=t.btnFlights);
    document.querySelector('[data-i18n=cta.lead]').textContent = t.cta;
    document.querySelector('[data-i18n=cta.btn]').textContent = t.ctaBtn;
    document.querySelector('.auth .login').textContent = t.login;
    document.querySelector('.auth .signup').textContent = t.signup;
    localStorage.setItem('lang', l);
  }
  if(langSel){ langSel.value = current; apply(current); langSel.addEventListener('change', e=>apply(e.target.value)); }
})();
