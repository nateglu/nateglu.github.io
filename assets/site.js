// Nate.Glu — door, hover preview, tabs. No dependencies.
(function () {
  var d = document, b = d.body;

  // ---- door: one tap to enter; remembered for the session; never on piece pages
  var door = d.getElementById('door');
  if (door) {
    var entered = false;
    try { entered = sessionStorage.getItem('entered') === '1'; } catch (e) {}
    if (entered || location.hash === '#skipdoor' || location.hash.length > 1) { door.hidden = true; } else { b.classList.add('door-open'); }
    function enter() {
      try { sessionStorage.setItem('entered', '1'); } catch (e) {}
      door.classList.add('leaving'); b.classList.remove('door-open');
      setTimeout(function () { door.hidden = true; }, 260);
    }
    door.addEventListener('click', enter);
    door.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
  }

  // ---- floating preview beside the cursor (desktop only)
  var peek = d.getElementById('peek');
  var fine = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  if (peek && fine) {
    var rows = d.querySelectorAll('ol.list li[data-preview] > a, ol.folders li[data-preview] > a, ul.titles li[data-preview] > a');
    var x = 0, y = 0, raf = null;
    function place() { raf = null; var w = peek.offsetWidth || 320, h = peek.offsetHeight || 400;
      var px = x + 24, py = y + 24; if (px + w > innerWidth - 12) px = x - w - 24; if (py + h > innerHeight - 12) py = Math.max(12, innerHeight - h - 12);
      peek.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(-1deg)'; }
    d.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); });
    Array.prototype.forEach.call(rows, function (a) {
      var li = a.parentNode;
      function show(e) { var src = li.getAttribute('data-preview'); if (!src) return; if (e && typeof e.clientX === 'number') { x = e.clientX; y = e.clientY; } if (peek.getAttribute('src') !== src) peek.setAttribute('src', src); peek.classList.add('on'); place(); }
      function hide() { peek.classList.remove('on'); }
      a.addEventListener('mouseenter', show); a.addEventListener('mouseleave', hide);
      a.addEventListener('focus', function () { var r = a.getBoundingClientRect(); x = r.right - 60; y = r.top; show(); place(); });
      a.addEventListener('blur', hide);
    });
  }

  // ---- tabs: one word narrows to that group; the same word again brings everything back
  var nav = d.querySelector('nav.tabs');
  if (nav) {
    var btns = nav.querySelectorAll('button[data-filter]');
    var groups = d.querySelectorAll('section.group, ol.list > li[data-type]');
    var current = 'all';
    function apply(f, push) {
      current = f;
      Array.prototype.forEach.call(groups, function (g) { g.hidden = !(f === 'all' || g.getAttribute('data-type') === f); });
      Array.prototype.forEach.call(btns, function (bt) { bt.setAttribute('aria-pressed', bt.getAttribute('data-filter') === f ? 'true' : 'false'); });
      if (push) { try { history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f); } catch (e) {} }
    }
    Array.prototype.forEach.call(btns, function (bt) {
      bt.addEventListener('click', function () { var f = bt.getAttribute('data-filter'); apply(f === current ? 'all' : f, true); });
    });
    var h = (location.hash || '').replace('#', '');
    apply(['design', 'music', 'brand'].indexOf(h) >= 0 ? h : 'all', false);
  }

  // ---- the tower clock: Minneapolis time, hands only (old clocks don't do seconds)
  var clock = d.querySelector('.clock'), big = d.querySelector('.bigclock');
  if (clock || big) {
    var tz = b.getAttribute('data-tz') || 'America/Chicago', hh = big && big.querySelector('.hh'), mh = big && big.querySelector('.mh'), tt = clock && clock.querySelector('.t');
    function tick() {
      var parts, h, m;
      try { parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()); }
      catch (e) { var n = new Date(); parts = [{ type: 'hour', value: n.getHours() }, { type: 'minute', value: n.getMinutes() }]; }
      parts.forEach(function (p) { if (p.type === 'hour') h = parseInt(p.value, 10) % 24; if (p.type === 'minute') m = parseInt(p.value, 10); });
      if (isNaN(h) || isNaN(m)) return;
      if (mh) mh.style.transform = 'rotate(' + (m * 6) + 'deg)'; if (hh) hh.style.transform = 'rotate(' + (((h % 12) + m / 60) * 30) + 'deg)';
      var h12 = h % 12 || 12; if (tt) tt.textContent = h12 + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? 'am' : 'pm');
    }
    tick(); setInterval(tick, 15000);
  }
})();
