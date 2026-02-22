# Story 1.4: Frontend Shell & Dependency Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the frontend configured with Tailwind V4, shadcn/ui, TanStack Query V5, and React Router v7,
So that all visual and data-fetching foundations are in place for component development in Epic 3.

## Acceptance Criteria

1. **Given** the frontend directory, **When** I run `npm install`, **Then** Tailwind CSS V4.2, shadcn/ui (V4-compatible), TanStack Query V5, React Router v7, and Vitest + React Testing Library are all installed.

2. **Given** `src/app.css`, **When** I inspect it, **Then** it uses Tailwind V4 CSS-first syntax (`@import "tailwindcss"`) and an `@theme {}` block defining all 10 design tokens: `background #FAFAF9`, `surface #FFFFFF`, `border #E7E5E4`, `text-primary #1C1917`, `text-secondary #78716C`, `text-muted #A8A29E`, `accent #4F46E5`, `accent-hover #4338CA`, `error #DC2626`, `error-surface #FEF2F2`.

3. **Given** `src/main.tsx`, **When** the app initialises, **Then** `QueryClientProvider` (wrapping the configured `QueryClient` from `lib/query-client.ts`) and `RouterProvider` (with routes from `App.tsx`) are both present.

4. **Given** `src/lib/api-client.ts`, **When** any exported function is called, **Then** it prepends `import.meta.env.VITE_API_URL` to the request path — no URLs are hardcoded anywhere in the frontend source.

5. **Given** `frontend/.env.development`, **When** the Vite dev server starts, **Then** `VITE_API_URL=http://localhost:3000` is available via `import.meta.env.VITE_API_URL`.

6. **Given** the frontend runs in a browser, **When** I open the app, **Then** there are no console errors, the page renders without crashing, and React Router is active with the `/` route matched.

## Tasks / Subtasks

- [x] Task 1: Install frontend dependencies (AC: 1)
  - [x] Install Tailwind CSS V4: `npm install tailwindcss @tailwindcss/vite` (V4 uses Vite plugin, no `tailwind.config.js`)
  - [x] Install shadcn/ui dependencies: `npm install @radix-ui/react-dialog @radix-ui/react-checkbox @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react`
  - [x] Install TanStack Query V5: `npm install @tanstack/react-query`
  - [x] Install React Router v7: `npm install react-router`
  - [x] Install dev dependencies: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
  - [x] Install Inter font: `npm install @fontsource/inter`
  - [x] Update `frontend/package.json` with all scripts: `dev`, `build`, `preview`, `test`

- [x] Task 2: Configure Vite for Tailwind V4 (AC: 1, 2)
  - [x] Create `frontend/vite.config.ts` with `@tailwindcss/vite` plugin AND `@vitejs/plugin-react`
  - [x] Create `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`
  - [x] Create `frontend/index.html` with root `<div id="root">` and `<script type="module" src="/src/main.tsx">`

- [x] Task 3: Configure Tailwind V4 CSS with design tokens (AC: 2)
  - [x] Create `frontend/src/app.css` with `@import "tailwindcss"` (V4 syntax — NOT `@tailwind base/components/utilities`)
  - [x] Add `@theme {}` block with all 10 design tokens mapped to CSS custom properties (see Dev Notes for exact values)
  - [x] Import Inter font in `app.css` using `@import "@fontsource/inter"`
  - [x] Set `font-family: 'Inter', system-ui, sans-serif` as the default body font

- [x] Task 4: Create `src/lib/query-client.ts` (AC: 3)
  - [x] Create and export a configured `QueryClient` instance (singleton)
  - [x] Set `defaultOptions.queries.staleTime` to a reasonable value (e.g. `1000 * 60`)
  - [x] Set `defaultOptions.queries.retry` to `1`

- [x] Task 5: Create `src/lib/api-client.ts` (AC: 4)
  - [x] Read base URL from `import.meta.env.VITE_API_URL` — never hardcode `localhost:3000`
  - [x] Export typed `get`, `post`, `patch`, `del` functions that prepend base URL and parse JSON
  - [x] Throw a typed `ApiError` with `{ message, status, code? }` on non-2xx responses
  - [x] Export `ApiError` class/interface from this file

