import { haversine, scoreFor } from './scoring.js';
import { MIXED_LOCS } from '../data/mixed.js';

const ESRI_WORLD_LIVE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const SAT_ZOOM = 7; // ~1000 km de vue
const SCORE_MULT = 1;

/* ════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════ */
let round      = 0;
let totalScore = 0;
let results    = [];
let usedIdx    = [];
let target     = null;
let guess      = null;
let gMarker    = null;

let hintUsed    = false;
let hintMarkers = [];

let satMap   = null;
let guessMap = null;
let rrMap    = null;

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirm-btn').addEventListener('click', confirmGuess);
  document.getElementById('hint-btn').addEventListener('click', showHint);
  document.getElementById('btn-next').addEventListener('click', nextRound);
  document.getElementById('btn-replay').addEventListener('click', () => {
    round = 0; totalScore = 0; results = []; usedIdx = [];
    document.getElementById('result').classList.remove('on');
    startGame();
  });

  startGame();
});

/* ════════════════════════════════════════════════
   UTILS
════════════════════════════════════════════════ */
function kill(map) {
  if (map) map.remove();
  return null;
}

function mkPinIcon(cls) {
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"></div>`,
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
  });
}

function pickLoc() {
  if (usedIdx.length >= MIXED_LOCS.length) usedIdx = [];
  let i;
  do { i = Math.floor(Math.random() * MIXED_LOCS.length); } while (usedIdx.includes(i));
  usedIdx.push(i);
  return MIXED_LOCS[i];
}

/* ════════════════════════════════════════════════
   GAME FLOW
════════════════════════════════════════════════ */
function startGame() {
  beginRound();
}

