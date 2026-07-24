/* ==========================================================================
   8-BIT NES · icons.js  —  pixel icon set (side-effect-free ESM)

   Each icon is a self-contained <svg> STRING on a 16×16 grid: fill=currentColor
   (inherits text/accent color) and sized 1em (scales with font-size). Being
   vector, they are razor-sharp at ANY device-pixel-ratio — low-res and retina
   alike. shape-rendering=geometricPrecision keeps curves/diagonals smooth at
   every size (the blocky 8-bit character lives in the pixel-grid geometry).

   ── Tree-shaking ──────────────────────────────────────────────────────────
   Import only what you use — the rest is dropped by the bundler (this file has
   no side effects; see package.json "sideEffects"):
       import { check, close, search } from "8bit-nes/icons";
       el.innerHTML = check;

   ── No build / dynamic ────────────────────────────────────────────────────
       import { icon } from "8bit-nes/icons";  icon("check", { size: 20 })
   or the element (registered by "8bit-nes"): <nes-icon name="check"></nes-icon>

   ── Extend ────────────────────────────────────────────────────────────────
   Add `export const foo = S('<path d="…"/>')`, then add it to `icons` below.
   Draw on the 16×16 grid; use fill for solid pixels, or
   `<path fill="none" stroke="currentColor" stroke-width="1.5"/>` for strokes.
   ========================================================================== */

/** wrap inner markup as a themed, 1em, crisp-edged svg string. */
const S = (inner) =>
  `<svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" shape-rendering="geometricPrecision">${inner}</svg>`;

/* ---- navigation / action ---- */
export const check = S('<path d="M6.2 11.4 2.6 7.8l1.6-1.6 2 2 5.6-5.6 1.6 1.6z"/>');
export const close = S(
  '<path d="M4.2 2.6 8 6.4l3.8-3.8 1.6 1.6L9.6 8l3.8 3.8-1.6 1.6L8 9.6l-3.8 3.8-1.6-1.6L6.4 8 2.6 4.2z"/>',
);
export const plus = S('<path d="M7 2h2v5h5v2H9v5H7V9H2V7h5z"/>');
export const minus = S('<path d="M2 7h12v2H2z"/>');
export const chevronRight = S('<path d="M5.6 2.6 4 4.2 7.8 8 4 11.8l1.6 1.6L11 8z"/>');
export const chevronLeft = S('<path d="M10.4 2.6 12 4.2 8.2 8l3.8 3.8-1.6 1.6L5 8z"/>');
export const chevronDown = S('<path d="M2.6 5.6 4.2 4 8 7.8 11.8 4l1.6 1.6L8 11z"/>');
export const chevronUp = S('<path d="M2.6 10.4 4.2 12 8 8.2l3.8 3.8 1.6-1.6L8 5z"/>');
export const arrowRight = S('<path d="M2 7h7v2H2zM8 4l5 4-5 4z"/>');
export const arrowLeft = S('<path d="M14 7H7v2h7zM8 4 3 8l5 4z"/>');
export const menu = S('<path d="M2 3h12v2H2zM2 7h12v2H2zM2 11h12v2H2z"/>');
export const dots = S('<path d="M2 7h2v2H2zM7 7h2v2H7zM12 7h2v2h-2z"/>');
export const search = S(
  '<path fill-rule="evenodd" d="M2 2h7v7H2Zm2 2v3h3V4Zm5 5.4L10.4 8 15 12.6 13.6 14Z"/>',
);
export const filter = S('<path d="M2 3h12l-5 6v5H7V9L2 3z"/>');
export const external = S('<path d="M6 2h8v8h-2V5.4l-6 6L4.6 10l6-6H6zM2 5h4v2H4v5h5v-2h2v4H2z"/>');
export const refresh = S(
  '<path d="M8 3a5 5 0 0 1 4.5 2.8L11 6h4V2l-1.3 1.3A7 7 0 0 0 1.2 7h2.1A5 5 0 0 1 8 3zM8 13a5 5 0 0 1-4.5-2.8L5 10H1v4l1.3-1.3A7 7 0 0 0 14.8 9h-2.1A5 5 0 0 1 8 13z"/>',
);

