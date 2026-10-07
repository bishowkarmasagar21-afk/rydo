import pg from 'pg';
import { cfg } from './config.js';

export const pool = new pg.Pool({ connectionString: cfg.pg });
export const q = (text, params) => pool.query(text, params);
