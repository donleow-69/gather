// HTML email templates for Gather. Inline styles only — no web fonts —
// because email clients are unforgiving. Tone matches the warm/editorial
// design of the web app.

const COLORS = {
    bg: '#FAF6EF',
    card: '#FFFFFF',
    ink: '#2A2520',
    inkSoft: '#5A4F47',
    accent: '#E26D5C',
    accentDeep: '#C45A4A',
    blush: '#F4D5C5',
    border: '#EDE6DA',
};

function escapeHtml(s = '') {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function shell({ preheader, bodyHtml }) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>Gather</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${COLORS.ink};">
<span style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg};">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:${COLORS.inkSoft};">Gather</p>
          </td>
        </tr>
        <tr>
          <td style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:24px;padding:40px;box-shadow:0 2px 8px rgba(42,37,32,0.04);">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;font-size:12px;color:${COLORS.inkSoft};line-height:1.6;">
              Sent quietly, by Gather.<br/>
              No tracking. No notifications. Just this one email.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// === Welcome email — sent on signup ===
export function welcomeEmail({ name }) {
    const safeName = escapeHtml(name);
    const html = shell({
        preheader: "You're in. We've got you.",
        bodyHtml: `
            <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.15;font-weight:500;color:${COLORS.ink};">
                You're in, ${safeName}.
            </h1>
            <p style="margin:0 0 16px;font-size:17px;line-height:1.6;color:${COLORS.inkSoft};">
                Take a breath. We've got you.
            </p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.inkSoft};">
                We'll quietly look for a few people in your city who feel like
                you do right now. When your circle is ready — usually within a
                week — we'll send you the meetup details.
            </p>
            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${COLORS.inkSoft};font-style:italic;">
                No notifications. No nudges. Just one more thoughtful email
                when your circle is ready.
            </p>
        `,
    });

    return {
        subject: "You're in. We've got you.",
        html,
        text: `You're in, ${name}.\n\nTake a breath. We've got you.\n\nWe'll quietly look for a few people in your city who feel like you do right now. When your circle is ready — usually within a week — we'll send you the meetup details.\n\nNo notifications. No nudges. Just one more thoughtful email when your circle is ready.\n\n— Gather`,
    };
}

// === Cohort-ready email — sent when admin/match places someone in a cohort ===
export function cohortReadyEmail({ name, cohortName, city, members, scheduledAt, videoLink }) {
    const safeName = escapeHtml(name);
    const safeCohort = escapeHtml(cohortName);
    const safeCity = escapeHtml(city);
    const safeLink = escapeHtml(videoLink);

    const others = members.filter(m => m !== name);
    const othersList = others.map(escapeHtml).join(', ');

    const when = new Date(scheduledAt);
    const weekday = when.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = when.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const timeStr = when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const html = shell({
        preheader: 'Your circle is ready.',
        bodyHtml: `
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${COLORS.accent};">
                ${safeCity}
            </p>
            <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.15;font-weight:500;color:${COLORS.ink};">
                Your circle is ready, ${safeName}.
            </h1>
            <p style="margin:0 0 24px;font-size:17px;line-height:1.6;color:${COLORS.inkSoft};">
                We've matched you with ${others.length === 1 ? 'one person' : `${others.length} people`} we think you'll get along with.
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.blush};border-radius:18px;margin:0 0 24px;">
                <tr>
                    <td style="padding:24px;">
                        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${COLORS.accentDeep};">
                            Your meetup
                        </p>
                        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:24px;font-weight:500;color:${COLORS.ink};">
                            ${escapeHtml(weekday)}
                        </p>
                        <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:18px;color:${COLORS.inkSoft};">
                            ${escapeHtml(dateStr)} · ${escapeHtml(timeStr)}
                        </p>
                        <a href="${safeLink}" style="display:inline-block;background:${COLORS.accent};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:500;font-size:15px;">
                            Join the video call
                        </a>
                    </td>
                </tr>
            </table>

            <p style="margin:0 0 8px;font-size:14px;color:${COLORS.inkSoft};">
                <strong style="color:${COLORS.ink};font-weight:500;">Who you'll meet:</strong> ${othersList || '— just you for now —'}
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:${COLORS.inkSoft};">
                <strong style="color:${COLORS.ink};font-weight:500;">Circle:</strong> ${safeCohort}
            </p>

            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${COLORS.inkSoft};">
                One hour. Just a video call. Bring whatever you'd bring to coffee
                with a friend you haven't met yet.
            </p>
        `,
    });

    return {
        subject: `Your circle is ready, ${name}`,
        html,
        text: `Your circle is ready, ${name}.\n\nWe've matched you with ${others.length === 1 ? 'one person' : `${others.length} people`} in ${city} we think you'll get along with.\n\nWhen: ${weekday}, ${dateStr} at ${timeStr}\nJoin: ${videoLink}\n\nWho you'll meet: ${others.join(', ') || '— just you for now —'}\nCircle: ${cohortName}\n\nOne hour. Just a video call. Bring whatever you'd bring to coffee with a friend you haven't met yet.\n\n— Gather`,
    };
}
