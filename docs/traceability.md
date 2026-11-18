# Requirements traceability

## How to read this file

This file connects each requirement to the interview evidence and goal that motivated it, the matching Spec Kit requirement, and the code and automated test that implement it. The status describes conformance to the V1 specification, not whether the requirement is the right final requirement. We evaluated all 12 handover scenarios on the deployed V1. The coverage table distinguishes passed scenarios from partial checks and remaining gaps. The V2 sections at the end record what changed and the results of the same scenarios on V2.

## V1 matrix

| Requirement | Interview evidence | Goal model reference | Spec ID | Code / implementation | V1 status |
|---|---|---|---|---|---|
| REQ-01 Original plan kept and shown next to changes | E-04 K-M:3, E-05 S-M2:25, E-06 S-M1:41, E-25 S-M1:24 | SP-1 <- S-G-3, S-G-4, S-G-5, S-G-6, K-G-3 | FR-001 | `frontend/src/domain/schedule.ts` -> `getScheduleEntries()`; `frontend/src/domain/record.ts` -> `getSchedule()`; `frontend/src/app/Schedule.tsx`; `frontend/tests/domain/req-01.test.ts` | Fully satisfied. Automated tests pass, and scenarios 1 and 3 confirmed the original and agreed entries in Schedule. |
| REQ-02 First screen shows current state and waiting actions | E-03 S-R1:77, E-07 S-M2:31, E-08 S-J1:90, E-10 S-M2:31, E-11 K-R:58 | SP-2 <- S-G-57, S-G-58, S-G-61, K-G-78 | FR-002 | `frontend/src/domain/record.ts` -> `getHomeSummary()`, `getHistory()`; `frontend/src/app/Home.tsx`, `Requests.tsx`, `History.tsx`; `frontend/tests/domain/req-02.test.ts` | Fully satisfied against the stated V1 behavior. Scenario 1 passed. F-7 and F-8 remain usability candidates. |
| REQ-03 Create a change request | E-12 S-M1:41, E-13 S-J1:31, E-14 K-J:11 | SP-3 <- S-G-9, K-G-32 | FR-003 | `frontend/src/domain/requests.ts` -> `createRequest()`; `frontend/src/app/RequestForm.tsx`; `frontend/tests/domain/req-03.test.ts` | Fully satisfied. Scenario 2 confirmed missing-reason validation and successful submission. |
| REQ-04 Notice recorded, never used to block | E-15 S-M2:17, E-16 K-M:7, E-17 K-M:7, E-18 S-J2:18, E-19 K-J:9 | SP-4 <- S-G-19, S-G-20, S-G-74, S-G-147, K-G-4, K-G-5, K-G-35 | FR-004 | `frontend/src/domain/clock.ts` -> `wholeHoursBetween()`; `frontend/src/domain/requests.ts` -> `getChangeRequest()`, `createRequest()`; `frontend/src/copy/strings.ts`; `frontend/tests/domain/req-04.test.ts` | Fully satisfied against the V1 rule. Browser checks covered 105 h, 50 h, 48 h and 47 h, including the 47 h warning. F-6 shows that X-3 remains unresolved. The exact 72 h and 3 h browser examples remain a coverage gap, although their automated tests pass. |
| REQ-05 Request status, silence never means yes | E-21 S-M2:29, E-22 S-M2:42, E-23 S-J1:58, E-74 S-M1:58 | SP-3 <- S-G-7, S-G-11, S-G-16, S-G-18, K-G-31, K-G-49 | FR-005 | `frontend/src/domain/requests.ts` -> `getChangeRequest()`, `getQueuedRequestViews()`, `withdrawRequest()`; `frontend/src/domain/record.ts` -> `getSchedule()`; `frontend/src/app/RequestCard.tsx`; `frontend/tests/domain/req-05.test.ts` | Fully satisfied for server-held requests. Confirmed F-2 exposes an unspecified pre-server state. |
| REQ-06 Respond in two steps | E-09 S-M2:31, E-14 K-J:11, E-24 S-J2:20 | SP-2, SP-3 <- S-G-14, S-G-60, S-G-73, S-G-161, K-G-33 | FR-006 | `frontend/src/domain/requests.ts` -> `respond()`; `frontend/src/app/RequestCard.tsx`; `frontend/tests/domain/req-06.test.ts`, `frontend/tests/app/respond-flow.test.tsx` | Partially satisfied in browser evaluation. Acceptance passed, and decline was reached, but the alternative datetime could not be completed reliably. Automated domain and response-flow tests pass. See F-10. |
| REQ-07 Agreed change appears straight away next to the original | E-06 S-M1:41, E-25 S-M1:24 | SP-3 <- S-G-6, S-G-8, S-G-13, S-G-160, K-G-22, K-G-24 | FR-007 | `frontend/src/domain/requests.ts` -> `respond()`; `frontend/src/domain/record.ts` -> `getSchedule()`; `frontend/src/app/Schedule.tsx`; `frontend/tests/domain/req-07.test.ts` | Fully satisfied. Scenario 3 confirmed that acceptance changed the status to Agreed and displayed the agreed change in Schedule. |
| REQ-08 Unanswered requests stay visible | E-26 S-M2:29, E-27 S-M1:60, E-28 K-J:13 | SP-5 <- S-G-15, S-G-17, S-G-169, K-G-47 | FR-008 | `frontend/src/domain/requests.ts` -> `getChangeRequest()`, `addFollowUp()`; `frontend/src/app/RequestCard.tsx`; `frontend/tests/domain/req-08.test.ts` | Fully satisfied. Scenario 6 confirmed overdue and Lapsed behavior, and scenario 10 confirmed follow-up behavior. |
| REQ-09 Separate, honest timestamps | E-30 S-J2:34, E-31 K-J:26, E-32 S-R1:22, E-33 K-R:10, E-34 K-R:36, E-59 K-R:46 | SP-6 <- S-G-80 to S-G-83, S-G-119, S-G-148, K-G-36 to K-G-39, K-G-72 | FR-009 | `frontend/src/domain/clock.ts`; `frontend/src/domain/delivery.ts` -> `deliverItem()`, `markRead()`, `getDeliveryState()`; `frontend/src/app/RequestCard.tsx`; `frontend/tests/domain/req-09.test.ts` | Partially satisfied. Manual evaluation confirmed F-3, F-4 and F-5. |
| REQ-10 Nothing lost without signal | E-35 S-J2:32, E-36 K-J:13, E-37 S-J1:94 | SP-6 <- S-G-84, S-G-90, K-G-36 | FR-010 | `frontend/src/domain/offlineQueue.ts` -> `queueLocally()`, `flushQueue()`; `frontend/src/domain/requests.ts` -> `createRequest()`, `getQueuedRequestViews()`; `frontend/src/domain/store.ts`; `frontend/src/app/RequestCard.tsx`; `frontend/tests/domain/req-10.test.ts`, `frontend/tests/domain/autosave.test.ts` | Partially satisfied. Manual evaluation confirmed F-1: the queued-card branch does not display its saved written time. |
| REQ-11 Append-only record with an author on every entry | E-38 S-R1:22, E-39 K-M:13, E-40 K-R:14, E-41 S-R1:29, E-42 S-J2:40, E-75 K-R:12 | SP-7 <- S-G-117, S-G-120 to S-G-123, K-G-7, K-G-10, K-G-11 | FR-011 | `frontend/src/domain/events.ts` -> `appendEvent()`, `getEvents()`; `frontend/src/domain/requests.ts` -> `editRequest()`, `withdrawRequest()`; `frontend/src/domain/record.ts` -> `describeEvents()`; `frontend/tests/domain/req-11.test.ts` | Fully satisfied. Scenario 10 confirmed that edit, withdraw, follow-up, emergency and dispute-note events appeared in History. |
| REQ-12 Neutral wording, same rules for both parents | E-43 S-J2:36, E-44 K-J:43, E-45 S-R1:69, E-46 K-R:49 | SP-8 <- S-G-106, S-G-109, S-G-142, S-G-149, K-G-25, K-G-46 | FR-012 | `frontend/src/copy/strings.ts` -> `BANNED_WORDS`, `strings`; shared parent-neutral components in `frontend/src/app/`; `frontend/tests/domain/req-12.test.ts`, `strings-neutral-labels.test.ts` | Fully satisfied by automated wording tests. Scenario 12 confirmed the tested role-reversal workflow, but a full browser scan of every label and cross-parent layout remains open. |
| REQ-13 One event shows its whole history | E-47 S-M1:77, E-48 K-M:26 | SP-9 <- S-G-32, S-G-33, K-G-23, K-G-52 | FR-013 | `frontend/src/domain/record.ts` -> `getEventTimeline()`, `describeEvents()`; `frontend/src/app/EventDetail.tsx`; `frontend/tests/domain/req-13.test.ts` | Fully satisfied. Scenario 10 confirmed that the tested request actions were recorded in History. F-9 remains a readability candidate. |
| REQ-14 Emergency claims recorded, never judged | E-15 S-M2:17, E-20 S-M2:19, E-61 S-M2:21 | SP-4 <- S-G-21 to S-G-24, S-G-170 | FR-014 | `frontend/src/domain/requests.ts` -> `createRequest()`, `addDisputeNote()`; `frontend/src/app/RequestForm.tsx`, `RequestCard.tsx`; `frontend/tests/domain/req-14.test.ts` | Fully satisfied. Scenario 10 confirmed the emergency-claim and dispute-note flows. |

