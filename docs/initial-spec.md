# Initial specification (Sprint 1)

Feature: a parent asks to change the custody schedule, and both parents can trust the record of what happened.
Prototype name: CoParent Record

We wrote this by hand from `docs/goal-model.md` before using Spec Kit, and it's the input we gave to `/speckit-specify`. It says what the system must do and why. Technology choices are left to the plan.

## 1. Problem

Melissa and Jason share custody under a court-ordered parenting plan, and they agree schedule changes over text and email. It goes wrong in a few predictable ways:

- A request sits unanswered until it's too late to act on (E-28).
- A request sent in good time gets treated as "making plans without permission" (E-29).
- A message written with no signal arrives hours later and looks late (E-62, E-36).
- When they disagree about what was agreed, each side brings screenshots (E-31, E-39).

Ruth, their mediator, can't rely on a record that either parent can quietly edit, or on times taken from a phone (E-32, E-38).

## 2. Goals in scope

These are sprint goals SP-1 to SP-9 from `docs/goal-model.md` section 3.

- SP-1: the original court plan is kept and shown next to any change.
- SP-2: each parent sees the current state and anything waiting on them straight away, and can respond in two steps.
- SP-3: only changes both parents confirm in writing count as agreed.
- SP-4: the notice given is recorded as a fact, and a request is never blocked for it.
- SP-5: unanswered requests stay visible and pending.
- SP-6: recorded times match what really happened.
- SP-7: the record can't be quietly changed.
- SP-8: the record is neutral and the same for both parents.
- SP-9: one event shows its whole history.

## 3. Requirements

Requirements use EARS wording. The acceptance scenarios use Gherkin, with examples at, just below and just above each threshold. Every requirement lists the goals and evidence it comes from.

### REQ-01 Original plan kept and shown next to changes
Goals: SP-1 (S-G-3 to 6, K-G-3). Evidence: E-04, E-05, E-06, E-25.

- The system shall show the court-ordered parenting plan as the original schedule.
- The system shall not offer any way to edit or delete an original-plan entry.
- When a change to an event is proposed or agreed, the system shall show the original entry next to it.

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

### REQ-02 First screen shows the current state and waiting actions
Goals: SP-2 (S-G-57, 58, 61, K-G-78). Evidence: E-03, E-07, E-08, E-10, E-11, E-56.

- When a parent opens the app, the system shall show on the first screen, without further navigation: the next exchange (date, time, location, whose time begins), every pending request involving that parent, and every action waiting for that parent.
- If nothing is waiting for that parent, the system shall say "Nothing is waiting for you."
- The system shall keep the Schedule, Requests and History areas separate (O-6).

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

### REQ-03 Create a change request
Goals: SP-3 (S-G-9, K-G-32). Evidence: E-12, E-13, E-14.

- When a parent submits a change request, the system shall require the affected event, a proposed new date and time, and a non-empty reason. An alternative date is optional.
- If a required field is missing, the system shall not send the request and shall name the missing field.
- If the affected event has already started, the system shall not send the request and shall say so.

```gherkin
Scenario: Missing reason
  When Jason submits a request for Fri 20 Nov with a proposed time and no reason
  Then the request is not sent
  And "Add a reason for the change" is shown
```

### REQ-04 Notice is recorded, never used to block
Goals: SP-4 (S-G-19, 20, 74, 147, 168, K-G-4, 5, 23, 35). Evidence: E-15 to E-19. Decisions: X-1, X-3. Assumption: A-3.

- When the server receives a request, the system shall calculate notice as the start of the affected event minus the server-received time, in whole hours rounded down, and show it on the request.
- If notice is under 48 hours, the system shall label the request "Short notice: N h given (plan asks for 48 h)" and still deliver it.
- If notice is 48 hours or more, the system shall label it "N h notice given".
- The system shall not stop a request from being sent because of its notice.

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

