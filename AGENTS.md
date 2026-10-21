<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SoloBanking conventions

- **Styling:** Tailwind CSS v4. Design tokens (colours, animations) live in `src/app/globals.css` under `@theme`. Combine conditional classes with `classnames` (`import classNames from "classnames"`), not template strings.
- **Global state:** Redux Toolkit. Slices go in `src/store/slices/`; use the typed `useAppDispatch` / `useAppSelector` from `src/store/hooks.ts`.
- **Data fetching:** RTK Query only. `src/services/baseApi.ts` holds the single `createApi` instance and the `TAG_TYPES` list. Group endpoints by domain, one folder per domain (e.g. `src/services/accounts/accountsApi.ts`), each attached with `baseApi.injectEndpoints`. Queries declare `providesTags`, mutations `invalidatesTags`; add new tag names to `TAG_TYPES`.
- **Cache Components is on:** nothing may call `Math.random()`, `Date.now()` or similar while a page prerenders (this is why reducers are combined at module scope in `src/store/index.ts`).
- **No code comments.** Do not add comments anywhere in the code base.
