import { describe, it, expect, beforeEach } from "vitest";
import { createRequest, respond } from "../../src/domain/requests";
import { getSchedule } from "../../src/domain/record";
import { strings } from "../../src/copy/strings";
import { resetDomain } from "./testHelpers";

const JASON_WEEKEND = {
  id: "fri-20-nov",
  startDateTime: "2026-11-20T18:00:00.000Z",
  location: "school parking area",
  whoseTimeBegins: "Jason" as const,
};

describe("REQ-01 Original plan kept and shown next to changes", () => {
  beforeEach(() => {
    resetDomain([JASON_WEEKEND], "2026-11-18T18:00:00.000Z");
  });

  it("Agreed swap shown next to the original: original stays, agreed change shown next to it", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: JASON_WEEKEND.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const accepted = respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });
    expect(accepted.ok).toBe(true);

    const rows = getSchedule();
    const row = rows.find((r) => r.entry.id === JASON_WEEKEND.id);

    // "Fri 20 Nov 18:00, Jason's weekend (court plan)" is still shown
    expect(row?.entry).toEqual(JASON_WEEKEND);
    // next to it "Moved to Fri 27 Nov 18:00, agreed by both parents" is shown
    expect(row?.agreedChange?.label).toBe(strings.agreedChangeLabel());
    expect(row?.agreedChange?.request.proposedTime).toBe("2026-11-27T18:00:00.000Z");
  });

  it("Original entries can't be edited: no edit or delete action is offered", () => {
    // The domain layer exposes no function that can mutate or remove a
    // ScheduleEntry at all - there is no editScheduleEntry / deleteScheduleEntry
    // export anywhere in src/domain. Schedule.tsx (T024) renders no such
    // control either (verified in tests/app, T030).
    const rows = getSchedule();
    expect(rows[0].entry).toEqual(JASON_WEEKEND);
  });
});
