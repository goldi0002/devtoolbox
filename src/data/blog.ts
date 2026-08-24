export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string // ISO date (YYYY-MM-DD)
  readingTime: string
  tags: string[]
  /** Rendered as simple paragraphs; lines starting with "## " become section headings. */
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-client-side-tools-matter',
    title: 'Why Client-Side Developer Tools Matter',
    excerpt:
      'Your JWTs, API keys, and code snippets should never leave your machine. Here is why browser-only tooling is the future of developer utilities.',
    date: '2026-08-18',
    readingTime: '5 min read',
    tags: ['Privacy', 'Architecture'],
    content: `Every developer keeps a graveyard of tabs open: one for formatting JSON, another for decoding a JWT, a third for generating a UUID. Each of those sites is a chance to paste something sensitive into someone else's server.

## The problem with server-side tools

Most online utilities work by shipping your input to a backend, processing it, and returning the result. That roundtrip means your auth tokens, private keys, and proprietary payloads transit — and often get logged on — infrastructure you do not control.

## What client-side actually means

A genuinely client-side tool computes everything in your browser's JavaScript engine. There is no fetch call, no WebSocket, no telemetry beacon. You can verify this yourself in seconds: open DevTools, watch the Network tab, and use any ToolBox4Devs utility. Nothing leaves the tab.

## The performance bonus

Skipping the network is not just about privacy. Local execution removes latency entirely — hashing, parsing, and formatting complete in microseconds instead of waiting on a server queue or rate limiter. Your CPU is faster than most shared APIs anyway.

## Try it yourself

Open any tool in the catalog, disconnect from the internet after the first load, and keep working. Because everything runs in memory, an offline connection changes nothing.`,
  },
  {
    slug: 'jwt-decoder-guide',
    title: 'A Practical Guide to Decoding JWTs Safely',
    excerpt:
      'JSON Web Tokens carry identity claims in plain sight. Learn how to inspect header, payload, and signature — without ever pasting a token into a third-party server.',
    date: '2026-08-10',
    readingTime: '6 min read',
    tags: ['JWT', 'Security', 'Auth'],
    content: `If you have ever squinted at a long base64url string trying to figure out why authentication fails, this guide is for you.

## Anatomy of a JWT

A JSON Web Token has three dot-separated parts:

- **Header** — the signing algorithm (HS256, RS256) and token type.
- **Payload** — the claims: subject, issuer, expiry (\`exp\`), issued-at (\`iat\`), and any custom data.
- **Signature** — proof the token was signed by whoever holds the secret key.

The first two segments are plain base64url-encoded JSON. Anyone can read them — which is exactly why you should never put secrets in a payload.

## Decoding without risk

Paste the token into the JWT Decoder tool and it splits the token locally, decodes each segment, and pretty-prints the JSON with syntax highlighting. Expired tokens are flagged instantly by comparing \`exp\` against your local clock. Nothing is transmitted anywhere.

## Common failure modes

1. **Expired token** — \`exp\` is in the past. Re-authenticate.
2. **Wrong algorithm assumption** — the header says RS256 but your verifier expects HS256.
3. **Audience mismatch** — the \`aud\` claim does not match the service consuming the token.
4. **Tampered signature** — the signature no longer validates against the key.

## Rule of thumb

Decoding a JWT tells you what it *claims*. Verifying the signature tells you whether to believe it. Always verify server-side.`,
  },
  {
    slug: 'regex-testing-workflow',
    title: 'Building a Fast Regex Testing Workflow',
    excerpt:
      'Regular expressions fail silently until they don\'t. A tight feedback loop with live match highlighting catches bugs before they reach production.',
    date: '2026-07-29',
    readingTime: '4 min read',
    tags: ['Regex', 'Productivity'],
    content: `A regex that works on three test strings can still fall over on the fourth. The fix is not more brainpower — it's a better feedback loop.

## Live highlighting beats guessing

Instead of running your pattern mentally, paste sample text into the Regex Tester and see every match highlighted in real time. Capture groups render separately so you can see exactly what the engine extracts versus what it merely touches.

## Flags change everything

The same pattern behaves differently under \`g\`, \`i\`, \`m\`, and \`s\`. Toggling flags live is far cheaper than redeploying to find out. In particular:

- \`g\` — find all matches, not just the first.
- \`i\` — case-insensitive matching for user-supplied text.
- \`m\` — make \`^\` and \`$\` respect line breaks.

## Watch out for catastrophic backtracking

Nested quantifiers like \`(a+)+\` can explode combinatorially on adversarial input. If your tester hangs on a pathological string, your production code will hang too — treat slow regexes as bugs.

## Keep snippets handy

Save patterns you debug alongside their test cases. Six months from now, the test input explains the regex better than any comment can.`,
  },
  {
    slug: 'understanding-base64-vs-hex-encoding',
    title: 'Base64 vs Hex: Which Encoding Should You Use?',
    excerpt:
      'Both encodings turn bytes into printable text, but they serve different purposes. Here is when each one belongs in your toolkit.',
    date: '2026-07-15',
    readingTime: '5 min read',
    tags: ['Encoding', 'Fundamentals'],
    content: `Base64 and hexadecimal both solve the same core problem: transmitting raw binary through systems that only handle text. Choosing between them is about context.

## Hexadecimal: the debugging format

Hex maps one byte to exactly two characters (0-9, A-F). It doubles the size of your data, but every byte boundary stays visible, making hex ideal for hashes, checksums, MAC addresses, and low-level protocol inspection. When you see \`de-ad-be-ef\`, you are reading memory.

## Base64: the transport format

Base64 packs three bytes into four characters — roughly a 33% overhead versus hex's 100%. It is the default for embedding images inline in CSS, encoding attachments in email (MIME), and stuffing binary blobs into JSON or HTTP headers where raw bytes would break parsers.

## Neither is encryption

This bears repeating: base64 and hex provide zero confidentiality. Encoding is a reversible transformation anyone can decode. If data must stay secret, encrypt it first — then encode if the transport requires text.

## Convert quickly

When a hash comes back hex-encoded but an API expects base64, convert rather than re-hash. Both directions are instant in the Base64 and Hex tools, entirely offline.`,
  },
  {
    slug: 'pwa-offline-dev-environment',
    title: 'Your Browser Is an Offline Dev Environment',
    excerpt:
      'PWAs turned the browser into an installable, cache-first runtime. Here is how to set up a toolbox that survives airplane mode.',
    date: '2026-06-30',
    readingTime: '4 min read',
    tags: ['PWA', 'Offline', 'Tooling'],
    content: `Airplane Wi-Fi fails at the worst moment — usually right when you need to decode a config file before landing. An offline-capable toolbox makes connectivity optional.

## Install once, run anywhere

ToolBox4Devs ships as a Progressive Web App. Hit the install button in your browser's address bar (or the Install button in the navbar) and the app lands in your dock or home screen like a native program, launching in its own window without browser chrome.

## How the caching works

On first load, a service worker stores the application shell and all static assets in the Cache Storage API. After that, opening the app never touches the network unless you tell it to. The navbar shows an amber badge whenever you go offline, so you always know your state.

## What works offline

Everything. Formatters, encoders, cryptographic generators, converters — all compute locally. About the only thing that needs a connection is downloading the app the very first time.

## Zero-sync philosophy

Because nothing is uploaded, there is no account to sign into and no state to reconcile across devices. Your preferences live in localStorage on each machine, which is exactly as private as it sounds.`,
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
