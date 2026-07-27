# Changelog

All notable changes to `8bit-nes`. Follows [Semantic Versioning](https://semver.org).

## 0.7.2

Housekeeping — a dead-code audit. No token, class or element API changed;
`elements.min.js` is byte-identical to 0.7.1.

### Removed

- `.log-time` — a hook inside the `.logline` recipe that nothing rendered and no
  page documented. `<nes-logs>.push()` writes plain text, so it was speculative
  from the day it landed.
- The docs app's `slug()` helper, orphaned when the bespoke "on this page" code
  was replaced by `<nes-toc>` in 0.7.0 (the component slugs its own headings).
- Two duplicated skill copies: `.claude/skills/{8bit-components,frontend-design}`
  were byte-identical to `.agents/skills/…`; they are now symlinks, the same
  convention the newest skill already used. One source of truth per skill.

## 0.7.1

Two accessibility fixes plus a guard for the release process. CSS only —
`elements.min.js` is byte-identical to 0.7.0, and no token, class or element API
changed.

### Fixed

- **The documented `<head>` would have been blocked by the browser.** 0.7.0 bumped
  the CDN URLs in `README.md` and `examples/cdn-starter.html` to `@0.7.0` but left
  0.6.1's `integrity` digests in place, so anyone copying the recommended snippet
  hit an SRI mismatch and got no stylesheet at all. Digests corrected, and
  `scripts/check-doc-pins.mjs` now fails the build when a documented version or
  digest does not match `package.json` / `sri.json` — wired into `pnpm check`, so
  CI and `prepublishOnly` both catch it. `sri.json` is generated and diffed; the
  docs that quote it were only ever hand-edited, which is why nothing noticed.
- **Links in prose had no style at all**: `base.css` styles headings, `code` and
  body text but never `a`, so an inline link rendered identically to the text
  around it — same colour, no underline, nothing marking it clickable. Links in a
  text flow now get brighter ink *and* an underline, distinguishing them on two
  channels rather than colour alone (WCAG 1.4.1). Scoped with
  `:not(.btn, .card, .chip, .tab)`, so links that already carry their own
  affordance are untouched — verified, including a link nested inside `<b>` and a
  `.btn` sitting inside a `<p>`.
- **Walkthrough dots on touch**: `.wt-dot` is a real control — it jumps to that
  step — but at `0.75rem` it was a 12px tap target, under even the 24px AA floor.
  Enlarging the dot would wreck the progress row, so on coarse pointers a
  transparent `::after` takes the tap area to 44px while the dot keeps its size.
  Verified at iPhone-14 metrics across a five-dot row: each dot owns the hit test
  at its own centre, a tap 13px below any dot selects that step, and on a fine
  pointer the same click still does nothing.
- **The pin guard had a hole of its own**: it matched `8bit-nes@x.y.z` and
  digests, so a stale `github:…#v0.7.0` install spec and three prose mentions of
  the old version survived the 0.7.1 fix. The guard now matches any `@x.y.z` or
  `#vx.y.z` pin (a bare version in prose — "new in 0.5.0" — stays history), and
  the docs that never needed a literal no longer carry one: fewer places to
  drift beats more places to police.

## 0.7.0

**Map of Content** — the docs site's "on this page" rail, promoted into a real
component and made mobile-first. **134 components.**

### Added

- **`<nes-toc>`** (Navigation) — the live index of a page. Builds itself from the
  headings in `target` (default `main`/`article`, `levels="h2,h3"`), follows the
  scroll with an `IntersectionObserver`, and **hides itself** when there are
  fewer than `min` (2) headings, so a page that needs no index costs the
  consumer no conditional rendering.
  - **Mobile-first by construction**: the default shape is a collapsible sticky
    bar that *names the section you're in* (`.toc-now`) — one tap for the list,
    capped at `50dvh` so an open index can never bury the content it indexes. It
    becomes an open sticky rail from `rail-at` (default `74rem`); `mode="bar|rail"`
    pins one shape.
  - Renders its list as the existing **`.outline`** recipe, so the `.lvl-*`
    indent, the `.active` state and the 44px coarse-pointer rows come from a
    recipe that already shipped — not a second list style. Indent is *relative*,
    so `levels="h3,h4"` starts flush.
  - Real in-page anchors (shareable, middle-clickable, work with no JS), missing
    ids generated from heading text with diacritics stripped (“Cài đặt” →
    `#cai-dat`), and `scroll-margin-block-start: var(--toc-offset, …)` on each
    heading so a jump never lands under sticky chrome.
  - `.headings` / `.active` / `.open`, `.refresh()` for client-side routing, and
    `nes:section {id,text}`. Types: `NesTocElement`.
  - Tokens: `--toc-top` (how far below the chrome it sticks), `--toc-offset` (how
    far a jumped-to heading clears it) — both settable per breakpoint.

### Changed

- **The docs site now uses `<nes-toc>` for its own "on this page"** — the
  bespoke implementation is gone: **−110 lines of duplicated CSS** in `docs.html`
  and **−56 lines of JS** in `docs.js` (plus a dead `TOP_H` constant), replaced
  by one element and four layout rules. The rail/bar switch, the scroll-spy and
  the collapse-after-tap all moved into the component, and the EN/VI label is
  passed in, so the docs gained the "current section in the collapsed bar"
  affordance for free.

### Notes

- The rail vs bar decision rides on a `data-rail` attribute the element sets from
  `rail-at`, rather than a media query — that keeps **one** rail block in the CSS
  and lets `mode` pin a shape without a second breakpoint.
- `<nes-toc>` sets no `inline-size`, so a page can inset it with plain margins
  without overflowing its column.

## 0.6.1

CDN delivery hardening plus two coarse-pointer touch fixes. No change to any token,
class or element API — 0.6.0's OpenCode module is untouched.

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
  version-pinned (`@0.6.1` → `immutable`, a year of cache) rather than the
  mutable bare alias, font `preload` at the exact URLs `all.min.css` resolves
  `url()` to, and `integrity` + `crossorigin` on both entries — with the reason
  for each line and the pinned-vs-range caching trade-off spelled out.
- `examples/cdn-starter.html` is wired to that same recipe (and demos
  `<nes-switcher>`), so the copy-paste starter *is* the optimised setup.


## 0.6.0

The **OpenCode** release — an 18-component module for Vibe-Coding tools on the
web/cloud: the WebUI shell around an agent that writes code. Still zero-build,
zero-dependency, dark-only, square-cornered. **133 components.**

### Added

- **OpenCode module**, one recipe per responsibility, following the loop a
  coding agent actually runs:
  - *Where am I* — `.workbench` (3-pane rail/main/side shell; panes stack on
    mobile, sizes are tokens, drop a pane and the grid re-flows), `.repobar`,
    `.filetabs` (open buffers + unsaved marker), `.statusline`.
  - *Is my machine alive* — `.sandbox` (cloud dev container: state light,
    specs, actions).
  - *What will it do, may it* — `.plan` (the agent's todo with live per-step
    state), `.perm` (allow-once / always / deny; the command is shown verbatim
    and scrolls — never truncated).
  - *What changed* — `.diffstat`, `.filechange` (A/M/D/R), `.hunk` (a
    reviewable slice with keep/revert, collapsible via native `<details>`),
    and **`<nes-diff>`** — parses a unified diff into on-brand `.diff` markup
    and emits `nes:diff {files,added,removed}`.
  - *Does it work* — `.checks`, `.runbar`, **`<nes-logs>`** (tail-following,
    ring-buffered, level-filtered log stream), `.stacktrace` (your frames lit,
    `node_modules` dimmed), **`<nes-preview>`** (the running app in a framed
    iframe: URL bar, reload, 375/768/full viewports; emits `nes:navigate`).
  - *Can I undo / ship it* — `.ckpt` (rewind timeline), `.deploy`.
- Types: `NesDiffElement`, `NesLogsElement`, `NesPreviewElement`, plus
  `DiffStat` / `LogLevel` / `PreviewView` and the two new event maps.

### Changed

- The shared **run-state vocabulary** (`queued · thinking · running · done ·
  error`) now also drives `.plan-step`, `.statusline`, `.sandbox`,
  `.check-item`, `.runbar` and `.deploy` — one word, one colour, whether it's
  an agent, a CI check or a deploy. No second vocabulary was introduced.
- `.diff` gained two sub-classes (`.file`, `.meta`) for the file/hunk headers
  `<nes-diff>` emits; they live beside `.diff`, not in a second place.
- `<nes-chat-messages>` and `<nes-logs>` now share one `tailScroll` helper
  (the stick-to-newest behaviour was extracted rather than copied). No API or
  behaviour change to the chat scroller.

### Notes

- The module deliberately **reuses** `.diff`, `.terminal`, `.tasklist`,
  `.tree`, `.trace`, `.msg`, `.btn`, `.input` and `.segment` instead of
  re-implementing them — `<nes-preview>`'s toolbar is literally `.input` +
  `.btn` + `.segment`.
- `<nes-preview>` sets no `sandbox` by default and passes a supplied one
  through verbatim; `<nes-diff>` renders a patch and never applies one.

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
