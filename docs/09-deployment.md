# 09 — Deployment (Vercel + Atlas)

> **Milestone M9.** How TeamBoard goes to production: the frontend as a static Vite
> build, the backend as a Vercel serverless function, both talking to MongoDB Atlas.
> Config is committed (`vercel.json` in each app); the deploy itself is a documented,
> repeatable procedure — run it when you're ready.

---

## 1. Topology

```
GitHub repo ──push──▶ Vercel project "teamboard-web"  (Root Directory: frontend)  → static SPA
            └─push──▶ Vercel project "teamboard-api"  (Root Directory: backend)   → serverless fn
                                                                                    │
                                                                       MongoDB Atlas (prod cluster)
```

Two Vercel projects from one repo, each with its **Root Directory** set to the app
folder. The install runs at the repo root so npm workspaces links `@teamboard/shared`
and its `prepare` script builds `shared/dist` **before** either app builds.

## 2. Backend as one serverless function

`backend/api/index.ts` bootstraps the Nest app onto an Express instance and caches it
at module scope. `backend/vercel.json` routes **every** path to that function:

```json
{ "version": 2,
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }] }
```

Because Nest keeps the global `/api` prefix, requests land at
`https://teamboard-api.vercel.app/api/...`.

### The one detail that matters most (ADR-008)
A warm Vercel container is reused across invocations, so caching the bootstrapped app
**also reuses the Mongoose connection** instead of dialing Atlas on every request.
Without this, each cold start opens a fresh connection and you exhaust Atlas's pool
under load. This is the difference between "works in the demo" and "works in
production."

## 3. Environment variables (set in the Vercel dashboard, never committed)

**teamboard-api**
| Var | Value |
|---|---|
| `MONGODB_URI` | Atlas prod SRV string, incl. `/teamboard` |
| `JWT_SECRET` | long random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | the deployed frontend origin, e.g. `https://teamboard-web.vercel.app` |

**teamboard-web**
| Var | Value |
|---|---|
| `VITE_API_URL` | `https://teamboard-api.vercel.app/api` |

## 4. Procedure

1. Push the repo to GitHub.
2. **Atlas:** confirm the prod cluster, a DB user, and network access (a specific
   Vercel egress range, or `0.0.0.0/0` for a demo).
3. **API project:** import the repo → Root Directory `backend` → add the env vars above
   → deploy. Smoke-test `GET /api/health`.
4. **Web project:** import the same repo → Root Directory `frontend` (Vercel detects
   Vite) → set `VITE_API_URL` → deploy.
5. Set the API's `CORS_ORIGIN` to the web URL and redeploy the API.
6. Point the Postman collection's `{{baseUrl}}` at the deployed API and run it.

## 5. Path B — always-on backend (the honest alternative)

Serverless has cold starts and no long-running processes (no websockets, queues, or
cron). If TeamBoard ever needs those, the **same Nest code** deploys to **Railway or
Render** as a persistent Node service (`npm run start:prod`) — only the deploy target
changes, not the app. The trade-off is always-on cost vs. scale-to-zero. Worth naming
in the client walkthrough to show the boundary was a deliberate choice.
