import { Router } from 'express';
import { query } from '../db.js';
import { requireUser } from '../middleware/auth.js';

export const cohortsRouter = Router();

// GET /api/me/cohort — return the user's cohort, members (first names only), and next session
cohortsRouter.get('/me/cohort', requireUser, async (req, res) => {
    const cohortRes = await query(
        `SELECT c.id, c.name, c.city
           FROM cohorts c
           JOIN cohort_members cm ON cm.cohort_id = c.id
          WHERE cm.user_id = $1
          LIMIT 1`,
        [req.user.id]
    );

    if (cohortRes.rows.length === 0) {
        return res.json({ cohort: null });
    }

    const cohort = cohortRes.rows[0];

    const [membersRes, sessionRes] = await Promise.all([
        query(
            `SELECT split_part(u.name, ' ', 1) AS first_name
               FROM users u
               JOIN cohort_members cm ON cm.user_id = u.id
              WHERE cm.cohort_id = $1
              ORDER BY u.id`,
            [cohort.id]
        ),
        query(
            `SELECT id, scheduled_at, video_link
               FROM sessions
              WHERE cohort_id = $1
              ORDER BY scheduled_at ASC
              LIMIT 1`,
            [cohort.id]
        ),
    ]);

    res.json({
        cohort: {
            id: cohort.id,
            name: cohort.name,
            city: cohort.city,
            members: membersRes.rows.map(r => r.first_name),
            session: sessionRes.rows[0] || null,
        },
    });
});
