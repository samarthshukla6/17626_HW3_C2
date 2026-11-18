import { appendEvent, getEvents } from "./events";
import { getServerTime, getDeviceTime, wholeHoursBetween } from "./clock";
import { getScheduleEntry } from "./schedule";
import { getQueuedItems, isOnline, queueLocally, setOnFlush, setOnReconnect } from "./offlineQueue";
import { deliverItem, flushDeliveryTo } from "./delivery";
import { strings } from "../copy/strings";
import { otherParent } from "./types";
import type {
  CreatePayload,
  DeclinePayload,
  EditPayload,
  EmergencyTag,
  Parent,
  RequestStatus,
} from "./types";

export interface ChangeRequestView {
  id: string;
  affectedScheduleEntryId: string;
  proposer: Parent;
  responder: Parent;
  proposedTime: string;
  alternativeTime?: string;
  reason: string;
  emergencyTag?: EmergencyTag;
  status?: RequestStatus;
  noticeLabel: string;
  writtenNoticeContext?: string;
  overdue: boolean;
  linkedFromRequestId?: string;
  createdServerTime: string;
  /** Set only while this request exists only on the sender's device (REQ-10). */
  savedOnDeviceWrittenTime?: string;
}

export interface ValidationError {
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: ValidationError };

export interface CreateRequestInput {
  author: Parent;
  affectedScheduleEntryId: string;
  proposedTime: string;
  alternativeTime?: string;
  reason: string;
  emergencyTag?: EmergencyTag;
  linkedFromRequestId?: string;
}

let nextRequestId = 1;

export function _resetRequestIdCounter(): void {
  nextRequestId = 1;
}

function newRequestId(): string {
  const id = `req-${nextRequestId}`;
  nextRequestId += 1;
  return id;
}

function allRequestIds(): string[] {
  const createEvents = getEvents().filter((e) => e.type === "create");
  return Array.from(new Set(createEvents.map((e) => e.requestId)));
}

/** Folds one request's events into its current, derived view (REQ-04, REQ-05, REQ-08, REQ-11). */
export function getChangeRequest(requestId: string): ChangeRequestView | undefined {
  const events = getEvents(requestId);
  const createEvt = events.find((e) => e.type === "create");
  if (!createEvt) {
    return undefined;
  }
  const createPayload = createEvt.payload as CreatePayload;
  const entry = getScheduleEntry(createPayload.affectedScheduleEntryId);
  if (!entry) {
    return undefined;
  }

  let proposedTime = createPayload.proposedTime;
  let alternativeTime = createPayload.alternativeTime;
  for (const e of events) {
    if (e.type === "edit") {
      const edit = e.payload as EditPayload;
      if (edit.proposedTime !== undefined) proposedTime = edit.proposedTime;
      if (edit.alternativeTime !== undefined) alternativeTime = edit.alternativeTime;
    }
  }

  const now = getServerTime();
  const entryStart = new Date(entry.startDateTime);
  const createdAt = new Date(createEvt.serverTime);

  const hasAccept = events.some((e) => e.type === "accept");
  const hasDecline = events.some((e) => e.type === "decline");
  const hasWithdraw = events.some((e) => e.type === "withdraw");

  let status: RequestStatus;
  if (hasAccept) status = "Agreed";
  else if (hasDecline) status = "Declined";
  else if (hasWithdraw) status = "Withdrawn";
  else if (now.getTime() >= entryStart.getTime()) status = "Lapsed";
  else status = "Pending";

  const noticeHours = wholeHoursBetween(entryStart, createdAt);
  const noticeLabel =
    noticeHours >= 48 ? strings.noticeGiven(noticeHours) : strings.shortNoticeGiven(noticeHours);
  const writtenNoticeHours = createEvt.writtenTime
    ? wholeHoursBetween(entryStart, new Date(createEvt.writtenTime))
    : noticeHours;
  const writtenNoticeContext =
    writtenNoticeHours !== noticeHours ? strings.writtenNoticeContext(writtenNoticeHours) : undefined;

  const overdue =
    status === "Pending" &&
    (wholeHoursBetween(now, createdAt) >= 48 || wholeHoursBetween(entryStart, now) < 24);

  return {
    id: requestId,
    affectedScheduleEntryId: entry.id,
    proposer: createEvt.author,
    responder: otherParent(createEvt.author),
    proposedTime,
    alternativeTime,
    reason: createPayload.reason,
    emergencyTag: createPayload.emergencyTag,
    status,
    noticeLabel,
    writtenNoticeContext,
    overdue,
    linkedFromRequestId: createPayload.linkedFromRequestId,
    createdServerTime: createEvt.serverTime,
  };
}

/**
 * T064: a request this parent submitted while offline, not yet received by
 * the server - still in their own local queue, never visible to the other
 * parent (REQ-10). Shown as Pending with `savedOnDeviceWrittenTime` set, so
 * the UI can render "Saved on this device, not sent yet" wherever it would
 * otherwise show a normal request.
 */