/* ---- editing / files ---- */
export const copy = S('<path fill-rule="evenodd" d="M6 2h8v8h-2V4H6z M2 6h8v8H2z M4 8h4v4H4z"/>');
export const trash = S('<path d="M6 2h4v1h3.5v2h-11V3H6zM4 6h8l-.7 8H4.7z"/>');
export const edit = S(
  '<path d="M11 1.5 14.5 5 6 13.5 2 14.5 3 10.5zM10 4 4.6 9.4l1.6 1.6L11.6 5.6z"/>',
);
export const file = S('<path d="M3 1h6l4 4v10H3zM9 1.5V5h3.5z"/>');
export const folder = S('<path d="M1.5 3h4l1.5 1.5h7.5V13H1.5z"/>');
export const download = S('<path d="M7 1.5h2V7h2.5L8 10.8 4.5 7H7zM2.5 13h11v2h-11z"/>');
export const upload = S('<path d="M7 10.5h2V5h2.5L8 1.2 4.5 5H7zM2.5 13h11v2h-11z"/>');
export const code = S(
  '<path d="M5.5 4 6.9 5.3 4.3 8l2.6 2.7L5.5 12 2 8zM10.5 4 14 8l-3.5 4-1.4-1.3L11.7 8 9.1 5.3z"/>',
);
export const terminal = S(
  '<path d="M1.5 2h13v12h-13zM3.5 4.5 6 7 3.5 9.5 4.7 10.7 8.4 7 4.7 3.3zM8 9.5h4.5v1.5H8z"/>',
);

/* ---- status / feedback ---- */
export const info = S('<path d="M7 2h2v2H7zM6 6h3v6h1v2H6v-2h1V8H6z"/>');
export const warn = S(
  '<path fill-rule="evenodd" d="M8 1.5 15.5 14.5H.5z M7 6h2v4H7z M7 11h2v2H7z"/>',
);
export const star = S(
  '<path d="M8 1.5 9.9 5.9 14.5 6.3 11 9.3 12.1 13.8 8 11.4 3.9 13.8 5 9.3 1.5 6.3 6.1 5.9z"/>',
);
export const heart = S(
  '<path d="M8 13.5 2.9 8.4C1 6.5 1.4 3.8 3.6 3.2 5 2.8 6.7 3.4 8 5 9.3 3.4 11 2.8 12.4 3.2 14.6 3.8 15 6.5 13.1 8.4z"/>',
);
export const bolt = S('<path d="M9 1 3 9h4l-1 6 7-9H9z"/>');
export const bell = S(
  '<path d="M8 1.5c-2 0-3.2 1.5-3.2 4 0 3-.8 4-1.8 5.5h10c-1-1.5-1.8-2.5-1.8-5.5 0-2.5-1.2-4-3.2-4zM6.3 12h3.4a1.7 1.7 0 0 1-3.4 0z"/>',
);

/* ---- media / theme ---- */
export const volume = S(
  '<path d="M2 6h2.3L6 4.3v7.4L4.3 10H2z"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M9 5.5a3.4 3.4 0 0 1 0 5M11 3.5a6 6 0 0 1 0 9"/>',
);
export const mute = S(
  '<path d="M2 6h2.3L6 4.3v7.4L4.3 10H2z"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="M9 6l4 4M13 6l-4 4"/>',
);
export const play = S('<path d="M4 3 13 8 4 13z"/>');
export const pause = S('<path d="M3.5 3h3v10h-3zM9.5 3h3v10h-3z"/>');
export const sun = S(
  '<path d="M5.5 8a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M8 1v2M8 13v2M1 8h2M13 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M12.7 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4"/>',
);
export const moon = S('<path d="M10.5 2A6 6 0 1 0 14 11 5 5 0 0 1 10.5 2z"/>');

