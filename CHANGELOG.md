# Changelog

All notable changes to `8bit-nes`. Follows [Semantic Versioning](https://semver.org).

## 0.16.0

Four items filed by the same consuming repo, measured against the shipped bytes
of 0.15.0. All four reproduced. Measuring them turned up a **fifth** defect that
nobody reported and that explains half of item 4's symptom, and it also showed
that the sideways-scroll guard in this repo — and the one the report proposed —
were both **vacuous**. Details below, because those two are the parts worth
reading.

### Fixed

- **`.prose > img` escaped the container, not just the reading measure.**
  Everything on the opt-out list has a safe way to be too wide — a `<pre>` and a
  `.table-wrap` scroll inside themselves, `<nes-zoom>` pans — so `max-inline-size:
  none` costs them nothing. An image has no such escape: `none` hands it its
  intrinsic width. Measured with a 1400px image in a 390px card, no consumer CSS:
  **scrollWidth 1422 vs clientWidth 390**, i.e. sideways scroll on a phone from a
  stylesheet-only page. Media now gets its own rule — it escapes `--prose-measure`
  and keeps a `100%` container cap, two limits that `none` was collapsing into one.

  The fix the report suggested (a `.prose > :is(img, svg, video)` rule *after* the
  list) is a **no-op**: `:is()` takes the specificity of its most specific argument,
  so `.table-wrap` makes the opt-out list `(0,2,0)` and a later media rule at
  `(0,1,1)` loses. The three entries had to come **off** the list instead.

- **`<video>` had no cap anywhere in the library**, and a capped image kept its
  attribute height and stretched. The base reset now covers
  `:where(img, svg, canvas, video)` with `height: auto`.

- **`.table` cells inherited the browser's `vertical-align: middle`.** Right for a
  `<td>` in a prose document, wrong for a data grid, which is read across: one
  wrapping cell floats every short cell in its row to the middle of its own height.
  Measured at 390px on a four-column row that wrapped to 164px, the first-line tops
  spread **57.8px → 0px**. Narrow is the common case on a phone, so `top` is the
  default rather than a variant.

- **A `.callout` said which kind it was in hue and nothing else** (WCAG 2.2 ·
  1.4.1). Worse than reported: `.memo` against the default was not "two warm
  yellows" but the *same* gold — measured byte-identical, so those two were
  indistinguishable at 100%, not merely close. Each kind now carries a marker
  glyph: `*` `+` `#` `?` `i` `!` `X`. It is absolutely positioned in a reserved
  gutter so it holds for any content shape — inline text, one `<p>`, or a stack of
  blocks — and is decorative to a screen reader (`content: … / ""`), because the
  panel's own label carries the kind in text. Override or drop it with `--mark`.

- **`.pbar` only worked as a flex item.** *(Not reported — found while measuring
  item 4.)* A `<span>` is inline, and an inline box ignores `inline-size`,
  `block-size` and `overflow`, so a standalone bar measured **2px wide by 45.1px
  tall** and its `<i>` resolved `--fill` against the *page* instead of the bar. It
  looked fine everywhere it was used — `<nes-hud>` puts it in a flex row, which
  blockifies it — so the published example `<span class="pbar"><i style="--fill:64%">
  </i></span>` rendered a sliver when pasted into a plain div. `display: block`:
  all three contexts now measure 200×16 with a 98px fill.

- **`--fill` was registered `inherits: false`**, which made `.pbar { --fill: 0% }`
  unreadable by anything — the child resolved the registration's own initial-value,
  so a consumer setting it on the container got a bar stuck at 0% with no error.
  Now `inherits: true`: both forms work, and that declaration becomes the guard
  that stops an ancestor's value from leaking in.

### Changed

- **`pnpm check:viewport` was measuring overflow against the wrong number.**
  `scrollWidth - innerWidth` is vacuous under mobile emulation: when content
  overflows, `innerWidth` *grows with it*. Proven by mutation — with the media bug
  put back, the old denominator reports `0px` and passes 23/23; `clientWidth`
  reports **1026px** and fails. The report's proposed gallery check
  (`scrollWidth === innerWidth`) has the same flaw and would not have caught item 1.
  All three call sites now use `document.documentElement.clientWidth`, and the
  phone fixture carries media declared 1400px wide so the guard has something to
  catch.

### Added

- **A `.callout` page in the docs.** The recipe shipped in the CSS from the start
  and was never documented — which is a fair part of why a consumer ended up
  prepending their own emoji. Seven kinds, their accents and markers, and `--mark`.
- **Seven regression assertions** in `pnpm check:ui` (42, was 34), one per item
  plus the `.pbar` sizing and the `--mark: none` opt-out.
- The Table page states why cells align top, and what to do about `th`'s
  `white-space: nowrap` with no floor on `td` (`min-inline-size` on the column that
  matters). The Progress page documents both `--fill` placements and that the track
  is a block. The Prose page documents media as the third case.

## 0.15.0

Six items filed by a repo consuming this library. Every one was reproduced in a
real browser before it was touched, and every fix carries a regression assertion
in `pnpm check:ui` (now 34 assertions). Two were reported with a diagnosis that
did not survive measurement — those are written up below rather than quietly
patched, because the difference matters to anyone reading the fix.

### Fixed

- **A citation digit sat off-centre.** `.cite` centred its *line box*, and a line
  box carries the font's ascent and descent — for a single digit that is a lot of
  empty space above and none below, so the glyph rode **0.85px high** in a 16px
  chip. Now centred on its **ink** under `@supports (text-box-trim: trim-both)`:
  **0.85px → 0.38px** off centre, and the chip grew 15.7 → 16.8px because the
  padding is finally doing what it says. Browsers without `text-box-trim` are
  untouched. The reported fix (adding the property to the existing rule) is a
  no-op — `.cite` is `inline-flex`, and `text-box-trim` only acts on a block
  container's own line boxes, so the block had to be `inline-block`, and it had to
  come **after** `.cite` or the equal-specificity rule below it wins.

- **`.prose a` repainted the library's own citation chip.** `.prose a` is
  (0,1,1); `.cite` is (0,1,0). Inside prose, a citation came out link-coloured and
  underlined. Now `& a:not(.cite)`, and the chip measures identical in and out of
  prose (`rgb(51,224,224)`, no underline).

- **Eight width-driven elements were squeezed to the reading measure.**
  `.prose > *` caps every child at `--prose-measure` and the constructs whose
  content *is* width opt out — but the list had gone stale. Added
  `<nes-walkthrough>`, `<nes-compare>`, `<nes-annotate>`, `<nes-preview>`,
  `<nes-diff>`, `<nes-logs>`, `<nes-code-tree>`, `<nes-split>`. A walkthrough in
  an article was being crushed to 72ch.

- **The palette's height cap belonged to the overlay, not the list.**
  `.palette-list` capped itself at `min(50vh, 340px)` everywhere, so a palette
  placed *in a page* became a scroller inside a scroller — two thumbs, and the
  page's own scroll no longer reaches the rows. The cap now lives on
  `:is(dialog, .modal) .palette-list`: **`none` in a page, `340px` in an overlay**.

- **`.drawer` opened on the wrong edge.** `.drawer` sets `inset-inline-end: 0`,
  but `dialog` ships a UA `inset-inline-start` that the shorthand-free override
  never cleared, so the panel was pinned to *both* edges and resolved to the
  start. Explicit `inset-inline-start: auto`: an end drawer now measures
  `848–1200` of 1200 and `.start` measures `0–352` (it was starting at x=1).

- **`<nes-zoom>` held a compositor layer for its whole life.**
  `will-change: transform` was static on `.zoom-stage`. It is now raised on
  pointer-down / wheel / keyboard zoom and dropped 200ms after the gesture:
  measured `auto → transform → auto`. Honest note: the reported *symptom* —
  blurred text while zoomed — did **not** reproduce here (10 vs 8 intermediate
  pixels across an edge at 4.36×, i.e. the same rasterisation either way). The
  hint was removed on MDN's grounds — `will-change` is for imminent change, not
  permanent state — not because a blur was confirmed.

### Docs

- The drawer page now demos **both** edges, so `.start` is visible and not just
  described. (The report said this page only showed a plain box; it has always
  used a real `<dialog class="drawer">` — as does the zoom page, which uses an
  inline SVG, not the `<img>` the report assumed. Both notes are wrong for this
  repo, and mentioned here so the record is straight.)
- The palette page states where the height cap applies and why.
- The `.prose` opt-out list in the layout page is back in sync with the CSS, plus
  the rule of thumb that generates it: *if the content is the width, it opts out.*

## 0.14.0

`--muted` read soft, and the reason was not contrast. Measured, every ink rung
already cleared **AAA** on every ground — `--muted` was 10.46:1 on `--panel`. The
weak axis was **chroma**: the ladder got *bluer* as it got darker, so the label
rung was blue text on a navy ground. Luminance separation without hue separation
reads as soft however high the ratio is.

| rung | before | L* | chroma | after | L* | chroma | on `--panel` |
|---|---|---|---|---|---|---|---|
| `--ink` | #f8f9ff | 98.0 | 7 | *unchanged* | 98.0 | 7 | 16.50 |
| `--text` | #e8eaff | 93.1 | 23 | *unchanged* | 93.1 | 23 | 14.57 |
| `--muted` | #c2c6f3 | 80.9 | **49** | **#d6d8ee** | 86.8 | **24** | 10.46 → **12.32** |
| `--dim` | #a7ace1 | 71.7 | **58** | **#c0c2de** | 79.1 | **30** | 7.95 → **9.92** |

Chroma is near-flat now (7 · 23 · 24 · 30) and the lightness steps are even —
Δ L* **4.9 / 6.3 / 7.7**, where they used to be 4.9 / **12.2** / 9.3. That 12.2
cliff between `--text` and `--muted` is what made muted feel like it dropped out.

### Fixed

- **`--muted` and `--dim` are brighter and much less blue** (above). `--muted` is
  text-only in this library (72 colour uses, zero fills), so nothing inverts;
  `--dim` also backs the idle run-state marker, which simply reads clearer.
- **Two accents failed AA as text.** An accent is text as often as it is a fill —
  `.btn.link`, an error hint, an agent name — and on `--panel`:
  `--crit` was **4.17:1** (error copy under AA) and `--purple` **4.42:1**. Lifted
  along their own hue to **#f23c4e** (4.57) and **#b759e5** (4.60); because the
  fills got lighter too, `--ink-on-accent` on them improved 4.71 → 5.16 and
  5.00 → 5.20. `--crit-d` / `--purple-d` are untouched, so borders and hovers keep
  their weight.

### Added

- **`pnpm check:contrast`** (`scripts/check-contrast.mjs`) — the colour contract,
  computed from `tokens.css` with the WCAG relative-luminance formula. Zero
  dependencies and no browser, so unlike `check:viewport` / `check:ui` it is
  **hermetic and runs inside `pnpm check`**. It fails on:
  - an ink rung below **AAA (7:1)** on any of the five grounds — this library's
    smallest text is 9–12px uppercase mono, and WCAG stops scaling its requirement
    below 18px, so AA is not a sufficient floor for the rungs that label things;
  - any accent below **AA (4.5)** as text on `--panel`/`--screen`, or
    `--ink-on-accent` below AA on any accent fill;
  - an ink ladder that is not monotone in L*, or that has a step over **9 L*** —
    the cliff rule, so the shape that caused this release cannot come back.

  Mutation-tested against six drift shapes, including the exact historical values:
  the old `--crit` (4.17), the old `--purple` (4.42), a dimmed `--muted`, the old
  `--muted` (re-opens the 12.2 cliff), a `--dim` brighter than `--muted`, and a
  `--ink-on-accent` too dark for its fill. All six caught.

- **An accented `.badge` was unreadable.** `0b879b6` on main removed
  `color: var(--muted)` from `.badge`, which was right for its default fill
  (`--accent` is `--panel-2` there, so it now inherits `--text` at **13.07:1**) —
  but a badge carrying `data-accent` paints a *bright* fill, and light ink on it
  measured **1.25:1** on gold, **1.62** on good, **3.19** on crit. It was equally
  broken before that commit (muted-on-gold ≈ 1.4:1). `.badge[data-accent]` now uses
  `--ink-on-accent`: 13.18 · 10.17 · 5.16 · 7.97 · 12.02 · 5.20 across the accents.

### Changed

- **The accent contract said something the CSS does not do.** README, the Theming
  page and `llms-full.txt` all promised that `data-accent` on a wrapper is picked up
  by "the button, card, chip, and badge inside". Measured with a wrapper set to
  `cyan`: `.btn`, `.chip` and `.card` all stayed on `#56d364` (their own primary) and
  `.badge` on `#1c1c56` — because every recipe declares its own `--accent` in
  `@layer components`, and a declaration on the element beats an inherited value.
  Only the element carrying the attribute is recoloured. The wording now says that,
  in all three places. (Making the inheritance real is a separate decision: it would
  repaint any component sitting inside an accent-setting ancestor, which is a much
  larger behaviour change than a wording fix.)
- The Colors page shows each ink rung with its measured ratio, and both language
  versions explain the two-axis ladder; `DESIGN.md` carries the rule, and
  `llms-full.txt` tells an agent to pick the rung below rather than dim text by hand.

## 0.13.0

Large screens. Measured on the docs site first, because the numbers make the case:

| viewport | content column | the page | **empty** | prose | demo stage | body | table cell |
|---|---|---|---|---|---|---|---|
| 1440 | 966 | 820 | 146 | 558 | 820 | 14px | **9px** |
| 1920 | 1446 | 820 | **626** | 558 | 820 | 14px | **9px** |
| 2560 | 2086 | 820 | **1266** | 558 | 820 | 14px | **9px** |

`--doc-maxw: 820px` capped *everything* — API tables and live demos included —
while 1266px of the column sat empty at 2560px, and no type rung changed at any
width. Worse on ultra-wide: the table of contents ended up **435px** from the text
it indexes at 2560px, **875px** at 3440px.

Nothing below 1600px moves except one docs table font (see Fixed). Mobile is
untouched, deliberately — it was already right.

### Added

- **`--bp-2xl` (100rem · 1600px)** — a fourth ladder rung, earned: nothing in the
  system switched anywhere between 1184px and infinity.
- **The type scale steps one notch up from `--bp-2xl`** — 10 · 12 · 13 · **16** · 18
  · 20 · 32. 14px body copy is right for a laptop and small on a 27" screen at
  arm's length. Same seven rungs, one media block, so every app on the system gets
  it: `--mmd-fs`, `--ctrl-fs-*` and every recipe follow because they already point
  at these tokens.
  Stepped, **never `clamp()`ed**: a fluid size lands body copy on 15.37px at some
  widths, and a fractional font size gives every text-sized box a fractional height
  — the thing 0.10.0 removed. Still integer px, still monotonic, both asserted.
  Spacing does **not** step: density stays, and the room goes to the container.
- **The docs shell uses the width** from `--bp-2xl`: page 820 → **1120px**, nav and
  rail one rung wider, and the whole grid **capped at 112rem and centred** so
  navigation, prose and index stay one object instead of drifting apart. The top
  bar stays full-bleed but its contents line up with that grid via
  `padding-inline: max(var(--sp-4), calc((100% - var(--app-maxw)) / 2))` — no
  wrapper element, no structural change.
  What grows is exactly what wanted the room: **demo stages, API tables, code
  blocks, split views**. Prose does not — `--prose-measure` caps the *children*, so
  a paragraph stays at 62ch (558px → 638px once the body rung steps).

### Fixed

- **The docs API tables were 9px** (`--fs-label`, a chrome rung meant for an eyebrow
  or a scope). A table you read is not chrome: they are on the chip rung now — 11px
  everywhere, 12px past `--bp-2xl`.
- **`check-scale` could not see a rung whose name contains a digit.** The ladder was
  parsed with `--bp-([a-z]+)`, so adding `--bp-2xl` made every query at 1600px look
  "off the ladder" — the guard's own regex, found by using it.
- **`scale-check.html`'s focus-ring assertion passed by accident.** It called
  `.focus()` and read `outlineColor`, but script focus does not satisfy the
  `:focus-visible` heuristic, so it was reading the unfocused state. It now checks
  the two halves that make the retheme work: that `--ring-c` reaches the control,
  and that the focus rule is written in `var(--ring-w)` / `var(--ring-c)` — walking
  `@import` and `@layer` recursively, which is where those rules actually live.

### Changed

- **`scripts/page-check.mjs`** runs any fixture page in a real browser and fails the
  command if the page reports a FAIL, throws, **or never reports at all**.
  `pnpm check:ui` now runs all three pages (`ui-check`, `scale-check`,
  `spec-check`) through it. They used to be driven by hand with
  `--headless --dump-dom --virtual-time-budget`, where `requestAnimationFrame` does
  not advance predictably: `scale-check` hung there and produced its `…` placeholder,
  which is indistinguishable from a page still working.
- **`check:mobile` → `check:viewport`** (`scripts/viewport-check.mjs`): it now
  measures both ends of the ladder — the phone promises as before, plus a large
  desktop stepping its type, widening its container, keeping prose measured and the
  rail beside the text. 13 → 23 assertions.

## 0.12.0

Toast was 25 lines: it could appear and time out. Everything a toast is actually
for — undo, dismiss, not vanishing while you read it — was missing, and a sticky
one (`timeout: 0`) had **no way to close at all**. Fixed, plus the four primitives
an app kept hand-rolling around this library. 134 → 138 components.

**Minor, not patch**: `toast(msg)` now renders `msg` as **text**. Pass
`html: true` to keep markup.

### Added

- **Toast, finished.** `action: { label, onClick }` for UNDO · a dismiss ✕ (always,
  for a sticky toast) · **pause while you read it** — a pointer over it or focus
  inside stops the countdown *and* the remaining-time bar, then resumes with the
  time it had left (WCAG 2.2.1) · **swipe to dismiss** on touch, following the
  finger · `title` · `max` (4) so a runaway loop cannot bury the page · `sound`
  (and `crit` now bleeps `SFX.bad`, not the coin) · the returned element carries
  `.dismiss()`.
- **`.toolbar`** — a row of actions that **scrolls** sideways on a phone instead of
  reflowing: a toolbar that wraps moves the button you were already aiming at.
  `.toolbar-sep`, `.toolbar-gap` (everything after it goes to the far end), and
  `.wrap` for a set of equals rather than a sequence.
- **`<nes-popover>`** — an anchored panel in the **top layer**, on the native
  popover API. `.menu` inside `.dropdown` is absolutely positioned, so any
  ancestor's `overflow` clips it; a popover cannot be clipped. Esc and
  click-outside come from `popover="auto"`; the element only places it, flipping
  and shifting to stay on screen, and re-places on scroll and resize.
  `placement="bottom-start|top|right-end|…"`, `nes:open` / `nes:close`.
- **`<nes-split>`** — two panes and a divider you can drag, arrow (2%, Shift 10%,
  Home/End) or double-click to reset. A real `<button role="separator">` with
  `aria-valuenow/min/max`, `at`/`min`/`dir` attributes, `nes:resize`, and a 44px
  hit area on a coarse pointer while the divider keeps its 8px look.
- **`confirmDialog(opts) → Promise<boolean>`** — a destructive confirm on
  `<dialog>.showModal()`, so the focus trap, Esc, the backdrop and the top layer
  are the platform's. **Focus starts on Cancel**, so Enter out of habit never
  destroys anything; Cancel, Esc and a backdrop click all resolve `false`, and the
  dialog removes itself.
- **`pnpm check:ui`** (`scripts/ui-check.mjs` + `ui-check.html`) — 28 assertions on
  the behaviour CSS cannot show, in a real browser.

### Fixed

- **`toast()` set `innerHTML` from its argument** — `toast(userInput)` was an
  injection. It is `textContent` now, with `html: true` to opt in; asserted with an
  `<img onerror>` payload.
- **A sticky toast could not be dismissed.** `timeout: 0` had no close button and
  no handle; it now always renders the ✕, and the element exposes `.dismiss()`.
- **An error toast announced politely** like a save confirmation. The live region
  flips to `assertive` for a `crit` insertion and back to `polite` after.
- **The toast timer leaked** past a manual removal; it is cleared on dismiss.

### Changed

- `scripts/cdp.mjs` now holds the browser plumbing both runtime checks share
  (serve · launch · emulate · evaluate · report), so `mobile-check` and the new
  `ui-check` do not each carry 90 lines of CDP. Both wait on **real** time: a
  `<dialog>` `close` event is never delivered while `--virtual-time-budget`
  fast-forwards, which made the promise-based confirm look broken when it was not.

## 0.11.0

The mobile-first pass, measured on a **real phone viewport** instead of a narrow
desktop window. That distinction is the whole story: in a plain headless window
both `(pointer: coarse)` and `(pointer: fine)` are **false**, so every touch rule
in this library would pass a test without ever being applied. This release adds a
CDP-driven check that emulates a 390×844 phone with touch, and hit-tests each
control off centre rather than trusting a box measurement.

What that found, and what was already right: the iOS 16px focus-zoom floor and the
44px control heights **already shipped** (measured, not assumed). Three things did
not: a colour swatch was 36×44 on touch — the coarse rule bumped only its height,
so a 44px tap missed sideways and a square control stopped being square; a
pagination button was 32px wide; and the checkbox / radio / switch boxes sat at
22px with no enlarged hit area, under the 24×24px WCAG 2.5.8 floor.

**Minor, not patch**: the docs shell's responsive direction is inverted (same
result, different source), and three touch targets grow on coarse pointers only.

