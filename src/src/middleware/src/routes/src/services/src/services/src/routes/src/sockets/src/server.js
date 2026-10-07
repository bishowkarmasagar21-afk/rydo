import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { cfg } from './config.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import { initSockets } from './sockets/index.js';
import { initDispatch } from './services/dispatch.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
initDispatch(io);
initSockets(io);

server.listen(cfg.port, () => console.log(`Ryde running on http://localhost:${cfg.port}`));
