#!/usr/bin/env node
/**
 * ui-check — the behaviour of the stateful components, in a real browser.
 *
 * The assertions live in scripts/ui-check.html (they need to run inside the page,
 * next to the elements they poke); this runner opens that page over CDP, waits on
 * REAL time and reports what it found. Real time matters: a `<dialog>` `close`
 * event is never delivered while `--virtual-time-budget` fast-forwards, so the
 * promise-based confirm would look broken when it is not. See scripts/cdp.mjs.
 *
 * Covers what CSS cannot show: a toast that must not parse markup by default,
 * pause-on-hover, swipe-to-dismiss, the live region flipping to assertive for an
 * error, the stack cap, an anchored popover that flips and shifts on screen, a
 * split view driven from the keyboard, and a confirm that resolves false on Esc.
 *
 *   pnpm check:ui            (CHROME=/path/to/chrome to override the binary)
 */
import { join } from "node:path";
import { browser, serve, sleep } from "./cdp.mjs";

const { base, close: closeServer } = await serve(join(import.meta.dirname, ".."));
const b = await browser({ onFail: closeServer });
const bye = (code) => {
  b.kill();
  closeServer();
  process.exit(code);
};

await b.emulate({ width: 1200, height: 900, mobile: false });
await b.goto(`${base}/scripts/ui-check.html`, 1000);

// the page runs its own assertions; give them real time, then read the tally
let text = "";
for (let i = 0; i < 40; i++) {
  text = await b.evaluate('return document.getElementById("o").textContent;');
  if (/^\d+\/\d+ PASS/.test(text) || /^(THREW|REJECTED)/.test(text)) break;
  await sleep(500);
}

console.log(text || "(no output)");
if (/^(THREW|REJECTED)/.test(text)) {
  console.error("\nui-check: the fixture page threw before finishing.");
  bye(1);
}
const m = text.match(/^(\d+)\/(\d+) PASS/);
if (!m) {
  console.error("\nui-check: the fixture page never reported a tally (still running?).");
  bye(1);
}
const [, pass, total] = m.map(Number);
bye(pass === total ? 0 : 1);
