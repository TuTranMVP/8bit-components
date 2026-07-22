/* ==========================================================================
   8-BIT DOPAMINE · docs.js  —  data-driven documentation app (no build step)
   Content lives as data; a tiny hash router renders one page at a time.
   Imports elements.js for its side effect (registers <mvp-*>) + toast().
   ========================================================================== */
import { toast } from "./elements.js";

/* --------------------------------------------------------------- helpers */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cb = (code) =>
  `<div class="codeblock"><button class="cp" type="button" aria-label="Copy code">COPY</button><pre>${esc(code)}</pre></div>`;
const stage = (cap, html, mod = "") => `<div class="stage ${mod}" data-cap="${cap}">${html}</div>`;
const h2 = (t) => `<h2 class="doc-h2">${t}</h2>`;
const p = (t) => `<p class="doc-p">${t}</p>`;
const a11y = (t) => `<div class="callout tip"><b>A11y.</b> ${t}</div>`;
const api = (cols, rows) =>
  `<div class="table-wrap"><table class="table"><thead><tr>${cols
    .map((c) => `<th>${c}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;

const CAT_ACCENT = {
  Element: "gold",
  Form: "blue",
  Feedback: "good",
  Navigation: "cyan",
  Overlay: "purple",
  Data: "warn",
};
const CAT_ORDER = ["Element", "Form", "Feedback", "Navigation", "Overlay", "Data"];

/* ===================================================================== */
/*  GETTING STARTED                                                       */
/* ===================================================================== */
const GS = [
  {
    id: "intro",
    cat: "Getting Started",
    name: "Introduction",
    desc: "A cross-framework component system with the feel of a 1985 arcade cabinet — notched pixel boxes, hard shadows, chiptune, and XP. Modern-crisp, dark-only, zero build.",
    body: () =>
      stage(
        "LIVE",
        `<a class="btn" href="#/install">GET STARTED</a>
         <a class="btn ghost" href="#/button">BROWSE COMPONENTS</a>
         <span class="badge clear">CLEAR</span>
         <button class="chip active"><span class="dot"></span>ALL</button>
         <span class="pbar" style="inline-size:120px"><i style="--fill:72%"></i></span>`,
        "center",
      ) +
      h2("Why it exists") +
      `<div class="grid-cards">
        <div class="card" data-accent="blue"><div class="head"><span class="title">Cross-framework</span></div><p>Plain classes plus light-DOM web components. Works in HTML, Vue 3, Nuxt, and React 19 with no wrapper.</p></div>
        <div class="card" data-accent="gold"><div class="head"><span class="title">Zero build</span></div><p>Ship three CSS files and one ES module. No compiler, no config, no runtime dependency.</p></div>
        <div class="card" data-accent="cyan"><div class="head"><span class="title">Token-driven</span></div><p>Every color, size, and shadow flows from <code>:root</code>. Reskin the whole system by editing one file.</p></div>
        <div class="card" data-accent="good"><div class="head"><span class="title">Accessible</span></div><p>Keyboard-navigable, focus you can see, ARIA wired, and reduced-motion respected out of the box.</p></div>
      </div>` +
      h2("The catalog") +
      catalog() +
      h2("The signature") +
      `<div class="grid-cards">
        <div class="callout memo"><b>Notch, not radius.</b> Corners are cut with <code>clip-path</code> — a pixel bevel, never a smooth radius.</div>
        <div class="callout memo"><b>Hard shadow.</b> <code>box-shadow: Npx Npx 0</code> — zero blur, pure black. Depth like a sprite.</div>
        <div class="callout tip"><b>Steps motion.</b> <code>steps()</code> easing only. Movement ticks like a sprite sheet.</div>
        <div class="callout quest"><b>One accent per block.</b> Set <code>data-accent</code> once; everything downstream inherits it.</div>
      </div>`,
  },
  {
    id: "install",
    cat: "Getting Started",
    name: "Installation",
    desc: "Add the package, import the CSS once, register the web components. Three environments, one result.",
    body: () =>
      h2("Add the package") +
      cb("pnpm add @yourscope/8bit-dopamine") +
      h2("Wire it up") +
      `<mvp-tabs style="display:block">
        <section data-label="Plain HTML" selected>${cb(
          `<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script type="module" src="elements.js"></script>`,
        )}</section>
        <section data-label="Vue 3 · Nuxt">${cb(
          `// import once (main.ts / nuxt.config)
import "@yourscope/8bit-dopamine/all.css";
import "@yourscope/8bit-dopamine";

// tell the compiler mvp-* are custom elements
compilerOptions: { isCustomElement: (t) => t.startsWith("mvp-") }`,
        )}</section>
        <section data-label="React 19">${cb(
          `import "@yourscope/8bit-dopamine/all.css";
import "@yourscope/8bit-dopamine";

// React 19 passes props + listens to custom-element events natively
<mvp-hud ns="quest" per-level="150" max-xp="600" />`,
        )}</section>
      </mvp-tabs>` +
      h2("Granular imports") +
      p(
        "Prefer the pieces? Import only what you need — order matters: tokens → base → components.",
      ) +
      cb(
        `import "@yourscope/8bit-dopamine/tokens.css";
import "@yourscope/8bit-dopamine/base.css";
import "@yourscope/8bit-dopamine/components.css";`,
      ) +
      h2("Fonts") +
      p(
        "Two fonts ship self-hosted as woff2 (Latin + Vietnamese subset): <b>IoskeleyMono</b> for chrome, labels, and code; <b>Space Grotesk</b> for body. Preload the two critical files for zero-FOUT.",
      ) +
      cb(
        `<link rel="preload" as="font" type="font/woff2"
      href="fonts/ioskeley-mono-400.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2"
      href="fonts/space-grotesk-var.woff2" crossorigin>`,
      ),
  },
  {
    id: "theming",
    cat: "Getting Started",
    name: "Theming",
    desc: "One file is the source of truth. Change the look in tokens.css — never in a component.",
    body: () =>
      p(
        "Every component reads from <code>:root</code>. Set <code>data-accent</code> on a block and the button, card, chip, and badge inside it all pick up <code>--accent</code>.",
      ) +
      stage(
        "data-accent",
        `<button class="btn" data-accent="blue">BLUE</button>
         <button class="btn" data-accent="gold">GOLD</button>
         <button class="btn" data-accent="cyan">CYAN</button>
         <button class="btn" data-accent="good">GOOD</button>
         <button class="btn" data-accent="crit">CRIT</button>`,
      ) +
      cb(
        `<div data-accent="cyan">
  <button class="btn">Info</button>
  <span class="chip"><span class="dot"></span>Tag</span>
</div>`,
      ) +
      h2("Core tokens") +
      api(
        ["Token", "Value", "Role"],
        [
          ["<code>--screen</code>", "#0a0a24", "page background"],
          ["<code>--panel</code>", "#15153f", "raised card face"],
          ["<code>--slot</code>", "#0d0d2b", "recessed: input, code"],
          ["<code>--ink</code>", "#f4f5ff", "titles, numbers"],
          ["<code>--notch</code>", "6px", "corner cut size"],
          ["<code>--bw</code>", "3px", "standard border"],
          ["<code>--sh-4</code>", "4px 4px 0", "standard card shadow"],
          ["<code>--ease-step</code>", "steps(3)", "chrome motion"],
        ],
      ) +
      h2("Accents") +
      api(
        ["Accent", "Use"],
        [
          ["<code>blue</code>", "primary action"],
          ["<code>gold</code>", "XP · highlight · default CTA"],
          ["<code>cyan</code>", "code · info"],
          ["<code>purple</code>", "special · magic"],
          ["<code>good / warn / crit</code>", "success · caution · error"],
        ],
      ) +
      h2("Do / don't") +
      `<div class="grid-cards">
        <div class="callout tip"><b>Do.</b> Recolor via <code>data-accent</code> and edit values in <code>tokens.css</code>.</div>
        <div class="callout gotcha"><b>Don't.</b> Hard-code hex or add <code>border-radius</code> inside a component — it breaks the contract.</div>
      </div>`,
  },
];

