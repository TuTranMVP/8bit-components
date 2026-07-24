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
const TOP_H = 53; // keep in sync with --top-h in docs.html
/** URL-safe id from heading text (strips diacritics so VN headings still slug). */
const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sec";
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
  Editor: "indigo",
  Typography: "pink",
  Visualize: "lime",
};
const CAT_ORDER = ["Element", "Form", "Feedback", "Navigation", "Overlay", "Data", "Chat", "Editor", "Typography", "Visualize"];

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
           <button class="btn" data-accent="cyan">Cyan</button>
           <button class="btn sm">SM</button>
           <button class="btn lg">LG</button>
           <button class="btn icon" aria-label="Play">▶</button>
           <button class="btn" aria-busy="true">Saving</button>
           <button class="btn" disabled>Locked</button>`,
        ) +
        cb(
          `<button class="btn">Solid</button>
<button class="btn outline">Outline</button>
<button class="btn soft">Soft</button>
<button class="btn ghost">Ghost</button>
<button class="btn link">Link</button>

<button class="btn lg" data-accent="cyan">Large</button>
<button class="btn icon" aria-label="Play">▶</button>
<button class="btn" aria-busy="true">Saving…</button>`,
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
            ["<code>.sm</code> / <code>.lg</code>", "smaller / larger size"],
            ["<code>.block</code>", "full-width"],
            ["<code>.icon</code>", "square icon-only (add aria-label)"],
            ["<code>[aria-busy=true]</code>", "loading spinner, clicks blocked"],
            ["<code>[aria-pressed=true]</code>", "toggle-on fills with accent"],
            ["<code>[disabled]</code>", "muted, no shadow"],
            ["<code>data-accent</code>", "recolor (blue/gold/cyan/…)"],
          ],
        ) +
        a11y(
          "Renders a native <code>&lt;button&gt;</code>, so keyboard and screen-reader behaviour come free. Use <code>aria-pressed</code> for toggles, <code>aria-busy</code> for loading, and give icon-only buttons an <code>aria-label</code>.",
        ),
      vi: () =>
        stage(
          "BUTTON",
          `<button class="btn">Solid</button>
           <button class="btn outline">Outline</button>
           <button class="btn soft">Soft</button>
           <button class="btn ghost">Ghost</button>
           <button class="btn link">Link</button>
           <button class="btn" data-accent="cyan">Cyan</button>
           <button class="btn sm">SM</button>
           <button class="btn lg">LG</button>
           <button class="btn icon" aria-label="Chơi">▶</button>
           <button class="btn" aria-busy="true">Đang lưu</button>
           <button class="btn" disabled>Khoá</button>`,
        ) +
        cb(
          `<button class="btn">Solid</button>
<button class="btn outline">Outline</button>
<button class="btn soft">Soft</button>
<button class="btn ghost">Ghost</button>
<button class="btn link">Link</button>

<button class="btn lg" data-accent="cyan">Large</button>
<button class="btn icon" aria-label="Chơi">▶</button>
<button class="btn" aria-busy="true">Đang lưu…</button>`,
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
            ["<code>.sm</code> / <code>.lg</code>", "cỡ nhỏ / lớn"],
            ["<code>.block</code>", "rộng hết dòng"],
            ["<code>.icon</code>", "vuông chỉ-icon (thêm aria-label)"],
            ["<code>[aria-busy=true]</code>", "spinner loading, chặn click"],
            ["<code>[aria-pressed=true]</code>", "toggle bật, tô đầy màu nhấn"],
            ["<code>[disabled]</code>", "mờ đi, bỏ bóng"],
            ["<code>data-accent</code>", "đổi màu (blue/gold/cyan/…)"],
          ],
        ) +
        a11y(
          "Render ra <code>&lt;button&gt;</code> gốc nên bàn phím và screen reader hoạt động sẵn. Dùng <code>aria-pressed</code> cho toggle, <code>aria-busy</code> cho loading, và đặt <code>aria-label</code> cho nút chỉ có icon.",
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

/* --------------------- "On this page" TOC + scroll-spy --------------------- */
let tocObs = null;
function buildToc() {
  const toc = document.getElementById("toc");
  if (!toc) return;
  tocObs?.disconnect();
  const heads = [...pageEl.querySelectorAll(".doc-h2")];
  if (heads.length < 2) {
    toc.hidden = true;
    toc.innerHTML = "";
    return;
  }
  const used = {};
  const links = heads.map((h) => {
    let id = slug(h.textContent);
    if (used[id]) id += `-${used[id]++}`;
    else used[id] = 1;
    h.id = id;
    return `<button class="toc-link" type="button" data-to="${id}">${esc(h.textContent)}</button>`;
  });
  toc.hidden = false;
  toc.innerHTML = `<span class="toc-lab">${UI[LANG].onpage}</span>${links.join("")}`;

  const map = new Map([...toc.querySelectorAll(".toc-link")].map((a) => [a.dataset.to, a]));
  map.get(heads[0].id)?.setAttribute("aria-current", "true"); // sensible default
  tocObs = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        for (const a of map.values()) a.removeAttribute("aria-current");
        map.get(en.target.id)?.setAttribute("aria-current", "true");
      }
    },
    { rootMargin: `-${TOP_H + 8}px 0px -68% 0px`, threshold: 0 },
  );
  for (const h of heads) tocObs.observe(h);
}

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
  buildToc();
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
  const tl = e.target.closest(".toc-link");
  if (tl) {
    document.getElementById(tl.dataset.to)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
