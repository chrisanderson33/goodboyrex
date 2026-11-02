/* Time on page for the weekly report: sends a Vercel Analytics custom event
   "engaged" with the path (p) and the seconds the page was visible and in use
   (s) when the page is hidden or the visitor moves to another page. Stops
   counting after 60s without input. */
(function () {
  if (window.__engaged) return;
  window.__engaged = 1;
  window.va = window.va || function () { (window.vaq = window.vaq || []).push([].slice.call(arguments)); };
  var path = location.pathname, ms = 0, last = Date.now(), input = last;
  function tick() {
    var now = Date.now();
    if (!document.hidden && now - input < 60000) ms += now - last;
    last = now;
  }
  function send(p) {
    tick();
    var s = Math.round(ms / 1000);
    ms = 0;
    if (s < 1) return;
    s = s < 60 ? s : s < 600 ? Math.round(s / 10) * 10 : Math.min(3600, Math.round(s / 60) * 60);
    window.va('event', { name: 'engaged', data: { p: p, s: s } });
  }
  ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'].forEach(function (e) {
    addEventListener(e, function () { tick(); input = Date.now(); }, { passive: true, capture: true });
  });
  setInterval(tick, 5000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) send(path);
    else last = input = Date.now();
  });
  addEventListener('pagehide', function () { send(path); });
  function moved() {
    if (location.pathname === path) return;
    var old = path;
    path = location.pathname;
    send(old);
    last = input = Date.now();
  }
  ['pushState', 'replaceState'].forEach(function (k) {
    var orig = history[k];
    history[k] = function () { var r = orig.apply(this, arguments); moved(); return r; };
  });
  addEventListener('popstate', moved);
})();