The evidence IDs above are present in `docs/evidence.md`, and the cited source and line references match that evidence index. The sprint and source-goal references are present in `docs/goal-model.md`. The Spec Kit requirements are FR-001 through FR-014 in `specs/001-schedule-change-record/spec.md`, with the same numeric mapping as REQ-01 through REQ-14.

## Deferred goals

Slices D to J in `docs/goal-model.md` section 7 are not implemented, deferred by sprint decision. They cover actual exchanges, expenses and disputes, export and reviewer access, school and doctor notices, tone warnings, the child's view, and urgent calls.

## V1 findings

| ID | Observation | REQ | Type | Action needed |
|---|---|---|---|---|
| F-1 | Manually confirmed. Jason submitted while offline. The card showed "Saved on this device, not sent yet" but did not show a written timestamp. The queued branch in `RequestCard.tsx` omits `savedOnDeviceWrittenTime`. | REQ-10 | Implementation defect | Fix the code after revising tests. FR-010 already requires the written time. |
| F-2 | Manually confirmed. The same unsent offline request showed "Status: Pending". `getQueuedRequestViews()` assigns `Pending` even though the server has not received the item. | REQ-05 | Requirements issue | Specify a distinct pre-server label or the absence of a server status, then change the code. |
| F-3 | Manually confirmed. Jason's online request showed "Delivered 09:00". Switching to Melissa and opening Home produced "Read 09:00" without an explicit open or acknowledgement. The `RequestCard` effect calls `markRead()` when a delivered item renders for its recipient. | REQ-09 | Requirements issue | Clarify what action counts as reading with Jason, using E-30, then revise A-7 and FR-009 before changing code. |
| F-4 | Manually confirmed. With Melissa offline and Jason online, the request showed "Not delivered yet" without saying that delivery was waiting for Melissa to reconnect. | REQ-09 | Requirements issue | Add a separate waiting-for-delivery state in the spec, then change the wording and code. |
| F-5 | Manually confirmed. After "Fail the next delivery", the request showed "Not delivered 09:00". There was no Retry or Send again control, and toggling Melissa offline and online did not retry it. | REQ-09 | Requirements issue | Specify retry behaviour or record it as an open stakeholder question before changing code. |
| F-6 | Manually confirmed. Jason wrote an offline request at Wed 18 Nov 2026 16:00, 50 hours before the Fri 20 Nov 18:00 exchange. The server received it at 20:00 after reconnection, and V1 showed "Short notice: 46 h given (plan asks for 48 h)". This follows A-3 and FR-004 but exposes X-3. The device-written time provides context, but it is unverified and should not automatically replace the trusted server time. | REQ-04 | Requirements issue | Revise the specification as a documented compromise and keep Q-3 open for Melissa, Jason and Ruth. |

