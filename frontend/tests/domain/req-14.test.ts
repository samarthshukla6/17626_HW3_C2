import { describe, it, expect } from "vitest";
import { addDisputeNote, createRequest, respond } from "../../src/domain/requests";
import { getSchedule } from "../../src/domain/record";
import { strings } from "../../src/copy/strings";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-14 Emergency claims are recorded, never judged", () => {
  it("a tagged request without a reason is rejected, same as any request", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const result = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-19T08:00:00.000Z",
      reason: "",
      emergencyTag: "emergency",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe(strings.missingReasonOnCreate());
    }
  });

  it('shows the tag as "Emergency claimed by Jason" without checking it, and never changes the calendar or status by itself', () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-19T08:00:00.000Z",
      reason: "Sick child",
      emergencyTag: "illness",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(strings.emergencyClaimedBy(created.value.proposer)).toBe("Emergency claimed by Jason");
    expect(created.value.status).toBe("Pending");

    const rows = getSchedule();
    const row = rows.find((r) => r.entry.id === FRI_20_NOV.id);
    // tagging alone doesn't make it Agreed or change the original entry
    expect(row?.agreedChange).toBeUndefined();
    expect(row?.entry).toEqual(FRI_20_NOV);
  });

  it("a dispute note needs non-empty text; a valid one is recorded and shown with the request", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-19T08:00:00.000Z",
      reason: "Sick child",
      emergencyTag: "illness",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const empty = addDisputeNote(created.value.id, "Melissa", "");
    expect(empty.ok).toBe(false);

    const valid = addDisputeNote(created.value.id, "Melissa", "He was at school yesterday");
    expect(valid.ok).toBe(true);

    // the dispute note doesn't change the request's status either
    expect(valid.ok && valid.value.status).toBe("Pending");

    // and accepting it still works normally - the emergency tag never decided anything
    const accepted = respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });
    expect(accepted.ok).toBe(true);
  });
});
