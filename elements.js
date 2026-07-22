/* ==========================================================================
   8-BIT NES · elements.js  —  stateful layer
   Light-DOM Web Components: global tokens.css/components.css apply directly.
   Cross-framework: <mvp-*> works in HTML, Vue3/Nuxt, React 19 with no wrapper.
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
let _mute = store.get("mvp_mute") === "1";
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
  store.set("mvp_mute", _mute ? "1" : "0");
  document.dispatchEvent(new CustomEvent("mvp:mute", { detail: { muted: _mute } }));
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
    { duration: 900, easing: "steps(6)", fill: "forwards" },
  ).finished.finally(() => f.remove());
}

/* fire XP into the global bus (an <mvp-hud> may be listening) */
export function grantXP(amount, srcEl) {
  document.dispatchEvent(new CustomEvent("mvp:xp", { detail: { amount } }));
  if (srcEl) floatXP(srcEl, `+${amount} XP`);
}

/* ----------------------------------------------------------------- toast */
let _toastHost = null;
export function toast(msg, opts = {}) {
  const { accent = "gold", timeout = 3200 } = opts;
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
    t.style.transition = "opacity var(--dur-mid) steps(3)";
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 220);
  };
  if (timeout) setTimeout(kill, timeout);
  return t;
}

/* ========================================================================== */
/*  <mvp-sound>  —  mute toggle button                                        */
/*  <mvp-sound></mvp-sound>                                                    */
/* ========================================================================== */
class MvpSound extends HTMLElement {
  connectedCallback() {
    this.render();
    this._onMute = () => this.render();
    document.addEventListener("mvp:mute", this._onMute);
    this.addEventListener("click", () => {
      setMute(!isMuted());
      if (!isMuted()) bleep(SFX.coin);
    });
  }
  disconnectedCallback() {
    document.removeEventListener("mvp:mute", this._onMute);
  }
  render() {
    const m = isMuted();
    this.innerHTML =
      `<button class="btn ghost" aria-pressed="${m}" aria-label="${m ? "Bật âm" : "Tắt âm"}">` +
      `${m ? "🔇 MUTED" : "🔊 SOUND"}</button>`;
  }
}

/* ========================================================================== */
/*  <mvp-collapsible>  —  header toggles body                                 */
/*  <mvp-collapsible open>                                                     */
/*    <span slot="head">STAGE 1 · Config</span>                                */
/*    ...body...                                                               */
/*  </mvp-collapsible>                                                         */
/* ========================================================================== */
class MvpCollapsible extends HTMLElement {
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
/*  <mvp-hud>  —  LV + XP bar, listens on the mvp:xp bus                       */
/*  <mvp-hud ns="quest" max-xp="1600" per-level="400"></mvp-hud>               */
/* ========================================================================== */
class MvpHud extends HTMLElement {
  connectedCallback() {
    this.ns = this.getAttribute("ns") || "mvp";
    this.perLvl = +(this.getAttribute("per-level") || 400);
    this.maxXp = +(this.getAttribute("max-xp") || this.perLvl * 4);
    this.xp = +(store.get(`${this.ns}_xp`) || 0);
    this.render();
    this._onXP = (e) => {
      this.add(e.detail.amount);
    };
    document.addEventListener("mvp:xp", this._onXP);
  }
  disconnectedCallback() {
    document.removeEventListener("mvp:xp", this._onXP);
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
/*  <mvp-quiz>  —  single MCQ, config via child JSON script                   */
/*  <mvp-quiz xp="50">                                                         */
/*    <script type="application/json">                                         */
/*    { "q":"...", "options":["A","B","C"], "answer":1, "explain":"..." }       */
/*    </script>                                                                */
/*  </mvp-quiz>                                                                */
/* ========================================================================== */
class MvpQuiz extends HTMLElement {
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
        { duration: 300, easing: "steps(4)", iterations: 2 },
      );
    }
    this.dispatchEvent(
      new CustomEvent("mvp:answer", { bubbles: true, detail: { correct, choice: i } }),
    );
  }
}

/* ========================================================================== */
/*  <mvp-tabs>  —  accessible tabs, built from children with [data-label]      */
/*  <mvp-tabs>                                                                  */
/*    <section data-label="Install" selected>...</section>                      */
/*    <section data-label="Usage">...</section>                                 */
/*  </mvp-tabs>                                                                 */
/* ========================================================================== */
class MvpTabs extends HTMLElement {
  connectedCallback() {
    const panels = [...this.children].filter((el) => el.hasAttribute("data-label"));
    if (!panels.length) return;
    MvpTabs._n = (MvpTabs._n || 0) + 1;
    const uid = `tabs-${MvpTabs._n}`;

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

/* ------------------------------------------------------------- self-register */
const defs = {
  "mvp-sound": MvpSound,
  "mvp-collapsible": MvpCollapsible,
  "mvp-hud": MvpHud,
  "mvp-quiz": MvpQuiz,
  "mvp-tabs": MvpTabs,
};
for (const [tag, cls] of Object.entries(defs)) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
