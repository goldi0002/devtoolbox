# Design System

The 2026 redesign replaced ad-hoc greyscale styling with a token-driven system so every theme,
component, and page shares the same colour, radius, elevation, and typography vocabulary.

## Colour tokens

Theme variables live in `src/css/global.css`. Every palette colour is declared twice:

```css
--color-bg-rgb: 255 255 255;        /* channels, used for alpha modifiers */
--color-bg:     rgb(var(--color-bg-rgb));
```

The channel form is what `tailwind.config.js` consumes
(`bg: 'rgb(var(--color-bg-rgb) / <alpha-value>)'`), which is what makes opacity utilities such as
`bg-bg/80` or `bg-surface/60` work. Before the redesign the config referenced the plain `var(...)`
form, so any utility with an opacity modifier silently produced no CSS.

| Token | Purpose |
|---|---|
| `bg`, `surface` | Page and panel backgrounds |
| `border`, `muted`, `subtle` | Hairlines, disabled text, quiet labels |
| `dim`, `light`, `bright` | Body copy through primary headings |
| `accent` | Brand/interaction colour: primary buttons, active nav, links, focus rings |
| `accent-fg` | Foreground colour that is legible on top of `accent` |
| `accent-soft` | Low-alpha accent tint for chips, badges, and hovers |

Each theme (`dark`, `sepia`, `nord`, `terminal`, `toolbox4devs`, `dracula`, `solarized`, `rose`,
`monokai`) defines its own accent so the redesign works across all of them.

## Shape and elevation

`--radius-sm|md|lg` and `--shadow-soft|lift` are mapped to Tailwind's `rounded-*` and `shadow-*`
scales. Interactive surfaces lift on hover (`hover:-translate-y-1 hover:shadow-lift`) instead of
changing background colour.

## Component classes

Defined in `src/css/index.css` under `@layer components`:

- `btn-primary`, `btn-ghost` — accent-filled and outlined actions.
- `input-base`, `textarea-base` — form fields with accent focus ring.
- `card`, `surface-panel` — solid and translucent containers.
- `tag`, `chip`, `chip-active` — metadata pills and filter toggles.
- `eyebrow`, `section-heading` — the repeated uppercase label + display heading pattern.

Prefer these classes over re-declaring the same utility strings in a page.

## Accessibility rules baked into the system

- Global `:focus-visible` outline in the accent colour (`src/css/index.css`).
- A "Skip to content" link in `src/App.tsx` targeting `#main-content`.
- `prefers-reduced-motion` disables animations and smooth scrolling.
- Filter chips and favourite toggles expose `aria-pressed`; icon-only buttons carry `aria-label`.
- Diff highlighting, the page loader, and the coming-soon overlay use theme tokens instead of
  hard-coded light/dark colours so contrast holds in every theme.

## Layout shell

`src/App.tsx` renders `Navbar` → routed content (`#main-content`) → `Footer`. The footer is global,
so pages must not render their own footer rows.
