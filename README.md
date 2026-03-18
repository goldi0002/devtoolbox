# DevToolbox

A premium, minimalist collection of browser-based developer utilities. No backend, no tracking, no ads.

## Tools

| Tool | Description |
|------|-------------|
| JSON → Model Generator | Convert JSON to C# classes or TypeScript interfaces |
| JSON Formatter | Format or minify JSON with validation |
| UUID Generator | Generate single or batch RFC 4122 v4 UUIDs |
| Base64 Encoder / Decoder | Encode/decode Base64 in the browser |
| Text Diff Checker | Compare two text inputs and highlight differences |
| Case Converter | Convert text between camelCase, snake_case, kebab-case, uppercase, and more |
| Slug Generator | Convert titles and labels into kebab-case or snake_case slugs |
| Timestamp Converter | Convert Unix timestamps, ISO strings, and readable dates |
| Query String Parser | Parse full URLs or raw query strings into decoded JSON and key/value pairs |
| Color Converter | Convert HEX, RGB, and HSL values with a live preview |
| HTTP Status Lookup | Search common HTTP response codes and meanings |
| Markdown Preview | Render Markdown into a live HTML preview entirely in the browser |
| Lorem Ipsum Generator | Generate placeholder copy for wireframes, mockups, and content tests |

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — fast bundler & dev server
- **TailwindCSS** — utility-first styling
- **React Router v6** — client-side routing
- **diff** — text comparison
- **uuid** — UUID v4 generation

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (recommended)

```bash
npx vercel deploy
```

Or connect your GitHub repo to Vercel for automatic deployments. The `vercel.json` is already configured for SPA routing.

### Manual (any static host)

```bash
npm run build
# Upload the `dist/` folder to your host
```

## Project Structure

```
src/
├── components/
│   ├── tools/
│   │   ├── JsonModelGenerator.tsx
│   │   ├── JsonFormatter.tsx
│   │   ├── UuidGenerator.tsx
│   │   ├── Base64Tool.tsx
│   │   └── TextDiff.tsx
│   ├── Navbar.tsx
│   ├── ToolCard.tsx
│   ├── ToolLayout.tsx
│   ├── CodeBlock.tsx
│   └── CopyButton.tsx
├── pages/
│   ├── Home.tsx
│   ├── Tools.tsx
│   └── About.tsx
├── hooks/
│   └── useClipboard.ts
├── utils/
│   └── modelGenerator.ts
├── App.tsx
├── main.tsx
└── index.css
```

## License

MIT
