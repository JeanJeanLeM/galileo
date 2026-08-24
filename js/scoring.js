/**
 * Great-circle distance between two lat/lng points (Haversine formula).
 * Returns distance in kilometres.
 */
export function haversine(la1, lo1, la2, lo2) {
  const R = 6371;
  const r = Math.PI / 180;
  const dLa = (la2 - la1) * r;
  const dLo = (lo2 - lo1) * r;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Points earned for a given distance.
 * Formula: 1 000 × e^(−km / 2 000)
 * Max: 1 000 pts (km = 0)
 */
export function scoreFor(km, mult = 1) {
  return Math.round(1000 * mult * Math.exp(-km / 2000));
}
