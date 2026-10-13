// Machine-readable copy of every wealth value used on this page lives in
// wealth.json (same directory). After the page loads it is also available in
// the browser console as window.WEALTH_DATA, e.g.:
//   WEALTH_DATA.people.jeff_bezos.net_worth  // 378000000000
window.WEALTH_DATA = null;
fetch('wealth.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    window.WEALTH_DATA = data;
    document.dispatchEvent(new CustomEvent('wealthdata', { detail: data }));
  })
  .catch(function () { /* page works fine without it (e.g. file://) */ });

var bezos = document.getElementById('bezos');
var bezos_counter = document.getElementById('bezos-counter');
var bezosCounterStart = document.getElementById('bezos-counter-start');

var four_hundred = document.getElementById('four-hundred');
var four_hundred_counter = document.getElementById('four-hundred-counter');
var four_hundred_counter_start = document.getElementById('four-hundred-counter-start');

var sixtyPercent = document.getElementById('sixty-percent');
var sixtyPercentIndicator = document.getElementById('sixty-percent-indicator');
var sixtyPercentScrollPercentage = 0.0;
var babies = document.getElementById('babies-wrapper');
var baby_counter = document.getElementById('baby-counter');

var thousand = new Intl.NumberFormat('en-US')
var money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

//todo: also work for 400 richest
window.addEventListener('scroll', function(){
  update_wealth_counter();
});

function generate_sixty_percent() {
  for (var i = 0; i < 100; i++) {
    var node = document.createElement("div");
    node.classList = "people";
    if (i === 0) {
      node.classList += " first";
    }
    document.getElementById("sixty-percent").appendChild(node);
  }
}
generate_sixty_percent();

sixtyPercent.addEventListener('scroll', function(){
  let newScroll = ((sixtyPercent.scrollTop / sixtyPercent.scrollHeight) * 50).toFixed(1);
  if (sixtyPercentScrollPercentage !== newScroll) {
    sixtyPercentScrollPercentage = newScroll;
    sixtyPercentIndicator.innerHTML = newScroll + '%';
  }
})
babies.addEventListener('scroll', function(){
  let is_mobile = window.innerWidth <= 450;
  let bg_size = (is_mobile) ? 68 : 160;
  baby_counter.innerHTML = thousand.format(Math.floor(babies.scrollTop / bg_size * 5));
})

//Todo: stop executing once scrolled past
function update_wealth_counter() {
  if (bezos_viewable()) {
    if (bezos_counter_viewable()) {
      let wealth = (window.scrollX - bezos.offsetLeft + 175) * 500000;
      bezos_counter.innerHTML = (wealth < 378000000000) ? money.format(wealth) : "$378,000,000,000.00";
    }
    else {
      bezos_counter.innerHTML = '';
    }
  }
  else if (four_hundred_viewable()) {
    if (four_hundred_counter_viewable()) {
      let wealth = (window.scrollX - four_hundred.offsetLeft + 175) * 500000;
      four_hundred_counter.innerHTML = (wealth < 8000000000000) ? money.format(wealth) : "$8,000,000,000,000.00";
    }
    else {
      bezos_counter.innerHTML = '';
    }
  }
  function bezos_viewable() {
    return window.scrollX < bezos.offsetLeft + bezos.offsetWidth + 100;
  }
  function bezos_counter_viewable() {
    return bezosCounterStart.offsetLeft - window.scrollX < (window.innerWidth);
  }
  function four_hundred_viewable() {
    return window.scrollX < four_hundred.offsetLeft + four_hundred.offsetWidth + 100;
  }
  function four_hundred_counter_viewable() {
    return four_hundred_counter_start.offsetLeft - window.scrollX < (window.innerWidth);
  }
}
function toggleZoom() {
  document.getElementById('line-chart').classList.toggle('zoom');
}

// ---- Auto-scroll (play/pause) ----
// The button appears once the reader is about 3/4 of the way through the
// horizontal scroll of the row they are reading (the Bezos row or the much
// longer Forbes 400 row). Playback ramps up to cruising speed, and any
// manual scroll input (wheel/trackball, touch, keys, mouse drag) pauses it.
(function () {
  var btn = document.getElementById('autoscroll-btn');
  if (!btn) return;
  var raf = null, lastTs = null, speed = 0, playing = false;
  var MAX_SPEED = 9000; // px per second
  var RAMP = 1500;      // px per second gained per second

  function maxScrollX() {
    return document.documentElement.scrollWidth - window.innerWidth;
  }
  function rowWidth() {
    var center = window.innerHeight / 2;
    var r = four_hundred.getBoundingClientRect();
    if (r.top <= center && r.bottom >= center) {
      return document.documentElement.scrollWidth;
    }
    return bezos.offsetLeft + bezos.offsetWidth + 400;
  }
  function progress() {
    // Whichever is further along: the current row, or the page as a whole.
    var overall = maxScrollX() > 0 ? window.scrollX / maxScrollX() : 0;
    var w = rowWidth() - window.innerWidth;
    var row = w > 0 ? window.scrollX / w : 0;
    return Math.max(overall, row);
  }
  var unlocked = false; // once reached, the button stays available for the session
  function updateVisibility() {
    if (progress() >= 0.75) unlocked = true;
    btn.hidden = !playing && !unlocked;
  }
  function stop() {
    playing = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null; lastTs = null; speed = 0;
    btn.innerHTML = '&#9654; Auto-scroll';
    updateVisibility();
  }
  function step(ts) {
    if (!playing) return;
    if (lastTs === null) lastTs = ts;
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    speed = Math.min(MAX_SPEED, speed + RAMP * dt);
    window.scrollBy(speed * dt, 0);
    if (window.scrollX >= maxScrollX() - 1) { stop(); return; }
    raf = requestAnimationFrame(step);
  }
  function start() {
    playing = true;
    btn.hidden = false;
    btn.innerHTML = '&#10073;&#10073; Pause';
    raf = requestAnimationFrame(step);
  }
  btn.addEventListener('click', function () { playing ? stop() : start(); });
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
  window.addEventListener('wheel', function () { if (playing) stop(); }, { passive: true });
  window.addEventListener('touchmove', function () { if (playing) stop(); }, { passive: true });
  window.addEventListener('mousedown', function (e) { if (playing && e.target !== btn) stop(); });
  window.addEventListener('keydown', function (e) {
    if (playing && e.target !== btn &&
        ['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', ' ', 'Home', 'End'].indexOf(e.key) >= 0) stop();
  });
  updateVisibility();
})();
