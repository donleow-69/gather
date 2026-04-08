import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Render's managed Postgres requires SSL; locally it's optional.
    ssl: process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
});

export const query = (text, params) => pool.query(text, params);