/* ---- content / people ---- */
export const user = S(
  '<path d="M5.25 5.25a2.75 2.75 0 1 0 5.5 0 2.75 2.75 0 1 0-5.5 0z"/><path d="M2.5 14.5c0-3.3 2.5-4.8 5.5-4.8s5.5 1.5 5.5 4.8z"/>',
);
export const home = S('<path d="M8 1.5 1 8h2v6h4v-4h2v4h4V8h2z"/>');
export const chat = S('<path d="M2 3h12v8H8l-3 3v-3H2z"/>');
export const eye = S(
  '<path fill-rule="evenodd" d="M1 8 4 5h8l3 3-3 3H4z M6 8a2 2 0 1 0 4 0 2 2 0 1 0-4 0z"/>',
);
export const lock = S(
  '<path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2H13v7H3V7zM6.5 7h3V5a1.5 1.5 0 0 0-3 0z"/>',
);
export const gear = S(
  '<path fill-rule="evenodd" d="M7 1h2v2.2l1.6.7 1.6-1 1.4 1.4-1 1.6.7 1.6H15v2h-2.2l-.7 1.6 1 1.6-1.4 1.4-1.6-1-1.6.7V15H7v-2.2l-1.6-.7-1.6 1L2.4 11.7l1-1.6L2.7 8.5H1v-2h2.2l.7-1.6-1-1.6L4.3 1.9l1.6 1L7 3.2zM6 8a2 2 0 1 0 4 0 2 2 0 1 0-4 0z"/>',
);
export const calendar = S(
  '<path fill-rule="evenodd" d="M4 1h1.5v2H4z M10.5 1h1.5v2h-1.5z M2 3h12v11H2z M4 7h8v5H4z"/><path d="M5.5 8.5h1.5v1.5H5.5z M9 8.5h1.5v1.5H9z"/>',
);
export const clock = S(
  '<path fill-rule="evenodd" d="M2 8a6 6 0 1 0 12 0 6 6 0 1 0-12 0z M4 8a4 4 0 1 0 8 0 4 4 0 1 0-8 0z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M8 5.5V8h2.5"/>',
);
export const github = S(
  '<path d="M8 1a7 7 0 0 0-2.2 13.6c.35.06.48-.15.48-.34v-1.2c-1.95.42-2.36-.94-2.36-.94-.32-.8-.78-1.02-.78-1.02-.64-.44.05-.43.05-.43.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.56-.18-3.2-.78-3.2-3.47 0-.77.27-1.4.72-1.88-.07-.18-.31-.9.07-1.87 0 0 .59-.19 1.92.72a6.7 6.7 0 0 1 3.5 0c1.33-.9 1.92-.72 1.92-.72.38.97.14 1.69.07 1.87.45.48.72 1.11.72 1.88 0 2.7-1.64 3.29-3.2 3.46.25.22.48.65.48 1.31v1.95c0 .19.13.4.48.33A7 7 0 0 0 8 1z"/>',
);

