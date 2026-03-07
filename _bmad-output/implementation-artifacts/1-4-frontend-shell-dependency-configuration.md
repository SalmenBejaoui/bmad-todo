# Story 1.4: Frontend Shell & Dependency Configuration

Status: done

## Story

As a developer,
I want the frontend configured with Tailwind V4, shadcn/ui, TanStack Query V5, and React Router v7,
so that all visual and data-fetching foundations are in place for component development in Epic 3.

## Acceptance Criteria

1. **Given** the frontend directory, **when** I run `npm install`, **then** Tailwind CSS V4.2, shadcn/ui (V4-compatible), TanStack Query V5, React Router v7, and Vitest + React Testing Library are all installed.
2. **Given** `src/app.css`, **when** I inspect it, **then** it uses Tailwind V4 CSS-first syntax (`@import "tailwindcss"`) and an `@theme {}` block defining the 10 design tokens: `background #FAFAF9`, `surface #FFFFFF`, `border #E7E5E4`, `text-primary #1C1917`, `text-secondary #78716C`, `text-muted #A8A29E`, `accent #4F46E5`, `accent-hover #4338CA`, `error #DC2626`, `error-surface #FEF2F2`.
3. **Given** `src/main.tsx`, **when** the app initialises, **then** `QueryClientProvider` (wrapping the configured `QueryClient` from `lib/query-client.ts`) and `RouterProvider` (with routes from `App.tsx`) are both present.
4. **Given** `src/lib/api-client.ts`, **when** any exported function is called, **then** it prepends `import.meta.env.VITE_API_URL` to the request path — no URLs are hardcoded anywhere in the frontend source.
5. **Given** `frontend/.env.development`, **when** the Vite dev server starts, **then** `VITE_API_URL=http://localhost:3000` is available via `import.meta.env.VITE_API_URL`.
6. **Given** the frontend runs in a browser, **when** I open the app, **then** there are no console errors, the page renders without crashing, and React Router is active with the `/` route matched.

## Tasks / Subtasks

- [x] Task 1: Install production dependencies (AC: 1)
  - [x] 1.1: `@tanstack/react-query@^5` — server state management
  - [x] 1.2: `react-router@^7` — React Router v7 (note: v7 uses `react-router`, not `react-router-dom`)
  - [x] 1.3: `@fontsource/inter` — Inter font for offline reliability

- [x] Task 2: Install and configure Tailwind CSS V4.2 (AC: 1, 2)
  - [x] 2.1: Install `tailwindcss@^4.2` and `@tailwindcss/vite@^4.2` as devDependencies
  - [x] 2.2: Update `vite.config.ts` to add `@tailwindcss/vite` plugin
  - [x] 2.3: Replace `src/index.css` content: `@import "tailwindcss"` as first line
  - [x] 2.4: Replace `src/App.css` with `@theme {}` block containing 10 design tokens (UX10)
  - [x] 2.5: Ensure `main.tsx` imports `./index.css` and `./app.css` (or combined in one file)

- [x] Task 3: Initialize shadcn/ui (AC: 1)
  - [x] 3.1: Install `@shadcn/ui` base dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
  - [x] 3.2: Create `src/lib/utils.ts` with `cn()` helper using `clsx` + `tailwind-merge`
  - [x] 3.3: Add `components.json` at `frontend/` root for shadcn/ui config (Tailwind V4 style)
  - [x] 3.4: Install `@radix-ui/react-dialog` and `@radix-ui/react-checkbox` for Epic 3 components
  - [x] 3.5: Install `sonner` for toast notifications (Sonner undo-toast in Epic 3)

- [x] Task 4: Configure TanStack Query V5 (AC: 1, 3)
  - [x] 4.1: Create `src/lib/query-client.ts` exporting a configured `QueryClient` instance
  - [x] 4.2: Configure `staleTime: 1000 * 60` (1 min) and `gcTime: 1000 * 60 * 5` (5 min) defaults

