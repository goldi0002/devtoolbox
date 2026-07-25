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
3. `src/App.tsx` renders the shared layout, navigation, scroll reset, and suspense fallback.
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
- `src/components/ToolLayout.tsx`, `ToolCard.tsx`, `CopyButton.tsx`, and `src/components/ui/*` provide reusable layout, cards, clipboard, sharing, theme, loading, and tool-status UI.
- `src/lib/share.ts` implements compressed hash-based share URLs with `lz-string`.
- `src/hooks/` contains clipboard, hash-data, analytics, SEO, and page-title hooks.
- `src/utils/` contains tool-specific utilities and site metadata.

## Findings from the repository review

### Duplicated code

- CodeMirror language-extension mapping is duplicated in `CodeInput` and `CodeBlock`; it should be centralized in a shared editor utility.
- Registry imports are intentionally duplicated between browser and Node contexts, but this creates maintenance risk when adding tools.

### Technical debt

- The public registry helper `isCommingSoon` contains a spelling error and should be replaced by `isComingSoon` while preserving compatibility.
- There is no dedicated regression test framework yet. The new `test` script currently aliases type checking until real unit tests are added.
- README project structure was older than the current category-based layout before this audit and should continue to be updated with architecture changes.

### Performance risks

- CodeMirror and formatter-heavy tools are the largest likely client bundles; lazy loading should be reviewed per tool.
- `CodeInput` computes byte size with multiple `Blob` constructions during render and can be simplified.
- Parser/formatter tools should avoid expensive recomputation on every keystroke where live updates are not required.

### Accessibility risks

- Theme picker, mobile navigation, editor controls, copy/share buttons, and tool forms need a WCAG AA keyboard and screen-reader audit.
- Decorative macOS window controls in editor chrome should remain non-interactive to assistive technology.
- Error and empty states are not yet standardized across all tools.

### SEO risks

- Core metadata exists for tool pages, but structured data/rich snippets are not yet emitted per tool.
- Internal linking is present through related tools and indexes but can be improved with category and use-case links.
- Sitemap generation depends on registry parity between browser and Node registries.

### Security and privacy risks

- Share-link decompression currently needs payload-size limits and stronger error handling.
- Security-sensitive tools such as JWT decoding, Basic Auth, password generation, hashing, and permissions need clearer local-only guidance and regression coverage.
- Browser-only APIs are mostly client-guarded or used inside effects/components, but a full SSG safety audit remains required.

## Verification workflow

Use this baseline before merging changes:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

`npm test` currently runs the type checker as a temporary smoke check. Replace it with a real unit/integration test runner as soon as the regression test framework task is implemented.
