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

## CDN / no build

No bundler? Link the **minified, single-file** build — the three `@import`s are inlined, so
it's one request instead of four:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/8bit-nes/all.min.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/8bit-nes/elements.min.js"></script>
```

Copy-paste starter (pinned, works before npm publish): [`examples/cdn-starter.html`](examples/cdn-starter.html)
— also live on the docs site at `/examples/cdn-starter.html`.

## For AI agents (RAG-ready)

This library is built to be consumed by AI coding agents in **other** repos — so they can retrieve
the *official* API and generate correct 8-BIT NES markup. Canonical, machine-readable docs follow the
[llms.txt](https://llmstxt.org) convention and are generated from the docs source (never drift):

| Artifact | URL | Use |
|----------|-----|-----|
| `llms.txt` | `https://tutranmvp.github.io/8bit-components/llms.txt` | discovery index (title, install, every component + deep link) |
| `llms-full.txt` | `.../llms-full.txt` | complete flat-text reference to ingest/chunk for RAG (contract, rules, verified examples, all components) |
| `components.json` | `.../components.json` | structured manifest — exact `{ id, name, category, selector, kind, description, docs }` per component |

They're also shipped **inside the npm package**, so an agent working in a consuming repo can read them
straight from `node_modules`:

```js
import manifest from "8bit-nes/components.json" with { type: "json" };
// or read node_modules/8bit-nes/llms-full.txt
```

`pnpm gen:llms` regenerates all three from `docs.js`; CI fails if the committed copies are stale.

## Size & performance

| File            | raw    | gzip   | notes                                             |
|-----------------|--------|--------|---------------------------------------------------|
| `all.min.css`   | ~33 kB | ~7 kB  | tokens + base + components, bundled & minified    |
| `elements.min.js` | ~9 kB | ~4 kB | all six `<nes-*>` + helpers, minified ESM         |

- **No-build / CDN** → the `.min` files above (fewest bytes, one request each).
- **Bundler (Vite/Nuxt/Next)** → import the **sources** (`8bit-nes`, `8bit-nes/all.css`); your
  pipeline minifies, and JS **tree-shakes** the named helpers you don't use (`toast`, `grantXP`,
  `highlightCode`, …). The `<nes-*>` registration is a deliberate side effect (`sideEffects` set),
  so importing the module always wires the components.
- **CSS** is one layer set; drop what you don't need at the file level via the granular imports.
- `pnpm build` (esbuild) regenerates the `.min` files; CI fails if the committed ones are stale.

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
| `elements.js`           | stateful           | app: `<nes-quiz> <nes-hud> <nes-collapsible> <nes-sound> <nes-tabs> <nes-code>`; form: `<nes-form> <nes-number> <nes-rating> <nes-tags> <nes-pin> <nes-file> <nes-listbox> <nes-input-menu> <nes-select-menu>`; data: `<nes-tree>`; chat: `<nes-chat-prompt> <nes-chat-messages>`; editor: `<nes-editor>`; typography: `<nes-code-tree>`; visualize: `<nes-mermaid> <nes-walkthrough> <nes-zoom> <nes-annotate> <nes-compare>` + `store/bleep/grantXP/toast/enableMermaid` | tokens, components |
| `icons.js`              | pixel icons        | tree-shakeable `<svg>`-string exports + `icon()` helper; `<nes-icon>` renders by name         | —                  |
| `demo.html`             | gallery + test     | every component wired together                                                                | all                |
| `docs.html` + `docs.js` | documentation site | Nuxt-UI-style sidebar + per-component pages (Usage / preview / API / a11y)                    | all                |

**80% of the value is CSS.** `elements.js` is only for things that hold state.

### Component catalog

