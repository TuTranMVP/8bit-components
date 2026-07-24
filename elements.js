/* ==========================================================================
   8-BIT NES · elements.js  —  stateful layer
   Light-DOM Web Components: global tokens.css/components.css apply directly.
   Cross-framework: <nes-*> works in HTML, Vue3/Nuxt, React 19 with no wrapper.
   Import once:  <script type="module" src="./elements.js"></script>
   ========================================================================== */

import { icon } from "./icons.js";

/* ------------------------------------------------------------ safe storage */
export const store = {
  _m: {},
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return this._m[k] ?? null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      this._m[k] = v;
    }
  },
};

/* ------------------------------------------------------------- chiptune SFX */
let _mute = store.get("nes_mute") === "1";
let _actx = null;
export const SFX = {
  coin: [
    [988, 0.08],
    [1319, 0.2],
  ],
  bad: [
    [196, 0.12],
    [147, 0.18],
  ],
  clear: [
    [659, 0.09],
    [784, 0.09],
    [988, 0.09],
    [1319, 0.25],
  ],
  unlock: [
    [523, 0.07],
    [784, 0.14],
  ],
};
export function bleep(seq) {
  if (_mute) return;
  try {
    _actx = _actx || new (window.AudioContext || window.webkitAudioContext)();
    let t = _actx.currentTime;
    for (const [f, d] of seq) {
      const o = _actx.createOscillator(),
        g = _actx.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.035, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(_actx.destination);
      o.start(t);
      o.stop(t + d);
      t += d * 0.9;
    }
  } catch {
    /* audio unavailable — silent, never throws */
  }
}
export function setMute(m) {
  _mute = !!m;
  store.set("nes_mute", _mute ? "1" : "0");
  document.dispatchEvent(new CustomEvent("nes:mute", { detail: { muted: _mute } }));
}
export function isMuted() {
  return _mute;
}

/* --------------------------------------------------------- floating +XP text */
export function floatXP(el, text = "+50 XP", color = "var(--gold)") {
  const f = document.createElement("span");
  f.textContent = text;
  f.setAttribute("aria-hidden", "true");
  Object.assign(f.style, {
    position: "absolute",
    left: "50%",
    top: "0",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 50,
    fontFamily: "var(--font-mono)",
    fontWeight: "700",
    fontSize: "var(--fs-chip)",
    color,
    textShadow: "var(--sh-1)",
  });
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  el.appendChild(f);
  f.animate(
    [
      { opacity: 1, transform: "translate(-50%,0)" },
      { opacity: 0, transform: "translate(-50%,-38px)" },
    ],
    { duration: 900, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" },
  ).finished.finally(() => f.remove());
}

/* fire XP into the global bus (an <nes-hud> may be listening) */
export function grantXP(amount, srcEl) {
  document.dispatchEvent(new CustomEvent("nes:xp", { detail: { amount } }));
  if (srcEl) floatXP(srcEl, `+${amount} XP`);
}

/* ----------------------------------------------------------------- toast */
let _toastHost = null;
export function toast(msg, opts = {}) {
  const { accent = "good", timeout = 3200 } = opts;
  if (!_toastHost) {
    _toastHost = document.createElement("div");
    _toastHost.className = "toast-host";
    _toastHost.setAttribute("role", "status");
    _toastHost.setAttribute("aria-live", "polite");
    document.body.appendChild(_toastHost);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.dataset.accent = accent;
  t.innerHTML = msg;
  _toastHost.appendChild(t);
  bleep(SFX.coin);
  const kill = () => {
    t.style.transition = "opacity var(--dur-mid) var(--ease)";
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 220);
  };
  if (timeout) setTimeout(kill, timeout);
  return t;
}

/* ========================================================================== */
/*  <nes-sound>  —  mute toggle button                                        */
/*  <nes-sound></nes-sound>                                                    */
/* ========================================================================== */
class NesSound extends HTMLElement {
  connectedCallback() {
    this.render();
    this._onMute = () => this.render();
    document.addEventListener("nes:mute", this._onMute);
    this.addEventListener("click", () => {
      setMute(!isMuted());
      if (!isMuted()) bleep(SFX.coin);
    });
  }
  disconnectedCallback() {
    document.removeEventListener("nes:mute", this._onMute);
  }
  render() {
    const m = isMuted();
    this.innerHTML =
      `<button class="btn ghost" aria-pressed="${m}" aria-label="${m ? "Bật âm" : "Tắt âm"}">` +
      `${m ? "🔇 MUTED" : "🔊 SOUND"}</button>`;
  }
}

/* ========================================================================== */
/*  <nes-collapsible>  —  header toggles body                                 */
/*  <nes-collapsible open>                                                     */
/*    <span slot="head">STAGE 1 · Config</span>                                */
/*    ...body...                                                               */
/*  </nes-collapsible>                                                         */
/* ========================================================================== */
class NesCollapsible extends HTMLElement {
  connectedCallback() {
    const open = this.hasAttribute("open");
    const head = this.querySelector('[slot="head"]');
    const headHTML = head ? head.innerHTML : this.getAttribute("head") || "SECTION";
    head?.remove();
    const bodyHTML = this.innerHTML;
    this.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "card";
    if (this.getAttribute("accent")) wrap.dataset.accent = this.getAttribute("accent");

    const btn = document.createElement("button");
    btn.className = "head";
    btn.style.cssText = "background:none;border:0;cursor:pointer;width:100%";
    btn.setAttribute("aria-expanded", String(open));
    btn.innerHTML =
      `<span class="title" style="flex:1;text-align:start">${headHTML}</span>` +
      `<span class="chev mono" aria-hidden="true">${open ? "▾" : "▸"}</span>`;

    const body = document.createElement("div");
    body.innerHTML = bodyHTML;
    body.hidden = !open;

    btn.addEventListener("click", () => {
      const now = body.hidden;
      body.hidden = !now;
      btn.setAttribute("aria-expanded", String(now));
      btn.querySelector(".chev").textContent = now ? "▾" : "▸";
      bleep(SFX.unlock);
    });

    wrap.append(btn, body);
    this.append(wrap);
  }
}

/* ========================================================================== */
/*  <nes-hud>  —  LV + XP bar, listens on the nes:xp bus                       */
/*  <nes-hud ns="quest" max-xp="1600" per-level="400"></nes-hud>               */
/* ========================================================================== */
class NesHud extends HTMLElement {
  connectedCallback() {
    this.ns = this.getAttribute("ns") || "nes";
    this.perLvl = +(this.getAttribute("per-level") || 400);
    this.maxXp = +(this.getAttribute("max-xp") || this.perLvl * 4);
    this.xp = +(store.get(`${this.ns}_xp`) || 0);
    this.render();
    this._onXP = (e) => {
      this.add(e.detail.amount);
    };
    document.addEventListener("nes:xp", this._onXP);
  }
  disconnectedCallback() {
    document.removeEventListener("nes:xp", this._onXP);
  }
  add(n) {
    this.xp = Math.min(this.xp + n, this.maxXp);
    store.set(`${this.ns}_xp`, this.xp);
    this.render();
  }
  render() {
    const pct = Math.round((this.xp / this.maxXp) * 100);
    const lvl = Math.min(
      1 + Math.floor(this.xp / this.perLvl),
      Math.ceil(this.maxXp / this.perLvl),
    );
    const capped = this.xp >= this.maxXp;
    this.style.cssText = "display:flex;align-items:center;gap:var(--sp-3)";
    this.innerHTML =
      `<span class="mono" style="color:var(--good);font-weight:700;font-size:var(--fs-chip)">` +
      `${capped ? "LV MAX" : "LV " + lvl}</span>` +
      `<span class="pbar" style="flex:1;min-width:80px"><i style="--fill:${pct}%"></i></span>` +
      `<span class="mono" style="color:var(--muted);font-size:var(--fs-label)">${this.xp} XP</span>`;
  }
}

/* ========================================================================== */
/*  <nes-quiz>  —  single MCQ, config via child JSON script                   */
/*  <nes-quiz xp="50">                                                         */
/*    <script type="application/json">                                         */
/*    { "q":"...", "options":["A","B","C"], "answer":1, "explain":"..." }       */
/*    </script>                                                                */
/*  </nes-quiz>                                                                */
/* ========================================================================== */
class NesQuiz extends HTMLElement {
  connectedCallback() {
    let cfg = {};
    const s = this.querySelector('script[type="application/json"]');
    try {
      cfg = JSON.parse(s?.textContent || "{}");
    } catch {
      cfg = {};
    }
    this.cfg = cfg;
    this.xp = +(this.getAttribute("xp") || 50);
    this.done = false;
    this.innerHTML = "";
    this.render();
  }
  render() {
    const { q = "", options = [], explain = "" } = this.cfg;
    const box = document.createElement("div");
    box.className = "card";
    box.dataset.accent = "purple";

    const keys = "ABCDEFGH";
    box.innerHTML =
      `<div class="title" style="margin-bottom:var(--sp-3)">${q}</div>` +
      `<div class="opts" style="display:flex;flex-direction:column;gap:var(--sp-2)"></div>` +
      `<div class="expl" hidden style="margin-top:var(--sp-3);padding:var(--sp-3);` +
      `border:var(--bw-2) dashed var(--line-hi);font-size:var(--fs-body);color:var(--muted)">` +
      `<b style="color:var(--good)">Vì sao:</b> ${explain}</div>`;

    const opts = box.querySelector(".opts");
    options.forEach((text, i) => {
      const b = document.createElement("button");
      b.className = "opt";
      b.type = "button";
      b.innerHTML = `<span class="key">${keys[i]}</span><span>${text}</span>`;
      b.addEventListener("click", () => this.answer(i, box, opts));
      opts.appendChild(b);
    });
    this.appendChild(box);
  }
  answer(i, box, opts) {
    if (this.done) return;
    this.done = true;
    const correct = i === this.cfg.answer;
    const buttons = [...opts.children];
    buttons.forEach((b, j) => {
      b.disabled = true;
      if (j === this.cfg.answer) b.classList.add("ok");
      if (j === i && !correct) b.classList.add("bad");
    });
    box.querySelector(".expl").hidden = false;
    if (correct) {
      bleep(SFX.coin);
      grantXP(this.xp, box);
    } else {
      bleep(SFX.bad);
      box.classList.add("shake");
      box.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 260, easing: "ease-in-out", iterations: 2 },
      );
    }
    this.dispatchEvent(
      new CustomEvent("nes:answer", { bubbles: true, detail: { correct, choice: i } }),
    );
  }
}

