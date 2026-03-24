import { haversine, scoreFor } from './scoring.js';
import { LOCS }          from '../data/world.js';
import { CAPITALS }      from '../data/capitals.js';
import { FRANCE_CITIES } from '../data/france.js';
import { EUROPE_CITIES } from '../data/europe.js';
import { DEFAULT_TIMELINE_ERAS, getTimelinePool } from '../data/timeline.js';
import { scheduleTimelineTilePreload } from './timelinePreload.js';

const ESRI_WORLD_LIVE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function waybackTileUrl(releaseNum) {
  return `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${releaseNum}/{z}/{y}/{x}`;
}

/* ════════════════════════════════════════════════
   ZOOM STEPS
════════════════════════════════════════════════ */
const ZOOM_STEPS = [
  { z: 13, km: '10',  mult: 5, label: 'Extrême'     },
  { z: 11, km: '50',  mult: 4, label: 'Difficile'   },
  { z: 10, km: '100', mult: 3, label: 'Normal'      },
  { z:  9, km: '200', mult: 2, label: 'Facile'      },
  { z:  8, km: '500', mult: 1, label: 'Très facile' },
];

function multForZoom(z) {
  return ZOOM_STEPS.find(s => s.z === z).mult;
}

/* ════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════ */
let gameMode = 'world';
/** Thème chronologie : all | urban | deforestation | glacier | us_bases_me */
let timelineTheme = 'all';

let round      = 0;
let totalScore = 0;
let results    = [];
let usedIdx    = [];
let target     = null;
let guess      = null;
let gMarker    = null;

// per-round zoom/mult
let roundZoom = 13;
let roundMult = 5;

// capitals mode
let capitalMarkers    = [];
let selectedCapMarker = null;
let guessCapLabel     = null;

// hint system
let hintUsed    = false;
let hintMarkers = [];

// Leaflet instances
let satMap   = null;
let guessMap = null;
let rrMap    = null;
let satBaseLayer     = null;
let timelineEraIndex = 0;
/** Époques affichées pour la manche en cours (varie selon le lieu) */
let activeTimelineEras = DEFAULT_TIMELINE_ERAS;

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  gameMode = params.get('mode') || 'world';
  timelineTheme = params.get('theme') || 'all';

  document.getElementById('confirm-btn').addEventListener('click', confirmGuess);
  document.getElementById('hint-btn').addEventListener('click', showHint);
  document.getElementById('btn-next').addEventListener('click', nextRound);
  document.getElementById('btn-replay').addEventListener('click', () => {
    // Reset and restart same mode
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
  const pool =
    gameMode === 'capitals' ? CAPITALS      :
    gameMode === 'france'   ? FRANCE_CITIES :
    gameMode === 'europe'   ? EUROPE_CITIES :
    gameMode === 'timeline' ? getTimelinePool(timelineTheme) :
    LOCS;
  if (usedIdx.length >= pool.length) usedIdx = [];
  let i;
  do { i = Math.floor(Math.random() * pool.length); } while (usedIdx.includes(i));
  usedIdx.push(i);
  return pool[i];
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
  target    = pickLoc();
  roundZoom = 13;
  roundMult = multForZoom(13);

  if (gameMode === 'timeline') {
    activeTimelineEras = target.eras || DEFAULT_TIMELINE_ERAS;
    timelineEraIndex =
      target.theme === 'glacier' || target.theme === 'us_bases_me'
        ? activeTimelineEras.length - 1
        : 0;
  } else {
    activeTimelineEras = DEFAULT_TIMELINE_ERAS;
    timelineEraIndex = 0;
  }

  // Header
  document.getElementById('round-lbl').textContent  = `Manche ${round} / 5`;
  document.getElementById('score-val').textContent  = totalScore.toLocaleString('fr');
  document.getElementById('mult-tag').textContent   = `×${roundMult}`;
  document.getElementById('mult-tag').classList.remove('drop');
  document.getElementById('guess-badge').textContent =
    gameMode === 'capitals' ? 'Identifiez la capitale' :
    (gameMode === 'france' || gameMode === 'europe') ? 'Trouvez la ville' :
    gameMode === 'timeline' ? 'Même lieu à toutes les dates — placez votre pin' :
    'Placez votre pin';
  document.getElementById('sat-badge').textContent =
    gameMode === 'timeline'
      ? 'Chronologie : époque puis zoom — le × vient du zoom seulement'
      : 'Vue satellite';
  document.getElementById('confirm-btn').classList.remove('on');

  // Round dots
  const dotsEl = document.getElementById('round-dots');
  dotsEl.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const d = document.createElement('div');
    d.className = 'rd' + (i < round ? ' done' : i === round ? ' current' : '');
    dotsEl.appendChild(d);
  }

  // Reset capitals state
  capitalMarkers = []; selectedCapMarker = null; guessCapLabel = null;

  // Reset hint state
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

  // Destroy old maps
  satMap   = kill(satMap);
  guessMap = kill(guessMap);
  satBaseLayer = null;

  // Satellite view (locked)
  satMap = L.map('sat-map', {
    center: [target.lat, target.lng],
    zoom: roundZoom,
    zoomControl: false, attributionControl: false,
    dragging: false, touchZoom: false, doubleClickZoom: false,
    scrollWheelZoom: false, boxZoom: false, keyboard: false,
  });
  const eraStart =
    gameMode === 'timeline' ? activeTimelineEras[timelineEraIndex] : null;
  satBaseLayer =
    gameMode === 'timeline'
      ? (eraStart.releaseNum == null
          ? L.tileLayer(ESRI_WORLD_LIVE, { maxZoom: 19 })
          : L.tileLayer(waybackTileUrl(eraStart.releaseNum), { maxZoom: 19 }))
      : L.tileLayer(ESRI_WORLD_LIVE, { maxZoom: 19 });
  satBaseLayer.addTo(satMap);
  setTimeout(() => satMap.invalidateSize(), 0);

  if (gameMode === 'timeline') {
    scheduleTimelineTilePreload(target, usedIdx, timelineTheme);
  }

  // Guess map
  const guessCenter =
    gameMode === 'france'   ? [46.5,  2.5] :
    gameMode === 'europe'   ? [50.0, 10.0] :
    gameMode === 'timeline' ? [20, 0] :
    [20, 0];
  const guessZoom =
    gameMode === 'france'   ? 5 :
    gameMode === 'europe'   ? 4 :
    gameMode === 'timeline' ? 2 :
    2;

  guessMap = L.map('guess-map', {
    center: guessCenter, zoom: guessZoom, minZoom: 2, attributionControl: false,
  });
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    { maxZoom: 19, subdomains: 'abcd' }
  ).addTo(guessMap);
  setTimeout(() => guessMap.invalidateSize(), 0);

  if (gameMode === 'capitals') {
    buildCapitalMarkers();
  } else {
    guessMap.on('click', e => {
      guess = e.latlng;
      if (gMarker) guessMap.removeLayer(gMarker);
      gMarker = L.marker(e.latlng, { icon: mkPinIcon('pin-guess') }).addTo(guessMap);
      document.getElementById('confirm-btn').classList.add('on');
    });
  }

  const eraSw = document.getElementById('era-sw');
  if (gameMode === 'timeline') {
    eraSw.hidden = false;
    buildEraSw();
  } else {
    eraSw.hidden = true;
    eraSw.innerHTML = '';
  }
  buildZoomSw();
}