### REQ-05 Request status, where silence never means yes
Goals: SP-3 (S-G-7, 11, 16, 18, K-G-31, 49). Evidence: E-21, E-22, E-23, E-74. Decisions: O-1, X-4.

- Each request shall have exactly one status: Pending, Agreed, Declined, Withdrawn or Lapsed.
- Only the responding parent accepting shall make a request Agreed. No timeout, edit or system action shall.
- While a request is Pending, the system shall show the original schedule as the one in force, marked "Change proposed, waiting for response", and shall not word it as a refusal, a decision or a missed weekend.
- While a request is Pending, the parent who sent it may withdraw it.

```gherkin
Scenario: Silence never agrees
  Given Jason's request has been Pending for 5 days with no response
  Then its status is still "Pending"
  And the calendar shows the original schedule in force
```

### REQ-06 Respond in two steps
Goals: SP-2, SP-3 (S-G-14, 60, 73, 161, K-G-33). Evidence: E-09, E-14, E-24.

- From the first screen, the responding parent shall be able to accept or decline a pending request in no more than two actions.
- If the parent declines, the system shall require a reason. They may also suggest an alternative, which becomes a new request linked to the first.
- A parent shall not be able to respond to their own request.

```gherkin
Scenario: Two-step accept
  Given Melissa is on the first screen with Jason's pending request showing
  When she taps "Accept" and then "Confirm"
  Then the request status is "Agreed"

Scenario: Decline needs a reason
  When Melissa declines without a reason
  Then the decline isn't saved and "Add a reason for declining" is shown
```

### REQ-07 An agreed change appears straight away, next to the original
Goals: SP-3 (S-G-6, 8, 13, 160, K-G-22, 24). Evidence: E-06, E-25.

- When a request becomes Agreed, the system shall, in the same update, show the change on the calendar as a separate entry labelled "Agreed change", and keep the original entry visible, marked "Changed by agreement, original kept".
- The request counts as the sending parent's written confirmation, and the acceptance counts as the other parent's.

### REQ-08 Unanswered requests stay visible
Goals: SP-5 (S-G-15, 17, 169, K-G-47). Evidence: E-26, E-27, E-28. Decision: O-7. Assumption: A-4.

- While a request is Pending, and either 48 hours have passed since the server received it or the event is less than 24 hours away, the system shall show "Awaiting response, overdue" to both parents. The status stays Pending.
- While a request is Pending, the sending parent may add a written follow-up linked to it.
- If the event starts while the request is still Pending, the system shall set the status to Lapsed and show "No response before the exchange, original schedule applied".

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

### REQ-09 Separate, honest timestamps
Goals: SP-6 (S-G-80 to 83, 119, 148, K-G-36 to 39, 72). Evidence: E-30 to E-34, E-59, E-62. Decisions: O-2, X-2. Assumptions: A-2, A-7, A-8.

- For every request, response and follow-up, the system shall record and show these separately:
  - written: the phone's time, always labelled "device time, not verified"
  - received by the server: the trusted time
  - delivered to the other parent's app
  - read by the other parent
- If delivery fails, the system shall show "Not delivered" with the server time of the failure, and never show the item as delivered or read.
- Every time except "written" shall come from the server clock.

```gherkin
Scenario: Phone clock is wrong
  Given Jason's phone clock is 2 hours fast
  When he writes and sends a request with signal at server time 10:00
  Then "Written 12:00 (device time, not verified)" is shown
  And "Received by server 10:00" is shown
  And notice is calculated from 10:00
```

### REQ-10 Nothing is lost without signal
Goals: SP-6 (S-G-84, 90, K-G-36). Evidence: E-35, E-36, E-37. Dependency: D-4.

- While a parent's phone is offline, the system shall save anything they submit on the phone and show "Saved on this device, not sent yet" with its written time.
- When the connection comes back, the system shall send saved items in the order they were written, and record each one's server-received time at that moment.
- The other parent shall not see a saved item, and it shall not show as sent, until the server has it.
- Saved items shall survive closing and reopening the app.

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

