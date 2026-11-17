import { describe, it, expect, beforeEach } from "vitest";
import { appendEvent, getEvents, _resetLog } from "../../src/domain/events";

describe("event log (REQ-11)", () => {
  beforeEach(() => {
    _resetLog();
  });

  it("assigns a unique id to each appended event", () => {
    const a = appendEvent({
      type: "create",
      author: "Jason",
      requestId: "req-1",
      serverTime: "2026-11-20T18:00:00.000Z",
      payload: {},
    });
    const b = appendEvent({
      type: "follow-up",
      author: "Jason",
      requestId: "req-1",
      serverTime: "2026-11-20T18:05:00.000Z",
      payload: { text: "still waiting" },
    });

    expect(a.id).not.toEqual(b.id);
  });

  it("never drops or mutates a previously appended event", () => {
    const first = appendEvent({
      type: "create",
      author: "Melissa",
      requestId: "req-2",
      serverTime: "2026-11-20T10:00:00.000Z",
      payload: {},
    });
    appendEvent({
      type: "accept",
      author: "Jason",
      requestId: "req-2",
      serverTime: "2026-11-20T11:00:00.000Z",
      payload: {},
    });

    const events = getEvents("req-2");
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual(first);
  });

  it("filters by requestId when given, and returns everything otherwise", () => {
    appendEvent({ type: "create", author: "Jason", requestId: "req-a", serverTime: "t1", payload: {} });
    appendEvent({ type: "create", author: "Melissa", requestId: "req-b", serverTime: "t2", payload: {} });

    expect(getEvents("req-a")).toHaveLength(1);
    expect(getEvents()).toHaveLength(2);
  });
});
