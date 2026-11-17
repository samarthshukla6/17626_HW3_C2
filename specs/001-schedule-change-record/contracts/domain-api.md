# Domain API Contract

This is the only boundary the UI (`frontend/src/app/`) is allowed to cross to read or change
state. There is no server, so this plays the role an API contract would for a networked app:
the UI calls these functions and renders what they return; it never re-implements a rule itself
(Constitution Principle VI). Signatures are described, not written as TypeScript, exact types
are an implementation detail for the tasks/implement phases.

## Clock (`domain/clock.ts`), REQ-09

- `getServerTime() → ServerTime`, the current simulated server clock.
- `advanceServerTime(byMinutes)` / `setServerTime(to)`, Demo Controls only.
- `getDeviceTime(parent) → DeviceTime`, server time + that parent's `clockOffsetMinutes`.
- `setDeviceClockOffset(parent, minutes)`, Demo Controls only (the plan's "Jason's phone
  clock offset" control).

## Connectivity & offline queue (`domain/offlineQueue.ts`), REQ-10

- `setOnline(parent, isOnline)`, Demo Controls only.
- `isOnline(parent) → boolean`.
- `queueLocally(parent, action)`, called by a mutation function below instead of appending an
  Event, whenever `isOnline(parent)` is false. Captures `action` with the parent's current
  device time.
- `flushQueue(parent)`, called automatically when `setOnline(parent, true)` runs. Replays each
  queued action, in write order, as a real Event with `serverTime = getServerTime()` at the
  moment of replay. If the server is set as unreachable in Demo Controls, the flush fails and the
  action stays queued, unchanged, for the next flush attempt (FR-010). This is separate from a
  delivery failure to the other parent's app, which happens after the server already has the
  item (see Delivery and read below).

## Delivery and read (`domain/delivery.ts`), REQ-09

Every request (`create`), response (`accept`/`decline`), `edit`, `withdraw`, follow-up and
dispute note is an "item" that the other parent receives.

- When the server appends an item, the system records a `delivered` event for it straight away
  if the recipient is online, or at the moment the recipient next comes online. Its `serverTime`
  is that moment.
- `markRead(itemEventId, reader)`: called when the recipient opens the request or the event
  detail that shows the item. Records one `read` event per item, only after `delivered` (A-7).
- `failNextDelivery()`: Demo Controls only. The next item that would be delivered gets a
  `delivery-failed` event instead, with the server time of the failure. That item never shows
  as delivered or read in V1, and the sender sees "Not delivered" (FR-009).
- `delivered`, `read` and `delivery-failed` events carry `targetEventId`, the item they refer
  to, and are authored by the system on behalf of the recipient's app.

## Event log (`domain/events.ts`), REQ-11

- `appendEvent(event) → Event`, the only way any event is ever added. No update or delete
  function exists; there is nothing in this contract capable of mutating or removing a past
  event.
- `getEvents(requestId?) → Event[]`, all events, optionally filtered to one request, in append
  order.

## Requests (`domain/requests.ts`), REQ-03, 04, 05, 06, 07, 08, 14

- `createRequest({ author, affectedScheduleEntryId, proposedTime, alternativeTime?, reason,
  emergencyTag?, linkedFromRequestId? }) → Result<ChangeRequest, ValidationError>`
  Validates (in order): affected entry exists and hasn't started; affected entry has no current
  Pending request; `reason` non-empty. On success, routes to `appendEvent` (online) or
  `queueLocally` (offline) and returns the derived view; on failure, returns the exact copy
  string to show (from `copy/strings`), per FR-003.
- `editRequest(requestId, author, { proposedTime?, alternativeTime? }) → Result<...>`, rejects
  if `requestId` is not Pending or `author` is not its proposer; only these two fields are ever
  accepted (FR-011).
- `withdrawRequest(requestId, author) → Result<...>`, rejects unless Pending and `author` is
  the proposer.
- `respond(requestId, author, { decision: "accept" | "decline", reason?, alternativeTime? }) →
  Result<...>`, rejects if `author` is the proposer (FR-006); on `decline`, also calls
  `createRequest` for the suggested alternative if one is given, with proposer/responder
  reversed and `linkedFromRequestId` set. The new request targets the same
  `affectedScheduleEntryId`, with the suggested `alternativeTime` as its `proposedTime`.
- `addFollowUp(requestId, author, text) → Result<...>` / `addDisputeNote(requestId, author,
  text) → Result<...>`, reject empty `text` (FR-008, FR-014).
- `getChangeRequest(requestId) → ChangeRequest`, the derived view from Data Model, including
  `status`, `overdue`, and `noticeLabel`.
- `listRequestsFor(parent) → ChangeRequest[]`, every request where `parent` is proposer or
  responder.

## Record view (`domain/record.ts`), REQ-02, 13

- `getHomeSummary(parent) → { nextExchange, waitingOnYou: ChangeRequest[], pendingInvolvingYou:
  ChangeRequest[] }`: the three things FR-002 requires on the first screen. `waitingOnYou` holds
  requests where this parent is the responder; `pendingInvolvingYou` holds every Pending request
  this parent sent or received. An empty `waitingOnYou` means the UI shows "Nothing is waiting
  for you" (the UI renders the copy string, not this function).
- `getHistory() → Event[]`: every Case Record Entry in time order, for the History area (FR-002).
- `getSchedule() → ScheduleRow[]`: every original-plan entry by date, each with any Pending
  marker ("Change proposed, waiting for response") and any agreed change shown next to it as a
  separate "Agreed change" row (FR-001, FR-005, FR-007).
- `getEventTimeline(scheduleEntryId) → TimelineItem[]`, the original entry plus every request,
  response, follow-up, dispute note, and audit event for it, in time order (FR-013).

## Persistence (`domain/store.ts`), A-2, NFR-02

- `loadState()` / `saveState()`, single versioned `localStorage` key.
- `resetDemoData()`, clears that key and reseeds from `domain/mockData.ts` (A-6).

## What the UI never does

The UI never computes a status, a notice label, an overdue flag, or a timestamp label itself,
and never writes directly to `localStorage`. Every mutation goes through exactly one function
above; every read comes from `getChangeRequest`, `listRequestsFor`, `getHomeSummary`, `getSchedule`,
`getHistory` or `getEventTimeline`.
