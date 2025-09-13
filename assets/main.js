/* Minimal enhancements + helpers. */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-ready');

  // Smooth scroll for internal anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Reveal-on-scroll for gallery cards
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // OPTIONAL: Example dynamic widget injection using your APP_CONFIG
  // (Kept commented because you asked to use the exact script you provided on the page)
  /*
  if (window.APP_CONFIG) {
    const s = document.createElement('script');
    const c = window.APP_CONFIG;
    const params = new URLSearchParams({
      currency: c.TP_CURRENCY.toLowerCase(),
      trs: c.TP_TRS,
      shmarker: c.TP_SHMARKER,
      combine_promos: c.TP_CAMPAIGN_ID_HOTEL + "_" + c.TP_PROMO_ID_FLIGHTS,
      show_hotels: "true",
      powered_by: "true",
      locale: c.TP_LOCALE,
      searchUrl: "www.aviasales.com%2Fsearch",
      primary_override: "#32a8dd",
      color_button: "#32a8dd",
      color_icons: "#32a8dd",
      dark: "#262626",
      light: "#FFFFFF",
      secondary: "#FFFFFF",
      special: "#C4C4C4",
      color_focused: "#32a8dd",
      border_radius: "0",
      no_labels: "true",
      plain: "true",
      promo_id: c.TP_PROMO_ID_FLIGHTS,
      campaign_id: c.TP_CAMPAIGN_ID_FLIGHTS
    });
    s.src = "https://tpemd.com/content?" + params.toString();
    s.async = true;
    s.charset = "utf-8";
    // document.querySelector('#widget-slot').appendChild(s);
  }
  */
});
