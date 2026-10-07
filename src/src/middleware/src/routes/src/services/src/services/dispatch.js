import crypto from 'crypto';
import { q } from '../db.js';
import { redis } from '../redis.js';

let io;
export const initDispatch = (i) => { io = i; };

const OFFER_MS = 15000, RADIUS_KM = 5;
const offers = new Map(); // tripId -> { c: candidates, i: index, timer }

export const newPin = () => String(crypto.randomInt(0, 10000)).padStart(4, '0');

export const event = (tripId, name, payload = {}) =>
  q('INSERT INTO trip_events(trip_id,event,payload) VALUES($1,$2,$3)', [tripId, name, payload]);

// Nearest live drivers using Redis GEOSEARCH. Drivers who stopped pinging are dropped.
export async function nearbyDrivers(lat, lng, cls, limit = 8) {
  const res = await redis.geosearch('drivers:geo', 'FROMLONLAT', lng, lat,
    'BYRADIUS', RADIUS_KM, 'km', 'ASC', 'COUNT', limit * 3, 'WITHDIST');
  const out = [];
  for (const [id, d] of res) {
    if (!(await redis.exists(`driver:${id}:alive`))) { await redis.zrem('drivers:geo', id); continue; }
    const c = await redis.get(`driver:${id}:class`);
    if (cls === 'economy' || c === cls) out.push({ id, km: Number(d) });
    if (out.length >= limit) break;
  }
  return out;
}

export async function tripView(id, role) {
  const { rows: [t] } = await q(
    `SELECT t.*, u.name AS driver_name, u.rating AS driver_rating, d.car_model, d.plate, r.name AS rider_name
       FROM trips t
       JOIN users r ON r.id = t.rider_id
       LEFT JOIN users u ON u.id = t.driver_id
       LEFT JOIN drivers d ON d.user_id = t.driver_id
      WHERE t.id = $1`, [id]);
  if (!t) return null;
  if (role === 'driver') delete t.pin; // drivers must get the PIN from the rider
  return t;
}

export async function push(id) {
  const t = await tripView(id, 'rider');
  if (!t) return;
  io.to(`user:${t.rider_id}`).emit('trip:update', t);
  if (t.driver_id) io.to(`user:${t.driver_id}`).emit('trip:update', await tripView(id, 'driver'));
}

export async function dispatch(tripId) {
  const { rows: [t] } = await q('SELECT * FROM trips WHERE id=$1', [tripId]);
  const c = await nearbyDrivers(t.pickup_lat, t.pickup_lng, t.ride_class);
  offers.set(tripId, { c, i: -1, timer: null });
  await next(tripId);
}

async function next(tripId) {
  const o = offers.get(tripId);
  if (!o) return;
  clearTimeout(o.timer);
  o.i++;
  if (o.i >= o.c.length) {
    offers.delete(tripId);
    await q(`UPDATE trips SET status='cancelled', cancelled_at=now(), cancel_reason='no_drivers'
              WHERE id=$1 AND status='requested'`, [tripId]);
    await event(tripId, 'no_drivers');
    return push(tripId);
  }
  const d = o.c[o.i];
  const t = await tripView(tripId, 'driver');
  if (!t || t.status !== 'requested') { offers.delete(tripId); return; }
  io.to(`user:${d.id}`).emit('trip:offer', { trip: t, pickup_km: d.km, expires_in: OFFER_MS / 1000 });
  o.timer = setTimeout(() => next(tripId), OFFER_MS);
}

export async function accept(tripId, driverId) {
  const o = offers.get(tripId);
  if (!o || o.c[o.i]?.id !== driverId) return false;
  clearTimeout(o.timer);
  offers.delete(tripId);
  const { rows: [t] } = await q(
    `UPDATE trips SET status='accepted', driver_id=$2, accepted_at=now()
      WHERE id=$1 AND status='requested' RETURNING id, rider_id`, [tripId, driverId]);
  if (!t) return false;
  await redis.zrem('drivers:geo', driverId); // no longer available for other trips
  await redis.set(`driver:${driverId}:trip`, `${t.id}|${t.rider_id}`);
  await q(`UPDATE drivers SET status='on_trip' WHERE user_id=$1`, [driverId]);
  await event(tripId, 'accepted', { driverId });
  await push(tripId);
  return true;
}

export const decline = (tripId, driverId) => {
  const o = offers.get(tripId);
  if (o && o.c[o.i]?.id === driverId) next(tripId);
};

export function dropOffer(tripId) {
  const o = offers.get(tripId);
  if (!o) return;
  clearTimeout(o.timer);
  const cur = o.c[o.i]?.id;
  offers.delete(tripId);
  if (cur) io.to(`user:${cur}`).emit('trip:offer_cancelled', { trip_id: tripId });
}

export async function releaseDriver(driverId) {
  await redis.del(`driver:${driverId}:trip`);
  await q(`UPDATE drivers SET status='online' WHERE user_id=$1`, [driverId]);
}
