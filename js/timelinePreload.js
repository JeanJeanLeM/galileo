import { TIMELINE_ERAS, TIMELINE_LOCS } from '../data/timeline.js';

const Z_LEVELS = [13, 11, 10, 9, 8];

/** Annule les préchargements encore en file (nouvelle manche / autre lieu). */
let preloadGeneration = 0;

function latLngToTileXY(lat, lng, zoom) {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function tileUrlLive(z, y, x) {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
}

function tileUrlWayback(releaseNum, z, y, x) {
  return `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${releaseNum}/${z}/${y}/${x}`;
}

function collectUrls(lat, lng) {
  const urls = [];
  const ring = 1;

  for (const era of TIMELINE_ERAS) {
    for (const z of Z_LEVELS) {
      const { x: cx, y: cy } = latLngToTileXY(lat, lng, z);
      const n = 2 ** z;
      for (let dx = -ring; dx <= ring; dx++) {
        for (let dy = -ring; dy <= ring; dy++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= n || y >= n) continue;
          urls.push(
            era.releaseNum == null
              ? tileUrlLive(z, y, x)
              : tileUrlWayback(era.releaseNum, z, y, x)
          );
        }
      }
    }
  }
  return urls;
}

/**
 * Précharge en arrière-plan les tuiles pour la manche en cours (3 époques × 5 zooms × grille 3×3),
 * dans l’ordre : Actuel → 2020 → 2014.
 * Ensuite, les autres lieux du pool pas encore tirés cette partie (mêmes tuiles), pour lisser les manches suivantes.
 * Annulé automatiquement si une nouvelle manche démarre (preloadGeneration).
 */
export function scheduleTimelineTilePreload(lat, lng, usedIndices) {
  const gen = ++preloadGeneration;

  let urls = collectUrls(lat, lng);
  TIMELINE_LOCS.forEach((loc, idx) => {
    if (usedIndices.includes(idx)) return;
    urls = urls.concat(collectUrls(loc.lat, loc.lng));
  });

  let i = 0;
  const batch = 6;

  const runBatch = () => {
    if (gen !== preloadGeneration) return;
    const end = Math.min(i + batch, urls.length);
    for (; i < end; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = urls[i];
    }
    if (i < urls.length) {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => runBatch(), { timeout: 1200 });
      } else {
        setTimeout(runBatch, 0);
      }
    }
  };

  setTimeout(runBatch, 0);
}
