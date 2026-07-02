// Purpose: Physics-driven soccer ball easter egg that roams BaseLayout pages.
// Scope: Viewport-fixed ball with gravity, one-way platforms, kicks, throws.
// Audience: Desktop fine-pointer visitors without reduced-motion preference.

// Marks the file as a module so its top-level names stay file-scoped for
// astro check (matchMedia constants also exist in card-tilt.ts).
export {};

const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
const STORAGE_KEY = "riive:football";

const R = 24; // ball radius; the element is a 2R square
const GRAVITY = 1400; // px/s^2
const MAX_SPEED = 2600; // px/s hard cap; also bounds per-frame travel
const DT_MAX = 0.032; // s; absorbs tab-switch and long-frame gaps
const SUBSTEP_TRAVEL = 18; // px per substep, below R and the 24px card gap
const MAX_SUBSTEPS = 6; // 2600 * 0.032 / 6 = 13.9px per substep, still < 18

const REST_WALL = 0.72; // restitution against viewport sides and the header
const REST_GROUND = 0.62;
const REST_OBSTACLE = 0.68;
const BOUNCE_CUTOFF = 40; // px/s; smaller rebounds settle instead of jittering
const AIR_DRAG = 0.06; // 1/s
const GROUND_FRICTION = 1.0; // 1/s while resting on a surface
const TANGENT_KEEP = 0.85; // tangential velocity kept through an impact

const CURSOR_R = 40; // kicker circle around the pointer
const CURSOR_REST = 0.45;
const MIN_SEPARATION = 220; // px/s guaranteed exit speed from a moving cursor
const CURSOR_VEL_ALPHA = 0.4; // EMA blend per pointermove sample
const CURSOR_IDLE_MS = 80; // pointer still this long counts as not moving
const WAKE_DIST = R + CURSOR_R + 80;

const SCOOP_CURSOR_SPEED = 350; // px/s sweep speed that counts as a chip kick
const SCOOP_BALL_SPEED = 200; // px/s the hit must impart before lift applies
const SCOOP_LIFT = 0.6; // sin of the minimum launch angle (~31deg)

const KICK_RANGE = 150; // px; a pointerdown further from the ball is ignored
const KICK_POWER = 1250; // px/s at point-blank range
const KICK_FALLOFF = 0.4; // fraction of power lost at max range
const KICK_UP_BIAS = 0.5; // upward pull mixed into the kick direction

const GRAB_STIFFNESS = 22; // 1/s spring rate of the held ball toward pointer
const GRAB_OFFSET_DECAY = 4; // 1/s; the grab point relaxes under the pointer
const SNEAK_SPEED = 200; // px/s; slower approach keeps a sleeping ball still
const ONE_WAY_TOL = 6; // px slack in the was-above test of one-way platforms

const PRESS_WINDOW = 1500; // ms after a throw/kick in which impacts press
const PRESS_MIN_SPEED = 500; // px/s impact speed needed to press a control
const PRESS_SCALE = 0.92; // pressed-in scale applied to the hit control
const PRESS_RESTORE_MS = 110; // ms before the control is restored and clicked

const SQUASH_MIN_VN = 400; // px/s impact speed before a squash pulse shows
const SQUASH_MAX = 0.32; // max relative deformation
const SQUASH_DECAY = 12; // 1/s exponential decay of the pulse
const SQUASH_BULGE = 0.7; // sideways bulge relative to the compression
const STRETCH_AMT = 0.25; // elongation pulse applied by a click kick
const TEXT_MIN_FRAG = 8; // px; smaller text line fragments are ignored

const SLEEP_SPEED = 10; // px/s below which the ball may fall asleep
const SLEEP_DELAY_MS = 300;
const HEADER_FALLBACK = 64; // ceiling when no <header> is present

// oneWay surfaces only catch a ball falling onto their top edge; wasAbove
// is precomputed per frame for that test. pressable rects carry their
// element so a thrown ball can press the control it slams into.
interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  oneWay: boolean;
  wasAbove: boolean;
  pressable: boolean;
  el: HTMLElement | null;
}

// Text line boxes cached as offsets from the owning element's rect; the
// element rect is re-read every frame, so the lines ride scroll for free.
interface LineOffset {
  dx: number;
  dy: number;
  w: number;
  h: number;
}