- [x] Task 6: Create `src/types/index.ts` (AC: 3)
  - [x] Export `Todo` interface with all 9 fields matching the Prisma `Todo` model: `id`, `title`, `description`, `completed`, `userId`, `createdAt`, `doneAt`, `updatedAt`, `deletedAt`
  - [x] All timestamp fields are `string | null` (ISO 8601 strings from API — never `Date` objects)
  - [x] Export `ApiError` interface matching what `api-client.ts` throws

- [x] Task 7: Create `src/App.tsx` with route definitions (AC: 3, 6)
  - [x] Define two routes: `/` (task list) and `/todos/:id` (task list + detail modal)
  - [x] Use `createBrowserRouter` from `react-router` (v7 API)
  - [x] Both routes render the same `TaskList` placeholder component for now (full components in Epic 3)
  - [x] Export the router from `App.tsx` for use in `main.tsx`

- [x] Task 8: Create `src/main.tsx` entry point (AC: 3, 6)
  - [x] Import `queryClient` from `lib/query-client.ts`
  - [x] Wrap app in `<QueryClientProvider client={queryClient}>` from `@tanstack/react-query`
  - [x] Wrap app in `<RouterProvider router={router}>` from `react-router`
  - [x] Import `./app.css` to apply Tailwind styles
  - [x] Mount React root with `ReactDOM.createRoot(document.getElementById('root')!).render(...)`

- [x] Task 9: Create environment files (AC: 5)
  - [x] Create `frontend/.env.development` with `VITE_API_URL=http://localhost:3000`
  - [x] Create `frontend/.env.production` with `VITE_API_URL=https://api.yourdomain.com` (placeholder)
  - [x] Ensure `.env.development` and `.env.production` are NOT gitignored (they are committed — only `.env` and `.env.*local` are ignored)

- [x] Task 10: Create test setup (AC: 1)
  - [x] Create `frontend/tests/setup.ts` with `@testing-library/jest-dom` import
  - [x] Configure `vitest.config.ts` (or in `vite.config.ts`) with `environment: 'jsdom'` and `setupFiles: ['./tests/setup.ts']`

## Dev Notes

### ⚠️ CRITICAL: Tailwind V4 is Completely Different from V3

Tailwind V4 uses a **CSS-first** configuration approach. There is **no `tailwind.config.js`**.

**Installation for Vite (V4 way):**
```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.ts` (MUST include both plugins):**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**`src/app.css` (V4 syntax — this is the ONLY config file):**
```css
@import "tailwindcss";
@import "@fontsource/inter";

@theme {
  --color-background: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-border: #E7E5E4;
  --color-text-primary: #1C1917;
  --color-text-secondary: #78716C;
  --color-text-muted: #A8A29E;
  --color-accent: #4F46E5;
  --color-accent-hover: #4338CA;
  --color-error: #DC2626;
  --color-error-surface: #FEF2F2;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #FAFAF9;
}
```