- [x] Task 5: Configure React Router v7 (AC: 3, 6)
  - [x] 5.1: Create `src/routes.tsx` with `createBrowserRouter()` defining `/` route (renders minimal `<App />` placeholder)
  - [x] 5.2: Update `src/main.tsx`: wrap with `<QueryClientProvider client={queryClient}>` and `<RouterProvider router={router} />`
  - [x] 5.3: `src/App.tsx` becomes the content component for the `/` route (strips Vite boilerplate)
  - [x] 5.4: Confirm React Router v7 uses `react-router` package (not `react-router-dom`)

- [x] Task 6: Create `src/lib/api-client.ts` (AC: 4)
  - [x] 6.1: Export `apiClient` object with typed `get<T>()`, `post<T>()`, `patch<T>()`, `delete<T>()` methods
  - [x] 6.2: All methods prepend `import.meta.env.VITE_API_URL` to the path
  - [x] 6.3: Throw typed errors with `{ error: string, code?: string }` shape for non-2xx responses
  - [x] 6.4: No hardcoded URLs anywhere in the file

- [x] Task 7: Create `frontend/.env.development` (AC: 5)
  - [x] 7.1: `VITE_API_URL=http://localhost:3000` in `frontend/.env.development`

- [x] Task 8: Configure Vitest + React Testing Library (AC: 1)
  - [x] 8.1: Install `vitest@^4`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react@^16`, `@testing-library/user-event@^14`, `@testing-library/jest-dom@^6`
  - [x] 8.2: Create / update `vite.config.ts` to include vitest `test` config (environment: `jsdom`, globals: true)
  - [x] 8.3: Create `src/test/setup.ts` importing `@testing-library/jest-dom`
  - [x] 8.4: Add `"test": "vitest run"` script to `frontend/package.json`

- [x] Task 9: Update root `package.json` test script (AC: 1)
  - [x] 9.1: Update root `"test"` script to run both backend AND frontend: `"npm -w backend test && npm -w frontend test"`

- [x] Task 10: Verify the app renders without errors (AC: 6)
  - [x] 10.1: `npm run dev` in frontend starts without build errors
  - [x] 10.2: App renders at `http://localhost:5173` with no console errors
  - [x] 10.3: `npm test` in frontend passes (at minimum, the vitest framework test)

- [x] Task 11: Write a smoke test (AC: 1)
  - [x] 11.1: Create `src/App.test.tsx` with a minimal render test confirming the app renders without crashing

## Dev Notes

### Critical Architecture Constraints