/* ---- AI era: generation, agents, models, voice, feedback ---- */
export const sparkles = S(
  '<path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6z"/><path d="M12.8 1 13.3 2.9 15.2 3.4 13.3 3.9 12.8 5.8 12.3 3.9 10.4 3.4 12.3 2.9z"/>',
);
export const bot = S(
  '<path fill-rule="evenodd" d="M7.25 0.5h1.5v2h-1.5z M2.5 4h11v9h-11z M5 7h2v2.2H5z M9 7h2v2.2H9z"/><path d="M1 7h1.5v3H1z M13.5 7H15v3h-1.5z"/>',
);
export const wand = S(
  '<path d="M2.5 12.5 10 5l1.5 1.5-7.5 7.5z"/><path d="M12.5 1.5 13.1 3.4 15 4 13.1 4.6 12.5 6.5 11.9 4.6 10 4 11.9 3.4z"/>',
);
export const cpu = S(
  '<path fill-rule="evenodd" d="M4.5 4.5h7v7h-7z M6.5 6.5h3v3h-3z"/><path d="M5.5 2h1v2h-1z M9.5 2h1v2h-1z M5.5 12h1v2h-1z M9.5 12h1v2h-1z M2 5.5h2v1H2z M2 9.5h2v1H2z M12 5.5h2v1h-2z M12 9.5h2v1h-2z"/>',
);
export const brain = S(
  '<path d="M7.3 2.2C5.9 1.5 4 2.2 4 3.9 2.6 4.2 2.2 5.6 3 6.6 1.9 7.5 2.3 9.4 3.7 9.7 3.8 11.4 5.6 12 6.6 11.2 7 11.9 7.3 12 7.3 12z M8.7 2.2C10.1 1.5 12 2.2 12 3.9c1.4.3 1.8 1.7 1 2.7 1.1.9.7 2.8-.7 3.1-.1 1.7-1.9 2.3-2.9 1.5-.4.7-.7.8-.7.8z"/>',
);
export const send = S('<path d="M1.5 8.3 14.5 2 8.6 14.5 7 9z"/>');
export const stop = S('<path d="M3.5 3.5h9v9h-9z"/>');
export const mic = S(
  '<path d="M6 2.5a2 2 0 0 1 4 0V8a2 2 0 0 1-4 0z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V15M5.5 15h5"/>',
);
export const thumbsUp = S(
  '<path d="M2 7h2.5v7H2z"/><path d="M4.5 7 7 1.5c1.2 0 2 .8 2 2V6h3.7c1 0 1.7.9 1.5 1.9l-.9 4.2c-.2.9-1 1.4-1.9 1.4H4.5z"/>',
);
export const thumbsDown = S(
  '<path d="M2 2h2.5v7H2z"/><path d="M4.5 9 7 14.5c1.2 0 2-.8 2-2V10h3.7c1 0 1.7-.9 1.5-1.9l-.9-4.2C13.1 3 12.3 2.5 11.4 2.5H4.5z"/>',
);
export const image = S(
  '<path fill-rule="evenodd" d="M2 3h12v10H2z M4 5h8v6H4z"/><path d="M5 10.5 7.3 7.5l1.4 1.8 1.6-2.2 2.2 3.4z M5.5 6.6a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>',
);
export const paperclip = S(
  '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M11.8 6 6.6 11.2a2.2 2.2 0 0 1-3.1-3.1l5.6-5.6a3.4 3.4 0 0 1 4.8 4.8l-5.6 5.6"/>',
);
export const loader = S(
  '<path fill="none" stroke="currentColor" stroke-width="2" d="M14 8a6 6 0 1 1-6-6"/>',
);