/* ===================================================================== */
/*  COMPONENTS                                                            */
/* ===================================================================== */
const COMPONENTS = [
  /* -------------------------------------------------------- ELEMENT */
  {
    id: "button",
    cat: "Element",
    name: "Button",
    desc: "Primary action. Gold by default; set data-accent to recolor. Presses in on :active — the signature move.",
    body: () =>
      stage(
        "BUTTON",
        `<button class="btn">Copy settings</button>
         <button class="btn ghost">Reset</button>
         <button class="btn" data-accent="cyan">Free play</button>
         <button class="btn" disabled>Locked</button>`,
      ) +
      cb(
        `<button class="btn">Copy settings</button>
<button class="btn ghost">Reset</button>
<button class="btn" data-accent="cyan">Free play</button>
<button class="btn" disabled>Locked</button>`,
      ) +
      h2("API") +
      api(
        ["Class / attr", "Effect"],
        [
          ["<code>.btn</code>", "solid accent button"],
          ["<code>.btn.ghost</code>", "quiet outline on dark"],
          ["<code>[aria-pressed=true]</code>", "toggle-on fills with accent"],
          ["<code>[disabled]</code>", "muted, no shadow"],
          ["<code>data-accent</code>", "recolor (blue/gold/cyan/…)"],
        ],
      ) +
      a11y(
        "Renders a native <code>&lt;button&gt;</code>, so keyboard and screen-reader behaviour come free. Use <code>aria-pressed</code> for toggles and give icon-only buttons an <code>aria-label</code>.",
      ),
  },
  {
    id: "badge",
    cat: "Element",
    name: "Badge",
    desc: "Static status marker. Not interactive — for state you can read at a glance.",
    body: () =>
      stage(
        "BADGE",
        `<span class="badge clear">CLEAR</span>
         <span class="badge warn">PENDING</span>
         <span class="badge crit">BLOCKED</span>
         <span class="badge todo">TODO</span>`,
      ) +
      cb(
        `<span class="badge clear">CLEAR</span>
<span class="badge warn">PENDING</span>
<span class="badge crit">BLOCKED</span>
<span class="badge todo">TODO</span>`,
      ) +
      a11y(
        "Colour also carries meaning, so pair critical states with text (as shown) — never rely on colour alone.",
      ),
  },
  {
    id: "chip",
    cat: "Element",
    name: "Chip",
    desc: "Toggleable filter or tag. Interactive — presses in, fills with its accent when active.",
    body: () =>
      stage(
        "CHIP",
        `<button class="chip active"><span class="dot"></span>ALL</button>
         <button class="chip" data-accent="blue"><span class="dot"></span>TYPESCRIPT</button>
         <button class="chip" data-accent="good"><span class="dot"></span>GO</button>
         <button class="chip" data-accent="crit"><span class="dot"></span>RUST</button>`,
      ) +
      cb(
        `<button class="chip active"><span class="dot"></span>ALL</button>
<button class="chip" data-accent="blue"><span class="dot"></span>TYPESCRIPT</button>`,
      ) +
      a11y(
        "It's a <code>&lt;button&gt;</code>. For a filter toggle, reflect state with <code>aria-pressed</code> instead of the <code>.active</code> class alone.",
      ),
  },
  {
    id: "card",
    cat: "Element",
    name: "Card",
    desc: "Surface for grouped content. A left accent bar classifies it; corners notch top-left and bottom-right.",
    body: () =>
      stage(
        "CARD",
        `<div class="card" data-accent="gold" style="max-inline-size:300px">
          <div class="head"><span class="num">1</span><span class="title">Model &amp; budget</span></div>
          <p>Pick a model per task, not by default. Clamp <code>maxTokens</code> to stop cost drift.</p>
        </div>`,
        "col",
      ) +
      cb(
        `<div class="card" data-accent="gold">
  <div class="head">
    <span class="num">1</span>
    <span class="title">Model & budget</span>
  </div>
  <p>Pick a model per task…</p>
</div>`,
      ) +
      h2("API") +
      api(
        ["Class", "Effect"],
        [
          ["<code>.card</code>", "standard surface"],
          ["<code>.card.lg</code>", "bigger shadow + padding"],
          ["<code>.head / .num / .title</code>", "header row parts"],
          ["<code>data-accent</code>", "recolor the left bar"],
        ],
      ) +
      a11y(
        "A card is a container, not a role. When the whole card is a link/button, wrap the interactive element rather than adding click handlers to the <code>&lt;div&gt;</code>.",
      ),
  },
  {
    id: "avatar",
    cat: "Element",
    name: "Avatar",
    desc: "User image or initials. Square by design so the hard shadow stays crisp; group them to overlap.",
    body: () =>
      stage(
        "AVATAR",
        `<span class="avatar sm">A</span>
         <span class="avatar">QA</span>
         <span class="avatar lg" data-accent="cyan">Z</span>
         <span class="avatar-group">
           <span class="avatar" data-accent="blue">1</span>
           <span class="avatar" data-accent="good">2</span>
           <span class="avatar" data-accent="purple">3</span>
         </span>`,
      ) +
      cb(
        `<span class="avatar">QA</span>
<span class="avatar lg" data-accent="cyan">Z</span>

<span class="avatar-group">
  <span class="avatar" data-accent="blue">1</span>
  <span class="avatar" data-accent="good">2</span>
</span>`,
      ) +
      h2("API") +
      api(
        ["Class / prop", "Effect"],
        [
          ["<code>.avatar</code>", "2.5rem square"],
          ["<code>.sm / .lg</code>", "1.75rem / 3.5rem"],
          ["<code>--sz</code>", "custom size"],
          ["<code>.avatar-group</code>", "overlap a row"],
        ],
      ) +
      a11y(
        "For image avatars set a meaningful <code>alt</code>; for initials add an <code>aria-label</code> with the full name.",
      ),
  },
  {
    id: "kbd",
    cat: "Element",
    name: "Kbd",
    desc: "Keyboard key hint. Inline, mono, inset — for shortcuts in prose.",
    body: () =>
      stage(
        "KBD",
        `<span style="color:var(--text)">Open the palette with <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd></span>`,
      ) +
      cb(`Press <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd>`) +
      a11y(
        "Use the semantic <code>&lt;kbd&gt;</code> element so assistive tech announces it as keyboard input.",
      ),
  },
  {
    id: "separator",
    cat: "Element",
    name: "Separator",
    desc: "Divider between content. Solid or dashed; horizontal or vertical.",
    body: () =>
      stage(
        "SEPARATOR",
        `<div style="inline-size:100%">
          <p class="doc-p" style="margin:0">Model &amp; budget</p>
          <hr class="separator">
          <p class="doc-p" style="margin:0">Tools &amp; MCP</p>
          <hr class="separator dashed">
          <p class="doc-p" style="margin:0">Guardrails</p>
        </div>`,
        "col",
      ) +
      cb(`<hr class="separator">
<hr class="separator dashed">`) +
      a11y(
        "<code>&lt;hr&gt;</code> conveys a thematic break. For a purely visual divider in a toolbar, add <code>role=\"separator\"</code> and <code>aria-orientation</code>.",
      ),
  },

  /* -------------------------------------------------------- FORM */
  {
    id: "input",
    cat: "Form",
    name: "Input",
    desc: "Single-line text field. Recessed on the screen surface; focus flips the border to gold.",
    body: () =>
      stage(
        "INPUT",
        `<label class="field" style="inline-size:100%;max-inline-size:340px">
          <span class="label">Project name</span>
          <input class="input" placeholder="my-agent">
          <span class="hint">Lowercase, no spaces.</span>
        </label>
        <label class="field err" style="inline-size:100%;max-inline-size:340px">
          <span class="label">API key <span class="req">*</span></span>
          <input class="input" value="nope" aria-invalid="true">
          <span class="hint">A key is required.</span>
        </label>`,
        "col",
      ) +
      cb(
        `<label class="field">
  <span class="label">Project name</span>
  <input class="input" placeholder="my-agent">
  <span class="hint">Lowercase, no spaces.</span>
</label>`,
      ) +
      h2("API") +
      api(
        ["Class / attr", "Effect"],
        [
          ["<code>.input</code>", "single-line field"],
          ["<code>[aria-invalid=true]</code>", "critical border"],
          ["<code>[disabled]</code>", "muted, not editable"],
          ["<code>.field</code> wrapper", "label + hint layout"],
        ],
      ) +
      a11y(
        "Always pair with a <code>&lt;label&gt;</code> (wrap it, or use <code>for</code>/<code>id</code>). On error, set <code>aria-invalid=\"true\"</code> and describe the fix in text.",
      ),
  },
  {
    id: "textarea",
    cat: "Form",
    name: "Textarea",
    desc: "Multi-line text. Vertically resizable, same recessed treatment as Input.",
    body: () =>
      stage(
        "TEXTAREA",
        `<label class="field" style="inline-size:100%;max-inline-size:420px">
          <span class="label">System prompt</span>
          <textarea class="textarea" placeholder="You are a terse coding agent…"></textarea>
        </label>`,
        "col",
      ) +
      cb(
        `<label class="field">
  <span class="label">System prompt</span>
  <textarea class="textarea" placeholder="You are…"></textarea>
</label>`,
      ) +
      a11y(
        "Give it a real label. Avoid removing the resize handle unless the layout truly can't accommodate growth.",
      ),
  },
  {
    id: "select",
    cat: "Form",
    name: "Select",
    desc: "Native select, restyled. Keeps the OS keyboard and mobile picker behaviour; gold chevron.",
    body: () =>
      stage(
        "SELECT",
        `<label class="field" style="inline-size:100%;max-inline-size:340px">
          <span class="label">Model</span>
          <select class="select">
            <option>claude-haiku-4-5</option>
            <option>claude-sonnet-5</option>
            <option>claude-opus-4-8</option>
          </select>
        </label>`,
        "col",
      ) +
      cb(
        `<select class="select">
  <option>claude-haiku-4-5</option>
  <option>claude-sonnet-5</option>
</select>`,
      ) +
      a11y(
        "Built on the native <code>&lt;select&gt;</code>, so keyboard control and mobile pickers work as users expect. Keep a label.",
      ),
  },
  {
    id: "checkbox",
    cat: "Form",
    name: "Checkbox",
    desc: "Boolean toggle in a list. Square box with a pixel check when on.",
    body: () =>
      stage(
        "CHECKBOX",
        `<label class="check"><input class="checkbox" type="checkbox" checked> Stream responses</label>
         <label class="check"><input class="checkbox" type="checkbox"> Verbose logs</label>
         <label class="check"><input class="checkbox" type="checkbox" data-accent="good" checked> Cache prompts</label>`,
        "col",
      ) +
      cb(
        `<label class="check">
  <input class="checkbox" type="checkbox" checked>
  Stream responses
</label>`,
      ) +
      a11y(
        "Native <code>&lt;input type=\"checkbox\"&gt;</code>; wrapping the label text (via <code>.check</code>) makes the whole row clickable and announced.",
      ),
  },
  {
    id: "radio",
    cat: "Form",
    name: "Radio",
    desc: "One-of-many choice. Same square box, filled solid when selected.",
    body: () =>
      stage(
        "RADIO",
        `<label class="check"><input class="radio" type="radio" name="m" checked> Haiku</label>
         <label class="check"><input class="radio" type="radio" name="m"> Sonnet</label>
         <label class="check"><input class="radio" type="radio" name="m"> Opus</label>`,
        "col",
      ) +
      cb(
        `<label class="check"><input class="radio" type="radio" name="m" checked> Haiku</label>
<label class="check"><input class="radio" type="radio" name="m"> Sonnet</label>`,
      ) +
      a11y(
        "Group radios with a shared <code>name</code> and wrap the set in a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> so the choice has a group label.",
      ),
  },
  {
    id: "switch",
    cat: "Form",
    name: "Switch",
    desc: "On/off setting with immediate effect. Green (good) accent by default.",
    body: () =>
      stage(
        "SWITCH",
        `<label class="check"><input class="switch" type="checkbox" checked> Free play</label>
         <label class="check"><input class="switch" type="checkbox"> Hard mode</label>
         <label class="check"><input class="switch" type="checkbox" data-accent="gold" checked> Sound</label>`,
        "col",
      ) +
      cb(
        `<label class="check">
  <input class="switch" type="checkbox" checked>
  Free play
</label>`,
      ) +
      a11y(
        "It's a checkbox underneath. Add <code>role=\"switch\"</code> if you want AT to announce \"on/off\" rather than \"checked\", and apply the change immediately.",
      ),
  },
  {
    id: "field",
    cat: "Form",
    name: "Field",
    desc: "Label + control + hint/error wrapper. The .err modifier turns the whole field critical.",
    body: () =>
      stage(
        "FIELD",
        `<div class="field" style="inline-size:100%;max-inline-size:360px">
          <span class="label">Temperature</span>
          <input class="input" value="0">
          <span class="hint">0 is deterministic; 1 is creative.</span>
        </div>
        <div class="field err" style="inline-size:100%;max-inline-size:360px">
          <span class="label">Max tokens <span class="req">*</span></span>
          <input class="input" value="" aria-invalid="true">
          <span class="hint">Set a ceiling to cap cost.</span>
        </div>`,
        "col",
      ) +
      cb(
        `<label class="field err">
  <span class="label">Max tokens <span class="req">*</span></span>
  <input class="input" aria-invalid="true">
  <span class="hint">Set a ceiling to cap cost.</span>
</label>`,
      ) +
      api(
        ["Class", "Role"],
        [
          ["<code>.field</code>", "vertical label/control/hint stack"],
          ["<code>.label</code>", "mono uppercase label"],
          ["<code>.hint</code>", "helper / error text"],
          ["<code>.req</code>", "required asterisk"],
          ["<code>.field.err</code>", "flip label + hint to crit"],
        ],
      ),
  },

  /* -------------------------------------------------------- FEEDBACK */
  {
    id: "alert",
    cat: "Feedback",
    name: "Alert",
    desc: "Inline message with a semantic tone. Four shades map to meaning, not decoration.",
    body: () =>
      stage(
        "CALLOUT",
        `<div style="display:grid;gap:var(--sp-3);inline-size:100%">
          <div class="callout tip"><b>Tip.</b> Lower <code>maxOutputTokens</code> for classification — much cheaper.</div>
          <div class="callout gotcha"><b>Gotcha.</b> No guard → secrets aren't protected.</div>
          <div class="callout memo"><b>Note.</b> One accent per block. Colour carries meaning.</div>
          <div class="callout quest"><b>Quest.</b> Clear 3 stages to unlock free play.</div>
        </div>`,
        "col",
      ) +
      cb(
        `<div class="callout tip"><b>Tip.</b> …</div>
<div class="callout gotcha"><b>Gotcha.</b> …</div>
<div class="callout memo"><b>Note.</b> …</div>
<div class="callout quest"><b>Quest.</b> …</div>`,
      ) +
      a11y(
        "For messages that appear dynamically, render them in a live region (<code>role=\"status\"</code> or <code>role=\"alert\"</code>) so they're announced.",
      ),
  },
  {
    id: "progress",
    cat: "Feedback",
    name: "Progress",
    desc: "Determinate bar. Fills in eight discrete blocks — steps(), not a smooth sweep.",
    body: () =>
      stage(
        "PBAR",
        `<span class="pbar" style="inline-size:280px"><i style="--fill:64%"></i></span>`,
        "col",
      ) +
      cb(`<span class="pbar"><i style="--fill:64%"></i></span>`) +
      api(
        ["Part", "Role"],
        [
          ["<code>.pbar</code>", "track"],
          ["<code>.pbar > i</code>", "fill"],
          ["<code>--fill</code>", "0%–100% (animates in steps)"],
        ],
      ) +
      a11y(
        "Add <code>role=\"progressbar\"</code> with <code>aria-valuenow</code>/<code>-valuemin</code>/<code>-valuemax</code> so the value is announced.",
      ),
  },
  {
    id: "skeleton",
    cat: "Feedback",
    name: "Skeleton",
    desc: "Loading placeholder. The shimmer ticks in steps rather than gliding.",
    body: () =>
      stage(
        "SKELETON",
        `<div style="inline-size:100%;max-inline-size:420px;display:flex;flex-direction:column;gap:var(--sp-3)">
          <span class="skeleton" style="inline-size:45%"></span>
          <span class="skeleton"></span>
          <span class="skeleton" style="inline-size:80%"></span>
        </div>`,
        "col",
      ) +
      cb(`<span class="skeleton" style="inline-size:80%"></span>`) +
      a11y(
        "Hide decorative skeletons from AT with <code>aria-hidden</code> and expose a text \"Loading…\" status elsewhere.",
      ),
  },
  {
    id: "toast",
    cat: "Feedback",
    name: "Toast",
    desc: "Transient confirmation. Fires from JS, auto-dismisses, and is announced politely.",
    body: () =>
      stage(
        "TOAST",
        `<button class="btn" data-toast="Settings saved." data-toast-accent="good">Save &amp; toast</button>
         <button class="btn ghost" data-toast="Nothing to undo." data-toast-accent="warn">Try warn</button>`,
      ) +
      cb(
        `import { toast } from "@yourscope/8bit-dopamine";

toast("Settings saved.", { accent: "good" });`,
      ) +
      h2("API") +
      api(
        ["Argument", "Meaning"],
        [
          ["<code>msg</code>", "HTML string shown in the toast"],
          ["<code>opts.accent</code>", "gold (default) · good · warn · crit · …"],
          ["<code>opts.timeout</code>", "auto-dismiss ms (0 = keep)"],
        ],
      ) +
      a11y(
        "Toasts render in a <code>role=\"status\" aria-live=\"polite\"</code> region, so screen readers hear them without focus being stolen.",
      ),
  },

  /* -------------------------------------------------------- NAVIGATION */
  {
    id: "tabs",
    cat: "Navigation",
    name: "Tabs",
    desc: "Switch between panels. Roving focus and arrow keys, built from [data-label] children.",
    body: () =>
      stage(
        "TABS",
        `<mvp-tabs style="display:block;inline-size:100%">
          <section data-label="Overview" selected>${p("Score your setup, then fix one file at a time.")}</section>
          <section data-label="Config">${p("Clamp <code>maxTokens</code>; declare only the tools you need.")}</section>
          <section data-label="Logs">${p("Every wasted tool is more tokens per call.")}</section>
        </mvp-tabs>`,
        "col",
      ) +
      cb(
        `<mvp-tabs>
  <section data-label="Overview" selected>…</section>
  <section data-label="Config">…</section>
  <section data-label="Logs">…</section>
</mvp-tabs>`,
      ) +
      a11y(
        "Implements the WAI-ARIA tabs pattern: <code>tablist</code>/<code>tab</code>/<code>tabpanel</code> roles, <code>aria-selected</code>, Left/Right arrow navigation, and roving <code>tabindex</code>.",
      ),
  },
  {
    id: "breadcrumb",
    cat: "Navigation",
    name: "Breadcrumb",
    desc: "Path to the current page. Mono, chevron-separated, last item current.",
    body: () =>
      stage(
        "BREADCRUMB",
        `<nav aria-label="Breadcrumb"><ol class="breadcrumb">
          <li><a href="#/intro">Docs</a></li>
          <li><a href="#/button">Element</a></li>
          <li><span aria-current="page">Breadcrumb</span></li>
        </ol></nav>`,
        "col",
      ) +
      cb(
        `<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Docs</a></li>
    <li><span aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>`,
      ) +
      a11y(
        "Wrap in <code>&lt;nav aria-label=\"Breadcrumb\"&gt;</code>, use an ordered list, and mark the last item <code>aria-current=\"page\"</code>.",
      ),
  },
  {
    id: "pagination",
    cat: "Navigation",
    name: "Pagination",
    desc: "Page through a list. The current page fills gold; ends disable.",
    body: () =>
      stage(
        "PAGINATION",
        `<nav class="pagination" aria-label="Pagination">
          <button class="pg" disabled>‹</button>
          <button class="pg">1</button>
          <button class="pg" aria-current="page">2</button>
          <button class="pg">3</button>
          <button class="pg">›</button>
        </nav>`,
        "col",
      ) +
      cb(
        `<nav class="pagination" aria-label="Pagination">
  <button class="pg">1</button>
  <button class="pg" aria-current="page">2</button>
  <button class="pg">3</button>
</nav>`,
      ) +
      a11y(
        "Label the <code>&lt;nav&gt;</code>, mark the active item <code>aria-current=\"page\"</code>, and disable prev/next at the ends.",
      ),
  },

  /* -------------------------------------------------------- OVERLAY */
  {
    id: "modal",
    cat: "Overlay",
    name: "Modal",
    desc: "Focus-trapping dialog on the native <dialog> element. Opens with showModal().",
    body: () =>
      stage(
        "MODAL",
        `<button class="btn" data-open="demo-modal">Open modal</button>
         <dialog class="modal" id="demo-modal" data-accent="crit">
           <div class="head"><span class="title">Reset progress?</span></div>
           <p class="doc-p" style="margin:0">This clears your XP for every stage. It can't be undone.</p>
           <form method="dialog" class="foot">
             <button class="btn ghost" value="cancel">Cancel</button>
             <button class="btn" data-accent="crit" value="ok">Reset</button>
           </form>
         </dialog>`,
      ) +
      cb(
        `<button onclick="document.getElementById('m').showModal()">Open</button>

<dialog class="modal" id="m">
  <div class="head"><span class="title">Reset progress?</span></div>
  <p>This can't be undone.</p>
  <form method="dialog" class="foot">
    <button class="btn ghost" value="cancel">Cancel</button>
    <button class="btn" data-accent="crit">Reset</button>
  </form>
</dialog>`,
      ) +
      a11y(
        "Native <code>&lt;dialog&gt;</code> traps focus, closes on <kbd class=\"kbd\">Esc</kbd>, and restores focus on close. A <code>method=\"dialog\"</code> form closes it and reports the pressed button's value.",
      ),
  },
  {
    id: "dropdown",
    cat: "Overlay",
    name: "Dropdown",
    desc: "Disclosure menu on the native <details> element. Zero JavaScript.",
    body: () =>
      stage(
        "DROPDOWN",
        `<details class="dropdown">
          <summary class="btn ghost">Actions ▾</summary>
          <div class="menu">
            <button class="menuitem">Duplicate stage</button>
            <button class="menuitem">Export XP</button>
            <button class="menuitem crit">Reset progress</button>
          </div>
        </details>`,
      ) +
      cb(
        `<details class="dropdown">
  <summary class="btn ghost">Actions ▾</summary>
  <div class="menu">
    <button class="menuitem">Duplicate</button>
    <button class="menuitem crit">Reset</button>
  </div>
</details>`,
      ) +
      a11y(
        "Built on <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code>, so the trigger is a real button with expanded state. For a full menu widget add <code>role=\"menu\"</code>/<code>menuitem</code> and arrow-key handling, plus a click-away listener to dismiss.",
      ),
  },
  {
    id: "tooltip",
    cat: "Overlay",
    name: "Tooltip",
    desc: "Label on hover or focus. Pure CSS via a data-tip attribute — no JavaScript.",
    body: () =>
      stage(
        "TOOLTIP",
        `<button class="btn ghost" data-tip="Copies to clipboard">Hover me</button>
         <span class="chip" data-tip="Filter by language" tabindex="0"><span class="dot"></span>FOCUS ME</span>`,
      ) +
      cb(`<button class="btn ghost" data-tip="Copies to clipboard">Save</button>`) +
      a11y(
        "CSS tooltips aren't announced by every screen reader — for essential info also expose it as text or <code>aria-label</code>. The trigger must be focusable so keyboard users see it (it shows on <code>:focus-visible</code>).",
      ),
  },

  /* -------------------------------------------------------- DATA */
  {
    id: "table",
    cat: "Data",
    name: "Table",
    desc: "Rows of data. Mono uppercase headers, hover highlight, scrolls on overflow.",
    body: () =>
      stage(
        "TABLE",
        `<div class="table-wrap" style="inline-size:100%">
          <table class="table">
            <thead><tr><th>Setting</th><th>Value</th><th>Saves</th></tr></thead>
            <tbody>
              <tr><td>model</td><td><code>haiku-4-5</code></td><td>92%</td></tr>
              <tr><td>maxOutputTokens</td><td><code>512</code></td><td>61%</td></tr>
              <tr><td>temperature</td><td><code>0</code></td><td>—</td></tr>
            </tbody>
          </table>
        </div>`,
        "col",
      ) +
      cb(
        `<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Setting</th><th>Value</th></tr></thead>
    <tbody><tr><td>model</td><td>haiku-4-5</td></tr></tbody>
  </table>
</div>`,
      ) +
      a11y(
        "Use real <code>&lt;thead&gt;</code>/<code>&lt;th scope&gt;</code>. Make the scroll wrapper focusable (<code>tabindex=\"0\"</code>, <code>role=\"region\"</code>, <code>aria-label</code>) so keyboard users can scroll it.",
      ),
  },
  {
    id: "code",
    cat: "Data",
    name: "Code block",
    desc: "Copyable code sample. The COPY button lifts the text to the clipboard.",
    body: () =>
      stage(
        "CODEBLOCK",
        `<div class="codeblock" style="inline-size:100%">
          <button class="cp" type="button" aria-label="Copy code">COPY</button>
<pre><span class="t-com">// clamp the token budget</span>
<span class="t-at">{</span>
  <span class="t-sel">"model"</span>: <span class="t-str">"claude-haiku-4-5"</span>,
  <span class="t-sel">"maxOutputTokens"</span>: <span class="t-num">512</span>
<span class="t-at">}</span></pre>
        </div>`,
        "col",
      ) +
      p("Wrap syntax in token spans for colour: <code>.t-sel .t-key .t-str .t-num .t-com .t-at .t-fn</code>.") +
      a11y(
        "The copy control is a real <code>&lt;button&gt;</code> with a label. Give long samples a heading or caption for context.",
      ),
  },
  {
    id: "accordion",
    cat: "Data",
    name: "Accordion",
    desc: "Collapsible section. <mvp-collapsible> — the header button toggles the body.",
    body: () =>
      stage(
        "COLLAPSIBLE",
        `<div style="inline-size:100%;display:flex;flex-direction:column;gap:var(--sp-4)">
          <mvp-collapsible open accent="gold">
            <span slot="head">STAGE 1 · Model &amp; budget</span>
            <p>Pick a model per task; clamp <code>maxTokens</code>.</p>
          </mvp-collapsible>
          <mvp-collapsible accent="cyan">
            <span slot="head">STAGE 2 · Tools &amp; MCP</span>
            <p>Declare the minimum tools you need.</p>
          </mvp-collapsible>
        </div>`,
        "col",
      ) +
      cb(
        `<mvp-collapsible open accent="gold">
  <span slot="head">STAGE 1 · Model & budget</span>
  <p>Pick a model per task…</p>
</mvp-collapsible>`,
      ) +
      a11y(
        "The header is a <code>&lt;button aria-expanded&gt;</code>; the body uses the <code>hidden</code> attribute, so closed content leaves the tab order.",
      ),
  },
  {
    id: "stat",
    cat: "Data",
    name: "Stat",
    desc: "A single big number with a label. Tabular figures; accent-colored.",
    body: () =>
      stage(
        "STAT",
        `<div class="stat" data-accent="gold"><div class="n">1,240</div><div class="l">Power</div></div>
         <div class="stat" data-accent="good"><div class="n">7</div><div class="l">Stages clear</div></div>
         <div class="stat" data-accent="cyan"><div class="n">98%</div><div class="l">Token saved</div></div>`,
      ) +
      cb(
        `<div class="stat" data-accent="gold">
  <div class="n">1,240</div>
  <div class="l">Power</div>
</div>`,
      ) +
      a11y(
        "Pair the number with a text label (as shown) so it isn't a bare figure. If it updates live, wrap it in <code>aria-live=\"polite\"</code>.",
      ),
  },
];

