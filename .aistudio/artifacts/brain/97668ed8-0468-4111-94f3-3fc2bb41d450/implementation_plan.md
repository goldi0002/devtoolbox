# ToolBox4Devs — GitHub CI Fix, Quick Favorites & Recents Drawer, and New Developer Utilities

A comprehensive plan to resolve GitHub Actions installation failures, introduce a seamless Pinned Favorites & Quick Recents Drawer with in-place pinning, and expand the developer suite with two high-demand client-side utilities: **JSON Schema Generator & Validator** and **X.509 Certificate Decoder & Inspector**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your answers during Phase 1 clarification:
> - **CI Installation Resolution**: We will configure `npm ci --legacy-peer-deps` alongside a repository `.npmrc` (`legacy-peer-deps=true`) and setup-node caching to guarantee deterministic, zero-failure CI runs without peer dependency conflicts. We will also harden `mkdocs.yml` against Python 3.12+ externally-managed-environment errors.
> - **Platform & UX Enhancement**: We will introduce a global slide-out **Pinned Favorites & Quick Recents Drawer** with instant tool switching, search, unpinning, and direct card-level favorite buttons on Home and Tool catalogs.
> - **New Tool Additions**: Adding two enterprise-grade client-side developer utilities:
>   1. **JSON Schema Generator & Validator** (`/json-schema-generator`) — Generates Draft-07 / 2020-12 / OpenAPI JSON Schemas with type & format inference and live payload validation.
>   2. **X.509 Certificate Decoder & Inspector** (`/certificate-decoder`) — Decodes PEM SSL/TLS certificates and CSRs, extracting SANs, validity countdowns, public keys, and SHA-256 fingerprints in browser memory.
> - **Mandatory ToolBox4Devs Sync**: All 8 mandatory files will be synchronized (Registry, Node SSG, Routes, Catalog `tools.json` updated to 71 tools, Sitemap, LLM specs, and HTML/OpenSearch metadata).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Fixes GitHub Actions Workflows**: Eliminates CI install step failures caused by npm peer dependency conflicts (specifically `@vitest/mocker` requiring Vite 6-8 while Vite 5.4 is pinned by SSG) and ensures reliable automated builds on every push/PR.
  2. **Pinned Favorites & Quick Recents Drawer**: A slide-out drawer accessible from any page via top-bar star button or keyboard shortcut (`Shift+F` / `Ctrl+B`), giving developers instantaneous access to their most-used utilities and recent sessions.
  3. **In-Place Pinning**: Developers can now star/unstar any tool directly from the tool cards on the Home page, Dashboard, or Tools directory without entering the tool page first.
  4. **Two New Client-Side Utilities**:
     - `JSON Schema Generator & Validator`: Converts sample JSON data to standardized JSON Schema with format detection (`date-time`, `uuid`, `email`, `uri`), required-field customization, and interactive client-side payload validation.
     - `X.509 Certificate Decoder & Inspector`: Parses PEM certificates client-side using WebCrypto and native ASN.1 parser to display issuer, subject, expiration countdown, SANs, algorithms, and fingerprints.
- **Target Audience**: Full-stack engineers, DevOps specialists, backend developers, and security practitioners who need rapid, zero-latency, private tools.
- **Key Value**: Uninterrupted CI/CD automation, frictionless tool switching for power users, and expanded coverage of critical web and security workflows.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **GitHub Actions CI Flow**:
   - Developer pushes code or opens PR.
   - `ci.yml` runs `setup-node` with npm cache, executes `npm ci --legacy-peer-deps` without error, runs strict ESLint, TypeScript `--noEmit`, Vitest test suite, and SSG prerendering (`dist/` verification) seamlessly.

2. **Accessing Pinned Favorites & Recents**:
   - The user clicks the star icon button in the Navbar (or presses `Shift+F` / `Ctrl+B`).
   - A drawer slides smoothly in from the right with a backdrop blur.
   - The drawer features a top search filter, followed by two clean sections: "Pinned Favorites" and "Recent Tools".
   - Each item shows the category tag, tool name, slug, and a quick unpin/remove button. Clicking any tool navigates instantly and closes the drawer.
   - A "Clear recents" button allows one-click privacy reset.

3. **Card-Level Favorite Toggling**:
   - Hovering over any `ToolCard` (on Home, Dashboard, or `/tools`) displays a subtle, accessible star icon in the card header.
   - Clicking the star toggles favorite state immediately with optimistic UI update and synchronization across all open tabs via `window.localStorage` and custom events.

