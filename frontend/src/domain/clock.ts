import { notifyChange } from "./changeBus";
import type { Parent } from "./types";

/**
 * The simulated server clock and each parent's device-clock offset.
 * Domain code never calls Date.now() or `new Date()` with no argument —
 * every timestamp traces back to one of these two functions.
 */
let serverTimeMs = Date.parse("2026-11-16T09:00:00.000Z");
const deviceOffsetMinutes: Record<Parent, number> = { Melissa: 0, Jason: 0 };

export function getServerTime(): Date {
  return new Date(serverTimeMs);
}

export function setServerTime(to: Date | string): void {
  serverTimeMs = typeof to === "string" ? Date.parse(to) : to.getTime();
  notifyChange();
}

export function advanceServerTime(byMinutes: number): void {
  serverTimeMs += byMinutes * 60_000;
  notifyChange();
}

export function getDeviceTime(parent: Parent): Date {
  return new Date(serverTimeMs + deviceOffsetMinutes[parent] * 60_000);
}

export function setDeviceClockOffset(parent: Parent, minutes: number): void {
  deviceOffsetMinutes[parent] = minutes;
  notifyChange();
}

export function getDeviceClockOffset(parent: Parent): number {
  return deviceOffsetMinutes[parent];
}

/** Whole hours, rounded down, between two instants (FR-004). */
export function wholeHoursBetween(end: Date, start: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 3_600_000);
}

/** For store.ts persistence only. */
export function _getClockState(): { serverTimeMs: number; deviceOffsetMinutes: Record<Parent, number> } {
  return { serverTimeMs, deviceOffsetMinutes: { ...deviceOffsetMinutes } };
}

export function _restoreClockState(state: {
  serverTimeMs: number;
  deviceOffsetMinutes: Record<Parent, number>;
}): void {
  serverTimeMs = state.serverTimeMs;
  deviceOffsetMinutes.Melissa = state.deviceOffsetMinutes.Melissa;
  deviceOffsetMinutes.Jason = state.deviceOffsetMinutes.Jason;
}
