/* ==========================================================================
   gen-llms.mjs — generate AI-agent / RAG artifacts from the docs source.
   Single source of truth = docs.js (the same data that powers the website),
   so the machine-readable docs can never drift from the human ones.

   Emits (repo root):
     • llms.txt        — llmstxt.org index (discovery)
     • llms-full.txt   — complete flat-text reference (RAG ingestion)
     • components.json — structured manifest (exact retrieval)

   Zero deps, deterministic (no clock/random) so CI can diff it. Run: pnpm gen:llms
   ========================================================================== */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const docs = readFileSync(join(ROOT, "docs.js"), "utf8");

const BASE = "https://tutranmvp.github.io/8bit-components";
const REPO = "https://github.com/TuTranMVP/8bit-components";
const DOCS = `${BASE}/docs.html`;

/* verified primary selector per doc id (class / custom element / attribute) */
const SELECTOR = {
  button: ".btn",
  badge: ".badge",
  chip: ".chip",
  card: ".card",
  avatar: ".avatar",
  kbd: ".kbd",
  separator: ".separator",
  icon: "<nes-icon>",
  input: ".input",
  textarea: ".textarea",
  select: ".select",
  checkbox: ".checkbox",
  radio: ".radio",
  switch: ".switch",
  field: ".field",
  colorpicker: ".swatch",
  inputdate: '.input[type="date"]',
  inputtime: '.input[type="time"]',
  checkboxgroup: ".control-group",
  radiogroup: ".control-group",
  inputnumber: "<nes-number>",
  inputrating: "<nes-rating>",
  pininput: "<nes-pin>",
  inputtags: "<nes-tags>",
  fileupload: "<nes-file>",
  listbox: "<nes-listbox>",
  inputmenu: "<nes-input-menu>",
  selectmenu: "<nes-select-menu>",
  form: "<nes-form>",
  range: ".range",
  segment: ".segment",
  stepper: ".stepper",
  alert: ".callout",
  progress: ".pbar",
  skeleton: ".skeleton",
  toast: "toast()",
  spinner: ".spinner",
  meter: ".meter",
  empty: ".empty",
  banner: ".banner",
  tabs: "<nes-tabs>",
  breadcrumb: ".breadcrumb",
  pagination: ".pagination",
  steps: ".steps",
  navlist: ".navlist",
  modal: '<dialog class="modal">',
  dropdown: '<details class="dropdown">',
  tooltip: "[data-tip]",
  drawer: '<dialog class="drawer">',
  table: ".table",
  code: "<nes-code>",
  accordion: "<nes-collapsible>",
  stat: ".stat",
  rating: ".rating",
  datalist: ".datalist",
  timeline: ".timeline",
  prose: ".prose",
  tree: "<nes-tree>",
  chat: ".chat",
  chatmessages: "<nes-chat-messages>",
  chatmessage: ".msg",
  chatprompt: "<nes-chat-prompt>",
  chatpromptsubmit: ".chat-submit",
  chatreasoning: ".reasoning",
  chattool: ".tool",
  chatshimmer: ".shimmer",
  chatpalette: ".chat-palette",
  editor: "<nes-editor>",
  editortoolbar: ".editor-toolbar",
  editorsuggestionmenu: "<nes-editor> /",
  editormentionmenu: "<nes-editor> @",
  editoremojimenu: "<nes-editor> :",
  editordraghandle: ".editor-drag",
  typography: ".prose",
  codepreview: ".code-preview",
  codegroup: '<nes-tabs class="code-group">',
  codecollapse: '<details class="code-collapse">',
  codetree: "<nes-code-tree>",
  cardgroup: ".card-group",
  fieldgroup: ".field-group",
  prompt: ".prompt",
  terminal: ".terminal",
  diff: ".diff",
  tasklist: ".tasklist",
  visualize: "<nes-mermaid>",
  mermaid: "<nes-mermaid>",
  walkthrough: "<nes-walkthrough>",
  lens: '<nes-tabs class="lens">',
  zoom: "<nes-zoom>",
  annotate: "<nes-annotate>",
  compare: "<nes-compare>",
  legend: ".legend",
};
const kindOf = (sel) =>
  !sel
    ? "unknown"
    : sel.endsWith("()")
      ? "helper"
      : sel.startsWith("<")
        ? "element"
        : sel.startsWith("[")
          ? "attribute"
          : "class";

