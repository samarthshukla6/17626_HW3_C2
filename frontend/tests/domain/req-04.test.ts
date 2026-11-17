import { describe, it, expect } from "vitest";
import { createRequest, getChangeRequest } from "../../src/domain/requests";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-04 Notice is recorded, never used to block", () => {
  it.each([
    { received: "2026-11-18T18:00:00.000Z", label: "48 h notice given" },
    { received: "2026-11-18T18:01:00.000Z", label: "Short notice: 47 h given (plan asks for 48 h)" },
    { received: "2026-11-17T18:00:00.000Z", label: "72 h notice given" },
    { received: "2026-11-20T15:00:00.000Z", label: "Short notice: 3 h given (plan asks for 48 h)" },
  ])("notice label at $received is '$label', and the request is still delivered", ({ received, label }) => {
    resetDomain([FRI_20_NOV], received);

    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(created.value.noticeLabel).toBe(label);
    // "delivered to Melissa" - the request exists and is readable by the responder.
    expect(getChangeRequest(created.value.id)?.responder).toBe("Melissa");
    expect(getChangeRequest(created.value.id)?.status).toBe("Pending");
  });
});
