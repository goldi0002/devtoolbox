# Roadmap

Prioritized backlog for Toolbox4Devs. Items are ordered by priority and completion status.

## Architecture Snapshot

- **App shell:** `src/main.tsx` uses `vite-react-ssg` with route definitions from `src/routes.tsx`
- **Routing:** `src/App.tsx` provides the shared layout, navigation, and suspense fallback
- **Tool registry:** `src/tools/registry.ts` imports metadata and exposes category, availability, and lookup helpers
- **Tool UI:** Runnable tools live under `src/components/tools/<category>/`
- **Styling:** Tailwind CSS with token-driven design system in `src/css/global.css` and `src/css/index.css`
- **Privacy model:** All tools are client-side only with static hosting support

## P0 — Production Correctness and Safety

| # | Task | Status |
|---|---|---|
| 1 | Add regression test framework (Vitest) and smoke coverage | ✅ Done |
| 2 | Audit browser-only APIs for SSG safety | ✅ Done |
| 3 | Harden share-link parsing with size limits and error handling | ✅ Done |
| 4 | Validate security-sensitive tools with tests and local-only guidance | Pending |

## P1 — Maintainability and Developer Experience

| # | Task | Status |
|---|---|---|
| 5 | Add explicit `typecheck` and `test` npm scripts | ✅ Done |
| 6 | Centralize CodeMirror language extension mapping | ✅ Done |
| 7 | Fix typos (e.g. `isCommingSoon`) while preserving compatibility | ✅ Done |
| 8 | Update README to match current codebase | ✅ Done |
| 9 | Add contribution guidelines | ✅ Done |

## P2 — UX, Accessibility, and SEO

| # | Task | Status |
|---|---|---|
| 10 | Improve keyboard and screen-reader accessibility | ✅ Done |
| 11 | Add empty/error states consistently across tools | ✅ Done |
| 12 | Improve tool discovery (search, favorites, command palette) | ✅ Done |
| 13 | Strengthen per-tool SEO metadata | ✅ Done |

## P3 — Performance and Quality

| # | Task | Status |
|---|---|---|
| 14 | Review bundle splitting and lazy loading | Pending |
| 15 | Reduce repeated runtime work in frequently-rendered components | ✅ Done |
| 16 | Add dependency health and bundle-size audit checks | Pending |

## P4 — Feature Growth

| # | Task | Status |
|---|---|---|
| 17 | Complete and polish beta/coming-soon tools | ✅ Done |
| 18 | Add file import/export for relevant tools | Pending |
| 19 | Persist safe user preferences (editor settings, etc.) | Pending |
| 20 | Finish visual redesign inside tool components (milestone 2) | Pending |

## Working Agreement

- Pick the highest-priority unfinished item on each continuation
- Complete one task at a time and keep commits focused
- Run linting, type checking, build checks, and tests after each change
- Update documentation and task status in the same change
