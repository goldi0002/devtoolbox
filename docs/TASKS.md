# DevToolbox Tasks

Status legend: `[ ]` pending, `[~]` in progress, `[x]` complete.

## Current task

- [x] Redesign the site around a shared design system (milestone 1: tokens, app shell, home, tools index, tool page).

## Next task

- [ ] Task 1 below: add a regression test framework and smoke coverage for shared utilities and critical tool behavior.

## Pending backlog

1. [ ] Add a regression test framework and smoke coverage for shared utilities and critical tool behavior.
2. [ ] Audit browser-only APIs for SSG safety and guard any unsafe access.
3. [ ] Harden share-link parsing with payload size limits and robust decode errors.
4. [ ] Validate security-sensitive tools with tests and clear local-only user guidance.
5. [x] Add explicit `typecheck` and `test` npm scripts and document the verification workflow.
6. [ ] Centralize duplicated CodeMirror language extension mapping used by `CodeBlock` and `CodeInput`.
7. [ ] Normalize naming and typos such as `isCommingSoon` while preserving compatibility where needed.
8. [ ] Update the README project structure and architecture notes to match the current codebase.
9. [ ] Add contribution guidelines for adding tools, metadata, changelog entries, and checks.
10. [~] Audit keyboard and screen-reader accessibility across navigation, theme picker, editors, and tool controls. Baseline shipped with the redesign (focus-visible outlines, skip link, reduced-motion support, `aria-pressed` toggles, labelled icon buttons); a full WCAG AA pass over the theme picker, editors, and tool forms is still pending.
11. [ ] Standardize empty and error states across all tools.
12. [x] Improve tool discovery with better filtering, ordering, and status handling.
13. [ ] Strengthen per-tool SEO metadata and sitemap coverage.
14. [ ] Review bundle splitting and lazy loading for editor-heavy tools.
15. [ ] Reduce repeated runtime work in frequently-rendered components.
16. [ ] Add dependency health and bundle-size audit checks.
17. [ ] Complete and polish beta or coming-soon tools represented in metadata.
18. [ ] Evaluate local file import/export affordances for relevant tools.
19. [ ] Persist safe user preferences, such as editor settings, with documented local-storage behavior.
20. [ ] Redesign milestone 2: replace hard-coded colors inside tool components and editors (`CodeInput`, `CodeBlock`, `RegexTester`, `UrlEncoderDecoder`) with design tokens.

## Completed

- [x] Redesign milestone 1: accent-driven theme tokens for all ten themes, fixed Tailwind alpha modifiers, shared component classes, new hero/tools index/tool shell, global footer, and accessibility baseline. Documented in `docs/DESIGN.md`.

- [x] Added a command palette, global search shortcut, local favorites, and recently used tools for faster discovery.

- [x] Initial architecture review and backlog documentation created.
- [x] Added explicit `typecheck` and `test` scripts plus architecture and verification documentation.