// lines === null means the element's own box collides (cards, buttons,
// pills); an array means only the measured text lines do. oneWay boxes and
// all text lines are platforms; solid interactive boxes are pressable.
interface Obstacle {
  el: HTMLElement;
  lines: LineOffset[] | null;
  oneWay: boolean;
  pressable: boolean;
}

let ball: HTMLElement | null = null;
let obstacles: Obstacle[] = [];
let headerEl: Element | null = null;
let enabled = false;
let rafId = 0;

const s = {
  x: -100,
  y: -100,
  vx: 0,
  vy: 0,
  angle: 0,
  supported: false,
  restMs: 0,
  lastT: 0,
  prevScrollY: 0,
  cursorX: -1e4,
  cursorY: -1e4,
  cursorVX: 0,
  cursorVY: 0,
  cursorT: 0,
  cursorGone: true,
};

// Impact deformation pulse: normal direction, magnitude, and polarity
// (+1 squashes along the normal on impacts, -1 stretches on kicks).
const sq = {
  nx: 0,
  ny: -1,
  amt: 0,
  sign: 1,
};

// Grab-and-throw state. thrownUntil arms the button-press window (set by
// both releases and click kicks); cursorMuted silences the kicker until the
// ball leaves its shell so a release cannot be corrupted by an immediate
// separation push from the still-overlapping pointer.
let grabbed = false;
let grabPointerId = -1;
let grabDx = 0;
let grabDy = 0;
let thrownUntil = 0;
let cursorMuted = false;

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

// Classic truncated-icosahedron look without real geometry: one centered
// pentagon plus five rim pentagons rotated around the center and clipped
// by the ball circle. Colors sit in the site's zinc palette.
const PENTAGON_CENTER = "24,17 30.66,21.84 28.12,29.66 19.88,29.66 17.34,21.84";
const PENTAGON_EDGE = "24,9.5 17.82,5.01 20.18,-2.26 27.82,-2.26 30.18,5.01";
const BALL_SVG = [
  `<svg viewBox="0 0 48 48" role="presentation" focusable="false">`,
  `<defs><clipPath id="football-clip"><circle cx="24" cy="24" r="22" /></clipPath></defs>`,
  `<circle cx="24" cy="24" r="22" fill="#f4f4f5" />`,
  `<g clip-path="url(#football-clip)" fill="#27272a">`,
  `<polygon points="${PENTAGON_CENTER}" />`,
  ...[36, 108, 180, 252, 324].map(
    (deg) =>
      `<polygon points="${PENTAGON_EDGE}" transform="rotate(${deg} 24 24)" />`,
  ),
  `</g>`,
  `<circle cx="24" cy="24" r="21.5" fill="none" stroke="#52525b" stroke-width="1" />`,
  `</svg>`,
].join("");

function createBallEl(): HTMLElement {
  const el = document.createElement("div");
  el.className = "football";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = BALL_SVG;
  // Grab gesture. The listeners live and die with the element, and pointer
  // capture keeps delivering the drag (and the eventual click) to the ball
  // itself, so releasing over a link cannot navigate.
  el.addEventListener("pointerdown", (event) => {
    if (!enabled || event.button !== 0) return;
    event.preventDefault();
    grabbed = true;
    grabPointerId = event.pointerId;
    el.setPointerCapture(event.pointerId);
    grabDx = s.x - event.clientX;
    grabDy = s.y - event.clientY;
    s.vx = 0;
    s.vy = 0;
    el.classList.add("is-held");
    wake();
  });
  el.addEventListener("pointerup", (event) => {
    if (grabbed && event.pointerId === grabPointerId) releaseGrab(true);
  });
  el.addEventListener("pointercancel", (event) => {
    if (grabbed && event.pointerId === grabPointerId) releaseGrab(false);
  });
  return el;
}

function headerBottom(): number {
  if (headerEl && headerEl.isConnected) {
    return headerEl.getBoundingClientRect().bottom;
  }
  return HEADER_FALLBACK;
}

function measureTextLines(el: HTMLElement): LineOffset[] {
  const base = el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const lines: LineOffset[] = [];
  for (const r of Array.from(range.getClientRects())) {
    // Template whitespace produces zero-size fragments; drop slivers.
    if (r.width < TEXT_MIN_FRAG || r.height < TEXT_MIN_FRAG) continue;
    lines.push({
      dx: r.left - base.left,
      dy: r.top - base.top,
      w: r.width,
      h: r.height,
    });
  }
  return lines;
}