For F-1 through F-6, every request proposed Fri 27 Nov 2026 at 18:00 and used the reason "Dispatch changed my route".

## Candidate usability findings

These observations came from the same manual V1 evaluation. We have not formally classified them as implementation defects or requirements issues, and they are not approved V2 changes.

| ID | Observation | Related requirement | Goal model reference | Status and next step |
|---|---|---|---|---|
| F-7 | Switching between Melissa and Jason provides insufficient visual indication of the currently selected parent. | REQ-02 and assumption A-1 | SP-2 <- S-G-57, S-G-58, S-G-61, K-G-78 | Candidate usability finding. Assess whether the V1 requirement is specific enough before classifying it. |
| F-8 | After submitting a request, the UI provides insufficient confirmation or navigation feedback. The user had to open Requests manually to discover that submission succeeded. | REQ-02, REQ-03 | SP-2, SP-3 <- S-G-9, S-G-57, S-G-58, S-G-61, K-G-32, K-G-78 | Candidate usability finding. Check the successful-submission flow against the current-state and simplicity goals before classifying it. |
| F-9 | Request-card timestamps and event descriptions run together without adequate spacing or line breaks, which reduces readability. | REQ-09, REQ-13 | SP-6, SP-9 <- S-G-32, S-G-33, S-G-80 to S-G-84, S-G-119, S-G-148, K-G-23, K-G-36 to K-G-39, K-G-52, K-G-72 | Candidate usability finding. Review it at 375 px and decide whether this is a presentation defect under existing requirements or needs a clearer usability requirement. |
| F-10 | The decline flow was reached, but the alternative datetime input was difficult to use and the alternative request could not be completed reliably. | REQ-06 | SP-2, SP-3 <- S-G-14, S-G-60, S-G-73, S-G-161, K-G-33 | Candidate usability finding. The alternative-submission browser path remains unverified and is not approved as a V2 change. |

