/**
 * Mode « multi-années » : même lieu, imagerie satellite à différentes dates.
 * Tuiles : Esri World Imagery (live) + World Imagery Wayback (IDs = releases officielles,
 * voir https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json).
 * L’archive Wayback remonte à ~2014 (~11 ans avant les clichés les plus récents du jeu).
 */

export const TIMELINE_ERAS = [
  {
    key: 'live',
    label: 'Actuel',
    sub: 'live Esri',
    releaseNum: null,
    mult: 5,
  },
  {
    key: '2024',
    label: '2024',
    sub: 'juin',
    releaseNum: 39767,
    mult: 4,
  },
  {
    key: '2020',
    label: '2020',
    sub: 'déc.',
    releaseNum: 29260,
    mult: 3,
  },
  {
    key: '2018',
    label: '2018',
    sub: 'nov.',
    releaseNum: 239,
    mult: 2,
  },
  {
    key: '2014',
    label: '2014',
    sub: 'fév.',
    releaseNum: 10,
    mult: 1,
  },
];

/** Lieux à fort contraste 2014 → aujourd’hui (urbanisation, déforestation, reclamation, etc.) */
export const TIMELINE_LOCS = [
  { lat: 25.11, lng: 55.14, label: 'Dubai — Marina & gratte-ciels' },
  { lat: 22.54, lng: 114.06, label: 'Shenzhen — Pearl River Delta' },
  { lat: 31.24, lng: 121.50, label: 'Shanghai — Pudong' },
  { lat:  1.29, lng: 103.86, label: 'Singapour — baie & reclamation' },
  { lat: -2.45, lng: 111.85, label: 'Bornéo (Kalimantan) — front périurbanisation / forêt' },
  { lat: -10.75, lng: -62.35, label: 'Amazonie (Rondônia) — déforestation' },
  { lat: 36.12, lng: -115.17, label: 'Las Vegas — expansion urbaine' },
  { lat: 25.42, lng: 51.39, label: 'Doha / Lusail — littoral développé' },
  { lat: 21.42, lng: 39.10, label: 'Djeddah — côte mer Rouge' },
  { lat: 39.90, lng: 116.40, label: 'Pékin — tissu urbain dense' },
];
