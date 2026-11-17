import { describe, it, expect } from "vitest";
import { createRequest, respond } from "../../src/domain/requests";
import { getEventTimeline } from "../../src/domain/record";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-13 One event shows its whole history", () => {
  it("shows the original entry plus every request, response, and audit event, in time order", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });

    const timeline = getEventTimeline(FRI_20_NOV.id);
    expect(timeline?.entry).toEqual(FRI_20_NOV);
    expect(timeline?.items.length).toBeGreaterThanOrEqual(2);

    const serverTimes = timeline!.items.map((i) => new Date(i.event.serverTime).getTime());
    const sorted = [...serverTimes].sort((a, b) => a - b);
    expect(serverTimes).toEqual(sorted);

    const types = timeline!.items.map((i) => i.event.type);
    expect(types).toContain("create");
    expect(types).toContain("accept");
  });

  it("returns undefined for an unknown schedule entry", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    expect(getEventTimeline("no-such-entry")).toBeUndefined();
  });
});
