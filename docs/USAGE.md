# User Guide & Workflows

This document covers day-to-day developer workflows, power user features, keyboard navigation, and usage instructions for **ToolBox4Devs**.

---

## 🌐 Hosted Web Application

The live production application is available at:
👉 **[https://www.toolbox4devs.com](https://www.toolbox4devs.com)**

---

## 1. Fast Navigation & Command Palette

ToolBox4Devs is optimized for keyboard-first developers:

- **Open Command Palette**: Press `Cmd + K` (macOS) or `Ctrl + K` (Windows/Linux) from anywhere in the app.
- **Search Anything**: Instantly filter across all 70+ utilities by tool name, alias (e.g. `base64`, `json`, `jwt`, `curl`, `chmod`), category, or action.
- **Quick Favorites**: Click the star icon on any tool card or press `F` in the drawer to pin frequently accessed utilities to your top bar.
- **Recently Used**: The app automatically tracks your recently used utilities locally in browser `localStorage` without tracking cookies.

---

## 2. Stateless URL Sharing

ToolBox4Devs allows sharing reproducible tool states without uploading any data to an external server or database:

1. Paste or configure your data in any tool (e.g., Regex tester, JSON Schema generator, Text Diff).
2. Click the **"Share"** button in the tool header.
3. The application serializes the input state and compresses it into the URL hash fragment using `lz-string` (e.g. `https://www.toolbox4devs.com/regex#data=...`).
4. Send the link to teammates. When opened, the receiving browser decompresses and hydrates the state directly in memory.

!!! note "Security & Length Limits"
    Share URL decompression enforces a strict 250KB uncompressed memory safeguard to prevent malicious oversized payloads from causing memory exhaustion.

---

## 3. Key Tool Workflows

### 3.1. Delimited File Data Validator (`/csv-validator`)
Verify CSV, TSV, and TXT files against custom schema rules:
1. Drag and drop your delimited file or paste raw rows.
2. The engine auto-detects delimiter (comma, tab, semicolon, pipe) and infers data types.
3. Configure column constraints:
   - **Data Types**: String, Integer, Float, Boolean, Date, Email, UUID.
   - **Constraints**: Required/Non-empty, Min/Max numerical bounds, Min/Max string length.
   - **Pattern & Enum**: Custom regex patterns and comma-separated allowed options.
   - **Uniqueness**: Detect duplicate records.
4. Click **"Validate File"** for real-time row-by-row error auditing with one-click export of invalid or cleaned rows.

### 3.2. Visual Pipeline Studio (`/pipeline-studio`)
Chain multiple developer transformations into a continuous workflow:
1. Select a preset (e.g. cURL → JSON Formatter → JSON to Zod) or build a custom DAG pipeline.
2. Connect inputs and outputs between transformer nodes.
3. Observe live output bubbling down the pipeline canvas with instant copy and export options.

### 3.3. Offline PWA Usage
Install ToolBox4Devs as a native desktop or mobile application:
1. In Chrome/Edge/Brave, click the **Install App** icon in the URL bar.
2. On iOS Safari, tap **Share** → **Add to Home Screen**.
3. All assets and computation run 100% offline via the registered Service Worker.

---

## 4. Local CLI Development Commands

| Command | Action |
|---|---|
| `npm run dev` | Start development server at `http://0.0.0.0:3000` |
| `npm run build` | Generate production SSG static build in `dist/` |
| `npm run preview` | Run local HTTP server to preview static build |
| `npm run lint` | Run ESLint with zero-warning threshold |
| `npm run typecheck` | Run TypeScript compiler type checks (`tsc --noEmit`) |
| `npm test` | Run Vitest unit and integration test suites |

---

## 5. Troubleshooting & FAQ

??? question "Are my passwords or JWT tokens sent to any server?"
    **No.** All processing happens 100% in your local browser memory using the Web Crypto API. No network calls are dispatched during tool execution.

??? question "Why did my share link fail to open?"
    Share links store compressed data in the `#data=` hash fragment. If a chat client (e.g. Slack or Teams) truncates long URLs, the decompression engine may reject incomplete strings. Ensure the full URL was copied.

??? question "Can I use ToolBox4Devs without internet access?"
    **Yes.** ToolBox4Devs is an installable PWA. Once loaded once in your browser, the service worker caches all assets, making the app fully functional offline.
