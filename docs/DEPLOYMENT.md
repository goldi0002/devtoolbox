# Production Deployment Guide

ToolBox4Devs compiles into a purely static website using `vite-react-ssg`. The static output in `dist/` can be deployed to any static host, CDN, or object store without any backend servers or runtime databases.

---

## 🌐 Hosted Web Application

- **Live Hosted Application:** [https://www.toolbox4devs.com](https://www.toolbox4devs.com)
- **Documentation Site (MkDocs on GitHub Pages):** [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)

---

## 1. Production Build

To generate the production bundle:

```bash
npm run build
```

This triggers `vite-react-ssg build`, which:
1. Compiles client TypeScript bundles with code splitting.
2. Runs static pre-rendering across all tool slugs defined in `src/tools/registry-node.ts`.
3. Emits pre-rendered `.html` files for every route, sitemaps (`sitemap.xml`), robots (`robots.txt`), and asset manifests into `dist/`.

To test the generated build locally:

```bash
npm run preview
```

---

## 2. Hosting Platforms

### A. Vercel (Production Custom Domain: www.toolbox4devs.com)

The repository includes a ready-to-use `vercel.json` with SPA rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

1. Connect the GitHub repository `goldi0002/devtoolbox` in Vercel.
2. Set Build Command to `npm run build` and Output Directory to `dist`.
3. Configure custom domain `www.toolbox4devs.com`.

### B. Documentation Site (MkDocs on GitHub Pages)

The documentation site is automatically compiled and published to GitHub Pages via `.github/workflows/mkdocs.yml`:

```yaml
name: Deploy MkDocs to GitHub Pages
on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
      - '.github/workflows/mkdocs.yml'
```

The live documentation is available at: **`https://goldi0002.github.io/devtoolbox/`**.

To test MkDocs locally:
```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

### C. Docker & Nginx Deployment

For containerized cloud environments:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Nginx configuration (`nginx.conf`) for client-side routing and cache headers:

```nginx
server {
    listen 80;
    server_name www.toolbox4devs.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 3. Production Environment Variables

Set the following environment variables in your deployment pipeline:

| Variable | Recommended Value | Purpose |
|---|---|---|
| `VITE_BASE_URL` | `https://www.toolbox4devs.com` | Sets canonical URLs and share link domains |
| `VITE_ENVIRONMENT` | `production` | Enables production mode optimizations |

---

## 4. Continuous Integration (CI/CD)

The GitHub Actions workflow runs on every push and pull request:

```bash
# Workflow stages
1. npm ci
2. npm run lint
3. npm run typecheck
4. npm run build
5. npm test
```
