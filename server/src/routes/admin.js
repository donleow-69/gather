import { Router } from 'express';
import { pool, query } from '../db.js';
import { sendEmail } from '../emails/client.js';
import { cohortReadyEmail } from '../emails/templates.js';
import { createVideoRoom } from '../video.js';

export const adminRouter = Router();

const MIN_COHORT = 3;
const MAX_COHORT = 5;

function requireAdmin(req, res, next) {
    const expected = process.env.ADMIN_SECRET;
    if (!expected) {
        return res.status(503).json({ error: 'ADMIN_SECRET not configured on server' });
    }
    const provided = req.header('X-Admin-Secret');
    if (provided !== expected) {
        return res.status(401).json({ error: 'Invalid admin secret' });
    }
    next();
}

// POST /api/admin/match
// Group unmatched users by (city, life_stage), form cohorts of 3–5,
// create cohort + memberships + a unique video room + session for each.
// Leftovers (< MIN_COHORT per group) remain unmatched.
adminRouter.post('/admin/match', requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows: unmatched } = await client.query(
            `SELECT u.id, u.name, u.email, u.city, u.life_stage
               FROM users u
              WHERE NOT EXISTS (
                  SELECT 1 FROM cohort_members cm WHERE cm.user_id = u.id
              )
              ORDER BY u.city, u.life_stage, u.created_at`
        );

        // Bucket users by "city||life_stage"
        const groups = new Map();
        for (const u of unmatched) {
            const key = `${u.city}||${u.life_stage}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(u);
        }

        // Schedule new sessions one week out at 7pm UTC, staggered per cohort
        const baseDate = new Date();
        baseDate.setUTCDate(baseDate.getUTCDate() + 7);
        baseDate.setUTCHours(19, 0, 0, 0);

        const cohortsCreated = [];
        let cohortIndex = 0;

        for (const [key, users] of groups) {
            const [city, lifeStage] = key.split('||');

            // Greedily form cohorts of up to MAX_COHORT. If the remainder
            // would be < MIN_COHORT, shrink the last cohort to accommodate.
            let i = 0;
            while (i < users.length) {
                const remaining = users.length - i;
                if (remaining < MIN_COHORT) break; // too few — leave unmatched

                let chunkSize = Math.min(MAX_COHORT, remaining);
                // If taking MAX_COHORT would leave a remainder < MIN_COHORT (and > 0),
                // split more evenly so both halves are >= MIN_COHORT
                const afterChunk = remaining - chunkSize;
                if (afterChunk > 0 && afterChunk < MIN_COHORT) {
                    chunkSize = Math.ceil(remaining / 2);
                }

                const chunk = users.slice(i, i + chunkSize);
                i += chunkSize;

                const cohortName = `${city} · ${lifeStage} #${Date.now().toString(36)}-${cohortIndex}`;
                const { rows: cohortRows } = await client.query(
                    `INSERT INTO cohorts (name, city) VALUES ($1, $2) RETURNING id, name`,
                    [cohortName, city]
                );
                const cohortId = cohortRows[0].id;

                for (const u of chunk) {
                    await client.query(
                        `INSERT INTO cohort_members (cohort_id, user_id) VALUES ($1, $2)`,
                        [cohortId, u.id]
                    );
                }

                const sessionDate = new Date(baseDate);
                sessionDate.setUTCDate(sessionDate.getUTCDate() + cohortIndex);

                // Generate a unique video room (Daily.co if key set, else placeholder)
                const videoLink = await createVideoRoom(cohortName);

                const { rows: sessionRows } = await client.query(
                    `INSERT INTO sessions (cohort_id, scheduled_at, video_link)
                     VALUES ($1, $2, $3) RETURNING id, scheduled_at`,
                    [cohortId, sessionDate.toISOString(), videoLink]
                );

                cohortsCreated.push({
                    cohort_id: cohortId,
                    name: cohortRows[0].name,
                    city,
                    life_stage: lifeStage,
                    member_ids: chunk.map(u => u.id),
                    members: chunk.map(u => ({ id: u.id, name: u.name, email: u.email })),
                    session_id: sessionRows[0].id,
                    scheduled_at: sessionRows[0].scheduled_at,
                    video_link: videoLink,
                });

                cohortIndex++;
            }
        }

        // Recompute who is still unmatched after this run
        const matchedIds = new Set(cohortsCreated.flatMap(c => c.member_ids));
        const stillUnmatched = unmatched.filter(u => !matchedIds.has(u.id));

        await client.query('COMMIT');

        // Fire-and-forget cohort-ready emails
        for (const cohort of cohortsCreated) {
            const memberFirstNames = cohort.members.map(m => m.name);
            for (const member of cohort.members) {
                const { subject, html, text } = cohortReadyEmail({
                    name: member.name,
                    cohortName: cohort.name,
                    city: cohort.city,
                    members: memberFirstNames,
                    scheduledAt: cohort.scheduled_at,
                    videoLink: cohort.video_link,
                });
                sendEmail({ to: member.email, subject, html, text }).catch(() => {});
            }
        }

        res.json({
            cohorts_created: cohortsCreated.length,
            users_matched: matchedIds.size,
            users_still_unmatched: stillUnmatched.length,
            cohorts: cohortsCreated.map(c => ({
                cohort_id: c.cohort_id,
                name: c.name,
                city: c.city,
                life_stage: c.life_stage,
                member_ids: c.member_ids,
                member_names: c.members.map(m => m.name),
                session_id: c.session_id,
                scheduled_at: c.scheduled_at,
                video_link: c.video_link,
            })),
            unmatched: stillUnmatched.map(u => ({
                id: u.id,
                name: u.name,
                city: u.city,
                life_stage: u.life_stage,
            })),
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('match failed', err);
        res.status(500).json({ error: 'Matching failed' });
    } finally {
        client.release();
    }
});

