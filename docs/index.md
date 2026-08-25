# Toolbox4Devs Documentation

Toolbox4Devs is a fast, privacy-first collection of **60+ browser-based developer utilities**. No backend, no ads — every tool runs entirely in your browser.

This documentation covers the project's architecture, design system, setup, deployment, and roadmap.

## What is Toolbox4Devs?

Toolbox4Devs is a static React application built with Vite and `vite-react-ssg`. It provides developer tools across categories like JSON, encoding, text processing, generators, authentication, web utilities, data conversion, cryptography, and more.

All processing happens client-side. No data ever leaves your browser.

## Quick Start

```bash
git clone https://github.com/goldi0002/devtoolbox.git
cd devtoolbox
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

## Documentation Pages

| Page | Description |
|---|---|
| [Installation](INSTALLATION.md) | Prerequisites, local setup, and editor configuration |
| [Architecture](ARCHITECTURE.md) | Application flow, tool system, and codebase structure |
| [Design System](DESIGN.md) | Theme tokens, component classes, and accessibility rules |
| [Usage](USAGE.md) | Development commands, share links, and troubleshooting |
| [Deployment](DEPLOYMENT.md) | Vercel, Docker, static hosting, and CI/CD setup |
| [Roadmap](ROADMAP.md) | Prioritized backlog and milestones |
| [Tasks](TASKS.md) | Current task status and completion tracking |
| [Changelog](CHANGELOG.md) | Notable changes by date |

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** + **vite-react-ssg** for static site generation
- **Tailwind CSS** with a token-driven design system
- **CodeMirror** for code editors and previews
- **React Router v6** for client-side routing
- **Vitest** for testing

## Contributing

See [CONTRIBUTING.md](https://github.com/goldi0002/devtoolbox/blob/main/CONTRIBUTING.md) for guidelines on adding tools, code standards, and the verification checklist.

## License

MIT