/* ========================================================================== */
/*  <nes-tabs>  —  accessible tabs, built from children with [data-label]      */
/*  <nes-tabs>                                                                  */
/*    <section data-label="Install" selected>...</section>                      */
/*    <section data-label="Usage">...</section>                                 */
/*  </nes-tabs>                                                                 */
/* ========================================================================== */
class NesTabs extends HTMLElement {
  connectedCallback() {
    const panels = [...this.children].filter((el) => el.hasAttribute("data-label"));
    if (!panels.length) return;
    NesTabs._n = (NesTabs._n || 0) + 1;
    const uid = `tabs-${NesTabs._n}`;

    const list = document.createElement("div");
    list.className = "tablist";
    list.setAttribute("role", "tablist");

    const tabs = panels.map((p, i) => {
      p.classList.add("tabpanel");
      p.setAttribute("role", "tabpanel");
      p.id = p.id || `${uid}-p${i}`;
      p.setAttribute("tabindex", "0");
      const t = document.createElement("button");
      t.className = "tab";
      t.type = "button";
      t.setAttribute("role", "tab");
      t.id = `${uid}-t${i}`;
      t.textContent = p.getAttribute("data-label");
      t.setAttribute("aria-controls", p.id);
      p.setAttribute("aria-labelledby", t.id);
      list.appendChild(t);
      return t;
    });

    const activate = (i) => {
      tabs.forEach((t, j) => {
        const on = j === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
    };

    tabs.forEach((t, i) => {
      t.addEventListener("click", () => {
        activate(i);
        bleep(SFX.unlock);
      });
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const n = (i + d + tabs.length) % tabs.length;
        activate(n);
        tabs[n].focus();
      });
    });

    this.prepend(list);
    activate(
      Math.max(
        0,
        panels.findIndex((p) => p.hasAttribute("selected")),
      ),
    );
  }
}

/* ========================================================================== */
/*  <nes-code>  —  drop-in syntax highlight + copy. Hides all complexity:      */
/*  <nes-code>{ "model": "haiku" }</nes-code>  → highlighted, copyable.         */
/*  One tiny universal tokenizer (comments · strings · tags · numbers · keys); */
/*  no language attr, no dependency. Escape < in raw markup, or it's parsed.    */
/* ========================================================================== */
const _cesc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const _cre =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|<!--[\s\S]*?-->)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w-]*|\/?>)|(\b\d[\d._]*\b)|(\b(?:const|let|var|function|return|import|export|from|default|new|class|extends|async|await|if|else|for|of|in|true|false|null|undefined|this)\b)/g;
export function highlightCode(code) {
  let out = "";
  let last = 0;
  let m = _cre.exec(code);
  while (m) {
    out += _cesc(code.slice(last, m.index));
    const cls = m[1] ? "t-com" : m[2] ? "t-str" : m[3] ? "t-key" : m[4] ? "t-num" : "t-sel";
    out += `<span class="${cls}">${_cesc(m[0])}</span>`;
    last = m.index + m[0].length;
    if (_cre.lastIndex === m.index) _cre.lastIndex++;
    m = _cre.exec(code);
  }
  _cre.lastIndex = 0;
  return out + _cesc(code.slice(last));
}

class NesCode extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    const raw = this.textContent.replace(/^\n+/, "").replace(/\s+$/, "");
    this.innerHTML =
      `<div class="codeblock"><button class="cp" type="button" aria-label="Copy code">COPY</button>` +
      `<pre>${highlightCode(raw)}</pre></div>`;
    this.querySelector(".cp").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(raw);
      btn.textContent = "COPIED!";
      setTimeout(() => {
        btn.textContent = "COPY";
      }, 900);
    });
  }
}

/* ========================================================================== */
/*  FORM MODULE  —  stateful controls. Native where it can be; a light-DOM     */
/*  <nes-*> only where state lives. Each keeps a hidden <input name> so it      */
/*  submits inside a plain <form> (and inside <nes-form>) with zero wiring.     */
/* ========================================================================== */

/* small shared helpers (kept local to this layer) */
const _e = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
function el(tag, attrs) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
/** options come from a child <script type="application/json"> (strings or {value,label,disabled}). */
function readOptions(host) {
  const s = host.querySelector('script[type="application/json"]');
  let raw = [];
  try {
    raw = JSON.parse(s?.textContent || "[]");
  } catch {
    raw = [];
  }
  if (!Array.isArray(raw)) raw = [];
  return raw.map((o) =>
    o && typeof o === "object"
      ? { value: String(o.value), label: String(o.label ?? o.value), disabled: !!o.disabled }
      : { value: String(o), label: String(o) },
  );
}
const _fmtSize = (b) =>
  b < 1024
    ? `${b} B`
    : b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

/* ========================================================================== */
/*  <nes-form>  —  native constraint validation + inline errors + nes:submit   */
/*  <nes-form><label class="field">…<input class="input" required></label>      */
/*    <button class="btn" type="submit">GO</button></nes-form>                  */
/* ========================================================================== */
class NesForm extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    const form = document.createElement("form");
    form.setAttribute("novalidate", "");
    if (this.getAttribute("aria-label"))
      form.setAttribute("aria-label", this.getAttribute("aria-label"));
    while (this.firstChild) form.appendChild(this.firstChild);
    this.appendChild(form);
    this.form = form;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submit();
    });
    form.addEventListener("input", (e) => {
      if (e.target.closest?.(".field.err")) this.validateControl(e.target);
    });
  }
  controls() {
    return [...this.form.querySelectorAll("input,select,textarea")].filter(
      (c) => !["hidden", "submit", "button", "reset"].includes(c.type) && !c.disabled,
    );
  }
  validateControl(c) {
    const ok = c.checkValidity();
    c.setAttribute("aria-invalid", String(!ok));
    const field = c.closest(".field");
    if (field) {
      field.classList.toggle("err", !ok);
      let msg = field.querySelector(".hint.err-msg");
      if (!ok) {
        if (!msg) {
          msg = document.createElement("span");
          msg.className = "hint err-msg";
          field.appendChild(msg);
        }
        msg.textContent = c.dataset.error || c.validationMessage || "Invalid";
      } else if (msg) {
        msg.remove();
      }
    }
    return ok;
  }
  submit() {
    let firstBad = null;
    for (const c of this.controls()) {
      if (!this.validateControl(c) && !firstBad) firstBad = c;
    }
    if (firstBad) {
      firstBad.focus();
      bleep(SFX.bad);
      this.dispatchEvent(new CustomEvent("nes:invalid", { bubbles: true, detail: {} }));
      return;
    }
    const data = Object.fromEntries(new FormData(this.form).entries());
    bleep(SFX.coin);
    this.dispatchEvent(
      new CustomEvent("nes:submit", { bubbles: true, detail: { data, form: this.form } }),
    );
  }
}

