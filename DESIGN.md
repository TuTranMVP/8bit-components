# 8-BIT NES — design context

> The design source of truth for contributors and agents. Read this before adding or changing any
> component. Code rules live in [`tokens.css`](tokens.css); this file explains the *why* so the
> library stays coherent.

**Thesis.** A NES-arcade component system that feels like a 1985 cabinet — but renders
**modern-crisp**: high-contrast text, pure-black outlines, zero blur. Dark-only. Cross-framework
by design (plain CSS + light-DOM web components; no build step).

---

## 1 · Principles (the contract)

1. **One source of truth.** Every color, size, shadow, and motion value lives in `tokens.css`.
   Change the look there — never hard-code a value inside a component.
2. **One accent per block.** Set `data-accent` (brand `blue|gold|cyan|purple|lime|teal|indigo|pink|steel`
   or semantic `good|warn|crit`) on a container; the button, card, chip, and badge inside inherit
   `--accent`. Color carries meaning.
3. **Spend boldness in one place.** The **button** is the signature (hard shadow + press-in on
   square corners). Everything else stays quiet so the page reads, not shouts.
4. **Crisp over cute.** If an effect softens text or an edge, it loses. Sharpness wins.
5. **Quality floor, always.** Keyboard-navigable, visible focus, ARIA wired, reduced-motion
   respected, responsive to mobile.

---

## 2 · Foundations

### Color

Dark navy grounds (chosen, not grey), three brand accents, three semantic states. All ink is
high-contrast — well above WCAG AA on `--panel`.

| Token                                 | Hex                                     | Role                                     |
|---------------------------------------|-----------------------------------------|------------------------------------------|
| `--bg`                                | `#07071c`                               | outer cabinet                            |
| `--screen`                            | `#0a0a24`                               | page background (the "screen")           |
| `--panel` / `--panel-2`               | `#15153f` / `#1c1c56`                   | raised card / secondary control          |
| `--slot`                              | `#0d0d2b`                               | recessed: input, code, empty track       |
| `--line`                              | `#000000`                               | **pure-black** hard border + hard shadow |
| `--line-hi`                           | `#4646a0`                               | inner highlight border / hover           |
| `--ink` / `--text`                    | `#f8f9ff` / `#e8eaff`                   | titles·numbers / body                    |
| `--muted` / `--dim`                   | `#c2c6f3` / `#a7ace1`                   | labels·meta / hints·captions             |
| `--blue` `--gold` `--cyan` `--purple` | `#5c94fc` `#fbd000` `#33e0e0` `#b357e0` | brand accents                            |
| `--lime` `--teal` `--indigo` `--pink` `--steel` | `#b8e62e` `#2ad8b8` `#7c7cff` `#ff6ec7` `#9aa2d8` | extended-wheel accents (fill the hue gaps) |
| `--good` `--warn` `--crit`            | `#56d364` `#ff9e2c` `#e6394a`           | success / caution / error                |
| `--primary` `--primary-d`             | → `--good` `--good-d`                   | the go/active color (green)              |
| `--ink-on-accent`                     | `#0a0a1a`                               | dark ink drawn **on** a solid accent     |

**Rules.** Never white text on gold/green/cyan — use `--ink-on-accent`. Accents are for meaning,
never decoration. **`--primary` is green (`--good`)** so the palette maps to intuition —
green = primary/positive, gold = warn/highlight, red = error; every component's default `--accent`
points at `--primary`, so retheme in one line. Semantic (`good/warn/crit`) stays separate from brand.

**Borders vs shadows (important).** `--line` (`#000`) is for **offset shadows only** — it's
invisible as a border on the dark ground. The border **on a filled/selected element** must be the
deep same-hue `--accent-d` (set beside `--accent` in the mapper), so the outer edge stays visible
and the item never reads smaller than an outlined sibling. Borders on recessed/neutral surfaces
(input, code, table-wrap) use `--line-hi`. Any recipe that sets `--accent` locally must also set
`--accent-d`, or an ancestor `data-accent` will split the fill from its border.

### Typography

Two faces, deliberately paired. Self-hosted woff2 (Latin + Vietnamese subset, full diacritics).

- **`--font-mono` — IoskeleyMono** (hi-res mono, *not* a lo-res pixel font): all chrome —
  labels, numbers, code, nav, headings. Uppercase + `--ls-chrome` tracking for labels.
