/**
 * Mode Chronologie : lieux avec imagerie Esri live + Wayback.
 * Chaque lieu peut définir `eras` (ordre des boutons). Défaut : Actuel → 2020 → 2014.
 * Glaciers / Alpes : été 2014 → été 2020 → actuel (fonte comparable, pas mélange été/hiver).
 * Bases US (MO) : 2020 (Wayback) vs actuel — comparer activité sur les aires de trafic (selon qualité des tuiles).
 */

export const DEFAULT_TIMELINE_ERAS = [
  { key: 'live', label: 'Actuel', sub: "aujourd'hui", releaseNum: null },
  { key: '2020', label: '2020', sub: 'déc.', releaseNum: 29260 },
  { key: '2014', label: '2014', sub: 'fév.', releaseNum: 10 },
];

/**
 * Glaciers : uniquement des clichés **estivaux** (même saison → contraste = fonte / glacier, pas neige hivernale).
 * 5232 = Wayback 2014-07-30 · 6049 = Wayback 2020-08-12 (waybackconfig Esri).
 */
const GLACIER_ALPS_ERAS = [
  { key: 'y2014', label: '2014', sub: 'été (juil.)', releaseNum: 5232 },
  { key: 'y2020', label: '2020', sub: 'été (août)', releaseNum: 6049 },
  { key: 'live', label: 'Actuel', sub: "aujourd'hui", releaseNum: null },
];

/** Bases US au Moyen-Orient : décembre 2020 (même release que urbanisation) puis imagerie actuelle. */
const US_BASE_ME_ERAS = [
  { key: '2020', label: '2020', sub: 'déc. (Wayback)', releaseNum: 29260 },
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
 * Glaciers & haute montagne alpine : contraste saisonnier sur imagerie (neige / roche exposée).
 */
export const TIMELINE_GLACIER = [
  {
    lat: 45.933,
    lng: 6.919,
    label: 'France — Mer de Glace (massif du Mont-Blanc)',
    theme: 'glacier',
    eras: GLACIER_ALPS_ERAS,
  },
  {
    lat: 46.443,
    lng: 8.07,
    label: 'Suisse — glacier d’Aletsch (Alpes bernoises)',
    theme: 'glacier',
    eras: GLACIER_ALPS_ERAS,
  },
  {
    lat: 46.573,
    lng: 8.391,
    label: 'Suisse — glacier du Rhône (Furkapass)',
    theme: 'glacier',
    eras: GLACIER_ALPS_ERAS,
  },
  {
    lat: 46.409,
    lng: 9.931,
    label: 'Suisse — glacier de Morteratsch (Engadine)',
    theme: 'glacier',
    eras: GLACIER_ALPS_ERAS,
  },
  {
    lat: 47.08,
    lng: 12.73,
    label: 'Autriche — glacier de la Pasterze (Glockner)',
    theme: 'glacier',
    eras: GLACIER_ALPS_ERAS,
  },
];

/**
 * Installations aériennes US (zone MO / périphérie) : pistes et aires de stationnement vues du ciel.
 * Coordonnées centrées sur le complexe piste / trafic (zoom jeu ~13).
 */
export const TIMELINE_US_BASES_ME = [
  {
    lat: 25.1217,
    lng: 51.3139,
    label: 'Qatar — Al-Udeid (pistes & aires de trafic)',
    theme: 'us_bases_me',
    eras: US_BASE_ME_ERAS,
  },
  {
    lat: 24.2483,
    lng: 54.5478,
    label: 'Émirats — Al-Dhafra (zone aviation militaire)',
    theme: 'us_bases_me',
    eras: US_BASE_ME_ERAS,
  },
  {
    lat: 24.062,
    lng: 45.621,
    label: 'Arabie saoudite — Prince Sultan (Al-Kharj)',
    theme: 'us_bases_me',
    eras: US_BASE_ME_ERAS,
  },
  {
    lat: 29.3467,
    lng: 47.5208,
    label: 'Koweït — Ali Al Salem (zone piste)',
    theme: 'us_bases_me',
    eras: US_BASE_ME_ERAS,
  },
  {
    lat: 37.002,
    lng: 35.426,
    label: 'Turquie — Incirlik (Adana), hub OTAN / US',
    theme: 'us_bases_me',
    eras: US_BASE_ME_ERAS,
  },
];

const POOLS = {
  all: () => [
    ...TIMELINE_URBAN,
    ...TIMELINE_DEFORESTATION,
    ...TIMELINE_GLACIER,
    ...TIMELINE_US_BASES_ME,
  ],
  urban: () => [...TIMELINE_URBAN],
  deforestation: () => [...TIMELINE_DEFORESTATION],
  glacier: () => [...TIMELINE_GLACIER],
  us_bases_me: () => [...TIMELINE_US_BASES_ME],
};

/**
 * @param {'all'|'urban'|'deforestation'|'glacier'|'us_bases_me'} theme — anciens thèmes (feux, sécheresse, barrages) → pool « tout »
 */
export function getTimelinePool(theme) {
  const t =
    theme === 'urban' ||
    theme === 'deforestation' ||
    theme === 'glacier' ||
    theme === 'us_bases_me'
      ? theme
      : 'all';
  return POOLS[t]();
}

/** @deprecated utiliser getTimelinePool('all') */
export const TIMELINE_LOCS = POOLS.all();

export const TIMELINE_ERAS = DEFAULT_TIMELINE_ERAS;