// GET /api/admin/signups — all users with their match status
adminRouter.get('/admin/signups', requireAdmin, async (_req, res) => {
    const { rows } = await query(
        `SELECT u.id, u.name, u.email, u.city, u.life_stage, u.created_at,
                EXISTS(SELECT 1 FROM cohort_members cm WHERE cm.user_id = u.id) AS matched
           FROM users u
          ORDER BY u.created_at DESC`
    );
    res.json({ signups: rows });
});

// GET /api/admin/cohorts — all cohorts with members and session info
adminRouter.get('/admin/cohorts', requireAdmin, async (_req, res) => {
    const { rows: cohorts } = await query(
        `SELECT c.id, c.name, c.city, c.created_at,
                s.id AS session_id, s.scheduled_at, s.video_link
           FROM cohorts c
           LEFT JOIN sessions s ON s.cohort_id = c.id
          ORDER BY c.created_at DESC`
    );

    // Fetch members for each cohort in one query
    const cohortIds = cohorts.map(c => c.id);
    let membersByCofort = {};
    if (cohortIds.length > 0) {
        const { rows: members } = await query(
            `SELECT cm.cohort_id, u.id, u.name, u.email, u.life_stage,
                    r.response AS rating
               FROM cohort_members cm
               JOIN users u ON u.id = cm.user_id
               LEFT JOIN ratings r ON r.user_id = u.id AND r.session_id = (
                   SELECT s.id FROM sessions s WHERE s.cohort_id = cm.cohort_id LIMIT 1
               )
              WHERE cm.cohort_id = ANY($1)
              ORDER BY u.name`,
            [cohortIds]
        );
        for (const m of members) {
            if (!membersByCofort[m.cohort_id]) membersByCofort[m.cohort_id] = [];
            membersByCofort[m.cohort_id].push({
                id: m.id,
                name: m.name,
                email: m.email,
                life_stage: m.life_stage,
                rating: m.rating,
            });
        }
    }

    res.json({
        cohorts: cohorts.map(c => ({
            id: c.id,
            name: c.name,
            city: c.city,
            created_at: c.created_at,
            session: c.session_id ? {
                id: c.session_id,
                scheduled_at: c.scheduled_at,
                video_link: c.video_link,
            } : null,
            members: membersByCofort[c.id] || [],
        })),
    });
});
