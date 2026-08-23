# Installation

This repository is a TypeScript React static site generated with Vite + vite-react-ssg.

Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ (or yarn)

Local install

```bash
# Clone
git clone https://github.com/goldi0002/devtoolbox.git
cd devtoolbox

# Install pinned dependencies
npm ci

# Start dev server
npm run dev
```

Code quality checks
- Lint: `npm run lint`
- Type check (no emit): `npm run typecheck`
- Build: `npm run build`
- Tests (temporary): `npm test` (currently runs typecheck)

Recommended editor settings
- Enable TypeScript 5+ support
- Install and enable ESLint and Prettier integrations

Files to inspect
- `package.json` — scripts and deps
- `tsconfig.json` and `tsconfig.node.json` — TypeScript config
- `vite.config.ts` — SSG routes and plugins
- `src/` — application source

If you need to add a new tool
- Add metadata under `src/tools/meta/<tool>.ts`
- Add the runnable component under `src/components/tools/<category>`
- Update `src/routes.tsx` if you add custom routes
