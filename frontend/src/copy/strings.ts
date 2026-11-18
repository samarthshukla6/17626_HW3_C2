import type { EventType, Parent } from "../domain/types";

/**
 * FR-012's closed banned-word list. Every string this module exports is
 * checked against it (tests/domain/strings.test.ts, tests/domain/req-12.test.ts).
 * "overdue" describes the request, not a person, and is allowed.
 */
export const BANNED_WORDS = [
  "late",
  "unreliable",
  "failed",
  "ignored",
  "refused",
  "missed",
  "no-show",
] as const;

export const strings = {
  nothingWaiting: (): string => "Nothing is waiting for you.",

  waitingForYou: (otherParent: Parent, date: string): string =>
    `Waiting for you: respond to ${otherParent}'s request for ${date}`,

  nextExchange: (
    dateTime: string,
    location: string,
    whoseTimeBegins: Parent,
    kind: "pickup" | "dropoff" = "pickup",
  ): string =>
    kind === "dropoff"
      ? `Next exchange: ${dateTime}, ${location}, ${whoseTimeBegins}'s time begins`
      : `Next exchange: ${dateTime}, ${location}, ${whoseTimeBegins}'s weekend begins`,

  missingReasonOnCreate: (): string => "Add a reason for the change",

  missingReasonOnDecline: (): string => "Add a reason for declining",

  eventAlreadyStarted: (): string => "This exchange has already started, so it can't be changed.",

  entryHasPendingRequest: (): string =>
    "This exchange already has a pending request. It needs a response or a withdrawal first.",

  changeProposedWaiting: (): string => "Change proposed, waiting for response",

  agreedChangeLabel: (): string => "Agreed change",

  changedByAgreementOriginalKept: (): string => "Changed by agreement, original kept",

  noticeGiven: (hours: number): string => `${hours} h notice at server`,

  shortNoticeGiven: (hours: number): string =>
    `Short notice: ${hours} h at server (plan asks for 48 h)`,

  writtenNoticeContext: (hours: number): string =>
    `Written ${hours} h before (device time, not verified)`,

  overdueFlag: (): string => "Awaiting response, overdue",

  lapsedMessage: (): string => "No response before the exchange, original schedule applied.",

  savedOnDeviceNotSentYet: (): string => "Saved on this device, not sent yet",

  notSentYet: (): string => "Not sent yet",

  waitingForOfflineParent: (): string => "Waiting to be delivered (other parent offline)",

  waitingForDelivery: (): string => "Waiting to be delivered",

  requestSubmitted: (): string => "Request submitted",

  notDelivered: (): string => "Not delivered",

  deliveredAt: (time: string): string => `Delivered ${time}`,

  readAt: (time: string): string => `Read ${time}`,

  notDeliveredAt: (time: string): string => `Not delivered ${time}`,

  /**
   * T066: a neutral label for an item in a request's list, replacing the
   * raw event type ("create", "accept", ...). Covers every item type REQ-09
   * tracks delivery/read for (create, accept, decline, edit, withdraw,
   * follow-up, dispute-note) - "delivered"/"read"/"delivery-failed" are
   * never themselves "items" shown this way.
   */
  itemLabel: (type: EventType, author: Parent): string => {
    switch (type) {
      case "create":
        return `Request sent by ${author}`;
      case "accept":
        return `Accepted by ${author}`;
      case "decline":
        return `Declined by ${author}`;
      case "edit":
        return `Edited by ${author}`;
      case "withdraw":
        return `Withdrawn by ${author}`;
      case "follow-up":
        return `Follow-up from ${author}`;
      case "dispute-note":
        return `Dispute note from ${author}`;
      default:
        return `${author} - ${type}`;
    }
  },

  /**
   * T086 (REQ-02, REQ-11, REQ-12, F-14): readable, neutral label for every
   * entry in the History area, including the delivery and read entries,
   * which are authored on behalf of the recipient's app.
   */
  historyLabel: (type: EventType, author: Parent): string => {
    switch (type) {
      case "delivered":
        return `Delivered to ${author}`;
      case "read":
        return `Read by ${author}`;
      case "delivery-failed":
        return `Not delivered to ${author}`;
      default:
        return strings.itemLabel(type, author);
    }
  },

  // Step 6b visual redesign: labels for the dashboard layout. Kept here so
  // the FR-012 banned-word scan covers them too.
  appName: (): string => "CoParent Record",
  appTagline: (): string => "Shared custody schedule",
  greeting: (viewer: Parent): string => `Hi ${viewer}`,
  viewTitle: (view: string): string =>
    ({ home: "Overview", schedule: "Schedule", requests: "Requests", history: "History", eventDetail: "Exchange history" })[view] ?? view,
  serverTimeChip: (time: string): string => `Server time ${time}`,
  connectionChip: (online: boolean): string => (online ? "Online" : "Offline"),
  nextExchangeTitle: (): string => "Coming up",
  waitingTitle: (): string => "Waiting for you",
  otherPendingTitle: (): string => "Other pending requests",
  calendarTitle: (): string => "Custody calendar",
  activityTitle: (): string => "Recent activity",
  noActivity: (): string => "Nothing has happened yet.",
  timeUntil: (days: number, hours: number): string =>
    days > 0 ? `in ${days} d ${hours} h` : hours > 0 ? `in ${hours} h` : "starting now",
  parentsTime: (parent: Parent): string => `${parent}'s time`,
  calendarExchange: (): string => "Exchange",
  calendarChange: (): string => "Agreed change",
  calendarPending: (): string => "Change proposed",
  openHistoryFor: (): string => "Exchange history",

  writtenDeviceTime: (time: string): string => `Written ${time} (device time, not verified)`,

  receivedByServer: (time: string): string => `Received by server ${time}`,

  editedBy: (author: Parent, time: string, oldProposedTime: string, newProposedTime: string): string =>
    `Edited by ${author} at ${time}: proposed time ${oldProposedTime} to ${newProposedTime}`,

  editedAfterRead: (reader: Parent): string => `Edited after ${reader} read it`,

  emergencyClaimedBy: (parent: Parent): string => `Emergency claimed by ${parent}`,

  agreedByBothParents: (dateTime: string): string => `Moved to ${dateTime}, agreed by both parents`,

  originalPlanEntry: (
    dateTime: string,
    whoseTimeBegins: Parent,
    kind: "pickup" | "dropoff" = "pickup",
  ): string =>
    kind === "dropoff"
      ? `${dateTime}, drop-off, ${whoseTimeBegins}'s time begins (court plan)`
      : `${dateTime}, ${whoseTimeBegins}'s weekend (court plan)`,

  demoControlsLabel: (): string => "Demo controls (testing aid, not part of the product)",
};
