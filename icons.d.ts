/* 8-BIT NES — pixel icons. Each named export is a self-contained <svg> string
   (fill=currentColor, 1em, vector — razor-sharp at any DPR). Import only what you
   use — tree-shakeable. */

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
export declare const sparkles: string;
export declare const bot: string;
export declare const wand: string;
export declare const cpu: string;
export declare const brain: string;
export declare const send: string;
export declare const stop: string;
export declare const mic: string;
export declare const thumbsUp: string;
export declare const thumbsDown: string;
export declare const image: string;
export declare const paperclip: string;
export declare const loader: string;
export declare const globe: string;
export declare const database: string;
export declare const cloud: string;
export declare const rocket: string;
export declare const gitBranch: string;
/** the "package" icon (exported as `packageBox`; `package` is a reserved word). */
export declare const packageBox: string;
export declare const key: string;
export declare const shield: string;
export declare const bug: string;
export declare const server: string;
export declare const layers: string;
export declare const grid: string;
export declare const list: string;
export declare const sliders: string;
export declare const checkCircle: string;
export declare const xCircle: string;
export declare const alertCircle: string;
export declare const help: string;
export declare const link: string;
export declare const mail: string;
export declare const save: string;
export declare const folderOpen: string;
export declare const tag: string;
export declare const bookmark: string;
export declare const pin: string;
export declare const share: string;
export declare const logout: string;
export declare const maximize: string;

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