/* --------------------------------------------------------- derived data */
const ALL = [...GS, ...COMPONENTS];
const BY_ID = Object.fromEntries(ALL.map((pg) => [pg.id, pg]));

function catalog() {
  const groups = CAT_ORDER.map((cat) => [cat, COMPONENTS.filter((c) => c.cat === cat)]);
  return `<div class="grid-cards">${groups
    .map(
      ([cat, ps]) =>
        `<a class="card" data-accent="${CAT_ACCENT[cat]}" href="#/${ps[0].id}" style="cursor:pointer">
          <div class="head"><span class="title">${cat}</span><span class="badge" style="margin-inline-start:auto">${ps.length}</span></div>
          <p style="color:var(--muted);font-size:var(--fs-chip)">${ps.map((x) => x.name).join(" · ")}</p>
        </a>`,
    )
    .join("")}</div>`;
}

/* ----------------------------------------------------------- sidebar */
function renderSidebar() {
  const link = (pg) =>
    `<a class="navlink" href="#/${pg.id}" data-id="${pg.id}" data-name="${pg.name.toLowerCase()}">${pg.name}</a>`;
  const group = (label, items) =>
    `<div class="side-grp" data-grp><span class="side-lab">${label}</span>${items
      .map(link)
      .join("")}</div>`;

  let html = group("Getting Started", GS);
  for (const cat of CAT_ORDER) {
    html += group(cat, COMPONENTS.filter((c) => c.cat === cat));
  }
  document.getElementById("side").innerHTML = html;
}

