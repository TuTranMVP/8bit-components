/**
 * The browser plumbing the two runtime checks share: serve the repo, drive one
 * headless Chrome over CDP, evaluate in the page.
 *
 * Why CDP and not `chrome --headless --dump-dom --virtual-time-budget=…`:
 *   · touch rules need real emulation — in a plain headless window BOTH
 *     (pointer: coarse) and (pointer: fine) are false, so every one of them
 *     passes without being applied (see mobile-check.mjs)
 *   · some events are never delivered while virtual time is fast-forwarding —
 *     a MediaQueryList `change`, and a <dialog>`close` — so assertions that wait
 *     on them fail for a reason that has nothing to do with the library
 * Both runners therefore wait on real time. Zero dependencies: node's own http
 * server and the global WebSocket.
 */
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** serve `root` on a random port; returns the base URL and a close() */
export async function serve(root) {
  const server = createServer(async (req, res) => {
    const path = join(root, normalize(decodeURIComponent(req.url.split("?")[0])));
    try {
      const body = await readFile(path);
      res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("no");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

/** launch chrome and attach to its page target */
export async function browser({ onFail } = {}) {
  const bin = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  const port = 9600 + Math.floor(Math.random() * 300);
  const chrome = spawn(bin, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    "about:blank",
  ]);
  chrome.on("error", (e) => {
    console.error(`cdp: cannot launch a browser (${e.message}).`);
    console.error("Set CHROME=/path/to/chrome. Browser checks are not part of `pnpm check`.");
    onFail?.();
    process.exit(1);
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
    console.error("cdp: no target");
    onFail?.();
    process.exit(1);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  let id = 0;
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
      const n = ++id;
      pending.set(n, res);
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");

  return {
    send,
    /** a real phone (mobile:true + touch) or a desktop viewport */
    async emulate({ width, height, mobile = false }) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 2,
        mobile,
      });
      await send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: 5 });
      await send("Emulation.setEmitTouchEventsForMouse", {
        enabled: mobile,
        configuration: "mobile",
      });
    },
    async goto(url, settle = 1800) {
      await send("Page.navigate", { url });
      await sleep(settle);
    },
    /** run an async body in the page and return its value */
    async evaluate(expression) {
      const r = await send("Runtime.evaluate", {
        expression: `(async () => { ${expression} })()`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.result?.exceptionDetails)
        throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500));
      return r.result?.result?.value;
    },
    kill: () => chrome.kill(),
  };
}

/** PASS/FAIL collector shared by the runners */
export function report(name) {
  const out = [];
  return {
    ok(cond, label, extra = "") {
      out.push(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? ` · ${extra}` : ""}`);
      return cond;
    },
    lines: out,
    finish() {
      const fails = out.filter((l) => l.startsWith("FAIL")).length;
      console.log(out.join("\n"));
      console.log(
        `\n${name}: ${out.length - fails}/${out.length} PASS${fails ? ` — ${fails} FAIL` : ""}`,
      );
      return fails;
    },
  };
}
