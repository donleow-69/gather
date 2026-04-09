import crypto from 'node:crypto';
import { Router } from 'express';
import { query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { sendEmail } from '../emails/client.js';
import { welcomeEmail } from '../emails/templates.js';

export const usersRouter = Router();

const LIFE_STAGES = new Set([
    'New to city',
    'Recently retired',
    'Empty nester',
    'Working remotely',
    'Recently divorced or separated',
    'Other',
]);

// POST /api/signup — create a user, return their session token
usersRouter.post('/signup', async (req, res) => {
    const { name, email, city, life_stage } = req.body || {};

    if (!name || !email || !city || !life_stage) {
        return res.status(400).json({ error: 'name, email, city, and life_stage are required' });
    }
    if (!LIFE_STAGES.has(life_stage)) {
        return res.status(400).json({ error: 'Invalid life_stage' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const token = crypto.randomBytes(24).toString('hex');

    try {
        // If the user already exists, hand back a fresh token rather than blocking signup.
        const { rows } = await query(
            `INSERT INTO users (email, name, city, life_stage, session_token)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO UPDATE
                 SET name = EXCLUDED.name,
                     city = EXCLUDED.city,
                     life_stage = EXCLUDED.life_stage,
                     session_token = EXCLUDED.session_token
             RETURNING id, email, name, city, life_stage, session_token`,
            [normalizedEmail, name.trim(), city.trim(), life_stage, token]
        );
        const user = rows[0];

        // Fire-and-forget welcome email — must not block or fail signup
        const { subject, html, text } = welcomeEmail({ name: user.name });
        sendEmail({ to: user.email, subject, html, text }).catch(() => {});

        res.status(201).json({ token: user.session_token, user });
    } catch (err) {
        console.error('signup failed', err);
        res.status(500).json({ error: 'Could not create user' });
    }
});

// POST /api/login — return a fresh session token for an existing user
usersRouter.post('/login', async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const token = crypto.randomBytes(24).toString('hex');

    try {
        const { rows } = await query(
            `UPDATE users SET session_token = $1 WHERE email = $2
             RETURNING id, email, name, city, life_stage, session_token`,
            [token, normalizedEmail]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "We couldn't find that email." });
        }
        const user = rows[0];
        res.json({ token: user.session_token, user });
    } catch (err) {
        console.error('login failed', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/me — return the authenticated user
usersRouter.get('/me', requireUser, (req, res) => {
    res.json({ user: req.user });
});
