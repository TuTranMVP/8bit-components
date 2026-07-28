#!/usr/bin/env node
/**
 * mobile-check — the mobile-first promises, measured on a real phone viewport.
 *
 * Everything in here needs `(pointer: coarse)` to be TRUE, and a plain headless
 * window reports neither coarse nor fine — so every touch rule would pass without
 * being applied. That is why this is a CDP driver and not a page that checks
 * itself: `Emulation.setDeviceMetricsOverride {mobile:true}` +
 * `setTouchEmulationEnabled` is the only way to make those rules real.
 *
 * Asserts, at 390x844 and again at 600x844:
 *   · the emulation actually took (or the run is meaningless — fail loudly)
 *   · every interactive box clears 24x24px          (WCAG 2.5.8, the AA floor)
 *   · every thing you press to act clears --tap     (44px, WCAG 2.5.5)
 *   · a small control keeps its size but hits --tap through its ::before
 *   · text-entry controls compute >= 16px           (or iOS zooms the page on focus)
 *   · the page never scrolls sideways on a phone
 *   · a module that has a wide shape starts in its narrow one (mobile-first)
 *
 * Zero dependencies: node's own http server + global WebSocket. Not part of
 * `pnpm check` because it needs a browser binary; run it locally with
 *   pnpm check:mobile            (CHROME=/path/to/chrome to override)
 */
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- serve the repo so ES modules and fonts load (file:// blocks both) ---- */
const server = createServer(async (req, res) => {
  const path = join(ROOT, normalize(decodeURIComponent(req.url.split("?")[0])));
  try {
    const body = await readFile(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("no");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

/* ---- drive one chrome, two viewports ---- */
const port = 9600 + (process.pid % 300);
const chrome = spawn(CHROME, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  "about:blank",
]);
const bye = (code) => {
  chrome.kill();
  server.close();
  process.exit(code);
};
chrome.on("error", (e) => {
  console.error(`mobile-check: cannot launch a browser (${e.message}).`);
  console.error("Set CHROME=/path/to/chrome. This check is not part of `pnpm check`.");
  bye(1);
});

let target;
for (let i = 0; i < 80 && !target; i++) {
  try {
    const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
    target = list.find((t) => t.type === "page");
  } catch {}
  if (!target) await sleep(250);
}
if (!target) {
  console.error("mobile-check: no CDP target");
  bye(1);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});
let msgId = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((res) => {
    const n = ++msgId;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression: `(async () => { ${expression} })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.result?.exceptionDetails)
    throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");

const out = [];
const ok = (cond, label, extra = "") => {
  out.push(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? ` · ${extra}` : ""}`);
  return cond;
};

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
  overflow: document.documentElement.scrollWidth - innerWidth,
  treeCols: getComputedStyle(document.querySelector(".code-tree")).gridTemplateColumns.split(" ").length,
  boxes, fonts, hits, targets,
};`;

const at = async (w, h) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: h,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setEmitTouchEventsForMouse", { enabled: true, configuration: "mobile" });
  await send("Page.navigate", { url: `${base}/scripts/mobile-check.html` });
  await sleep(1800);
  return evaluate(MEASURE);
};

/* ---- 390px: a phone ---- */
const phone = await at(390, 844);
// if the emulation did not take, every touch assertion below is vacuous
if (!ok(phone.coarse === true, "emulation · (pointer: coarse) is live", `width=${phone.width}`)) {
  console.error(out.join("\n"));
  console.error("\nmobile-check: refusing to report — the touch rules were never applied.");
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
});
await send("Page.navigate", { url: `${base}/docs.html#/button` });
await sleep(2200);
const shell = await evaluate(`
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

const fails = out.filter((l) => l.startsWith("FAIL")).length;
console.log(out.join("\n"));
console.log(
  `\nmobile-check: ${out.length - fails}/${out.length} PASS${fails ? ` — ${fails} FAIL` : ""}`,
);
bye(fails ? 1 : 0);
