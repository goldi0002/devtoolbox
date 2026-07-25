# DevToolbox Roadmap

This roadmap is based on an initial repository review of the React/Vite static site, tool registry, route structure, shared UI components, and browser-only utility implementations.

## Architecture snapshot

- **App shell:** `src/main.tsx` uses `vite-react-ssg` with route definitions from `src/routes.tsx`; `src/App.tsx` provides the shared layout, navigation, route scroll reset, and suspense fallback.
- **Routing and pages:** top-level informational pages live in `src/pages/`; individual tools are resolved through `ToolPage` and metadata-driven routes.
- **Tool registry:** `src/tools/registry.ts` imports metadata from `src/tools/meta/*` and exposes category, availability, featured, and lookup helpers.
- **Tool UI:** runnable utilities live under `src/components/tools/<category>/`; reusable shell/editor/copy/share components live under `src/components/` and `src/components/ui/`.
- **Styling:** Tailwind utilities are configured through `tailwind.config.js`; theme variables and global component classes are in `src/css/global.css` and `src/css/index.css`.
- **Client-side privacy model:** tools are implemented in the browser with static hosting support through Vite SSG and Vercel rewrites.

## Prioritized backlog

### P0 — Production correctness and safety

1. **Add a regression test framework and smoke coverage.** Introduce a focused test setup for utility functions and critical tool logic so future changes can be validated beyond lint/build.
2. **Audit browser-only APIs for SSG safety.** Verify all `window`, `document`, `navigator`, `localStorage`, and `Blob` usage is guarded when rendered by SSG.
3. **Harden share-link parsing.** Add size limits and error handling around compressed hash payloads to prevent oversized URLs or expensive decompression attempts.
4. **Validate security-sensitive tools.** Add test cases and copy updates for JWT decoding, Basic Auth header generation, password generation, hashing, and permissions tools to clarify local-only behavior and avoid misuse.

### P1 — Maintainability and developer experience

5. **Add explicit type-check and test scripts.** Add `typecheck` and `test` npm scripts, then document the standard verification workflow.
6. **Centralize CodeMirror language extension mapping.** `CodeBlock` and `CodeInput` duplicate language-extension logic; extract it into a shared editor utility.
7. **Normalize naming and typos.** Fix misspellings such as `isCommingSoon` while preserving compatibility where needed.
8. **Update README project structure.** Align README with the current category-based tool layout, metadata registry, SSG routing, themes, and docs workflow.
9. **Add contribution guidelines.** Document how to add a new tool, metadata requirements, changelog updates, and verification commands.

### P2 — UX, accessibility, and SEO

10. **Improve keyboard and screen-reader accessibility.** Audit theme picker, mobile navigation, editor controls, copy/share buttons, and tool forms for labels, focus states, aria attributes, and keyboard behavior.
11. **Add empty/error states consistently.** Ensure every tool has actionable validation messages and recoverable error states.
12. **Improve tool discovery.** Add category filtering/search refinements, popularity/featured ordering rules, and clearer coming-soon/deprecated handling.
13. **Strengthen SEO metadata.** Ensure each tool has unique title, description, canonical URL, Open Graph metadata, and sitemap coverage.

### P3 — Performance and quality

14. **Review bundle splitting.** Confirm tool pages and heavy dependencies are lazily loaded where practical, especially editor-heavy tools.
15. **Reduce repeated runtime work.** Memoize expensive parser/formatter operations and avoid repeated `Blob` construction in frequently-rendered components.
16. **Add dependency and bundle audits.** Track bundle size and dependency health as part of release checks.

### P4 — Feature growth

17. **Complete and polish beta/coming-soon tools.** Prioritize tools already represented in metadata before adding unrelated new utilities.
18. **Add import/export affordances.** Consider file upload/download for relevant tools while keeping all processing local.
19. **Add user preference persistence.** Persist safe UI preferences such as editor settings, while documenting local-storage behavior.

## Working agreement

- Pick the highest-priority unfinished item from `docs/TASKS.md` on each continuation.
- Complete one task at a time and keep commits focused.
- Run linting, type checking, and production build checks after each change.
- Update documentation and task status in the same change as the implementation.
