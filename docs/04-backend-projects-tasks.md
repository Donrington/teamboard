# 04 — Backend: Projects & Tasks

> **Milestone M4.** Full CRUD for projects and their tasks, every operation scoped to
> the authenticated user. This is the brief's "thin controllers, fat services" and
> "could evolve into microservices" made concrete.

---

## 1. Endpoints (all require a Bearer token)

| Method | Path | Action |
|---|---|---|
| `GET` | `/api/projects` | List my projects (each with `taskCount`) |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get one of my projects |
| `PATCH` | `/api/projects/:id` | Update title/description |
| `DELETE` | `/api/projects/:id` | Delete project **+ cascade its tasks** |
| `GET` | `/api/projects/:projectId/tasks` | List tasks in a project |
| `POST` | `/api/projects/:projectId/tasks` | Add a task |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId` | Update task / move status |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | Delete a task |

## 2. Ownership is enforced in the service, not the URL

Tasks live under `/projects/:projectId/tasks`, but the nesting is not what protects
them — the service is. Every project method filters by `owner`, and every task method
first calls the **one shared ownership gate**:

```ts
// ProjectsService — the gate
async findOneForOwner(ownerId, projectId) {
  const project = await this.projectModel.findOne({ _id: projectId, owner: ownerId });
  if (!project) throw new NotFoundException('Project not found.'); // 404, not 403
  return project;
}

// TasksService — reuses it before every read/write
await this.projectsService.findOneForOwner(ownerId, projectId);
```

`userId` always comes from the verified JWT (`@CurrentUser('id')`), never from the
request body — so a client cannot act as, or reach the data of, another user. Missing
*or* not-yours both return **404**, so we never confirm that an id exists for someone
else.

## 3. Module boundaries (the microservices story)

```
TasksModule ──imports──> ProjectsModule ──exports──> ProjectsService
```

One-directional. `TasksService` depends on `ProjectsService` through its **public
method**, not its internals — exactly the seam you would replace with a REST/gRPC/queue
call when splitting into services. `ProjectsService` touches the tasks *collection*
directly only for two data-layer concerns (delete-cascade, count aggregation); it never
imports `TasksModule`, so there is no circular dependency.

## 4. Details that show craft

- **Thin controllers (ADR-005):** controllers only wire HTTP ↔ DTO ↔ service. No `if`
  statements, no queries — all logic is in the services.
- **DTOs + validation on every write:** `Create*`/`Update*` DTOs with `class-validator`,
  `implement`ing the shared payload types. The global `ValidationPipe`
  (`whitelist + forbidNonWhitelisted`) strips/rejects anything unexpected.
- **`ParseObjectIdPipe`** rejects malformed ids with a clean `400` before they reach a
  query.
- **`taskCount` via one aggregation** (`$match` + `$group`) instead of N per-project
  queries — the referenced-document trade-off (docs/02) bought back cheaply.
- **Cascade delete** removes a project's tasks when the project goes, with a comment
  marking where a `ProjectDeleted` event would live post-split.
- **Correct status codes:** `201` create, `204` delete, `404` not-found, `409`
  duplicate — shaped consistently by the global exception filter.
