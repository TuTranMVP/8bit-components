# Changelog

All notable changes to `8bit-nes`. Follows [Semantic Versioning](https://semver.org).

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