**Tailwind V4 is CSS-first — NO `tailwind.config.js`** [Source: architecture.md#ARCH4]
```css
/* src/index.css — entry point that loads Tailwind */
@import "tailwindcss";

/* src/app.css — design token customisation */
@import "tailwindcss";

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
```

**shadcn/ui V4-compatible init path** [Source: architecture.md#ARCH4]
- Replace `cn()` implementation: `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'`
- `components.json` MUST specify `"style": "default"` and `"tailwind": { "version": 4 }` (no `tailwind.config.js`)
- V4 shadcn CLI init: `npx shadcn@latest init` — choose the "Default" style with Tailwind V4

**React Router v7 API change** [Source: architecture.md#ARCH18]
- Import from `'react-router'` (not `'react-router-dom'` — merged in v7)
- Use `createBrowserRouter()` and `<RouterProvider />`
- Modal-as-route: `/` (list) and `/todos/:id` (list + TaskDetailModal). Only `/` is needed for Story 1.4; `/todos/:id` is created in Epic 3

**TanStack Query V5 breaking changes** [Source: architecture.md#ARCH16]
- `onError`/`onSuccess` callbacks moved to `useMutation` only, not `useQuery`
- `data` from `useQuery` is typed as `T | undefined` (no longer narrowed to `T` in SuccessState)
- `cacheTime` renamed to `gcTime`
- `keepPreviousData` option removed in favour of `placeholderData: keepPreviousData`

### File Structure After Story 1.4

```
frontend/src/
├── app.css               ← @theme {} with 10 design tokens
├── index.css             ← @import "tailwindcss" entry
├── main.tsx              ← QueryClientProvider + RouterProvider
├── App.tsx               ← Minimal placeholder component for / route
├── routes.tsx            ← createBrowserRouter() routes
└── lib/
    ├── api-client.ts     ← typed fetch wrapper, VITE_API_URL prepend
    ├── query-client.ts   ← QueryClient singleton
    └── utils.ts          ← cn() helper (clsx + tailwind-merge)
```

### `api-client.ts` Shape

```ts
const BASE = import.meta.env.VITE_API_URL as string

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    throw err
  }
  return res.json()
}

export const apiClient = {
  get:    <T>(path: string) => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
```

### Vite Config Update for Tailwind V4

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### `components.json` for shadcn/ui V4

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### TypeScript Path Aliases
Configure `tsconfig.app.json` and `vite.config.ts` with `@/*` alias pointing to `./src/*` for shadcn/ui compatibility.

### Design Token Usage Examples
```tsx
// Use Tailwind utilities with custom tokens
<div className="bg-background text-text-primary">
<button className="bg-accent hover:bg-accent-hover text-white">
<p className="text-text-muted">
```

### References
- [Source: architecture.md#ARCH4] — frontend stack: Vite 7, React 19, TypeScript 5.9, Tailwind V4.2
- [Source: architecture.md#ARCH16] — TanStack Query V5 for server state, useState for local UI
- [Source: architecture.md#ARCH17] — `useTodo(id)` uses `initialData` from query cache
- [Source: architecture.md#ARCH18] — React Router v7, modal-as-route pattern
- [Source: architecture.md#ARCH19] — VITE_API_URL env var, no hardcoded URLs
- [Source: ux-design-specification.md#UX10] — 10 custom colour tokens
- [Source: ux-design-specification.md#UX11] — Inter font, min 14px
- [Source: epics.md#Story 1.4 Acceptance Criteria]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

1. **MEDIUM fix — `api-client.ts` VITE_API_URL validation**: Added a guard at module load time that throws immediately if `VITE_API_URL` is not defined, preventing silent `undefined/path` network requests.
2. **LOW fix — `App.test.tsx` cleanup**: Removed unnecessary `MemoryRouter` wrapper (App has no router hooks) and redundant explicit `describe/it/expect` imports (globals mode covers these).
3. **tsconfig.app.json update**: Added `"vitest/globals"` to `types` array so test globals are known to tsc without importing them per file.
4. **Prisma V7 note (MEDIUM-NOTED)**: `vite.config.ts` uses `defineConfig` from `vitest/config` (not `vite`) to expose the `test` property type correctly.
5. **`minimatch` CVE patched**: `npm audit fix` resolved GHSA-7r86-cg39-jmmj (ReDoS in minimatch ≤3.1.3) — 0 vulnerabilities after fix.

**Final test results**: 40 total (39 backend + 1 frontend), all passing. Both `npm run build` targets exit 0.

### File List
- frontend/package.json (updated: all new deps, test script)
- frontend/vite.config.ts (updated: tailwind plugin, vitest config)
- frontend/tsconfig.app.json (updated: @/* path alias)
- frontend/src/index.css (updated: @import "tailwindcss")
- frontend/src/app.css (new: @theme {} with 10 design tokens)
- frontend/src/App.tsx (updated: stripped boilerplate, minimal placeholder)
- frontend/src/main.tsx (updated: QueryClientProvider + RouterProvider)
- frontend/src/routes.tsx (new: createBrowserRouter with / route)
- frontend/src/lib/api-client.ts (new: typed fetch wrapper)
- frontend/src/lib/query-client.ts (new: QueryClient singleton)
- frontend/src/lib/utils.ts (new: cn() helper)
- frontend/src/test/setup.ts (new: jest-dom imports)
- frontend/src/App.test.tsx (new: smoke render test)
- frontend/.env.development (new: VITE_API_URL)
- frontend/components.json (new: shadcn/ui V4 config)
- package.json (updated: root test script)
