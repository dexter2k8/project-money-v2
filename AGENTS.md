# Project Money — Agent Guide

## Stack

- **Next.js 16.2.9** (React 19) — This version has breaking changes. APIs, conventions, and file structure may differ from your training data. Read guides in `node_modules/next/dist/docs/` before writing Next.js code.
- **Firebase** — Client SDK (`firebase`) for auth, Admin SDK (`firebase-admin`) for server-side token verification.
- **Tailwind CSS v4** — PostCSS plugin `@tailwindcss/postcss`. No `tailwind.config.*` file.
- **SWR** for client data fetching.
- **class-variance-authority (cva)** + `cx` for component variants and class merging.
- **TypeScript strict mode** enabled.

## Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run lint       # ESLint (no separate typecheck script; use `npx tsc --noEmit` if needed)
```

No test framework is configured.

## Project Structure

```
app/
  layout.tsx              # Root layout (fonts, ToastContainer)
  page.tsx                # Public landing/auth page
  (pages)/                # Route group for authenticated pages
    layout.tsx            # Sidebar + auth/balance providers
    dashboard/page.tsx
    analytics/page.tsx
    settings/page.tsx
  api/                    # Next.js API routes (route handlers)
    auth/                 # Auth endpoints (sign-in, sign-out, etc.)
    accounts/
    balances/
    banks/
    transactions/
  providers/              # React context providers (Auth, Balance, SessionTimer)
  hooks/                  # Custom hooks (useSWR, useLocalStorage)
  services/               # Firebase client init, fetchers
  utils/                  # Helpers (paths, OFX parser, duplicate check)
  validations/            # Yup schemas
components/               # Shared UI components (Button, Input, Modal, Sidebar, Table, etc.)
proxy.ts                  # Proxy — auth guard for protected routes (/dashboard, /analytics, /settings)
```

## Key Conventions

### Naming (enforced by ESLint)
- **Interfaces**: `I` prefix → `IUserProps`, `ISidebarItemProps`
- **Type aliases**: `T` prefix → `TUser`, `TSignInArgs`
- Use `import type` for type-only imports (`@typescript-eslint/consistent-type-imports`).

### Import Sorting
ESLint enforces `simple-import-sort` with a specific group order. Run `npx eslint --fix` to auto-sort.

### Path Aliases
`@/*` maps to the project root (e.g., `@/components/Button`, `@/app/providers/AuthProvider`).

### Component Pattern
Components use `components/<Name>/index.tsx` with `constants.ts` for variants and optional `loading.tsx`.

### API Routes
- Files: `app/api/<resource>/<action>/route.ts` with a co-located `types.ts`.
- Use `export async function POST(request: NextRequest)` / `GET` etc.
- Auth token stored in `project-money-token` httpOnly cookie.

### Auth Flow
`proxy.ts` verifies Firebase ID token on protected routes. Unauthenticated users redirect to `/`; authenticated users on `/` redirect to `/dashboard`.

### Provider Nesting
Authenticated pages wrap with `AuthProvider → SessionTimerProvider → BalanceProvider`.

## Gotchas

- **No `tailwind.config.*`** — Tailwind v4 is configured entirely via PostCSS. Custom theme values live in `app/globals.css`.
- **`proxy.ts` is the proxy** — Named `proxy` per Next.js 16 convention. Exports `proxy` function and `config.matcher` for route matching.
- **Firebase private key** in env vars contains escaped `\n` — must `.replace(/\\n/g, "\n")` before use.
- **SWR usage**: Import from `@/app/hooks/useSWR` (custom wrapper), not directly from `swr`.
- **Next.js 16 breaking changes**: APIs may have shifted. Verify against `node_modules/next/dist/docs/` before assuming defaults.
