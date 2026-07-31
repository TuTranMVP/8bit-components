#!/usr/bin/env node
/**
 * viewport-check — the promises at both ends of the breakpoint ladder, measured on
 * real viewports: a 390x844 phone with touch, and a large desktop.
 *
 * Everything in here needs `(pointer: coarse)` to be TRUE, and a plain headless
 * window reports neither coarse nor fine — so every touch rule would pass without
 * being applied. That is why this is a CDP driver and not a page that checks
 * itself: `Emulation.setDeviceMetricsOverride {mobile:true}` +
 * `setTouchEmulationEnabled` is the only way to make those rules real.
 *
 * Asserts, at 390x844 and 600x844 (phone) and at 1440 / 2560 (desktop):
 *   · the emulation actually took (or the run is meaningless — fail loudly)
 *   · every interactive box clears 24x24px          (WCAG 2.5.8, the AA floor)
 *   · every thing you press to act clears --tap     (44px, WCAG 2.5.5)
 *   · a small control keeps its size but hits --tap through its ::before
 *   · text-entry controls compute >= 16px           (or iOS zooms the page on focus)
 *   · the page never scrolls sideways on a phone
 *   · a module that has a wide shape starts in its narrow one (mobile-first)
 *   · a large screen steps the type up and widens the container, while prose stays
 *     measured and the table of contents stays beside the text it indexes
 *
 * Zero dependencies: node's own http server + global WebSocket. Not part of
 * `pnpm check` because it needs a browser binary; run it locally with
 *   pnpm check:viewport            (CHROME=/path/to/chrome to override)
 */
import { join } from "node:path";
import { browser, report, serve, sleep } from "./cdp.mjs";

const { base, close: closeServer } = await serve(join(import.meta.dirname, ".."));
const b = await browser({ onFail: closeServer });
const bye = (code) => {
  b.kill();
  closeServer();
  process.exit(code);
};
const { ok, lines, finish } = report("viewport-check");

/** the measurement, run inside the page */
const MEASURE = `
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await document.fonts.ready;
await wait(300);
const boxes = {}, fonts = {}, hits = {};
for (const el of document.querySelectorAll("[data-probe]")) {
  const r = el.getBoundingClientRect();
  boxes[el.dataset.probe] = [Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100];
  const cs = getComputedStyle(el);
  if (/^(?:input|textarea|select)$/.test(el.tagName.toLowerCase()) && !/checkbox|radio|switch|swatch/.test(el.className))
    fonts[el.dataset.probe] = Number.parseFloat(cs.fontSize);
  if (/checkbox|radio|switch/.test(el.className)) {
    const b = getComputedStyle(el, "::before");
    hits[el.dataset.probe] = [Number.parseFloat(b.inlineSize), Number.parseFloat(b.blockSize)];
  }
}
/* the real question: if a thumb lands SIZE/2 away from the centre, does the
   control get the tap? Ask the hit test, not the box — the 44px target on a 22px
   checkbox is a transparent ::before, which getBoundingClientRect cannot see.
   A hit counts when it lands on the control, inside it, or on a label that
   contains it (tapping the label activates the control). */
const hitsAt = (el, size) => {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = size / 2 - 1;
  const acts = (n) => n && (n === el || el.contains(n) || (n.contains(el) && n.closest("label, button, a")));
  return [[cx - d, cy], [cx + d, cy], [cx, cy - d], [cx, cy + d]]
    .every(([x, y]) => acts(document.elementFromPoint(x, y)));
};
const targets = {};
for (const el of document.querySelectorAll("[data-probe]")) {
  targets[el.dataset.probe] = { floor: hitsAt(el, 24), tap: hitsAt(el, 44) };
}
return {
  coarse: matchMedia("(pointer: coarse)").matches,
  width: innerWidth,
  tap: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tap")) * 16,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  treeCols: getComputedStyle(document.querySelector(".code-tree")).gridTemplateColumns.split(" ").length,
  boxes, fonts, hits, targets,
};`;

const at = async (w, h) => {
  await b.emulate({ width: w, height: h, mobile: true });
  await b.goto(`${base}/scripts/viewport-check.html`);
  return b.evaluate(MEASURE);
};

/* ---- 390px: a phone ---- */
const phone = await at(390, 844);
// if the emulation did not take, every touch assertion below is vacuous
if (!ok(phone.coarse === true, "emulation · (pointer: coarse) is live", `width=${phone.width}`)) {
  console.error(lines.join("\n"));
  console.error("\nviewport-check: refusing to report — the touch rules were never applied.");
  bye(1);
}
const missFloor = Object.entries(phone.targets).filter(([, t]) => !t.floor);
ok(
  missFloor.length === 0,
  "touch · a tap 12px off centre still lands (24x24 target, WCAG 2.5.8)",
  missFloor.map(([k]) => `${k}=${phone.boxes[k].join("x")} box`).join(" ") ||
    `${Object.keys(phone.targets).length} probes hit-tested`,
);

const PRIMARY = [
  "btn",
  "btn-icon",
  "input",
  "textarea",
  "select",
  "swatch",
  "check-box",
  "check-radio",
  "check-switch",
];
const under = PRIMARY.filter((k) => phone.targets[k] && !phone.targets[k].tap);
ok(
  under.length === 0,
  `touch · every primary control answers a --tap-wide tap (${phone.tap}px, WCAG 2.5.5)`,
  under.map((k) => `${k}=${phone.boxes[k].join("x")} box`).join(" ") || PRIMARY.join(" "),
);
// the three that stay small on purpose: the box does NOT grow, the target does
const SMALL = ["checkbox", "radio", "switch"];
ok(
  SMALL.every((k) => phone.boxes[k][1] < 24 && phone.targets[k].tap),
  "touch · checkbox/radio/switch keep their pixel size and still take a 44px tap",
  SMALL.map((k) => `${k} box=${phone.boxes[k].join("x")} tap=${phone.targets[k].tap}`).join(" · "),
);

