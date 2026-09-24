// Pure geofencing helpers: haversine distance and circular-zone containment check.

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// distanceMeters: great-circle distance between two coordinates via the haversine formula.
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

// isInsideZone: true if point falls within the zone's radius.
export function isInsideZone(point, zone) {
  return distanceMeters(point.latitude, point.longitude, zone.lat, zone.lng) <= zone.radiusMeters;
}
