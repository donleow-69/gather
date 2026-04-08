import { query } from '../db.js';

export async function requireUser(req, res, next) {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { rows } = await query(
        'SELECT id, email, name, city, life_stage FROM users WHERE session_token = $1',
        [token]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid token' });

    req.user = rows[0];
    next();
}