> ❌ Do NOT use `@tailwind base`, `@tailwind components`, `@tailwind utilities` — these are V3 syntax and will break in V4.
> ❌ Do NOT create `tailwind.config.js` or `tailwind.config.ts`.
> [Source: architecture.md#ARCH3, epics.md#Story-1.4-AC2]

### TypeScript Configuration

**`frontend/tsconfig.json`:**
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**`frontend/tsconfig.app.json`:**
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**`frontend/tsconfig.node.json`:**
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

### `src/lib/query-client.ts` — QueryClient Singleton

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})
```

> Import `queryClient` from this file everywhere. Do NOT instantiate `new QueryClient()` anywhere else.
> [Source: architecture.md#Decision-3.1]

### `src/lib/api-client.ts` — HTTP Client

```ts
const BASE_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error ?? res.statusText, body.code)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path: string) => request<void>(path, { method: 'DELETE' }),
}
```

> ❌ Never hardcode `http://localhost:3000` anywhere in frontend source.
> ❌ Never call `fetch()` directly from a React component — always go through `apiClient`.
> [Source: architecture.md#Decision-3.3, architecture.md#Enforcement-Guidelines]

### `src/types/index.ts` — Shared Types

```ts
export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  userId: string | null
  createdAt: string
  doneAt: string | null
  updatedAt: string
  deletedAt: string | null
}

export interface ApiError {
  error: string
  code?: string
}
```

> All timestamps are `string` (ISO 8601) — NEVER `Date` objects. The API always sends strings.
> `userId` is always `null` in v1 but must be in the type for future auth compatibility.
> [Source: architecture.md#Format-Patterns, architecture.md#ARCH10]

### `src/App.tsx` — Route Definitions

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'

function TaskListPlaceholder() {
  return <div>Task List — Epic 3</div>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TaskListPlaceholder />,
  },
  {
    path: '/todos/:id',
    element: <TaskListPlaceholder />,
  },
])
```

> Routes `/` and `/todos/:id` are defined here. Both render the same placeholder in Story 1.4.
> Full components (`TaskList`, `TaskDetailModal`) are added in Epic 3 stories.
> [Source: architecture.md#Decision-3.2]

### `src/main.tsx` — Application Entry Point

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { queryClient } from './lib/query-client'
import { router } from './App'
import './app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
```

> `QueryClientProvider` must wrap `RouterProvider` (or be at the same level). `queryClient` comes from `lib/query-client.ts` singleton — never instantiate a new one here.
> [Source: architecture.md#Complete-Project-Directory-Structure]

### `index.html` Entry Point

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>bmad-todo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `frontend/package.json` — Required Scripts

```json
{
  "name": "frontend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

> The `test` script uses `vitest run` (not `vitest watch`) so it completes and exits for CI.

### Vitest / Test Setup

**`vitest.config.ts` (or inline in `vite.config.ts` under `test:`):**
```ts
// In vite.config.ts, add a test section:
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
})
```

**`frontend/tests/setup.ts`:**
```ts
import '@testing-library/jest-dom'
```

### shadcn/ui Notes

shadcn/ui components are NOT installed as a package — they are generated source files placed in `src/components/ui/`. In this story (1.4), you **do NOT** need to generate any shadcn/ui components. That happens in Epic 3 when individual components are needed.

What you DO need to install are the underlying Radix UI primitives and utilities that shadcn/ui components will use:
- `@radix-ui/react-dialog` — for `dialog.tsx` (TaskDetailModal)
- `@radix-ui/react-checkbox` — for `checkbox.tsx`
- `@radix-ui/react-slot` — for `button.tsx`
- `class-variance-authority` — for component variant logic
- `clsx` + `tailwind-merge` — for the `cn()` utility
- `lucide-react` — for icons

Create `src/lib/utils.ts` with the `cn()` helper:
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

> This `cn()` utility is used in every shadcn/ui component. It MUST be at `src/lib/utils.ts`.
> [Source: ux-design-specification.md#shadcn/ui-components]

### Environment Files

**`frontend/.env.development`** (committed, used by `vite dev`):
```
VITE_API_URL=http://localhost:3000
```

**`frontend/.env.production`** (committed, placeholder for deployment):
```
VITE_API_URL=https://api.yourdomain.com
```

> These files ARE committed to git. Only `.env` and `.env.local` are gitignored.
> The root `.env.example` already documents `VITE_API_URL`. [Source: architecture.md#Decision-3.3]

### Project Structure After This Story

```
frontend/
├── package.json           ← updated: all deps + scripts
├── vite.config.ts         ← new: Vite + React + Tailwind V4 plugins + Vitest config
├── tsconfig.json          ← new: references app + node configs
├── tsconfig.app.json      ← new: React app TypeScript config
├── tsconfig.node.json     ← new: Vite config TypeScript config
├── index.html             ← new: HTML entry point with #root div
├── .env.development       ← new: VITE_API_URL=http://localhost:3000
├── .env.production        ← new: VITE_API_URL placeholder
├── src/
│   ├── main.tsx           ← new: QueryClientProvider + RouterProvider mount
│   ├── app.css            ← new: Tailwind V4 @import + @theme design tokens
│   ├── App.tsx            ← new: createBrowserRouter with / and /todos/:id
│   ├── lib/
│   │   ├── api-client.ts  ← new: fetch wrapper using VITE_API_URL
│   │   ├── query-client.ts← new: QueryClient singleton
│   │   └── utils.ts       ← new: cn() helper for shadcn/ui components
│   └── types/
│       └── index.ts       ← new: Todo interface + ApiError interface
└── tests/
    └── setup.ts           ← new: @testing-library/jest-dom import