## V1 browser scenario coverage

| Scenario | Status | Observed result | Remaining gap |
|---|---|---|---|
| 1. Initial Home state | Passed | The initial Home state displayed correctly. | None reported. |
| 2. Required reason and submission | Passed | A missing reason triggered validation, and a valid request was submitted successfully. | F-8 records that confirmation and navigation feedback were insufficient. |
| 3. Accept and confirm | Passed | Melissa accepted Jason's request and confirmed it. The status became Agreed, and Schedule displayed the agreed change. | None reported. |
| 4. Decline with alternative | Partially verified | The decline-with-alternative flow was opened and tested. | The alternative datetime was difficult to use, so the alternative request was not completed reliably. It is not marked as passed. See F-10. |
| 5. Notice labels | Partially verified | Labels were observed at 105 h, 50 h, 48 h and 47 h. The 47 h case showed the short-notice warning. | The handover's exact 72 h and 3 h browser examples were not reported. Automated REQ-04 tests cover those values. |
| 6. Overdue and Lapsed | Passed | Pending requests became overdue and eventually Lapsed after the exchange passed without a response. | None reported. |
| 7. Fast device clock | Passed | Jason's +2 h device offset produced different written and server-received times. | None reported. |
| 8. Offline request | Passed | The request was saved locally while Jason was offline and was invisible to Melissa before reconnection. F-1, F-2 and F-6 record the related defects and conflict. | None reported. |
| 9. Failed delivery | Passed | Failed delivery was reproduced, and no retry control was available. | F-5 records the requirements issue. |
| 10. Record actions | Passed | Edit, withdraw, follow-up, emergency claim and dispute-note flows were tested. History recorded the corresponding events. | No exact screenshots or wording were supplied, so the document records only the reported behavior. |
| 11. Reload persistence | Partially verified | A submitted request remained after refreshing the browser. | Persistence of an unsent offline item after refresh was not reported. |
| 12. Role reversal and equal treatment | Partially verified | Melissa created a request, Jason accepted it, and the status became Agreed. This confirms the tested role-reversal workflow. | A complete browser scan of every banned word and the same labels, rules and layout across all states was not reported. |

## REQ-12 wording verification

FR-012 defines a closed list: late, unreliable, failed, ignored, refused, missed and no-show. `frontend/src/copy/strings.ts` contains the same `BANNED_WORDS` list. `frontend/tests/domain/strings.test.ts` and `frontend/tests/domain/req-12.test.ts` check the exported system strings against it for both parents and check that there is no count, score or ranking function. These automated checks pass. Scenario 12 confirms one role-reversed request and acceptance flow, but it does not replace the remaining full browser scan of all labels, rules and layouts.

## Remaining verification gaps

