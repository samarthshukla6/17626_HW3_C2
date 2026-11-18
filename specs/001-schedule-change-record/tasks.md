---
description: "Task list template for feature implementation"
---

# Tasks: Schedule Change & Trusted Record

**Input**: Design documents from `/specs/001-schedule-change-record/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/domain-api.md, contracts/ui-contract.md

**Tests**: Included, as requested: each test task is written, and must fail, before the implementation task it verifies, using the exact values from spec.md's "Acceptance Examples (exact values)" section.

**Organization**: Tasks are grouped by user story (from spec.md, in priority order), after a Foundational phase holding the event log, clocks, strings module, and store: the pieces every other requirement depends on (`docs/goal-model.md` D-1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US5); omitted for Setup, Foundational, and Polish
- Every task names the REQ ID(s) it serves

## Path Conventions

Single frontend project at the repo root (plan.md's Project Structure): `frontend/src/domain/`, `frontend/src/copy/`, `frontend/src/app/`, `frontend/tests/domain/`, `frontend/tests/app/`.

---

## Phase 1: Setup

- [X] T001 Initialize the Vite + React + TypeScript project in `frontend/` (`npm create vite@latest frontend -- --template react-ts`), then create the `src/domain/`, `src/copy/`, `src/app/`, `tests/domain/`, and `tests/app/` directories from plan.md's Project Structure. (supports all REQs)
- [X] T002 Add Vitest, `jsdom`, `@testing-library/react`, and `@testing-library/user-event` as dev dependencies in `frontend/package.json`, and set its `scripts` to `dev`, `build`, and `test` = `vitest run` (non-watch, per the plan). (supports all REQs; NFR: `npm test` must run once and exit)
- [X] T003 [P] Configure `frontend/vite.config.ts` with the `jsdom` test environment for Vitest. (supports all REQs)
- [X] T004 [P] Configure `frontend/tsconfig.json` for strict TypeScript across `src/domain`, `src/copy`, and `src/app`. (Constitution Principle VI)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the event log, the simulated clocks, the strings module, and the store: everything else depends on these (`docs/goal-model.md` D-1: "The event log and the trusted clock get built first").

**⚠️ CRITICAL**: no user story task below may start until this phase is complete.

- [X] T005 [P] Write `frontend/tests/domain/events.test.ts`: appending an event returns it with a unique `id`; the event log returned by a later read still contains every previously appended event, unchanged. (REQ-11)
- [X] T006 [P] Implement `frontend/src/domain/events.ts`: the `Event` type (`id`, `type`, `author`, `requestId`, `serverTime`, `writtenTime?`, `targetEventId?`, `payload`), `appendEvent`, `getEvents(requestId?)`. Export no update or delete function. (REQ-11)
- [X] T007 [P] Write `frontend/tests/domain/clock.test.ts`: `setServerTime`/`advanceServerTime` change what `getServerTime` returns; `getDeviceTime(parent)` equals the server time plus that parent's `clockOffsetMinutes`. (REQ-09)
- [X] T008 [P] Implement `frontend/src/domain/clock.ts`: the server clock value, per-parent `clockOffsetMinutes`, `getServerTime`, `setServerTime`, `advanceServerTime`, `getDeviceTime`, `setDeviceClockOffset`. Never call `Date.now()` or `new Date()` with no argument. (REQ-09)
- [X] T009 [P] Write `frontend/tests/domain/strings.test.ts`: the exported banned-word list contains exactly `late, unreliable, failed, ignored, refused, missed, no-show` and does not contain `overdue`. (REQ-12)
- [X] T010 [P] Implement `frontend/src/copy/strings.ts`: a named template for every system-facing string this plan lists (statuses, notice labels, overdue/lapsed/delivery messages, validation errors, the Demo Controls label), plus an exported, closed `BANNED_WORDS` list matching FR-012. (REQ-12)
- [X] T011 [P] Implement `frontend/src/domain/mockData.ts`: alternating-weekend original schedule entries starting Fri 20 Nov 2026 (pickup Fri 18:00, school parking area, drop-off Sun 18:00), a starting server clock of Mon 16 Nov 2026 09:00, and only the invented names Melissa and Jason, with no real contact details. (A-6, NFR-02)
- [X] T012 Write `frontend/tests/domain/store.test.ts`: `saveState` then `loadState` round-trips the event log and clock state through a stubbed `localStorage`; `resetDemoData` clears that key and reseeds from `mockData.ts`. Per-parent online/offline flags are added to this persisted blob in Phase 5 (T038 extends store.ts) once `offlineQueue.ts` exists to own that state. (A-2, NFR-02)
- [X] T013 Implement `frontend/src/domain/store.ts`: one versioned `localStorage` key holding the event log and clock state; `loadState`, `saveState`, `resetDemoData`. Online/offline flags extend this in Phase 5. (A-2, NFR-02) (depends on T006, T008, T011, T012)

**Checkpoint**: event log, clocks, strings, and store exist and are tested. Every phase below builds on them.

---

## Phase 3: User Story 1 - Propose a change and get a real answer (Priority: P1) 🎯 MVP

**Goal**: a parent can submit a request; the other parent accepts or declines it in two actions; only that explicit acceptance makes it Agreed; a decline with a suggested alternative creates a new, separate, linked request.

**Independent Test**: submit a request as one parent, respond as the other, and check the resulting status and calendar entry: exercised fully here using only the Foundational modules.

### Tests for User Story 1

- [X] T014 [P] [US1] Write `frontend/tests/domain/req-03.test.ts` from spec.md's Acceptance Examples: "Missing reason" (Jason submits a proposed time with no reason → not sent, `"Add a reason for the change"`) and "Second request for the same exchange" (Melissa submits for an exchange Jason already has Pending → not sent, `"This exchange already has a pending request. It needs a response or a withdrawal first."`). (REQ-03)
- [X] T015 [P] [US1] Write `frontend/tests/domain/req-05.test.ts` from spec.md's Acceptance Examples: "Silence never agrees" (Pending 5 days with no response → status still `"Pending"`, original schedule in force), plus: Withdraw succeeds only while Pending and only for the sender. (REQ-05)
- [X] T016 [P] [US1] Write `frontend/tests/domain/req-06.test.ts` from spec.md's Acceptance Examples: "Two-step accept" (Accept then Confirm → `"Agreed"`), "Decline needs a reason" (no reason → not saved, `"Add a reason for declining"`), and "Decline with an alternative" (original Declined and stays Declined; a new Pending request exists from Melissa to Jason for Sat 21 Nov 10:00, linked to the declined one; only Jason can respond to it). (REQ-06)
- [X] T017 [P] [US1] Write `frontend/tests/domain/req-07.test.ts` from spec.md User Story 1 acceptance scenario 7: an Agreed request shows on the calendar as a separate `"Agreed change"` entry in the same update, next to the original entry marked `"Changed by agreement, original kept."` (REQ-07)
- [X] T018 [P] [US1] Write `frontend/tests/app/respond-flow.test.tsx` with React Testing Library: a rendered pending request reaches `"Agreed"` via Accept → Confirm in exactly two user actions, and reaches `"Declined"` via Decline → (type reason) → Confirm, with typing the reason not counted as a third action. (REQ-06)

### Implementation for User Story 1

- [X] T019 [US1] Implement `createRequest` in `frontend/src/domain/requests.ts`: validate the affected entry exists and hasn't started, that it has no current Pending request, and that `reason` is non-empty; on success append a `create` event (via T006), on failure return the exact copy string from `strings.ts` (via T010). (REQ-03) (depends on T006, T008, T010)
- [X] T020 [US1] Implement status derivation and `getChangeRequest` in `frontend/src/domain/requests.ts`: fold a request's events into `Pending | Agreed | Declined | Withdrawn`; `Agreed` derives only from an explicit `accept` event. (REQ-05) (depends on T019)
- [X] T021 [US1] Implement `respond` (accept/decline) and `withdrawRequest` in `frontend/src/domain/requests.ts`: `respond` rejects if `author` is the proposer; a decline with a suggested alternative calls `createRequest` again with proposer/responder reversed and `linkedFromRequestId` set; `withdrawRequest` only succeeds while Pending. (REQ-05, REQ-06) (depends on T020)
- [X] T022 [US1] Implement `getSchedule` in `frontend/src/domain/record.ts`: every original-plan entry by date, marked `"Change proposed, waiting for response"` while a request on it is Pending, with a separate `"Agreed change"` row next to the untouched original once Agreed. (REQ-01, REQ-07) (depends on T021)
- [X] T023 [P] [US1] Build `frontend/src/app/RequestCard.tsx` (minimal) and `frontend/src/app/Requests.tsx`: each card shows the proposer, the exchange, the proposed time, the reason, the notice label and the status, with Accept/Decline/Confirm controls reaching Agreed/Declined in two actions, an optional "suggest an alternative" step kept outside that count, no respond control on a parent's own request, and Withdraw for the sender while Pending. (REQ-05, REQ-06) (depends on T021)
- [X] T024 [P] [US1] Build `frontend/src/app/Schedule.tsx` rendering `getSchedule()`: original entries with no edit/delete control, agreed changes shown next to them. (REQ-01, REQ-07) (depends on T022)

**Checkpoint**: User Story 1 is fully functional and testable on its own.

---

## Phase 4: User Story 2 - See the current state and anything waiting for you (Priority: P1)

**Goal**: the first screen (Home) shows the next exchange and everything waiting on this parent, with no further navigation; original-plan entries are visibly permanent.

**Independent Test**: open the app as a parent with and without something pending and check what Home shows.

### Tests for User Story 2

- [X] T025 [P] [US2] Write `frontend/tests/domain/req-01.test.ts` from spec.md's Acceptance Examples: "Agreed swap shown next to the original" (original entry stays shown; `"Moved to Fri 27 Nov 18:00, agreed by both parents"` shown next to it) and "Original entries can't be edited" (no edit/delete action offered). (REQ-01)
- [X] T026 [P] [US2] Write `frontend/tests/domain/req-02.test.ts` from spec.md's Acceptance Examples: "Jason sees the waiting action first" (`"Waiting for you: respond to Melissa's request for Sat 21 Nov"`, `"Next exchange: Fri 20 Nov 18:00, school parking area, Jason's weekend begins"`) and "Nothing waiting" (`"Nothing is waiting for you."`). (REQ-02)

### Implementation for User Story 2

- [X] T027 [US2] Implement `getHomeSummary` in `frontend/src/domain/record.ts`: the next exchange, every request waiting on this parent, and every Pending request involving them; an empty `waitingOnYou` signals the "nothing waiting" case. (REQ-02) (depends on T021, T022)
- [X] T028 [US2] Build `frontend/src/app/Home.tsx` rendering `getHomeSummary(parent)` as the first screen, reachable with no further navigation: the next exchange, each waiting request as a RequestCard with its Accept and Decline buttons on Home itself (so responding takes two actions from the first screen), and every other Pending request this parent is involved in. (REQ-02, REQ-06) (depends on T027)
- [X] T029 [P] [US2] Build `frontend/src/app/ViewingAsSwitch.tsx`: "Viewing as: Melissa | Jason" switch, always visible, re-rendering every screen as that parent with no sign-in. (A-1)
- [X] T030 [US2] Confirm `frontend/src/app/Schedule.tsx` (T024) renders no edit/delete control on an original-plan entry, against `req-01.test.ts` (T025). (REQ-01) (depends on T024, T025)

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Trust that notice and timing reflect what really happened (Priority: P2)

**Goal**: notice is calculated and labelled honestly and never blocks a request; overdue and Lapsed are derived correctly; every timestamp (written/received/delivered/read) is separate and honest; offline submissions are queued, not lost, and never shown as sent until the server has them.

**Independent Test**: submit requests at different points relative to an event's start (and while offline) and check the notice label, overdue flag, and the four timestamps.

### Tests for User Story 3

- [X] T031 [P] [US3] Write `frontend/tests/domain/req-04.test.ts` from spec.md's Acceptance Examples "Notice label around the 48-hour threshold," all four rows: 48h before → `"48 h notice given"`; 47h59m before → `"Short notice: 47 h given (plan asks for 48 h)"`; 72h before → `"72 h notice given"`; 3h before → `"Short notice: 3 h given (plan asks for 48 h)"`; every row still delivered. (REQ-04)
- [X] T032 [P] [US3] Write `frontend/tests/domain/req-08.test.ts` from spec.md's Acceptance Examples: the 48-hours-since-received "Overdue flag" outline (09:59 off / 10:00 on), the added 24-hours-before-exchange boundary outline (18:00 off / 18:01 on), and the Lapsed case (event starts while still Pending → `"No response before the exchange, original schedule applied."`). (REQ-08)
- [X] T033 [P] [US3] Write `frontend/tests/domain/req-09.test.ts` from spec.md's Acceptance Examples "Phone clock is wrong" (`"Written 12:00 (device time, not verified)"`, `"Received by server 10:00"`, notice calculated from 10:00), plus a delivery-failure case showing `"Not delivered"` and never shown as delivered or read. (REQ-09)
- [X] T034 [P] [US3] Write `frontend/tests/domain/req-10.test.ts` from spec.md's Acceptance Examples "Truck stop with no signal": offline submission shows `"Saved on this device, not sent yet"`, the other parent sees nothing, and on reconnect the server receives it at the reconnect time, shows `"Short notice: 46 h given (plan asks for 48 h)"` and `"Written Wed 18 Nov 16:00 (device time, not verified)"`. (REQ-10)

### Implementation for User Story 3

- [X] T035 [US3] Implement notice calculation in `frontend/src/domain/requests.ts`: whole hours rounded down between the `create` event's `serverTime` and the affected entry's start, computed once and never recalculated by a later edit; label per the 48h threshold. (REQ-04) (depends on T019)
- [X] T036 [US3] Implement overdue and Lapsed derivation in `frontend/src/domain/requests.ts`: `overdue` is true while Pending and either 48h have passed since the `create` event's `serverTime` or the affected entry's start is under 24h away; status becomes Lapsed once the affected entry's start passes while still Pending. (REQ-08) (depends on T020, T035)
- [X] T037 [P] [US3] Implement `frontend/src/domain/delivery.ts`: record a `delivered` event when the recipient is online (or when they next come online); `markRead` records one `read` event per item, only after `delivered`; `failNextDelivery` (Demo Controls) produces a `delivery-failed` event instead, shown to the sender as `"Not delivered."` (REQ-09) (depends on T006, T008)
- [X] T038 [P] [US3] Implement `frontend/src/domain/offlineQueue.ts`: `setOnline`/`isOnline`; `queueLocally` captures an action with the parent's current device time while offline; `flushQueue` replays queued actions in write order as real events on reconnect; a flush that still fails (Demo Controls "server unreachable") leaves the item queued, unchanged. (REQ-10) (depends on T006, T008)
- [X] T039 [US3] Build `frontend/src/app/DemoControls.tsx`, labelled `"Demo controls (testing aid, not part of the product)"`: set/advance server time, Jason's device-clock offset, each parent's online/offline switch, "fail the next delivery," and "server unreachable." (depends on T008, T037, T038)
- [X] T055 [US3] Extend `frontend/src/app/RequestCard.tsx` with the four times shown separately (written with "device time, not verified", received by server, delivered or "Not delivered", read), the overdue flag, "Saved on this device, not sent yet" on the sender's side for queued items, and a `markRead` call when the recipient opens the card. (REQ-08, REQ-09, REQ-10) (depends on T023, T036, T037, T038)

**Checkpoint**: User Stories 1–3 work together; notice, overdue, Lapsed, timestamps, and the offline queue are demonstrable through Demo Controls.

---

## Phase 6: User Story 4 - Trust that the record can't be quietly changed and treats both parents the same (Priority: P2)

**Goal**: every action is a permanent, visible event; an edit never erases the prior value; no system text ever uses a banned word or a count/score; one view shows an event's whole history.

**Independent Test**: edit a pending request and confirm the prior value is still visible as history; scan all system-generated text for banned words or counts.

### Tests for User Story 4

- [X] T040 [P] [US4] Write `frontend/tests/domain/req-11.test.ts` from spec.md User Story 4's acceptance scenarios: every action type appends a new event that is never deleted or overwritten; editing a Pending request's proposed time shows `"Edited by Jason at 14:05: proposed time 18:00 to 19:00"` while the original value stays visible; editing after the responder has read it additionally shows `"Edited after Melissa read it."` (REQ-11)
- [X] T041 [P] [US4] Write `frontend/tests/domain/req-12.test.ts`: every string produced by `frontend/src/copy/strings.ts` (statuses, notice labels, overdue/lapsed, delivery messages) contains none of FR-012's closed word list, and the same situation produces identical output for both parents. (REQ-12)
- [X] T042 [P] [US4] Write `frontend/tests/domain/req-13.test.ts`: opening a scheduled event shows, in time order and in one view, the original entry, every request for it with its notice label, every response/follow-up/dispute note with their times, the current outcome, and the audit events. (REQ-13)

### Implementation for User Story 4

- [X] T043 [US4] Implement `editRequest` in `frontend/src/domain/requests.ts`: only `proposedTime`/`alternativeTime` are ever accepted; rejects unless the request is Pending and the author is its proposer; appends an `edit` event that never touches the affected entry, reason, or emergency tag. (REQ-11) (depends on T019, T037)
- [X] T044 [US4] Implement `addFollowUp` in `frontend/src/domain/requests.ts`: rejects empty text, appends a `follow-up` event, no count limit. (REQ-08, REQ-11) (depends on T021)
- [X] T045 [P] [US4] Implement `getHistory` (every Case Record Entry in time order, for the History area) and `getEventTimeline` in `frontend/src/domain/record.ts`: original entry plus every request/response/follow-up/dispute-note/audit event for a schedule entry, in time order. (REQ-13) (depends on T020, T037)
- [X] T046 [US4] Build `frontend/src/app/History.tsx` and `frontend/src/app/EventDetail.tsx` rendering `getHistory()` and `getEventTimeline()` respectively, using only strings from `frontend/src/copy/strings.ts`. (REQ-02 third area, REQ-13) (depends on T045)
- [X] T047 [P] [US4] Audit `frontend/src/copy/strings.ts` against `req-12.test.ts` (T041) and rephrase any string that fails it. (REQ-12) (depends on T041)
- [X] T056 [US4] Extend `frontend/src/app/RequestCard.tsx` with Edit (proposed time and alternative date only, no control for the fixed fields) and Add follow-up for the sender while Pending. (REQ-08, REQ-11) (depends on T023, T043, T044)

**Checkpoint**: User Stories 1–4 work together; the full record is visible, permanent, and neutrally worded.

---

## Phase 7: User Story 5 - Claim an emergency without it deciding anything (Priority: P3)

**Goal**: a request can be tagged as an emergency claim with a required reason; the tag never changes the calendar or status by itself; the other parent can add a non-empty dispute note.

**Independent Test**: create a tagged request and confirm the tag appears, the calendar/status are unaffected by the tag alone, and a dispute note can be added and is shown with the request.

### Tests for User Story 5

- [X] T048 [P] [US5] Write `frontend/tests/domain/req-14.test.ts` from spec.md User Story 5's acceptance scenarios: a tagged request without a reason is rejected like any request; a tagged request shows `"Emergency claimed by Jason"` (or Melissa) without the claim being checked; the tag alone never changes the calendar or status; a dispute note with empty text is rejected, a non-empty one is recorded and shown with the request. (REQ-14)

### Implementation for User Story 5

- [X] T049 [US5] Extend `createRequest` in `frontend/src/domain/requests.ts` to accept an optional `emergencyTag` (`illness | emergency`), reusing the existing reason validation; add `addDisputeNote` (rejects empty text, appends a `dispute-note` event, no count limit). (REQ-14) (depends on T019, T044)
- [X] T050 [US5] Update `frontend/src/app/Requests.tsx` and `frontend/src/app/EventDetail.tsx` to show the emergency tag/claim and an "Add dispute note" control for the other parent, with the tag and any overdue/lapsed wording shown side by side. (REQ-14) (depends on T023, T046, T049)

**Checkpoint**: all five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T051 [P] Wire `frontend/src/app/App.tsx`: top-level layout composing `ViewingAsSwitch`, `Home`, `Schedule`, `Requests`, `History`, `EventDetail`, and the footer "Demo controls" entry point; confirm usability at 375px. (NFR-01, SC-007)
- [X] T052 [P] Add a "Reset demo data" confirmation flow (in-page prompt, not a browser dialog) to `frontend/src/app/DemoControls.tsx`, calling `resetDemoData()`. (depends on T039, T013)
- [X] T053 Run `npm test` in `frontend/` and confirm all 14 `req-XX.test.ts` files and `respond-flow.test.tsx` pass. (SC-006) (depends on all test and implementation tasks above)
- [X] T054 Walk through quickstart.md's "Try the core flow by hand" steps 1–5 against the running app and confirm each step matches its cited REQ. Verified: `npm run build` and the Vite dev server both succeed with no errors; each of the 5 steps is covered end-to-end by a passing automated test (req-03/req-06 create+accept, req-07 agreed-next-to-original, req-08 Lapsed-on-clock-advance, req-10 offline-then-reconnect). Not separately clicked through in a live browser in this session (no browser-automation tool was loaded) - recommend a manual pass before treating the demo as release-ready. (depends on T051, T052)

---

## Phase 9: Review fixes

**Purpose**: a manual browser review of the running app found implementation defects against spec.md (spec.md itself is unchanged). Each fix is written test-first.

- [X] T057 [P] [US1] Write a failing test, then add a "Request a change" form on `frontend/src/app/Schedule.tsx`'s rows and on `frontend/src/app/EventDetail.tsx`: proposed date/time, optional alternative date, reason, and an emergency tag selector (none / Unexpected child illness / Genuine emergency). Show FR-003's exact messages inline on validation failure. Submitting while the parent is offline must queue it and show "Saved on this device, not sent yet". (REQ-03, REQ-10, REQ-14)
- [X] T058 [US4] Write a failing test, then call `saveState()` after every domain mutation (create/edit/withdraw/respond/follow-up/dispute-note) and after every Demo Controls change (clock set/advance, device offset, online/offline, server-unreachable, fail-next-delivery), so a reload keeps the event log, clocks, online flags, and offline queue. Today state is only saved on reset. (REQ-10, REQ-11)
- [X] T059 [US2] Write a failing test, then load the schedule and persisted state before the first render of `frontend/src/app/App.tsx`, not inside a `useEffect` that runs after it. Home currently shows no "Next exchange" on first load because the schedule isn't set yet on that first render. (REQ-02)
- [X] T060 Write a failing test, then rebuild `frontend/src/domain/mockData.ts`: Melissa has primary custody, Jason has alternating weekends. For each of Jason's weekends, create a Friday 18:00 pickup ("Jason's weekend begins") and a Sunday 18:00 drop-off ("Melissa's time begins"), both at the school parking area. The current mock schedule alternates parents every Friday with no Sunday entries at all. Keep the REQ-02 Acceptance Example string in spec.md exactly as it is (its fixture stays separate from the live mock schedule). (A-6)
- [X] T061 [US3] Write a failing test, then show the written, received-by-server, delivered (or "Not delivered" with the failure time), and read times for every item on a request — the request itself, the response, edits, withdraw, follow-ups, and dispute notes — not just the create event. Call `markRead` for every delivered item the viewer opens, not only the create event. (REQ-09)
- [X] T062 [US4] Write a failing test, then label `frontend/src/app/App.tsx`'s event-detail buttons with the exchange's date instead of its internal schedule-entry id. (REQ-13)
- [X] T063 [US3] Write a failing test that runs with `TZ=America/New_York`, then parse every `datetime-local` input (the request form's proposed/alternative time, the edit form, Demo Controls' "Set server time") as UTC and format every shown time in UTC, so what a parent types is what they see, regardless of the browser's local timezone. Today inputs are parsed in local time but displayed in UTC, so 18:00 entered in New York shows as 23:00. (REQ-03, REQ-09, A-2)
- [X] T064 [US3] Write a failing test, then show queued (offline, not-yet-sent) items as cards to the sender only, on Home and on Requests, labelled "Saved on this device, not sent yet" with the written time ("device time, not verified"), until the server receives them. Today that message disappears as soon as the form closes and the queued item isn't shown anywhere. (REQ-10)
- [X] T065 [US3] Write a failing test, then show "Delivered <time>" and "Read <time>" using the server time of those events, and "Not delivered <time>" for a failure, instead of a bare word with no time. (REQ-09)
- [X] T066 [US4] Write a failing test, then replace the raw event types ("create", "accept") shown in `EventDetail.tsx`'s timeline and `RequestCard.tsx`'s item list with neutral labels added to `frontend/src/copy/strings.ts`: "Request sent by X", "Accepted by X", "Declined by X", "Edited by X", "Withdrawn by X", "Follow-up from X", "Dispute note from X". These must pass the FR-012 banned-word test. (REQ-11, REQ-12)
- [X] T067 [US2] Write a failing test, then change the Sunday drop-off's original-plan wording from "Melissa's weekend (court plan)" to "<date> 18:00, drop-off, Melissa's time begins (court plan)", and Home's next-exchange line for a drop-off to "Next exchange: ..., Melissa's time begins". Keep the Friday pickup wording exactly as in the REQ-01 and REQ-02 Acceptance Examples. (A-6, REQ-02)

**Checkpoint**: `npm test` and `npm run build` both succeed with these fixes applied.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup. Blocks every user story (D-1).
- **User Story 1 (Phase 3)**: depends on Foundational only.
- **User Story 2 (Phase 4)**: depends on Foundational; `T027`/`T030` also read what User Story 1 built (`T021`, `T022`, `T024`), so implement after Phase 3.
- **User Story 3 (Phase 5)**: depends on Foundational; `T035`/`T036` extend `requests.ts` from Phase 3 (`T019`, `T020`), so implement after Phase 3.
- **User Story 4 (Phase 6)**: depends on Foundational; `T043`/`T044` extend `requests.ts` from Phases 3 and 5 (`T019`, `T021`, `T037`), so implement after Phase 5.
- **User Story 5 (Phase 7)**: depends on Foundational; `T049` extends `requests.ts` from Phases 3 and 6 (`T019`, `T044`), so implement after Phase 6.
- **Polish (Phase 8)**: depends on every phase above.

Because `requests.ts` is one file that every story after US1 extends, the stories are dependency-ordered (US1 → US2/US3 → US4 → US5) even though each has its own independently-passing test file: this matches `docs/goal-model.md`'s D-1/D-2/D-3/D-4 dependency chain (event log and clock first; REQ-03/07 depend on REQ-01; REQ-04 depends on REQ-09; REQ-10 depends on REQ-09).

### Within Each Phase

- Test tasks are written, and must fail, before their implementation task.
- Within Foundational and each user-story phase, domain-layer tasks precede the UI tasks that call them.

### Parallel Opportunities

- Setup: `T003`, `T004` in parallel after `T002`.
- Foundational: `T005`–`T011` in parallel (four independent test+implementation pairs plus mock data); `T012`/`T013` follow once all four exist.
- User Story 1 tests: `T014`–`T018` in parallel.
- User Story 1 UI: `T023`, `T024` in parallel once `T021`/`T022` are done.
- User Story 2 tests: `T025`, `T026` in parallel; `T029` in parallel with `T027`/`T028`.
- User Story 3 tests: `T031`–`T034` in parallel; `T037`, `T038` in parallel.
- User Story 4 tests: `T040`–`T042` in parallel; `T045`, `T047` in parallel with `T043`/`T044`.
- User Story 5 test: `T048` alone (single test file for this story).
- Polish: `T051`, `T052` in parallel.

---

## Parallel Example: Foundational Phase

```bash
Task: "Write frontend/tests/domain/events.test.ts (REQ-11)"
Task: "Write frontend/tests/domain/clock.test.ts (REQ-09)"
Task: "Write frontend/tests/domain/strings.test.ts (REQ-12)"
Task: "Implement frontend/src/domain/mockData.ts (A-6, NFR-02)"
```

## Parallel Example: User Story 1 tests

```bash
Task: "Write frontend/tests/domain/req-03.test.ts (REQ-03)"
Task: "Write frontend/tests/domain/req-05.test.ts (REQ-05)"
Task: "Write frontend/tests/domain/req-06.test.ts (REQ-06)"
Task: "Write frontend/tests/domain/req-07.test.ts (REQ-07)"
Task: "Write frontend/tests/app/respond-flow.test.tsx (FR-006)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational): event log, clocks, strings, store.
2. Complete Phase 3 (User Story 1).
3. **STOP and VALIDATE**: run `req-03`, `req-05`, `req-06`, `req-07`, and `respond-flow` tests; a request can be proposed and resolved.
4. Demo if ready: this alone proves the one rule the prototype exists to test (Constitution Principle IV).

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → test independently → demo (MVP).
3. User Story 2 → test independently → demo (Home/Schedule now show real state).
4. User Story 3 → test independently → demo (notice, overdue, timestamps, offline all real).
5. User Story 4 → test independently → demo (full, neutral, tamper-evident history).
6. User Story 5 → test independently → demo (emergency claims).
7. Polish → wire the single page together, reset flow, full test run, quickstart walkthrough.

