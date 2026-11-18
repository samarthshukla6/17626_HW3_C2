# Feature Specification: Schedule Change & Trusted Record

**Feature Branch**: `001-schedule-change-record`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Create the feature spec from docs/initial-spec.md, our hand-written requirements, and use docs/goal-model.md for goals, decisions (X-1 to X-7, O-1 to O-8) and assumptions (A-1 to A-8). Number the functional requirements FR-001 to FR-014 so FR-0nn matches REQ-nn, and put \"(REQ-nn)\" after each. Keep every Gherkin scenario and its example values exactly, including the threshold rows. Mark A-3, A-4 and questions Q-1 to Q-4 as [NEEDS CLARIFICATION] or documented assumptions. Don't resolve them. Keep the out-of-scope list and decisions X-1 to X-5. What and why only, no technology. Plain, concise wording."

## Clarifications

### Session 2026-11-16

- Q: Can more than one request be open (Pending) at the same time for the same schedule entry? → A: No. Only one Pending request is allowed per schedule entry at a time; a new request for an entry that already has a Pending request is rejected until the first is resolved (Agreed/Declined/Withdrawn/Lapsed).
- Q: When a decline suggests an alternative, what happens to the original request's status, and whose request is the alternative? → A: The original request becomes plain Declined (with its reason) and stays that way permanently; the alternative becomes a brand-new Change Request with the original responder now as proposer and the original sender now as responder.
- Q: Which fields of a Pending request can the sending parent edit after submitting it? → A: Only the proposed date/time and the optional alternative date; the affected event, the reason and any emergency tag are fixed once submitted. Extra context goes in a follow-up note instead.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Propose a change and get a real answer (Priority: P1)

A parent (Melissa or Jason) wants to change an upcoming exchange. They submit a request naming
the event, a proposed new time, and a reason. The other parent accepts or declines it in
writing. Only that explicit acceptance makes the change count as agreed; nothing else does.

**Why this priority**: this is the transaction the whole prototype exists to test: the rule
that no request, timeout, or system action can make a change look agreed (SP-3, X-5). Every
other story depends on a request existing to look at.

**Independent Test**: can be fully tested by submitting a request as one parent, then accepting
or declining it as the other, and checking that the resulting status and calendar entry match
the response, no other story's functionality is required to exercise this end-to-end.

**Acceptance Scenarios**:

1. **Given** a parent is viewing an event that hasn't started, **When** they submit a request
   with the affected event, a proposed time, and a reason, **Then** the request is created and
   sent to the other parent.
2. **Given** a required field (proposed time or reason) is missing, **When** the parent tries to
   submit, **Then** the request is not sent and the missing field is named.
3. **Given** the affected event has already started, **When** a parent tries to submit a request
   for it, **Then** the request is not sent and the system says the event has already started.
4. **Given** a pending request is shown on the first screen, **When** the responding parent taps
   Accept and then Confirm, **Then** the request's status becomes Agreed in that same step.
5. **Given** a responding parent declines without a reason, **When** they try to submit the
   decline, **Then** it is not saved and they are asked to add a reason.
6. **Given** a request has been Pending for several days with no response, **Then** its status is
   still Pending and the original schedule remains the one in force. Silence never agrees.
7. **Given** a request becomes Agreed, **Then** the calendar shows the change as a separate
   "Agreed change" entry in the same update, next to the original entry marked "Changed by
   agreement, original kept."

---

### User Story 2 - See the current state and anything waiting for you (Priority: P1)

A parent opens the app and, without extra navigation, sees the next exchange and every action
waiting for them. The original court-ordered plan is always visible and can never be edited or
deleted, even once changes exist alongside it.

**Why this priority**: this was the most-repeated ease-of-use need from the interviews. Ruth
wants something usable "during a stressful exchange," and Melissa's biggest worry was Jason
abandoning a complicated app (SP-1, SP-2).

**Independent Test**: can be tested by opening the app as a parent with and without something
pending, and checking what the first screen shows, no request needs to be created or resolved
to exercise this story.

**Acceptance Scenarios**:

1. **Given** the other parent sent a request that hasn't been answered, **When** a parent opens
   the app, **Then** the first screen shows the waiting action and the next exchange's date,
   time, location, and whose time begins, with no further navigation needed.