export function getQueuedRequestViews(parent: Parent): ChangeRequestView[] {
  return getQueuedItems(parent)
    .filter((item) => item.type === "create")
    .map((item) => {
      const payload = item.payload as CreatePayload;
      return {
        id: item.requestId,
        affectedScheduleEntryId: payload.affectedScheduleEntryId,
        proposer: item.parent,
        responder: otherParent(item.parent),
        proposedTime: payload.proposedTime,
        alternativeTime: payload.alternativeTime,
        reason: payload.reason,
        emergencyTag: payload.emergencyTag,
        status: undefined,
        noticeLabel: "",
        overdue: false,
        linkedFromRequestId: payload.linkedFromRequestId,
        createdServerTime: "",
        savedOnDeviceWrittenTime: item.writtenTime,
      };
    });
}

export function listRequestsFor(parent: Parent): ChangeRequestView[] {
  const sent = allRequestIds()
    .map((id) => getChangeRequest(id))
    .filter((r): r is ChangeRequestView => !!r && (r.proposer === parent || r.responder === parent));
  return [...sent, ...getQueuedRequestViews(parent)];
}

function pendingRequestForEntry(affectedScheduleEntryId: string): ChangeRequestView | undefined {
  return allRequestIds()
    .map((id) => getChangeRequest(id))
    .find((r): r is ChangeRequestView => !!r && r.affectedScheduleEntryId === affectedScheduleEntryId && r.status === "Pending");
}

/** REQ-03: create a change request. */
export function createRequest(input: CreateRequestInput): Result<ChangeRequestView> {
  const entry = getScheduleEntry(input.affectedScheduleEntryId);
  if (!entry) {
    return { ok: false, error: { message: "Unknown schedule entry." } };
  }

  const now = getServerTime();
  if (new Date(entry.startDateTime).getTime() <= now.getTime()) {
    return { ok: false, error: { message: strings.eventAlreadyStarted() } };
  }

  if (pendingRequestForEntry(input.affectedScheduleEntryId)) {
    return { ok: false, error: { message: strings.entryHasPendingRequest() } };
  }

  if (!input.reason || input.reason.trim() === "") {
    return { ok: false, error: { message: strings.missingReasonOnCreate() } };
  }

  const requestId = newRequestId();
  const payload: CreatePayload = {
    affectedScheduleEntryId: input.affectedScheduleEntryId,
    proposedTime: input.proposedTime,
    alternativeTime: input.alternativeTime,
    reason: input.reason,
    emergencyTag: input.emergencyTag,
    linkedFromRequestId: input.linkedFromRequestId,
  };
  const writtenTime = getDeviceTime(input.author).toISOString();

  if (!isOnline(input.author)) {
    queueLocally(input.author, requestId, "create", payload, writtenTime);
    return {
      ok: true,
      value: {
        id: requestId,
        affectedScheduleEntryId: entry.id,
        proposer: input.author,
        responder: otherParent(input.author),
        proposedTime: input.proposedTime,
        alternativeTime: input.alternativeTime,
        reason: input.reason,
        emergencyTag: input.emergencyTag,
        status: undefined,
        noticeLabel: "",
        overdue: false,
        linkedFromRequestId: input.linkedFromRequestId,
        createdServerTime: "",
        savedOnDeviceWrittenTime: writtenTime,
      },
    };
  }

  const createEvent = appendEvent({
    type: "create",
    author: input.author,
    requestId,
    serverTime: now.toISOString(),
    writtenTime,
    payload,
  });
  deliverItem(createEvent, otherParent(input.author));

  return { ok: true, value: getChangeRequest(requestId) as ChangeRequestView };
}

// T083 (REQ-09, F-11): every item a parent sent while offline is delivered
// once the server has it, not only the original request.
setOnFlush((_parent, flushed) => {
  for (const evt of flushed) {
    deliverItem(evt, otherParent(evt.author));
  }
});

// T083 (REQ-09, F-11): items that reached the server while the recipient was
// offline are delivered as soon as the recipient comes back online.
setOnReconnect((parent) => {
  flushDeliveryTo(parent);
});

export interface RespondInput {
  requestId: string;
  author: Parent;
  decision: "accept" | "decline";
  reason?: string;
  alternativeTime?: string;
}

export interface RespondResult {
  request: ChangeRequestView;
  alternative?: ChangeRequestView;
}