Each story after US1 extends `requests.ts` rather than replacing it, so earlier stories keep passing their own tests as later ones are added (checked at `T053`).

---

## Notes

- `[P]` tasks touch different files and have no unmet dependency.
- `[US#]` maps a task to its user story for traceability; Setup, Foundational, and Polish carry no story label.
- Every task names the REQ ID(s), or the assumption/NFR ID, it serves.
- Verify each test fails before writing the implementation it covers.
- Stop at any checkpoint to validate a story independently before continuing.

## Phase 10: V2 revisions

### Tests

- [x] T068 [P] [US3] Update `frontend/tests/domain/req-10.test.ts` and `frontend/tests/app/queuedCard.test.tsx` for F-1/F-2: an offline item shows its written time and "Not sent yet" with no Pending status. (REQ-05, REQ-10)
- [x] T069 [P] [US3] Update `frontend/tests/domain/req-04.test.ts` for F-6: server notice stays official and the 50-hour written figure appears as unverified context beside the 46-hour warning. (REQ-04)
- [x] T070 [P] [US3] Add tests in `frontend/tests/domain/req-09.test.ts` for F-4/F-5: waiting-offline and failed are distinct, Retry appends delivery without removing failure, and only the sender can retry. (REQ-09, REQ-11)
- [x] T071 [P] [US3] Add tests in `frontend/tests/app/requestCard.test.tsx` for F-3: list rendering does not mark read; explicit Open details does. (REQ-09)
- [x] T072 [P] [US2] Add tests in `frontend/tests/app/app.test.tsx` and `frontend/tests/app/requestForm.test.tsx` for selected-parent styling and submission feedback/navigation. (F-7, F-8, REQ-02, REQ-03)
- [x] T073 [P] [US1] Add a test in `frontend/tests/app/respond-flow.test.tsx` that decline-with-alternative keeps a valid datetime value and creates the linked request. (F-10, REQ-06)
- [x] T074 [P] [US4] Add a structure test in `frontend/tests/app/requestCard.test.tsx` for separate event and timestamp lines. (F-9, REQ-09, REQ-13)

