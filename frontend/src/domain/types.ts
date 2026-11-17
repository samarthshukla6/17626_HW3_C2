export type Parent = "Melissa" | "Jason";

export type RequestStatus = "Pending" | "Agreed" | "Declined" | "Withdrawn" | "Lapsed";

export type EmergencyTag = "illness" | "emergency";

export type EventType =
  | "create"
  | "edit"
  | "withdraw"
  | "accept"
  | "decline"
  | "follow-up"
  | "dispute-note"
  | "delivered"
  | "read"
  | "delivery-failed";

export interface CreatePayload {
  affectedScheduleEntryId: string;
  proposedTime: string;
  alternativeTime?: string;
  reason: string;
  emergencyTag?: EmergencyTag;
  linkedFromRequestId?: string;
}

export interface EditPayload {
  proposedTime?: string;
  alternativeTime?: string;
}

export interface DeclinePayload {
  reason: string;
  alternativeTime?: string;
}

export interface TextPayload {
  text: string;
}

export type EventPayload = CreatePayload | EditPayload | DeclinePayload | TextPayload | Record<string, never>;

export interface DomainEvent {
  id: string;
  type: EventType;
  author: Parent;
  requestId: string;
  /** Server clock value when the server received this action (REQ-09). */
  serverTime: string;
  /** Device-clock value when the acting parent wrote it; absent on system-authored events. */
  writtenTime?: string;
  /** Only on delivered/read/delivery-failed: which event this refers to. */
  targetEventId?: string;
  payload: EventPayload;
}

export interface ScheduleEntry {
  id: string;
  startDateTime: string;
  location: string;
  whoseTimeBegins: Parent;
  /** T067: distinguishes a pickup from a drop-off for display wording. */
  kind?: "pickup" | "dropoff";
}

export function otherParent(parent: Parent): Parent {
  return parent === "Melissa" ? "Jason" : "Melissa";
}
