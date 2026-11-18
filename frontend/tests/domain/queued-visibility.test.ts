import { describe, it, expect } from "vitest";
import { createRequest, listRequestsFor } from "../../src/domain/requests";
import { setOnline } from "../../src/domain/offlineQueue";
import { getHomeSummary } from "../../src/domain/record";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("T064: a queued (offline) request stays visible to its sender", () => {
  it("listRequestsFor the sender includes the queued item with no server status and its written time", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T16:00:00.000Z");
    setOnline("Jason", false);

    const written = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Swap for work",
    });
    expect(written.ok).toBe(true);
    if (!written.ok) return;

    const jasonsRequests = listRequestsFor("Jason");
    const queued = jasonsRequests.find((r) => r.id === written.value.id);
    expect(queued).toBeDefined();
    expect(queued?.status).toBeUndefined();
    expect(queued?.savedOnDeviceWrittenTime).toBe(written.value.savedOnDeviceWrittenTime);

    // still there after the form/caller that created it is long gone - a
    // fresh, independent read of Jason's own requests still finds it.
    expect(listRequestsFor("Jason").some((r) => r.id === written.value.id)).toBe(true);
  });

  it("Melissa never sees Jason's queued item", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T16:00:00.000Z");
    setOnline("Jason", false);

    createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Swap for work",
    });

    expect(listRequestsFor("Melissa")).toHaveLength(0);
  });

  it("appears in Jason's Home summary as an unsent item, and leaves the queue once he's back online", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T16:00:00.000Z");
    setOnline("Jason", false);

    const written = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Swap for work",
    });
    expect(written.ok).toBe(true);
    if (!written.ok) return;

    const beforeReconnect = getHomeSummary("Jason");
    expect(beforeReconnect.pendingInvolvingYou.some((r) => r.id === written.value.id)).toBe(true);

    setOnline("Jason", true);

    const afterReconnect = listRequestsFor("Jason").find((r) => r.id === written.value.id);
    expect(afterReconnect?.savedOnDeviceWrittenTime).toBeUndefined();
    expect(afterReconnect?.noticeLabel).not.toBe("");
  });
});
