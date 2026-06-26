# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workout tracker app. Monorepo with two packages:
- `client/` — Vite + React + TypeScript, deployed to **Vercel**
- `server/` — Express + TypeScript, deployed to **Railway**
- **Supabase** is the database (PostgreSQL) and auth provider

## Commands

### Root (runs both simultaneously)
```bash
npm install          # install all workspaces
npm run dev          # start client (port 3000) + server (port 8080) concurrently
```

### Client only
```bash
npm run dev --workspace=client
npm run build:client
npm run lint
```

### Server only
```bash
npm run dev --workspace=server    # tsx watch — no build step needed
npm run build:server              # tsc → dist/
```

## Architecture

### Auth flow
Supabase Auth handles login/signup on the client. The JWT access token is attached to every API request (`Authorization: Bearer <token>`). The Express server validates the token in `server/src/middleware/auth.ts` using Supabase's `getUser(token)` — this hits the Supabase auth server on every request. The validated `userId` is then available on `req.userId`.

The server uses the **service role key** (`server/src/lib/supabase.ts`) to bypass RLS and query the database. The client uses the **anon key** only for Supabase Auth — all data fetches go through the Express API.

### Data flow
```
Client → axios (with JWT) → Express /api/* → Supabase (service role) → PostgreSQL
```

The `@tanstack/react-query` QueryClient in `client/src/main.tsx` handles server state caching. All API calls are in `client/src/lib/api.ts` (axios instance that auto-attaches the JWT).

### Directory structure
```
client/src/
  lib/           # supabase.ts (auth client), api.ts (axios instance)
  hooks/         # useAuth.ts and future data hooks
  pages/         # one file per route
  types/         # shared TypeScript interfaces matching DB tables
  components/    # reusable UI components (to be added)

server/src/
  middleware/    # auth.ts — JWT verification
  routes/        # one file per resource, mounted in routes/index.ts
  controllers/   # business logic, one file per resource
  lib/           # supabase.ts (service role client)
```

## Environment Variables

**`client/.env`** (prefix all with `VITE_`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` — set to the Railway URL in production, proxied via Vite in dev

**`server/.env`**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — keep secret, server-only
- `SUPABASE_ANON_KEY` — used only to verify JWTs
- `CLIENT_URL` — for CORS (Vercel URL in production)
- `PORT` — Railway sets this automatically

## Database

Schema is in `supabase/schema.sql`. Run it in the Supabase SQL editor.

Tables: `workouts` → `exercises` → `workout_sets` (cascade deletes). All rows are user-scoped via `user_id`.

## Deployment

- **Client → Vercel**: set root to `client/`, build command `npm run build`, output `dist/`. Add `VITE_*` env vars.
- **Server → Railway**: set root to `server/`, start command `npm start` (runs `node dist/index.js`). Add server env vars.
- In production, set `VITE_API_URL` to the Railway service URL.