### REQ-11 Append-only record with an author on every entry
Goals: SP-7 (S-G-117, 120 to 123, K-G-7, 10, 11). Evidence: E-38 to E-42, E-75. Decisions: O-3, O-8. Dependency: D-1.

- The system shall record every action as a new event with its author, the action and the server time. Actions are: create, edit, withdraw, accept, decline, follow-up, dispute note, delivered and read.
- When the sender edits a pending request, the system shall keep the original values and show the edit as a new event, for example "Edited by Jason at 14:05: proposed time 18:00 to 19:00".
- If the edit happens after the other parent has read the request, the system shall show "Edited after Melissa read it".
- There shall be no way to delete or overwrite a recorded event.

### REQ-12 Neutral wording, same rules for both parents
Goals: SP-8 (S-G-106, 109, 142, 149, K-G-25, 46). Evidence: E-43 to E-46. Decisions: O-5, X-4.

- Text the system writes shall only say who did what and when. It shall not use judging words such as late, unreliable, failed to, ignored, refused, missed or no-show.
- The system shall not show any count, score or ranking of a parent's requests, declines, short-notice requests or response times.
- Both parents shall get the same labels, rules and layout.

### REQ-13 One event shows its whole history
Goals: SP-9 (S-G-32, 33, K-G-23, 52). Evidence: E-47, E-48.

- When a parent opens a scheduled event, the system shall show in time order, in one view: the original entry, every request for it with its notice label, every response, follow-up and dispute note with their times, the current outcome, and the audit events.

### REQ-14 Emergency claims are recorded, never judged
Goals: SP-4 (S-G-21 to 24, 170). Evidence: E-15, E-20, E-61. Decision: X-5. Assumption: A-5.

- When creating a request, a parent may tag it "Unexpected child illness" or "Genuine emergency". A tagged request needs a reason.
- The system shall show the tag as "Emergency claimed by Jason" (or Melissa). It shall not check the claim, and it shall not change the calendar or the status because of it.
- The other parent may add a written note disputing the claim. The note is recorded under REQ-11 and shown with the request.

## 4. Non-functional requirements

- NFR-01: every screen in scope works on a 375 px wide phone screen, since Jason uses the app on the road (E-37).
- NFR-02: the prototype uses mock data only, with no real personal information.
- NFR-03: every acceptance scenario has an automated test named with its REQ ID.

## 5. Assumptions, dependencies and edge cases

Assumptions A-1 to A-8 and dependencies D-1 to D-5 are in `docs/goal-model.md` sections 5.2 and 6. A-3 and A-4 are the riskiest. REQ-11 and the trusted clock have to exist before REQ-04, 05, 07, 08 and 09.

Edge cases the build has to handle:
- a request for an event that has already started
- notice of exactly 48 hours
- an edit made after the other parent has read the request
- two requests for the same event at once
- a decline that suggests an alternative
- the other parent going offline halfway through replying
- a phone clock ahead of or behind the server
- a request that lapses while its sender is offline

## 6. Decisions on overlaps and conflicts

- X-1: short notice is allowed and labelled, and still needs both parents to agree (REQ-04, REQ-05).
- X-2: server time is the official time, and the phone time is shown as unverified (REQ-09).
- X-3: notice is counted from the server-received time, with the written time shown next to it. This is still open, and V1 tests it (REQ-04, REQ-10).
- X-4: statuses describe what happened, not the person, and nothing is counted (REQ-05, REQ-12).
- X-5: an emergency claim never changes the calendar. How an override should work is still open (REQ-14).
- X-6, X-7: outside this sprint, kept in the goal model.
- O-1 to O-8: as decided in `docs/goal-model.md` section 5.1.

## 7. Out of scope

Recording actual exchanges, expenses, exports and reviewer access, school and doctor notices, tone warnings, the child's view, phone calls, general chat not tied to a request, real sign-in and push notifications. See `docs/goal-model.md` section 7.
