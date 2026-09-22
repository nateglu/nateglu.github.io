// nate.glu option B (early 2000s): the visit counter and the loading bar on the door. The door, hover preview and clock come from site.js.
(function () {
  var d = document;
  // your own visits, counted in your own browser: an honest hit counter
  var odo = d.getElementById('odo');
  if (odo) {
    var n = 1;
    try { n = parseInt(localStorage.getItem('ng_visits') || '0', 10) || 0; if (!sessionStorage.getItem('ng_counted')) { n += 1; localStorage.setItem('ng_visits', String(n)); sessionStorage.setItem('ng_counted', '1'); } n = Math.max(1, n); } catch (e) { n = 1; }
    var s = ('00000' + n).slice(-5); odo.innerHTML = s.split('').map(function (c) { return '<i>' + c + '</i>'; }).join('');
  }
  // the door: count the loading bar up, then say done
  var pct = d.querySelector('#door .pct');
  if (pct && !(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches)) {
    var t0 = Date.now(), iv = setInterval(function () { var k = Math.min(1, (Date.now() - t0 - 200) / 1500); pct.textContent = k < 1 ? 'loading ' + Math.max(0, Math.round(k * 100)) + '%' : 'done'; if (k >= 1) clearInterval(iv); }, 80);
  } else if (pct) pct.textContent = 'done';
  // the door opens by itself once the bar has filled; nobody has to work out that it wants a tap
  var door = d.getElementById('door'); if (door) setTimeout(function () { if (!door.hidden && !door.classList.contains('leaving')) door.click(); }, pct && !(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) ? 2300 : 700);
  // local preview only: when the site gets rebuilt, every open tab reloads itself, so nobody looks at an old copy (never runs on the live site)
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    var mine = d.body.getAttribute('data-build');
    setInterval(function () { if (d.hidden) return; fetch('/build.txt?' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : mine; }).then(function (v) { if (v && mine && v.trim() !== mine) location.reload(); }).catch(function () {}); }, 4000);
    d.addEventListener('visibilitychange', function () { if (!d.hidden) fetch('/build.txt?' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (v) { if (v.trim() !== mine) location.reload(); }).catch(function () {}); });
  }
  // [ top ]
  var top = d.querySelector('a.top'); if (top) top.addEventListener('click', function (e) { e.preventDefault(); scrollTo(0, 0); });
})();
