import { notifyChange } from "./changeBus";
import type { DomainEvent } from "./types";

let log: DomainEvent[] = [];
let nextId = 1;

/**
 * The only way an event is ever added. There is no update or delete function
 * in this module — REQ-11 requires the log to be append-only.
 */
export function appendEvent(input: Omit<DomainEvent, "id">): DomainEvent {
  const event: DomainEvent = { ...input, id: `evt-${nextId}` };
  nextId += 1;
  log = [...log, event];
  notifyChange();
  return event;
}

export function getEvents(requestId?: string): DomainEvent[] {
  return requestId ? log.filter((e) => e.requestId === requestId) : log;
}

/** For store.ts persistence only. */
export function _getRawLog(): readonly DomainEvent[] {
  return log;
}

export function _restoreLog(events: DomainEvent[]): void {
  log = events;
  const maxExisting = events.reduce((max, e) => {
    const n = Number(e.id.replace("evt-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  nextId = maxExisting + 1;
}

export function _resetLog(): void {
  log = [];
  nextId = 1;
}