4. **JSON Schema Generator & Validator Flow**:
   - User pastes a JSON object or array into CodeMirror.
   - The tool instantly infers the schema structure (types, nested objects, array item schemas, formats like ISO dates, UUIDs, email, URI).
   - User configures settings: Target draft (Draft-07 vs Draft 2020-12), required fields policy (All required, Top-level only, None), and `additionalProperties` flag.
   - Output panel displays the formatted JSON Schema with one-click copy, download `.json`, and a live "Validate Payload" testing drawer.

5. **X.509 Certificate Decoder Flow**:
   - User pastes a PEM certificate (`-----BEGIN CERTIFICATE-----...`) or selects a built-in sample (Let's Encrypt TLS cert, Self-Signed Dev Cert).
   - Instant visual breakdown appears:
     - Status card: "Valid" (with days remaining) or "Expired" / "Not Yet Valid".
     - Subject & Issuer cards with Distinguished Name breakdown (CN, O, OU, C).
     - Subject Alternative Names (SANs) listed as clean chips/text.
     - Key specs: Public key algorithm (RSA 2048/4096, ECDSA P-256), Serial Number, Signature Algorithm.
     - Cryptographic Fingerprints: SHA-256 and SHA-1 computed locally using `crypto.subtle`.

### Visual Identity & Theme

- **Design System Alignment**: Strictly adheres to the ToolBox4Devs design system using Tailwind tokens (`bg-bg`, `bg-surface`, `border-border`, `text-bright`, `text-dim`, `text-subtle`, `text-accent`, `bg-accent-soft`).
- **Zero-Pill Discipline**: Metadata displayed as unboxed text with typographic separators (`·`, `/`). Interactive filter buttons and tabs use clean segmented controls.
- **Tabular Figures**: All serial numbers, byte lengths, timestamps, countdowns, and line counts use `tabular-nums` and `font-mono`.
- **Responsive Layout**: Full desktop width (up to 1440px) with fluid mobile transitions; drawer uses a max-width of 380px on desktop and full-width on mobile with `touch-action: pan-y`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: NPM Dependency Peer Resolution in CI**
  - *Chosen Approach*: Add `.npmrc` with `legacy-peer-deps=true` and update `ci.yml` to run `npm ci --legacy-peer-deps` with `cache: 'npm'`. Remove deprecated `@types/bcryptjs` stub package.
  - *Why*: `vite-react-ssg` currently requires Vite 5, while `@vitest/mocker` in Vitest 4 has optional peer dependencies specifying Vite 6-8. In npm 7+ non-interactive CI environments, this causes strict `ERESOLVE` halts. `--legacy-peer-deps` allows `npm ci` to complete deterministically while maintaining exact locked package versions.
  - *Alternatives Considered*: Forcing an upgrade to Vite 6 would break `vite-react-ssg 0.9.1` which does not yet support Vite 6.

- **Decision 2: Client-Side ASN.1 X.509 Certificate Parsing**
  - *Chosen Approach*: Implement a lightweight, zero-dependency client-side ASN.1 DER parser and X.509 decoder in TypeScript (`src/utils/x509Decoder.ts`).
  - *Why*: Zero external bundle bloat, zero security attack surface, and 100% compliance with the ToolBox4Devs zero-network-transmission privacy pledge.
  - *Alternatives Considered*: Heavy libraries like `node-forge` or `pkijs` introduce large polyfills for `Buffer` and `crypto` that bloat the client bundle by over 200KB.

- **Decision 3: Global Drawer vs Standalone Page for Favorites**
  - *Chosen Approach*: Global slide-out drawer accessible everywhere via top navigation and keyboard shortcut, while keeping the full Dashboard page for deep analytics.
  - *Why*: Developers switch between tools rapidly during active workflows; a lightweight drawer eliminates context switching.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ToolBox4Devs Architecture                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────── Top Navigation Bar ───────────────────────┐  │
│  │ Logo · Desktop Nav Links · [★ Drawer Button] · Palette · Theme   │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
│                                      │ triggers                        │
│                                      ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             QuickFavoritesDrawer (Global Slide-Over)             │  │
│  │  - Instant Search / Filter                                       │  │
│  │  - Pinned Favorites List (drag/toggle/remove)                    │  │
│  │  - Recent Tools List (last 6 tools, clear history)               │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
│                                      │ reads & writes                  │
│                                      ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            useToolPreferences Hook (localStorage & Events)       │  │
│  │  - Key: 'toolbox4devs:favorites'                                 │  │
│  │  - Key: 'toolbox4devs:recent-tools'                              │  │
│  │  - Broadcast: CustomEvent('toolbox4devs:preferences-changed')    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────────── Tool Ecosystem ─────────────────────────┐  │
│  │                                                                  │  │
│  │  New: JSON Schema Generator        New: Certificate Decoder       │  │
│  │  - Type & format inference         - Client ASN.1 / DER decoder  │  │
│  │  - Draft-07 / 2020-12 / OpenAPI    - SANs, Validity, Fingerprints │  │
│  │  - In-browser payload validator    - WebCrypto SHA-256 / SHA-1    │  │
│  │                                                                  │  │
│  │  Existing 69 Tools (JSON Formatter, cURL Converter, Regex, etc.) │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
│                                      │                                 │
│                                      ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Multi-File Catalog Sync                     │  │
│  │  - registry.ts & registry-node.ts                                │  │
│  │  - routes.tsx (lazy-loaded tool routes)                          │  │
│  │  - public/tools.json (totalTools: 71)                            │  │
│  │  - public/sitemap.xml (SEO URLs)                                 │  │
│  │  - public/llms.txt & llms-full.txt                               │  │
│  │  - index.html & public/manifest.json & opensearch.xml            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────── CI/CD Automation (GitHub) ──────────────────┐  │
│  │  .npmrc (legacy-peer-deps=true) · ci.yml (npm ci, cache: 'npm')   │  │
│  │  mkdocs.yml (pip install --break-system-packages)                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Storage

- **Favorites State**: Stored in `localStorage` key `'toolbox4devs:favorites'` as `string[]` containing tool slugs.
- **Recents State**: Stored in `localStorage` key `'toolbox4devs:recent-tools'` as `string[]` capped at 8 items.
- **Cross-Component Sync**: `window.dispatchEvent(new CustomEvent('toolbox4devs:preferences-changed'))` ensures all mounted components update instantly without full reloads.

### Implementation Checklist Across Repositories & Catalogs

1. **GitHub Actions & Dependency Configuration**:
   - Create `/.npmrc` with `legacy-peer-deps=true`.
   - Update `/.github/workflows/ci.yml`: Add `cache: 'npm'` and change `npm install` to `npm ci --legacy-peer-deps`.
   - Update `/.github/workflows/mkdocs.yml`: Add `--break-system-packages` to pip install step.
   - Clean `package.json`: Remove deprecated `@types/bcryptjs`.

2. **Favorites & Quick Recents Drawer**:
   - Create `src/components/QuickFavoritesDrawer.tsx`.
   - Update `src/components/Navbar.tsx`: Add star button with favorites badge count, shortcut listener (`Shift+F`), and drawer trigger.
   - Update `src/components/ToolCard.tsx`: Add in-place star button to allow pinning directly from cards.

3. **New Tool 1: JSON Schema Generator & Validator**:
   - Engine utility: `src/utils/jsonSchemaGenerator.ts`.
   - Component: `src/components/tools/json-tools/JsonSchemaGenerator.tsx`.
   - Metadata: `src/tools/meta/json-schema-generator.ts`.

4. **New Tool 2: X.509 Certificate Decoder & Inspector**:
   - Engine utility: `src/utils/x509Decoder.ts`.
   - Component: `src/components/tools/crypto-tools/CertificateDecoder.tsx`.
   - Metadata: `src/tools/meta/certificate-decoder.ts`.

5. **Mandatory Catalog & SEO Synchronizations (71 Tools Total)**:
   - `src/tools/registry.ts` & `src/tools/registry-node.ts`: Add both new tool metas.
   - `src/routes.tsx`: Register routes for `/json-schema-generator` and `/certificate-decoder`.
   - `public/tools.json`: Add tool catalog objects and update `totalTools: 71`.
   - `public/sitemap.xml`: Add `<url>` entries for both new tools.
   - `public/llms.txt` and `public/llms-full.txt`: Document new tools.
   - `public/opensearch.xml`, `public/manifest.json`, `index.html`, and `src/pages/Home.tsx`: Update total tool count copy to 71.

6. **Unit Tests & Verification**:
   - Create `src/__tests__/jsonSchemaGenerator.test.ts` for schema inference and validation.
   - Create `src/__tests__/certificateDecoder.test.ts` for ASN.1 DER parsing and fingerprint calculation.
   - Create `src/__tests__/quickFavoritesDrawer.test.ts` for favorite toggle and storage operations.
   - Run `npm run lint` and `npm test` and `npm run build` to verify pre-rendering.
