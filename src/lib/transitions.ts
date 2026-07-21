/**
 * Returns the view-transition-name shared by an entry's card cover and its
 * detail-page hero, sanitized to a valid CSS custom-ident.
 */
export function coverTransitionName(collection: string, id: string): string {
  return `cover-${collection}-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
