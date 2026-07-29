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
| `--ink-on-accent`                     | `#0a0a1a`                               | dark ink — **only on a BRIGHT accent fill** |

**Rules.** Never white text on gold/green/cyan — use `--ink-on-accent`. But `--ink-on-accent` is
for **bright** fills only: on a neutral/dark surface (`--panel`, `--panel-2`, `--slot`) it sinks
into the same-hue ground — use `--muted`/`--ink` there instead (e.g. a plain `.badge`). Accents are
for meaning,
never decoration. **`--primary` is green (`--good`)** so the palette maps to intuition —
green = primary/positive, gold = warn/highlight, red = error; every component's default `--accent`
points at `--primary`, so retheme in one line. Semantic (`good/warn/crit`) stays separate from brand.

**Borders vs shadows (important).** `--line` (`#000`) is for **offset shadows only** — it's
invisible as a border on the dark ground. The border **on a filled/selected element** must be the
deep same-hue `--accent-d` (set beside `--accent` in the mapper), so the outer edge stays visible
and the item never reads smaller than an outlined sibling. Borders on recessed/neutral surfaces
(input, code, table-wrap) use `--line-hi`. Any recipe that sets `--accent` locally must also set
`--accent-d`, or an ancestor `data-accent` will split the fill from its border.

**The ink ladder has two axes.** Contrast alone was never the weak part — all four rungs cleared
AAA on every ground. Chroma was: the ladder used to get *bluer* as it got darker (7 → 23 → 49 →
58), so `--muted` was blue text on a navy ground. Luminance separation without hue separation
reads as soft at any ratio. Keep chroma near-flat (7 → 23 → 24 → 30) and the lightness steps even
(Δ L* 4.9 / 6.3 / 7.7); a step over 9 L* makes the lower rung read as dropped out.
`pnpm check:contrast` computes every pairing from `tokens.css` and fails the build below AAA for an
ink rung on any ground, below AA for an accent used as text or for `--ink-on-accent` on a fill, or
if the ladder is not monotone. An accent is text as often as it is a fill — `--crit` sat at 4.17:1
as text (error copy failing AA) and `--purple` at 4.42:1 until that check existed.

### Typography

Two faces, deliberately paired. Self-hosted woff2 (Latin + Vietnamese subset, full diacritics).

- **`--font-mono` — NES Mono** (hi-res mono, *not* a lo-res pixel font): all chrome —
  labels, numbers, code, nav, headings. Uppercase + `--ls-chrome` tracking for labels.
- **`--font-body` — NES Sans** (variable 300–700): body copy, prose. Sentence case.

Type scale — kept in rem so a reader's own font size scales the UI, but **every rung is an
integer px** at the 16px default: `--fs-label` 9 · `--fs-chip` 11 · `--fs-h3` 12 · `--fs-body` 14 ·
`--fs-lead` 16 · `--fs-h2` 17 · `--fs-h1` 26. A fractional font size gives every text-sized box a
fractional height, which lands its hard border on a half pixel — there is no blur and no radius
here to hide that behind. Only rungs that are actually used exist. `--fs-code` (`.9em`) is
deliberately **relative**: an atom inside a sentence tracks whatever rung the sentence is set in.
Leading: `--lh-none` 1 (single-line chrome, where `--ctrl-h-*` owns the height) · `--lh-tight`
1.25 · `--lh-heading` 1.4 · `--lh-body` 1.65.

**Three weights, and only three.** `--fw-regular` 400 · `--fw-medium` 450 · `--fw-bold` 700 —
exactly the axis stops the bundled faces ship. NES Mono has 400 and 700; NES Sans is variable
300–700. Ask for 500 or 600 on mono and the browser *synthesises* the bold, smearing the stems.

**A number that changes goes in mono.** Measured at 16px on the bundled faces: ten mono digits are
the same width whatever the digits (0.00px spread), ten sans digits vary by 35.67px — a `1` is
3.5px narrower than a `0`. Every live counter in the library is mono, which is why no component
sets `font-variant-numeric`. Put a live number in sans and add `tabular-nums` yourself, or the
layout twitches on every tick.

**Crisp text rules.** Reading text is bright (`--text`/`--ink`) on a **solid** ground — never over
a striped/scanline layer. Chrome is mono-uppercase; body is sans sentence-case. Don't mix the roles.

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

### Stacking, state & focus

One ladder, so nothing has to guess a number: `--z-raised` 1 (a lifted sibling) · `--z-pop` 2
(over its own module) · `--z-sticky` 20 (sticks in the page) · `--z-drawer` 30 (off-canvas; its
scrim is `calc(var(--z-drawer) - 1)`) · `--z-chrome` 40 (sticky top bar) · `--z-overlay` 100
(menu / tooltip / toast / dialog) · `--z-top` 9999 (the CRT overlay, nothing else).

