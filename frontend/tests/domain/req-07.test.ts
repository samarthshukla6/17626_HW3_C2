import { describe, it, expect, beforeEach } from "vitest";
import { createRequest, respond } from "../../src/domain/requests";
import { getSchedule } from "../../src/domain/record";
import { strings } from "../../src/copy/strings";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-07 An agreed change appears straight away, next to the original", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it('an Agreed request shows as a separate "Agreed change" row, original kept', () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const accepted = respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });
    expect(accepted.ok).toBe(true);

    const rows = getSchedule();
    const row = rows.find((r) => r.entry.id === FRI_20_NOV.id);

    expect(row?.agreedChange?.label).toBe(strings.agreedChangeLabel());
    expect(row?.entry).toEqual(FRI_20_NOV); // original entry untouched
  });

  it("while Pending, the schedule shows the original in force, not an agreed change", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);

    const rows = getSchedule();
    const row = rows.find((r) => r.entry.id === FRI_20_NOV.id);

    expect(row?.pendingLabel).toBe(strings.changeProposedWaiting());
    expect(row?.agreedChange).toBeUndefined();
  });
});
