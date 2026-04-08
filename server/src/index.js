import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { usersRouter } from './routes/users.js';
import { cohortsRouter } from './routes/cohorts.js';
import { ratingsRouter } from './routes/ratings.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', usersRouter);
app.use('/api', cohortsRouter);
app.use('/api', ratingsRouter);
app.use('/api', adminRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Gather API listening on http://localhost:${PORT}`);
});
