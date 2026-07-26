# DevToolbox Tasks

Status legend: `[ ]` pending, `[~]` in progress, `[x]` complete.

## Current task

- [x] Expand tool catalog with JSON → Zod Schema Generator and Cron Expression Parser & Visualizer.

## Next task

- [ ] Task 8 below: Update README project structure and architecture notes to match the current codebase.

## Pending backlog

1. [x] Add a regression test framework (Vitest) and smoke coverage for shared utilities and critical tool behavior.
2. [x] Audit browser-only APIs for SSG safety and guard any unsafe access (`share.ts`, `useSEO.tsx`, `CodeInput.tsx`).
3. [x] Harden share-link parsing with payload size limits (250KB max) and robust decode error handling.
4. [ ] Validate security-sensitive tools with tests and clear local-only user guidance.
5. [x] Add explicit `typecheck` and `test` npm scripts and document the verification workflow.
6. [x] Centralize duplicated CodeMirror language extension mapping used by `CodeBlock` and `CodeInput` into `editorLanguage.ts`.
7. [x] Normalize naming and typos such as `isCommingSoon` while preserving compatibility (`isComingSoon`).
8. [ ] Update the README project structure and architecture notes to match the current codebase.
9. [ ] Add contribution guidelines for adding tools, metadata, changelog entries, and checks.
10. [x] Audit keyboard and screen-reader accessibility across navigation, theme picker, editors, and tool controls.
11. [x] Standardize empty and error states across all tools (`ErrorBanner`, `SectionPanel`).
12. [x] Improve tool discovery with better filtering, ordering, and status handling.
13. [x] Strengthen per-tool SEO metadata, Open Graph, Twitter Cards, Breadcrumbs JSON-LD, and sitemap coverage.
14. [ ] Review bundle splitting and lazy loading for editor-heavy tools.
15. [x] Reduce repeated runtime work in frequently-rendered components (`CodeInput` byte calculation optimization).
16. [ ] Add dependency health and bundle-size audit checks.
17. [x] Complete and polish beta or coming-soon tools represented in metadata; added `json-to-zod` and `cron-parser`.
18. [ ] Evaluate local file import/export affordances for relevant tools.
19. [ ] Persist safe user preferences, such as editor settings, with documented local-storage behavior.
20. [ ] Redesign milestone 2: replace hard-coded colors inside tool components and editors (`CodeInput`, `CodeBlock`, `RegexTester`, `UrlEncoderDecoder`) with design tokens.

## Completed

- [x] Added Vitest regression test suite with 100% passing tests for share compression/decompression limits, registry metadata, editor languages, JSON to Zod, and Cron parser.
- [x] Added `json-to-zod` (JSON to Zod Schema Generator) and `cron-parser` (Cron Expression Parser & Visualizer) to tool registry and SSG routes.
- [x] Enhanced SEO with Open Graph, Twitter cards, keywords, and Schema.org BreadcrumbList structured data.
- [x] Centralized CodeMirror language extension mapper in `src/lib/editorLanguage.ts`.
- [x] Redesign milestone 1: accent-driven theme tokens for all ten themes, fixed Tailwind alpha modifiers, shared component classes, new hero/tools index/tool shell, global footer, and accessibility baseline. Documented in `docs/DESIGN.md`.
- [x] Added a command palette, global search shortcut, local favorites, and recently used tools for faster discovery.
- [x] Initial architecture review and backlog documentation created.
- [x] Added explicit `typecheck` and `test` scripts plus architecture and verification documentation.