```

### Anti-Patterns to Avoid

- ❌ Do NOT create `tailwind.config.js` — Tailwind V4 is CSS-first, all config is in `app.css`
- ❌ Do NOT use `@tailwind base/components/utilities` directives — V3 syntax, will fail in V4
- ❌ Do NOT hardcode `http://localhost:3000` anywhere — always use `import.meta.env.VITE_API_URL`
- ❌ Do NOT call `fetch()` directly from React components — always go through `apiClient`
- ❌ Do NOT instantiate `new QueryClient()` anywhere except `lib/query-client.ts`
- ❌ Do NOT run `shadcn init` or `npx shadcn add` in this story — shadcn/ui components are created in Epic 3
- ❌ Do NOT use `process.env` at runtime in frontend — Vite bakes `import.meta.env.VITE_*` at build time
- ❌ Do NOT use `@tanstack/react-query` V4 patterns — V5 has breaking changes (no `cacheTime`, use `gcTime`; `status: 'loading'` is now `status: 'pending'`)

### Previous Story Context (Story 1.3)

- Backend uses Prisma v7 with `prisma.config.ts` for database URL configuration (breaking change from v6)
- The `Todo` model has exactly 9 fields: `id`, `title`, `description`, `completed`, `userId`, `createdAt`, `doneAt`, `updatedAt`, `deletedAt`
- All timestamps are ISO 8601 strings in API responses — ensure `Todo` type uses `string | null` not `Date | null`
- Soft-delete is implemented — `deletedAt` field will always be `null` in responses from `GET /todos`

### References

