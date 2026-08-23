# Usage

Common commands

- Start dev server: `npm run dev` (open at http://localhost:3000)
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

Share links and compressed state
- The app uses compressed share-links via `lz-string`. If share-links fail to load, check your browser console for decompression errors and ensure `VITE_BASE_URL` is configured correctly when generating sitemaps or share URLs.

Troubleshooting
- Build failures: run `npm run typecheck` and `npm run lint` locally to find TypeScript and linting errors.
- Dev server not starting: ensure no other process occupies port 3000 or run `npm run dev -- --port <other>`.
- Missing tool pages after build: run `node --loader ts-node/esm scripts/dump-routes.mjs` (if present) or examine `src/tools/registry-node.ts` to ensure metadata is exported for SSG.

Debugging tips
- Use browser devtools to inspect failures and network requests. Many tools are client-only and rely on in-browser APIs.
- To test a production build locally: `npm run build && npm run preview` and then open the preview URL.

Contact & analytics
- PostHog analytics are optional. To enable, set `VITE_PUBLIC_POSTHOG_HOST` and `VITE_PUBLIC_POSTHOG_KEY` in your environment.
