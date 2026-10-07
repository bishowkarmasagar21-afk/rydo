import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';

export const auth = (role) => (req, res, next) => {
  const h = req.headers.authorization || '';
  try {
    req.user = jwt.verify(h.replace(/^Bearer /, ''), cfg.jwt);
  } catch {
    return res.status(401).json({ error: 'Please log in again' });
  }
  if (role && req.user.role !== role) return res.status(403).json({ error: 'Not allowed for this account type' });
  next();
};

export const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  });
