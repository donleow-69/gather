// Thin wrapper around Resend that fails soft: if no API key is configured
// (e.g. local dev), we log the email instead of sending. Send errors are
// logged but never thrown — email failures must not break the API.
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'Gather <hello@gather.local>';

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail({ to, subject, html, text }) {
    if (!resend) {
        console.log(`[email:dry-run] to=${to} subject="${subject}"`);
        return { dryRun: true };
    }

    try {
        const result = await resend.emails.send({ from, to, subject, html, text });
        if (result.error) {
            console.error('[email:error]', result.error);
            return { error: result.error };
        }
        return { id: result.data?.id };
    } catch (err) {
        console.error('[email:exception]', err);
        return { error: err };
    }
}