/* ════════════════════════════════════════════════
   ZOOM SWITCHER
════════════════════════════════════════════════ */
function buildEraSw() {
  const sw = document.getElementById('era-sw');
  sw.innerHTML = '';
  activeTimelineEras.forEach((era, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'esw';
    btn.dataset.idx = String(idx);
    btn.innerHTML = `<span class="esw-lbl">${era.label}</span><span class="esw-sub">${era.sub}</span>`;
    btn.addEventListener('click', () => switchEra(idx));
    sw.appendChild(btn);
  });
  refreshEraSw();
}

function refreshEraSw() {
  document.querySelectorAll('.esw').forEach(btn => {
    const idx = +btn.dataset.idx;
    btn.classList.toggle('active', idx === timelineEraIndex);
  });
}

function switchEra(idx) {
  if (gameMode !== 'timeline' || !satMap) return;
  if (idx < 0 || idx >= activeTimelineEras.length) return;
  const era = activeTimelineEras[idx];
  timelineEraIndex = idx;

  satMap.removeLayer(satBaseLayer);
  satBaseLayer =
    era.releaseNum == null
      ? L.tileLayer(ESRI_WORLD_LIVE, { maxZoom: 19 })
      : L.tileLayer(waybackTileUrl(era.releaseNum), { maxZoom: 19 });
  satBaseLayer.addTo(satMap);

  refreshEraSw();
}

function buildZoomSw() {
  const sw = document.getElementById('zoom-sw');
  sw.innerHTML = '';
  ZOOM_STEPS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'zsw';
    btn.dataset.z = s.z;
    btn.innerHTML = `<span class="zsw-mult">×${s.mult}</span><span class="zsw-km">~${s.km}km</span>`;
    btn.addEventListener('click', () => switchZoom(s.z));
    sw.appendChild(btn);
  });
  refreshZoomSw();
}

function refreshZoomSw() {
  document.querySelectorAll('.zsw').forEach(btn => {
    const z = +btn.dataset.z;
    const m = multForZoom(z);
    btn.classList.toggle('active',  z === roundZoom);
    btn.classList.toggle('costly', m < roundMult);
  });
}

function switchZoom(z) {
  const newMult   = multForZoom(z);
  const decreased = newMult < roundMult;
  roundZoom = z;
  satMap.setZoom(z);

  if (decreased) {
    roundMult = newMult;
    const tag = document.getElementById('mult-tag');
    tag.textContent = `×${roundMult}`;
    tag.classList.remove('drop');
    void tag.offsetWidth;
    tag.classList.add('drop');
  }

  refreshZoomSw();
}

