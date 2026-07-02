# 09 — Deployment (Vercel + Atlas)

> **Milestone M9.** How TeamBoard goes to production: the frontend as a static Vite
> build, the backend as a Vercel serverless function, both talking to MongoDB Atlas.
> **This is live** — [teamboard-web.vercel.app](https://teamboard-web.vercel.app) /
> [teamboard-api.vercel.app](https://teamboard-api.vercel.app/api/health) — and this doc
> reflects the config that's actually running, including the real problems hit getting
> there. Deployment is the one milestone where "it built cleanly" and "it works in
> production" turned out to be two different claims — worth reading in full.

---

## 1. Topology

```
GitHub repo ──push──▶ Vercel project "teamboard-web"  (Root Directory: frontend)  → static SPA
            └─push──▶ Vercel project "teamboard-api"  (Root Directory: backend)   → serverless fn
                                                                                    │
                                                                       MongoDB Atlas (prod cluster)
```

Two Vercel projects from one repo, each with its **Root Directory** set to the app
folder. Vercel's monorepo detection installs from the true repo root (respecting npm
workspaces, so `@teamboard/shared` resolves via the local workspace symlink, not the
public registry), then builds within the configured subdirectory.

## 2. Backend as one serverless function

`backend/api/index.ts` bootstraps the Nest app onto an Express instance and caches it
at module scope. `backend/vercel.json` is deliberately minimal:

```json
{ "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }] }
```

**This is not the config we started with** — see §4. The old, legacy `builds`/`routes`
array format looks equivalent but bypasses Vercel's workspace-aware install entirely,
breaking the monorepo. `rewrites` + Vercel's own zero-config detection of `api/*.ts`
is the version that actually works.

Because Nest keeps the global `/api` prefix, requests land at
`https://teamboard-api.vercel.app/api/...`.

### The one detail that matters most (ADR-008)
A warm Vercel container is reused across invocations, so caching the bootstrapped app
**also reuses the Mongoose connection** instead of dialing Atlas on every request.
Without this, each cold start opens a fresh connection and you exhaust Atlas's pool
under load. This is the difference between "works in the demo" and "works in
production."

## 3. Environment variables

**teamboard-api**
| Var | Value |
|---|---|
| `MONGODB_URI` | Atlas prod SRV string, incl. `/teamboard` |
| `JWT_SECRET` | long random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `https://teamboard-web.vercel.app` |
| `NODE_ENV` | `production` |

**teamboard-web**
| Var | Value |
|---|---|
| `VITE_API_URL` | `https://teamboard-api.vercel.app/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | the unsigned preset name |

**A trap worth naming explicitly:** if you set these via a shell pipe —
`echo "value" | vercel env add KEY production` — `echo` appends a trailing newline,
which becomes *part of the stored value* (`"production\n"`, not `"production"`). This
single character was the root cause of §4's entire debugging saga. Use
`printf '%s' "value" | vercel env add ...` instead — `printf` adds nothing extra.

## 4. What actually went wrong going live — full debugging trail

Everything built cleanly, unit tests passed, and the localhost smoke test passed
end-to-end. None of that predicted what happened on first deploy: **every single
request to the live API hung forever — no response, no error, no log line.** Four
distinct, unrelated problems were stacked on top of each other. Each one had to be
isolated and fixed before the next became visible.

### Problem 1 — legacy `vercel.json` breaks the monorepo install
**Symptom:** `npm error 404 Not Found — @teamboard/shared` during the Vercel build.
**Cause:** the original `backend/vercel.json` used the legacy `builds`/`routes` array
format. When present, Vercel skips its normal workspace-aware install step entirely and
just runs `npm install` in an isolated context — so `@teamboard/shared` (a local
workspace package, not a published one) can't resolve.
**Fix:** switch to the modern `rewrites`-only config shown in §2, which lets Vercel's
standard, workspace-aware install path run.

### Problem 2 — Vercel Deployment Protection silently blocked every request
**Symptom:** after fixing the install, the *raw* deployment URL returned a fast `302`
redirect; the stable alias (`teamboard-api.vercel.app`) just hung with zero bytes back,
no matter the path or HTTP method.
**Cause:** "Vercel Authentication" (an SSO wall protecting deployments by default on
team accounts) was enabled project-wide.
**Fix:** Project Settings → Deployment Protection → disabled, on both projects.
**Lesson:** the raw URL and the production alias can behave differently under the same
protection setting — test both when diagnosing.

### Problem 3 — MongoDB Atlas Network Access
**Symptom:** requests still hung after disabling deployment protection.
**Cause:** Vercel serverless functions use dynamic, unpredictable outbound IPs (no
static IP without a paid add-on); Atlas's Network Access list didn't allow them, so the
MongoDB driver's connection attempt hung until its own internal timeout.
**Fix:** added `0.0.0.0/0` to Atlas Network Access. (Access is still gated by the DB
username/password — this only affects *which network* can attempt to connect.)
**Verified in isolation:** a raw `mongoose.connect()` call, bypassing Nest entirely,
connected in ~2 seconds once this was fixed — confirming Atlas itself was fine and the
remaining hang (Problem 4) was somewhere else.

### Problem 4 — the real one: two bugs stacked in the same hang
With infrastructure-level issues cleared, requests *still* hung — with zero log output,
even from Nest's own logger. Bisection (isolating pieces of `AppModule` into standalone
test modules, one variable at a time) found two independent, compounding bugs:

**4a — a trailing newline in `NODE_ENV`.** Because it was set via `echo | vercel env
add` (see the trap in §3), `process.env.NODE_ENV` was literally `"production\n"`. Our
Joi schema (`Joi.string().valid('development', 'production', 'test')`) doesn't match
that string, so validation failed *inside* `ConfigModule.forRoot()`. That module's
`forRoot()` is `async`, and it's called directly inside `AppModule`'s `imports: [...]`
array — Nest has to `await` it while building the module graph. The **rejection from
that failed validation never surfaced as a clean error** — it manifested as the entire
bootstrap hanging silently instead. (Separately, the schema was also tightened with
`.unknown(true)`, since hosting platforms inject many of their own env vars — Vercel
alone adds ~44 `AWS_*`/`VERCEL_*` keys — and a schema validating the *entire*
`process.env` shouldn't reject keys it doesn't know about.)

**4b — Express 4 vs. Express 5.** Once the env vars were fixed, requests failed fast
instead of hanging — real progress, and it surfaced the actual remaining error:
`'app.router' is deprecated!`, thrown inside `@nestjs/platform-express`'s
`ExpressAdapter`. NestJS 11's `@nestjs/platform-express` depends on **Express 5**
internally, but `backend/package.json` still pinned `express: "^4.21.0"` — a leftover
from the original NestJS 10 build that was never updated during the later v10→v11
upgrade (see `docs/00`). `api/index.ts` was creating the Express instance itself via
`express()`, so it was handing the adapter an Express 4 app when the adapter's own code
expected Express 5 semantics. **Fix:** bump `express` to `^5.2.1` (and `@types/express`
to `^5.0.6`) to match what `@nestjs/platform-express@11` actually expects, plus a root
`overrides` entry so the whole dependency tree dedupes to one Express version instead of
nesting a second copy.

### How this was actually diagnosed
Not by reading the error — there wasn't one. By repeatedly deploying a **stripped-down
diagnostic `api/index.ts`** that tested one hypothesis at a time (raw Mongoose connect
only; `NestFactory.createApplicationContext` with just `ConfigModule`; just
`MongooseModule`; direct Joi validation against real `process.env`; a plain
non-Nest Express handler) and comparing which ones responded instantly versus hung. Each
test either confirmed or eliminated a layer, narrowing four unrelated problems down to
their exact root causes — a case for isolating the smallest reproducible unit rather
than guessing at a stack trace that doesn't exist.

## 5. Procedure (as it actually works now)

1. Push the repo to GitHub.
2. **Atlas:** confirm the prod cluster, a DB user, and Network Access set to `0.0.0.0/0`
   (serverless functions don't have static outbound IPs without a paid add-on).
3. **API project:** import the repo → Root Directory `backend` → set env vars from §3
   (using `printf`, never a bare `echo`, if piping values) → deploy. Smoke-test
   `GET /api/health`.
4. **Web project:** import the same repo → Root Directory `frontend` → set env vars →
   deploy.
5. Set the API's `CORS_ORIGIN` to the deployed web URL; redeploy the API if it changed.
6. **Project Settings → Deployment Protection → disable** on both projects (required for
   a reviewer/tester to reach the API without a Vercel login).
7. Point the Postman collection's `{{baseUrl}}` at the deployed API and run it.

## 6. Path B — always-on backend (the honest alternative)

Serverless has cold starts and no long-running processes (no websockets, queues, or
cron). If TeamBoard ever needs those, the **same Nest code** deploys to **Railway or
Render** as a persistent Node service (`npm run start:prod`) — only the deploy target
changes, not the app. The trade-off is always-on cost vs. scale-to-zero. Worth naming
in the client walkthrough to show the boundary was a deliberate choice.
