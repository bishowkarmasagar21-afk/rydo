import 'dotenv/config';

export const cfg = {
  port: Number(process.env.PORT) || 3000,
  jwt: process.env.JWT_SECRET,
  pg: process.env.DATABASE_URL,
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  osrm: process.env.OSRM_URL || 'https://router.project-osrm.org',
};

if (!cfg.jwt || cfg.jwt.length < 16) throw new Error('Set JWT_SECRET (16+ chars) in .env');
if (!cfg.pg) throw new Error('Set DATABASE_URL in .env');