### Added

- **`--tap` (44px, `--ctrl-h-lg`) and `--tap-dense` (40px)** — the two tap sizes,
  each with its reason: `--tap` is anything you press to act (WCAG 2.5.5),
  `--tap-dense` is a row in a list you scroll, where 44px each would push a phone
  screen's content off the bottom; it still clears the 24px floor by 16px.
- **A 44px hit area for the three controls that must stay small.** `.checkbox`,
  `.radio` and `.switch` keep their 22px box and their hard 2px border, and take a
  44px tap through a transparent centred `::before` — the technique `.wt-dot`
  already used. The accessibility floor now costs the pixel look nothing.
- **`pnpm check:mobile`** (`scripts/mobile-check.mjs` + `mobile-check.html`) — a
  zero-dependency CDP driver (node's own http server + the global `WebSocket`) that
  emulates the phone, asserts 13 things, and **refuses to report** if the emulation
  did not take, because a silent pass there is worse than a failure. It is not part
  of `pnpm check`: that one stays hermetic, this one needs a browser
  (`CHROME=/path/to/chrome` to point it anywhere).
- **`bp(name)` is exported** — `matchMedia(`(min-width: ${bp("lg")})`)`. JS and CSS
  cannot share a breakpoint any other way, since `@media` cannot read a `var()`.
- Docs: a **Touch & mobile** section on `#/layout` (EN + VI) and the rules in
  `DESIGN.md` / `README.md` / the generated `llms-full.txt` section.

### Fixed

- **`.swatch` was 36×44 on a coarse pointer** — the tap missed sideways, and a
  square control rendered as a rectangle. Square controls now grow in both axes.
- **`.pg` and `.stepper > button` were 32px wide** — one-glyph controls now get a
  square `--tap-dense` target.
- **A drawer navigation row measured 42px** in the docs shell — 2px under `--tap`.

### Changed

- **The docs shell is mobile-first.** Its base block is now the phone (one column,
  off-canvas drawer, decluttered top bar) and two `min-width` queries *add* the
  sidebar at `--bp-lg` and the table-of-contents rail at `--bp-xl`. It used to be
  the reverse — a desktop base that two `max-width` queries took apart — which
  meant a phone had to un-style a layout it never used.
- **`pnpm check` now rejects `max-width` and `(width < X)` outright.** Mobile-first
  is a direction, not a breakpoint: the base block describes the phone, `min-width`
  adds. (It already rejected `max-width` for the boundary-overlap reason from
  0.9.0; this extends it to the range syntax that replaced it.) `.code-tree` was
  the last desktop-first module in `components.css` and is now inverted too.
- `z-index: auto` is accepted by the check — it is not a magic number, it says
  "this element creates no layer", which is what a mobile-first reset needs.
- Both browser harnesses now render assertions as they run and surface a throw.
  `spec-check.html` had gone silent after an unrelated change and looked identical
  to a harness still working; its `--fs-body` assertion also still named 13.5px
  after 0.10.0 moved it to 14px, so it now resolves the token instead.

## 0.10.0

0.9.0 put space and size on a grid. This does the same for the scales that were
still half-finished: **type, weight, leading, icon size, stacking, state opacity
and the focus ring**. Same method — measure first, then add only tokens that
replace declarations that already exist.

What the audit found: 172 font-size declarations already used a token, but
**font-weight had none at all** — `700` was typed 49 times. `z-index` had one token
and 11 literals (`1`, `2`, `20`, `9999`, and `37`/`38`/`40` in the docs shell, which
is how a stacking argument gets lost). Nineteen `opacity` literals, no tokens. And
one rung of the type scale, `--fs-body`, was **13.5px** — the only fractional value
in the whole scale.

**Minor, not patch**: body copy grows 0.5px and one switch thumb moves 1.5px.

### Added

- **`--fw-regular` 400 · `--fw-medium` 450 · `--fw-bold` 700** — exactly the axis
  stops the bundled faces ship. NES Mono has 400 and 700 only; NES Sans is variable
  300–700. Asking for 500 or 600 on mono makes the browser *synthesise* a bold,
  which smears the stems and throws away the crispness the system is built on. The
  check now rejects any other value. (55 declarations.)
- **`--fs-lead` (16px)** — the rung between body and title, used by the prose `h2`
  and the lead paragraph, both of which were hard-coding `1rem`.
- **`--fs-code` (`.9em`)** — inline code and `@mention`, deliberately *relative* so
  an atom tracks whatever rung the sentence around it is set in. (4 sites.)
- **`--lh-none` (1)** — single-line chrome, where the box owns the height. Replaces
  eight `line-height: 1`.
- **`--icon-sm/md/lg/xl` (14 · 20 · 28 · 40px)** — the icon glyph scale, which an
  icon gets from its box rather than from the text beside it. `.i-*` and `.icon-box`
  were carrying these as literals (6 sites), all already on the 2px grid.
- **A stacking ladder** — `--z-raised` 1 · `--z-pop` 2 · `--z-sticky` 20 ·
  `--z-drawer` 30 · `--z-chrome` 40 · `--z-overlay` 100 (existing) · `--z-top` 9999.
  Each rung answers a different question about how far out of the flow a thing sits.
  A drawer's scrim goes at `calc(var(--z-drawer) - 1)`.
- **`--op-disabled` (.6) and `--op-dim` (.3)** — two state opacities instead of
  eight ad-hoc ones.
- **`--ring-w` / `--ring-c`** — retint every focus ring in one declaration
  (`:root { --ring-c: var(--cyan) }`). Offset stays in `base.css` because it has to
  cancel the border, and `box-shadow` is still untouched so a focused control keeps
  its hard shadow.

### Fixed

- **`--fs-body` was 13.5px, the only fractional rung** → **14px**. A fractional font
  size gives every text-sized box a fractional height, which lands its hard border
  on a half pixel; a system with no blur and no radius has nothing to hide that
  behind. Every rung is now an integer px at the default root size (9 · 11 · 12 ·
  14 · 16 · 17 · 26), asserted in the harness.
- **The switch thumb stopped 1.5px short of symmetric.** `translateX(1.28rem)` was
  hand-tuned against the old fractional thumb, and 0.9.0's 2px-grid snap moved the
  parts under it. The switch now derives from `--sw-w`/`--sw-h`/`--sw-thumb`, and
  the travel is `calc(track − 2×border − thumb − 2×inset)` = a symmetric 22px.
- **Type-scale drift**: a `0.7rem` (11.2px) label that meant `--fs-chip`, a `12px`
  graph label that meant `--fs-h3`, two `line-height: 1.4` that meant
  `--lh-heading`.

### Changed

- `pnpm check` gained rule 4: `font-size`, `font-weight`, `line-height` and
  `z-index` must come from their token scale. A font-size may still be `em`/`%`
  (an atom should track its sentence), and `@font-face` descriptors are exempt —
  `font-weight: 400` there names which weight the *file* holds. Mutation-tested
  against five drift shapes, all caught.
- `scripts/scale-check.html` is now 27 assertions, including one that measures the
  premise behind having no `font-variant-numeric` anywhere: ten NES Mono digits are
  the same width whatever the digits (**0.00px** spread) while ten NES Sans digits
  vary by **35.67px**. Every live counter in the library is mono. Re-theme
  `--font-mono` to a proportional face and that assertion fails, which is exactly
  when you would need `tabular-nums`.

## 0.9.0

A spacing/layout audit and the tokens it produced. The 4-based `--sp-*` scale was
never the problem — **339** declarations already used it. The problem was the
**151** literal spacing values around it: 66 distinct spellings, most of them off
any grid (`.6rem` = 9.6px, `.7rem` = 11.2px, `1.6rem` = 25.6px), plus repeated
magic numbers with no name (`gap: 2px` nine times) and layout metrics that existed
only inside the docs shell. A hard 90° system has nothing to hide a half-pixel
behind, so those values were visible as soft edges, not just untidy source.

**Minor, not patch**: a handful of values move by 1–2.4px, and one media query
changes shape.

### Added

- **The grid law, and a check that enforces it.** Space lands on 4px steps, size
  lands on 2px steps. `pnpm check` now runs `scripts/check-scale.mjs`, which fails
  the build on an off-grid literal, on a breakpoint outside the ladder, on a
  breakpoint written in px instead of rem, and on `max-width` (see below). One
  escape hatch: a trailing `/* off-grid: why */` comment. Mutation-tested against
  five drift shapes, including the exact historical one.
- **`--sp-hair`** (2px) — the single sub-grid rung, for the seam between tiles in a
  grid, menu or heatmap. Same weight as `--bw-2`, so a seam and a border read as
  one pixel. Replaces nine hand-typed `gap: 2px|3px`.
- **Box padding roles** — `--pad-tight` (4/8), `--pad-snug` (8/12), `--pad-box`
  (12/16), with inline padding one rung above block padding because text needs more
  air sideways. 40 declarations now go through them, so overriding one retunes a
  whole subtree: `.compact { --pad-snug: var(--sp-1) var(--sp-2) }`.
- **Inline padding in em, in two optical classes** — `--chip-py/--chip-px`
  (.25/.5em) for a standalone chip (`.kbd`, `[data-tip]`, `.cmp-handle`), and
  `--atom-py/--atom-px` (.05/.35em) for something inside a sentence (inline `code`,
  `.mention`) whose block padding must not fatten the line box. Six recipes had
  five different hand-picked values.
- **`--dot` (10px) and `--pip` (12px)** — the two square markers that repeat across
  modules: the run-state light (`.agent`, `.sandbox`, `.runbar`, `.ds-bar`, radio
  pip) and the step marker (`.trace-step`, `.check-item`, `.ckpt-item`, legend
  swatch). 19 declarations, previously `.6rem`/`.7rem`/`0.9rem`.
- **A breakpoint ladder: `--bp-sm` 36rem, `--bp-lg` 56rem, `--bp-xl` 74rem.** The
  only widths anything is allowed to switch at. JS reads the token instead of a
  literal, so `<nes-toc rail-at>` now defaults to `--bp-xl`.
- **App shell metrics: `--gutter`, `--chrome-h`, `--nav-w`, `--rail-w`.** The page
  frame, named once, so two apps built on 8-bit line up. `--chrome-h` is
  `--ctrl-h-xl` — a top bar exactly one xl control tall, so a search input fills it.
  `--gutter` is the one token that steps with the viewport (16 → 24 → 48px).
- **Docs: a "Layout & rhythm" page** (EN + VI) with the scale drawn to scale, and a
  generated `## Layout, spacing & breakpoints` section in `llms-full.txt` whose
  values are read out of `tokens.css` at build time, so it cannot drift.

### Fixed

- **A one-pixel-wide window where the docs shell and `<nes-toc>` disagreed.** The
  shell dropped its rail column at `max-width: 1180px` while the component became a
  rail at `min-width: 74rem` (1184px), so between them the collapsed bar rendered
  inside a 224px rail slot. Aligning both to 74rem was not enough: `max-width: X`
  and `min-width: X` both match at exactly X. Width queries are now exclusive
  (`@media (width < 74rem)`), the check rejects `max-width` outright, and the
  boundary is asserted at 1180/1184/1188px.
- **Three rail-marker modules, three hand-tuned offsets**, 0.4–1px off centre and
  wrong by a pixel for a 12px marker. All three now derive it:
  `calc((var(--pip) + var(--bw-2)) / -2)`.
- **`--gutter` was `clamp(var(--sp-4), 4vw, var(--sp-7))`** in the docs shell — a
  fluid gutter lands on 47.36px at one width and 43.2px at another. It steps on the
  ladder instead; this system is rung-based everywhere else (type, controls, space).
- **16 off-grid spacing nudges and 12 off-grid squares snapped to the grid**, plus
  hairlines that were tracking a border weight in disguise
  (`.switch` thumb inset → `--bw-1`, `.swatch` frame → `--bw`).

### Changed

- `docs.html` no longer carries its own shell metrics: `--top-h`, `--side-w` and
  `--toc-w` now come from `--chrome-h`, `--nav-w` and `--rail-w` (52px, 240px,
  224px — was 53, 244, 216), and the content gutter is `var(--gutter)`.
- `.workbench`'s `--wb-rail` is `var(--rail-w)`: one rail width system-wide.
- The docs' `62ch` measure is a token (`--doc-measure`) instead of a literal typed
  twice, and `.doc-lead` is `1rem` instead of `1.02rem`.

## 0.8.0

Six items filed by an integrator reading `all.min.css` and `elements.js` of 0.7.3
while fixing a real symptom. Four were places where the library already did the
right thing somewhere else and not here; two were capability gaps. **Minor, not
patch**: three of them change how shipped CSS behaves.

### Fixed

- **`.prose` capped the container, not the text.** `max-inline-size: 72ch` on
  `.prose` also capped every child that is not text: a spec table was crushed to
  one word per column and a diagram drew its labels smaller to fit a width it did
  not need to fit. A paragraph rewraps when it runs out of room; a table, a
  `<pre>` or an SVG cannot. The measure now sits on the children (`--prose-measure`,
  still 72ch), and the constructs whose content *is* width opt out —
  `.table-wrap`, `table`, `pre`, `.codeblock`, `.code-preview`, `.diff`,
  `.terminal`, `.card-group`, `hr`, `img`, `svg`, `video`, `<nes-code>`,
  `<nes-mermaid>`, `<nes-graph>`, `<nes-zoom>`. Measured by default is the safe
  direction: a construct nobody has considered yet reads correctly instead of
  sprawling.
- **`.datalist` asked for baseline alignment in a way that could not work.**
  `align-self: baseline` sat on `dt` alone, and a baseline group of one degrades to
  `start` — so a 9px mono key and a 13.5px value shared a row's top edge while
  their text did not, worst when the value held an inline `<code>` whose padding
  pushed it further down. `align-items: baseline` now sits on the grid, where
  `.source` has always had it. Measured: the two baselines are 0.00px apart, both
  rows.
- **`<nes-zoom>`'s internals were global class names.** `.zoom-view` /
  `.zoom-stage` / `.zoom-bar` are built by the element but were declared top-level,
  so putting `.zoom-view` on anything else produced a box with a grab cursor that
  cannot be grabbed — and its `overflow: hidden`, declared later than
  `.mermaid-view`'s `overflow: auto` at equal specificity, silently removed the
  scroll container too, clipping tall content with nothing in the console to say
  why. All three are now scoped to `nes-zoom`.

### Added

- **`--mmd-fs`** — diagram label size for `<nes-mermaid>`, the one value
  `mermaidTheme()` had left to mermaid's own 16px default. It decides how much of a
  diagram is legible: `useMaxWidth` fits the drawing to its container, so a larger
  font makes a larger natural drawing that is then scaled down harder — the labels
  do not grow, the diagram shrinks. Its own token (falling back to `--fs-body`)
  because a label is not body copy and should be able to go smaller without
  dragging prose with it. Resolved to px once and fed to both `config.fontSize`
  (a number, for layout maths) and `themeVariables.fontSize` (a CSS length, what
  lands in the rendered SVG).
- **`nes:theme`** — a seam for a brought-your-own mermaid. The element themes a
  global it did not create, exactly once, which was right; doing it with no hook
  was not. `initialize()` before the element and this call reset over it;
  after, and there was no "after". The event is cancelable and fires synchronously
  before the library is touched: amend `detail.config` to change any mermaid
  option, or `preventDefault()` to keep a config you set yourself. No private
  static to reach for, no race.
- **Two-finger pinch in `<nes-zoom>`.** `.zoom-view` sets `touch-action: none` for
  the drag, which is also what removes the browser's own pinch — so on a phone, the
  case the component exists for, the reader could pan but had to hunt for the `+`
  button to scale. Pinch now comes from the pointers already being tracked: two
  down scales by the ratio of their distance to the distance at gesture start,
  anchored on the midpoint so the spot under the fingers stays put. Lifting one
  finger resumes the pan from where it is. No new listener types, no dependency;
  the wheel, keyboard and button paths are unchanged.
- `scripts/spec-check.html` — one runnable page that asserts all six above with the
  measured value beside each. Not shipped (`files` excludes `scripts/`); serve the
  repo root and open it. These are the regressions that would otherwise be silent.

## 0.7.3

One `<nes-toc>` fix. No token, class or element API changed; CSS is byte-identical
to 0.7.2.

### Fixed

- **`<nes-toc>`'s collapsed bar stopped naming the current section after a rebuild.**
  Setting an observed attribute (`levels`, `label`, `target`) rebuilds the index — new
  rows, and a new "current section" span. The scroll-spy re-seeded itself with the
  first heading, but `_mark()` skips an id it believes is already active, so on the
  rebuild the fresh span was left blank and stayed blank: on a phone, where the bar is
  the whole index, it read as an empty strip.

  The rebuild now forgets the active id first — the cached one described rows that no
  longer exist. Found on a bilingual page that writes both `label` and `levels` when the
  reader switches language, so two rebuilds ran back to back and the second one always
  matched.

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
