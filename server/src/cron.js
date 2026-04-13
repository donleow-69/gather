// Scheduled matching + rating email trigger.
// Runs as a standalone process — called by Render Cron Job on Mon/Wed/Fri.
//
// 1. Calls POST /api/admin/match to create new cohorts
// 2. Calls POST /api/admin/send-rating-emails for past sessions
//
// Uses the internal API so all business logic stays in one place.

import 'dotenv/config';

const API_URL = process.env.INTERNAL_API_URL || `http://localhost:${process.env.PORT || 4000}`;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
    console.error('ADMIN_SECRET is required');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Secret': ADMIN_SECRET,
};

async function run() {
    console.log(`[cron] Starting scheduled run at ${new Date().toISOString()}`);

    // Step 1: Match unmatched users
    try {
        const matchRes = await fetch(`${API_URL}/api/admin/match`, {
            method: 'POST',
            headers,
        });
        const match = await matchRes.json();
        console.log(`[cron:match] Created ${match.cohorts_created} cohort(s), matched ${match.users_matched} user(s), ${match.users_still_unmatched} still unmatched`);
    } catch (err) {
        console.error('[cron:match] Failed:', err.message);
    }

    // Step 2: Send rating emails for past sessions
    try {
        const ratingRes = await fetch(`${API_URL}/api/admin/send-rating-emails`, {
            method: 'POST',
            headers,
        });
        const rating = await ratingRes.json();
        console.log(`[cron:ratings] Sent ${rating.sent} rating email(s)`);
    } catch (err) {
        console.error('[cron:ratings] Failed:', err.message);
    }

    console.log('[cron] Done');
}

run().then(() => process.exit(0)).catch((err) => {
    console.error('[cron] Fatal:', err);
    process.exit(1);
});
