# Toolbox4Devs Architecture

This document records the current repository architecture and the main risks found during the July 25, 2026 codebase review.

## Product shape

Toolbox4Devs is a static, privacy-first React application for browser-based developer utilities. The production build is generated with Vite React SSG, so pages and available tool routes are pre-rendered and then hydrated in the browser.

## Framework and deployment

- **Framework:** React 18 with TypeScript.
- **Build system:** Vite with `vite-react-ssg` for static generation.
- **Routing:** React Router route records exported from `src/routes.tsx` and consumed by `ViteReactSSG` in `src/main.tsx`.
- **Styling:** Tailwind CSS plus global CSS variables and utility classes in `src/css/`.
- **Deployment:** Static output from `npm run build`; `vercel.json` supports Vercel rewrites for client-side navigation.
- **Sitemap/robots:** `vite-plugin-sitemap` builds sitemap and robots data from registry-driven routes in `vite.config.ts`.

## Application flow

1. `src/main.tsx` creates the SSG root and installs a client-only Vite preload-error recovery handler.
2. `src/routes.tsx` declares the layout route, informational pages, category index routes, and one route for every available tool slug.
3. `src/App.tsx` renders the shared layout: skip link, navigation, routed content inside `#main-content`, global footer, scroll reset, error boundary, and suspense fallback.
4. `src/pages/ToolPage.tsx` resolves the current slug from the URL, looks up metadata in the tool registry, renders the tool component, and adds related-tool links plus about content.
5. `src/hooks/useSEO.tsx` writes page-level title, description, canonical, Open Graph, and Twitter card tags through `vite-react-ssg`'s `Head` component.

## Tool system

- `src/tools/tool-meta.ts` defines the metadata contract for every tool.
- `src/tools/meta/*` stores per-tool metadata such as slug, category, description, status, SEO-facing about copy, and component references.
- `src/tools/registry.ts` imports all metadata and exposes category labels, availability helpers, featured-tool helpers, and slug lookup.
- `src/tools/registry-node.ts` mirrors the registry for Node-side Vite configuration so static routes and sitemap entries can be generated without browser-only component imports.
- Runnable tools live in category folders under `src/components/tools/`, including JSON, encoding, text, generator, auth, web, data, crypto, and analyze utilities.

## Shared UI and utilities

- `src/components/CodeInput.tsx` and `src/components/CodeBlock.tsx` wrap CodeMirror for editable and read-only code experiences.
- `src/components/ToolLayout.tsx`, `ToolCard.tsx`, `Footer.tsx`, `CopyButton.tsx`, and `src/components/ui/*` provide reusable layout, cards, clipboard, sharing, theme, loading, and tool-status UI.
- Design tokens and shared component classes are described in `docs/DESIGN.md`; page-level styling should compose those classes rather than repeating utility strings.
- `src/lib/share.ts` implements compressed hash-based share URLs with `lz-string`.
- `src/hooks/` contains clipboard, hash-data, analytics, SEO, and page-title hooks.
- `src/utils/` contains tool-specific utilities and site metadata.

## Known Risks and Remaining Work

### Performance

- CodeMirror and formatter-heavy tools are the largest client bundles; lazy loading should be reviewed per tool.
- Parser/formatter tools should avoid expensive recomputation on every keystroke where live updates are not required.

### Accessibility

- A full WCAG AA audit of the theme picker, editor controls, and per-tool forms remains.
- Decorative macOS window controls in editor chrome should remain non-interactive to assistive technology.

### SEO

- Internal linking can be improved with category and use-case links.
- Sitemap generation depends on registry parity between browser and Node registries.

### Security and Privacy

- Security-sensitive tools (JWT decoding, Basic Auth, password generation, hashing, permissions) need clearer local-only guidance.
- Browser-only APIs are mostly client-guarded, but a full SSG safety audit remains.

### Technical Debt

- `npm test` runs Vitest. Coverage expansion is ongoing.
- Registry imports are intentionally duplicated between browser and Node contexts; this creates maintenance risk when adding tools.

## Verification Workflow

Run these before merging changes:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```
