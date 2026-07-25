# Changelog

All notable changes to `8bit-nes`. Follows [Semantic Versioning](https://semver.org).

## 0.5.1

CDN delivery hardening plus two touch-target gaps closed. No change to any token,
class or element API.

### Fixed

- **Touch (coarse pointer)**: the 16px iOS focus-zoom floor named `.textarea`, but
  `.chat-prompt` and `.composer` each wrap a *bare* `<textarea>` — the one field a
  phone user always taps — so focusing a chat box still zoomed the page. Both are
  now floored. `.chat-submit` is sized from `--ctrl-h` rather than
  `min-block-size`, so it also sat below the 44px tap zone every other control
  gets; its rung is now bumped on coarse pointers.

### Added

- **`sri.json`** — Subresource-Integrity digests (`sha384`) for all 15
  CDN-servable assets: both minified entries, the granular CSS, the two ES
  modules, the fonts and the RAG artifacts. Generated from the build by
  `scripts/gen-sri.mjs` (`pnpm gen:sri`, deterministic, CI-diffed like the other
  build artifacts), shipped inside the package and published to the docs site at
  `/sri.json`, so a consuming page can byte-pin what it loads instead of only
  version-pinning it.

### Changed

- README's CDN section is now the full recommended `<head>`: `preconnect`,
  version-pinned (`@0.5.1` → `immutable`, a year of cache) rather than the
  mutable bare alias, font `preload` at the exact URLs `all.min.css` resolves
  `url()` to, and `integrity` + `crossorigin` on both entries — with the reason
  for each line and the pinned-vs-range caching trade-off spelled out.
- `examples/cdn-starter.html` is wired to that same recipe (and now demos
  `<nes-switcher>`), so the copy-paste starter *is* the optimised setup.

## 0.5.0

### Added

- **Switcher** (`<nes-switcher>`) — cycle a small option set with ◀ / ▶ (the
  arcade settings row) for domain settings like display mode / difficulty /
  theme. Options via a child JSON script (strings or `{value,label}`); wraps
  around unless `no-wrap`; emits `nes:change {value,index}`; keeps a hidden
  `<input name>` for form submit; honours the shared `data-size` scale and
  `data-accent` (gold by default). Keyboard ← / →.

## 0.4.1

Housekeeping — no visual or API change.

- Added a `--bw-1` (1px) hairline token; the 8 raw `1px` borders (dots, tag
  pills, tiny markers) now flow from it — keeps the "every value from tokens"
  contract intact.
- Removed a byte-identical re-implementation of `.menuitem` inside
  `.editor-menu`; the editor menu now reuses the base recipe + its own
  `.k`/`.sub`/`.active` extras.

## 0.4.0

Unified control-size system — one scale so every control lines up.

### Added

- **`data-size="xs|sm|md|lg|xl"`** — a single size mechanism shared by buttons,
  inputs, selects (and any control reading `--ctrl-h`). Set it on one control,
  or on a wrapper to size a whole toolbar at once; a button now lines up
  pixel-for-pixel with an input/select at the same size.
- Size **tokens** in `tokens.css`: `--ctrl-h-{xs..xl}` (28/32/36/44/52px),
  `--ctrl-px-{xs..xl}`, `--ctrl-fs-{xs..xl}`; `--ctrl-h`/`--ctrl-pad`/`--ctrl-fs`
  are the active rung (md default).
- **`.btn.xl`** (hero CTA); the button size classes (`.xs`/`.sm`/`.lg`/`.xl`)
  are now thin aliases of the shared rung.

### Changed

- `.btn` is **height-anchored** to `--ctrl-h` (was padding-based), so buttons
  align with form controls in a row. `.btn.icon` is now a perfect square at
  every rung (via `aspect-ratio`); `.btn.link` opts out of the row height.

## 0.3.0

The ecosystem release — AI-agent, chat-box, and knowledge-management surfaces,
plus packaging hardening so other repos can integrate cleanly. Still zero-build,
zero-dependency, dark-only, square-cornered. **114 components.**

### Added

- **Button**: `.btn-group` (fuse actions into one bar; `.block` / `.stack`),
  extra-small `.btn.xs`, and a compact `.btn.icon.sm` / `.btn.icon.xs` ladder for
  dense AI toolbars. Split button composes as `.btn-group` + a caret `.btn.icon`.
- **Agents module** (AI-First): `.agent` (multi-agent status roster), `.usage`
  (context/token-budget bar), `.trace` (orchestration/reasoning trace with
  zero-JS `<details>`), `.feedback` (human-in-the-loop bar). One shared
  `data-state` vocabulary (queued/thinking/running/done/error) across agent+trace.
- **Chat**: `.composer` (+ `.attach`) — a ChatGPT/Claude-Code prompt box with an
  attachment row, toolbar, model picker and send; `.suggest` (prompt starters /
  follow-ups); `.cite` + `.sources` (grounded answers, zero-JS anchor).
- **Second Brain module** (Obsidian-style): `<nes-graph>` — a deterministic,
  0-dep force-laid-out knowledge graph (click a node to light its neighbourhood;
  wrap in `<nes-zoom>` to pan/zoom) — plus `.note`, `.backlinks`, `.wikilink`
  (+ `.new`), `.tag`, `.props`, `.outline`, `.heatmap`, `.board` (Kanban),
  `.palette` (command palette), `.result`, `.embed` (transclusion), `.maturity`
  (🌱🌿🌳), `.tag-cloud`, `.concept`, `.note-stats`.
- Button demos across the docs now use the built-in 8-bit `<nes-icon>` set.

### Changed

- **Packaging for downstream integration**: added `main` / `module` / `unpkg`
  fallbacks for `exports`-unaware tooling; `./icons*` subpaths now carry an
  explicit `types` condition; `./elements.min.js` added to `sideEffects`.
- **Types**: the ~27 `Nes*Element` declarations are now `interface`s (were
  `declare class`), so `import { NesXElement }` is a correct compile error
  instead of a runtime "no such export" — the `HTMLElementTagNameMap` typing and
  documented instance methods are unchanged.

### Fixed

- **`.tag` collision**: the InputTags (`<nes-tags>`) chip is now `.token`, so the
  Second-Brain `#tag` pill (`.tag`) no longer overrides its accent-fill styling.
- `.card:hover` no longer greys out its own accent bar (physical `border-left` →
  logical `border-inline-start`; hover now lifts the three non-accent edges).
- `<summary>` disclosure triggers now get the system gold focus ring.
- `<nes-graph>`: keyboard focus is preserved across re-renders, and malformed
  `data` (e.g. `"null"`) no longer throws.
- Minor: `.opt.bad .key` uses `--ink-on-accent`; deduped the spinner keyframe;
  logical borders on `.modal` / `.toast`; tokenised a hardcoded line-height.

## 0.2.0

The AI-agent release — six new modules that render, edit, and visualize what an
LLM produces, plus an official machine-readable reference for retrieval (RAG).
Still zero-build, zero-dependency, dark-only, square-cornered.

### Added

- **Form module** — 20 Nuxt-UI-parity controls: `<nes-form>` (native constraint
  validation → `nes:submit`), `<nes-number>`, `<nes-rating>`, `<nes-tags>`,
  `<nes-pin>`, `<nes-file>`, `<nes-listbox>`, `<nes-input-menu>`,
  `<nes-select-menu>`, plus ColorPicker / InputDate / InputTime / RadioGroup /
  CheckboxGroup / Slider / Switch / Textarea recipes.
- **AI Chat module** — `.chat`, `<nes-chat-messages>` (auto-stick scroll),
  `<nes-chat-prompt>` (auto-grow + send/stop), `.msg`, `.reasoning`, `.tool`,
  `.shimmer`, `.chat-palette`. Bring your own model via `nes:submit`.
- **Icons module** — 87 pixel SVG icons, tree-shakeable named exports +
  `icon()` helper + `<nes-icon>`; size/color/spin variants;
  `shape-rendering:geometricPrecision` for razor-sharp edges at any DPR.
- **Tree** — `<nes-tree>`: ARIA tree pattern, single/multi select, full keyboard.
- **Editor module** — `<nes-editor>`: lightweight contenteditable rich text with
  toolbar, `/` `@` `:` menus, block drag handle, VSCode-style Tab autocomplete,
  and an AI hook (`nes:ai`/`nes:suggest`). Zero dependencies.
- **Typography / MDC module** — render an agent's streamed Markdown/MDC output as
  on-brand HTML: `.code-preview`, `<nes-tabs class="code-group">`,
  `<details class="code-collapse">`, `<nes-code-tree>`, `.card-group`,
  `.field-group`, `.prompt`. Ships the render target, not a parser.
- **Visualize module** — `<nes-mermaid>` (on-brand, streaming-safe, AI-safe
  `securityLevel:strict`), `<nes-walkthrough>` (step-by-step "how it works" that
  spotlights part of a diagram per step), and Lens (`<nes-tabs class="lens">`).
  Mermaid is never bundled — bring your own (`globalThis.mermaid`) or lazy-load
  via `enableMermaid(url)` / `<nes-mermaid src>`. Exports `mermaidTheme()`.
- **AI-agent / RAG docs** — generated `llms.txt`, `llms-full.txt`, and
  `components.json` (85 components) so agents in other repos can retrieve the
  official API accurately. Generated from `docs.js` (single source of truth).

### Changed

- Fonts: enabled real italic via `font-synthesis: style` (oblique) while keeping
  crisp static bold; both faces cover regular / medium / bold / italic.
- Docs & demo: mobile hardening — `touch-action: manipulation` (no double-tap
  zoom), iOS 16px input floor (no focus-zoom), and preview widths clamped with
  `min(Npx, 100%)` so nothing overflows the viewport horizontally.
- `examples/cdn-starter.html` now pins the published npm version (`@0.2.0`) for
  everything — fonts, CSS, and JS all ship in the package.

## 0.1.0

- Initial release: design tokens (`tokens.css`), base reset (`base.css`), the
  core class recipes (`components.css`), and the first light-DOM web components
  (`<nes-sound> <nes-hud> <nes-quiz> <nes-collapsible> <nes-tabs> <nes-code>`)
  plus helpers (`toast`, `grantXP`, `bleep`, `store`). Cross-framework, zero
  build, dark-only, square 90° corners, hard shadow.
