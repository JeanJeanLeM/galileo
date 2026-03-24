/**
 * Mode Chronologie : lieux avec imagerie Esri live + Wayback.
 * Chaque lieu peut définir `eras` (ordre des boutons). Défaut : Actuel → 2020 → 2014.
 * Feux : avant / pendant / après. Sécheresse : clichés 2018+ (IDs = waybackconfig Esri).
 */

export const DEFAULT_TIMELINE_ERAS = [
  { key: 'live', label: 'Actuel', sub: "aujourd'hui", releaseNum: null },
  { key: '2020', label: '2020', sub: 'déc.', releaseNum: 29260 },
  { key: '2014', label: '2014', sub: 'fév.', releaseNum: 10 },
];

const E = {
  avant:   { key: '2014', label: 'Avant', sub: '2014', releaseNum: 10 },
  pendant: { key: '2020', label: 'Pendant', sub: '2020', releaseNum: 29260 },
  apres:   { key: 'live', label: 'Après', sub: 'actuel', releaseNum: null },
};

/** Europe de l’Ouest / bassin méditerranéen : canicule & sécheresse 2022 → pluies & verdissement mi-2024 → actuel */
const DROUGHT_EU_ERAS = [
  { key: 'dry22', label: 'Sécheresse', sub: 'août 2022', releaseNum: 45441 },
  { key: 'wet24', label: 'Pluies', sub: 'juin 2024', releaseNum: 39767 },
  { key: 'live', label: 'Actuel', sub: "aujourd'hui", releaseNum: null },
];

/** Maroc : sécheresse marquée 2023 → même cliché « humide » proxy juin 2024 → actuel (hivers pluvieux / reverdissement) */
const DROUGHT_MA_ERAS = [
  { key: 'dry23', label: 'Sécheresse', sub: 'août 2023', releaseNum: 64776 },
  { key: 'wet24', label: 'Pluies', sub: 'juin 2024', releaseNum: 39767 },
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
  { lat: 21.42, lng: 39.10, label: 'Djeddah — côte mer Rouge', theme: 'urban' },
  { lat: 39.90, lng: 116.40, label: 'Pékin — tissu urbain dense', theme: 'urban' },
].map((loc) => ({ ...loc, eras: DEFAULT_TIMELINE_ERAS }));

/** Déforestation — contrastes forêt / agriculture */
export const TIMELINE_DEFORESTATION = [
  { lat: -2.45, lng: 111.85, label: 'Bornéo (Kalimantan) — front forêt / défrichement', theme: 'deforestation' },
  { lat: -10.75, lng: -62.35, label: 'Amazonie (Rondônia) — déforestation', theme: 'deforestation' },
].map((loc) => ({ ...loc, eras: DEFAULT_TIMELINE_ERAS }));

/**
 * Feux de forêt — coordonnées fournies / périmètre (Canada : centre du bbox officiel).
 * AU & RU : Avant (2014) → Pendant (2020, proxy saisons extrêmes) → Après (actuel).
 * Canada 2023 : pas de cliché Wayback « pendant » fiable → Avant / Après seulement.
 */
export const TIMELINE_WILDFIRE = [
  {
    lat: -33.716129,
    lng: 143.175201,
    label: 'Australie — feu Dunns Road (Black Summer 2019-20), près de la foudre initiale',
    theme: 'wildfire',
    eras: [E.avant, E.pendant, E.apres],
  },
  {
    lat: 55.85,
    lng: -123.675,
    label: 'Canada (C.-B.) — Big Creek 2023 (zone entre ~55,19°N 123,17°O et 56,51°N 124,18°O)',
    theme: 'wildfire',
    eras: [E.avant, E.apres],
  },
  {
    lat: 72.0,
    lng: 179.9,
    label: 'Russie — Sakha, incendies 2021 (hotspot satellite)',
    theme: 'wildfire',
    eras: [E.avant, E.pendant, E.apres],
  },
];

/**
 * Sécheresse puis retour pluvieux (Wayback ≥ 2018 ; pas de clichés avant 2014 ici).
 * FR / IT / PT : pic de sécheresse estival 2022 vs juin 2024. MA : août 2023 vs juin 2024.
 */
export const TIMELINE_DROUGHT = [
  {
    lat: 34.12,
    lng: -6.42,
    label: 'Maroc — plaine du Gharb (céréales), sécheresse puis pluies & reverdissement',
    theme: 'drought',
    eras: DROUGHT_MA_ERAS,
  },
  {
    lat: 46.42,
    lng: -0.78,
    label: 'France — ouest (Niort / Marais poitevin), sécheresse 2022 puis années plus humides',
    theme: 'drought',
    eras: DROUGHT_EU_ERAS,
  },
  {
    lat: 44.527,
    lng: 6.326,
    label: 'France — lac de Serre-Ponçon (niveau d’eau visible selon les années)',
    theme: 'drought',
    eras: DROUGHT_EU_ERAS,
  },
  {
    lat: 45.13,
    lng: 9.73,
    label: 'Italie — plaine du Pô (stress hydrique estival 2022 vs 2024)',
    theme: 'drought',
    eras: DROUGHT_EU_ERAS,
  },
  {
    lat: 38.05,
    lng: -7.88,
    label: 'Portugal — Alentejo (sécheresse 2022 puis contraste plus tardif)',
    theme: 'drought',
    eras: DROUGHT_EU_ERAS,
  },
];

const POOLS = {
  all: () => [
    ...TIMELINE_URBAN,
    ...TIMELINE_DEFORESTATION,
    ...TIMELINE_WILDFIRE,
    ...TIMELINE_DROUGHT,
  ],
  urban: () => [...TIMELINE_URBAN],
  deforestation: () => [...TIMELINE_DEFORESTATION],
  wildfire: () => [...TIMELINE_WILDFIRE],
  drought: () => [...TIMELINE_DROUGHT],
};

/**
 * @param {'all'|'urban'|'deforestation'|'wildfire'|'drought'} theme
 */
export function getTimelinePool(theme) {
  const t =
    theme === 'urban' ||
    theme === 'deforestation' ||
    theme === 'wildfire' ||
    theme === 'drought'
      ? theme
      : 'all';
  return POOLS[t]();
}

/** @deprecated utiliser getTimelinePool('all') */
export const TIMELINE_LOCS = POOLS.all();

export const TIMELINE_ERAS = DEFAULT_TIMELINE_ERAS;
