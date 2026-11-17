import type { ScheduleEntry } from "./types";

/**
 * A-6: Melissa has primary custody; Jason has alternating weekends. Each of
 * Jason's weekends is two exchanges - a Friday 18:00 pickup ("Jason's
 * weekend begins") and a Sunday 18:00 drop-off ("Melissa's time begins") -
 * both at the school parking area. Only the invented names Melissa and
 * Jason are used, with no real contact details (NFR-02).
 */
export const MOCK_START_SERVER_TIME = "2026-11-16T09:00:00.000Z";

const FIRST_PICKUP_FRIDAY = "2026-11-20T18:00:00.000Z";
const JASON_WEEKEND_COUNT = 10;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function buildMockSchedule(): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  const firstPickup = new Date(FIRST_PICKUP_FRIDAY).getTime();

  for (let i = 0; i < JASON_WEEKEND_COUNT; i += 1) {
    const pickup = firstPickup + i * TWO_WEEKS_MS;
    const dropoff = pickup + TWO_DAYS_MS;

    entries.push({
      id: `weekend-${i + 1}-pickup`,
      startDateTime: new Date(pickup).toISOString(),
      location: "school parking area",
      whoseTimeBegins: "Jason",
      kind: "pickup",
    });
    entries.push({
      id: `weekend-${i + 1}-dropoff`,
      startDateTime: new Date(dropoff).toISOString(),
      location: "school parking area",
      whoseTimeBegins: "Melissa",
      kind: "dropoff",
    });
  }

  return entries;
}
