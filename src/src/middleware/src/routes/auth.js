import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { q } from '../db.js';
import { cfg } from '../config.js';
import { auth, wrap } from '../middleware/auth.js';

const r = Router();
const sign = (u) => jwt.sign({ id: u.id, role: u.role }, cfg.jwt, { expiresIn: '7d' });
const pub = (u) => ({ id: u.id, role: u.role, name: u.name, email: u.email, rating: Number(u.rating) });

r.post('/register', wrap(async (req, res) => {
  const { role, name, email, phone, password, car_model, plate, car_class } = req.body || {};
  if (!['rider', 'driver'].includes(role) || !name || !email || !password || password.length < 8)
    return res.status(400).json({ error: 'Name, email, role and a password of 8+ characters are required' });
  if (role === 'driver' && (!car_model || !plate))
    return res.status(400).json({ error: 'Drivers must provide car model and plate' });
  if (role === 'driver' && car_class && !['economy', 'comfort', 'xl'].includes(car_class))
    return res.status(400).json({ error: 'Invalid car class' });
  try {
    const hash = await bcrypt.hash(password, 11);
    const { rows: [u] } = await q(
      'INSERT INTO users(role,name,email,phone,password_hash) VALUES($1,$2,lower($3),$4,$5) RETURNING *',
      [role, name.trim(), email.trim(), phone || null, hash]);
    if (role === 'driver')
      await q('INSERT INTO drivers(user_id,car_model,plate,car_class) VALUES($1,$2,$3,$4)',
        [u.id, car_model.trim(), plate.trim().toUpperCase(), car_class || 'economy']);
    res.json({ token: sign(u), user: pub(u) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'That email is already registered' });
    throw e;
  }
}));

r.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const { rows: [u] } = await q('SELECT * FROM users WHERE email=lower($1)', [email || '']);
  if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
    return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: sign(u), user: pub(u) });
}));

r.get('/me', auth(), wrap(async (req, res) => {
  const { rows: [u] } = await q('SELECT * FROM users WHERE id=$1', [req.user.id]);
  if (!u) return res.status(401).json({ error: 'Account not found' });
  res.json({ user: pub(u) });
}));

export default r;
