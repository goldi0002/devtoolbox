# Deployment

This project produces a static site via `vite-react-ssg`. The primary production artifact is the static output produced by `npm run build`.

Recommended hosts
- Vercel — simplest path for static sites and automatic builds from GitHub.
- Any static object host — Netlify, Firebase Hosting, S3+CloudFront, GitHub Pages.

Vercel (recommended)

1. Connect the repository in the Vercel dashboard.
2. Build command: `npm ci && npm run build`
3. Output directory: use ViteReactSSG default output (the build step will print the output path; commonly `dist/`).
4. `vercel.json` is included and supports the single-page app fallback required for client-side routing.

Manual static host

```bash
npm ci
npm run build
# Upload the generated static output (dist/) to your host
```

Docker (CI / preview image)

A small Dockerfile for preview or CI:

```Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci --no-audit --prefer-offline
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: copy a custom nginx.conf if you need rewrites for SPA navigation
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

GitHub Actions (CI) — example job snippet

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm run test
```

Checklist for a production deploy
- package.json scripts validated: `build`, `preview`, `dev` exist
- `.env.example` documents required env vars and `VITE_BASE_URL` is set for sitemap generation
- Static output produced by `npm run build` is uploaded to the host
- CI validates lint, typecheck and build steps

Troubleshooting
- If your build fails on CI because of memory/timeouts, try `NODE_OPTIONS=--max_old_space_size=4096 npm run build` or use a larger runner.
- If routing fails on the host, enable SPA fallback/rewrites so client-side routes resolve to index.html.
