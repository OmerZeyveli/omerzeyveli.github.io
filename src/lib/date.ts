// Purpose: Format dates for display.
// Scope: Shared date formatting helper.
// Audience: Pages and components showing dates.
const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date): string {
  return displayDateFormatter.format(date);
}
