// Daily.co video room generation. Falls back to a placeholder URL
// if DAILY_API_KEY is not set (e.g. local dev).

const apiKey = process.env.DAILY_API_KEY;
const FALLBACK_URL = 'https://whereby.com/gather-demo';

export async function createVideoRoom(cohortName) {
    if (!apiKey) {
        console.log(`[video:dry-run] No DAILY_API_KEY — using placeholder for "${cohortName}"`);
        return FALLBACK_URL;
    }

    // Slugify cohort name into a room name: lowercase, hyphens, max 40 chars
    const slug = cohortName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
    const roomName = `${slug}-${Date.now().toString(36)}`;

    try {
        const res = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                name: roomName,
                properties: {
                    // Room expires 24 hours after the scheduled session
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 8,
                    enable_chat: true,
                    enable_screenshare: false,
                    max_participants: 6,
                },
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`[video:error] Daily.co ${res.status}: ${body}`);
            return FALLBACK_URL;
        }

        const data = await res.json();
        console.log(`[video] Created room: ${data.url}`);
        return data.url;
    } catch (err) {
        console.error('[video:exception]', err);
        return FALLBACK_URL;
    }
}
