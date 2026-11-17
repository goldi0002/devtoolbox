# CLAUDE.md

Project rules live in AGENTS.md and apply in full: 100% client-side, no tracking, the new-tool checklist, generated catalog files, and verification.

@AGENTS.md

## Commands

| Task | Command |
|---|---|
| Install | `npm ci --legacy-peer-deps` (peer-dep conflicts make a plain `npm ci` fail; CI uses the same flag) |
| Dev server | `npm run dev` (port 3000) |
| Lint (0 warnings allowed) | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests (vitest) | `npm test` |
| Build + SSG pre-render | `npm run build` (also regenerates the catalog via `prebuild`) |
| Catalog check | `npm run catalog:check` |
| E2E (Playwright) | `npm run build && CI=true npx playwright test --trace off` |

Before opening a PR, run all of the above. They match `.github/workflows/ci.yml`.

## Environment notes

- **E2E needs a matching browser.** `@playwright/test` pins a specific Chromium build. If tests fail with `Executable doesn't exist at .../chromium_headless_shell-<n>`, run `npx playwright install chromium` (downloads from `cdn.playwright.dev`).
- **`CI=true` serves the built site.** With it set, Playwright runs `npm run preview` against `dist/`, so build first. Without it, Playwright reuses or starts `npm run dev`.
- **After a build, `git status` should be clean.** If the generated catalog files changed, a meta file changed without `npm run catalog`; commit the regenerated files.

## Testing conventions

- Unit tests live in `src/__tests__/*.test.ts` and run in vitest's **node** environment. There is no jsdom or Testing Library.
- Put tool logic in `src/utils/` as pure functions and test those directly.
- To test a component's markup, render it with `renderToStaticMarkup` from `react-dom/server` (see `faqAccordion.test.ts`). Cover interaction (clicks, keyboard) in `e2e/tools.spec.ts`, waiting for hydration with the `gotoHydrated` helper.

## Git and PRs

- Never push to `main`; open a PR into `main`. `main` has no branch protection, so nothing else stops a direct push.
- Commit messages use conventional commits: `feat(tools): …`, `fix(a11y): …`, `chore(deps): …`.
- Keep PRs small and single-purpose. Reference the issue with `Closes #N`.
- The PR body states what changed and why, the pass result of each command in the table above, and the risk.
- PRs from the scheduled maintenance task are titled `[daily] …`. Up to 5 may be open at once (the owner's rule), merged one at a time; finish or fix open ones before starting new work, and keep concurrent PRs from editing the same files.
- Do not change `vercel.json`, `.github/workflows/`, licensing, analytics or secrets unless the owner asks.
