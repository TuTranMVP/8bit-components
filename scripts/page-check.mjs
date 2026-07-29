#!/usr/bin/env node
/**
 * page-check — run a fixture page in a real browser and report its tally.
 *
 * The assertions live in the page (they have to run next to the elements they
 * poke); this runner opens it over CDP, waits on REAL time, and fails the command
 * if the page reports a FAIL, throws, or never reports at all — a fixture page
 * that dies silently looks exactly like one that is still working.
 *
 * Real time matters. Under `--virtual-time-budget` a `<dialog>` `close` event is
 * never delivered and requestAnimationFrame does not advance predictably, so a
 * promise-based confirm and any rAF-paced assertion fail for reasons that have
 * nothing to do with the library. See scripts/cdp.mjs.
 *
 *   node scripts/page-check.mjs scripts/ui-check.html      (CHROME= to override)
 *   pnpm check:ui                                          (all fixture pages)
 */
import { join } from "node:path";
import { browser, serve, sleep } from "./cdp.mjs";

const page = (process.argv[2] || "scripts/ui-check.html").replace(/^\.?\//, "");
const { base, close: closeServer } = await serve(join(import.meta.dirname, ".."));
const b = await browser({ onFail: closeServer });
const bye = (code) => {
  b.kill();
  closeServer();
  process.exit(code);
};

await b.emulate({ width: 1200, height: 900, mobile: false });
await b.goto(`${base}/${page}`, 1000);

// the page runs its own assertions; give them real time, then read the tally
let text = "";
for (let i = 0; i < 40; i++) {
  // fixture pages report into #o or #r
  text = await b.evaluate(
    'return (document.getElementById("o") || document.getElementById("r"))?.textContent ?? "";',
  );
  if (/^\d+\/\d+ PASS/.test(text) || /^(THREW|REJECTED)/.test(text)) break;
  await sleep(500);
}

console.log(`— ${page}\n${text || "(no output)"}`);
if (/^(THREW|REJECTED)/.test(text)) {
  console.error(`\npage-check: ${page} threw before finishing.`);
  bye(1);
}
const m = text.match(/^(\d+)\/(\d+) PASS/);
if (!m) {
  console.error(`\npage-check: ${page} never reported a tally (still running?).`);
  bye(1);
}
const [, pass, total] = m.map(Number);
bye(pass === total ? 0 : 1);
