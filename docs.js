/* ==========================================================================
   8-BIT NES · docs.js  —  data-driven bilingual (EN / VI) documentation app.
   No build step. Content is data; a hash router renders one page at a time.
   Language is persisted (localStorage) and auto-detected on first visit.
   ========================================================================== */
import { enableMermaid, store, toast } from "./elements.js";
import { icon, iconNames } from "./icons.js";

// dogfood the Visualize module: opt the docs site into lazy-loading mermaid
// (the exact one-liner we document). The shipped library bundles none of it.
enableMermaid("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");

/* --------------------------------------------------------------- state */
let LANG =
  store.get("lang") ||
  (typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("vi")
    ? "vi"
    : "en");

/** pick a localized value: strings pass through, {en,vi} objects resolve. */
const tr = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[LANG] : v);

const UI = {
  en: {
    gs: "Getting Started",
    search: "SEARCH…  ⌘K",
    menu: "Toggle navigation",
    filter: "Filter components",
    side: "Documentation",
    onpage: "On this page",
  },
  vi: {
    gs: "Bắt đầu",
    search: "TÌM…  ⌘K",
    menu: "Bật/tắt điều hướng",
    filter: "Lọc component",
    side: "Tài liệu",
    onpage: "Trên trang này",
  },
};

/* --------------------------------------------------------------- helpers */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// abstraction: <nes-code> highlights + wires copy itself — docs just hand it code.
const cb = (code) => `<nes-code>${esc(code)}</nes-code>`;
const stage = (cap, html, mod = "") => `<div class="stage ${mod}" data-cap="${cap}">${html}</div>`;
const h2 = (t) => `<h2 class="doc-h2">${t}</h2>`;
const p = (t) => `<p class="doc-p">${t}</p>`;
const a11y = (t) =>
  `${h2(LANG === "vi" ? "Tiếp cận" : "Accessibility")}<div class="callout tip">${t}</div>`;
const api = (cols, rows) =>
  `<div class="table-wrap"><table class="table"><thead><tr>${cols
    .map((c) => `<th>${c}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;

/* ---- callouts: one glance = the critical thing to know. Four semantic kinds. */
const CALLOUT = {
  note: { cls: "info", label: { en: "NOTE", vi: "LƯU Ý" } },
  tip: { cls: "tip", label: { en: "TIP", vi: "MẸO" } },
  warn: { cls: "warn", label: { en: "CAUTION", vi: "THẬN TRỌNG" } },
  crit: { cls: "gotcha", label: { en: "CRITICAL", vi: "QUAN TRỌNG" } },
};
const callout = (kind, t) => {
  const c = CALLOUT[kind] || CALLOUT.note;
  return `<div class="callout ${c.cls}"><b>${tr(c.label)}</b> — ${t}</div>`;
};
const note = (t) => callout("note", t);
const warn = (t) => callout("warn", t);
const crit = (t) => callout("crit", t);

/* ---- typed API tables: one small grid per kind (Attributes / Props / Methods /
   Events / Slots), every row = Name · Type · Default · Meaning. Read one table →
   use the component; no source-diving. Pass only the groups that apply.
   Row shape: [name, type, default, meaning]; slot rows: [name, meaning]. */
const API_KIND = {
  attr: { en: "Attributes", vi: "Thuộc tính (HTML)" },
  prop: { en: "Properties (JS)", vi: "Property (JS)" },
  method: { en: "Methods", vi: "Method" },
  event: { en: "Events", vi: "Sự kiện" },
  slot: { en: "Content / slots", vi: "Nội dung / slot" },
};
const API_COL = {
  name: { en: "Name", vi: "Tên" },
  type: { en: "Type", vi: "Kiểu" },
  def: { en: "Default", vi: "Mặc định" },
  desc: { en: "Meaning", vi: "Ý nghĩa" },
};
function apiGroups(groups) {
  const th = (c) => `<th>${c}</th>`;
  const td = (c) => `<td>${c == null || c === "" ? "—" : c}</td>`;
  let out = "";
  for (const kind of ["attr", "prop", "method", "event", "slot"]) {
    const rows = groups[kind];
    if (!rows || !rows.length) continue;
    const isSlot = kind === "slot";
    const cols = isSlot
      ? [tr(API_COL.name), tr(API_COL.desc)]
      : [tr(API_COL.name), tr(API_COL.type), tr(API_COL.def), tr(API_COL.desc)];
    const body = rows
      .map((r) => `<tr>${(isSlot ? [r[0], r[1]] : [r[0], r[1], r[2], r[3]]).map(td).join("")}</tr>`)
      .join("");
    out +=
      `<div class="api-group"><span class="api-kind">${tr(API_KIND[kind])}</span>` +
      `<div class="table-wrap"><table class="table"><thead><tr>${cols.map(th).join("")}</tr></thead>` +
      `<tbody>${body}</tbody></table></div></div>`;
  }
  return out;
}

// shared inline diagram used by the Visualize demos (renders with no deps)
const VIZ_SVG = `<svg viewBox="0 0 460 130" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="11" style="inline-size:100%;block-size:auto">
  <g fill="var(--panel-2)" stroke="var(--line-hi)" stroke-width="2">
    <rect x="10" y="45" width="90" height="40"/><rect x="150" y="45" width="90" height="40"/>
    <rect x="300" y="8" width="90" height="40"/><rect x="300" y="82" width="90" height="40"/>
  </g>
  <g stroke="var(--primary)" stroke-width="2" fill="none">
    <line x1="100" y1="65" x2="150" y2="65"/><line x1="240" y1="65" x2="300" y2="30"/><line x1="240" y1="65" x2="300" y2="104"/>
  </g>
  <g fill="var(--ink)" text-anchor="middle">
    <text x="55" y="69">Client</text><text x="195" y="69">API</text><text x="345" y="32">Cache</text><text x="345" y="106">DB</text>
  </g>
</svg>`;

const CAT_ACCENT = {
  Element: "gold",
  Form: "blue",
  Feedback: "good",
  Navigation: "cyan",
  Overlay: "purple",
  Data: "warn",
  Chat: "teal",
  Agents: "steel",
  Editor: "indigo",
  Typography: "pink",
  Visualize: "lime",
  "Second Brain": "purple",
  OpenCode: "teal",
};
const CAT_ORDER = ["Element", "Form", "Feedback", "Navigation", "Overlay", "Data", "Chat", "Agents", "Editor", "Typography", "Visualize", "Second Brain", "OpenCode"];

/* ===================================================================== */
/*  GETTING STARTED                                                       */
/* ===================================================================== */
const GS = [
  {
    id: "intro",
    cat: { en: "Getting Started", vi: "Bắt đầu" },
    name: { en: "Introduction", vi: "Giới thiệu" },
    desc: {
      en: "A cross-framework component system with the feel of a 1985 arcade cabinet — square pixel boxes, hard shadows, chiptune, and XP. Modern-crisp, dark-only, zero build.",
      vi: "Bộ component cross-framework mang cảm giác thùng game arcade 1985 — hộp pixel, bóng đổ cứng, chiptune và XP. Sắc nét kiểu hiện đại, chỉ dark, không cần build.",
    },
    body: {
      en: () =>
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
          <div class="callout memo"><b>Press the button.</b> Square 90° corners like everything else — the button's flourish is the hard shadow + press-in on <code>:active</code>, never a cut or rounded corner.</div>
          <div class="callout memo"><b>Hard shadow.</b> <code>box-shadow: Npx Npx 0</code> — zero blur, pure black. Depth like a sprite.</div>
          <div class="callout tip"><b>Smooth motion.</b> One ease-out curve (<code>--ease</code>) on transform/opacity — high-FPS, no stutter.</div>
          <div class="callout quest"><b>One accent per block.</b> Set <code>data-accent</code> once; everything downstream inherits it.</div>
        </div>`,
      vi: () =>
        stage(
          "LIVE",
          `<a class="btn" href="#/install">BẮT ĐẦU</a>
           <a class="btn ghost" href="#/button">XEM COMPONENT</a>
           <span class="badge clear">CLEAR</span>
           <button class="chip active"><span class="dot"></span>TẤT CẢ</button>
           <span class="pbar" style="inline-size:120px"><i style="--fill:72%"></i></span>`,
          "center",
        ) +
        h2("Vì sao nên dùng") +
        `<div class="grid-cards">
          <div class="card" data-accent="blue"><div class="head"><span class="title">Chạy mọi framework</span></div><p>Class thuần cộng web component light-DOM. Chạy trong HTML, Vue 3, Nuxt và React 19 mà không cần wrapper.</p></div>
          <div class="card" data-accent="gold"><div class="head"><span class="title">Không cần build</span></div><p>Chỉ cần ba file CSS và một ES module. Không compiler, không config, không phụ thuộc runtime.</p></div>
          <div class="card" data-accent="cyan"><div class="head"><span class="title">Điều khiển bằng token</span></div><p>Mọi màu, kích thước và bóng đổ đều chảy từ <code>:root</code>. Đổi cả hệ thống bằng cách sửa một file.</p></div>
          <div class="card" data-accent="good"><div class="head"><span class="title">Tiếp cận được</span></div><p>Điều hướng bàn phím, focus nhìn thấy được, ARIA đã nối sẵn, và tôn trọng reduced-motion.</p></div>
        </div>` +
        h2("Danh mục") +
        catalog() +
        h2("Chữ ký") +
        `<div class="grid-cards">
          <div class="callout memo"><b>Nhấn lún nút.</b> Góc vuông 90° như mọi thứ khác — điểm nhấn của nút là bóng cứng + nhấn lún khi <code>:active</code>, không phải góc cắt hay bo tròn.</div>
          <div class="callout memo"><b>Bóng cứng.</b> <code>box-shadow: Npx Npx 0</code> — không blur, đen tuyền. Chiều sâu như một sprite.</div>
          <div class="callout tip"><b>Chuyển động mượt.</b> Một đường ease-out (<code>--ease</code>) trên transform/opacity — FPS cao, không giật.</div>
          <div class="callout quest"><b>Một màu nhấn mỗi khối.</b> Đặt <code>data-accent</code> một lần; mọi thứ bên dưới kế thừa.</div>
        </div>`,
    },
  },
  {
    id: "install",
    cat: { en: "Getting Started", vi: "Bắt đầu" },
    name: { en: "Installation", vi: "Cài đặt" },
    desc: {
      en: "Add the package, import the CSS once, register the web components. Three environments, one result.",
      vi: "Thêm package, import CSS một lần, đăng ký web components. Ba môi trường, cùng một kết quả.",
    },
    body: {
      en: () =>
        h2("Add the package") +
        cb("pnpm add 8bit-nes") +
        h2("Wire it up") +
        `<nes-tabs style="display:block">
          <section data-label="Plain HTML" selected>${cb(
            `<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script type="module" src="elements.js"></script>`,
          )}</section>
          <section data-label="Vue 3 · Nuxt">${cb(
            `// import once (main.ts / nuxt.config)
import "8bit-nes/all.css";
import "8bit-nes";

// tell the compiler nes-* are custom elements
compilerOptions: { isCustomElement: (t) => t.startsWith("nes-") }`,
          )}</section>
          <section data-label="React 19">${cb(
            `import "8bit-nes/all.css";
import "8bit-nes";

// React 19 passes props + listens to custom-element events natively
<nes-hud ns="quest" per-level="150" max-xp="600" />`,
          )}</section>
        </nes-tabs>` +
        h2("Granular imports") +
        p("Prefer the pieces? Import only what you need — order matters: tokens → base → components.") +
        cb(
          `import "8bit-nes/tokens.css";
import "8bit-nes/base.css";
import "8bit-nes/components.css";`,
        ) +
        h2("CDN / no build") +
        p(
          "No bundler? Link the minified single-file build — <code>@import</code>s inlined, one request each (~7&nbsp;kB + ~4&nbsp;kB gzip).",
        ) +
        cb(
          `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/8bit-nes/all.min.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/8bit-nes/elements.min.js"></script>`,
        ) +
        h2("Fonts") +
        p(
          "Two fonts ship self-hosted as woff2 (Latin + Vietnamese subset): <b>NES Mono</b> for chrome, labels, and code; <b>NES Sans</b> for body. Preload the two critical files for zero-FOUT.",
        ) +
        cb(
          `<link rel="preload" as="font" type="font/woff2"
      href="fonts/nes-mono-400.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2"
      href="fonts/nes-sans-var.woff2" crossorigin>`,
        ),
      vi: () =>
        h2("Cài package") +
        cb("pnpm add 8bit-nes") +
        h2("Kết nối") +
        `<nes-tabs style="display:block">
          <section data-label="HTML thuần" selected>${cb(
            `<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script type="module" src="elements.js"></script>`,
          )}</section>
          <section data-label="Vue 3 · Nuxt">${cb(
            `// import một lần (main.ts / nuxt.config)
import "8bit-nes/all.css";
import "8bit-nes";

// báo compiler biết nes-* là custom element
compilerOptions: { isCustomElement: (t) => t.startsWith("nes-") }`,
          )}</section>
          <section data-label="React 19">${cb(
            `import "8bit-nes/all.css";
import "8bit-nes";

// React 19 truyền prop + nghe event custom-element sẵn
<nes-hud ns="quest" per-level="150" max-xp="600" />`,
          )}</section>
        </nes-tabs>` +
        h2("Import lẻ") +
        p("Chỉ cần vài phần? Import đúng thứ bạn dùng — thứ tự quan trọng: tokens → base → components.") +
        cb(
          `import "8bit-nes/tokens.css";
import "8bit-nes/base.css";
import "8bit-nes/components.css";`,
        ) +
        h2("CDN / không build") +
        p(
          "Không dùng bundler? Link bản minify một-file — đã gộp <code>@import</code>, mỗi thứ một request (~7&nbsp;kB + ~4&nbsp;kB gzip).",
        ) +
        cb(
          `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/8bit-nes/all.min.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/8bit-nes/elements.min.js"></script>`,
        ) +
        h2("Font") +
        p(
          "Hai font tự host dạng woff2 (subset Latin + tiếng Việt): <b>NES Mono</b> cho chrome, nhãn và code; <b>NES Sans</b> cho phần thân. Preload hai file quan trọng để zero-FOUT.",
        ) +
        cb(
          `<link rel="preload" as="font" type="font/woff2"
      href="fonts/nes-mono-400.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2"
      href="fonts/nes-sans-var.woff2" crossorigin>`,
        ),
    },
  },
  {
    id: "theming",
    cat: { en: "Getting Started", vi: "Bắt đầu" },
    name: { en: "Theming", vi: "Chỉnh giao diện" },
    desc: {
      en: "One file is the source of truth. Change the look in tokens.css — never in a component.",
      vi: "Một file là nguồn chân lý duy nhất. Đổi giao diện trong tokens.css — đừng đụng vào component.",
    },
    body: {
      en: () =>
        p(
          "Every component reads from <code>:root</code>. Set <code>data-accent</code> on a block and the button, card, chip, and badge inside it all pick up <code>--accent</code>.",
        ) +
        accentStage() +
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
            ["<code>--ink</code>", "#f8f9ff", "titles, numbers"],
            ["<code>--bw</code>", "3px", "hard border"],
            ["<code>--sh-4</code>", "4px 4px 0", "standard card shadow"],
            ["<code>--ease</code>", "cubic-bezier(.22,1,.36,1)", "smooth ease-out"],
          ],
        ) +
        h2("Accents") +
        api(
          ["Accent", "Use"],
          [
            ["<code>good</code> <b>= primary</b>", "primary / positive — the default accent"],
            ["<code>blue</code>", "secondary action · links"],
            ["<code>gold</code>", "XP · highlight · attention"],
            ["<code>cyan</code>", "code · info"],
            ["<code>purple</code>", "special · magic"],
            ["<code>lime / teal / indigo / pink / steel</code>", "extended wheel — extra categories, tags, charts"],
            ["<code>warn / crit</code>", "caution · error"],
          ],
        ) +
        h2("Do / don't") +
        `<div class="grid-cards">
          <div class="callout tip"><b>Do.</b> Recolor via <code>data-accent</code> and edit values in <code>tokens.css</code>.</div>
          <div class="callout gotcha"><b>Don't.</b> Hard-code hex or add <code>border-radius</code> inside a component — it breaks the contract.</div>
        </div>`,
      vi: () =>
        p(
          "Mọi component đọc từ <code>:root</code>. Đặt <code>data-accent</code> lên một khối và button, card, chip, badge bên trong đều nhận <code>--accent</code>.",
        ) +
        accentStage() +
        cb(
          `<div data-accent="cyan">
  <button class="btn">Info</button>
  <span class="chip"><span class="dot"></span>Tag</span>
</div>`,
        ) +
        h2("Token cốt lõi") +
        api(
          ["Token", "Giá trị", "Vai trò"],
          [
            ["<code>--screen</code>", "#0a0a24", "nền trang"],
            ["<code>--panel</code>", "#15153f", "mặt card nổi"],
            ["<code>--slot</code>", "#0d0d2b", "chìm: input, code"],
            ["<code>--ink</code>", "#f8f9ff", "tiêu đề, số"],
            ["<code>--bw</code>", "3px", "viền cứng"],
            ["<code>--sh-4</code>", "4px 4px 0", "bóng card chuẩn"],
            ["<code>--ease</code>", "cubic-bezier(.22,1,.36,1)", "ease-out mượt"],
          ],
        ) +
        h2("Màu nhấn") +
        api(
          ["Màu nhấn", "Dùng cho"],
          [
            ["<code>good</code> <b>= primary</b>", "primary / tích cực — màu accent mặc định"],
            ["<code>blue</code>", "hành động phụ · link"],
            ["<code>gold</code>", "XP · nổi bật · chú ý"],
            ["<code>cyan</code>", "code · thông tin"],
            ["<code>purple</code>", "đặc biệt · phép thuật"],
            ["<code>lime / teal / indigo / pink / steel</code>", "vòng màu mở rộng — thêm nhóm, tag, biểu đồ"],
            ["<code>warn / crit</code>", "cảnh báo · lỗi"],
          ],
        ) +
        h2("Nên / Không") +
        `<div class="grid-cards">
          <div class="callout tip"><b>Nên.</b> Đổi màu qua <code>data-accent</code> và sửa giá trị trong <code>tokens.css</code>.</div>
          <div class="callout gotcha"><b>Không.</b> Hard-code hex hay thêm <code>border-radius</code> trong component — nó phá vỡ hợp đồng.</div>
        </div>`,
    },
  },
  {
    id: "colors",
    cat: { en: "Getting Started", vi: "Bắt đầu" },
    name: { en: "Colors", vi: "Bảng màu" },
    desc: {
      en: "The full palette. Grounds, ink, and a base + deep pair for every brand and semantic accent — all tokens in tokens.css.",
      vi: "Toàn bộ bảng màu. Nền, chữ, và cặp base + deep cho mọi màu thương hiệu và ngữ nghĩa — đều là token trong tokens.css.",
    },
    body: {
      en: () =>
        p(
          "Every color is a token. Each accent ships a <b>base</b> and a <b>deep (-d)</b> — deep is for hover, borders on a fill, gradients, and charts.",
        ) +
        h2("Grounds") +
        swatches([
          ["--bg", "#07071c", "cabinet"],
          ["--screen", "#0a0a24", "page"],
          ["--panel", "#15153f", "card"],
          ["--panel-2", "#1c1c56", "control"],
          ["--slot", "#0d0d2b", "recessed"],
        ]) +
        h2("Ink") +
        swatches([
          ["--ink", "#f8f9ff", "titles"],
          ["--text", "#e8eaff", "body"],
          ["--muted", "#c2c6f3", "labels"],
          ["--dim", "#a7ace1", "hints"],
        ]) +
        h2("Brand") +
        swatches([
          ["--blue", "#5c94fc", "primary"],
          ["--blue-d", "#2f4fb0", "hover / border"],
          ["--gold", "#fbd000", "XP · highlight"],
          ["--gold-d", "#c99700", "hover / border"],
          ["--cyan", "#33e0e0", "info · code"],
          ["--cyan-d", "#1f9e9e", "hover / border"],
          ["--purple", "#b357e0", "special"],
          ["--purple-d", "#7d33a8", "hover / border"],
        ]) +
        h2("Extended wheel") +
        swatches([
          ["--lime", "#b8e62e", "fresh · level-up"],
          ["--lime-d", "#75980f", "hover / border"],
          ["--teal", "#2ad8b8", "calm info"],
          ["--teal-d", "#158f78", "hover / border"],
          ["--indigo", "#7c7cff", "deep primary · link"],
          ["--indigo-d", "#4a45c8", "hover / border"],
          ["--pink", "#ff6ec7", "playful · like"],
          ["--pink-d", "#c23d90", "hover / border"],
          ["--steel", "#9aa2d8", "neutral tag"],
          ["--steel-d", "#565d95", "hover / border"],
        ]) +
        h2("Semantic") +
        swatches([
          ["--good", "#56d364", "success"],
          ["--good-d", "#2f9e3f", "hover / border"],
          ["--warn", "#ff9e2c", "caution"],
          ["--warn-d", "#c46e00", "hover / border"],
          ["--crit", "#e6394a", "error"],
          ["--crit-d", "#a81f2e", "hover / border"],
        ]) +
        p(
          "Draw dark ink on any solid accent with <code>--ink-on-accent</code> — never white on gold/green/cyan.",
        ),
      vi: () =>
        p(
          "Mọi màu đều là token. Mỗi accent có <b>base</b> và <b>deep (-d)</b> — deep dùng cho hover, viền trên nền tô, gradient và biểu đồ.",
        ) +
        h2("Nền") +
        swatches([
          ["--bg", "#07071c", "cabinet"],
          ["--screen", "#0a0a24", "trang"],
          ["--panel", "#15153f", "card"],
          ["--panel-2", "#1c1c56", "control"],
          ["--slot", "#0d0d2b", "chìm"],
        ]) +
        h2("Chữ") +
        swatches([
          ["--ink", "#f8f9ff", "tiêu đề"],
          ["--text", "#e8eaff", "thân"],
          ["--muted", "#c2c6f3", "nhãn"],
          ["--dim", "#a7ace1", "gợi ý"],
        ]) +
        h2("Thương hiệu") +
        swatches([
          ["--blue", "#5c94fc", "chính"],
          ["--blue-d", "#2f4fb0", "hover / viền"],
          ["--gold", "#fbd000", "XP · highlight"],
          ["--gold-d", "#c99700", "hover / viền"],
          ["--cyan", "#33e0e0", "info · code"],
          ["--cyan-d", "#1f9e9e", "hover / viền"],
          ["--purple", "#b357e0", "đặc biệt"],
          ["--purple-d", "#7d33a8", "hover / viền"],
        ]) +
        h2("Vòng màu mở rộng") +
        swatches([
          ["--lime", "#b8e62e", "tươi · lên cấp"],
          ["--lime-d", "#75980f", "hover / viền"],
          ["--teal", "#2ad8b8", "info dịu"],
          ["--teal-d", "#158f78", "hover / viền"],
          ["--indigo", "#7c7cff", "primary sâu · link"],
          ["--indigo-d", "#4a45c8", "hover / viền"],
          ["--pink", "#ff6ec7", "vui · thích"],
          ["--pink-d", "#c23d90", "hover / viền"],
          ["--steel", "#9aa2d8", "tag trung tính"],
          ["--steel-d", "#565d95", "hover / viền"],
        ]) +
        h2("Ngữ nghĩa") +
        swatches([
          ["--good", "#56d364", "thành công"],
          ["--good-d", "#2f9e3f", "hover / viền"],
          ["--warn", "#ff9e2c", "cảnh báo"],
          ["--warn-d", "#c46e00", "hover / viền"],
          ["--crit", "#e6394a", "lỗi"],
          ["--crit-d", "#a81f2e", "hover / viền"],
        ]) +
        p(
          "Vẽ chữ tối trên mọi nền accent bằng <code>--ink-on-accent</code> — đừng để chữ trắng trên gold/green/cyan.",
        ),
    },
  },
];

/* ===================================================================== */
/*  COMPONENTS  (name + category are English identifiers; prose is i18n)  */
/* ===================================================================== */
const COMPONENTS = [
  /* -------------------------------------------------------- ELEMENT */
  {
    id: "button",
    cat: "Element",
    name: "Button",
    desc: {
      en: "Primary action. Green (the primary accent) by default; set data-accent to recolor. Presses in on :active — the signature move.",
      vi: "Hành động chính. Mặc định màu green (màu primary); đặt data-accent để đổi màu. Nhấn lún khi :active — chính là chữ ký.",
    },
    body: {
      en: () =>
        stage(
          "BUTTON",
          `<button class="btn">Solid</button>
           <button class="btn outline">Outline</button>
           <button class="btn soft">Soft</button>
           <button class="btn ghost">Ghost</button>
           <button class="btn link">Link</button>
           <button class="btn" data-accent="cyan">Cyan</button>`,
        ) +
        cb(
          `<button class="btn">Solid</button>
<button class="btn outline">Outline</button>
<button class="btn soft">Soft</button>
<button class="btn ghost">Ghost</button>
<button class="btn link">Link</button>
<button class="btn" data-accent="cyan">Cyan</button>`,
        ) +
        h2("Sizes") +
        stage(
          "SIZE",
          `<button class="btn xs">XS</button>
           <button class="btn sm">SM</button>
           <button class="btn">MD</button>
           <button class="btn lg">LG</button>
           <button class="btn xl">XL</button>`,
        ) +
        p(
          `One scale, every control. <code>data-size="xs|sm|md|lg|xl"</code> (or the <code>.xs</code>/<code>.sm</code>/<code>.lg</code>/<code>.xl</code> classes) sets a <b>shared height</b>, so a button lines up pixel-for-pixel with an input or select at the same size. Set it on one control — or on a wrapper to size a whole row at once.`,
        ) +
        stage(
          "ROW",
          `<div data-size="lg" style="display:flex;gap:var(--sp-2);align-items:center;flex-wrap:wrap">
             <button class="btn">Save</button>
             <input class="input" value="filename" style="inline-size:130px" aria-label="name">
             <select class="select" style="inline-size:110px"><option>Type</option></select>
             <button class="btn icon" aria-label="Search"><nes-icon name="search"></nes-icon></button>
           </div>`,
        ) +
        cb(
          `<!-- size one control -->
<button class="btn" data-size="lg">Save</button>
<input class="input" data-size="lg">

<!-- …or size a whole toolbar at once: everything inside snaps to lg -->
<div data-size="lg" style="display:flex;gap:.5rem;align-items:center">
  <button class="btn">Save</button>
  <input class="input">
  <select class="select">…</select>
  <button class="btn icon" aria-label="Search"><nes-icon name="search"></nes-icon></button>
</div>`,
        ) +
        h2("Icon · toggle · loading") +
        stage(
          "STATE",
          `<button class="btn"><nes-icon name="refresh"></nes-icon> Regenerate</button>
           <button class="btn soft">Export <nes-icon name="chevronDown"></nes-icon></button>
           <button class="btn icon" aria-label="Play"><nes-icon name="play"></nes-icon></button>
           <button class="btn ghost" aria-pressed="true"><nes-icon name="star"></nes-icon> Starred</button>
           <button class="btn" aria-busy="true">Saving</button>
           <button class="btn" disabled>Locked</button>`,
        ) +
        cb(
          `<!-- leading / trailing icon: drop a <nes-icon> beside the label -->
<button class="btn"><nes-icon name="refresh"></nes-icon> Regenerate</button>
<button class="btn soft">Export <nes-icon name="chevronDown"></nes-icon></button>

<!-- icon-only needs an aria-label (the icon stays decorative) -->
<button class="btn icon" aria-label="Play"><nes-icon name="play"></nes-icon></button>

<!-- toggle: flip aria-pressed -->
<button class="btn ghost" aria-pressed="true"><nes-icon name="star"></nes-icon> Starred</button>

<!-- loading: set aria-busy, clicks are blocked -->
<button class="btn" aria-busy="true">Saving…</button>`,
        ) +
        callout(
          "tip",
          `Icons are the built-in 8-BIT set — <code>&lt;nes-icon name="refresh"&gt;</code> (zero-build) or <code>import { refresh } from "8bit-nes/icons"</code> (tree-shaken). They inherit the button's color and 1em size automatically. Browse all on the <a href="#/icon">Icon</a> page.`,
        ) +
        h2("Button group") +
        p(
          "Fuse independent actions into one seamless bar with <code>.btn-group</code> — an AI action toolbar, a split button, or a full-width stack. Each child keeps its own variant, accent and size.",
        ) +
        stage(
          "GROUP",
          `<div class="btn-group">
             <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Regenerate</button>
             <button class="btn ghost xs"><nes-icon name="copy"></nes-icon> Copy</button>
             <button class="btn ghost xs"><nes-icon name="share"></nes-icon> Share</button>
           </div>
           <div class="btn-group">
             <button class="btn">Publish</button>
             <button class="btn icon" aria-label="More options"><nes-icon name="chevronDown"></nes-icon></button>
           </div>`,
        ) +
        cb(
          `<!-- action toolbar (dense, xs) -->
<div class="btn-group">
  <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Regenerate</button>
  <button class="btn ghost xs"><nes-icon name="copy"></nes-icon> Copy</button>
  <button class="btn ghost xs"><nes-icon name="share"></nes-icon> Share</button>
</div>

<!-- split button = main action + caret -->
<div class="btn-group">
  <button class="btn">Publish</button>
  <button class="btn icon" aria-label="More options"><nes-icon name="chevronDown"></nes-icon></button>
</div>

<!-- full-width bar / vertical stack -->
<div class="btn-group block">…</div>
<div class="btn-group stack">…</div>`,
        ) +
        h2("API") +
        api(
          ["Class / attr", "Effect"],
          [
            ["<code>.btn</code>", "solid accent fill (default)"],
            ["<code>.btn.outline</code>", "transparent, accent edge + text"],
            ["<code>.btn.soft</code>", "low-tint accent fill"],
            ["<code>.btn.ghost</code>", "quiet outline on dark"],
            ["<code>.btn.link</code>", "text-only — no bevel or shadow"],
            ["<code>.xs</code>…<code>.xl</code> / <code>data-size</code>", "shared size rung (height + pad + font) — lines up with inputs/selects"],
            ["<code>.block</code>", "full-width"],
            ["<code>.icon</code>", "square icon-only (add aria-label)"],
            ["<code>[aria-busy=true]</code>", "loading spinner, clicks blocked"],
            ["<code>[aria-pressed=true]</code>", "toggle-on fills with accent"],
            ["<code>[disabled]</code>", "muted, no shadow"],
            ["<code>data-accent</code>", "recolor (blue/gold/cyan/…)"],
            ["<code>.btn-group</code>", "fuse buttons into one bar"],
            ["<code>.btn-group.block</code>", "bar fills width, equal children"],
            ["<code>.btn-group.stack</code>", "vertical bar (mobile menus)"],
          ],
        ) +
        note(
          `<code>.btn-group</code> joins <b>independent actions</b> (each does its own thing). For a single-select where one option stays lit, reach for <code>.segment</code> instead.`,
        ) +
        warn(
          `Inside a <code>&lt;form&gt;</code> a bare <code>&lt;button&gt;</code> defaults to <code>type="submit"</code>. Add <code>type="button"</code> to any button that must not submit.`,
        ) +
        a11y(
          `Renders a native <code>&lt;button&gt;</code>, so keyboard and screen-reader behaviour come free. Use <code>aria-pressed</code> for toggles, <code>aria-busy</code> for loading, mark decorative glyphs <code>aria-hidden="true"</code>, and give icon-only buttons an <code>aria-label</code>.`,
        ),
      vi: () =>
        stage(
          "BUTTON",
          `<button class="btn">Solid</button>
           <button class="btn outline">Outline</button>
           <button class="btn soft">Soft</button>
           <button class="btn ghost">Ghost</button>
           <button class="btn link">Link</button>
           <button class="btn" data-accent="cyan">Cyan</button>`,
        ) +
        cb(
          `<button class="btn">Solid</button>
<button class="btn outline">Outline</button>
<button class="btn soft">Soft</button>
<button class="btn ghost">Ghost</button>
<button class="btn link">Link</button>
<button class="btn" data-accent="cyan">Cyan</button>`,
        ) +
        h2("Kích cỡ") +
        stage(
          "SIZE",
          `<button class="btn xs">XS</button>
           <button class="btn sm">SM</button>
           <button class="btn">MD</button>
           <button class="btn lg">LG</button>
           <button class="btn xl">XL</button>`,
        ) +
        p(
          `Một thang, mọi control. <code>data-size="xs|sm|md|lg|xl"</code> (hoặc class <code>.xs</code>/<code>.sm</code>/<code>.lg</code>/<code>.xl</code>) đặt <b>chiều cao dùng chung</b>, nên button khớp pixel-cho-pixel với input hay select cùng size. Đặt trên một control — hoặc trên một wrapper để chỉnh cả hàng cùng lúc.`,
        ) +
        stage(
          "ROW",
          `<div data-size="lg" style="display:flex;gap:var(--sp-2);align-items:center;flex-wrap:wrap">
             <button class="btn">Lưu</button>
             <input class="input" value="filename" style="inline-size:130px" aria-label="name">
             <select class="select" style="inline-size:110px"><option>Loại</option></select>
             <button class="btn icon" aria-label="Tìm"><nes-icon name="search"></nes-icon></button>
           </div>`,
        ) +
        cb(
          `<!-- chỉnh một control -->
<button class="btn" data-size="lg">Lưu</button>
<input class="input" data-size="lg">

<!-- …hoặc chỉnh cả thanh: mọi thứ bên trong snap về lg -->
<div data-size="lg" style="display:flex;gap:.5rem;align-items:center">
  <button class="btn">Lưu</button>
  <input class="input">
  <select class="select">…</select>
  <button class="btn icon" aria-label="Tìm"><nes-icon name="search"></nes-icon></button>
</div>`,
        ) +
        h2("Icon · toggle · loading") +
        stage(
          "STATE",
          `<button class="btn"><nes-icon name="refresh"></nes-icon> Tạo lại</button>
           <button class="btn soft">Xuất <nes-icon name="chevronDown"></nes-icon></button>
           <button class="btn icon" aria-label="Chơi"><nes-icon name="play"></nes-icon></button>
           <button class="btn ghost" aria-pressed="true"><nes-icon name="star"></nes-icon> Đã lưu</button>
           <button class="btn" aria-busy="true">Đang lưu</button>
           <button class="btn" disabled>Khoá</button>`,
        ) +
        cb(
          `<!-- icon trước / sau: đặt <nes-icon> cạnh chữ -->
<button class="btn"><nes-icon name="refresh"></nes-icon> Tạo lại</button>
<button class="btn soft">Xuất <nes-icon name="chevronDown"></nes-icon></button>

<!-- chỉ-icon thì cần aria-label (icon là trang trí) -->
<button class="btn icon" aria-label="Chơi"><nes-icon name="play"></nes-icon></button>

<!-- toggle: lật aria-pressed -->
<button class="btn ghost" aria-pressed="true"><nes-icon name="star"></nes-icon> Đã lưu</button>

<!-- loading: đặt aria-busy, click bị chặn -->
<button class="btn" aria-busy="true">Đang lưu…</button>`,
        ) +
        callout(
          "tip",
          `Icon lấy từ bộ 8-BIT có sẵn — <code>&lt;nes-icon name="refresh"&gt;</code> (zero-build) hoặc <code>import { refresh } from "8bit-nes/icons"</code> (tree-shake). Chúng tự thừa hưởng màu và cỡ 1em của nút. Xem toàn bộ ở trang <a href="#/icon">Icon</a>.`,
        ) +
        h2("Nhóm nút") +
        p(
          "Gộp các hành động độc lập thành một thanh liền mạch bằng <code>.btn-group</code> — thanh action cho AI, nút split, hay stack rộng hết dòng. Mỗi nút con vẫn giữ variant, màu nhấn và cỡ riêng.",
        ) +
        stage(
          "GROUP",
          `<div class="btn-group">
             <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Tạo lại</button>
             <button class="btn ghost xs"><nes-icon name="copy"></nes-icon> Chép</button>
             <button class="btn ghost xs"><nes-icon name="share"></nes-icon> Chia sẻ</button>
           </div>
           <div class="btn-group">
             <button class="btn">Đăng</button>
             <button class="btn icon" aria-label="Thêm tuỳ chọn"><nes-icon name="chevronDown"></nes-icon></button>
           </div>`,
        ) +
        cb(
          `<!-- thanh action (gọn, xs) -->
<div class="btn-group">
  <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Tạo lại</button>
  <button class="btn ghost xs"><nes-icon name="copy"></nes-icon> Chép</button>
  <button class="btn ghost xs"><nes-icon name="share"></nes-icon> Chia sẻ</button>
</div>

<!-- nút split = hành động chính + caret -->
<div class="btn-group">
  <button class="btn">Đăng</button>
  <button class="btn icon" aria-label="Thêm tuỳ chọn"><nes-icon name="chevronDown"></nes-icon></button>
</div>

<!-- rộng hết dòng / xếp dọc -->
<div class="btn-group block">…</div>
<div class="btn-group stack">…</div>`,
        ) +
        h2("API") +
        api(
          ["Class / thuộc tính", "Tác dụng"],
          [
            ["<code>.btn</code>", "tô đầy màu nhấn (mặc định)"],
            ["<code>.btn.outline</code>", "trong suốt, viền + chữ theo màu nhấn"],
            ["<code>.btn.soft</code>", "nền màu nhấn nhạt"],
            ["<code>.btn.ghost</code>", "viền mờ trên nền tối"],
            ["<code>.btn.link</code>", "chỉ chữ — bỏ vát góc & bóng"],
            ["<code>.xs</code>…<code>.xl</code> / <code>data-size</code>", "rung size dùng chung (cao + đệm + font) — khớp với input/select"],
            ["<code>.block</code>", "rộng hết dòng"],
            ["<code>.icon</code>", "vuông chỉ-icon (thêm aria-label)"],
            ["<code>[aria-busy=true]</code>", "spinner loading, chặn click"],
            ["<code>[aria-pressed=true]</code>", "toggle bật, tô đầy màu nhấn"],
            ["<code>[disabled]</code>", "mờ đi, bỏ bóng"],
            ["<code>data-accent</code>", "đổi màu (blue/gold/cyan/…)"],
            ["<code>.btn-group</code>", "gộp nút thành một thanh"],
            ["<code>.btn-group.block</code>", "thanh rộng hết dòng, nút đều nhau"],
            ["<code>.btn-group.stack</code>", "thanh dọc (menu mobile)"],
          ],
        ) +
        note(
          `<code>.btn-group</code> gộp các <b>hành động độc lập</b> (mỗi nút làm việc riêng). Nếu cần chọn-một với một lựa chọn luôn sáng, hãy dùng <code>.segment</code>.`,
        ) +
        warn(
          `Trong <code>&lt;form&gt;</code>, <code>&lt;button&gt;</code> trơn mặc định là <code>type="submit"</code>. Thêm <code>type="button"</code> cho nút không được submit.`,
        ) +
        a11y(
          `Render ra <code>&lt;button&gt;</code> gốc nên bàn phím và screen reader hoạt động sẵn. Dùng <code>aria-pressed</code> cho toggle, <code>aria-busy</code> cho loading, gắn <code>aria-hidden="true"</code> cho glyph trang trí, và đặt <code>aria-label</code> cho nút chỉ có icon.`,
        ),
    },
  },
  {
    id: "badge",
    cat: "Element",
    name: "Badge",
    desc: {
      en: "Static status marker. Not interactive — for state you can read at a glance.",
      vi: "Nhãn trạng thái tĩnh. Không tương tác — để đọc trạng thái trong một cái liếc.",
    },
    body: {
      en: () =>
        badgeStage() +
        cb(
          `<span class="badge clear">CLEAR</span>
<span class="badge warn">PENDING</span>
<span class="badge crit">BLOCKED</span>
<span class="badge todo">TODO</span>`,
        ) +
        a11y(
          "Colour also carries meaning, so pair critical states with text (as shown) — never rely on colour alone.",
        ),
      vi: () =>
        badgeStage() +
        cb(
          `<span class="badge clear">CLEAR</span>
<span class="badge warn">PENDING</span>
<span class="badge crit">BLOCKED</span>
<span class="badge todo">TODO</span>`,
        ) +
        a11y(
          "Màu cũng tải nghĩa, nên hãy kèm chữ cho trạng thái quan trọng (như ở đây) — đừng chỉ dựa vào màu.",
        ),
    },
  },
  {
    id: "chip",
    cat: "Element",
    name: "Chip",
    desc: {
      en: "Toggleable filter or tag. Interactive — presses in, fills with its accent when active.",
      vi: "Thẻ lọc/tag bật-tắt được. Có tương tác — nhấn lún, tô đầy màu nhấn khi active.",
    },
    body: {
      en: () =>
        chipStage("ALL") +
        cb(
          `<button class="chip active"><span class="dot"></span>ALL</button>
<button class="chip" data-accent="blue"><span class="dot"></span>TYPESCRIPT</button>`,
        ) +
        a11y(
          "It's a <code>&lt;button&gt;</code>. For a filter toggle, reflect state with <code>aria-pressed</code> instead of the <code>.active</code> class alone.",
        ),
      vi: () =>
        chipStage("TẤT CẢ") +
        cb(
          `<button class="chip active"><span class="dot"></span>ALL</button>
<button class="chip" data-accent="blue"><span class="dot"></span>TYPESCRIPT</button>`,
        ) +
        a11y(
          "Nó là <code>&lt;button&gt;</code>. Với bộ lọc toggle, phản ánh trạng thái bằng <code>aria-pressed</code> thay vì chỉ class <code>.active</code>.",
        ),
    },
  },
  {
    id: "card",
    cat: "Element",
    name: "Card",
    desc: {
      en: "Surface for grouped content. A left accent bar classifies it; hard border, hard shadow, square corners.",
      vi: "Bề mặt gom nội dung. Thanh màu bên trái phân loại; viền cứng, bóng đổ cứng, góc vuông.",
    },
    body: {
      en: () =>
        stage(
          "CARD",
          `<div class="card" data-accent="gold" style="max-inline-size:min(300px,100%)">
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
      vi: () =>
        stage(
          "CARD",
          `<div class="card" data-accent="gold" style="max-inline-size:min(300px,100%)">
            <div class="head"><span class="num">1</span><span class="title">Model &amp; ngân sách</span></div>
            <p>Chọn model theo tác vụ, đừng theo mặc định. Kẹp <code>maxTokens</code> để chặn trôi chi phí.</p>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="card" data-accent="gold">
  <div class="head">
    <span class="num">1</span>
    <span class="title">Model & ngân sách</span>
  </div>
  <p>Chọn model theo tác vụ…</p>
</div>`,
        ) +
        h2("API") +
        api(
          ["Class", "Tác dụng"],
          [
            ["<code>.card</code>", "bề mặt chuẩn"],
            ["<code>.card.lg</code>", "bóng + padding lớn hơn"],
            ["<code>.head / .num / .title</code>", "các phần của hàng header"],
            ["<code>data-accent</code>", "đổi màu thanh bên trái"],
          ],
        ) +
        a11y(
          "Card là container, không phải role. Khi cả card là link/nút, hãy bọc phần tử tương tác thay vì gắn click vào <code>&lt;div&gt;</code>.",
        ),
    },
  },
  {
    id: "avatar",
    cat: "Element",
    name: "Avatar",
    desc: {
      en: "User image or initials. Square by design so the hard shadow stays crisp; group them to overlap.",
      vi: "Ảnh hoặc chữ viết tắt của người dùng. Vuông theo chủ đích để bóng cứng luôn sắc; xếp chồng thành nhóm.",
    },
    body: {
      en: () =>
        avatarStage() +
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
      vi: () =>
        avatarStage() +
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
          ["Class / prop", "Tác dụng"],
          [
            ["<code>.avatar</code>", "vuông 2.5rem"],
            ["<code>.sm / .lg</code>", "1.75rem / 3.5rem"],
            ["<code>--sz</code>", "kích thước tùy chỉnh"],
            ["<code>.avatar-group</code>", "xếp chồng một hàng"],
          ],
        ) +
        a11y(
          "Với avatar ảnh, đặt <code>alt</code> có nghĩa; với chữ viết tắt, thêm <code>aria-label</code> ghi tên đầy đủ.",
        ),
    },
  },
  {
    id: "kbd",
    cat: "Element",
    name: "Kbd",
    desc: {
      en: "Keyboard key hint. Inline, mono, inset — for shortcuts in prose.",
      vi: "Gợi ý phím. Inline, mono, chìm — cho phím tắt trong văn bản.",
    },
    body: {
      en: () =>
        stage(
          "KBD",
          `<span style="color:var(--text)">Open the palette with <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd></span>`,
        ) +
        cb(`Press <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd>`) +
        a11y("Use the semantic <code>&lt;kbd&gt;</code> element so assistive tech announces it as keyboard input."),
      vi: () =>
        stage(
          "KBD",
          `<span style="color:var(--text)">Mở bảng lệnh bằng <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd></span>`,
        ) +
        cb(`Nhấn <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd>`) +
        a11y("Dùng thẻ <code>&lt;kbd&gt;</code> ngữ nghĩa để công nghệ hỗ trợ đọc đúng là phím nhập."),
    },
  },
  {
    id: "separator",
    cat: "Element",
    name: "Separator",
    desc: {
      en: "Divider between content. Solid or dashed; horizontal or vertical.",
      vi: "Đường chia nội dung. Liền hoặc đứt; ngang hoặc dọc.",
    },
    body: {
      en: () =>
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
      vi: () =>
        stage(
          "SEPARATOR",
          `<div style="inline-size:100%">
            <p class="doc-p" style="margin:0">Model &amp; ngân sách</p>
            <hr class="separator">
            <p class="doc-p" style="margin:0">Tools &amp; MCP</p>
            <hr class="separator dashed">
            <p class="doc-p" style="margin:0">Hàng rào bảo vệ</p>
          </div>`,
          "col",
        ) +
        cb(`<hr class="separator">
<hr class="separator dashed">`) +
        a11y(
          "<code>&lt;hr&gt;</code> mang nghĩa ngắt mạch nội dung. Với đường chia thuần thị giác trong toolbar, thêm <code>role=\"separator\"</code> và <code>aria-orientation</code>.",
        ),
    },
  },

  /* -------------------------------------------------------- FORM */
  {
    id: "icon",
    cat: "Element",
    name: "Icon",
    desc: {
      en: "Pixel icon set on a 16×16 grid. currentColor + 1em, so icons inherit text color/accent and scale with font-size. Vector — razor-sharp at any DPR (low-res & retina). Tree-shakeable named exports.",
      vi: "Bộ icon pixel trên lưới 16×16. currentColor + 1em nên icon thừa hưởng màu chữ/accent và scale theo font-size. Vector — siêu nét ở mọi DPR (màn phân giải thấp & retina). Named export tree-shake được.",
    },
    body: {
      en: () =>
        stage(
          "ICON",
          `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:var(--sp-3);inline-size:100%">
            ${iconNames
              .map(
                (n) =>
                  `<span title="${n}" style="display:flex;flex-direction:column;align-items:center;gap:var(--sp-2);color:var(--muted)"><span style="font-size:24px;color:var(--ink)">${icon(n)}</span><code style="font-size:var(--fs-label)">${n}</code></span>`,
              )
              .join("")}
          </div>`,
        ) +
        p(`${iconNames.length} icons. Recolor with <code>data-accent</code> on any ancestor, or just set <code>color</code>.`) +
        h2("Variants") +
        stage(
          "VARIANTS",
          `<div style="display:flex;align-items:center;gap:var(--sp-4);flex-wrap:wrap">
            <nes-icon name="star" class="i-sm"></nes-icon>
            <nes-icon name="star" class="i-md"></nes-icon>
            <nes-icon name="star" class="i-lg"></nes-icon>
            <nes-icon name="star" class="i-xl"></nes-icon>
            <nes-icon name="loader" class="i-lg i-spin"></nes-icon>
            <nes-icon name="heart" class="i-lg" style="color:var(--crit)"></nes-icon>
            <span class="i-lg" data-accent="cyan" style="color:var(--accent)"><nes-icon name="bolt"></nes-icon></span>
            <span class="icon-box"><nes-icon name="rocket"></nes-icon></span>
            <span class="icon-box solid" data-accent="purple"><nes-icon name="sparkles"></nes-icon></span>
            <span class="icon-box lg" data-accent="cyan"><nes-icon name="bot"></nes-icon></span>
          </div>`,
        ) +
        api(
          ["Variant", "Effect"],
          [
            ["<code>.i-sm .i-md .i-lg .i-xl</code>", "preset sizes (icons are 1em → set the box)"],
            ["<code>size</code> attr / <code>font-size</code>", "any custom size"],
            ["<code>.i-spin</code>", "rotate — for loader / refresh (respects reduced-motion)"],
            ["<code>color</code> / <code>data-accent</code>", "recolor via currentColor"],
            ["<code>.icon-box</code> + <code>.solid</code> / <code>.lg</code>", "square icon tile (feature/nav)"],
          ],
        ) +
        h2("API") +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "icon to render — <strong>required</strong> (see the grid)"],
            ["<code>label</code>", "string", "—", "accessible name; without it the icon is <code>aria-hidden</code> (decorative)"],
            ["<code>size</code>", "string", "<code>1em</code>", "custom size (else it scales with <code>font-size</code>)"],
          ],
        }) +
        h2("Usage") +
        cb(
          `<!-- no build: the element (registered by "8bit-nes") -->
<nes-icon name="search"></nes-icon>
<button class="btn"><nes-icon name="download"></nes-icon> Save</button>

<!-- bundler: import only what you use → tree-shaken -->
import { search, download } from "8bit-nes/icons";
el.innerHTML = search;

<!-- dynamic by name -->
import { icon } from "8bit-nes/icons";
el.innerHTML = icon("search", { size: 20, label: "Search" });`,
        ) +
        h2("Extend") +
        p(`Add <code>export const foo = S('&lt;path d="…"/&gt;')</code> to <code>icons.js</code> and list it in <code>icons</code>. Draw on the 16×16 grid; it's instantly tree-shakeable and available to <code>&lt;nes-icon&gt;</code>.`) +
        a11y("Icons are decorative by default (<code>aria-hidden</code>). If an icon carries meaning on its own (e.g. an icon-only button), pass <code>label</code> / the <code>label</code> attribute so it becomes a labelled <code>role=\"img\"</code>."),
      vi: () =>
        stage(
          "ICON",
          `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:var(--sp-3);inline-size:100%">
            ${iconNames
              .map(
                (n) =>
                  `<span title="${n}" style="display:flex;flex-direction:column;align-items:center;gap:var(--sp-2);color:var(--muted)"><span style="font-size:24px;color:var(--ink)">${icon(n)}</span><code style="font-size:var(--fs-label)">${n}</code></span>`,
              )
              .join("")}
          </div>`,
        ) +
        p(`${iconNames.length} icon. Đổi màu bằng <code>data-accent</code> trên phần tử cha, hoặc chỉ cần set <code>color</code>.`) +
        h2("Biến thể") +
        stage(
          "VARIANTS",
          `<div style="display:flex;align-items:center;gap:var(--sp-4);flex-wrap:wrap">
            <nes-icon name="star" class="i-sm"></nes-icon>
            <nes-icon name="star" class="i-md"></nes-icon>
            <nes-icon name="star" class="i-lg"></nes-icon>
            <nes-icon name="star" class="i-xl"></nes-icon>
            <nes-icon name="loader" class="i-lg i-spin"></nes-icon>
            <nes-icon name="heart" class="i-lg" style="color:var(--crit)"></nes-icon>
            <span class="i-lg" data-accent="cyan" style="color:var(--accent)"><nes-icon name="bolt"></nes-icon></span>
            <span class="icon-box"><nes-icon name="rocket"></nes-icon></span>
            <span class="icon-box solid" data-accent="purple"><nes-icon name="sparkles"></nes-icon></span>
            <span class="icon-box lg" data-accent="cyan"><nes-icon name="bot"></nes-icon></span>
          </div>`,
        ) +
        api(
          ["Biến thể", "Tác dụng"],
          [
            ["<code>.i-sm .i-md .i-lg .i-xl</code>", "cỡ dựng sẵn (icon là 1em → chỉnh khung)"],
            ["<code>size</code> attr / <code>font-size</code>", "cỡ tùy ý"],
            ["<code>.i-spin</code>", "xoay — cho loader / refresh (tôn trọng reduced-motion)"],
            ["<code>color</code> / <code>data-accent</code>", "đổi màu qua currentColor"],
            ["<code>.icon-box</code> + <code>.solid</code> / <code>.lg</code>", "ô icon vuông (feature/nav)"],
          ],
        ) +
        h2("API") +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "icon để render — <strong>bắt buộc</strong> (xem lưới trên)"],
            ["<code>label</code>", "string", "—", "tên truy cập; không có thì icon là <code>aria-hidden</code> (trang trí)"],
            ["<code>size</code>", "string", "<code>1em</code>", "cỡ tùy ý (nếu không thì scale theo <code>font-size</code>)"],
          ],
        }) +
        h2("Dùng") +
        cb(
          `<!-- không build: dùng element (đã đăng ký bởi "8bit-nes") -->
<nes-icon name="search"></nes-icon>
<button class="btn"><nes-icon name="download"></nes-icon> Lưu</button>

<!-- bundler: chỉ import cái cần → tree-shake -->
import { search, download } from "8bit-nes/icons";
el.innerHTML = search;

<!-- động theo tên -->
import { icon } from "8bit-nes/icons";
el.innerHTML = icon("search", { size: 20, label: "Tìm" });`,
        ) +
        h2("Mở rộng") +
        p(`Thêm <code>export const foo = S('&lt;path d="…"/&gt;')</code> vào <code>icons.js</code> và liệt kê trong <code>icons</code>. Vẽ trên lưới 16×16; icon tự động tree-shake được và dùng ngay với <code>&lt;nes-icon&gt;</code>.`) +
        a11y("Icon mặc định chỉ trang trí (<code>aria-hidden</code>). Nếu icon tự mang nghĩa (vd nút chỉ có icon), truyền <code>label</code> / thuộc tính <code>label</code> để nó thành <code>role=\"img\"</code> có nhãn."),
    },
  },
  {
    id: "input",
    cat: "Form",
    name: "Input",
    desc: {
      en: "Single-line text field. Recessed on the screen surface; focus flips the border to gold.",
      vi: "Ô nhập một dòng. Chìm trên bề mặt màn hình; focus lật viền sang gold.",
    },
    body: {
      en: () =>
        stage(
          "INPUT",
          `<label class="field" style="inline-size:100%;max-inline-size:min(340px,100%)">
            <span class="label">Project name</span>
            <input class="input" placeholder="my-agent">
            <span class="hint">Lowercase, no spaces.</span>
          </label>
          <label class="field err" style="inline-size:100%;max-inline-size:min(340px,100%)">
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
            ["<code>data-size</code>", "<code>xs</code>…<code>xl</code> — shares the height rung with buttons/selects"],
            ["<code>[aria-invalid=true]</code>", "critical border"],
            ["<code>[disabled]</code>", "muted, not editable"],
            ["<code>.field</code> wrapper", "label + hint layout"],
          ],
        ) +
        a11y(
          "Always pair with a <code>&lt;label&gt;</code> (wrap it, or use <code>for</code>/<code>id</code>). On error, set <code>aria-invalid=\"true\"</code> and describe the fix in text.",
        ),
      vi: () =>
        stage(
          "INPUT",
          `<label class="field" style="inline-size:100%;max-inline-size:min(340px,100%)">
            <span class="label">Tên dự án</span>
            <input class="input" placeholder="my-agent">
            <span class="hint">Viết thường, không dấu cách.</span>
          </label>
          <label class="field err" style="inline-size:100%;max-inline-size:min(340px,100%)">
            <span class="label">API key <span class="req">*</span></span>
            <input class="input" value="nope" aria-invalid="true">
            <span class="hint">Cần có key.</span>
          </label>`,
          "col",
        ) +
        cb(
          `<label class="field">
  <span class="label">Tên dự án</span>
  <input class="input" placeholder="my-agent">
  <span class="hint">Viết thường, không dấu cách.</span>
</label>`,
        ) +
        h2("API") +
        api(
          ["Class / thuộc tính", "Tác dụng"],
          [
            ["<code>.input</code>", "ô nhập một dòng"],
            ["<code>data-size</code>", "<code>xs</code>…<code>xl</code> — chung rung chiều cao với button/select"],
            ["<code>[aria-invalid=true]</code>", "viền crit"],
            ["<code>[disabled]</code>", "mờ, không sửa được"],
            ["<code>.field</code> wrapper", "layout label + hint"],
          ],
        ) +
        a11y(
          "Luôn đi kèm <code>&lt;label&gt;</code> (bọc, hoặc dùng <code>for</code>/<code>id</code>). Khi lỗi, đặt <code>aria-invalid=\"true\"</code> và mô tả cách sửa bằng chữ.",
        ),
    },
  },
  {
    id: "textarea",
    cat: "Form",
    name: "Textarea",
    desc: {
      en: "Multi-line text. Vertically resizable, same recessed treatment as Input.",
      vi: "Nhập nhiều dòng. Kéo giãn theo chiều dọc, cùng kiểu chìm như Input.",
    },
    body: {
      en: () =>
        stage(
          "TEXTAREA",
          `<label class="field" style="inline-size:100%;max-inline-size:min(420px,100%)">
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
        a11y("Give it a real label. Avoid removing the resize handle unless the layout truly can't accommodate growth."),
      vi: () =>
        stage(
          "TEXTAREA",
          `<label class="field" style="inline-size:100%;max-inline-size:min(420px,100%)">
            <span class="label">System prompt</span>
            <textarea class="textarea" placeholder="Bạn là một coding agent xúc tích…"></textarea>
          </label>`,
          "col",
        ) +
        cb(
          `<label class="field">
  <span class="label">System prompt</span>
  <textarea class="textarea" placeholder="Bạn là…"></textarea>
</label>`,
        ) +
        a11y("Cho nó một label thật. Đừng bỏ tay kéo giãn trừ khi layout thực sự không cho phép giãn."),
    },
  },
  {
    id: "select",
    cat: "Form",
    name: "Select",
    desc: {
      en: "Native select, restyled. Keeps the OS keyboard and mobile picker behaviour; gold chevron.",
      vi: "Select gốc, style lại. Giữ nguyên bàn phím và bộ chọn của hệ điều hành; mũi tên màu gold.",
    },
    body: {
      en: () =>
        selectStage("Model") +
        cb(
          `<select class="select">
  <option>claude-haiku-4-5</option>
  <option>claude-sonnet-5</option>
</select>`,
        ) +
        a11y(
          "Built on the native <code>&lt;select&gt;</code>, so keyboard control and mobile pickers work as users expect. Keep a label.",
        ),
      vi: () =>
        selectStage("Model") +
        cb(
          `<select class="select">
  <option>claude-haiku-4-5</option>
  <option>claude-sonnet-5</option>
</select>`,
        ) +
        a11y(
          "Dựng trên <code>&lt;select&gt;</code> gốc, nên bàn phím và bộ chọn di động hoạt động như người dùng mong đợi. Giữ label.",
        ),
    },
  },
  {
    id: "checkbox",
    cat: "Form",
    name: "Checkbox",
    desc: {
      en: "Boolean toggle in a list. Square box with a pixel check when on.",
      vi: "Bật-tắt trong danh sách. Ô vuông với dấu tick pixel khi bật.",
    },
    body: {
      en: () =>
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
      vi: () =>
        stage(
          "CHECKBOX",
          `<label class="check"><input class="checkbox" type="checkbox" checked> Stream phản hồi</label>
           <label class="check"><input class="checkbox" type="checkbox"> Log chi tiết</label>
           <label class="check"><input class="checkbox" type="checkbox" data-accent="good" checked> Cache prompt</label>`,
          "col",
        ) +
        cb(
          `<label class="check">
  <input class="checkbox" type="checkbox" checked>
  Stream phản hồi
</label>`,
        ) +
        a11y(
          "<code>&lt;input type=\"checkbox\"&gt;</code> gốc; bọc phần chữ (qua <code>.check</code>) giúp cả hàng bấm được và được đọc.",
        ),
    },
  },
  {
    id: "radio",
    cat: "Form",
    name: "Radio",
    desc: {
      en: "One-of-many choice. Same square box, filled solid when selected.",
      vi: "Chọn một trong nhiều. Cùng ô vuông, tô đặc khi được chọn.",
    },
    body: {
      en: () =>
        radioStage() +
        cb(
          `<label class="check"><input class="radio" type="radio" name="m" checked> Haiku</label>
<label class="check"><input class="radio" type="radio" name="m"> Sonnet</label>`,
        ) +
        a11y(
          "Group radios with a shared <code>name</code> and wrap the set in a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> so the choice has a group label.",
        ),
      vi: () =>
        radioStage() +
        cb(
          `<label class="check"><input class="radio" type="radio" name="m" checked> Haiku</label>
<label class="check"><input class="radio" type="radio" name="m"> Sonnet</label>`,
        ) +
        a11y(
          "Nhóm radio bằng <code>name</code> chung và bọc cả bộ trong <code>&lt;fieldset&gt;</code> có <code>&lt;legend&gt;</code> để nhóm lựa chọn có nhãn.",
        ),
    },
  },
  {
    id: "switch",
    cat: "Form",
    name: "Switch",
    desc: {
      en: "On/off setting with immediate effect. Green (good) accent by default.",
      vi: "Công tắc bật/tắt có hiệu lực ngay. Mặc định màu good (xanh).",
    },
    body: {
      en: () =>
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
      vi: () =>
        stage(
          "SWITCH",
          `<label class="check"><input class="switch" type="checkbox" checked> Free play</label>
           <label class="check"><input class="switch" type="checkbox"> Chế độ khó</label>
           <label class="check"><input class="switch" type="checkbox" data-accent="gold" checked> Âm thanh</label>`,
          "col",
        ) +
        cb(
          `<label class="check">
  <input class="switch" type="checkbox" checked>
  Free play
</label>`,
        ) +
        a11y(
          "Bên dưới vẫn là checkbox. Thêm <code>role=\"switch\"</code> nếu muốn AT đọc \"bật/tắt\" thay vì \"đã chọn\", và áp dụng thay đổi ngay.",
        ),
    },
  },
  {
    id: "field",
    cat: "Form",
    name: "Field",
    desc: {
      en: "Label + control + hint/error wrapper. The .err modifier turns the whole field critical.",
      vi: "Bọc label + control + hint/lỗi. Modifier .err chuyển cả field sang trạng thái crit.",
    },
    body: {
      en: () =>
        stage(
          "FIELD",
          `<div class="field" style="inline-size:100%;max-inline-size:min(360px,100%)">
            <span class="label">Temperature</span>
            <input class="input" value="0">
            <span class="hint">0 is deterministic; 1 is creative.</span>
          </div>
          <div class="field err" style="inline-size:100%;max-inline-size:min(360px,100%)">
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
      vi: () =>
        stage(
          "FIELD",
          `<div class="field" style="inline-size:100%;max-inline-size:min(360px,100%)">
            <span class="label">Temperature</span>
            <input class="input" value="0">
            <span class="hint">0 là tất định; 1 là sáng tạo.</span>
          </div>
          <div class="field err" style="inline-size:100%;max-inline-size:min(360px,100%)">
            <span class="label">Max tokens <span class="req">*</span></span>
            <input class="input" value="" aria-invalid="true">
            <span class="hint">Đặt trần để chặn chi phí.</span>
          </div>`,
          "col",
        ) +
        cb(
          `<label class="field err">
  <span class="label">Max tokens <span class="req">*</span></span>
  <input class="input" aria-invalid="true">
  <span class="hint">Đặt trần để chặn chi phí.</span>
</label>`,
        ) +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.field</code>", "xếp dọc label/control/hint"],
            ["<code>.label</code>", "nhãn mono in hoa"],
            ["<code>.hint</code>", "chữ trợ giúp / lỗi"],
            ["<code>.req</code>", "dấu sao bắt buộc"],
            ["<code>.field.err</code>", "chuyển label + hint sang crit"],
          ],
        ),
    },
  },
  {
    id: "colorpicker",
    cat: "Form",
    name: "ColorPicker",
    desc: {
      en: "Native color input, restyled as a square chip. The OS picker stays; only the swatch is themed.",
      vi: "Input màu gốc, style lại thành ô vuông. Bộ chọn của hệ điều hành giữ nguyên; chỉ ô màu được theme.",
    },
    body: {
      en: () =>
        stage("COLORPICKER", `<input type="color" class="swatch" value="#56d364" aria-label="Accent colour">`) +
        cb(`<input type="color" class="swatch" value="#56d364" aria-label="Accent colour">`) +
        api(
          ["Class / attr", "Effect"],
          [
            ["<code>.swatch</code>", "square color chip (native picker)"],
            ["<code>[value]</code>", "initial hex"],
            ["<code>[disabled]</code>", "dimmed, not editable"],
          ],
        ) +
        a11y("Give it an <code>aria-label</code> — the swatch shows the colour but not its name."),
      vi: () =>
        stage("COLORPICKER", `<input type="color" class="swatch" value="#56d364" aria-label="Màu nhấn">`) +
        cb(`<input type="color" class="swatch" value="#56d364" aria-label="Màu nhấn">`) +
        api(
          ["Class / thuộc tính", "Tác dụng"],
          [
            ["<code>.swatch</code>", "ô màu vuông (picker gốc)"],
            ["<code>[value]</code>", "màu hex ban đầu"],
            ["<code>[disabled]</code>", "mờ, không sửa"],
          ],
        ) +
        a11y("Cho nó một <code>aria-label</code> — ô màu hiện màu nhưng không hiện tên."),
    },
  },
  {
    id: "inputdate",
    cat: "Form",
    name: "InputDate",
    desc: {
      en: "Native date input in the 8-bit shell. Keeps the OS calendar; the picker glyph is tinted to the primary.",
      vi: "Input ngày gốc trong vỏ 8-bit. Giữ lịch của hệ điều hành; icon picker được nhuộm màu primary.",
    },
    body: {
      en: () =>
        stage(
          "INPUTDATE",
          `<input type="date" class="input" value="2026-07-23" style="max-inline-size:min(200px,100%)" aria-label="Release date">`,
        ) +
        cb(`<input type="date" class="input" value="2026-07-23" aria-label="Release date">`) +
        api(
          ["Attr", "Effect"],
          [
            ["<code>type=\"date\"</code>","themed calendar field"],
            ["<code>[min]</code> / <code>[max]</code>", "clamp the range"],
            ["<code>[required]</code>", "validated by &lt;nes-form&gt;"],
          ],
        ) +
        a11y("Native = free keyboard entry, locale formatting, and mobile date wheels. Also works for <code>datetime-local</code>, <code>month</code>, <code>week</code>."),
      vi: () =>
        stage(
          "INPUTDATE",
          `<input type="date" class="input" value="2026-07-23" style="max-inline-size:min(200px,100%)" aria-label="Ngày phát hành">`,
        ) +
        cb(`<input type="date" class="input" value="2026-07-23" aria-label="Ngày phát hành">`) +
        api(
          ["Thuộc tính", "Tác dụng"],
          [
            ["<code>type=\"date\"</code>","ô lịch đã theme"],
            ["<code>[min]</code> / <code>[max]</code>", "giới hạn khoảng"],
            ["<code>[required]</code>", "được &lt;nes-form&gt; kiểm tra"],
          ],
        ) +
        a11y("Gốc = gõ phím tự do, format theo locale, và bánh xe ngày trên mobile. Cũng dùng cho <code>datetime-local</code>, <code>month</code>, <code>week</code>."),
    },
  },
  {
    id: "inputtime",
    cat: "Form",
    name: "InputTime",
    desc: {
      en: "Native time input, same shell as InputDate. OS clock picker, tinted glyph.",
      vi: "Input giờ gốc, cùng vỏ với InputDate. Bộ chọn giờ của hệ điều hành, icon nhuộm màu.",
    },
    body: {
      en: () =>
        stage("INPUTTIME", `<input type="time" class="input" value="13:37" style="max-inline-size:min(160px,100%)" aria-label="Start time">`) +
        cb(`<input type="time" class="input" value="13:37" aria-label="Start time">`) +
        api(
          ["Attr", "Effect"],
          [
            ["<code>type=\"time\"</code>","themed time field"],
            ["<code>[step]</code>", "seconds granularity (e.g. 1)"],
          ],
        ) +
        a11y("Pair with a label; the field announces hours/minutes as separate spin segments."),
      vi: () =>
        stage("INPUTTIME", `<input type="time" class="input" value="13:37" style="max-inline-size:min(160px,100%)" aria-label="Giờ bắt đầu">`) +
        cb(`<input type="time" class="input" value="13:37" aria-label="Giờ bắt đầu">`) +
        api(
          ["Thuộc tính", "Tác dụng"],
          [
            ["<code>type=\"time\"</code>","ô giờ đã theme"],
            ["<code>[step]</code>", "bước theo giây (vd 1)"],
          ],
        ) +
        a11y("Đi kèm label; ô đọc giờ/phút thành các đoạn spin riêng."),
    },
  },
  {
    id: "checkboxgroup",
    cat: "Form",
    name: "CheckboxGroup",
    desc: {
      en: "A <fieldset> that groups related checkboxes under one legend. Add .row to lay them out horizontally.",
      vi: "Một <fieldset> gom các checkbox liên quan dưới một legend. Thêm .row để xếp ngang.",
    },
    body: {
      en: () =>
        stage(
          "CHECKBOXGROUP",
          `<fieldset class="control-group" style="max-inline-size:min(320px,100%)">
            <legend>Frameworks</legend>
            <label class="check"><input type="checkbox" class="checkbox" checked> Vue</label>
            <label class="check"><input type="checkbox" class="checkbox"> React</label>
            <label class="check"><input type="checkbox" class="checkbox"> Svelte</label>
          </fieldset>`,
          "col",
        ) +
        cb(
          `<fieldset class="control-group">
  <legend>Frameworks</legend>
  <label class="check"><input type="checkbox" class="checkbox" checked> Vue</label>
  <label class="check"><input type="checkbox" class="checkbox"> React</label>
</fieldset>`,
        ) +
        api(
          ["Class", "Role"],
          [
            ["<code>.control-group</code>", "&lt;fieldset&gt; stack + legend"],
            ["<code>.control-group.row</code>", "lay options horizontally"],
            ["<code>.check</code>", "label ↔ control pairing"],
          ],
        ) +
        a11y("<code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code> is the semantic group — screen readers announce the legend for every option."),
      vi: () =>
        stage(
          "CHECKBOXGROUP",
          `<fieldset class="control-group" style="max-inline-size:min(320px,100%)">
            <legend>Framework</legend>
            <label class="check"><input type="checkbox" class="checkbox" checked> Vue</label>
            <label class="check"><input type="checkbox" class="checkbox"> React</label>
            <label class="check"><input type="checkbox" class="checkbox"> Svelte</label>
          </fieldset>`,
          "col",
        ) +
        cb(
          `<fieldset class="control-group">
  <legend>Framework</legend>
  <label class="check"><input type="checkbox" class="checkbox" checked> Vue</label>
  <label class="check"><input type="checkbox" class="checkbox"> React</label>
</fieldset>`,
        ) +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.control-group</code>", "xếp &lt;fieldset&gt; + legend"],
            ["<code>.control-group.row</code>", "xếp ngang các lựa chọn"],
            ["<code>.check</code>", "ghép label ↔ control"],
          ],
        ) +
        a11y("<code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code> là nhóm ngữ nghĩa — screen reader đọc legend cho mọi lựa chọn."),
    },
  },
  {
    id: "radiogroup",
    cat: "Form",
    name: "RadioGroup",
    desc: {
      en: "Same .control-group fieldset, holding radios that share a name (single choice).",
      vi: "Cùng fieldset .control-group, chứa radio dùng chung name (chọn một).",
    },
    body: {
      en: () =>
        stage(
          "RADIOGROUP",
          `<fieldset class="control-group row" style="max-inline-size:min(340px,100%)">
            <legend>Size</legend>
            <label class="check"><input type="radio" name="sz" class="radio" checked> Small</label>
            <label class="check"><input type="radio" name="sz" class="radio"> Medium</label>
            <label class="check"><input type="radio" name="sz" class="radio"> Large</label>
          </fieldset>`,
          "col",
        ) +
        cb(
          `<fieldset class="control-group row">
  <legend>Size</legend>
  <label class="check"><input type="radio" name="sz" class="radio" checked> Small</label>
  <label class="check"><input type="radio" name="sz" class="radio"> Medium</label>
</fieldset>`,
        ) +
        api(
          ["Attr", "Role"],
          [
            ["<code>name</code> (shared)", "makes the radios mutually exclusive"],
            ["<code>.control-group.row</code>", "horizontal layout"],
            ["<code>[checked]</code>", "the default choice"],
          ],
        ) +
        a11y("Give one radio a sensible default. Arrow keys move within a same-name group for free."),
      vi: () =>
        stage(
          "RADIOGROUP",
          `<fieldset class="control-group row" style="max-inline-size:min(340px,100%)">
            <legend>Cỡ</legend>
            <label class="check"><input type="radio" name="sz" class="radio" checked> Nhỏ</label>
            <label class="check"><input type="radio" name="sz" class="radio"> Vừa</label>
            <label class="check"><input type="radio" name="sz" class="radio"> Lớn</label>
          </fieldset>`,
          "col",
        ) +
        cb(
          `<fieldset class="control-group row">
  <legend>Cỡ</legend>
  <label class="check"><input type="radio" name="sz" class="radio" checked> Nhỏ</label>
  <label class="check"><input type="radio" name="sz" class="radio"> Vừa</label>
</fieldset>`,
        ) +
        api(
          ["Thuộc tính", "Vai trò"],
          [
            ["<code>name</code> (chung)", "khiến radio loại trừ lẫn nhau"],
            ["<code>.control-group.row</code>", "xếp ngang"],
            ["<code>[checked]</code>", "lựa chọn mặc định"],
          ],
        ) +
        a11y("Chọn sẵn một radio hợp lý. Phím mũi tên di chuyển trong nhóm cùng name miễn phí."),
    },
  },
  {
    id: "inputnumber",
    cat: "Form",
    name: "InputNumber",
    desc: {
      en: "A − [n] + stepper over a native number input. <nes-number> wires the buttons; value clamps to min/max/step.",
      vi: "Stepper − [n] + trên input number gốc. <nes-number> tự nối nút; value kẹp theo min/max/step.",
    },
    body: {
      en: () =>
        stage("INPUTNUMBER", `<nes-number name="qty" min="1" max="8" value="2" aria-label="Players"></nes-number>`) +
        cb(`<nes-number name="qty" min="1" max="8" value="2" aria-label="Players"></nes-number>`) +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "form key on submit"],
            ["<code>min</code> / <code>max</code> / <code>step</code>", "number", "<code>step=1</code>", "clamp bounds + increment"],
            ["<code>value</code>", "number", "—", "initial number"],
          ],
          prop: [["<code>.value</code>", "string", "—", "current value (native input string)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "the value changed"]],
        }) +
        a11y("Buttons are real <code>&lt;button&gt;</code>s; the field is a real number input, so keyboard ↑/↓ and typing both work."),
      vi: () =>
        stage("INPUTNUMBER", `<nes-number name="qty" min="1" max="8" value="2" aria-label="Người chơi"></nes-number>`) +
        cb(`<nes-number name="qty" min="1" max="8" value="2" aria-label="Người chơi"></nes-number>`) +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "khóa form khi submit"],
            ["<code>min</code> / <code>max</code> / <code>step</code>", "number", "<code>step=1</code>", "cận kẹp + bước tăng"],
            ["<code>value</code>", "number", "—", "số ban đầu"],
          ],
          prop: [["<code>.value</code>", "string", "—", "giá trị hiện tại (chuỗi input gốc)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "giá trị thay đổi"]],
        }) +
        a11y("Nút là <code>&lt;button&gt;</code> thật; ô là number input thật, nên ↑/↓ bàn phím và gõ tay đều chạy."),
    },
  },
  {
    id: "switcher",
    cat: "Form",
    name: "Switcher",
    desc: {
      en: "Cycle a small option set with ◀ / ▶ — the arcade settings row. Perfect for a domain setting with a few mutually-exclusive choices (display mode, difficulty, theme).",
      vi: "Cuộn qua một tập lựa chọn nhỏ bằng ◀ / ▶ — hàng cài đặt kiểu arcade. Hợp cho setting domain với vài lựa chọn loại trừ nhau (chế độ hiển thị, độ khó, theme).",
    },
    body: {
      en: () =>
        stage(
          "SWITCHER",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);align-items:flex-start">
             <nes-switcher name="display" value="Fullscreen" aria-label="Display mode"><script type="application/json">["Windowed","Borderless","Fullscreen"]</script></nes-switcher>
             <nes-switcher name="difficulty" value="Normal" data-accent="cyan" aria-label="Difficulty"><script type="application/json">["Easy","Normal","Hard","Nightmare"]</script></nes-switcher>
             <nes-switcher name="fps" value="60" data-size="lg" aria-label="FPS cap"><script type="application/json">["30","60","120","Unlimited"]</script></nes-switcher>
           </div>`,
          "col",
        ) +
        cb(
          `<nes-switcher name="display" value="Fullscreen" aria-label="Display mode">
  <script type="application/json">["Windowed", "Borderless", "Fullscreen"]<\/script>
</nes-switcher>

<!-- options can be {value,label}; no-wrap stops at the ends; data-size scales -->
<nes-switcher name="fps" value="60" data-size="lg" no-wrap aria-label="FPS cap">
  <script type="application/json">["30", "60", "120", "Unlimited"]<\/script>
</nes-switcher>`,
        ) +
        apiGroups({
          attr: [
            ["<code>value</code>", "string", "first option", "the selected option value"],
            ["<code>name</code>", "string", "—", "form key (hidden input submits the value)"],
            ["<code>no-wrap</code>", "boolean", "off", "stop at the ends (arrows disable) instead of cycling"],
            ["<code>disabled</code>", "boolean", "off", "freeze both arrows"],
            ["<code>data-size</code>", "xs…xl", "md", "shared height rung (lines up with buttons/inputs)"],
            ["<code>data-accent</code>", "accent", "gold", "arrow colour"],
          ],
          prop: [["<code>.value</code>", "string", "—", "get / set the current option"]],
          event: [["<code>nes:change</code>", "<code>{ value, index }</code>", "—", "the option changed"]],
          slot: [["<code>script[type=application/json]</code>", "the options — an array of strings or <code>{value,label}</code>"]],
        }) +
        note(
          `Different from <a href="#/inputnumber">InputNumber</a> (a numeric − [n] + stepper) and <a href="#/segment">Segmented control</a> (all options visible at once). Use Switcher when options are few, named, and space is tight.`,
        ) +
        a11y(
          `A <code>role="group"</code> with two real <code>&lt;button&gt;</code>s (Previous / Next) and an <code>aria-live="polite"</code> label; ← / → cycle from the keyboard. The value rides a hidden <code>&lt;input name&gt;</code> so it submits in any form.`,
        ),
      vi: () =>
        stage(
          "SWITCHER",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);align-items:flex-start">
             <nes-switcher name="display" value="Fullscreen" aria-label="Chế độ hiển thị"><script type="application/json">["Windowed","Borderless","Fullscreen"]</script></nes-switcher>
             <nes-switcher name="difficulty" value="Normal" data-accent="cyan" aria-label="Độ khó"><script type="application/json">["Easy","Normal","Hard","Nightmare"]</script></nes-switcher>
             <nes-switcher name="fps" value="60" data-size="lg" aria-label="Giới hạn FPS"><script type="application/json">["30","60","120","Unlimited"]</script></nes-switcher>
           </div>`,
          "col",
        ) +
        cb(
          `<nes-switcher name="display" value="Fullscreen" aria-label="Chế độ hiển thị">
  <script type="application/json">["Windowed", "Borderless", "Fullscreen"]<\/script>
</nes-switcher>

<!-- option có thể là {value,label}; no-wrap dừng ở hai đầu; data-size scale -->
<nes-switcher name="fps" value="60" data-size="lg" no-wrap aria-label="Giới hạn FPS">
  <script type="application/json">["30", "60", "120", "Unlimited"]<\/script>
</nes-switcher>`,
        ) +
        apiGroups({
          attr: [
            ["<code>value</code>", "string", "option đầu", "giá trị lựa chọn đang chọn"],
            ["<code>name</code>", "string", "—", "khóa form (hidden input submit giá trị)"],
            ["<code>no-wrap</code>", "boolean", "tắt", "dừng ở hai đầu (mũi tên mờ) thay vì cuộn vòng"],
            ["<code>disabled</code>", "boolean", "tắt", "khóa cả hai mũi tên"],
            ["<code>data-size</code>", "xs…xl", "md", "rung chiều cao dùng chung (khớp button/input)"],
            ["<code>data-accent</code>", "accent", "gold", "màu mũi tên"],
          ],
          prop: [["<code>.value</code>", "string", "—", "lấy / gán lựa chọn hiện tại"]],
          event: [["<code>nes:change</code>", "<code>{ value, index }</code>", "—", "lựa chọn thay đổi"]],
          slot: [["<code>script[type=application/json]</code>", "danh sách lựa chọn — mảng string hoặc <code>{value,label}</code>"]],
        }) +
        note(
          `Khác <a href="#/inputnumber">InputNumber</a> (stepper số − [n] +) và <a href="#/segment">Segmented control</a> (hiện hết lựa chọn cùng lúc). Dùng Switcher khi lựa chọn ít, có tên, và chỗ hẹp.`,
        ) +
        a11y(
          `Một <code>role="group"</code> với hai <code>&lt;button&gt;</code> thật (Previous / Next) và nhãn <code>aria-live="polite"</code>; ← / → cuộn bằng bàn phím. Giá trị nằm trong hidden <code>&lt;input name&gt;</code> nên submit trong mọi form.`,
        ),
    },
  },
  {
    id: "inputrating",
    cat: "Form",
    name: "InputRating",
    desc: {
      en: "Star picker. Click or arrow-key to set; add readonly for a display-only score. size=lg enlarges it.",
      vi: "Chọn sao. Click hoặc phím mũi tên để đặt; thêm readonly để chỉ hiển thị. size=lg để to hơn.",
    },
    body: {
      en: () =>
        stage(
          "INPUTRATING",
          `<nes-rating name="score" max="5" value="3" size="lg" aria-label="Rating"></nes-rating>
           <nes-rating max="5" value="4" readonly aria-label="4 of 5"></nes-rating>`,
          "col",
        ) +
        cb(`<nes-rating name="score" max="5" value="3"></nes-rating>
<nes-rating max="5" value="4" readonly></nes-rating>`) +
        apiGroups({
          attr: [
            ["<code>max</code>", "number", "<code>5</code>", "number of stars"],
            ["<code>value</code>", "number", "<code>0</code>", "initial score"],
            ["<code>readonly</code>", "boolean", "<code>false</code>", "display only (<code>role=img</code>)"],
            ["<code>size</code>", '<code>"lg"</code>', "—", "larger stars"],
          ],
          prop: [["<code>.value</code>", "number", "<code>0</code>", "current score"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "the score changed"]],
        }) +
        a11y("Interactive mode is a <code>radiogroup</code> with roving focus and ←/→ keys; read-only mode is an <code>img</code> with an <code>aria-label</code> like “4 of 5”."),
      vi: () =>
        stage(
          "INPUTRATING",
          `<nes-rating name="score" max="5" value="3" size="lg" aria-label="Đánh giá"></nes-rating>
           <nes-rating max="5" value="4" readonly aria-label="4 trên 5"></nes-rating>`,
          "col",
        ) +
        cb(`<nes-rating name="score" max="5" value="3"></nes-rating>
<nes-rating max="5" value="4" readonly></nes-rating>`) +
        apiGroups({
          attr: [
            ["<code>max</code>", "number", "<code>5</code>", "số sao"],
            ["<code>value</code>", "number", "<code>0</code>", "điểm ban đầu"],
            ["<code>readonly</code>", "boolean", "<code>false</code>", "chỉ hiển thị (<code>role=img</code>)"],
            ["<code>size</code>", '<code>"lg"</code>', "—", "sao to hơn"],
          ],
          prop: [["<code>.value</code>", "number", "<code>0</code>", "điểm hiện tại"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "điểm thay đổi"]],
        }) +
        a11y("Chế độ tương tác là <code>radiogroup</code> với roving focus và phím ←/→; chế độ readonly là <code>img</code> với <code>aria-label</code> như “4 trên 5”."),
    },
  },
  {
    id: "pininput",
    cat: "Form",
    name: "PinInput",
    desc: {
      en: "One-time-code / PIN entry: N single-char cells that auto-advance, accept a full paste, and fire nes:complete.",
      vi: "Nhập mã OTP / PIN: N ô một ký tự tự nhảy, nhận dán nguyên chuỗi, và bắn nes:complete.",
    },
    body: {
      en: () =>
        stage("PININPUT", `<nes-pin length="4" name="otp" numeric aria-label="One-time code"></nes-pin>`) +
        cb(`<nes-pin length="6" name="otp" numeric></nes-pin>`) +
        apiGroups({
          attr: [
            ["<code>length</code>", "number", "<code>4</code>", "number of cells"],
            ["<code>numeric</code>", "boolean", "<code>false</code>", "digits only + numeric keypad"],
            ["<code>mask</code>", "boolean", "<code>false</code>", "obscure entry like a password"],
            ["<code>name</code>", "string", "—", "form key for the joined value"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "current code (read-only)"]],
          event: [
            ["<code>nes:change</code>", "<code>{ value }</code>", "—", "fires on each edit"],
            ["<code>nes:complete</code>", "<code>{ value }</code>", "—", "all cells filled"],
          ],
        }) +
        a11y("Each cell is a labelled input; Backspace steps back, ←/→ move, and a paste fills across the cells."),
      vi: () =>
        stage("PININPUT", `<nes-pin length="4" name="otp" numeric aria-label="Mã OTP"></nes-pin>`) +
        cb(`<nes-pin length="6" name="otp" numeric></nes-pin>`) +
        apiGroups({
          attr: [
            ["<code>length</code>", "number", "<code>4</code>", "số ô"],
            ["<code>numeric</code>", "boolean", "<code>false</code>", "chỉ số + bàn phím số"],
            ["<code>mask</code>", "boolean", "<code>false</code>", "che như mật khẩu"],
            ["<code>name</code>", "string", "—", "khóa form cho value đã nối"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "mã hiện tại (chỉ đọc)"]],
          event: [
            ["<code>nes:change</code>", "<code>{ value }</code>", "—", "bắn mỗi lần sửa"],
            ["<code>nes:complete</code>", "<code>{ value }</code>", "—", "khi đầy tất cả ô"],
          ],
        }) +
        a11y("Mỗi ô là input có nhãn; Backspace lùi, ←/→ di chuyển, và dán sẽ điền tràn qua các ô."),
    },
  },
  {
    id: "inputtags",
    cat: "Form",
    name: "InputTags",
    desc: {
      en: "Type + Enter (or comma) to add a chip; × or Backspace removes. Value is the ordered tag list.",
      vi: "Gõ + Enter (hoặc dấu phẩy) để thêm chip; × hoặc Backspace để xóa. Value là danh sách tag theo thứ tự.",
    },
    body: {
      en: () =>
        stage("INPUTTAGS", `<nes-tags name="labels" value="agent,retro" placeholder="add tag…" aria-label="Labels"></nes-tags>`, "col") +
        cb(`<nes-tags name="labels" value="agent,retro" placeholder="add tag…"></nes-tags>`) +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "form key (hidden input, comma-joined)"],
            ["<code>value</code>", "string", "—", "comma-separated initial tags"],
            ["<code>max</code>", "number", "—", "cap the number of tags"],
          ],
          prop: [["<code>.value</code>", "string[]", "<code>[]</code>", "current tags (read-only)"]],
          event: [["<code>nes:change</code>", "<code>{ value: string[] }</code>", "—", "the tag list changed"]],
        }) +
        a11y("A hidden <code>&lt;input name&gt;</code> carries the comma-joined value, so it submits inside any form with zero wiring."),
      vi: () =>
        stage("INPUTTAGS", `<nes-tags name="labels" value="agent,retro" placeholder="thêm tag…" aria-label="Nhãn"></nes-tags>`, "col") +
        cb(`<nes-tags name="labels" value="agent,retro" placeholder="thêm tag…"></nes-tags>`) +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "khóa form (input ẩn, nối dấu phẩy)"],
            ["<code>value</code>", "string", "—", "tag ban đầu, ngăn bởi dấu phẩy"],
            ["<code>max</code>", "number", "—", "giới hạn số tag"],
          ],
          prop: [["<code>.value</code>", "string[]", "<code>[]</code>", "tag hiện tại (chỉ đọc)"]],
          event: [["<code>nes:change</code>", "<code>{ value: string[] }</code>", "—", "danh sách tag thay đổi"]],
        }) +
        a11y("Một <code>&lt;input name&gt;</code> ẩn giữ value nối bằng dấu phẩy, nên nó submit trong mọi form mà không cần nối tay."),
    },
  },
  {
    id: "fileupload",
    cat: "Form",
    name: "FileUpload",
    desc: {
      en: "Click-or-drop zone over a native file input. Lists chosen files with a remove button; supports multiple + accept.",
      vi: "Vùng click-hoặc-thả trên file input gốc. Liệt kê file đã chọn kèm nút xóa; hỗ trợ multiple + accept.",
    },
    body: {
      en: () =>
        stage("FILEUPLOAD", `<nes-file name="asset" accept="image/*" multiple label="Drop art or click"></nes-file>`, "col") +
        cb(`<nes-file name="asset" accept="image/*" multiple label="Drop art or click"></nes-file>`) +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "form field name"],
            ["<code>accept</code>", "string", "—", "MIME / extension filter"],
            ["<code>multiple</code>", "boolean", "<code>false</code>", "allow more than one file"],
            ["<code>label</code>", "string", "—", "prompt text inside the drop zone"],
          ],
          prop: [["<code>.files</code>", "File[]", "<code>[]</code>", "chosen files (read-only)"]],
          event: [["<code>nes:change</code>", "<code>{ files }</code>", "—", "the file selection changed"]],
        }) +
        a11y("The drop target is a real <code>&lt;button&gt;</code> that opens the native picker — fully keyboard-operable, drag is an enhancement."),
      vi: () =>
        stage("FILEUPLOAD", `<nes-file name="asset" accept="image/*" multiple label="Thả ảnh hoặc click"></nes-file>`, "col") +
        cb(`<nes-file name="asset" accept="image/*" multiple label="Thả ảnh hoặc click"></nes-file>`) +
        apiGroups({
          attr: [
            ["<code>name</code>", "string", "—", "tên field trong form"],
            ["<code>accept</code>", "string", "—", "lọc MIME / đuôi file"],
            ["<code>multiple</code>", "boolean", "<code>false</code>", "cho phép nhiều file"],
            ["<code>label</code>", "string", "—", "chữ nhắc trong vùng thả"],
          ],
          prop: [["<code>.files</code>", "File[]", "<code>[]</code>", "file đã chọn (chỉ đọc)"]],
          event: [["<code>nes:change</code>", "<code>{ files }</code>", "—", "lựa chọn file thay đổi"]],
        }) +
        a11y("Vùng thả là <code>&lt;button&gt;</code> thật mở picker gốc — thao tác bàn phím đầy đủ, kéo-thả chỉ là bổ sung."),
    },
  },
  {
    id: "listbox",
    cat: "Form",
    name: "Listbox",
    desc: {
      en: "An always-open selectable list with roving focus. Single by default; add multiple for many. Options via child JSON.",
      vi: "Danh sách chọn luôn mở với roving focus. Mặc định chọn một; thêm multiple để chọn nhiều. Options qua JSON con.",
    },
    body: {
      en: () =>
        stage(
          "LISTBOX",
          `<nes-listbox name="stack" multiple value="vue" aria-label="Stack" style="max-inline-size:min(300px,100%)">
            <script type="application/json">[{"value":"vue","label":"Vue"},{"value":"react","label":"React"},{"value":"svelte","label":"Svelte"}]</script>
          </nes-listbox>`,
          "col",
        ) +
        cb(`<nes-listbox name="stack" multiple value="vue">
  <script type="application/json">
    [{ "value": "vue", "label": "Vue" }, { "value": "react", "label": "React" }]
  </script>
</nes-listbox>`) +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "options: strings or <code>{ value, label, disabled }[]</code>"]],
          attr: [
            ["<code>multiple</code>", "boolean", "<code>false</code>", "select many (Space toggles)"],
            ["<code>name</code>", "string", "—", "form key (hidden input)"],
            ["<code>value</code>", "string", "—", "initial selection(s), comma-separated"],
          ],
          prop: [["<code>.value</code>", "<code>string | string[] | null</code>", "<code>null</code>", "current selection(s) (read-only)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "the selection changed"]],
        }) +
        a11y("Implements the ARIA <code>listbox</code> pattern: roving <code>aria-activedescendant</code>, ↑/↓/Home/End, Space/Enter to select."),
      vi: () =>
        stage(
          "LISTBOX",
          `<nes-listbox name="stack" multiple value="vue" aria-label="Stack" style="max-inline-size:min(300px,100%)">
            <script type="application/json">[{"value":"vue","label":"Vue"},{"value":"react","label":"React"},{"value":"svelte","label":"Svelte"}]</script>
          </nes-listbox>`,
          "col",
        ) +
        cb(`<nes-listbox name="stack" multiple value="vue">
  <script type="application/json">
    [{ "value": "vue", "label": "Vue" }, { "value": "react", "label": "React" }]
  </script>
</nes-listbox>`) +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "options: chuỗi hoặc <code>{ value, label, disabled }[]</code>"]],
          attr: [
            ["<code>multiple</code>", "boolean", "<code>false</code>", "chọn nhiều (Space bật/tắt)"],
            ["<code>name</code>", "string", "—", "khóa form (input ẩn)"],
            ["<code>value</code>", "string", "—", "lựa chọn ban đầu, ngăn dấu phẩy"],
          ],
          prop: [["<code>.value</code>", "<code>string | string[] | null</code>", "<code>null</code>", "lựa chọn hiện tại (chỉ đọc)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "lựa chọn thay đổi"]],
        }) +
        a11y("Theo pattern ARIA <code>listbox</code>: roving <code>aria-activedescendant</code>, ↑/↓/Home/End, Space/Enter để chọn."),
    },
  },
  {
    id: "inputmenu",
    cat: "Form",
    name: "InputMenu",
    desc: {
      en: "Free-text combobox: type to filter suggestions, or keep any typed value. Autocomplete without locking the input.",
      vi: "Combobox tự do: gõ để lọc gợi ý, hoặc giữ nguyên chữ đã gõ. Gợi ý mà không khóa ô nhập.",
    },
    body: {
      en: () =>
        stage(
          "INPUTMENU",
          `<nes-input-menu name="lang" placeholder="Type or pick…" value="Vue" aria-label="Language" style="max-inline-size:min(320px,100%)">
            <script type="application/json">["Vue","React","Svelte","Solid","Angular","Qwik"]</script>
          </nes-input-menu>`,
          "col",
        ) +
        cb(`<nes-input-menu name="lang" placeholder="Type or pick…">
  <script type="application/json">["Vue", "React", "Svelte", "Solid"]</script>
</nes-input-menu>`) +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "suggestion options: strings or <code>{ value, label }[]</code>"]],
          attr: [
            ["<code>name</code>", "string", "—", "form key"],
            ["<code>value</code>", "string", "—", "initial text"],
            ["<code>placeholder</code>", "string", "—", "empty-field hint"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "current text (free-form — any typed value is kept)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "the text changed"]],
        }) +
        a11y("An ARIA <code>combobox</code>: <code>aria-expanded</code>, <code>aria-activedescendant</code>, ↑/↓ to move, Enter to pick, Esc to close."),
      vi: () =>
        stage(
          "INPUTMENU",
          `<nes-input-menu name="lang" placeholder="Gõ hoặc chọn…" value="Vue" aria-label="Ngôn ngữ" style="max-inline-size:min(320px,100%)">
            <script type="application/json">["Vue","React","Svelte","Solid","Angular","Qwik"]</script>
          </nes-input-menu>`,
          "col",
        ) +
        cb(`<nes-input-menu name="lang" placeholder="Gõ hoặc chọn…">
  <script type="application/json">["Vue", "React", "Svelte", "Solid"]</script>
</nes-input-menu>`) +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "gợi ý: chuỗi hoặc <code>{ value, label }[]</code>"]],
          attr: [
            ["<code>name</code>", "string", "—", "khóa form"],
            ["<code>value</code>", "string", "—", "chữ ban đầu"],
            ["<code>placeholder</code>", "string", "—", "gợi ý khi ô trống"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "chữ hiện tại (tự do — giữ nguyên chữ đã gõ)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "chữ thay đổi"]],
        }) +
        a11y("Là ARIA <code>combobox</code>: <code>aria-expanded</code>, <code>aria-activedescendant</code>, ↑/↓ để di chuyển, Enter để chọn, Esc để đóng."),
    },
  },
  {
    id: "selectmenu",
    cat: "Form",
    name: "SelectMenu",
    desc: {
      en: "Strict searchable single-select: a trigger shows the label; the popup adds a filter box; the value must be one of the options.",
      vi: "Single-select có tìm kiếm, chặt chẽ: nút hiện label; popup có ô lọc; value bắt buộc thuộc danh sách options.",
    },
    body: {
      en: () =>
        stage(
          "SELECTMENU",
          `<nes-select-menu name="model" placeholder="Choose model…" value="opus" aria-label="Model" style="max-inline-size:min(320px,100%)">
            <script type="application/json">[{"value":"opus","label":"Opus 4.8"},{"value":"sonnet","label":"Sonnet 5"},{"value":"haiku","label":"Haiku 4.5"}]</script>
          </nes-select-menu>`,
          "col",
        ) +
        cb(`<nes-select-menu name="model" placeholder="Choose model…">
  <script type="application/json">
    [{ "value": "opus", "label": "Opus 4.8" }, { "value": "sonnet", "label": "Sonnet 5" }]
  </script>
</nes-select-menu>`) +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "options: <code>{ value, label, disabled }[]</code> — the value must exist here"]],
          attr: [
            ["<code>name</code>", "string", "—", "form key"],
            ["<code>value</code>", "string", "—", "initial selected value"],
            ["<code>placeholder</code>", "string", "—", "shown before a pick"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "current value (always one of the options)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "the selection changed"]],
        }) +
        note("Reach for this over a native <code>&lt;select&gt;</code> only when you need search/filter — the native control is lighter and friendlier on mobile."),
      vi: () =>
        stage(
          "SELECTMENU",
          `<nes-select-menu name="model" placeholder="Chọn model…" value="opus" aria-label="Model" style="max-inline-size:min(320px,100%)">
            <script type="application/json">[{"value":"opus","label":"Opus 4.8"},{"value":"sonnet","label":"Sonnet 5"},{"value":"haiku","label":"Haiku 4.5"}]</script>
          </nes-select-menu>`,
          "col",
        ) +
        cb(`<nes-select-menu name="model" placeholder="Chọn model…">
  <script type="application/json">
    [{ "value": "opus", "label": "Opus 4.8" }, { "value": "sonnet", "label": "Sonnet 5" }]
  </script>
</nes-select-menu>`) +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "options: <code>{ value, label, disabled }[]</code> — value phải nằm ở đây"]],
          attr: [
            ["<code>name</code>", "string", "—", "khóa form"],
            ["<code>value</code>", "string", "—", "value chọn ban đầu"],
            ["<code>placeholder</code>", "string", "—", "hiện trước khi chọn"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "value hiện tại (luôn thuộc options)"]],
          event: [["<code>nes:change</code>", "<code>{ value }</code>", "—", "lựa chọn thay đổi"]],
        }) +
        note("Chỉ dùng thay <code>&lt;select&gt;</code> gốc khi cần tìm kiếm/lọc — bản gốc nhẹ hơn và thân thiện hơn trên mobile."),
    },
  },
  {
    id: "form",
    cat: "Form",
    name: "Form",
    desc: {
      en: "A thin wrapper that runs native constraint validation, renders inline errors under each .field, and emits nes:submit with the data.",
      vi: "Lớp bọc mỏng chạy kiểm tra ràng buộc gốc, hiện lỗi ngay dưới mỗi .field, và bắn nes:submit kèm dữ liệu.",
    },
    body: {
      en: () =>
        stage(
          "FORM",
          `<nes-form aria-label="Signup demo" style="inline-size:100%;max-inline-size:min(380px,100%)">
            <label class="field"><span class="label">Email <span class="req">*</span></span>
              <input class="input" type="email" name="email" required placeholder="you@studio.dev"></label>
            <label class="field" style="margin-block-start:var(--sp-3)"><span class="label">Handle <span class="req">*</span></span>
              <input class="input" name="handle" required minlength="3" data-error="Min 3 characters."></label>
            <button class="btn" type="submit" style="margin-block-start:var(--sp-3)">CREATE</button>
          </nes-form>`,
          "col",
        ) +
        cb(`<nes-form>
  <label class="field">
    <span class="label">Email <span class="req">*</span></span>
    <input class="input" type="email" name="email" required>
  </label>
  <button class="btn" type="submit">CREATE</button>
</nes-form>

<script type="module">
  document.querySelector("nes-form")
    .addEventListener("nes:submit", (e) => console.log(e.detail.data));
</script>`) +
        apiGroups({
          prop: [["<code>.form</code>", "HTMLFormElement", "—", "the wrapped <code>&lt;form&gt;</code> (created on connect)"]],
          method: [["<code>.submit()</code>", "<code>() → void</code>", "—", "validate every control, then submit"]],
          event: [
            ["<code>nes:submit</code>", "<code>{ data, form }</code>", "—", "fires only when all fields are valid"],
            ["<code>nes:invalid</code>", "<code>{}</code>", "—", "a submit was blocked by validation"],
          ],
        }) +
        note("Validation is the platform's own — set <code>required</code>, <code>type</code>, <code>minlength</code>, <code>pattern</code>… on inputs; override a message with <code>data-error</code>. Invalid controls get <code>aria-invalid</code> + an inline <code>.field.err</code> message.") +
        a11y("Messages are localized by the browser and the first invalid control is focused. Custom <code>&lt;nes-*&gt;</code> controls submit via their hidden inputs."),
      vi: () =>
        stage(
          "FORM",
          `<nes-form aria-label="Demo đăng ký" style="inline-size:100%;max-inline-size:min(380px,100%)">
            <label class="field"><span class="label">Email <span class="req">*</span></span>
              <input class="input" type="email" name="email" required placeholder="you@studio.dev"></label>
            <label class="field" style="margin-block-start:var(--sp-3)"><span class="label">Handle <span class="req">*</span></span>
              <input class="input" name="handle" required minlength="3" data-error="Tối thiểu 3 ký tự."></label>
            <button class="btn" type="submit" style="margin-block-start:var(--sp-3)">TẠO</button>
          </nes-form>`,
          "col",
        ) +
        cb(`<nes-form>
  <label class="field">
    <span class="label">Email <span class="req">*</span></span>
    <input class="input" type="email" name="email" required>
  </label>
  <button class="btn" type="submit">TẠO</button>
</nes-form>

<script type="module">
  document.querySelector("nes-form")
    .addEventListener("nes:submit", (e) => console.log(e.detail.data));
</script>`) +
        apiGroups({
          prop: [["<code>.form</code>", "HTMLFormElement", "—", "thẻ <code>&lt;form&gt;</code> được bọc (tạo khi connect)"]],
          method: [["<code>.submit()</code>", "<code>() → void</code>", "—", "kiểm tra mọi control rồi submit"]],
          event: [
            ["<code>nes:submit</code>", "<code>{ data, form }</code>", "—", "chỉ bắn khi mọi field hợp lệ"],
            ["<code>nes:invalid</code>", "<code>{}</code>", "—", "submit bị validation chặn"],
          ],
        }) +
        note("Validation là của nền tảng — đặt <code>required</code>, <code>type</code>, <code>minlength</code>, <code>pattern</code>… lên input; ghi đè thông báo bằng <code>data-error</code>. Control lỗi được <code>aria-invalid</code> + thông báo <code>.field.err</code> inline.") +
        a11y("Thông báo được trình duyệt bản địa hóa và control lỗi đầu tiên được focus. Các control <code>&lt;nes-*&gt;</code> submit qua input ẩn của chúng."),
    },
  },

  /* -------------------------------------------------------- FEEDBACK */
  {
    id: "alert",
    cat: "Feedback",
    name: "Alert",
    desc: {
      en: "Inline message with a semantic tone. Four shades map to meaning, not decoration.",
      vi: "Thông báo inline với sắc thái ngữ nghĩa. Bốn sắc độ tải nghĩa, không trang trí.",
    },
    body: {
      en: () =>
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
      vi: () =>
        stage(
          "CALLOUT",
          `<div style="display:grid;gap:var(--sp-3);inline-size:100%">
            <div class="callout tip"><b>Tip.</b> Hạ <code>maxOutputTokens</code> cho tác vụ phân loại — rẻ hơn nhiều.</div>
            <div class="callout gotcha"><b>Gotcha.</b> Không có guard → secret chưa được bảo vệ.</div>
            <div class="callout memo"><b>Nhớ.</b> Mỗi khối một màu nhấn. Màu tải nghĩa.</div>
            <div class="callout quest"><b>Quest.</b> Clear 3 stage để mở free play.</div>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="callout tip"><b>Tip.</b> …</div>
<div class="callout gotcha"><b>Gotcha.</b> …</div>
<div class="callout memo"><b>Nhớ.</b> …</div>
<div class="callout quest"><b>Quest.</b> …</div>`,
        ) +
        a11y(
          "Với thông báo xuất hiện động, hãy render trong vùng live (<code>role=\"status\"</code> hoặc <code>role=\"alert\"</code>) để được đọc lên.",
        ),
    },
  },
  {
    id: "progress",
    cat: "Feedback",
    name: "Progress",
    desc: {
      en: "Determinate bar. Fills with a smooth ease so progress glides — striped so the amount reads at a glance.",
      vi: "Thanh xác định. Tô đầy mượt theo ease để tiến trình lướt êm — có sọc để đọc mức nhanh.",
    },
    body: {
      en: () =>
        stage("PBAR", `<span class="pbar" style="inline-size:280px"><i style="--fill:64%"></i></span>`, "col") +
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
      vi: () =>
        stage("PBAR", `<span class="pbar" style="inline-size:280px"><i style="--fill:64%"></i></span>`, "col") +
        cb(`<span class="pbar"><i style="--fill:64%"></i></span>`) +
        api(
          ["Thành phần", "Vai trò"],
          [
            ["<code>.pbar</code>", "đường ray"],
            ["<code>.pbar > i</code>", "phần tô đầy"],
            ["<code>--fill</code>", "0%–100% (chạy theo bước)"],
          ],
        ) +
        a11y(
          "Thêm <code>role=\"progressbar\"</code> với <code>aria-valuenow</code>/<code>-valuemin</code>/<code>-valuemax</code> để giá trị được đọc.",
        ),
    },
  },
  {
    id: "skeleton",
    cat: "Feedback",
    name: "Skeleton",
    desc: {
      en: "Loading placeholder. The shimmer ticks in steps rather than gliding.",
      vi: "Ô giữ chỗ khi tải. Ánh sáng chạy theo bước (steps) thay vì trôi mượt.",
    },
    body: {
      en: () =>
        skeletonStage() +
        cb(`<span class="skeleton" style="inline-size:80%"></span>`) +
        a11y(
          "Hide decorative skeletons from AT with <code>aria-hidden</code> and expose a text \"Loading…\" status elsewhere.",
        ),
      vi: () =>
        skeletonStage() +
        cb(`<span class="skeleton" style="inline-size:80%"></span>`) +
        a11y(
          "Ẩn skeleton trang trí khỏi AT bằng <code>aria-hidden</code> và đưa trạng thái \"Đang tải…\" bằng chữ ở nơi khác.",
        ),
    },
  },
  {
    id: "toast",
    cat: "Feedback",
    name: "Toast",
    desc: {
      en: "Transient confirmation. Fires from JS, auto-dismisses, and is announced politely.",
      vi: "Xác nhận thoáng qua. Gọi từ JS, tự tắt, và được đọc nhẹ nhàng cho screen reader.",
    },
    body: {
      en: () =>
        stage(
          "TOAST",
          `<button class="btn" data-toast="Settings saved." data-toast-accent="good">Save &amp; toast</button>
           <button class="btn ghost" data-toast="Nothing to undo." data-toast-accent="warn">Try warn</button>`,
        ) +
        cb(
          `import { toast } from "8bit-nes";

toast("Settings saved.", { accent: "good" });`,
        ) +
        h2("API") +
        api(
          ["Argument", "Meaning"],
          [
            ["<code>msg</code>", "HTML string shown in the toast"],
            ["<code>opts.accent</code>", "good (default) · warn · crit · gold · …"],
            ["<code>opts.timeout</code>", "auto-dismiss ms (0 = keep)"],
          ],
        ) +
        a11y(
          "Toasts render in a <code>role=\"status\" aria-live=\"polite\"</code> region, so screen readers hear them without focus being stolen.",
        ),
      vi: () =>
        stage(
          "TOAST",
          `<button class="btn" data-toast="Đã lưu cấu hình." data-toast-accent="good">Lưu &amp; toast</button>
           <button class="btn ghost" data-toast="Không có gì để hoàn tác." data-toast-accent="warn">Thử warn</button>`,
        ) +
        cb(
          `import { toast } from "8bit-nes";

toast("Đã lưu cấu hình.", { accent: "good" });`,
        ) +
        h2("API") +
        api(
          ["Tham số", "Ý nghĩa"],
          [
            ["<code>msg</code>", "chuỗi HTML hiển thị trong toast"],
            ["<code>opts.accent</code>", "gold (mặc định) · good · warn · crit · …"],
            ["<code>opts.timeout</code>", "ms tự tắt (0 = giữ lại)"],
          ],
        ) +
        a11y(
          "Toast render trong vùng <code>role=\"status\" aria-live=\"polite\"</code>, nên screen reader nghe được mà không bị cướp focus.",
        ),
    },
  },

  /* -------------------------------------------------------- NAVIGATION */
  {
    id: "tabs",
    cat: "Navigation",
    name: "Tabs",
    desc: {
      en: "Switch between panels. Roving focus and arrow keys, built from [data-label] children.",
      vi: "Chuyển giữa các panel. Focus di chuyển bằng phím mũi tên, dựng từ các con có [data-label].",
    },
    body: {
      en: () =>
        stage(
          "TABS",
          `<nes-tabs style="display:block;inline-size:100%">
            <section data-label="Overview" selected>${p("Score your setup, then fix one file at a time.")}</section>
            <section data-label="Config">${p("Clamp <code>maxTokens</code>; declare only the tools you need.")}</section>
            <section data-label="Logs">${p("Every wasted tool is more tokens per call.")}</section>
          </nes-tabs>`,
          "col",
        ) +
        cb(
          `<nes-tabs>
  <section data-label="Overview" selected>…</section>
  <section data-label="Config">…</section>
  <section data-label="Logs">…</section>
</nes-tabs>`,
        ) +
        h2("API") +
        apiGroups({
          slot: [
            ["<code>&lt;section data-label='…'&gt;</code>", "one child per tab; <code>data-label</code> is the tab's text"],
            ["<code>selected</code> (on a section)", "the panel shown first (defaults to the first)"],
          ],
        }) +
        note("Add the <code>lens</code> or <code>code-group</code> class to frame it as a multi-view — see <a href='#/lens'>Lens</a> / <a href='#/codegroup'>CodeGroup</a>.") +
        a11y(
          "Implements the WAI-ARIA tabs pattern: <code>tablist</code>/<code>tab</code>/<code>tabpanel</code> roles, <code>aria-selected</code>, Left/Right arrow navigation, and roving <code>tabindex</code>.",
        ),
      vi: () =>
        stage(
          "TABS",
          `<nes-tabs style="display:block;inline-size:100%">
            <section data-label="Tổng quan" selected>${p("Chấm điểm setup, rồi sửa từng file một.")}</section>
            <section data-label="Cấu hình">${p("Kẹp <code>maxTokens</code>; chỉ khai báo tool bạn cần.")}</section>
            <section data-label="Logs">${p("Mỗi tool thừa là thêm token mỗi lượt gọi.")}</section>
          </nes-tabs>`,
          "col",
        ) +
        cb(
          `<nes-tabs>
  <section data-label="Tổng quan" selected>…</section>
  <section data-label="Cấu hình">…</section>
  <section data-label="Logs">…</section>
</nes-tabs>`,
        ) +
        h2("API") +
        apiGroups({
          slot: [
            ["<code>&lt;section data-label='…'&gt;</code>", "mỗi con là một tab; <code>data-label</code> là chữ trên tab"],
            ["<code>selected</code> (trên section)", "panel hiện đầu tiên (mặc định là panel đầu)"],
          ],
        }) +
        note("Thêm class <code>lens</code> hoặc <code>code-group</code> để đóng khung thành multi-view — xem <a href='#/lens'>Lens</a> / <a href='#/codegroup'>CodeGroup</a>.") +
        a11y(
          "Cài theo mẫu WAI-ARIA tabs: role <code>tablist</code>/<code>tab</code>/<code>tabpanel</code>, <code>aria-selected</code>, điều hướng phím Trái/Phải, và roving <code>tabindex</code>.",
        ),
    },
  },
  {
    id: "breadcrumb",
    cat: "Navigation",
    name: "Breadcrumb",
    desc: {
      en: "Path to the current page. Mono, chevron-separated, last item current.",
      vi: "Đường dẫn tới trang hiện tại. Mono, ngăn bằng mũi tên, mục cuối là hiện tại.",
    },
    body: {
      en: () =>
        breadcrumbStage() +
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
      vi: () =>
        breadcrumbStage() +
        cb(
          `<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Docs</a></li>
    <li><span aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>`,
        ) +
        a11y(
          "Bọc trong <code>&lt;nav aria-label=\"Breadcrumb\"&gt;</code>, dùng danh sách có thứ tự, và đánh dấu mục cuối <code>aria-current=\"page\"</code>.",
        ),
    },
  },
  {
    id: "pagination",
    cat: "Navigation",
    name: "Pagination",
    desc: {
      en: "Page through a list. The current page fills with the primary accent; ends disable.",
      vi: "Lật qua danh sách. Trang hiện tại tô đầy màu primary; hai đầu bị vô hiệu.",
    },
    body: {
      en: () =>
        paginationStage() +
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
      vi: () =>
        paginationStage() +
        cb(
          `<nav class="pagination" aria-label="Pagination">
  <button class="pg">1</button>
  <button class="pg" aria-current="page">2</button>
  <button class="pg">3</button>
</nav>`,
        ) +
        a11y(
          "Đặt nhãn cho <code>&lt;nav&gt;</code>, đánh dấu mục hiện tại <code>aria-current=\"page\"</code>, và vô hiệu prev/next ở hai đầu.",
        ),
    },
  },

  /* -------------------------------------------------------- OVERLAY */
  {
    id: "modal",
    cat: "Overlay",
    name: "Modal",
    desc: {
      en: "Focus-trapping dialog on the native <dialog> element. Opens with showModal().",
      vi: "Hộp thoại giữ focus, dựng trên <dialog> gốc. Mở bằng showModal().",
    },
    body: {
      en: () =>
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
      vi: () =>
        stage(
          "MODAL",
          `<button class="btn" data-open="demo-modal">Mở modal</button>
           <dialog class="modal" id="demo-modal" data-accent="crit">
             <div class="head"><span class="title">Reset tiến trình?</span></div>
             <p class="doc-p" style="margin:0">Thao tác này xóa XP của mọi stage. Không thể hoàn tác.</p>
             <form method="dialog" class="foot">
               <button class="btn ghost" value="cancel">Hủy</button>
               <button class="btn" data-accent="crit" value="ok">Reset</button>
             </form>
           </dialog>`,
        ) +
        cb(
          `<button onclick="document.getElementById('m').showModal()">Mở</button>

<dialog class="modal" id="m">
  <div class="head"><span class="title">Reset tiến trình?</span></div>
  <p>Không thể hoàn tác.</p>
  <form method="dialog" class="foot">
    <button class="btn ghost" value="cancel">Hủy</button>
    <button class="btn" data-accent="crit">Reset</button>
  </form>
</dialog>`,
        ) +
        a11y(
          "<code>&lt;dialog&gt;</code> gốc giữ focus, đóng bằng <kbd class=\"kbd\">Esc</kbd>, và trả focus khi đóng. Form <code>method=\"dialog\"</code> đóng nó và báo lại value của nút đã bấm.",
        ),
    },
  },
  {
    id: "dropdown",
    cat: "Overlay",
    name: "Dropdown",
    desc: {
      en: "Disclosure menu on the native <details> element. Zero JavaScript.",
      vi: "Menu bung ra trên <details> gốc. Không cần JavaScript.",
    },
    body: {
      en: () =>
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
      vi: () =>
        stage(
          "DROPDOWN",
          `<details class="dropdown">
            <summary class="btn ghost">Hành động ▾</summary>
            <div class="menu">
              <button class="menuitem">Nhân đôi stage</button>
              <button class="menuitem">Xuất XP</button>
              <button class="menuitem crit">Reset tiến trình</button>
            </div>
          </details>`,
        ) +
        cb(
          `<details class="dropdown">
  <summary class="btn ghost">Hành động ▾</summary>
  <div class="menu">
    <button class="menuitem">Nhân đôi</button>
    <button class="menuitem crit">Reset</button>
  </div>
</details>`,
        ) +
        a11y(
          "Dựng trên <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code>, nên trigger là nút thật có trạng thái mở. Muốn thành menu đầy đủ thì thêm <code>role=\"menu\"</code>/<code>menuitem</code> và xử lý phím mũi tên, cùng listener bấm-ra-ngoài để đóng.",
        ),
    },
  },
  {
    id: "tooltip",
    cat: "Overlay",
    name: "Tooltip",
    desc: {
      en: "Label on hover or focus. Pure CSS via a data-tip attribute — no JavaScript.",
      vi: "Nhãn hiện khi hover hoặc focus. Thuần CSS qua thuộc tính data-tip — không JavaScript.",
    },
    body: {
      en: () =>
        stage(
          "TOOLTIP",
          `<button class="btn ghost" data-tip="Copies to clipboard">Hover me</button>
           <span class="chip" data-tip="Filter by language" tabindex="0"><span class="dot"></span>FOCUS</span>`,
        ) +
        cb(`<button class="btn ghost" data-tip="Copies to clipboard">Save</button>`) +
        a11y(
          "CSS tooltips aren't announced by every screen reader — for essential info also expose it as text or <code>aria-label</code>. The trigger must be focusable so keyboard users see it (it shows on <code>:focus-visible</code>).",
        ),
      vi: () =>
        stage(
          "TOOLTIP",
          `<button class="btn ghost" data-tip="Copy vào clipboard">Rê chuột</button>
           <span class="chip" data-tip="Lọc theo ngôn ngữ" tabindex="0"><span class="dot"></span>FOCUS</span>`,
        ) +
        cb(`<button class="btn ghost" data-tip="Copy vào clipboard">Save</button>`) +
        a11y(
          "Tooltip CSS không phải screen reader nào cũng đọc — với thông tin thiết yếu hãy đưa thêm bằng chữ hoặc <code>aria-label</code>. Trigger phải focus được để người dùng bàn phím thấy (nó hiện khi <code>:focus-visible</code>).",
        ),
    },
  },

  /* -------------------------------------------------------- DATA */
  {
    id: "table",
    cat: "Data",
    name: "Table",
    desc: {
      en: "Rows of data. Mono uppercase headers, hover highlight, scrolls on overflow.",
      vi: "Hàng dữ liệu. Header mono in hoa, hover sáng, cuộn ngang khi tràn.",
    },
    body: {
      en: () =>
        tableStage(["Setting", "Value", "Saves"]) +
        cb(
          `<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Setting</th><th>Value</th></tr></thead>
    <tbody><tr><td>model</td><td>haiku-4-5</td></tr></tbody>
  </table>
</div>`,
        ) +
h2("Parts") +
        api(["Class", "Role"], [
          ["<code>.table</code>", "the table — mono headers, row hover, square cells"],
          ["<code>.table-wrap</code>", "overflow-x scroll region (make it a focusable <code>role=region</code>)"],
        ]) +
                a11y(
          "Use real <code>&lt;thead&gt;</code>/<code>&lt;th scope&gt;</code>. Make the scroll wrapper focusable (<code>tabindex=\"0\"</code>, <code>role=\"region\"</code>, <code>aria-label</code>) so keyboard users can scroll it.",
        ),
      vi: () =>
        tableStage(["Thiết lập", "Giá trị", "Tiết kiệm"]) +
        cb(
          `<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Thiết lập</th><th>Giá trị</th></tr></thead>
    <tbody><tr><td>model</td><td>haiku-4-5</td></tr></tbody>
  </table>
</div>`,
        ) +
h2("Thành phần") +
        api(["Class", "Vai trò"], [
          ["<code>.table</code>", "bảng — header mono, hover hàng, ô vuông"],
          ["<code>.table-wrap</code>", "vùng cuộn ngang (cho focus được, <code>role=region</code>)"],
        ]) +
                a11y(
          "Dùng <code>&lt;thead&gt;</code>/<code>&lt;th scope&gt;</code> thật. Cho khung cuộn focus được (<code>tabindex=\"0\"</code>, <code>role=\"region\"</code>, <code>aria-label</code>) để người dùng bàn phím cuộn được.",
        ),
    },
  },
  {
    id: "code",
    cat: "Data",
    name: "Code block",
    desc: {
      en: "Drop code in — <nes-code> highlights it and wires the copy button. No manual markup, no dependency.",
      vi: "Bỏ code vào — <nes-code> tự tô màu và gắn nút copy. Không markup thủ công, không phụ thuộc.",
    },
    body: {
      en: () =>
        stage(
          "NES-CODE",
          `<nes-code style="inline-size:100%">{
  "model": "claude-haiku-4-5",
  "maxOutputTokens": 512,
  "temperature": 0
}</nes-code>`,
          "col",
        ) +
        cb(`<nes-code>
{ "model": "claude-haiku-4-5" }
</nes-code>`) +
        h2("Manual control") +
        p(
          "Need full control? Use <code>.codeblock</code> and wrap tokens yourself: <code>.t-sel .t-key .t-str .t-num .t-com .t-at .t-fn</code>.",
        ) +
        codeStage("// clamp the token budget") +
h2("API") +
        apiGroups({
          slot: [["default", "the code — escape <code>&lt;</code> in raw markup"]],
          attr: [["<code>file</code>", "string", "—", "show a filename header above the block"]],
        }) +
                a11y(
          "Both variants use a real <code>&lt;button&gt;</code> to copy. Escape <code>&lt;</code> in raw markup you pass to <code>&lt;nes-code&gt;</code>, or the browser parses it as elements.",
        ),
      vi: () =>
        stage(
          "NES-CODE",
          `<nes-code style="inline-size:100%">{
  "model": "claude-haiku-4-5",
  "maxOutputTokens": 512,
  "temperature": 0
}</nes-code>`,
          "col",
        ) +
        cb(`<nes-code>
{ "model": "claude-haiku-4-5" }
</nes-code>`) +
        h2("Tùy biến thủ công") +
        p(
          "Cần kiểm soát hoàn toàn? Dùng <code>.codeblock</code> và tự bọc token: <code>.t-sel .t-key .t-str .t-num .t-com .t-at .t-fn</code>.",
        ) +
        codeStage("// kẹp ngân sách token") +
h2("API") +
        apiGroups({
          slot: [["default", "code — escape <code>&lt;</code> trong markup thô"]],
          attr: [["<code>file</code>", "string", "—", "hiện header tên file trên code block"]],
        }) +
                a11y(
          "Cả hai cách đều dùng <code>&lt;button&gt;</code> thật để copy. Escape <code>&lt;</code> trong markup thô đưa vào <code>&lt;nes-code&gt;</code>, nếu không trình duyệt sẽ hiểu là element.",
        ),
    },
  },
  {
    id: "accordion",
    cat: "Data",
    name: "Accordion",
    desc: {
      en: "Collapsible section. <nes-collapsible> — the header button toggles the body.",
      vi: "Khối gập được. <nes-collapsible> — nút header đóng/mở phần thân.",
    },
    body: {
      en: () =>
        stage(
          "COLLAPSIBLE",
          `<div style="inline-size:100%;display:flex;flex-direction:column;gap:var(--sp-4)">
            <nes-collapsible open accent="gold">
              <span slot="head">STAGE 1 · Model &amp; budget</span>
              <p>Pick a model per task; clamp <code>maxTokens</code>.</p>
            </nes-collapsible>
            <nes-collapsible accent="cyan">
              <span slot="head">STAGE 2 · Tools &amp; MCP</span>
              <p>Declare the minimum tools you need.</p>
            </nes-collapsible>
          </div>`,
          "col",
        ) +
        cb(
          `<nes-collapsible open accent="gold">
  <span slot="head">STAGE 1 · Model & budget</span>
  <p>Pick a model per task…</p>
</nes-collapsible>`,
        ) +
        h2("API") +
        apiGroups({
          slot: [
            ["<code>slot=\"head\"</code>", "the header / toggle label"],
            ["default", "the collapsible body content"],
          ],
          attr: [
            ["<code>open</code>", "boolean", "<code>false</code>", "start expanded"],
            ["<code>accent</code>", "accent name", "—", "recolor the header + border"],
          ],
        }) +
        a11y(
          "The header is a <code>&lt;button aria-expanded&gt;</code>; the body uses the <code>hidden</code> attribute, so closed content leaves the tab order.",
        ),
      vi: () =>
        stage(
          "COLLAPSIBLE",
          `<div style="inline-size:100%;display:flex;flex-direction:column;gap:var(--sp-4)">
            <nes-collapsible open accent="gold">
              <span slot="head">STAGE 1 · Model &amp; ngân sách</span>
              <p>Chọn model theo tác vụ; kẹp <code>maxTokens</code>.</p>
            </nes-collapsible>
            <nes-collapsible accent="cyan">
              <span slot="head">STAGE 2 · Tools &amp; MCP</span>
              <p>Chỉ khai báo tối thiểu tool cần.</p>
            </nes-collapsible>
          </div>`,
          "col",
        ) +
        cb(
          `<nes-collapsible open accent="gold">
  <span slot="head">STAGE 1 · Model & ngân sách</span>
  <p>Chọn model theo tác vụ…</p>
</nes-collapsible>`,
        ) +
        h2("API") +
        apiGroups({
          slot: [
            ["<code>slot=\"head\"</code>", "nhãn header / nút gập"],
            ["default", "nội dung thân gập được"],
          ],
          attr: [
            ["<code>open</code>", "boolean", "<code>false</code>", "mở sẵn"],
            ["<code>accent</code>", "accent name", "—", "đổi màu header + viền"],
          ],
        }) +
        a11y(
          "Header là <code>&lt;button aria-expanded&gt;</code>; phần thân dùng thuộc tính <code>hidden</code>, nên nội dung đóng rời khỏi thứ tự tab.",
        ),
    },
  },
  {
    id: "stat",
    cat: "Data",
    name: "Stat",
    desc: {
      en: "A single big number with a label. Tabular figures; accent-colored.",
      vi: "Một con số lớn kèm nhãn. Chữ số canh cột đều; tô theo màu nhấn.",
    },
    body: {
      en: () =>
        statStage(["Power", "Stages clear", "Token saved"]) +
        cb(
          `<div class="stat" data-accent="gold">
  <div class="n">1,240</div>
  <div class="l">Power</div>
</div>`,
        ) +
h2("Parts") +
        api(["Class / attr", "Role"], [
          ["<code>.stat</code>", "container — set <code>data-accent</code> to recolor"],
          ["<code>.n</code>", "the big number (tabular figures)"],
          ["<code>.l</code>", "the label beneath it"],
        ]) +
                a11y(
          "Pair the number with a text label (as shown) so it isn't a bare figure. If it updates live, wrap it in <code>aria-live=\"polite\"</code>.",
        ),
      vi: () =>
        statStage(["Power", "Stage đã clear", "Token tiết kiệm"]) +
        cb(
          `<div class="stat" data-accent="gold">
  <div class="n">1,240</div>
  <div class="l">Power</div>
</div>`,
        ) +
h2("Thành phần") +
        api(["Class / attr", "Vai trò"], [
          ["<code>.stat</code>", "container — đặt <code>data-accent</code> để đổi màu"],
          ["<code>.n</code>", "số lớn (chữ số canh cột)"],
          ["<code>.l</code>", "nhãn bên dưới"],
        ]) +
                a11y(
          "Kèm số với nhãn chữ (như ở đây) để không phải là con số trơ. Nếu cập nhật động, bọc trong <code>aria-live=\"polite\"</code>.",
        ),
    },
  },

  /* -------------------------------------------------------- WAVE 2 · FORM */
  {
    id: "range",
    cat: "Form",
    name: "Range",
    desc: {
      en: "Slider on a native <input type=range>. Recessed track, square accent thumb. Set data-accent to recolor.",
      vi: "Thanh trượt trên <input type=range> gốc. Rãnh chìm, núm vuông màu nhấn. Đặt data-accent để đổi màu.",
    },
    body: {
      en: () =>
        rangeStage("Volume") +
        cb(
          `<label class="field">
  <span class="label">Volume</span>
  <input class="range" type="range" min="0" max="100" value="70">
</label>
<input class="range" type="range" value="40" data-accent="cyan">`,
        ) +
        a11y(
          "It's a native <code>&lt;input type=\"range\"&gt;</code>: arrow keys, Home/End, and screen-reader value come free. Add an <code>aria-label</code> (or a <code>.field</code> label) when there's no visible one.",
        ),
      vi: () =>
        rangeStage("Âm lượng") +
        cb(
          `<label class="field">
  <span class="label">Âm lượng</span>
  <input class="range" type="range" min="0" max="100" value="70">
</label>
<input class="range" type="range" value="40" data-accent="cyan">`,
        ) +
        a11y(
          "Là <code>&lt;input type=\"range\"&gt;</code> gốc: phím mũi tên, Home/End và giá trị đọc màn hình có sẵn. Thêm <code>aria-label</code> (hoặc nhãn <code>.field</code>) khi không có nhãn hiển thị.",
        ),
    },
  },
  {
    id: "segment",
    cat: "Form",
    name: "Segmented control",
    desc: {
      en: "A row of connected buttons for a single choice — the pressed one fills with the accent. Great for a difficulty or view switch.",
      vi: "Một hàng nút liền nhau cho một lựa chọn — nút đang chọn tô đầy màu nhấn. Hợp cho chọn độ khó hay đổi chế độ xem.",
    },
    body: {
      en: () =>
        segmentStage(["Easy", "Normal", "Hard"]) +
        cb(
          `<div class="segment" role="group" aria-label="Difficulty">
  <button type="button">Easy</button>
  <button type="button" aria-pressed="true">Normal</button>
  <button type="button">Hard</button>
</div>`,
        ) +
        a11y(
          "Wrap in <code>role=\"group\"</code> with an <code>aria-label</code>, and reflect the active button with <code>aria-pressed=\"true\"</code> — the fill is not read by itself. Toggle <code>aria-pressed</code> in your click handler.",
        ),
      vi: () =>
        segmentStage(["Dễ", "Thường", "Khó"]) +
        cb(
          `<div class="segment" role="group" aria-label="Độ khó">
  <button type="button">Dễ</button>
  <button type="button" aria-pressed="true">Thường</button>
  <button type="button">Khó</button>
</div>`,
        ) +
        a11y(
          "Bọc trong <code>role=\"group\"</code> có <code>aria-label</code>, và phản ánh nút đang chọn bằng <code>aria-pressed=\"true\"</code> — chỉ màu tô thì screen reader không đọc. Đổi <code>aria-pressed</code> trong handler click.",
        ),
    },
  },

  /* ---------------------------------------------------- WAVE 2 · FEEDBACK */
  {
    id: "spinner",
    cat: "Feedback",
    name: "Spinner",
    desc: {
      en: "A square loader whose lit edges spin smoothly — a loader with no curve. Three sizes; accent-ready.",
      vi: "Bộ loader vuông với các cạnh sáng quay mượt — loader không có đường cong. Ba cỡ; đổi được màu nhấn.",
    },
    body: {
      en: () =>
        spinnerStage() +
        cb(
          `<span class="spinner sm"></span>
<span class="spinner"></span>
<span class="spinner lg" data-accent="cyan"></span>`,
        ) +
        a11y(
          "A spinner is decorative on its own. Put the live status in text near it (e.g. <code>&lt;span role=\"status\"&gt;Loading…&lt;/span&gt;</code>) and give the spinner <code>aria-hidden=\"true\"</code>.",
        ),
      vi: () =>
        spinnerStage() +
        cb(
          `<span class="spinner sm"></span>
<span class="spinner"></span>
<span class="spinner lg" data-accent="cyan"></span>`,
        ) +
        a11y(
          "Spinner tự thân chỉ để trang trí. Đặt trạng thái động vào chữ bên cạnh (vd. <code>&lt;span role=\"status\"&gt;Đang tải…&lt;/span&gt;</code>) và cho spinner <code>aria-hidden=\"true\"</code>.",
        ),
    },
  },
  {
    id: "meter",
    cat: "Feedback",
    name: "Meter",
    desc: {
      en: "A discrete segmented gauge — HP / energy in blocks. Add .on to filled cells; good/warn/crit read as health states.",
      vi: "Đồng hồ dạng ô rời — HP / năng lượng theo khối. Thêm .on cho ô đã đầy; good/warn/crit đọc như trạng thái máu.",
    },
    body: {
      en: () =>
        meterStage() +
        cb(
          `<div class="meter" data-accent="good" role="meter"
     aria-valuenow="7" aria-valuemin="0" aria-valuemax="10" aria-label="Health">
  <span class="cell on"></span><span class="cell on"></span>
  <span class="cell on"></span><span class="cell"></span>
</div>`,
        ) +
        a11y(
          "Unlike a continuous bar, cells are countable at a glance. Expose the value with <code>role=\"meter\"</code> + <code>aria-valuenow/min/max</code> so it isn't shape-only.",
        ),
      vi: () =>
        meterStage() +
        cb(
          `<div class="meter" data-accent="good" role="meter"
     aria-valuenow="7" aria-valuemin="0" aria-valuemax="10" aria-label="Máu">
  <span class="cell on"></span><span class="cell on"></span>
  <span class="cell on"></span><span class="cell"></span>
</div>`,
        ) +
        a11y(
          "Khác thanh liền, các ô đếm được trong một cái liếc. Bộc lộ giá trị bằng <code>role=\"meter\"</code> + <code>aria-valuenow/min/max</code> để không chỉ dựa vào hình.",
        ),
    },
  },
  {
    id: "empty",
    cat: "Feedback",
    name: "Empty state",
    desc: {
      en: "The \"no data\" / \"game over\" panel. Square dashed edge, centered mono copy, and always an action out.",
      vi: "Bảng \"chưa có dữ liệu\" / \"game over\". Viền đứt nét vuông, chữ mono canh giữa, và luôn có một hành động thoát ra.",
    },
    body: {
      en: () =>
        emptyStage({
          icon: "🕹️",
          title: "No runs yet",
          body: "Your cleared stages will show up here. Start one to put a number on the board.",
          action: "New run",
        }) +
        cb(
          `<div class="empty">
  <div class="icon">🕹️</div>
  <div class="title">No runs yet</div>
  <p>Your cleared stages show up here. Start one to put a number on the board.</p>
  <button class="btn">New run</button>
</div>`,
        ) +
        a11y(
          "An empty state is not an error — it invites the next action. Lead with what to do; keep the emoji <code>aria-hidden</code> and let the title carry the meaning.",
        ),
      vi: () =>
        emptyStage({
          icon: "🕹️",
          title: "Chưa có lượt nào",
          body: "Các stage đã clear sẽ hiện ở đây. Bắt đầu một lượt để ghi tên lên bảng.",
          action: "Lượt mới",
        }) +
        cb(
          `<div class="empty">
  <div class="icon">🕹️</div>
  <div class="title">Chưa có lượt nào</div>
  <p>Các stage đã clear sẽ hiện ở đây. Bắt đầu một lượt để ghi tên lên bảng.</p>
  <button class="btn">Lượt mới</button>
</div>`,
        ) +
        a11y(
          "Empty state không phải lỗi — nó mời hành động kế tiếp. Dẫn bằng việc cần làm; để emoji <code>aria-hidden</code> và cho tiêu đề tải nghĩa.",
        ),
    },
  },

  /* -------------------------------------------------- WAVE 2 · NAVIGATION */
  {
    id: "steps",
    cat: "Navigation",
    name: "Steps",
    desc: {
      en: "Stage progression. Mark cleared stages .done and the active one aria-current — reads as NES \"STAGE 1 · 2 · 3\".",
      vi: "Tiến trình theo chặng. Đánh dấu chặng đã xong bằng .done và chặng hiện tại bằng aria-current — đọc như \"STAGE 1 · 2 · 3\" kiểu NES.",
    },
    body: {
      en: () =>
        stepsStage(["Config", "Connect", "Test", "Ship"]) +
        cb(
          `<ol class="steps">
  <li class="done">Config</li>
  <li class="done">Connect</li>
  <li aria-current="step">Test</li>
  <li>Ship</li>
</ol>`,
        ) +
        a11y(
          "Use an ordered list <code>&lt;ol&gt;</code> for real sequence semantics and mark the active stage with <code>aria-current=\"step\"</code>. The check on a done stage is decorative — the <code>.done</code> label carries it.",
        ),
      vi: () =>
        stepsStage(["Cấu hình", "Kết nối", "Kiểm thử", "Xuất bản"]) +
        cb(
          `<ol class="steps">
  <li class="done">Cấu hình</li>
  <li class="done">Kết nối</li>
  <li aria-current="step">Kiểm thử</li>
  <li>Xuất bản</li>
</ol>`,
        ) +
        a11y(
          "Dùng danh sách có thứ tự <code>&lt;ol&gt;</code> cho đúng ngữ nghĩa trình tự và đánh dấu chặng hiện tại bằng <code>aria-current=\"step\"</code>. Dấu tick ở chặng xong chỉ để trang trí — nhãn <code>.done</code> mới tải nghĩa.",
        ),
    },
  },

  /* ----------------------------------------------------- WAVE 2 · OVERLAY */
  {
    id: "drawer",
    cat: "Overlay",
    name: "Drawer",
    desc: {
      en: "A side sheet on the native <dialog>. Slides in from the edge with showModal(); add .start to come from the left.",
      vi: "Tấm trượt bên, dựng trên <dialog> gốc. Trượt vào từ mép bằng showModal(); thêm .start để vào từ bên trái.",
    },
    body: {
      en: () =>
        drawerStage({
          open: "Open drawer",
          title: "Filters",
          body: "Any content fits — fields, a menu, a form. Esc closes it and focus is trapped inside.",
          close: "Done",
        }) +
        cb(
          `<button onclick="document.getElementById('d').showModal()">Open</button>

<dialog class="drawer" id="d">
  <div class="head"><span class="title">Filters</span></div>
  <!-- fields / menu / form -->
  <form method="dialog"><button class="btn ghost">Done</button></form>
</dialog>`,
        ) +
        a11y(
          "Same native <code>&lt;dialog&gt;</code> as the modal: focus is trapped, <kbd class=\"kbd\">Esc</kbd> closes, and focus returns to the opener. Slide-in is skipped under reduced-motion.",
        ),
      vi: () =>
        drawerStage({
          open: "Mở drawer",
          title: "Bộ lọc",
          body: "Nội dung gì cũng vừa — field, menu, form. Esc để đóng và focus bị giữ bên trong.",
          close: "Xong",
        }) +
        cb(
          `<button onclick="document.getElementById('d').showModal()">Mở</button>

<dialog class="drawer" id="d">
  <div class="head"><span class="title">Bộ lọc</span></div>
  <!-- field / menu / form -->
  <form method="dialog"><button class="btn ghost">Xong</button></form>
</dialog>`,
        ) +
        a11y(
          "Cùng <code>&lt;dialog&gt;</code> gốc như modal: giữ focus, <kbd class=\"kbd\">Esc</kbd> đóng, và focus trả về nút mở. Hiệu ứng trượt bị bỏ khi reduced-motion.",
        ),
    },
  },

  /* -------------------------------------------------------- WAVE 2 · DATA */
  {
    id: "rating",
    cat: "Data",
    name: "Rating",
    desc: {
      en: "A read-only score as a row of stars, filled up to .on. Gold by default; recolor with data-accent.",
      vi: "Điểm số chỉ đọc dạng hàng sao, tô đến .on. Mặc định gold; đổi màu bằng data-accent.",
    },
    body: {
      en: () =>
        ratingStage() +
        cb(
          `<span class="rating" role="img" aria-label="4 out of 5">
  <span class="s on">★</span><span class="s on">★</span>
  <span class="s on">★</span><span class="s on">★</span>
  <span class="s">★</span>
</span>`,
        ) +
h2("Parts") +
        api(["Class", "Role"], [
          ["<code>.rating</code>", "wrapper (add <code>role=img</code> + <code>aria-label</code>); <code>data-accent</code> recolors"],
          ["<code>.s</code>", "one star"],
          ["<code>.s.on</code>", "a filled star"],
        ]) +
                a11y(
          "Colour alone doesn't say the score, so give the wrapper <code>role=\"img\"</code> + an <code>aria-label</code> like <code>\"4 out of 5\"</code>. For an editable rating, use radio inputs instead.",
        ),
      vi: () =>
        ratingStage() +
        cb(
          `<span class="rating" role="img" aria-label="4 trên 5">
  <span class="s on">★</span><span class="s on">★</span>
  <span class="s on">★</span><span class="s on">★</span>
  <span class="s">★</span>
</span>`,
        ) +
h2("Thành phần") +
        api(["Class", "Vai trò"], [
          ["<code>.rating</code>", "wrapper (thêm <code>role=img</code> + <code>aria-label</code>); <code>data-accent</code> đổi màu"],
          ["<code>.s</code>", "một ngôi sao"],
          ["<code>.s.on</code>", "sao đã tô"],
        ]) +
                a11y(
          "Chỉ màu thì không nói ra điểm, nên cho wrapper <code>role=\"img\"</code> + <code>aria-label</code> kiểu <code>\"4 trên 5\"</code>. Nếu cho chấm điểm được, hãy dùng radio thay thế.",
        ),
    },
  },

  /* -------------------------------------------------------- WAVE 3 · FORM */
  {
    id: "stepper",
    cat: "Form",
    name: "Number stepper",
    desc: {
      en: "A − [n] + control around a native number input. Wire the buttons to step the value.",
      vi: "Điều khiển − [n] + quanh input number gốc. Nối nút để tăng/giảm giá trị.",
    },
    body: {
      en: () =>
        stepperStage("Players") +
        cb(
          `<div class="stepper">
  <button type="button" aria-label="Decrease">−</button>
  <input type="number" value="2" min="1" max="8" aria-label="Players">
  <button type="button" aria-label="Increase">+</button>
</div>`,
        ) +
        a11y(
          "Keep the real <code>&lt;input type=\"number\"&gt;</code> so typing and mobile keypads work; label the −/+ buttons (<code>aria-label</code>) and update the input value on click.",
        ),
      vi: () =>
        stepperStage("Người chơi") +
        cb(
          `<div class="stepper">
  <button type="button" aria-label="Giảm">−</button>
  <input type="number" value="2" min="1" max="8" aria-label="Người chơi">
  <button type="button" aria-label="Tăng">+</button>
</div>`,
        ) +
        a11y(
          "Giữ <code>&lt;input type=\"number\"&gt;</code> gốc để gõ và bàn phím số mobile hoạt động; đặt <code>aria-label</code> cho nút −/+ và cập nhật giá trị input khi click.",
        ),
    },
  },

  /* ---------------------------------------------------- WAVE 3 · FEEDBACK */
  {
    id: "banner",
    cat: "Feedback",
    name: "Banner",
    desc: {
      en: "A full-width, page-level notice — distinct from the inline .callout box. Accent-tinted, optional dismiss.",
      vi: "Thông báo full-width cấp trang — khác hộp .callout inline. Nền pha màu nhấn, có thể đóng.",
    },
    body: {
      en: () =>
        bannerStage({ msg: "<b>New:</b> Steps, Timeline and Prose just landed.", close: "✕" }) +
        cb(
          `<div class="banner" data-accent="cyan" role="status">
  <span><b>New:</b> Steps, Timeline and Prose just landed.</span>
  <button class="close" aria-label="Dismiss">✕</button>
</div>`,
        ) +
        a11y(
          "Use <code>role=\"status\"</code> for a non-urgent notice (<code>role=\"alert\"</code> if it needs immediate attention). Give the dismiss button an <code>aria-label</code> and hide the banner on click.",
        ),
      vi: () =>
        bannerStage({ msg: "<b>Mới:</b> Steps, Timeline và Prose vừa ra mắt.", close: "✕" }) +
        cb(
          `<div class="banner" data-accent="cyan" role="status">
  <span><b>Mới:</b> Steps, Timeline và Prose vừa ra mắt.</span>
  <button class="close" aria-label="Đóng">✕</button>
</div>`,
        ) +
        a11y(
          "Dùng <code>role=\"status\"</code> cho thông báo không khẩn (<code>role=\"alert\"</code> nếu cần chú ý ngay). Đặt <code>aria-label</code> cho nút đóng và ẩn banner khi click.",
        ),
    },
  },

  /* -------------------------------------------------- WAVE 3 · NAVIGATION */
  {
    id: "navlist",
    cat: "Navigation",
    name: "Nav list",
    desc: {
      en: "Vertical sidebar navigation for app shells. Mark the current item with aria-current; recolor with data-accent.",
      vi: "Điều hướng sidebar dọc cho app shell. Đánh dấu mục hiện tại bằng aria-current; đổi màu bằng data-accent.",
    },
    body: {
      en: () =>
        navlistStage(["Overview", "Runs", "Settings"], "Runs", "Menu") +
        cb(
          `<nav class="navlist" aria-label="Main">
  <span class="lab">Menu</span>
  <a href="#">Overview</a>
  <a href="#" aria-current="page">Runs</a>
  <a href="#">Settings</a>
</nav>`,
        ) +
        a11y(
          "Wrap in <code>&lt;nav&gt;</code> with an <code>aria-label</code>, use real <code>&lt;a&gt;</code> for links, and mark the active one with <code>aria-current=\"page\"</code> — the colour is not read alone.",
        ),
      vi: () =>
        navlistStage(["Tổng quan", "Lượt chạy", "Cài đặt"], "Lượt chạy", "Menu") +
        cb(
          `<nav class="navlist" aria-label="Chính">
  <span class="lab">Menu</span>
  <a href="#">Tổng quan</a>
  <a href="#" aria-current="page">Lượt chạy</a>
  <a href="#">Cài đặt</a>
</nav>`,
        ) +
        a11y(
          "Bọc trong <code>&lt;nav&gt;</code> có <code>aria-label</code>, dùng <code>&lt;a&gt;</code> thật cho link, và đánh dấu mục active bằng <code>aria-current=\"page\"</code> — màu không được screen reader đọc.",
        ),
    },
  },
  {
    id: "toc",
    cat: "Navigation",
    name: "Map of Content",
    desc: {
      en: "The live “on this page” index: it builds itself from your headings, follows the scroll, and hides when there is nothing worth indexing. Mobile-first — a collapsible bar naming the current section, an open rail when there's room.",
      vi: "Mục lục “trên trang này” sống: tự dựng từ heading của bạn, đi theo scroll, và tự ẩn khi không có gì đáng lập mục. Mobile-first — thanh thu gọn có tên mục đang đọc, thành rail mở khi đủ chỗ.",
    },
    body: {
      en: () =>
        ocTocStage("On this page") +
        cb(`<!-- zero config: it finds <main>/<article>, indexes h2+h3, and hides
     itself when there are fewer than 2 headings -->
<nes-toc></nes-toc>

<!-- or aim it exactly -->
<nes-toc target=".doc-page" levels="h2,h3" label="On this page"></nes-toc>

<!-- pin one shape (default: bar below rail-at, rail from it) -->
<nes-toc mode="bar"></nes-toc>
<nes-toc mode="rail" rail-at="64rem"></nes-toc>

<style>
  /* how far below the page chrome it sticks, and how far a jumped-to
     heading has to clear that chrome — set per breakpoint if you like */
  :root { --toc-top: 53px; --toc-offset: 5rem; }
<\/style>`) +
        apiGroups({
          attr: [
            ["<code>target</code>", "selector", "<code>main, article</code>", "where the headings live (falls back to the closest, then the first, then <code>body</code>)"],
            ["<code>levels</code>", "selector list", '<code>"h2,h3"</code>', "what counts as a heading — any selector works, e.g. <code>.doc-h2</code>"],
            ["<code>label</code>", "string", '<code>"On this page"</code>', "the rail heading, the bar label, and the nav's accessible name"],
            ["<code>min</code>", "number", "<code>2</code>", "fewer headings than this → the element hides itself"],
            ["<code>offset</code>", "number (px)", "<code>80</code>", "the scroll-spy's top edge + fallback for the heading <code>scroll-margin</code>"],
            ["<code>mode</code>", "<code>bar</code> | <code>rail</code>", "auto", "pin one shape instead of switching at <code>rail-at</code>"],
            ["<code>rail-at</code>", "media width", "<code>74rem</code>", "the width at which the bar becomes a rail"],
            ["<code>--toc-top</code>", "length", "<code>0px</code>", "how far below the top of the viewport it sticks"],
            ["<code>--toc-offset</code>", "length", "<code>offset</code>", "how far a jumped-to heading clears your sticky chrome"],
          ],
          prop: [
            ["<code>.headings</code>", "<code>HTMLElement[]</code>", "—", "the headings currently indexed, in document order"],
            ["<code>.active</code>", "string", '<code>""</code>', "id of the section the reader is in"],
            ["<code>.open</code>", "boolean", "<code>false</code>", "bar expanded (no-op in the rail shape)"],
          ],
          method: [["<code>.refresh()</code>", "<code>() =&gt; void</code>", "—", "rebuild from the current DOM — call it after a client-side route change"]],
          event: [["<code>nes:section</code>", "<code>{ id, text }</code>", "—", "the reader moved into another section"]],
        }) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.toc-bar</code>", "the collapsed bar — a real <code>&lt;button&gt;</code>, 44px tall from the start"],
            ["<code>.toc-now</code>", "the section you're in, shown <em>inside</em> the collapsed bar"],
            ["<code>.toc-caret</code>", "the disclosure caret (rotates when open)"],
            ["<code>.toc-lab</code>", "the rail's heading (hidden while the bar carries the label)"],
            ["<code>.outline</code>", "the list itself — the shipped <a href='#/outline'>Outline</a> recipe, not a second list style"],
          ],
        ) +
        note(`It renders its list as <a href="#/outline">.outline</a>, so the indent (<code>.lvl-2</code>/<code>.lvl-3</code>), the <code>.active</code> state and the 44px touch rows all come from a recipe that already existed. Indent is <em>relative</em>: with <code>levels="h3,h4"</code> the h3s sit flush, exactly as h2s would.`) +
        warn(`The links are real in-page anchors (<code>href="#id"</code>) — shareable, middle-clickable, and they work with no JS. If your app <strong>routes on the hash</strong>, intercept them so the route survives:
${cb(`document.addEventListener("click", (e) => {
  const a = e.target.closest("nes-toc a[data-to]");
  if (!a) return;
  e.preventDefault();                       // keep #/your-route in the URL
  document.getElementById(a.dataset.to)?.scrollIntoView({ block: "start" });
});`)}This very site does exactly that — its “on this page” <em>is</em> this component.`) +
        a11y(`The bar is a <code>&lt;button&gt;</code> with <code>aria-expanded</code> + <code>aria-controls</code> pointing at the list; the list is a <code>&lt;nav&gt;</code> with an accessible name; the current entry carries <code>aria-current="true"</code> as well as its colour. Headings get <code>scroll-margin-block-start</code> so a jump never lands under your sticky header, and missing ids are generated from the heading text — diacritics stripped, so “Cài đặt” becomes <code>#cai-dat</code> and stays linkable.`),
      vi: () =>
        ocTocStage("Trên trang này") +
        cb(`<!-- zero config: tự tìm <main>/<article>, lập mục h2+h3, và tự ẩn
     khi có ít hơn 2 heading -->
<nes-toc></nes-toc>

<!-- hoặc chỉ đích chính xác -->
<nes-toc target=".doc-page" levels="h2,h3" label="Trên trang này"></nes-toc>

<!-- ghim một hình dạng (mặc định: bar dưới rail-at, rail từ đó lên) -->
<nes-toc mode="bar"></nes-toc>
<nes-toc mode="rail" rail-at="64rem"></nes-toc>

<style>
  /* dính cách đỉnh bao xa, và heading khi nhảy tới phải vượt qua
     phần chrome dính bao nhiêu — đặt riêng theo breakpoint nếu muốn */
  :root { --toc-top: 53px; --toc-offset: 5rem; }
<\/style>`) +
        apiGroups({
          attr: [
            ["<code>target</code>", "selector", "<code>main, article</code>", "nơi chứa heading (fallback: gần nhất → đầu tiên → <code>body</code>)"],
            ["<code>levels</code>", "danh sách selector", '<code>"h2,h3"</code>', "cái gì được tính là heading — selector nào cũng được, ví dụ <code>.doc-h2</code>"],
            ["<code>label</code>", "string", '<code>"On this page"</code>', "tiêu đề rail, nhãn bar, và tên tiếp cận của nav"],
            ["<code>min</code>", "number", "<code>2</code>", "ít heading hơn số này → element tự ẩn"],
            ["<code>offset</code>", "number (px)", "<code>80</code>", "mép trên của scroll-spy + fallback cho <code>scroll-margin</code> của heading"],
            ["<code>mode</code>", "<code>bar</code> | <code>rail</code>", "auto", "ghim một hình dạng thay vì đổi tại <code>rail-at</code>"],
            ["<code>rail-at</code>", "media width", "<code>74rem</code>", "bề rộng mà bar chuyển thành rail"],
            ["<code>--toc-top</code>", "length", "<code>0px</code>", "dính cách đỉnh viewport bao xa"],
            ["<code>--toc-offset</code>", "length", "<code>offset</code>", "heading khi nhảy tới vượt qua chrome dính bao nhiêu"],
          ],
          prop: [
            ["<code>.headings</code>", "<code>HTMLElement[]</code>", "—", "các heading đang được lập mục, theo thứ tự tài liệu"],
            ["<code>.active</code>", "string", '<code>""</code>', "id của mục người đọc đang ở"],
            ["<code>.open</code>", "boolean", "<code>false</code>", "bar đang mở (không tác dụng ở hình dạng rail)"],
          ],
          method: [["<code>.refresh()</code>", "<code>() =&gt; void</code>", "—", "dựng lại từ DOM hiện tại — gọi sau khi đổi route phía client"]],
          event: [["<code>nes:section</code>", "<code>{ id, text }</code>", "—", "người đọc chuyển sang mục khác"]],
        }) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.toc-bar</code>", "thanh thu gọn — <code>&lt;button&gt;</code> thật, cao 44px ngay từ đầu"],
            ["<code>.toc-now</code>", "mục đang đọc, hiện <em>ngay trong</em> thanh thu gọn"],
            ["<code>.toc-caret</code>", "mũi caret (quay khi mở)"],
            ["<code>.toc-lab</code>", "tiêu đề của rail (ẩn khi bar đang mang nhãn)"],
            ["<code>.outline</code>", "chính danh sách — recipe <a href='#/outline'>Outline</a> có sẵn, không phải style danh sách thứ hai"],
          ],
        ) +
        note(`Nó render danh sách bằng <a href="#/outline">.outline</a>, nên phần thụt lề (<code>.lvl-2</code>/<code>.lvl-3</code>), trạng thái <code>.active</code> và hàng chạm 44px đều đến từ một recipe đã tồn tại. Thụt lề là <em>tương đối</em>: với <code>levels="h3,h4"</code> thì h3 nằm sát lề đúng như h2 vẫn vậy.`) +
        warn(`Các link là anchor thật trong trang (<code>href="#id"</code>) — chia sẻ được, mở tab mới được, và chạy không cần JS. Nếu app của bạn <strong>route bằng hash</strong>, hãy chặn lại để giữ route:
${cb(`document.addEventListener("click", (e) => {
  const a = e.target.closest("nes-toc a[data-to]");
  if (!a) return;
  e.preventDefault();                       // giữ #/route trong URL
  document.getElementById(a.dataset.to)?.scrollIntoView({ block: "start" });
});`)}Chính site này làm đúng vậy — mục “trên trang này” của nó <em>chính là</em> component này.`) +
        a11y(`Bar là <code>&lt;button&gt;</code> có <code>aria-expanded</code> + <code>aria-controls</code> trỏ vào danh sách; danh sách là <code>&lt;nav&gt;</code> có tên tiếp cận; mục hiện tại mang <code>aria-current="true"</code> song song với màu. Heading được gán <code>scroll-margin-block-start</code> nên nhảy tới không bao giờ nằm dưới header dính, và heading thiếu id sẽ được sinh id từ chữ — đã bỏ dấu, nên “Cài đặt” thành <code>#cai-dat</code> và vẫn link được.`),
    },
  },

  /* -------------------------------------------------------- WAVE 3 · DATA */
  {
    id: "datalist",
    cat: "Data",
    name: "Description list",
    desc: {
      en: "Key → value rows for a detail panel or settings summary. Built on native <dl>.",
      vi: "Các hàng khoá → giá trị cho panel chi tiết hay tóm tắt cài đặt. Dựng trên <dl> gốc.",
    },
    body: {
      en: () =>
        datalistStage([
          ["Model", "claude-haiku-4-5"],
          ["Max tokens", "512"],
          ["Temperature", "0"],
          ["Status", '<span class="badge clear">READY</span>'],
        ]) +
        cb(
          `<dl class="datalist">
  <dt>Model</dt><dd>claude-haiku-4-5</dd>
  <dt>Max tokens</dt><dd>512</dd>
  <dt>Status</dt><dd><span class="badge clear">READY</span></dd>
</dl>`,
        ) +
h2("Parts") +
        api(["Element", "Role"], [
          ["<code>dl.datalist</code>", "the list"],
          ["<code>dt</code>", "the term / key (mono, muted)"],
          ["<code>dd</code>", "the value"],
        ]) +
                a11y(
          "Use native <code>&lt;dl&gt;</code>/<code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code> so the term–value pairing is exposed to assistive tech, not just visually aligned.",
        ),
      vi: () =>
        datalistStage([
          ["Model", "claude-haiku-4-5"],
          ["Max tokens", "512"],
          ["Nhiệt độ", "0"],
          ["Trạng thái", '<span class="badge clear">SẴN SÀNG</span>'],
        ]) +
        cb(
          `<dl class="datalist">
  <dt>Model</dt><dd>claude-haiku-4-5</dd>
  <dt>Max tokens</dt><dd>512</dd>
  <dt>Trạng thái</dt><dd><span class="badge clear">SẴN SÀNG</span></dd>
</dl>`,
        ) +
h2("Thành phần") +
        api(["Element", "Vai trò"], [
          ["<code>dl.datalist</code>", "danh sách"],
          ["<code>dt</code>", "khoá / term (mono, mờ)"],
          ["<code>dd</code>", "giá trị"],
        ]) +
                a11y(
          "Dùng <code>&lt;dl&gt;</code>/<code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code> gốc để cặp khoá–giá trị được công nghệ hỗ trợ hiểu, không chỉ canh hàng bằng mắt.",
        ),
    },
  },
  {
    id: "timeline",
    cat: "Data",
    name: "Timeline",
    desc: {
      en: "Vertical events on a connector line with square markers. Great for activity feeds and changelogs.",
      vi: "Chuỗi sự kiện dọc trên đường nối với marker vuông. Hợp cho activity feed và changelog.",
    },
    body: {
      en: () =>
        timelineStage([
          ["09:41", "Run started", "Config loaded, connection verified."],
          ["09:43", "Stage 1 clear", "+150 XP awarded."],
          ["09:47", "Shipped", "Deployed to production."],
        ]) +
        cb(
          `<ol class="timeline" data-accent="good">
  <li>
    <div class="time">09:41</div>
    <div class="title">Run started</div>
    <p>Config loaded, connection verified.</p>
  </li>
  <li>…</li>
</ol>`,
        ) +
h2("Parts") +
        api(["Class / element", "Role"], [
          ["<code>ol.timeline</code>", "the list — <code>data-accent</code> tints the line + markers"],
          ["<code>li</code>", "one event (square marker via <code>::before</code>)"],
          ["<code>.time</code>", "the timestamp"],
          ["<code>.title</code>", "the event title"],
        ]) +
                a11y(
          "An ordered list <code>&lt;ol&gt;</code> conveys sequence. The marker is decorative (<code>::before</code>) — the time and title carry the meaning.",
        ),
      vi: () =>
        timelineStage([
          ["09:41", "Bắt đầu chạy", "Đã nạp config, xác minh kết nối."],
          ["09:43", "Clear màn 1", "Cộng +150 XP."],
          ["09:47", "Đã ship", "Triển khai lên production."],
        ]) +
        cb(
          `<ol class="timeline" data-accent="good">
  <li>
    <div class="time">09:41</div>
    <div class="title">Bắt đầu chạy</div>
    <p>Đã nạp config, xác minh kết nối.</p>
  </li>
  <li>…</li>
</ol>`,
        ) +
h2("Thành phần") +
        api(["Class / element", "Vai trò"], [
          ["<code>ol.timeline</code>", "danh sách — <code>data-accent</code> tô đường + marker"],
          ["<code>li</code>", "một sự kiện (marker vuông qua <code>::before</code>)"],
          ["<code>.time</code>", "mốc thời gian"],
          ["<code>.title</code>", "tiêu đề sự kiện"],
        ]) +
                a11y(
          "Danh sách có thứ tự <code>&lt;ol&gt;</code> truyền tải trình tự. Marker chỉ trang trí (<code>::before</code>) — thời gian và tiêu đề mới tải nghĩa.",
        ),
    },
  },
  {
    id: "prose",
    cat: "Data",
    name: "Prose",
    desc: {
      en: "Drop rendered markdown / CMS HTML inside — it restores semantic rhythm, square bullets, and accent links.",
      vi: "Bỏ HTML markdown / CMS đã render vào — tự phục hồi nhịp, bullet vuông và link màu nhấn.",
    },
    body: {
      en: () =>
        proseStage("en") +
        cb(
          `<article class="prose">
  <h2>Heading</h2>
  <p>Body copy with a <a href="#">link</a> and <code>inline code</code>.</p>
  <ul><li>Square bullets</li><li>Restored from the reset</li></ul>
  <blockquote>A quiet aside.</blockquote>
</article>`,
        ) +
h2("API") +
        apiGroups({ attr: [["<code>data-accent</code>", "accent name", "—", "recolor links + list markers"]] }) +
        p("Styles the native elements inside it — <code>h1–h4</code>, <code>p</code>, <code>ul/ol</code> (square bullets), <code>a</code>, <code>code</code>, <code>blockquote</code>, <code>table</code>, <code>hr</code> — with no classes on the children.") +
                a11y(
          "Prose only styles what's inside it — headings, lists, and links keep their native semantics. Set <code>data-accent</code> on <code>.prose</code> to recolor links and markers.",
        ),
      vi: () =>
        proseStage("vi") +
        cb(
          `<article class="prose">
  <h2>Tiêu đề</h2>
  <p>Đoạn văn có <a href="#">link</a> và <code>inline code</code>.</p>
  <ul><li>Bullet vuông</li><li>Phục hồi từ reset</li></ul>
  <blockquote>Một ghi chú nhỏ.</blockquote>
</article>`,
        ) +
h2("API") +
        apiGroups({ attr: [["<code>data-accent</code>", "accent name", "—", "đổi màu link + marker list"]] }) +
        p("Style các element gốc bên trong — <code>h1–h4</code>, <code>p</code>, <code>ul/ol</code> (bullet vuông), <code>a</code>, <code>code</code>, <code>blockquote</code>, <code>table</code>, <code>hr</code> — không cần class trên con.") +
                a11y(
          "Prose chỉ style thứ bên trong nó — heading, list, link giữ ngữ nghĩa gốc. Đặt <code>data-accent</code> trên <code>.prose</code> để đổi màu link và marker.",
        ),
    },
  },
  {
    id: "tree",
    cat: "Data",
    name: "Tree",
    desc: {
      en: "Hierarchical folder/file list. Expand/collapse, single or multiple selection, full keyboard nav. Data via child JSON.",
      vi: "Danh sách phân cấp folder/file. Mở/gập, chọn một hoặc nhiều, điều hướng bàn phím đầy đủ. Dữ liệu qua JSON con.",
    },
    body: {
      en: () =>
        stage(
          "TREE",
          `<nes-tree name="path" aria-label="Project files" style="inline-size:100%;max-inline-size:min(340px,100%)">
            <script type="application/json">[
              {"label":"src","expanded":true,"children":[
                {"label":"index.ts"},
                {"label":"api","children":[{"label":"client.ts"},{"label":"types.ts"}]},
                {"label":"components","children":[{"label":"button.ts"}]}
              ]},
              {"label":"package.json","icon":"⚙"},
              {"label":"README.md"}
            ]</script>
          </nes-tree>`,
          "col",
        ) +
        cb(`<nes-tree name="path" aria-label="Project files">
  <script type="application/json">
    [{ "label": "src", "expanded": true, "children": [
        { "label": "index.ts" },
        { "label": "api", "children": [{ "label": "client.ts" }] }
    ]}]
  </script>
</nes-tree>`) +
        h2("API") +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "nodes: <code>{ label, value?, icon?, disabled?, expanded?, children? }[]</code>"]],
          attr: [
            ["<code>multiple</code>", "boolean", "<code>false</code>", "allow selecting many nodes at once"],
            ["<code>name</code>", "string", "—", "emit a hidden input carrying the comma-joined value(s)"],
            ["<code>value</code>", "string", "—", "initial selection(s), comma-separated"],
          ],
          prop: [["<code>.value</code>", "<code>string | string[] | null</code>", "<code>null</code>", "current selection(s) (read-only)"]],
          event: [
            ["<code>nes:change</code>", "<code>{ value }</code>", "—", "the selection changed"],
            ["<code>nes:toggle</code>", "<code>{ value, expanded }</code>", "—", "a folder expanded or collapsed"],
          ],
        }) +
        a11y(
          "Implements the ARIA <code>tree</code> pattern: <code>role=tree/treeitem/group</code>, <code>aria-expanded</code>, <code>aria-selected</code>, <code>aria-level</code>, roving <code>aria-activedescendant</code>. Keys: ↑/↓ move, → expand/enter, ← collapse/parent, Home/End, Enter/Space select.",
        ),
      vi: () =>
        stage(
          "TREE",
          `<nes-tree name="path" aria-label="File dự án" style="inline-size:100%;max-inline-size:min(340px,100%)">
            <script type="application/json">[
              {"label":"src","expanded":true,"children":[
                {"label":"index.ts"},
                {"label":"api","children":[{"label":"client.ts"},{"label":"types.ts"}]},
                {"label":"components","children":[{"label":"button.ts"}]}
              ]},
              {"label":"package.json","icon":"⚙"},
              {"label":"README.md"}
            ]</script>
          </nes-tree>`,
          "col",
        ) +
        cb(`<nes-tree name="path" aria-label="File dự án">
  <script type="application/json">
    [{ "label": "src", "expanded": true, "children": [
        { "label": "index.ts" },
        { "label": "api", "children": [{ "label": "client.ts" }] }
    ]}]
  </script>
</nes-tree>`) +
        h2("API") +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "node: <code>{ label, value?, icon?, disabled?, expanded?, children? }[]</code>"]],
          attr: [
            ["<code>multiple</code>", "boolean", "<code>false</code>", "cho chọn nhiều node cùng lúc"],
            ["<code>name</code>", "string", "—", "phát input ẩn chứa value nối bằng dấu phẩy"],
            ["<code>value</code>", "string", "—", "lựa chọn ban đầu, ngăn bằng dấu phẩy"],
          ],
          prop: [["<code>.value</code>", "<code>string | string[] | null</code>", "<code>null</code>", "lựa chọn hiện tại (chỉ đọc)"]],
          event: [
            ["<code>nes:change</code>", "<code>{ value }</code>", "—", "lựa chọn thay đổi"],
            ["<code>nes:toggle</code>", "<code>{ value, expanded }</code>", "—", "một folder mở hoặc gập"],
          ],
        }) +
        a11y(
          "Theo pattern ARIA <code>tree</code>: <code>role=tree/treeitem/group</code>, <code>aria-expanded</code>, <code>aria-selected</code>, <code>aria-level</code>, roving <code>aria-activedescendant</code>. Phím: ↑/↓ di chuyển, → mở/vào trong, ← gập/lên cha, Home/End, Enter/Space chọn.",
        ),
    },
  },

  /* -------------------------------------------------------- CHAT (AI) */
  {
    id: "chat",
    cat: "Chat",
    name: "Chat",
    desc: {
      en: "The chatbot shell: a flex column with a scrolling message area and a prompt pinned to the bottom. Compose it from the parts below.",
      vi: "Vỏ chatbot: cột flex với vùng tin nhắn cuộn được và ô nhập ghim ở đáy. Ghép từ các phần bên dưới.",
    },
    body: {
      en: () =>
        stage(
          "CHAT",
          `<div class="chat" style="block-size:280px;inline-size:100%;max-inline-size:min(460px,100%)">
            <nes-chat-messages>
              <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span>
                <div class="bubble">How can I help you build today?</div></div>
              <div class="msg user"><span class="avatar sm">TU</span>
                <div class="bubble">Scaffold a settings form.</div></div>
            </nes-chat-messages>
            <nes-chat-prompt placeholder="Message the agent…"></nes-chat-prompt>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="chat">
  <nes-chat-messages>
    <div class="msg assistant">…</div>
    <div class="msg user">…</div>
  </nes-chat-messages>
  <nes-chat-prompt placeholder="Message…"></nes-chat-prompt>
</div>`,
        ) +
        api(
          ["Part", "Role"],
          [
            ["<code>.chat</code>", "flex-column shell (give it a height)"],
            ["<code>&lt;nes-chat-messages&gt;</code>", "scrolling message list"],
            ["<code>&lt;nes-chat-prompt&gt;</code>", "the input, pinned to the bottom"],
          ],
        ),
      vi: () =>
        stage(
          "CHAT",
          `<div class="chat" style="block-size:280px;inline-size:100%;max-inline-size:min(460px,100%)">
            <nes-chat-messages>
              <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span>
                <div class="bubble">Mình giúp bạn build gì hôm nay?</div></div>
              <div class="msg user"><span class="avatar sm">TU</span>
                <div class="bubble">Dựng form cài đặt.</div></div>
            </nes-chat-messages>
            <nes-chat-prompt placeholder="Nhắn cho agent…"></nes-chat-prompt>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="chat">
  <nes-chat-messages>
    <div class="msg assistant">…</div>
    <div class="msg user">…</div>
  </nes-chat-messages>
  <nes-chat-prompt placeholder="Nhắn…"></nes-chat-prompt>
</div>`,
        ) +
        api(
          ["Phần", "Vai trò"],
          [
            ["<code>.chat</code>", "vỏ cột flex (cần đặt chiều cao)"],
            ["<code>&lt;nes-chat-messages&gt;</code>", "danh sách tin nhắn cuộn"],
            ["<code>&lt;nes-chat-prompt&gt;</code>", "ô nhập, ghim đáy"],
          ],
        ),
    },
  },
  {
    id: "chatmessages",
    cat: "Chat",
    name: "ChatMessages",
    desc: {
      en: "Scroll container that auto-sticks to the newest message while streaming — but won't yank the view if the reader scrolled up.",
      vi: "Vùng cuộn tự bám tin nhắn mới nhất khi đang stream — nhưng không giật màn hình nếu người đọc đã cuộn lên.",
    },
    body: {
      en: () =>
        stage(
          "CHATMESSAGES",
          `<nes-chat-messages style="block-size:200px;max-inline-size:min(460px,100%);border:var(--bw-2) solid var(--line-hi)">
            <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Line one.</div></div>
            <div class="msg user"><span class="avatar sm">TU</span><div class="bubble">Got it.</div></div>
            <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Streaming keeps this pinned to the bottom.</div></div>
          </nes-chat-messages>`,
          "col",
        ) +
        cb(
          `<nes-chat-messages>
  <div class="msg assistant">…</div>
  <div class="msg user">…</div>
</nes-chat-messages>`,
        ) +
        apiGroups({
          slot: [["default", "message rows (<code>.msg</code>) — any HTML you append"]],
          method: [["<code>.scrollToBottom()</code>", "<code>() → void</code>", "—", "force-scroll to the newest message (re-pins)"]],
        }) +
        note("Auto-pins to the bottom while streaming (a MutationObserver), but if the reader scrolled up &gt;80px new messages won't yank the view.") +
        a11y("Put an <code>aria-live=\"polite\"</code> region inside if you want new assistant text announced to screen readers."),
      vi: () =>
        stage(
          "CHATMESSAGES",
          `<nes-chat-messages style="block-size:200px;max-inline-size:min(460px,100%);border:var(--bw-2) solid var(--line-hi)">
            <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Dòng một.</div></div>
            <div class="msg user"><span class="avatar sm">TU</span><div class="bubble">Rõ.</div></div>
            <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Stream sẽ luôn ghim xuống đáy.</div></div>
          </nes-chat-messages>`,
          "col",
        ) +
        cb(
          `<nes-chat-messages>
  <div class="msg assistant">…</div>
  <div class="msg user">…</div>
</nes-chat-messages>`,
        ) +
        apiGroups({
          slot: [["mặc định", "các dòng tin (<code>.msg</code>) — HTML bạn append"]],
          method: [["<code>.scrollToBottom()</code>", "<code>() → void</code>", "—", "ép cuộn tới tin mới nhất (ghim lại)"]],
        }) +
        note("Tự ghim đáy khi stream (MutationObserver), nhưng nếu người đọc đã cuộn lên &gt;80px thì tin mới không giật màn hình.") +
        a11y("Đặt vùng <code>aria-live=\"polite\"</code> bên trong nếu muốn đọc tin assistant mới cho screen reader."),
    },
  },
  {
    id: "chatmessage",
    cat: "Chat",
    name: "ChatMessage",
    desc: {
      en: "One message row: an avatar + a square bubble. .assistant sits left on the panel; .user mirrors right and tints with the accent.",
      vi: "Một dòng tin: avatar + bong bóng vuông. .assistant bên trái nền panel; .user lật phải và nhuộm màu accent.",
    },
    body: {
      en: () =>
        stage(
          "CHATMESSAGE",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);inline-size:100%;max-inline-size:min(460px,100%)">
            <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">I can generate that component for you.</div></div>
            <div class="msg user"><span class="avatar sm">TU</span><div class="bubble">Yes please — square corners.</div></div>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="msg assistant">
  <span class="avatar sm">AI</span>
  <div class="bubble">…markdown or text…</div>
</div>
<div class="msg user"><span class="avatar sm">TU</span><div class="bubble">…</div></div>`,
        ) +
        api(
          ["Class", "Effect"],
          [
            ["<code>.msg</code>", "row: avatar + bubble"],
            ["<code>.msg.assistant</code>", "left aligned, panel bubble"],
            ["<code>.msg.user</code>", "mirrored right, accent-tinted bubble"],
            ["<code>.bubble</code>", "the square content box"],
          ],
        ),
      vi: () =>
        stage(
          "CHATMESSAGE",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);inline-size:100%;max-inline-size:min(460px,100%)">
            <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Mình tạo component đó cho bạn được.</div></div>
            <div class="msg user"><span class="avatar sm">TU</span><div class="bubble">Ừ — góc vuông nhé.</div></div>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="msg assistant">
  <span class="avatar sm">AI</span>
  <div class="bubble">…markdown hoặc text…</div>
</div>
<div class="msg user"><span class="avatar sm">TU</span><div class="bubble">…</div></div>`,
        ) +
        api(
          ["Class", "Tác dụng"],
          [
            ["<code>.msg</code>", "dòng: avatar + bubble"],
            ["<code>.msg.assistant</code>", "canh trái, bubble panel"],
            ["<code>.msg.user</code>", "lật phải, bubble nhuộm accent"],
            ["<code>.bubble</code>", "hộp nội dung vuông"],
          ],
        ),
    },
  },
  {
    id: "chatprompt",
    cat: "Chat",
    name: "ChatPrompt",
    desc: {
      en: "The input: an auto-growing textarea + send button. Enter sends, Shift+Enter = newline. Fires nes:submit with the text, then clears.",
      vi: "Ô nhập: textarea tự giãn + nút gửi. Enter gửi, Shift+Enter = xuống dòng. Bắn nes:submit kèm text rồi xóa.",
    },
    body: {
      en: () =>
        stage("CHATPROMPT", `<nes-chat-prompt placeholder="Message the agent…" style="inline-size:100%;max-inline-size:min(460px,100%)"></nes-chat-prompt>`, "col") +
        cb(
          `<nes-chat-prompt placeholder="Message…"></nes-chat-prompt>
<script type="module">
  document.querySelector("nes-chat-prompt")
    .addEventListener("nes:submit", (e) => send(e.detail.value));
</script>`,
        ) +
        apiGroups({
          attr: [
            ["<code>placeholder</code>", "string", "—", "textarea placeholder"],
            ["<code>busy</code>", "boolean", "<code>false</code>", "streaming → Send button becomes Stop"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "read / set the draft text"]],
          method: [
            ["<code>.setBusy(on)</code>", "<code>(boolean) → void</code>", "—", "toggle busy from JS"],
            ["<code>.focus()</code>", "<code>() → void</code>", "—", "focus the textarea"],
          ],
          event: [
            ["<code>nes:submit</code>", "<code>{ value }</code>", "—", "Enter or Send — then the field clears"],
            ["<code>nes:stop</code>", "<code>{}</code>", "—", "Stop pressed while busy"],
          ],
        }) +
        a11y("The textarea grows to fit and caps at 40vh; the button is a real <code>&lt;button&gt;</code> with an <code>aria-label</code> that flips Send↔Stop."),
      vi: () =>
        stage("CHATPROMPT", `<nes-chat-prompt placeholder="Nhắn cho agent…" style="inline-size:100%;max-inline-size:min(460px,100%)"></nes-chat-prompt>`, "col") +
        cb(
          `<nes-chat-prompt placeholder="Nhắn…"></nes-chat-prompt>
<script type="module">
  document.querySelector("nes-chat-prompt")
    .addEventListener("nes:submit", (e) => send(e.detail.value));
</script>`,
        ) +
        apiGroups({
          attr: [
            ["<code>placeholder</code>", "string", "—", "placeholder textarea"],
            ["<code>busy</code>", "boolean", "<code>false</code>", "đang stream → nút Gửi thành Dừng"],
          ],
          prop: [["<code>.value</code>", "string", '<code>""</code>', "đọc / gán bản nháp"]],
          method: [
            ["<code>.setBusy(on)</code>", "<code>(boolean) → void</code>", "—", "bật/tắt busy từ JS"],
            ["<code>.focus()</code>", "<code>() → void</code>", "—", "focus vào textarea"],
          ],
          event: [
            ["<code>nes:submit</code>", "<code>{ value }</code>", "—", "Enter hoặc Gửi — rồi ô tự xóa"],
            ["<code>nes:stop</code>", "<code>{}</code>", "—", "bấm Dừng khi đang busy"],
          ],
        }) +
        a11y("Textarea giãn theo nội dung, tối đa 40vh; nút là <code>&lt;button&gt;</code> thật với <code>aria-label</code> đổi Gửi↔Dừng."),
    },
  },
  {
    id: "chatpromptsubmit",
    cat: "Chat",
    name: "ChatPromptSubmit",
    desc: {
      en: "The send/stop button used inside ChatPrompt. Add .busy to turn the green send into a red stop. Usable standalone too.",
      vi: "Nút gửi/dừng dùng trong ChatPrompt. Thêm .busy để đổi nút gửi xanh thành dừng đỏ. Dùng riêng cũng được.",
    },
    body: {
      en: () =>
        stage(
          "CHATPROMPTSUBMIT",
          `<button class="chat-submit" aria-label="Send">▶</button>
           <button class="chat-submit busy" aria-label="Stop">■</button>`,
        ) +
        cb(`<button class="chat-submit" aria-label="Send">▶</button>
<button class="chat-submit busy" aria-label="Stop">■</button>`) +
        api(
          ["Class", "State"],
          [
            ["<code>.chat-submit</code>", "idle → accent (green) send"],
            ["<code>.chat-submit.busy</code>", "streaming → crit (red) stop"],
            ["<code>[disabled]</code>", "dimmed, not clickable"],
          ],
        ) +
        a11y("Always give it an <code>aria-label</code> (Send / Stop) — it is icon-only."),
      vi: () =>
        stage(
          "CHATPROMPTSUBMIT",
          `<button class="chat-submit" aria-label="Gửi">▶</button>
           <button class="chat-submit busy" aria-label="Dừng">■</button>`,
        ) +
        cb(`<button class="chat-submit" aria-label="Gửi">▶</button>
<button class="chat-submit busy" aria-label="Dừng">■</button>`) +
        api(
          ["Class", "Trạng thái"],
          [
            ["<code>.chat-submit</code>", "nghỉ → gửi accent (xanh)"],
            ["<code>.chat-submit.busy</code>", "đang stream → dừng crit (đỏ)"],
            ["<code>[disabled]</code>", "mờ, không bấm"],
          ],
        ) +
        a11y("Luôn cho <code>aria-label</code> (Gửi / Dừng) — nút chỉ có icon."),
    },
  },
  {
    id: "chatreasoning",
    cat: "Chat",
    name: "ChatReasoning",
    desc: {
      en: "A collapsed \"thinking\" block for reasoning tokens. Native <details> — zero JS. Dashed, mono, muted; the summary goes gold when open.",
      vi: "Khối \"suy nghĩ\" gập lại cho reasoning tokens. <details> gốc — không JS. Viền đứt, mono, mờ; summary chuyển gold khi mở.",
    },
    body: {
      en: () =>
        stage(
          "CHATREASONING",
          `<details class="reasoning" open style="inline-size:100%;max-inline-size:min(460px,100%)">
            <summary>Reasoning</summary>
            <div class="body">User wants a form. Prefer native controls, one accent, square corners…</div>
          </details>`,
          "col",
        ) +
        cb(
          `<details class="reasoning">
  <summary>Reasoning</summary>
  <div class="body">…chain-of-thought text…</div>
</details>`,
        ) +
        a11y("It's a native <code>&lt;details&gt;/&lt;summary&gt;</code>: keyboard-toggle and expanded-state come for free."),
      vi: () =>
        stage(
          "CHATREASONING",
          `<details class="reasoning" open style="inline-size:100%;max-inline-size:min(460px,100%)">
            <summary>Suy luận</summary>
            <div class="body">User muốn một form. Ưu tiên control gốc, một accent, góc vuông…</div>
          </details>`,
          "col",
        ) +
        cb(
          `<details class="reasoning">
  <summary>Suy luận</summary>
  <div class="body">…chuỗi suy nghĩ…</div>
</details>`,
        ) +
        a11y("Là <code>&lt;details&gt;/&lt;summary&gt;</code> gốc: toggle bàn phím và trạng thái mở có sẵn."),
    },
  },
  {
    id: "chattool",
    cat: "Chat",
    name: "ChatTool",
    desc: {
      en: "Shows a tool/function call: name + status badge in the summary, args/result in the body. Native <details>; status via a .badge.",
      vi: "Hiển thị lời gọi tool/function: tên + badge trạng thái ở summary, args/kết quả ở body. <details> gốc; trạng thái bằng .badge.",
    },
    body: {
      en: () =>
        stage(
          "CHATTOOL",
          `<details class="tool" open style="inline-size:100%;max-inline-size:min(460px,100%)">
            <summary><span class="tname">search_docs</span><span class="badge clear">done</span></summary>
            <div class="body">{ "query": "form module", "hits": 6 }</div>
          </details>`,
          "col",
        ) +
        cb(
          `<details class="tool">
  <summary><span class="tname">search_docs</span><span class="badge clear">done</span></summary>
  <div class="body">{ "query": "…", "hits": 6 }</div>
</details>`,
        ) +
        api(
          ["Piece", "Role"],
          [
            ["<code>.tool</code>", "the tool-call block"],
            ["<code>.tname</code>", "tool name (cyan / function hue)"],
            ["<code>.badge</code>", "status: <code>.warn</code> running · <code>.clear</code> done · <code>.crit</code> error"],
            ["<code>.body</code>", "args / result (mono, scrolls)"],
          ],
        ),
      vi: () =>
        stage(
          "CHATTOOL",
          `<details class="tool" open style="inline-size:100%;max-inline-size:min(460px,100%)">
            <summary><span class="tname">search_docs</span><span class="badge clear">done</span></summary>
            <div class="body">{ "query": "form module", "hits": 6 }</div>
          </details>`,
          "col",
        ) +
        cb(
          `<details class="tool">
  <summary><span class="tname">search_docs</span><span class="badge clear">done</span></summary>
  <div class="body">{ "query": "…", "hits": 6 }</div>
</details>`,
        ) +
        api(
          ["Phần", "Vai trò"],
          [
            ["<code>.tool</code>", "khối lời gọi tool"],
            ["<code>.tname</code>", "tên tool (cyan / màu function)"],
            ["<code>.badge</code>", "trạng thái: <code>.warn</code> chạy · <code>.clear</code> xong · <code>.crit</code> lỗi"],
            ["<code>.body</code>", "args / kết quả (mono, cuộn)"],
          ],
        ),
    },
  },
  {
    id: "chatshimmer",
    cat: "Chat",
    name: "ChatShimmer",
    desc: {
      en: "Streaming placeholder — a few shimmering lines shown while the assistant's first tokens are still on the way. Pure CSS.",
      vi: "Placeholder khi đang stream — vài dòng lấp lánh hiển thị trong lúc token đầu của assistant chưa tới. Thuần CSS.",
    },
    body: {
      en: () =>
        stage(
          "CHATSHIMMER",
          `<div class="msg assistant" style="max-inline-size:min(460px,100%)"><span class="avatar sm" data-accent="teal">AI</span>
            <div class="bubble" style="inline-size:220px"><div class="shimmer"><span></span><span></span><span></span></div></div>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="bubble">
  <div class="shimmer"><span></span><span></span><span></span></div>
</div>`,
        ) +
        a11y("Decorative — pair it with an <code>aria-live</code> status like \"Assistant is typing…\" for non-visual users."),
      vi: () =>
        stage(
          "CHATSHIMMER",
          `<div class="msg assistant" style="max-inline-size:min(460px,100%)"><span class="avatar sm" data-accent="teal">AI</span>
            <div class="bubble" style="inline-size:220px"><div class="shimmer"><span></span><span></span><span></span></div></div>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="bubble">
  <div class="shimmer"><span></span><span></span><span></span></div>
</div>`,
        ) +
        a11y("Chỉ trang trí — đi kèm một status <code>aria-live</code> như \"Assistant đang gõ…\" cho người dùng không nhìn màn hình."),
    },
  },
  {
    id: "chatpalette",
    cat: "Chat",
    name: "ChatPalette",
    desc: {
      en: "A framed chat panel for a modal or side-panel assistant: bordered surface with the messages area above and the prompt flush on the bottom edge.",
      vi: "Panel chat có khung cho assistant dạng modal hoặc side-panel: bề mặt viền, vùng tin nhắn ở trên và prompt sát mép đáy.",
    },
    body: {
      en: () =>
        stage(
          "CHATPALETTE",
          `<div class="chat-palette" style="block-size:300px;inline-size:100%;max-inline-size:min(420px,100%)">
            <nes-chat-messages>
              <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Ask me anything about the design system.</div></div>
              <div class="msg user"><span class="avatar sm">TU</span><div class="bubble">List the form components.</div></div>
            </nes-chat-messages>
            <nes-chat-prompt placeholder="Ask…"></nes-chat-prompt>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="chat-palette">
  <nes-chat-messages>…</nes-chat-messages>
  <nes-chat-prompt placeholder="Ask…"></nes-chat-prompt>
</div>`,
        ) +
        api(
          ["Class", "Role"],
          [
            ["<code>.chat-palette</code>", "bordered, elevated chat panel"],
            ["nested <code>.chat-messages</code>", "gets padding; scrolls"],
            ["nested <code>.chat-prompt</code>", "borderless, sits on the bottom edge"],
          ],
        ) +
        a11y("Drop it inside a <code>&lt;dialog class=\"modal\"&gt;</code> for a command-palette-style assistant; the dialog handles focus trap + Esc."),
      vi: () =>
        stage(
          "CHATPALETTE",
          `<div class="chat-palette" style="block-size:300px;inline-size:100%;max-inline-size:min(420px,100%)">
            <nes-chat-messages>
              <div class="msg assistant"><span class="avatar sm" data-accent="teal">AI</span><div class="bubble">Hỏi mình bất cứ gì về design system.</div></div>
              <div class="msg user"><span class="avatar sm">TU</span><div class="bubble">Liệt kê các form component.</div></div>
            </nes-chat-messages>
            <nes-chat-prompt placeholder="Hỏi…"></nes-chat-prompt>
          </div>`,
          "col",
        ) +
        cb(
          `<div class="chat-palette">
  <nes-chat-messages>…</nes-chat-messages>
  <nes-chat-prompt placeholder="Hỏi…"></nes-chat-prompt>
</div>`,
        ) +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.chat-palette</code>", "panel chat có viền, nổi khối"],
            ["<code>.chat-messages</code> lồng trong", "có padding; cuộn"],
            ["<code>.chat-prompt</code> lồng trong", "không viền, nằm sát mép đáy"],
          ],
        ) +
        a11y("Đặt trong <code>&lt;dialog class=\"modal\"&gt;</code> để làm assistant kiểu command-palette; dialog lo focus trap + Esc."),
    },
  },

  {
    id: "composer",
    cat: "Chat",
    name: "Composer",
    desc: {
      en: "The full prompt box — ChatGPT / Claude-Code style: attachment chips on top, a growing textarea, and a toolbar footer with icon actions, a model picker, a char hint and send.",
      vi: "Hộp nhập đầy đủ — kiểu ChatGPT / Claude-Code: chip đính kèm ở trên, textarea co giãn, và thanh công cụ đáy với nút icon, chọn model, đếm ký tự và gửi.",
    },
    body: {
      en: () =>
        stage(
          "COMPOSER",
          `<div class="composer" style="inline-size:100%;max-inline-size:min(560px,100%)">
             <div class="composer-attach">
               <span class="attach"><nes-icon name="file"></nes-icon><span class="attach-name">pricing-q3.pdf</span><span class="attach-size">240 KB</span><button class="attach-x" aria-label="Remove"><nes-icon name="close"></nes-icon></button></span>
               <span class="attach"><nes-icon name="image"></nes-icon><span class="attach-name">chart.png</span><span class="attach-size">88 KB</span><button class="attach-x" aria-label="Remove"><nes-icon name="close"></nes-icon></button></span>
             </div>
             <textarea rows="2" placeholder="Ask anything…">Summarise the attached pricing deck</textarea>
             <div class="composer-bar">
               <button class="btn ghost xs icon" aria-label="Attach file"><nes-icon name="paperclip"></nes-icon></button>
               <button class="btn ghost xs icon" aria-label="Add image"><nes-icon name="image"></nes-icon></button>
               <button class="btn ghost xs"><nes-icon name="cpu"></nes-icon> GPT-4o <nes-icon name="chevronDown"></nes-icon></button>
               <span class="composer-hint">42 / 8k</span>
               <button class="chat-submit" aria-label="Send"><nes-icon name="send"></nes-icon></button>
             </div>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="composer">
  <!-- optional attachment chips -->
  <div class="composer-attach">
    <span class="attach">
      <nes-icon name="file"></nes-icon>
      <span class="attach-name">pricing-q3.pdf</span>
      <span class="attach-size">240 KB</span>
      <button class="attach-x" aria-label="Remove"><nes-icon name="close"></nes-icon></button>
    </span>
  </div>

  <textarea rows="2" placeholder="Ask anything…"></textarea>

  <!-- toolbar: actions + model · left, hint + send · right -->
  <div class="composer-bar">
    <button class="btn ghost xs icon" aria-label="Attach file"><nes-icon name="paperclip"></nes-icon></button>
    <button class="btn ghost xs"><nes-icon name="cpu"></nes-icon> GPT-4o <nes-icon name="chevronDown"></nes-icon></button>
    <span class="composer-hint">0 / 8k</span>
    <button class="chat-submit" aria-label="Send"><nes-icon name="send"></nes-icon></button>
  </div>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.composer</code>", "the box — gold focus ring on <code>:focus-within</code>"],
            ["<code>.composer-attach</code>", "row of <code>.attach</code> chips (optional)"],
            ["<code>textarea</code>", "the prompt — grows to 40vh"],
            ["<code>.composer-bar</code>", "the toolbar footer"],
            ["<code>.composer-hint</code>", "char / token count — floats right, pushing send with it"],
            ["<code>.attach</code>", "one file pill — name ellipsizes, <code>.attach-x</code> removes it"],
          ],
        ) +
        note(
          `The send button is the same <code>.chat-submit</code> as <a href="#/chatpromptsubmit">ChatPromptSubmit</a> — add <code>.busy</code> to flip it to a stop while streaming. Actions are plain <code>.btn.ghost.xs</code>; the model picker can be a <a href="#/dropdown">Dropdown</a>.`,
        ) +
        a11y(
          `Give every icon button an <code>aria-label</code>. Submit on Enter, newline on Shift+Enter — but keep the visible send button for touch and screen readers.`,
        ),
      vi: () =>
        stage(
          "COMPOSER",
          `<div class="composer" style="inline-size:100%;max-inline-size:min(560px,100%)">
             <div class="composer-attach">
               <span class="attach"><nes-icon name="file"></nes-icon><span class="attach-name">pricing-q3.pdf</span><span class="attach-size">240 KB</span><button class="attach-x" aria-label="Xoá"><nes-icon name="close"></nes-icon></button></span>
               <span class="attach"><nes-icon name="image"></nes-icon><span class="attach-name">chart.png</span><span class="attach-size">88 KB</span><button class="attach-x" aria-label="Xoá"><nes-icon name="close"></nes-icon></button></span>
             </div>
             <textarea rows="2" placeholder="Hỏi bất cứ điều gì…">Tóm tắt bộ slide giá đính kèm</textarea>
             <div class="composer-bar">
               <button class="btn ghost xs icon" aria-label="Đính kèm file"><nes-icon name="paperclip"></nes-icon></button>
               <button class="btn ghost xs icon" aria-label="Thêm ảnh"><nes-icon name="image"></nes-icon></button>
               <button class="btn ghost xs"><nes-icon name="cpu"></nes-icon> GPT-4o <nes-icon name="chevronDown"></nes-icon></button>
               <span class="composer-hint">42 / 8k</span>
               <button class="chat-submit" aria-label="Gửi"><nes-icon name="send"></nes-icon></button>
             </div>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="composer">
  <!-- chip đính kèm (tuỳ chọn) -->
  <div class="composer-attach">
    <span class="attach">
      <nes-icon name="file"></nes-icon>
      <span class="attach-name">pricing-q3.pdf</span>
      <span class="attach-size">240 KB</span>
      <button class="attach-x" aria-label="Xoá"><nes-icon name="close"></nes-icon></button>
    </span>
  </div>

  <textarea rows="2" placeholder="Hỏi bất cứ điều gì…"></textarea>

  <!-- thanh: actions + model · trái, hint + gửi · phải -->
  <div class="composer-bar">
    <button class="btn ghost xs icon" aria-label="Đính kèm file"><nes-icon name="paperclip"></nes-icon></button>
    <button class="btn ghost xs"><nes-icon name="cpu"></nes-icon> GPT-4o <nes-icon name="chevronDown"></nes-icon></button>
    <span class="composer-hint">0 / 8k</span>
    <button class="chat-submit" aria-label="Gửi"><nes-icon name="send"></nes-icon></button>
  </div>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.composer</code>", "hộp — viền focus vàng khi <code>:focus-within</code>"],
            ["<code>.composer-attach</code>", "hàng chip <code>.attach</code> (tuỳ chọn)"],
            ["<code>textarea</code>", "ô nhập — co giãn tới 40vh"],
            ["<code>.composer-bar</code>", "thanh công cụ đáy"],
            ["<code>.composer-hint</code>", "đếm ký tự / token — dạt phải, đẩy nút gửi theo"],
            ["<code>.attach</code>", "một pill file — tên rút gọn, <code>.attach-x</code> để xoá"],
          ],
        ) +
        note(
          `Nút gửi chính là <code>.chat-submit</code> như <a href="#/chatpromptsubmit">ChatPromptSubmit</a> — thêm <code>.busy</code> để đổi thành nút dừng khi đang stream. Actions là <code>.btn.ghost.xs</code> thường; ô chọn model có thể là <a href="#/dropdown">Dropdown</a>.`,
        ) +
        a11y(
          `Đặt <code>aria-label</code> cho mọi nút icon. Enter để gửi, Shift+Enter xuống dòng — nhưng giữ nút gửi hiện rõ cho cảm ứng và screen reader.`,
        ),
    },
  },
  {
    id: "suggestions",
    cat: "Chat",
    name: "Suggestions",
    desc: {
      en: "Prompt starters on an empty chat, or follow-up chips after an answer — a wrap of tap-to-send pills that guide the next turn.",
      vi: "Gợi ý mở đầu khi chat trống, hoặc chip follow-up sau câu trả lời — một hàng pill bấm-để-gửi dẫn lượt tiếp theo.",
    },
    body: {
      en: () =>
        stage(
          "SUGGEST",
          `<div class="suggest" style="max-inline-size:min(560px,100%)">
             <button class="suggest-item">Explain the pricing tiers <nes-icon name="arrowRight"></nes-icon></button>
             <button class="suggest-item">Draft a follow-up email <nes-icon name="arrowRight"></nes-icon></button>
             <button class="suggest-item">Compare with competitors <nes-icon name="arrowRight"></nes-icon></button>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="suggest">
  <button class="suggest-item">Explain the pricing tiers <nes-icon name="arrowRight"></nes-icon></button>
  <button class="suggest-item">Draft a follow-up email <nes-icon name="arrowRight"></nes-icon></button>
  <button class="suggest-item">Compare with competitors <nes-icon name="arrowRight"></nes-icon></button>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.suggest</code>", "the wrap row"],
            ["<code>button.suggest-item</code>", "one starter / follow-up — hook it to fill or submit the prompt"],
          ],
        ) +
        note(
          `Real <code>&lt;button&gt;</code>s, so a click can fill the composer or submit straight away. For big empty-state starter <em>cards</em>, use a <a href="#/card">Card</a> grid instead.`,
        ) +
        a11y(
          `The buttons are keyboard- and screen-reader-ready. Sitting above an empty chat, a short <code>&lt;h2&gt;</code> like "Try asking…" gives them context.`,
        ),
      vi: () =>
        stage(
          "SUGGEST",
          `<div class="suggest" style="max-inline-size:min(560px,100%)">
             <button class="suggest-item">Giải thích các gói giá <nes-icon name="arrowRight"></nes-icon></button>
             <button class="suggest-item">Soạn email theo sau <nes-icon name="arrowRight"></nes-icon></button>
             <button class="suggest-item">So sánh với đối thủ <nes-icon name="arrowRight"></nes-icon></button>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="suggest">
  <button class="suggest-item">Giải thích các gói giá <nes-icon name="arrowRight"></nes-icon></button>
  <button class="suggest-item">Soạn email theo sau <nes-icon name="arrowRight"></nes-icon></button>
  <button class="suggest-item">So sánh với đối thủ <nes-icon name="arrowRight"></nes-icon></button>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.suggest</code>", "hàng wrap"],
            ["<code>button.suggest-item</code>", "một gợi ý / follow-up — gắn để điền hoặc gửi prompt"],
          ],
        ) +
        note(
          `Là <code>&lt;button&gt;</code> thật, nên click có thể điền vào composer hoặc gửi ngay. Nếu muốn <em>card</em> gợi ý lớn cho empty-state, dùng lưới <a href="#/card">Card</a>.`,
        ) +
        a11y(
          `Nút sẵn sàng cho bàn phím + screen reader. Đặt trên chat trống, một <code>&lt;h2&gt;</code> ngắn như "Thử hỏi…" cho ngữ cảnh.`,
        ),
    },
  },
  {
    id: "citations",
    cat: "Chat",
    name: "Citations",
    desc: {
      en: "Grounded answers: an inline [n] marker in the prose that links down to a numbered sources list under the message. Zero JS — the marker jumps to a matching id.",
      vi: "Câu trả lời có dẫn nguồn: marker [n] trong đoạn văn liên kết xuống danh sách nguồn đánh số dưới tin nhắn. Không JS — marker nhảy tới id trùng.",
    },
    body: {
      en: () =>
        stage(
          "CITE",
          `<div style="max-inline-size:min(560px,100%)">
             <p style="color:var(--text);margin:0 0 var(--sp-2)">API pricing rose about 12% quarter-over-quarter<a class="cite" href="#s1" aria-label="Source 1">1</a>, driven mostly by the new tool-use tier<a class="cite" href="#s2" aria-label="Source 2">2</a>.</p>
             <ol class="sources">
               <li class="source" id="s1"><span class="source-n">1</span><a class="source-title" href="#">Q3 2025 Pricing Update</a><span class="source-host">stripe.com</span></li>
               <li class="source" id="s2"><span class="source-n">2</span><a class="source-title" href="#">Tool-use billing explained</a><span class="source-host">docs.example.com</span></li>
             </ol>
           </div>`,
          "col",
        ) +
        cb(
          `<p>API pricing rose about 12%<a class="cite" href="#s1" aria-label="Source 1">1</a>.</p>

<ol class="sources">
  <li class="source" id="s1">
    <span class="source-n">1</span>
    <a class="source-title" href="…">Q3 2025 Pricing Update</a>
    <span class="source-host">stripe.com</span>
  </li>
</ol>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>a.cite</code>", "inline [n] marker — <code>href=\"#s1\"</code> jumps to its source"],
            ["<code>ol.sources</code>", "the numbered list under the message"],
            ["<code>li.source</code>", "one source — give it a matching <code>id</code>"],
            ["<code>.source-n</code>", "the index box"],
            ["<code>.source-title</code>", "the linked title"],
            ["<code>.source-host</code>", "the domain / origin"],
          ],
        ) +
        note(
          `Match each <code>.cite</code>'s <code>href="#s1"</code> to a <code>.source</code> <code>id="s1"</code> — clicking a marker scrolls to its source with zero JavaScript.`,
        ) +
        a11y(
          `Number markers in reading order and mirror them in the list. Label each marker (<code>aria-label="Source 1"</code>) so it doesn't read as a bare "1".`,
        ),
      vi: () =>
        stage(
          "CITE",
          `<div style="max-inline-size:min(560px,100%)">
             <p style="color:var(--text);margin:0 0 var(--sp-2)">Giá API tăng khoảng 12% so với quý trước<a class="cite" href="#s1" aria-label="Nguồn 1">1</a>, chủ yếu do gói tool-use mới<a class="cite" href="#s2" aria-label="Nguồn 2">2</a>.</p>
             <ol class="sources">
               <li class="source" id="s1"><span class="source-n">1</span><a class="source-title" href="#">Cập nhật giá Q3 2025</a><span class="source-host">stripe.com</span></li>
               <li class="source" id="s2"><span class="source-n">2</span><a class="source-title" href="#">Giải thích tính phí tool-use</a><span class="source-host">docs.example.com</span></li>
             </ol>
           </div>`,
          "col",
        ) +
        cb(
          `<p>Giá API tăng khoảng 12%<a class="cite" href="#s1" aria-label="Nguồn 1">1</a>.</p>

<ol class="sources">
  <li class="source" id="s1">
    <span class="source-n">1</span>
    <a class="source-title" href="…">Cập nhật giá Q3 2025</a>
    <span class="source-host">stripe.com</span>
  </li>
</ol>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>a.cite</code>", "marker [n] inline — <code>href=\"#s1\"</code> nhảy tới nguồn"],
            ["<code>ol.sources</code>", "danh sách đánh số dưới tin nhắn"],
            ["<code>li.source</code>", "một nguồn — gắn <code>id</code> trùng"],
            ["<code>.source-n</code>", "ô số thứ tự"],
            ["<code>.source-title</code>", "tiêu đề có link"],
            ["<code>.source-host</code>", "tên miền / nguồn gốc"],
          ],
        ) +
        note(
          `Khớp <code>href="#s1"</code> của mỗi <code>.cite</code> với <code>id="s1"</code> của <code>.source</code> — bấm marker sẽ cuộn tới nguồn, không cần JavaScript.`,
        ) +
        a11y(
          `Đánh số marker theo thứ tự đọc và lặp lại trong danh sách. Gắn nhãn mỗi marker (<code>aria-label="Nguồn 1"</code>) để không đọc trơ thành "1".`,
        ),
    },
  },

  /* -------------------------------------------------------- AGENTS */
  {
    id: "agent",
    cat: "Agents",
    name: "Agent",
    desc: {
      en: "One agent in a multi-agent crew: a status light, name + model, and its current task. Drive the light with data-state — thinking / running blink live.",
      vi: "Một agent trong đội multi-agent: đèn trạng thái, tên + model, và việc đang làm. Điều khiển đèn bằng data-state — thinking / running nhấp nháy trực tiếp.",
    },
    body: {
      en: () =>
        stage(
          "AGENTS",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);inline-size:100%;max-inline-size:min(460px,100%)">
             <article class="agent" data-state="running"><div class="agent-head"><b class="agent-name">Researcher</b><span class="agent-role">gpt-4o · tools</span></div><p class="agent-task">Searching the web for Q3 pricing data…</p></article>
             <article class="agent" data-state="thinking"><div class="agent-head"><b class="agent-name">Planner</b><span class="agent-role">o1 · reasoning</span></div><p class="agent-task">Breaking the goal into subtasks…</p></article>
             <article class="agent" data-state="done"><div class="agent-head"><b class="agent-name">Writer</b><span class="agent-role">claude · draft</span></div><p class="agent-task">Draft ready — 620 words.</p></article>
             <article class="agent" data-state="error"><div class="agent-head"><b class="agent-name">Deployer</b><span class="agent-role">shell</span></div><p class="agent-task">Build failed: exit code 1.</p></article>
             <article class="agent" data-state="queued"><div class="agent-head"><b class="agent-name">Reviewer</b><span class="agent-role">idle</span></div><p class="agent-task">Waiting for the draft…</p></article>
           </div>`,
          "col",
        ) +
        cb(
          `<article class="agent" data-state="running">
  <div class="agent-head">
    <b class="agent-name">Researcher</b>
    <span class="agent-role">gpt-4o · tools</span>
  </div>
  <p class="agent-task">Searching the web for Q3 pricing data…</p>
</article>`,
        ) +
        h2("States") +
        api(
          ["<code>data-state</code>", "Light"],
          [
            ["<code>queued</code>", "steel — waiting to start"],
            ["<code>thinking</code>", "gold, blinking — reasoning"],
            ["<code>running</code>", "green, blinking — executing / tool call"],
            ["<code>done</code>", "green — finished"],
            ["<code>error</code>", "red — failed / blocked"],
            ["<code>(none)</code>", "dim — idle"],
          ],
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>article.agent</code>", "the card — <code>data-state</code> sets the light + left bar"],
            ["<code>.agent-head</code>", "name + model on one line"],
            ["<code>.agent-name</code>", "agent name (mono, uppercase)"],
            ["<code>.agent-role</code>", "model / role / mode hint"],
            ["<code>.agent-task</code>", "what it's doing right now"],
          ],
        ) +
        note(
          `Stack agents in a <code>.grid-cards</code> or a plain column for the whole crew. The state vocabulary is shared with <a href="#/trace">Trace</a>, so "running" reads the same across the UI.`,
        ) +
        a11y(
          `The light is colour + motion, so keep the state in text too (the <code>.agent-task</code> or an <code>aria-label</code>). For a live roster, wrap it in <code>aria-live="polite"</code> so status changes are announced.`,
        ),
      vi: () =>
        stage(
          "AGENTS",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);inline-size:100%;max-inline-size:min(460px,100%)">
             <article class="agent" data-state="running"><div class="agent-head"><b class="agent-name">Researcher</b><span class="agent-role">gpt-4o · tools</span></div><p class="agent-task">Đang tìm dữ liệu giá Q3 trên web…</p></article>
             <article class="agent" data-state="thinking"><div class="agent-head"><b class="agent-name">Planner</b><span class="agent-role">o1 · reasoning</span></div><p class="agent-task">Đang chia mục tiêu thành các subtask…</p></article>
             <article class="agent" data-state="done"><div class="agent-head"><b class="agent-name">Writer</b><span class="agent-role">claude · draft</span></div><p class="agent-task">Bản nháp xong — 620 từ.</p></article>
             <article class="agent" data-state="error"><div class="agent-head"><b class="agent-name">Deployer</b><span class="agent-role">shell</span></div><p class="agent-task">Build lỗi: exit code 1.</p></article>
             <article class="agent" data-state="queued"><div class="agent-head"><b class="agent-name">Reviewer</b><span class="agent-role">idle</span></div><p class="agent-task">Đang chờ bản nháp…</p></article>
           </div>`,
          "col",
        ) +
        cb(
          `<article class="agent" data-state="running">
  <div class="agent-head">
    <b class="agent-name">Researcher</b>
    <span class="agent-role">gpt-4o · tools</span>
  </div>
  <p class="agent-task">Đang tìm dữ liệu giá Q3 trên web…</p>
</article>`,
        ) +
        h2("Trạng thái") +
        api(
          ["<code>data-state</code>", "Đèn"],
          [
            ["<code>queued</code>", "steel — chờ bắt đầu"],
            ["<code>thinking</code>", "gold, nhấp nháy — đang suy luận"],
            ["<code>running</code>", "green, nhấp nháy — đang chạy / gọi tool"],
            ["<code>done</code>", "green — xong"],
            ["<code>error</code>", "red — lỗi / bị chặn"],
            ["<code>(không có)</code>", "dim — nhàn rỗi"],
          ],
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>article.agent</code>", "thẻ — <code>data-state</code> đặt đèn + thanh trái"],
            ["<code>.agent-head</code>", "tên + model trên một dòng"],
            ["<code>.agent-name</code>", "tên agent (mono, hoa)"],
            ["<code>.agent-role</code>", "gợi ý model / vai trò / chế độ"],
            ["<code>.agent-task</code>", "việc đang làm ngay lúc này"],
          ],
        ) +
        note(
          `Xếp agent vào <code>.grid-cards</code> hoặc một cột thường để hiện cả đội. Bộ trạng thái dùng chung với <a href="#/trace">Trace</a>, nên "running" đọc giống nhau khắp UI.`,
        ) +
        a11y(
          `Đèn là màu + chuyển động, nên giữ trạng thái trong chữ nữa (<code>.agent-task</code> hoặc <code>aria-label</code>). Với roster trực tiếp, bọc <code>aria-live="polite"</code> để thông báo thay đổi.`,
        ),
    },
  },
  {
    id: "usage",
    cat: "Agents",
    name: "Context usage",
    desc: {
      en: "A stacked token-budget bar — see how the context window is spent across system, history, tools and response, and how much is still free.",
      vi: "Thanh ngân sách token xếp lớp — thấy context window đang dùng cho system, history, tools, response bao nhiêu, và còn trống bao nhiêu.",
    },
    body: {
      en: () =>
        stage(
          "CONTEXT",
          `<div class="usage" style="inline-size:100%;max-inline-size:min(460px,100%)">
             <div class="usage-bar">
               <span data-accent="cyan" style="--seg:30%"></span>
               <span data-accent="blue" style="--seg:20%"></span>
               <span data-accent="gold" style="--seg:10%"></span>
               <span data-accent="good" style="--seg:6%"></span>
             </div>
             <div class="usage-meta"><span>84.5k / 128k tokens</span><span>66%</span></div>
             <div class="legend">
               <span class="legend-item" data-accent="cyan">System</span>
               <span class="legend-item" data-accent="blue">History</span>
               <span class="legend-item" data-accent="gold">Tools</span>
               <span class="legend-item" data-accent="good">Response</span>
             </div>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="usage">
  <div class="usage-bar">
    <span data-accent="cyan" style="--seg:30%"></span>  <!-- system -->
    <span data-accent="blue" style="--seg:20%"></span>  <!-- history -->
    <span data-accent="gold" style="--seg:10%"></span>  <!-- tools -->
    <span data-accent="good" style="--seg:6%"></span>   <!-- response -->
  </div>
  <div class="usage-meta"><span>84.5k / 128k tokens</span><span>66%</span></div>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.usage</code>", "wrapper (bar + meta + legend, stacked)"],
            ["<code>.usage-bar</code>", "the track — leftover space = free window"],
            ["<code>.usage-bar &gt; span</code>", "one slice: <code>--seg</code> width, <code>data-accent</code> colour"],
            ["<code>.usage-meta</code>", "readout row (used / total, percent)"],
          ],
        ) +
        note(
          `Widths are yours to compute — set each slice with <code>style="--seg:30%"</code> (percent of the whole window). Label the slices with the shared <a href="#/legend">Legend</a>.`,
        ) +
        a11y(
          `The bar is decorative; the <code>.usage-meta</code> numbers carry the value. For richer support add <code>role="img"</code> + an <code>aria-label</code> like "66% of context used".`,
        ),
      vi: () =>
        stage(
          "CONTEXT",
          `<div class="usage" style="inline-size:100%;max-inline-size:min(460px,100%)">
             <div class="usage-bar">
               <span data-accent="cyan" style="--seg:30%"></span>
               <span data-accent="blue" style="--seg:20%"></span>
               <span data-accent="gold" style="--seg:10%"></span>
               <span data-accent="good" style="--seg:6%"></span>
             </div>
             <div class="usage-meta"><span>84.5k / 128k tokens</span><span>66%</span></div>
             <div class="legend">
               <span class="legend-item" data-accent="cyan">System</span>
               <span class="legend-item" data-accent="blue">History</span>
               <span class="legend-item" data-accent="gold">Tools</span>
               <span class="legend-item" data-accent="good">Response</span>
             </div>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="usage">
  <div class="usage-bar">
    <span data-accent="cyan" style="--seg:30%"></span>  <!-- system -->
    <span data-accent="blue" style="--seg:20%"></span>  <!-- history -->
    <span data-accent="gold" style="--seg:10%"></span>  <!-- tools -->
    <span data-accent="good" style="--seg:6%"></span>   <!-- response -->
  </div>
  <div class="usage-meta"><span>84.5k / 128k tokens</span><span>66%</span></div>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.usage</code>", "bọc ngoài (bar + meta + legend, xếp dọc)"],
            ["<code>.usage-bar</code>", "thanh — phần trống còn lại = cửa sổ trống"],
            ["<code>.usage-bar &gt; span</code>", "một lát: rộng <code>--seg</code>, màu <code>data-accent</code>"],
            ["<code>.usage-meta</code>", "dòng số (đã dùng / tổng, phần trăm)"],
          ],
        ) +
        note(
          `Chiều rộng do bạn tính — đặt mỗi lát bằng <code>style="--seg:30%"</code> (phần trăm của cả cửa sổ). Gắn nhãn các lát bằng <a href="#/legend">Legend</a> dùng chung.`,
        ) +
        a11y(
          `Thanh chỉ trang trí; số ở <code>.usage-meta</code> mới tải giá trị. Muốn hỗ trợ kỹ hơn, thêm <code>role="img"</code> + <code>aria-label</code> như "đã dùng 66% context".`,
        ),
    },
  },
  {
    id: "trace",
    cat: "Agents",
    name: "Trace",
    desc: {
      en: "A vertical run trace — what the agent planned, which tools it called, and the result. Marks share the run-state colours; wrap any step in <details> for zero-JS expand of the tool I/O.",
      vi: "Trace chạy dọc — agent lên kế hoạch gì, gọi tool nào, kết quả ra sao. Marker dùng chung màu run-state; bọc bước bất kỳ trong <details> để mở rộng I/O của tool không cần JS.",
    },
    body: {
      en: () =>
        stage(
          "TRACE",
          `<ol class="trace" style="inline-size:100%;max-inline-size:min(520px,100%)">
             <li class="trace-step" data-state="done"><span class="trace-label">Plan</span><span class="trace-meta">·0.4s</span><div class="trace-detail">Split into: search → summarise → cite.</div></li>
             <li class="trace-step" data-state="done"><details><summary><nes-icon name="chevronRight" class="trace-caret"></nes-icon><span class="trace-label">web.search</span><span class="trace-meta">·1.2s · 3 hits</span></summary><div class="trace-detail">query: "Q3 2025 API pricing" → 3 results from 2 domains</div></details></li>
             <li class="trace-step" data-state="running"><span class="trace-label">summarise</span><span class="trace-meta">·running</span></li>
             <li class="trace-step" data-state="queued"><span class="trace-label">cite sources</span><span class="trace-meta">·queued</span></li>
           </ol>`,
          "col",
        ) +
        cb(
          `<ol class="trace">
  <li class="trace-step" data-state="done">
    <span class="trace-label">Plan</span> <span class="trace-meta">·0.4s</span>
    <div class="trace-detail">Split into: search → summarise → cite.</div>
  </li>

  <!-- collapsible step: native <details>, zero JS -->
  <li class="trace-step" data-state="done">
    <details>
      <summary>
        <nes-icon name="chevronRight" class="trace-caret"></nes-icon>
        <span class="trace-label">web.search</span>
        <span class="trace-meta">·1.2s · 3 hits</span>
      </summary>
      <div class="trace-detail">query: "Q3 2025 API pricing" → 3 results</div>
    </details>
  </li>

  <li class="trace-step" data-state="running">
    <span class="trace-label">summarise</span> <span class="trace-meta">·running</span>
  </li>
</ol>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>ol.trace</code>", "the run — a vertical connector line"],
            ["<code>li.trace-step</code>", "one step — <code>data-state</code> colours the mark"],
            ["<code>.trace-label</code>", "step / tool name"],
            ["<code>.trace-meta</code>", "duration, tokens, status hint"],
            ["<code>.trace-detail</code>", "the body — args, output, thought"],
            ["<code>details</code> + <code>.trace-caret</code>", "wrap a step to expand it (no JS); the caret rotates"],
          ],
        ) +
        note(
          `<code>data-state</code> uses the same vocabulary as <a href="#/agent">Agent</a> — queued / thinking / running / done / error. Collapse is native <code>&lt;details&gt;</code>, so it works with zero JavaScript.`,
        ) +
        a11y(
          `An <code>&lt;ol&gt;</code> conveys order; <code>&lt;details&gt;</code> is keyboard-toggleable for free. The mark is decorative — keep the state in <code>.trace-meta</code> text.`,
        ),
      vi: () =>
        stage(
          "TRACE",
          `<ol class="trace" style="inline-size:100%;max-inline-size:min(520px,100%)">
             <li class="trace-step" data-state="done"><span class="trace-label">Plan</span><span class="trace-meta">·0.4s</span><div class="trace-detail">Chia thành: search → summarise → cite.</div></li>
             <li class="trace-step" data-state="done"><details><summary><nes-icon name="chevronRight" class="trace-caret"></nes-icon><span class="trace-label">web.search</span><span class="trace-meta">·1.2s · 3 hits</span></summary><div class="trace-detail">query: "Q3 2025 API pricing" → 3 kết quả từ 2 domain</div></details></li>
             <li class="trace-step" data-state="running"><span class="trace-label">summarise</span><span class="trace-meta">·running</span></li>
             <li class="trace-step" data-state="queued"><span class="trace-label">cite sources</span><span class="trace-meta">·queued</span></li>
           </ol>`,
          "col",
        ) +
        cb(
          `<ol class="trace">
  <li class="trace-step" data-state="done">
    <span class="trace-label">Plan</span> <span class="trace-meta">·0.4s</span>
    <div class="trace-detail">Chia thành: search → summarise → cite.</div>
  </li>

  <!-- bước gập được: <details> gốc, không JS -->
  <li class="trace-step" data-state="done">
    <details>
      <summary>
        <nes-icon name="chevronRight" class="trace-caret"></nes-icon>
        <span class="trace-label">web.search</span>
        <span class="trace-meta">·1.2s · 3 hits</span>
      </summary>
      <div class="trace-detail">query: "Q3 2025 API pricing" → 3 kết quả</div>
    </details>
  </li>

  <li class="trace-step" data-state="running">
    <span class="trace-label">summarise</span> <span class="trace-meta">·running</span>
  </li>
</ol>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>ol.trace</code>", "lượt chạy — đường nối dọc"],
            ["<code>li.trace-step</code>", "một bước — <code>data-state</code> tô marker"],
            ["<code>.trace-label</code>", "tên bước / tool"],
            ["<code>.trace-meta</code>", "thời lượng, token, gợi ý trạng thái"],
            ["<code>.trace-detail</code>", "phần thân — args, output, suy nghĩ"],
            ["<code>details</code> + <code>.trace-caret</code>", "bọc để mở rộng (không JS); caret xoay"],
          ],
        ) +
        note(
          `<code>data-state</code> dùng chung bộ từ với <a href="#/agent">Agent</a> — queued / thinking / running / done / error. Gập bằng <code>&lt;details&gt;</code> gốc nên không cần JavaScript.`,
        ) +
        a11y(
          `<code>&lt;ol&gt;</code> truyền tải thứ tự; <code>&lt;details&gt;</code> gập được bằng bàn phím sẵn. Marker chỉ trang trí — giữ trạng thái trong chữ <code>.trace-meta</code>.`,
        ),
    },
  },
  {
    id: "feedback",
    cat: "Agents",
    name: "Feedback bar",
    desc: {
      en: "The bar under an AI response: rate / copy / regenerate on the left, run metrics (model · tokens · latency) on the right. Closes the human-in-the-loop.",
      vi: "Thanh dưới câu trả lời AI: đánh giá / chép / tạo lại bên trái, chỉ số run (model · token · độ trễ) bên phải. Đóng vòng human-in-the-loop.",
    },
    body: {
      en: () =>
        stage(
          "FEEDBACK",
          `<div style="inline-size:100%;max-inline-size:min(560px,100%)">
             <p style="color:var(--muted);margin:0">Here's a summary of the three pricing tiers and which fits a solo studio…</p>
             <div class="feedback">
               <div class="feedback-actions">
                 <button class="btn ghost xs icon" aria-label="Good" aria-pressed="true"><nes-icon name="thumbsUp"></nes-icon></button>
                 <button class="btn ghost xs icon" aria-label="Bad"><nes-icon name="thumbsDown"></nes-icon></button>
                 <button class="btn ghost xs icon" aria-label="Copy"><nes-icon name="copy"></nes-icon></button>
                 <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Regenerate</button>
               </div>
               <div class="feedback-meta"><span class="chip">gpt-4o</span><span>1,240 tok</span><span>·2.1s</span></div>
             </div>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="feedback">
  <div class="feedback-actions">
    <button class="btn ghost xs icon" aria-label="Good" aria-pressed="true">
      <nes-icon name="thumbsUp"></nes-icon>
    </button>
    <button class="btn ghost xs icon" aria-label="Bad"><nes-icon name="thumbsDown"></nes-icon></button>
    <button class="btn ghost xs icon" aria-label="Copy"><nes-icon name="copy"></nes-icon></button>
    <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Regenerate</button>
  </div>
  <div class="feedback-meta">
    <span class="chip">gpt-4o</span><span>1,240 tok</span><span>·2.1s</span>
  </div>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.feedback</code>", "the bar — top divider, actions + meta"],
            ["<code>.feedback-actions</code>", "buttons — plain <code>.btn.ghost.xs</code>"],
            ["<code>.feedback-meta</code>", "right-aligned run metrics"],
          ],
        ) +
        note(
          `Lock a rating in with <code>aria-pressed="true"</code> on the chosen thumb — it fills with the accent. The actions are ordinary buttons, so a <a href="#/button">button group</a> fuses them into one bar too.`,
        ) +
        a11y(
          `Every control is a real <code>&lt;button&gt;</code> with an <code>aria-label</code>; the icons are decorative. Use <code>aria-pressed</code> on the thumbs so the rating state is exposed to assistive tech.`,
        ),
      vi: () =>
        stage(
          "FEEDBACK",
          `<div style="inline-size:100%;max-inline-size:min(560px,100%)">
             <p style="color:var(--muted);margin:0">Đây là tóm tắt ba gói giá và gói nào hợp cho studio một người…</p>
             <div class="feedback">
               <div class="feedback-actions">
                 <button class="btn ghost xs icon" aria-label="Tốt" aria-pressed="true"><nes-icon name="thumbsUp"></nes-icon></button>
                 <button class="btn ghost xs icon" aria-label="Chưa tốt"><nes-icon name="thumbsDown"></nes-icon></button>
                 <button class="btn ghost xs icon" aria-label="Chép"><nes-icon name="copy"></nes-icon></button>
                 <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Tạo lại</button>
               </div>
               <div class="feedback-meta"><span class="chip">gpt-4o</span><span>1,240 tok</span><span>·2.1s</span></div>
             </div>
           </div>`,
          "col",
        ) +
        cb(
          `<div class="feedback">
  <div class="feedback-actions">
    <button class="btn ghost xs icon" aria-label="Tốt" aria-pressed="true">
      <nes-icon name="thumbsUp"></nes-icon>
    </button>
    <button class="btn ghost xs icon" aria-label="Chưa tốt"><nes-icon name="thumbsDown"></nes-icon></button>
    <button class="btn ghost xs icon" aria-label="Chép"><nes-icon name="copy"></nes-icon></button>
    <button class="btn ghost xs"><nes-icon name="refresh"></nes-icon> Tạo lại</button>
  </div>
  <div class="feedback-meta">
    <span class="chip">gpt-4o</span><span>1,240 tok</span><span>·2.1s</span>
  </div>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.feedback</code>", "thanh — gạch phân cách trên, actions + meta"],
            ["<code>.feedback-actions</code>", "nút — <code>.btn.ghost.xs</code> thường"],
            ["<code>.feedback-meta</code>", "chỉ số run căn phải"],
          ],
        ) +
        note(
          `Khoá đánh giá bằng <code>aria-pressed="true"</code> trên ngón tay được chọn — nó tô đầy màu nhấn. Actions là nút thường, nên <a href="#/button">nhóm nút</a> cũng gộp chúng thành một thanh được.`,
        ) +
        a11y(
          `Mọi nút là <code>&lt;button&gt;</code> gốc có <code>aria-label</code>; icon chỉ trang trí. Dùng <code>aria-pressed</code> trên ngón tay để trạng thái đánh giá lộ ra cho trợ năng.`,
        ),
    },
  },

  /* -------------------------------------------------------- EDITOR */
  {
    id: "editor",
    cat: "Editor",
    name: "Editor",
    desc: {
      en: "Lightweight, AI-first rich-text editor on native contenteditable (zero deps). Toolbar, slash/@/: menus, block drag, VSCode-style Tab ghost, AI commands, word-count, and a bilingual mode — write in one language, Tab out the other. For blog / knowledge / language-learning apps.",
      vi: "Editor rich-text nhẹ, AI-first trên contenteditable gốc (zero deps). Toolbar, menu slash/@/:, kéo khối, ghost Tab kiểu VSCode, lệnh AI, đếm từ, và chế độ song ngữ — viết một thứ tiếng, Tab ra tiếng kia. Cho app blog / knowledge / luyện ngoại ngữ.",
    },
    body: {
      en: () =>
        stage(
          "EDITOR",
          `<nes-editor autocomplete aria-label="Doc" style="max-inline-size:min(560px,100%)">
            <script type="application/json">{"mentions":[{"value":"n1","label":"Second Brain"},{"value":"n2","label":"Knowledge Engine"}]}</script>
            <h2>How it works</h2>
            <p>Type <b>/</b> for blocks, <b>@</b> to mention a note, <b>:</b> for emoji. Select text to format.</p>
            <ul><li>Zero dependencies — just contenteditable</li><li>⌘↵ to submit to your agent</li></ul>
          </nes-editor>`,
          "col",
        ) +
        cb(
          `<nes-editor autocomplete name="doc" placeholder="Write, or / for commands…">
  <script type="application/json">{ "mentions": [{ "value": "n1", "label": "Second Brain" }] }</script>
</nes-editor>

<script type="module">
  const ed = document.querySelector("nes-editor");
  // VSCode-style Tab autocomplete — return the completion (or "")
  ed.suggest = async ({ text }) => (await myModel.complete(text)) ?? "";
  // AI generate / auto-write (blog, how-it-works…) — insert into the doc
  ed.addEventListener("nes:ai", async (e) => e.detail.insert(await myModel.write(e.detail.text)));
  ed.addEventListener("nes:submit", (e) => send(e.detail.html));   // ⌘/Ctrl + Enter
  ed.addEventListener("nes:mention", (e) => link(e.detail.value));
</script>`,
        ) +
        h2("API") +
        apiGroups({
          slot: [
            ["<code>&lt;script type='application/json'&gt;</code>", "<code>{ mentions: { value, label }[] }</code> for @-mention"],
            ["default HTML", "initial document content"],
          ],
          attr: [
            ["<code>name</code>", "string", "—", "hidden input carrying the HTML value (form submit)"],
            ["<code>placeholder</code>", "string", "—", "empty-state text"],
            ["<code>autocomplete</code>", "boolean", "<code>false</code>", "enable ghost Tab suggestions"],
            ["<code>lang</code> / <code>target-lang</code>", "string", "—", "source / target language for the bilingual ghost (e.g. <code>vi</code> → <code>en</code>) — shows the language chip"],
            ["<code>suggest-mode</code>", '<code>"continue" | "translate" | "correct"</code>', '<code>"continue"</code>', "how the ghost is produced (chip cycles it)"],
            ["<code>stats</code>", "boolean", "<code>false</code>", "show a word / char / reading-time footer"],
          ],
          prop: [
            ["<code>.value</code>", "string", '<code>""</code>', "get / set HTML content"],
            ["<code>.suggest</code>", "<code>(ctx) → string | Promise&lt;string&gt;</code>", "—", "your ghost provider — <code>ctx</code> = <code>{ text, textBefore, textAfter, block, lang, targetLang, mode }</code>"],
          ],
          method: [
            ["<code>.insert(html)</code>", "<code>(string) → void</code>", "—", "insert at the caret (AI output)"],
            ["<code>.replaceSelection(html)</code>", "<code>(string) → void</code>", "—", "replace the selection (or insert if none)"],
            ["<code>.triggerAI(cmd?)</code>", "<code>(string) → void</code>", "—", "fire an AI command programmatically"],
            ["<code>.showGhost(text)</code>", "<code>(string) → void</code>", "—", "show a dim inline suggestion (Tab accepts)"],
          ],
          event: [
            ["<code>nes:input</code>", "<code>{ html, text }</code>", "—", "content changed"],
            ["<code>nes:submit</code>", "<code>{ html, text }</code>", "—", "⌘/Ctrl+Enter → send to agent"],
            ["<code>nes:ai</code>", "<code>{ command, text, selection, lang, targetLang, insert(), replace() }</code>", "—", "an AI command was invoked (toolbar ✦ or <code>/</code> menu: translate / improve / continue / fix / summarize)"],
            ["<code>nes:suggest</code>", "<code>{ …ctx, accept() }</code>", "—", "no <code>.suggest</code> set — provide a ghost via <code>accept()</code>"],
            ["<code>nes:mention</code>", "<code>{ value, label }</code>", "—", "an @-mention was picked"],
          ],
        }) +
        crit("Autocomplete and AI are <strong>bring-your-own-model</strong> — set <code>.suggest</code> and listen for <code>nes:ai</code>. The editor ships no model and makes no network calls.") +
        h2("Bilingual ghost (blog + language practice)") +
        p("Set <code>lang</code> + <code>target-lang</code> and return the target-language rendering from <code>suggest</code>. Write in your language, press <strong>Tab</strong> to accept the translation — you draft and practice at once. The chip in the toolbar cycles <code>continue → translate → correct</code>.") +
        cb(`<nes-editor autocomplete lang="vi" target-lang="en" suggest-mode="translate" stats></nes-editor>
<script type="module">
  const ed = document.querySelector("nes-editor");
  ed.suggest = async ({ block, mode, lang, targetLang }) => {
    if (mode === "translate") return " → " + await myModel.translate(block, lang, targetLang);
    if (mode === "correct")   return await myModel.grammarFix(block);
    return await myModel.complete(block);           // continue
  };
  // AI slash / toolbar commands act on the selection when there is one
  ed.addEventListener("nes:ai", async (e) => {
    const src = e.detail.selection || e.detail.text;
    e.detail.replace(await myModel.run(e.detail.command, src, e.detail.targetLang));
  });
</script>`) +
        note("A lightweight contenteditable editor (zero-dep) — not a ProseMirror clone. Chosen for zero-build bundle size.") +
        a11y(
          "The surface is a labelled <code>role=\"textbox\"</code>; the toolbar is a <code>role=\"toolbar\"</code>; menus are keyboard-driven (↑/↓/Enter/Esc).",
        ),
      vi: () =>
        stage(
          "EDITOR",
          `<nes-editor autocomplete aria-label="Doc" style="max-inline-size:min(560px,100%)">
            <script type="application/json">{"mentions":[{"value":"n1","label":"Second Brain"},{"value":"n2","label":"Knowledge Engine"}]}</script>
            <h2>How it works</h2>
            <p>Gõ <b>/</b> để chèn khối, <b>@</b> để nhắc note, <b>:</b> cho emoji. Bôi đen chữ để format.</p>
            <ul><li>Zero dependency — chỉ contenteditable</li><li>⌘↵ để gửi cho agent</li></ul>
          </nes-editor>`,
          "col",
        ) +
        cb(
          `<nes-editor autocomplete name="doc" placeholder="Viết, hoặc / để ra lệnh…">
  <script type="application/json">{ "mentions": [{ "value": "n1", "label": "Second Brain" }] }</script>
</nes-editor>

<script type="module">
  const ed = document.querySelector("nes-editor");
  // Tab autocomplete kiểu VSCode — trả về phần gợi ý (hoặc "")
  ed.suggest = async ({ text }) => (await myModel.complete(text)) ?? "";
  // AI generate / auto-write (blog, how-it-works…) — chèn vào doc
  ed.addEventListener("nes:ai", async (e) => e.detail.insert(await myModel.write(e.detail.text)));
  ed.addEventListener("nes:submit", (e) => send(e.detail.html));   // ⌘/Ctrl + Enter
  ed.addEventListener("nes:mention", (e) => link(e.detail.value));
</script>`,
        ) +
        h2("API") +
        apiGroups({
          slot: [
            ["<code>&lt;script type='application/json'&gt;</code>", "<code>{ mentions: { value, label }[] }</code> cho @-mention"],
            ["HTML mặc định", "nội dung ban đầu của doc"],
          ],
          attr: [
            ["<code>name</code>", "string", "—", "input ẩn chứa HTML (submit form)"],
            ["<code>placeholder</code>", "string", "—", "chữ khi trống"],
            ["<code>autocomplete</code>", "boolean", "<code>false</code>", "bật gợi ý ghost bằng Tab"],
            ["<code>lang</code> / <code>target-lang</code>", "string", "—", "ngôn ngữ nguồn / đích cho ghost song ngữ (vd <code>vi</code> → <code>en</code>) — hiện chip ngôn ngữ"],
            ["<code>suggest-mode</code>", '<code>"continue" | "translate" | "correct"</code>', '<code>"continue"</code>', "cách tạo ghost (chip xoay vòng)"],
            ["<code>stats</code>", "boolean", "<code>false</code>", "hiện footer đếm từ / ký tự / thời gian đọc"],
          ],
          prop: [
            ["<code>.value</code>", "string", '<code>""</code>', "đọc / gán HTML"],
            ["<code>.suggest</code>", "<code>(ctx) → string | Promise&lt;string&gt;</code>", "—", "provider ghost — <code>ctx</code> = <code>{ text, textBefore, textAfter, block, lang, targetLang, mode }</code>"],
          ],
          method: [
            ["<code>.insert(html)</code>", "<code>(string) → void</code>", "—", "chèn tại caret (output AI)"],
            ["<code>.replaceSelection(html)</code>", "<code>(string) → void</code>", "—", "thay vùng chọn (hoặc chèn nếu không có)"],
            ["<code>.triggerAI(cmd?)</code>", "<code>(string) → void</code>", "—", "gọi lệnh AI bằng code"],
            ["<code>.showGhost(text)</code>", "<code>(string) → void</code>", "—", "hiện gợi ý ghost mờ (Tab để nhận)"],
          ],
          event: [
            ["<code>nes:input</code>", "<code>{ html, text }</code>", "—", "nội dung thay đổi"],
            ["<code>nes:submit</code>", "<code>{ html, text }</code>", "—", "⌘/Ctrl+Enter → gửi agent"],
            ["<code>nes:ai</code>", "<code>{ command, text, selection, lang, targetLang, insert(), replace() }</code>", "—", "một lệnh AI được gọi (toolbar ✦ hoặc menu <code>/</code>: translate / improve / continue / fix / summarize)"],
            ["<code>nes:suggest</code>", "<code>{ …ctx, accept() }</code>", "—", "chưa gán <code>.suggest</code> — cấp ghost qua <code>accept()</code>"],
            ["<code>nes:mention</code>", "<code>{ value, label }</code>", "—", "chọn một @-mention"],
          ],
        }) +
        crit("Autocomplete và AI là <strong>bring-your-own-model</strong> — gán <code>.suggest</code> và nghe <code>nes:ai</code>. Editor không ship model, không gọi mạng.") +
        h2("Ghost song ngữ (blog + luyện ngoại ngữ)") +
        p("Đặt <code>lang</code> + <code>target-lang</code> và trả về bản dịch ngôn ngữ đích từ <code>suggest</code>. Viết bằng tiếng của bạn, nhấn <strong>Tab</strong> để nhận bản dịch — vừa soạn vừa luyện. Chip trên toolbar xoay vòng <code>continue → translate → correct</code>.") +
        cb(`<nes-editor autocomplete lang="vi" target-lang="en" suggest-mode="translate" stats></nes-editor>
<script type="module">
  const ed = document.querySelector("nes-editor");
  ed.suggest = async ({ block, mode, lang, targetLang }) => {
    if (mode === "translate") return " → " + await myModel.translate(block, lang, targetLang);
    if (mode === "correct")   return await myModel.grammarFix(block);
    return await myModel.complete(block);           // continue
  };
  ed.addEventListener("nes:ai", async (e) => {
    const src = e.detail.selection || e.detail.text;
    e.detail.replace(await myModel.run(e.detail.command, src, e.detail.targetLang));
  });
</script>`) +
        note("Editor contenteditable nhẹ (zero-dep) — không phải ProseMirror clone. Chọn để bundle zero-build.") +
        a11y(
          "Vùng soạn là <code>role=\"textbox\"</code> có nhãn; toolbar là <code>role=\"toolbar\"</code>; menu điều khiển bằng phím (↑/↓/Enter/Esc).",
        ),
    },
  },
  {
    id: "editortoolbar",
    cat: "Editor",
    name: "EditorToolbar",
    desc: {
      en: "The format bar built into <nes-editor>: bold/italic/underline/strike, H1/H2, lists, quote, inline code, link, and an AI (✦) button. Scrolls horizontally on mobile.",
      vi: "Thanh format trong <nes-editor>: bold/italic/underline/strike, H1/H2, list, quote, code inline, link, và nút AI (✦). Cuộn ngang trên mobile.",
    },
    body: {
      en: () =>
        p("Rendered automatically inside <code>&lt;nes-editor&gt;</code>. Buttons run native formatting commands and sync their <code>.on</code> active state with the selection; the toolbar is a horizontally-scrollable <code>role=\"toolbar\"</code> so it never overflows on a phone.") +
        cb(`<!-- part of <nes-editor>; style hook: -->
.editor-toolbar { … }
.editor-toolbar button.on { /* active format */ }`) +
        api(
          ["Group", "Buttons"],
          [
            ["Inline", "B · I · U · S"],
            ["Block", "H1 · H2 · quote"],
            ["List", "• bullet · 1. numbered"],
            ["Insert", "‹› code · 🔗 link · ✦ Ask AI"],
          ],
        ),
      vi: () =>
        p("Tự render bên trong <code>&lt;nes-editor&gt;</code>. Nút chạy lệnh format gốc và đồng bộ trạng thái <code>.on</code> theo vùng chọn; toolbar là <code>role=\"toolbar\"</code> cuộn ngang nên không tràn trên điện thoại.") +
        cb(`<!-- thuộc <nes-editor>; hook style: -->
.editor-toolbar { … }
.editor-toolbar button.on { /* format đang bật */ }`) +
        api(
          ["Nhóm", "Nút"],
          [
            ["Inline", "B · I · U · S"],
            ["Khối", "H1 · H2 · quote"],
            ["List", "• bullet · 1. numbered"],
            ["Chèn", "‹› code · 🔗 link · ✦ Ask AI"],
          ],
        ),
    },
  },
  {
    id: "editorsuggestionmenu",
    cat: "Editor",
    name: "EditorSuggestionMenu",
    desc: {
      en: "The slash (/) command menu — the Notion-style way to insert blocks. Type / to open, keep typing to filter, ↑/↓ + Enter to pick.",
      vi: "Menu lệnh slash (/) — kiểu Notion để chèn khối. Gõ / để mở, gõ tiếp để lọc, ↑/↓ + Enter để chọn.",
    },
    body: {
      en: () =>
        p("Triggers on <code>/</code> at the caret. Commands: <b>✦ Ask AI</b>, Heading 1–3, Bullet / Numbered list, Quote, Code block, Divider. The typed <code>/query</code> is removed when you pick.") +
        cb(`Type "/" → filtered command list → Enter
/  ✦ Ask AI · H1 · H2 · H3 · • list · 1. list · ❝ quote · ‹› code · ― divider`) +
        a11y("Arrow keys move, Enter selects, Esc closes; the trigger text is cleaned up automatically."),
      vi: () =>
        p("Kích hoạt khi gõ <code>/</code> tại caret. Lệnh: <b>✦ Ask AI</b>, Heading 1–3, Bullet / Numbered list, Quote, Code block, Divider. Chuỗi <code>/query</code> tự xóa khi chọn.") +
        cb(`Gõ "/" → danh sách lệnh đã lọc → Enter
/  ✦ Ask AI · H1 · H2 · H3 · • list · 1. list · ❝ quote · ‹› code · ― divider`) +
        a11y("Phím mũi tên di chuyển, Enter chọn, Esc đóng; chuỗi trigger tự dọn."),
    },
  },
  {
    id: "editormentionmenu",
    cat: "Editor",
    name: "EditorMentionMenu",
    desc: {
      en: "The @-mention menu for referencing notes / people / entities — the backbone of a second-brain link graph. Options come from the editor's JSON config.",
      vi: "Menu @-mention để tham chiếu note / người / thực thể — xương sống của link graph second-brain. Options lấy từ JSON config của editor.",
    },
    body: {
      en: () =>
        p("Type <code>@</code> then filter. Picking inserts a non-editable <code>.mention</code> chip and fires <code>nes:mention</code> with the value — wire it to open/link the referenced note.") +
        cb(`<nes-editor>
  <script type="application/json">{ "mentions": [
    { "value": "note-42", "label": "Spaced Repetition" }
  ] }</script>
</nes-editor>
ed.addEventListener("nes:mention", (e) => open(e.detail.value));`) +
        a11y("Each mention is a labelled, contenteditable=false atom so caret navigation skips over it cleanly."),
      vi: () =>
        p("Gõ <code>@</code> rồi lọc. Chọn sẽ chèn chip <code>.mention</code> không sửa được và bắn <code>nes:mention</code> kèm value — nối để mở/link note được tham chiếu.") +
        cb(`<nes-editor>
  <script type="application/json">{ "mentions": [
    { "value": "note-42", "label": "Spaced Repetition" }
  ] }</script>
</nes-editor>
ed.addEventListener("nes:mention", (e) => open(e.detail.value));`) +
        a11y("Mỗi mention là atom có nhãn, contenteditable=false nên caret nhảy qua gọn gàng."),
    },
  },
  {
    id: "editoremojimenu",
    cat: "Editor",
    name: "EditorEmojiMenu",
    desc: {
      en: "The colon (:) emoji picker — type :name to filter a built-in set and insert the emoji. No dependency, no image sprite.",
      vi: "Bộ chọn emoji bằng dấu hai chấm (:) — gõ :tên để lọc bộ emoji có sẵn và chèn. Không dependency, không sprite ảnh.",
    },
    body: {
      en: () =>
        p("Type <code>:</code> followed by a name (e.g. <code>:rocket</code>, <code>:brain</code>, <code>:sparkles</code>) → pick to insert the native emoji character. Ships a curated set covering the common AI / dev / note vocabulary.") +
        cb(`:rocket → 🚀   :brain → 🧠   :sparkles → ✨   :bug → 🐛   :fire → 🔥`) +
        a11y("Only opens after at least one letter is typed, so a lone colon in prose never pops a menu."),
      vi: () =>
        p("Gõ <code>:</code> rồi tên (vd <code>:rocket</code>, <code>:brain</code>, <code>:sparkles</code>) → chọn để chèn ký tự emoji gốc. Có sẵn bộ emoji cho từ vựng AI / dev / note phổ biến.") +
        cb(`:rocket → 🚀   :brain → 🧠   :sparkles → ✨   :bug → 🐛   :fire → 🔥`) +
        a11y("Chỉ mở sau khi gõ ít nhất một chữ, nên dấu hai chấm lẻ trong văn bản không bật menu."),
    },
  },
  {
    id: "editordraghandle",
    cat: "Editor",
    name: "EditorDragHandle",
    desc: {
      en: "A grip (⠿) that appears at the start of the hovered block; drag it to reorder blocks. Pure HTML5 drag — no library.",
      vi: "Tay nắm (⠿) hiện ở đầu khối đang hover; kéo để sắp xếp lại khối. HTML5 drag thuần — không thư viện.",
    },
    body: {
      en: () =>
        p("Hover any top-level block (heading, paragraph, list) — the <code>.editor-drag</code> grip fades in on the inline-start. Drag it over another block to see the accent drop-line, release to move.") +
        cb(`.editor-drag { /* grip shown on block hover */ }
.editor-content .drop-before,
.editor-content .drop-after { /* accent drop indicator */ }`) +
        a11y("Drag is a visual enhancement; content stays fully editable and keyboard reordering (cut/paste) still works. On touch, blocks reorder via long-press drag."),
      vi: () =>
        p("Hover một khối cấp cao (heading, đoạn, list) — tay nắm <code>.editor-drag</code> hiện ra ở đầu dòng. Kéo qua khối khác để thấy vạch thả màu accent, thả để di chuyển.") +
        cb(`.editor-drag { /* grip hiện khi hover khối */ }
.editor-content .drop-before,
.editor-content .drop-after { /* vạch thả màu accent */ }`) +
        a11y("Kéo-thả là tăng cường trực quan; nội dung vẫn sửa được đầy đủ và sắp xếp bằng phím (cut/paste) vẫn chạy. Trên cảm ứng, kéo khối bằng long-press."),
    },
  },

  /* --------------------------------------------- TYPOGRAPHY / MDC (render) */
  {
    id: "typography",
    cat: "Typography",
    name: "Typography",
    desc: {
      en: "Render an AI agent's streamed Markdown / MDC output as beautiful, on-brand HTML — prose embeds (::code-preview, ::code-group, ::field-group…) that map onto real components.",
      vi: "Render output Markdown / MDC agent AI stream ra thành HTML đẹp, đúng brand — bộ prose embed (::code-preview, ::code-group, ::field-group…) ánh xạ sang component thật.",
    },
    body: {
      en: () =>
        p("An AI agent streams <strong>Markdown</strong> — and MDC (Markdown + Components). This module is the <em>render target</em>: it ships the styled result, <strong>not a parser</strong>. Your renderer (or any lightweight MDC engine) turns text into HTML; these recipes make that HTML look like the rest of the system — square frames, hard shadow, one accent per block.") +
        p("The base is <a href='#/prose'>Prose</a> (<code>.prose</code> — rhythm for headings, lists, links, tables). Inside it, MDC block components map 1:1 onto recipes you already have:") +
        h2("MDC → component map") +
        api(
          ["MDC syntax", "Renders as", "Selector"],
          [
            ["<code>::code-preview</code>", "<a href='#/codepreview'>CodePreview</a>", "<code>.code-preview</code>"],
            ["<code>::code-group</code>", "<a href='#/codegroup'>CodeGroup</a>", "<code>&lt;nes-tabs class='code-group'&gt;</code>"],
            ["<code>::code-collapse</code>", "<a href='#/codecollapse'>CodeCollapse</a>", "<code>&lt;details class='code-collapse'&gt;</code>"],
            ["<code>::code-tree</code>", "<a href='#/codetree'>CodeTree</a>", "<code>&lt;nes-code-tree&gt;</code>"],
            ["<code>::card-group</code>", "<a href='#/cardgroup'>CardGroup</a>", "<code>.card-group</code>"],
            ["<code>::field-group</code>", "<a href='#/fieldgroup'>FieldGroup</a>", "<code>.field-group</code>"],
            ["<code>::prompt</code>", "<a href='#/prompt'>Prompt</a>", "<code>.prompt</code>"],
            ["<code>::terminal</code>", "<a href='#/terminal'>Terminal</a>", "<code>.terminal</code>"],
            ["<code>::diff</code>", "<a href='#/diff'>Diff</a>", "<code>.diff</code>"],
            ["<code>::tasklist</code> · <code>- [x]</code>", "<a href='#/tasklist'>Tasklist</a>", "<code>.tasklist</code>"],
            ["<code>::note / ::tip / ::warning</code>", "<a href='#/alert'>Alert</a>", "<code>.callout</code>"],
            ["<code>::accordion</code>", "<a href='#/accordion'>Accordion</a>", "<code>&lt;nes-collapsible&gt;</code>"],
            ["<code>::tabs</code>", "<a href='#/tabs'>Tabs</a>", "<code>&lt;nes-tabs&gt;</code>"],
            ["<code>::card</code> · <code>::steps</code>", "<a href='#/card'>Card</a> · <a href='#/steps'>Steps</a>", "<code>.card</code> · <code>.steps</code>"],
            ["<code>:kbd</code> · <code>:badge</code> · <code>:icon</code>", "Kbd · Badge · Icon", "<code>.kbd</code> · <code>.badge</code> · <code>&lt;nes-icon&gt;</code>"],
          ],
        ) +
        p("<strong>Why no parser?</strong> Same reason the Chat and Editor modules don't ship a model: parsing is heavy and opinionated, rendering is light and universal. Keep them decoupled — pipe any Markdown/MDC engine's HTML into these classes and it just works, with zero bytes of parser in your bundle.") +
        cb(`<article class="prose">
  <h2>Deploying your agent</h2>
  <p>Run the command, then open the dashboard.</p>

  <!-- streamed ::code-preview → -->
  <div class="code-preview">
    <div class="preview"><button class="btn">Deploy</button></div>
    <nes-code>&lt;button class="btn"&gt;Deploy&lt;/button&gt;</nes-code>
  </div>
</article>`) +
        a11y("Everything renders to native, semantic HTML — headings stay headings, code stays <code>&lt;pre&gt;</code>, tabs use the ARIA <code>tablist</code> pattern. Streaming-safe: each block is self-contained, so a half-streamed document still degrades gracefully."),
      vi: () =>
        p("Agent AI stream <strong>Markdown</strong> — và MDC (Markdown + Components). Module này là <em>đích render</em>: nó ship kết quả đã style, <strong>không phải parser</strong>. Bộ render của bạn (hoặc engine MDC nhẹ bất kỳ) biến text thành HTML; các recipe này làm HTML đó trông đúng hệ thống — khung vuông, đổ bóng cứng, một accent mỗi khối.") +
        p("Nền tảng là <a href='#/prose'>Prose</a> (<code>.prose</code> — nhịp cho heading, list, link, bảng). Bên trong nó, các component khối MDC ánh xạ 1:1 sang recipe bạn đã có:") +
        h2("Ánh xạ MDC → component") +
        api(
          ["Cú pháp MDC", "Render thành", "Selector"],
          [
            ["<code>::code-preview</code>", "<a href='#/codepreview'>CodePreview</a>", "<code>.code-preview</code>"],
            ["<code>::code-group</code>", "<a href='#/codegroup'>CodeGroup</a>", "<code>&lt;nes-tabs class='code-group'&gt;</code>"],
            ["<code>::code-collapse</code>", "<a href='#/codecollapse'>CodeCollapse</a>", "<code>&lt;details class='code-collapse'&gt;</code>"],
            ["<code>::code-tree</code>", "<a href='#/codetree'>CodeTree</a>", "<code>&lt;nes-code-tree&gt;</code>"],
            ["<code>::card-group</code>", "<a href='#/cardgroup'>CardGroup</a>", "<code>.card-group</code>"],
            ["<code>::field-group</code>", "<a href='#/fieldgroup'>FieldGroup</a>", "<code>.field-group</code>"],
            ["<code>::prompt</code>", "<a href='#/prompt'>Prompt</a>", "<code>.prompt</code>"],
            ["<code>::terminal</code>", "<a href='#/terminal'>Terminal</a>", "<code>.terminal</code>"],
            ["<code>::diff</code>", "<a href='#/diff'>Diff</a>", "<code>.diff</code>"],
            ["<code>::tasklist</code> · <code>- [x]</code>", "<a href='#/tasklist'>Tasklist</a>", "<code>.tasklist</code>"],
            ["<code>::note / ::tip / ::warning</code>", "<a href='#/alert'>Alert</a>", "<code>.callout</code>"],
            ["<code>::accordion</code>", "<a href='#/accordion'>Accordion</a>", "<code>&lt;nes-collapsible&gt;</code>"],
            ["<code>::tabs</code>", "<a href='#/tabs'>Tabs</a>", "<code>&lt;nes-tabs&gt;</code>"],
            ["<code>::card</code> · <code>::steps</code>", "<a href='#/card'>Card</a> · <a href='#/steps'>Steps</a>", "<code>.card</code> · <code>.steps</code>"],
            ["<code>:kbd</code> · <code>:badge</code> · <code>:icon</code>", "Kbd · Badge · Icon", "<code>.kbd</code> · <code>.badge</code> · <code>&lt;nes-icon&gt;</code>"],
          ],
        ) +
        p("<strong>Sao không có parser?</strong> Cùng lý do module Chat và Editor không ship model: parse thì nặng và thiên kiến, render thì nhẹ và phổ quát. Tách rời chúng ra — đổ HTML từ engine Markdown/MDC bất kỳ vào các class này là chạy, không tốn byte parser nào trong bundle.") +
        cb(`<article class="prose">
  <h2>Triển khai agent</h2>
  <p>Chạy lệnh, rồi mở dashboard.</p>

  <!-- ::code-preview đã stream → -->
  <div class="code-preview">
    <div class="preview"><button class="btn">Deploy</button></div>
    <nes-code>&lt;button class="btn"&gt;Deploy&lt;/button&gt;</nes-code>
  </div>
</article>`) +
        a11y("Tất cả render ra HTML gốc, semantic — heading vẫn là heading, code vẫn là <code>&lt;pre&gt;</code>, tab dùng pattern ARIA <code>tablist</code>. An toàn khi stream: mỗi khối tự chứa, nên tài liệu stream dở vẫn xuống cấp mượt."),
    },
  },
  {
    id: "codepreview",
    cat: "Typography",
    name: "CodePreview",
    desc: {
      en: "Live rendered result on top, its source below — the ::code-preview embed. The “here's the component, here's the code” block.",
      vi: "Kết quả render sống ở trên, code nguồn ở dưới — embed ::code-preview. Khối “đây là component, đây là code”.",
    },
    body: {
      en: () =>
        stage(
          "CODE-PREVIEW",
          `<div class="code-preview" style="inline-size:100%;max-inline-size:min(460px,100%)">
            <div class="preview">
              <button class="btn">Deploy</button>
              <button class="btn outline" data-accent="cyan">Preview</button>
            </div>
            <nes-code>&lt;button class="btn"&gt;Deploy&lt;/button&gt;</nes-code>
          </div>`,
          "col",
        ) +
        cb(`<div class="code-preview">
  <div class="preview">
    <button class="btn">Deploy</button>
  </div>
  <nes-code>&lt;button class="btn"&gt;Deploy&lt;/button&gt;</nes-code>
</div>`) +
        h2("Anatomy") +
        api(
          ["Part", "Role"],
          [
            ["<code>.preview</code>", "top region — the live rendered result (flex, wraps, centered)"],
            ["<code>&lt;nes-code&gt;</code> / <code>.codeblock</code>", "source below; its own frame is stripped — the wrapper is the frame"],
          ],
        ) +
        a11y("The preview is real, interactive DOM (not a screenshot), so it stays fully keyboard- and screen-reader-accessible. The code block keeps its own copy button."),
      vi: () =>
        stage(
          "CODE-PREVIEW",
          `<div class="code-preview" style="inline-size:100%;max-inline-size:min(460px,100%)">
            <div class="preview">
              <button class="btn">Deploy</button>
              <button class="btn outline" data-accent="cyan">Preview</button>
            </div>
            <nes-code>&lt;button class="btn"&gt;Deploy&lt;/button&gt;</nes-code>
          </div>`,
          "col",
        ) +
        cb(`<div class="code-preview">
  <div class="preview">
    <button class="btn">Deploy</button>
  </div>
  <nes-code>&lt;button class="btn"&gt;Deploy&lt;/button&gt;</nes-code>
</div>`) +
        h2("Cấu tạo") +
        api(
          ["Phần", "Vai trò"],
          [
            ["<code>.preview</code>", "vùng trên — kết quả render sống (flex, tự xuống dòng, canh giữa)"],
            ["<code>&lt;nes-code&gt;</code> / <code>.codeblock</code>", "code nguồn ở dưới; khung riêng bị lược — wrapper chính là khung"],
          ],
        ) +
        a11y("Preview là DOM thật, tương tác được (không phải ảnh chụp), nên vẫn truy cập đầy đủ bằng bàn phím và screen reader. Code block giữ nút copy riêng."),
    },
  },
  {
    id: "codegroup",
    cat: "Typography",
    name: "CodeGroup",
    desc: {
      en: "Tab between several code blocks in one frame — the ::code-group embed. Perfect for pnpm/npm/yarn or multi-language snippets.",
      vi: "Chuyển tab giữa nhiều code block trong một khung — embed ::code-group. Hợp cho pnpm/npm/yarn hoặc snippet đa ngôn ngữ.",
    },
    body: {
      en: () =>
        stage(
          "CODE-GROUP",
          `<nes-tabs class="code-group" style="inline-size:100%;max-inline-size:min(460px,100%)">
            <section data-label="pnpm" selected><nes-code>pnpm add 8bit-nes</nes-code></section>
            <section data-label="npm"><nes-code>npm i 8bit-nes</nes-code></section>
            <section data-label="yarn"><nes-code>yarn add 8bit-nes</nes-code></section>
          </nes-tabs>`,
          "col",
        ) +
        cb(`<nes-tabs class="code-group">
  <section data-label="pnpm" selected>
    <nes-code>pnpm add 8bit-nes</nes-code>
  </section>
  <section data-label="npm">
    <nes-code>npm i 8bit-nes</nes-code>
  </section>
</nes-tabs>`) +
        p("It is the <a href='#/tabs'>Tabs</a> element with a <code>code-group</code> class — you get keyboard tab nav for free, and each panel's code frame merges into the group frame.") +
        a11y("Inherits the full ARIA <code>tablist</code> pattern from <code>&lt;nes-tabs&gt;</code>: ←/→ switch tabs, each panel is a labelled <code>tabpanel</code>."),
      vi: () =>
        stage(
          "CODE-GROUP",
          `<nes-tabs class="code-group" style="inline-size:100%;max-inline-size:min(460px,100%)">
            <section data-label="pnpm" selected><nes-code>pnpm add 8bit-nes</nes-code></section>
            <section data-label="npm"><nes-code>npm i 8bit-nes</nes-code></section>
            <section data-label="yarn"><nes-code>yarn add 8bit-nes</nes-code></section>
          </nes-tabs>`,
          "col",
        ) +
        cb(`<nes-tabs class="code-group">
  <section data-label="pnpm" selected>
    <nes-code>pnpm add 8bit-nes</nes-code>
  </section>
  <section data-label="npm">
    <nes-code>npm i 8bit-nes</nes-code>
  </section>
</nes-tabs>`) +
        p("Đây là element <a href='#/tabs'>Tabs</a> gắn class <code>code-group</code> — bạn có điều hướng tab bằng phím miễn phí, và khung code từng panel gộp vào khung nhóm.") +
        a11y("Kế thừa toàn bộ pattern ARIA <code>tablist</code> từ <code>&lt;nes-tabs&gt;</code>: ←/→ đổi tab, mỗi panel là <code>tabpanel</code> có nhãn."),
    },
  },
  {
    id: "codecollapse",
    cat: "Typography",
    name: "CodeCollapse",
    desc: {
      en: "Hide a long code block behind a toggle — the ::code-collapse embed. Native <details>, zero JS.",
      vi: "Giấu code block dài sau một nút gạt — embed ::code-collapse. Dùng <details> gốc, không JS.",
    },
    body: {
      en: () =>
        stage(
          "CODE-COLLAPSE",
          `<details class="code-collapse" style="inline-size:100%;max-inline-size:min(460px,100%)">
            <summary>Show full config</summary>
            <nes-code>{ "build": true, "minify": true, "target": "esnext" }</nes-code>
          </details>`,
          "col",
        ) +
        cb(`<details class="code-collapse">
  <summary>Show full config</summary>
  <nes-code>{ "build": true }</nes-code>
</details>`) +
        a11y("Native <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> — keyboard toggle (Enter/Space) and open/closed state are built in, no ARIA needed."),
      vi: () =>
        stage(
          "CODE-COLLAPSE",
          `<details class="code-collapse" style="inline-size:100%;max-inline-size:min(460px,100%)">
            <summary>Show full config</summary>
            <nes-code>{ "build": true, "minify": true, "target": "esnext" }</nes-code>
          </details>`,
          "col",
        ) +
        cb(`<details class="code-collapse">
  <summary>Show full config</summary>
  <nes-code>{ "build": true }</nes-code>
</details>`) +
        a11y("<code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> gốc — gạt bằng phím (Enter/Space) và trạng thái mở/đóng có sẵn, không cần ARIA."),
    },
  },
  {
    id: "codetree",
    cat: "Typography",
    name: "CodeTree",
    desc: {
      en: "File tree on the left, syntax-highlighted viewer on the right — the ::code-tree embed. Ideal for rendering a repo or multi-file snippet an agent generated.",
      vi: "Cây file bên trái, trình xem tô màu bên phải — embed ::code-tree. Lý tưởng để render repo hoặc snippet nhiều file agent tạo ra.",
    },
    body: {
      en: () =>
        stage(
          "CODE-TREE",
          `<nes-code-tree aria-label="Project" style="inline-size:100%">
            <script type="application/json">[
              {"label":"src","icon":"📁","expanded":true,"children":[
                {"label":"index.ts","icon":"📄","code":"import { mount } from './app'\\n\\nmount(document.body)"},
                {"label":"app.ts","icon":"📄","code":"export function mount(root) {\\n  root.innerHTML = '<h1>Hi</h1>'\\n}"}
              ]},
              {"label":"README.md","icon":"📄","code":"# my-agent\\n\\nBuilt with 8bit-nes."}
            ]</script>
          </nes-code-tree>`,
          "col",
        ) +
        cb(`<nes-code-tree aria-label="Project">
  <script type="application/json">
    [{ "label": "src", "expanded": true, "children": [
        { "label": "index.ts", "code": "import { mount } from './app'" }
    ]},
    { "label": "README.md", "code": "# my-agent" }]
  </script>
</nes-code-tree>`) +
        h2("API") +
        p("The <code>&lt;script type='application/json'&gt;</code> child is an array of nodes:") +
        api(
          ["Field", "Type", "Required", "Meaning"],
          [
            ["<code>label</code>", "string", "<b>yes</b>", "display name"],
            ["<code>code</code>", "string", "—", "file source — its presence marks the node a selectable <em>file</em>; omit it for a folder"],
            ["<code>children</code>", "node[]", "—", "child nodes → makes the node a folder"],
            ["<code>expanded</code>", "boolean", "<code>false</code>", "start the folder open"],
            ["<code>icon</code>", "string", "—", "leading glyph (📁 / 📄 / ⚙ …)"],
          ],
        ) +
        a11y("Built on the ARIA <code>tree</code> pattern (<code>role=tree/treeitem/group</code>, <code>aria-expanded</code>, <code>aria-selected</code>, <code>aria-level</code>). Folders toggle on click; files load into the viewer, which keeps a copy button. The first file is auto-selected."),
      vi: () =>
        stage(
          "CODE-TREE",
          `<nes-code-tree aria-label="Dự án" style="inline-size:100%">
            <script type="application/json">[
              {"label":"src","icon":"📁","expanded":true,"children":[
                {"label":"index.ts","icon":"📄","code":"import { mount } from './app'\\n\\nmount(document.body)"},
                {"label":"app.ts","icon":"📄","code":"export function mount(root) {\\n  root.innerHTML = '<h1>Hi</h1>'\\n}"}
              ]},
              {"label":"README.md","icon":"📄","code":"# my-agent\\n\\nBuilt with 8bit-nes."}
            ]</script>
          </nes-code-tree>`,
          "col",
        ) +
        cb(`<nes-code-tree aria-label="Dự án">
  <script type="application/json">
    [{ "label": "src", "expanded": true, "children": [
        { "label": "index.ts", "code": "import { mount } from './app'" }
    ]},
    { "label": "README.md", "code": "# my-agent" }]
  </script>
</nes-code-tree>`) +
        h2("API") +
        p("Con <code>&lt;script type='application/json'&gt;</code> là mảng các node:") +
        api(
          ["Trường", "Kiểu", "Bắt buộc", "Ý nghĩa"],
          [
            ["<code>label</code>", "string", "<b>có</b>", "tên hiển thị"],
            ["<code>code</code>", "string", "—", "code file — có nó thì node là <em>file</em> chọn được; bỏ đi thì là folder"],
            ["<code>children</code>", "node[]", "—", "node con → biến node thành folder"],
            ["<code>expanded</code>", "boolean", "<code>false</code>", "mở sẵn folder"],
            ["<code>icon</code>", "string", "—", "glyph đầu (📁 / 📄 / ⚙ …)"],
          ],
        ) +
        a11y("Theo pattern ARIA <code>tree</code> (<code>role=tree/treeitem/group</code>, <code>aria-expanded</code>, <code>aria-selected</code>, <code>aria-level</code>). Folder gập/mở khi click; file nạp vào trình xem có nút copy. File đầu tiên tự được chọn."),
    },
  },
  {
    id: "cardgroup",
    cat: "Typography",
    name: "CardGroup",
    desc: {
      en: "A responsive grid of cards that reflows by itself — the ::card-group embed. Drop any number of .card children in.",
      vi: "Lưới card responsive tự dàn lại — embed ::card-group. Bỏ số card bất kỳ vào.",
    },
    body: {
      en: () =>
        stage(
          "CARD-GROUP",
          `<div class="card-group" style="inline-size:100%">
            <a class="card" data-accent="blue"><div class="head"><span class="title">Guides</span></div><p>Step-by-step tutorials.</p></a>
            <a class="card" data-accent="teal"><div class="head"><span class="title">API</span></div><p>Full reference.</p></a>
            <a class="card" data-accent="pink"><div class="head"><span class="title">Examples</span></div><p>Copy-paste recipes.</p></a>
          </div>`,
          "col",
        ) +
        cb(`<div class="card-group">
  <a class="card"><div class="head"><span class="title">Guides</span></div><p>…</p></a>
  <a class="card"><div class="head"><span class="title">API</span></div><p>…</p></a>
</div>`) +
        p("Columns are automatic: <code>repeat(auto-fill, minmax(min(100%, 240px), 1fr))</code> — one column on a phone, as many as fit on a wide screen, never overflowing.") +
        a11y("Just a layout wrapper — the cards keep their own semantics. Use a real <code>&lt;a&gt;</code> for linked cards so they stay focusable."),
      vi: () =>
        stage(
          "CARD-GROUP",
          `<div class="card-group" style="inline-size:100%">
            <a class="card" data-accent="blue"><div class="head"><span class="title">Hướng dẫn</span></div><p>Tutorial từng bước.</p></a>
            <a class="card" data-accent="teal"><div class="head"><span class="title">API</span></div><p>Tài liệu đầy đủ.</p></a>
            <a class="card" data-accent="pink"><div class="head"><span class="title">Ví dụ</span></div><p>Recipe copy-paste.</p></a>
          </div>`,
          "col",
        ) +
        cb(`<div class="card-group">
  <a class="card"><div class="head"><span class="title">Hướng dẫn</span></div><p>…</p></a>
  <a class="card"><div class="head"><span class="title">API</span></div><p>…</p></a>
</div>`) +
        p("Số cột tự động: <code>repeat(auto-fill, minmax(min(100%, 240px), 1fr))</code> — một cột trên điện thoại, bao nhiêu vừa thì bấy nhiêu trên màn rộng, không bao giờ tràn.") +
        a11y("Chỉ là wrapper layout — card giữ ngữ nghĩa riêng. Dùng <code>&lt;a&gt;</code> thật cho card có link để vẫn focus được."),
    },
  },
  {
    id: "fieldgroup",
    cat: "Typography",
    name: "FieldGroup",
    desc: {
      en: "A bordered list of prop / parameter rows — the ::field-group embed. The clean way to render an API or config reference.",
      vi: "Danh sách hàng prop / tham số có viền — embed ::field-group. Cách gọn để render tài liệu API hoặc config.",
    },
    body: {
      en: () =>
        stage(
          "FIELD-GROUP",
          `<div class="field-group" style="inline-size:100%;max-inline-size:min(500px,100%)">
            <div class="field-row">
              <span class="name">accent</span><span class="type">string</span>
              <p>Accent name applied to the block. Defaults to <code>good</code>.</p>
            </div>
            <div class="field-row">
              <span class="name">timeout</span><span class="type">number</span><span class="req">*</span>
              <p>Auto-dismiss delay in ms; 0 keeps it until removed.</p>
            </div>
          </div>`,
          "col",
        ) +
        cb(`<div class="field-group">
  <div class="field-row">
    <span class="name">accent</span>
    <span class="type">string</span>
    <p>Accent name applied to the block.</p>
  </div>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.field-row</code>", "one parameter; stack as many as needed"],
            ["<code>.name</code>", "the prop name (mono, bold)"],
            ["<code>.type</code>", "its type (cyan mono)"],
            ["<code>.req</code>", "a red <code>*</code> required marker"],
            ["<code>p</code>", "the description (muted)"],
          ],
        ) +
        a11y("Semantic text rows — no special roles needed. For a full comparison matrix, use the standard <a href='#/table'>Table</a> instead."),
      vi: () =>
        stage(
          "FIELD-GROUP",
          `<div class="field-group" style="inline-size:100%;max-inline-size:min(500px,100%)">
            <div class="field-row">
              <span class="name">accent</span><span class="type">string</span>
              <p>Tên accent áp cho khối. Mặc định <code>good</code>.</p>
            </div>
            <div class="field-row">
              <span class="name">timeout</span><span class="type">number</span><span class="req">*</span>
              <p>Thời gian tự ẩn (ms); 0 giữ đến khi bị gỡ.</p>
            </div>
          </div>`,
          "col",
        ) +
        cb(`<div class="field-group">
  <div class="field-row">
    <span class="name">accent</span>
    <span class="type">string</span>
    <p>Tên accent áp cho khối.</p>
  </div>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.field-row</code>", "một tham số; xếp bao nhiêu tùy ý"],
            ["<code>.name</code>", "tên prop (mono, đậm)"],
            ["<code>.type</code>", "kiểu của nó (mono cyan)"],
            ["<code>.req</code>", "dấu <code>*</code> bắt buộc màu đỏ"],
            ["<code>p</code>", "mô tả (mờ)"],
          ],
        ) +
        a11y("Hàng text semantic — không cần role đặc biệt. Cần ma trận so sánh đầy đủ thì dùng <a href='#/table'>Table</a> chuẩn."),
    },
  },
  {
    id: "prompt",
    cat: "Typography",
    name: "Prompt",
    desc: {
      en: "A single terminal / AI command line with an accent caret (❯) — the ::prompt embed. For showing commands or an agent's input.",
      vi: "Một dòng lệnh terminal / AI với con trỏ nhấn (❯) — embed ::prompt. Để hiện lệnh hoặc input của agent.",
    },
    body: {
      en: () =>
        stage(
          "PROMPT",
          `<div class="prompt" style="inline-size:100%;max-inline-size:min(460px,100%)">pnpm add 8bit-nes</div>
           <div class="prompt" data-accent="teal" style="inline-size:100%;max-inline-size:min(460px,100%)">deploy my agent to production</div>`,
          "col",
        ) +
        cb(`<div class="prompt">pnpm add 8bit-nes</div>
<div class="prompt" data-accent="teal">deploy my agent</div>`) +
        a11y("The caret is drawn with <code>::before</code> (<code>content</code>), so it is decorative — not read aloud or copied; only the real command text is."),
      vi: () =>
        stage(
          "PROMPT",
          `<div class="prompt" style="inline-size:100%;max-inline-size:min(460px,100%)">pnpm add 8bit-nes</div>
           <div class="prompt" data-accent="teal" style="inline-size:100%;max-inline-size:min(460px,100%)">deploy agent lên production</div>`,
          "col",
        ) +
        cb(`<div class="prompt">pnpm add 8bit-nes</div>
<div class="prompt" data-accent="teal">deploy agent</div>`) +
        a11y("Con trỏ vẽ bằng <code>::before</code> (<code>content</code>) nên chỉ trang trí — không đọc lên hay copy; chỉ text lệnh thật mới có."),
    },
  },
  {
    id: "terminal",
    cat: "Typography",
    name: "Terminal",
    desc: {
      en: "A multi-line shell session — command lines (❯) + output. For rendering the install/run steps an AI agent writes.",
      vi: "Phiên shell nhiều dòng — dòng lệnh (❯) + output. Để render các bước cài/chạy agent AI viết ra.",
    },
    body: {
      en: () =>
        stage(
          "TERMINAL",
          `<div class="terminal" style="inline-size:100%;max-inline-size:min(520px,100%)"><span class="cmd">pnpm add 8bit-nes</span><span class="out ok">✓ added 1 package in 1.2s</span><span class="cmd">pnpm build</span><span class="out">bundling…</span><span class="out ok">✓ done in 12ms</span></div>`,
          "col",
        ) +
        cb(`<div class="terminal">
  <span class="cmd">pnpm build</span>
  <span class="out ok">✓ done in 12ms</span>
  <span class="err">✗ 1 error</span>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.cmd</code>", "a command line (auto <code>❯</code> caret in the accent color)"],
            ["<code>.out</code>", "an output line (muted)"],
            ["<code>.ok</code> / <code>.err</code>", "tint an output line green / red"],
          ],
        ) +
        a11y("Whitespace is preserved (<code>white-space: pre</code>); the caret is decorative (<code>::before</code>), so only real text is read/copied."),
      vi: () =>
        stage(
          "TERMINAL",
          `<div class="terminal" style="inline-size:100%;max-inline-size:min(520px,100%)"><span class="cmd">pnpm add 8bit-nes</span><span class="out ok">✓ added 1 package in 1.2s</span><span class="cmd">pnpm build</span><span class="out">bundling…</span><span class="out ok">✓ done in 12ms</span></div>`,
          "col",
        ) +
        cb(`<div class="terminal">
  <span class="cmd">pnpm build</span>
  <span class="out ok">✓ done in 12ms</span>
  <span class="err">✗ 1 error</span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.cmd</code>", "dòng lệnh (tự thêm con trỏ <code>❯</code> màu accent)"],
            ["<code>.out</code>", "dòng output (mờ)"],
            ["<code>.ok</code> / <code>.err</code>", "tô dòng output xanh / đỏ"],
          ],
        ) +
        a11y("Giữ khoảng trắng (<code>white-space: pre</code>); con trỏ chỉ trang trí (<code>::before</code>) nên chỉ text thật được đọc/copy."),
    },
  },
  {
    id: "diff",
    cat: "Typography",
    name: "Diff",
    desc: {
      en: "A code-diff block — added / removed / context lines with a +/− gutter. For rendering the patches an AI coding agent proposes.",
      vi: "Khối code-diff — dòng thêm / xóa / ngữ cảnh với gutter +/−. Để render patch mà agent code AI đề xuất.",
    },
    body: {
      en: () =>
        stage(
          "DIFF",
          `<div class="diff" style="inline-size:100%;max-inline-size:min(520px,100%)"><span class="ctx">  const ai = createAgent({</span><span class="del">    model: "haiku",</span><span class="add">    model: "opus-4.8",</span><span class="ctx">  })</span></div>`,
          "col",
        ) +
        cb(`<div class="diff">
  <span class="ctx">  const ai = createAgent({</span>
  <span class="del">    model: "haiku",</span>
  <span class="add">    model: "opus-4.8",</span>
  <span class="ctx">  })</span>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.add</code>", "an added line (green, <code>+</code> gutter)"],
            ["<code>.del</code>", "a removed line (red, <code>−</code> gutter)"],
            ["<code>.ctx</code>", "an unchanged context line"],
          ],
        ) +
        a11y("The +/− markers are drawn with <code>::before</code>, so a screen reader / copy gets the code without the gutter noise."),
      vi: () =>
        stage(
          "DIFF",
          `<div class="diff" style="inline-size:100%;max-inline-size:min(520px,100%)"><span class="ctx">  const ai = createAgent({</span><span class="del">    model: "haiku",</span><span class="add">    model: "opus-4.8",</span><span class="ctx">  })</span></div>`,
          "col",
        ) +
        cb(`<div class="diff">
  <span class="ctx">  const ai = createAgent({</span>
  <span class="del">    model: "haiku",</span>
  <span class="add">    model: "opus-4.8",</span>
  <span class="ctx">  })</span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.add</code>", "dòng thêm (xanh, gutter <code>+</code>)"],
            ["<code>.del</code>", "dòng xóa (đỏ, gutter <code>−</code>)"],
            ["<code>.ctx</code>", "dòng ngữ cảnh không đổi"],
          ],
        ) +
        a11y("Dấu +/− vẽ bằng <code>::before</code> nên screen reader / copy lấy code không dính gutter."),
    },
  },
  {
    id: "tasklist",
    cat: "Typography",
    name: "Tasklist",
    desc: {
      en: "A checklist — done + open items with square checkboxes. For rendering the plans / to-dos an AI agent emits (Markdown - [x]).",
      vi: "Checklist — mục xong + chưa với ô vuông. Để render plan / to-do agent AI xuất ra (Markdown - [x]).",
    },
    body: {
      en: () =>
        stage(
          "TASKLIST",
          `<ul class="tasklist" style="inline-size:100%;max-inline-size:min(420px,100%)">
            <li class="done">Scaffold the design tokens</li>
            <li class="done">Build the component recipes</li>
            <li>Wire the AI agent hooks</li>
            <li>Ship v1</li>
          </ul>`,
          "col",
        ) +
        cb(`<ul class="tasklist">
  <li class="done">Done item</li>
  <li>Open item</li>
</ul>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.tasklist</code>", "the list (put on <code>&lt;ul&gt;</code>)"],
            ["<code>li</code>", "an open task (empty square)"],
            ["<code>li.done</code>", "a done task (checked + struck through)"],
          ],
        ) +
        a11y("It's a real <code>&lt;ul&gt;/&lt;li&gt;</code> — the checkbox glyph is decorative; convey done-state in the text too if it must be machine-read."),
      vi: () =>
        stage(
          "TASKLIST",
          `<ul class="tasklist" style="inline-size:100%;max-inline-size:min(420px,100%)">
            <li class="done">Dựng design tokens</li>
            <li class="done">Build recipe component</li>
            <li>Nối hook AI agent</li>
            <li>Ship v1</li>
          </ul>`,
          "col",
        ) +
        cb(`<ul class="tasklist">
  <li class="done">Mục xong</li>
  <li>Mục chưa</li>
</ul>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.tasklist</code>", "list (đặt trên <code>&lt;ul&gt;</code>)"],
            ["<code>li</code>", "task chưa xong (ô trống)"],
            ["<code>li.done</code>", "task xong (tick + gạch ngang)"],
          ],
        ) +
        a11y("Là <code>&lt;ul&gt;/&lt;li&gt;</code> thật — ô tick chỉ trang trí; nếu cần máy đọc trạng thái xong thì ghi cả vào text."),
    },
  },

  /* ------------------------------------------------ VISUALIZE (diagrams) */
  {
    id: "visualize",
    cat: "Visualize",
    name: "Visualize",
    desc: {
      en: "Turn an AI agent's diagram output (Mermaid) into on-brand visuals, and teach a concept step-by-step. Mermaid is never bundled — bring your own or lazy-load it.",
      vi: "Biến output diagram (Mermaid) của agent AI thành hình đúng brand, và dạy một khái niệm từng bước. Mermaid không bao giờ bị bundle — tự nạp hoặc lazy-load.",
    },
    body: {
      en: () =>
        p("LLMs are fluent in <strong>Mermaid</strong> — they emit <code>graph</code>, <code>sequenceDiagram</code>, <code>erDiagram</code> naturally. This module renders that output as diagrams themed to the system (square, hard shadow, the accent palette + fonts), then lets a learner step <em>through</em> it — built for system-design tools, domain learning, and 'how it works' explainers.") +
        p("<strong>Mermaid is heavy (~800KB gzipped) — so it is never bundled.</strong> Same decoupling as Chat/Editor (bring-your-own-model) and MDC (bring-your-own-parser): we ship the frame + theme + interactions; you choose how mermaid loads. Three ways, zero bytes by default:") +
        api(
          ["Strategy", "How", "When"],
          [
            ["BYO instance", "set <code>globalThis.mermaid</code> (script tag / import)", "you already use mermaid / self-host it"],
            ["Lazy-load", "<code>enableMermaid(url)</code> once, or <code>&lt;nes-mermaid src='…'&gt;</code>", "fetch on demand, only when a diagram is on the page"],
            ["None", "do nothing", "the diagram shows its raw source (graceful) — no fetch"],
          ],
        ) +
        cb(`import { enableMermaid } from "8bit-nes";
// load mermaid on demand — a CDN or your own self-hosted copy:
enableMermaid("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");`) +
        h2("The three pieces") +
        api(
          ["Piece", "Selector", "Role"],
          [
            ["<a href='#/mermaid'>Mermaid</a>", "<code>&lt;nes-mermaid&gt;</code>", "render + theme a diagram; streaming-safe; <code>highlight()</code> + click events"],
            ["<a href='#/walkthrough'>Walkthrough</a>", "<code>&lt;nes-walkthrough&gt;</code>", "step through a concept; each step spotlights part of a diagram"],
            ["<a href='#/lens'>Lens</a>", "<code>&lt;nes-tabs class='lens'&gt;</code>", "one concept, many angles (flow / sequence / data / trade-offs)"],
          ],
        ) +
        a11y("AI output is untrusted, so diagrams render with mermaid's <code>securityLevel:'strict'</code> (no scripts / HTML injection). The walkthrough is keyboard-driven (←/→) with a polite live region announcing each step."),
      vi: () =>
        p("LLM rất thạo <strong>Mermaid</strong> — chúng sinh <code>graph</code>, <code>sequenceDiagram</code>, <code>erDiagram</code> tự nhiên. Module này render output đó thành diagram đúng brand (vuông, bóng cứng, palette accent + font), rồi cho người học đi <em>xuyên qua</em> nó — dựng cho tool system-design, học domain, và giải thích 'how it works'.") +
        p("<strong>Mermaid nặng (~800KB gzip) — nên không bao giờ bundle.</strong> Tách rời giống Chat/Editor (tự mang model) và MDC (tự mang parser): mình ship khung + theme + tương tác; bạn chọn cách nạp mermaid. Ba cách, mặc định 0 byte:") +
        api(
          ["Cách", "Làm sao", "Khi nào"],
          [
            ["BYO instance", "gán <code>globalThis.mermaid</code> (thẻ script / import)", "bạn đã dùng mermaid / tự host"],
            ["Lazy-load", "<code>enableMermaid(url)</code> một lần, hoặc <code>&lt;nes-mermaid src='…'&gt;</code>", "nạp theo yêu cầu, chỉ khi có diagram trên trang"],
            ["Không", "khỏi làm gì", "diagram hiện code nguồn (mượt) — không fetch"],
          ],
        ) +
        cb(`import { enableMermaid } from "8bit-nes";
// nạp mermaid theo yêu cầu — CDN hoặc bản tự host của bạn:
enableMermaid("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");`) +
        h2("Ba mảnh ghép") +
        api(
          ["Mảnh", "Selector", "Vai trò"],
          [
            ["<a href='#/mermaid'>Mermaid</a>", "<code>&lt;nes-mermaid&gt;</code>", "render + theme diagram; an toàn stream; <code>highlight()</code> + sự kiện click"],
            ["<a href='#/walkthrough'>Walkthrough</a>", "<code>&lt;nes-walkthrough&gt;</code>", "đi qua khái niệm từng bước; mỗi bước làm nổi bật một phần diagram"],
            ["<a href='#/lens'>Lens</a>", "<code>&lt;nes-tabs class='lens'&gt;</code>", "một khái niệm, nhiều góc (flow / sequence / data / đánh đổi)"],
          ],
        ) +
        a11y("Output AI không đáng tin nên diagram render với <code>securityLevel:'strict'</code> (không script / chèn HTML). Walkthrough điều khiển bằng phím (←/→) với live region thông báo từng bước."),
    },
  },
  {
    id: "mermaid",
    cat: "Visualize",
    name: "Mermaid",
    desc: {
      en: "Render a Mermaid diagram themed to the system. Streaming-safe (set .code per chunk) and AI-safe (strict). Mermaid isn't bundled.",
      vi: "Render diagram Mermaid theo brand. An toàn khi stream (set .code mỗi chunk) và an toàn với AI (strict). Không bundle mermaid.",
    },
    body: {
      en: () =>
        stage(
          "MERMAID",
          `<nes-mermaid style="inline-size:100%;max-inline-size:min(560px,100%)"><script type="text/mermaid">graph LR
  Client[Client] --> CDN[CDN]
  CDN --> LB[Load Balancer]
  LB --> API[API Server]
  API --> Cache[(Redis)]
  API --> DB[(Database)]</script></nes-mermaid>`,
          "col",
        ) +
        cb(`<nes-mermaid>
  <script type="text/mermaid">
    graph LR
      Client --> CDN --> LB --> API
      API --> Cache[(Redis)]
      API --> DB[(Database)]
  </script>
</nes-mermaid>`) +
        h2("Streaming from an agent") +
        cb(`const d = document.querySelector("nes-mermaid");
for await (const chunk of agentStream())
  d.code = chunk.textSoFar; // partial/invalid syntax keeps the last good render`) +
        h2("API") +
        apiGroups({
          slot: [["<code>&lt;script type='text/mermaid'&gt;</code>", "the diagram source (or the element's plain text)"]],
          attr: [["<code>src</code>", "string (URL)", "—", "lazy-load the mermaid ESM build from here (this element only)"]],
          prop: [["<code>.code</code>", "string", '<code>""</code>', "get/set the source; setting re-renders (debounced) — use for streaming"]],
          method: [["<code>.highlight(labels)</code>", "<code>(string | string[]) → void</code>", "—", "spotlight nodes by label; dims the rest"]],
          event: [
            ["<code>nes:render</code>", "<code>{ ok }</code>", "—", "a diagram finished rendering"],
            ["<code>nes:node</code>", "<code>{ label, id }</code>", "—", "a node was clicked"],
          ],
        }) +
        crit("Mermaid (~800KB) is <strong>never bundled</strong>. Provide it via <code>globalThis.mermaid</code>, <code>enableMermaid(url)</code>, or <code>src</code> — otherwise the raw source is shown (never a blank box).") +
        note("Renders with <code>securityLevel:'strict'</code>, so untrusted AI output can't inject scripts or HTML.") +
        a11y("Output is SVG; add <code>accTitle</code>/<code>accDescr</code> lines to your mermaid source and screen readers get a title/description."),
      vi: () =>
        stage(
          "MERMAID",
          `<nes-mermaid style="inline-size:100%;max-inline-size:min(560px,100%)"><script type="text/mermaid">graph LR
  Client[Client] --> CDN[CDN]
  CDN --> LB[Load Balancer]
  LB --> API[API Server]
  API --> Cache[(Redis)]
  API --> DB[(Database)]</script></nes-mermaid>`,
          "col",
        ) +
        cb(`<nes-mermaid>
  <script type="text/mermaid">
    graph LR
      Client --> CDN --> LB --> API
      API --> Cache[(Redis)]
      API --> DB[(Database)]
  </script>
</nes-mermaid>`) +
        h2("Stream từ agent") +
        cb(`const d = document.querySelector("nes-mermaid");
for await (const chunk of agentStream())
  d.code = chunk.textSoFar; // cú pháp dở/lỗi vẫn giữ bản render tốt trước đó`) +
        h2("API") +
        apiGroups({
          slot: [["<code>&lt;script type='text/mermaid'&gt;</code>", "code nguồn diagram (hoặc text thuần của element)"]],
          attr: [["<code>src</code>", "string (URL)", "—", "lazy-load bản mermaid ESM từ đây (riêng element này)"]],
          prop: [["<code>.code</code>", "string", '<code>""</code>', "đọc/ghi nguồn; ghi thì re-render (debounce) — dùng cho stream"]],
          method: [["<code>.highlight(labels)</code>", "<code>(string | string[]) → void</code>", "—", "làm nổi node theo nhãn; mờ phần còn lại"]],
          event: [
            ["<code>nes:render</code>", "<code>{ ok }</code>", "—", "diagram render xong"],
            ["<code>nes:node</code>", "<code>{ label, id }</code>", "—", "click vào node"],
          ],
        }) +
        crit("Mermaid (~800KB) <strong>không bao giờ bị bundle</strong>. Cấp qua <code>globalThis.mermaid</code>, <code>enableMermaid(url)</code>, hoặc <code>src</code> — nếu không sẽ hiện code nguồn (không bao giờ ô trống).") +
        note("Render với <code>securityLevel:'strict'</code> nên output AI không tin cậy không thể chèn script hay HTML.") +
        a11y("Output là SVG; thêm dòng <code>accTitle</code>/<code>accDescr</code> vào nguồn mermaid thì screen reader có title/mô tả."),
    },
  },
  {
    id: "walkthrough",
    cat: "Visualize",
    name: "Walkthrough",
    desc: {
      en: "Step-by-step 'How it works'. Prev/Next + arrow keys; each step spotlights part of a diagram so a principle unfolds one piece at a time.",
      vi: "'How it works' từng bước. Prev/Next + phím mũi tên; mỗi bước làm nổi bật một phần diagram để nguyên lí bung ra từng mảnh.",
    },
    body: {
      en: () =>
        stage(
          "HOW IT WORKS",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-4);inline-size:100%;max-inline-size:min(560px,100%)">
            <nes-mermaid id="wt-demo-dia"><script type="text/mermaid">graph LR
  Client[Client] --> CDN[CDN]
  CDN --> LB[Load Balancer]
  LB --> API[API Server]
  API --> Cache[(Redis)]
  API --> DB[(Database)]</script></nes-mermaid>
            <nes-walkthrough for="wt-demo-dia" aria-label="Request flow">
              <script type="application/json">[
                {"title":"1 · Client","body":"<p>A browser sends the request.</p>","focus":["Client"]},
                {"title":"2 · Edge cache","body":"<p>The CDN serves static hits from the edge, close to the user.</p>","focus":["CDN"]},
                {"title":"3 · Balance","body":"<p>The load balancer routes to a healthy API node.</p>","focus":["Load Balancer"]},
                {"title":"4 · Compute","body":"<p>The API server runs the business logic.</p>","focus":["API Server"]},
                {"title":"5 · Data","body":"<p>Hot reads hit Redis; everything else hits the database.</p>","focus":["Redis","Database"]}
              ]</script>
            </nes-walkthrough>
          </div>`,
          "col",
        ) +
        cb(`<nes-mermaid id="flow"> … </nes-mermaid>
<nes-walkthrough for="flow">
  <script type="application/json">
    [{ "title": "1 · Client", "body": "<p>…</p>", "focus": ["Client"] },
     { "title": "2 · Data",   "body": "<p>…</p>", "focus": ["Redis","Database"] }]
  </script>
</nes-walkthrough>`) +
        h2("API") +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "steps: <code>{ title, body (HTML), focus?: string[] }[]</code>"]],
          attr: [["<code>for</code>", "string (id)", "—", "id of the diagram to drive — each step calls its <code>highlight(focus)</code>"]],
          prop: [["<code>.index</code>", "number", "<code>0</code>", "current step (0-based, read-only)"]],
          method: [
            ["<code>.next()</code> / <code>.prev()</code>", "<code>() → void</code>", "—", "move one step"],
            ["<code>.go(n)</code>", "<code>(number) → void</code>", "—", "jump to step <code>n</code>"],
          ],
          event: [["<code>nes:step</code>", "<code>{ index, step }</code>", "—", "the step changed"]],
        }) +
        note("<code>for</code> works with <em>any</em> element exposing a <code>highlight()</code> method, not only <code>&lt;nes-mermaid&gt;</code> — you can drive a code block or your own component.") +
        a11y("Focus the card and use ←/→ to move; the step counter is a polite live region."),
      vi: () =>
        stage(
          "HOW IT WORKS",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-4);inline-size:100%;max-inline-size:min(560px,100%)">
            <nes-mermaid id="wt-demo-dia-vi"><script type="text/mermaid">graph LR
  Client[Client] --> CDN[CDN]
  CDN --> LB[Load Balancer]
  LB --> API[API Server]
  API --> Cache[(Redis)]
  API --> DB[(Database)]</script></nes-mermaid>
            <nes-walkthrough for="wt-demo-dia-vi" aria-label="Luồng request">
              <script type="application/json">[
                {"title":"1 · Client","body":"<p>Trình duyệt gửi request.</p>","focus":["Client"]},
                {"title":"2 · Cache biên","body":"<p>CDN phục vụ tài nguyên tĩnh ở biên, gần người dùng.</p>","focus":["CDN"]},
                {"title":"3 · Cân bằng","body":"<p>Load balancer định tuyến tới node API khỏe.</p>","focus":["Load Balancer"]},
                {"title":"4 · Tính toán","body":"<p>API server chạy business logic.</p>","focus":["API Server"]},
                {"title":"5 · Dữ liệu","body":"<p>Đọc nóng vào Redis; còn lại vào database.</p>","focus":["Redis","Database"]}
              ]</script>
            </nes-walkthrough>
          </div>`,
          "col",
        ) +
        cb(`<nes-mermaid id="flow"> … </nes-mermaid>
<nes-walkthrough for="flow">
  <script type="application/json">
    [{ "title": "1 · Client", "body": "<p>…</p>", "focus": ["Client"] },
     { "title": "2 · Data",   "body": "<p>…</p>", "focus": ["Redis","Database"] }]
  </script>
</nes-walkthrough>`) +
        h2("API") +
        apiGroups({
          slot: [["<code>&lt;script type='application/json'&gt;</code>", "step: <code>{ title, body (HTML), focus?: string[] }[]</code>"]],
          attr: [["<code>for</code>", "string (id)", "—", "id của diagram để điều khiển — mỗi bước gọi <code>highlight(focus)</code>"]],
          prop: [["<code>.index</code>", "number", "<code>0</code>", "bước hiện tại (0-based, chỉ đọc)"]],
          method: [
            ["<code>.next()</code> / <code>.prev()</code>", "<code>() → void</code>", "—", "đi một bước"],
            ["<code>.go(n)</code>", "<code>(number) → void</code>", "—", "nhảy tới bước <code>n</code>"],
          ],
          event: [["<code>nes:step</code>", "<code>{ index, step }</code>", "—", "bước thay đổi"]],
        }) +
        note("<code>for</code> chạy với <em>bất kỳ</em> element nào có method <code>highlight()</code>, không chỉ <code>&lt;nes-mermaid&gt;</code> — bạn có thể điều khiển code block hay component của mình.") +
        a11y("Focus vào card rồi dùng ←/→ để đi; bộ đếm bước là live region lịch sự."),
    },
  },
  {
    id: "lens",
    cat: "Visualize",
    name: "Lens",
    desc: {
      en: "See one concept from many angles — flow, sequence, data, trade-offs — as tabs. Pure composition over Tabs; deepens understanding.",
      vi: "Nhìn một khái niệm từ nhiều góc — flow, sequence, data, đánh đổi — dạng tab. Thuần composition trên Tabs; hiểu sâu hơn.",
    },
    body: {
      en: () =>
        p("Understanding a system means seeing it from more than one angle. <em>Lens</em> is just <a href='#/tabs'>Tabs</a> with a <code>lens</code> class — one diagram (or explanation) per angle, no new component to learn.") +
        stage(
          "LENS",
          `<nes-tabs class="lens" style="inline-size:100%;max-inline-size:min(560px,100%)">
            <section data-label="Flow" selected><nes-mermaid><script type="text/mermaid">graph LR
  A[Request] --> B[API] --> C[(DB)]</script></nes-mermaid></section>
            <section data-label="Sequence"><nes-mermaid><script type="text/mermaid">sequenceDiagram
  Client->>API: GET /order
  API->>DB: query
  DB-->>API: rows
  API-->>Client: 200 OK</script></nes-mermaid></section>
            <section data-label="Trade-offs"><div class="prose"><ul><li>Cache → faster reads, staleness risk</li><li>Sync writes → consistent, slower</li></ul></div></section>
          </nes-tabs>`,
          "col",
        ) +
        cb(`<nes-tabs class="lens">
  <section data-label="Flow" selected><nes-mermaid>…</nes-mermaid></section>
  <section data-label="Sequence"><nes-mermaid>…</nes-mermaid></section>
  <section data-label="Trade-offs"><div class="prose"><ul>…</ul></div></section>
</nes-tabs>`) +
        a11y("Inherits the ARIA tablist pattern from <a href='#/tabs'>Tabs</a> — ←/→ switch angles, each panel is a labelled tabpanel."),
      vi: () =>
        p("Hiểu một hệ thống nghĩa là nhìn nó từ nhiều hơn một góc. <em>Lens</em> chỉ là <a href='#/tabs'>Tabs</a> gắn class <code>lens</code> — một diagram (hoặc giải thích) mỗi góc, không component mới nào phải học.") +
        stage(
          "LENS",
          `<nes-tabs class="lens" style="inline-size:100%;max-inline-size:min(560px,100%)">
            <section data-label="Flow" selected><nes-mermaid><script type="text/mermaid">graph LR
  A[Request] --> B[API] --> C[(DB)]</script></nes-mermaid></section>
            <section data-label="Sequence"><nes-mermaid><script type="text/mermaid">sequenceDiagram
  Client->>API: GET /order
  API->>DB: query
  DB-->>API: rows
  API-->>Client: 200 OK</script></nes-mermaid></section>
            <section data-label="Đánh đổi"><div class="prose"><ul><li>Cache → đọc nhanh hơn, rủi ro cũ dữ liệu</li><li>Ghi đồng bộ → nhất quán, chậm hơn</li></ul></div></section>
          </nes-tabs>`,
          "col",
        ) +
        cb(`<nes-tabs class="lens">
  <section data-label="Flow" selected><nes-mermaid>…</nes-mermaid></section>
  <section data-label="Sequence"><nes-mermaid>…</nes-mermaid></section>
  <section data-label="Đánh đổi"><div class="prose"><ul>…</ul></div></section>
</nes-tabs>`) +
        a11y("Kế thừa pattern ARIA tablist từ <a href='#/tabs'>Tabs</a> — ←/→ đổi góc, mỗi panel là tabpanel có nhãn."),
    },
  },
  {
    id: "zoom",
    cat: "Visualize",
    name: "Zoom",
    desc: {
      en: "Pan + zoom any content — wheel, drag, buttons, keyboard. Wrap a big AI-generated diagram (or an image) to make it explorable. Zero-dep.",
      vi: "Pan + zoom bất kỳ nội dung — cuộn, kéo, nút, phím. Bọc một diagram lớn AI sinh (hoặc ảnh) để khám phá được. Zero-dep.",
    },
    body: {
      en: () =>
        stage(
          "ZOOM",
          `<nes-zoom aria-label="Architecture" style="inline-size:100%;max-inline-size:min(520px,100%);block-size:220px">${VIZ_SVG}</nes-zoom>`,
          "col",
        ) +
        cb(`<nes-zoom aria-label="Architecture" style="block-size:320px">
  <nes-mermaid> … a large diagram … </nes-mermaid>
</nes-zoom>`) +
        h2("API") +
        apiGroups({
          slot: [["default", "any content — a diagram, <code>&lt;nes-mermaid&gt;</code>, an <code>&lt;img&gt;</code>, or SVG"]],
          attr: [
            ["<code>min</code> / <code>max</code>", "number", "<code>0.4</code> / <code>5</code>", "zoom-scale bounds"],
          ],
          method: [
            ["<code>.zoomBy(f)</code> / <code>.zoomTo(s)</code>", "<code>(number) → void</code>", "—", "zoom relative / absolute"],
            ["<code>.reset()</code>", "<code>() → void</code>", "—", "back to 1× centered"],
          ],
        }) +
        note("Wheel to zoom, drag to pan, double-click or <code>0</code> to reset, <code>+</code>/<code>−</code> to step. On touch it takes over one-finger drag (<code>touch-action:none</code>).") +
        a11y("The viewport is focusable and keyboard-driven; controls are real <code>&lt;button&gt;</code>s with labels."),
      vi: () =>
        stage(
          "ZOOM",
          `<nes-zoom aria-label="Kiến trúc" style="inline-size:100%;max-inline-size:min(520px,100%);block-size:220px">${VIZ_SVG}</nes-zoom>`,
          "col",
        ) +
        cb(`<nes-zoom aria-label="Kiến trúc" style="block-size:320px">
  <nes-mermaid> … một diagram lớn … </nes-mermaid>
</nes-zoom>`) +
        h2("API") +
        apiGroups({
          slot: [["mặc định", "nội dung bất kỳ — diagram, <code>&lt;nes-mermaid&gt;</code>, <code>&lt;img&gt;</code>, hay SVG"]],
          attr: [["<code>min</code> / <code>max</code>", "number", "<code>0.4</code> / <code>5</code>", "cận tỷ lệ zoom"]],
          method: [
            ["<code>.zoomBy(f)</code> / <code>.zoomTo(s)</code>", "<code>(number) → void</code>", "—", "zoom tương đối / tuyệt đối"],
            ["<code>.reset()</code>", "<code>() → void</code>", "—", "về 1× canh giữa"],
          ],
        }) +
        note("Cuộn để zoom, kéo để pan, double-click hoặc <code>0</code> để reset, <code>+</code>/<code>−</code> để bước. Trên cảm ứng nó chiếm kéo một ngón (<code>touch-action:none</code>).") +
        a11y("Viewport focus được và điều khiển bằng phím; nút là <code>&lt;button&gt;</code> thật có nhãn."),
    },
  },
  {
    id: "annotate",
    cat: "Visualize",
    name: "Annotate",
    desc: {
      en: "Numbered hotspot markers with popovers, positioned over any image or diagram. Point at the parts to explain how something works.",
      vi: "Điểm nóng đánh số kèm popover, đặt trên ảnh/diagram bất kỳ. Chỉ vào từng phần để giải thích cách hoạt động.",
    },
    body: {
      en: () =>
        stage(
          "ANNOTATE",
          `<nes-annotate aria-label="Architecture" style="inline-size:100%;max-inline-size:min(520px,100%)">
            <script type="application/json">[
              {"x":12,"y":50,"title":"Client","body":"<p>The browser or app sends the request.</p>"},
              {"x":42,"y":50,"title":"API","body":"<p>Runs the business logic.</p>"},
              {"x":73,"y":23,"title":"Cache","body":"<p>Serves hot reads fast.</p>"}
            ]</script>${VIZ_SVG}</nes-annotate>`,
          "col",
        ) +
        cb(`<nes-annotate>
  <script type="application/json">
    [{ "x": 42, "y": 50, "title": "API", "body": "<p>Runs the logic.</p>" }]
  </script>
  <img src="architecture.png" alt="…">
</nes-annotate>`) +
        h2("API") +
        p("Each point in the JSON:") +
        api(
          ["Field", "Type", "Required", "Meaning"],
          [
            ["<code>x</code> / <code>y</code>", "number", "<b>yes</b>", "marker position, in % of the content box"],
            ["<code>title</code>", "string", "—", "popover heading"],
            ["<code>body</code>", "string (HTML)", "—", "popover content"],
            ["<code>label</code>", "string | number", "index+1", "text shown in the marker"],
          ],
        ) +
        apiGroups({ event: [["<code>nes:annotate</code>", "<code>{ index }</code>", "—", "a marker was opened"]] }) +
        a11y("Markers are real <code>&lt;button&gt;</code>s (focusable, Enter to open); Esc or an outside click closes the popover."),
      vi: () =>
        stage(
          "ANNOTATE",
          `<nes-annotate aria-label="Kiến trúc" style="inline-size:100%;max-inline-size:min(520px,100%)">
            <script type="application/json">[
              {"x":12,"y":50,"title":"Client","body":"<p>Trình duyệt/app gửi request.</p>"},
              {"x":42,"y":50,"title":"API","body":"<p>Chạy business logic.</p>"},
              {"x":73,"y":23,"title":"Cache","body":"<p>Phục vụ đọc nóng nhanh.</p>"}
            ]</script>${VIZ_SVG}</nes-annotate>`,
          "col",
        ) +
        cb(`<nes-annotate>
  <script type="application/json">
    [{ "x": 42, "y": 50, "title": "API", "body": "<p>Chạy logic.</p>" }]
  </script>
  <img src="architecture.png" alt="…">
</nes-annotate>`) +
        h2("API") +
        p("Mỗi điểm trong JSON:") +
        api(
          ["Trường", "Kiểu", "Bắt buộc", "Ý nghĩa"],
          [
            ["<code>x</code> / <code>y</code>", "number", "<b>có</b>", "vị trí marker, theo % của khung nội dung"],
            ["<code>title</code>", "string", "—", "tiêu đề popover"],
            ["<code>body</code>", "string (HTML)", "—", "nội dung popover"],
            ["<code>label</code>", "string | number", "index+1", "chữ hiện trong marker"],
          ],
        ) +
        apiGroups({ event: [["<code>nes:annotate</code>", "<code>{ index }</code>", "—", "một marker được mở"]] }) +
        a11y("Marker là <code>&lt;button&gt;</code> thật (focus được, Enter để mở); Esc hoặc click ra ngoài để đóng popover."),
    },
  },
  {
    id: "compare",
    cat: "Visualize",
    name: "Compare",
    desc: {
      en: "A before/after slider: two layers, a draggable divider. Compare two architectures, designs, or states side-by-side.",
      vi: "Slider before/after: hai lớp, vạch chia kéo được. So sánh hai kiến trúc, thiết kế, hay trạng thái cạnh nhau.",
    },
    body: {
      en: () =>
        stage(
          "COMPARE",
          `<nes-compare aria-label="Monolith vs microservices" value="52" style="inline-size:100%;max-inline-size:min(520px,100%)">
            <div style="display:grid;place-items:center;min-block-size:150px;background:var(--panel-2);color:var(--ink);font-family:var(--font-mono)">MONOLITH<br>1 deploy</div>
            <div style="display:grid;place-items:center;min-block-size:150px;background:var(--slot);color:var(--muted);font-family:var(--font-mono)">MICROSERVICES<br>N deploys</div>
          </nes-compare>`,
          "col",
        ) +
        cb(`<nes-compare value="50">
  <img data-label="Before" src="v1.png" alt="…">  <!-- A: revealed layer -->
  <img data-label="After"  src="v2.png" alt="…">  <!-- B: base layer -->
</nes-compare>`) +
        h2("API") +
        apiGroups({
          slot: [["first two children", "layer A (revealed on the left) over layer B (base) — same size"]],
          attr: [["<code>value</code>", "number (0–100)", "<code>50</code>", "initial divider position, in %"]],
          method: [["<code>.set(pos)</code>", "<code>(number) → void</code>", "—", "move the divider to <code>pos</code> %"]],
        }) +
        note("Best with two same-size layers (images, or fixed-size panels). Drag the divider, or focus it and use ←/→.") +
        a11y("The divider is a <code>role=\"slider\"</code> with <code>aria-valuenow</code>; fully keyboard-operable."),
      vi: () =>
        stage(
          "COMPARE",
          `<nes-compare aria-label="Monolith vs microservices" value="52" style="inline-size:100%;max-inline-size:min(520px,100%)">
            <div style="display:grid;place-items:center;min-block-size:150px;background:var(--panel-2);color:var(--ink);font-family:var(--font-mono)">MONOLITH<br>1 deploy</div>
            <div style="display:grid;place-items:center;min-block-size:150px;background:var(--slot);color:var(--muted);font-family:var(--font-mono)">MICROSERVICES<br>N deploys</div>
          </nes-compare>`,
          "col",
        ) +
        cb(`<nes-compare value="50">
  <img data-label="Trước" src="v1.png" alt="…">  <!-- A: lớp hiện ra -->
  <img data-label="Sau"   src="v2.png" alt="…">  <!-- B: lớp nền -->
</nes-compare>`) +
        h2("API") +
        apiGroups({
          slot: [["hai con đầu tiên", "lớp A (hiện bên trái) đè lên lớp B (nền) — cùng kích thước"]],
          attr: [["<code>value</code>", "number (0–100)", "<code>50</code>", "vị trí vạch chia ban đầu, theo %"]],
          method: [["<code>.set(pos)</code>", "<code>(number) → void</code>", "—", "đưa vạch chia tới <code>pos</code> %"]],
        }) +
        note("Tốt nhất với hai lớp cùng kích thước (ảnh, hoặc panel cố định). Kéo vạch chia, hoặc focus rồi dùng ←/→.") +
        a11y("Vạch chia là <code>role=\"slider\"</code> có <code>aria-valuenow</code>; thao tác phím đầy đủ."),
    },
  },
  {
    id: "legend",
    cat: "Visualize",
    name: "Legend",
    desc: {
      en: "A compact color / shape key for a diagram. Pure CSS — one swatch per meaning, recolored with data-accent.",
      vi: "Chú giải màu / ký hiệu gọn cho diagram. Thuần CSS — một ô màu mỗi ý nghĩa, đổi màu bằng data-accent.",
    },
    body: {
      en: () =>
        stage(
          "LEGEND",
          `<div class="legend">
            <span class="legend-item" data-accent="good">Service</span>
            <span class="legend-item" data-accent="cyan">Cache</span>
            <span class="legend-item" data-accent="warn">Queue</span>
            <span class="legend-item" data-accent="crit">External</span>
          </div>`,
          "col",
        ) +
        cb(`<div class="legend">
  <span class="legend-item" data-accent="good">Service</span>
  <span class="legend-item" data-accent="cyan">Cache</span>
</div>`) +
        a11y("Plain inline text with a decorative swatch (<code>::before</code>); the meaning is in the label, so it's read correctly."),
      vi: () =>
        stage(
          "LEGEND",
          `<div class="legend">
            <span class="legend-item" data-accent="good">Service</span>
            <span class="legend-item" data-accent="cyan">Cache</span>
            <span class="legend-item" data-accent="warn">Queue</span>
            <span class="legend-item" data-accent="crit">External</span>
          </div>`,
          "col",
        ) +
        cb(`<div class="legend">
  <span class="legend-item" data-accent="good">Service</span>
  <span class="legend-item" data-accent="cyan">Cache</span>
</div>`) +
        a11y("Chữ inline thường với ô màu trang trí (<code>::before</code>); ý nghĩa nằm ở nhãn nên được đọc đúng."),
    },
  },

  /* --------------------------------------------------- SECOND BRAIN */
  {
    id: "graph",
    cat: "Second Brain",
    name: "Graph",
    desc: {
      en: "A knowledge graph — nodes (notes / concepts) + edges, force-laid-out deterministically as crisp SVG. Click a node to light its neighbourhood. Zero deps; wrap in <nes-zoom> to pan/zoom.",
      vi: "Đồ thị tri thức — node (note / concept) + cạnh, tự dàn theo lực một cách tất định thành SVG sắc nét. Bấm một node để sáng vùng lân cận. Không phụ thuộc; bọc <nes-zoom> để pan/zoom.",
    },
    body: {
      en: () =>
        stage(
          "GRAPH",
          `<nes-graph aria-label="Knowledge graph" style="inline-size:100%;max-inline-size:min(640px,100%)"><script type="application/json">{"nodes":[{"id":"pkm","label":"PKM","group":"purple"},{"id":"zettel","label":"Zettelkasten","group":"purple"},{"id":"atomic","label":"Atomic notes","group":"cyan"},{"id":"link","label":"Linking","group":"cyan"},{"id":"graph","label":"Graph view","group":"lime"},{"id":"moc","label":"Map of content","group":"gold"},{"id":"daily","label":"Daily notes","group":"gold"},{"id":"tag","label":"Tags","group":"good"}],"edges":[{"source":"pkm","target":"zettel"},{"source":"pkm","target":"moc"},{"source":"zettel","target":"atomic"},{"source":"zettel","target":"link"},{"source":"atomic","target":"link"},{"source":"link","target":"graph"},{"source":"moc","target":"link"},{"source":"daily","target":"atomic"},{"source":"tag","target":"link"},{"source":"moc","target":"daily"}]}<\/script></nes-graph>`,
          "col",
        ) +
        cb(
          `<nes-graph aria-label="Knowledge graph">
  <script type="application/json">
  {
    "nodes": [
      { "id": "pkm",    "label": "PKM",         "group": "purple" },
      { "id": "atomic", "label": "Atomic notes", "group": "cyan" },
      { "id": "graph",  "label": "Graph view",   "group": "lime" }
    ],
    "edges": [
      { "source": "pkm", "target": "atomic" },
      { "source": "atomic", "target": "graph" }
    ]
  }
  <\/script>
</nes-graph>

<!-- pan / zoom: just wrap it -->
<nes-zoom><nes-graph> … </nes-graph></nes-zoom>`,
        ) +
        h2("API") +
        apiGroups({
          attr: [
            ["data", "JSON", "—", "graph as <code>{nodes,edges}</code> (or use a child script / the <code>.data</code> prop)"],
            ["focus", "node id", "—", "light a node + its neighbours, dim the rest; unset clears"],
            ["aria-label", "string", `"Knowledge graph"`, "label for the SVG"],
          ],
          prop: [["data", "{nodes,edges}", "—", "get / set the graph — re-lays-out on set"]],
          method: [["focusNode(id)", "(id?)⇒void", "—", "focus a node; omit / null to clear"]],
          event: [["nes:node", "CustomEvent", "—", "a node was clicked — <code>detail {id,label,group}</code>"]],
          slot: [["script[type=application/json]", "the <code>{nodes,edges}</code> data (read once, then removed)"]],
        }) +
        note(
          `<b>node</b> = <code>{ id, label?, group?, x?, y? }</code> · <b>edge</b> = <code>{ source, target }</code>. <code>group</code> is any accent (purple / cyan / lime…) and colours the node; give <code>x</code>/<code>y</code> (0–100) to pin a node, or omit them and the layout places it.`,
        ) +
        a11y(
          `Each node is a focusable <code>role="button"</code> with an <code>aria-label</code> and Enter/Space support; the SVG carries a label. Colour is decorative — the node label carries the meaning.`,
        ),
      vi: () =>
        stage(
          "GRAPH",
          `<nes-graph aria-label="Đồ thị tri thức" style="inline-size:100%;max-inline-size:min(640px,100%)"><script type="application/json">{"nodes":[{"id":"pkm","label":"PKM","group":"purple"},{"id":"zettel","label":"Zettelkasten","group":"purple"},{"id":"atomic","label":"Atomic notes","group":"cyan"},{"id":"link","label":"Linking","group":"cyan"},{"id":"graph","label":"Graph view","group":"lime"},{"id":"moc","label":"Map of content","group":"gold"},{"id":"daily","label":"Daily notes","group":"gold"},{"id":"tag","label":"Tags","group":"good"}],"edges":[{"source":"pkm","target":"zettel"},{"source":"pkm","target":"moc"},{"source":"zettel","target":"atomic"},{"source":"zettel","target":"link"},{"source":"atomic","target":"link"},{"source":"link","target":"graph"},{"source":"moc","target":"link"},{"source":"daily","target":"atomic"},{"source":"tag","target":"link"},{"source":"moc","target":"daily"}]}<\/script></nes-graph>`,
          "col",
        ) +
        cb(
          `<nes-graph aria-label="Đồ thị tri thức">
  <script type="application/json">
  {
    "nodes": [
      { "id": "pkm",    "label": "PKM",         "group": "purple" },
      { "id": "atomic", "label": "Atomic notes", "group": "cyan" },
      { "id": "graph",  "label": "Graph view",   "group": "lime" }
    ],
    "edges": [
      { "source": "pkm", "target": "atomic" },
      { "source": "atomic", "target": "graph" }
    ]
  }
  <\/script>
</nes-graph>

<!-- pan / zoom: chỉ cần bọc lại -->
<nes-zoom><nes-graph> … </nes-graph></nes-zoom>`,
        ) +
        h2("API") +
        apiGroups({
          attr: [
            ["data", "JSON", "—", "đồ thị dạng <code>{nodes,edges}</code> (hoặc dùng script con / prop <code>.data</code>)"],
            ["focus", "node id", "—", "sáng một node + lân cận, mờ phần còn lại; bỏ để xoá"],
            ["aria-label", "string", `"Đồ thị tri thức"`, "nhãn cho SVG"],
          ],
          prop: [["data", "{nodes,edges}", "—", "lấy / gán đồ thị — dàn lại khi gán"]],
          method: [["focusNode(id)", "(id?)⇒void", "—", "focus một node; bỏ / null để xoá"]],
          event: [["nes:node", "CustomEvent", "—", "một node được bấm — <code>detail {id,label,group}</code>"]],
          slot: [["script[type=application/json]", "dữ liệu <code>{nodes,edges}</code> (đọc một lần rồi gỡ)"]],
        }) +
        note(
          `<b>node</b> = <code>{ id, label?, group?, x?, y? }</code> · <b>edge</b> = <code>{ source, target }</code>. <code>group</code> là accent bất kỳ (purple / cyan / lime…) để tô node; cho <code>x</code>/<code>y</code> (0–100) để ghim, hoặc bỏ trống để layout tự đặt.`,
        ) +
        a11y(
          `Mỗi node là <code>role="button"</code> focus được, có <code>aria-label</code> và hỗ trợ Enter/Space; SVG có nhãn. Màu chỉ trang trí — nhãn node mới tải nghĩa.`,
        ),
    },
  },
  {
    id: "note",
    cat: "Second Brain",
    name: "Note card",
    desc: {
      en: "One note in a vault or search result: title + timestamp, a 2-line excerpt, tag pills and a link / backlink readout. data-accent classifies it by folder or domain.",
      vi: "Một note trong vault hoặc kết quả tìm: tiêu đề + thời gian, trích 2 dòng, chip tag và số link / backlink. data-accent phân loại theo thư mục hoặc domain.",
    },
    body: {
      en: () =>
        stage(
          "NOTE",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);inline-size:100%;max-inline-size:min(460px,100%)">
             <article class="note" data-accent="purple"><div class="note-head"><h3 class="note-title">Zettelkasten method</h3><span class="note-time">2d ago</span></div><p class="note-excerpt">Atomic notes, one idea each, densely linked so structure emerges from the links instead of folders.</p><div class="note-tags"><span class="tag">#pkm</span><span class="tag">#method</span></div><div class="note-meta"><nes-icon name="link"></nes-icon> 12 links <nes-icon name="gitBranch"></nes-icon> 4 backlinks</div></article>
             <article class="note" data-accent="cyan"><div class="note-head"><h3 class="note-title">Atomic notes</h3><span class="note-time">5d ago</span></div><p class="note-excerpt">A note should hold exactly one idea, titled as a claim, so it can be linked and reused anywhere.</p><div class="note-tags"><span class="tag">#pkm</span></div><div class="note-meta"><nes-icon name="link"></nes-icon> 7 links <nes-icon name="gitBranch"></nes-icon> 9 backlinks</div></article>
           </div>`,
          "col",
        ) +
        cb(
          `<article class="note" data-accent="purple">
  <div class="note-head">
    <h3 class="note-title">Zettelkasten method</h3>
    <span class="note-time">2d ago</span>
  </div>
  <p class="note-excerpt">Atomic notes, one idea each, densely linked…</p>
  <div class="note-tags"><span class="tag">#pkm</span><span class="tag">#method</span></div>
  <div class="note-meta"><nes-icon name="link"></nes-icon> 12 links <nes-icon name="gitBranch"></nes-icon> 4 backlinks</div>
</article>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>article.note</code>", "the card — <code>data-accent</code> = folder / domain colour"],
            ["<code>.note-head</code>", "title + timestamp row"],
            ["<code>.note-title</code>", "note title (mono)"],
            ["<code>.note-time</code>", "updated time — floats right"],
            ["<code>.note-excerpt</code>", "preview — clamped to 2 lines"],
            ["<code>.note-tags</code>", "row of <code>.tag</code> pills"],
            ["<code>.note-meta</code>", "link / backlink counts"],
          ],
        ) +
        note(
          `Excerpt clamps to two lines, so cards stay the same height in a grid or list. Drop notes into a <code>.grid-cards</code> for a vault view. Tags are <a href="#/wikilink">Tag</a> pills.`,
        ) +
        a11y(
          `Wrap the card in an <code>&lt;a&gt;</code> (or add a heading link) so the whole note is one keyboard target; the <code>.note-meta</code> icons are decorative.`,
        ),
      vi: () =>
        stage(
          "NOTE",
          `<div style="display:flex;flex-direction:column;gap:var(--sp-3);inline-size:100%;max-inline-size:min(460px,100%)">
             <article class="note" data-accent="purple"><div class="note-head"><h3 class="note-title">Phương pháp Zettelkasten</h3><span class="note-time">2 ngày trước</span></div><p class="note-excerpt">Note nguyên tử, mỗi note một ý, liên kết dày để cấu trúc nổi lên từ link thay vì thư mục.</p><div class="note-tags"><span class="tag">#pkm</span><span class="tag">#method</span></div><div class="note-meta"><nes-icon name="link"></nes-icon> 12 links <nes-icon name="gitBranch"></nes-icon> 4 backlinks</div></article>
             <article class="note" data-accent="cyan"><div class="note-head"><h3 class="note-title">Note nguyên tử</h3><span class="note-time">5 ngày trước</span></div><p class="note-excerpt">Một note chỉ nên chứa đúng một ý, đặt tên như một luận điểm, để link và tái dùng ở bất cứ đâu.</p><div class="note-tags"><span class="tag">#pkm</span></div><div class="note-meta"><nes-icon name="link"></nes-icon> 7 links <nes-icon name="gitBranch"></nes-icon> 9 backlinks</div></article>
           </div>`,
          "col",
        ) +
        cb(
          `<article class="note" data-accent="purple">
  <div class="note-head">
    <h3 class="note-title">Phương pháp Zettelkasten</h3>
    <span class="note-time">2 ngày trước</span>
  </div>
  <p class="note-excerpt">Note nguyên tử, mỗi note một ý, liên kết dày…</p>
  <div class="note-tags"><span class="tag">#pkm</span><span class="tag">#method</span></div>
  <div class="note-meta"><nes-icon name="link"></nes-icon> 12 links <nes-icon name="gitBranch"></nes-icon> 4 backlinks</div>
</article>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>article.note</code>", "thẻ — <code>data-accent</code> = màu thư mục / domain"],
            ["<code>.note-head</code>", "hàng tiêu đề + thời gian"],
            ["<code>.note-title</code>", "tiêu đề note (mono)"],
            ["<code>.note-time</code>", "thời gian cập nhật — dạt phải"],
            ["<code>.note-excerpt</code>", "xem trước — cắt còn 2 dòng"],
            ["<code>.note-tags</code>", "hàng chip <code>.tag</code>"],
            ["<code>.note-meta</code>", "số link / backlink"],
          ],
        ) +
        note(
          `Excerpt cắt còn hai dòng nên các thẻ cùng chiều cao trong lưới / danh sách. Bỏ note vào <code>.grid-cards</code> để có view vault. Tag là pill <a href="#/wikilink">Tag</a>.`,
        ) +
        a11y(
          `Bọc thẻ trong <code>&lt;a&gt;</code> (hoặc thêm link tiêu đề) để cả note là một target bàn phím; icon ở <code>.note-meta</code> chỉ trang trí.`,
        ),
    },
  },
  {
    id: "backlinks",
    cat: "Second Brain",
    name: "Backlinks",
    desc: {
      en: "Linked references — the notes that point at this one, each with the sentence it was mentioned in. <mark> highlights the match.",
      vi: "Tham chiếu ngược — các note trỏ tới note này, kèm câu chứa từ được nhắc. <mark> làm nổi phần khớp.",
    },
    body: {
      en: () =>
        stage(
          "BACKLINKS",
          `<section class="backlinks" style="inline-size:100%;max-inline-size:min(460px,100%)">
             <h4 class="backlinks-head"><nes-icon name="gitBranch"></nes-icon> 3 linked references</h4>
             <a class="backlink" href="#"><span class="backlink-title">Daily · 2025-07-20</span><span class="backlink-ctx">…started building a <mark>second brain</mark> with atomic notes today…</span></a>
             <a class="backlink" href="#"><span class="backlink-title">Map of content · PKM</span><span class="backlink-ctx">…the <mark>second brain</mark> idea maps cleanly onto a graph…</span></a>
             <a class="backlink" href="#"><span class="backlink-title">Tools I use</span><span class="backlink-ctx">…Obsidian is my <mark>second brain</mark> of choice for now…</span></a>
           </section>`,
          "col",
        ) +
        cb(
          `<section class="backlinks">
  <h4 class="backlinks-head"><nes-icon name="gitBranch"></nes-icon> 3 linked references</h4>
  <a class="backlink" href="…">
    <span class="backlink-title">Daily · 2025-07-20</span>
    <span class="backlink-ctx">…building a <mark>second brain</mark> with atomic notes…</span>
  </a>
</section>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>section.backlinks</code>", "the panel"],
            ["<code>.backlinks-head</code>", "count heading"],
            ["<code>a.backlink</code>", "one referencing note (a link)"],
            ["<code>.backlink-title</code>", "the source note"],
            ["<code>.backlink-ctx</code>", "the sentence — <code>&lt;mark&gt;</code> the match"],
          ],
        ) +
        note(
          `Pairs with the <a href="#/graph">Graph</a>: the graph shows the shape of the links, backlinks show the exact sentences behind them.`,
        ) +
        a11y(
          `Each backlink is a real link; <code>&lt;mark&gt;</code> conveys emphasis semantically, not by colour alone.`,
        ),
      vi: () =>
        stage(
          "BACKLINKS",
          `<section class="backlinks" style="inline-size:100%;max-inline-size:min(460px,100%)">
             <h4 class="backlinks-head"><nes-icon name="gitBranch"></nes-icon> 3 tham chiếu ngược</h4>
             <a class="backlink" href="#"><span class="backlink-title">Daily · 2025-07-20</span><span class="backlink-ctx">…hôm nay bắt đầu xây <mark>second brain</mark> bằng note nguyên tử…</span></a>
             <a class="backlink" href="#"><span class="backlink-title">Map of content · PKM</span><span class="backlink-ctx">…ý tưởng <mark>second brain</mark> ánh xạ gọn vào một đồ thị…</span></a>
             <a class="backlink" href="#"><span class="backlink-title">Công cụ tôi dùng</span><span class="backlink-ctx">…Obsidian là <mark>second brain</mark> tôi chọn hiện tại…</span></a>
           </section>`,
          "col",
        ) +
        cb(
          `<section class="backlinks">
  <h4 class="backlinks-head"><nes-icon name="gitBranch"></nes-icon> 3 tham chiếu ngược</h4>
  <a class="backlink" href="…">
    <span class="backlink-title">Daily · 2025-07-20</span>
    <span class="backlink-ctx">…xây <mark>second brain</mark> bằng note nguyên tử…</span>
  </a>
</section>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>section.backlinks</code>", "khối panel"],
            ["<code>.backlinks-head</code>", "tiêu đề đếm"],
            ["<code>a.backlink</code>", "một note tham chiếu (là link)"],
            ["<code>.backlink-title</code>", "note nguồn"],
            ["<code>.backlink-ctx</code>", "câu văn — <code>&lt;mark&gt;</code> phần khớp"],
          ],
        ) +
        note(
          `Đi cặp với <a href="#/graph">Graph</a>: đồ thị cho thấy hình dạng liên kết, backlinks cho thấy đúng câu văn phía sau.`,
        ) +
        a11y(
          `Mỗi backlink là link thật; <code>&lt;mark&gt;</code> truyền tải nhấn mạnh theo ngữ nghĩa, không chỉ bằng màu.`,
        ),
    },
  },
  {
    id: "wikilink",
    cat: "Second Brain",
    name: "Wiki-link & Tag",
    desc: {
      en: "The inline glue of a vault: [[wiki-links]] between notes (dim when the target doesn't exist yet) and #tag pills to filter by.",
      vi: "Chất keo inline của vault: [[wiki-link]] giữa các note (mờ khi note đích chưa tồn tại) và pill #tag để lọc.",
    },
    body: {
      en: () =>
        stage(
          "WIKILINK",
          `<div style="max-inline-size:min(520px,100%)">
             <p style="color:var(--text);margin:0 0 var(--sp-3)">A <a class="wikilink" href="#">[[second brain]]</a> is built from <a class="wikilink" href="#">[[atomic notes]]</a> joined by links. A <a class="wikilink new" href="#">[[spaced repetition]]</a> note doesn't exist yet.</p>
             <div class="note-tags"><span class="tag">#pkm</span><span class="tag">#zettelkasten</span><span class="tag">#evergreen</span></div>
           </div>`,
          "col",
        ) +
        cb(
          `<p>A <a class="wikilink" href="…">[[second brain]]</a> is built from
   <a class="wikilink" href="…">[[atomic notes]]</a>.
   <a class="wikilink new" href="…">[[spaced repetition]]</a> doesn't exist yet.</p>

<span class="tag">#pkm</span> <span class="tag">#zettelkasten</span>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>a.wikilink</code>", "an internal <code>[[link]]</code> — dashed underline"],
            ["<code>a.wikilink.new</code>", "unresolved — the target note doesn't exist yet (dim)"],
            ["<code>.tag</code>", "a <code>#tag</code> pill — tap to filter"],
          ],
        ) +
        note(
          `Keep the <code>[[ ]]</code> brackets in the visible text — it's the vault convention readers recognise. <code>.tag</code> is also what <a href="#/note">Note</a> cards use.`,
        ) +
        a11y(
          `Both are real links / controls with focus states. <code>.new</code> is dimmer, so also mark it (title / <code>aria-label</code> "create note") rather than relying on colour alone.`,
        ),
      vi: () =>
        stage(
          "WIKILINK",
          `<div style="max-inline-size:min(520px,100%)">
             <p style="color:var(--text);margin:0 0 var(--sp-3)">Một <a class="wikilink" href="#">[[second brain]]</a> được xây từ các <a class="wikilink" href="#">[[atomic notes]]</a> nối bằng link. Note <a class="wikilink new" href="#">[[spaced repetition]]</a> thì chưa tồn tại.</p>
             <div class="note-tags"><span class="tag">#pkm</span><span class="tag">#zettelkasten</span><span class="tag">#evergreen</span></div>
           </div>`,
          "col",
        ) +
        cb(
          `<p>Một <a class="wikilink" href="…">[[second brain]]</a> xây từ
   <a class="wikilink" href="…">[[atomic notes]]</a>.
   <a class="wikilink new" href="…">[[spaced repetition]]</a> chưa tồn tại.</p>

<span class="tag">#pkm</span> <span class="tag">#zettelkasten</span>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>a.wikilink</code>", "một <code>[[link]]</code> nội bộ — gạch chân nét đứt"],
            ["<code>a.wikilink.new</code>", "chưa resolve — note đích chưa tồn tại (mờ)"],
            ["<code>.tag</code>", "pill <code>#tag</code> — bấm để lọc"],
          ],
        ) +
        note(
          `Giữ ngoặc <code>[[ ]]</code> trong chữ hiển thị — đó là quy ước vault người đọc nhận ra. <code>.tag</code> cũng là thứ <a href="#/note">Note</a> card dùng.`,
        ) +
        a11y(
          `Cả hai đều là link / control thật có trạng thái focus. <code>.new</code> mờ hơn, nên cũng đánh dấu (title / <code>aria-label</code> "tạo note") thay vì chỉ dựa vào màu.`,
        ),
    },
  },
  {
    id: "props",
    cat: "Second Brain",
    name: "Properties",
    desc: {
      en: "Frontmatter / metadata as a clean key→value grid (Obsidian Properties). Values can hold tags, wiki-links or plain text.",
      vi: "Frontmatter / metadata thành lưới key→value sạch (Obsidian Properties). Giá trị có thể chứa tag, wiki-link hoặc chữ thường.",
    },
    body: {
      en: () =>
        stage(
          "PROPS",
          `<dl class="props" style="max-inline-size:min(460px,100%)"><dt>Status</dt><dd><span class="maturity evergreen">evergreen</span></dd><dt>Tags</dt><dd><span class="tag">#pkm</span><span class="tag">#method</span></dd><dt>Related</dt><dd><a class="wikilink" href="#">[[atomic notes]]</a></dd><dt>Created</dt><dd>2025-07-14</dd></dl>`,
          "col",
        ) +
        cb(
          `<dl class="props">
  <dt>Status</dt>  <dd><span class="maturity evergreen">evergreen</span></dd>
  <dt>Tags</dt>    <dd><span class="tag">#pkm</span> <span class="tag">#method</span></dd>
  <dt>Related</dt> <dd><a class="wikilink" href="…">[[atomic notes]]</a></dd>
  <dt>Created</dt> <dd>2025-07-14</dd>
</dl>`,
        ) +
        h2("Parts") +
        api(
          ["Class / element", "Role"],
          [
            ["<code>dl.props</code>", "the key→value grid"],
            ["<code>dt</code>", "the property name (mono, dim)"],
            ["<code>dd</code>", "the value — wraps tags / links / text"],
          ],
        ) +
        note(`A real <code>&lt;dl&gt;</code>, so the key/value pairing is semantic. Values are free HTML — drop in <a href="#/wikilink">Tag</a>s, wiki-links or a <a href="#/maturity">Maturity</a> badge.`) +
        a11y(`The <code>&lt;dl&gt;/&lt;dt&gt;/&lt;dd&gt;</code> structure conveys the key→value relationship to screen readers without extra ARIA.`),
      vi: () =>
        stage(
          "PROPS",
          `<dl class="props" style="max-inline-size:min(460px,100%)"><dt>Status</dt><dd><span class="maturity evergreen">evergreen</span></dd><dt>Tags</dt><dd><span class="tag">#pkm</span><span class="tag">#method</span></dd><dt>Related</dt><dd><a class="wikilink" href="#">[[atomic notes]]</a></dd><dt>Created</dt><dd>2025-07-14</dd></dl>`,
          "col",
        ) +
        cb(
          `<dl class="props">
  <dt>Status</dt>  <dd><span class="maturity evergreen">evergreen</span></dd>
  <dt>Tags</dt>    <dd><span class="tag">#pkm</span> <span class="tag">#method</span></dd>
  <dt>Related</dt> <dd><a class="wikilink" href="…">[[atomic notes]]</a></dd>
  <dt>Created</dt> <dd>2025-07-14</dd>
</dl>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class / element", "Vai trò"],
          [
            ["<code>dl.props</code>", "lưới key→value"],
            ["<code>dt</code>", "tên thuộc tính (mono, mờ)"],
            ["<code>dd</code>", "giá trị — bọc tag / link / chữ"],
          ],
        ) +
        note(`<code>&lt;dl&gt;</code> thật nên cặp key/value có ngữ nghĩa. Giá trị là HTML tự do — bỏ <a href="#/wikilink">Tag</a>, wiki-link hay badge <a href="#/maturity">Maturity</a> vào.`) +
        a11y(`Cấu trúc <code>&lt;dl&gt;/&lt;dt&gt;/&lt;dd&gt;</code> truyền quan hệ key→value cho screen reader mà không cần ARIA thêm.`),
    },
  },
  {
    id: "outline",
    cat: "Second Brain",
    name: "Outline",
    desc: {
      en: "The heading tree of the current note — jump around a long document. Indent by level, light the active heading on scroll.",
      vi: "Cây heading của note hiện tại — nhảy quanh tài liệu dài. Thụt theo cấp, sáng heading đang xem khi cuộn.",
    },
    body: {
      en: () =>
        stage(
          "OUTLINE",
          `<nav class="outline" style="max-inline-size:min(320px,100%)"><a href="#">Overview</a><a class="lvl-2 active" href="#">Why a second brain</a><a class="lvl-2" href="#">Capture</a><a class="lvl-3" href="#">Inbox</a><a class="lvl-3" href="#">Daily notes</a><a href="#">Linking</a><a class="lvl-2" href="#">Backlinks</a></nav>`,
          "col",
        ) +
        cb(
          `<nav class="outline">
  <a href="#h1">Overview</a>
  <a class="lvl-2 active" href="#h2">Why a second brain</a>
  <a class="lvl-2" href="#h3">Capture</a>
  <a class="lvl-3" href="#h4">Inbox</a>
  <a href="#h5">Linking</a>
</nav>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>nav.outline</code>", "the list"],
            ["<code>a</code>", "one heading link"],
            ["<code>.lvl-2</code> / <code>.lvl-3</code>", "indent for H2 / H3"],
            ["<code>.active</code>", "the heading currently in view"],
          ],
        ) +
        note(`Toggle <code>.active</code> with an <code>IntersectionObserver</code> scroll-spy (the docs "On this page" rail does exactly this).`) +
        a11y(`Wrap it in <code>&lt;nav aria-label="Outline"&gt;</code>; the links are real anchors, keyboard-navigable by default.`),
      vi: () =>
        stage(
          "OUTLINE",
          `<nav class="outline" style="max-inline-size:min(320px,100%)"><a href="#">Tổng quan</a><a class="lvl-2 active" href="#">Vì sao cần second brain</a><a class="lvl-2" href="#">Thu thập</a><a class="lvl-3" href="#">Inbox</a><a class="lvl-3" href="#">Daily notes</a><a href="#">Liên kết</a><a class="lvl-2" href="#">Backlinks</a></nav>`,
          "col",
        ) +
        cb(
          `<nav class="outline">
  <a href="#h1">Tổng quan</a>
  <a class="lvl-2 active" href="#h2">Vì sao cần second brain</a>
  <a class="lvl-2" href="#h3">Thu thập</a>
  <a class="lvl-3" href="#h4">Inbox</a>
  <a href="#h5">Liên kết</a>
</nav>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>nav.outline</code>", "danh sách"],
            ["<code>a</code>", "một link heading"],
            ["<code>.lvl-2</code> / <code>.lvl-3</code>", "thụt cho H2 / H3"],
            ["<code>.active</code>", "heading đang xem"],
          ],
        ) +
        note(`Bật <code>.active</code> bằng scroll-spy <code>IntersectionObserver</code> (thanh "On this page" của docs làm đúng vậy).`) +
        a11y(`Bọc trong <code>&lt;nav aria-label="Outline"&gt;</code>; link là anchor thật, đi bàn phím sẵn.`),
    },
  },
  {
    id: "heatmap",
    cat: "Second Brain",
    name: "Activity heatmap",
    desc: {
      en: "A contribution grid — how many notes you touched each day. 7 rows of weekdays, columns of weeks, ink by level.",
      vi: "Lưới hoạt động — mỗi ngày chạm bao nhiêu note. 7 hàng thứ trong tuần, cột là tuần, đậm theo level.",
    },
    body: {
      en: () =>
        stage(
          "HEATMAP",
          `<div style="overflow-x:auto;max-inline-size:100%"><div class="heatmap">${Array.from({ length: 63 }, (_, i) => `<i data-level="${[0, 1, 0, 2, 3, 1, 0, 4, 2, 1, 0, 3, 2, 0, 1, 4, 0, 2, 1, 3, 0][i % 21]}"></i>`).join("")}</div></div>`,
          "col",
        ) +
        cb(
          `<div class="heatmap">
  <i data-level="0"></i><i data-level="2"></i><i data-level="4"></i>
  <!-- one <i> per day: level 0 (none) … 4 (busiest) -->
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class / attr", "Role"],
          [
            ["<code>.heatmap</code>", "the grid — 7 weekday rows, columns flow as weeks"],
            ["<code>i[data-level]</code>", "one day — <code>0</code>–<code>4</code> sets the ink"],
            ["<code>data-accent</code>", "recolour the ramp (default green)"],
          ],
        ) +
        note(`Wrap it in an <code>overflow-x:auto</code> div so a year of columns scrolls on mobile instead of squishing.`) +
        a11y(`Colour-only on its own — add a <code>title</code> per cell ("3 notes · Jul 14") and an off-screen summary of the total.`),
      vi: () =>
        stage(
          "HEATMAP",
          `<div style="overflow-x:auto;max-inline-size:100%"><div class="heatmap">${Array.from({ length: 63 }, (_, i) => `<i data-level="${[0, 1, 0, 2, 3, 1, 0, 4, 2, 1, 0, 3, 2, 0, 1, 4, 0, 2, 1, 3, 0][i % 21]}"></i>`).join("")}</div></div>`,
          "col",
        ) +
        cb(
          `<div class="heatmap">
  <i data-level="0"></i><i data-level="2"></i><i data-level="4"></i>
  <!-- mỗi ngày một <i>: level 0 (không) … 4 (bận nhất) -->
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class / attr", "Vai trò"],
          [
            ["<code>.heatmap</code>", "lưới — 7 hàng thứ, cột chảy theo tuần"],
            ["<code>i[data-level]</code>", "một ngày — <code>0</code>–<code>4</code> đặt độ đậm"],
            ["<code>data-accent</code>", "đổi màu thang (mặc định green)"],
          ],
        ) +
        note(`Bọc trong div <code>overflow-x:auto</code> để cả năm cột cuộn ngang trên mobile thay vì bị bóp.`) +
        a11y(`Chỉ dùng màu nên yếu — thêm <code>title</code> mỗi ô ("3 note · 14/07") và một tóm tắt tổng ẩn cho screen reader.`),
    },
  },
  {
    id: "board",
    cat: "Second Brain",
    name: "Board",
    desc: {
      en: "A Kanban board — horizontally-scrolling columns of note cards. Give each column a data-accent for its top bar.",
      vi: "Bảng Kanban — các cột thẻ note cuộn ngang. Cho mỗi cột một data-accent cho thanh trên.",
    },
    body: {
      en: () =>
        stage(
          "BOARD",
          `<div class="board" style="max-inline-size:100%"><div class="board-col" data-accent="steel"><div class="board-head">Inbox <span class="count">2</span></div><div class="board-card">Clip: force-layout papers</div><div class="board-card">Idea: 8-bit graph view</div></div><div class="board-col" data-accent="gold"><div class="board-head">Growing <span class="count">1</span></div><div class="board-card">Zettelkasten method</div></div><div class="board-col" data-accent="good"><div class="board-head">Evergreen <span class="count">1</span></div><div class="board-card">Atomic notes</div></div></div>`,
          "col",
        ) +
        cb(
          `<div class="board">
  <div class="board-col" data-accent="steel">
    <div class="board-head">Inbox <span class="count">2</span></div>
    <div class="board-card">Clip: force-layout papers</div>
    <div class="board-card">Idea: 8-bit graph view</div>
  </div>
  <div class="board-col" data-accent="good">
    <div class="board-head">Evergreen <span class="count">1</span></div>
    <div class="board-card">Atomic notes</div>
  </div>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.board</code>", "the row of columns (scrolls x)"],
            ["<code>.board-col</code>", "one column — <code>data-accent</code> tints its top bar"],
            ["<code>.board-head</code>", "column title + <code>.count</code>"],
            ["<code>.board-card</code>", "one card (looks draggable — wire DnD in JS)"],
          ],
        ) +
        note(`Cards are plain divs; for real drag-and-drop between columns, wire the HTML Drag-and-Drop or pointer events in JS.`) +
        a11y(`Make each card a real control (button / link) and expose column moves via a keyboard menu — drag alone isn't accessible.`),
      vi: () =>
        stage(
          "BOARD",
          `<div class="board" style="max-inline-size:100%"><div class="board-col" data-accent="steel"><div class="board-head">Inbox <span class="count">2</span></div><div class="board-card">Clip: paper về force-layout</div><div class="board-card">Ý tưởng: graph 8-bit</div></div><div class="board-col" data-accent="gold"><div class="board-head">Đang lớn <span class="count">1</span></div><div class="board-card">Phương pháp Zettelkasten</div></div><div class="board-col" data-accent="good"><div class="board-head">Evergreen <span class="count">1</span></div><div class="board-card">Note nguyên tử</div></div></div>`,
          "col",
        ) +
        cb(
          `<div class="board">
  <div class="board-col" data-accent="steel">
    <div class="board-head">Inbox <span class="count">2</span></div>
    <div class="board-card">Clip: paper về force-layout</div>
    <div class="board-card">Ý tưởng: graph 8-bit</div>
  </div>
  <div class="board-col" data-accent="good">
    <div class="board-head">Evergreen <span class="count">1</span></div>
    <div class="board-card">Note nguyên tử</div>
  </div>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.board</code>", "hàng các cột (cuộn x)"],
            ["<code>.board-col</code>", "một cột — <code>data-accent</code> tô thanh trên"],
            ["<code>.board-head</code>", "tiêu đề cột + <code>.count</code>"],
            ["<code>.board-card</code>", "một thẻ (trông kéo được — wire DnD bằng JS)"],
          ],
        ) +
        note(`Thẻ là div thường; muốn kéo-thả thật giữa các cột thì wire HTML Drag-and-Drop hoặc pointer event bằng JS.`) +
        a11y(`Cho mỗi thẻ là control thật (button / link) và cho phép chuyển cột qua menu bàn phím — chỉ kéo-thả thì không tiếp cận được.`),
    },
  },
  {
    id: "palette",
    cat: "Second Brain",
    name: "Command palette",
    desc: {
      en: "A quick-switcher / command palette (Cmd-K): a search box over a result list. Drop it in a modal; wire filtering in JS.",
      vi: "Quick-switcher / command palette (Cmd-K): ô tìm trên danh sách kết quả. Bỏ vào modal; wire lọc bằng JS.",
    },
    body: {
      en: () =>
        stage(
          "PALETTE",
          `<div class="palette" style="inline-size:100%;max-inline-size:min(460px,100%)"><div class="palette-input"><nes-icon name="search"></nes-icon><input placeholder="Search notes or run a command…" value="atom"></div><div class="palette-list"><a class="result active"><nes-icon name="file" class="result-icon"></nes-icon><span class="result-body"><span class="result-title"><mark>Atom</mark>ic notes</span><span class="result-path">pkm / methods</span></span><kbd class="kbd result-hint">↵</kbd></a><a class="result"><nes-icon name="file" class="result-icon"></nes-icon><span class="result-body"><span class="result-title">Zettelkasten method</span><span class="result-path">pkm</span></span></a><a class="result"><nes-icon name="bolt" class="result-icon"></nes-icon><span class="result-body"><span class="result-title">Command: New daily note</span><span class="result-path">action</span></span></a></div></div>`,
          "col",
        ) +
        cb(
          `<div class="palette">
  <div class="palette-input">
    <nes-icon name="search"></nes-icon>
    <input placeholder="Search notes or run a command…">
  </div>
  <div class="palette-list">
    <a class="result active"> … </a>
    <a class="result"> … </a>
  </div>
</div>

<!-- for Cmd-K, put it in a <dialog class="modal"> -->`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.palette</code>", "the floating panel"],
            ["<code>.palette-input</code>", "search row (icon + input)"],
            ["<code>.palette-list</code>", "scrollable results — holds <a href=\"#/result\">Result</a> rows"],
            ["<code>.palette-empty</code>", "the \"no matches\" state"],
          ],
        ) +
        note(`This is the shell — filter the rows and move <code>.active</code> with ↑/↓ in JS. Open it inside a <a href="#/modal">Modal</a> for a real Cmd-K overlay.`) +
        a11y(`Use <code>role="listbox"</code> + <code>aria-activedescendant</code> on the input so arrow-key selection is announced; Enter activates the active row, Esc closes.`),
      vi: () =>
        stage(
          "PALETTE",
          `<div class="palette" style="inline-size:100%;max-inline-size:min(460px,100%)"><div class="palette-input"><nes-icon name="search"></nes-icon><input placeholder="Tìm note hoặc chạy lệnh…" value="atom"></div><div class="palette-list"><a class="result active"><nes-icon name="file" class="result-icon"></nes-icon><span class="result-body"><span class="result-title"><mark>Atom</mark>ic notes</span><span class="result-path">pkm / methods</span></span><kbd class="kbd result-hint">↵</kbd></a><a class="result"><nes-icon name="file" class="result-icon"></nes-icon><span class="result-body"><span class="result-title">Phương pháp Zettelkasten</span><span class="result-path">pkm</span></span></a><a class="result"><nes-icon name="bolt" class="result-icon"></nes-icon><span class="result-body"><span class="result-title">Lệnh: Tạo daily note</span><span class="result-path">action</span></span></a></div></div>`,
          "col",
        ) +
        cb(
          `<div class="palette">
  <div class="palette-input">
    <nes-icon name="search"></nes-icon>
    <input placeholder="Tìm note hoặc chạy lệnh…">
  </div>
  <div class="palette-list">
    <a class="result active"> … </a>
    <a class="result"> … </a>
  </div>
</div>

<!-- cho Cmd-K, bỏ vào <dialog class="modal"> -->`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.palette</code>", "panel nổi"],
            ["<code>.palette-input</code>", "hàng tìm (icon + input)"],
            ["<code>.palette-list</code>", "kết quả cuộn — chứa hàng <a href=\"#/result\">Result</a>"],
            ["<code>.palette-empty</code>", "trạng thái \"không khớp\""],
          ],
        ) +
        note(`Đây là phần vỏ — lọc hàng và di chuyển <code>.active</code> bằng ↑/↓ trong JS. Mở trong <a href="#/modal">Modal</a> để có overlay Cmd-K thật.`) +
        a11y(`Dùng <code>role="listbox"</code> + <code>aria-activedescendant</code> trên input để chọn bằng phím mũi tên được đọc; Enter kích hoạt hàng active, Esc đóng.`),
    },
  },
  {
    id: "result",
    cat: "Second Brain",
    name: "Search result",
    desc: {
      en: "One search hit or palette row: an icon, a title with the matched text <mark>ed, a dim path, and an optional key hint.",
      vi: "Một kết quả tìm hoặc hàng palette: icon, tiêu đề có <mark> phần khớp, đường dẫn mờ, và gợi ý phím tuỳ chọn.",
    },
    body: {
      en: () =>
        stage(
          "RESULT",
          `<div style="display:flex;flex-direction:column;gap:2px;inline-size:100%;max-inline-size:min(460px,100%)"><a class="result active"><nes-icon name="file" class="result-icon"></nes-icon><span class="result-body"><span class="result-title"><mark>Atom</mark>ic notes</span><span class="result-path">pkm / methods / atomic-notes.md</span></span><kbd class="kbd result-hint">↵</kbd></a><a class="result"><nes-icon name="tag" class="result-icon"></nes-icon><span class="result-body"><span class="result-title">#<mark>atom</mark>ic</span><span class="result-path">12 notes</span></span></a></div>`,
          "col",
        ) +
        cb(
          `<a class="result active">
  <nes-icon name="file" class="result-icon"></nes-icon>
  <span class="result-body">
    <span class="result-title"><mark>Atom</mark>ic notes</span>
    <span class="result-path">pkm / methods / atomic-notes.md</span>
  </span>
  <kbd class="kbd result-hint">↵</kbd>
</a>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.result</code>", "one row (a link or button)"],
            ["<code>.result-icon</code>", "leading kind icon"],
            ["<code>.result-title</code>", "the hit — <code>&lt;mark&gt;</code> the match; ellipsizes"],
            ["<code>.result-path</code>", "the note path / meta"],
            ["<code>.result-hint</code>", "trailing key hint (a <a href=\"#/kbd\">Kbd</a>)"],
            ["<code>.active</code>", "keyboard-selected row"],
          ],
        ) +
        note(`The row of a <a href="#/palette">Command palette</a>, but also stands alone for a full search page. Only one row is <code>.active</code> at a time.`) +
        a11y(`If it's a list, use <code>role="option"</code> in a <code>role="listbox"</code>; <code>&lt;mark&gt;</code> carries emphasis semantically.`),
      vi: () =>
        stage(
          "RESULT",
          `<div style="display:flex;flex-direction:column;gap:2px;inline-size:100%;max-inline-size:min(460px,100%)"><a class="result active"><nes-icon name="file" class="result-icon"></nes-icon><span class="result-body"><span class="result-title"><mark>Atom</mark>ic notes</span><span class="result-path">pkm / methods / atomic-notes.md</span></span><kbd class="kbd result-hint">↵</kbd></a><a class="result"><nes-icon name="tag" class="result-icon"></nes-icon><span class="result-body"><span class="result-title">#<mark>atom</mark>ic</span><span class="result-path">12 note</span></span></a></div>`,
          "col",
        ) +
        cb(
          `<a class="result active">
  <nes-icon name="file" class="result-icon"></nes-icon>
  <span class="result-body">
    <span class="result-title"><mark>Atom</mark>ic notes</span>
    <span class="result-path">pkm / methods / atomic-notes.md</span>
  </span>
  <kbd class="kbd result-hint">↵</kbd>
</a>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.result</code>", "một hàng (link hoặc button)"],
            ["<code>.result-icon</code>", "icon loại ở đầu"],
            ["<code>.result-title</code>", "kết quả — <code>&lt;mark&gt;</code> phần khớp; rút gọn"],
            ["<code>.result-path</code>", "đường dẫn / meta của note"],
            ["<code>.result-hint</code>", "gợi ý phím ở cuối (một <a href=\"#/kbd\">Kbd</a>)"],
            ["<code>.active</code>", "hàng đang chọn bằng phím"],
          ],
        ) +
        note(`Là hàng của <a href="#/palette">Command palette</a>, nhưng cũng đứng riêng cho trang tìm kiếm. Chỉ một hàng <code>.active</code> tại một thời điểm.`) +
        a11y(`Nếu là danh sách, dùng <code>role="option"</code> trong <code>role="listbox"</code>; <code>&lt;mark&gt;</code> tải nhấn mạnh theo ngữ nghĩa.`),
    },
  },
  {
    id: "embed",
    cat: "Second Brain",
    name: "Note embed",
    desc: {
      en: "A transcluded note (Obsidian ![[note]]): another note's content quoted inline, with a link back to the source.",
      vi: "Note nhúng (Obsidian ![[note]]): nội dung một note khác trích inline, kèm link về nguồn.",
    },
    body: {
      en: () =>
        stage(
          "EMBED",
          `<div class="embed" data-accent="purple" style="max-inline-size:min(520px,100%)"><div class="embed-head"><nes-icon name="file"></nes-icon><a href="#">[[Atomic notes]]</a></div><p style="margin:0;color:var(--muted)">A note should hold exactly one idea, titled as a claim, so it can be linked and reused anywhere.</p></div>`,
          "col",
        ) +
        cb(
          `<div class="embed" data-accent="purple">
  <div class="embed-head">
    <nes-icon name="file"></nes-icon>
    <a href="…">[[Atomic notes]]</a>
  </div>
  <p>A note should hold exactly one idea…</p>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.embed</code>", "the transclusion block — <code>data-accent</code> tints the bar"],
            ["<code>.embed-head</code>", "source label (icon + wiki-link back)"],
            ["<code>*</code>", "the embedded content (any HTML)"],
          ],
        ) +
        note(`For the whole card to be one click-through to the source note, keep the <code>.embed-head</code> link and don't nest other links inside the body.`) +
        a11y(`Mark it as a quote of another document — a <code>&lt;figure&gt;</code> with a <code>&lt;figcaption&gt;</code> header reads well here.`),
      vi: () =>
        stage(
          "EMBED",
          `<div class="embed" data-accent="purple" style="max-inline-size:min(520px,100%)"><div class="embed-head"><nes-icon name="file"></nes-icon><a href="#">[[Atomic notes]]</a></div><p style="margin:0;color:var(--muted)">Một note chỉ nên chứa đúng một ý, đặt tên như một luận điểm, để link và tái dùng ở bất cứ đâu.</p></div>`,
          "col",
        ) +
        cb(
          `<div class="embed" data-accent="purple">
  <div class="embed-head">
    <nes-icon name="file"></nes-icon>
    <a href="…">[[Atomic notes]]</a>
  </div>
  <p>Một note chỉ nên chứa đúng một ý…</p>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.embed</code>", "khối nhúng — <code>data-accent</code> tô thanh"],
            ["<code>.embed-head</code>", "nhãn nguồn (icon + wiki-link về)"],
            ["<code>*</code>", "nội dung nhúng (HTML bất kỳ)"],
          ],
        ) +
        note(`Để cả thẻ là một cú click về note nguồn, giữ link <code>.embed-head</code> và đừng lồng link khác trong thân.`) +
        a11y(`Đánh dấu là trích một tài liệu khác — <code>&lt;figure&gt;</code> với header <code>&lt;figcaption&gt;</code> đọc tốt ở đây.`),
    },
  },
  {
    id: "maturity",
    cat: "Second Brain",
    name: "Maturity",
    desc: {
      en: "A digital-garden growth stage: 🌱 seedling · 🌿 budding · 🌳 evergreen — how ripe a note is, at a glance.",
      vi: "Giai đoạn phát triển kiểu digital garden: 🌱 seedling · 🌿 budding · 🌳 evergreen — note chín tới đâu, nhìn là biết.",
    },
    body: {
      en: () =>
        stage(
          "MATURITY",
          `<span class="maturity">seedling</span> <span class="maturity budding">budding</span> <span class="maturity evergreen">evergreen</span>`,
        ) +
        cb(
          `<span class="maturity">seedling</span>
<span class="maturity budding">budding</span>
<span class="maturity evergreen">evergreen</span>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Stage"],
          [
            ["<code>.maturity</code>", "🌱 seedling — a raw capture / stub"],
            ["<code>.maturity.budding</code>", "🌿 budding — developing, half-formed"],
            ["<code>.maturity.evergreen</code>", "🌳 evergreen — polished, maintained"],
          ],
        ) +
        note(`A common digital-garden convention — surface it on a <a href="#/note">Note</a> card or in <a href="#/props">Properties</a> so readers know how much to trust a note.`) +
        a11y(`The word ("evergreen") carries the meaning; the emoji is decorative (it's a CSS <code>::before</code>, so it won't be read out).`),
      vi: () =>
        stage(
          "MATURITY",
          `<span class="maturity">seedling</span> <span class="maturity budding">budding</span> <span class="maturity evergreen">evergreen</span>`,
        ) +
        cb(
          `<span class="maturity">seedling</span>
<span class="maturity budding">budding</span>
<span class="maturity evergreen">evergreen</span>`,
        ) +
        h2("Giai đoạn") +
        api(
          ["Class", "Giai đoạn"],
          [
            ["<code>.maturity</code>", "🌱 seedling — mới ghi / phôi thai"],
            ["<code>.maturity.budding</code>", "🌿 budding — đang phát triển, chưa xong"],
            ["<code>.maturity.evergreen</code>", "🌳 evergreen — trau chuốt, được duy trì"],
          ],
        ) +
        note(`Quy ước quen thuộc của digital garden — hiện nó trên thẻ <a href="#/note">Note</a> hoặc trong <a href="#/props">Properties</a> để người đọc biết tin note tới đâu.`) +
        a11y(`Chữ ("evergreen") tải nghĩa; emoji chỉ trang trí (là <code>::before</code> nên không bị đọc lên).`),
    },
  },
  {
    id: "tagcloud",
    cat: "Second Brain",
    name: "Tag cloud",
    desc: {
      en: "A weighted panel of tags with counts — the hottest topics grow bigger and greener. Tap one to filter the vault.",
      vi: "Bảng tag có trọng số kèm số đếm — chủ đề nóng nhất to và xanh hơn. Bấm một tag để lọc vault.",
    },
    body: {
      en: () =>
        stage(
          "TAGCLOUD",
          `<div class="tag-cloud" style="max-inline-size:min(460px,100%)"><span class="tag" data-weight="3">#pkm<span class="tag-n">42</span></span><span class="tag" data-weight="2">#zettelkasten<span class="tag-n">18</span></span><span class="tag">#evergreen<span class="tag-n">9</span></span><span class="tag" data-weight="2">#method<span class="tag-n">15</span></span><span class="tag">#daily<span class="tag-n">6</span></span><span class="tag">#idea<span class="tag-n">4</span></span></div>`,
          "col",
        ) +
        cb(
          `<div class="tag-cloud">
  <span class="tag" data-weight="3">#pkm <span class="tag-n">42</span></span>
  <span class="tag" data-weight="2">#method <span class="tag-n">15</span></span>
  <span class="tag">#daily <span class="tag-n">6</span></span>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class / attr", "Role"],
          [
            ["<code>.tag-cloud</code>", "the wrap panel"],
            ["<code>.tag</code>", "one tag pill (see <a href=\"#/wikilink\">Tag</a>)"],
            ["<code>data-weight</code>", "<code>2</code> or <code>3</code> grow the hottest tags"],
            ["<code>.tag-n</code>", "the note count"],
          ],
        ) +
        note(`Bucket your counts into weights (e.g. top 10% → <code>3</code>, next 30% → <code>2</code>) so the cloud reads at a glance.`) +
        a11y(`Size is decorative — the count text carries the weight. Make each tag a real link/button to its filtered view.`),
      vi: () =>
        stage(
          "TAGCLOUD",
          `<div class="tag-cloud" style="max-inline-size:min(460px,100%)"><span class="tag" data-weight="3">#pkm<span class="tag-n">42</span></span><span class="tag" data-weight="2">#zettelkasten<span class="tag-n">18</span></span><span class="tag">#evergreen<span class="tag-n">9</span></span><span class="tag" data-weight="2">#method<span class="tag-n">15</span></span><span class="tag">#daily<span class="tag-n">6</span></span><span class="tag">#idea<span class="tag-n">4</span></span></div>`,
          "col",
        ) +
        cb(
          `<div class="tag-cloud">
  <span class="tag" data-weight="3">#pkm <span class="tag-n">42</span></span>
  <span class="tag" data-weight="2">#method <span class="tag-n">15</span></span>
  <span class="tag">#daily <span class="tag-n">6</span></span>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class / attr", "Vai trò"],
          [
            ["<code>.tag-cloud</code>", "bảng wrap"],
            ["<code>.tag</code>", "một pill tag (xem <a href=\"#/wikilink\">Tag</a>)"],
            ["<code>data-weight</code>", "<code>2</code> hoặc <code>3</code> phóng to tag nóng"],
            ["<code>.tag-n</code>", "số note"],
          ],
        ) +
        note(`Gom số đếm thành trọng số (vd top 10% → <code>3</code>, 30% kế → <code>2</code>) để cloud đọc được ngay.`) +
        a11y(`Cỡ chữ chỉ trang trí — số đếm mới tải trọng số. Cho mỗi tag là link/button thật tới view đã lọc.`),
    },
  },
  {
    id: "concept",
    cat: "Second Brain",
    name: "Concept card",
    desc: {
      en: "A glossary / concept card: a term, its definition, and \"see also\" links — the atom of a knowledge base.",
      vi: "Thẻ khái niệm / glossary: một thuật ngữ, định nghĩa, và link \"xem thêm\" — nguyên tử của một knowledge base.",
    },
    body: {
      en: () =>
        stage(
          "CONCEPT",
          `<article class="concept" style="max-inline-size:min(520px,100%)"><dfn class="concept-term">Zettelkasten</dfn><p class="concept-def">A note-taking method: many small, atomic notes, each one idea, densely cross-linked so structure emerges from the connections rather than folders.</p><div class="concept-see"><nes-icon name="link"></nes-icon> <a class="wikilink" href="#">[[atomic notes]]</a> <a class="wikilink" href="#">[[backlinks]]</a></div></article>`,
          "col",
        ) +
        cb(
          `<article class="concept">
  <dfn class="concept-term">Zettelkasten</dfn>
  <p class="concept-def">A note-taking method: many small, atomic notes…</p>
  <div class="concept-see">
    <nes-icon name="link"></nes-icon>
    <a class="wikilink" href="…">[[atomic notes]]</a>
  </div>
</article>`,
        ) +
        h2("Parts") +
        api(
          ["Class / element", "Role"],
          [
            ["<code>article.concept</code>", "the card — <code>data-accent</code> tints the bar (cyan default)"],
            ["<code>dfn.concept-term</code>", "the term being defined"],
            ["<code>.concept-def</code>", "the definition"],
            ["<code>.concept-see</code>", "\"see also\" wiki-links"],
          ],
        ) +
        note(`Great as the node behind a <a href="#/graph">Graph</a> node or the target of a <a href="#/wikilink">wiki-link</a> — one concept, one card, richly linked.`) +
        a11y(`<code>&lt;dfn&gt;</code> marks the defining instance of the term semantically; the "see also" links are real anchors.`),
      vi: () =>
        stage(
          "CONCEPT",
          `<article class="concept" style="max-inline-size:min(520px,100%)"><dfn class="concept-term">Zettelkasten</dfn><p class="concept-def">Một phương pháp ghi chú: nhiều note nhỏ, nguyên tử, mỗi note một ý, liên kết chéo dày để cấu trúc nổi lên từ kết nối thay vì thư mục.</p><div class="concept-see"><nes-icon name="link"></nes-icon> <a class="wikilink" href="#">[[atomic notes]]</a> <a class="wikilink" href="#">[[backlinks]]</a></div></article>`,
          "col",
        ) +
        cb(
          `<article class="concept">
  <dfn class="concept-term">Zettelkasten</dfn>
  <p class="concept-def">Một phương pháp ghi chú: nhiều note nhỏ, nguyên tử…</p>
  <div class="concept-see">
    <nes-icon name="link"></nes-icon>
    <a class="wikilink" href="…">[[atomic notes]]</a>
  </div>
</article>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class / element", "Vai trò"],
          [
            ["<code>article.concept</code>", "thẻ — <code>data-accent</code> tô thanh (mặc định cyan)"],
            ["<code>dfn.concept-term</code>", "thuật ngữ được định nghĩa"],
            ["<code>.concept-def</code>", "định nghĩa"],
            ["<code>.concept-see</code>", "wiki-link \"xem thêm\""],
          ],
        ) +
        note(`Rất hợp làm node phía sau một node <a href="#/graph">Graph</a> hoặc đích của một <a href="#/wikilink">wiki-link</a> — một khái niệm, một thẻ, liên kết dày.`) +
        a11y(`<code>&lt;dfn&gt;</code> đánh dấu lần định nghĩa của thuật ngữ theo ngữ nghĩa; link "xem thêm" là anchor thật.`),
    },
  },
  {
    id: "notestats",
    cat: "Second Brain",
    name: "Note stats",
    desc: {
      en: "A compact meta bar for a note — word count, read time, and created / modified dates.",
      vi: "Thanh meta gọn cho một note — số từ, thời gian đọc, và ngày tạo / sửa.",
    },
    body: {
      en: () =>
        stage(
          "NOTESTATS",
          `<div class="note-stats" style="max-inline-size:min(520px,100%)"><span><nes-icon name="file"></nes-icon> 620 words</span><span><nes-icon name="clock"></nes-icon> 3 min read</span><span><nes-icon name="calendar"></nes-icon> created 2025-07-14</span><span><nes-icon name="edit"></nes-icon> edited 2d ago</span></div>`,
          "col",
        ) +
        cb(
          `<div class="note-stats">
  <span><nes-icon name="file"></nes-icon> 620 words</span>
  <span><nes-icon name="clock"></nes-icon> 3 min read</span>
  <span><nes-icon name="edit"></nes-icon> edited 2d ago</span>
</div>`,
        ) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.note-stats</code>", "the meta bar (wraps on narrow screens)"],
            ["<code>span</code>", "one stat — an icon + its value"],
          ],
        ) +
        note(`Pairs under a note title or in <a href="#/props">Properties</a>. Compute the read time from the word count (~200 wpm) so it stays honest.`) +
        a11y(`Each icon is decorative; the text ("620 words") is the accessible value. Use a real <code>&lt;time&gt;</code> element for the dates.`),
      vi: () =>
        stage(
          "NOTESTATS",
          `<div class="note-stats" style="max-inline-size:min(520px,100%)"><span><nes-icon name="file"></nes-icon> 620 từ</span><span><nes-icon name="clock"></nes-icon> đọc 3 phút</span><span><nes-icon name="calendar"></nes-icon> tạo 2025-07-14</span><span><nes-icon name="edit"></nes-icon> sửa 2 ngày trước</span></div>`,
          "col",
        ) +
        cb(
          `<div class="note-stats">
  <span><nes-icon name="file"></nes-icon> 620 từ</span>
  <span><nes-icon name="clock"></nes-icon> đọc 3 phút</span>
  <span><nes-icon name="edit"></nes-icon> sửa 2 ngày trước</span>
</div>`,
        ) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.note-stats</code>", "thanh meta (wrap trên màn hẹp)"],
            ["<code>span</code>", "một chỉ số — icon + giá trị"],
          ],
        ) +
        note(`Đặt dưới tiêu đề note hoặc trong <a href="#/props">Properties</a>. Tính thời gian đọc từ số từ (~200 từ/phút) để trung thực.`) +
        a11y(`Mỗi icon chỉ trang trí; chữ ("620 từ") là giá trị tiếp cận. Dùng <code>&lt;time&gt;</code> thật cho ngày tháng.`),
    },
  },
  /* ===================================================================== */
  /*  OPENCODE MODULE — the vibe-coding workspace (cloud IDE / agent WebUI)  */
  /* ===================================================================== */
  {
    id: "workbench",
    cat: "OpenCode",
    name: "Workbench",
    desc: {
      en: "The 3-pane workspace shell: rail (files) · main (chat/editor) · side (preview/logs). Layout only — it styles no content, so any module drops in. Panes stack on mobile.",
      vi: "Khung workspace 3 pane: rail (file) · main (chat/editor) · side (preview/log). Chỉ là layout — không style nội dung, nên module nào cũng lắp vào được. Trên mobile các pane xếp dọc.",
    },
    body: {
      en: () =>
        ocWorkbenchStage() +
        cb(`<div class="workbench">
  <aside class="wb-rail"><nes-tree>…</nes-tree></aside>
  <main class="wb-main">
    <div class="filetabs">…</div>
    <nes-chat-messages>…</nes-chat-messages>
    <div class="statusline" data-state="running">…</div>
  </main>
  <aside class="wb-side"><nes-preview src="http://localhost:5173"></nes-preview></aside>
</div>

<!-- resize with tokens, not new classes -->
<div class="workbench" style="--wb-rail:18rem;--wb-side:26rem;--wb-h:40rem">…</div>`) +
        h2("Parts") +
        api(
          ["Class / token", "Role"],
          [
            ["<code>.workbench</code>", "the shell — a grid + one hard frame"],
            ["<code>.wb-rail</code>", "left pane (file tree / outline). Optional"],
            ["<code>.wb-main</code>", "centre pane — a flex column, so a tab strip + scroller + status line stack"],
            ["<code>.wb-side</code>", "right pane (preview / logs / diff). Optional"],
            ["<code>--wb-rail</code> / <code>--wb-side</code>", "pane widths (<code>14rem</code> / <code>22rem</code>)"],
            ["<code>--wb-h</code>", "shell height on wide screens (<code>30rem</code>)"],
          ],
        ) +
        note(`Drop <code>.wb-rail</code> or <code>.wb-side</code> and the grid re-flows on its own — no extra class. Mobile-first: below 56rem the panes stack and the side panes cap their height, so nothing scrolls sideways.`) +
        a11y(`Use real landmarks — <code>&lt;aside&gt;</code> / <code>&lt;main&gt;</code> as shown — and give each pane an <code>aria-label</code>. Each pane is its own scroll container, so keyboard scrolling stays inside the region the user is in.`),
      vi: () =>
        ocWorkbenchStage() +
        cb(`<div class="workbench">
  <aside class="wb-rail"><nes-tree>…</nes-tree></aside>
  <main class="wb-main">
    <div class="filetabs">…</div>
    <nes-chat-messages>…</nes-chat-messages>
    <div class="statusline" data-state="running">…</div>
  </main>
  <aside class="wb-side"><nes-preview src="http://localhost:5173"></nes-preview></aside>
</div>

<!-- đổi kích thước bằng token, không cần class mới -->
<div class="workbench" style="--wb-rail:18rem;--wb-side:26rem;--wb-h:40rem">…</div>`) +
        h2("Thành phần") +
        api(
          ["Class / token", "Vai trò"],
          [
            ["<code>.workbench</code>", "khung — một grid + một viền cứng"],
            ["<code>.wb-rail</code>", "pane trái (cây file / outline). Tùy chọn"],
            ["<code>.wb-main</code>", "pane giữa — flex column, để tab strip + vùng cuộn + status line xếp dọc"],
            ["<code>.wb-side</code>", "pane phải (preview / log / diff). Tùy chọn"],
            ["<code>--wb-rail</code> / <code>--wb-side</code>", "chiều rộng pane (<code>14rem</code> / <code>22rem</code>)"],
            ["<code>--wb-h</code>", "chiều cao khung trên màn rộng (<code>30rem</code>)"],
          ],
        ) +
        note(`Bỏ <code>.wb-rail</code> hoặc <code>.wb-side</code> thì grid tự chia lại — không cần class thêm. Mobile-first: dưới 56rem các pane xếp dọc và pane bên bị giới hạn chiều cao, nên không bao giờ tràn ngang.`) +
        a11y(`Dùng landmark thật — <code>&lt;aside&gt;</code> / <code>&lt;main&gt;</code> như ví dụ — và cho mỗi pane một <code>aria-label</code>. Mỗi pane là một vùng cuộn riêng nên cuộn bằng bàn phím vẫn nằm trong vùng người dùng đang ở.`),
    },
  },
  {
    id: "repobar",
    cat: "OpenCode",
    name: "Repo bar",
    desc: {
      en: "Which code am I looking at: repo · branch · dirty count, plus an actions slot. Identity only — live run telemetry belongs in the Status line.",
      vi: "Tôi đang xem code nào: repo · branch · số file thay đổi, cộng một slot cho action. Chỉ là danh tính — telemetry lúc chạy thuộc về Status line.",
    },
    body: {
      en: () =>
        ocRepobarStage() +
        cb(`<div class="repobar">
  <span class="repo-name"><nes-icon name="folder"></nes-icon>acme/web</span>
  <span class="repo-branch"><nes-icon name="gitBranch"></nes-icon>feat/refresh-token</span>
  <span class="repo-dirty">3 CHANGED</span>
  <span class="repo-actions">
    <button class="btn xs ghost">PULL</button>
    <button class="btn xs">COMMIT</button>
  </span>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.repobar</code>", "the bar (wraps on narrow screens)"],
            ["<code>.repo-name</code>", "owner/repo — the brightest thing in the row"],
            ["<code>.repo-branch</code>", "current branch, in the accent colour"],
            ["<code>.repo-dirty</code>", "uncommitted work — gold, the shared “pending state” language"],
            ["<code>.repo-actions</code>", "trailing actions; pushed right automatically"],
          ],
        ) +
        note(`Swap the branch text for a <a href="#/selectmenu">SelectMenu</a> to make it a switcher — the bar is chrome, the picker is a control, and they stay separate pieces.`) +
        a11y(`Icons are decorative; the text carries the meaning. If the dirty count is the only signal that work is unsaved, keep the number in the text (“3 changed”), never colour alone.`),
      vi: () =>
        ocRepobarStage() +
        cb(`<div class="repobar">
  <span class="repo-name"><nes-icon name="folder"></nes-icon>acme/web</span>
  <span class="repo-branch"><nes-icon name="gitBranch"></nes-icon>feat/refresh-token</span>
  <span class="repo-dirty">3 CHANGED</span>
  <span class="repo-actions">
    <button class="btn xs ghost">PULL</button>
    <button class="btn xs">COMMIT</button>
  </span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.repobar</code>", "thanh bar (wrap trên màn hẹp)"],
            ["<code>.repo-name</code>", "owner/repo — sáng nhất trong hàng"],
            ["<code>.repo-branch</code>", "branch hiện tại, màu accent"],
            ["<code>.repo-dirty</code>", "công việc chưa commit — màu gold, cùng “ngôn ngữ” trạng thái chờ"],
            ["<code>.repo-actions</code>", "action ở cuối; tự đẩy sang phải"],
          ],
        ) +
        note(`Thay chữ branch bằng <a href="#/selectmenu">SelectMenu</a> là thành bộ chuyển branch — bar là chrome, picker là control, hai thứ vẫn tách rời.`) +
        a11y(`Icon chỉ trang trí; chữ mới mang nghĩa. Nếu số file thay đổi là tín hiệu duy nhất cho “chưa lưu”, hãy để con số trong chữ (“3 changed”), đừng chỉ dựa vào màu.`),
    },
  },
  {
    id: "filetabs",
    cat: "OpenCode",
    name: "File tabs",
    desc: {
      en: "The open-buffer strip: which files are open, which is focused, which is unsaved. Scrolls sideways when the list grows.",
      vi: "Dải file đang mở: file nào mở, file nào đang focus, file nào chưa lưu. Cuộn ngang khi danh sách dài.",
    },
    body: {
      en: () =>
        ocFiletabsStage("unsaved", "Close") +
        cb(`<div class="filetabs">
  <span class="filetab active">
    <button type="button" class="ft-name">session.ts</button>
    <span class="ft-dirty" role="img" aria-label="unsaved"></span>
    <button type="button" class="ft-close" aria-label="Close session.ts">×</button>
  </span>
  <span class="filetab">
    <button type="button" class="ft-name">refresh.ts</button>
    <button type="button" class="ft-close" aria-label="Close refresh.ts">×</button>
  </span>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.filetabs</code>", "the strip — scrolls sideways, never wraps"],
            ["<code>.filetab</code>", "one open document; add <code>.active</code> for the focused one"],
            ["<code>.ft-name</code>", "the switch button (a real <code>&lt;button&gt;</code>)"],
            ["<code>.ft-dirty</code>", "unsaved marker — gold, same language as <code>.repo-dirty</code>"],
            ["<code>.ft-close</code>", "the close button; grows to a 28px tap target on touch"],
          ],
        ) +
        note(`Different job from <a href="#/tabs">Tabs</a>: <code>&lt;nes-tabs&gt;</code> swaps panels of content, <code>.filetabs</code> swaps the document inside <em>one</em> pane. Two names because they are two behaviours — don't stack them.`) +
        a11y(`Name and close are separate buttons on purpose: a close × nested inside the switch button would be unreachable by keyboard. Label each close with the filename so a screen reader announces “Close session.ts”, not “×”.`),
      vi: () =>
        ocFiletabsStage("chưa lưu", "Đóng") +
        cb(`<div class="filetabs">
  <span class="filetab active">
    <button type="button" class="ft-name">session.ts</button>
    <span class="ft-dirty" role="img" aria-label="chưa lưu"></span>
    <button type="button" class="ft-close" aria-label="Đóng session.ts">×</button>
  </span>
  <span class="filetab">
    <button type="button" class="ft-name">refresh.ts</button>
    <button type="button" class="ft-close" aria-label="Đóng refresh.ts">×</button>
  </span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.filetabs</code>", "dải tab — cuộn ngang, không wrap"],
            ["<code>.filetab</code>", "một document đang mở; thêm <code>.active</code> cho cái đang focus"],
            ["<code>.ft-name</code>", "nút chuyển file (<code>&lt;button&gt;</code> thật)"],
            ["<code>.ft-dirty</code>", "dấu chưa lưu — gold, cùng ngôn ngữ với <code>.repo-dirty</code>"],
            ["<code>.ft-close</code>", "nút đóng; nở thành vùng chạm 28px trên touch"],
          ],
        ) +
        note(`Khác việc với <a href="#/tabs">Tabs</a>: <code>&lt;nes-tabs&gt;</code> đổi panel nội dung, <code>.filetabs</code> đổi document trong <em>một</em> pane. Hai tên vì là hai hành vi — đừng lồng vào nhau.`) +
        a11y(`Tên và nút đóng là hai button riêng có lý do: dấu × lồng trong nút chuyển sẽ không tới được bằng bàn phím. Đặt aria-label kèm tên file để trình đọc đọc “Đóng session.ts”, không phải “×”.`),
    },
  },
  {
    id: "statusline",
    cat: "OpenCode",
    name: "Status line",
    desc: {
      en: "The ambient bottom strip: run-state light + model · context · elapsed. Reads at a glance without stealing focus; data-state uses the shared run-state vocabulary.",
      vi: "Dải dưới cùng: đèn trạng thái + model · context · thời gian. Đọc một cái là hiểu mà không giành focus; data-state dùng bộ từ vựng trạng thái chung.",
    },
    body: {
      en: () =>
        ocStatuslineStage() +
        cb(`<div class="statusline" data-state="running">
  <span class="sl-state">RUNNING</span>
  <span class="sl-item"><nes-icon name="bot"></nes-icon>opus-4.8</span>
  <span class="sl-item"><nes-icon name="layers"></nes-icon>12.4k / 200k</span>
  <span class="sl-end">
    <span class="sl-item"><nes-icon name="clock"></nes-icon>0:42</span>
    <span class="sl-item"><nes-icon name="gitBranch"></nes-icon>main</span>
  </span>
</div>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.statusline</code>", "the strip; sits last inside <code>.wb-main</code>"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code> — colours the light; thinking/running blink"],
            ["<code>.sl-state</code>", "the state word + its light"],
            ["<code>.sl-item</code>", "one readout (never wraps mid-value)"],
            ["<code>.sl-end</code>", "trailing group, pushed right"],
          ],
        ) +
        note(`Same vocabulary as <a href="#/agent">Agent</a>, <a href="#/trace">Trace</a>, <a href="#/plan">Plan</a>, <a href="#/checks">Checks</a> and <a href="#/deploy">Deploy</a> — one word, one colour, everywhere. Pair with <a href="#/usage">Context usage</a> when the token budget deserves a real bar rather than a number.`) +
        a11y(`Tiny type is fine for ambient chrome, but never put a state <em>only</em> in the light — the word (“RUNNING”) is the accessible value. If the state changes on its own, wrap the strip in a polite live region so it is announced once, not continuously.`),
      vi: () =>
        ocStatuslineStage() +
        cb(`<div class="statusline" data-state="running">
  <span class="sl-state">RUNNING</span>
  <span class="sl-item"><nes-icon name="bot"></nes-icon>opus-4.8</span>
  <span class="sl-item"><nes-icon name="layers"></nes-icon>12.4k / 200k</span>
  <span class="sl-end">
    <span class="sl-item"><nes-icon name="clock"></nes-icon>0:42</span>
    <span class="sl-item"><nes-icon name="gitBranch"></nes-icon>main</span>
  </span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.statusline</code>", "dải strip; nằm cuối trong <code>.wb-main</code>"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code> — tô màu đèn; thinking/running nháy"],
            ["<code>.sl-state</code>", "từ trạng thái + đèn của nó"],
            ["<code>.sl-item</code>", "một chỉ số (không xuống dòng giữa giá trị)"],
            ["<code>.sl-end</code>", "nhóm cuối, đẩy sang phải"],
          ],
        ) +
        note(`Cùng bộ từ vựng với <a href="#/agent">Agent</a>, <a href="#/trace">Trace</a>, <a href="#/plan">Plan</a>, <a href="#/checks">Checks</a> và <a href="#/deploy">Deploy</a> — một từ, một màu, ở mọi nơi. Ghép với <a href="#/usage">Context usage</a> khi token budget cần một thanh thật thay vì một con số.`) +
        a11y(`Chữ nhỏ là ổn cho chrome nền, nhưng đừng để trạng thái <em>chỉ</em> nằm ở đèn — từ (“RUNNING”) mới là giá trị tiếp cận. Nếu trạng thái tự đổi, bọc dải này trong live region polite để được đọc một lần, không đọc liên tục.`),
    },
  },
  {
    id: "sandbox",
    cat: "OpenCode",
    name: "Sandbox",
    desc: {
      en: "The cloud dev container: is my machine alive, and what is it? A state light, a spec readout, and an actions slot.",
      vi: "Container dev trên cloud: máy của tôi còn sống không, và nó là gì? Đèn trạng thái, thông số, và slot action.",
    },
    body: {
      en: () =>
        ocSandboxStage() +
        cb(`<div class="sandbox" data-state="running">
  <div class="sb-head">
    <span class="sb-name">node-20 · sfo</span>
    <span class="badge clear">LIVE</span>
    <span class="sb-actions"><button class="btn xs ghost">RESTART</button></span>
  </div>
  <div class="sb-specs">
    <span>CPU <b>2 vCPU</b></span>
    <span>RAM <b>4 GB</b></span>
    <span>UP <b>12m</b></span>
  </div>
</div>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.sandbox</code>", "the card — state light + accent bar in the state colour"],
            ["<code>data-state</code>", "<code>thinking</code> = booting · <code>running</code> = live · <code>queued</code> = stopped · <code>error</code> = crashed"],
            ["<code>.sb-head</code>", "name + badge + actions (actions push right)"],
            ["<code>.sb-specs</code>", "the spec row; <code>&lt;b&gt;</code> marks each value"],
          ],
        ) +
        note(`It reuses the run-state vocabulary rather than inventing a container-only one, so “starting up” blinks gold here exactly like a thinking agent. One vocabulary is the whole point.`) +
        a11y(`Keep the human state in text (the <code>.badge</code>) as well as the light. Restart/stop are destructive-ish — put the environment name in the button's <code>aria-label</code> so it can't be hit blind.`),
      vi: () =>
        ocSandboxStage() +
        cb(`<div class="sandbox" data-state="running">
  <div class="sb-head">
    <span class="sb-name">node-20 · sfo</span>
    <span class="badge clear">LIVE</span>
    <span class="sb-actions"><button class="btn xs ghost">RESTART</button></span>
  </div>
  <div class="sb-specs">
    <span>CPU <b>2 vCPU</b></span>
    <span>RAM <b>4 GB</b></span>
    <span>UP <b>12m</b></span>
  </div>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.sandbox</code>", "card — đèn trạng thái + thanh accent theo màu trạng thái"],
            ["<code>data-state</code>", "<code>thinking</code> = đang boot · <code>running</code> = live · <code>queued</code> = đã dừng · <code>error</code> = crash"],
            ["<code>.sb-head</code>", "tên + badge + action (action đẩy sang phải)"],
            ["<code>.sb-specs</code>", "hàng thông số; <code>&lt;b&gt;</code> đánh dấu từng giá trị"],
          ],
        ) +
        note(`Dùng lại bộ từ vựng trạng thái chung chứ không tự tạo bộ riêng cho container, nên “đang khởi động” nháy gold y như một agent đang thinking. Một bộ từ vựng duy nhất — đó chính là điểm cốt lõi.`) +
        a11y(`Giữ trạng thái ở dạng chữ (<code>.badge</code>) song song với đèn. Restart/stop hơi mang tính phá hủy — đưa tên môi trường vào <code>aria-label</code> của nút để không bấm mù.`),
    },
  },
  {
    id: "plan",
    cat: "OpenCode",
    name: "Plan",
    desc: {
      en: "What the agent intends to do, with live state per step — the todo list you watch tick over. Numbered marks share the run-state colours.",
      vi: "Agent dự định làm gì, kèm trạng thái sống cho từng bước — danh sách todo bạn xem nó tick dần. Số bước dùng chung màu trạng thái.",
    },
    body: {
      en: () =>
        ocPlanStage() +
        cb(`<ol class="plan">
  <li class="plan-step" data-state="done">Read src/auth/session.ts</li>
  <li class="plan-step" data-state="running">Wire rotation into /refresh
    <span class="plan-note">editing src/routes/refresh.ts</span>
  </li>
  <li class="plan-step" data-state="queued">Add a regression test</li>
</ol>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.plan</code>", "the list (<code>&lt;ol&gt;</code> — order is meaning here)"],
            ["<code>.plan-step</code>", "one step; its number comes from a CSS counter, so re-ordering never desyncs"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code>; done recedes, running blinks"],
            ["<code>.plan-note</code>", "the sub-line — what it's doing right now, or why it failed"],
          ],
        ) +
        note(`Three lists, three jobs: <a href="#/tasklist">Tasklist</a> is a static done/open checklist, <a href="#/trace">Trace</a> is what already happened (with tool I/O), <code>.plan</code> is the forward-looking queue. Pick by tense, not by looks.`) +
        a11y(`An <code>&lt;ol&gt;</code> gives the count and position for free. The state is a colour + a blink, so repeat it in text where it matters — put “failed: schema.yaml not found” in <code>.plan-note</code> rather than relying on the red mark.`),
      vi: () =>
        ocPlanStage() +
        cb(`<ol class="plan">
  <li class="plan-step" data-state="done">Đọc src/auth/session.ts</li>
  <li class="plan-step" data-state="running">Nối rotation vào /refresh
    <span class="plan-note">đang sửa src/routes/refresh.ts</span>
  </li>
  <li class="plan-step" data-state="queued">Thêm test regression</li>
</ol>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.plan</code>", "danh sách (<code>&lt;ol&gt;</code> — thứ tự ở đây là ý nghĩa)"],
            ["<code>.plan-step</code>", "một bước; số lấy từ CSS counter nên đổi thứ tự không bao giờ lệch"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code>; done mờ đi, running nháy"],
            ["<code>.plan-note</code>", "dòng phụ — đang làm gì, hoặc vì sao lỗi"],
          ],
        ) +
        note(`Ba danh sách, ba việc: <a href="#/tasklist">Tasklist</a> là checklist tĩnh done/open, <a href="#/trace">Trace</a> là chuyện đã xảy ra (kèm tool I/O), <code>.plan</code> là hàng đợi phía trước. Chọn theo “thời” của câu, không theo hình thức.`) +
        a11y(`<code>&lt;ol&gt;</code> cho sẵn số lượng và vị trí. Trạng thái là màu + nháy, nên hãy nhắc lại bằng chữ ở nơi quan trọng — viết “lỗi: không thấy schema.yaml” trong <code>.plan-note</code> thay vì chỉ dựa vào dấu đỏ.`),
    },
  },
  {
    id: "perm",
    cat: "OpenCode",
    name: "Permission",
    desc: {
      en: "The gate: “the agent wants to run this — allow?” One request, one decision, the exact command shown verbatim. Warn accent because it blocks the loop.",
      vi: "Cửa chặn: “agent muốn chạy cái này — cho phép?” Một yêu cầu, một quyết định, lệnh hiện nguyên văn. Accent warn vì nó chặn vòng lặp.",
    },
    body: {
      en: () =>
        ocPermStage(
          "BASH",
          "rm -rf node_modules &amp;&amp; pnpm install",
          "Dependencies drifted from the lockfile — a clean reinstall fixes the failing build.",
          `<button class="btn sm">ALLOW ONCE</button><button class="btn sm outline">ALWAYS ALLOW</button><button class="btn sm outline" data-accent="crit">DENY</button>`,
        ) +
        cb(`<div class="perm">
  <span class="perm-kind">BASH</span>
  <code class="perm-target">rm -rf node_modules && pnpm install</code>
  <p class="perm-why">Dependencies drifted from the lockfile.</p>
  <div class="perm-actions">
    <button class="btn sm">ALLOW ONCE</button>
    <button class="btn sm outline">ALWAYS ALLOW</button>
    <button class="btn sm outline" data-accent="crit">DENY</button>
  </div>
</div>

<!-- after the answer: keep the record, drop the affordance -->
<div class="perm decided">…</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.perm</code>", "the request card; <code>data-accent</code> re-tints it (warn by default)"],
            ["<code>.perm-kind</code>", "what kind of capability — BASH / WRITE / FETCH / MCP"],
            ["<code>.perm-target</code>", "the exact thing that will run — monospaced, scrollable, never truncated"],
            ["<code>.perm-why</code>", "the agent's justification in plain language"],
            ["<code>.perm-actions</code>", "the decision buttons"],
            ["<code>.decided</code>", "answered: dims the card and hides the actions"],
          ],
        ) +
        crit(`Never truncate <code>.perm-target</code> with an ellipsis. A user approving a command they cannot fully read is the whole failure mode this component exists to prevent — it scrolls instead, on purpose.`) +
        a11y(`Order the buttons least-destructive first and let the safest one take focus. Deny is <code>data-accent="crit"</code> <em>and</em> says “DENY” — never colour alone. If the request appears while the user is elsewhere, announce it in a polite live region rather than moving focus out from under them.`),
      vi: () =>
        ocPermStage(
          "BASH",
          "rm -rf node_modules &amp;&amp; pnpm install",
          "Dependency lệch với lockfile — cài lại sạch sẽ sửa được build đang lỗi.",
          `<button class="btn sm">CHO PHÉP 1 LẦN</button><button class="btn sm outline">LUÔN CHO PHÉP</button><button class="btn sm outline" data-accent="crit">TỪ CHỐI</button>`,
        ) +
        cb(`<div class="perm">
  <span class="perm-kind">BASH</span>
  <code class="perm-target">rm -rf node_modules && pnpm install</code>
  <p class="perm-why">Dependency lệch với lockfile.</p>
  <div class="perm-actions">
    <button class="btn sm">CHO PHÉP 1 LẦN</button>
    <button class="btn sm outline">LUÔN CHO PHÉP</button>
    <button class="btn sm outline" data-accent="crit">TỪ CHỐI</button>
  </div>
</div>

<!-- sau khi trả lời: giữ lại dấu vết, bỏ nút bấm -->
<div class="perm decided">…</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.perm</code>", "card yêu cầu; <code>data-accent</code> đổi màu (mặc định warn)"],
            ["<code>.perm-kind</code>", "loại quyền — BASH / WRITE / FETCH / MCP"],
            ["<code>.perm-target</code>", "đúng thứ sẽ chạy — mono, cuộn được, không bao giờ bị cắt"],
            ["<code>.perm-why</code>", "lý do của agent, bằng lời thường"],
            ["<code>.perm-actions</code>", "các nút quyết định"],
            ["<code>.decided</code>", "đã trả lời: làm mờ card và ẩn nút"],
          ],
        ) +
        crit(`Đừng bao giờ cắt <code>.perm-target</code> bằng dấu “…”. Người dùng đồng ý một lệnh mà họ không đọc hết chính là kiểu lỗi mà component này ra đời để ngăn — nên nó cuộn, có chủ đích.`) +
        a11y(`Xếp nút từ ít phá hủy nhất trước và để nút an toàn nhất nhận focus. Từ chối vừa <code>data-accent="crit"</code> vừa ghi rõ “TỪ CHỐI” — không bao giờ chỉ dựa vào màu. Nếu yêu cầu xuất hiện lúc người dùng đang làm việc khác, thông báo qua live region polite chứ đừng giật focus của họ.`),
    },
  },
  {
    id: "diffstat",
    cat: "OpenCode",
    name: "Diff stat",
    desc: {
      en: "The aggregate of a change set: N files, +added / -removed, and a proportional bar. The one-line answer to “how big is this?”.",
      vi: "Tổng quan một change set: N file, +thêm / -bớt, và một thanh tỉ lệ. Câu trả lời một dòng cho “cái này lớn cỡ nào?”.",
    },
    body: {
      en: () =>
        ocDiffstatStage() +
        cb(`<div class="diffstat">
  <span class="ds-files">7 FILES</span>
  <span class="ds-add">+184</span>
  <span class="ds-del">-52</span>
  <span class="ds-bar">
    <i class="add" style="--seg:78%"></i>
    <i class="del" style="--seg:22%"></i>
  </span>
</div>`) +
        h2("Parts") +
        api(
          ["Class / token", "Role"],
          [
            ["<code>.diffstat</code>", "the row (wraps on narrow screens)"],
            ["<code>.ds-files</code>", "file count — the headline number"],
            ["<code>.ds-add</code> / <code>.ds-del</code>", "line totals, green / red"],
            ["<code>.ds-bar</code>", "the proportion bar; each <code>&lt;i&gt;</code> is a slice"],
            ["<code>--seg</code>", "a slice's share of the bar, in % — same contract as <a href='#/usage'>.usage-bar</a>"],
          ],
        ) +
        note(`<code>&lt;nes-diff&gt;</code> emits <code>nes:diff {files,added,removed}</code> after every render, so a stat bar can follow a live patch with three assignments and no parsing of your own.`) +
        a11y(`Colour distinguishes added from removed, so keep the <code>+</code> and <code>-</code> signs in the text. The bar is decoration on top of numbers already present — mark it <code>aria-hidden="true"</code> rather than inventing a label for it.`),
      vi: () =>
        ocDiffstatStage() +
        cb(`<div class="diffstat">
  <span class="ds-files">7 FILES</span>
  <span class="ds-add">+184</span>
  <span class="ds-del">-52</span>
  <span class="ds-bar">
    <i class="add" style="--seg:78%"></i>
    <i class="del" style="--seg:22%"></i>
  </span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class / token", "Vai trò"],
          [
            ["<code>.diffstat</code>", "hàng (wrap trên màn hẹp)"],
            ["<code>.ds-files</code>", "số file — con số tiêu đề"],
            ["<code>.ds-add</code> / <code>.ds-del</code>", "tổng số dòng, xanh / đỏ"],
            ["<code>.ds-bar</code>", "thanh tỉ lệ; mỗi <code>&lt;i&gt;</code> là một phần"],
            ["<code>--seg</code>", "phần trăm của một slice — cùng hợp đồng với <a href='#/usage'>.usage-bar</a>"],
          ],
        ) +
        note(`<code>&lt;nes-diff&gt;</code> bắn <code>nes:diff {files,added,removed}</code> sau mỗi lần render, nên thanh stat có thể đi theo patch đang chạy chỉ với ba phép gán, không cần tự parse.`) +
        a11y(`Màu phân biệt thêm/bớt, nên hãy giữ dấu <code>+</code> và <code>-</code> trong chữ. Thanh bar chỉ là trang trí trên các con số đã có — đặt <code>aria-hidden="true"</code> thay vì bịa ra nhãn cho nó.`),
    },
  },
  {
    id: "filechange",
    cat: "OpenCode",
    name: "File change",
    desc: {
      en: "One changed file: status mark (A/M/D/R) · path · ± counts. Render it as a link or button so it jumps to that file's diff.",
      vi: "Một file thay đổi: dấu trạng thái (A/M/D/R) · đường dẫn · số ±. Render dạng link hoặc button để nhảy tới diff của file đó.",
    },
    body: {
      en: () =>
        ocFilechangeStage() +
        cb(`<a class="filechange" data-change="M" href="#session-ts">
  <span class="fc-mark">M</span>
  <span class="fc-path"><span class="fc-dir">src/auth/</span>session.ts</span>
  <span class="fc-count"><b class="add">+42</b><b class="del">-8</b></span>
</a>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.filechange</code>", "the row; use <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> so it's focusable"],
            ["<code>data-change</code>", "<code>A</code> added (green) · <code>M</code> modified (gold) · <code>D</code> deleted (red) · <code>R</code> renamed (blue)"],
            ["<code>.fc-mark</code>", "the git status letter, tinted by <code>data-change</code>"],
            ["<code>.fc-path</code>", "the path; wrap the folder in <code>.fc-dir</code> so the filename pops"],
            ["<code>.fc-count</code>", "per-file <code>+</code>/<code>-</code> totals"],
          ],
        ) +
        note(`Stack these under a <a href="#/diffstat">Diff stat</a> for the review sidebar, then let each row scroll a <a href="#/hunk">Hunk</a> list into view. Three small pieces beat one “review panel” component you can't take apart.`) +
        a11y(`The letter is not enough on its own — a screen reader reads “M”. Give the row an <code>aria-label</code> like “Modified src/auth/session.ts, 42 added, 8 removed”, or spell the status out in visually-hidden text.`),
      vi: () =>
        ocFilechangeStage() +
        cb(`<a class="filechange" data-change="M" href="#session-ts">
  <span class="fc-mark">M</span>
  <span class="fc-path"><span class="fc-dir">src/auth/</span>session.ts</span>
  <span class="fc-count"><b class="add">+42</b><b class="del">-8</b></span>
</a>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.filechange</code>", "hàng; dùng <code>&lt;a&gt;</code> hoặc <code>&lt;button&gt;</code> để focus được"],
            ["<code>data-change</code>", "<code>A</code> thêm (xanh) · <code>M</code> sửa (gold) · <code>D</code> xóa (đỏ) · <code>R</code> đổi tên (blue)"],
            ["<code>.fc-mark</code>", "chữ trạng thái git, tô theo <code>data-change</code>"],
            ["<code>.fc-path</code>", "đường dẫn; bọc thư mục trong <code>.fc-dir</code> để tên file nổi lên"],
            ["<code>.fc-count</code>", "tổng <code>+</code>/<code>-</code> của file"],
          ],
        ) +
        note(`Xếp các hàng này dưới một <a href="#/diffstat">Diff stat</a> để làm sidebar review, rồi mỗi hàng cuộn tới danh sách <a href="#/hunk">Hunk</a>. Ba mảnh nhỏ hơn hẳn một component “review panel” không tháo ra được.`) +
        a11y(`Một chữ cái là không đủ — trình đọc sẽ đọc “M”. Cho hàng một <code>aria-label</code> kiểu “Đã sửa src/auth/session.ts, thêm 42, bớt 8”, hoặc viết rõ trạng thái bằng chữ ẩn thị giác.`),
    },
  },
  {
    id: "hunk",
    cat: "OpenCode",
    name: "Hunk",
    desc: {
      en: "A reviewable slice of a diff: range + scope + keep/revert actions, collapsible with native <details>. The body stays a plain .diff.",
      vi: "Một mảnh diff để review: range + scope + nút keep/revert, thu gọn bằng <details> gốc. Phần thân vẫn là .diff thuần.",
    },
    body: {
      en: () =>
        ocHunkStage("KEEP", "REVERT") +
        cb(`<details class="hunk" open>
  <summary class="hunk-head">
    <code class="hunk-range">@@ -18,7 +18,9 @@</code>
    <span class="hunk-scope">async function refresh()</span>
    <span class="hunk-actions">
      <button class="btn xs">KEEP</button>
      <button class="btn xs outline" data-accent="crit">REVERT</button>
    </span>
  </summary>
  <div class="diff">…</div>
</details>

<!-- always open? use a div head instead of a summary -->
<div class="hunk">
  <div class="hunk-head">…</div>
  <nes-diff>…</nes-diff>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.hunk</code>", "the frame — works on <code>&lt;details&gt;</code> (collapsible) or <code>&lt;div&gt;</code> (always open)"],
            ["<code>.hunk-head</code>", "the header row; as a <code>&lt;summary&gt;</code> it becomes the toggle"],
            ["<code>.hunk-range</code>", "the <code>@@</code> line range"],
            ["<code>.hunk-scope</code>", "the enclosing function / block, if you know it"],
            ["<code>.hunk-actions</code>", "keep / revert, pushed right"],
          ],
        ) +
        warn(`A click on a button inside <code>&lt;summary&gt;</code> also toggles the <code>&lt;details&gt;</code> — that is native behaviour, not a bug. Call <code>event.stopPropagation()</code> in your keep/revert handler, or use the <code>&lt;div&gt;</code> form when the hunk should never collapse.`) +
        note(`It owns only the review chrome: the body is a plain <a href="#/diff">.diff</a>, so hand-written diff HTML and <a href="#/diffview">&lt;nes-diff&gt;</a> both drop in, and the embedded diff sheds its own frame automatically.`) +
        a11y(`<code>&lt;details&gt;</code> gives you the expanded state, keyboard toggle and focus ring for free. Label the actions with the hunk they affect (“Revert lines 18–26”) — “REVERT” alone is ambiguous in a list of ten.`),
      vi: () =>
        ocHunkStage("GIỮ", "HOÀN TÁC") +
        cb(`<details class="hunk" open>
  <summary class="hunk-head">
    <code class="hunk-range">@@ -18,7 +18,9 @@</code>
    <span class="hunk-scope">async function refresh()</span>
    <span class="hunk-actions">
      <button class="btn xs">GIỮ</button>
      <button class="btn xs outline" data-accent="crit">HOÀN TÁC</button>
    </span>
  </summary>
  <div class="diff">…</div>
</details>

<!-- luôn mở? dùng div thay cho summary -->
<div class="hunk">
  <div class="hunk-head">…</div>
  <nes-diff>…</nes-diff>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.hunk</code>", "khung — dùng được trên <code>&lt;details&gt;</code> (thu gọn) hoặc <code>&lt;div&gt;</code> (luôn mở)"],
            ["<code>.hunk-head</code>", "hàng header; nếu là <code>&lt;summary&gt;</code> thì thành nút toggle"],
            ["<code>.hunk-range</code>", "dải dòng <code>@@</code>"],
            ["<code>.hunk-scope</code>", "hàm / block chứa nó, nếu biết"],
            ["<code>.hunk-actions</code>", "keep / revert, đẩy sang phải"],
          ],
        ) +
        warn(`Bấm một button bên trong <code>&lt;summary&gt;</code> cũng sẽ toggle <code>&lt;details&gt;</code> — đó là hành vi gốc của HTML, không phải bug. Gọi <code>event.stopPropagation()</code> trong handler keep/revert, hoặc dùng dạng <code>&lt;div&gt;</code> khi hunk không cần thu gọn.`) +
        note(`Nó chỉ sở hữu phần chrome review: thân là <a href="#/diff">.diff</a> thuần, nên diff HTML viết tay và <a href="#/diffview">&lt;nes-diff&gt;</a> đều lắp vào được, và diff bên trong tự bỏ viền riêng.`) +
        a11y(`<code>&lt;details&gt;</code> cho sẵn trạng thái mở/đóng, toggle bằng bàn phím và focus ring. Đặt nhãn nút theo hunk mà nó tác động (“Hoàn tác dòng 18–26”) — chỉ “HOÀN TÁC” thì mơ hồ khi có mười hunk.`),
    },
  },
  {
    id: "diffview",
    cat: "OpenCode",
    name: "DiffView",
    desc: {
      en: "Feed it a unified diff (git or agent output) and it renders on-brand diff markup, then reports the totals. Parsing and rendering only — no frame, no opinions.",
      vi: "Đưa vào một unified diff (từ git hoặc agent) và nó render ra diff đúng phong cách, rồi báo lại tổng số. Chỉ parse và render — không viền, không áp đặt.",
    },
    body: {
      en: () =>
        ocDiffViewStage() +
        cb(`<!-- the patch is the element's text content -->
<nes-diff>diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -18,7 +18,9 @@ export async function refresh(req) {
   const token = read(req)
-  return verify(token)
+  const next = await rotate(token)
+  return { token: next }
 }</nes-diff>

<script type="module">
  const view = document.querySelector("nes-diff");
  // streaming a patch in? just assign — it re-renders
  view.value = await res.text();
  view.addEventListener("nes:diff", (e) => {
    const { files, added, removed } = e.detail;   // wire a .diffstat
  });
<\/script>`) +
        apiGroups({
          prop: [
            ["<code>.value</code>", "string", "text content", "the raw unified diff; assigning re-renders"],
            ["<code>.stat</code>", "<code>{files,added,removed}</code>", "—", "totals from the last render (read-only)"],
          ],
          method: [["<code>.render()</code>", "<code>() =&gt; void</code>", "—", "re-render from the current value"]],
          event: [["<code>nes:diff</code>", "<code>{ files, added, removed }</code>", "—", "fired after every render"]],
          slot: [["text content", "the unified diff, read once on connect (same contract as <a href='#/code'>&lt;nes-code&gt;</a>)"]],
        }) +
        h2("What it understands") +
        api(
          ["Input line", "Renders as"],
          [
            ["<code>diff --git</code>, <code>index</code>, <code>--- a/…</code>, <code>+++ b/…</code>, mode / rename headers", "<code>.file</code> — the file header band"],
            ["<code>@@ -a,b +c,d @@</code>", "<code>.meta</code> — the hunk range, in cyan"],
            ["<code>+line</code> / <code>-line</code>", "<code>.add</code> / <code>.del</code>, marker drawn by CSS"],
            ["anything else", "<code>.ctx</code> — context (a leading space is stripped)"],
          ],
        ) +
        note(`It renders into the plain <a href="#/diff">.diff</a> recipe, so it inherits that styling and nothing more — wrap it in a <a href="#/hunk">.hunk</a> for review actions, or in <a href="#/codegroup">a code group</a> to sit beside the final file. It counts files from <code>diff --git</code> headers, falling back to <code>+++</code> lines.`) +
        crit(`It renders a diff; it does not apply one. Nothing here touches your files — wire <code>nes:diff</code> and your own apply/revert calls to do that, so the UI can never silently write to disk.`) +
        a11y(`Every line is a block <code>&lt;span&gt;</code> with the <code>+</code>/<code>-</code> marker drawn in CSS, so a screen reader reads the code, not a wall of punctuation. Since the marker is decorative, keep additions and removals distinguishable in your own summaries by wording, not colour.`),
      vi: () =>
        ocDiffViewStage() +
        cb(`<!-- patch chính là text content của element -->
<nes-diff>diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -18,7 +18,9 @@ export async function refresh(req) {
   const token = read(req)
-  return verify(token)
+  const next = await rotate(token)
+  return { token: next }
 }</nes-diff>

<script type="module">
  const view = document.querySelector("nes-diff");
  // đang stream patch về? cứ gán — nó tự render lại
  view.value = await res.text();
  view.addEventListener("nes:diff", (e) => {
    const { files, added, removed } = e.detail;   // nối vào .diffstat
  });
<\/script>`) +
        apiGroups({
          prop: [
            ["<code>.value</code>", "string", "text content", "unified diff thô; gán vào là render lại"],
            ["<code>.stat</code>", "<code>{files,added,removed}</code>", "—", "tổng số của lần render gần nhất (chỉ đọc)"],
          ],
          method: [["<code>.render()</code>", "<code>() =&gt; void</code>", "—", "render lại từ value hiện tại"]],
          event: [["<code>nes:diff</code>", "<code>{ files, added, removed }</code>", "—", "bắn sau mỗi lần render"]],
          slot: [["text content", "unified diff, đọc một lần khi connect (cùng hợp đồng với <a href='#/code'>&lt;nes-code&gt;</a>)"]],
        }) +
        h2("Nó hiểu những gì") +
        api(
          ["Dòng đầu vào", "Render thành"],
          [
            ["<code>diff --git</code>, <code>index</code>, <code>--- a/…</code>, <code>+++ b/…</code>, header mode / rename", "<code>.file</code> — dải header của file"],
            ["<code>@@ -a,b +c,d @@</code>", "<code>.meta</code> — dải dòng của hunk, màu cyan"],
            ["<code>+dòng</code> / <code>-dòng</code>", "<code>.add</code> / <code>.del</code>, dấu do CSS vẽ"],
            ["còn lại", "<code>.ctx</code> — dòng ngữ cảnh (bỏ một space ở đầu)"],
          ],
        ) +
        note(`Nó render vào recipe <a href="#/diff">.diff</a> thuần nên chỉ thừa hưởng đúng style đó — bọc trong <a href="#/hunk">.hunk</a> để có nút review, hoặc trong <a href="#/codegroup">code group</a> để đặt cạnh file kết quả. Số file đếm từ header <code>diff --git</code>, nếu không có thì đếm dòng <code>+++</code>.`) +
        crit(`Nó render diff, không apply diff. Không có gì ở đây chạm vào file của bạn — hãy tự nối <code>nes:diff</code> với hàm apply/revert của bạn, để UI không bao giờ âm thầm ghi xuống đĩa.`) +
        a11y(`Mỗi dòng là một <code>&lt;span&gt;</code> block với dấu <code>+</code>/<code>-</code> do CSS vẽ, nên trình đọc đọc code chứ không đọc một rừng dấu. Vì dấu chỉ là trang trí, hãy phân biệt thêm/bớt trong phần tóm tắt của bạn bằng từ ngữ, không bằng màu.`),
    },
  },
  {
    id: "checks",
    cat: "OpenCode",
    name: "Checks",
    desc: {
      en: "Did it actually work: lint / types / unit / build — one row each, with the shared run-state vocabulary and an optional link to the logs.",
      vi: "Nó có chạy thật không: lint / types / unit / build — mỗi thứ một hàng, dùng bộ từ vựng trạng thái chung và link tới log nếu cần.",
    },
    body: {
      en: () =>
        ocChecksStage("LOGS") +
        cb(`<ul class="checks">
  <li class="check-item" data-state="done">
    <span class="chk-name">lint</span><span class="chk-meta">1.2s</span>
  </li>
  <li class="check-item" data-state="running">
    <span class="chk-name">unit</span><span class="chk-meta">42 / 96</span>
  </li>
  <li class="check-item" data-state="error">
    <span class="chk-name">e2e</span><span class="chk-meta">3 failing</span>
    <a class="chk-link" href="#logs">LOGS →</a>
  </li>
</ul>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.checks</code>", "the list; neighbouring rows share one seam line"],
            ["<code>.check-item</code>", "one check — its state light comes from <code>data-state</code>"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code>; running blinks"],
            ["<code>.chk-name</code>", "the check's name"],
            ["<code>.chk-meta</code>", "duration, progress, or the failure count"],
            ["<code>.chk-link</code>", "link to the logs, pushed right"],
          ],
        ) +
        note(`This is the verification roster; <a href="#/runbar">Run bar</a> is the one process you started, and <a href="#/logs">&lt;nes-logs&gt;</a> is its output. A failing row plus a <a href="#/stacktrace">Stack trace</a> is the whole error-to-fix loop.`) +
        a11y(`Use a real list so the count is announced. The light is colour-only, so <code>.chk-meta</code> should carry the outcome in words (“3 failing”, “passed in 1.2s”). If rows flip state on their own, make the list a polite live region.`),
      vi: () =>
        ocChecksStage("LOG") +
        cb(`<ul class="checks">
  <li class="check-item" data-state="done">
    <span class="chk-name">lint</span><span class="chk-meta">1.2s</span>
  </li>
  <li class="check-item" data-state="running">
    <span class="chk-name">unit</span><span class="chk-meta">42 / 96</span>
  </li>
  <li class="check-item" data-state="error">
    <span class="chk-name">e2e</span><span class="chk-meta">3 lỗi</span>
    <a class="chk-link" href="#logs">LOG →</a>
  </li>
</ul>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.checks</code>", "danh sách; hai hàng liền nhau dùng chung một đường viền"],
            ["<code>.check-item</code>", "một check — đèn trạng thái lấy từ <code>data-state</code>"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code>; running nháy"],
            ["<code>.chk-name</code>", "tên check"],
            ["<code>.chk-meta</code>", "thời gian, tiến độ, hoặc số lỗi"],
            ["<code>.chk-link</code>", "link tới log, đẩy sang phải"],
          ],
        ) +
        note(`Đây là bảng kiểm chứng; <a href="#/runbar">Run bar</a> là một process bạn vừa chạy, còn <a href="#/logs">&lt;nes-logs&gt;</a> là output của nó. Một hàng lỗi cộng một <a href="#/stacktrace">Stack trace</a> là đủ trọn vòng lỗi-đến-sửa.`) +
        a11y(`Dùng list thật để số lượng được đọc ra. Đèn chỉ có màu, nên <code>.chk-meta</code> nên mang kết quả bằng chữ (“3 lỗi”, “xong trong 1.2s”). Nếu các hàng tự đổi trạng thái, hãy để danh sách làm live region polite.`),
    },
  },
  {
    id: "runbar",
    cat: "OpenCode",
    name: "Run bar",
    desc: {
      en: "The process strip: stop/start, the command, the port it bound, and how long it took. One running task per bar.",
      vi: "Dải process: dừng/chạy, câu lệnh, cổng nó bind, và mất bao lâu. Mỗi bar một task đang chạy.",
    },
    body: {
      en: () =>
        ocRunbarStage("Stop", "Retry", "ready in 412ms", "exited 1 · 4.2s") +
        cb(`<div class="runbar" data-state="running">
  <button class="btn xs icon" aria-label="Stop pnpm dev">
    <nes-icon name="stop"></nes-icon>
  </button>
  <span class="run-cmd">pnpm dev</span>
  <a class="run-url" href="http://localhost:5173">localhost:5173</a>
  <span class="run-meta">ready in 412ms</span>
</div>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.runbar</code>", "the strip; its leading light comes from <code>data-state</code>"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code>; running blinks"],
            ["<code>.run-cmd</code>", "the command, verbatim"],
            ["<code>.run-url</code>", "the address it bound, in the accent colour"],
            ["<code>.run-meta</code>", "timing or exit code, pushed right"],
          ],
        ) +
        note(`One bar per process. Put the dev server above a <a href="#/preview">&lt;nes-preview&gt;</a> and the test run above <a href="#/logs">&lt;nes-logs&gt;</a> — the bar controls, the pane shows. For many tasks at once, a <a href="#/checks">Checks</a> list reads better than a stack of bars.`) +
        a11y(`The single stop/start button changes meaning with the state, so label it with the action <em>and</em> the target (“Stop pnpm dev”), and update the label when the state flips. An icon-only button with no label is unusable by screen reader.`),
      vi: () =>
        ocRunbarStage("Dừng", "Chạy lại", "sẵn sàng sau 412ms", "thoát 1 · 4.2s") +
        cb(`<div class="runbar" data-state="running">
  <button class="btn xs icon" aria-label="Dừng pnpm dev">
    <nes-icon name="stop"></nes-icon>
  </button>
  <span class="run-cmd">pnpm dev</span>
  <a class="run-url" href="http://localhost:5173">localhost:5173</a>
  <span class="run-meta">sẵn sàng sau 412ms</span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.runbar</code>", "dải strip; đèn đầu hàng lấy từ <code>data-state</code>"],
            ["<code>data-state</code>", "<code>queued · thinking · running · done · error</code>; running nháy"],
            ["<code>.run-cmd</code>", "câu lệnh, nguyên văn"],
            ["<code>.run-url</code>", "địa chỉ nó bind, màu accent"],
            ["<code>.run-meta</code>", "thời gian hoặc exit code, đẩy sang phải"],
          ],
        ) +
        note(`Mỗi process một bar. Đặt dev server phía trên <a href="#/preview">&lt;nes-preview&gt;</a> và lần chạy test phía trên <a href="#/logs">&lt;nes-logs&gt;</a> — bar điều khiển, pane hiển thị. Nếu có nhiều task cùng lúc, danh sách <a href="#/checks">Checks</a> dễ đọc hơn một chồng bar.`) +
        a11y(`Nút dừng/chạy duy nhất đổi nghĩa theo trạng thái, nên hãy ghi nhãn cả hành động <em>và</em> đối tượng (“Dừng pnpm dev”), và cập nhật nhãn khi trạng thái đổi. Nút chỉ có icon mà không nhãn thì trình đọc không dùng được.`),
    },
  },
  {
    id: "logs",
    cat: "OpenCode",
    name: "Logs",
    desc: {
      en: "A streaming log surface: push lines, it follows the tail — unless you scrolled up, then it holds still. Ring-buffered and filterable by level.",
      vi: "Bề mặt log streaming: push dòng vào, nó tự theo cuối — trừ khi bạn đã cuộn lên, lúc đó nó đứng yên. Có ring buffer và lọc theo level.",
    },
    body: {
      en: () =>
        ocLogsStage() +
        cb(`<nes-logs max="500" style="--logs-h:18rem"></nes-logs>

<script type="module">
  const logs = document.querySelector("nes-logs");
  for await (const line of stream) logs.push(line, level(line));
  logs.push("built in 5.91s", "done");

  // the toolbar is yours — one attribute drives the filter
  logs.setAttribute("level", "error");
  logs.follow();       // jump back to the tail
<\/script>`) +
        apiGroups({
          attr: [
            ["<code>max</code>", "number", "<code>500</code>", "ring-buffer cap; older lines drop so a long build can't grow forever"],
            ["<code>level</code>", "<code>all</code> | level", "<code>all</code>", "show only lines of this level (the others are hidden, not deleted)"],
            ["<code>--logs-h</code>", "length", "<code>14rem</code>", "max height before it scrolls"],
          ],
          prop: [
            ["<code>.max</code>", "number", "<code>500</code>", "the active cap (read-only)"],
            ["<code>.pinned</code>", "boolean", "<code>true</code>", "whether the view is stuck to the tail"],
          ],
          method: [
            ["<code>.push(text, level?)</code>", "<code>(string, LogLevel) =&gt; HTMLElement</code>", "<code>\"info\"</code>", "append one line; returns the created <code>.logline</code>"],
            ["<code>.clear()</code>", "<code>() =&gt; void</code>", "—", "drop every line"],
            ["<code>.follow()</code>", "<code>() =&gt; void</code>", "—", "jump back to the tail"],
          ],
          slot: [["<code>.logline</code> children", "pre-rendered lines (SSR / a saved run) are filtered like pushed ones"]],
        }) +
        h2("Levels") +
        api(
          ["Level", "Reads as"],
          [
            ["<code>info</code>", "the default — muted body text"],
            ["<code>debug</code>", "dim (noise you keep but don't read)"],
            ["<code>warn</code>", "gold"],
            ["<code>error</code>", "red"],
            ["<code>done</code>", "green — the line you were waiting for"],
          ],
        ) +
        note(`Deliberately no toolbar: filtering and follow are one attribute and one method, so you compose <a href="#/segment">.segment</a> / <a href="#/button">.btn</a> beside it and keep full control of the layout. For a finished transcript, the static <a href="#/terminal">.terminal</a> recipe needs no JS at all.`) +
        a11y(`The surface is <code>role="log"</code>, which announces additions politely and never interrupts. That's also why <code>push()</code> appends text nodes rather than re-rendering: re-rendering a live region re-announces everything.`),
      vi: () =>
        ocLogsStage() +
        cb(`<nes-logs max="500" style="--logs-h:18rem"></nes-logs>

<script type="module">
  const logs = document.querySelector("nes-logs");
  for await (const line of stream) logs.push(line, level(line));
  logs.push("built in 5.91s", "done");

  // toolbar là của bạn — chỉ một attribute điều khiển filter
  logs.setAttribute("level", "error");
  logs.follow();       // nhảy về cuối
<\/script>`) +
        apiGroups({
          attr: [
            ["<code>max</code>", "number", "<code>500</code>", "giới hạn ring buffer; dòng cũ bị bỏ để build dài không phình mãi"],
            ["<code>level</code>", "<code>all</code> | level", "<code>all</code>", "chỉ hiện dòng của level này (các dòng khác bị ẩn, không bị xóa)"],
            ["<code>--logs-h</code>", "length", "<code>14rem</code>", "chiều cao tối đa trước khi cuộn"],
          ],
          prop: [
            ["<code>.max</code>", "number", "<code>500</code>", "giới hạn đang dùng (chỉ đọc)"],
            ["<code>.pinned</code>", "boolean", "<code>true</code>", "view có đang dính vào cuối không"],
          ],
          method: [
            ["<code>.push(text, level?)</code>", "<code>(string, LogLevel) =&gt; HTMLElement</code>", "<code>\"info\"</code>", "thêm một dòng; trả về <code>.logline</code> vừa tạo"],
            ["<code>.clear()</code>", "<code>() =&gt; void</code>", "—", "xóa hết dòng"],
            ["<code>.follow()</code>", "<code>() =&gt; void</code>", "—", "nhảy về cuối"],
          ],
          slot: [["các con <code>.logline</code>", "dòng render sẵn (SSR / một lần chạy đã lưu) cũng được lọc như dòng push vào"]],
        }) +
        h2("Level") +
        api(
          ["Level", "Đọc thành"],
          [
            ["<code>info</code>", "mặc định — chữ thân muted"],
            ["<code>debug</code>", "mờ (nhiễu vẫn giữ nhưng không đọc)"],
            ["<code>warn</code>", "gold"],
            ["<code>error</code>", "đỏ"],
            ["<code>done</code>", "xanh — dòng bạn đang chờ"],
          ],
        ) +
        note(`Cố tình không có toolbar: filter và follow chỉ là một attribute và một method, nên bạn tự ghép <a href="#/segment">.segment</a> / <a href="#/button">.btn</a> bên cạnh và toàn quyền về layout. Với transcript đã xong, recipe tĩnh <a href="#/terminal">.terminal</a> không cần JS.`) +
        a11y(`Bề mặt này là <code>role="log"</code>, đọc phần thêm mới một cách polite và không cắt ngang. Đó cũng là lý do <code>push()</code> thêm text node thay vì render lại: render lại một live region sẽ đọc lại toàn bộ.`),
    },
  },
  {
    id: "preview",
    cat: "OpenCode",
    name: "App preview",
    desc: {
      en: "The running app in a framed viewport — URL bar, reload, and 375 / 768 / full widths. The pane that closes the vibe-coding loop.",
      vi: "App đang chạy trong một khung viewport — thanh URL, reload, và các bề rộng 375 / 768 / full. Pane khép lại vòng lặp vibe coding.",
    },
    body: {
      en: () =>
        ocPreviewStage() +
        cb(`<nes-preview src="http://localhost:5173" view="mobile"
             aria-label="Storefront preview" style="--av-h:28rem"></nes-preview>

<script type="module">
  const pv = document.querySelector("nes-preview");
  pv.url = "http://localhost:5173/checkout";  // navigate
  pv.view = "desktop";                        // switch viewport
  pv.reload();                                // after a hot rebuild
  pv.addEventListener("nes:navigate", (e) => console.log(e.detail.url));
<\/script>`) +
        apiGroups({
          attr: [
            ["<code>src</code>", "url", "<code>about:blank</code>", "the address in the frame; changing it navigates"],
            ["<code>view</code>", "<code>mobile</code> | <code>tablet</code> | <code>desktop</code>", "<code>desktop</code>", "viewport preset — 375px / 768px / full width"],
            ["<code>no-bar</code>", "boolean", "off", "hide the URL bar (embed it under your own controls)"],
            ["<code>sandbox</code>", "string", "—", "passed through to the iframe verbatim when present"],
            ["<code>aria-label</code>", "string", '<code>"App preview"</code>', "becomes the iframe's title"],
            ["<code>--av-h</code> / <code>--av-w</code>", "length", "<code>22rem</code> / preset", "frame height / width override"],
          ],
          prop: [
            ["<code>.url</code>", "string", "—", "get / set the previewed address"],
            ["<code>.view</code>", "<code>PreviewView</code>", "<code>desktop</code>", "get / set the viewport preset"],
          ],
          method: [["<code>.reload()</code>", "<code>() =&gt; void</code>", "—", "reload the frame (or navigate, if the URL field was edited)"]],
          event: [["<code>nes:navigate</code>", "<code>{ url }</code>", "—", "the frame was pointed somewhere, or reloaded"]],
        }) +
        note(`The bar is built from the recipes you already have — <a href="#/input">.input</a>, <a href="#/button">.btn</a>, <a href="#/segment">.segment</a> — so it inherits the size scale and accents with no new styling. The viewport buttons read <code>375</code> / <code>768</code> / <code>FULL</code> because a width is more useful than a device name.`) +
        warn(`<code>sandbox</code> is passed through exactly as you write it and is <em>not</em> set by default — a dev preview usually needs scripts and same-origin, and silently choosing that trade-off for you would be the wrong call. Decide it explicitly for untrusted content.`) +
        a11y(`An iframe needs a title: <code>aria-label</code> on the host becomes it. The viewport buttons carry full labels (“Mobile · 375px”) behind their short text, and the URL field is a real labelled input, so the whole bar is keyboard-operable.`),
      vi: () =>
        ocPreviewStage() +
        cb(`<nes-preview src="http://localhost:5173" view="mobile"
             aria-label="Preview cửa hàng" style="--av-h:28rem"></nes-preview>

<script type="module">
  const pv = document.querySelector("nes-preview");
  pv.url = "http://localhost:5173/checkout";  // điều hướng
  pv.view = "desktop";                        // đổi viewport
  pv.reload();                                // sau khi rebuild nóng
  pv.addEventListener("nes:navigate", (e) => console.log(e.detail.url));
<\/script>`) +
        apiGroups({
          attr: [
            ["<code>src</code>", "url", "<code>about:blank</code>", "địa chỉ trong frame; đổi là điều hướng"],
            ["<code>view</code>", "<code>mobile</code> | <code>tablet</code> | <code>desktop</code>", "<code>desktop</code>", "preset viewport — 375px / 768px / full width"],
            ["<code>no-bar</code>", "boolean", "tắt", "ẩn thanh URL (nhúng dưới control của bạn)"],
            ["<code>sandbox</code>", "string", "—", "truyền nguyên văn xuống iframe khi có mặt"],
            ["<code>aria-label</code>", "string", '<code>"App preview"</code>', "trở thành title của iframe"],
            ["<code>--av-h</code> / <code>--av-w</code>", "length", "<code>22rem</code> / preset", "ghi đè chiều cao / rộng khung"],
          ],
          prop: [
            ["<code>.url</code>", "string", "—", "lấy / gán địa chỉ đang preview"],
            ["<code>.view</code>", "<code>PreviewView</code>", "<code>desktop</code>", "lấy / gán preset viewport"],
          ],
          method: [["<code>.reload()</code>", "<code>() =&gt; void</code>", "—", "reload frame (hoặc điều hướng, nếu ô URL vừa được sửa)"]],
          event: [["<code>nes:navigate</code>", "<code>{ url }</code>", "—", "frame được trỏ tới đâu đó, hoặc vừa reload"]],
        }) +
        note(`Thanh bar dựng từ đúng những recipe bạn đã có — <a href="#/input">.input</a>, <a href="#/button">.btn</a>, <a href="#/segment">.segment</a> — nên thừa hưởng thang size và accent mà không cần style mới. Nút viewport ghi <code>375</code> / <code>768</code> / <code>FULL</code> vì một con số bề rộng hữu ích hơn một tên thiết bị.`) +
        warn(`<code>sandbox</code> được truyền y nguyên như bạn viết và <em>không</em> được đặt sẵn — preview dev thường cần scripts và same-origin, và tự ý chọn đánh đổi đó thay bạn là sai. Hãy quyết định rõ ràng khi nội dung không đáng tin.`) +
        a11y(`iframe cần title: <code>aria-label</code> trên host sẽ thành title đó. Nút viewport mang nhãn đầy đủ (“Mobile · 375px”) phía sau chữ ngắn, và ô URL là input có nhãn thật, nên cả thanh bar dùng được bằng bàn phím.`),
    },
  },
  {
    id: "stacktrace",
    cat: "OpenCode",
    name: "Stack trace",
    desc: {
      en: "The failure, readable: kind + message, then frames with your code lit and vendor frames dimmed, plus the action that starts the next agent loop.",
      vi: "Lỗi, ở dạng đọc được: loại + thông điệp, rồi các frame với code của bạn được làm nổi và frame vendor mờ đi, cộng nút mở vòng lặp agent tiếp theo.",
    },
    body: {
      en: () =>
        ocStacktraceStage("FIX WITH AI", "OPEN FILE") +
        cb(`<div class="stacktrace">
  <div class="st-head">
    <span class="st-kind">TypeError</span>
    <span class="st-msg">Cannot read properties of undefined (reading 'id')</span>
  </div>
  <ol class="st-frames">
    <li class="st-frame app">
      <code>src/auth/session.ts:42:19</code><span class="st-fn">getSession</span>
    </li>
    <li class="st-frame">
      <code>node_modules/h3/dist/index.mjs:812:14</code><span class="st-fn">toNodeHandle</span>
    </li>
  </ol>
  <div class="st-actions">
    <button class="btn sm"><nes-icon name="wand"></nes-icon>FIX WITH AI</button>
    <button class="btn sm ghost">OPEN FILE</button>
  </div>
</div>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.stacktrace</code>", "the card — crit accent bar, because this is a failure"],
            ["<code>.st-kind</code>", "the error class (TypeError, ENOENT, …)"],
            ["<code>.st-msg</code>", "the message, in body type so long text stays readable"],
            ["<code>.st-frames</code>", "the frame list; scrolls sideways instead of wrapping paths"],
            ["<code>.st-frame</code>", "one frame; add <code>.app</code> for your own code"],
            ["<code>.st-fn</code>", "the function name"],
            ["<code>.st-actions</code>", "what happens next — fix, open, copy"],
          ],
        ) +
        note(`<code>.app</code> is the whole point: marking your frames and dimming <code>node_modules</code> turns a 40-line trace into two lines that matter. Not a <a href="#/alert">callout</a> — a callout is a message, this is evidence you click into.`) +
        a11y(`An <code>&lt;ol&gt;</code> keeps the frame order meaningful (innermost first). The <code>.app</code> highlight is colour, so keep the path visible in every frame — that's what tells a reader whose code it is. Paths scroll rather than truncate so nothing is silently hidden.`),
      vi: () =>
        ocStacktraceStage("SỬA BẰNG AI", "MỞ FILE") +
        cb(`<div class="stacktrace">
  <div class="st-head">
    <span class="st-kind">TypeError</span>
    <span class="st-msg">Cannot read properties of undefined (reading 'id')</span>
  </div>
  <ol class="st-frames">
    <li class="st-frame app">
      <code>src/auth/session.ts:42:19</code><span class="st-fn">getSession</span>
    </li>
    <li class="st-frame">
      <code>node_modules/h3/dist/index.mjs:812:14</code><span class="st-fn">toNodeHandle</span>
    </li>
  </ol>
  <div class="st-actions">
    <button class="btn sm"><nes-icon name="wand"></nes-icon>SỬA BẰNG AI</button>
    <button class="btn sm ghost">MỞ FILE</button>
  </div>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.stacktrace</code>", "card — thanh accent crit, vì đây là lỗi"],
            ["<code>.st-kind</code>", "lớp lỗi (TypeError, ENOENT, …)"],
            ["<code>.st-msg</code>", "thông điệp, dùng font thân để chữ dài vẫn dễ đọc"],
            ["<code>.st-frames</code>", "danh sách frame; cuộn ngang thay vì bẻ dòng đường dẫn"],
            ["<code>.st-frame</code>", "một frame; thêm <code>.app</code> cho code của bạn"],
            ["<code>.st-fn</code>", "tên hàm"],
            ["<code>.st-actions</code>", "bước tiếp theo — sửa, mở, copy"],
          ],
        ) +
        note(`<code>.app</code> chính là điểm cốt lõi: đánh dấu frame của bạn và làm mờ <code>node_modules</code> biến một trace 40 dòng thành hai dòng đáng đọc. Không phải <a href="#/alert">callout</a> — callout là một thông điệp, đây là bằng chứng bạn click vào.`) +
        a11y(`<code>&lt;ol&gt;</code> giữ thứ tự frame có nghĩa (trong cùng trước). Phần làm nổi <code>.app</code> là màu, nên hãy để đường dẫn hiện ở mọi frame — đó mới là thứ cho người đọc biết code của ai. Đường dẫn cuộn chứ không bị cắt để không có gì bị ẩn âm thầm.`),
    },
  },
  {
    id: "ckpt",
    cat: "OpenCode",
    name: "Checkpoints",
    desc: {
      en: "Time travel: every snapshot you can rewind to, with the one you're on marked. The safety net that makes fast, messy iteration safe.",
      vi: "Du hành thời gian: mọi snapshot bạn có thể quay về, có đánh dấu điểm bạn đang ở. Lưới an toàn giúp việc lặp nhanh và bừa trở nên an toàn.",
    },
    body: {
      en: () =>
        ocCkptStage("NOW", "RESTORE") +
        cb(`<ol class="ckpt">
  <li class="ckpt-item current">
    <span class="cp-time">14:07</span>
    <span class="cp-label">Wire rotation into /refresh</span>
    <span class="cp-actions"><span class="badge clear">NOW</span></span>
  </li>
  <li class="ckpt-item">
    <span class="cp-time">14:02</span>
    <span class="cp-label">Add rotate() helper</span>
    <span class="cp-actions"><button class="btn xs ghost">RESTORE</button></span>
  </li>
</ol>`) +
        h2("Parts") +
        api(
          ["Class", "Role"],
          [
            ["<code>.ckpt</code>", "the list, newest first (a rail runs down the markers)"],
            ["<code>.ckpt-item</code>", "one snapshot"],
            ["<code>.current</code>", "where you are now — a filled marker, brighter text"],
            ["<code>.cp-time</code>", "when it was taken"],
            ["<code>.cp-label</code>", "what changed (truncates — the time and action stay visible)"],
            ["<code>.cp-actions</code>", "restore / diff, pushed right"],
          ],
        ) +
        note(`Close cousin of <a href="#/timeline">Timeline</a>, different job: a timeline narrates history, <code>.ckpt</code> lets you <em>go</em> there. If nothing is restorable, use the timeline — an inert restore button is worse than none.`) +
        warn(`Restoring throws away work that came after it. Confirm before you do it (a <a href="#/modal">modal</a>), and say what will be lost — a one-click, silent rewind is how people lose an afternoon.`) +
        a11y(`Label each restore with its checkpoint (“Restore 14:02 — Add rotate() helper”); ten buttons all reading “RESTORE” are unusable by screen reader. Mark the current row with <code>aria-current="true"</code> so it isn't identified by colour alone.`),
      vi: () =>
        ocCkptStage("HIỆN TẠI", "PHỤC HỒI") +
        cb(`<ol class="ckpt">
  <li class="ckpt-item current">
    <span class="cp-time">14:07</span>
    <span class="cp-label">Nối rotation vào /refresh</span>
    <span class="cp-actions"><span class="badge clear">HIỆN TẠI</span></span>
  </li>
  <li class="ckpt-item">
    <span class="cp-time">14:02</span>
    <span class="cp-label">Thêm helper rotate()</span>
    <span class="cp-actions"><button class="btn xs ghost">PHỤC HỒI</button></span>
  </li>
</ol>`) +
        h2("Thành phần") +
        api(
          ["Class", "Vai trò"],
          [
            ["<code>.ckpt</code>", "danh sách, mới nhất trước (một thanh ray chạy dọc các dấu)"],
            ["<code>.ckpt-item</code>", "một snapshot"],
            ["<code>.current</code>", "vị trí bạn đang ở — dấu được tô đầy, chữ sáng hơn"],
            ["<code>.cp-time</code>", "thời điểm chụp"],
            ["<code>.cp-label</code>", "thay đổi gì (bị cắt bớt — giờ và nút vẫn luôn thấy)"],
            ["<code>.cp-actions</code>", "phục hồi / xem diff, đẩy sang phải"],
          ],
        ) +
        note(`Họ hàng gần của <a href="#/timeline">Timeline</a> nhưng khác việc: timeline kể lại lịch sử, <code>.ckpt</code> cho bạn <em>đi</em> tới đó. Nếu không có gì phục hồi được thì dùng timeline — một nút phục hồi vô tác dụng còn tệ hơn không có.`) +
        warn(`Phục hồi sẽ bỏ đi phần việc làm sau điểm đó. Hãy xác nhận trước (một <a href="#/modal">modal</a>) và nói rõ sẽ mất gì — quay về một cú click, im lặng, chính là cách người ta mất cả buổi chiều.`) +
        a11y(`Đặt nhãn nút phục hồi kèm checkpoint (“Phục hồi 14:02 — Thêm helper rotate()”); mười nút cùng ghi “PHỤC HỒI” thì trình đọc không dùng được. Đánh dấu hàng hiện tại bằng <code>aria-current="true"</code> để không chỉ nhận biết bằng màu.`),
    },
  },
  {
    id: "deploy",
    cat: "OpenCode",
    name: "Deploy",
    desc: {
      en: "Where the code actually went: environment · URL · duration and commit. One row per environment — preview, staging, production.",
      vi: "Code thực sự đã đi đâu: môi trường · URL · thời gian và commit. Mỗi môi trường một hàng — preview, staging, production.",
    },
    body: {
      en: () =>
        ocDeployStage("VISIT", "deploying…", "build failed") +
        cb(`<div class="deploy" data-state="done">
  <span class="dp-env">PRODUCTION</span>
  <a class="dp-url" href="https://acme-web.pages.dev">acme-web.pages.dev</a>
  <span class="dp-meta">42s · a1b2c3d</span>
  <button class="btn xs outline">VISIT</button>
</div>
<div class="deploy" data-state="running">
  <span class="dp-env">PREVIEW</span>
  <span class="dp-url">deploying…</span>
  <span class="dp-meta">pr-118</span>
</div>`) +
        h2("Parts") +
        api(
          ["Class / attribute", "Role"],
          [
            ["<code>.deploy</code>", "the row; its accent bar takes the state colour"],
            ["<code>data-state</code>", "<code>queued</code> waiting · <code>running</code> deploying · <code>done</code> live · <code>error</code> failed"],
            ["<code>.dp-env</code>", "the environment name"],
            ["<code>.dp-url</code>", "the live address (truncates before it pushes the row wide)"],
            ["<code>.dp-meta</code>", "duration + commit, pushed right"],
          ],
        ) +
        note(`The last link in the chain: <a href="#/plan">Plan</a> → <a href="#/diffview">diff</a> → <a href="#/checks">Checks</a> → <a href="#/preview">preview</a> → Deploy. Same five state words the whole way, so “running” never means two different things in one workspace.`) +
        a11y(`A URL is the label users scan for — keep it in the text even when truncated, and put the full address in the link's <code>href</code> (and <code>title</code> when clipped). Don't rely on the accent bar alone for failure; “build failed” belongs in words.`),
      vi: () =>
        ocDeployStage("MỞ", "đang deploy…", "build lỗi") +
        cb(`<div class="deploy" data-state="done">
  <span class="dp-env">PRODUCTION</span>
  <a class="dp-url" href="https://acme-web.pages.dev">acme-web.pages.dev</a>
  <span class="dp-meta">42s · a1b2c3d</span>
  <button class="btn xs outline">MỞ</button>
</div>
<div class="deploy" data-state="running">
  <span class="dp-env">PREVIEW</span>
  <span class="dp-url">đang deploy…</span>
  <span class="dp-meta">pr-118</span>
</div>`) +
        h2("Thành phần") +
        api(
          ["Class / thuộc tính", "Vai trò"],
          [
            ["<code>.deploy</code>", "hàng; thanh accent lấy màu trạng thái"],
            ["<code>data-state</code>", "<code>queued</code> đang chờ · <code>running</code> đang deploy · <code>done</code> đã live · <code>error</code> lỗi"],
            ["<code>.dp-env</code>", "tên môi trường"],
            ["<code>.dp-url</code>", "địa chỉ live (bị cắt trước khi làm hàng phình ra)"],
            ["<code>.dp-meta</code>", "thời gian + commit, đẩy sang phải"],
          ],
        ) +
        note(`Mắt cuối của chuỗi: <a href="#/plan">Plan</a> → <a href="#/diffview">diff</a> → <a href="#/checks">Checks</a> → <a href="#/preview">preview</a> → Deploy. Vẫn đúng năm từ trạng thái đó suốt cả chuỗi, nên “running” không bao giờ mang hai nghĩa trong cùng một workspace.`) +
        a11y(`URL là thứ người dùng quét mắt tìm — giữ nó trong chữ dù đã bị cắt, và đặt địa chỉ đầy đủ vào <code>href</code> (và <code>title</code> khi bị cắt). Đừng chỉ dựa vào thanh accent để báo lỗi; “build lỗi” phải nằm ở chữ.`),
    },
  },
];

/* --------------------------------------- shared, language-neutral demos */
function swatch(v, hex, use) {
  return `<div style="display:flex;align-items:center;gap:var(--sp-3)">
    <span style="inline-size:2.25rem;block-size:2.25rem;flex:none;background:var(${v});border:var(--bw-2) solid var(--line);box-shadow:var(--sh-2)"></span>
    <div style="min-inline-size:0">
      <div class="mono" style="color:var(--ink);font-size:var(--fs-chip)">${v}</div>
      <div class="mono" style="color:var(--dim);font-size:var(--fs-label)">${hex}${use ? " · " + use : ""}</div>
    </div>
  </div>`;
}
function swatches(items) {
  return `<div class="grid-cards">${items.map((it) => swatch(it[0], it[1], it[2])).join("")}</div>`;
}

/* ---- OpenCode demos. Language-neutral on purpose: every label is mono chrome,
   a file path, a branch or a command — identical in EN and VI — so one demo
   serves both pages instead of two copies drifting apart. */
const ocPane = (label) =>
  `<div style="padding:var(--sp-3);font-family:var(--font-mono);font-size:var(--fs-label);color:var(--dim)">${label}</div>`;
function ocWorkbenchStage() {
  return stage(
    "WORKBENCH",
    `<div class="workbench" style="--wb-h:15rem;--wb-rail:8rem;--wb-side:9rem">
       <aside class="wb-rail">${ocPane(".wb-rail<br>files")}</aside>
       <main class="wb-main">
         <div class="filetabs"><span class="filetab active"><button type="button" class="ft-name">session.ts</button></span><span class="filetab"><button type="button" class="ft-name">refresh.ts</button></span></div>
         <div style="flex:1;min-block-size:0;overflow:auto">${ocPane(".wb-main<br>chat / editor")}</div>
         <div class="statusline" data-state="running"><span class="sl-state">RUNNING</span><span class="sl-item">12.4k / 200k</span></div>
       </main>
       <aside class="wb-side">${ocPane(".wb-side<br>preview")}</aside>
     </div>`,
    "col",
  );
}
function ocRepobarStage() {
  return stage(
    "REPO BAR",
    `<div class="repobar">
       <span class="repo-name"><nes-icon name="folder"></nes-icon>acme/web</span>
       <span class="repo-branch"><nes-icon name="gitBranch"></nes-icon>feat/refresh-token</span>
       <span class="repo-dirty">3 CHANGED</span>
       <span class="repo-actions"><button class="btn xs ghost">PULL</button><button class="btn xs">COMMIT</button></span>
     </div>`,
    "col",
  );
}
function ocStatuslineStage() {
  const line = (state, label, extra) =>
    `<div class="statusline" data-state="${state}">
       <span class="sl-state">${label}</span>
       <span class="sl-item"><nes-icon name="bot"></nes-icon>opus-4.8</span>
       <span class="sl-item"><nes-icon name="layers"></nes-icon>12.4k / 200k</span>
       <span class="sl-end"><span class="sl-item"><nes-icon name="clock"></nes-icon>${extra}</span><span class="sl-item"><nes-icon name="gitBranch"></nes-icon>main</span></span>
     </div>`;
  return stage(
    "STATUS LINE",
    line("running", "RUNNING", "0:42") +
      line("done", "IDLE", "1:07") +
      line("error", "FAILED", "0:12"),
    "col",
  );
}
function ocSandboxStage() {
  return stage(
    "SANDBOX",
    `<div class="sandbox" data-state="running">
       <div class="sb-head"><span class="sb-name">node-20 · sfo</span><span class="badge clear">LIVE</span>
         <span class="sb-actions"><button class="btn xs ghost">RESTART</button></span></div>
       <div class="sb-specs"><span>CPU <b>2 vCPU</b></span><span>RAM <b>4 GB</b></span><span>DISK <b>8 GB</b></span><span>UP <b>12m</b></span></div>
     </div>
     <div class="sandbox" data-state="thinking">
       <div class="sb-head"><span class="sb-name">node-20 · fra</span><span class="badge warn">BOOTING</span></div>
       <div class="sb-specs"><span>pulling image</span><span><b>4.2 GB / 6 GB</b></span></div>
     </div>`,
    "col",
  );
}
function ocPlanStage() {
  return stage(
    "PLAN",
    `<ol class="plan">
       <li class="plan-step" data-state="done">Read src/auth/session.ts</li>
       <li class="plan-step" data-state="done">Add a rotate() helper</li>
       <li class="plan-step" data-state="running">Wire it into the /refresh route<span class="plan-note">editing src/routes/refresh.ts</span></li>
       <li class="plan-step" data-state="queued">Add a regression test</li>
       <li class="plan-step" data-state="error">Update the OpenAPI schema<span class="plan-note">schema.yaml not found</span></li>
     </ol>`,
    "col",
  );
}
function ocPermStage(kind, target, why, actions) {
  return stage(
    "PERMISSION",
    `<div class="perm">
       <span class="perm-kind">${kind}</span>
       <code class="perm-target">${target}</code>
       <p class="perm-why">${why}</p>
       <div class="perm-actions">${actions}</div>
     </div>`,
    "col",
  );
}
function ocDiffstatStage() {
  return stage(
    "DIFF STAT",
    `<div class="diffstat">
       <span class="ds-files">7 FILES</span>
       <span class="ds-add">+184</span>
       <span class="ds-del">-52</span>
       <span class="ds-bar"><i class="add" style="--seg:78%"></i><i class="del" style="--seg:22%"></i></span>
     </div>`,
    "col",
  );
}
function ocFilechangeStage() {
  const row = (ch, dir, file, add, del) =>
    `<a class="filechange" data-change="${ch}" href="#/filechange">
       <span class="fc-mark">${ch}</span>
       <span class="fc-path"><span class="fc-dir">${dir}</span>${file}</span>
       <span class="fc-count"><b class="add">+${add}</b><b class="del">-${del}</b></span>
     </a>`;
  return stage(
    "FILE CHANGE",
    row("M", "src/auth/", "session.ts", 42, 8) +
      row("A", "src/auth/", "rotate.ts", 61, 0) +
      row("D", "src/legacy/", "token.ts", 0, 44) +
      row("R", "src/routes/", "refresh.ts", 3, 3),
    "col",
  );
}
const OC_DIFF_BODY = `<span class="ctx">  const token = read(req)</span><span class="del">  return verify(token)</span><span class="add">  const next = await rotate(token)</span><span class="add">  return { token: next }</span><span class="ctx">}</span>`;
function ocHunkStage(keep, revert) {
  return stage(
    "HUNK",
    `<details class="hunk" open>
       <summary class="hunk-head">
         <code class="hunk-range">@@ -18,7 +18,9 @@</code><span class="hunk-scope">async function refresh()</span>
         <span class="hunk-actions"><button class="btn xs">${keep}</button><button class="btn xs outline" data-accent="crit">${revert}</button></span>
       </summary>
       <div class="diff">${OC_DIFF_BODY}</div>
     </details>`,
    "col",
  );
}
/* the patch <nes-diff> parses in the demo — a real (small) unified diff */
const OC_PATCH = `diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -18,7 +18,9 @@ export async function refresh(req) {
   const token = read(req)
-  return verify(token)
+  const next = await rotate(token)
+  return { token: next }
 }`;
function ocDiffViewStage() {
  return stage("&lt;nes-diff&gt;", `<nes-diff>${OC_PATCH}</nes-diff>`, "col");
}
function ocChecksStage(logs) {
  return stage(
    "CHECKS",
    `<ul class="checks">
       <li class="check-item" data-state="done"><span class="chk-name">lint</span><span class="chk-meta">1.2s</span></li>
       <li class="check-item" data-state="done"><span class="chk-name">typecheck</span><span class="chk-meta">4.8s</span></li>
       <li class="check-item" data-state="running"><span class="chk-name">unit</span><span class="chk-meta">42 / 96</span></li>
       <li class="check-item" data-state="error"><span class="chk-name">e2e</span><span class="chk-meta">3 failing</span><a class="chk-link" href="#/logs">${logs} →</a></li>
       <li class="check-item" data-state="queued"><span class="chk-name">build</span><span class="chk-meta">queued</span></li>
     </ul>`,
    "col",
  );
}
function ocRunbarStage(stop, retry, ready, exited) {
  return stage(
    "RUN BAR",
    `<div class="runbar" data-state="running">
       <button class="btn xs icon" aria-label="${stop}"><nes-icon name="stop"></nes-icon></button>
       <span class="run-cmd">pnpm dev</span>
       <a class="run-url" href="#/preview">localhost:5173</a>
       <span class="run-meta">${ready}</span>
     </div>
     <div class="runbar" data-state="error">
       <button class="btn xs icon" aria-label="${retry}"><nes-icon name="refresh"></nes-icon></button>
       <span class="run-cmd">pnpm test</span>
       <span class="run-meta">${exited}</span>
     </div>`,
    "col",
  );
}
function ocLogsStage() {
  return stage(
    "&lt;nes-logs&gt;",
    `<nes-logs max="200" style="--logs-h:9rem">
       <span class="logline" data-level="debug">14:02:03 resolving 412 modules</span>
       <span class="logline">14:02:04 vite v6.0.1 building for production</span>
       <span class="logline">14:02:05 transforming src/routes/refresh.ts</span>
       <span class="logline" data-level="warn">14:02:06 chunk exceeds 500 kB after minification</span>
       <span class="logline" data-level="error">14:02:07 src/auth/session.ts(42,19): TS2532 object is possibly undefined</span>
       <span class="logline" data-level="done">14:02:09 built in 5.91s</span>
     </nes-logs>`,
    "col",
  );
}
function ocPreviewStage() {
  // dogfood: the frame points at this site's own demo page (same origin, no
  // network needed) so the demo shows a real app rather than a placeholder.
  return stage(
    "&lt;nes-preview&gt;",
    `<nes-preview view="mobile" src="./demo.html" aria-label="Demo app preview" style="--av-h:13rem"></nes-preview>`,
    "col",
  );
}
function ocStacktraceStage(fix, open) {
  return stage(
    "STACK TRACE",
    `<div class="stacktrace">
       <div class="st-head"><span class="st-kind">TypeError</span><span class="st-msg">Cannot read properties of undefined (reading 'id')</span></div>
       <ol class="st-frames">
         <li class="st-frame app"><code>src/auth/session.ts:42:19</code><span class="st-fn">getSession</span></li>
         <li class="st-frame app"><code>src/routes/refresh.ts:11:5</code><span class="st-fn">handler</span></li>
         <li class="st-frame"><code>node_modules/h3/dist/index.mjs:812:14</code><span class="st-fn">toNodeHandle</span></li>
       </ol>
       <div class="st-actions"><button class="btn sm"><nes-icon name="wand"></nes-icon>${fix}</button><button class="btn sm ghost">${open}</button></div>
     </div>`,
    "col",
  );
}
function ocCkptStage(now, restore) {
  return stage(
    "CHECKPOINTS",
    `<ol class="ckpt">
       <li class="ckpt-item current"><span class="cp-time">14:07</span><span class="cp-label">Wire rotation into /refresh</span><span class="cp-actions"><span class="badge clear">${now}</span></span></li>
       <li class="ckpt-item"><span class="cp-time">14:02</span><span class="cp-label">Add rotate() helper</span><span class="cp-actions"><button class="btn xs ghost">${restore}</button></span></li>
       <li class="ckpt-item"><span class="cp-time">13:58</span><span class="cp-label">Scaffold session tests</span><span class="cp-actions"><button class="btn xs ghost">${restore}</button></span></li>
     </ol>`,
    "col",
  );
}
function ocDeployStage(visit, deploying, failed) {
  return stage(
    "DEPLOY",
    `<div class="deploy" data-state="done"><span class="dp-env">PRODUCTION</span><a class="dp-url" href="#/deploy">acme-web.pages.dev</a><span class="dp-meta">42s · a1b2c3d</span><button class="btn xs outline">${visit}</button></div>
     <div class="deploy" data-state="running"><span class="dp-env">PREVIEW</span><span class="dp-url">${deploying}</span><span class="dp-meta">pr-118</span></div>
     <div class="deploy" data-state="error"><span class="dp-env">STAGING</span><span class="dp-url">${failed}</span><span class="dp-meta">exit 1 · 9e0f1a2</span></div>`,
    "col",
  );
}
function ocFiletabsStage(unsaved, close) {
  const tab = (name, active, dirty) =>
    `<span class="filetab${active ? " active" : ""}">
       <button type="button" class="ft-name">${name}</button>
       ${dirty ? `<span class="ft-dirty" role="img" aria-label="${unsaved}"></span>` : ""}
       <button type="button" class="ft-close" aria-label="${close} ${name}">×</button>
     </span>`;
  return stage(
    "FILE TABS",
    `<div class="filetabs">${tab("session.ts", true, true)}${tab("refresh.ts", false, false)}${tab("schema.yaml", false, true)}</div>`,
    "col",
  );
}

/* ---- Map of Content demo. Both shapes index the SAME fake article, so the only
   difference on screen is the shape. min="1" keeps it visible with few headings;
   mode pins the shape (the real default switches at rail-at). The rail's own
   full-height scroll is overridden inline — a stage is not a viewport. */
function ocTocStage(label) {
  const src = `<div id="toc-demo-src" style="min-inline-size:0;font-size:var(--fs-body);color:var(--muted)">
       <h2 style="font-size:var(--fs-h3);color:var(--ink);margin:0 0 var(--sp-1)">Boot sequence</h2><p style="margin:0 0 var(--sp-3)">Power on, palette check.</p>
       <h3 style="font-size:var(--fs-chip);color:var(--muted);margin:0 0 var(--sp-1)">Cartridge slot</h3><p style="margin:0 0 var(--sp-3)">Blow on it. Twice.</p>
       <h2 style="font-size:var(--fs-h3);color:var(--ink);margin:0 0 var(--sp-1)">Chiptune mixer</h2><p style="margin:0 0 var(--sp-3)">Two pulse, one triangle, one noise.</p>
       <h2 style="font-size:var(--fs-h3);color:var(--ink);margin:0 0 var(--sp-1)">Save states</h2><p style="margin:0">Battery-backed SRAM.</p>
     </div>`;
  return (
    stage(
      "MOBILE · BAR",
      `<div style="display:flex;flex-direction:column;gap:var(--sp-4);max-inline-size:min(420px,100%)">
         <nes-toc mode="bar" min="1" label="${label}" target="#toc-demo-src"></nes-toc>
         ${src}
       </div>`,
      "col",
    ) +
    stage(
      "WIDE · RAIL",
      `<div style="display:grid;grid-template-columns:minmax(0,1fr) 12rem;gap:var(--sp-5)">
         <div style="min-inline-size:0;font-family:var(--font-mono);font-size:var(--fs-label);color:var(--dim)">…your content…</div>
         <nes-toc mode="rail" min="1" label="${label}" target="#toc-demo-src"
           style="block-size:auto;padding:0;position:static"></nes-toc>
       </div>`,
      "col",
    )
  );
}

function accentStage() {
  const names = [
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
  ];
  return stage(
    "data-accent",
    names
      .map((a) => `<button class="btn" data-accent="${a}">${a.toUpperCase()}</button>`)
      .join("\n     "),
  );
}
function badgeStage() {
  return stage(
    "BADGE",
    `<span class="badge clear">CLEAR</span>
     <span class="badge warn">PENDING</span>
     <span class="badge crit">BLOCKED</span>
     <span class="badge todo">TODO</span>`,
  );
}
function chipStage(all) {
  return stage(
    "CHIP",
    `<button class="chip active"><span class="dot"></span>${all}</button>
     <button class="chip" data-accent="blue"><span class="dot"></span>TYPESCRIPT</button>
     <button class="chip" data-accent="good"><span class="dot"></span>GO</button>
     <button class="chip" data-accent="crit"><span class="dot"></span>RUST</button>`,
  );
}
function avatarStage() {
  return stage(
    "AVATAR",
    `<span class="avatar sm">A</span>
     <span class="avatar">QA</span>
     <span class="avatar lg" data-accent="cyan">Z</span>
     <span class="avatar-group">
       <span class="avatar" data-accent="blue">1</span>
       <span class="avatar" data-accent="good">2</span>
       <span class="avatar" data-accent="purple">3</span>
     </span>`,
  );
}
function radioStage() {
  return stage(
    "RADIO",
    `<label class="check"><input class="radio" type="radio" name="m" checked> Haiku</label>
     <label class="check"><input class="radio" type="radio" name="m"> Sonnet</label>
     <label class="check"><input class="radio" type="radio" name="m"> Opus</label>`,
    "col",
  );
}
function selectStage(label) {
  return stage(
    "SELECT",
    `<label class="field" style="inline-size:100%;max-inline-size:min(340px,100%)">
      <span class="label">${label}</span>
      <select class="select">
        <option>claude-haiku-4-5</option>
        <option>claude-sonnet-5</option>
        <option>claude-opus-4-8</option>
      </select>
    </label>`,
    "col",
  );
}
function skeletonStage() {
  return stage(
    "SKELETON",
    `<div style="inline-size:100%;max-inline-size:min(420px,100%);display:flex;flex-direction:column;gap:var(--sp-3)">
      <span class="skeleton" style="inline-size:45%"></span>
      <span class="skeleton"></span>
      <span class="skeleton" style="inline-size:80%"></span>
    </div>`,
    "col",
  );
}
function breadcrumbStage() {
  return stage(
    "BREADCRUMB",
    `<nav aria-label="Breadcrumb"><ol class="breadcrumb">
      <li><a href="#/intro">Docs</a></li>
      <li><a href="#/button">Element</a></li>
      <li><span aria-current="page">Breadcrumb</span></li>
    </ol></nav>`,
    "col",
  );
}
function paginationStage() {
  return stage(
    "PAGINATION",
    `<nav class="pagination" aria-label="Pagination">
      <button class="pg" disabled>‹</button>
      <button class="pg">1</button>
      <button class="pg" aria-current="page">2</button>
      <button class="pg">3</button>
      <button class="pg">›</button>
    </nav>`,
    "col",
  );
}
function tableStage(cols) {
  return stage(
    "TABLE",
    `<div class="table-wrap" style="inline-size:100%">
      <table class="table">
        <thead><tr><th>${cols[0]}</th><th>${cols[1]}</th><th>${cols[2]}</th></tr></thead>
        <tbody>
          <tr><td>model</td><td><code>haiku-4-5</code></td><td>92%</td></tr>
          <tr><td>maxOutputTokens</td><td><code>512</code></td><td>61%</td></tr>
          <tr><td>temperature</td><td><code>0</code></td><td>—</td></tr>
        </tbody>
      </table>
    </div>`,
    "col",
  );
}
function codeStage(comment) {
  return stage(
    "CODEBLOCK",
    `<div class="codeblock" style="inline-size:100%">
      <button class="cp" type="button" aria-label="Copy code">COPY</button>
<pre><span class="t-com">${comment}</span>
<span class="t-at">{</span>
  <span class="t-sel">"model"</span>: <span class="t-str">"claude-haiku-4-5"</span>,
  <span class="t-sel">"maxOutputTokens"</span>: <span class="t-num">512</span>
<span class="t-at">}</span></pre>
    </div>`,
    "col",
  );
}
function statStage(labels) {
  return stage(
    "STAT",
    `<div class="stat" data-accent="gold"><div class="n">1,240</div><div class="l">${labels[0]}</div></div>
     <div class="stat" data-accent="good"><div class="n">7</div><div class="l">${labels[1]}</div></div>
     <div class="stat" data-accent="cyan"><div class="n">98%</div><div class="l">${labels[2]}</div></div>`,
  );
}

function spinnerStage() {
  return stage(
    "SPINNER",
    `<span class="spinner sm" aria-hidden="true"></span>
     <span class="spinner" aria-hidden="true"></span>
     <span class="spinner lg" data-accent="cyan" aria-hidden="true"></span>
     <span class="spinner lg" data-accent="pink" aria-hidden="true"></span>`,
  );
}
function rangeStage(label) {
  return stage(
    "RANGE",
    `<div style="inline-size:100%;max-inline-size:min(420px,100%);display:flex;flex-direction:column;gap:var(--sp-4)">
      <label class="field">
        <span class="label">${label}</span>
        <input class="range" type="range" min="0" max="100" value="70" aria-label="${label}">
      </label>
      <input class="range" type="range" value="40" data-accent="cyan" aria-label="${label} 2">
    </div>`,
    "col",
  );
}
function segmentStage(labels) {
  return stage(
    "SEGMENT",
    `<div class="segment" role="group" aria-label="Difficulty">
      <button type="button">${labels[0]}</button>
      <button type="button" aria-pressed="true">${labels[1]}</button>
      <button type="button">${labels[2]}</button>
    </div>`,
  );
}
function stepsStage(labels) {
  return stage(
    "STEPS",
    `<ol class="steps">
      <li class="done">${labels[0]}</li>
      <li class="done">${labels[1]}</li>
      <li aria-current="step">${labels[2]}</li>
      <li>${labels[3]}</li>
    </ol>`,
    "col",
  );
}
function meterStage() {
  const bar = (n, on, accent) =>
    `<div class="meter" data-accent="${accent}" role="meter" aria-valuenow="${on}" aria-valuemin="0" aria-valuemax="${n}" aria-label="${on}/${n}">` +
    Array.from({ length: n }, (_, i) => `<span class="cell${i < on ? " on" : ""}"></span>`).join("") +
    "</div>";
  return stage(
    "METER",
    `<div style="display:flex;flex-direction:column;gap:var(--sp-3)">
      ${bar(10, 8, "good")}
      ${bar(10, 4, "warn")}
      ${bar(10, 2, "crit")}
    </div>`,
    "col",
  );
}
function emptyStage(t) {
  return stage(
    "EMPTY",
    `<div class="empty" style="inline-size:100%;max-inline-size:min(440px,100%)">
      <div class="icon" aria-hidden="true">${t.icon}</div>
      <div class="title">${t.title}</div>
      <p>${t.body}</p>
      <button class="btn">${t.action}</button>
    </div>`,
    "col",
  );
}
function ratingStage() {
  const stars = (on) =>
    Array.from({ length: 5 }, (_, i) => `<span class="s${i < on ? " on" : ""}">★</span>`).join("");
  return stage(
    "RATING",
    `<div style="display:flex;flex-direction:column;gap:var(--sp-2)">
      <span class="rating" role="img" aria-label="4 of 5">${stars(4)}</span>
      <span class="rating" data-accent="cyan" role="img" aria-label="3 of 5">${stars(3)}</span>
      <span class="rating" data-accent="crit" role="img" aria-label="5 of 5">${stars(5)}</span>
    </div>`,
    "col",
  );
}
function drawerStage(t) {
  return stage(
    "DRAWER",
    `<button class="btn" data-open="demo-drawer">${t.open}</button>
     <dialog class="drawer" id="demo-drawer" data-accent="cyan">
       <div class="head"><span class="title">${t.title}</span></div>
       <p class="doc-p" style="margin:0">${t.body}</p>
       <form method="dialog" style="margin-block-start:var(--sp-5)">
         <button class="btn ghost">${t.close}</button>
       </form>
     </dialog>`,
  );
}

function stepperStage(label) {
  return stage(
    "STEPPER",
    `<label class="field" style="align-items:flex-start">
      <span class="label">${label}</span>
      <div class="stepper">
        <button type="button" aria-label="−">−</button>
        <input type="number" value="2" min="1" max="8" aria-label="${label}">
        <button type="button" aria-label="+">+</button>
      </div>
    </label>`,
    "col",
  );
}
function bannerStage(t) {
  return stage(
    "BANNER",
    `<div class="banner" data-accent="cyan" role="status" style="inline-size:100%">
      <span>${t.msg}</span>
      <button class="close" aria-label="Dismiss">${t.close}</button>
    </div>`,
    "col",
  );
}
function navlistStage(items, current, lab) {
  const links = items
    .map((n) => `<a href="#/navlist"${n === current ? ' aria-current="page"' : ""}>${n}</a>`)
    .join("\n      ");
  return stage(
    "NAVLIST",
    `<nav class="navlist" aria-label="Demo" style="inline-size:100%;max-inline-size:min(240px,100%)">
      <span class="lab">${lab}</span>
      ${links}
    </nav>`,
    "col",
  );
}
function datalistStage(rows) {
  return stage(
    "DATALIST",
    `<dl class="datalist" style="inline-size:100%;max-inline-size:min(420px,100%)">${rows
      .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
      .join("")}</dl>`,
    "col",
  );
}
function timelineStage(items) {
  return stage(
    "TIMELINE",
    `<ol class="timeline" data-accent="good" style="inline-size:100%;max-inline-size:min(460px,100%)">${items
      .map(
        ([time, title, body]) =>
          `<li><div class="time">${time}</div><div class="title">${title}</div><p class="doc-p" style="margin:var(--sp-1) 0 0">${body}</p></li>`,
      )
      .join("")}</ol>`,
    "col",
  );
}
function proseStage(lang) {
  const t =
    lang === "vi"
      ? {
          h: "Tiêu đề",
          p: 'Đoạn văn có <a href="#/prose">link</a> và <code>inline code</code>.',
          a: "Bullet vuông",
          b: "Phục hồi từ reset",
          q: "Một ghi chú nhỏ.",
        }
      : {
          h: "Heading",
          p: 'Body copy with a <a href="#/prose">link</a> and <code>inline code</code>.',
          a: "Square bullets",
          b: "Restored from the reset",
          q: "A quiet aside.",
        };
  return stage(
    "PROSE",
    `<article class="prose" style="inline-size:100%">
      <h2 class="doc-h2" style="margin:0">${t.h}</h2>
      <p>${t.p}</p>
      <ul><li>${t.a}</li><li>${t.b}</li></ul>
      <blockquote>${t.q}</blockquote>
    </article>`,
    "col",
  );
}

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
          <p style="color:var(--muted);font-size:var(--fs-chip)">${ps.map((x) => tr(x.name)).join(" · ")}</p>
        </a>`,
    )
    .join("")}</div>`;
}

/* ----------------------------------------------------------- sidebar */
function renderSidebar() {
  const link = (pg) => {
    const name = tr(pg.name);
    // search haystack = name + description (quotes stripped so it's attr-safe)
    const hay = `${name} ${tr(pg.desc) || ""}`.toLowerCase().replace(/["<>]/g, " ");
    return `<a class="navlink" href="#/${pg.id}" data-id="${pg.id}" data-name="${hay}">${name}</a>`;
  };
  const group = (label, items) =>
    `<div class="side-grp" data-grp><span class="side-lab">${label}</span>${items.map(link).join("")}</div>`;

  let html = group(UI[LANG].gs, GS);
  for (const cat of CAT_ORDER) {
    html += group(cat, COMPONENTS.filter((c) => c.cat === cat));
  }
  document.getElementById("side").innerHTML = html;
}

/* ------------------------------------------------------------- router */
const pageEl = document.getElementById("page");

function render(id) {
  const pg = BY_ID[id] || BY_ID.intro;
  const body = pg.body[LANG]();
  const idx = ALL.indexOf(pg);
  const prev = ALL[idx - 1];
  const next = ALL[idx + 1];
  const foot = `<nav class="doc-foot">
      ${prev ? `<a class="top-link" href="#/${prev.id}">← ${tr(prev.name)}</a>` : "<span></span>"}
      ${next ? `<a class="top-link" href="#/${next.id}">${tr(next.name)} →</a>` : "<span></span>"}
    </nav>`;

  pageEl.innerHTML = `<div class="doc-page">
      <span class="eyebrow doc-cat">${tr(pg.cat)}</span>
      <h1>${tr(pg.name)}</h1>
      <p class="doc-lead">${esc(tr(pg.desc))}</p>
      ${body}
      ${foot}
    </div>`;

  for (const a of document.querySelectorAll(".navlink")) {
    a.setAttribute("aria-current", a.dataset.id === pg.id ? "page" : "false");
  }
  document.getElementById("toc")?.refresh();
  document.title = `${tr(pg.name)} · 8-BIT NES`;
  document.body.removeAttribute("data-nav-open");
  pageEl.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function currentId() {
  return (location.hash.match(/^#\/(.+)$/) || [])[1] || "intro";
}
window.addEventListener("hashchange", () => render(currentId()));

/* ------------------------------------------------------------- i18n */
function applyChrome() {
  document.documentElement.lang = LANG;
  const s = document.querySelector("[data-search]");
  if (s) {
    s.placeholder = UI[LANG].search;
    s.setAttribute("aria-label", UI[LANG].filter);
  }
  document.querySelector(".menu-btn")?.setAttribute("aria-label", UI[LANG].menu);
  document.getElementById("side")?.setAttribute("aria-label", UI[LANG].side);
  // <nes-toc> is language-agnostic: it takes the heading text as-is and the
  // label from us, so switching EN/VI relabels the index (and its nav's
  // accessible name) with no work inside the component.
  document.getElementById("toc")?.setAttribute("label", UI[LANG].onpage);
  for (const b of document.querySelectorAll("[data-lang]")) {
    b.setAttribute("aria-pressed", String(b.dataset.lang === LANG));
  }
}

function setLang(lang) {
  if (lang === LANG || !UI[lang]) return;
  LANG = lang;
  store.set("lang", lang);
  applyChrome();
  renderSidebar();
  render(currentId());
}

/* --------------------------------------------------- delegated behaviour */
document.addEventListener("click", (e) => {
  // <nes-toc> emits real in-page anchors; this app routes on the hash, so scroll
  // manually and keep #/<page> in the URL (see the ToC docs page for this exact
  // caveat). scroll-margin is already set on the heading by the component.
  const tl = e.target.closest("nes-toc a[data-to]");
  if (tl) {
    e.preventDefault();
    document.getElementById(tl.dataset.to)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    return;
  }
  const lb = e.target.closest("[data-lang]");
  if (lb) {
    setLang(lb.dataset.lang);
    return;
  }
  const cp = e.target.closest(".cp");
  if (cp && !cp.closest("nes-code")) {
    // <nes-code> wires its own copy; only handle manual .codeblock here.
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
  // ⌘K / Ctrl-K focuses search (the component-docs convention)
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    document.querySelector("[data-search]")?.focus();
  }
  // Esc clears + leaves the search box
  if (e.key === "Escape" && e.target.matches("[data-search]")) {
    e.target.value = "";
    e.target.dispatchEvent(new Event("input", { bubbles: true }));
    e.target.blur();
  }
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
applyChrome();
renderSidebar();
render(currentId());
