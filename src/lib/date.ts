import { siteConfig } from "../config/site";

const displayDateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date): string {
  return displayDateFormatter.format(date);
}
