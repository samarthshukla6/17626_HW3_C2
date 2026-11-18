import { describe, it, expect } from "vitest";
import { addDisputeNote, addFollowUp, createRequest, editRequest, respond, withdrawRequest } from "../../src/domain/requests";
import { setDeviceClockOffset } from "../../src/domain/clock";
import { getEvents } from "../../src/domain/events";
import { failNextDelivery, getDeliveryState, retryDelivery } from "../../src/domain/delivery";
import { setOnline } from "../../src/domain/offlineQueue";
import { formatTime } from "../../src/domain/format";
import { strings } from "../../src/copy/strings";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-09 Separate, honest timestamps", () => {
  it("Phone clock is wrong: written/received times are shown separately, and notice uses the server time", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T10:00:00.000Z");
    setDeviceClockOffset("Jason", 120); // 2 hours fast

    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;

    expect(strings.writtenDeviceTime(formatTime(createEvent.writtenTime!))).toBe(
      "Written 12:00 (device time, not verified)",
    );
    expect(strings.receivedByServer(formatTime(createEvent.serverTime))).toBe("Received by server 10:00");

    // notice is calculated from the server-received time (2026-11-18T10:00), not the
    // written time (2026-11-18T12:00): 56 whole hours until Fri 20 Nov 18:00.
    expect(created.value.noticeLabel).toBe("56 h notice at server");
  });

  it("a failed delivery shows 'Not delivered' and is never shown as delivered or read", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    failNextDelivery();

    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;
    expect(getDeliveryState(createEvent.id)).toBe("not-delivered");
    expect(strings.notDelivered()).toBe("Not delivered");
  });

  it("distinguishes offline waiting and keeps failure evidence after sender retry", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    setOnline("Melissa", false);
    const waiting = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(waiting.ok).toBe(true);
    if (!waiting.ok) return;
    const waitingEvent = getEvents(waiting.value.id).find((e) => e.type === "create")!;
    expect(getDeliveryState(waitingEvent.id)).toBe("waiting-offline");

    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    failNextDelivery();
    const failed = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(failed.ok).toBe(true);
    if (!failed.ok) return;
    const failedEvent = getEvents(failed.value.id).find((e) => e.type === "create")!;
    expect(retryDelivery(failedEvent.id, "Melissa")).toBe(false);
    expect(retryDelivery(failedEvent.id, "Jason")).toBe(true);
    expect(getDeliveryState(failedEvent.id)).toBe("delivered");
    expect(getEvents(failed.value.id).some((e) => e.type === "delivery-failed")).toBe(true);
  });

  it("every time except written comes from the server clock", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    setDeviceClockOffset("Jason", -30);

    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;
    expect(createEvent.serverTime).toBe("2026-11-18T18:00:00.000Z");
    expect(createEvent.writtenTime).toBe("2026-11-18T17:30:00.000Z");
  });

  it("T061: every item - the request, the response, edits, withdraw, follow-ups and dispute notes - gets its own delivered timestamp", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");

    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
      emergencyTag: "illness",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const editResult = editRequest(created.value.id, "Jason", { proposedTime: "2026-11-27T19:00:00.000Z" });
    expect(editResult.ok).toBe(true);
    const followUpResult = addFollowUp(created.value.id, "Jason", "still hoping to hear back");
    expect(followUpResult.ok).toBe(true);
    const disputeResult = addDisputeNote(created.value.id, "Melissa", "he wasn't actually sick");
    expect(disputeResult.ok).toBe(true);
    const withdrawResult = withdrawRequest(created.value.id, "Jason");
    expect(withdrawResult.ok).toBe(true);

    const events = getEvents(created.value.id);
    for (const type of ["create", "edit", "follow-up", "dispute-note", "withdraw"]) {
      const item = events.find((e) => e.type === type)!;
      expect(item, `expected a ${type} event`).toBeDefined();
      expect(getDeliveryState(item.id)).toBe("delivered");
    }
  });

  it("T061: a response (accept/decline) also gets its own delivered timestamp, separate from the request's", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const responded = respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });
    expect(responded.ok).toBe(true);

    const events = getEvents(created.value.id);
    const createEvent = events.find((e) => e.type === "create")!;
    const acceptEvent = events.find((e) => e.type === "accept")!;
    expect(getDeliveryState(createEvent.id)).toBe("delivered");
    expect(getDeliveryState(acceptEvent.id)).toBe("delivered");
  });
});