/* ========================================================================== */
/*  <nes-number>  —  InputNumber: auto-wired − [n] + stepper (native number)    */
/*  <nes-number name="qty" min="1" max="8" value="2"></nes-number>              */
/* ========================================================================== */
class NesNumber extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    const name = this.getAttribute("name");
    const attr = (k) => (this.getAttribute(k) != null ? ` ${k}="${_e(this.getAttribute(k))}"` : "");
    const wrap = document.createElement("div");
    wrap.className = "stepper";
    wrap.innerHTML =
      `<button type="button" aria-label="Decrease">−</button>` +
      `<input type="number" aria-label="${_e(this.getAttribute("aria-label") || "Number")}"` +
      (name ? ` name="${_e(name)}"` : "") +
      attr("min") +
      attr("max") +
      ` step="${_e(this.getAttribute("step") || "1")}" value="${_e(this.getAttribute("value") ?? "")}">` +
      `<button type="button" aria-label="Increase">+</button>`;
    const input = wrap.querySelector("input");
    const [dec, inc] = wrap.querySelectorAll("button");
    const emit = () =>
      this.dispatchEvent(
        new CustomEvent("nes:change", { bubbles: true, detail: { value: input.value } }),
      );
    dec.addEventListener("click", () => {
      input.stepDown();
      emit();
    });
    inc.addEventListener("click", () => {
      input.stepUp();
      emit();
    });
    input.addEventListener("input", emit);
    this.appendChild(wrap);
    this._input = input;
  }
  get value() {
    return this._input?.value;
  }
  set value(v) {
    if (this._input) this._input.value = v;
  }
}

/* ========================================================================== */
/*  <nes-rating>  —  InputRating: click / arrow-key star picker (read-only opt) */
/*  <nes-rating name="score" max="5" value="3"></nes-rating>                    */
/* ========================================================================== */
class NesRating extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.max = Math.max(1, +(this.getAttribute("max") || 5));
    this.value = Math.min(this.max, Math.max(0, +(this.getAttribute("value") || 0)));
    this.readonly = this.hasAttribute("readonly");
    this.name = this.getAttribute("name");
    this.aria = this.getAttribute("aria-label") || "Rating";
    this.innerHTML = "";
    this.box = el("div", { class: "rating" + (this.getAttribute("size") === "lg" ? " lg" : "") });
    if (this.readonly) {
      this.box.setAttribute("role", "img");
      this.box.setAttribute("aria-label", `${this.value} / ${this.max}`);
      for (let i = 1; i <= this.max; i++) {
        const s = el("span", { class: "s" + (i <= this.value ? " on" : "") });
        s.textContent = "★";
        this.box.appendChild(s);
      }
      this.appendChild(this.box);
      return;
    }
    this.box.setAttribute("role", "radiogroup");
    this.box.setAttribute("aria-label", this.aria);
    this.stars = [];
    for (let i = 1; i <= this.max; i++) {
      const s = el("button", {
        type: "button",
        class: "s",
        role: "radio",
        "aria-label": `${i} / ${this.max}`,
      });
      s.textContent = "★";
      s.addEventListener("click", () => this.set(i));
      s.addEventListener("mouseenter", () => this.paint(i));
      s.addEventListener("keydown", (e) => this.onKey(e, i));
      this.stars.push(s);
      this.box.appendChild(s);
    }
    this.box.addEventListener("mouseleave", () => this.paint(this.value));
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.hidden_.value = String(this.value);
    }
    this.appendChild(this.box);
    if (this.hidden_) this.appendChild(this.hidden_);
    this.paint(this.value);
    this.roving();
  }
  onKey(e, i) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      this.set(Math.min(this.value + 1, this.max));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      this.set(Math.max(this.value - 1, 0));
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.set(i);
    }
  }
  set(v) {
    this.value = v;
    if (this.hidden_) this.hidden_.value = String(v);
    this.paint(v);
    this.roving();
    this.stars[Math.max(0, v - 1)]?.focus();
    bleep(SFX.coin);
    this.dispatchEvent(new CustomEvent("nes:change", { bubbles: true, detail: { value: v } }));
  }
  paint(n) {
    this.stars?.forEach((s, idx) => {
      s.classList.toggle("on", idx < n);
      s.setAttribute("aria-checked", String(idx + 1 === this.value));
    });
  }
  roving() {
    this.stars?.forEach((s, idx) => {
      s.tabIndex = idx + 1 === this.value || (this.value === 0 && idx === 0) ? 0 : -1;
    });
  }
}

/* ========================================================================== */
/*  <nes-tags>  —  InputTags: type + Enter/comma to add a chip, × or ⌫ removes  */
/*  <nes-tags name="labels" value="alpha,beta" placeholder="add…"></nes-tags>   */
/* ========================================================================== */
class NesTags extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.name = this.getAttribute("name");
    this.max = +(this.getAttribute("max") || 0);
    this.tags = (this.getAttribute("value") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    this.innerHTML = "";
    this.box = el("div", { class: "tags" });
    this.input = el("input", {
      type: "text",
      "aria-label": this.getAttribute("aria-label") || "Add tag",
    });
    this.input.placeholder = this.getAttribute("placeholder") || "Add…";
    this.box.addEventListener("click", () => this.input.focus());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        this.add(this.input.value);
        this.input.value = "";
      } else if (e.key === "Backspace" && !this.input.value && this.tags.length) {
        this.remove(this.tags.length - 1);
      }
    });
    this.input.addEventListener("blur", () => {
      if (this.input.value.trim()) {
        this.add(this.input.value);
        this.input.value = "";
      }
    });
    this.box.appendChild(this.input);
    this.appendChild(this.box);
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.appendChild(this.hidden_);
    }
    this.render();
  }
  add(v) {
    v = v.trim();
    if (!v || this.tags.includes(v) || (this.max && this.tags.length >= this.max)) return;
    this.tags.push(v);
    this.render();
    this.emit();
    bleep(SFX.unlock);
  }
  remove(i) {
    this.tags.splice(i, 1);
    this.render();
    this.emit();
  }
  emit() {
    this.dispatchEvent(
      new CustomEvent("nes:change", { bubbles: true, detail: { value: [...this.tags] } }),
    );
  }
  get value() {
    return [...this.tags];
  }
  render() {
    for (const n of [...this.box.querySelectorAll(".tag")]) n.remove();
    this.tags.forEach((t, i) => {
      const chip = el("span", { class: "tag" });
      chip.innerHTML = `<span>${_e(t)}</span><button type="button" class="x" aria-label="Remove ${_e(t)}">×</button>`;
      chip.querySelector(".x").addEventListener("click", (e) => {
        e.stopPropagation();
        this.remove(i);
      });
      this.box.insertBefore(chip, this.input);
    });
    if (this.hidden_) this.hidden_.value = this.tags.join(",");
  }
}

/* ========================================================================== */
/*  <nes-pin>  —  PinInput: N single-char cells, auto-advance + paste-fill      */
/*  <nes-pin length="4" name="otp" numeric></nes-pin>  → fires nes:complete     */
/* ========================================================================== */
class NesPin extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    const len = Math.max(1, +(this.getAttribute("length") || 4));
    this.name = this.getAttribute("name");
    this.numeric = this.getAttribute("type") === "number" || this.hasAttribute("numeric");
    const mask = this.hasAttribute("mask");
    this.innerHTML = "";
    this.wrap = el("div", {
      class: "pin",
      role: "group",
      "aria-label": this.getAttribute("aria-label") || "PIN",
    });
    this.cells = [];
    for (let i = 0; i < len; i++) {
      const c = el("input", {
        type: mask ? "password" : "text",
        inputmode: this.numeric ? "numeric" : "text",
        maxlength: "1",
        autocomplete: i === 0 ? "one-time-code" : "off",
        "aria-label": `Digit ${i + 1}`,
      });
      if (this.numeric) c.setAttribute("pattern", "[0-9]*");
      c.addEventListener("input", () => this.onInput(i));
      c.addEventListener("keydown", (e) => this.onKey(i, e));
      c.addEventListener("paste", (e) => this.onPaste(i, e));
      c.addEventListener("focus", () => c.select());
      this.wrap.appendChild(c);
      this.cells.push(c);
    }
    this.appendChild(this.wrap);
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.appendChild(this.hidden_);
    }
  }
  onInput(i) {
    let v = this.cells[i].value;
    if (this.numeric) v = v.replace(/\D/g, "");
    this.cells[i].value = v.slice(-1);
    if (this.cells[i].value && i < this.cells.length - 1) this.cells[i + 1].focus();
    this.sync();
  }
  onKey(i, e) {
    if (e.key === "Backspace" && !this.cells[i].value && i > 0) this.cells[i - 1].focus();
    else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      this.cells[i - 1].focus();
    } else if (e.key === "ArrowRight" && i < this.cells.length - 1) {
      e.preventDefault();
      this.cells[i + 1].focus();
    }
  }
  onPaste(i, e) {
    e.preventDefault();
    let txt = e.clipboardData?.getData("text") || "";
    if (this.numeric) txt = txt.replace(/\D/g, "");
    const chars = [...txt];
    for (let k = 0; k + i < this.cells.length && k < chars.length; k++)
      this.cells[i + k].value = chars[k];
    this.cells[Math.min(i + chars.length, this.cells.length - 1)].focus();
    this.sync();
  }
  sync() {
    const val = this.cells.map((c) => c.value).join("");
    if (this.hidden_) this.hidden_.value = val;
    this.dispatchEvent(new CustomEvent("nes:change", { bubbles: true, detail: { value: val } }));
    if (val.length === this.cells.length && this.cells.every((c) => c.value)) {
      bleep(SFX.coin);
      this.dispatchEvent(
        new CustomEvent("nes:complete", { bubbles: true, detail: { value: val } }),
      );
    }
  }
  get value() {
    return this.cells.map((c) => c.value).join("");
  }
}

