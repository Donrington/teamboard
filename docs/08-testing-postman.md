# 08 — Testing & Postman

> **Milestone M8.** A focused set of unit tests on the backend services, plus a
> ready-to-run Postman collection for manual/API testing. The brief lists both as
> bonus credit.

---

## 1. Unit tests (Jest)

Location: `backend/test/`. Run with:

```bash
npm run test:backend        # or: cd backend && npm test
```

Both suites mock their dependencies — **no database, no network** — so they run in a
couple of seconds and test *logic*, not infrastructure.

### `auth.service.spec.ts`
- Signup **hashes** the password (asserts the stored value is a valid bcrypt hash of the
  input, not the plaintext) and returns a token **without** `passwordHash`.
- A duplicate email throws `ConflictException` (409) and never calls `create`.
- Login returns a token for valid credentials.
- Login throws `UnauthorizedException` (401) for a wrong password **and** for an unknown
  email — proving the "don't reveal which accounts exist" behaviour.

### `tasks.service.spec.ts`
- Create **checks project ownership first** (`projectsService.findOneForOwner`) and
  defaults `status` to `todo`.
- If the caller doesn't own the project, create throws and **no task is written**.
- Updating a task that isn't in the project throws `NotFoundException` (404).

These few tests deliberately target the two highest-risk behaviours — credential
handling and ownership enforcement — where a bug would be a security issue, not a
cosmetic one.

```
Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

> There is also a full end-to-end script used during the build
> (`health → signup → login → guard → validation → CRUD → ownership → cleanup`) run
> against a live Atlas connection; it exercises the real HTTP layer that unit tests mock.

## 2. Postman collection

Location: `backend/postman/TeamBoard.postman_collection.json`. Import it into Postman and
run the requests top-to-bottom:

| Folder | Requests |
|---|---|
| Health | `GET /health` |
| Auth | Signup, Login, Me |
| Projects | Create, List, Get, Update, Delete |
| Tasks | Create, List, Update (move status), Delete |

**It chains itself** via collection variables and small test scripts:
- Signup/Login save the JWT into `{{accessToken}}` (used by the collection's bearer auth),
- Create Project saves `{{projectId}}`,
- Create Task saves `{{taskId}}`,

so every later request is pre-wired. Point `{{baseUrl}}` at `http://localhost:4000/api`
for local, or the deployed URL for production. You can also run the whole thing headless
with the Postman CLI / Newman.
