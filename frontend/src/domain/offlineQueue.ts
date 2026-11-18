import { appendEvent } from "./events";
import { getServerTime } from "./clock";
import { notifyChange } from "./changeBus";
import type { DomainEvent, EventPayload, EventType, Parent } from "./types";

interface QueuedItem {
  parent: Parent;
  requestId: string;
  type: EventType;
  payload: EventPayload;
  writtenTime: string;
}

const onlineState: Record<Parent, boolean> = { Melissa: true, Jason: true };
let queue: QueuedItem[] = [];
let serverUnreachable = false;
let onFlush: ((parent: Parent, flushed: DomainEvent[]) => void) | undefined;
let onReconnect: ((parent: Parent) => void) | undefined;

export function isOnline(parent: Parent): boolean {
  return onlineState[parent];
}

/**
 * T083 (REQ-09, F-11): lets the delivery module deliver items that were
 * waiting for this parent, once they come back online, without
 * offlineQueue.ts importing delivery.ts.
 */
export function setOnReconnect(callback: (parent: Parent) => void): void {
  onReconnect = callback;
}

/** Lets requests.ts know when a flush happens, without offlineQueue.ts importing requests.ts. */
export function setOnFlush(callback: (parent: Parent, flushed: DomainEvent[]) => void): void {
  onFlush = callback;
}

export function setOnline(parent: Parent, online: boolean): void {
  const wasOffline = !onlineState[parent];
  onlineState[parent] = online;
  notifyChange();
  if (online && wasOffline) {
    flushQueue(parent);
    onReconnect?.(parent);
  }
}

/** Demo Controls: simulate the server itself being unreachable during a flush. */
export function setServerUnreachable(unreachable: boolean): void {
  serverUnreachable = unreachable;
  notifyChange();
}

export function queueLocally(
  parent: Parent,
  requestId: string,
  type: EventType,
  payload: EventPayload,
  writtenTime: string,
): void {
  queue = [...queue, { parent, requestId, type, payload, writtenTime }];
  notifyChange();
}

export function getQueuedItems(parent?: Parent): readonly QueuedItem[] {
  return parent ? queue.filter((i) => i.parent === parent) : queue;
}

/** Replays a parent's queued items, in write order, as real events (REQ-10). */
export function flushQueue(parent: Parent): void {
  if (serverUnreachable) {
    return;
  }
  const mine = queue.filter((i) => i.parent === parent);
  const rest = queue.filter((i) => i.parent !== parent);
  queue = rest;

  const flushed: DomainEvent[] = [];
  for (const item of mine) {
    flushed.push(
      appendEvent({
        type: item.type,
        author: item.parent,
        requestId: item.requestId,
        serverTime: getServerTime().toISOString(),
        writtenTime: item.writtenTime,
        payload: item.payload,
      }),
    );
  }

  if (flushed.length > 0) {
    onFlush?.(parent, flushed);
  }
}

/** For store.ts persistence only. */
export function _getOfflineState(): {
  onlineState: Record<Parent, boolean>;
  queue: QueuedItem[];
  serverUnreachable: boolean;
} {
  return { onlineState: { ...onlineState }, queue: [...queue], serverUnreachable };
}

export function _restoreOfflineState(state: {
  onlineState: Record<Parent, boolean>;
  queue: QueuedItem[];
  serverUnreachable: boolean;
}): void {
  onlineState.Melissa = state.onlineState.Melissa;
  onlineState.Jason = state.onlineState.Jason;
  queue = state.queue;
  serverUnreachable = state.serverUnreachable;
}

export function _resetOfflineQueue(): void {
  queue = [];
  onlineState.Melissa = true;
  onlineState.Jason = true;
  serverUnreachable = false;
}
