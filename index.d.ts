/* 8-BIT NES — type surface (hand-written; the package ships zero-build ESM). */

/** [freqHz, durationSec] pairs played as a square-wave sequence. */
export type SfxSeq = ReadonlyArray<readonly [number, number]>;

/** localStorage wrapper that falls back to memory in private mode / quota errors. */
export declare const store: {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

/** Built-in chiptune SFX sequences. */
export declare const SFX: {
  coin: SfxSeq;
  bad: SfxSeq;
  clear: SfxSeq;
  unlock: SfxSeq;
};

/** Play a square-wave sequence. Silent when muted or audio unavailable — never throws. */
export declare function bleep(seq: SfxSeq): void;

export declare function setMute(muted: boolean): void;
export declare function isMuted(): boolean;

/** Float a "+N XP" label upward from an element (steps(6) motion). */
export declare function floatXP(el: HTMLElement, text?: string, color?: string): void;

/** Dispatch XP on the `mvp:xp` document bus (an <mvp-hud> listens) + optional floater. */
export declare function grantXP(amount: number, srcEl?: HTMLElement): void;

/** Accent names mapped in base.css (`--accent` + `--accent-d`). `gold` is the default. */
export type Accent =
  | "blue"
  | "gold"
  | "cyan"
  | "purple"
  | "lime"
  | "teal"
  | "indigo"
  | "pink"
  | "steel"
  | "good"
  | "warn"
  | "crit";

/** Options for {@link toast}. */
export interface ToastOptions {
  /** Accent name mapped in base.css (`gold` default). */
  accent?: Accent;
  /** Auto-dismiss delay in ms; `0` keeps it until removed. Default 3200. */
  timeout?: number;
}

/** Show a transient toast (auto-creates a live-region host on first call). */
export declare function toast(msg: string, opts?: ToastOptions): HTMLElement;

/** Highlight code to HTML with `.t-*` token spans (used by <mvp-code>). */
export declare function highlightCode(code: string): string;

/* ---- custom elements ---- */

export declare class MvpSoundElement extends HTMLElement {}
export declare class MvpCollapsibleElement extends HTMLElement {}
export declare class MvpHudElement extends HTMLElement {
  /** Add XP directly (also persisted under `${ns}_xp`). */
  add(amount: number): void;
}
export declare class MvpQuizElement extends HTMLElement {}
export declare class MvpTabsElement extends HTMLElement {}
export declare class MvpCodeElement extends HTMLElement {}

/** Detail of the `mvp:answer` event bubbled by <mvp-quiz>. */
export interface MvpAnswerDetail {
  correct: boolean;
  choice: number;
}

declare global {
  interface HTMLElementTagNameMap {
    "mvp-sound": MvpSoundElement;
    "mvp-collapsible": MvpCollapsibleElement;
    "mvp-hud": MvpHudElement;
    "mvp-quiz": MvpQuizElement;
    "mvp-tabs": MvpTabsElement;
    "mvp-code": MvpCodeElement;
  }
  interface DocumentEventMap {
    "mvp:xp": CustomEvent<{ amount: number }>;
    "mvp:mute": CustomEvent<{ muted: boolean }>;
  }
  interface HTMLElementEventMap {
    "mvp:answer": CustomEvent<MvpAnswerDetail>;
  }
}