### Implementation

- [x] T075 [US3] Implement queued written time and no-status semantics in `frontend/src/domain/requests.ts` and `frontend/src/app/RequestCard.tsx`. (F-1, F-2, REQ-05, REQ-10; depends on T068)
- [x] T076 [US3] Implement the X-3 notice label with official server and unverified written figures in `frontend/src/domain/requests.ts` and `frontend/src/copy/strings.ts`. (F-6, REQ-04; depends on T069)
- [x] T077 [US3] Implement waiting-offline wording, explicit retry and append-only recovery in `frontend/src/domain/delivery.ts`, `frontend/src/app/RequestCard.tsx` and `frontend/src/copy/strings.ts`. (F-4, F-5, REQ-09, REQ-11; depends on T070)
- [x] T078 [US3] Remove render-time read marking and add explicit Open details behavior in `frontend/src/app/RequestCard.tsx`. (F-3, REQ-09; depends on T071)
- [x] T079 [P] [US2] Implement selected-parent styling and submission feedback/navigation in `frontend/src/app/ViewingAsSwitch.tsx`, `frontend/src/app/App.tsx`, `frontend/src/app/Schedule.tsx` and `frontend/src/index.css`. (F-7, F-8, REQ-02, REQ-03; depends on T072)
- [x] T080 [P] [US1] Fix alternative datetime value handling in `frontend/src/app/RequestCard.tsx`. (F-10, REQ-06; depends on T073)
- [x] T081 [P] [US4] Add readable block formatting for request events and timestamps in `frontend/src/app/RequestCard.tsx`, `frontend/src/app/History.tsx`, `frontend/src/app/EventDetail.tsx` and `frontend/src/index.css`. (F-9, REQ-09, REQ-13; depends on T074)
- [ ] T082 Run `npm test -- --run` and `npm run build` in `frontend/`, then update `docs/traceability.md` with V2 evidence while leaving browser-only V2 status pending. (depends on T075-T081)