2. **Given** nothing is waiting for a parent, **When** they open the app, **Then** the first
   screen says "Nothing is waiting for you."
3. **Given** an agreed change exists for an event, **When** either parent opens that date,
   **Then** the original court-plan entry is still shown, unchanged, next to the agreed change.
4. **Given** a parent is viewing an original-plan entry, **Then** no edit or delete action is
   offered for it.

---

### User Story 3 - Trust that notice and timing reflect what really happened (Priority: P2)

A parent trusts that how much notice they gave (or got) is recorded as a plain fact, never
used to block a request, and that every time shown (written, received, delivered, read) is
honest, even if their phone's clock is wrong or they were offline when they wrote something.

**Why this priority**: this is the second conflict the prototype exists to test (server time vs.
phone time, and what counts as "enough" notice), but it is meaningful only once Story 1's
requests exist to carry timestamps and notice labels.

**Independent Test**: can be tested by submitting requests at different points relative to the
affected event's start time (and while offline), and checking the notice label, overdue flag,
and the four separate timestamps shown, independent of whether the request is ultimately
agreed or declined.

**Acceptance Scenarios**:

1. **Given** the affected exchange starts at a known time, **When** the server receives a
   request at various times before it, **Then** the request is labelled and delivered exactly as
   follows (notice is the event start minus the server-received time, in whole hours, rounded down):

   | Received | Label |
   |---|---|
   | 48 h before event start | "48 h notice given" |
   | 47 h 59 min before | "Short notice: 47 h given (plan asks for 48 h)" |
   | 72 h before | "72 h notice given" |
   | 3 h before | "Short notice: 3 h given (plan asks for 48 h)" |

   A short-notice request is always delivered. Notice never blocks a request.
2. **Given** a parent's phone clock is fast, **When** they write and send a request, **Then** the
   written time is shown labelled "device time, not verified," the server-received time is shown
   separately, and notice is calculated from the server-received time, not the phone's.
3. **Given** a request is still Pending, **When** either 48 hours have passed since the server
   received it, or the affected event is less than 24 hours away, **Then** both parents see
   "Awaiting response, overdue," while the status itself stays Pending.
4. **Given** a request is still Pending when its affected event starts, **Then** its status
   becomes Lapsed and the system shows "No response before the exchange, original schedule
   applied."
5. **Given** a parent's phone is offline, **When** they write and submit a request, **Then** they
   see "Saved on this device, not sent yet," the other parent sees nothing yet, and when the
   connection returns the server records the moment it actually receives the item, for example,
   written at 16:00 with no signal, signal returns at 20:00: the server receives it at 20:00,
   shows "Short notice: 46 h given (plan asks for 48 h)," and still shows "Written 16:00 (device
   time, not verified)."

---

### User Story 4 - Trust that the record can't be quietly changed and treats both parents the same (Priority: P2)

A parent (or Ruth, reviewing later) can open any event and see its whole history in one place,
trust that nothing in that history was ever deleted or silently rewritten, and trust that the
system's own wording never favors one parent or scores either of them.

**Why this priority**: this is what makes the record usable as evidence at all (SP-7, SP-8,
SP-9); it depends on Stories 1–3 having produced entries to show, but is testable on its own by
inspecting the record's behavior rather than its business outcomes.

**Independent Test**: can be tested by editing a pending request and checking that the prior
value is still visible as history, and by scanning all system-generated text for judging
language or any count/score, independent of which specific requests exist.

**Acceptance Scenarios**:

1. **Given** any action occurs (create, edit, withdraw, accept, decline, follow-up, dispute note,
   delivered, read), **Then** it is recorded as a new event with its author and the server time,
   and nothing already recorded is ever deleted or overwritten.
