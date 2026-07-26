# Toolbox4Devs

A fast, minimalist, privacy-first collection of browser-based developer utilities. No backend, no ads, and all tool processing is designed to happen locally in the browser.

## Tools

Tool metadata is maintained in `src/tools/meta/` and surfaced through the registry. Current categories include:

| Category | Examples |
|---|---|
| JSON | JSON Formatter, JSON → Model Generator |
| Encode / Decode | Base64, URL Encoder / Decoder, HTML Entity Tool |
| Text | Text Diff, Case Converter, Slug Generator, Regex Tester |
| Generators | UUID Generator, Password Generator, Lorem Ipsum Generator |
| Authentication | JWT Decoder, Basic Auth Header |
| Web | HTML Formatter, Markdown Preview, HTTP Status Lookup, MIME Type Lookup, User Agent Parser, Query String Parser, HTTP Header Parser, Color Converter |
| Data | Timestamp Converter, ASCII Table, Unix Permissions Calculator |
| Crypto | SHA-256, Hash Comparator |
| Analyze | Word Counter, Local AI Text Assistant |

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** + **vite-react-ssg** for static generation
- **React Router v6** for route records consumed by SSG
- **Tailwind CSS** plus global theme variables
- **CodeMirror** for code editors and previews
- **vite-plugin-sitemap** for sitemap and robots output

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint source files
npm run lint

# Run TypeScript without emitting files
npm run typecheck

# Run the current smoke test command
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

> `npm test` currently aliases the type checker until a dedicated regression test framework is added.

## Architecture

- `src/main.tsx` creates the `ViteReactSSG` root and installs a client-only preload-error recovery handler.
- `src/routes.tsx` defines static routes for informational pages, tool categories, and every available tool slug.
- `src/App.tsx` provides the shared layout: skip link, navigation, routed content, global footer, route scroll reset, and suspense boundary.
- `src/pages/` contains top-level pages and `ToolPage`, which resolves a slug to tool metadata and renders the matching component.
- `src/tools/registry.ts` is the browser registry; `src/tools/registry-node.ts` is the Node-safe registry used by Vite config for SSG routes and sitemap generation.
- `src/components/tools/<category>/` contains runnable tool implementations.
- `src/components/`, `src/components/ui/`, `src/hooks/`, `src/lib/`, and `src/utils/` contain shared UI, hooks, share-link logic, and utility helpers.

See `docs/ARCHITECTURE.md` for the full architecture review, technical-debt findings, and verification workflow, and `docs/DESIGN.md` for the design tokens and shared component classes.

## Deployment

### Vercel (recommended)

```bash
npm run build
npx vercel deploy
```

Or connect the repository to Vercel for automatic deployments. `vercel.json` is configured for static hosting with fallback rewrites.

### Manual static host

```bash
npm run build
# Upload the generated `dist/` folder to your host.
```

## Documentation

- `docs/ARCHITECTURE.md` — current architecture and audit findings.
- `docs/DESIGN.md` — design tokens, themes, component classes, and accessibility rules.
- `docs/ROADMAP.md` — prioritized roadmap.
- `docs/TASKS.md` — task backlog and completion status.

Update documentation in the same change as meaningful product or architecture updates.

## License

MIT
