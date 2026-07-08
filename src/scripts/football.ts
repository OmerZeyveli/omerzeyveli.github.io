// Purpose: Physics-driven soccer ball easter egg that roams BaseLayout pages.
// Scope: Viewport-fixed ball with gravity, one-way platforms, grab throws.
// Audience: Desktop fine-pointer visitors without reduced-motion preference.

// Marks the file as a module so its top-level names stay file-scoped for
// astro check (matchMedia constants also exist in card-tilt.ts).
export {};

const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
const STORAGE_KEY = "riive:football";

const R = 24; // visual/physical ball radius
const GRAB_R = 36; // larger element radius for easier pointer grabs
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

const GRAB_STIFFNESS = 22; // 1/s spring rate of the held ball toward pointer
const ONE_WAY_TOL = 6; // px slack in the was-above test of one-way platforms

const PRESS_WINDOW = 1500; // ms after a throw in which impacts press
const PRESS_MIN_SPEED = 500; // px/s impact speed needed to press a control
const PRESS_SCALE = 0.92; // pressed-in scale applied to the hit control
const PRESS_RESTORE_MS = 110; // ms before the control is restored and clicked

const SQUASH_MIN_VN = 400; // px/s impact speed before a squash pulse shows
const SQUASH_MAX = 0.32; // max relative deformation
const SQUASH_DECAY = 12; // 1/s exponential decay of the pulse
const SQUASH_BULGE = 0.7; // sideways bulge relative to the compression
const STRETCH_AMT = 0.25; // elongation pulse applied by a grab throw

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

// Cards and explicit platform boxes are one-way; solid interactive boxes
// are pressable when a thrown ball hits them.
interface Obstacle {
  el: HTMLElement;
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
};

// Impact deformation pulse: normal direction, magnitude, and polarity.
// Positive squashes along the normal; negative stretches on throws.
const sq = {
  nx: 0,
  ny: -1,
  amt: 0,
  sign: 1,
};

// Grab-and-throw state. thrownUntil arms the button-press window after release,
// so a thrown ball can still press controls it slams into.
let grabbed = false;
let grabPointerId = -1;
let thrownUntil = 0;

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
    trackPointer(event);
    grabbed = true;
    grabPointerId = event.pointerId;
    el.setPointerCapture(event.pointerId);
    s.vx = 0;
    s.vy = 0;
    el.classList.add("is-held");
    wake();
  });
  el.addEventListener("pointermove", (event) => {
    if (grabbed && event.pointerId === grabPointerId) trackPointer(event);
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

function rescan(): void {
  headerEl = document.querySelector("header");
  obstacles = [];
  document
    .querySelectorAll<HTMLElement>(".card-tilt, [data-ball-obstacle]")
    .forEach((el) => {
      const flavor = el.dataset.ballObstacle;
      if (flavor === "text") return;
      const oneWay =
        flavor === "platform" || el.classList.contains("card-tilt");
      const pressable =
        !oneWay &&
        el.matches("a, button") &&
        !(el instanceof HTMLAnchorElement && el.target === "_blank");
      obstacles.push({ el, oneWay, pressable });
    });
}

function render(): void {
  if (!ball) return;
  const px = (s.x - GRAB_R).toFixed(2);
  const py = (s.y - GRAB_R).toFixed(2);
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
        // A thrown ball presses the control it slams into; one press per
        // throw, and a merely rolling ball never qualifies.
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
    // Held ball: spring its center toward the pointer, no gravity or
    // collisions. The spring's tracked velocity is what a release throws
    // with, and the clamped delta keeps drags along the viewport edge from
    // storing a phantom fling.
    const k = 1 - Math.exp(-GRAB_STIFFNESS * dt);
    const prevX = s.x;
    const prevY = s.y;
    s.x = clamp(s.x + (s.cursorX - s.x) * k, R, Math.max(w - R, R));
    s.y = clamp(s.y + (s.cursorY - s.y) * k, top + R, Math.max(h - R, top + R));
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
    if (
      b.right < s.x - margin ||
      b.left > s.x + margin ||
      b.bottom < s.y - margin ||
      b.top > s.y + margin
    ) {
      continue;
    }
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

function trackPointer(event: PointerEvent): void {
  s.cursorX = event.clientX;
  s.cursorY = event.clientY;
}

document.addEventListener("pointermove", (event) => {
  if (!enabled) return;
  trackPointer(event);
});

document.addEventListener("pointerleave", () => {
  if (grabbed) return;
  s.cursorX = -1e4;
  s.cursorY = -1e4;
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

applyCapability();
