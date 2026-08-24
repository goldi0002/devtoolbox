export interface BlogToolCallout {
  toolName: string
  toolSlug: string
  description: string
  badgeText?: string
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string // ISO date (YYYY-MM-DD)
  readingTime: string
  tags: string[]
  author?: {
    name: string
    role: string
  }
  featuredTool?: BlogToolCallout
  relatedToolSlugs?: string[]
  /** Rendered with rich markdown support (headings, code blocks, callouts, lists, tables). */
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'mastering-large-csv-txt-streams',
    title: 'Handling 1GB+ Massive CSV and Data Files in Browser Memory Without UI Freezing',
    excerpt:
      'Explore how modern Web Streams, chunked byte indexing, and dynamic slice pagination allow browsers to inspect 1GB+ files and 100+ columns with zero memory freezing.',
    date: '2026-08-24',
    readingTime: '6 min read',
    tags: ['Performance', 'Streams', 'Data', 'WebAPIs'],
    author: {
      name: 'ToolBox4Devs Architecture Team',
      role: 'Core Platform Engineering',
    },
    featuredTool: {
      toolName: 'Massive CSV & TXT File Viewer',
      toolSlug: 'csv-txt-viewer',
      description: 'Stream, inspect, filter, and paginate multi-gigabyte CSV and TXT files instantly in browser memory.',
      badgeText: 'Live Interactive Tool',
    },
    relatedToolSlugs: ['csv-txt-viewer', 'json-to-csv', 'csv-to-markdown'],
    content: `Parsing a 500MB or 1GB CSV file in a standard web application used to mean one thing: your browser tab froze, the operating system ran low on memory, and the tab crashed with an \`Out of Memory\` (OOM) error.

Here is how modern browser primitives and zero-copy byte streaming make it possible to open, filter, and paginate gigabyte-scale datasets in microseconds — right in browser memory without sending a single byte to an external server.

## The Bottleneck: The Monolithic String Anti-Pattern

The traditional approach to handling text files in JavaScript is calling \`FileReader.readAsText()\` or \`File.text()\`. When you do this on a 1GB CSV:

1. The browser allocates a single contiguous 1GB JavaScript UTF-16 string (which actually consumes ~2GB of RAM).
2. The parsing engine (like PapaParse or custom regex) splits the string by newline \`\\n\`, creating an array of millions of sub-strings.
3. Garbage collection freezes the main JavaScript UI thread, causing complete browser unresponsiveness.

> [!WARNING]
> Storing large datasets in unified arrays causes exponential garbage collection overhead. A 1GB CSV parsed into an object tree can easily consume over 4GB of heap memory.

## The Solution: Streaming Byte Indexing

Instead of reading the entire file into JavaScript memory, we leverage the **Web Streams API** (\`File.stream()\`) and **Typed Arrays** (\`Uint8Array\`).

Here is how the ToolBox4Devs engine processes gigabyte files smoothly:

1. **First-Pass Stream Scanner**: We read the raw byte stream in 64KB binary chunks using a \`ReadableStreamDefaultReader\`.
2. **Byte-Offset Table**: We count newlines (\`byte === 10\`) and track RFC 4180 quotation boundaries (\`byte === 34\`).
3. **Sparse Indexing**: For every page batch (e.g. 100 rows), we record only the **starting byte offset** in an integer array. An index for 1,000,000 rows takes less than 80KB of RAM!
4. **On-Demand Slicing**: When the user views Page 42, the browser issues \`file.slice(startByte, endByte)\`, reads only the specific ~16KB slice, and parses just those 100 rows on the fly.

\`\`\`typescript
// Stream-based byte indexer scanning raw binary chunks
const stream = file.stream();
const reader = stream.getReader();
const pageOffsets: number[] = [0];
let rowCount = 0;
let inQuotes = false;
let processedBytes = 0;

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  for (let i = 0; i < value.length; i++) {
    const byte = value[i];
    if (byte === 34) { // Double quote "
      inQuotes = !inQuotes;
    } else if (byte === 10 && !inQuotes) { // Newline \\n
      rowCount++;
      if (rowCount % 100 === 0) {
        pageOffsets.push(processedBytes + i + 1);
      }
    }
  }
  processedBytes += value.length;
}
\`\`\`

## Handling Ultra-Wide Datasets (100+ to 1,000+ Columns)

Massive log files, database dumps, and machine learning feature matrices often contain hundreds of columns. Rendering hundreds of DOM nodes per row creates severe layout reflow lag.

To solve this, we employ:
- **Virtual Column Windowing**: Quick preset selectors allow isolating specific column ranges (e.g., Columns 1–50 or custom ranges).
- **Sticky Index Pinning**: The row number (\`#\`) stays sticky on the left while horizontal scrolling smoothly pans across 100+ columns.
- **Dynamic Type Inference**: The first 30 rows are sampled to infer column types (\`number\`, \`date\`, \`boolean\`, \`text\`) for accurate client-side sorting.

## Key Takeaways

- **Zero Memory Bloat**: Keeping only byte offsets in memory keeps heap usage under 8MB even for 1GB+ files.
- **100% Privacy**: Proprietary customer logs and database dumps never leave your local machine.
- **Immediate Interactivity**: Page 1 loads in under 50ms while background stream indexing processes the remainder of the file.`,
  },
  {
    slug: 'why-client-side-tools-matter',
    title: 'Why Client-Side Developer Tools Matter: Security, Privacy & Speed in 2026',
    excerpt:
      'Your JWTs, API keys, and code snippets should never leave your machine. Here is why browser-only tooling is the future of developer utilities.',
    date: '2026-08-18',
    readingTime: '5 min read',
    tags: ['Privacy', 'Security', 'Architecture', 'WebCrypto'],
    author: {
      name: 'ToolBox4Devs Security Team',
      role: 'Privacy & Security Research',
    },
    featuredTool: {
      toolName: 'SHA-256 & Cryptographic Hasher',
      toolSlug: 'sha256',
      description: 'Compute SHA-256, SHA-512, and SHA-1 hashes locally using hardware-accelerated Web Crypto API.',
      badgeText: 'Zero-Telemetry Tool',
    },
    relatedToolSlugs: ['sha256', 'hash-comparator', 'password-strength-analyzer', 'base64'],
    content: `Every developer keeps a graveyard of tabs open: one for formatting JSON, another for decoding a JWT, a third for generating a UUID or testing a regular expression. Each of those third-party websites represents a potential data leak.

When you paste production configuration files, private keys, database dumps, or authentication tokens into an online tool that relies on a backend API, your sensitive data transits across third-party networks, gets stored in server logs, and might be indexed by analytics or LLM training scrapers.

## The Hidden Risks of Server-Side Developer Utilities

Most generic online utilities process input by sending an HTTP POST request to a remote server. This introduces several critical security vulnerabilities:

1. **Unencrypted Logging**: Web servers, proxies, and load balancers routinely log request payloads in access and debug logs.
2. **Third-Party Telemetry**: Many tools embed session replays, tracking pixels, and advertising SDKs that intercept clipboard content.
3. **Data Residency & Compliance**: Pasting customer Personally Identifiable Information (PII) or HIPAA/GDPR-regulated data into external servers violates compliance mandates.
4. **Network Latency & Downtime**: If the remote server is experiencing latency, outages, or rate-limiting, your local workflow halts.

> [!SECURITY]
> Never paste production credentials, private RSA keys, or database connection strings into tools that make outbound network requests.

## What "100% Client-Side" Actually Means

A genuinely client-side developer tool executes exclusively within your browser's JavaScript V8/SpiderMonkey engine and WebAssembly runtime.

| Characteristic | Traditional Online Tool | ToolBox4Devs Client-Side |
| --- | --- | --- |
| Data Processing | Remote cloud server | Browser RAM / Web Workers |
| Network Calls | HTTP POST per transformation | 0 outbound network requests |
| Offline Support | Breaks without internet | Works 100% offline via PWA |
| Telemetry & Tracking | Ads, cookies, server logs | Zero analytics on user inputs |
| Execution Speed | 150ms – 2,000ms latency | Microseconds (0.1ms – 5ms) |

## Verifying Zero Telemetry in Your Browser

You do not have to take our word for it. You can verify that your data never leaves your device in seconds:

1. Open your browser's **Developer Tools** (\`F12\` or \`Cmd + Option + I\`).
2. Navigate to the **Network** tab.
3. Select **Fetch/XHR** filter.
4. Paste any sensitive payload into ToolBox4Devs (such as formatting a large JSON or decoding a JWT).
5. Notice that **zero network requests** are dispatched.

\`\`\`typescript
// How ToolBox4Devs computes SHA-256 locally via hardware-accelerated Web Crypto API
async function computeSha256Locally(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  // Pure local hardware-accelerated crypto — zero network calls
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
\`\`\`

## The Microsecond Performance Advantage

Local execution is not just a security imperative — it is significantly faster. By eliminating DNS resolution, TLS handshakes, TCP connection overhead, and server queuing, calculations complete in microseconds. Your local multicore CPU is orders of magnitude faster than a shared multi-tenant API.

## Summary

In 2026, modern browser APIs (Web Crypto API, Web Streams, Web Workers, IndexedDB, and Cache Storage) make server-side utility processing obsolete. ToolBox4Devs is committed to remaining 100% client-side, zero-tracking, and offline-first forever.`,
  },
  {
    slug: 'jwt-decoder-guide',
    title: 'A Practical Guide to Decoding and Verifying JWTs Safely',
    excerpt:
      'JSON Web Tokens carry identity claims in plain sight. Learn how to inspect header, payload, and signature — without ever pasting a token into a third-party server.',
    date: '2026-08-10',
    readingTime: '6 min read',
    tags: ['JWT', 'Security', 'Auth', 'RFC7519'],
    author: {
      name: 'ToolBox4Devs Security Team',
      role: 'Auth & Identity Architecture',
    },
    featuredTool: {
      toolName: 'JWT Decoder & Inspector',
      toolSlug: 'jwt',
      description: 'Decode, inspect, and validate JSON Web Token headers, claims, and expiration timestamps offline.',
      badgeText: 'Client-Side Inspector',
    },
    relatedToolSlugs: ['jwt', 'jwt-encoder', 'base64', 'sha256'],
    content: `If you have ever squinted at a 500-character dot-separated base64url string trying to figure out why an API request returned \`401 Unauthorized\`, this guide is for you.

JSON Web Tokens (JWT, defined in **RFC 7519**) are the industry standard for stateless authentication and authorization. However, inspecting and debugging them safely requires understanding their internal structure and avoiding common security pitfalls.

## Anatomy of a JSON Web Token

A JWT consists of three distinct parts separated by periods (\`.\`):

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYiLCJuYW1lIjoiQWxpY2UiLCJpYXQiOjE3MTYyMzkwMDB9.4z9sK...
[------ HEADER (Base64Url) ------].[------ PAYLOAD (Base64Url) ------].[--- SIGNATURE ---]
\`\`\`

### 1. Header
The header specifies the token type and cryptographic algorithm used to generate the signature:
- \`alg\`: The cryptographic algorithm (e.g. \`HS256\` for HMAC-SHA256, \`RS256\` for RSA-SHA256, \`ES256\` for ECDSA).
- \`typ\`: Token type, typically \`"JWT"\`.
- \`kid\` (Optional): Key ID used to identify which public key signed the token in a JWKS key set.

### 2. Payload (Claims)
The payload contains the **claims** — statements about the entity (typically the user) and additional metadata:

- \`iss\` (Issuer): Identifies the authorization server that issued the token.
- \`sub\` (Subject): Unique identifier for the authenticated user.
- \`aud\` (Audience): Intended recipient(s) for the token.
- \`exp\` (Expiration Time): Unix epoch timestamp after which the token is invalid.
- \`nbf\` (Not Before): Unix epoch timestamp before which the token must not be accepted.
- \`iat\` (Issued At): When the token was created.
- \`jti\` (JWT ID): Unique identifier for the token (used to prevent replay attacks).

### 3. Signature
The signature is created by taking the encoded header, encoded payload, and signing them using the private key (RS256) or secret key (HS256).

> [!NOTE]
> The Header and Payload are **NOT encrypted** — they are merely Base64Url-encoded JSON. Anyone with access to the token can read all claims. Never store database passwords, credit card numbers, or private API keys in a JWT payload.

## Browser-Native Safe JWT Decoding

Decoding a JWT does not require sending it to an external server. You can decode it directly in your browser using standard JavaScript:

\`\`\`typescript
function parseJwtSafely(token: string) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: Token must have 3 segments');
  }

  // Base64Url to standard Base64 conversion
  const base64UrlToBase64 = (str: string) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return base64;
  };

  const decodeSegment = (segment: string) => {
    const base64 = base64UrlToBase64(segment);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const jsonStr = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(jsonStr);
  };

  const header = decodeSegment(parts[0]);
  const payload = decodeSegment(parts[1]);

  return { header, payload, rawSignature: parts[2] };
}
\`\`\`

## Common Vulnerabilities and Traps

1. **Algorithm Confusion (\`"alg": "none"\`)**: Early insecure implementations accepted tokens with \`"alg": "none"\` without validating signatures. Modern verifiers must explicitly enforce allowed algorithms.
2. **Public vs Symmetric Confusion (RS256 vs HS256)**: If a backend expects an RSA public key (RS256) but an attacker signs with HMAC (HS256) using the public key as the symmetric secret, vulnerable verifiers may pass the token.
3. **Clock Skew**: Token validation should account for a small clock drift allowance (typically 30–60 seconds) when comparing \`exp\` and \`nbf\`.
4. **Token Storage: \`localStorage\` vs \`httpOnly\` Cookies**: Storing access tokens in \`localStorage\` exposes them to Cross-Site Scripting (XSS). Sensitive access tokens should reside in \`httpOnly; Secure; SameSite=Strict\` cookies or short-lived memory state.

## Rule of Thumb

Decoding a JWT tells you what it **claims**. Verifying the cryptographic signature tells you whether to **trust it**. Always use client-side tools to inspect claims and server-side libraries to enforce signatures.`,
  },
  {
    slug: 'regex-testing-workflow',
    title: 'Building a Bulletproof Regex Testing Workflow and Avoiding ReDoS',
    excerpt:
      'Regular expressions fail silently until they don\'t. A tight feedback loop with live match highlighting and ReDoS protection catches bugs before production.',
    date: '2026-07-29',
    readingTime: '5 min read',
    tags: ['Regex', 'Productivity', 'Security', 'Performance'],
    author: {
      name: 'ToolBox4Devs Engineering',
      role: 'Developer Productivity Team',
    },
    featuredTool: {
      toolName: 'Regex Tester & Debugger',
      toolSlug: 'regex',
      description: 'Test regular expressions in real-time with capture group extraction, syntax error detection, and match counters.',
      badgeText: 'Live Interactive Tool',
    },
    relatedToolSlugs: ['regex', 'slug-generator', 'case-converter', 'word-counter'],
    content: `A regular expression that passes three sample test strings can still catastrophic fail on the fourth. The solution is not mental regex computation — it is an instant feedback loop with comprehensive edge cases.

## The Power of Regular Expression Flags

The behavior of a regular expression changes drastically depending on its active flags. In JavaScript and modern regex engines:

- \`g\` (**Global**): Finds all matches across the entire text rather than stopping after the first match.
- \`i\` (**Ignore Case**): Treats uppercase and lowercase letters interchangeably (e.g. \`/abc/i\` matches \`ABC\`, \`Abc\`, and \`abc\`).
- \`m\` (**Multiline**): Changes \`^\` (start) and \`$\` (end) to match the beginning and end of each individual line instead of the entire string.
- \`s\` (**dotAll**): Allows the dot \`.\` to match newline characters (\`\\n\`, \`\\r\`), enabling multiline matching.
- \`u\` (**Unicode**): Enables full Unicode code point support and strict Unicode property escapes (\`\\p{Emoji}\`, \`\\p{Letter}\`).
- \`y\` (**Sticky**): Matches only starting from the index indicated by the \`lastIndex\` property.

## Guarding Against Catastrophic Backtracking (ReDoS)

**Regular Expression Denial of Service (ReDoS)** occurs when a pattern with nested quantifiers attempts to match an adversarial string. When the match fails, the engine tries every possible permutation, resulting in $O(2^n)$ exponential time complexity.

\`\`\`javascript
// ⚠️ DANGEROUS: Catastrophic Backtracking Pattern
const evilRegex = /^(a+)+$/;

// Testing this will freeze standard engines for seconds or minutes:
evilRegex.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!');
\`\`\`

### How to Fix Backtracking Vulnerabilities:
1. Avoid nested quantifiers like \`(a+)+\` or \`([a-zA-Z0-9]+)*\`.
2. Use atomic groupings or possessive quantifiers where available.
3. Keep tokens mutually exclusive so the engine has only one path forward.

## 5 Essential Production Regex Patterns

Here are five rigorously tested patterns for common developer tasks:

### 1. Semantic Versioning (SemVer 2.0.0)
\`\`\`regex
^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$
\`\`\`

### 2. UUID Version 4
\`\`\`regex
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
\`\`\`

### 3. ISO 8601 UTC Timestamp
\`\`\`regex
^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$
\`\`\`

### 4. URL Slug
\`\`\`regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
\`\`\`

### 5. Hexadecimal Color (3, 4, 6, or 8 digits)
\`\`\`regex
^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$
\`\`\`

## Testing Best Practices

- Always test with both **positive cases** (valid inputs) and **negative edge cases** (leading/trailing whitespace, missing segments, malicious payloads).
- Test capture groups individually to ensure your application extracts the exact sub-strings needed without extraneous characters.`,
  },
  {
    slug: 'understanding-base64-vs-hex-encoding',
    title: 'Base64 vs Hex: Which Encoding Should You Use for Binary Data?',
    excerpt:
      'Both encodings turn raw bytes into printable ASCII text, but they serve different purposes. Here is a technical comparison of overhead, charsets, and use cases.',
    date: '2026-07-15',
    readingTime: '5 min read',
    tags: ['Encoding', 'Fundamentals', 'Performance', 'Binary'],
    author: {
      name: 'ToolBox4Devs Architecture Team',
      role: 'Core Systems Engineering',
    },
    featuredTool: {
      toolName: 'Base64 & Hex Encoder/Decoder',
      toolSlug: 'base64',
      description: 'Convert between text, binary, Base64, and Hexadecimal representations instantly in browser memory.',
      badgeText: 'Instant Converter',
    },
    relatedToolSlugs: ['base64', 'hex-converter', 'color-converter', 'sha256'],
    content: `Base64 and hexadecimal (Base16) both solve the same fundamental problem: transmitting raw binary data across network protocols, databases, and formats that only safely handle printable ASCII text.

Choosing the right format depends on whether your priority is human readability, byte inspection, or payload size optimization.

## The Mathematical Difference

| Metric | Hexadecimal (Base16) | Base64 (RFC 4648) |
| --- | --- | --- |
| Bits per Character | 4 bits ($2^4 = 16$) | 6 bits ($2^6 = 64$) |
| Characters per Byte | Exactly 2 characters | ~1.33 characters (4 chars per 3 bytes) |
| Size Overhead | **+100%** (2x original size) | **+33.3%** (1.33x original size) |
| Character Set | \`0-9\`, \`a-f\` / \`A-F\` | \`A-Z\`, \`a-z\`, \`0-9\`, \`+\`, \`/\`, \`=\` |
| Case Sensitivity | Case-insensitive | **Case-sensitive** |
| URL-Safe Variant | Naturally URL-safe | Requires Base64Url (\`-\` and \`_\`) |

## When to Choose Hexadecimal

Hexadecimal represents each byte as exactly two characters (\`00\` to \`FF\`). This direct 1:1 byte mapping makes Hex ideal for:

1. **Cryptographic Hashes & Checksums**: SHA-256, MD5, and Git commit hashes are standardly formatted in hex because each byte is immediately inspectable.
2. **Memory Dumps & Low-Level Protocols**: Reading binary file headers (e.g. \`89 50 4E 47\` for PNG files or \`FF D8 FF\` for JPEG).
3. **MAC Addresses & UUIDs**: Hardware identifiers where byte grouping matters.
4. **Color Representations**: Web colors map red, green, blue, and alpha directly to two hex digits each (\`#FF5733\`).

## When to Choose Base64

Base64 packs 3 raw bytes (24 bits) into 4 printable ASCII characters. It saves significant bandwidth over Hex and is the standard for:

1. **Data URLs**: Embedding inline images, fonts, or SVGs in HTML and CSS (\`data:image/png;base64,...\`).
2. **Email Attachments (MIME)**: Standard transport for email binaries.
3. **JWT Segments**: Compact transmission of JSON claims in HTTP headers.
4. **API Payloads**: Embedding encrypted blobs, certificates, or serialized protobufs inside JSON strings.

## High-Performance Browser Conversion

You can convert between binary, hex, and base64 efficiently using modern Typed Arrays:

\`\`\`typescript
// Uint8Array to Hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Uint8Array to Base64 string
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
\`\`\`

## Important: Neither Encoding Is Encryption!

This distinction is crucial: **Base64 and Hex provide zero confidentiality or security**. Anyone with access to the encoded string can reverse it to raw bytes in microseconds without a key. If data must remain secret, encrypt it using AES-GCM or RSA first, then encode the resulting ciphertext for transport.`,
  },
  {
    slug: 'pwa-offline-dev-environment',
    title: 'Turn Your Browser into an Offline Developer Powerhouse with PWAs',
    excerpt:
      'PWAs turn the browser into an installable, cache-first runtime. Here is how to set up a developer toolbox that survives airplane mode and network outages.',
    date: '2026-06-30',
    readingTime: '5 min read',
    tags: ['PWA', 'Offline', 'Tooling', 'ServiceWorker'],
    author: {
      name: 'ToolBox4Devs Platform Team',
      role: 'Offline & PWA Systems',
    },
    featuredTool: {
      toolName: 'Unix File Permissions Calculator',
      toolSlug: 'unix-permissions-calculator',
      description: 'Calculate chmod symbolic and octal permissions with full interactive bitmask toggles offline.',
      badgeText: 'Offline Ready',
    },
    relatedToolSlugs: ['unix-permissions-calculator', 'cron-parser', 'json-formatter', 'uuid'],
    content: `Airplane Wi-Fi fails at the worst moment — usually right when you need to decode a configuration file, debug a regex, or format a database query before landing. An offline-capable developer toolbox makes network connectivity optional.

## The Architecture of a Modern Developer PWA

A **Progressive Web App (PWA)** bridges the gap between web applications and native desktop software. It combines the instant discoverability of the web with the offline reliability of local programs.

### 1. Service Worker & Cache Storage
On your first visit to ToolBox4Devs, a lightweight Service Worker registers in the background and caches the static application shell, WebAssembly modules, and client-side tool scripts using the **Cache Storage API**.

### 2. Cache-First Execution Strategy
When you open ToolBox4Devs again, the Service Worker intercepts all asset requests and serves them directly from the local cache in single-digit milliseconds without making an outbound network trip.

\`\`\`
Browser Request ──► Service Worker ──► Local Cache Storage (0ms network)
                                     └──► Instant Offline Render
\`\`\`

## Installing ToolBox4Devs as a Standalone App

You can install ToolBox4Devs directly onto your operating system:

- **Google Chrome / Brave / Edge**: Click the **Install** icon in the address bar (or the Install button in our top navigation bar).
- **macOS Safari (macOS Sonoma+)**: Click **File** > **Add to Dock**.
- **Mobile (iOS Safari)**: Tap **Share** > **Add to Home Screen**.
- **Mobile (Android Chrome)**: Tap **Menu (⋮)** > **Install app**.

Once installed, ToolBox4Devs launches in its own dedicated window without browser address bars, tabs, or chrome, integrating into your OS application switcher (\`Cmd + Tab\` / \`Alt + Tab\`).

## The Zero-Sync Philosophy

Because all transformations run 100% in client-side memory, ToolBox4Devs requires **zero account creation, zero login screens, and zero cloud sync servers**.

Your preferences, custom themes, and tool states live safely in your browser's \`localStorage\`. When you disconnect from the internet, every single one of our 70+ developer utilities continues to operate at peak performance.`,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '')
  return blogPosts.find(p => p.slug === normalized)
}

/** Newest first. */
export function getSortedPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))
}

export const blogSlugs = blogPosts.map(p => p.slug)
