# 05 — Frontend: Scaffold & Design System

> **Milestone M5.** The React app's skeleton — routing, data layer, and the
> "Ink & Patina" design system that every screen is built from.

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite + React 18 + TypeScript | Fast HMR, type-safety, tiny config |
| Routing | react-router-dom v6 | Nested routes + a clean guard pattern |
| Server state | TanStack Query | Cache, refetch, loading/error for free (ADR) |
| Session state | React Context | Small, synchronous — a store would be overkill |
| Forms | react-hook-form + zod | Uncontrolled inputs + schema validation |
| Styling | Tailwind v3 + tokens | Brand tokens in one config; utility velocity |
| Motion | Framer Motion | Scroll reveals + layout animation on the board |
| Icons | Phosphor | Precise, light-weight — not the banned thick defaults |

## 2. Folder structure (feature-first)

```
src/
├── main.tsx            providers: QueryClient → Router → Auth
├── App.tsx             the route table + grain overlay
├── styles/index.css    Tailwind layers + editorial base
├── lib/                cn(), queryClient, date formatting
├── services/api.ts     axios instance + token + 401 handling
├── components/
│   ├── brand/          Logo, IconMark (from brand_identity/)
│   ├── layout/         AppShell, TopBar, GrainOverlay
│   ├── ui/             Button, Field, Dialog, StatusBadge, States…
│   └── ProtectedRoute.tsx
├── features/
│   ├── auth/           context, layout, login + signup pages
│   ├── projects/       api + hooks + pages + components
│   └── tasks/          api + hooks + board components
└── pages/              LandingPage, NotFoundPage
```

Each **feature owns its API calls, its React Query hooks, and its screens**. Shared,
brand-agnostic building blocks live in `components/ui`. This mirrors the backend's
module-per-feature layout — the same mental model on both sides.

## 3. Routing map

```
/                       LandingPage        (public)
/login, /signup         auth pages         (public, redirect out if signed in)
/projects               ProjectsPage       ┐ ProtectedRoute → AppShell
/projects/:projectId    ProjectDetailPage  ┘ (require valid JWT)
*                       NotFoundPage
```

`ProtectedRoute` renders a loader while the session resolves, redirects to `/login`
if unauthenticated, else renders the app inside `AppShell` (top bar + content column).

## 4. Why React Query

Projects and tasks are **server state**, not UI state. React Query gives us caching,
background refetching, and consistent `isLoading`/`isError` flags without hand-rolled
`useEffect` chains. A **query-key factory** (`projectKeys`, `taskKeys`) keeps cache
invalidation in one place: create a task → invalidate that project's task list *and*
the projects list (so `taskCount` updates).

## 5. The design system in code

The brand lives in **`tailwind.config.ts`** — colours (Ink, Slate, Verdigris, Brass,
Fog, Bone), fonts (Fraunces / Geist / IBM Plex Mono), soft shadows, the `card`/`control`
radii, and the `fade-up` / `drift` keyframes. `styles/index.css` sets the warm base,
the `.eyebrow` / `.surface` primitives, thin scrollbars, and honours
`prefers-reduced-motion`. Because the tokens are defined once, the whole UI stays
consistent and re-themable.

**Reusable primitives** (`components/ui`): `Button` (variants + optional pill + loading),
`Field`/`Input`/`TextArea`/`Select`, `Dialog` (animated modal), `StatusBadge` (the exact
brand status colours), `Reveal` (scroll fade-up), and `States` (loader / empty / error).

## 6. One monorepo detail worth noting

`@teamboard/shared` compiles to CommonJS for the Node backend, but Vite/Rollup bundles
the browser app as ESM. To avoid a CJS↔ESM named-export snag, **Vite aliases
`@teamboard/shared` to the package's TypeScript source** (`../shared/src/index.ts`)
while TypeScript still type-checks against its built `.d.ts`. One contract, two clean
consumption paths.
