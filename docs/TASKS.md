# Tasks

Status: ✅ done · 🔄 in progress · ⬜ pending

## Current

- [x] Rewrite documentation for GitHub Pages (MkDocs deployment)

## Pending Backlog

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | Add regression test framework (Vitest) and smoke coverage | P0 | ✅ |
| 2 | Audit browser-only APIs for SSG safety | P0 | ✅ |
| 3 | Harden share-link parsing with size limits and error handling | P0 | ✅ |
| 4 | Validate security-sensitive tools with tests and local-only guidance | P0 | ⬜ |
| 5 | Add explicit `typecheck` and `test` npm scripts | P1 | ✅ |
| 6 | Centralize CodeMirror language extension mapping | P1 | ✅ |
| 7 | Fix typos (`isCommingSoon`) while preserving compatibility | P1 | ✅ |
| 8 | Update README to match current codebase | P1 | ✅ |
| 9 | Add contribution guidelines | P1 | ✅ |
| 10 | Improve keyboard and screen-reader accessibility | P2 | ✅ |
| 11 | Add empty/error states consistently across tools | P2 | ✅ |
| 12 | Improve tool discovery (search, favorites, command palette) | P2 | ✅ |
| 13 | Strengthen per-tool SEO metadata, Open Graph, Twitter Cards | P2 | ✅ |
| 14 | Review bundle splitting and lazy loading | P3 | ⬜ |
| 15 | Reduce repeated runtime work in frequently-rendered components | P3 | ✅ |
| 16 | Add dependency health and bundle-size audit checks | P3 | ⬜ |
| 17 | Complete and polish beta/coming-soon tools | P4 | ✅ |
| 18 | Add file import/export for relevant tools | P4 | ⬜ |
| 19 | Persist safe user preferences (editor settings, etc.) | P4 | ⬜ |
| 20 | Finish visual redesign inside tool components (milestone 2) | P4 | ⬜ |

## Completed

- Added Vitest test suite with tests for share compression, registry metadata, editor languages, JSON to Zod, and Cron parser
- Added `json-to-zod` and `cron-parser` tools to registry and SSG routes
- Enhanced SEO with Open Graph, Twitter cards, keywords, and Schema.org BreadcrumbList
- Centralized CodeMirror language extension mapper in `src/lib/editorLanguage.ts`
- Redesign milestone 1: accent-driven theme tokens for all ten themes, shared component classes
- Added command palette, global search, local favorites, and recently used tools
- Initial architecture review and backlog documentation
- Rewrote documentation for GitHub Pages deployment with MkDocs
