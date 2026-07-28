# 8-BIT NES — component system

NES arcade CRT, dark-only, modern-crisp. Cross-framework by design.

## Install

Reusable across every project in the studio — install it into any repo, no build step.

```bash
# from npm — always the current release
pnpm add 8bit-nes

# or straight from GitHub (a tag is a valid spec too)
pnpm add github:TuTranMVP/8bit-components#v0.8.0
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
it's one request instead of four. This is the whole recommended `<head>`, tuned for a cold
visit (copy it verbatim — every line earns its place):

```html
<!-- 1. one origin for every byte → one DNS + TLS handshake, warmed early -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>

<!-- 2. fonts, at the exact URLs all.min.css resolves url() to → fetched once, in parallel
        with the stylesheet instead of after it -->
<link rel="preload" as="font" type="font/woff2" crossorigin
  href="https://cdn.jsdelivr.net/npm/8bit-nes@0.8.0/fonts/nes-sans-var.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin
  href="https://cdn.jsdelivr.net/npm/8bit-nes@0.8.0/fonts/nes-mono-400.woff2">

<!-- 3. the system: pinned version + byte-pinned integrity -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/8bit-nes@0.8.0/all.min.css"
  integrity="sha384-YjUQdJzr1cqnL44Moa7B2my1xHGiLtUSLU/57XrhKVRG3g1/meDerT3b5RByfvGJ"
  crossorigin="anonymous">
<script type="module" src="https://cdn.jsdelivr.net/npm/8bit-nes@0.8.0/elements.min.js"
  integrity="sha384-fSlpqvafjEUAMGdFGdQm7jTgwi65JzBFbmg4cpxJ6E8soR33VyteackyR5U4jfTQ"
  crossorigin="anonymous"></script>
