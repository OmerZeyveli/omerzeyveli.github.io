const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date): string {
  return displayDateFormatter.format(date);
}