/* ---- modern dev / infra ---- */
export const globe = S(
  '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z M2.2 8h11.6 M8 2.2c2.5 1.8 2.5 10 0 11.6 M8 2.2C5.5 4 5.5 12.2 8 13.8"/>',
);
export const database = S(
  '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M8 1.8c2.5 0 4.5 1 4.5 2.2S10.5 6.2 8 6.2 3.5 5.2 3.5 4 5.5 1.8 8 1.8z M3.5 4v8c0 1.2 2 2.2 4.5 2.2s4.5-1 4.5-2.2V4 M3.5 8c0 1.2 2 2.2 4.5 2.2s4.5-1 4.5-2.2"/>',
);
export const cloud = S(
  '<path d="M4.6 12.5A3.3 3.3 0 0 1 4.5 6 4 4 0 0 1 12 5.6a2.8 2.8 0 0 1 .2 5.5z"/>',
);
export const rocket = S(
  '<path fill-rule="evenodd" d="M8 1.2C10.5 3 11.5 5.5 11.5 8L10 10.5H6L4.5 8C4.5 5.5 5.5 3 8 1.2z M6.8 6a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0z"/><path fill="none" stroke="currentColor" stroke-width="1.3" d="M6 11l-1.5 3M10 11l1.5 3"/>',
);
export const gitBranch = S(
  '<path fill-rule="evenodd" d="M3.5 2.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z M3.5 9.9a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z M12 2.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M3.5 6v4 M12 6c0 3-4 2-6 3.5"/>',
);
export const packageBox = S(
  '<path d="M8 1 14 4.3 8 7.6 2 4.3z"/><path fill="none" stroke="currentColor" stroke-width="1.3" d="M2 4.5v7L8 15l6-3.5v-7 M8 7.8V15 M5 2.8 11 6"/>',
);
export const key = S(
  '<path fill-rule="evenodd" d="M6 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M6 4.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z"/><path d="M8.7 6.2H15v2h-1.5v1.8H12V8.2H8.7z"/>',
);
export const shield = S(
  '<path d="M8 1.3 13.5 3.3v4.7c0 3.6-2.6 5.6-5.5 6.7-2.9-1.1-5.5-3.1-5.5-6.7V3.3z"/>',
);
export const bug = S(
  '<path d="M5.5 6h5v3.5a2.5 2.5 0 0 1-5 0z"/><path fill-rule="evenodd" d="M6.3 3.2a1.7 1.7 0 0 1 3.4 0V5.5H6.3z"/><path fill="none" stroke="currentColor" stroke-width="1.3" d="M5.5 7 2.8 6 M5.5 9H2.5 M5.5 11l-2.3 1.6 M10.5 7l2.7-1 M10.5 9h3 M10.5 11l2.3 1.6"/>',
);
export const server = S(
  '<path fill-rule="evenodd" d="M2 2.5h12v5H2z M2 8.5h12v5H2z M4 4h1.5v2H4z M4 10h1.5v2H4z"/>',
);
export const layers = S(
  '<path d="M8 1.5 14.5 5 8 8.5 1.5 5z"/><path fill="none" stroke="currentColor" stroke-width="1.3" d="M1.5 8 8 11.5 14.5 8 M1.5 11 8 14.5 14.5 11"/>',
);
export const grid = S('<path d="M2 2h5v5H2z M9 2h5v5H9z M2 9h5v5H2z M9 9h5v5H9z"/>');
export const list = S(
  '<path d="M5 3h9v2H5z M5 7h9v2H5z M5 11h9v2H5z M2 3h2.2v2H2z M2 7h2.2v2H2z M2 11h2.2v2H2z"/>',
);
export const sliders = S(
  '<path d="M2 4h6.5v1.6H2z M11 4h3v1.6h-3z M8.5 3h1.6v3.6H8.5z M2 10.4h3v1.6H2z M7.5 10.4h6.5v1.6H7.5z M5 9.4h1.6V13H5z"/>',
);

