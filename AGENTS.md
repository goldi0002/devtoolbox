# ToolBox4Devs — Agent Operating Guidelines

This file defines the standard operating procedures, architectural constraints, and verification workflows for any AI assistant working on the **ToolBox4Devs** codebase.

---

## 1. Core Architecture & Philosophy

- **100% Client-Side**: All tools run exclusively in browser memory. Never send user input to external servers or backend endpoints.
- **Zero Ads, Zero Tracking**: No analytics tracking on user inputs, zero intrusive popups.
- **Static Site Generation (SSG)**: The app uses `vite-react-ssg` with pre-rendering across all tool pages, categories, and information routes.
- **No Unsolicited Documentation Files**: Do not generate extra `.md` documentation files (such as `FEATURE.md`, `DOCS.md`, etc.) unless the user explicitly asks for them. Keep focus purely on clean code, automated syncs, and verification.

---

## 2. New Tool Addition Checklist (Mandatory)

Whenever a new tool is created or modified, follow these steps. The registry is the single source of truth; catalog files are generated from it:

1. **Tool Component**:
   - Create the component under `src/components/tools/<category-folder>/<ToolName>.tsx` (or `src/components/tools/<ToolName>.tsx`).
   - Use standard UI building blocks: `SectionPanel`, `TextInputField`, `TextAreaField`, `OutputPanel`, `CopyButton`, `StatCard`, etc.
   - Ensure resilient props (use `value`, handle empty strings, defensive error boundaries).

2. **Tool Metadata (`src/tools/meta/<slug>.ts`)**:
   - Export a `ToolMeta` with `slug`, `name`, `description`, `category`, `tag`, `keywords`, `complexity`, `status`, `about` (`summary`, `useCases`, `features`, `tip`), `seo`, and `toolComponent: lazy(() => import('…/<ToolName>'))`.
   - Optional `guide`: tool-specific `steps`, `faqs`, and one worked `example` shown on the tool page. Without it the page falls back to generic text shared by every tool, so add one, and only state things the tool really does.
   - Optional `icon`: a Lucide icon name from `ICON_MAP` in `src/lib/icons.ts` (otherwise `SLUG_ICON_MAP`, then the category icon, is used).

3. **Client Registry (`src/tools/registry.ts`)**:
   - Import the meta and add it to the `tools` array. The tool route (`/<slug>`) is created automatically from this array in `src/routes.tsx`; no route edit is needed.

4. **Regenerate the catalog: `npm run catalog`**:
   - Rewrites `src/tools/registry-node.ts`, `public/tools.json`, `public/llms.txt`, and `public/llms-full.txt` from the registry, and updates the tool count in `index.html`, `public/manifest.json`, and `public/opensearch.xml`. Commit the result.
   - Never edit those generated files by hand. Their content comes from the meta file, so fix wording there and re-run.
   - `npm run build` regenerates them too, and `catalogSync.test.ts` (part of `npm test`) fails if the committed files are stale. `npm run catalog:check` verifies without writing.
   - `sitemap.xml` is produced at build time by `vite-plugin-sitemap` (see `vite.config.ts`); there is no static sitemap to edit. `src/pages/Home.tsx` derives its count from the registry.

5. **Docs**: add the tool to the catalog list in `README.md`.

---

## 3. Verification & Testing Workflow

After generating or updating any code:
1. **Linting**: Run `lint_applet` (`npm run lint`) to ensure zero warnings and strict typing.
2. **Build Verification**: Run `compile_applet` (`npm run build`) to verify that `vite-react-ssg` compiles and prerenders all pages without errors.
3. **Unit / Integration Tests**: Run tests (`npm test` via vitest) where applicable.
4. **Dev Server Restart**: Restart the dev server (`restart_dev_server`) if route or build configurations changed.
5. **Output Results**: Clearly present the build and test verification results in the response summary.

---

## 4. Base44 Dev Environment

- **Stack**: 100% client-side Vite + React + TypeScript app (no backend, no database, no external API). The "Local AI Text Assistant" is a local heuristic analyzer, not a network call. PostHog analytics is commented out. No external secrets are required.
- **Run**: `docker compose -f docker-compose.base44.yml up -d` — uses a plain `node:22` image with the repo bind-mounted at `/app`, runs `npm install && npm run dev` (Vite dev server with live reload on port 3000).
- **Preview hostname**: `vite.config.ts` sets `server.allowedHosts: true` so the preview's external hostname is accepted.
- **Verify**: `curl -sf http://localhost:3000/` returns the app; container reports `healthy`.
