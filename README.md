# ToolBox4Devs

<div align="center">
  <br />
  <img src="public/images/favicon.svg" alt="ToolBox4Devs Logo" width="80" height="80" />
  <h3>The Premier Fast, Private, 100% Client-Side Developer Utility Suite</h3>
  <p>Over 70+ essential developer utilities running entirely in your browser memory. Zero ads, zero tracking, zero server latency.</p>

  <p>
    <a href="https://www.toolbox4devs.com">
      <img src="https://img.shields.io/badge/Production-www.toolbox4devs.com-6366f1?style=for-the-badge&logo=vercel" alt="Production Website" />
    </a>
    <a href="https://goldi0002.github.io/devtoolbox/">
      <img src="https://img.shields.io/badge/Docs-MkDocs%20Material-0ea5e9?style=for-the-badge&logo=material-for-mkdocs" alt="Documentation Site" />
    </a>
    <a href="https://github.com/goldi0002/devtoolbox/actions/workflows/ci.yml">
      <img src="https://img.shields.io/badge/CI-Passing-10b981?style=for-the-badge&logo=githubactions" alt="CI Status" />
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-amber?style=for-the-badge" alt="License: MIT" />
    </a>
  </p>
</div>

---

## 🌐 Hosted Website & Documentation

- 🌐 **Official Website:** [https://www.toolbox4devs.com](https://www.toolbox4devs.com)
- 📖 **Technical Documentation:** [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)
- 💻 **Source Code Repository:** [https://github.com/goldi0002/devtoolbox](https://github.com/goldi0002/devtoolbox)

---

## ⚡ Core Philosophy & Architecture

ToolBox4Devs was built to solve the frustration of using ad-ridden, slow, and privacy-invasive web utility sites for day-to-day software development tasks.

1. **🔒 100% Client-Side Processing**: Every single transformation, calculation, formatting pass, and cryptographic operation executes exclusively in browser memory. No data is ever transmitted to a backend.
2. **🛡️ Absolute Privacy Guarantee**: Safe for sensitive tokens, passwords, production database dumps, and private certificates.
3. **⚡ Static Site Generation (SSG)**: Built with `vite-react-ssg`, pre-rendering all 70+ tool pages into static HTML for instant first-contentful paint and top-tier SEO rankings.
4. **📴 Offline & Progressive Web App (PWA)**: Includes a full Service Worker cache so you can install and use the entire utility suite while disconnected on planes, trains, or offline field environments.
5. **🔗 Compressed Stateless Sharing**: Uses `lz-string` URL hash compression (`#data=...`) to generate shareable links containing complete tool states without any server database storage.
6. **🎨 10 Tailored Developer Themes**: Switch effortlessly between Dark, Nord, Dracula, Monokai, Terminal, Sepia, Rose, Solarized, and custom high-contrast palettes.
7. **⌨️ Productivity-First UX**: Fast Command Palette (`Cmd + K` or `Ctrl + K`), customizable Quick Favorites drawer, and instant clipboard copying.

---

## 🛠️ Complete Tool Catalog (73 Tools Across 9 Categories)

### 1. 🗄️ Data & DevOps (13 Tools)
- **Delimited File Data Validator (`/csv-validator`)**: Validate CSV, TSV, and delimited TXT files with an interactive visual rule builder, regex constraints, type checks, and row-level error auditing.
- **CSV / TXT Large File Viewer (`/csv-txt-viewer`)**: Blazing-fast virtualized tabular spreadsheet viewer with search and column sorting.
- **Pipeline Studio (`/pipeline-studio`)**: Visual multi-step developer flow canvas to chain transformations (e.g. cURL → JSON → Schema).
- **CIDR & Subnet Calculator (`/cidr-calculator`)**: IPv4 CIDR prefix breakdown, usable IP ranges, wildcard masks, and binary bit visualizer.
- **Dockerfile Generator (`/dockerfile-generator`)**: Interactive template builder for Node, Python, Go, Rust, Java, and PHP containers.
- **Docker Run to Compose (`/docker-run-to-compose`)**: Convert complex `docker run` CLI invocations into clean `docker-compose.yml` files.
- **Cron Expression Parser (`/cron-parser`)**: Decode cron syntax into human speech, schedule breakdown, and upcoming execution timeline.
- **Cron Expression Generator (`/cron-generator`)**: Visual cron scheduler with preset frequencies and day/month pickers.
- **JSON to SQL Converter (`/json-to-sql`)**: Generate `CREATE TABLE` DDL and `INSERT INTO` statements from raw JSON objects.
- **JSON to CSV / CSV to JSON (`/json-to-csv`)**: Two-way structured table and JSON conversion with nested object flattening.
- **YAML to JSON / JSON to YAML (`/yaml-json-converter`)**: Bi-directional parser with validation and format preservation.
- **SemVer Calculator (`/semver-calculator`)**: Compare semantic versions, test NPM caret/tilde ranges, and bump increments.
- **Unix Permissions Calculator (`/unix-permissions-calculator`)**: Interactive chmod calculator with octal, symbolic (`rwxr-xr-x`), and CLI flag breakdown.
- **Number Base Converter (`/base-converter`)**: Simultaneous real-time conversion between Binary, Octal, Decimal, and Hexadecimal.
- **Number to Words Converter (`/number-to-words`)**: Financial, cheque, and verbal numeral spellings in multiple numbering systems.
- **Timestamp / Epoch Converter (`/timestamp-converter`)**: Convert milliseconds, seconds, ISO-8601, and human dates across timezones.
- **ASCII Table Reference (`/ascii-table`)**: Complete 7-bit ASCII and extended reference with character search and control codes.
- **Age & Lifetime Milestone Calculator (`/age-calculator`)**: Precise chronological age, heartbeat/breath estimates, and planetary ages.

### 2. 📋 JSON Utilities (7 Tools)
- **JSON Formatter & Validator (`/json-formatter`)**: Beautify, minify, repair syntax errors, and inspect token counts.
- **JSON Schema Generator (`/json-schema-generator`)**: Auto-generate Draft-07 / 2020-12 JSON Schemas from raw payloads.
- **JSON to Zod Schema (`/json-to-zod`)**: Convert JSON payloads directly into TypeScript Zod validation schemas.
- **JSON Model Generator (`/json-model`)**: Generate TypeScript interfaces, Python Dataclasses, Go Structs, and C# classes.
- **JSON Tree Viewer (`/json-tree-view`)**: Collapsible visual node graph for complex nested structures.
- **JSON Table Viewer (`/json-table-view`)**: Tabular grid representation with sorting and column filtering.
- **JSON Stats Analyzer (`/json-stats`)**: Structural telemetry, depth metrics, key counts, and memory footprint analyzer.

### 3. 🔐 Security, Auth & Cryptography (8 Tools)
- **JWT Decoder & Inspector (`/jwt-decoder`)**: Decode JWT headers, payload claims, expiration status, and time-to-live warnings.
- **JWT Encoder & Signer (`/jwt-encoder`)**: Generate and sign tokens using HMAC-SHA256 client-side.
- **Basic Auth Header Generator (`/basic-auth-header`)**: Create `Authorization: Basic <base64>` tokens from username/password pairs.
- **SHA & Hash Generator (`/sha-256`)**: Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes using native Web Crypto.
- **HMAC Generator (`/hmac-generator`)**: Compute keyed hash message authentication codes with custom secrets.
- **RSA Keypair Generator (`/rsa-key-generator`)**: Generate PKCS#8 and SPKI RSA keypairs directly in browser memory.
- **X.509 Certificate Decoder (`/certificate-decoder`)**: Inspect PEM/CRT certificates, validity dates, SANs, and issuer chains.
- **Bcrypt Generator & Verifier (`/bcrypt-generator`)**: Compute and verify bcrypt salted hashes client-side.

### 4. 🌐 Web & Frontend Utilities (14 Tools)
- **cURL Converter (`/curl-converter`)**: Transform cURL commands into JavaScript `fetch`, `axios`, Python `requests`, and Go code.
- **WCAG 2.1 Contrast Checker (`/wcag-contrast-checker`)**: Check AA/AAA compliance with live preview and color blindness simulations.
- **CSS Unit & Fluid clamp() Converter (`/css-unit-converter`)**: Compute `rem`, `px`, `em`, Tailwind spacing, and fluid viewport `clamp()` formulas.
- **SVG to JSX Component (`/svg-to-jsx`)**: Clean SVG code and output optimized React/Next.js SVG components.
- **HTML Formatter & Minifier (`/html-formatter`)**: Pretty-print or compress HTML markup with syntax highlighting.
- **XML Formatter & Minifier (`/xml-formatter`)**: Format complex XML documents with indentation and XML tree validation.
- **GraphQL Query Formatter (`/graphql-formatter`)**: Format, validate, and minify GraphQL operations.
- **HTTP Header Parser (`/http-header-parser`)**: Inspect raw response headers, security ratings, and CORS flags.
- **HTTP Status Code Lookup (`/http-status-lookup`)**: Search HTTP 1xx-5xx codes with specifications, causes, and remediation guides.
- **URL Parser & Builder (`/url-parser`)**: Break down protocol, host, port, path, query params, and hash segments.
- **Query String Parser & Serializer (`/query-string-parser`)**: Decode and encode complex query parameter strings into JSON.
- **User Agent Parser (`/user-agent-parser`)**: Extract browser engine, operating system, device family, and architecture.
- **MIME Type Lookup (`/mime-type-lookup`)**: Find file extensions, media types, and recommended HTTP Content-Type headers.
- **Color Converter (`/color-converter`)**: Convert HEX, RGB, HSL, HSV, CMYK, and CSS Color Module 4 formats.
- **Keycode & Keyboard Event Inspector (`/keycode-inspector`)**: Real-time event tester for `e.key`, `e.code`, and `which`.
- **Markdown Live Preview (`/markdown-preview`)**: Split-screen GitHub-flavored Markdown editor and HTML generator.

### 5. 🔤 Text & String Manipulation (8 Tools)
- **String Escape & Unescape (`/string-escaper`)**: Escape strings for JSON, JavaScript, SQL, HTML, Python, Shell, and Unicode.
- **Case Converter (`/case-converter`)**: Transform text into camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and more.
- **Regex Tester & Debugger (`/regex`)**: Live JavaScript regex engine with group captures, match positions, and flag toggles.
- **Text Diff Viewer (`/text-diff`)**: Side-by-side and unified visual line/word difference comparison.
- **Slug Generator (`/slug-generator`)**: URL-friendly kebab slugification with diacritic removal and custom delimiters.
- **CSV to Markdown Table (`/csv-to-markdown`)**: Convert spreadsheet text into clean GitHub-flavored Markdown tables.
- **Line Sorter & Deduplicator (`/line-sorter`)**: Sort alphabetically, numerically, reverse, trim whitespace, and eliminate duplicate lines.
- **Text Repeater & Multiplier (`/text-repeater`)**: Multiply text strings with customizable delimiters and line index numbering.

### 6. 🧮 Encoders & Decoders (5 Tools)
- **Base64 String & File Encoder/Decoder (`/base-64`)**: Convert text or binary files to Base64 and URL-safe Base64.
- **URL Encoder & Decoder (`/url-encoder`)**: Standard and Component RFC-3986 URL percent-encoding.
- **HTML Entity Encoder/Decoder (`/html-entity`)**: Convert special characters to named and numeric entities.
- **Hex to Text & Text to Hex (`/hex-converter`)**: Hexadecimal byte stream parser with spacing options.
- **Hash Comparator (`/hash-comparator`)**: Timing-safe visual comparison between two cryptographic checksums.

### 7. 🎲 Generators (9 Tools)
- **UUID / GUID Generator (`/uuid`)**: Generate bulk v4 UUIDs in lowercase, uppercase, with or without hyphens.
- **Password Generator (`/password-generator`)**: Cryptographically secure random passwords, passphrases, and PINs.
- **AI Token Counter (`/ai-token-counter`)**: Heuristic token estimation for GPT-4, Claude 3, and Gemini models.
- **QR Code Generator (`/qr-code-generator`)**: Customizable SVG/PNG QR codes with colors, margin, and error correction.
- **Bulk QR Code Generator (`/bulk-qr-generator`)**: Generate hundreds of QR codes from batch lines and download as a ZIP file.
- **Faker Data Generator (`/faker-data-generator`)**: Generate realistic mock user profiles, addresses, transactions, and company data.
- **.gitignore File Generator (`/gitignore-generator`)**: Curated Git ignore templates for over 40+ languages and frameworks.
- **MAC Address Generator (`/mac-address-generator`)**: Generate random unicast/multicast MAC addresses with vendor OUI prefixes.
- **SVG Placeholder Generator (`/svg-placeholder-generator`)**: Responsive lightweight SVG image placeholders with custom dimensions and labels.
- **Lorem Ipsum Text Generator (`/lorem-ipsum-generator`)**: Generate paragraphs, sentences, and words of mock typesetting copy.

### 8. 🔍 Analysis & Heuristics (4 Tools)
- **Local AI Text Assistant (`/local-ai-text-assistant`)**: 100% in-browser heuristic natural language analyzer (readability, tone, summarization, keywords) without any external API calls.
- **Password Strength Analyzer (`/password-strength-analyzer`)**: Entropy calculator, brute-force crack time estimates, and dictionary leak warnings.
- **QR Code Scanner (`/qr-code-scanner`)**: Browser-camera and image-file QR decoder with instant URL detection.
- **Word & Character Counter (`/word-counter`)**: Character counts, reading time, speaking time, and word frequency histogram.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm 9+**

```bash
# 1. Clone the repository
git clone https://github.com/goldi0002/devtoolbox.git
cd devtoolbox

# 2. Install dependencies
npm install

# 3. Start development server on port 3000
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Starts Vite development server at `http://0.0.0.0:3000` |
| `npm run build` | Compiles TypeScript and runs `vite-react-ssg` static prerendering |
| `npm run lint` | Runs ESLint across all TypeScript and React components |
| `npm run typecheck` | Validates TypeScript types across the entire project |
| `npm test` | Runs Vitest unit and integration test suite |
| `npm run preview` | Previews the generated static production build locally |

---

## 📚 Technical Documentation (MkDocs)

The comprehensive technical documentation is built with MkDocs and hosted on GitHub Pages:
- 📖 **Live Documentation**: [https://goldi0002.github.io/devtoolbox/](https://goldi0002.github.io/devtoolbox/)

To preview the documentation locally:
```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

Documentation topics covered:
- [Installation Guide](docs/INSTALLATION.md)
- [Architecture & Data Strategy](docs/ARCHITECTURE.md)
- [Design System & Theme Tokens](docs/DESIGN.md)
- [Usage & Power Features](docs/USAGE.md)
- [Deployment & CI/CD](docs/DEPLOYMENT.md)
- [Product Roadmap](docs/ROADMAP.md)
- [Task Tracking](docs/TASKS.md)
- [Changelog](docs/CHANGELOG.md)

---

## 🛡️ Security & Privacy Policy

ToolBox4Devs has a strict **zero-telemetry, zero-exfiltration** policy.
- No network requests are made during tool execution.
- No tracking pixels, analytics cookies, or session recorders on input data.
- For vulnerability reports or security concerns, please review our [Security Policy](SECURITY.md).

---

## 🤝 Contributing

Contributions of new tools, bug fixes, and documentation improvements are welcome!
Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before submitting a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
