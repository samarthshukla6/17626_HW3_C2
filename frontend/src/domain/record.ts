import { getEvents } from "./events";
import { getServerTime } from "./clock";
import { formatTime } from "./format";
import { getScheduleEntries, getScheduleEntry } from "./schedule";
import { getChangeRequest, listRequestsFor } from "./requests";
import type { ChangeRequestView } from "./requests";
import { strings } from "../copy/strings";
import type { CreatePayload, DomainEvent, EditPayload, Parent, ScheduleEntry } from "./types";

export interface ScheduleRow {
  entry: ScheduleEntry;
  pendingLabel?: string;
  agreedChange?: { label: string; request: ChangeRequestView };
}

function requestsForEntry(entryId: string): ChangeRequestView[] {
  const createEvents = getEvents().filter((e) => e.type === "create");
  const ids = Array.from(new Set(createEvents.map((e) => e.requestId)));
  return ids
    .map((id) => getChangeRequest(id))
    .filter((r): r is ChangeRequestView => !!r && r.affectedScheduleEntryId === entryId);
}

/** REQ-01, REQ-07: every original-plan entry by date, with any Pending marker
 * or agreed change shown next to it. */
export function getSchedule(): ScheduleRow[] {
  return getScheduleEntries().map((entry) => {
    const requests = requestsForEntry(entry.id);
    const pending = requests.find((r) => r.status === "Pending");
    const agreed = requests.find((r) => r.status === "Agreed");

    return {
      entry,
      pendingLabel: pending ? strings.changeProposedWaiting() : undefined,
      agreedChange: agreed
        ? { label: strings.agreedChangeLabel(), request: agreed }
        : undefined,
    };
  });
}

export interface HomeSummary {
  nextExchange?: ScheduleEntry;
  waitingOnYou: ChangeRequestView[];
  pendingInvolvingYou: ChangeRequestView[];
}

/** REQ-02: the first screen's content. */
export function getHomeSummary(parent: Parent): HomeSummary {
  const now = getServerTime();
  const entries = [...getScheduleEntries()].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );
  const nextExchange = entries.find((e) => new Date(e.startDateTime).getTime() > now.getTime());

  const myRequests = listRequestsFor(parent);
  const waitingOnYou = myRequests.filter((r) => r.responder === parent && r.status === "Pending");
  const pendingInvolvingYou = myRequests.filter((r) => r.status === "Pending");

  return { nextExchange, waitingOnYou, pendingInvolvingYou };
}

/** REQ-02 (History area): every Case Record Entry, in time order. */
export function getHistory(): DomainEvent[] {
  return [...getEvents()].sort(
    (a, b) => new Date(a.serverTime).getTime() - new Date(b.serverTime).getTime(),
  );
}

export interface TimelineItem {
  event: DomainEvent;
  description: string;
}

export interface EventTimeline {
  entry: ScheduleEntry;
  items: TimelineItem[];
}

function describeEvents(requestId: string, events: DomainEvent[]): TimelineItem[] {
  const requestView = getChangeRequest(requestId);
  const responder = requestView?.responder;
  const items: TimelineItem[] = [];
  let currentProposedTime: string | undefined;
  let readByResponder = false;

  for (const event of events) {
    switch (event.type) {
      case "create": {
        currentProposedTime = (event.payload as CreatePayload).proposedTime;
        items.push({ event, description: `${event.author} created a request` });
        break;
      }
      case "edit": {
        const payload = event.payload as EditPayload;
        if (payload.proposedTime !== undefined && currentProposedTime !== undefined) {
          let description = strings.editedBy(
            event.author,
            formatTime(event.serverTime),
            formatTime(currentProposedTime),
            formatTime(payload.proposedTime),
          );
          if (readByResponder && responder) {
            description = `${description} ${strings.editedAfterRead(responder)}`;
          }
          items.push({ event, description });
          currentProposedTime = payload.proposedTime;
        } else {
          items.push({ event, description: `${event.author} edited the request` });
        }
        break;
      }
      case "read":
        if (event.author === responder) {
          readByResponder = true;
        }
        items.push({ event, description: `${event.author} read it` });
        break;
      case "accept":
        items.push({ event, description: `${event.author} accepted` });
        break;
      case "decline":
        items.push({ event, description: `${event.author} declined` });
        break;
      case "withdraw":
        items.push({ event, description: `${event.author} withdrew the request` });
        break;
      case "follow-up":
        items.push({ event, description: `${event.author} added a follow-up` });
        break;
      case "dispute-note":
        items.push({ event, description: `${event.author} disputed the emergency claim` });
        break;
      case "delivered":
        items.push({ event, description: "Delivered" });
        break;
      case "delivery-failed":
        items.push({ event, description: strings.notDelivered() });
        break;
    }
  }

  return items;
}

/** REQ-13: one event's whole history, in time order, in one view. */
export function getEventTimeline(scheduleEntryId: string): EventTimeline | undefined {
  const entry = getScheduleEntry(scheduleEntryId);
  if (!entry) {
    return undefined;
  }

  const requests = requestsForEntry(scheduleEntryId);
  const requestIds = new Set(requests.map((r) => r.id));
  const events = getEvents().filter((e) => requestIds.has(e.requestId));
  const sorted = [...events].sort(
    (a, b) => new Date(a.serverTime).getTime() - new Date(b.serverTime).getTime(),
  );

  // Multiple requests can target one entry over time (e.g. a declined
  // original plus its linked alternative) - describe each request's events
  // with its own responder context, then merge back into time order.
  const merged = [...requestIds]
    .flatMap((id) => describeEvents(id, sorted.filter((e) => e.requestId === id)))
    .sort((a, b) => new Date(a.event.serverTime).getTime() - new Date(b.event.serverTime).getTime());

  return { entry, items: merged };
}
