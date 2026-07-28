#!/usr/bin/env node
/**
 * check-scale — the grid law, enforced.
 *
 *   1. space  lands on 4px steps  (a --sp-* rung; --sp-hair is the one 2px exception)
 *   2. size   lands on 2px steps  (a square marker edge never falls mid-pixel)
 *   3. every @media width is one of the three --bp-* rungs in tokens.css
 *
 * Rule 3 exists because CSS cannot read a var() inside @media: a query has to
 * write the literal, so nothing stops two modules from switching 4px apart.
 * That is not hypothetical — the docs shell dropped its rail column at 1180px
 * while <nes-toc> became a rail at 74rem (1184px), so between those two widths
 * the collapsed bar rendered inside the 224px rail slot.
 *
 * Escape hatch: end the line with  /* off-grid: why *​/  and it is allowed.
 */
import { globSync, readFileSync } from "node:fs";

const FILES = [
  "tokens.css",
  "base.css",
  "components.css",
  "docs.html",
  ...globSync("examples/*.html"),
];
const ROOT_PX = 16;

const px = (n, unit) => (unit === "rem" || unit === "em" ? Number(n) * ROOT_PX : Number(n));
const SPACE =
  /^(?:padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left|scroll-margin|scroll-padding)(?:-(?:block|inline|top|right|bottom|left|start|end|x|y))?(?:-(?:start|end))?$/;
const SIZE =
  /^(?:(?:min-|max-)?(?:inline-size|block-size|inline|block)|width|height|(?:min|max)-(?:width|height))$/;
/** border/shadow/notch widths are not space or size — they have their own scale */
const CUSTOM_SPACE = /^--(?:sp|pad|gap|gutter|ctrl-px)/;
const CUSTOM_SIZE = /^--(?:dot|pip|ctrl-h|chrome-h|nav-w|rail-w|toc-w|side-w|doc-maxw|maxw)/;

/** the ladder: --bp-* from tokens.css, in px, for comparing against @media */
const tokens = readFileSync("tokens.css", "utf8");
const ladder = new Map();
for (const [, name, n, unit] of tokens.matchAll(/--bp-([a-z]+):\s*([\d.]+)(px|rem);/g)) {
  if (unit !== "rem")
    fail(
      "tokens.css",
      0,
      `--bp-${name}: ${n}${unit}`,
      "a breakpoint must be rem so it scales with the reader's font size",
    );
  ladder.set(px(n, unit), `--bp-${name}`);
}

const errors = [];
function fail(file, line, found, why) {
  errors.push({ file, line, found, why });
}

for (const file of FILES) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((raw, i) => {
    const line = i + 1;
    if (/\/\*\s*off-grid:/.test(raw)) return;
    const src = raw.replace(/\/\*.*?\*\//g, "");

    // ---- rule 3: @media widths ----
    if (src.includes("@media")) {
      // `max-width: X` and `min-width: X` BOTH match at exactly X, so a shell and a
      // component pinned to the same rung still disagree on that one pixel width.
      // Mobile-first `min-width: X` (inclusive) or `(width < X)` (exclusive) cannot.
      if (/max-width:/.test(src))
        fail(
          file,
          line,
          src.trim(),
          "use (width < X) instead of max-width: X — the two overlap at exactly X",
        );
      for (const [, n, unit] of src.matchAll(
        /(?:(?:min|max)-width:|width\s*[<>]=?)\s*([\d.]+)(px|rem|em)/g,
      )) {
        const w = px(n, unit);
        if (!ladder.has(w)) {
          const near = [...ladder].map(([v, k]) => `${k} (${v / ROOT_PX}rem)`).join(" · ");
          fail(file, line, `${n}${unit}`, `off the breakpoint ladder — use one of ${near}`);
        }
      }
    }

    // ---- rules 1 + 2: declarations ----
    const m = src.match(/^\s*(--?[a-z-]+|[a-z-]+)\s*:\s*([^;{}]+);/);
    if (!m) return;
    const [, prop, value] = m;
    if (prop === "--sp-hair") return; // this token *is* the documented 2px exception
    const isSpace = SPACE.test(prop) || CUSTOM_SPACE.test(prop);
    const isSize = SIZE.test(prop) || CUSTOM_SIZE.test(prop);
    if (!isSpace && !isSize) return;
    // a percentage / viewport / ch / fr value is relative by design — not on any px grid
    for (const [, n, unit] of value.matchAll(/(?<![\w.])-?(\d*\.?\d+)(px|rem)(?![\w-])/g)) {
      const v = Math.abs(px(n, unit));
      const step = isSpace ? 4 : 2;
      if (v === 0 || v % step === 0) continue;
      fail(
        file,
        line,
        `${prop}: ${value.trim()}`,
        isSpace
          ? `${v}px is off the 4px space grid — use a --sp-* rung (or --sp-hair for 2px)`
          : `${v}px is off the 2px size grid — snap it`,
      );
    }
  });
}

if (errors.length) {
  console.error(
    `check-scale: ${errors.length} value${errors.length > 1 ? "s" : ""} off the grid\n`,
  );
  for (const e of errors) console.error(`  ${e.file}:${e.line}\n    ${e.found}\n    ${e.why}\n`);
  process.exit(1);
}
console.log(
  `check-scale: space on 4px, size on 2px, ${ladder.size} breakpoints (${[...ladder.values()].join(" ")}) — ${FILES.length} files clean.`,
);
