const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
const MAX_TILT_DEG = 3.5;

// Cards whose tilt is currently active; lets one scroll listener keep every
// hovered card in sync while the page moves under a stationary pointer.
const activeSchedulers = new Set<() => void>();

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function initCard(card: HTMLElement) {
  let active = false;
  let rafId = 0;
  let lastX = 0;
  let lastY = 0;

  const schedule = () => {
    if (!rafId) rafId = requestAnimationFrame(update);
  };

  const reset = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    active = false;
    activeSchedulers.delete(schedule);
    card.classList.remove("is-tilting");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  const update = () => {
    rafId = 0;
    if (!active) return;
    if (REDUCED_MOTION.matches || !card.isConnected) {
      reset();
      return;
    }
    // Measured fresh every frame: scrolling and the scroll-driven reveal
    // move the card while the pointer stays put, so a rect cached at
    // pointerenter goes stale and pins the glare to an edge. The box center
    // and layout size are invariant under the center-origin tilt/scale, so
    // reading them from the transformed element cannot feed back into the
    // tilt and wobble.
    const box = card.getBoundingClientRect();
    if (
      lastX < box.left ||
      lastX > box.right ||
      lastY < box.top ||
      lastY > box.bottom
    ) {
      // The card slid out from under the pointer (scroll without movement
      // does not fire pointerleave everywhere).
      reset();
      return;
    }
    const px = clamp01(
      (lastX - (box.left + box.width / 2)) / card.offsetWidth + 0.5,
    );
    const py = clamp01(
      (lastY - (box.top + box.height / 2)) / card.offsetHeight + 0.5,
    );
    card.style.setProperty(
      "--ry",
      `${((px - 0.5) * 2 * MAX_TILT_DEG).toFixed(2)}deg`,
    );
    card.style.setProperty(
      "--rx",
      `${((0.5 - py) * 2 * MAX_TILT_DEG).toFixed(2)}deg`,
    );
    card.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
    card.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
  };

  card.addEventListener("pointerenter", (event) => {
    if (!FINE_POINTER.matches || REDUCED_MOTION.matches) return;
    active = true;
    activeSchedulers.add(schedule);
    card.classList.add("is-tilting");
    lastX = event.clientX;
    lastY = event.clientY;
    schedule();
  });

  card.addEventListener("pointermove", (event) => {
    if (!active) return;
    lastX = event.clientX;
    lastY = event.clientY;
    schedule();
  });

  card.addEventListener("pointerleave", reset);
}

function initAll() {
  document.querySelectorAll<HTMLElement>(".card-tilt").forEach((card) => {
    // The guard lives on the element, so cards swapped in by the client
    // router get initialized while surviving ones are not double-bound.
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = "true";
    initCard(card);
  });
}

initAll();
// Rebind after client-router navigations; this module only executes once.
document.addEventListener("astro:page-load", initAll);
// Keep hovered cards tracking while the page scrolls beneath the pointer.
document.addEventListener(
  "scroll",
  () => activeSchedulers.forEach((schedule) => schedule()),
  { passive: true },
);