/** REQ-05, REQ-06: accept or decline a pending request. */
export function respond(input: RespondInput): Result<RespondResult> {
  const current = getChangeRequest(input.requestId);
  if (!current) {
    return { ok: false, error: { message: "Unknown request." } };
  }
  if (input.author === current.proposer) {
    return { ok: false, error: { message: "A parent cannot respond to their own request." } };
  }
  if (current.status !== "Pending") {
    return { ok: false, error: { message: "This request is no longer pending." } };
  }

  const now = getServerTime();
  const writtenTime = getDeviceTime(input.author).toISOString();

  if (input.decision === "accept") {
    const acceptEvent = appendEvent({
      type: "accept",
      author: input.author,
      requestId: input.requestId,
      serverTime: now.toISOString(),
      writtenTime,
      payload: {},
    });
    deliverItem(acceptEvent, current.proposer);
    return { ok: true, value: { request: getChangeRequest(input.requestId) as ChangeRequestView } };
  }

  if (!input.reason || input.reason.trim() === "") {
    return { ok: false, error: { message: strings.missingReasonOnDecline() } };
  }

  const declinePayload: DeclinePayload = { reason: input.reason, alternativeTime: input.alternativeTime };
  const declineEvent = appendEvent({
    type: "decline",
    author: input.author,
    requestId: input.requestId,
    serverTime: now.toISOString(),
    writtenTime,
    payload: declinePayload,
  });
  deliverItem(declineEvent, current.proposer);

  let alternative: ChangeRequestView | undefined;
  if (input.alternativeTime) {
    const altResult = createRequest({
      author: input.author,
      affectedScheduleEntryId: current.affectedScheduleEntryId,
      proposedTime: input.alternativeTime,
      reason: input.reason,
      linkedFromRequestId: input.requestId,
    });
    if (altResult.ok) {
      alternative = altResult.value;
    }
  }

  return {
    ok: true,
    value: { request: getChangeRequest(input.requestId) as ChangeRequestView, alternative },
  };
}

export interface EditRequestInput {
  proposedTime?: string;
  alternativeTime?: string;
}

/** REQ-11: only the proposed time / alternative can ever be edited, while Pending. */
export function editRequest(requestId: string, author: Parent, input: EditRequestInput): Result<ChangeRequestView> {
  const current = getChangeRequest(requestId);
  if (!current) {
    return { ok: false, error: { message: "Unknown request." } };
  }
  if (author !== current.proposer) {
    return { ok: false, error: { message: "Only the sender can edit this request." } };
  }
  if (current.status !== "Pending") {
    return { ok: false, error: { message: "This request is no longer pending." } };
  }

  const payload: EditPayload = {};
  if (input.proposedTime !== undefined) payload.proposedTime = input.proposedTime;
  if (input.alternativeTime !== undefined) payload.alternativeTime = input.alternativeTime;

  const editEvent = appendEvent({
    type: "edit",
    author,
    requestId,
    serverTime: getServerTime().toISOString(),
    writtenTime: getDeviceTime(author).toISOString(),
    payload,
  });
  deliverItem(editEvent, otherParent(author));

  return { ok: true, value: getChangeRequest(requestId) as ChangeRequestView };
}

/** REQ-08, REQ-11: a written follow-up linked to a still-pending request. */
export function addFollowUp(requestId: string, author: Parent, text: string): Result<ChangeRequestView> {
  const current = getChangeRequest(requestId);
  if (!current) {
    return { ok: false, error: { message: "Unknown request." } };
  }
  if (!text || text.trim() === "") {
    return { ok: false, error: { message: "Add text for the follow-up." } };
  }

  const followUpEvent = appendEvent({
    type: "follow-up",
    author,
    requestId,
    serverTime: getServerTime().toISOString(),
    writtenTime: getDeviceTime(author).toISOString(),
    payload: { text },
  });
  deliverItem(followUpEvent, otherParent(author));

  return { ok: true, value: getChangeRequest(requestId) as ChangeRequestView };
}

/** REQ-14: a written note disputing an emergency claim. */
export function addDisputeNote(requestId: string, author: Parent, text: string): Result<ChangeRequestView> {
  const current = getChangeRequest(requestId);
  if (!current) {
    return { ok: false, error: { message: "Unknown request." } };
  }
  if (!text || text.trim() === "") {
    return { ok: false, error: { message: "Add text for the dispute note." } };
  }

  const disputeEvent = appendEvent({
    type: "dispute-note",
    author,
    requestId,
    serverTime: getServerTime().toISOString(),
    writtenTime: getDeviceTime(author).toISOString(),
    payload: { text },
  });
  deliverItem(disputeEvent, otherParent(author));

  return { ok: true, value: getChangeRequest(requestId) as ChangeRequestView };
}

/** REQ-05: the sending parent may withdraw while still Pending. */
export function withdrawRequest(requestId: string, author: Parent): Result<ChangeRequestView> {
  const current = getChangeRequest(requestId);
  if (!current) {
    return { ok: false, error: { message: "Unknown request." } };
  }
  if (author !== current.proposer) {
    return { ok: false, error: { message: "Only the sender can withdraw this request." } };
  }
  if (current.status !== "Pending") {
    return { ok: false, error: { message: "This request is no longer pending." } };
  }

  const now = getServerTime();
  const withdrawEvent = appendEvent({
    type: "withdraw",
    author,
    requestId,
    serverTime: now.toISOString(),
    writtenTime: getDeviceTime(author).toISOString(),
    payload: {},
  });
  deliverItem(withdrawEvent, otherParent(author));

  return { ok: true, value: getChangeRequest(requestId) as ChangeRequestView };
}
