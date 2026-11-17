/**
 * T058: a tiny pub/sub so every domain mutation and every Demo Controls
 * change can trigger a save, without events.ts/clock.ts/offlineQueue.ts/
 * delivery.ts importing store.ts directly (which would be circular, since
 * store.ts already imports from all of them to read/restore their state).
 */
type Listener = () => void;

let listeners: Listener[] = [];

export function onChange(listener: Listener): void {
  listeners.push(listener);
}

export function notifyChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function _resetChangeBus(): void {
  listeners = [];
}
