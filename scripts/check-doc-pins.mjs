// Guards the copy-paste recipes: every version and every integrity digest quoted in
// README.md / examples/*.html must match package.json and sri.json.
//
// This exists because 0.7.0 shipped with the bug it prevents. The version in the
// README's CDN URLs was bumped to @0.7.0 but the integrity attributes still carried
// 0.6.1's digests, so the documented <head> — the thing users copy — would have been
// blocked by the browser as an SRI mismatch. Nothing caught it, because sri.json is
// generated and diffed while the docs that quote it were only ever edited by hand.
//
//   node scripts/check-doc-pins.mjs
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const sri = JSON.parse(readFileSync("sri.json", "utf8")).files;
const pkg = JSON.parse(readFileSync("package.json", "utf8")).name;

const targets = [
  "README.md",
  ...(existsSync("examples")
    ? readdirSync("examples")
        .filter((f) => f.endsWith(".html"))
        .map((f) => join("examples", f))
    : []),
];

// digest -> the file it belongs to, so a stale one can be named rather than just flagged
const owner = new Map(Object.entries(sri).map(([file, digest]) => [digest, file]));
const problems = [];

for (const path of targets) {
  const text = readFileSync(path, "utf8");

  // Every version-pinning token must name the version being released. `@x.y.z`
  // is matched bare rather than only after the package name, because prose
  // quotes the pin too; `#vx.y.z` is the GitHub install spec, which the CDN
  // pattern missed entirely — 0.7.1 shipped with it still reading v0.7.0.
  // A bare "0.5.0" in prose ("new in 0.5.0") is history, not a pin: left alone.
  for (const [, sigil, spec] of text.matchAll(/(@|#v)(\d+\.\d+\.\d+)/g)) {
    if (spec !== version) {
      problems.push(`${path}: pins ${sigil}${spec}, but package.json says ${version}`);
    }
  }

  // Every digest must be one sri.json currently vouches for.
  for (const [, digest] of text.matchAll(/integrity="(sha384-[^"]+)"/g)) {
    if (!owner.has(digest)) {
      problems.push(
        `${path}: integrity ${digest.slice(0, 24)}… is not in sri.json — ` +
          `stale digest, so the documented <head> would be blocked as an SRI mismatch`,
      );
    }
  }
}

// A recipe that quotes no digest at all is its own bug: the point of the README's
// <head> is that it is pinned by content.
const quoted = targets.some((p) => /integrity="sha384-/.test(readFileSync(p, "utf8")));
if (!quoted) problems.push("no integrity attribute anywhere in README/examples");

if (problems.length) {
  console.error("check-doc-pins: the documented recipes do not match the build\n");
  for (const p of problems) console.error("  ✗ " + p);
  console.error(`\nRun \`pnpm build\` (regenerates sri.json), then copy the digests in.`);
  process.exit(1);
}
console.log(`check-doc-pins: README + examples pin ${pkg}@${version}, digests match sri.json.`);
