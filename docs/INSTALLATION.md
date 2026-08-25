# Installation

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+**

## Local Setup

```bash
# Clone the repository
git clone https://github.com/goldi0002/devtoolbox.git
cd devtoolbox

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build the static site for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the source files |
| `npm run typecheck` | Run the TypeScript compiler (no emit) |
| `npm test` | Run the Vitest test suite |

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `VITE_BASE_URL` | Yes | Base URL for share links and sitemap (e.g. `https://toolbox4devs.com`) |
| `VITE_ENVIRONMENT` | No | `development`, `staging`, or `production` |
| `VITE_PUBLIC_POSTHOG_HOST` | No | Self-hosted PostHog URL (analytics are off by default) |
| `VITE_PUBLIC_POSTHOG_KEY` | No | PostHog project key |

## Adding a New Tool

1. Create the component in `src/components/tools/<category>/`
2. Add metadata in `src/tools/meta/<tool>.ts`
3. Register in `src/tools/registry.ts` (browser) and `src/tools/registry-node.ts` (SSG)
4. Add the route in `src/routes.tsx`
5. Add the entry in `public/tools.json`
6. Run `npm run typecheck` and `npm run build` to verify

See [CONTRIBUTING.md](https://github.com/goldi0002/devtoolbox/blob/main/CONTRIBUTING.md) for the full checklist.