/* ════════════════════════════════════════════════
   CAPITALS MAP
════════════════════════════════════════════════ */
function buildCapitalMarkers() {
  const STYLE_NORMAL   = { radius: 4, fillColor: '#4a5a7a', fillOpacity: 0.9, color: '#07090f', weight: 1 };
  const STYLE_HOVER    = { radius: 6, fillColor: '#7a8db0', fillOpacity: 1,   color: '#fff',    weight: 1 };
  const STYLE_SELECTED = { radius: 8, fillColor: '#f0bb3a', fillOpacity: 1,   color: '#fff',    weight: 2 };

  CAPITALS.forEach(cap => {
    const m = L.circleMarker([cap.lat, cap.lng], { ...STYLE_NORMAL, interactive: true })
      .addTo(guessMap);
    m._capData = cap;

    m.on('mouseover', () => { if (m !== selectedCapMarker) m.setStyle(STYLE_HOVER); });
    m.on('mouseout',  () => { if (m !== selectedCapMarker) m.setStyle(STYLE_NORMAL); });
    m.on('click', e => {
      L.DomEvent.stopPropagation(e);
      if (selectedCapMarker && selectedCapMarker !== m) {
        selectedCapMarker.setStyle(STYLE_NORMAL);
      }
      selectedCapMarker = m;
      m.setStyle(STYLE_SELECTED);
      guess         = m.getLatLng();
      guessCapLabel = cap.label;
      document.getElementById('confirm-btn').classList.add('on');
    });

    capitalMarkers.push(m);
  });
}

/* ════════════════════════════════════════════════
   HINT
════════════════════════════════════════════════ */
function showHint() {
  if (hintUsed) return;
  hintUsed = true;

  const pool =
    gameMode === 'capitals' ? CAPITALS      :
    gameMode === 'france'   ? FRANCE_CITIES :
    gameMode === 'europe'   ? EUROPE_CITIES :
    gameMode === 'timeline' ? getTimelinePool(timelineTheme) :
    LOCS;

  const tooltipOpts = { permanent: false, direction: 'top', className: 'hint-tooltip', opacity: 1 };

  if (gameMode === 'capitals') {
    // Capital circles are already on the map — just bind name tooltips to each
    capitalMarkers.forEach(m => {
      m.bindTooltip(m._capData.label, tooltipOpts);
    });
  } else {
    // Show all pool locations as faint dots with name on hover
    pool.forEach(loc => {
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
  }

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
  const pts = scoreFor(km, roundMult);
  totalScore += pts;
  results.push({ round, km, pts, mult: roundMult });

  showOverlay(km, pts);
}

function showOverlay(km, pts) {
  document.getElementById('ov-round').textContent = `Manche ${round}`;
  document.getElementById('ov-loc').textContent   =
    gameMode === 'capitals' ? `${target.label}  ←  ${guessCapLabel}` : target.label;
  document.getElementById('ov-dist').textContent  = km.toLocaleString('fr');
  document.getElementById('ov-mult').textContent  = `×${roundMult}`;
  document.getElementById('ov-pts').textContent   = pts.toLocaleString('fr');
  document.getElementById('ov-total').textContent = totalScore.toLocaleString('fr');
  document.getElementById('btn-next').textContent =
    round < 5 ? 'MANCHE SUIVANTE' : 'VOIR LES RÉSULTATS';

  document.getElementById('round-overlay').classList.add('on');

  // Mini result map
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
  document.getElementById('res-mode-tag').textContent =
    gameMode === 'capitals' ? 'Mode Capitales'       :
    gameMode === 'france'   ? 'Mode Villes de France':
    gameMode === 'europe'   ? "Mode Villes d'Europe" :
    gameMode === 'timeline'
      ? (timelineTheme === 'urban'
          ? 'Chronologie — urbanisation'
          : timelineTheme === 'deforestation'
            ? 'Chronologie — déforestation'
            : timelineTheme === 'glacier'
              ? 'Chronologie — glaciers & neige'
              : timelineTheme === 'us_bases_me'
                ? 'Chronologie — bases US (MO)'
                : 'Chronologie — tous thèmes')
      : 'Mode Monde libre';

  const list = document.getElementById('rounds-list');
  list.innerHTML = '';
  results.forEach(r => {
    const pct        = (r.pts / 5000) * 100;
    const multColor  =
      r.mult === 5 ? 'var(--accent)'   :
      r.mult === 4 ? 'var(--accent-d)' :
      r.mult === 3 ? 'var(--text)'     :
      r.mult === 2 ? 'var(--text2)'    :
                     'var(--text3)';
    const row = document.createElement('div');
    row.className = 'rr-row';
    row.innerHTML = `
      <div class="rr-n">${r.round}</div>
      <div class="rr-sc">${r.pts.toLocaleString('fr')} pts</div>
      <div class="rr-km">${r.km.toLocaleString('fr')} km</div>
      <div class="rr-mult" style="color:${multColor}">×${r.mult}</div>
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
