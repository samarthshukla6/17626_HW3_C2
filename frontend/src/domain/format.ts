const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Formats a date/ISO string as "Fri 20 Nov 18:00" (UTC, matching spec.md's examples). */
export function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const weekday = WEEKDAYS[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  return `${weekday} ${day} ${month} ${time}`;
}

/** Formats just the time portion, "18:00" (UTC). */
export function formatTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/** Formats just the date portion, "Sat 21 Nov" (UTC, no time or year). */
export function formatDateOnly(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const weekday = WEEKDAYS[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  return `${weekday} ${day} ${month}`;
}

/**
 * T063: an `<input type="datetime-local">` gives a plain "YYYY-MM-DDTHH:mm"
 * string with no timezone. `new Date(value)` on that string parses it in
 * the browser's local timezone, so 18:00 typed in New York becomes 23:00
 * UTC once formatted back (everything else in this app is shown in UTC).
 * This treats the digits the parent typed as UTC directly, so what they
 * type is what they see, regardless of the browser's timezone.
 */
export function parseLocalInputAsUTC(value: string): string {
  if (!value) {
    return "";
  }
  const hasZone = /Z$|[+-]\d\d:\d\d$/.test(value);
  const asUtc = hasZone ? value : `${value}Z`;
  return new Date(asUtc).toISOString();
}
