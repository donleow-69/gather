-- Gather database schema

DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS cohort_members CASCADE;
DROP TABLE IF EXISTS cohorts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    city            TEXT NOT NULL,
    life_stage      TEXT NOT NULL,
    session_token   TEXT UNIQUE NOT NULL,
    rematch         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cohorts (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    city        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cohort_members (
    cohort_id   INTEGER NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cohort_id, user_id)
);

CREATE TABLE sessions (
    id              SERIAL PRIMARY KEY,
    cohort_id       INTEGER NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    video_link      TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ratings (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    response    TEXT NOT NULL CHECK (response IN ('yes', 'maybe', 'no')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, session_id)
);

CREATE INDEX idx_cohort_members_user ON cohort_members(user_id);
CREATE INDEX idx_sessions_cohort ON sessions(cohort_id);
