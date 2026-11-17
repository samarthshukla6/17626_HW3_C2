import { _getRawLog, _restoreLog, _resetLog } from "./events";
import { _getClockState, _restoreClockState, setServerTime } from "./clock";
import { _getOfflineState, _restoreOfflineState, _resetOfflineQueue } from "./offlineQueue";
import { onChange } from "./changeBus";
import { MOCK_START_SERVER_TIME } from "./mockData";
import type { DomainEvent, EventPayload, EventType, Parent } from "./types";

/**
 * One versioned localStorage key holding everything the client persists.
 * A single key keeps "Reset demo data" atomic (research.md).
 */
export const STORAGE_KEY = "coparent-record:v1";

interface PersistedState {
  version: 1;
  events: DomainEvent[];
  clock: {
    serverTimeMs: number;
    deviceOffsetMinutes: Record<Parent, number>;
  };
  offline: {
    onlineState: Record<Parent, boolean>;
    queue: { parent: Parent; requestId: string; type: EventType; payload: EventPayload; writtenTime: string }[];
    serverUnreachable: boolean;
  };
}

export function saveState(): void {
  const state: PersistedState = {
    version: 1,
    events: [..._getRawLog()],
    clock: _getClockState(),
    offline: _getOfflineState(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }
  const state = JSON.parse(raw) as PersistedState;
  _restoreLog(state.events);
  _restoreClockState(state.clock);
  if (state.offline) {
    _restoreOfflineState(state.offline);
  }
}

/** Clears the key and reseeds from mockData.ts (A-6). */
export function resetDemoData(): void {
  _resetLog();
  _resetOfflineQueue();
  setServerTime(MOCK_START_SERVER_TIME);
  saveState();
}

/**
 * T058: every domain action (events.ts's appendEvent) and every Demo
 * Controls change (clock.ts, offlineQueue.ts) notifies this listener, so a
 * reload keeps the event log, clocks, online flags, and offline queue -
 * state used to be saved only on reset.
 */
onChange(saveState);
