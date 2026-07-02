# 07 — Frontend: Projects & Tasks UI

> **Milestone M7.** The working surface — a projects workspace and a status board —
> rendered in the editorial design language, wired to the API through React Query.

---

## 1. Screens

**`ProjectsPage`** — a bento grid of `ProjectCard`s. Each card shows the project title
(Fraunces), an optional description, its live task count, and last-updated time; it
links to the board and reveals edit/delete on hover. Loading shows skeletons; empty
shows a proper `EmptyState` with a call to action; errors show an `ErrorState`.

**`ProjectDetailPage`** — the project header (title, description, meta) with Edit /
Delete / Add-task actions, above a three-column `TaskBoard`.

## 2. The board

`TaskBoard` groups tasks into **To Do / In Progress / Done** columns (iterating the
shared `TASK_STATUSES`). Every `TaskCard` carries a small segmented control:

```
[ To Do ][ Doing ][ Done ]
```

Clicking a segment moves the task. Two touches make this feel good:

- **Optimistic updates** (`useUpdateTask.onMutate`): the card's status changes in the
  cache immediately, so it jumps columns with zero perceived latency; on error it rolls
  back to the previous list.
- **Shared layout animation** (Framer Motion `layout` + `AnimatePresence`): the card
  physically glides from its old column to the new one instead of blinking.

## 3. Data flow (React Query)

```
useProjects()        GET  /projects                     → cache key ['projects']
useProject(id)       GET  /projects/:id                 → ['projects', id]
useTasks(id)         GET  /projects/:id/tasks           → ['tasks', id]
useCreate/Update/DeleteProject   POST/PATCH/DELETE      → invalidate ['projects']
useCreate/Update/DeleteTask      POST/PATCH/DELETE      → invalidate ['tasks', id] + ['projects']
```

Mutations invalidate the right keys so the UI is always consistent — e.g. adding a task
refreshes both the board *and* the projects list's `taskCount`. Query keys live in one
factory per feature, so there's no stringly-typed cache drift.

## 4. Reused primitives

Create/edit flows (`ProjectFormDialog`, `TaskFormDialog`) are the same `Dialog` +
`Field` + `react-hook-form` + `zod` pattern as auth — one dialog handles both create and
edit, deciding by whether an entity was passed in. Destructive actions route through a
shared `ConfirmDialog`. `StatusBadge` renders the exact brand status colours everywhere
a status appears.

## 5. Design language applied

- **Macro-whitespace:** generous section padding, a capped content column, headings in
  Fraunces with tight tracking.
- **Colour as meaning:** the canvas stays warm-neutral (Fog/Bone); Verdigris/Brass/Slate
  appear only as status and accent.
- **Quiet motion:** cards fade-up on entry via `Reveal`; hovers lift by a hair; nothing
  animates a layout-triggering property.
- **No banned defaults:** Phosphor icons, no Inter/Roboto, no heavy drop shadows, no
  gradient-as-decoration.