Two state opacities, not eight: `--op-disabled` .6 (`:disabled`, or already decided) and
`--op-dim` .3 (data pushed to the background). Focus is `--ring-w` + `--ring-c` — retint every
focus ring in one declaration, never remove it, and never touch `box-shadow` (a focused control
keeps its hard shadow).

### Motion

**Smooth & high-FPS.** One ease-out curve — `--ease` (`cubic-bezier(.22,1,.36,1)`) and `--ease-fill`.
Animate `transform`/`opacity` where possible (compositor-only → 60fps+); avoid transitioning
layout/paint props on scroll (the docs topbar is opaque, no `backdrop-filter`). Loaders spin
`linear`. Durations `--dur-fast/-mid/-slow`. Every animation must no-op under
`prefers-reduced-motion: reduce` (handled globally in `base.css`).

### Spacing, size & breakpoints — the grid law

Two grids, and `pnpm check` fails the build if a value drifts off either one:

- **Space lands on 4px steps** — always a `--sp-*` rung (`--sp-1 .25rem` → `--sp-7 3rem`).
  `--sp-hair` (2px) is the single sub-grid rung, for a seam between tiles; it matches `--bw-2`
  so a seam and a border read as the same pixel.
- **Size lands on 2px steps** — a hard 90° system has nothing to hide a half-pixel behind, so a
  9.6px dot beside an 11.2px marker reads as two different greys. Two markers repeat across
  modules and are tokens: `--dot` 10px (run-state light) and `--pip` 12px (step marker).

Box padding has three named roles — `--pad-tight` 4/8, `--pad-snug` 8/12, `--pad-box` 12/16 —
with inline padding one rung above block padding (text needs more air sideways). Override one in
a subtree and every recipe using it retunes; that is the density knob. Inline padding that must
scale with its text uses em: `--chip-py/--chip-px` for a standalone chip, `--atom-py/--atom-px`
for something inside a sentence (inline code, `@mention`).

Layout is **intrinsic-first** — `flex-wrap`, auto-fit grids, `clamp()`, `min()` — so a module
normally needs no media query (all of `components.css` has two). Exactly three widths are allowed
to switch a layout: `--bp-sm` 36rem, `--bp-lg` 56rem, `--bp-xl` 74rem. CSS cannot read a `var()`
inside `@media`, so a query writes the literal and the check enforces the ladder. Write
`(width < X)` or `min-width: X` — never `max-width: X`, which overlaps `min-width: X` at exactly
X (that one pixel is how the docs rail and `<nes-toc>` once disagreed).

Outer spacing belongs to the parent: recipes ship `margin: 0` and size only their own inside.
The app frame has its own vocabulary — `--gutter`, `--chrome-h`, `--nav-w`, `--rail-w`.

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
- Respect `prefers-reduced-motion`.
- **Mobile-first is a direction, not a breakpoint.** The base block is the phone; a `min-width`
  query *adds* the wider layout. `max-width` (and `width <`) are rejected by `pnpm check`: a phone
  should never have to un-style a desktop layout it never used, and `max-width: X` overlaps
  `min-width: X` at exactly X.
- **Touch targets.** On `(pointer: coarse)` every interactive box clears the 24×24px floor
  (WCAG 2.5.8) and anything you press to act clears `--tap` 44px (2.5.5); a row in a scrolling
  list may use `--tap-dense` 40px. A small control **does not grow** to get there — `.checkbox`,
  `.radio` and `.switch` keep their 22px box and take a 44px tap through a transparent `::before`,
  so the accessibility floor costs the pixel look nothing.
- **Text entry is floored at 16px on touch** (`max(16px, var(--fs-body))`), because iOS Safari
  zooms the whole page when a focused field's font is smaller.
