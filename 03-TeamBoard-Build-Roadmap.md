# TeamBoard — Build Roadmap & Client Documentation Plan
**Client:** Heunets | **Assessment:** Full Stack Code Assessment (React + NestJS + MongoDB)
**Builder:** CyberSage (Abakwe Carrington) | **Build tool:** Claude Code (VS Code)

---

## 1. What Heunets Is Actually Testing

Read past the feature list — the brief says it outright:

> "The focus is on your technical decisions, code organization, and system design thinking, not just on the number of features completed."

So the deliverable isn't "does CRUD work." It's:
- Can you justify your architecture? (README "reasoning" section is graded)
- Is the code modular enough to split into microservices later? (explicitly asked)
- Did you use DTOs, validation, env config, separation of concerns? (explicitly asked)
- Bonus points for Docker, message queues, shared TS types, tests, real deployment.

That reframes everything below: every milestone produces not just code, but a short **decision log** you can read straight to the client.

---

## 2. Architecture Decision: What We're Actually Building

| Layer | Spec says | We're using | Why |
|---|---|---|---|
| Frontend | React | React + Vite + TypeScript | Vite = fast builds, TS = type safety, matches "TypeScript optional" upgraded to "TypeScript used" |
| Backend | NestJS | NestJS + TypeScript | As specified |
| Database | MongoDB | **MongoDB Atlas (via Mongoose)** | Literal to the brief — see below |
| Auth | JWT (your own) | NestJS-built JWT (Passport + bcrypt) | Assessment wants to see *you* build auth |
| Backend hosting | Not specified | Vercel Serverless Functions | One platform for both deploys, MCP-supported, zero infra ops |
| Frontend hosting | Not specified | Vercel | As requested |

### Why MongoDB Atlas (the README talking point)
The brief names MongoDB explicitly — no reason to spend your "complete freedom over architecture" credit arguing with the one piece of stack they specified. Atlas is the managed, official MongoDB service:
- Free forever M0 tier, no card required
- Native fit for Mongoose — no ORM translation layer, schemas map straight to documents
- A dashboard the client can watch live during the demo, same as any managed DB would offer
- Zero deviation to justify — the README section on "design decisions and trade-offs" can spend its words on things that actually matter (module boundaries, DTO validation, auth design) instead of defending a database swap

One real trade-off worth naming honestly in the README: `User → Project → Task` is relational data living in a document store. That's fine at this scale — model `Project` and `Task` as separate collections with `ObjectId` references (not embedded documents) so each can be queried, paginated, and eventually split into its own microservice cleanly. Embedding would be tempting for speed but would work against the "could evolve into microservices" requirement.

### Why your own JWT
Build the AuthModule yourself: bcrypt password hashing, Passport JWT strategy, guards on protected routes, all against your own `User` collection. This is literally the thing being evaluated — no shortcuts here regardless of which DB sits underneath.

### Why Vercel for the backend
Wrapping a Nest app with `@vendia/serverless-express` lets the whole NestJS app run as one Vercel Function. Frontend and backend both deploy from `git push`, both on the same dashboard. This choice is independent of the database decision — Atlas and Vercel don't need to be the same vendor to work well together, you're just connecting to Atlas over its standard SRV connection string from inside the serverless function.

**Alternative path** (mention in README as "Path B"): if you ever need a long-running Node process (websockets, queues, cron) instead of serverless, swap Vercel-for-backend with Railway or Render — same NestJS code, different `Procfile`/deploy target. Worth one paragraph in the README to show you understand the trade-off (cold starts vs. always-on).

---

## 3. Repo Structure

```
teamboard/
├── backend/
│   ├── src/
│   │   ├── auth/            # AuthModule: controller, service, JWT strategy, guards
│   │   ├── users/           # UserModule: model + service (used by auth)
│   │   ├── projects/        # ProjectModule: controller, service, DTOs
│   │   ├── tasks/           # TaskModule: controller, service, DTOs
│   │   ├── schemas/         # Mongoose schemas: User, Project, Task
│   │   ├── common/          # shared guards, decorators, filters, pipes
│   │   ├── config/          # env validation (Joi/Zod), config module
│   │   └── main.ts
│   ├── test/                # unit + e2e tests
│   ├── .env.example
│   └── vercel.json          # serverless function config
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/        # login, signup pages + hooks
│   │   │   ├── projects/    # project list/detail
│   │   │   └── tasks/       # task CRUD UI
│   │   ├── components/      # shared UI (buttons, layout, protected route)
│   │   ├── services/        # axios instance, API calls
│   │   ├── lib/              # react-query client, types
│   │   └── App.tsx
│   ├── .env.example
│   └── vercel.json
├── shared/                  # optional: TS interfaces shared FE/BE (bonus point)
├── docs/                    # ← every milestone doc lands here
│   ├── 00-architecture.md
│   ├── 01-repo-setup.md
│   ├── ... one file per milestone
└── README.md                 # the one the client actually reads first
```

