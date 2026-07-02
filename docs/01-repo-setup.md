# 01 — Repository & Environment Setup

> **Milestone M1.** Turns an empty folder into a typed monorepo with a shared
> contract package and boot-time-validated configuration.

---

## 1. What this milestone produces

- An **npm-workspaces monorepo**: `shared`, `backend`, `frontend` under one root.
- A **`@teamboard/shared`** package that both apps depend on (the shared-types bonus).
- **`.env.example`** files everywhere real secrets are needed; real `.env` files are
  gitignored and never committed.
- A `.gitignore` covering `node_modules`, `.env`, and all build output.

---

## 2. Why a monorepo with workspaces

One `git push`, one `npm install`, one place to reason about the whole system — while
each workspace stays independently buildable and, later, independently deployable.

```
teamboard/                 (root — npm workspaces host, no app code)
├── package.json           workspaces: [ shared, backend, frontend ] + orchestration scripts
├── shared/                @teamboard/shared — types + enums (built to dist/)
├── backend/               NestJS API
└── frontend/              Vite + React SPA
```

The root `package.json` orchestrates cross-workspace builds:

```jsonc
"scripts": {
  "build": "npm run build:shared && npm run build:backend && npm run build:frontend",
  "dev:backend": "npm run start:dev --workspace backend",
  "dev:frontend": "npm run dev --workspace frontend"
}
```

`shared` builds **first** because the other two import it. Its `prepare` script
(`tsc`) runs automatically on `npm install`, so `dist/` exists before anything
consumes it — no "module not found" on a fresh clone.

## 3. The shared contract package

`@teamboard/shared` (see `shared/src/index.ts`) exports:

- `TaskStatus` enum + `TASK_STATUSES` + `TASK_STATUS_LABEL`
- `UserPublic`, `Project`, `Task` entity shapes (JSON-over-the-wire form)
- `SignupPayload`, `LoginPayload`, `AuthResponse`, `JwtClaims`
- `Create/Update` payloads mirroring the backend DTOs

It compiles to **CommonJS + `.d.ts`** so NestJS consumes it natively at runtime and
Vite pre-bundles it for the browser. Both sides import from the same file, so any
contract drift surfaces as a TypeScript error at build time on both ends.

## 4. Configuration — 12-factor, validated at boot (ADR-006)

Secrets live only in environment variables, never in code.

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI` | backend | Atlas SRV connection string (includes db name) |
| `JWT_SECRET` | backend | Signs/verifies JWTs (min length enforced) |
| `JWT_EXPIRES_IN` | backend | Token lifetime, e.g. `7d` |
| `PORT` | backend | Local dev port (default `4000`) |
| `CORS_ORIGIN` | backend | Allowed frontend origin(s) |
| `VITE_API_URL` | frontend | Base URL of the backend |

The backend validates these with a **Joi schema** at startup (see `03`/config). If
`MONGODB_URI` or a sufficiently-long `JWT_SECRET` is missing, the process refuses to
boot with a clear message — far better than a confusing runtime failure later.

## 5. Atlas — the one manual step

The MongoDB Atlas cluster (`teamboard`) is created in the Atlas dashboard: a free M0
cluster, one database user, network access open for development. The SRV connection
string is dropped into `backend/.env` (gitignored). No credential ever enters the repo.

## 6. Verifying the setup

```bash
npm install          # installs all workspaces + builds shared via its prepare script
npm run build        # shared → backend → frontend, all compile clean
```

Green on both commands means the skeleton is sound and every later milestone has a
stable base to build on.