/* ------------------------------------------------------------- router */
const pageEl = document.getElementById("page");

function render(id) {
  const pg = BY_ID[id] || BY_ID.intro;
  const body = typeof pg.body === "function" ? pg.body() : pg.body;
  const idx = ALL.indexOf(pg);
  const prev = ALL[idx - 1];
  const next = ALL[idx + 1];
  const foot = `<nav class="doc-foot">
      ${prev ? `<a class="top-link" href="#/${prev.id}">← ${prev.name}</a>` : "<span></span>"}
      ${next ? `<a class="top-link" href="#/${next.id}">${next.name} →</a>` : "<span></span>"}
    </nav>`;

  pageEl.innerHTML = `<div class="doc-page">
      <span class="eyebrow doc-cat">${pg.cat}</span>
      <h1>${pg.name}</h1>
      <p class="doc-lead">${pg.desc}</p>
      ${body}
      ${foot}
    </div>`;

  for (const a of document.querySelectorAll(".navlink")) {
    a.setAttribute("aria-current", a.dataset.id === pg.id ? "page" : "false");
  }
  document.title = `${pg.name} · 8-BIT DOPAMINE`;
  document.body.removeAttribute("data-nav-open");
  pageEl.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function currentId() {
  return (location.hash.match(/^#\/(.+)$/) || [])[1] || "intro";
}
window.addEventListener("hashchange", () => render(currentId()));

/* --------------------------------------------------- delegated behaviour */
document.addEventListener("click", (e) => {
  const cp = e.target.closest(".cp");
  if (cp) {
    const pre = cp.parentElement.querySelector("pre");
    navigator.clipboard?.writeText(pre.innerText);
    const was = cp.textContent;
    cp.textContent = "COPIED!";
    setTimeout(() => {
      cp.textContent = was;
    }, 900);
    return;
  }
  const open = e.target.closest("[data-open]");
  if (open) {
    document.getElementById(open.dataset.open)?.showModal();
    return;
  }
  const tst = e.target.closest("[data-toast]");
  if (tst) {
    toast(tst.dataset.toast, { accent: tst.dataset.toastAccent || "gold" });
    return;
  }
  if (e.target.closest("[data-menu]")) {
    document.body.toggleAttribute("data-nav-open");
    return;
  }
  if (e.target.closest("[data-home]")) {
    location.hash = "#/intro";
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches("[data-home]")) location.hash = "#/intro";
});

/* -------------------------------------------------------------- search */
document.querySelector("[data-search]")?.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  for (const a of document.querySelectorAll(".navlink")) {
    a.classList.toggle("hide", !!q && !a.dataset.name.includes(q));
  }
  for (const g of document.querySelectorAll("[data-grp]")) {
    const any = [...g.querySelectorAll(".navlink")].some((a) => !a.classList.contains("hide"));
    g.style.display = any ? "" : "none";
  }
});

/* --------------------------------------------------------------- boot */
renderSidebar();
render(currentId());
