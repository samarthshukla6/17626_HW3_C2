import { describe, it, expect, beforeEach } from "vitest";
import { appendEvent, getEvents, _resetLog } from "../../src/domain/events";
import { getServerTime, setServerTime } from "../../src/domain/clock";
import { saveState, loadState, resetDemoData, STORAGE_KEY } from "../../src/domain/store";
import { MOCK_START_SERVER_TIME } from "../../src/domain/mockData";

describe("persistence (A-2, NFR-02)", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetLog();
  });

  it("round-trips the event log and clock state through localStorage", () => {
    setServerTime("2026-11-20T18:00:00.000Z");
    appendEvent({
      type: "create",
      author: "Jason",
      requestId: "req-1",
      serverTime: getServerTime().toISOString(),
      payload: {},
    });
    saveState();
    const saved = localStorage.getItem(STORAGE_KEY);

    // simulate a later session: in-memory state is different (autosave
    // follows these calls too, but we restore the earlier snapshot below -
    // exactly what a real reload of a fresh tab would start from).
    _resetLog();
    setServerTime(MOCK_START_SERVER_TIME);
    localStorage.setItem(STORAGE_KEY, saved as string);

    loadState();

    expect(getEvents()).toHaveLength(1);
    expect(getServerTime().toISOString()).toBe("2026-11-20T18:00:00.000Z");
  });

  it("persists under one versioned key", () => {
    saveState();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("resetDemoData clears the key and reseeds the mock start time with an empty log", () => {
    appendEvent({ type: "create", author: "Melissa", requestId: "req-1", serverTime: "x", payload: {} });
    saveState();

    resetDemoData();

    expect(getEvents()).toHaveLength(0);
    expect(getServerTime().toISOString()).toBe(MOCK_START_SERVER_TIME);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).events).toEqual([]);
  });
});
