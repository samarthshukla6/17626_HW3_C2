# Data Model: Schedule Change & Trusted Record

Everything here lives in the domain layer (`frontend/src/domain/`), framework-free, and is the
only state the UI ever reads. Fields are described by name and meaning, not as TypeScript source
,  the implementation types belong to the implementation phase, not this plan.

## Event (Case Record Entry)

The one append-only record. Nothing else in this model is persisted independently of it, except
the Original Schedule Entry (immutable seed data) and the small set of simulated-hardware state
listed under Clocks & Connectivity below.

| Field | Meaning |
|---|---|
| `id` | Unique, assigned on append; never reused. |
| `type` | One of: `create`, `edit`, `withdraw`, `accept`, `decline`, `follow-up`, `dispute-note`, `delivered`, `read`, `delivery-failed`. |
| `author` | Melissa or Jason, whichever parent performed the action. |
| `requestId` | Which Change Request thread this event belongs to. |
| `serverTime` | The simulated server clock's value at the moment the server received this action. Authoritative (REQ-09). |
| `writtenTime` | Present on every parent action (`create`, `edit`, `withdraw`, `accept`, `decline`, `follow-up`, `dispute-note`), since FR-009 covers responses too: the acting parent's device-clock time when they wrote it, always rendered labelled "device time, not verified" (REQ-09). |
| `targetEventId` | Only on `delivered`, `read` and `delivery-failed`: the item event they refer to (FR-009). |
| `payload` | Type-specific data (see below). |

**Rule**: once appended, an event's fields are never changed and the event is never removed
(REQ-11, Constitution Principle III). A correction is always a new event, not a mutation.

Type-specific payload:

- `create`: `affectedScheduleEntryId`, `proposedTime`, `alternativeTime?`, `reason`,
  `emergencyTag?` (`illness` | `emergency`), `linkedFromRequestId?` (set when this request is the
  alternative created by a decline, per Clarifications/A-10).
- `edit`: `proposedTime?`, `alternativeTime?`, only these two fields are ever present; an edit
  event never carries a changed `reason`, `affectedScheduleEntryId`, or `emergencyTag` (FR-011).
- `decline`: `reason`, `alternativeTime?` (if the responder suggests one).
- `follow-up` / `dispute-note`: `text` (non-empty).
- `accept`, `withdraw`, `delivered`, `read`, `delivery-failed`: no extra payload beyond the
  common fields and `targetEventId` (a `delivery-failed` event's `serverTime` is the failure's server time, per
  FR-009).

## Original Schedule Entry

Static seed data (A-6), not event-sourced, it can never be edited or deleted (FR-001), so there
is nothing for an event to record about it changing.

| Field | Meaning |
|---|---|
| `id` | Stable identifier for the exchange. |
| `startDateTime` | When this exchange starts (e.g., Fri 20 Nov 2026 18:00). |
| `location` | E.g., "school parking area". |
| `whoseTimeBegins` | Which parent's time this starts. |

## Change Request (derived view)

Not stored directly. Built by folding every `Event` with a matching `requestId`, starting from
its `create` event, plus the current server time (for overdue/lapsed derivation).

| Field | Derivation |
|---|---|
| `id` | The shared `requestId` of its events. |
| `affectedScheduleEntryId`, `proposer`, `reason`, `emergencyTag?` | From the `create` event; fixed for the request's lifetime (FR-011). |
| `responder` | The other parent (FR-006: a parent cannot respond to their own request). |
| `proposedTime`, `alternativeTime?` | From the `create` event, overridden by the latest `edit` event if one exists (FR-011). |
| `noticeLabel` | Computed once from the `create` event's `serverTime` vs. the affected entry's `startDateTime` (FR-004); never recomputed by a later `edit` (Key Entities). |
| `status` | See state machine below. |
| `linkedFromRequestId?` / `linkedAlternativeRequestId?` | Set when this request is the product of, or produced, a decline-with-alternative (Clarifications). |
| `overdue` | Derived flag (not a status): true while `status` is Pending and either 48h have passed since `serverTime` of `create`, or the affected entry's `startDateTime` is under 24h away (FR-008, working assumption A-4). |

### Status state machine (FR-005)

```text
Pending ──accept──────────────────────────────▶ Agreed      (terminal)
Pending ──decline────────────────────────────▶ Declined    (terminal; a suggested
                                                             alternative becomes a
                                                             brand-new, separate
                                                             Pending request, Clarifications)
Pending ──withdraw (sender only)─────────────▶ Withdrawn   (terminal)
Pending ──[serverClock ≥ affected entry's start, still Pending]──▶ Lapsed (terminal, derived , 
                                                                           not from an explicit
                                                                           event)
```

Exactly one status at a time (FR-005); no event type or clock advancement other than the ones
shown above changes it. A new `create` event is rejected outright (not a status transition) if
its affected entry already has a request in Pending status (Clarifications/A-9) see Domain
API's `createRequest` contract.

## Follow-up / Dispute Note (derived view)

Each is simply the set of `follow-up` (linked to any request) or `dispute-note` (linked to an
emergency-tagged request) events for a `requestId`, in order, each carrying its `author`,
`writtenTime`, `serverTime`, and `text`. No count limit on either (FR-008, FR-014).

## Notice Label (derived)

A string, computed once per request: `"<N> h notice given"` if N ≥ 48, else
`"Short notice: <N> h given (plan asks for 48 h)"`, where N = whole hours, rounded down, between
the `create` event's `serverTime` and the affected entry's `startDateTime` (FR-004, A-3).

## Clocks & Connectivity (simulated hardware state, not part of the case record)

These are not Events, they are the "demo controls" state that the UI uses to *construct* real
events; they're persisted (so a reload doesn't reset the demo) but are not themselves part of
the auditable record.

| Entity | Fields | Notes |
|---|---|---|
| Server Clock | `currentServerTime` | Advanced or set only via Demo Controls (A-2). |
| Parent Device State | `parent`, `clockOffsetMinutes`, `online` (bool) | One per parent; offset applied to the server clock to render that parent's device time (REQ-09). |
| Offline Queue Item | `parent`, `intendedEventType`, `payload`, `writtenTime` | A locally-saved action captured while `online` is false. Not visible to the other parent and not part of the case record (not an Event) until connectivity returns and it is flushed, at which point it becomes a real `Event` with `serverTime` = the clock's value at flush, in the order it was written (FR-010). A flush that still fails leaves the item queued, unchanged, for the next connectivity return (FR-010). |

## Validation rules (cross-reference)

- `reason` non-empty on every `create` and `decline` (FR-003, FR-006); a tagged `create` reuses
  the same rule (FR-014).
- `text` non-empty on every `follow-up` and `dispute-note` (FR-008, FR-014).
- `createRequest` is rejected if the affected entry has already started, or already has a
  Pending request (FR-003, Clarifications/A-9).
- `editRequest` only ever changes `proposedTime` and/or `alternativeTime`; the affected entry,
  reason, and emergency tag are immutable after `create` (FR-011).
- `withdrawRequest` only succeeds while `status` is Pending (FR-005).
- `respond` (accept/decline) is rejected if `author === proposer` (FR-006).
