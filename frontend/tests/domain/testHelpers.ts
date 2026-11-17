import { _resetLog } from "../../src/domain/events";
import { setServerTime, setDeviceClockOffset } from "../../src/domain/clock";
import { setScheduleEntries } from "../../src/domain/schedule";
import { _resetRequestIdCounter } from "../../src/domain/requests";
import { _resetOfflineQueue } from "../../src/domain/offlineQueue";
import { _resetDelivery } from "../../src/domain/delivery";
import type { ScheduleEntry } from "../../src/domain/types";

/** Resets every piece of domain state a test depends on, in one call. */
export function resetDomain(entries: ScheduleEntry[], serverTimeIso: string): void {
  _resetLog();
  _resetRequestIdCounter();
  _resetOfflineQueue();
  _resetDelivery();
  setScheduleEntries(entries);
  setServerTime(serverTimeIso);
  setDeviceClockOffset("Melissa", 0);
  setDeviceClockOffset("Jason", 0);
}

export const FRI_20_NOV: ScheduleEntry = {
  id: "fri-20-nov",
  startDateTime: "2026-11-20T18:00:00.000Z",
  location: "school parking area",
  whoseTimeBegins: "Jason",
};