2. **Given** the sender edits a pending request, **Then** the original values stay visible and
   the edit appears as a new, separate event (e.g., "Edited by Jason at 14:05: proposed time
   18:00 to 19:00").
3. **Given** the other parent had already read the request, **When** the sender edits it,
   **Then** the system additionally shows "Edited after Melissa read it."
4. **Given** any parent opens a scheduled event, **Then** they see, in time order and in one
   view: the original entry, every request for it with its notice label, every response,
   follow-up, and dispute note with their times, the current outcome, and the audit events.
5. **Given** any system-written text, **Then** it states only who did what and when, with no
   judging words (late, unreliable, failed to, ignored, refused, missed, no-show) and no count,
   score, or ranking of either parent's behavior; both parents see identical labels, rules, and
   layout for the same situation.

---

### User Story 5 - Claim an emergency without it deciding anything (Priority: P3)

A parent can tag a request as an unexpected illness or a genuine emergency, with a required
reason. The tag is shown as a claim, never checked or judged by the system, and never changes
the calendar or the request's status by itself. The other parent can add a note disputing it.

**Why this priority**: it only matters for a request that already exists (Story 1), and the
interviews treat it as a labelling nuance on top of the main agreement rule rather than a
separate transaction, it's the smallest, most independent slice.

**Independent Test**: can be tested by creating a request tagged as an emergency and checking
that the tag appears, the calendar and status are unaffected by the tag alone, and a dispute
note can be added and is visible with the request.

**Acceptance Scenarios**:

1. **Given** a parent is creating a request, **When** they tag it "Unexpected child illness" or
   "Genuine emergency," **Then** a reason is required for that tag, same as any request.
2. **Given** a request carries an emergency tag, **Then** it is shown as "Emergency claimed by
   Jason" (or Melissa), without any indication that the system verified or endorsed the claim.
3. **Given** a tagged request, **Then** the calendar and the request's status are unaffected by
   the tag alone, only an explicit acceptance (Story 1) changes the status.
4. **Given** a tagged request, **When** the other parent disputes the claim, **Then** their
   written note is recorded under the same append-only rule as any other entry (Story 4) and
   shown together with the request.

---

### Edge Cases

- A request for an event that has already started (User Story 1, scenario 3).
- Notice of exactly 48 hours, the boundary itself (User Story 3, scenario 1).
- An edit made after the other parent has already read the request (User Story 4, scenario 3).
- Two requests submitted for the same event at the same time: the second is rejected while the
  first is still Pending for that entry (see Clarifications).
- A decline that also suggests an alternative time: the original stays Declined permanently, and
  the alternative becomes a new, separate linked request with the responder and sender roles
  reversed (see Clarifications).
- The other parent going offline partway through responding.
- A phone clock running ahead of or behind the server's clock (User Story 3, scenario 2).
- A request that lapses while its sender is offline and cannot see the outcome yet.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show the court-ordered parenting plan as the original schedule,
  MUST offer no way to edit or delete an original-plan entry, and, when a change is proposed or
  agreed for an event, MUST show the original entry next to it. (REQ-01)
- **FR-002**: When a parent opens the app, the system MUST show on the first screen, with no
  further navigation, the next exchange (date, time, location, whose time begins), every pending
  request involving that parent, and every action waiting on that parent; if nothing is waiting,
  it MUST say "Nothing is waiting for you." The first screen is a summary (Home) shown whenever
  the app opens. It is separate from the three areas, which the system MUST keep separate:
  Schedule shows original-plan entries and agreed changes by date; Requests lists every request
  with its status and notice label; History lists every Case Record Entry in time order. The
  currently selected parent MUST have a persistent, visually distinct label. (REQ-02, F-7)
- **FR-003**: When a parent submits a change request, the system MUST require the affected
  event, a proposed new date/time, and a non-empty reason (an alternative date is optional). If a
  required field is missing, the system MUST NOT send the request and MUST name the missing
  field (for example "Add a reason for the change"). If the affected event has already started,
  the system MUST NOT send the request and MUST show "This exchange has already started, so it
  can't be changed." If the affected event already has a Pending request, the system MUST NOT
  send the new request and MUST show "This exchange already has a pending request. It needs a
  response or a withdrawal first." until the first one is resolved (Agreed, Declined, Withdrawn,
  or Lapsed). After a successful submission, the system MUST show "Request submitted" and open
  the Requests area containing the new request. (REQ-03, F-8)
- **FR-004**: When the server receives a request, the system MUST calculate official notice as
  the affected event's start time minus the server-received time, in whole hours rounded down.
  Notice under 48 hours MUST be labelled "Short notice: N h at server (plan asks for 48 h)" and
  still delivered; notice of 48 hours or more MUST be labelled "N h notice at server." If the
  device-written figure differs from the server figure, the system MUST also show "written M h
  before (device time, not verified)." The system MUST NOT stop a request because of its notice.
  [NEEDS CLARIFICATION: Q-3. V2 keeps the trusted server figure official and shows the device
  figure as unverified context. Stakeholders have not confirmed which figure should count.]
  [NEEDS CLARIFICATION: Q-1, whether the parenting plan itself permits a short-notice change
  when both parents agree in writing has not been confirmed with Melissa or against the court
  order; V1 allows and labels short notice per decision X-1 without resolving this.] (REQ-04)