| Category   | Components                                                                     |
|------------|--------------------------------------------------------------------------------|
| Element    | Button · Badge · Chip · Card · Avatar · Kbd · Separator · Icon (`<nes-icon>` / `8bit-nes/icons`) |
| Form       | Input · Textarea · Select · Checkbox · CheckboxGroup · Radio · RadioGroup · Switch · Field · **Form** (`<nes-form>`) · Slider (`.range`) · Segmented control · InputNumber (`<nes-number>`) · InputRating (`<nes-rating>`) · InputTags (`<nes-tags>`) · PinInput (`<nes-pin>`) · ColorPicker · InputDate · InputTime · FileUpload (`<nes-file>`) · Listbox (`<nes-listbox>`) · InputMenu (`<nes-input-menu>`) · SelectMenu (`<nes-select-menu>`) |
| Feedback   | Alert (`.callout`) · Progress (`.pbar`) · Skeleton · Toast · Spinner · Meter · Empty state · Banner |
| Navigation | Tabs (`<nes-tabs>`) · Breadcrumb · Pagination · Steps · Nav list                          |
| Overlay    | Modal (`<dialog>`) · Dropdown (`<details>`) · Tooltip (`[data-tip]`) · Drawer (`<dialog>`) |
| Data       | Table · Code block · Accordion (`<nes-collapsible>`) · Stat · Rating · Description list · Timeline · Prose · Tree (`<nes-tree>`)           |
| Chat (AI)  | Chat (`.chat`) · ChatMessages (`<nes-chat-messages>`) · ChatMessage (`.msg`) · ChatPrompt (`<nes-chat-prompt>`) · ChatPromptSubmit (`.chat-submit`) · ChatReasoning · ChatTool · ChatShimmer · ChatPalette |
| Editor (AI) | Editor (`<nes-editor>`) · EditorToolbar · EditorSuggestionMenu (`/`) · EditorMentionMenu (`@`) · EditorEmojiMenu (`:`) · EditorDragHandle — VSCode-style Tab autocomplete + AI hook, contenteditable, zero-dep |
| Typography (MDC) | CodePreview (`.code-preview`) · CodeGroup (`<nes-tabs class="code-group">`) · CodeCollapse (`<details class="code-collapse">`) · CodeTree (`<nes-code-tree>`) · CardGroup (`.card-group`) · FieldGroup (`.field-group`) · Prompt (`.prompt`) — render an AI agent's streamed Markdown/MDC output as on-brand HTML (the render target, not a parser) |
| Visualize | Mermaid (`<nes-mermaid>`) · Walkthrough (`<nes-walkthrough>`, `autoplay`) · Lens (`<nes-tabs class="lens">`) · Zoom (`<nes-zoom>`) · Annotate (`<nes-annotate>`) · Compare (`<nes-compare>`) · Legend (`.legend`) — render an AI agent's Mermaid diagrams on-brand + teach a concept step-by-step, then explore (pan/zoom), point at parts (hotspots), and compare A/B. Mermaid never bundled (BYO / lazy via `enableMermaid`); everything else is zero-dep pointer + CSS |

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

**Weights & styles.** NES Sans is variable so any weight **300–700** is real (regular 400, medium
500, bold 700 all interpolate). NES Mono ships **400 + 700** (crisp static faces — it's chrome/code,
so no separate medium by design). **Italic** works for both: neither ships an italic face, so the
browser synthesizes oblique — `font-synthesis: style` keeps the real weights crisp (no faux-bold)
while allowing the slant, which costs **0 bytes** vs a ~100 KB italic set. `<b>/<strong>` → 700,
`<i>/<em>` → oblique.

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

### Form module

Native where it can be (Checkbox/Radio groups are a `.control-group` fieldset; ColorPicker is
`<input type="color" class="swatch">`; Date/Time are themed native inputs). Stateful controls are
`<nes-*>` that each keep a hidden `<input name>`, so they **submit inside any form with zero wiring**:

```html
<nes-form>                                  <!-- native validation → inline errors → nes:submit -->
  <label class="field"><span class="label">Email <span class="req">*</span></span>
    <input class="input" type="email" name="email" required></label>
  <nes-tags name="labels" value="agent,retro"></nes-tags>       <!-- chip input -->
  <nes-pin length="6" name="otp" numeric></nes-pin>             <!-- OTP → nes:complete -->
  <nes-select-menu name="model" placeholder="Choose model…">    <!-- searchable single-select -->
    <script type="application/json">[{"value":"opus","label":"Opus 4.8"}]</script>
  </nes-select-menu>
  <button class="btn" type="submit">CREATE</button>
</nes-form>
<script type="module">
  document.querySelector("nes-form")
    .addEventListener("nes:submit", (e) => console.log(e.detail.data));  // {email, labels, otp, model}
</script>
```

Also: `<nes-number>` (stepper), `<nes-rating>` (star input), `<nes-file>` (drop zone),
`<nes-listbox>`, `<nes-input-menu>` (free-text combobox). Custom events bubble: `nes:change`,
`nes:submit`, `nes:invalid`, `nes:complete`.

JS helpers (named exports): `store`, `bleep(seq)`, `SFX`, `setMute/isMuted`, `grantXP(n, el)`,
`floatXP(el, text)`, `toast(msg, { accent, timeout })`.

## Extend

New component → add a recipe in `components.css`, add a token in `tokens.css` if needed.
Keep the Do/Don't: square 90° surfaces everywhere, buttons included (never a radius or chamfer),
hard shadow not blur, smooth `--ease` easing (transform/opacity), one accent per block, dark text
on solid accents, everything via token. Full guidance in [DESIGN.md](DESIGN.md).
