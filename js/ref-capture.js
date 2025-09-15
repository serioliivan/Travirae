
// Capture ?ref= and persist for 60 days (cookie + localStorage)
(function () {
  try {
    const u = new URL(location.href);
    const ref = u.searchParams.get('ref');
    if (ref) {
      localStorage.setItem('ref', ref);
      document.cookie = "ref=" + encodeURIComponent(ref) + ";path=/;max-age=" + (60*60*24*60);
    }
    window.getRef = () =>
      u.searchParams.get('ref') ||
      (document.cookie.match(/(?:^|; )ref=([^;]+)/)||[])[1] ||
      localStorage.getItem('ref') || '';
  } catch (_e) {}
})();
