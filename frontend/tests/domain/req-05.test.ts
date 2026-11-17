import { describe, it, expect, beforeEach } from "vitest";
import { createRequest, getChangeRequest, withdrawRequest } from "../../src/domain/requests";
import { setServerTime } from "../../src/domain/clock";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-05 Request status, where silence never means yes", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-15T18:00:00.000Z");
  });

  it("Silence never agrees: status stays Pending after 5 days with no response", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    setServerTime("2026-11-20T15:00:00.000Z"); // 5 days later, still before the exchange starts

    const request = getChangeRequest(created.value.id);
    expect(request?.status).toBe("Pending");
  });

  it("withdraw succeeds only while Pending, and only for the sender", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const wrongParent = withdrawRequest(created.value.id, "Melissa");
    expect(wrongParent.ok).toBe(false);

    const withdrawn = withdrawRequest(created.value.id, "Jason");
    expect(withdrawn.ok).toBe(true);
    if (withdrawn.ok) {
      expect(withdrawn.value.status).toBe("Withdrawn");
    }

    const secondAttempt = withdrawRequest(created.value.id, "Jason");
    expect(secondAttempt.ok).toBe(false);
  });

  it("exactly one status at a time, from the full set Pending/Agreed/Declined/Withdrawn/Lapsed", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const validStatuses = ["Pending", "Agreed", "Declined", "Withdrawn", "Lapsed"];
    expect(validStatuses).toContain(getChangeRequest(created.value.id)?.status);
  });
});
