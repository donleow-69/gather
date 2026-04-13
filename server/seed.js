// Seed Gather with 8 dummy users across 2 cities, in 2 cohorts.
import crypto from 'node:crypto';
import { pool } from './src/db.js';

const token = () => crypto.randomBytes(24).toString('hex');

const users = [
    // Singapore cohort
    { name: 'Aisha',   email: 'aisha@example.com',   city: 'Singapore',     life_stage: 'New to city' },
    { name: 'Bryan',   email: 'bryan@example.com',   city: 'Singapore',     life_stage: 'Working remotely' },
    { name: 'Chloe',   email: 'chloe@example.com',   city: 'Singapore',     life_stage: 'New to city' },
    { name: 'Devan',   email: 'devan@example.com',   city: 'Singapore',     life_stage: 'Recently divorced or separated' },
    // San Francisco cohort
    { name: 'Elena',   email: 'elena@example.com',   city: 'San Francisco', life_stage: 'Empty nester' },
    { name: 'Farouk',  email: 'farouk@example.com',  city: 'San Francisco', life_stage: 'Recently retired' },
    { name: 'Grace',   email: 'grace@example.com',   city: 'San Francisco', life_stage: 'Working remotely' },
    { name: 'Hassan',  email: 'hassan@example.com',  city: 'San Francisco', life_stage: 'Other' },
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Wipe existing data so seed is idempotent
        await client.query('TRUNCATE ratings, sessions, cohort_members, cohorts, users RESTART IDENTITY CASCADE');

        const userIds = [];
        for (const u of users) {
            const { rows } = await client.query(
                `INSERT INTO users (email, name, city, life_stage, session_token)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [u.email, u.name, u.city, u.life_stage, token()]
            );
            userIds.push(rows[0].id);
        }

        const cohortDefs = [
            { name: 'Singapore Circle 1',     city: 'Singapore',     memberIdx: [0, 1, 2, 3] },
            { name: 'San Francisco Circle 1', city: 'San Francisco', memberIdx: [4, 5, 6, 7] },
        ];

        // Schedule sessions one week from now, staggered by day
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 7);
        baseDate.setHours(19, 0, 0, 0);

        for (let i = 0; i < cohortDefs.length; i++) {
            const c = cohortDefs[i];
            const { rows } = await client.query(
                `INSERT INTO cohorts (name, city) VALUES ($1, $2) RETURNING id`,
                [c.name, c.city]
            );
            const cohortId = rows[0].id;

            for (const idx of c.memberIdx) {
                await client.query(
                    `INSERT INTO cohort_members (cohort_id, user_id) VALUES ($1, $2)`,
                    [cohortId, userIds[idx]]
                );
            }

            const sessionDate = new Date(baseDate);
            sessionDate.setDate(sessionDate.getDate() + i);
            await client.query(
                `INSERT INTO sessions (cohort_id, scheduled_at, video_link)
                 VALUES ($1, $2, $3)`,
                [cohortId, sessionDate.toISOString(), 'https://whereby.com/gather-circle']
            );
        }

        await client.query('COMMIT');
        console.log(`Seeded ${users.length} users into ${cohortDefs.length} cohorts.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', err);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
