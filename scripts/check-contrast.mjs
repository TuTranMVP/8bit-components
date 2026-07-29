#!/usr/bin/env node
/**
 * check-contrast — the colour contract, computed from tokens.css.
 *
 * Three rules, all measured with the WCAG 2.x relative-luminance formula:
 *
 *   1. every ink rung on every ground   >= 7.0   (AAA)
 *      This library's smallest text is 9-12px uppercase mono chrome. WCAG stops
 *      scaling its requirement below 18px, so AA (4.5) is not enough for the rungs
 *      that label things; AAA is the floor and every rung already clears it.
 *   2. every accent used as TEXT on --panel / --screen >= 4.5  (AA)
 *      `.btn.link`, an error hint, an agent name — accents are text as often as
 *      they are fills. --crit was 4.17 here (error text failing AA) and --purple
 *      4.42 until this check was written.
 *   3. --ink-on-accent on every accent FILL >= 4.5  (AA)
 *      The label inside a solid button.
 *
 * Plus one shape rule: the ink ladder must fall monotonically in L* with no step
 * bigger than 9 — a cliff between two rungs is what makes the lower one read as
 * "dropped out" even when its ratio is fine.
 *
 * Zero dependencies, no browser: this one is hermetic, so it runs in `pnpm check`.
 */
import { readFileSync } from "node:fs";

const css = readFileSync("tokens.css", "utf8");
const T = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map(([, k, v]) => [k, v]),
);

const chan = (c) => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const lstar = (hex) => {
  const y = lum(hex);
  return y > 0.008856 ? 116 * y ** (1 / 3) - 16 : 903.3 * y;
};

const INK = ["ink", "text", "muted", "dim"];
const GROUND = ["bg", "screen", "panel", "panel-2", "slot"];
const ACCENT = [
  "good",
  "warn",
  "crit",
  "blue",
  "gold",
  "cyan",
  "purple",
  "lime",
  "teal",
  "indigo",
  "pink",
  "steel",
];
const AAA = 7;
const AA = 4.5;

const fails = [];
const fail = (what, got, need, why) =>
  fails.push(`${what}\n    ${got.toFixed(2)}:1 — needs ${need}. ${why}`);

for (const i of INK)
  for (const g of GROUND) {
    const r = ratio(T[i], T[g]);
    if (r < AAA)
      fail(
        `--${i} on --${g}`,
        r,
        `${AAA} (AAA)`,
        "An ink rung labels 9-12px text; AA is not enough there.",
      );
  }

for (const a of ACCENT) {
  for (const g of ["panel", "screen"]) {
    const r = ratio(T[a], T[g]);
    if (r < AA)
      fail(
        `--${a} as TEXT on --${g}`,
        r,
        `${AA} (AA)`,
        "Accents are text as often as fills (.btn.link, an error hint).",
      );
  }
  const onFill = ratio(T["ink-on-accent"], T[a]);
  if (onFill < AA)
    fail(
      `--ink-on-accent on a --${a} FILL`,
      onFill,
      `${AA} (AA)`,
      "That is the label inside a solid button.",
    );
}

// the ladder's shape: monotone, and no cliff
const ladder = INK.map((i) => [i, lstar(T[i])]);
for (let i = 1; i < ladder.length; i++) {
  const step = ladder[i - 1][1] - ladder[i][1];
  if (step <= 0)
    fails.push(
      `the ink ladder is not monotone: --${ladder[i - 1][0]} L*${ladder[i - 1][1].toFixed(1)} vs --${ladder[i][0]} L*${ladder[i][1].toFixed(1)}`,
    );
  else if (step > 9)
    fails.push(
      `--${ladder[i - 1][0]} → --${ladder[i][0]} drops ${step.toFixed(1)} L* in one step\n    A cliff makes the lower rung read as dropped out however good its ratio is. Keep steps <= 9.`,
    );
}

if (fails.length) {
  console.error(
    `check-contrast: ${fails.length} pairing${fails.length > 1 ? "s" : ""} below the floor\n`,
  );
  for (const f of fails) console.error(`  ${f}\n`);
  process.exit(1);
}
const worstInk = Math.min(...INK.flatMap((i) => GROUND.map((g) => ratio(T[i], T[g]))));
const worstText = Math.min(...ACCENT.map((a) => ratio(T[a], T.panel)));
const worstFill = Math.min(...ACCENT.map((a) => ratio(T["ink-on-accent"], T[a])));
console.log(
  `check-contrast: ${INK.length} ink rungs x ${GROUND.length} grounds all AAA (worst ${worstInk.toFixed(2)}:1), ` +
    `${ACCENT.length} accents AA as text (worst ${worstText.toFixed(2)}:1) and on fills (worst ${worstFill.toFixed(2)}:1), ` +
    `ladder steps ${ladder
      .slice(1)
      .map(([, l], i) => (ladder[i][1] - l).toFixed(1))
      .join(" / ")} L*.`,
);