- **FR-005**: Each request held by the server MUST have exactly one status: Pending, Agreed, Declined, Withdrawn,
  or Lapsed. Only the responding parent explicitly accepting MUST make a request Agreed, no
  timeout, edit, or other system action may. While Pending, the system MUST show the original
  schedule as the one in force, marked "Change proposed, waiting for response," and MUST NOT word
  it as a refusal, a decision, or a missed weekend. While Pending, the sending parent MAY withdraw
  the request. Withdraw MUST only be offered while the request is Pending; once it is Agreed,
  Declined, Withdrawn or Lapsed the control is not shown. An item that exists only on the sender's
  device MUST show "Not sent yet" instead of a request status. (REQ-05, F-2)
- **FR-006**: From the first screen, the responding parent MUST be able to accept or decline a
  pending request in no more than two actions: Accept then Confirm, or Decline then Confirm.
  Typing the decline reason on the confirm step doesn't count as an extra action. Adding an
  optional alternative is an extra step and is outside the two-action limit. A decline MUST require a reason, and the original
  request's status MUST become Declined and MUST stay Declined permanently. A decline MAY also
  include a suggested alternative; if given, the system MUST create it as a new, separate Change
  Request linked to the declined one, with the original responding parent as its proposer and
  the original sending parent as its responder (subject to FR-003's one-Pending-request-per-entry
  rule). The alternative datetime control MUST retain and display the value entered until the
  response is confirmed or cancelled. A parent MUST NOT be able to respond to their own request.
  (REQ-06, F-10)
- **FR-007**: When a request becomes Agreed, the system MUST, in the same update, show the
  change on the calendar as a separate entry labelled "Agreed change," and keep the original
  entry visible, marked "Changed by agreement, original kept." The request counts as the sending
  parent's written confirmation, and the acceptance counts as the responding parent's. (REQ-07)
- **FR-008**: While a request is Pending, and either 48 hours have passed since the server
  received it or the affected event is less than 24 hours away, the system MUST show "Awaiting
  response, overdue" to both parents, with the status staying Pending. The sending parent MAY add
  a written follow-up linked to the request. A follow-up MUST have non-empty text; there is no
  limit on how many follow-ups a request can have. If the event starts while the request is still
  Pending, the system MUST set the status to Lapsed and show "No response before the exchange,
  original schedule applied."
  [NEEDS CLARIFICATION: Q-2 / assumption A-4, the 48-hour-or-24-hours-out overdue threshold is
  V1's working definition; Melissa referred to a "notice period" for replies but never gave a
  number, so stakeholders have not confirmed this threshold.] (REQ-08)