- Complete and observe the alternative request in scenario 4, including the new linked request and reversed roles.
- Reproduce the exact 72 h and 3 h notice examples in a browser if exact handover-value coverage is required.
- Reload while an offline item is still unsent and confirm that it persists and remains visible only to its author.
- Scan every state in both parent views for the FR-012 banned words and compare labels, rules and layout. The automated wording tests pass, but this full browser comparison has not been reported.

## V2 matrix

The V2 revisions keep the REQ and FR numbering above. Status below is the V2 result after browser verification. We ran the 12 scenarios on the V2 production build at 375 px with the browser set to New York time, and repeated the paths the V1 findings were about. The V1 sections above are left as they were, so the two versions can be compared.

| Requirement | V2 code / implementation | V2 automated evidence | Changed in V2 | V2 status |
|---|---|---|---|---|
| REQ-01 | `frontend/src/domain/schedule.ts`; `frontend/src/domain/record.ts`; `frontend/src/app/CustodyCalendar.tsx`; `frontend/src/app/ExchangePanel.tsx` | `frontend/tests/domain/req-01.test.ts`; `frontend/tests/app/schedule.test.tsx` | F-15: the Schedule is a calendar on the one screen, and the chosen entry opens beside it. Rules unchanged. | Fully satisfied. The original entry stays next to the agreed change. |
| REQ-02 | `frontend/src/domain/record.ts`; `frontend/src/app/App.tsx`; `frontend/src/app/ViewingAsSwitch.tsx`; `frontend/src/app/Requests.tsx`; `frontend/src/app/History.tsx`; `frontend/src/index.css` | `frontend/tests/domain/req-02.test.ts`; `frontend/tests/app/app.test.tsx`; `frontend/tests/app/t084-t085-review-fixes.test.tsx`; `frontend/tests/app/t086-history-labels.test.tsx` | F-7: the current parent is shown and highlighted. F-8: a successful request shows a confirmation and appears, highlighted, in the Requests panel. F-13: the confirmation is shown only to the parent who submitted. F-14: History uses readable labels. F-15: Schedule, Requests and History are labelled panels on one screen, with no navigation. | Fully satisfied. At 1440×900 and 1366×768 the page does not scroll; at 375 px the panels stack with no sideways scroll. |
| REQ-03 | `frontend/src/domain/requests.ts`; `frontend/src/app/RequestForm.tsx`; `frontend/src/app/ExchangePanel.tsx`; `frontend/src/app/App.tsx` | `frontend/tests/domain/req-03.test.ts`; `frontend/tests/app/app.test.tsx`; `frontend/tests/app/requestForm.test.tsx` | F-8, F-13 and F-15: the form opens from the exchange chosen on the calendar. Validation rules unchanged. | Fully satisfied. "Add a reason for the change" still blocks a request with no reason. |
| REQ-04 | `frontend/src/domain/clock.ts`; `frontend/src/domain/requests.ts`; `frontend/src/copy/strings.ts`; `frontend/src/app/RequestCard.tsx` | `frontend/tests/domain/req-04.test.ts`; `frontend/tests/domain/req-10.test.ts` | F-6 (X-3): the server figure stays official and decides the threshold. A different written figure is shown next to it as unverified context. | Fully satisfied. Browser showed "72 h notice at server", "Short notice: 3 h at server (plan asks for 48 h)", and for the truck stop "Short notice: 46 h at server" with "Written 50 h before (device time, not verified)". Q-3 stays open. |
| REQ-05 | `frontend/src/domain/requests.ts`; `frontend/src/app/RequestCard.tsx` | `frontend/tests/domain/req-05.test.ts`; `frontend/tests/domain/req-10.test.ts`; `frontend/tests/app/queuedCard.test.tsx` | F-2: an item still on the sender's device has no status and shows "Not sent yet". | Fully satisfied. |
| REQ-06 | `frontend/src/domain/requests.ts`; `frontend/src/app/RequestCard.tsx` | `frontend/tests/domain/req-06.test.ts`; `frontend/tests/app/respond-flow.test.tsx` | F-10: the alternative time keeps a valid value until Confirm. | Fully satisfied. Declining with an alternative made Jason's request Declined and created a linked Pending request from Melissa that only Jason can answer. |
| REQ-07 | `frontend/src/domain/requests.ts`; `frontend/src/domain/record.ts`; `frontend/src/app/CustodyCalendar.tsx`; `frontend/src/app/ExchangePanel.tsx` | `frontend/tests/domain/req-07.test.ts` | No behaviour change. | Fully satisfied. |
| REQ-08 | `frontend/src/domain/requests.ts`; `frontend/src/app/RequestCard.tsx` | `frontend/tests/domain/req-08.test.ts` | No behaviour change. | Fully satisfied. The request showed as overdue and then Lapsed as the clock moved past each threshold. |
| REQ-09 | `frontend/src/domain/delivery.ts`; `frontend/src/domain/offlineQueue.ts`; `frontend/src/domain/requests.ts`; `frontend/src/app/RequestCard.tsx`; `frontend/src/copy/strings.ts` | `frontend/tests/domain/req-09.test.ts`; `frontend/tests/app/requestCard.test.tsx`; `frontend/tests/domain/t083-delivery-on-reconnect.test.ts`; `frontend/tests/app/t084-t085-review-fixes.test.tsx` | F-3: read is recorded only after "Open details". F-4: "Waiting to be delivered (other parent offline)" is separate from "Not delivered". F-5: the sender can retry a failure. F-9: readable lines. F-11: waiting items are delivered when the other parent reconnects. F-12: Delivered and Read are shown on separate lines. | Fully satisfied. |
| REQ-10 | `frontend/src/domain/offlineQueue.ts`; `frontend/src/domain/requests.ts`; `frontend/src/domain/record.ts`; `frontend/src/app/RequestCard.tsx` | `frontend/tests/domain/req-10.test.ts`; `frontend/tests/domain/queued-visibility.test.ts`; `frontend/tests/domain/autosave.test.ts`; `frontend/tests/app/queuedCard.test.tsx` | F-1: an unsent item shows "Written 16:00 (device time, not verified)". | Fully satisfied. The unsent request was still there after a reload, and only Jason could see it. |
| REQ-11 | `frontend/src/domain/events.ts`; `frontend/src/domain/delivery.ts`; `frontend/src/domain/requests.ts`; `frontend/src/domain/record.ts` | `frontend/tests/domain/req-11.test.ts`; `frontend/tests/domain/req-09.test.ts`; `frontend/tests/app/t084-t085-review-fixes.test.tsx` | F-5: a retry adds a delivery entry and keeps the failure. F-12 keeps both visible on the card. | Fully satisfied. |
| REQ-12 | `frontend/src/copy/strings.ts`; shared components in `frontend/src/app/` | `frontend/tests/domain/req-12.test.ts`; `frontend/tests/domain/strings.test.ts`; `frontend/tests/domain/strings-neutral-labels.test.ts`; `frontend/tests/app/t086-history-labels.test.tsx` | F-14: History labels now come from `strings.ts` and are covered by the banned-word check. | Fully satisfied. A scan of every screen we visited as both parents found none of the seven banned words. |
| REQ-13 | `frontend/src/domain/record.ts`; `frontend/src/app/ExchangePanel.tsx`; `frontend/src/app/History.tsx`; `frontend/src/index.css` | `frontend/tests/domain/req-13.test.ts`; `frontend/tests/app/requestCard.test.tsx`; `frontend/tests/app/app.test.tsx` | F-9: events and their times sit on separate lines. F-15: choosing an exchange on the calendar shows its whole history next to it. | Fully satisfied. |
| REQ-14 | `frontend/src/domain/requests.ts`; `frontend/src/app/RequestForm.tsx`; `frontend/src/app/RequestCard.tsx` | `frontend/tests/domain/req-14.test.ts` | No behaviour change. | Fully satisfied. "Emergency claimed by Jason" and Melissa's dispute note both appeared with their times. |

