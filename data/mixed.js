import { LOCS } from './world.js';
import { CAPITALS } from './capitals.js';
import { FRANCE_CITIES } from './france.js';
import { EUROPE_CITIES } from './europe.js';
import { getTimelinePool } from './timeline.js';

/** Pool unique : tous les lieux de tous les anciens modes. */
export const MIXED_LOCS = [
  ...LOCS,
  ...CAPITALS,
  ...FRANCE_CITIES,
  ...EUROPE_CITIES,
  ...getTimelinePool('all'),
];
