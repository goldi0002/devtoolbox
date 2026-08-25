# Contributing to ToolBox4Devs

Thank you for your interest in contributing! This guide will help you understand the project structure and walk you through the process of adding features, fixing bugs, or improving the codebase.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Philosophy](#project-philosophy)
- [Development Workflow](#development-workflow)
- [Adding a New Tool](#adding-a-new-tool)
- [Code Standards](#code-standards)
- [Verification Checklist](#verification-checklist)
- [Documentation](#documentation)
- [Security & Privacy](#security--privacy)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- Basic familiarity with React, TypeScript, and Tailwind CSS
- Familiarity with Git and GitHub workflows

### Local Setup

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/devtoolbox.git
   cd devtoolbox
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or the Vite-assigned port).

4. **Verify your setup:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

---

## Project Philosophy

ToolBox4Devs is built on these core principles:

- **100% Client-Side**: All tool processing happens in the browser. No backend, no telemetry, no external API calls (except optional, commented-out analytics).
- **Privacy-First**: User input never leaves the client. Share links are compressed and stored locally.
- **Static Site Generation**: Pages are pre-rendered at build time using Vite React SSG for instant load times and CDN compatibility.
- **Accessibility**: WCAG AA compliance is a baseline. Keyboard navigation and screen-reader support are required for all tools.
- **Maintainability**: Code is organized, typed, and well-documented. The tool registry ensures consistency across the codebase.

When contributing, prioritize these values. A fast, private, accessible tool is better than a feature-rich one that compromises these principles.

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-name
```

Use descriptive names:
- `feature/add-jwt-validator`
- `fix/share-link-parsing`
- `docs/update-architecture`

### 2. Make Your Changes

Follow the code standards below. Keep commits focused and atomic:

```bash
git commit -m "feat: add JWT validator tool"
git commit -m "fix: handle edge case in URL encoder"
```

### 3. Run Verification Commands

Before committing, always run:

```bash
npm run lint        # Fix formatting and code smells
npm run typecheck   # TypeScript type checking
npm run build       # Full production build
npm test            # Current smoke tests (type checker)
```

Fix any errors before pushing.

### 4. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub. Include:
- A clear title and description of what you changed and why
- A reference to any related issues (e.g., "Closes #42")
- Screenshots or GIFs if you modified the UI

### 5. Respond to Code Review

A maintainer will review your changes. Respond to feedback, make requested updates, and re-run verification commands.

---

## Adding a New Tool

This is the most common contribution. Follow this **8-step checklist** to ensure your tool integrates correctly.

### Step 1: Create the Tool Component

Create a new React component in `src/components/tools/<category>/`:

```typescript
// src/components/tools/crypto/SHA256Tool.tsx
import { CodeInput } from '../../CodeInput';
import { CodeBlock } from '../../CodeBlock';
import { CopyButton } from '../../CopyButton';
import { useState } from 'react';

export function SHA256Tool() {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');

  const handleChange = (value: string) => {
    setInput(value);
    // Compute SHA-256 here
    const computed = computeSHA256(value);
    setHash(computed);
  };

  return (
    <div className="space-y-4">
      <CodeInput
        value={input}
        onChange={handleChange}
        language="plaintext"
        placeholder="Enter text to hash..."
      />
      {hash && (
        <div className="space-y-2">
          <CodeBlock value={hash} language="plaintext" />
          <CopyButton text={hash} />
        </div>
      )}
    </div>
  );
}
```

**Component requirements:**
- Use TypeScript with proper types
- Include JSDoc comments for complex logic
- Handle edge cases and empty states gracefully
- Use shared UI components (`CodeInput`, `CodeBlock`, `CopyButton`, etc.)
- Ensure keyboard navigation works
- Test with a screen reader

### Step 2: Create Tool Metadata

Create a metadata file in `src/tools/meta/`:

```typescript
// src/tools/meta/sha256.ts
import { ToolMeta } from '../tool-meta';
import { SHA256Tool } from '../../components/tools/crypto/SHA256Tool';

export const sha256Meta: ToolMeta = {
  slug: 'sha256-hash',
  title: 'SHA-256 Hash Generator',
  category: 'Crypto',
  description: 'Generate SHA-256 hashes from text input',
  about: 'SHA-256 is a cryptographic hash function that produces a 256-bit hash value.',
  keywords: ['hash', 'sha-256', 'security', 'crypto'],
  component: SHA256Tool,
  status: 'stable',
};
```

**Metadata contract** (`src/tools/tool-meta.ts`):
```typescript
export interface ToolMeta {
  slug: string;                    // URL-friendly identifier
  title: string;                   // Display name
  category: string;                // One of: JSON, Encode/Decode, Text, Generators, Authentication, Web, Data, Crypto, Analyze
  description: string;             // One-line summary for listings
  about: string;                   // Longer description for tool pages
  keywords: string[];              // SEO keywords
  component: React.ComponentType;  // The tool component
  status: 'stable' | 'beta' | 'coming-soon';
}
```

### Step 3: Register the Tool in the Browser Registry

Add your tool to `src/tools/registry.ts`:

```typescript
import { sha256Meta } from './meta/sha256';

export const allTools: ToolMeta[] = [
  // ... existing tools ...
  sha256Meta,
];
```

### Step 4: Register the Tool in the Node Registry

Add your tool to `src/tools/registry-node.ts` (used for SSG and sitemap generation):

```typescript
// This mirrors the browser registry for Node-side builds
import type { ToolMeta } from './tool-meta';

const sha256Meta: ToolMeta = {
  slug: 'sha256-hash',
  title: 'SHA-256 Hash Generator',
  category: 'Crypto',
  description: 'Generate SHA-256 hashes from text input',
  about: 'SHA-256 is a cryptographic hash function that produces a 256-bit hash value.',
  keywords: ['hash', 'sha-256', 'security', 'crypto'],
  component: undefined, // Not used on Node side
  status: 'stable',
};

export const allToolsNode: ToolMeta[] = [
  // ... existing tools ...
  sha256Meta,
];
```

### Step 5: Add Routes (Auto-Generated)

Routes are automatically generated from the registry in `src/routes.tsx`. Verify the route appears by running the dev server and navigating to `/tools/sha256-hash`.

### Step 6: Add a JSON Catalog Entry

Update `public/tools.json` (or generate it as part of build):

```json
{
  "tools": [
    {
      "slug": "sha256-hash",
      "title": "SHA-256 Hash Generator",
      "category": "Crypto",
      "description": "Generate SHA-256 hashes from text input"
    }
  ]
}
```

### Step 7: Update Documentation

1. **Update `README.md`** to include your tool in the tools table if it's a new category.
2. **Update `docs/TASKS.md`** to mark your task as complete.
3. **Update `docs/ROADMAP.md`** if you've completed a roadmap item.

### Step 8: Verification Checklist

Before submitting your PR:

- [ ] Component renders without errors
- [ ] Tool is registered in both browser and Node registries
- [ ] Routes are auto-generated and accessible
- [ ] Metadata is complete and accurate
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Keyboard navigation works (Tab through all controls)
- [ ] Screen reader works (test with NVDA, JAWS, or VoiceOver)
- [ ] Share links work (if applicable)
- [ ] Tool handles empty/error states gracefully
- [ ] Documentation is updated

---

## Code Standards

### TypeScript

- **Always use TypeScript**. No JavaScript files in `src/`.
- **Strict mode enabled** in `tsconfig.json`.
- Use explicit types for function parameters and return values:
  ```typescript
  function computeHash(input: string): string {
    // ...
  }
  ```
- Avoid `any`. Use generics or union types instead.

### React and Components

- Use **functional components** with hooks.
- Prefer **composition** over nested ternaries.
- Use **React.memo** for expensive renders (e.g., CodeBlock):
  ```typescript
  export const CodeBlock = React.memo(function CodeBlock({ value }: Props) {
    // ...
  });
  ```
- Provide clear **prop types** with TypeScript interfaces:
  ```typescript
  interface CodeBlockProps {
    value: string;
    language?: string;
    readOnly?: boolean;
  }
  ```

### Styling

- Use **Tailwind CSS** utilities. Avoid inline styles or new global CSS.
- Leverage **design tokens** from `src/css/global.css`:
  ```tsx
  <button className="btn-primary">Save</button>
  <div className="card">Content</div>
  ```
- For complex, repeated utility strings, add a component class in `src/css/index.css` under `@layer components`.
- Support **dark mode** by testing in all themes (dark, sepia, nord, terminal, toolbox4devs, dracula, solarized, rose, monokai).

### Testing

- While a full test framework is being set up, write **testable code**:
  - Keep logic separate from UI (extract to util functions).
  - Avoid hard-coding values.
  - Use clear, descriptive function names.
- Add **JSDoc comments** for complex utilities:
  ```typescript
  /**
   * Computes the SHA-256 hash of the input string.
   * @param input - The text to hash
   * @returns The hex-encoded hash
   */
  export function computeSHA256(input: string): string {
    // ...
  }
  ```

### Naming Conventions

- **Components**: PascalCase (`SHA256Tool.tsx`)
- **Functions**: camelCase (`computeHash`, `formatJSON`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_INPUT_SIZE`)
- **CSS classes**: kebab-case (`btn-primary`, `card`)

### Imports and Exports

- Use **ES6 imports** and exports.
- Group imports: React, libraries, then local modules.
  ```typescript
  import React, { useState } from 'react';
  import { CodeMirror } from 'codemirror';
  import { CodeInput } from '../../CodeInput';
  import { computeHash } from '../../../utils/crypto';
  ```
- Avoid circular dependencies.

---

## Verification Checklist

Run these commands before submitting a PR:

```bash
# 1. Lint and fix formatting
npm run lint

# 2. Type check
npm run typecheck

# 3. Full production build
npm run build

# 4. Smoke tests
npm test

# 5. (Optional) Preview the build locally
npm run preview
```

All commands must pass with no errors or warnings.

---

## Documentation

**Keep documentation in sync with your changes.** Key files:

- **`README.md`** — High-level project overview, tech stack, getting started, and deployment.
- **`docs/ARCHITECTURE.md`** — System design, data flow, risks, and verification workflow.
- **`docs/DESIGN.md`** — Design tokens, component classes, accessibility rules, and layout patterns.
- **`docs/ROADMAP.md`** — Prioritized backlog, working agreement, and completion milestones.
- **`docs/TASKS.md`** — Task status and completion tracking.
- **Component JSDoc** — Comments inside tool components explaining tricky logic.

When making significant changes:
1. Update the relevant documentation file in the same PR.
2. If adding a new tool, mark it as complete in `docs/TASKS.md`.
3. If fixing a known risk from `docs/ARCHITECTURE.md`, mention it in the PR description.

---

## Security & Privacy

ToolBox4Devs is a privacy-first application. **Follow these rules:**

### ✅ Do

- Keep all processing **client-side only**.
- Use only **browser APIs** (e.g., `window`, `document`, `crypto`, `TextEncoder`).
- **Guard window/document usage** with checks for SSG safety:
  ```typescript
  if (typeof window !== 'undefined') {
    // Safe to use window
  }
  ```
- Clearly **document** when a tool uses sensitive operations (e.g., JWT decoding).
- Handle **shareable data** through compressed local hashes only.

### ❌ Don't

- Make **external API calls** (except for optional, commented-out analytics).
- Use **localStorage** without explicit user consent and clear documentation.
- **Log or track** user input except locally.
- Add **third-party scripts** (ads, analytics, trackers).
- Persist **sensitive data** (private keys, auth tokens) without user awareness.

### Security-Sensitive Tools

Tools like JWT decoder, password generator, hash tool, and basic auth header must:
- Include a disclaimer that processing is local-only.
- Not log or display sensitive outputs unexpectedly.
- Provide clear copy about what the tool does and any limitations.
- Be thoroughly tested to prevent unintended data leakage.

---

## Questions?

- **General questions**: Open a GitHub Discussion.
- **Bug reports**: Open an Issue with reproduction steps.
- **Feature requests**: Open an Issue with a use case and expected behavior.
- **Security concerns**: Email the maintainers (do not open a public issue).

---

## License

By contributing to ToolBox4Devs, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! We're excited to work with you. 🚀