## V2 findings disposition

F-1 is the one implementation defect from the V1 evaluation; it was fixed in code. F-2 to F-6 are requirements issues; each was fixed by changing the spec first (FR-004, FR-005, FR-009, FR-010, assumptions A-12 to A-15) and then the code. F-7 to F-9 were usability candidates; we made them small presentation changes under the existing REQ-02, REQ-03, REQ-09 and REQ-13. Code inspection showed F-10 was an implementation defect under REQ-06, because V1 replaced the input's local value with a value the control could not display.

Automatic background retry stays deferred. V2 gives the sender an explicit retry and keeps the failure in the record. Q-3 stays open: the written time is useful context, but it can't be trusted as the official notice clock until Melissa, Jason and Ruth agree on which figure counts.

## V2 verification findings

Using V2 in the browser found four more problems. All four are implementation defects: the spec already said what should happen, and the code didn't do it. F-11 and F-12 were in V1 too, and neither the V1 review nor our Step 4 evaluation caught them. Our V1 scenarios never took the receiving parent offline and then back online, and never compared the card before and after a read.

| ID | Observation | REQ | Type | Action taken |
|---|---|---|---|---|
| F-11 | A request sent while Melissa was offline stayed "Waiting to be delivered" after she came back online. `flushDeliveryTo()` existed but nothing called it, and items other than the original request were never delivered after an offline flush. | REQ-09 | Implementation defect (present since V1) | Fixed in T083: reconnecting now delivers everything waiting for that parent. |
| F-12 | Once a request was read, "Delivered 09:00" disappeared and only "Read 09:00" was shown. FR-009 asks for the times to be shown separately. | REQ-09, REQ-11 | Implementation defect (present since V1) | Fixed in T084: Delivered, Read and Not delivered each get their own line. |
| F-13 | After Jason submitted a request, "Request submitted" stayed on screen when we switched to Melissa, so she saw his confirmation. This came in with the F-8 change. | REQ-02, REQ-03 | Implementation defect (new in V2) | Fixed in T085: the confirmation belongs to the parent who submitted and clears when the viewer or area changes. |
| F-14 | The History area listed raw event types such as "Jason: create" and "Melissa: delivered". The V1 fix for labels only covered the request card. | REQ-02, REQ-11, REQ-12 | Implementation defect (present since V1) | Fixed in T086: History uses neutral labels such as "Request sent by Jason" and "Delivered to Melissa". |

