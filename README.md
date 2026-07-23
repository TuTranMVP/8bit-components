# 8-BIT NES — component system

NES arcade CRT, dark-only, modern-crisp. Cross-framework by design.

## Install

Reusable across every project in the studio — install it into any repo, no build step.

```bash
# from npm (once published)
pnpm add 8bit-nes

# or straight from GitHub — no publish needed
pnpm add github:TuTranMVP/8bit-components
```

```js
// once, at app entry:
import "8bit-nes/all.css";   // tokens + base + components
import "8bit-nes";           // registers <nes-*> web components
```

Or granular: `8bit-nes/tokens.css`, `8bit-nes/base.css`, `8bit-nes/components.css`,
`8bit-nes/elements.js`. The `exports` map keeps every entry addressable; `sideEffects` is
declared so bundlers keep the CSS and the custom-element registration.

> **Zero build, zero runtime deps.** It ships plain CSS + one ES module, so it drops into a
> Vite/Nuxt/Next app, a plain HTML page, or another design-system package all the same.

## Release flow (maintainer)

1. Bump `version` in `package.json` → commit.
2. `git tag vX.Y.Z && git push --follow-tags`.
3. GitHub Action `release.yml` gates on `pnpm check`, verifies tag == version, publishes to npm **with provenance**.

## Files (ROI order — stop anywhere, still useful)

| File                    | Layer              | Contains                                                                                      | Depends on         |
|-------------------------|--------------------|-----------------------------------------------------------------------------------------------|--------------------|
| `tokens.css`            | source of truth    | `:root` vars, 3 `@font-face`, `@layer` order                                                  | —                  |
| `base.css`              | reset + primitives | reset, focus→gold, reduced-motion, `.pixel-box` (notch), elevation, accent mapper, motion     | tokens             |
| `components.css`        | stateless recipes  | Element/Form/Feedback/Nav/Overlay/Data recipes (see catalog below)                            | tokens, base       |
| `elements.js`           | stateful           | `<nes-quiz> <nes-hud> <nes-collapsible> <nes-sound> <nes-tabs>` + `store/bleep/grantXP/toast` | tokens, components |
| `demo.html`             | gallery + test     | every component wired together                                                                | all                |
| `docs.html` + `docs.js` | documentation site | Nuxt-UI-style sidebar + per-component pages (Usage / preview / API / a11y)                    | all                |

**80% of the value is CSS.** `elements.js` is only for things that hold state.

### Component catalog

| Category   | Components                                                                     |
|------------|--------------------------------------------------------------------------------|
| Element    | Button · Badge · Chip · Card · Avatar · Kbd · Separator                        |
| Form       | Input · Textarea · Select · Checkbox · Radio · Switch · Field · Range · Segmented control · Number stepper |
| Feedback   | Alert (`.callout`) · Progress (`.pbar`) · Skeleton · Toast · Spinner · Meter · Empty state · Banner |
| Navigation | Tabs (`<nes-tabs>`) · Breadcrumb · Pagination · Steps · Nav list                          |
| Overlay    | Modal (`<dialog>`) · Dropdown (`<details>`) · Tooltip (`[data-tip]`) · Drawer (`<dialog>`) |
| Data       | Table · Code block · Accordion (`<nes-collapsible>`) · Stat · Rating · Description list · Timeline · Prose           |

Run the docs site locally with `pnpm demo`, then open `/docs.html`.

## The contract

Everything reads from `:root`. **Change the look in `tokens.css`, never in a component.**
One block = one accent: set `data-accent="blue|gold|cyan|purple|good|warn|crit"`, and the
button / card / chip downstream picks it up via `--accent`.

## Signature

The **button** is the one bold element — but by **hard shadow** (`box-shadow: Npx Npx 0`, zero
blur) + **press-in on `:active`**, not a corner trick. Every surface, buttons included, is a
**square** 90° corner (never a radius, never a chamfer), hard border, hard shadow. Full rationale
in [DESIGN.md](DESIGN.md).

## Fonts (bundled, self-hosted)

- `fonts/nes-mono-400.woff2` / `-700.woff2` — NES Mono: chrome, labels, numbers, code.
- `fonts/nes-sans-var.woff2` — NES Sans variable (wght 300–700): body, đọc tiếng Việt có dấu.

Latin + Vietnamese subset (~171KB tổng), full diacritic coverage verified. License: `fonts/LICENSE-FONTS.txt` (SIL OFL 1.1).
Zero-FOUT: preload 2 file critical — snippet trong comment đầu `tokens.css`.
## Wire it up

### Plain HTML
```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script type="module" src="elements.js"></script>
```

### Vue 3 / Nuxt
Import the CSS once (e.g. in `main.ts` / `nuxt.config`), import `elements.js` once, then tell the
compiler `nes-*` are custom elements:
```ts
// vite / vue
compilerOptions: { isCustomElement: (t) => t.startsWith('nes-') }
// nuxt.config
vue: { compilerOptions: { isCustomElement: (t) => t.startsWith('nes-') } }
```
Then use `<nes-quiz>`, `<button class="btn">`, etc. directly in `.vue` files.

### React 19
No wrapper needed — React 19 passes props and listens to custom-element events natively.
```jsx
import './tokens.css'; import './base.css'; import './components.css'; import './elements.js';
<nes-hud ns="quest" per-level="150" max-xp="600" />
<nes-quiz xp={50} onnes:answer={e => console.log(e.detail.correct)} />
```
(React < 19: use a small `ref` wrapper for the `nes:answer` event.)

## Web components API

```html
<nes-sound></nes-sound>                     <!-- mute toggle, persists to localStorage -->

<nes-collapsible open accent="gold">
  <span slot="head">STAGE 1 · title</span>
  ...body...
</nes-collapsible>

<nes-hud ns="quest" per-level="400" max-xp="1600"></nes-hud>  <!-- listens on nes:xp bus -->

<nes-quiz xp="50">
  <script type="application/json">
  { "q":"...", "options":["A","B"], "answer":1, "explain":"..." }
  </script>
</nes-quiz>                                  <!-- correct → +XP flies into the HUD -->
```

```html
<nes-tabs>                                  <!-- roving-focus tabs, arrow keys -->
  <section data-label="Install" selected>…</section>
  <section data-label="Usage">…</section>
</nes-tabs>
```

JS helpers (named exports): `store`, `bleep(seq)`, `SFX`, `setMute/isMuted`, `grantXP(n, el)`,
`floatXP(el, text)`, `toast(msg, { accent, timeout })`.

## Extend

New component → add a recipe in `components.css`, add a token in `tokens.css` if needed.
Keep the Do/Don't: square 90° surfaces everywhere, buttons included (never a radius or chamfer),
hard shadow not blur, smooth `--ease` easing (transform/opacity), one accent per block, dark text
on solid accents, everything via token. Full guidance in [DESIGN.md](DESIGN.md).