/* ---- critical common (circles, feedback, files, misc) ---- */
export const checkCircle = S(
  '<path fill-rule="evenodd" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z M7 10.6 4.3 7.9l1.1-1.1L7 8.4l3.5-3.5 1.1 1.1z"/>',
);
export const xCircle = S(
  '<path fill-rule="evenodd" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z M5.8 4.7 8 6.9l2.2-2.2 1.1 1.1L9.1 8l2.2 2.2-1.1 1.1L8 9.1l-2.2 2.2-1.1-1.1L6.9 8 4.7 5.8z"/>',
);
export const alertCircle = S(
  '<path fill-rule="evenodd" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z M7.2 4.5h1.6l-.2 4.6H7.4z M7.2 10.3h1.6v1.6H7.2z"/>',
);
export const help = S(
  '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z"/><path d="M6.3 6.1a1.8 1.8 0 0 1 3.5.6c0 1.2-1.4 1.4-1.4 2.3H6.9c0-1.4 1.4-1.5 1.4-2.2a.8.8 0 0 0-1.5-.3z M7.2 10.4h1.6v1.6H7.2z"/>',
);
export const link = S(
  '<path fill="none" stroke="currentColor" stroke-width="1.6" d="M6.5 9.5 9.5 6.5 M6.8 5 8.4 3.4a2.4 2.4 0 0 1 3.4 3.4L10.2 8.4 M9.2 11l-1.6 1.6a2.4 2.4 0 0 1-3.4-3.4L5.8 7.6"/>',
);
export const mail = S(
  '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M2.5 3.5h11v9h-11z M2.7 4 8 8.7 13.3 4"/>',
);
export const save = S(
  '<path fill-rule="evenodd" d="M2 2h9.5L14 4.5V14H2z M5 2.5h5V6H5z M4 8.5h8V14H4z"/>',
);
export const folderOpen = S(
  '<path d="M1.5 3h4L7 4.5h7.5V7H4L2.2 12.5H1.5z"/><path d="M3.4 7.5h12l-1.7 6H1.7z"/>',
);
export const tag = S(
  '<path fill-rule="evenodd" d="M2 2h6.6L14 7.4 8.4 13 2 6.6V2z M4.5 4a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z"/>',
);
export const bookmark = S('<path d="M3.5 1.5h9v13l-4.5-3.3-4.5 3.3z"/>');
export const pin = S(
  '<path fill-rule="evenodd" d="M8 1.2a5 5 0 0 0-5 5c0 3.6 5 8.6 5 8.6s5-5 5-8.6a5 5 0 0 0-5-5z M8 4.2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>',
);
export const share = S(
  '<path fill-rule="evenodd" d="M11.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M4 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M11.5 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/><path fill="none" stroke="currentColor" stroke-width="1.3" d="M9.4 4.6 6.1 6.9 M6.1 9.1l3.3 2.3"/>',
);
export const logout = S(
  '<path d="M2 2h7v2H4v8h5v2H2z"/><path d="M10.5 4.5 14 8l-3.5 3.5V9H6V7h4.5z"/>',
);
export const maximize = S(
  '<path d="M2 2h5v2H4v3H2z M14 2v5h-2V4H9V2z M2 14v-5h2v3h3v2z M14 14H9v-2h3v-3h2z"/>',
);

/* ---- name → svg registry (used by icon() + <nes-icon>). Keep in sync. ---- */
export const icons = {
  check,
  close,
  plus,
  minus,
  chevronRight,
  chevronLeft,
  chevronDown,
  chevronUp,
  arrowRight,
  arrowLeft,
  menu,
  dots,
  search,
  filter,
  external,
  refresh,
  copy,
  trash,
  edit,
  file,
  folder,
  download,
  upload,
  code,
  terminal,
  info,
  warn,
  star,
  heart,
  bolt,
  bell,
  volume,
  mute,
  play,
  pause,
  sun,
  moon,
  user,
  home,
  chat,
  eye,
  lock,
  gear,
  calendar,
  clock,
  github,
  sparkles,
  bot,
  wand,
  cpu,
  brain,
  send,
  stop,
  mic,
  thumbsUp,
  thumbsDown,
  image,
  paperclip,
  loader,
  globe,
  database,
  cloud,
  rocket,
  gitBranch,
  package: packageBox,
  key,
  shield,
  bug,
  server,
  layers,
  grid,
  list,
  sliders,
  checkCircle,
  xCircle,
  alertCircle,
  help,
  link,
  mail,
  save,
  folderOpen,
  tag,
  bookmark,
  pin,
  share,
  logout,
  maximize,
};

/** Every icon name (sorted), handy for galleries / validation. */
export const iconNames = Object.keys(icons).sort();

/**
 * Build an icon svg string by name.
 * @param {string} name
 * @param {{ size?: string|number, class?: string, label?: string }} [opts]
 *   size  → width/height (px number or any CSS length; default 1em)
 *   class → adds a class to the <svg>
 *   label → makes it a labelled image (role=img); omit for decorative (aria-hidden)
 */
export function icon(name, opts = {}) {
  let svg = icons[name];
  if (!svg) return "";
  const { size, class: cls, label } = opts;
  if (size != null) {
    const v = typeof size === "number" ? `${size}` : size;
    svg = svg.replace('width="1em" height="1em"', `width="${v}" height="${v}"`);
  }
  if (cls) svg = svg.replace("<svg ", `<svg class="${cls}" `);
  if (label) svg = svg.replace('aria-hidden="true"', `role="img" aria-label="${label}"`);
  return svg;
}
