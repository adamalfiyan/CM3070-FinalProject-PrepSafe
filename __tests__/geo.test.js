import { distanceMeters, isInsideZone } from '../src/utils/geo';

describe('distanceMeters', () => {
  it('returns 0 for identical coordinates', () => {
    expect(distanceMeters(1.35, 103.8, 1.35, 103.8)).toBe(0);
  });

  it('returns a plausible distance for two nearby points', () => {
    // Roughly 1.35,103.80 to 1.36,103.80 is about 1.1km apart.
    const d = distanceMeters(1.35, 103.8, 1.36, 103.8);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(1300);
  });
});

describe('isInsideZone', () => {
  const zone = { lat: 1.35, lng: 103.8, radiusMeters: 500 };

  it('returns true when the point is at the zone centre', () => {
    expect(isInsideZone({ latitude: 1.35, longitude: 103.8 }, zone)).toBe(true);
  });

  it('returns false when the point is far outside the radius', () => {
    expect(isInsideZone({ latitude: 1.5, longitude: 104.0 }, zone)).toBe(false);
  });

  it('returns true exactly at the radius boundary', () => {
    // ~0.0045 degrees latitude is close to 500m
    const point = { latitude: 1.35 + 0.0045, longitude: 103.8 };
    const d = distanceMeters(point.latitude, point.longitude, zone.lat, zone.lng);
    const looseZone = { ...zone, radiusMeters: d };
    expect(isInsideZone(point, looseZone)).toBe(true);
  });
});
