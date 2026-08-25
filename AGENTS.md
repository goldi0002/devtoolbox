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

Whenever a new tool is created or modified, **ALL** of the following files must be updated in sync:

1. **Tool Component**:
   - Create the component under `src/components/tools/<category-folder>/<ToolName>.tsx` (or `src/components/tools/<ToolName>.tsx`).
   - Use standard UI building blocks: `SectionPanel`, `TextInputField`, `TextAreaField`, `OutputPanel`, `CopyButton`, `StatCard`, etc.
   - Ensure resilient props (use `value`, handle empty strings, defensive error boundaries).

2. **Client Registry (`src/tools/registry.ts`)**:
   - Import the Lucide icon.
   - Add the tool definition to the `tools` array with `id`, `name`, `slug`, `category`, `description`, `icon`, `keywords`, `complexity`, `faqs`, `tips`, and `features`.

3. **Node/SSG Registry (`src/tools/registry-node.ts`)**:
   - Add the corresponding entry for static site generator prerendering.

4. **Routes (`src/routes.tsx`)**:
   - Lazy-import the component and register `<Route path="/<slug>" element={<ToolPage meta={getToolBySlug('<slug>')!}><ToolComponent /></ToolPage>} />`.

5. **Tool Catalog (`public/tools.json`)**:
   - Add the tool object with its `id`, `name`, `slug`, `category`, `description`, `url`, `complexity`, `keywords`, `faqs`, and `tips`.
   - Update `totalTools` count at the root of `public/tools.json`.

6. **Sitemap (`public/sitemap.xml`)**:
   - Add the `<url>` block with `https://toolbox4devs.com/<slug>` with appropriate priority and changefreq.

7. **AI & LLM Specs (`public/llms.txt` and `public/llms-full.txt`)**:
   - Add the tool specification, URL, category, complexity, and capabilities to both files.

8. **Tool Count & Copy Sync**:
   - If the total tool count changes, update references in:
     - `public/opensearch.xml`
     - `public/manifest.json`
     - `index.html`
     - `src/pages/Home.tsx`

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
