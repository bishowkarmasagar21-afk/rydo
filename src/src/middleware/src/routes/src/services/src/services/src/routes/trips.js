import { Router } from 'express';
import { q } from '../db.js';
import { auth, wrap } from '../middleware/auth.js';
import { CLASSES, fare } from '../services/fare.js';
import { getRoute } from '../services/routing.js';
import { nearbyDrivers, dispatch, accept, decline, dropOffer, releaseDriver,
         tripView, push, event, newPin } from '../services/dispatch.js';

const r = Router();
const ACTIVE = `('requested','accepted','arrived','in_progress')`;
const valid = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
  Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;

// Price + ETA for every ride class
r.post('/estimate', auth('rider'), wrap(async (req, res) => {
  const { pickup, dropoff } = req.body || {};
  if (!valid(pickup) || !valid(dropoff)) return res.status(400).json({ error: 'Invalid pickup or destination' });
  const route = await getRoute(pickup, dropoff);
  if (route.km < 0.2) return res.status(400).json({ error: 'Destination is too close to pickup' });
  if (route.km > 300) return res.status(400).json({ error: 'Destination is too far' });
  const classes = [];
  for (const [id, c] of Object.entries(CLASSES)) {
    const [n] = await nearbyDrivers(pickup.lat, pickup.lng, id, 1);
    classes.push({ id, label: c.label, seats: c.seats, fare: fare(id, route.km, route.min),
                   eta_min: n ? Math.max(1, Math.round((n.km * 1.3 / 25) * 60)) : null });
  }
  res.json({ route, classes });
}));

// Request a trip. Fare is always recomputed on the server.
r.post('/', auth('rider'), wrap(async (req, res) => {
  const { pickup, dropoff, pickup_addr, drop_addr, ride_class } = req.body || {};
  if (!valid(pickup) || !valid(dropoff) || !CLASSES[ride_class])
    return res.status(400).json({ error: 'Invalid request' });
  const { rowCount } = await q(`SELECT 1 FROM trips WHERE rider_id=$1 AND status IN ${ACTIVE}`, [req.user.id]);
  if (rowCount) return res.status(409).json({ error: 'You already have an active trip' });
  const rt = await getRoute(pickup, dropoff);
  const { rows: [t] } = await q(
    `INSERT INTO trips(rider_id,ride_class,pickup_lat,pickup_lng,pickup_addr,drop_lat,drop_lng,drop_addr,
                       distance_km,duration_min,fare_estimate,pin,route)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    [req.user.id, ride_class, pickup.lat, pickup.lng, String(pickup_addr || '').slice(0, 200),
     dropoff.lat, dropoff.lng, String(drop_addr || '').slice(0, 200),
     rt.km.toFixed(2), rt.min.toFixed(2), fare(ride_class, rt.km, rt.min), newPin(), JSON.stringify(rt.coords)]);
  await event(t.id, 'requested');
  await dispatch(t.id);
  res.json(await tripView(t.id, 'rider'));
}));

r.get('/active', auth(), wrap(async (req, res) => {
  const col = req.user.role === 'rider' ? 'rider_id' : 'driver_id';
  const { rows: [x] } = await q(
    `SELECT id FROM trips WHERE ${col}=$1 AND status IN ${ACTIVE} ORDER BY requested_at DESC LIMIT 1`, [req.user.id]);
  res.json({ trip: x ? await tripView(x.id, req.user.role) : null });
}));

r.get('/history', auth(), wrap(async (req, res) => {
  const col = req.user.role === 'rider' ? 'rider_id' : 'driver_id';
  const { rows } = await q(
    `SELECT id,status,ride_class,pickup_addr,drop_addr,distance_km,fare_final,tip,rating,requested_at
       FROM trips WHERE ${col}=$1 ORDER BY requested_at DESC LIMIT 50`, [req.user.id]);
  res.json({ trips: rows });
}));

// --- Driver: respond to an offer
r.post('/:id/accept', auth('driver'), wrap(async (req, res) => {
  const ok = await accept(req.params.id, req.user.id);
  if (!ok) return res.status(409).json({ error: 'This request is no longer available' });
  res.json({ ok: true });
}));
r.post('/:id/decline', auth('driver'), wrap(async (req, res) => {
  decline(req.params.id, req.user.id);
  res.json({ ok: true });
}));

// --- Driver: trip progress (each is a guarded state transition)
const step = (path, from, sets, evt, after) =>
  r.post(`/:id/${path}`, auth('driver'), wrap(async (req, res) => {
    const params = [req.params.id, req.user.id];
    let where = '';
    if (path === 'start') { params.push(String(req.body?.pin || '')); where = ' AND pin=$3'; }
    const { rowCount } = await q(
      `UPDATE trips SET ${sets} WHERE id=$1 AND driver_id=$2 AND status='${from}'${where}`, params);
    if (!rowCount) return res.status(409).json({ error: path === 'start' ? 'Wrong PIN, or trip not ready' : 'Trip is not in the right state' });
    await event(req.params.id, evt);
    if (after) await after(req);
    await push(req.params.id);
    res.json({ ok: true });
  }));

step('arrived', 'accepted', `status='arrived', arrived_at=now()`, 'arrived');
step('start', 'arrived', `status='in_progress', started_at=now()`, 'started');
step('complete', 'in_progress', `status='completed', completed_at=now(), fare_final=fare_estimate`, 'completed',
  async (req) => {
    await q(`INSERT INTO payments(trip_id,amount,status,provider)
             SELECT id, fare_final, 'pending', 'unconfigured' FROM trips WHERE id=$1`, [req.params.id]);
    await releaseDriver(req.user.id);
  });

// --- Rider: cancel and rate
r.post('/:id/cancel', auth('rider'), wrap(async (req, res) => {
  const { rows: [t] } = await q(
    `UPDATE trips SET status='cancelled', cancelled_at=now(), cancel_reason='rider'
      WHERE id=$1 AND rider_id=$2 AND status IN ('requested','accepted','arrived') RETURNING driver_id`,
    [req.params.id, req.user.id]);
  if (!t) return res.status(409).json({ error: 'This trip can no longer be cancelled' });
  dropOffer(req.params.id);
  if (t.driver_id) await releaseDriver(t.driver_id);
  await event(req.params.id, 'cancelled', { by: 'rider' });
  await push(req.params.id);
  res.json({ ok: true });
}));

r.post('/:id/rate', auth('rider'), wrap(async (req, res) => {
  const rating = Math.round(Number(req.body?.rating));
  const tip = Math.min(Math.max(Number(req.body?.tip) || 0, 0), 100);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Rating must be 1 to 5' });
  const { rows: [t] } = await q(
    `UPDATE trips SET rating=$3, tip=$4
      WHERE id=$1 AND rider_id=$2 AND status='completed' AND rating IS NULL RETURNING driver_id`,
    [req.params.id, req.user.id, rating, tip]);
  if (!t) return res.status(409).json({ error: 'Already rated or trip not complete' });
  await q(`UPDATE users SET rating=(SELECT round(avg(rating)::numeric,2) FROM trips
            WHERE driver_id=$1 AND rating IS NOT NULL) WHERE id=$1`, [t.driver_id]);
  res.json({ ok: true });
}));

export default r;