This structure alone answers two of the assessment's grading criteria before you write a line of business logic: "modular structure that could evolve into microservices" and "organized folder structure."

---

## 4. Milestone-by-Milestone Plan

Each milestone below = one Claude Code session = one doc file in `/docs`. That doc file is literally your client presentation script — write it as you go, not after.

### M0 — Plan & Architecture (you are here)
**Produces:** `docs/00-architecture.md` (expand the table in section 2), the two diagrams already generated.
**Concept to internalize:** Architecture Decision Records (ADRs) — a short "we chose X over Y because Z" doc per major decision. Clients respond well to seeing this; it signals seniority.

### M1 — Repo + Environment Setup
**Goal:** Monorepo scaffolded, Atlas cluster created, GitHub repo live, env vars defined (not committed).
**Claude Code brief:**
```
Initialize a monorepo with /backend (NestJS, TypeScript, strict mode) and /frontend
(Vite + React + TypeScript). Set up .env.example in both with placeholders for
MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT (backend) and VITE_API_URL (frontend).
Initialize git, create .gitignore covering node_modules, .env, dist/build.
```
**You do manually:** create a free M0 cluster on MongoDB Atlas, add a database user, whitelist `0.0.0.0/0` for now (tighten before production if needed), copy the SRV connection string into `.env`.
**Concept:** 12-factor config — secrets never in code, always in env vars validated at boot.

### M2 — Database Schema (Mongoose + Atlas)
**Goal:** `User`, `Project`, `Task` schemas defined and connected to Atlas.
**Claude Code brief:**
```
Add @nestjs/mongoose + mongoose to /backend. Define schemas: User (email, unique,
passwordHash, name, timestamps), Project (title, description, owner: ObjectId ref
User, timestamps), Task (title, description, status enum [todo, in-progress, done],
project: ObjectId ref Project, timestamps). Register MongooseModule.forRoot with
MONGODB_URI from config. Use ObjectId references, not embedded documents, so
Project and Task stay independently queryable.
```
**Concept:** referenced vs. embedded documents — this is the one MongoDB-specific design call worth a paragraph in the README, since it's exactly the "could evolve into microservices" line item made concrete: independently queryable collections split cleanly into separate services later, embedded ones don't.

### M3 — Backend Auth Module
**Goal:** `/auth/signup`, `/auth/login` working, JWT issued, password hashed.
**Claude Code brief:**
```
Build AuthModule in NestJS: signup (hash password with bcrypt, create User via
the Mongoose UserModel), login (verify password, issue JWT via @nestjs/jwt),
JwtStrategy with Passport for protected routes, a JwtAuthGuard. Use DTOs with
class-validator for signup/login payloads (email format, password min length).
```
**Concept:** never store plaintext passwords; JWT carries identity, not authority — guards decide authority.

### M4 — Project & Task Modules
**Goal:** Full CRUD for both, scoped to the logged-in user.
**Claude Code brief:**
```
Build ProjectModule and TaskModule. Projects: create/list/get/delete, owned by
the authenticated user (use JwtAuthGuard + a custom decorator to extract userId
from the token). Tasks: create/update/delete/fetch, scoped to a project, with a
status field (todo/in-progress/done). DTOs + validation on every write endpoint.
Controllers stay thin — business logic lives in services.
```
**Concept:** thin controllers, fat services — this is the "separation of business logic and controllers" line item from the brief, said out loud.

### M5 — Frontend Scaffold
**Goal:** Routing, folder structure, API service layer, React Query wired up.
**Claude Code brief:**
```
Scaffold /frontend with react-router for routes (/login, /signup, /projects,
/projects/:id), a features/ folder per the structure above, an axios instance
in services/api.ts that attaches the JWT from storage, and React Query's
QueryClientProvider at the root.
```
**Concept:** why React Query over plain useState/useEffect — caching, refetch-on-focus, loading/error states for free.

### M6 — Frontend Auth Flow
**Goal:** Login/signup forms, token storage, protected route wrapper.
**Claude Code brief:**
```
Build login and signup pages with form validation, store JWT on success
(httpOnly cookie if backend supports it, else localStorage with a clear note
on the trade-off), build a ProtectedRoute component that redirects to /login
if no valid token.
```
**Concept:** localStorage vs. httpOnly cookies for tokens — XSS exposure trade-off, worth one honest sentence in the README under "known limitations."

