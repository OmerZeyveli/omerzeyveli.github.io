// Purpose: Build shared view-transition names for cover-image morphs.
// Scope: Helper pairing listing-card covers with detail-page heroes.
// Audience: Page routes that render content cards and PostLayout.

/**
 * Returns the view-transition-name shared by an entry's card cover and its
 * detail-page hero, sanitized to a valid CSS custom-ident.
 */
export function coverTransitionName(collection: string, id: string): string {
  return `cover-${collection}-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
