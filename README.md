# 8-BIT DOPAMINE — component system

NES arcade CRT, dark-only, modern-crisp. Cross-framework by design.

## Install

```bash
pnpm add @yourscope/8bit-dopamine
```

```js
// once, at app entry:
import "@yourscope/8bit-dopamine/all.css";   // tokens + base + components
import "@yourscope/8bit-dopamine";           // registers <mvp-*> web components
```

Or granular: `@yourscope/8bit-dopamine/tokens.css`, `.../base.css`, `.../components.css`.

## Release flow (maintainer)

1. Bump `version` in `package.json` → commit.
2. `git tag vX.Y.Z && git push --follow-tags`.
3. GitHub Action `release.yml` gates on `pnpm check`, verifies tag == version, publishes to npm **with provenance**.

## Files (ROI order — stop anywhere, still useful)

| File | Layer | Contains | Depends on |
|---|---|---|---|
| `tokens.css` | source of truth | `:root` vars, 2 `@font-face`, `@layer` order | — |
| `base.css` | reset + primitives | reset, focus→gold, reduced-motion, `.pixel-box` (notch), elevation, accent mapper, motion | tokens |
| `components.css` | stateless recipes | `.btn .card .callout .badge .chip .codeblock .pbar .stat .opt` | tokens, base |
| `elements.js` | stateful | `<mvp-quiz> <mvp-hud> <mvp-collapsible> <mvp-sound>` + `store/bleep/grantXP` | tokens, components |
| `demo.html` | gallery + test | every component wired together | all |

**80% of the value is CSS.** `elements.js` is only for things that hold state.

## The contract

Everything reads from `:root`. **Change the look in `tokens.css`, never in a component.**
One block = one accent: set `data-accent="blue|gold|cyan|purple|good|warn|crit"`, and the
button / card / chip downstream picks it up via `--accent`.

## Signature

Notched pixel box (`clip-path`) + hard shadow (`box-shadow: Npx Npx 0`, zero blur) + press-in on
`:active`. That's the one memorable thing — everything else stays quiet.

## Fonts (drop-in)

Self-host two woff2 (Latin + Vietnamese subset) into `./fonts/`:
- `ioskeley-mono.woff2` — IoskeleyMono (Iosevka build). Chrome, labels, numbers, code, JSON.
- `space-grotesk.woff2` — Space Grotesk variable. Body (đọc tiếng Việt có dấu).

Both are SIL OFL. `@font-face` is already declared in `tokens.css`; until the files exist the
stack falls back to `ui-monospace` / `system-ui` (the demo does this via Google Fonts).

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

JS helpers (named exports): `store`, `bleep(seq)`, `SFX`, `setMute/isMuted`, `grantXP(n, el)`,
`floatXP(el, text)`.

## Extend

New component → add a recipe in `components.css`, add a token in `tokens.css` if needed.
Keep the Do/Don't: notch not radius, hard shadow not blur, `steps()` not smooth easing,
one accent per block, dark text on solid accents, everything via token.