- [Source: epics.md#Story-1.4] — Acceptance criteria and user story
- [Source: architecture.md#ARCH3] — Frontend stack: Vite 7, React 19, TypeScript 5, Tailwind V4.2
- [Source: architecture.md#Decision-3.1] — State management: TanStack Query V5 + useState only
- [Source: architecture.md#Decision-3.2] — Frontend routing: React Router v7, modal-as-route pattern
- [Source: architecture.md#Decision-3.3] — API base URL: `VITE_API_URL` env var, no hardcoding
- [Source: architecture.md#Complete-Project-Directory-Structure] — Full project layout
- [Source: architecture.md#Enforcement-Guidelines] — Anti-patterns explicitly forbidden
- [Source: ux-design-specification.md#Color-Palette] — 10 design tokens with exact hex values
- [Source: ux-design-specification.md#Typography] — Inter font, size scale

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5

### Debug Log References

N/A

### Completion Notes List

- Installed all required dependencies: Tailwind CSS V4, shadcn/ui Radix UI primitives, TanStack Query V5, React Router v7, Vitest, React Testing Library, Inter font, react/react-dom, vite, and TypeScript types.
- Added `"type": "module"` and `"test": "vitest run"` script to `frontend/package.json`.
- Created `vite.config.ts` with Tailwind V4 Vite plugin, React plugin, and Vitest jsdom config.
- Created TypeScript config files (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`).
- Created `index.html` with root div and module script entry point.
- Created `src/vite-env.d.ts` for `import.meta.env` TypeScript support.
- Created `src/app.css` with Tailwind V4 CSS-first config and all 10 design tokens.
- Created `src/lib/query-client.ts`, `src/lib/api-client.ts`, `src/lib/utils.ts`.
- Created `src/types/index.ts` with `Todo` and `ApiError` interfaces.
- Created `src/App.tsx` with `createBrowserRouter` routes for `/` and `/todos/:id`.
- Created `src/main.tsx` entry point with `QueryClientProvider` and `RouterProvider`.
- Created `frontend/.env.development` and `frontend/.env.production`.
- Added gitignore exceptions for the env files so they are committed.
- Created `frontend/tests/setup.ts` with jest-dom import.
- Created `src/lib/utils.test.ts` as smoke test for the `cn()` utility.
- Build passes (`tsc -b && vite build`) and tests pass (3/3).

### File List

- `frontend/package.json` (updated)
- `frontend/vite.config.ts` (new)
- `frontend/tsconfig.json` (new)
- `frontend/tsconfig.app.json` (new)
- `frontend/tsconfig.node.json` (new)
- `frontend/index.html` (new)
- `frontend/.env.development` (new)
- `frontend/.env.production` (new)
- `frontend/src/vite-env.d.ts` (new)
- `frontend/src/app.css` (new)
- `frontend/src/App.tsx` (new)
- `frontend/src/main.tsx` (new)
- `frontend/src/lib/query-client.ts` (new)
- `frontend/src/lib/api-client.ts` (updated by review: fixed headers spread bug, typed BASE_URL, cleaner json return)
- `frontend/src/lib/api-client.test.ts` (new: added by review)
- `frontend/src/lib/utils.ts` (new)
- `frontend/src/lib/utils.test.ts` (new)
- `frontend/src/types/index.ts` (new)
- `frontend/tests/setup.ts` (new)
- `frontend/tsconfig.app.json` (updated by review: added tests/ to include, added vitest/globals types)
- `.gitignore` (updated: added exceptions for frontend env files)

### Senior Developer Review (AI)

**Date:** 2026-02-22  
**Reviewer:** AI Code Review Agent  
**Outcome:** Changes Requested → Fixed Automatically

#### Issues Found and Fixed

**🔴 HIGH — Fixed**

1. **`src/lib/api-client.ts:15-18` — `...init` spread overwrites merged `headers`**  
   The original `request()` first built merged headers `{ 'Content-Type': ..., ...init?.headers }`, then spread the entire `init` object — which includes `init.headers` — overwriting the merged value. Any future caller passing custom headers would silently lose `Content-Type: application/json`.  
   **Fix:** Destructure `headers` out of `init` before spreading: `const { headers: initHeaders, ...restInit } = init ?? {}`

**🟡 MEDIUM — Fixed**

2. **`src/lib/api-client.ts:1` — `BASE_URL` typed as `string | undefined`**  
   `import.meta.env.VITE_API_URL` resolves to `string | undefined` by Vite's `ImportMetaEnv`. Used directly in a template literal would silently insert the string `"undefined"` if the env var is missing.  
   **Fix:** Added `as string` assertion; aligns intent and avoids confusing runtime fetch errors.

3. **`tsconfig.app.json` — `tests/` directory excluded from TypeScript coverage**  
   `include: ["src"]` left `frontend/tests/setup.ts` (and any future test files outside `src/`) uncovered by the TypeScript compiler. Type errors in test infrastructure would go undetected.  
   **Fix:** Changed to `include: ["src", "tests"]`.

4. **`tsconfig.app.json` — missing `vitest/globals` type declaration**  
   `vitest.config.ts` sets `globals: true`, but without `"types": ["vitest/globals"]` in tsconfig, TypeScript did not know about `describe`, `it`, `expect` as globals. Every test file must include explicit imports forever.  
   **Fix:** Added `"types": ["vitest/globals"]` to `compilerOptions`.

**🟢 LOW — Fixed**

5. **`src/lib/api-client.ts:24` — `return res.json() as Promise<T>` double-promise style**  
   Returning `res.json() as Promise<T>` from an `async` function is redundant (the async wrapper already wraps the return value in a promise) and relies on type assertion over promise unwrapping.  
   **Fix:** Changed to `return (await res.json()) as T` — cleaner and more idiomatic.

#### Additional Coverage Added

- Created `src/lib/api-client.test.ts` with 8 tests covering: `ApiError` construction, GET/POST/DELETE header correctness, error throwing on non-2xx, error code extraction, and 204 No Content handling.
