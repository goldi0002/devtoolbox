# ToolBox4Devs Documentation

Welcome to the technical documentation for **ToolBox4Devs** — a fast, privacy-first, 100% client-side collection of **70+ browser-based developer utilities**.

---

## 🌐 Hosted Website & Links

- 🌐 **Official Website:** [https://www.toolbox4devs.com](https://www.toolbox4devs.com)
- 📖 **Documentation Site (MkDocs):** [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)
- 💻 **GitHub Repository:** [https://github.com/goldi0002/devtoolbox](https://github.com/goldi0002/devtoolbox)

---

## What is ToolBox4Devs?

ToolBox4Devs is an open-source web application providing daily developer tools across nine core disciplines:
1. **JSON Utilities** (Format, Validate, Schema Generator, Zod types, Models, SQL, CSV)
2. **Encoders & Decoders** (Base64, URL, HTML Entities, Hex, Checksum comparator)
3. **Text Processing** (Case conversions, Regex tester, Text diff, CSV to Markdown, Sorter)
4. **Generators** (UUIDs, Passwords, AI Token counter, Bulk QR codes, .gitignore, Faker data)
5. **Authentication & Identity** (JWT Decoder & Signer, Basic Auth headers)
6. **Web & Frontend Tools** (cURL converter, WCAG Contrast, CSS Units, HTML/XML/GraphQL formatters, User-Agent, HTTP headers)
7. **Data & DevOps** (Delimited CSV/TSV validator, CSV/TXT viewer, Dockerfile generator, Docker Run to Compose, Pipeline Studio, CIDR calculator, Base converter, Cron parser/generator, SemVer, Unix permissions)
8. **Cryptography** (Web Crypto SHA hashes, HMAC, RSA keypair generation, X.509 cert decoder, Bcrypt)
9. **Analysis & Heuristics** (Local AI text analysis, Password strength, QR scanner, Word counter)

### Core Architectural Guarantees

!!! success "100% Client-Side Privacy"
    Every transformation, calculation, and cryptographic operation happens purely inside browser memory using the Web Crypto API, Web Workers, and in-memory WebAssembly/JavaScript. **Zero network calls** are made to any remote backend when processing user data.

!!! info "Static Site Generation (SSG)"
    All routes and tool pages are pre-rendered into static HTML via `vite-react-ssg` for lightning-fast First Contentful Paint (<100ms) and complete search-engine indexability.

!!! tip "Full Offline & PWA Support"
    A comprehensive Service Worker caches all assets, styles, and tools, allowing the application to function completely offline without an active internet connection.

---

## Quick Navigation

| Document | Focus Area |
|---|---|
| [Installation](INSTALLATION.md) | Prerequisites, local development setup, Docker, and scripts |
| [Architecture](ARCHITECTURE.md) | End-to-end architecture, tool registry system, SSG pipeline, and security |
| [Design System](DESIGN.md) | Theme tokens, 10 developer themes, component classes, and accessibility |
| [Usage](USAGE.md) | Command Palette, keyboard shortcuts, compressed share links, and pipeline studio |
| [Deployment](DEPLOYMENT.md) | Production hosting, Vercel, MkDocs on GitHub Pages, and CI/CD |
| [Roadmap](ROADMAP.md) | Feature backlog, completed milestones, and engineering priorities |
| [Tasks](TASKS.md) | Real-time task board and checklist |
| [Changelog](CHANGELOG.md) | Chronological version history and notable release notes |

---

## Tech Stack Overview

- **Core Framework**: React 18 + TypeScript (Strict Mode)
- **Bundler & SSG**: Vite 5 + `vite-react-ssg`
- **Styling**: Tailwind CSS + Token-driven CSS custom properties
- **Code Editors**: CodeMirror 6 with syntax extensions (JSON, SQL, JS, HTML, XML, Markdown)
- **Cryptographic Engine**: Web Crypto API + `bcryptjs`
- **Testing**: Vitest (unit & integration) + Playwright (end-to-end)
- **Documentation**: MkDocs with Material for MkDocs
