# Gather

Social connection app for adults who want to make friends. Users sign up, get matched into small cohorts by city and life stage, meet over video, then rate the experience.

## Stack
- **Client:** React + Vite + Tailwind
- **Server:** Node + Express
- **Database:** PostgreSQL
- **Hosting:** Render (client as static site, server as web service, managed Postgres)
- **Auth:** Email as unique identifier, opaque session token in localStorage

## Monorepo layout
```
gather/
├── client/   # React + Tailwind frontend
└── server/   # Express API + Postgres schema + seed
```

## Local development

### Server
```bash
cd server
cp .env.example .env   # set DATABASE_URL
npm install
psql "$DATABASE_URL" -f schema.sql
npm run seed
npm run dev            # http://localhost:4000
```

### Client
```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

The client expects the API at `VITE_API_URL` (defaults to `http://localhost:4000`).

## Deploying to Render

This repo includes a `render.yaml` Blueprint that provisions:
- `gather-db` — managed Postgres (free tier)
- `gather-api` — Node web service (free tier) running the Express API
- `gather-client` — static site (free tier) serving the built React app

**First-time setup:**
1. Push this repo to GitHub
2. In Render dashboard: **New → Blueprint** → connect the repo → apply
3. Once `gather-api` is up, open its **Shell** tab and run:
   ```bash
   psql "$DATABASE_URL" -f schema.sql
   npm run seed   # optional, populates demo data
   ```
4. Set `CLIENT_ORIGIN` on `gather-api` to the deployed client URL
5. Set `VITE_API_URL` on `gather-client` to the deployed API URL, then trigger a rebuild
6. `ADMIN_SECRET` is auto-generated — grab it from the API service env tab

## API endpoints

| Method | Path                | Auth         | Purpose                                      |
|--------|---------------------|--------------|----------------------------------------------|
| GET    | `/api/health`       | none         | Liveness probe                               |
| POST   | `/api/signup`       | none         | Create/refresh user, return session token    |
| GET    | `/api/me`           | Bearer       | Current user                                 |
| GET    | `/api/me/cohort`    | Bearer       | Cohort + first names + next session          |
| POST   | `/api/ratings`      | Bearer       | Submit `{session_id, response}` (yes/maybe/no) |
| POST   | `/api/admin/match`  | X-Admin-Secret | Group unmatched users by city + life stage into cohorts of 4 |

## Core flow
1. **Landing** — pitch + "Join Gather" CTA
2. **Onboarding** — name, email, city, life stage
3. **Waiting** — confirmation, "you'll be matched soon"
4. **Cohort** — group members (first names), session date/time, video link
5. **Rating** — "Would you meet this group again?" Yes / Maybe / No
