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

/** Float a "+N XP" label upward from an element (smooth ease-out motion). */
export declare function floatXP(el: HTMLElement, text?: string, color?: string): void;

/** Dispatch XP on the `nes:xp` document bus (an <nes-hud> listens) + optional floater. */
export declare function grantXP(amount: number, srcEl?: HTMLElement): void;

/** Accent names mapped in base.css (`--accent` + `--accent-d`). `good` (green) is the primary/default. */
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
  /** Accent name mapped in base.css (`good`/green default — the primary accent). */
  accent?: Accent;
  /** Auto-dismiss delay in ms; `0` keeps it until removed. Default 3200. */
  timeout?: number;
}

/** Show a transient toast (auto-creates a live-region host on first call). */
export declare function toast(msg: string, opts?: ToastOptions): HTMLElement;

/** Highlight code to HTML with `.t-*` token spans (used by <nes-code>). */
export declare function highlightCode(code: string): string;

/* ---- custom elements ---- */

export declare class NesSoundElement extends HTMLElement {}
export declare class NesCollapsibleElement extends HTMLElement {}
export declare class NesHudElement extends HTMLElement {
  /** Add XP directly (also persisted under `${ns}_xp`). */
  add(amount: number): void;
}
export declare class NesQuizElement extends HTMLElement {}
export declare class NesTabsElement extends HTMLElement {}
export declare class NesCodeElement extends HTMLElement {}

/* ---- Form module ---- */

/** <nes-form>: native constraint validation → inline errors → `nes:submit`. */
export declare class NesFormElement extends HTMLElement {
  /** The wrapping <form> (created on connect). */
  form: HTMLFormElement;
  /** Validate every control; on success dispatch `nes:submit`, else focus the first bad field. */
  submit(): void;
}
/** <nes-number>: auto-wired − [n] + stepper over a native number input. */
export declare class NesNumberElement extends HTMLElement {
  value: string;
}
/** <nes-rating>: click / arrow-key star picker (add `readonly` for display only). */
export declare class NesRatingElement extends HTMLElement {
  value: number;
}
/** <nes-tags>: chip input; value is the ordered tag list. */
export declare class NesTagsElement extends HTMLElement {
  readonly value: string[];
}
/** <nes-pin>: N single-char cells; fires `nes:complete` when full. */
export declare class NesPinElement extends HTMLElement {
  readonly value: string;
}
/** <nes-file>: click-or-drop upload zone with a removable file list. */
export declare class NesFileElement extends HTMLElement {
  readonly files: File[];
}
/** <nes-listbox>: roving-focus option list; `value` is a string (or string[] when `multiple`). */
export declare class NesListboxElement extends HTMLElement {
  readonly value: string | string[] | null;
}
/** <nes-input-menu>: free-text combobox (autocomplete; value = typed text). */
export declare class NesInputMenuElement extends HTMLElement {
  value: string;
}
/** <nes-select-menu>: strict searchable single-select (value ∈ options). */
export declare class NesSelectMenuElement extends HTMLElement {
  value: string;
}

/** Detail of the `nes:answer` event bubbled by <nes-quiz>. */
export interface NesAnswerDetail {
  correct: boolean;
  choice: number;
}

/** Detail of the `nes:submit` event bubbled by <nes-form>. */
export interface NesSubmitDetail {
  /** Flat form values (from `FormData`). */
  data: Record<string, string>;
  form: HTMLFormElement;
}

declare global {
  interface HTMLElementTagNameMap {
    "nes-sound": NesSoundElement;
    "nes-collapsible": NesCollapsibleElement;
    "nes-hud": NesHudElement;
    "nes-quiz": NesQuizElement;
    "nes-tabs": NesTabsElement;
    "nes-code": NesCodeElement;
    "nes-form": NesFormElement;
    "nes-number": NesNumberElement;
    "nes-rating": NesRatingElement;
    "nes-tags": NesTagsElement;
    "nes-pin": NesPinElement;
    "nes-file": NesFileElement;
    "nes-listbox": NesListboxElement;
    "nes-input-menu": NesInputMenuElement;
    "nes-select-menu": NesSelectMenuElement;
  }
  interface DocumentEventMap {
    "nes:xp": CustomEvent<{ amount: number }>;
    "nes:mute": CustomEvent<{ muted: boolean }>;
  }
  interface HTMLElementEventMap {
    "nes:answer": CustomEvent<NesAnswerDetail>;
    "nes:submit": CustomEvent<NesSubmitDetail>;
    "nes:invalid": CustomEvent<Record<string, never>>;
    "nes:complete": CustomEvent<{ value: string }>;
    "nes:change": CustomEvent<{ value?: unknown; files?: File[] }>;
  }
}
