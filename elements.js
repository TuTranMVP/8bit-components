/* ==========================================================================
   8-BIT NES · elements.js  —  stateful layer
   Light-DOM Web Components: global tokens.css/components.css apply directly.
   Cross-framework: <nes-*> works in HTML, Vue3/Nuxt, React 19 with no wrapper.
   Import once:  <script type="module" src="./elements.js"></script>
   ========================================================================== */

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

/* ------------------------------------------------------------- self-register */
const defs = {
  "nes-sound": NesSound,
  "nes-collapsible": NesCollapsible,
  "nes-hud": NesHud,
  "nes-quiz": NesQuiz,
  "nes-tabs": NesTabs,
  "nes-code": NesCode,
};
for (const [tag, cls] of Object.entries(defs)) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
