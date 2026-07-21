import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from "astro:transitions/client";
import { coverTransitionName } from "../lib/transitions";

const COLLECTIONS = new Set(["projects", "writing", "reviews"]);
// Keep cold-cache navigations responsive if the larger hero cannot decode
// quickly; hover, focus, and touch warming usually finishes before this wait.
const HERO_PRELOAD_TIMEOUT_MS = 150;
const HERO_SIZES = "(max-width: 768px) 100vw, 768px";
const heroPreloads = new Map<string, Promise<void>>();

// Cards only carry data-card-cover. A static view-transition-name on every
// card would promote each cover to its own snapshot layer, which ignores
// ancestor effects (reveal opacity, rounded clipping) and makes untouched
// cards flash during transitions — so exactly one card is named per
// navigation, matched against the detail-page URL.

function nameForPath(pathname: string): string | null {
  const [collection, ...rest] = pathname.split("/").filter(Boolean);
  if (!collection || rest.length === 0 || !COLLECTIONS.has(collection)) {
    return null;
  }
  return coverTransitionName(collection, rest.join("/"));
}

function clearCoverNames(root: ParentNode) {
  root
    .querySelectorAll<HTMLElement>("img[data-card-cover]")
    .forEach((img) => img.style.removeProperty("view-transition-name"));
}

function setCoverName(root: ParentNode, name: string | null) {
  if (!name) return;
  root
    .querySelector<HTMLElement>(`img[data-card-cover="${name}"]`)
    ?.style.setProperty("view-transition-name", name);
}

function resolveSrcset(srcset: string, baseUrl: URL): string {
  return srcset
    .split(",")
    .map((candidate) => {
      const [url, ...descriptors] = candidate.trim().split(/\s+/);
      return [
        new URL(url, baseUrl).href,
        descriptors.length > 0 ? descriptors.join(" ") : null,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join(", ");
}

function startHeroPreload(
  source: HTMLImageElement,
  name: string,
  baseUrl: URL,
): Promise<void> | null {
  const existing = heroPreloads.get(name);
  if (existing) return existing;

  const src = source.getAttribute("src");
  if (!src) return null;

  const preload = new Image();
  preload.alt = "";
  preload.decoding = "async";

  const srcset = source.getAttribute("srcset");
  preload.sizes = HERO_SIZES;
  if (srcset) preload.srcset = resolveSrcset(srcset, baseUrl);
  preload.src = new URL(src, baseUrl).href;
  const ready = preload.decode().catch(() => {
    heroPreloads.delete(name);
  });
  heroPreloads.set(name, ready);
  return ready;
}

function warmCardHero(target: EventTarget | null) {
  if (!(target instanceof Element)) return;
  const cover = target
    .closest<HTMLAnchorElement>("a[href]")
    ?.querySelector<HTMLImageElement>("img[data-card-cover]");
  const name = cover?.dataset.cardCover;
  if (!cover || !name) return;
  startHeroPreload(cover, name, new URL(document.baseURI));
}

async function preloadHeroCover(
  newDocument: Document,
  name: string,
  baseUrl: URL,
  signal: AbortSignal,
) {
  const hero = newDocument.querySelector<HTMLImageElement>(
    `img[data-post-cover="${name}"]`,
  );
  if (!hero || signal.aborted) return;
  const ready = startHeroPreload(hero, name, baseUrl);
  if (!ready) return;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let abortHandler: (() => void) | undefined;
  const stopWaiting = new Promise<void>((resolve) => {
    timeoutId = setTimeout(resolve, HERO_PRELOAD_TIMEOUT_MS);
    abortHandler = resolve;
    signal.addEventListener("abort", abortHandler, { once: true });
  });

  try {
    await Promise.race([ready, stopWaiting]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    if (abortHandler) signal.removeEventListener("abort", abortHandler);
  }
}

// Delegated listeners survive Astro client-router swaps. They warm only the
// card the visitor shows intent to open instead of downloading every hero.
document.addEventListener("pointerover", (event) => warmCardHero(event.target));
document.addEventListener("focusin", (event) => warmCardHero(event.target));
document.addEventListener("touchstart", (event) => warmCardHero(event.target), {
  passive: true,
});

document.addEventListener("astro:before-preparation", (event) => {
  // Leaving a listing for a detail page: name the matching card so its old
  // snapshot pairs with the detail hero, then preload the larger hero asset
  // after Astro has parsed the incoming page but before the swap begins.
  const preparationEvent = event as TransitionBeforePreparationEvent;
  const { to } = preparationEvent;
  const name = nameForPath(to.pathname);
  clearCoverNames(document);
  setCoverName(document, name);
  if (!name) return;

  const load = preparationEvent.loader;
  preparationEvent.loader = async () => {
    await load();
    if (preparationEvent.defaultPrevented || preparationEvent.signal.aborted) {
      return;
    }
    await preloadHeroCover(
      preparationEvent.newDocument,
      name,
      preparationEvent.to,
      preparationEvent.signal,
    );
  };
});

document.addEventListener("astro:before-swap", (event) => {
  // Returning from a detail page: name the matching card in the incoming
  // document, then drop the name once the morph has finished.
  const { from, newDocument, viewTransition } =
    event as TransitionBeforeSwapEvent;
  const name = nameForPath(from.pathname);
  if (!name) return;
  setCoverName(newDocument, name);
  viewTransition.finished.finally(() => clearCoverNames(document));
});