- **`--font-body` — Space Grotesk** (variable 300–700): body copy, prose. Sentence case.

Type scale (rem, 16px base): `--fs-label .5625` · `--fs-chip .6875` · `--fs-h3 .75` ·
`--fs-body .84375` · `--fs-h2 1.0625` · `--fs-h1 1.625`. Only rungs that are actually used exist.

**Crisp text rules.** Reading text is bright (`--text`/`--ink`) on a **solid** ground — never over
a striped/scanline layer. Body copy in dense docs may go slightly heavier (~450) for definition.
Chrome is mono-uppercase; body is sans sentence-case. Don't mix the roles.

### Shape & corners  ← *the decision*

**Everything is a clean 90° square** — buttons included. No corner is ever cut or rounded:

- **Buttons** are square like every other surface. What makes them the signature is the
  **hard shadow + press-in** on `:active` (translate + shadow drop), not a beveled corner.
- **Every other surface** — card, callout, code block, input, select, table, modal, the docs demo
  stage — is the same **clean 90° square**. Hard border + hard shadow do the work.
- **Never a `border-radius`.** No exceptions — the base reset even zeroes UA rounding on
  `button/input/select/textarea` so the system stays square everywhere.
- The `--notch` bevel survives only as an **opt-in `.pixel-box` helper** for authors who want a
  chamfered panel; no default component uses it.

*Why:* right-angle corners are the sharpest, most uniform read and unmistakably NES (think NES
dialog boxes). A chamfer or radius on a control softens its diagonals (anti-aliasing) and breaks
the grid; keeping the whole system square makes the press-in — not a corner trick — the signature.

### Elevation — hard shadow

`box-shadow: Npx Npx 0 var(--line)` — offset, **zero blur, pure black**. Depth like a stacked
sprite, never a soft glow. Rungs `--sh-1`…`--sh-5` (1px pressed → 6px hero). On `:active`,
interactive elements drop to `--sh-1` and `translate(2px,2px)` — the press.

### Motion

**Smooth & high-FPS.** One ease-out curve — `--ease` (`cubic-bezier(.22,1,.36,1)`) and `--ease-fill`.
Animate `transform`/`opacity` where possible (compositor-only → 60fps+); avoid transitioning
layout/paint props on scroll (the docs topbar is opaque, no `backdrop-filter`). Loaders spin
`linear`. Durations `--dur-fast/-mid/-slow`. Every animation must no-op under
`prefers-reduced-motion: reduce` (handled globally in `base.css`).

### Spacing

One 4-based scale: `--sp-1 .25rem` → `--sp-7 3rem`. Compose spacing from these; don't invent
one-off pixel gaps.

### Atmosphere (Chanel rule — remove one accent)

The CRT scanline (`.scanlines`, `--scanline-opacity`) is **ambient only** and **must never sit
over reading text** — it dims and fuzzes it. Keep it off documentation surfaces; if used, put it
behind content or on decorative full-bleed chrome, and always kill it under reduced-motion.

---

## 3 · Theming

`tokens.css` is the reskin surface. To restyle the whole system, edit tokens — nothing else.
`data-accent` on any ancestor sets `--accent`, which every downstream recipe reads. `@layer` order
is `tokens, base, components, utilities` so page authors can override without `!important`.

---

## 4 · Accessibility floor

- **Focus is a feature, not an outline.** `:focus-visible` flips the border to `--gold` (+ ring).
  Never `outline:none` without a visible replacement.
- Native elements first: real `<button>`, `<dialog>`, `<details>`, `<select>`, `<input>` — free
  keyboard + AT behaviour. Add ARIA only to fill gaps (e.g. `<nes-tabs>` = full WAI-ARIA tabs).
- Color never alone: pair `crit`/`warn` states with text.
- Respect `prefers-reduced-motion`. Ship responsive down to mobile (sidebar → drawer).

---

## 5 · Content & voice

Words are design material — they help someone use the thing.

- The docs ship **bilingual — English + Vietnamese** (a global package). The switch (topbar
  `EN / VI`) persists to `localStorage` and auto-detects from `navigator.language` on first visit;
  every page's `desc` + `body` carry both languages in `docs.js`. Keep technical identifiers —
  component names, class/attribute names, code, category taxonomy — English in both languages.
