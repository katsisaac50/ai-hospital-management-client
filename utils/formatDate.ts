// utils/formatDate.ts

import { formatDistanceToNow, format } from "date-fns";
import { enUS, da } from "date-fns/locale";

// You can extend this map with more locales if needed
const localeMap: Record<string, Locale> = {
  "en-US": enUS,
  "da-DK": da,
};

interface FormatDateOptions {
  locale?: string;
  includeTime?: boolean;
  relative?: boolean;
}

/**
 * Formats an ISO date string into a readable format
 */
export function formatDate(
  isoDate: string,
  options: FormatDateOptions = {}
): string {
  const { locale = "en-US", includeTime = false, relative = false } = options;

  if (!isoDate) return "Invalid date";

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "Invalid date";

  const selectedLocale = localeMap[locale] || enUS;

  if (relative) {
    return formatDistanceToNow(date, { addSuffix: true, locale: selectedLocale });
  }

  return format(
    date,
    includeTime ? "PPP p" : "PPP", // "April 29, 1934" or "April 29, 1934 12:00 PM"
    { locale: selectedLocale }
  );
}
