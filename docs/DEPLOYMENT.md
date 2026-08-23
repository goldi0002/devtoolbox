# Deployment

ToolBox4Devs produces a static site via `vite-react-ssg`. The build output goes to `dist/` and can be hosted on any static file server.

## Build for Production

```bash
npm run build
```

This generates the static output in `dist/` with pre-rendered pages for all tool routes and informational pages.

## Hosting Options

### Vercel (Recommended)

The simplest path for automatic deployments:

1. Connect the repository at [vercel.com](https://vercel.com)
2. Vercel auto-detects the framework — the default settings work
3. A `vercel.json` is included with SPA fallback rewrites for client-side routing

### GitHub Pages (Docs Site)

The documentation site is deployed to GitHub Pages using MkDocs:

1. The workflow at `.github/workflows/mkdocs.yml` builds and deploys on every push to `main`
2. It triggers when files in `docs/` or `mkdocs.yml` change
3. The built site is served from `https://goldi0002.github.io/devtoolbox/`

To preview docs locally:

```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

### Netlify, Firebase Hosting, S3 + CloudFront

Any static host works. Upload the contents of `dist/` after building. Configure SPA fallback so that routes like `/json-formatter` resolve to `index.html`.

### Docker

For containerized deployments:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Add an nginx config for SPA rewrites if using client-side routing.

## CI/CD

A basic GitHub Actions workflow for the app build:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm test
```

## Environment Variables in Production

Set these on your hosting platform:

| Variable | Description |
|---|---|
| `VITE_BASE_URL` | The production URL (e.g. `https://toolbox4devs.com`) |
| `VITE_ENVIRONMENT` | Set to `production` |
