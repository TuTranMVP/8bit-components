/* 8-BIT NES — pixel icons. Each named export is a self-contained <svg> string
   (fill=currentColor, 1em, crispEdges). Import only what you use — tree-shakeable. */

export declare const check: string;
export declare const close: string;
export declare const plus: string;
export declare const minus: string;
export declare const chevronRight: string;
export declare const chevronLeft: string;
export declare const chevronDown: string;
export declare const chevronUp: string;
export declare const arrowRight: string;
export declare const arrowLeft: string;
export declare const menu: string;
export declare const dots: string;
export declare const search: string;
export declare const filter: string;
export declare const external: string;
export declare const refresh: string;
export declare const copy: string;
export declare const trash: string;
export declare const edit: string;
export declare const file: string;
export declare const folder: string;
export declare const download: string;
export declare const upload: string;
export declare const code: string;
export declare const terminal: string;
export declare const info: string;
export declare const warn: string;
export declare const star: string;
export declare const heart: string;
export declare const bolt: string;
export declare const bell: string;
export declare const volume: string;
export declare const mute: string;
export declare const play: string;
export declare const pause: string;
export declare const sun: string;
export declare const moon: string;
export declare const user: string;
export declare const home: string;
export declare const chat: string;
export declare const eye: string;
export declare const lock: string;
export declare const gear: string;
export declare const calendar: string;
export declare const clock: string;
export declare const github: string;

/** name → svg string registry (used by `icon()` and `<nes-icon>`). */
export declare const icons: Record<string, string>;
/** All icon names, sorted. */
export declare const iconNames: string[];

export interface IconOptions {
  /** width/height — px number or any CSS length. Default `1em`. */
  size?: string | number;
  /** class added to the `<svg>`. */
  class?: string;
  /** makes it a labelled image (`role="img"`); omit for decorative. */
  label?: string;
}

/** Build an icon svg string by name (empty string if unknown). */
export declare function icon(name: string, opts?: IconOptions): string;
