// Purpose: Drive the 3D tilt + glare hover effect on content cards.
// Scope: Pointer-driven CSS variable updates for elements with .card-tilt.
// Audience: Card UI components (projects/writing/reviews).

const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
const MAX_TILT_DEG = 3.5;

function initCard(card: HTMLElement) {
  // Cached at pointerenter while the card is untransformed; measuring on
  // every move would read the post-transform box and cause feedback wobble.
  let rect: DOMRect | null = null;
  let rafId = 0;
  let lastX = 0;
  let lastY = 0;

  const update = () => {
    rafId = 0;
    if (!rect) return;
    const px = Math.min(Math.max((lastX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((lastY - rect.top) / rect.height, 0), 1);
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

  const reset = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    rect = null;
    card.classList.remove("is-tilting");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  card.addEventListener("pointerenter", () => {
    if (!FINE_POINTER.matches || REDUCED_MOTION.matches) return;
    rect = card.getBoundingClientRect();
    card.classList.add("is-tilting");
  });

  card.addEventListener("pointermove", (event) => {
    if (!rect) return;
    lastX = event.clientX;
    lastY = event.clientY;
    if (!rafId) rafId = requestAnimationFrame(update);
  });

  card.addEventListener("pointerleave", reset);

  REDUCED_MOTION.addEventListener("change", (event) => {
    if (event.matches) reset();
  });
}

document.querySelectorAll<HTMLElement>(".card-tilt").forEach(initCard);
