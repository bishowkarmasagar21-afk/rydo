import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';
import { q } from '../db.js';
import { redis } from '../redis.js';

const okLoc = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
  Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;

export function initSockets(io) {
  io.use((s, next) => {
    try { s.user = jwt.verify(s.handshake.auth?.token || '', cfg.jwt); next(); }
    catch { next(new Error('unauthorized')); }
  });

  io.on('connection', (s) => {
    const { id, role } = s.user;
    s.join(`user:${id}`);
    if (role !== 'driver') return;

    s.on('driver:online', async () => {
      const { rows: [d] } = await q('SELECT car_class FROM drivers WHERE user_id=$1', [id]);
      if (!d) return;
      await redis.set(`driver:${id}:online`, 1, 'EX', 86400);
      await redis.set(`driver:${id}:class`, d.car_class, 'EX', 86400);
      if (!(await redis.get(`driver:${id}:trip`)))
        await q(`UPDATE drivers SET status='online' WHERE user_id=$1`, [id]);
    });

    s.on('driver:offline', async () => {
      if (await redis.get(`driver:${id}:trip`)) return; // can't go offline mid-trip
      await redis.del(`driver:${id}:online`, `driver:${id}:alive`);
      await redis.zrem('drivers:geo', id);
      await q(`UPDATE drivers SET status='offline' WHERE user_id=$1`, [id]);
    });

    s.on('driver:location', async (p) => {
      if (!okLoc(p) || !(await redis.get(`driver:${id}:online`))) return;
      const active = await redis.get(`driver:${id}:trip`);
      if (active) { // on a trip: stream position to the rider only
        const [tripId, riderId] = active.split('|');
        io.to(`user:${riderId}`).emit('trip:driver_location',
          { trip_id: tripId, lat: p.lat, lng: p.lng, heading: p.heading || 0 });
      } else { // available: publish to the geo index for matching
        await redis.pipeline()
          .geoadd('drivers:geo', p.lng, p.lat, id)
          .set(`driver:${id}:alive`, 1, 'EX', 30)
          .exec();
      }
    });
  });
      }
