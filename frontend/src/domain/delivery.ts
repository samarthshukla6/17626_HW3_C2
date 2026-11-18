import { appendEvent, getEvents } from "./events";
import { getServerTime } from "./clock";
import { isOnline } from "./offlineQueue";
import { otherParent } from "./types";
import type { DomainEvent, Parent } from "./types";

let pendingFailures = 0;

/** Demo Controls: the next item that would be delivered fails instead. */
export function failNextDelivery(): void {
  pendingFailures += 1;
}

export type DeliveryState = "waiting" | "waiting-offline" | "delivered" | "read" | "not-delivered";

/**
 * Called right after an item event (create/edit/withdraw/accept/decline/
 * follow-up/dispute-note) is appended, to simulate it reaching the other
 * parent's app (REQ-09). If the recipient is offline, nothing is recorded
 * yet — flushDeliveryTo (called when they come back online) does it then.
 */
export function deliverItem(itemEvent: DomainEvent, recipient: Parent): void {
  if (!isOnline(recipient)) {
    return;
  }
  const now = getServerTime().toISOString();
  if (pendingFailures > 0) {
    pendingFailures -= 1;
    appendEvent({
      type: "delivery-failed",
      author: recipient,
      requestId: itemEvent.requestId,
      serverTime: now,
      targetEventId: itemEvent.id,
      payload: {},
    });
    return;
  }
  appendEvent({
    type: "delivered",
    author: recipient,
    requestId: itemEvent.requestId,
    serverTime: now,
    targetEventId: itemEvent.id,
    payload: {},
  });
}

/** Delivers every not-yet-delivered item addressed to `recipient` (called on reconnect). */
export function flushDeliveryTo(recipient: Parent): void {
  const events = getEvents();
  const items = events.filter(
    (e) => e.author !== recipient && !["delivered", "read", "delivery-failed"].includes(e.type),
  );
  for (const item of items) {
    const alreadyHandled = events.some(
      (e) => e.targetEventId === item.id && (e.type === "delivered" || e.type === "delivery-failed"),
    );
    if (!alreadyHandled) {
      deliverItem(item, recipient);
    }
  }
}

/** REQ-09: one read event per item, only after it has been delivered. */
export function markRead(itemEventId: string, reader: Parent): void {
  const events = getEvents();
  const item = events.find((e) => e.id === itemEventId);
  if (!item) {
    return;
  }
  const delivered = events.some((e) => e.type === "delivered" && e.targetEventId === itemEventId);
  const alreadyRead = events.some((e) => e.type === "read" && e.targetEventId === itemEventId);
  if (!delivered || alreadyRead) {
    return;
  }
  appendEvent({
    type: "read",
    author: reader,
    requestId: item.requestId,
    serverTime: getServerTime().toISOString(),
    targetEventId: itemEventId,
    payload: {},
  });
}

/** F-5: the sender may retry a recorded failure; history remains append-only. */
export function retryDelivery(itemEventId: string, sender: Parent): boolean {
  const item = getEvents().find((e) => e.id === itemEventId);
  if (!item || item.author !== sender || getDeliveryState(itemEventId) !== "not-delivered") {
    return false;
  }
  deliverItem(item, otherParent(sender));
  return getDeliveryState(itemEventId) === "delivered";
}

export function getDeliveryState(itemEventId: string): DeliveryState {
  const events = getEvents();
  const tracking = events.filter((e) => e.targetEventId === itemEventId);
  const latest = tracking.at(-1);
  if (latest?.type === "read") return "read";
  if (latest?.type === "delivered") return "delivered";
  if (latest?.type === "delivery-failed") return "not-delivered";

  const item = events.find((e) => e.id === itemEventId);
  if (item && !isOnline(otherParent(item.author))) {
    return "waiting-offline";
  }
  return "waiting";
}

export function _resetDelivery(): void {
  pendingFailures = 0;
}