```

Why it's shaped like that:

- **Pin the version.** A pinned `@x.y.z` URL is immutable — jsDelivr serves it `max-age=31536000, immutable`,
  so a repeat visit costs zero requests. A bare `/npm/8bit-nes/all.min.css` is a *mutable* alias:
  it revalidates every 7 days and costs a redirect hop on the first hit. Bump the number to
  upgrade; nothing silently changes underneath a shipped page. A `@0.7` range is the middle
  ground (patches auto-adopt, still cached a week).
- **Preload only the two fonts above the fold.** `nes-sans-var.woff2` (body) and
  `nes-mono-400.woff2` (chrome/labels). The 700-weight mono is left to `font-display: swap`.
  The preload `href` must match the CSS-resolved URL *character for character* — same version,
  same path — or the browser downloads each font twice.
- **`integrity` + `crossorigin`.** A pinned URL trusts the CDN not to swap the file; a hash
  doesn't have to. Digests for every shipped asset (both minified entries, the granular CSS,
  the fonts, the RAG artifacts) live in [`sri.json`](sri.json), generated from the build by
  `scripts/gen-sri.mjs` and published at
  [`/sri.json`](https://tutranmvp.github.io/8bit-components/sri.json) — read it, don't retype it:

  ```js
  const sri = await (await fetch("https://tutranmvp.github.io/8bit-components/sri.json")).json();
  sri.files["all.min.css"]; // "sha384-…"  · sri.cdn is the matching pinned base URL
  ```

  The hashes above belong to the version pinned above. They change with every release — regenerate (`pnpm gen:sri`)
  or re-fetch `sri.json` when you bump, or the browser will (correctly) refuse the file.
- **Fonts don't need a separate request budget.** The whole system is 4 files: 75 kB CSS +
  79 kB ESM + 2 woff2 (both subset with `unicode-range`), all Brotli'd by the CDN.

`<script type="module">` is deferred by definition, so it never blocks the parser — the
custom elements register on their own and upgrade whatever `<nes-*>` markup is already in the
DOM. Nothing to call, no wrapper.

Copy-paste starter, already wired exactly like the above:
[`examples/cdn-starter.html`](examples/cdn-starter.html) — also live on the docs site at
`/examples/cdn-starter.html`.

> **unpkg instead?** Same paths (`https://unpkg.com/8bit-nes@0.8.0/all.min.css`) and the same
> SRI digests — it's the identical npm tarball. Pick *one* origin per page, though: two CDNs
> means two handshakes for no benefit.

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
| Form       | Input · Textarea · Select · Checkbox · CheckboxGroup · Radio · RadioGroup · Switch · Field · **Form** (`<nes-form>`) · Slider (`.range`) · Segmented control · Switcher (`<nes-switcher>` — ◀/▶ option cycler) · InputNumber (`<nes-number>`) · InputRating (`<nes-rating>`) · InputTags (`<nes-tags>`) · PinInput (`<nes-pin>`) · ColorPicker · InputDate · InputTime · FileUpload (`<nes-file>`) · Listbox (`<nes-listbox>`) · InputMenu (`<nes-input-menu>`) · SelectMenu (`<nes-select-menu>`) |
| Feedback   | Alert (`.callout`) · Progress (`.pbar`) · Skeleton · Toast · Spinner · Meter · Empty state · Banner |
| Navigation | Tabs (`<nes-tabs>`) · Breadcrumb · Pagination · Steps · Nav list · **Map of Content** (`<nes-toc>` — the live "on this page" index: builds itself from your headings, scroll-spy, mobile-first collapsible bar naming the current section → sticky rail when there's room; renders as the `.outline` recipe)                          |
| Overlay    | Modal (`<dialog>`) · Dropdown (`<details>`) · Tooltip (`[data-tip]`) · Drawer (`<dialog>`) |
| Data       | Table · Code block · Accordion (`<nes-collapsible>`) · Stat · Rating · Description list · Timeline · Prose · Tree (`<nes-tree>`)           |
| Chat (AI)  | Chat (`.chat`) · ChatMessages (`<nes-chat-messages>`) · ChatMessage (`.msg`) · ChatPrompt (`<nes-chat-prompt>`) · ChatPromptSubmit (`.chat-submit`) · **Composer** (`.composer` + `.attach` — ChatGPT/Claude-Code-style prompt box: attachments, toolbar, model picker, send) · **Suggestions** (`.suggest` — starters / follow-ups) · **Citations** (`.cite` + `.sources` — grounded answers) · ChatReasoning · ChatTool · ChatShimmer · ChatPalette |
| Agents (AI) | Agent (`.agent`) · Context usage (`.usage`) · Trace (`.trace`) · Feedback bar (`.feedback`) — AI-First WebUI primitives: a multi-agent status roster, a context/token-budget bar, an orchestration/reasoning trace (zero-JS `<details>`), and the human-in-the-loop feedback footer. Pure CSS recipes an agent can emit straight as HTML; one shared `data-state` vocabulary (queued/thinking/running/done/error) |
| Editor (AI) | Editor (`<nes-editor>`) · EditorToolbar · EditorSuggestionMenu (`/` — incl. AI commands translate/improve/continue/fix/summarize) · EditorMentionMenu (`@`) · EditorEmojiMenu (`:`) · EditorDragHandle — VSCode-style Tab ghost + **bilingual mode** (`lang`/`target-lang`: write one language, Tab out the other) + word-count (`stats`) + AI hook, contenteditable, zero-dep |
| Typography (MDC) | CodePreview (`.code-preview`) · CodeGroup (`<nes-tabs class="code-group">`) · CodeCollapse (`<details class="code-collapse">`) · CodeTree (`<nes-code-tree>`) · CardGroup (`.card-group`) · FieldGroup (`.field-group`) · Prompt (`.prompt`) · Terminal (`.terminal`) · Diff (`.diff`) · Tasklist (`.tasklist`) · code filename header (`<nes-code file>`) — render an AI agent's streamed Markdown/MDC output as on-brand HTML (the render target, not a parser) |
| Visualize | Mermaid (`<nes-mermaid>`) · Walkthrough (`<nes-walkthrough>`, `autoplay`) · Lens (`<nes-tabs class="lens">`) · Zoom (`<nes-zoom>`) · Annotate (`<nes-annotate>`) · Compare (`<nes-compare>`) · Legend (`.legend`) — render an AI agent's Mermaid diagrams on-brand + teach a concept step-by-step, then explore (pan/zoom), point at parts (hotspots), and compare A/B. Mermaid never bundled (BYO / lazy via `enableMermaid`); everything else is zero-dep pointer + CSS |
| Second Brain | **Graph** (`<nes-graph>` — knowledge graph: force-laid-out nodes + edges, click a node to light its neighbourhood; wrap in `<nes-zoom>` to pan/zoom) · Note card (`.note`) · Backlinks (`.backlinks`) · Wiki-link (`.wikilink`, `.new` = unresolved) · Tag (`.tag`) · Properties (`.props`) · Outline (`.outline`) · Activity heatmap (`.heatmap`) · Board (`.board` — Kanban) · Command palette (`.palette`) · Search result (`.result`) · Note embed (`.embed` — transclusion) · Maturity (`.maturity` — 🌱🌿🌳) · Tag cloud (`.tag-cloud`) · Concept card (`.concept`) · Note stats (`.note-stats`) — Obsidian-style note/knowledge UI: vault cards, `[[links]]`, `#tags`, backlinks, frontmatter, kanban, quick-switcher, transclusion, digital-garden maturity, and a deterministic 0-dep knowledge graph. All stateless recipes bar the graph — an agent can emit them as HTML |
| OpenCode (vibe coding) | **Workbench** (`.workbench` — 3-pane cloud-IDE shell: rail / main / side, stacks on mobile) · Repo bar (`.repobar`) · File tabs (`.filetabs`) · Status line (`.statusline`) · Sandbox (`.sandbox` — cloud dev container) · **Plan** (`.plan` — the agent's todo with live per-step state) · **Permission** (`.perm` — allow-once / always / deny gate, command shown verbatim) · Diff stat (`.diffstat`) · File change (`.filechange` — A/M/D/R) · Hunk (`.hunk` — reviewable slice, zero-JS `<details>`) · **DiffView** (`<nes-diff>` — unified diff → on-brand markup + `nes:diff` totals) · Checks (`.checks`) · Run bar (`.runbar`) · **Logs** (`<nes-logs>` — tail-following, ring-buffered, level-filtered stream) · **App preview** (`<nes-preview>` — framed iframe, URL bar, 375/768/full) · Stack trace (`.stacktrace` — your frames lit, vendor dimmed) · Checkpoints (`.ckpt` — rewind timeline) · Deploy (`.deploy`) — the WebUI shell around an agent that writes code, for Vibe-Coding tools on web/cloud. Each recipe owns one responsibility and composes with `.diff` / `.terminal` / `.tree` / `.trace` / `.btn` / `.input` / `.segment` instead of re-implementing them; three pieces hold state, the rest is HTML an agent can emit |

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

### Vue 3.3+ / 3.5 (Vite) — verified

**1.** Install: `pnpm add 8bit-nes`

**2.** Tell the Vue compiler that `<nes-*>` are custom elements (required, or Vue errors "failed to resolve component"):
```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('nes-') } } })],
}
```

**3.** Import the CSS + register the elements **once** at the app entry:
```ts
// src/main.ts
import '8bit-nes/all.css'   // tokens + base + components
import '8bit-nes'           // registers every <nes-*> (side-effect)
```
> Vite auto-bundles the three woff2 fonts (the CSS references them with relative `url()`) — no font config.

**4.** Use classes + `<nes-*>` in any `.vue`. Custom events bubble as `CustomEvent` — read `event.detail`:
```vue
<template>
  <div data-size="lg" style="display:flex;gap:.5rem;align-items:center">
    <button class="btn" data-accent="cyan">Save</button>
    <input class="input" />
    <button class="btn icon" aria-label="Go"><nes-icon name="rocket" /></button>
  </div>
  <nes-form @nes:submit="e => console.log(e.detail)">    <!-- {data, form} -->
    <label class="field"><span class="label">Name</span><input class="input" name="name" required /></label>
    <button class="btn" type="submit">Submit</button>
  </nes-form>
</template>
```
No two-way `v-model` on `<nes-*>`; bind via `@nes:change="v = $event.detail.value"`. Inside `<nes-form>` the controls keep a hidden `<input name>` and submit with zero wiring.

**Nuxt 3** — `customElements` needs the browser, so register in a **client** plugin:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['8bit-nes/all.css'],
  vue: { compilerOptions: { isCustomElement: (t) => t.startsWith('nes-') } },
})
// plugins/8bit.client.ts
import '8bit-nes'
```

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