/* ========================================================================== */
/*  <nes-file>  —  FileUpload: click-or-drop zone + removable file list         */
/*  <nes-file name="asset" accept="image/*" multiple label="Drop art"></nes-file> */
/* ========================================================================== */
class NesFile extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.name = this.getAttribute("name");
    this.multiple = this.hasAttribute("multiple");
    const accept = this.getAttribute("accept");
    this.innerHTML = "";
    this.input = el("input", { type: "file" });
    if (this.name) this.input.name = this.name;
    if (this.multiple) this.input.multiple = true;
    if (accept) this.input.accept = accept;
    this.input.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;overflow:hidden";
    this.zone = el("button", { type: "button", class: "dropzone" });
    this.zone.innerHTML =
      `<span class="big">${_e(this.getAttribute("label") || "Drop files or click")}</span>` +
      `<span class="sub">${accept ? _e(accept) : "any file"}</span>`;
    this.list = el("ul", { class: "filelist" });
    this.list.hidden = true;
    this.zone.addEventListener("click", () => this.input.click());
    this.input.addEventListener("change", () => this.render());
    for (const ev of ["dragenter", "dragover"])
      this.zone.addEventListener(ev, (e) => {
        e.preventDefault();
        this.zone.classList.add("over");
      });
    for (const ev of ["dragleave", "drop"])
      this.zone.addEventListener(ev, (e) => {
        e.preventDefault();
        this.zone.classList.remove("over");
      });
    this.zone.addEventListener("drop", (e) => {
      if (e.dataTransfer?.files?.length) this.setFiles(e.dataTransfer.files);
    });
    this.append(this.input, this.zone, this.list);
  }
  setFiles(fileList) {
    const dt = new DataTransfer();
    (this.multiple ? [...fileList] : [fileList[0]]).forEach((f) => f && dt.items.add(f));
    this.input.files = dt.files;
    this.render();
  }
  remove(idx) {
    const dt = new DataTransfer();
    [...this.input.files].forEach((f, i) => i !== idx && dt.items.add(f));
    this.input.files = dt.files;
    this.render();
  }
  render() {
    const files = [...this.input.files];
    this.list.innerHTML = "";
    this.list.hidden = !files.length;
    files.forEach((f, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="name">${_e(f.name)}</span><span class="size">${_fmtSize(f.size)}</span>` +
        `<button type="button" class="x" aria-label="Remove ${_e(f.name)}">×</button>`;
      li.querySelector(".x").addEventListener("click", () => this.remove(i));
      this.list.appendChild(li);
    });
    this.dispatchEvent(new CustomEvent("nes:change", { bubbles: true, detail: { files } }));
  }
  get files() {
    return [...this.input.files];
  }
}

/* ========================================================================== */
/*  <nes-listbox>  —  Listbox: roving-focus [role=option] list (single/multi)   */
/*  <nes-listbox name="lang" multiple><script type="application/json">           */
/*    ["Vue","React",{"value":"svelte","label":"Svelte"}]</script></nes-listbox> */
/* ========================================================================== */
class NesListbox extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    NesListbox._n = (NesListbox._n || 0) + 1;
    this._id = `lb-${NesListbox._n}`;
    this.multiple = this.hasAttribute("multiple");
    this.name = this.getAttribute("name");
    this.opts = readOptions(this);
    this.selected = new Set(
      (this.getAttribute("value") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    this.active = Math.max(
      0,
      this.opts.findIndex((o) => this.selected.has(o.value)),
    );
    this.innerHTML = "";
    this.listEl = el("div", {
      class: "listbox",
      role: "listbox",
      tabindex: "0",
      "aria-label": this.getAttribute("aria-label") || "Options",
    });
    if (this.multiple) this.listEl.setAttribute("aria-multiselectable", "true");
    this.listEl.addEventListener("keydown", (e) => this.onKey(e));
    this.appendChild(this.listEl);
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.appendChild(this.hidden_);
    }
    this.render();
  }
  render() {
    this.listEl.innerHTML = "";
    this.optEls = this.opts.map((o, i) => {
      const e = el("div", {
        role: "option",
        id: `${this._id}-o${i}`,
        "aria-selected": String(this.selected.has(o.value)),
      });
      if (o.disabled) e.setAttribute("aria-disabled", "true");
      e.textContent = o.label;
      e.addEventListener("click", () => {
        if (o.disabled) return;
        this.active = i;
        this.commit(o.value);
      });
      this.listEl.appendChild(e);
      return e;
    });
    this.paint();
    this.sync(true);
  }
  paint() {
    this.optEls.forEach((e, i) => e.classList.toggle("active", i === this.active));
    const a = this.optEls[this.active];
    if (a) {
      this.listEl.setAttribute("aria-activedescendant", a.id);
      a.scrollIntoView({ block: "nearest" });
    }
  }
  commit(v) {
    if (this.multiple) this.selected.has(v) ? this.selected.delete(v) : this.selected.add(v);
    else {
      this.selected.clear();
      this.selected.add(v);
    }
    this.optEls.forEach((e, i) =>
      e.setAttribute("aria-selected", String(this.selected.has(this.opts[i].value))),
    );
    this.paint();
    this.sync(false);
    bleep(SFX.unlock);
  }
  onKey(e) {
    const n = this.opts.length;
    if (!n) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      this.active = (this.active + 1) % n;
      this.paint();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      this.active = (this.active - 1 + n) % n;
      this.paint();
    } else if (e.key === "Home") {
      e.preventDefault();
      this.active = 0;
      this.paint();
    } else if (e.key === "End") {
      e.preventDefault();
      this.active = n - 1;
      this.paint();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const o = this.opts[this.active];
      if (o && !o.disabled) this.commit(o.value);
    }
  }
  sync(silent) {
    const val = this.multiple ? [...this.selected] : ([...this.selected][0] ?? null);
    if (this.hidden_) this.hidden_.value = [...this.selected].join(",");
    if (!silent)
      this.dispatchEvent(new CustomEvent("nes:change", { bubbles: true, detail: { value: val } }));
  }
  get value() {
    return this.multiple ? [...this.selected] : ([...this.selected][0] ?? null);
  }
}

/* ========================================================================== */
/*  combobox core — shared by <nes-input-menu> (free text) and <nes-select-menu> */
/* ========================================================================== */
class NesCombo extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    NesCombo._n = (NesCombo._n || 0) + 1;
    this._id = `cb-${NesCombo._n}`;
    this.opts = readOptions(this);
    this.name = this.getAttribute("name");
    this.placeholder = this.getAttribute("placeholder") || "";
    this.aria = this.getAttribute("aria-label") || "Select";
    this.value = this.getAttribute("value") || "";
    this.open = false;
    this.active = -1;
    this.filtered = this.opts;
    this.innerHTML = "";
    this.wrap = el("div", { class: "combo" });
    this.menu = el("div", { class: "menu" });
    this.menu.hidden = true;
    this.listEl = el("div", { role: "listbox", id: `${this._id}-list` });
    this.build(); // subclass: append trigger/searchEl into this.wrap; may prepend search into this.menu
    this.menu.appendChild(this.listEl);
    this.wrap.appendChild(this.menu);
    this.appendChild(this.wrap);
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.appendChild(this.hidden_);
    }
    this.searchEl.addEventListener("keydown", (e) => this.onKey(e));
    this._onDoc = (e) => {
      if (!this.contains(e.target)) this.close();
    };
    document.addEventListener("click", this._onDoc);
    this.setValue(this.value, true);
    this.filter(this.free ? this.value : "");
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._onDoc);
  }
  openMenu() {
    if (this.open) return;
    this.open = true;
    this.menu.hidden = false;
    this.syncExpanded(true);
  }
  close() {
    if (!this.open) return;
    this.open = false;
    this.menu.hidden = true;
    this.active = -1;
    this.syncExpanded(false);
  }
  filter(q) {
    q = (q || "").toLowerCase().trim();
    this.filtered = this.opts.filter(
      (o) => !q || o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
    this.renderMenu();
  }
  renderMenu() {
    this.listEl.innerHTML = "";
    if (!this.filtered.length) {
      const em = el("div", { class: "menu-empty" });
      em.textContent = "No matches";
      this.listEl.appendChild(em);
      this.itemEls = [];
      return;
    }
    this.itemEls = this.filtered.map((o, i) => {
      const b = el("button", {
        type: "button",
        class: "menuitem",
        role: "option",
        id: `${this._id}-o${i}`,
        "aria-selected": String(o.value === this.value),
      });
      b.textContent = o.label;
      b.addEventListener("mousemove", () => {
        this.active = i;
        this.paint();
      });
      b.addEventListener("click", () => this.pick(o));
      this.listEl.appendChild(b);
      return b;
    });
    if (this.active >= this.filtered.length) this.active = this.filtered.length - 1;
    this.paint();
  }
  paint() {
    this.itemEls?.forEach((b, i) => b.classList.toggle("active", i === this.active));
    const a = this.itemEls?.[this.active];
    if (a) {
      this.searchEl.setAttribute("aria-activedescendant", a.id);
      a.scrollIntoView({ block: "nearest" });
    } else {
      this.searchEl.removeAttribute("aria-activedescendant");
    }
  }
  onKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!this.open) {
        this.openMenu();
        this.filter(this.free ? this.searchEl.value : "");
      }
      this.active = Math.min(this.active + 1, this.filtered.length - 1);
      this.paint();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.active = Math.max(this.active - 1, 0);
      this.paint();
    } else if (e.key === "Enter") {
      if (this.open && this.active >= 0) {
        e.preventDefault();
        this.pick(this.filtered[this.active]);
      }
    } else if (e.key === "Escape") {
      this.close();
      this.triggerEl?.focus();
    }
  }
  pick(o) {
    if (!o) return;
    this.setValue(o.value, false);
    this.close();
    bleep(SFX.unlock);
    this.triggerEl?.focus();
  }
  emit() {
    this.dispatchEvent(
      new CustomEvent("nes:change", { bubbles: true, detail: { value: this.value } }),
    );
  }
}

/* <nes-input-menu>  —  free-text combobox (autocomplete; value = typed text). */
class NesInputMenu extends NesCombo {
  build() {
    this.free = true;
    this.triggerEl = null;
    this.searchEl = el("input", {
      class: "input",
      type: "text",
      role: "combobox",
      autocomplete: "off",
      "aria-autocomplete": "list",
      "aria-expanded": "false",
      "aria-controls": `${this._id}-list`,
      "aria-label": this.aria,
    });
    this.searchEl.placeholder = this.placeholder;
    this.searchEl.addEventListener("input", () => {
      this.value = this.searchEl.value;
      if (this.hidden_) this.hidden_.value = this.value;
      this.openMenu();
      this.filter(this.searchEl.value);
      this.emit();
    });
    this.searchEl.addEventListener("focus", () => {
      this.openMenu();
      this.filter(this.searchEl.value);
    });
    this.wrap.appendChild(this.searchEl);
  }
  syncExpanded(v) {
    this.searchEl.setAttribute("aria-expanded", String(v));
  }
  setValue(v, silent) {
    this.value = v;
    this.searchEl.value = v;
    if (this.hidden_) this.hidden_.value = v;
    if (!silent) this.emit();
  }
}

/* <nes-select-menu>  —  strict searchable single-select (value ∈ options).    */
class NesSelectMenu extends NesCombo {
  build() {
    this.free = false;
    this.triggerEl = el("button", {
      type: "button",
      class: "trigger",
      "aria-haspopup": "listbox",
      "aria-expanded": "false",
      "aria-controls": `${this._id}-list`,
      "aria-label": this.aria,
    });
    this.labelEl = el("span", { class: "ph" });
    this.labelEl.textContent = this.placeholder || "Select…";
    const caret = el("span", { class: "caret", "aria-hidden": "true" });
    caret.textContent = "▾";
    this.triggerEl.append(this.labelEl, caret);
    this.triggerEl.addEventListener("click", () => {
      if (this.open) this.close();
      else {
        this.openMenu();
        this.filter("");
        this.searchEl.focus();
      }
    });
    this.triggerEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.openMenu();
        this.filter("");
        this.searchEl.focus();
      }
    });
    this.searchEl = el("input", {
      class: "input",
      type: "text",
      autocomplete: "off",
      "aria-label": "Filter",
    });
    this.searchEl.placeholder = "Filter…";
    this.searchEl.style.marginBlockEnd = "var(--sp-2)";
    this.searchEl.addEventListener("input", () => this.filter(this.searchEl.value));
    this.menu.appendChild(this.searchEl);
    this.wrap.appendChild(this.triggerEl);
  }
  syncExpanded(v) {
    this.triggerEl.setAttribute("aria-expanded", String(v));
  }
  setValue(v, silent) {
    this.value = v;
    const o = this.opts.find((x) => x.value === v);
    this.labelEl.textContent = o ? o.label : this.placeholder || "Select…";
    this.labelEl.classList.toggle("ph", !o);
    if (this.hidden_) this.hidden_.value = v;
    if (!silent) this.emit();
  }
}

/* ========================================================================== */
/*  <nes-tree>  —  hierarchical folder/file tree (ARIA tree pattern)           */
/*  <nes-tree name="path" aria-label="Files"><script type="application/json">   */
/*    [{ "label":"src", "expanded":true, "children":[                           */
/*      { "label":"index.ts" }, { "label":"api", "children":[…] } ]}]           */
/*  </script></nes-tree>                                                        */
/* ========================================================================== */
class NesTree extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    NesTree._n = (NesTree._n || 0) + 1;
    this._id = `tree-${NesTree._n}`;
    this._idc = 0;
    this.multiple = this.hasAttribute("multiple");
    this.name = this.getAttribute("name");
    this.selected = new Set(
      (this.getAttribute("value") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const s = this.querySelector('script[type="application/json"]');
    let raw = [];
    try {
      raw = JSON.parse(s?.textContent || "[]");
    } catch {
      raw = [];
    }
    this.nodes = this.parseNodes(Array.isArray(raw) ? raw : [], 1, null);
    this.innerHTML = "";
    this.treeEl = el("div", {
      class: "tree",
      role: "tree",
      tabindex: "0",
      "aria-label": this.getAttribute("aria-label") || "Tree",
    });
    if (this.multiple) this.treeEl.setAttribute("aria-multiselectable", "true");
    this.nodes.forEach((n, i) => this.renderNode(n, this.treeEl, i + 1, this.nodes.length));
    this.treeEl.addEventListener("keydown", (e) => this.onKey(e));
    this.appendChild(this.treeEl);
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.appendChild(this.hidden_);
    }
    this.active = this.nodes[0] || null;
    this.refreshActive();
    this.sync(true);
  }
  parseNodes(raw, level, parent) {
    return raw.map((o) => {
      const src = o && typeof o === "object" ? o : { label: String(o) };
      const node = {
        label: String(src.label ?? src.value ?? ""),
        value: String(src.value ?? src.label ?? ""),
        icon: src.icon != null ? String(src.icon) : null,
        disabled: !!src.disabled,
        expanded: !!src.expanded,
        level,
        parent,
        children: null,
      };
      node.children =
        Array.isArray(src.children) && src.children.length
          ? this.parseNodes(src.children, level + 1, node)
          : null;
      return node;
    });
  }
  renderNode(node, parentEl, pos, size) {
    const item = el("div", {
      role: "treeitem",
      id: `${this._id}-i${++this._idc}`,
      "aria-level": String(node.level),
      "aria-setsize": String(size),
      "aria-posinset": String(pos),
      "aria-selected": String(this.selected.has(node.value)),
    });
    if (node.disabled) item.setAttribute("aria-disabled", "true");
    const hasKids = !!(node.children && node.children.length);
    if (hasKids) item.setAttribute("aria-expanded", String(node.expanded));
    const row = el("div", { class: "row" });
    row.style.setProperty("--lvl", String(node.level - 1));
    if (hasKids) {
      const chev = el("span", { class: "chev", "aria-hidden": "true" });
      chev.textContent = node.expanded ? "▾" : "▸";
      chev.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle(node);
      });
      row.appendChild(chev);
      node._chev = chev;
    } else {
      row.appendChild(el("span", { class: "chev", "aria-hidden": "true" }));
    }
    if (node.icon) {
      const ic = el("span", { class: "ic", "aria-hidden": "true" });
      ic.textContent = node.icon;
      row.appendChild(ic);
    }
    const lab = el("span", { class: "lab" });
    lab.textContent = node.label;
    row.appendChild(lab);
    row.addEventListener("click", () => {
      if (!node.disabled) this.activate(node);
    });
    item.appendChild(row);
    node._item = item;
    node._row = row;
    parentEl.appendChild(item);
    if (hasKids) {
      const group = el("div", { role: "group" });
      group.hidden = !node.expanded;
      node.children.forEach((c, i) => this.renderNode(c, group, i + 1, node.children.length));
      item.appendChild(group);
      node._group = group;
    }
  }
  walk(fn, list = this.nodes) {
    for (const n of list) {
      fn(n);
      if (n.children) this.walk(fn, n.children);
    }
  }
  visible() {
    const out = [];
    const rec = (list) => {
      for (const n of list) {
        out.push(n);
        if (n.children && n.children.length && n.expanded) rec(n.children);
      }
    };
    rec(this.nodes);
    return out;
  }
  toggle(node) {
    if (!node.children || !node.children.length) return;
    node.expanded = !node.expanded;
    node._item.setAttribute("aria-expanded", String(node.expanded));
    node._group.hidden = !node.expanded;
    node._chev.textContent = node.expanded ? "▾" : "▸";
    bleep(SFX.unlock);
    this.dispatchEvent(
      new CustomEvent("nes:toggle", {
        bubbles: true,
        detail: { value: node.value, expanded: node.expanded },
      }),
    );
  }
  activate(node) {
    this.active = node;
    this.refreshActive();
    if (node.children && node.children.length) this.toggle(node);
    this.select(node);
  }
  select(node) {
    if (node.disabled) return;
    if (this.multiple)
      this.selected.has(node.value)
        ? this.selected.delete(node.value)
        : this.selected.add(node.value);
    else {
      this.selected.clear();
      this.selected.add(node.value);
    }
    this.walk((n) => n._item.setAttribute("aria-selected", String(this.selected.has(n.value))));
    this.sync(false);
  }
  refreshActive() {
    this.walk((n) => n._item.classList.remove("active"));
    if (!this.active) return;
    this.active._item.classList.add("active");
    this.treeEl.setAttribute("aria-activedescendant", this.active._item.id);
    this.active._row.scrollIntoView({ block: "nearest" });
  }
  onKey(e) {
    const vis = this.visible();
    if (!vis.length) return;
    let i = vis.indexOf(this.active);
    if (i < 0) i = 0;
    const n = this.active;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.active = vis[Math.min(i + 1, vis.length - 1)];
        this.refreshActive();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.active = vis[Math.max(i - 1, 0)];
        this.refreshActive();
        break;
      case "Home":
        e.preventDefault();
        this.active = vis[0];
        this.refreshActive();
        break;
      case "End":
        e.preventDefault();
        this.active = vis[vis.length - 1];
        this.refreshActive();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (n?.children?.length) {
          if (!n.expanded) this.toggle(n);
          else {
            this.active = n.children[0];
            this.refreshActive();
          }
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (n?.children?.length && n.expanded) this.toggle(n);
        else if (n?.parent) {
          this.active = n.parent;
          this.refreshActive();
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (n && !n.disabled) {
          if (n.children?.length) this.toggle(n);
          this.select(n);
        }
        break;
    }
  }
  sync(silent) {
    const vals = [...this.selected];
    if (this.hidden_) this.hidden_.value = vals.join(",");
    if (!silent)
      this.dispatchEvent(
        new CustomEvent("nes:change", {
          bubbles: true,
          detail: { value: this.multiple ? vals : (vals[0] ?? null) },
        }),
      );
  }
  get value() {
    return this.multiple ? [...this.selected] : ([...this.selected][0] ?? null);
  }
}

/* ========================================================================== */
/*  AI CHAT MODULE  —  stateful bits (bubbles/tool/reasoning are pure CSS)      */
/* ========================================================================== */

/* <nes-chat-prompt>  —  auto-growing prompt + send/stop button.
   Enter sends, Shift+Enter = newline. Add the `busy` attribute while streaming
   to flip Send → Stop. Fires nes:submit {value} and nes:stop.                 */
class NesChatPrompt extends HTMLElement {
  static get observedAttributes() {
    return ["busy"];
  }
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.innerHTML = "";
    this.box = el("div", { class: "chat-prompt" });
    this.ta = el("textarea", {
      rows: "1",
      "aria-label": this.getAttribute("aria-label") || "Message",
    });
    this.ta.placeholder = this.getAttribute("placeholder") || "Message…";
    this.btn = el("button", { type: "button", class: "chat-submit", "aria-label": "Send" });
    this.btn.textContent = "▶";
    this.ta.addEventListener("input", () => this.autosize());
    this.ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
    this.btn.addEventListener("click", () => (this.busy ? this.stop() : this.send()));
    this.box.append(this.ta, this.btn);
    this.appendChild(this.box);
    if (this.hasAttribute("busy")) this.setBusy(true);
  }
  attributeChangedCallback(name) {
    if (name === "busy" && this.btn) this.setBusy(this.hasAttribute("busy"));
  }
  autosize() {
    this.ta.style.height = "auto";
    this.ta.style.height = `${Math.min(this.ta.scrollHeight, window.innerHeight * 0.4)}px`;
  }
  send() {
    const value = this.ta.value.trim();
    if (!value || this.busy) return;
    this.dispatchEvent(new CustomEvent("nes:submit", { bubbles: true, detail: { value } }));
    this.ta.value = "";
    this.autosize();
    bleep(SFX.unlock);
  }
  stop() {
    this.dispatchEvent(new CustomEvent("nes:stop", { bubbles: true, detail: {} }));
  }
  setBusy(b) {
    this.busy = !!b;
    this.box.setAttribute("aria-busy", String(this.busy));
    this.btn.classList.toggle("busy", this.busy);
    this.btn.setAttribute("aria-label", this.busy ? "Stop" : "Send");
    this.btn.textContent = this.busy ? "■" : "▶";
  }
  focus() {
    this.ta?.focus();
  }
  get value() {
    return this.ta?.value ?? "";
  }
  set value(v) {
    if (this.ta) {
      this.ta.value = v;
      this.autosize();
    }
  }
}

/* <nes-chat-messages>  —  scroll container that sticks to the newest message
   while streaming, but won't yank the view if the user has scrolled up.        */
class NesChatMessages extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.classList.add("chat-messages");
    this._pin = true;
    this.addEventListener("scroll", () => {
      this._pin = this.scrollHeight - this.scrollTop - this.clientHeight < 80;
    });
    this._obs = new MutationObserver(() => {
      if (this._pin) this.scrollToBottom();
    });
    this._obs.observe(this, { childList: true, subtree: true, characterData: true });
    requestAnimationFrame(() => this.scrollToBottom());
  }
  disconnectedCallback() {
    this._obs?.disconnect();
  }
  scrollToBottom() {
    this.scrollTop = this.scrollHeight;
    this._pin = true;
  }
}

/* ========================================================================== */
/*  <nes-icon>  —  render a pixel icon by name (no-build convenience).          */
/*  <nes-icon name="check"></nes-icon>  ·  add label="…" for a meaningful icon. */
/*  Bundler users after tree-shaking: import { check } from "8bit-nes/icons".   */
/* ========================================================================== */
class NesIcon extends HTMLElement {
  static get observedAttributes() {
    return ["name", "label", "size"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }
  render() {
    const name = this.getAttribute("name");
    this.innerHTML = name
      ? icon(name, { label: this.getAttribute("label"), size: this.getAttribute("size") })
      : "";
  }
}

/* ========================================================================== */
/*  EDITOR MODULE  —  lightweight rich text on native contenteditable (0 dep). */
/*  <nes-editor> = Editor + Toolbar + Suggestion(/) + Mention(@) + Emoji(:)    */
/*  menus + block DragHandle + VSCode-style Tab autocomplete + AI hook.        */
/* ========================================================================== */
const EDITOR_SLASH = [
  { key: "✦", label: "Ask AI…", ai: true },
  { key: "H1", label: "Heading 1", act: ["formatBlock", "h1"] },
  { key: "H2", label: "Heading 2", act: ["formatBlock", "h2"] },
  { key: "H3", label: "Heading 3", act: ["formatBlock", "h3"] },
  { key: "•", label: "Bullet list", act: ["insertUnorderedList"] },
  { key: "1.", label: "Numbered list", act: ["insertOrderedList"] },
  { key: "❝", label: "Quote", act: ["formatBlock", "blockquote"] },
  { key: "‹›", label: "Code block", act: ["formatBlock", "pre"] },
  { key: "―", label: "Divider", insert: "<hr><p><br></p>" },
];
const EDITOR_EMOJI = [
  ["smile", "🙂"],
  ["grin", "😀"],
  ["joy", "😂"],
  ["heart", "❤️"],
  ["fire", "🔥"],
  ["star", "⭐"],
  ["check", "✅"],
  ["cross", "❌"],
  ["warn", "⚠️"],
  ["bulb", "💡"],
  ["rocket", "🚀"],
  ["tada", "🎉"],
  ["up", "👍"],
  ["down", "👎"],
  ["eyes", "👀"],
  ["brain", "🧠"],
  ["robot", "🤖"],
  ["sparkles", "✨"],
  ["book", "📚"],
  ["note", "📝"],
  ["pin", "📌"],
  ["link", "🔗"],
  ["clock", "⏰"],
  ["calendar", "📅"],
  ["target", "🎯"],
  ["bug", "🐛"],
  ["computer", "💻"],
  ["game", "🎮"],
  ["zap", "⚡"],
  ["think", "🤔"],
  ["party", "🥳"],
  ["100", "💯"],
  ["lock", "🔒"],
  ["key", "🔑"],
  ["mail", "📧"],
];

class NesEditor extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.name = this.getAttribute("name");
    this.placeholder = this.getAttribute("placeholder") || "Write, or press / for commands…";
    const scr = this.querySelector('script[type="application/json"]');
    let cfg = {};
    try {
      cfg = JSON.parse(scr?.textContent || "{}");
    } catch {
      cfg = {};
    }
    scr?.remove();
    this.mentions = (Array.isArray(cfg) ? cfg : cfg.mentions || []).map((o) =>
      o && typeof o === "object"
        ? { value: String(o.value ?? o.label), label: String(o.label ?? o.value) }
        : { value: String(o), label: String(o) },
    );
    const initial = this.innerHTML.trim();
    this.innerHTML = "";
    this.menuOpen = false;
    this.ghost = null;
    this.build(initial);
  }
  disconnectedCallback() {
    document.removeEventListener("selectionchange", this._sc);
    document.removeEventListener("pointerdown", this._onDoc);
  }
  build(initial) {
    this.wrap = el("div", { class: "editor" });
    this.bar = el("div", { class: "editor-toolbar", role: "toolbar", "aria-label": "Format" });
    this.area = el("div", {
      class: "editor-content",
      contenteditable: "true",
      role: "textbox",
      "aria-multiline": "true",
      "aria-label": this.getAttribute("aria-label") || "Editor",
    });
    this.area.dataset.placeholder = this.placeholder;
    this.area.innerHTML = initial || "<p><br></p>";
    this.menu = el("div", { class: "editor-menu", role: "listbox" });
    this.menu.hidden = true;
    this.grip = el("div", {
      class: "editor-drag",
      draggable: "true",
      "aria-hidden": "true",
      title: "Drag to reorder",
    });
    this.grip.textContent = "⠿";
    this.renderToolbar();
    this.wrap.append(this.bar, this.area, this.menu, this.grip);
    this.appendChild(this.wrap);
    if (this.name) {
      this.hidden_ = el("input", { type: "hidden", name: this.name });
      this.appendChild(this.hidden_);
    }
    this.area.addEventListener("input", () => this.onInput());
    this.area.addEventListener("keydown", (e) => this.onKey(e));
    this._sc = () => {
      if (this.contains(document.activeElement)) this.syncActive();
    };
    document.addEventListener("selectionchange", this._sc);
    this._onDoc = (e) => {
      if (!this.contains(e.target)) this.closeMenu();
    };
    document.addEventListener("pointerdown", this._onDoc);
    this.area.addEventListener("mousemove", (e) => this.showHandle(e));
    this.area.addEventListener("mouseleave", () => this.grip.classList.remove("show"));
    this.wireDrag();
    this.sync();
  }
  renderToolbar() {
    const BAR = [
      { cmd: "bold", label: "<b>B</b>", title: "Bold", state: "bold" },
      { cmd: "italic", label: "<i>I</i>", title: "Italic", state: "italic" },
      { cmd: "underline", label: "<u>U</u>", title: "Underline", state: "underline" },
      { cmd: "strikeThrough", label: "<s>S</s>", title: "Strikethrough", state: "strikeThrough" },
      { sep: true },
      { block: "h1", label: "H1", title: "Heading 1" },
      { block: "h2", label: "H2", title: "Heading 2" },
      { sep: true },
      { cmd: "insertUnorderedList", label: "•", title: "Bullet list" },
      { cmd: "insertOrderedList", label: "1.", title: "Numbered list" },
      { block: "blockquote", label: "❝", title: "Quote" },
      { code: true, label: "‹›", title: "Inline code" },
      { link: true, label: "🔗", title: "Link" },
      { sep: true },
      { ai: true, label: icon("sparkles"), title: "Ask AI" },
    ];
    this._btns = [];
    for (const it of BAR) {
      if (it.sep) {
        this.bar.appendChild(el("span", { class: "editor-sep", "aria-hidden": "true" }));
        continue;
      }
      const b = el("button", { type: "button", title: it.title, "aria-label": it.title });
      b.innerHTML = it.label;
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("click", () => {
        if (it.cmd) this.exec(it.cmd);
        else if (it.block) this.exec("formatBlock", it.block);
        else if (it.code) this.wrapCode();
        else if (it.link) {
          const url = prompt("Link URL:");
          if (url) this.exec("createLink", url);
        } else if (it.ai) this.triggerAI();
      });
      if (it.state) this._btns.push({ el: b, state: it.state });
      this.bar.appendChild(b);
    }
  }
  exec(cmd, val) {
    this.area.focus();
    document.execCommand(cmd, false, val);
    this.sync();
  }
  wrapCode() {
    const t = getSelection()?.toString();
    if (t) this.exec("insertHTML", `<code>${_e(t)}</code>`);
  }
  triggerAI() {
    this.dispatchEvent(
      new CustomEvent("nes:ai", {
        bubbles: true,
        detail: { text: this.text(), insert: (h) => this.insert(h) },
      }),
    );
  }
  insert(html) {
    this.area.focus();
    document.execCommand("insertHTML", false, html);
    this.sync();
  }
  syncActive() {
    for (const { el: b, state } of this._btns || []) {
      let on = false;
      try {
        on = document.queryCommandState(state);
      } catch {}
      b.classList.toggle("on", on);
    }
  }
  /* ---- content ---- */
  html() {
    const c = this.area.cloneNode(true);
    for (const g of c.querySelectorAll(".ghost")) g.remove();
    return c.innerHTML;
  }
  text() {
    const c = this.area.cloneNode(true);
    for (const g of c.querySelectorAll(".ghost")) g.remove();
    return c.textContent;
  }
  get value() {
    return this.html();
  }
  set value(v) {
    this.area.innerHTML = v || "<p><br></p>";
    this.sync();
  }
  sync() {
    const empty = !this.area.textContent.trim() && !this.area.querySelector("img,hr,.mention");
    this.area.toggleAttribute("data-empty", empty);
    if (this.hidden_) this.hidden_.value = this.html();
  }
  onInput() {
    this.clearGhost();
    this.sync();
    const tok = (this._token = this.currentToken());
    if (tok) this.openTrigger(tok);
    else {
      this.closeMenu();
      this.scheduleSuggest();
    }
    this.dispatchEvent(
      new CustomEvent("nes:input", {
        bubbles: true,
        detail: { html: this.html(), text: this.text() },
      }),
    );
  }
  onKey(e) {
    if (this.menuOpen) {
      const n = this.menuItems.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.active = (this.active + 1) % n;
        return this.paintMenu();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.active = (this.active - 1 + n) % n;
        return this.paintMenu();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        return this.selectItem(this.active);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        return this.closeMenu();
      }
    }
    if (e.key === "Tab" && this.ghost) {
      e.preventDefault();
      return this.acceptGhost();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      bleep(SFX.coin);
      return this.dispatchEvent(
        new CustomEvent("nes:submit", {
          bubbles: true,
          detail: { html: this.html(), text: this.text() },
        }),
      );
    }
    if (!["Shift", "Control", "Meta", "Alt", "Tab"].includes(e.key)) this.clearGhost();
  }
  /* ---- trigger menus (/ @ :) ---- */
  currentToken() {
    const sel = getSelection();
    if (!sel?.rangeCount) return null;
    const r = sel.getRangeAt(0);
    if (r.startContainer.nodeType !== 3) return null;
    const upto = r.startContainer.textContent.slice(0, r.startOffset);
    const m = upto.match(/(?:^|\s)([/@:])([\w-]*)$/);
    if (!m) return null;
    return {
      char: m[1],
      query: m[2],
      node: r.startContainer,
      start: r.startOffset - m[2].length - 1,
      end: r.startOffset,
    };
  }
  openTrigger(tok) {
    let items;
    if (tok.char === "/") {
      const q = tok.query.toLowerCase();
      items = EDITOR_SLASH.filter(
        (s) => !q || s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q),
      );
    } else if (tok.char === "@") {
      const q = tok.query.toLowerCase();
      items = this.mentions
        .filter((m) => !q || m.label.toLowerCase().includes(q))
        .map((m) => ({ key: "@", label: m.label, mention: m }));
    } else {
      const q = tok.query.toLowerCase();
      if (!q) return this.closeMenu();
      items = EDITOR_EMOJI.filter(([n]) => n.includes(q))
        .slice(0, 12)
        .map(([n, c]) => ({ key: c, label: n, emoji: c }));
    }
    if (!items.length) return this.closeMenu();
    this.menuKind = tok.char;
    this.menuItems = items;
    this.active = 0;
    this.renderMenu();
    this.openMenu();
  }
  renderMenu() {
    this.menu.innerHTML = "";
    this.itemEls = this.menuItems.map((it, i) => {
      const b = el("button", { type: "button", class: "menuitem", role: "option" });
      b.innerHTML = `<span class="k">${it.key}</span><span>${_e(it.label)}</span>`;
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("mousemove", () => {
        this.active = i;
        this.paintMenu();
      });
      b.addEventListener("click", () => this.selectItem(i));
      this.menu.appendChild(b);
      return b;
    });
    this.paintMenu();
  }
  paintMenu() {
    this.itemEls?.forEach((b, i) => b.classList.toggle("active", i === this.active));
    this.itemEls?.[this.active]?.scrollIntoView({ block: "nearest" });
  }
  openMenu() {
    this.menu.hidden = false;
    this.menuOpen = true;
    const rect = this.caretRect();
    if (rect) {
      const host = this.wrap.getBoundingClientRect();
      this.menu.style.left = `${Math.min(rect.left - host.left, host.width - 200)}px`;
      this.menu.style.top = `${rect.bottom - host.top + 4}px`;
    }
  }
  closeMenu() {
    this.menu.hidden = true;
    this.menuOpen = false;
  }
  caretRect() {
    const sel = getSelection();
    if (!sel?.rangeCount) return null;
    const r = sel.getRangeAt(0).cloneRange();
    r.collapse(true);
    return r.getClientRects()[0] || r.getBoundingClientRect();
  }
  removeTrigger() {
    const t = this._token;
    if (!t) return;
    try {
      const r = document.createRange();
      r.setStart(t.node, t.start);
      r.setEnd(t.node, Math.min(t.end, t.node.textContent.length));
      r.deleteContents();
      const sel = getSelection();
      sel.removeAllRanges();
      const c = document.createRange();
      c.setStart(t.node, t.start);
      c.collapse(true);
      sel.addRange(c);
    } catch {}
  }
  selectItem(i) {
    const it = this.menuItems[i];
    this.closeMenu();
    if (!it) return;
    this.removeTrigger();
    if (this.menuKind === "/") {
      if (it.ai) this.triggerAI();
      else if (it.insert) this.exec("insertHTML", it.insert);
      else if (it.act) this.exec(...it.act);
    } else if (this.menuKind === "@") {
      this.exec(
        "insertHTML",
        `<span class="mention" contenteditable="false">@${_e(it.mention.label)}</span>&nbsp;`,
      );
      this.dispatchEvent(
        new CustomEvent("nes:mention", {
          bubbles: true,
          detail: { value: it.mention.value, label: it.mention.label },
        }),
      );
    } else {
      this.exec("insertHTML", `${it.emoji} `);
    }
  }
  /* ---- VSCode-style ghost autocomplete ---- */
  scheduleSuggest() {
    clearTimeout(this._sg);
    if (!this.hasAttribute("autocomplete") && !this.suggest) return;
    this._sg = setTimeout(() => this.requestSuggest(), 600);
  }
  async requestSuggest() {
    if (this.menuOpen || this.ghost) return;
    const text = this.text();
    let out = "";
    if (this.suggest) {
      try {
        out = (await this.suggest({ text })) || "";
      } catch {
        out = "";
      }
    }
    if (out) this.showGhost(out);
    else
      this.dispatchEvent(
        new CustomEvent("nes:suggest", {
          bubbles: true,
          detail: { text, accept: (s) => this.showGhost(s) },
        }),
      );
  }
  showGhost(text) {
    this.clearGhost();
    if (!text || this.menuOpen) return;
    const sel = getSelection();
    if (!sel?.rangeCount || !this.area.contains(sel.anchorNode)) return;
    const span = el("span", { class: "ghost", contenteditable: "false" });
    span.textContent = text;
    this._ghostText = text;
    const r = sel.getRangeAt(0);
    r.collapse(false);
    r.insertNode(span);
    const c = document.createRange();
    c.setStartBefore(span);
    c.collapse(true);
    sel.removeAllRanges();
    sel.addRange(c);
    this.ghost = span;
  }
  acceptGhost() {
    if (!this.ghost) return;
    const tn = document.createTextNode(this._ghostText);
    this.ghost.replaceWith(tn);
    const sel = getSelection();
    const c = document.createRange();
    c.setStartAfter(tn);
    c.collapse(true);
    sel.removeAllRanges();
    sel.addRange(c);
    this.ghost = null;
    this._ghostText = "";
    this.sync();
    bleep(SFX.unlock);
  }
  clearGhost() {
    if (this.ghost) {
      this.ghost.remove();
      this.ghost = null;
      this._ghostText = "";
    }
  }
  /* ---- block drag handle ---- */
  blockFrom(node) {
    while (node && node !== this.area) {
      if (node.parentElement === this.area) return node;
      node = node.parentElement;
    }
    return null;
  }
  showHandle(e) {
    if (this._dragBlock) return;
    const block = this.blockFrom(e.target);
    if (!block) return this.grip.classList.remove("show");
    const host = this.wrap.getBoundingClientRect();
    const b = block.getBoundingClientRect();
    this.grip.style.top = `${b.top - host.top}px`;
    this.grip.style.left = "2px";
    this.grip.classList.add("show");
    this._gripBlock = block;
  }
  wireDrag() {
    this.grip.addEventListener("dragstart", (e) => {
      this._dragBlock = this._gripBlock;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    });
    this.area.addEventListener("dragover", (e) => {
      if (!this._dragBlock) return;
      e.preventDefault();
      const tgt = this.blockFrom(e.target);
      this.clearDrop();
      if (tgt && tgt !== this._dragBlock) {
        const b = tgt.getBoundingClientRect();
        const after = e.clientY > b.top + b.height / 2;
        tgt.classList.add(after ? "drop-after" : "drop-before");
        this._drop = { tgt, after };
      }
    });
    this.area.addEventListener("drop", (e) => {
      if (!this._dragBlock || !this._drop) return;
      e.preventDefault();
      this._drop.after
        ? this._drop.tgt.after(this._dragBlock)
        : this._drop.tgt.before(this._dragBlock);
      this.clearDrop();
      this._dragBlock = null;
      this.sync();
    });
    this.grip.addEventListener("dragend", () => {
      this.clearDrop();
      this._dragBlock = null;
    });
  }
  clearDrop() {
    for (const n of this.area.querySelectorAll(".drop-before,.drop-after"))
      n.classList.remove("drop-before", "drop-after");
    this._drop = null;
  }
  focus() {
    this.area?.focus();
  }
}

/* ------------------------------------------------------------- self-register */
const defs = {
  "nes-sound": NesSound,
  "nes-collapsible": NesCollapsible,
  "nes-hud": NesHud,
  "nes-quiz": NesQuiz,
  "nes-tabs": NesTabs,
  "nes-code": NesCode,
  "nes-form": NesForm,
  "nes-number": NesNumber,
  "nes-rating": NesRating,
  "nes-tags": NesTags,
  "nes-pin": NesPin,
  "nes-file": NesFile,
  "nes-listbox": NesListbox,
  "nes-input-menu": NesInputMenu,
  "nes-select-menu": NesSelectMenu,
  "nes-tree": NesTree,
  "nes-chat-prompt": NesChatPrompt,
  "nes-chat-messages": NesChatMessages,
  "nes-icon": NesIcon,
  "nes-editor": NesEditor,
};
for (const [tag, cls] of Object.entries(defs)) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
