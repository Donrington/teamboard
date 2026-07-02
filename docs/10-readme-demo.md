# 10 — README & Client Demo Script

> **Milestone M10.** The final hand-off. The `README.md` at the repo root is the
> written deliverable (setup, architecture, trade-offs — exactly what the brief asks
> for). This file is the **spoken** companion: a tight ~5-minute walkthrough that reads
> back what the whole `/docs` folder documents.

---

## The 5-minute walkthrough

### 0. Framing (20s)
> "TeamBoard is a small full-stack app — React, NestJS, MongoDB. The brief said the
> focus is technical decisions and system design over feature count, so I built it as a
> modular monolith with clean microservice seams and documented every decision as I went.
> Let me show it, then show why it's built this way."

### 1. The product (90s)
1. **Landing page** (`/`) — note the editorial "Ink & Patina" design pulled straight from
   the brand kit: warm canvas, Fraunces headline, colour used only for meaning.
2. **Sign up** — an account is created; a JWT comes back and the session persists on
   refresh (validated against `/auth/me`).
3. **Create a project** — "Website Relaunch". It appears with a live task count of 0.
4. **Open it, add two or three tasks.** They land in **To Do**.
5. **Move a task** across the board — it jumps columns instantly (optimistic update) and
   glides into place (layout animation). The project's task count stays in sync.
6. **Edit and delete** a task and the project to show full CRUD.

### 2. It's real data (30s)
Open the **MongoDB Atlas** dashboard → the `teamboard` database → `users`, `projects`,
`tasks` collections. Point out that `projects` store an `owner` **reference** and `tasks`
store a `project` reference — not embedded blobs.

### 3. Why it's built this way (120s) — the part that's actually graded
- **Ownership is enforced server-side.** Every project/task query is scoped to the JWT's
  user; a second account gets a `404` for someone else's project (I can show this in
  Postman). The token proves identity; guards + service checks decide authority.
- **Thin controllers, fat services.** Open `tasks.controller.ts` (just wiring) next to
  `tasks.service.ts` (all the logic + the ownership gate). *That* seam is what a
  microservice split would follow — swap an in-process call for a network one behind the
  same interface.
- **Referenced documents + one shared contract.** `@teamboard/shared` defines the types
  the backend DTOs and the frontend both use — a contract change is a compile error on
  both ends.
- **Boot-time config validation, bcrypt hashing, DTO validation everywhere.** Fail fast,
  never store plaintext, reject bad input at the edge.

### 4. Close (20s)
Show the architecture diagram in [`docs/00`](./00-architecture.md).
> "One deployable today, clean seams for tomorrow. Frontend and backend both deploy to
> Vercel from a git push; Atlas is the managed store. Everything you just saw is written
> up in the ten docs in `/docs`, in reading order."

---

## Pre-demo checklist
- [ ] `backend/.env` and `frontend/.env` filled in
- [ ] `npm run dev:backend` and `npm run dev:frontend` both up
- [ ] A throwaway account ready (or sign up live)
- [ ] Atlas dashboard open in a tab
- [ ] Postman collection imported, `{{baseUrl}}` set — for the ownership `404` moment
- [ ] `README.md` open as the leave-behind
