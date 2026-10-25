# Technical Architecture & System Design

This document details the architectural principles, data flow, component design, and performance optimizations of **ToolBox4Devs**.

---

## 🌐 Hosted Deployments

- **Production Hosted Website:** [https://www.toolbox4devs.com](https://www.toolbox4devs.com)
- **Documentation (MkDocs):** [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)

---

## 1. Architectural Philosophy

The architecture of ToolBox4Devs is founded on four non-negotiable pillars:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ToolBox4Devs Architecture                       │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ 100% Client-    │ Static Site      │ Zero-Exfil      │ Stateless       │
│ Side Memory     │ Generation (SSG) │ Privacy Model   │ State Sharing   │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

1. **100% Client-Side Processing**: Every transformation, parsing run, cryptographic calculation, and code formatting routine executes strictly in browser memory. No text or data entered by a user is ever sent over the network.
2. **Static Site Generation (SSG)**: Pre-renders every tool page, category directory, and informational page into static HTML at build time using `vite-react-ssg`.
3. **Zero-Exfiltration Privacy Guarantee**: Secure for sensitive enterprise data, proprietary code, production database dumps, JWT tokens, and private keys.
4. **Stateless URL Sharing**: Shares state via URL hash fragments (`#data=...`) compressed with Lempel-Ziv-String (`lz-string`), eliminating the need for any server database.

---

## 2. System Architecture Diagram

```
                               ┌──────────────────────────┐
                               │  Vite Build & SSG Engine │
                               │     (vite-react-ssg)     │
                               └────────────┬─────────────┘
                                            │
                       ┌────────────────────┴────────────────────┐
                       ▼                                         ▼
            ┌─────────────────────┐                   ┌─────────────────────┐
            │ Browser Tool        │                   │ Node / SSG          │
            │ Registry            │                   │ Registry            │
            │ (src/tools/         │                   │ (src/tools/         │
            │  registry.ts)       │                   │  registry-node.ts)  │
            └──────────┬──────────┘                   └──────────┬──────────┘
                       │                                         │
        ┌──────────────┴──────────────┐                          │ Generates static
        ▼                             ▼                          │ routes & sitemap
┌──────────────┐              ┌──────────────┐                   ▼
│ Interactive  │              │ Tool Metadata│           ┌──────────────┐
│ Tool UI      │              │ & SEO Schema │           │ Static HTML  │
│ Components   │              │ (useSEO.tsx) │           │ Pages        │
└───────┬──────┘              └──────────────┘           │ (dist/*.html)│
        │                                                └──────────────┘
        ▼
┌───────────────────────────────────────────────────────────┐
│                    Browser Execution Layer                │
│  - Web Crypto API (SHA-256, HMAC, RSA, AES)               │
│  - CodeMirror 6 Editor Instances                          │
│  - Virtualized Tabular Viewer & Streaming Parsers         │
│  - Compressed State Hydration (lz-string in URL hash)     │
│  - Service Worker Cache (public/sw.js)                    │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Two-Tier Tool Registry Pattern

To enable static pre-rendering without bundling heavy browser-specific DOM dependencies (such as CodeMirror, HTML canvas, or camera scanner APIs) into the Node.js build process, ToolBox4Devs uses a **two-tier registry pattern**:

### A. Client Registry (`src/tools/registry.ts`)
- Imported inside browser React components.
- Loads the interactive UI components via React `lazy()` for optimal code-splitting.
- Associates Lucide icons, interactive behavior, and full tool implementations.

### B. Node / SSG Registry (`src/tools/registry-node.ts`)
- Imported by `vite.config.ts` during static site generation.
- Contains only lightweight metadata (slugs, titles, descriptions, categories).
- Has zero references to DOM APIs (`window`, `document`, `navigator`), allowing Node to safely pre-generate sitemaps and HTML pages.

---

## 4. Key Subsystems

### 4.1. Compressed Stateless Sharing (`src/lib/share.ts`)
- Rather than persisting user inputs in a remote database, tool state is serialized to JSON and compressed using `lz-string` into a Base64-safe URL hash payload.
- On page load, `useHashData()` inspects `window.location.hash`, decompresses the payload, and validates payload length against a strict 250KB security threshold to prevent denial-of-service memory spikes.

### 4.2. Delimited Data Validation Engine (`src/utils/csvValidatorEngine.ts`)
- Evaluates tabular files (CSV, TSV, custom delimiters) against custom schema rules (types, regex, ranges, enums, unique checks).
- Processes large datasets using micro-batches (2,000–5,000 rows per tick) to ensure the UI thread remains responsive and non-blocking.

### 4.3. Pipeline Studio Studio Engine (`src/utils/pipelineEngine.ts`)
- Implements an in-browser directed acyclic graph (DAG) dataflow.
- Allows chaining multiple utilities (e.g. `cURL → HTTP Parser → JSON Formatter → JSON to Zod`).
- Validates input/output compatibility between transformation steps.

### 4.4. Offline PWA & Service Worker (`public/sw.js`)
- Employs a Stale-While-Revalidate caching strategy for HTML and scripts.
- Employs a Cache-First strategy for static assets, SVG icons, and web fonts.
- Includes automatic update detection with in-app banner notification.

---

## 5. Security & Verification Strategy

- **ESLint Strict Rules**: Enforces zero TypeScript warnings and unused variables.
- **Vitest Unit & Integration Suites**: 25 test files covering cryptographic transformations, parser engines, share link security, and catalog synchronization.
- **CSP & Content Security**: Static hosting requires no unsafe server eval; Web Crypto uses browser-native primitives.