function beginRound() {
  round++;
  guess = null; gMarker = null;
  target = pickLoc();

  document.getElementById('round-lbl').textContent  = `Manche ${round} / 5`;
  document.getElementById('score-val').textContent  = totalScore.toLocaleString('fr');
  document.getElementById('confirm-btn').classList.remove('on');

  const dotsEl = document.getElementById('round-dots');
  dotsEl.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const d = document.createElement('div');
    d.className = 'rd' + (i < round ? ' done' : i === round ? ' current' : '');
    dotsEl.appendChild(d);
  }

  hintUsed = false; hintMarkers = [];
  const hintBtn = document.getElementById('hint-btn');
  hintBtn.classList.remove('used');
  hintBtn.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.75" stroke="currentColor" stroke-width="1.3"/>
      <path d="M4.8 4.9C4.8 4 5.6 3.2 6.5 3.2C7.4 3.2 8.2 4 8.2 4.9C8.2 5.8 7.1 6.3 6.5 7.1V7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="6.5" cy="9.5" r="0.65" fill="currentColor"/>
    </svg>
    Indices`;

  satMap   = kill(satMap);
  guessMap = kill(guessMap);

  satMap = L.map('sat-map', {
    center: [target.lat, target.lng],
    zoom: SAT_ZOOM,
    zoomControl: false, attributionControl: false,
    dragging: false, touchZoom: false, doubleClickZoom: false,
    scrollWheelZoom: false, boxZoom: false, keyboard: false,
  });
  L.tileLayer(ESRI_WORLD_LIVE, { maxZoom: 19 }).addTo(satMap);
  setTimeout(() => satMap.invalidateSize(), 0);

  guessMap = L.map('guess-map', {
    center: [20, 0], zoom: 2, minZoom: 2, attributionControl: false,
  });
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    { maxZoom: 19, subdomains: 'abcd' }
  ).addTo(guessMap);
  setTimeout(() => guessMap.invalidateSize(), 0);

  guessMap.on('click', e => {
    guess = e.latlng;
    if (gMarker) guessMap.removeLayer(gMarker);
    gMarker = L.marker(e.latlng, { icon: mkPinIcon('pin-guess') }).addTo(guessMap);
    document.getElementById('confirm-btn').classList.add('on');
  });
}

/* ════════════════════════════════════════════════
   HINT
════════════════════════════════════════════════ */
function showHint() {
  if (hintUsed) return;
  hintUsed = true;

  const tooltipOpts = { permanent: false, direction: 'top', className: 'hint-tooltip', opacity: 1 };

  MIXED_LOCS.forEach(loc => {
    const m = L.circleMarker([loc.lat, loc.lng], {
      radius: 5,
      fillColor: '#4a6a9a',
      fillOpacity: 0.75,
      color: 'rgba(255,255,255,0.18)',
      weight: 1.5,
      interactive: true,
    })
      .bindTooltip(loc.label, tooltipOpts)
      .addTo(guessMap);
    hintMarkers.push(m);
  });

  const hintBtn = document.getElementById('hint-btn');
  hintBtn.classList.add('used');
  hintBtn.textContent = 'Indices affichés';
}

/* ════════════════════════════════════════════════
   CONFIRM
════════════════════════════════════════════════ */
function confirmGuess() {
  if (!guess) return;

  const km  = Math.round(haversine(guess.lat, guess.lng, target.lat, target.lng));
  const pts = scoreFor(km, SCORE_MULT);
  totalScore += pts;
  results.push({ round, km, pts });

  showOverlay(km, pts);
}

function showOverlay(km, pts) {
  document.getElementById('ov-round').textContent = `Manche ${round}`;
  document.getElementById('ov-loc').textContent   = target.label;
  document.getElementById('ov-dist').textContent  = km.toLocaleString('fr');
  document.getElementById('ov-pts').textContent   = pts.toLocaleString('fr');
  document.getElementById('ov-total').textContent = totalScore.toLocaleString('fr');
  document.getElementById('btn-next').textContent =
    round < 5 ? 'MANCHE SUIVANTE' : 'VOIR LES RÉSULTATS';

  document.getElementById('round-overlay').classList.add('on');

  rrMap = kill(rrMap);
  setTimeout(() => {
    const wrap = document.getElementById('ov-map-wrap');
    wrap.innerHTML = '';
    const div = document.createElement('div');
    div.style.cssText = 'width:100%;height:100%;';
    wrap.appendChild(div);

    rrMap = L.map(div, {
      zoomControl: false, attributionControl: false,
      dragging: false, scrollWheelZoom: false,
    });
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    ).addTo(rrMap);

    L.marker([target.lat, target.lng], { icon: mkPinIcon('pin-target') }).addTo(rrMap);
    L.marker([guess.lat,  guess.lng],  { icon: mkPinIcon('pin-guess')  }).addTo(rrMap);

    L.polyline(
      [[target.lat, target.lng], [guess.lat, guess.lng]],
      { color: '#f0bb3a', weight: 2, dashArray: '7 6', opacity: 0.85 }
    ).addTo(rrMap);

    rrMap.fitBounds(
      L.latLngBounds([target.lat, target.lng], [guess.lat, guess.lng]),
      { padding: [36, 36], maxZoom: 8 }
    );
  }, 60);
}

/* ════════════════════════════════════════════════
   NEXT / END
════════════════════════════════════════════════ */
function nextRound() {
  document.getElementById('round-overlay').classList.remove('on');
  rrMap = kill(rrMap);
  if (round < 5) {
    beginRound();
  } else {
    showResult();
  }
}

function showResult() {
  satMap   = kill(satMap);
  guessMap = kill(guessMap);

  const avgKm = Math.round(results.reduce((s, r) => s + r.km, 0) / results.length);
  document.getElementById('final-score').textContent = totalScore.toLocaleString('fr');
  document.getElementById('final-avg').textContent   = avgKm.toLocaleString('fr');

  const list = document.getElementById('rounds-list');
  list.innerHTML = '';
  results.forEach(r => {
    const pct = (r.pts / 1000) * 100;
    const row = document.createElement('div');
    row.className = 'rr-row';
    row.innerHTML = `
      <div class="rr-n">${r.round}</div>
      <div class="rr-sc">${r.pts.toLocaleString('fr')} pts</div>
      <div class="rr-km">${r.km.toLocaleString('fr')} km</div>
      <div class="rr-bar-wrap"><div class="rr-bar" data-pct="${pct}"></div></div>
    `;
    list.appendChild(row);
  });

  document.getElementById('result').classList.add('on');

  setTimeout(() => {
    document.querySelectorAll('.rr-bar').forEach(b => {
      b.style.width = b.dataset.pct + '%';
    });
  }, 120);
}