const unesc = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

/* ---- extract concepts (Getting Started: cat + name are {en,vi} objects) ---- */
const concepts = [];
const reGS =
  /id:\s*"([^"]+)",\s*cat:\s*\{[^}]*\},\s*name:\s*\{\s*en:\s*"((?:\\.|[^"\\])*)"[^}]*\},\s*desc:\s*\{\s*en:\s*"((?:\\.|[^"\\])*)"/g;
for (const m of docs.matchAll(reGS)) {
  concepts.push({
    id: m[1],
    name: unesc(m[2]),
    description: unesc(m[3]),
    docs: `${DOCS}#/${m[1]}`,
  });
}

/* ---- extract components (have cat + string name + desc.en) ---- */
const components = [];
const re =
  /id:\s*"([^"]+)",\s*cat:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*desc:\s*\{\s*en:\s*"((?:\\.|[^"\\])*)"/g;
for (const m of docs.matchAll(re)) {
  const [, id, category, name, descRaw] = m;
  const selector = SELECTOR[id] || "";
  components.push({
    id,
    name,
    category,
    selector,
    kind: kindOf(selector),
    description: unesc(descRaw),
    docs: `${DOCS}#/${id}`,
  });
}

const CAT_ORDER = [
  "Element",
  "Form",
  "Feedback",
  "Navigation",
  "Overlay",
  "Data",
  "Chat",
  "Editor",
  "Typography",
  "Visualize",
];
const byCat = (cat) => components.filter((c) => c.category === cat);
const missing = components.filter((c) => !c.selector).map((c) => c.id);
if (missing.length) console.warn("gen-llms: no selector mapped for:", missing.join(", "));

/* ---------------------------------------------------------- components.json */
const manifest = {
  name: pkg.name,
  version: pkg.version,
  title: "8-BIT NES",
  description:
    "Cross-framework NES-arcade design system: CSS design tokens + class recipes + light-DOM web components. Zero build, dark-only, square 90° corners, hard shadow.",
  official: true,
  homepage: BASE,
  docs: DOCS,
  repository: REPO,
  license: pkg.license,
  install: {
    npm: `pnpm add ${pkg.name}`,
    github: `pnpm add github:TuTranMVP/8bit-components`,
    import: [`import "${pkg.name}/all.css";`, `import "${pkg.name}";`],
    cdnCss: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/all.min.css`,
    cdnJs: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/elements.min.js`,
  },
  conventions: {
    prefix: "nes-",
    accentAttribute: "data-accent",
    accents: [
      "blue",
      "gold",
      "cyan",
      "purple",
      "lime",
      "teal",
      "indigo",
      "pink",
      "steel",
      "good",
      "warn",
      "crit",
    ],
    primaryAccent: "good",
    events: [
      "nes:change",
      "nes:submit",
      "nes:invalid",
      "nes:complete",
      "nes:answer",
      "nes:xp",
      "nes:mute",
    ],
    rules: [
      "Square 90° corners everywhere — never add border-radius or a chamfer.",
      "Depth = hard shadow (box-shadow: Npx Npx 0), never blur.",
      "One accent per block: set data-accent on the container; children inherit via --accent.",
      "Dark text on bright accent fills (var(--ink-on-accent)); never light text on a solid fill.",
      "Every value comes from a token in tokens.css — never hard-code hex/px in a component.",
      "Prefer native elements/controls; add ARIA only to fill gaps.",
    ],
  },
  concepts,
  components,
  counts: { concepts: concepts.length, components: components.length },
};
writeFileSync(join(ROOT, "components.json"), JSON.stringify(manifest, null, 2) + "\n");

/* --------------------------------------------------------------- llms.txt */
const line = (c) =>
  `- [${c.name}](${c.docs})${c.selector ? ` — \`${c.selector}\`` : ""}: ${c.description}`;
const llms = `# 8-BIT NES

> Cross-framework NES-arcade design system — CSS design tokens + class recipes + light-DOM web components (\`<nes-*>\`). Zero build step, dark-only, square 90° corners, hard shadow. Official source of truth for the \`${pkg.name}\` package (v${pkg.version}).

Install: \`pnpm add ${pkg.name}\` then \`import "${pkg.name}/all.css"; import "${pkg.name}";\`. Or CDN: \`${manifest.install.cdnCss}\`. The look is themed entirely from \`tokens.css\`; recolor any block with \`data-accent="blue|gold|cyan|purple|good|warn|crit|…"\` (default accent \`good\` = green). Full machine-readable reference: [llms-full.txt](${BASE}/llms-full.txt) · [components.json](${BASE}/components.json).

## Getting started
${concepts.map((c) => `- [${c.name}](${c.docs}): ${c.description}`).join("\n")}

${CAT_ORDER.map((cat) => `## ${cat}\n${byCat(cat).map(line).join("\n")}`).join("\n\n")}

## Optional
- [Full flat-text reference for RAG](${BASE}/llms-full.txt)
- [Structured JSON manifest](${BASE}/components.json)
- [README](${REPO}/blob/main/README.md)
- [Design rationale](${REPO}/blob/main/DESIGN.md)
- [TypeScript types](${REPO}/blob/main/index.d.ts)
`;
writeFileSync(join(ROOT, "llms.txt"), llms);

/* ---------------------------------------------------------- llms-full.txt */
const compBlock = (c) =>
  `### ${c.name}\n` +
  `- selector: \`${c.selector || "—"}\` (${c.kind}) · category: ${c.category}\n` +
  `- ${c.description}\n` +
  `- docs: ${c.docs}\n`;

const full = `# 8-BIT NES — full reference (${pkg.name} v${pkg.version})

> This is the OFFICIAL, canonical reference for the \`${pkg.name}\` design system, generated
> from its documentation source. Safe to ingest wholesale or chunk for RAG. When an AI agent
> writes UI code that consumes this library, follow the rules below exactly.

- Homepage / docs: ${DOCS}
- Repository: ${REPO}
- Package: \`${pkg.name}\` (npm) · license ${pkg.license}
- Structured manifest (exact fields): ${BASE}/components.json

## What it is
A cross-framework design system with three layers, no build step required:
1. \`tokens.css\` — \`:root\` CSS custom properties (colors, spacing, type, shadows, motion) + 3 \`@font-face\`. The single source of truth for the look.
2. \`components.css\` — stateless class recipes (\`.btn\`, \`.card\`, \`.input\`, …) in \`@layer components\`.
3. \`elements.js\` — light-DOM Web Components (\`<nes-*>\`) for the few things that hold state, plus helpers (\`toast\`, \`grantXP\`, \`bleep\`, \`store\`).

It is dark-only, uses square 90° corners everywhere, and expresses depth with a hard offset shadow (never blur).

## Install
\`\`\`bash
pnpm add ${pkg.name}
# or straight from GitHub, no publish needed:
pnpm add github:TuTranMVP/8bit-components
\`\`\`
\`\`\`js
// once, at app entry:
import "${pkg.name}/all.css";   // tokens + base + components
import "${pkg.name}";           // registers all <nes-*> web components
\`\`\`
No bundler? Link the minified single-file build from a CDN:
\`\`\`html
<link rel="stylesheet" href="${manifest.install.cdnCss}">
<script type="module" src="${manifest.install.cdnJs}"></script>
\`\`\`
Framework notes: React 19 uses \`<nes-*>\` natively. Vue/Nuxt need \`compilerOptions.isCustomElement = (t) => t.startsWith("nes-")\`.

## Theming & the accent system
Change the look ONLY in \`tokens.css\`, never inside a component. Recolor a block by setting \`data-accent\` on its container; descendants pick it up via \`--accent\`:
\`\`\`html
<div class="card" data-accent="cyan">…</div>
<button class="btn" data-accent="crit">Delete</button>
\`\`\`
Accents (semantic): \`good\` = green = success/primary (the DEFAULT), \`warn\` = gold/yellow, \`crit\` = red = error; plus hues \`blue gold cyan purple lime teal indigo pink steel\`.

## Rules for AI agents generating UI with this library
${manifest.conventions.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}
- Use one \`import "${pkg.name}/all.css"\` + one \`import "${pkg.name}"\` at app entry; do not import per-component.
- Compose with the class recipes first; reach for a \`<nes-*>\` element only for the stateful ones listed below.
- Custom elements self-register on import — just write the tag, no manual \`customElements.define\`.

## Verified examples
Buttons (solid is default; opt into variants):
\`\`\`html
<button class="btn">Primary</button>
<button class="btn outline" data-accent="cyan">Outline</button>
<button class="btn soft">Soft</button>
<button class="btn ghost">Ghost</button>
<button class="btn link">Link</button>
<button class="btn sm">Small</button>  <button class="btn lg">Large</button>
<button class="btn icon" aria-label="Settings">⚙</button>
<button class="btn block">Full width</button>
<button class="btn" aria-busy="true">Loading…</button>
\`\`\`
Field + input (with label, hint, and error state):
\`\`\`html
<label class="field">
  <span class="label">Project name</span>
  <input class="input" placeholder="my-agent">
  <span class="hint">Lowercase, no spaces.</span>
</label>
<label class="field err">
  <span class="label">API key <span class="req">*</span></span>
  <input class="input" aria-invalid="true">
  <span class="hint">A key is required.</span>
</label>
\`\`\`
Card:
\`\`\`html
<div class="card" data-accent="blue">
  <div class="head"><span class="title">Settings</span></div>
  <p>Body text.</p>
</div>
\`\`\`
Form with native validation (fires \`nes:submit\` with the data only when valid):
\`\`\`html
<nes-form>
  <label class="field"><span class="label">Email <span class="req">*</span></span>
    <input class="input" type="email" name="email" required></label>
  <nes-tags name="labels" value="agent,retro"></nes-tags>
  <nes-select-menu name="model" placeholder="Choose model…">
    <script type="application/json">[{"value":"opus","label":"Opus 4.8"}]</script>
  </nes-select-menu>
  <button class="btn" type="submit">CREATE</button>
</nes-form>
<script type="module">
  document.querySelector("nes-form")
    .addEventListener("nes:submit", (e) => console.log(e.detail.data));
</script>
\`\`\`
Tabs, and a toast:
\`\`\`html
<nes-tabs>
  <section data-label="Install" selected>…</section>
  <section data-label="Usage">…</section>
</nes-tabs>
\`\`\`
\`\`\`js
import { toast } from "${pkg.name}";
toast("<b>Saved.</b>", { accent: "good" });
\`\`\`

## Custom-element events (all bubble)
- \`nes:change\` — value changed on \`<nes-number|rating|tags|pin|file|listbox|input-menu|select-menu>\`; detail \`{ value }\` or \`{ files }\`.
- \`nes:submit\` — \`<nes-form>\` passed validation; detail \`{ data, form }\`.
- \`nes:invalid\` — \`<nes-form>\` submit was blocked.
- \`nes:complete\` — \`<nes-pin>\` fully filled; detail \`{ value }\`.
- \`nes:answer\` — \`<nes-quiz>\` answered; detail \`{ correct, choice }\`.
- \`nes:xp\` / \`nes:mute\` — document-level buses for \`<nes-hud>\` / \`<nes-sound>\`.

## Concepts
${concepts.map((c) => `- ${c.name}: ${c.docs}`).join("\n")}

## Component reference (${components.length} components)
${CAT_ORDER.map((cat) => `\n## ${cat}\n\n${byCat(cat).map(compBlock).join("\n")}`).join("")}
---
Generated from docs.js by scripts/gen-llms.mjs. Do not edit by hand — run \`pnpm gen:llms\`.
`;
writeFileSync(join(ROOT, "llms-full.txt"), full);

console.log(
  `gen-llms: wrote llms.txt, llms-full.txt, components.json — ${components.length} components, ${concepts.length} concepts.`,
);