function rescan(): void {
  headerEl = document.querySelector("header");
  obstacles = [];
  document
    .querySelectorAll<HTMLElement>(".card-tilt, [data-ball-obstacle]")
    .forEach((el) => {
      // The "text" flavor collides per measured text line, so block-level
      // headings do not wall off the empty space around their glyphs.
      const flavor = el.dataset.ballObstacle;
      const lines = flavor === "text" ? measureTextLines(el) : null;
      // Text, cards, and "platform" boxes are one-way (land on top only);
      // remaining solid boxes that are same-tab controls can be pressed by
      // a thrown ball.
      const oneWay =
        flavor === "text" ||
        flavor === "platform" ||
        el.classList.contains("card-tilt");
      const pressable =
        !oneWay &&
        !lines &&
        el.matches("a, button") &&
        !(el instanceof HTMLAnchorElement && el.target === "_blank");
      obstacles.push({ el, lines, oneWay, pressable });
    });
}

function render(): void {
  if (!ball) return;
  const px = (s.x - R).toFixed(2);
  const py = (s.y - R).toFixed(2);
  if (sq.amt === 0) {
    ball.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${s.angle.toFixed(4)}rad)`;
    return;
  }
  // World-aligned deformation: rotate the impact normal onto local X, scale,
  // rotate back plus the ball's own rolling angle. The net texture rotation
  // stays s.angle, so the squash never spins with the ball.
  const nA = Math.atan2(sq.ny, sq.nx);
  const sx = 1 - sq.sign * sq.amt;
  const sy = 1 + sq.sign * sq.amt * SQUASH_BULGE;
  ball.style.transform =
    `translate3d(${px}px, ${py}px, 0) rotate(${nA.toFixed(4)}rad) ` +
    `scale(${sx.toFixed(3)}, ${sy.toFixed(3)}) rotate(${(s.angle - nA).toFixed(4)}rad)`;
}

function spawn(): void {
  const w = window.innerWidth;
  s.x = clamp(w * 0.8, R, Math.max(w - R, R));
  s.y = headerBottom() + R + 8;
  s.vx = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 80);
  s.vy = 0;
  s.angle = 0;
}

function restoreState(): boolean {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return false;
    const rec = data as Record<string, unknown>;
    const { fx, yb, vx, vy, a } = rec;
    if (
      !isFiniteNumber(fx) ||
      !isFiniteNumber(yb) ||
      !isFiniteNumber(vx) ||
      !isFiniteNumber(vy) ||
      !isFiniteNumber(a)
    ) {
      return false;
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const top = headerBottom();
    // Stored as x fraction + offset from the bottom so the ball lands in a
    // sensible spot even when the viewport changed between page loads.
    s.x = clamp(fx * w, R, Math.max(w - R, R));
    s.y = clamp(h - yb, top + R, Math.max(h - R, top + R));
    s.vx = clamp(vx, -MAX_SPEED, MAX_SPEED);
    s.vy = clamp(vy, -MAX_SPEED, MAX_SPEED);
    s.angle = a % (Math.PI * 2);
    return true;
  } catch {
    return false;
  }
}

function saveState(): void {
  if (!enabled) return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fx: s.x / window.innerWidth,
        yb: window.innerHeight - s.y,
        vx: s.vx,
        vy: s.vy,
        a: s.angle,
      }),
    );
  } catch {
    // Storage can be unavailable (private mode); the ball just respawns.
  }
}

function pulseSquash(nx: number, ny: number, vn: number): void {
  if (vn < SQUASH_MIN_VN) return;
  const amt = clamp(vn / MAX_SPEED, 0.08, SQUASH_MAX);
  if (amt <= sq.amt) return; // the strongest active pulse wins
  sq.nx = nx;
  sq.ny = ny;
  sq.amt = amt;
  sq.sign = 1;
}

function applyCursor(): void {
  const minD = R + CURSOR_R;
  const dx = s.x - s.cursorX;
  const dy = s.y - s.cursorY;
  const d2 = dx * dx + dy * dy;
  if (d2 >= minD * minD) {
    cursorMuted = false;
    return;
  }
  // Muted right after a release: the pointer is still inside the shell and
  // must not inject separation pushes into the throw it just made.
  if (cursorMuted) return;
  const d = Math.sqrt(d2);
  const nx = d > 0.0001 ? dx / d : 0;
  const ny = d > 0.0001 ? dy / d : -1;
  s.x += nx * (minD - d);
  s.y += ny * (minD - d);
  // A pointer that has not moved recently acts as a static obstacle: it
  // separates positionally but never flings, so a parked cursor cannot
  // pin the ball against the floor into a bounce loop.
  const idle = s.cursorGone || performance.now() - s.cursorT > CURSOR_IDLE_MS;
  const kvx = idle ? 0 : s.cursorVX;
  const kvy = idle ? 0 : s.cursorVY;
  const vn = (s.vx - kvx) * nx + (s.vy - kvy) * ny;
  if (vn < 0) {
    s.vx -= nx * vn * (1 + CURSOR_REST);
    s.vy -= ny * vn * (1 + CURSOR_REST);
  }
  if (!idle) {
    // Guaranteed exit speed so a slow creep still visibly nudges the ball
    // instead of dragging it along inside the kicker circle.
    const sep = (s.vx - kvx) * nx + (s.vy - kvy) * ny;
    if (sep < MIN_SEPARATION) {
      s.vx += nx * (MIN_SEPARATION - sep);
      s.vy += ny * (MIN_SEPARATION - sep);
    }
  }
  if (!idle && s.supported) {
    // Chip kick: a grounded ball leaves no room underneath for an upward
    // approach, so a fast sweep lifts it to a minimum launch angle instead
    // of just shoving it sideways. (s.supported still holds the previous
    // substep's contact state here — collisions reset it afterwards.)
    const cursorSpeed = Math.hypot(s.cursorVX, s.cursorVY);
    const ballSpeed = Math.hypot(s.vx, s.vy);
    if (cursorSpeed > SCOOP_CURSOR_SPEED && ballSpeed > SCOOP_BALL_SPEED) {
      s.vy = -Math.max(ballSpeed * SCOOP_LIFT, -s.vy);
    }
  }
}

function collideWorld(w: number, h: number, top: number): void {
  if (s.y > h - R) {
    s.y = h - R;
    if (s.vy > 0) {
      pulseSquash(0, -1, s.vy);
      s.vy = -s.vy * REST_GROUND;
      if (-s.vy < BOUNCE_CUTOFF) s.vy = 0;
    }
    s.supported = true;
  }
  if (s.x < R) {
    s.x = R;
    if (s.vx < 0) {
      pulseSquash(1, 0, -s.vx);
      s.vx = -s.vx * REST_WALL;
    }
  }
  if (s.x > w - R) {
    s.x = w - R;
    if (s.vx > 0) {
      pulseSquash(-1, 0, s.vx);
      s.vx = -s.vx * REST_WALL;
    }
  }
  if (s.y < top + R) {
    s.y = top + R;
    if (s.vy < 0) {
      pulseSquash(0, 1, -s.vy);
      s.vy = -s.vy * REST_WALL;
    }
  }
}

function collideObstacles(rects: Rect[], obstacleVy: number): void {
  for (const rect of rects) {
    const cx = clamp(s.x, rect.left, rect.right);
    const cy = clamp(s.y, rect.top, rect.bottom);
    const dx = s.x - cx;
    const dy = s.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= R * R) continue;
    let nx = 0;
    let ny = 0;
    let pen = 0;
    if (d2 > 0) {
      const d = Math.sqrt(d2);
      nx = dx / d;
      ny = dy / d;
      pen = R - d;
    } else {
      // Center ended up inside the rect (deep-hit backstop): exit through
      // the nearest face.
      const toLeft = s.x - rect.left;
      const toRight = rect.right - s.x;
      const toTop = s.y - rect.top;
      const toBottom = rect.bottom - s.y;
      const m = Math.min(toLeft, toRight, toTop, toBottom);
      if (m === toLeft) nx = -1;
      else if (m === toRight) nx = 1;
      else if (m === toTop) ny = -1;
      else ny = 1;
      pen = R + m;
    }
    // One-way platforms only catch a ball that was above them this frame
    // and is approaching downward relative to the surface. A deep overlap
    // that still satisfies that (an instant scroll jump swept the surface
    // up past the center) snaps the ball back onto the top instead of
    // dropping it through; side and bottom approaches pass freely.
    if (rect.oneWay) {
      if (!rect.wasAbove || s.vy - obstacleVy <= 0) continue;
      if (d2 === 0) {
        nx = 0;
        ny = -1;
        pen = s.y - (rect.top - R);
      } else if (ny >= -0.7) {
        continue;
      }
    }
    s.x += nx * pen;
    s.y += ny * pen;
    // Velocities are resolved relative to the obstacle, which moves
    // vertically in viewport coordinates while the page scrolls — that is
    // what lets scrolling content plow the ball instead of passing through.
    const rvx = s.vx;
    const rvy = s.vy - obstacleVy;
    const vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      if (
        rect.pressable &&
        rect.el &&
        -vn > PRESS_MIN_SPEED &&
        thrownUntil !== 0 &&
        performance.now() < thrownUntil
      ) {
        // A thrown or kicked ball presses the control it slams into; one
        // press per throw, and a merely rolling ball never qualifies.
        thrownUntil = 0;
        pressEl(rect.el);
      }
      pulseSquash(nx, ny, -vn);
      const tx = -ny;
      const ty = nx;
      const vt = rvx * tx + rvy * ty;
      // Restitution applies only to the ball's OWN approach speed: a ball
      // dropped onto a surface bounces as usual, but a surface swept into a
      // resting ball by scrolling carries it instead of slingshotting it
      // (scroll jolts arrive as huge one-frame surface velocities).
      const vnOwn = s.vx * nx + s.vy * ny;
      let vnOut = vnOwn < 0 ? -vnOwn * REST_OBSTACLE : 0;
      if (vnOut < BOUNCE_CUTOFF) vnOut = 0;
      const vtOut = vt * TANGENT_KEEP;
      const carryVy = vnOut > 0 ? obstacleVy : 0;
      s.vx = nx * vnOut + tx * vtOut;
      s.vy = carryVy + ny * vnOut + ty * vtOut;
    }
    if (ny < -0.7) s.supported = true;
  }
}

function substep(
  dt: number,
  rects: Rect[],
  obstacleVy: number,
  w: number,
  h: number,
  top: number,
): void {
  s.vy += GRAVITY * dt;
  const drag = Math.exp(-AIR_DRAG * dt);
  s.vx *= drag;
  s.vy *= drag;
  applyCursor();
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.supported = false;
  collideWorld(w, h, top);
  collideObstacles(rects, obstacleVy);
  if (s.supported) s.vx *= Math.exp(-GROUND_FRICTION * dt);
  s.angle = (s.angle + (s.vx / R) * dt) % (Math.PI * 2);
  const speed = Math.hypot(s.vx, s.vy);
  if (speed > MAX_SPEED) {
    const k = MAX_SPEED / speed;
    s.vx *= k;
    s.vy *= k;
  }
}

function step(now: number): void {
  rafId = 0;
  if (!enabled || !ball) return;
  if (REDUCED_MOTION.matches || !FINE_POINTER.matches) {
    applyCapability();
    return;
  }
  const dt = clamp((now - s.lastT) / 1000, 0, DT_MAX);
  s.lastT = now;
  if (!ball.isConnected) {
    // Mid-swap frame: the after-swap/page-load handlers re-append the node.
    schedule();
    return;
  }
  // All reads happen up front (scroll, header, obstacle boxes), then
  // physics, then the single transform write — the frame never interleaves
  // layout reads with writes. Obstacle boxes are measured fresh every frame
  // because scroll and the scroll-driven reveal move them constantly.
  const w = window.innerWidth;
  const h = window.innerHeight;
  const top = headerBottom();
  const scrollY = window.scrollY;
  const scrollDelta = s.prevScrollY - scrollY;
  s.prevScrollY = scrollY;
  if (grabbed) {
    // Held ball: spring toward the pointer, no gravity or collisions. The
    // spring's tracked velocity is what a release throws with, and the
    // clamped delta keeps drags along the viewport edge from storing a
    // phantom fling.
    const k = 1 - Math.exp(-GRAB_STIFFNESS * dt);
    const decay = Math.exp(-GRAB_OFFSET_DECAY * dt);
    grabDx *= decay;
    grabDy *= decay;
    const targetX = s.cursorX + grabDx;
    const targetY = s.cursorY + grabDy;
    const prevX = s.x;
    const prevY = s.y;
    s.x = clamp(s.x + (targetX - s.x) * k, R, Math.max(w - R, R));
    s.y = clamp(s.y + (targetY - s.y) * k, top + R, Math.max(h - R, top + R));
    if (dt > 0) {
      s.vx = (s.x - prevX) / dt;
      s.vy = (s.y - prevY) / dt;
    }
    s.angle = (s.angle + (s.vx / R) * dt) % (Math.PI * 2);
    if (sq.amt > 0) {
      sq.amt *= Math.exp(-SQUASH_DECAY * dt);
      if (sq.amt < 0.01) sq.amt = 0;
    }
    render();
    s.restMs = 0;
    schedule();
    return;
  }
  const obstacleVy = dt > 0 ? scrollDelta / dt : 0;
  const margin = R + Math.hypot(s.vx, s.vy) * dt + Math.abs(scrollDelta) + 8;
  // One-way test data: the ball's bottom at frame start against each
  // platform's top at the previous frame (rects are post-scroll snapshots;
  // last frame their tops sat at top - scrollDelta).
  const frameBottom = s.y + R;
  const rects: Rect[] = [];
  for (const ob of obstacles) {
    if (!ob.el.isConnected) continue;
    const b = ob.el.getBoundingClientRect();
    // The element box bounds all of its line boxes, so it serves as the
    // outer cull for both flavors.
    if (
      b.right < s.x - margin ||
      b.left > s.x + margin ||
      b.bottom < s.y - margin ||
      b.top > s.y + margin
    ) {
      continue;
    }
    if (!ob.lines) {
      rects.push({
        left: b.left,
        top: b.top,
        right: b.right,
        bottom: b.bottom,
        oneWay: ob.oneWay,
        pressable: ob.pressable,
        el: ob.pressable ? ob.el : null,
        // A platform whose top has scrolled into the header band cannot be
        // stood on (the ceiling clamp would fight the landing), so it just
        // stops catching and hands the ball to gravity.
        wasAbove:
          b.top >= top + 2 * R &&
          frameBottom <= b.top - scrollDelta + ONE_WAY_TOL,
      });
      continue;
    }
    for (const ln of ob.lines) {
      const lnLeft = b.left + ln.dx;
      const lnTop = b.top + ln.dy;
      const lnRight = lnLeft + ln.w;
      const lnBottom = lnTop + ln.h;
      if (
        lnRight < s.x - margin ||
        lnLeft > s.x + margin ||
        lnBottom < s.y - margin ||
        lnTop > s.y + margin
      ) {
        continue;
      }
      rects.push({
        left: lnLeft,
        top: lnTop,
        right: lnRight,
        bottom: lnBottom,
        oneWay: true,
        pressable: false,
        el: null,
        wasAbove:
          lnTop >= top + 2 * R &&
          frameBottom <= lnTop - scrollDelta + ONE_WAY_TOL,
      });
    }
  }
  if (dt > 0) {
    const substeps = clamp(
      Math.ceil((Math.hypot(s.vx, s.vy) * dt) / SUBSTEP_TRAVEL),
      1,
      MAX_SUBSTEPS,
    );
    const stepDt = dt / substeps;
    for (let i = 0; i < substeps; i += 1) {
      substep(stepDt, rects, obstacleVy, w, h, top);
    }
  }
  if (sq.amt > 0) {
    sq.amt *= Math.exp(-SQUASH_DECAY * dt);
    if (sq.amt < 0.01) sq.amt = 0;
  }
  render();
  const speed = Math.hypot(s.vx, s.vy);
  if (s.supported && speed < SLEEP_SPEED) {
    s.restMs += dt * 1000;
  } else {
    s.restMs = 0;
  }
  if (s.restMs > SLEEP_DELAY_MS) {
    sleepNow();
    return;
  }
  schedule();
}

function schedule(): void {
  if (!rafId) rafId = requestAnimationFrame(step);
}

function wake(): void {
  if (!enabled || rafId) return;
  // The time clock resets (a sleep gap is not physical), but prevScrollY
  // deliberately does NOT: scrolling that happened while asleep is real
  // platform motion, and the first frame must see the accumulated delta so
  // one-way surfaces carry or scoop the ball instead of dropping it.
  s.lastT = performance.now();
  s.restMs = 0;
  rafId = requestAnimationFrame(step);
}

function sleepNow(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  s.vx = 0;
  s.vy = 0;
  s.restMs = 0;
  // A hidden-tab decay gap must never freeze a deformed sleeping ball.
  sq.amt = 0;
  render();
}

function enable(): void {
  if (enabled) return;
  enabled = true;
  if (!ball) ball = createBallEl();
  if (!ball.isConnected) document.body.append(ball);
  rescan();
  if (!restoreState()) spawn();
  // Fresh scroll baseline: whatever position the page loaded at is not
  // platform motion.
  s.prevScrollY = window.scrollY;
  render();
  wake();
}

function destroy(): void {
  enabled = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  grabbed = false;
  grabPointerId = -1;
  thrownUntil = 0;
  cursorMuted = false;
  ball?.remove();
  ball = null;
  obstacles = [];
  headerEl = null;
}

function applyCapability(): void {
  if (FINE_POINTER.matches && !REDUCED_MOTION.matches) {
    enable();
  } else {
    destroy();
  }
}

function pressEl(el: HTMLElement): void {
  el.style.transition = "transform 90ms ease";
  el.style.transform = `scale(${PRESS_SCALE})`;
  window.setTimeout(() => {
    if (!el.isConnected) return;
    // Removing both restores the class-driven transition untouched.
    el.style.removeProperty("transform");
    el.style.removeProperty("transition");
    el.click();
  }, PRESS_RESTORE_MS);
}

function releaseGrab(throwIt: boolean): void {
  grabbed = false;
  try {
    ball?.releasePointerCapture(grabPointerId);
  } catch {
    // The capture may already be gone (pointer lost, element swapped).
  }
  grabPointerId = -1;
  ball?.classList.remove("is-held");
  cursorMuted = true;
  if (!throwIt) {
    s.vx = 0;
    s.vy = 0;
    return;
  }
  const speed = Math.hypot(s.vx, s.vy);
  if (speed > MAX_SPEED) {
    const cap = MAX_SPEED / speed;
    s.vx *= cap;
    s.vy *= cap;
  }
  thrownUntil = performance.now() + PRESS_WINDOW;
  if (speed > SQUASH_MIN_VN) {
    sq.nx = s.vx / speed;
    sq.ny = s.vy / speed;
    sq.amt = STRETCH_AMT;
    sq.sign = -1;
  }
}

document.addEventListener("pointermove", (event) => {
  if (!enabled) return;
  // performance.now(), not event.timeStamp: applyCursor compares cursorT
  // against performance.now(), and synthetic events (DevTools, test
  // drivers) may stamp on a different clock base, which would freeze the
  // velocity estimate as permanently "idle".
  const now = performance.now();
  if (s.cursorGone) {
    // Re-entry after leaving the viewport: seed the position without a
    // velocity spike from the huge positional jump.
    s.cursorGone = false;
    s.cursorVX = 0;
    s.cursorVY = 0;
  } else {
    const dtm = Math.max(now - s.cursorT, 4) / 1000;
    const ivx = (event.clientX - s.cursorX) / dtm;
    const ivy = (event.clientY - s.cursorY) / dtm;
    s.cursorVX += (ivx - s.cursorVX) * CURSOR_VEL_ALPHA;
    s.cursorVY += (ivy - s.cursorVY) * CURSOR_VEL_ALPHA;
  }
  s.cursorX = event.clientX;
  s.cursorY = event.clientY;
  s.cursorT = now;
  if (!rafId) {
    const dx = event.clientX - s.x;
    const dy = event.clientY - s.y;
    // A slow approach leaves the sleeping ball in place so the pointer can
    // actually reach and grab it; deliberate sweeps wake it as before.
    if (
      dx * dx + dy * dy < WAKE_DIST * WAKE_DIST &&
      Math.hypot(s.cursorVX, s.cursorVY) > SNEAK_SPEED
    ) {
      wake();
    }
  }
});

document.addEventListener("pointerleave", () => {
  s.cursorGone = true;
  s.cursorX = -1e4;
  s.cursorY = -1e4;
  s.cursorVX = 0;
  s.cursorVY = 0;
});

// Click kick: a deliberate shot on empty space near the ball. Interactive
// targets (and the entry-gate dialog) are skipped up front, so links and
// buttons behave exactly as if the ball did not exist.
document.addEventListener("pointerdown", (event) => {
  if (!enabled || !ball || event.button !== 0) return;
  const target = event.target;
  // Pointerdowns on the ball are the grab gesture (the ball's own listener
  // handles them); never also kick.
  if (target instanceof Node && ball.contains(target)) return;
  if (
    target instanceof Element &&
    target.closest(
      "a, button, input, select, textarea, [role='button'], [role='dialog']",
    )
  ) {
    return;
  }
  const dx = s.x - event.clientX;
  const dy = s.y - event.clientY;
  const d = Math.hypot(dx, dy);
  if (d > KICK_RANGE) return;
  const power = KICK_POWER * (1 - KICK_FALLOFF * (d / KICK_RANGE));
  let nx = d > 0.0001 ? dx / d : 0;
  let ny = d > 0.0001 ? dy / d : -1;
  ny -= KICK_UP_BIAS;
  const m = Math.hypot(nx, ny);
  nx /= m;
  ny /= m;
  s.vx = nx * power;
  s.vy = ny * power;
  thrownUntil = performance.now() + PRESS_WINDOW;
  sq.nx = nx;
  sq.ny = ny;
  sq.amt = STRETCH_AMT;
  sq.sign = -1;
  wake();
});

// Release is handled at the document level, independent of pointer capture:
// during a fast fling the ball lags the cursor, so the pointerup often lands
// on the page rather than the ball, and capture delivery is not guaranteed
// for every input source. Idempotent with the ball's own listeners.
document.addEventListener("pointerup", (event) => {
  if (grabbed && event.pointerId === grabPointerId) releaseGrab(true);
});
document.addEventListener("pointercancel", (event) => {
  if (grabbed && event.pointerId === grabPointerId) releaseGrab(false);
});

// Scroll always wakes the ball: while the page scrolls, any card can sweep
// into a resting ball from arbitrarily far away, so proximity filters would
// miss plow cases. The rest timer re-sleeps it shortly after scrolling ends.
document.addEventListener("scroll", () => wake(), { passive: true });

window.addEventListener("resize", () => {
  if (!enabled) return;
  // Reflow rewraps headings, so cached text-line offsets go stale.
  rescan();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const top = headerBottom();
  s.x = clamp(s.x, R, Math.max(w - R, R));
  s.y = clamp(s.y, top + R, Math.max(h - R, top + R));
  wake();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (grabbed) releaseGrab(false);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  } else {
    wake();
  }
});

document.addEventListener("astro:before-swap", () => {
  // Never carry a grab across pages; the outgoing page's obstacles are
  // about to be discarded, so drop them too before transition frames run.
  if (grabbed) releaseGrab(false);
  obstacles = [];
  headerEl = null;
});

document.addEventListener("astro:after-swap", () => {
  if (!enabled || !ball) return;
  // The body swap detached the ball; re-appending the same node inside the
  // swap keeps it in the incoming view-transition snapshot (no flash) and
  // preserves position/velocity, which live in module state.
  if (!ball.isConnected) document.body.append(ball);
  rescan();
  // The new page's scroll position is a fresh baseline, not motion of the
  // outgoing page's surfaces.
  s.prevScrollY = window.scrollY;
});

document.addEventListener("astro:page-load", () => {
  if (!enabled || !ball) return;
  if (!ball.isConnected) document.body.append(ball);
  rescan();
  wake();
});

// Soft navigations keep module state alive; storage only needs to cover
// full page loads (reload, direct entry, the terminal hard-nav).
window.addEventListener("pagehide", saveState);

FINE_POINTER.addEventListener("change", applyCapability);
REDUCED_MOTION.addEventListener("change", applyCapability);

// Late font loads rewrap text lines; re-measure once fonts settle. The site
// currently ships the system font stack, so this resolves immediately.
void document.fonts.ready.then(() => {
  if (enabled) rescan();
});

applyCapability();
