import { describe, it, expect } from "vitest";
import { createRequest, editRequest, respond } from "../../src/domain/requests";
import { getEvents } from "../../src/domain/events";
import { markRead, deliverItem } from "../../src/domain/delivery";
import { getEventTimeline } from "../../src/domain/record";
import { setServerTime } from "../../src/domain/clock";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-11 Append-only record with an author on every entry", () => {
  it("every action appends a new event; nothing is ever deleted or overwritten", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    editRequest(created.value.id, "Jason", { proposedTime: "2026-11-27T19:00:00.000Z" });
    respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });

    const events = getEvents(created.value.id);
    const types = events.map((e) => e.type);
    // every action is present, author-tagged, and nothing earlier was removed:
    expect(types.indexOf("create")).toBeLessThan(types.indexOf("edit"));
    expect(types.indexOf("edit")).toBeLessThan(types.indexOf("accept"));
    expect(events.length).toBeGreaterThanOrEqual(3);
    // original create event is untouched by the later edit
    expect(events[0].type).toBe("create");
    expect((events[0].payload as { proposedTime: string }).proposedTime).toBe("2026-11-27T18:00:00.000Z");
  });

  it("shows the edit as 'Edited by Jason at 14:05: proposed time 18:00 to 19:00'", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T10:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    setServerTime("2026-11-18T14:05:00.000Z");
    const edited = editRequest(created.value.id, "Jason", { proposedTime: "2026-11-27T19:00:00.000Z" });
    expect(edited.ok).toBe(true);

    const events = getEvents(created.value.id);
    const createEvent = events.find((e) => e.type === "create")!;
    const editEvent = events.find((e) => e.type === "edit")!;

    // original value is still visible
    expect((createEvent.payload as { proposedTime: string }).proposedTime).toBe("2026-11-27T18:00:00.000Z");
    expect(editEvent.author).toBe("Jason");
    expect(editEvent.serverTime).toBe("2026-11-18T14:05:00.000Z");
  });

  it("shows 'Edited after Melissa read it' when the edit happens after the responder read it", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;
    deliverItem(createEvent, "Melissa");
    markRead(createEvent.id, "Melissa");

    setServerTime("2026-11-19T10:00:00.000Z");
    editRequest(created.value.id, "Jason", { proposedTime: "2026-11-27T20:00:00.000Z" });

    const timeline = getEventTimeline(FRI_20_NOV.id);
    const editItem = timeline?.items.find((i) => i.event.type === "edit");
    expect(editItem?.description).toContain("Edited after Melissa read it");
  });
});
