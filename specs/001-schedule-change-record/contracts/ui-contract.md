# UI Contract

What the single-page app shows and the minimum interaction paths it guarantees. Every piece of
text named here must come from `copy/strings` (Research: "all system text through one module"),
not be written inline in a component.

## Screens (REQ-02)

- **Viewing as: Melissa | Jason** switch (A-1) always visible; switching re-renders every
  other screen as that parent, with no sign-in. The current parent has a persistent pressed
  style and a visible "Current parent" label (F-7).
- **Home** (the first screen), from `getHomeSummary(parent)`: the next exchange, every request
  waiting on this parent with its Accept and Decline buttons right there, and every other Pending
  request this parent is involved in. Shows "Nothing is waiting for you." when nothing is waiting.
- **Schedule**, original-plan entries and agreed changes, by date (FR-001, FR-007); no edit or
  delete control is ever rendered on an original entry.
- **Requests**, every request involving this parent, its status, its notice label, and (while
  Pending) its overdue flag.
- **History**, every Case Record Entry, in time order (REQ-02's third area).
- **Event detail**, `getEventTimeline(scheduleEntryId)` (REQ-13).
- **Demo controls**, labelled "Demo controls (testing aid, not part of the product)";
  server-time set/advance, Jason's device-clock offset, each parent's online/offline switch, and
  a "fail the next delivery" trigger, and a "server unreachable" switch for the offline-flush
  failure case. It opens from a separate "Demo controls" button in the page footer, styled
  differently from the product screens, so it's clearly not part of the product.
- **Request card** (used on Home, Requests and Event detail): the proposer, the affected
  exchange, the proposed time, the reason, any emergency claim, the notice label, the status and
  any overdue flag, and the four times shown separately: written (device time, not verified),
  received by server, delivered or "Not delivered", and read (FR-009). The sender sees Edit
  (time fields only), Withdraw and Add follow-up while Pending. The other parent sees Add dispute
  note on an emergency claim. A request saved offline shows "Saved on this device, not sent yet"
  and its written time on the sender's side only, with "Not sent yet" instead of status. Waiting
  says the other parent is offline; failure offers Retry to the sender. Read is recorded only
  after the recipient selects "Open details". Event labels and timestamps use separate lines.

Successful request submission shows "Request submitted" and opens Requests with the new card
visible (F-8). The alternative datetime control keeps a browser-valid local value until Confirm
and converts it once when calling the domain (F-10).

## The two-action respond flow (FR-006)

From Home, where waiting requests show their buttons directly, the responding parent reaches a
decision in exactly two taps for the plain cases. The same buttons also appear on Requests:

1. **Accept** → **Confirm**, status becomes Agreed.
2. **Decline** → enter a reason → **Confirm**, status becomes Declined. (Typing the reason is
   part of the Confirm step, not an extra action, Clarifications.)

Suggesting an alternative on a decline is one additional, explicit step beyond that two-action
baseline (Clarifications) the UI must not count it toward the two-action limit, and must not
make the alternative-time field appear without the parent choosing to add it.

A parent must never see a respond control on their own request (FR-006) the control is not
rendered, not merely disabled.

## Reset

"Reset demo data" is reachable from the Demo Controls panel only, asks for confirmation with an in-page
prompt, not a browser dialog (it is destructive to whatever the person was demonstrating), and calls `resetDemoData()`.
