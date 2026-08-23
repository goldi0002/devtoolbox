# Toolbox4Devs

A fast, minimalist, privacy-first collection of browser-based developer utilities. No backend, no ads — all tool processing is designed to happen locally in the browser.

[![Build status](https://github.com/goldi0002/devtoolbox/actions/workflows/ci.yml/badge.svg)](https://github.com/goldi0002/devtoolbox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Quick links

- Source: https://github.com/goldi0002/devtoolbox
- Docs: /docs

## Quick start

Requirements:
- Node.js 18+ (LTS) recommended
- npm 9+ or yarn 1/berry

Install and run locally:

```bash
# Install dependencies (use CI-friendly command)
npm ci

# Start dev server (hot reload)
npm run dev

# Build production static output
npm run build

# Preview production build locally
npm run preview
```

Useful scripts (from package.json):
- dev — start dev server (vite)
- build — SSG build using `vite-react-ssg`
- preview — preview a production build
- lint — run ESLint (type-aware rules)
- typecheck — run TypeScript only
- test — runs the temporary smoke checks (currently aliases to typecheck)

## Environment

Create a `.env` file (see `.env.example`) and set:
- VITE_BASE_URL — base URL used in share links and the sitemap generation (e.g. https://yourdomain.com)
- VITE_ENVIRONMENT — development | staging | production
- VITE_PUBLIC_POSTHOG_HOST — (optional) self-hosted PostHog URL
- VITE_PUBLIC_POSTHOG_KEY — (optional) PostHog project key

## Deployment

Recommended: Vercel static hosting. See `docs/DEPLOYMENT.md` for CI/CD, Docker, and GitHub Actions examples.

## Where to find things
- Tool metadata: `src/tools/meta/`
- Routes used by SSG: `src/routes.tsx` and `src/main.tsx`
- Build: `npm run build` produces the static output used for deployments

## Contributing
See `CONTRIBUTING.md` for development workflow, linting, and PR guidelines.

## License
MIT
