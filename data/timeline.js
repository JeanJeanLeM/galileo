/**
 * Mode Chronologie : lieux avec imagerie Esri live + Wayback.
 * Chaque lieu peut définir `eras` (ordre des boutons). Défaut : Actuel → 2020 → 2014.
 * Agriculture intensive : 2014 → 2020 → actuel (expansion des périmètres irrigués, pivots, etc.).
 */

export const DEFAULT_TIMELINE_ERAS = [
  { key: 'live', label: 'Actuel', sub: "aujourd'hui", releaseNum: null },
  { key: '2020', label: '2020', sub: 'déc.', releaseNum: 29260 },
  { key: '2014', label: '2014', sub: 'fév.', releaseNum: 10 },
];

/** Agriculture : chronologie 2014 → 2020 → actuel (mêmes IDs Wayback que le reste du jeu). */
const AGRI_TIMELINE_ERAS = [
  { key: '2014', label: '2014', sub: 'fév.', releaseNum: 10 },
  { key: '2020', label: '2020', sub: 'déc.', releaseNum: 29260 },
  { key: 'live', label: 'Actuel', sub: "aujourd'hui", releaseNum: null },
];

/** Urbanisation — gratte-ciels, littoraux aménagés, etc. */
export const TIMELINE_URBAN = [
  { lat: 25.11, lng: 55.14, label: 'Dubai — Marina & gratte-ciels', theme: 'urban' },
  { lat: 22.54, lng: 114.06, label: 'Shenzhen — delta de la rivière des Perles', theme: 'urban' },
  { lat: 31.24, lng: 121.50, label: 'Shanghai — Pudong', theme: 'urban' },
  { lat:  1.29, lng: 103.86, label: 'Singapour — baie & reclamation', theme: 'urban' },
  { lat: 36.12, lng: -115.17, label: 'Las Vegas — expansion urbaine', theme: 'urban' },
  { lat: 25.42, lng: 51.39, label: 'Doha / Lusail — littoral développé', theme: 'urban' },
  { lat: 39.90, lng: 116.40, label: 'Pékin — tissu urbain dense', theme: 'urban' },
].map((loc) => ({ ...loc, eras: DEFAULT_TIMELINE_ERAS }));

/** Déforestation — contrastes forêt / agriculture */
export const TIMELINE_DEFORESTATION = [
  { lat: -10.75, lng: -62.35, label: 'Amazonie (Rondônia) — déforestation', theme: 'deforestation' },
].map((loc) => ({ ...loc, eras: DEFAULT_TIMELINE_ERAS }));

/**
 * Irrigation de grande ampleur : pivots circulaires, périmètres gravitaires, expansion 2014–aujourd’hui.
 * Centré sur zones visibles au zoom satellite du jeu (~13).
 */
export const TIMELINE_AGRICULTURE = [
  {
    lat: 30.95,
    lng: 30.48,
    label: 'Égypte — pivots circulaires, désert occidental (nouvelles terres)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: 29.32,
    lng: 30.78,
    label: 'Égypte — dépression de Faiyoum (irrigation intensive)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: 20.5,
    lng: 44.68,
    label: 'Arabie saoudite — Wadi ad-Dawasir (pivots dans le désert)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: 23.62,
    lng: 53.72,
    label: 'Émirats — Liwa / ouest d’Abou Dhabi (oasis & pivots)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: 32.15,
    lng: 35.58,
    label: 'Jordanie — vallée du Jourdain (maraîchage & parcelles irriguées)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: -12.98,
    lng: -55.42,
    label: 'Brésil — Mato Grosso (soja, pivots & grilles)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: -17.72,
    lng: -63.08,
    label: 'Bolivie — Santa Cruz (expansion agricole irriguée)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
  {
    lat: 16.47,
    lng: -15.52,
    label: 'Sénégal — vallée du fleuve Sénégal (Richard Toll, périmètres)',
    theme: 'agriculture',
    eras: AGRI_TIMELINE_ERAS,
  },
];

const POOLS = {
  all: () => [
    ...TIMELINE_URBAN,
    ...TIMELINE_DEFORESTATION,
    ...TIMELINE_AGRICULTURE,
  ],
  urban: () => [...TIMELINE_URBAN],
  deforestation: () => [...TIMELINE_DEFORESTATION],
  agriculture: () => [...TIMELINE_AGRICULTURE],
};

/**
 * @param {'all'|'urban'|'deforestation'|'agriculture'} theme — anciens thèmes → pool « tout »
 */
export function getTimelinePool(theme) {
  const t =
    theme === 'urban' ||
    theme === 'deforestation' ||
    theme === 'agriculture'
      ? theme
      : 'all';
  return POOLS[t]();
}

/** @deprecated utiliser getTimelinePool('all') */
export const TIMELINE_LOCS = POOLS.all();

export const TIMELINE_ERAS = DEFAULT_TIMELINE_ERAS;