## V2 requirements revision after review

| ID | Observation | REQ | Type | Action taken |
|---|---|---|---|---|
| F-15 | Reviewing the deployed V2 as Melissa would use it, we had to switch between Home, Schedule, Requests and History to answer one question, and the calendar on Home could not be clicked. Melissa asked to see what matters "without digging through menus" (E-07) and Ruth wanted exchanges, changes and messages "visible together" (E-76). | REQ-02, REQ-03, REQ-13 | Requirements issue | The spec itself told us to build separate areas and to "open Requests" after a submission, so we changed FR-002, FR-003 and their scenarios first. T088 then put everything on one screen: the next exchange, a clickable Schedule calendar, the chosen exchange with its history and request form, Requests and History. |

We class F-15 as a requirements issue rather than a defect, because V2 did what the spec said. The wording was the problem.

## V2 browser scenario coverage

| Scenario | V2 result |
|---|---|
| 1. Initial Home state | Passed. Next exchange and "Nothing is waiting for you." on first load. |
| 2. Required reason and submission | Passed. Missing reason is blocked; a valid request shows "Request submitted" to Jason only and appears in the Requests panel on the same screen. |
| 3. Accept and confirm | Passed. Two actions from the first screen; the selected exchange shows the agreed change next to the court-plan entry and the calendar marks the new day. |
| 4. Decline with alternative | Passed. The first request is Declined and a linked request from Melissa waits for Jason. |
| 5. Notice labels | Passed in the browser for 105 h, 72 h and 3 h and for the truck-stop case with both figures. The 48 h and 47 h boundary rows pass in `req-04.test.ts`. |
| 6. Overdue and Lapsed | Passed. |
| 7. Fast device clock | Passed. Written and server times differ and are labelled. |
| 8. Offline request | Passed. "Not sent yet" with its written time, invisible to Melissa, delivered after reconnection. |
| 9. Failed delivery | Passed. "Not delivered" with a Retry button for the sender; after retry both lines stay. |
| 10. Record actions | Passed. Edit, withdraw, follow-up, emergency claim and dispute note all appear with times. |
| 11. Reload persistence | Passed, including an unsent offline request. |
| 12. Role reversal and equal treatment | Passed. Melissa's request and Jason's response work the same way, and no banned word appeared on any screen. |
