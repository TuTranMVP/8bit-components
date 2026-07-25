# Changelog

All notable changes to `8bit-nes`. Follows [Semantic Versioning](https://semver.org).

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
