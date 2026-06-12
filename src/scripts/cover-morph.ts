// Purpose: Scope cover morphs to the single card involved in a navigation.
// Scope: Applies view-transition-name around client-router navigations.
// Audience: BaseLayout pages (content listings and detail routes).

import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from "astro:transitions/client";
import { coverTransitionName } from "../lib/transitions";

const COLLECTIONS = new Set(["projects", "writing", "reviews"]);

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

document.addEventListener("astro:before-preparation", (event) => {
  // Leaving a listing for a detail page: name the matching card so its old
  // snapshot pairs with the detail hero.
  const { to } = event as TransitionBeforePreparationEvent;
  clearCoverNames(document);
  setCoverName(document, nameForPath(to.pathname));
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