- `pnpm check:viewport` proves all of it on a real 390×844 phone viewport over CDP, hit-testing each
  control off centre. A plain headless window reports neither `coarse` nor `fine`, so a touch rule
  there passes without ever being applied — never verify this without emulation.

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
| Element    | Button · Badge · Chip · Card · Avatar · Kbd · Separator · Icon (`<nes-icon>` / `8bit-nes/icons`) · Toolbar (`.toolbar` — scrolls, does not reflow) · Split view (`<nes-split>` — draggable + keyboard `role="separator"`) |
| Form       | Input · Textarea · Select · Checkbox · CheckboxGroup · Radio · RadioGroup · Switch · Field · Form (`<nes-form>`) · Slider (`.range`) · Segmented control · Switcher (`<nes-switcher>`) · InputNumber · InputRating · InputTags · PinInput · ColorPicker · InputDate · InputTime · FileUpload · Listbox · InputMenu · SelectMenu |
| Feedback   | Alert (`.callout`) · Progress (`.pbar`) · Skeleton · Toast · Spinner · Meter · Empty state · Banner |
| Navigation | Tabs (`<nes-tabs>`) · Breadcrumb · Pagination · Steps · Nav list · Map of Content (`<nes-toc>` — headings → index + scroll-spy; bar on mobile, rail when wide; reuses `.outline`)                          |
| Overlay    | Modal (`<dialog>`) · Dropdown (`<details>`) · Tooltip (`[data-tip]`) · Drawer (`<dialog>`) · Popover (`<nes-popover>` — top layer, nothing can clip it) · Confirm (`confirmDialog()` → `Promise<boolean>`) |
| Data       | Table · Code block · Accordion (`<nes-collapsible>`) · Stat · Rating · Description list · Timeline · Prose · Tree (`<nes-tree>`)           |
| Chat (AI)  | Chat · ChatMessages (`<nes-chat-messages>`) · ChatMessage · ChatPrompt (`<nes-chat-prompt>`) · ChatPromptSubmit · Composer (`.composer` + `.attach`) · Suggestions (`.suggest`) · Citations (`.cite` + `.sources`) · ChatReasoning · ChatTool · ChatShimmer · ChatPalette |
| Agents (AI) | Agent (`.agent`) · Context usage (`.usage`) · Trace (`.trace`) · Feedback bar (`.feedback`) — multi-agent status roster, context/token budget, orchestration/reasoning trace (zero-JS `<details>`), human-in-the-loop feedback footer. Stateless recipes an agent emits as HTML; shared `data-state` vocabulary |
| Editor (AI) | Editor (`<nes-editor>`) · EditorToolbar · EditorSuggestionMenu (`/` + AI commands) · EditorMentionMenu (`@`) · EditorEmojiMenu (`:`) · EditorDragHandle — contenteditable, Tab ghost, bilingual mode (`lang`/`target-lang`), word-count, AI hook |
| Typography (MDC) | CodePreview (`.code-preview`) · CodeGroup (`<nes-tabs class="code-group">`) · CodeCollapse (`<details class="code-collapse">`) · CodeTree (`<nes-code-tree>`) · CardGroup (`.card-group`) · FieldGroup (`.field-group`) · Prompt (`.prompt`) · Terminal (`.terminal`) · Diff (`.diff`) · Tasklist (`.tasklist`) · code filename header (`<nes-code file>`) — the render target for AI-streamed Markdown/MDC output, not a parser |
| Visualize | Mermaid (`<nes-mermaid>`) · Walkthrough (`<nes-walkthrough>`, `autoplay`) · Lens (`<nes-tabs class="lens">`) · Zoom (`<nes-zoom>`) · Annotate (`<nes-annotate>`) · Compare (`<nes-compare>`) · Legend (`.legend`) — on-brand Mermaid from AI output + step-through learning, pan/zoom exploration, hotspot annotations, A/B compare. Mermaid never bundled (BYO / lazy-load); the rest is zero-dep pointer + CSS |
| Second Brain | Graph (`<nes-graph>` — force-laid-out knowledge graph, click-to-focus, wrap in `<nes-zoom>`) · Note card (`.note`) · Backlinks (`.backlinks`) · Wiki-link (`.wikilink` + `.new`) · Tag (`.tag`) · Properties (`.props`) · Outline (`.outline`) · Heatmap (`.heatmap`) · Board (`.board`) · Command palette (`.palette`) · Search result (`.result`) · Embed (`.embed`) · Maturity (`.maturity`) · Tag cloud (`.tag-cloud`) · Concept (`.concept`) · Note stats (`.note-stats`) — Obsidian-style knowledge UI; all stateless recipes bar the graph |
| OpenCode (vibe coding) | Workbench (`.workbench` — rail/main/side cloud-IDE shell) · Repo bar (`.repobar`) · File tabs (`.filetabs`) · Status line (`.statusline`) · Sandbox (`.sandbox`) · Plan (`.plan`) · Permission (`.perm`) · Diff stat (`.diffstat`) · File change (`.filechange`) · Hunk (`.hunk`) · DiffView (`<nes-diff>`) · Checks (`.checks`) · Run bar (`.runbar`) · Logs (`<nes-logs>`) · App preview (`<nes-preview>`) · Stack trace (`.stacktrace`) · Checkpoints (`.ckpt`) · Deploy (`.deploy`) — the workspace shell around a coding agent: where am I → what will it do → may it → what changed → does it work → can I undo/ship. Composes the existing `.diff` / `.terminal` / `.tree` / `.trace` / `.btn` / `.input` / `.segment` rather than duplicating them; three stateful pieces, the rest stateless recipes |

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