- When adding a component page, write **both** `en` and `vi`. Localize the live-preview copy too,
  not just prose. The demo app (`demo.html` "CONFIG QUEST") stays Vietnamese.
- Plain and specific over clever. Active voice. Sentence case for prose; UPPERCASE only for mono
  chrome labels.
- A control says exactly what it does and keeps that name through the flow ("Lưu" → "Đã lưu").
- Errors don't apologize and are never vague: say what happened and how to fix it. Empty states
  invite an action.

---

## 6 · Do / Don't

| Do                                     | Don't                                           |
|----------------------------------------|-------------------------------------------------|
| Square surfaces everywhere, buttons too | Add `border-radius`, or chamfer a control      |
| Hard shadow (`Npx Npx 0`, black)       | Soft/blurred shadows or glows                   |
| Smooth `--ease` on transform/opacity   | Janky `steps()` easing; animating layout/paint  |
| Bright text on a solid ground          | Text over a scanline/striped layer              |
| One `data-accent` per block            | Multiple competing accents; color as decoration |
| `--ink-on-accent` on solid accents     | White text on gold/green/cyan                   |
| Every value from a token               | Hard-coded hex / px inside a component          |

---

## 7 · Component catalog

| Category   | Components                                                                     |
|------------|--------------------------------------------------------------------------------|
| Element    | Button · Badge · Chip · Card · Avatar · Kbd · Separator                        |
| Form       | Input · Textarea · Select · Checkbox · Radio · Switch · Field · Range · Segmented control |
| Feedback   | Alert (`.callout`) · Progress (`.pbar`) · Skeleton · Toast · Spinner · Meter · Empty state |
| Navigation | Tabs (`<nes-tabs>`) · Breadcrumb · Pagination · Steps                          |
| Overlay    | Modal (`<dialog>`) · Dropdown (`<details>`) · Tooltip (`[data-tip]`) · Drawer (`<dialog>`) |
| Data       | Table · Code block · Accordion (`<nes-collapsible>`) · Stat · Rating           |

Live docs: `pnpm demo`, then open `/docs.html`.

---

## 8 · Architecture

| File                    | Layer                       | Role                                                   |
|-------------------------|-----------------------------|--------------------------------------------------------|
| `tokens.css`            | `@layer tokens`             | vars, `@font-face`, layer order — the source of truth  |
| `base.css`              | `@layer base` + `utilities` | reset, focus, `.pixel-box`, accent mapper, motion      |
| `components.css`        | `@layer components`         | stateless class recipes (soft fills via `color-mix`)   |
| `elements.js`           | —                           | light-DOM web components + `store/bleep/grantXP/toast` |
| `docs.html` + `docs.js` | —                           | documentation site (dev-only, not published)           |

Published files are listed in `package.json#files` (lib only — docs/demo excluded). `biome`
formats/lints JS (`elements.js`); CSS + `demo.html`/`docs.*` are ignored (see `biome.json`).

---

## 9 · Adding a component (best practices)

1. **Recipe in `components.css`**, single-class selector, native nesting for variants. Add a token
   to `tokens.css` only if a new value is genuinely reusable.
2. **Watch specificity.** Prefer one class per component. Avoid a type-based selector and a
   class-based selector fighting over the same property (a classic source of padding/margin
   cancellation). Scope internals under the parent (`.card .title`, not a bare `.title`).
3. **Signature check.** Square surface + hard black border + hard shadow; press-in on interactive
   controls. No radius, no chamfer. Motion smooth (`--ease`, transform/opacity).
4. **Accent-ready.** Default `--accent` locally; let `data-accent` override.
5. **A11y.** Native element if one exists; visible focus; ARIA to fill gaps; reduced-motion safe.
6. **Document it** as a page in `docs.js` (desc · live preview · usage · API table · a11y note).

### Verifying visually (Windows)

Module scripts don't load over `file://`. Serve over http (tiny Node static server) and screenshot
with headless Edge for design review:

```
msedge.exe --headless=new --disable-gpu --force-device-scale-factor=2 \
  --window-size=1440,1700 --virtual-time-budget=6000 --user-data-dir=<tmp> \
  --screenshot=out.png "http://localhost:PORT/docs.html#/<route>"
```

Run screenshots **sequentially** (unique `--user-data-dir` each) — parallel launches collide.
