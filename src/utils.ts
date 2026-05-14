/**
 * Calculates the distance in meters between two GPS coordinates using the Haversine formula.
 * Haversine accounts for the Earth's curvature — simple subtraction of lat/lon values
 * would give incorrect results because degrees don't map to equal distances at all latitudes.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Core fraud detection function.
 * Returns true if the punch location is further than radiusMeters from the site center.
 * This catches buddy punching (clocking in for someone else from a different location)
 * and GPS spoofing (faking coordinates to appear on-site).
 */
export function isSuspiciousPunch(
  punchLat: number,
  punchLon: number,
  siteLat: number,
  siteLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(punchLat, punchLon, siteLat, siteLon);
  return distance > radiusMeters;
}
