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
import "8bit-nes";           // registers <mvp-*> web components
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
| `elements.js`           | stateful           | `<mvp-quiz> <mvp-hud> <mvp-collapsible> <mvp-sound> <mvp-tabs>` + `store/bleep/grantXP/toast` | tokens, components |
| `demo.html`             | gallery + test     | every component wired together                                                                | all                |
| `docs.html` + `docs.js` | documentation site | Nuxt-UI-style sidebar + per-component pages (Usage / preview / API / a11y)                    | all                |

**80% of the value is CSS.** `elements.js` is only for things that hold state.

### Component catalog

| Category   | Components                                                                     |
|------------|--------------------------------------------------------------------------------|
| Element    | Button · Badge · Chip · Card · Avatar · Kbd · Separator                        |
| Form       | Input · Textarea · Select · Checkbox · Radio · Switch · Field · Range · Segmented control |
| Feedback   | Alert (`.callout`) · Progress (`.pbar`) · Skeleton · Toast · Spinner · Meter · Empty state |
| Navigation | Tabs (`<mvp-tabs>`) · Breadcrumb · Pagination · Steps                          |
| Overlay    | Modal (`<dialog>`) · Dropdown (`<details>`) · Tooltip (`[data-tip]`) · Drawer (`<dialog>`) |
| Data       | Table · Code block · Accordion (`<mvp-collapsible>`) · Stat · Rating           |

Run the docs site locally with `pnpm demo`, then open `/docs.html`.

## The contract

Everything reads from `:root`. **Change the look in `tokens.css`, never in a component.**
One block = one accent: set `data-accent="blue|gold|cyan|purple|good|warn|crit"`, and the
button / card / chip downstream picks it up via `--accent`.

## Signature

The **button** is the one bold element: notched pixel bevel (`clip-path`) + hard shadow
(`box-shadow: Npx Npx 0`, zero blur) + press-in on `:active`. Every other surface stays quiet —
**square** 90° corners (never a radius), hard border, hard shadow. Full rationale in
[DESIGN.md](DESIGN.md).

## Fonts (bundled, self-hosted)

- `fonts/ioskeley-mono-400.woff2` / `-700.woff2` — IoskeleyMono (Iosevka build): chrome, labels, numbers, code.
- `fonts/space-grotesk-var.woff2` — Space Grotesk variable (wght 300–700): body, đọc tiếng Việt có dấu.

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
compiler `mvp-*` are custom elements:
```ts
// vite / vue
compilerOptions: { isCustomElement: (t) => t.startsWith('mvp-') }
// nuxt.config
vue: { compilerOptions: { isCustomElement: (t) => t.startsWith('mvp-') } }
```
Then use `<mvp-quiz>`, `<button class="btn">`, etc. directly in `.vue` files.

### React 19
No wrapper needed — React 19 passes props and listens to custom-element events natively.
```jsx
import './tokens.css'; import './base.css'; import './components.css'; import './elements.js';
<mvp-hud ns="quest" per-level="150" max-xp="600" />
<mvp-quiz xp={50} onmvp:answer={e => console.log(e.detail.correct)} />
```
(React < 19: use a small `ref` wrapper for the `mvp:answer` event.)

## Web components API

```html
<mvp-sound></mvp-sound>                     <!-- mute toggle, persists to localStorage -->

<mvp-collapsible open accent="gold">
  <span slot="head">STAGE 1 · title</span>
  ...body...
</mvp-collapsible>

<mvp-hud ns="quest" per-level="400" max-xp="1600"></mvp-hud>  <!-- listens on mvp:xp bus -->

<mvp-quiz xp="50">
  <script type="application/json">
  { "q":"...", "options":["A","B"], "answer":1, "explain":"..." }
  </script>
</mvp-quiz>                                  <!-- correct → +XP flies into the HUD -->
```

```html
<mvp-tabs>                                  <!-- roving-focus tabs, arrow keys -->
  <section data-label="Install" selected>…</section>
  <section data-label="Usage">…</section>
</mvp-tabs>
```

JS helpers (named exports): `store`, `bleep(seq)`, `SFX`, `setMute/isMuted`, `grantXP(n, el)`,
`floatXP(el, text)`, `toast(msg, { accent, timeout })`.

## Extend

New component → add a recipe in `components.css`, add a token in `tokens.css` if needed.
Keep the Do/Don't: square surfaces & beveled buttons (never a radius), hard shadow not blur,
`steps()` not smooth easing, one accent per block, dark text on solid accents, everything via
token. Full guidance in [DESIGN.md](DESIGN.md).
