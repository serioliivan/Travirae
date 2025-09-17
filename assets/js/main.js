(function(){
  window.addEventListener('load', function(){
    if (window.Stay22) {
      console.log('[Travirae] Stay22 object detected (LMA likely active).');
    } else {
      console.warn('[Travirae] Stay22 object NOT detected. If LMA is expected, check the script in <head>.');
    }
  });
})();