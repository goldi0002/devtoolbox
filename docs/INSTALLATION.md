# Installation & Local Setup

This guide walks you through setting up **ToolBox4Devs** locally for development, testing, and production builds.

---

## 🌐 Hosted Web Application

The live production application is accessible at:
👉 **[https://www.toolbox4devs.com](https://www.toolbox4devs.com)**

---

## Prerequisites

Before starting, ensure your local development machine has:

- **Node.js**: v20.x or v22.x LTS (minimum v18.18+)
- **npm**: v9.x or v10.x
- **Git**: v2.30+
- Modern Web Browser (Chrome, Firefox, Safari, or Edge) with ES2022+ and Web Crypto support

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/goldi0002/devtoolbox.git
cd devtoolbox
```

### 2. Install Dependencies

Install project packages using standard `npm`:

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Review and adjust variables in `.env`:

```ini
# Base URL for canonical links, sitemaps, and compressed share links
VITE_BASE_URL=https://www.toolbox4devs.com

# Deployment environment flag (development | production)
VITE_ENVIRONMENT=development

# Optional debug flag for verbose logging
VITE_DEBUG=false
```

### 4. Start Development Server

Run the development server with live reload:

```bash
npm run dev
```

Open your browser at **`http://localhost:3000`** (or `http://0.0.0.0:3000`).

---

## Docker & Containerized Setup

ToolBox4Devs includes a ready-to-run Docker configuration:

```bash
# Start container using Docker Compose
docker compose -f docker-compose.base44.yml up -d
```

The service will spin up on Node 22, bind mount the local directory, and serve the application with live reload on port `3000`.

To view container logs or check health:

```bash
docker compose -f docker-compose.base44.yml logs -f
curl -sf http://localhost:3000/
```

---

## Development Scripts

The following commands are defined in `package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Starts Vite development server at `http://0.0.0.0:3000` |
| `npm run build` | Compiles TypeScript and runs `vite-react-ssg` static generation |
| `npm run preview` | Spins up a local static server to test the generated `dist/` build |
| `npm run lint` | Runs ESLint across all `.ts` and `.tsx` files with strict rules |
| `npm run typecheck` | Executes TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Runs the Vitest test runner across all 25 test suites |
| `npm run test:e2e` | Runs Playwright end-to-end browser tests |

---

## Verification & Pre-Commit Workflow

Always verify your changes before pushing code:

```bash
# 1. Check syntax and styling
npm run lint

# 2. Check TypeScript types
npm run typecheck

# 3. Verify static build generation
npm run build

# 4. Run test suites
npm test
```

---

## Mandatory Checklist for Adding a New Tool

When creating or modifying any tool, the following 8 locations must be updated in sync:

1. **Tool Component:** Create in `src/components/tools/<category-folder>/<ToolName>.tsx`.
2. **Client Registry:** Register in `src/tools/registry.ts` with metadata, Lucide icon, FAQs, and tips.
3. **Node SSG Registry:** Register in `src/tools/registry-node.ts` for static generation without browser bundle dependencies.
4. **Routes:** Register lazy route in `src/routes.tsx`.
5. **Tool Catalog:** Add entry and increment `totalTools` count in `public/tools.json`.
6. **Sitemap:** Add URL block in `public/sitemap.xml`.
7. **LLM Specs:** Add documentation entry in `public/llms.txt` and `public/llms-full.txt`.
8. **Count & Copy Sync:** Update counts in `public/opensearch.xml`, `public/manifest.json`, `index.html`, and `src/pages/Home.tsx`.
