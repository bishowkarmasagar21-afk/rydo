import { cfg } from '../config.js';

export const haversine = (a, b) => {
  const t = (x) => (x * Math.PI) / 180;
  const h = Math.sin(t(b.lat - a.lat) / 2) ** 2 +
    Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

// Real road route from OSRM; falls back to a straight-line estimate if unreachable.
export async function getRoute(a, b) {
  try {
    const url = `${cfg.osrm}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const j = await res.json();
    if (j.code === 'Ok') {
      const rt = j.routes[0];
      return { km: rt.distance / 1000, min: rt.duration / 60,
               coords: rt.geometry.coordinates.map(([lng, lat]) => [lat, lng]) };
    }
  } catch { console.warn('OSRM unavailable, using straight-line estimate'); }
  const km = haversine(a, b) * 1.3;
  return { km, min: (km / 30) * 60, coords: [[a.lat, a.lng], [b.lat, b.lng]] };
}
