# Design System & UI Architecture

ToolBox4Devs features a cohesive, token-driven developer design system. Built on top of Tailwind CSS with custom CSS variable channels, every theme, component, and tool interface shares the same color, radius, elevation, and typography vocabulary.

---

## 🌐 Hosted Web Application

👉 **[https://www.toolbox4devs.com](https://www.toolbox4devs.com)**

---

## 1. Color Token Architecture

Theme variables live in `src/css/global.css`. To support Tailwind CSS opacity modifiers (such as `bg-surface/80` or `border-border/60`), every palette color is declared twice:

```css
/* 1. RGB channel format (consumed by Tailwind alpha modifiers) */
--color-bg-rgb: 15 15 17;

/* 2. Standard CSS color format */
--color-bg: rgb(var(--color-bg-rgb));
```

In `tailwind.config.js`, tokens are mapped using the dynamic `<alpha-value>` placeholder:

```javascript
colors: {
  bg: 'rgb(var(--color-bg-rgb) / <alpha-value>)',
  surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
  border: 'rgb(var(--color-border-rgb) / <alpha-value>)',
  accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
  // ...
}
```

### Core Design Tokens

| Token | Semantic Purpose |
|---|---|
| `bg` | Application background (viewport body) |
| `surface` | Card surfaces, tool containers, modal backgrounds |
| `border` | Hairlines, card borders, table dividers |
| `muted` | Low-emphasis backgrounds, disabled states, subtle hover fills |
| `subtle` | Quiet metadata labels, helper text, timestamps |
| `dim` | Secondary copy, descriptions, non-active buttons |
| `light` | High-readability body copy |
| `bright` | Headings, primary metrics, active selection text |
| `accent` | Brand & interaction color: primary buttons, active tabs, focus rings |
| `accent-fg` | High-contrast foreground color on top of `accent` |
| `accent-soft` | Low-alpha accent tint for badges, subtle tags, and highlights |

---

## 2. The 10 Developer Themes

Users can toggle their preferred workspace theme at any time via the Theme Picker or Command Palette (`Cmd + K`):

1. **Dark (Default)**: Neutral slate `#0f0f11` background with vibrant indigo `#6366f1` accent.
2. **Dracula**: Classic dark theme inspired by the vampire palette with iconic purple and pink highlights.
3. **Nord**: Arctic, north-bluish palette based on the acclaimed Nord color palette.
4. **Terminal / Matrix**: Retro CRT green-on-black phosphor look for terminal purists.
5. **Monokai Pro**: Vibrant amber and magenta accents on rich charcoal.
6. **Rose Pine**: Soft pastel dusk palette with gentle muted contrasts.
7. **Solarized Dark**: Precision low-contrast color science designed for extended coding sessions.
8. **Sepia / Warm**: Paper-like warm tones ideal for reading extensive logs and long documents.
9. **High Contrast**: Maximum accessibility AA/AAA border definitions for daylight visibility.
10. **ToolBox Brand**: Distinctive signature cyan and deep navy engineering aesthetic.

---

## 3. Typography Hierarchy

The UI pairs crisp geometric sans-serif typefaces for structure with specialized monospace fonts for code and tabular numerals:

- **Body & Controls**: `DM Sans`, `Inter`, `Plus Jakarta Sans`
- **Code & Numeric Data**: `JetBrains Mono`, `Fira Code`, `Geist Mono` (`tabular-nums`)
- **Display Headings**: `Space Grotesk`, `Bebas Neue`

All code outputs, row numbers, byte counts, and execution metrics strictly use `font-mono` with `tabular-nums` alignment to prevent visual jitter during live updates.

---

## 4. Reusable Component Classes

Defined in `src/css/index.css` under `@layer components`:

```css
/* Primary Action Button */
.btn-primary {
  @apply inline-flex items-center justify-center gap-2 bg-accent text-accent-fg px-4 py-2 rounded-md
         text-sm font-medium font-sans shadow-soft transition-all duration-200
         hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft;
}

/* Outlined Ghost Button */
.btn-ghost {
  @apply inline-flex items-center justify-center gap-2 bg-transparent border border-border text-dim
         px-4 py-2 rounded-md text-sm font-medium font-sans transition-all duration-200
         hover:border-accent hover:text-bright hover:bg-accent-soft;
}

/* Card Container */
.card {
  @apply bg-surface border border-border rounded-lg p-5 transition-all duration-200;
}

/* Form Inputs */
.input-base {
  @apply bg-surface border border-border rounded-md px-3 py-2 text-sm text-bright
         font-mono placeholder:text-subtle focus:outline-none focus:border-accent
         focus:ring-2 focus:ring-accent-soft transition-colors duration-200 w-full;
}
```

---

## 5. Accessibility & Zero-Pill Discipline

- **Zero-Pill Typography**: Status headers and secondary metadata avoid excessive rounded badges; they use clean typographical separators (e.g. `Row 42 · Column 'email' · Invalid Regex`).
- **Focus Rings**: Standard `:focus-visible` ring (`outline: 2px solid var(--color-accent)`) across all interactive buttons, inputs, and tab stops.
- **Skip Link**: Top-level `<a href="#main-content">Skip to content</a>` enables rapid screen-reader navigation.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by dampening all CSS transitions and transform animations.
