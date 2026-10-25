# Product Roadmap

This document outlines the engineering priorities, completed milestones, and future feature backlog for **ToolBox4Devs**.

---

## 🌐 Hosted Web Application

- **Live Production Application:** [https://www.toolbox4devs.com](https://www.toolbox4devs.com)
- **Documentation (MkDocs):** [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)

---

## Architecture Snapshot

- **Framework**: React 18 SPA + Vite 5 + `vite-react-ssg` static prerendering
- **Tool Catalog**: 73 full-featured utilities across 9 categories
- **Test Suite**: 25 Vitest test files (166 / 166 passing unit/integration tests)
- **Styling**: Tailwind CSS with custom CSS variable channel architecture across 10 developer themes
- **Security & Privacy**: 100% in-browser client execution; zero outbound telemetry on user data

---

## Milestone 1: Core Correctness & Security (P0)

| Task | Priority | Status | Description |
|---|---|---|---|
| Vitest Test Suite | P0 | ✅ Completed | Comprehensive test coverage for parsers, converters, and crypto utilities |
| SSG API Safety Audit | P0 | ✅ Completed | Guarded all browser-only APIs (`window`, `localStorage`, `navigator`) for SSG |
| Share Link Hardening | P0 | ✅ Completed | Enforced 250KB payload safety limits and defensive error boundaries |
| Security Tool Validation | P0 | ✅ Completed | In-memory Web Crypto validation with zero external credential leakage |

---

## Milestone 2: Maintainability & Developer Experience (P1)

| Task | Priority | Status | Description |
|---|---|---|---|
| Dual Tool Registry Pattern | P1 | ✅ Completed | Decoupled client browser registry from Node.js SSG build registry |
| Centralized CodeMirror Extension Mapper | P1 | ✅ Completed | Unified syntax highlighting across JSON, SQL, JS, HTML, XML, Markdown |
| Strict Typecheck & Linting | P1 | ✅ Completed | Zero-warning ESLint policy with TypeScript strict mode |
| MkDocs Documentation Overhaul | P1 | ✅ Completed | Full MkDocs Material documentation with GitHub Pages automated CI |

---

## Milestone 3: UX, Accessibility & Discovery (P2)

| Task | Priority | Status | Description |
|---|---|---|---|
| Command Palette (`Cmd + K`) | P2 | ✅ Completed | Fuzzy search across all tools, aliases, and category paths |
| Quick Favorites & Recents Drawer | P2 | ✅ Completed | LocalStorage-backed pinning for instant tool access |
| WCAG 2.1 AA Contrast Compliance | P2 | ✅ Completed | Tested all 10 color themes for high contrast accessibility |
| Complete PWA & Offline Support | P2 | ✅ Completed | Full Service Worker asset caching for offline developer access |

---

## Milestone 4: Advanced Tooling & Data Engines (P3)

| Task | Priority | Status | Description |
|---|---|---|---|
| Delimited File Data Validator | P3 | ✅ Completed | Visual rule builder, custom regex constraints, and CSV error reporting |
| Virtualized Tabular CSV/TXT Viewer | P3 | ✅ Completed | High-performance large dataset viewer with sorting and search |
| Visual Pipeline Studio | P3 | ✅ Completed | Interactive workflow canvas to chain multiple developer utilities |

---

## Milestone 5: Future Backlog & Feature Growth (P4)

| Task | Priority | Status | Description |
|---|---|---|---|
| In-Browser SQLite WASM Query Engine | P4 | 🔄 Planned | Execute ANSI SQL queries directly against CSV/JSON datasets using `sql.js` |
| `.env` File Auditor & Secret Detector | P4 | 🔄 Planned | Compare `.env` files side-by-side, sort keys, and detect leaked API secrets |
| OpenAPI / Swagger 3.0 Interactive Explorer | P4 | 🔄 Planned | Client-side Swagger/OpenAPI viewer with mock request payload generator |
| Webhook Signature & HMAC Verifier | P4 | 🔄 Planned | Test Stripe, GitHub, Shopify, and Slack webhook HMAC signatures client-side |
| Regex Railroad Diagram Visualizer | P4 | 🔄 Planned | Interactive visual SVG state machine diagrams for complex regular expressions |
