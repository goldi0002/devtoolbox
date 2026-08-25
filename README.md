# Toolbox4Devs

A fast, minimalist, privacy-first collection of **60+ browser-based developer utilities**. No backend, no ads — all tool processing happens locally in the browser.

[![Build status](https://github.com/goldi0002/devtoolbox/actions/workflows/ci.yml/badge.svg)](https://github.com/goldi0002/devtoolbox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Quick Start

```bash
git clone https://github.com/goldi0002/devtoolbox.git
cd devtoolbox
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build static site for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Vitest test suite |

## Tools

Toolbox4Devs includes 60+ tools across these categories:

| Category | Examples |
|---|---|
| JSON | Formatter, CSV Converter, Model Generator, To SQL, To Zod |
| Encode / Decode | Base64, URL Encoder/Decoder, HTML Entity, Hex, String Escaper |
| Text | Case Converter, Text Diff, Regex Tester, Slug Generator, Line Sorter |
| Generators | UUID, Password, Lorem Ipsum, QR Code, Gitignore, Faker Data |
| Authentication | JWT Decoder, JWT Encoder, Basic Auth Header, HMAC Generator |
| Web | HTML Formatter, Markdown Preview, Color Converter, Curl Converter, MIME Type |
| Data | Timestamp Converter, ASCII Table, Unix Permissions, Cron Generator/Parser |
| Crypto | SHA-256, Hash Comparator, RSA Key Generator, Bcrypt Generator |
| Analyze | Word Counter, Password Strength, QR Code Scanner, AI Token Counter |

## Documentation

Full documentation is available at **[goldi0002.github.io/devtoolbox](https://goldi0002.github.io/devtoolbox/)**:

- [Installation](https://goldi0002.github.io/devtoolbox/installation/) — Prerequisites and local setup
- [Architecture](https://goldi0002.github.io/devtoolbox/architecture/) — Application flow and codebase structure
- [Design System](https://goldi0002.github.io/devtoolbox/design-system/) — Theme tokens and component classes
- [Usage](https://goldi0002.github.io/devtoolbox/usage/) — Commands and troubleshooting
- [Deployment](https://goldi0002.github.io/devtoolbox/deployment/) — Vercel, Docker, and CI/CD
- [Roadmap](https://goldi0002.github.io/devtoolbox/roadmap/) — Prioritized backlog and milestones

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** + **vite-react-ssg** for static site generation
- **Tailwind CSS** with a token-driven design system
- **CodeMirror** for code editors and previews
- **React Router v6** for client-side routing
- **Vitest** for testing

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding tools, code standards, and the verification checklist.

## License

MIT
