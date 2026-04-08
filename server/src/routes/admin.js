import { Router } from 'express';
import { pool } from '../db.js';
import { sendEmail } from '../emails/client.js';
import { cohortReadyEmail } from '../emails/templates.js';

export const adminRouter = Router();

const COHORT_SIZE = 4;
const DEFAULT_VIDEO_LINK = 'https://whereby.com/gather-demo';

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
// Group unmatched users by (city, life_stage), form cohorts of exactly COHORT_SIZE,
// create cohort + memberships + a single upcoming session for each.
// Leftovers (< COHORT_SIZE per group) remain unmatched.
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

            // Take chunks of COHORT_SIZE; leftovers remain unmatched
            for (let i = 0; i + COHORT_SIZE <= users.length; i += COHORT_SIZE) {
                const chunk = users.slice(i, i + COHORT_SIZE);

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
                const { rows: sessionRows } = await client.query(
                    `INSERT INTO sessions (cohort_id, scheduled_at, video_link)
                     VALUES ($1, $2, $3) RETURNING id, scheduled_at`,
                    [cohortId, sessionDate.toISOString(), DEFAULT_VIDEO_LINK]
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
                    video_link: DEFAULT_VIDEO_LINK,
                });

                cohortIndex++;
            }
        }

        // Recompute who is still unmatched after this run
        const matchedIds = new Set(cohortsCreated.flatMap(c => c.member_ids));
        const stillUnmatched = unmatched.filter(u => !matchedIds.has(u.id));

        await client.query('COMMIT');

        // Fire-and-forget cohort-ready emails. Failures are logged inside
        // sendEmail and must not affect the API response.
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
