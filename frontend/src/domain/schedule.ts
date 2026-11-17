import type { ScheduleEntry } from "./types";

/**
 * Original-plan entries (REQ-01) are static seed data, not event-sourced —
 * they can never be edited or deleted, so there is nothing for an event to
 * record about them changing. This module just holds the current set so
 * requests.ts and record.ts can look entries up by id.
 */
let entries: ScheduleEntry[] = [];

export function setScheduleEntries(next: ScheduleEntry[]): void {
  entries = next;
}

export function getScheduleEntries(): ScheduleEntry[] {
  return entries;
}

export function getScheduleEntry(id: string): ScheduleEntry | undefined {
  return entries.find((e) => e.id === id);
}

export function _resetScheduleEntries(): void {
  entries = [];
}