### M7 — Project/Task UI
**Goal:** List/create/edit/delete projects and tasks, using the React Query mutations.
**Claude Code brief:**
```
Build the projects list page, project detail page showing its tasks, and
create/edit/delete flows for both using React Query mutations with optimistic
updates or simple refetch-on-success. Keep styling minimal and functional —
the brief explicitly says clean over decorative.
```
**Concept:** optimistic UI updates — nice bonus polish, not required, mention if time allows.

### M8 — Testing + Postman
**Goal:** A handful of unit tests on the backend services, a Postman collection for manual API testing.
**Claude Code brief:**
```
Add Jest unit tests for AuthService (signup/login happy path + duplicate email
case) and TaskService (create/update). Export a Postman collection covering
auth, projects, and tasks endpoints with example payloads.
```
**Concept:** even 3-4 meaningful tests demonstrate testing discipline — the brief lists this as bonus credit explicitly.

### M9 — Deployment
**Goal:** Both apps live on Vercel, Atlas cluster in production mode, env vars set in Vercel dashboard (not committed).
**Steps:**
1. Push repo to GitHub (`git remote add origin ...`, `git push`).
2. Connect `/frontend` as one Vercel project — auto-detects Vite.
3. Connect `/backend` as a second Vercel project, with `vercel.json` routing all requests to the Nest serverless handler.
4. Set environment variables in both Vercel projects' dashboard (`MONGODB_URI`, `JWT_SECRET`, `VITE_API_URL` pointing at the backend's deployed URL).
5. In the Mongoose connection setup, cache the connection across function invocations (check `mongoose.connections[0].readyState` before calling `connect()` again) — without this, every cold start opens a fresh connection and you'll hit Atlas's connection limit fast under serverless traffic.
**Concept:** why serverless + any database needs connection reuse, not just pooling — this single detail, explained well, makes you sound senior in the client walkthrough.

### M10 — Documentation + Client Demo Script
**Goal:** Final `README.md` (setup instructions, architecture overview, design trade-offs — exactly what the brief asks for), plus a 5-minute demo script: sign up → create project → add tasks → show the Atlas dashboard live → show the Vercel deploy log → close with the architecture diagram.
**This is the moment the whole `/docs` folder pays off** — you're not writing this from memory under pressure, you're reading back what you documented as you built.

---

## 5. What Runs Where: MCP/Skills vs. Claude Code

Quick scan of what's actually useful on this project, since you asked:

| Tool | Use it for | Use it here (claude.ai) or in Claude Code? |
|---|---|---|
| **Vercel MCP** | Deploying, checking build logs, env var management | Claude Code, once repo exists |
| **MongoDB Atlas** | Cluster creation, user/network access, monitoring | No MCP connector in your list — manage via the Atlas web dashboard or `mongosh` CLI from Claude Code's bash access |
| **GitHub (via git/gh CLI)** | Repo creation, push, PRs | Claude Code has bash access — plain git/gh CLI, no dedicated GitHub MCP connector in your list |
| **AppDeploy** | An alternative all-in-one host (its own platform) | Skip — you've already chosen Vercel explicitly |
| **21st Dev Magic** | Component inspiration/generation for polish | Optional, low priority — brief says function over form |
| Canva / Adobe / Higgsfield / Spotify / Brevo / Dice / Indeed / Semrush / HyperFrames / Zapier | Not relevant to this build | Skip entirely |

Bottom line: in Claude Code, you'll mostly be writing code directly, reaching for the Vercel MCP (or CLI) for deploys, and managing Atlas by hand in its dashboard since there's no MCP connector for it. Nothing else in your connector list touches this project.

---

## 6. Files to Hand to Claude Code

Take these into your VS Code session, alongside your existing `CLAUDE.md`:
1. `01-TeamBoard-Architecture.mermaid` — paste into `docs/00-architecture.md` or keep as-is, render it in any Markdown previewer with Mermaid support.
2. `02-TeamBoard-Milestone-Flow.mermaid` — same, gives Claude Code (and you) the sequence to follow.
3. This roadmap — feed it section by section as you open each milestone's session, or paste the whole thing once and tell Claude Code: "We're starting Milestone 1, follow the brief in section 4."

Suggested instruction to open each Claude Code session with:
```
We're building TeamBoard per the attached roadmap. We're on Milestone N.
Before writing code, summarize what you're about to build and why in 4-5
sentences — that becomes docs/0N-<milestone-name>.md. Then implement it.
```
That single instruction is what turns this from "a build" into "a build with a paper trail," which is the entire point of presenting it to the client afterward.
