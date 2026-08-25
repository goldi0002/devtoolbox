# Changelog

All notable changes to Toolbox4Devs are recorded here.

## 2026-08-23

- Added MkDocs documentation site with GitHub Pages deployment
- Rewrote documentation: installation, usage, deployment, architecture
- Added CONTRIBUTING.md with tool addition guide and code standards

## 2026-07-25

- Codebase architecture review and documentation
- Created ARCHITECTURE.md, DESIGN.md, ROADMAP.md, TASKS.md

## 2026-07 — Design System Redesign

- Token-driven design system with accent colors for all 10 themes
- Fixed Tailwind CSS alpha modifiers
- Shared component classes: `btn-primary`, `card`, `surface-panel`, `chip`, etc.
- New hero section, tools index page, tool shell
- Global footer and accessibility baseline

## 2026-07 — Tool Discovery

- Command palette with keyboard shortcut
- Global search
- Local favorites and recently used tools
- Category filtering and search refinements

## 2026-07 — New Tools

- JSON to Zod Schema Generator (`json-to-zod`)
- Cron Expression Parser & Visualizer (`cron-parser`)

## 2026-07 — Testing & Quality

- Added Vitest test suite
- Centralized CodeMirror language extension mapping
- Fixed `isCommingSoon` typo (preserved compatibility with `isComingSoon`)
- Hardened share-link parsing with 250KB size limit and error handling
- Audited browser-only APIs for SSG safety

## 2026-07 — SEO

- Open Graph and Twitter Card metadata per tool
- Schema.org BreadcrumbList structured data
- Per-tool canonical URLs and sitemap coverage

## 2026-07 — Initial Release

- 60+ developer tools across 9 categories
- Static site generation with Vite + vite-react-ssg
- 10 themes with dark mode support
- Share links with compressed state
- Privacy-first: all processing client-side