- **FR-009**: For every request, response, and follow-up, the system MUST record and show,
  separately: the written time (the phone's time, always labelled "device time, not verified"),
  the time received by the server (the trusted time), the time delivered to the other parent's
  app, and the time read by the other parent. An item waiting because the recipient is offline
  MUST show "Waiting to be delivered (other parent offline)." If delivery fails, the system MUST
  show "Not delivered" with the server time of the failure and MUST NOT show it as delivered or
  read. The sender MUST be able to retry a failed delivery. A successful retry MUST append a
  delivered event without deleting the failure. Rendering an item in a list MUST NOT mark it
  read. The recipient MUST explicitly open its request details before read is recorded. Every
  time except "written" MUST come from the server clock. (REQ-09, REQ-11, F-3, F-4, F-5)
- **FR-010**: While a parent's phone is offline, the system MUST save anything they submit on the
  phone and show "Saved on this device, not sent yet", "Not sent yet" in place of status, and its
  written time labelled "device time, not verified". When the connection
  returns, the system MUST send saved items in the order they were written and record each one's
  server-received time at that moment. The other parent MUST NOT see a saved item, and it MUST
  NOT show as sent, until the server has it. Saved items MUST survive closing and reopening the
  app. If sending still fails after the connection returns, the item MUST stay saved with the
  same message and be retried on the next connection; it MUST NOT be dropped or shown as sent.
  (REQ-10)
- **FR-011**: The system MUST record every action as a new event with its author, the action, and
  the server time; actions include create, edit, withdraw, accept, decline, follow-up, dispute
  note, delivered, and read. When the sender edits a pending request, the system MUST keep the
  original values and show the edit as a new event (e.g., "Edited by Jason at 14:05: proposed
  time 18:00 to 19:00"); if the edit happens after the other parent has read the request, the
  system MUST additionally show "Edited after Melissa read it." A sender MAY edit only the
  proposed date/time and the optional alternative date on a Pending request; the affected event,
  the reason and any emergency tag are fixed once submitted, and no edit control is offered for
  them. There MUST be no way to delete or overwrite a recorded event. (REQ-11)
- **FR-012**: Text the system writes MUST only say who did what and when. This applies to every
  label, status and message, including overdue, lapsed, notice and delivery messages. It MUST NOT
  contain any of these words: late, unreliable, failed, ignored, refused, missed, no-show (the
  list is closed, so a test can check for each one; "overdue" describes the request, not a
  person, and is allowed). The system
  MUST NOT show any count, score, or ranking of a parent's requests, declines, short-notice
  requests, or response times. Both parents MUST get the same labels, rules, and layout. (REQ-12)
- **FR-013**: When a parent opens a scheduled event, the system MUST show, in time order and in
  one view: the original entry, every request for it with its notice label, every response,
  follow-up, and dispute note with their times, the current outcome, and the audit events. Each
  event description and timestamp MUST appear on a separate readable line at 375 px width.
  (REQ-13, F-9)
- **FR-014**: When creating a request, a parent MAY tag it "Unexpected child illness" or "Genuine
  emergency". "Tag" is the field the parent sets; "claim" is how the system displays it. A tagged
  request MUST require a reason, and a missing one is handled by FR-003 ("Add a reason for the
  change"). The tag and any overdue or lapsed wording are shown side by side and never replace
  each other. The system MUST show the tag as "Emergency
  claimed by Jason" (or Melissa) without checking the claim, and MUST NOT change the calendar or
  the status because of it. The other parent MAY add a written note disputing the claim, recorded
  under FR-011 and shown with the request. A dispute note MUST have non-empty text; there is no
  limit on how many can be added.
  [NEEDS CLARIFICATION: Q-4, what counts as a "formal decision" able to override the schedule,
  and who would record it, has not been defined; X-5 settles that an emergency claim alone never
  changes the calendar, but the override mechanism itself is explicitly out of V1's decided
  scope.] (REQ-14)

### Key Entities

- **Parent**: one of the two account holders on a case (Melissa or Jason in the mock data); can
  create requests, respond to the other parent's requests, and view the shared record.
- **Original Schedule Entry**: a court-ordered exchange (date, time, location, whose time
  begins); permanent and never editable or deletable.
- **Change Request**: a proposal to change one original (or previously agreed) entry; carries the
  proposing parent, the affected entry, the proposed new time, an optional alternative, a reason,
  an optional emergency tag, its notice label, and its status. While Pending, only the proposed
  time and the optional alternative can be edited; the affected entry, the reason and any emergency tag are fixed.
- **Response**: the responding parent's accept or decline, a required reason on decline, and an
  optional suggested alternative that becomes a new, separate Change Request linked to the
  declined one, with proposer and responder roles reversed from the original.
- **Follow-up**: a written note the sending parent adds to a still-pending request.
- **Dispute Note**: a written note the other parent adds disputing an emergency claim.
- **Case record**: the whole append-only list of Case Record Entries for the case. "The record"
  in this spec always means this list.
- **Case Record Entry**: one append-only audit event (create, edit, withdraw, accept, decline,
  follow-up, dispute note, delivered, read) with its author and server time.
- **Notice Label**: the derived, shown fact describing how much notice a request gave, computed
  once and never changed by later events.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A parent can accept or decline a pending request in two actions or fewer, starting
  from the first screen, in 100% of tested cases.
- **SC-002**: Across all notice thresholds tested (including exactly 48 hours, just under it, and
  well under it), 100% of requests are delivered regardless of how little notice they give.
  The 48-hour figure is working assumption A-3 (see FR-004), not a confirmed value.
- **SC-003**: In every tested scenario, including a request left unanswered for days, a request
  only shows as Agreed when the responding parent explicitly accepted it, never from a timeout,
  edit, or other automated action.
- **SC-004**: Every entry created during testing carries a visible author and a server-assigned
  time, and no test can produce an entry that is edited or removed in place rather than appended
  as a new event.
- **SC-005**: A review of all system-generated text produced during testing finds zero occurrences
  of the closed word list in FR-012 and zero counts, scores, or rankings of a parent's behavior; the same
  situation produces identical wording for both parents.
- **SC-006**: Every acceptance scenario listed in this specification has one corresponding
  automated test, named with the REQ ID it checks.
- **SC-007**: Every in-scope screen is usable at a 375px viewport width: the page is no wider
  than the viewport (no horizontal scrollbar) and every label and button is fully visible.

## Acceptance Examples (exact values)

These are the Gherkin scenarios from `docs/initial-spec.md`, copied word for word. The user stories above summarise them; when the two differ in wording, these exact values are what the automated tests (SC-006) must check.

#### REQ-01 Original plan kept and shown next to changes

```gherkin
Scenario: Agreed swap shown next to the original
  Given Jason's original weekend starts Fri 20 Nov 2026 18:00
  And Melissa has accepted Jason's request to move it to Fri 27 Nov 2026 18:00
  When either parent opens Fri 20 Nov
  Then the original entry "Fri 20 Nov 18:00, Jason's weekend (court plan)" is still shown
  And next to it "Moved to Fri 27 Nov 18:00, agreed by both parents" is shown

Scenario: Original entries can't be edited
  When either parent views an original-plan entry
  Then no edit or delete action is offered
```

#### REQ-02 First screen shows the current state and waiting actions

```gherkin
Scenario: Jason sees the waiting action first
  Given Melissa sent a request that Jason hasn't answered
  When Jason opens the app
  Then the first screen shows "Waiting for you: respond to Melissa's request for Sat 21 Nov"
  And it shows "Next exchange: Fri 20 Nov 18:00, school parking area, Jason's weekend begins"

Scenario: Nothing waiting
  Given no request is waiting for Melissa
  When Melissa opens the app
  Then the first screen shows "Nothing is waiting for you."
```

#### REQ-03 Create a change request

```gherkin
Scenario: Missing reason
  When Jason submits a request for Fri 20 Nov with a proposed time and no reason
  Then the request is not sent
  And "Add a reason for the change" is shown
```

#### REQ-04 Notice is recorded, never used to block

```gherkin
Scenario Outline: Notice label around the 48-hour threshold
  Given the affected exchange starts Fri 20 Nov 2026 18:00
  When the server receives Jason's request at <received>
  Then the request shows "<label>"
  And the request is delivered to Melissa
  Examples:
    | received         | label                                         |
    | Wed 18 Nov 18:00 | 48 h notice given                             |
    | Wed 18 Nov 18:01 | Short notice: 47 h given (plan asks for 48 h) |
    | Tue 17 Nov 18:00 | 72 h notice given                             |
    | Fri 20 Nov 15:00 | Short notice: 3 h given (plan asks for 48 h)  |
```

#### REQ-05 Request status, where silence never means yes

```gherkin
Scenario: Silence never agrees
  Given Jason's request has been Pending for 5 days with no response
  Then its status is still "Pending"
  And the calendar shows the original schedule in force
```

#### REQ-06 Respond in two steps

```gherkin
Scenario: Two-step accept
  Given Melissa is on the first screen with Jason's pending request showing
  When she taps "Accept" and then "Confirm"
  Then the request status is "Agreed"

Scenario: Decline needs a reason
  When Melissa declines without a reason
  Then the decline isn't saved and "Add a reason for declining" is shown
```

#### REQ-08 Unanswered requests stay visible

```gherkin
Scenario Outline: Overdue flag
  Given the exchange starts Mon 30 Nov 18:00
  And the server received the request at Wed 25 Nov 10:00
  When it is <now> and nobody has responded
  Then the overdue flag is <flag>
  Examples:
    | now              | flag |
    | Fri 27 Nov 09:59 | off  |
    | Fri 27 Nov 10:00 | on   |
```

#### REQ-09 Separate, honest timestamps

```gherkin
Scenario: Phone clock is wrong
  Given Jason's phone clock is 2 hours fast
  When he writes and sends a request with signal at server time 10:00
  Then "Written 12:00 (device time, not verified)" is shown
  And "Received by server 10:00" is shown
  And notice is calculated from 10:00
```

#### REQ-10 Nothing is lost without signal

```gherkin
Scenario: Truck stop with no signal (tests X-3)
  Given the exchange starts Fri 20 Nov 18:00
  And Jason is offline
  When he writes a swap request at Wed 18 Nov 16:00
  Then he sees "Saved on this device, not sent yet"
  And Melissa doesn't see the request
  When his signal returns at Wed 18 Nov 20:00
  Then the server receives it at Wed 18 Nov 20:00
  And it shows "Short notice: 46 h given (plan asks for 48 h)"
  And it shows "Written Wed 18 Nov 16:00 (device time, not verified)"
```

#### Added during checklist review (from clarifications A-9 and A-10, and the 24-hour overdue boundary)

The 48-hour and 24-hour values in these examples come from working assumptions A-3 and A-4.

```gherkin
Scenario Outline: Overdue flag at the 24-hour-before-exchange boundary (REQ-08)
  Given the exchange starts Mon 30 Nov 18:00
  And the server received the request at Sat 28 Nov 20:00
  When it is <now> and nobody has responded
  Then the overdue flag is <flag>
  Examples:
    | now              | flag |
    | Sun 29 Nov 18:00 | off  |
    | Sun 29 Nov 18:01 | on   |

Scenario: Second request for the same exchange (REQ-03, A-9)
  Given Jason has a Pending request for Fri 20 Nov
  When Melissa submits a new request for Fri 20 Nov
  Then the new request is not sent
  And "This exchange already has a pending request. It needs a response or a withdrawal first." is shown

Scenario: Decline with an alternative (REQ-06, A-10)
  Given Jason's request to move Fri 20 Nov to Fri 27 Nov is Pending
  When Melissa declines with the reason "Kids have a school event that weekend" and suggests Sat 21 Nov 10:00
  Then Jason's request is Declined and stays Declined
  And a new Pending request exists from Melissa to Jason for Sat 21 Nov 10:00, linked to the declined one
  And only Jason can accept or decline the new request
```

### V2 acceptance examples from V1 evaluation

```gherkin
Scenario: Offline item has no server status (F-1, F-2)
  Given Jason is offline
  When he submits a request at Wed 18 Nov 16:00
  Then he sees "Saved on this device, not sent yet"
  And he sees "Not sent yet" instead of "Status: Pending"
  And he sees "Written 16:00 (device time, not verified)"

Scenario: Reading requires an explicit open (F-3)
  Given Jason's request was delivered to Melissa at 09:00
  When Melissa views Home without opening the request details
  Then the request is not marked Read
  When Melissa opens the request details
  Then the request shows "Read 09:00"

Scenario: Waiting and failed delivery are distinct (F-4, F-5)
  Given Melissa is offline when Jason sends a request
  Then Jason sees "Waiting to be delivered (other parent offline)"
  When delivery is attempted and fails at 09:00
  Then Jason sees "Not delivered 09:00"
  And Jason can retry the delivery
  When retry succeeds
  Then a delivered event is added and the failure event remains in History

Scenario: Truck-stop notice shows trusted and contextual figures (F-6)
  Given the exchange starts Fri 20 Nov 2026 18:00
  And Jason writes offline at Wed 18 Nov 2026 16:00
  When the server receives the request at Wed 18 Nov 2026 20:00
  Then it shows "Short notice: 46 h at server (plan asks for 48 h); written 50 h before (device time, not verified)"
  And the official threshold result remains based on 46 h at server

Scenario: Successful submission is visible (F-8)
  When Jason successfully submits a request
  Then he sees "Request submitted"
  And the Requests area opens with the new request visible
```

## Revision history

- V2, F-1: FR-010 now requires the written time on an unsent item.
- V2, F-2: FR-005 now reserves request statuses for server-held requests and uses "Not sent yet" before receipt.
- V2, F-3: FR-009 and A-12 require an explicit request-detail open before recording read.
- V2, F-4: FR-009 and A-13 distinguish waiting for an offline recipient from delivery failure.
- V2, F-5: FR-009 and A-15 add recoverable failed delivery while keeping append-only evidence.
- V2, F-6: FR-004 shows the trusted server notice and the unverified written-time context together; Q-3 remains open.
- V2, F-7 to F-10: FR-002, FR-003, FR-006 and FR-013 clarify the low-risk usability behavior found in V1.
- V2 verification, F-11 to F-14: no spec change. Using V2 in a browser found four implementation defects against FR-002, FR-003 and FR-009 to FR-012 as already written (delivery on reconnect, separate delivered and read lines, the confirmation shown to the wrong parent, raw labels in History). They were fixed in code under tasks T083 to T086.

## Out of Scope

Carried forward from `docs/initial-spec.md` §7 and `docs/goal-model.md` §2 (deferred slices
D–J): recording actual exchanges (completed/refused/missed pickups), expenses and expense
disputes, exports and mediator/reviewer access, school and doctor notices, tone warnings, the
child's own view, phone calls, general chat not tied to a request, real sign-in, and push
notifications. Each stays in the goal model for a later sprint; none of it is built here.

## Assumptions

- **A-1**: One case, two parents; sign-in is mocked as a "Viewing as Melissa / Jason" switch
  (used by FR-002).
- **A-2**: The server is simulated inside the app; its clock is the trusted time, and a phone's
  clock can be shifted to demonstrate skew (used by FR-009, FR-011).
- **A-3** *(flagged, see FR-004)*: notice is measured as the affected event's start time minus
  the server-received time. This is a documented working assumption, not a confirmed answer , 
  see the [NEEDS CLARIFICATION: Q-3] note on FR-004.
- **A-4** *(flagged, see FR-008)*: a request is overdue after 48 hours with no answer, or once
  the event is less than 24 hours away, whichever comes first. This is a documented working
  assumption, not a confirmed answer, see the [NEEDS CLARIFICATION: Q-2] note on FR-008.
- **A-5**: a request can claim no emergency, an unexpected child illness, or a genuine emergency;
  the system records the claim and never judges it (used by FR-014).
- **A-6**: mock data uses only the invented names Melissa and Jason, with no real addresses,
  phone numbers or emails (this is how NFR-02 is checked). The mock schedule is alternating weekends starting November 2026, pickup Friday 18:00 at
  the school parking area, drop-off Sunday 18:00 (used by FR-001).
- **A-7**: "read" means the other parent opened the request in the app (used by FR-009).
- **A-8**: only messages tied to a specific request (its reason, the response, follow-ups) are in
  scope; general chat not tied to a request is not (used by FR-009).
- **A-12**: "read" means the recipient explicitly opens the request details. Rendering a card in
  Home or Requests does not count. This replaces A-7 for V2 (F-3, FR-009).
- **A-13**: "Waiting to be delivered (other parent offline)" is a delivery state distinct from
  the failure state "Not delivered" (F-4, FR-009).
- **A-14**: an item that exists only on the sender's device has no server request status. It shows
  "Not sent yet" and its unverified written time (F-1, F-2, FR-005, FR-010).
- **A-15**: a failed delivery can be retried by the sender. Retry adds new delivery evidence and
  never removes the failure event (F-5, FR-009, FR-011).
- **Decisions carried forward, not re-opened by this spec** (`docs/goal-model.md` §5.3):
  - **X-1**: short notice is allowed and labelled, and still needs both parents to agree
    (FR-004, FR-005).
  - **X-2**: server time is official; phone time is shown as unverified alongside it (FR-009).
  - **X-3**: the trusted server figure remains official. V2 also shows the written figure as
    unverified context when the two differ. Q-3 stays open (FR-004, FR-010, F-6).
  - **X-4**: outcome wording describes what happened and who acted, never what a person is
    like, and nothing is counted (FR-005, FR-012).
  - **X-5**: an emergency claim never changes the calendar by itself; what a "formal decision"
    override would look like is still open (FR-014).
  - X-6 and X-7 concern deferred slices (tone warnings, phone calls) and are out of scope here.
- **Open questions not resolved by this spec** (`docs/goal-model.md` §6): Q-1 (does the court
  order allow a short-notice change if both parents agree?), Q-2 (how long is the real reply
  window before "overdue"?), Q-3 (should notice count from written time or server time?), and
  Q-4 (what is a "formal decision" that could override the schedule, and who records it?). All
  four are marked `[NEEDS CLARIFICATION]` above against the requirement they affect and are
  deliberately left unresolved pending stakeholder input.
