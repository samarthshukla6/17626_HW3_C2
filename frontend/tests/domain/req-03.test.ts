import { describe, it, expect, beforeEach } from "vitest";
import { createRequest } from "../../src/domain/requests";
import { setServerTime } from "../../src/domain/clock";
import { strings } from "../../src/copy/strings";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-03 Create a change request", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it("Missing reason: not sent, and 'Add a reason for the change' is shown", () => {
    const result = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe(strings.missingReasonOnCreate());
    }
  });

  it("Second request for the same exchange: not sent while the first is Pending", () => {
    const first = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(first.ok).toBe(true);

    const second = createRequest({
      author: "Melissa",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-28T18:00:00.000Z",
      reason: "Family event",
    });

    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.error.message).toBe(strings.entryHasPendingRequest());
    }
  });

  it("rejects a request for an event that has already started", () => {
    const result = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(result.ok).toBe(true);
    // advance server time past the affected entry's start
    setServerTime("2026-11-20T18:00:01.000Z");

    const late = createRequest({
      author: "Melissa",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-21T18:00:00.000Z",
      reason: "Another reason",
    });
    expect(late.ok).toBe(false);
    if (!late.ok) {
      expect(late.error.message).toBe(strings.eventAlreadyStarted());
    }
  });
});
