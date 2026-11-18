import { describe, it, expect, beforeEach } from "vitest";
import { addFollowUp, createRequest, respond } from "../../src/domain/requests";
import { getEvents } from "../../src/domain/events";
import { getDeliveryState } from "../../src/domain/delivery";
import { setOnline } from "../../src/domain/offlineQueue";
import { advanceServerTime } from "../../src/domain/clock";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("T083 (REQ-09, F-11): waiting items are delivered when the recipient comes back online", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-16T09:00:00.000Z");
  });

  it("a request sent while Melissa is offline is delivered at the moment she reconnects", () => {
    setOnline("Melissa", false);
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Route change",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;
    expect(getDeliveryState(createEvent.id)).toBe("waiting-offline");

    advanceServerTime(90);
    setOnline("Melissa", true);

    expect(getDeliveryState(createEvent.id)).toBe("delivered");
    const delivered = getEvents(created.value.id).find(
      (e) => e.type === "delivered" && e.targetEventId === createEvent.id,
    )!;
    expect(delivered.serverTime).toBe("2026-11-16T10:30:00.000Z");
  });

  it("a follow-up and a response sent while the sender was offline are delivered once the server has them", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Route change",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    setOnline("Jason", false);
    addFollowUp(created.value.id, "Jason", "Can you confirm by tonight?");
    setOnline("Jason", true);
    const followUp = getEvents(created.value.id).find((e) => e.type === "follow-up")!;
    expect(getDeliveryState(followUp.id)).toBe("delivered");

    setOnline("Melissa", false);
    respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });
    setOnline("Melissa", true);
    const accept = getEvents(created.value.id).find((e) => e.type === "accept")!;
    expect(getDeliveryState(accept.id)).toBe("delivered");
  });
});
