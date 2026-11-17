import { describe, it, expect, beforeEach } from "vitest";
import { createRequest, getChangeRequest, respond } from "../../src/domain/requests";
import { strings } from "../../src/copy/strings";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-06 Respond in two steps", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it('Two-step accept: "Accept" then "Confirm" sets status to "Agreed"', () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.request.status).toBe("Agreed");
    }
  });

  it("Decline needs a reason: not saved, and 'Add a reason for declining' is shown", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = respond({ requestId: created.value.id, author: "Melissa", decision: "decline" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe(strings.missingReasonOnDecline());
    }
    expect(getChangeRequest(created.value.id)?.status).toBe("Pending");
  });

  it("Decline with an alternative: original stays Declined, a new linked Pending request is created with roles reversed", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = respond({
      requestId: created.value.id,
      author: "Melissa",
      decision: "decline",
      reason: "Kids have a school event that weekend",
      alternativeTime: "2026-11-21T10:00:00.000Z",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.request.status).toBe("Declined");
    expect(result.value.alternative).toBeDefined();
    expect(result.value.alternative?.status).toBe("Pending");
    expect(result.value.alternative?.proposer).toBe("Melissa");
    expect(result.value.alternative?.responder).toBe("Jason");
    expect(result.value.alternative?.proposedTime).toBe("2026-11-21T10:00:00.000Z");
    expect(result.value.alternative?.linkedFromRequestId).toBe(created.value.id);

    // Jason (now responder) can respond; Melissa (now proposer) cannot.
    const selfRespond = respond({
      requestId: result.value.alternative!.id,
      author: "Melissa",
      decision: "accept",
    });
    expect(selfRespond.ok).toBe(false);

    const jasonResponds = respond({
      requestId: result.value.alternative!.id,
      author: "Jason",
      decision: "accept",
    });
    expect(jasonResponds.ok).toBe(true);

    // the original request is still Declined, permanently.
    expect(getChangeRequest(created.value.id)?.status).toBe("Declined");
  });

  it("a parent cannot respond to their own request", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = respond({ requestId: created.value.id, author: "Jason", decision: "accept" });
    expect(result.ok).toBe(false);
  });
});
