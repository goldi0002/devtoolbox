# Engineering Task Board

Status: ✅ Completed · 🔄 In Progress · ⬜ Backlog

---

## 🌐 Hosted Web Application

- **Live Production URL:** [https://www.toolbox4devs.com](https://www.toolbox4devs.com)
- **Documentation:** [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)

---

## Current Sprint Tasks

| # | Task | Category | Priority | Status |
|---|---|---|---|---|
| 1 | Overhaul MkDocs technical documentation and sync with live URL | Docs | P0 | ✅ Completed |
| 2 | Feature `https://www.toolbox4devs.com` across all docs and README | Docs | P0 | ✅ Completed |
| 3 | Remove ephemeral preview/dev URLs from documentation | Docs | P0 | ✅ Completed |
| 4 | Ensure all 25 Vitest test suites (166 tests) pass cleanly | Quality | P0 | ✅ Completed |
| 5 | Verify zero-warning ESLint and TypeScript compilation | Quality | P0 | ✅ Completed |

---

## Completed Tasks

- [x] **Core Architecture & SSG**: Static site generation configured with `vite-react-ssg` across all 73 tool routes.
- [x] **Dual Tool Registry**: Separated browser component registry (`registry.ts`) from Node static pre-render registry (`registry-node.ts`).
- [x] **Test Framework**: Installed Vitest and authored 25 unit/integration test suites covering converters, crypto, sharing, and data engines.
- [x] **Share Link Security**: Enforced 250KB payload thresholds and safe error recovery in `src/lib/share.ts`.
- [x] **Delimited Data Validator**: Implemented `csv-validator` with interactive visual constraint builder and CSV error export.
- [x] **Command Palette (`Cmd + K`)**: Built fuzzy search with keyboard navigation, hotkeys, and quick actions.
- [x] **Quick Favorites Drawer**: LocalStorage-persisted tool pinning with zero tracking telemetry.
- [x] **PWA & Offline Service Worker**: Cached application shell, themes, and tool bundles for offline execution.
- [x] **Design Tokens & Themes**: Built 10 developer themes (Dark, Nord, Dracula, Terminal, Monokai, Rose, Solarized, Sepia, etc.).
- [x] **Documentation Migration**: Created dedicated MkDocs site deployed to GitHub Pages via automated workflow.

---

## Upcoming Backlog

- [ ] **WASM SQLite Query Sandbox**: Run client-side SQL queries on CSV/JSON payloads.
- [ ] **`.env` File Auditor & Diff Tool**: Compare `.env` and `.env.example`, detect exposed secrets, and sort keys.
- [ ] **OpenAPI / Swagger 3.0 Explorer**: Client-side API viewer and mock fixture generator.
- [ ] **Webhook Signature Simulator**: Validate Stripe/GitHub/Slack HMAC webhook signatures.