const smallHits = Object.entries(phone.hits).filter(([, [w, h]]) => w < phone.tap || h < phone.tap);
ok(
  smallHits.length === 0,
  "touch · a small control keeps its size and hits --tap via ::before",
  smallHits.map(([k, v]) => `${k}=${v.join("x")}`).join(" ") ||
    Object.entries(phone.hits)
      .map(([k, v]) => `${k}:${v[0]}x${v[1]}`)
      .join(" "),
);

const zoomers = Object.entries(phone.fonts).filter(([, px]) => px < 16);
ok(
  zoomers.length === 0,
  "iOS · every text-entry control computes >= 16px (no focus zoom)",
  zoomers.map(([k, px]) => `${k}=${px}px`).join(" ") ||
    Object.entries(phone.fonts)
      .map(([k, px]) => `${k}:${px}`)
      .join(" "),
);

ok(phone.overflow <= 0, "layout · a phone never scrolls sideways", `${phone.overflow}px`);
ok(
  phone.treeCols === 1,
  "mobile-first · .code-tree starts in its one-column shape",
  `${phone.treeCols} column(s)`,
);

// dense rows (a list you scroll) only owe --tap-dense, but they owe it in BOTH
// directions — a 32px-wide pagination button fails a 40px tap sideways
const DENSE = ["chip", "pg", "pg2", "seg", "seg2", "tab", "tab2", "stepper-down", "stepper-up"];
const denseMiss = DENSE.filter((k) => phone.targets[k] && !phone.targets[k].floor);
ok(
  denseMiss.length === 0,
  "touch · every dense row/glyph control clears the floor in both directions",
  denseMiss.map((k) => `${k}=${phone.boxes[k].join("x")}`).join(" ") ||
    DENSE.map((k) => `${k}:${phone.boxes[k].join("x")}`).join(" "),
);

/* ---- 600px: past --bp-sm, the wide shape is ADDED ---- */
const wide = await at(600, 844);
ok(
  wide.treeCols === 2,
  "mobile-first · past --bp-sm it becomes two columns",
  `${wide.treeCols} column(s)`,
);
ok(wide.overflow <= 0, "layout · still no sideways scroll at 600px", `${wide.overflow}px`);

/* ---- the docs shell is the reference implementation an app copies, so hold it to
   the same floor: open the drawer on a phone and hit-test a navigation row ---- */
await b.emulate({ width: 390, height: 844, mobile: true });
await b.goto(`${base}/docs.html#/button`, 2200);
const shell = await b.evaluate(`
  document.body.setAttribute("data-nav-open", "");
  await new Promise((r) => setTimeout(r, 300));
  const el = document.querySelector(".navlink");
  const r = el.getBoundingClientRect();
  const d = 44 / 2 - 1, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const hits = [[cx, cy - d], [cx, cy + d]].every(([x, y]) => {
    const n = document.elementFromPoint(x, y);
    return n && (n === el || el.contains(n) || n.contains(el));
  });
  return {
    navlink: [Math.round(r.width), Math.round(r.height)],
    hits,
    drawer: getComputedStyle(document.querySelector(".side")).position,
    scrim: getComputedStyle(document.querySelector(".scrim")).display,
    cols: getComputedStyle(document.querySelector(".app")).gridTemplateColumns.split(" ").length,
  };`);
ok(
  shell.hits && shell.navlink[1] >= 44,
  "docs shell · a drawer row takes a 44px tap",
  `${shell.navlink.join("x")}`,
);
ok(
  shell.drawer === "fixed" && shell.scrim === "block" && shell.cols === 1,
  "docs shell · phone base is one column + off-canvas drawer + scrim",
  `${shell.cols} col · side=${shell.drawer} · scrim=${shell.scrim}`,
);

/* ---- the other end of the ladder: a large desktop must USE its width, and the
   rail must stay next to the text it indexes (it drifted 435px away at 2560px,
   875px at 3440px before the shell was capped and centred) ---- */
for (const w of [1440, 2560]) {
  await b.emulate({ width: w, height: 1200, mobile: false });
  await b.goto(`${base}/docs.html#/button`, 2000);
  const big = await b.evaluate(`
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const wrap = r(".doc-wrap");
    return {
      page: Math.round(wrap.width),
      stage: Math.round(r(".stage").width),
      para: Math.round(r(".doc-p").width),
      gapToRail: Math.round(r("nes-toc").left - wrap.right),
      body: Number.parseFloat(getComputedStyle(document.querySelector(".doc-p")).fontSize),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };`);
  const wide = w >= 1600;
  ok(
    big.body === (wide ? 16 : 14),
    `desktop ${w} · body copy is ${wide ? 16 : 14}px`,
    `${big.body}px`,
  );
  ok(
    big.page === (wide ? 1120 : 820),
    `desktop ${w} · the page container is ${wide ? 1120 : 820}px`,
    `${big.page}px`,
  );
  ok(
    big.para < big.stage,
    `desktop ${w} · prose stays measured while a demo takes the width`,
    `para ${big.para} < stage ${big.stage}`,
  );
  ok(big.gapToRail < 120, `desktop ${w} · the rail stays beside the text`, `${big.gapToRail}px`);
  ok(big.overflow <= 0, `desktop ${w} · no sideways scroll`, `${big.overflow}px`);
}

bye(finish() ? 1 : 0);
