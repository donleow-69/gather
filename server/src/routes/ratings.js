import { Router } from 'express';
import { query } from '../db.js';
import { requireUser } from '../middleware/auth.js';

export const ratingsRouter = Router();

const VALID = new Set(['yes', 'maybe', 'no']);

// POST /api/ratings — submit a rating for a session
ratingsRouter.post('/ratings', requireUser, async (req, res) => {
    const { session_id, response } = req.body || {};

    if (!session_id || !VALID.has(response)) {
        return res.status(400).json({ error: 'session_id and response (yes|maybe|no) required' });
    }

    try {
        const { rows } = await query(
            `INSERT INTO ratings (user_id, session_id, response)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, session_id)
                 DO UPDATE SET response = EXCLUDED.response, created_at = NOW()
             RETURNING id, session_id, response, created_at`,
            [req.user.id, session_id, response]
        );

        // "Yes" opts the user in for re-matching; anything else opts out
        await query(
            'UPDATE users SET rematch = $1 WHERE id = $2',
            [response === 'yes', req.user.id]
        );

        res.status(201).json({ rating: rows[0], rematch: response === 'yes' });
    } catch (err) {
        console.error('rating failed', err);
        res.status(500).json({ error: 'Could not save rating' });
    }
});
